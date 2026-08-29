// Adapted from initial TiltLoader implementation in three.js r128
// https://github.com/mrdoob/three.js/blob/r128/examples/jsm/loaders/TiltLoader.js

import {
	BufferAttribute,
	BufferGeometry,
	Clock,
	FileLoader,
	Group,
	Loader,
	Mesh,
	Quaternion,
	Vector3,
	Vector4
} from 'three';
import * as fflate from 'three/examples/jsm/libs/fflate.module.js';
import { TiltShaderLoader } from 'three-icosa';
import { generateBrushGeometry as generateStrokeGeometry } from './brush-geometry.ts';
import { getOpenBrushGeometryDefaults as getBrushDefaults } from './brush-defaults.js';
import { readTiltStrokeData } from './tilt-strokes.js';

export { createBufferGeometry } from './geometry-api.mjs';
export {
	createBrushGeometryArrays,
	generateBrushGeometry,
	generateBrushGeometryInto,
	getGeneratedIndexCount,
	getGeneratedVertexCount,
	resolveBrushGeometryOptions
} from './brush-geometry.ts';
export { getOpenBrushGeometryDefaults } from './brush-defaults.js';
export { readTiltStrokeData } from './tilt-strokes.js';

export class TiltLoader extends Loader {
	constructor(manager) {
		super(manager);
		this.tiltShaderLoader = new TiltShaderLoader(manager);
	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setWithCredentials( this.withCredentials );

		loader.load( url, function ( buffer ) {

			try {

				onLoad( scope.parse( buffer ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	async parse( buffer ) {

		const group = new Group();
		// https://docs.google.com/document/d/11ZsHozYn9FnWG7y3s3WAyKIACfbfwb4PbaS8cZ_xjvo/edit#

		const zip = fflate.unzipSync( new Uint8Array( buffer.slice( 16 ) ) );

		/*
		const thumbnail = zip[ 'thumbnail.png' ].buffer;
		const img = document.createElement( 'img' );
		img.src = URL.createObjectURL( new Blob( [ thumbnail ] ) );
		document.body.appendChild( img );
		*/

		const metadata = JSON.parse( fflate.strFromU8( zip[ 'metadata.json' ] ) );

		/*
		const blob = new Blob( [ zip[ 'data.sketch' ].buffer ], { type: 'application/octet-stream' } );
		window.open( URL.createObjectURL( blob ) );
		*/

		const strokes = readTiltStrokeData( zip[ 'data.sketch' ], metadata.BrushIndex );
		const brushes = new Map();
		for ( const stroke of strokes ) {

			const rendererStroke = toRendererStroke( stroke );
			const brushStrokes = brushes.get( rendererStroke.brushGuid ) ?? [];
			brushStrokes.push( rendererStroke );
			brushes.set( rendererStroke.brushGuid, brushStrokes );

		}

		const clock = new Clock();

		for ( const [ brushGuid, brushStrokes ] of brushes ) {

			const family = getBrushDefaults( brushGuid )?.family ?? 'unsupported';
			const geometry = new GeneratedStrokeGeometry( brushStrokes, family );
			if ( geometry.getAttribute( 'position' ).count === 0 ) continue;
			const materialName = this.tiltShaderLoader.lookupMaterialName( brushGuid );

			const material = await this.tiltShaderLoader.loadAsync(materialName);
			const mesh = new Mesh( geometry, material );
			
			const scope = this;

			mesh.onBeforeRender = (renderer, scene, camera, geometry, material, group) => {
				if(material.uniforms["u_time"]) {
					const elapsedTime = clock.getElapsedTime();
					// _Time from https://docs.unity3d.com/Manual/SL-UnityShaderVariables.html
                	const time = new Vector4(elapsedTime/20, elapsedTime, elapsedTime*2, elapsedTime*3);

					material.uniforms["u_time"].value = time;
				}

				if (material.uniforms["cameraPosition"]) {
                    material.uniforms["cameraPosition"].value = camera.position;
                }
			};

			group.add( mesh );
		}

		return group;

	}

	setBrushPath(path) {
		// Quick repair of path if required
		if (path.slice(path.length - 1) !== "/") {
			path += "/";
		}

		this.tiltShaderLoader.setPath(path);
	}

}

function toRendererStroke( stroke ) {

	// Serialized Open Brush coordinates use ten units per meter. Reflect Z and
	// the quaternion's X/Y components when converting Unity space to Three.js.
	return {
		...stroke,
		brushSize: stroke.brushSize * 0.1,
		controlPoints: stroke.controlPoints.map( ( point ) => ( {
			...point,
			position: [
				point.position[ 0 ] * 0.1,
				point.position[ 1 ] * 0.1,
				- point.position[ 2 ] * 0.1
			],
			orientation: [
				- point.orientation[ 0 ],
				- point.orientation[ 1 ],
				point.orientation[ 2 ],
				point.orientation[ 3 ]
			]
		} ) )
	};

}

class GeneratedStrokeGeometry extends BufferGeometry {

	constructor( strokes, family ) {

		super();
		const positions = [];
		const normals = [];
		const tangents = [];
		const colors = [];
		const uv0 = [];
		const uv1 = [];
		const indices = [];
		let uv0Size = 0;
		let uv1Size = 0;
		let vertexOffset = 0;

		for ( const stroke of strokes ) {

			const generated = generateStrokeGeometry( stroke, family, {
				finalized: true,
				lastControlPointIsKeeper: true
			} );
			const vertexCount = generated.positions.length / 3;
			if ( vertexCount === 0 ) continue;
			appendValues( positions, generated.positions );
			appendValues( normals, generated.normals );
			appendValues( tangents, generated.tangents );
			appendValues( colors, generated.colors );

			const generatedUv0 = generated.packedUvs ?? generated.uvs;
			if ( uv0Size === 0 ) uv0Size = generated.uv0Size;
			if ( generated.uv0Size !== uv0Size ) {

				throw new Error( `Inconsistent UV0 layouts in brush ${stroke.brushGuid}.` );

			}
			appendValues( uv0, generatedUv0 );

			if ( generated.uv1 !== undefined ) {

				if ( uv1Size === 0 ) uv1Size = generated.uv1Size;
				if ( generated.uv1Size !== uv1Size ) {

					throw new Error( `Inconsistent UV1 layouts in brush ${stroke.brushGuid}.` );

				}
				appendValues( uv1, generated.uv1 );

			} else if ( uv1Size !== 0 ) {

				for ( let value = 0; value < vertexCount * uv1Size; value ++ ) uv1.push( 0 );

			}

			for ( const index of generated.indices ) indices.push( index + vertexOffset );
			vertexOffset += vertexCount;

		}

		const position = new BufferAttribute( new Float32Array( positions ), 3 );
		const normal = new BufferAttribute( new Float32Array( normals ), 3 );
		const tangent = new BufferAttribute( new Float32Array( tangents ), 4 );
		const color = new BufferAttribute( new Float32Array( colors ), 4 );
		this.setAttribute( 'position', position );
		this.setAttribute( 'normal', normal );
		this.setAttribute( 'tangent', tangent );
		this.setAttribute( 'color', color );
		this.setAttribute( 'a_position', position );
		this.setAttribute( 'a_normal', normal );
		this.setAttribute( 'a_tangent', tangent );
		this.setAttribute( 'a_color', color );
		if ( uv0Size > 0 ) {

			const uv = new BufferAttribute( new Float32Array( uv0 ), uv0Size );
			this.setAttribute( 'uv', uv );
			this.setAttribute( 'a_texcoord0', uv );

		}
		if ( uv1Size > 0 ) {

			const secondaryUv = new BufferAttribute( new Float32Array( uv1 ), uv1Size );
			this.setAttribute( 'uv1', secondaryUv );
			this.setAttribute( 'a_texcoord1', secondaryUv );

		}
		this.setIndex( new BufferAttribute( new Uint32Array( indices ), 1 ) );
		this.computeBoundingBox();
		this.computeBoundingSphere();

	}

}

function appendValues( target, source ) {

	for ( const value of source ) target.push( value );

}

class StrokeGeometry extends BufferGeometry {

	constructor( strokes ) {

		super();

		const vertices = [];
		const colors = [];
		const uvs = [];

		const position = new Vector3();
		const prevPosition = new Vector3();

		const quaternion = new Quaternion();
		const prevQuaternion = new Quaternion();

		const vector1 = new Vector3();
		const vector2 = new Vector3();
		const vector3 = new Vector3();
		const vector4 = new Vector3();

		// size = size / 2;

		for ( const k in strokes ) {

			const stroke = strokes[ k ];
			const positions = stroke[ 0 ];
			const quaternions = stroke[ 1 ];
			const size = stroke[ 2 ];
			const color = stroke[ 3 ];

			prevPosition.fromArray( positions, 0 );
			prevQuaternion.fromArray( quaternions, 0 );

			for ( let i = 3, j = 4, l = positions.length; i < l; i += 3, j += 4 ) {

				position.fromArray( positions, i );
				quaternion.fromArray( quaternions, j );

				vector1.set( - size, 0, 0 );
				vector1.applyQuaternion( quaternion );
				vector1.add( position );

				vector2.set( size, 0, 0 );
				vector2.applyQuaternion( quaternion );
				vector2.add( position );

				vector3.set( size, 0, 0 );
				vector3.applyQuaternion( prevQuaternion );
				vector3.add( prevPosition );

				vector4.set( - size, 0, 0 );
				vector4.applyQuaternion( prevQuaternion );
				vector4.add( prevPosition );

				vertices.push( vector1.x, vector1.y, - vector1.z, 1 );
				vertices.push( vector2.x, vector2.y, - vector2.z, 1 );
				vertices.push( vector4.x, vector4.y, - vector4.z, 1 );

				vertices.push( vector2.x, vector2.y, - vector2.z, 1 );
				vertices.push( vector3.x, vector3.y, - vector3.z, 1 );
				vertices.push( vector4.x, vector4.y, - vector4.z, 1 );

				prevPosition.copy( position );
				prevQuaternion.copy( quaternion );

				colors.push( ...color );
				colors.push( ...color );
				colors.push( ...color );

				colors.push( ...color );
				colors.push( ...color );
				colors.push( ...color );

				const p1 = i / l;
				const p2 = ( i - 3 ) / l;

				uvs.push( p1, 0 );
				uvs.push( p1, 1 );
				uvs.push( p2, 0 );

				uvs.push( p1, 1 );
				uvs.push( p2, 1 );
				uvs.push( p2, 0 );

			}

		}

		this.setAttribute( 'position', new BufferAttribute( new Float32Array( vertices ), 4 ) );
		this.setAttribute( 'color', new BufferAttribute( new Float32Array( colors ), 4 ) );
		this.setAttribute( 'uv', new BufferAttribute( new Float32Array( uvs ), 2 ) );

		this.setAttribute('a_position', this.getAttribute('position'));
		this.setAttribute('a_color', this.getAttribute('color'));
		this.setAttribute("a_texcoord0", this.getAttribute("uv"));
		//this.setAttribute("_tb_unity_texcoord_0", this.getAttribute("uv"));
	}

}
