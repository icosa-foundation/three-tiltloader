import {
	AmbientLight,
	BufferAttribute,
	BufferGeometry,
	Color,
	DirectionalLight,
	Mesh,
	NoToneMapping,
	PerspectiveCamera,
	Quaternion,
	Scene,
	SRGBColorSpace,
	Vector3,
	Vector4,
	WebGLRenderer
} from 'three';
import { TiltShaderLoader } from 'three-icosa';
import { generateBrushGeometry } from '../../src/brush-geometry.ts';
import { getOpenBrushGeometryDefaults } from '../../src/brush-defaults.js';
import {
	createOpenBrushReferenceStroke,
	OPEN_BRUSH_REFERENCE_SIZE,
	OPEN_BRUSH_REFERENCE_TIME_SECONDS
} from '../../src/open-brush-reference-stroke.js';

const CAPTURE_SIZE = 1024;
const SUPERSAMPLING = 2;
const statusElement = document.querySelector( '#status' );

class RepositoryTiltShaderLoader extends TiltShaderLoader {

	createMaterial( materialParams, brushName ) {

		let fragmentShader = materialParams.fragmentShader.trimStart();
		let hadSurfaceInclude = false;
		let hadFogInclude = false;
		if ( this.surfaceShaderCode && fragmentShader.startsWith( this.surfaceShaderCode ) ) {

			hadSurfaceInclude = true;
			fragmentShader = fragmentShader.slice( this.surfaceShaderCode.length ).trimStart();

		}
		if ( this.fogShaderCode && fragmentShader.startsWith( this.fogShaderCode ) ) {

			hadFogInclude = true;
			fragmentShader = fragmentShader.slice( this.fogShaderCode.length ).trimStart();

		}
		fragmentShader = fragmentShader.replace( /^\s*#version 300 es\s*/, '' );
		const definesFog = /\b(?:vec3|vec4)\s+ApplyFog\s*\(/.test( fragmentShader );
		const callsFog = /\bApplyFog\s*\(/.test( fragmentShader );
		const containsSurfacePackage = /\bstruct\s+SurfaceOutput/.test( fragmentShader ) ||
			/\bvec3\s+UnpackNormal\s*\(/.test( fragmentShader );
		const prefixes = [];
		if ( hadSurfaceInclude && !containsSurfacePackage ) prefixes.push( this.surfaceShaderCode );
		if ( hadFogInclude && callsFog && !definesFog ) prefixes.push( this.fogShaderCode );

		// RawShaderMaterial adds the GLSL3 version directive from glslVersion.
		// Converted brush files also carry it, so retain only Three's copy. Some
		// brushes contain their helper packages while others rely on shared
		// includes; rebuild the prefix without duplicate definitions.
		materialParams.vertexShader = materialParams.vertexShader.replace( /^\s*#version 300 es\s*/, '' );
		materialParams.fragmentShader = [ ...prefixes, fragmentShader ].join( '\n' );
		return super.createMaterial( materialParams, brushName );

	}

}

function setStatus( text ) {

	statusElement.textContent = text;

}

function addAttribute( geometry, name, array, itemSize ) {

	if ( array === undefined || itemSize === 0 ) return undefined;
	const attribute = new BufferAttribute( array, itemSize );
	geometry.setAttribute( name, attribute );
	return attribute;

}

function createThreeGeometry( generated ) {

	const geometry = new BufferGeometry();
	const position = addAttribute( geometry, 'position', generated.positions, 3 );
	const normal = addAttribute( geometry, 'normal', generated.normals, 3 );
	const tangent = addAttribute( geometry, 'tangent', generated.tangents, 4 );
	const color = addAttribute( geometry, 'color', generated.colors, 4 );
	const uv = addAttribute( geometry, 'uv', generated.packedUvs ?? generated.uvs, generated.uv0Size );
	const uv1 = addAttribute( geometry, 'uv1', generated.uv1, generated.uv1Size );
	geometry.setAttribute( 'a_position', position );
	geometry.setAttribute( 'a_normal', normal );
	geometry.setAttribute( 'a_tangent', tangent );
	geometry.setAttribute( 'a_color', color );
	if ( uv ) geometry.setAttribute( 'a_texcoord0', uv );
	if ( uv1 ) geometry.setAttribute( 'a_texcoord1', uv1 );
	geometry.setIndex( new BufferAttribute( generated.indices, 1 ) );
	geometry.computeBoundingBox();
	geometry.computeBoundingSphere();
	return geometry;

}

function addBlackEnvironmentLights( scene ) {

	scene.add( new AmbientLight( new Color( 0.39215687, 0.39215687, 0.39215687 ), 1 ) );
	const definitions = [
		{ color: [ 0.4862745, 0.50980395, 0.61960787 ], intensity: 1.6,
			rotation: [ 0.48718503, -0.11247552, 0.19481331, 0.8438292 ] },
		{ color: [ 0.7137255, 0.7019608, 0.5764706 ], intensity: 0.6,
			rotation: [ 0.8830222, -0.3213938, 0.11697773, 0.3213938 ] }
	];
	for ( const definition of definitions ) {

		const unityRotation = definition.rotation;
		const rotation = new Quaternion(
			-unityRotation[ 0 ], -unityRotation[ 1 ], unityRotation[ 2 ], unityRotation[ 3 ]
		);
		const direction = new Vector3( 0, 0, -1 ).applyQuaternion( rotation );
		const light = new DirectionalLight( new Color( ...definition.color ), definition.intensity );
		light.target.position.set( 0, 100, -4 );
		light.position.copy( light.target.position ).addScaledVector( direction, -10 );
		scene.add( light, light.target );

	}

}

function configureFixedUniforms( material, camera ) {

	const time = OPEN_BRUSH_REFERENCE_TIME_SECONDS;
	if ( material.uniforms?.u_time ) {

		material.uniforms.u_time.value = new Vector4( time / 20, time, time * 2, time * 3 );

	}
	if ( material.uniforms?.cameraPosition ) material.uniforms.cameraPosition.value = camera.position;

}

function canvasPng( renderer ) {

	const output = document.createElement( 'canvas' );
	output.width = CAPTURE_SIZE;
	output.height = CAPTURE_SIZE;
	const context = output.getContext( '2d' );
	context.imageSmoothingEnabled = true;
	context.imageSmoothingQuality = 'high';
	context.drawImage( renderer.domElement, 0, 0, CAPTURE_SIZE, CAPTURE_SIZE );
	return new Promise( ( resolve, reject ) => output.toBlob(
		blob => blob ? resolve( blob ) : reject( new Error( 'PNG encoding returned no data.' ) ),
		'image/png'
	) );

}

async function post( path, body, contentType = 'application/octet-stream' ) {

	const response = await fetch( path, { method: 'POST', headers: { 'Content-Type': contentType }, body } );
	if ( !response.ok ) throw new Error( `${path} returned ${response.status}.` );

}

async function capture() {

	const manifest = await fetch( '/brush-manifest.json' ).then( response => response.json() );
	const renderer = new WebGLRenderer( { antialias: true, alpha: false, preserveDrawingBuffer: true } );
	renderer.setPixelRatio( 1 );
	renderer.setSize( CAPTURE_SIZE * SUPERSAMPLING, CAPTURE_SIZE * SUPERSAMPLING, false );
	renderer.outputColorSpace = SRGBColorSpace;
	renderer.toneMapping = NoToneMapping;
	renderer.setClearColor( 0x000000, 1 );
	document.body.appendChild( renderer.domElement );

	const scene = new Scene();
	scene.background = new Color( 0x000000 );
	addBlackEnvironmentLights( scene );
	const camera = new PerspectiveCamera( 60, 1, 0.1, 10000 );
	camera.position.set( 0, 100, 0 );
	camera.rotation.set( 0, 0, 0 );
	camera.updateMatrixWorld();

	const shaderLoader = new RepositoryTiltShaderLoader();
	shaderLoader.setPath( '/brushes/' );
	const usedNames = new Set();
	let captured = 0;
	for ( const entry of manifest ) {

		const materialName = shaderLoader.lookupMaterialName( entry.brushGuid );
		const defaults = getOpenBrushGeometryDefaults( entry.brushGuid );
		if ( !materialName || !defaults || defaults.family === 'unsupported' || usedNames.has( entry.durableName ) ) continue;
		usedNames.add( entry.durableName );
		setStatus( `${captured + 1}/${manifest.length}: ${entry.durableName}` );
		const range = defaults.geometryParams?.brushSizeRange;
		const brushSize = range
			? Math.min( Math.max( OPEN_BRUSH_REFERENCE_SIZE, range[ 0 ] ), range[ 1 ] )
			: OPEN_BRUSH_REFERENCE_SIZE;
		const stroke = createOpenBrushReferenceStroke( entry.brushGuid, brushSize );
		const generated = generateBrushGeometry( stroke, defaults.family, {
			finalized: true,
			lastControlPointIsKeeper: true,
			deterministicBirthTime: true
		} );
		if ( generated.positions.length === 0 ) continue;
		const geometry = createThreeGeometry( generated );
		const material = await shaderLoader.loadAsync( materialName );
		configureFixedUniforms( material, camera );
		const mesh = new Mesh( geometry, material );
		scene.add( mesh );
		renderer.render( scene, camera );
		const failedProgram = renderer.info.programs?.find( program =>
			program.diagnostics && program.diagnostics.runnable === false );
		if ( failedProgram ) {

			const diagnostics = failedProgram.diagnostics;
			throw new Error( `${entry.durableName} (${materialName}):\n${[
				diagnostics.programLog,
				diagnostics.vertexShader?.log,
				diagnostics.fragmentShader?.log
			].filter( Boolean ).join( '\n' ).slice( 0, 8000 ) || 'WebGL shader program is not runnable.'}` );

		}
		const png = await canvasPng( renderer );
		await post( `/capture?filename=${encodeURIComponent( `brush-${entry.durableName}.png` )}`, png );
		scene.remove( mesh );
		geometry.dispose();
		captured ++;

	}
	setStatus( `Captured ${captured} brushes.` );
	await post( '/done', JSON.stringify( { captured } ), 'application/json' );

}

capture().catch( async error => {

	setStatus( error.stack || error.message );
	try {

		await post( '/error', JSON.stringify( { error: error.stack || error.message } ), 'application/json' );

	} catch {}

} );
