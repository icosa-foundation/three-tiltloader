import assert from 'node:assert/strict';
import test from 'node:test';
import {
	generateBrushGeometry,
	getGeneratedIndexCount,
	getGeneratedVertexCount
} from '../src/brush-geometry.ts';

function assertClose( actual, expected, tolerance = 1e-6 ) {

	assert.ok( Math.abs( actual - expected ) <= tolerance,
		`Expected ${actual} to be within ${tolerance} of ${expected}.` );

}

function createStroke() {

	return {
		guid: 'ribbon-fixture',
		brushGuid: '2241cd32-8ba2-48a5-9ee7-2caef7e9ed62',
		brushSize: 0.2,
		brushScale: 1,
		color: [ 1, 1, 1, 1 ],
		layerIndex: 0,
		flags: 0,
		seed: 1,
		groupId: 1,
		controlPoints: [
			{
				position: [ 0, 0, 0 ],
				orientation: [ 0, 0, 0, 1 ],
				pressure: 1,
				timestampMs: 0
			},
			{
				position: [ 1, 0, 0 ],
				orientation: [ 0, 0, 0, 1 ],
				pressure: 1,
				timestampMs: 16
			}
		]
	};

}

test( 'generates the existing ribbon topology and width', () => {

	const geometry = generateBrushGeometry( createStroke(), 'ribbon' );

	assert.equal( getGeneratedVertexCount( geometry ), 4 );
	assert.equal( getGeneratedIndexCount( geometry ), 6 );
	assert.deepEqual( Array.from( geometry.indices ), [ 0, 2, 1, 1, 2, 3 ] );
	assertClose( geometry.bounds.min[ 1 ], -0.1 );
	assertClose( geometry.bounds.max[ 1 ], 0.1 );

} );

test( 'preserves distance and unitized ribbon UV modes', () => {

	const stroke = createStroke();
	stroke.brushSize = 1;
	stroke.controlPoints.push( {
		position: [ 3, 0, 0 ],
		orientation: [ 0, 0, 0, 1 ],
		pressure: 1,
		timestampMs: 32
	} );
	const distance = generateBrushGeometry( stroke, 'ribbon', {
		generatorClass: 'QuadStripBrushDistanceUV',
		geometryParams: { tileRate: 2 }
	} );
	const initialU = distance.uvs[ 0 ];
	assertClose( distance.uvs[ 4 ] - initialU, 2 );
	assertClose( distance.uvs[ 8 ] - initialU, 6 );
	const flatDistance = generateBrushGeometry( stroke, 'ribbon', {
		generatorClass: 'FlatGeometryBrush',
		geometryParams: { ribbonUvStyle: 'distance', tileRate: 2 }
	} );
	const flatInitialU = flatDistance.uvs[ 0 ];
	assertClose( flatDistance.uvs[ 4 ] - flatInitialU, 2 );
	assertClose( flatDistance.uvs[ 8 ] - flatInitialU, 6 );

	const unitized = generateBrushGeometry( stroke, 'ribbon', {
		generatorClass: 'QuadStripUnitizedUVBrush'
	} );
	assert.deepEqual( Array.from( unitized.uvs.slice( 0, 8 ) ), [ 0, 1, 0, 0, 1, 1, 1, 0 ] );
	assert.deepEqual( Array.from( unitized.uvs.slice( 8, 16 ) ), [ 0, 1, 0, 0, 1, 1, 1, 0 ] );

} );

test( 'preserves reversal breaks and explicit backfaces', () => {

	const stroke = createStroke();
	stroke.controlPoints.push( {
		position: [ 0, 0, 0 ],
		orientation: [ 0, 0, 0, 1 ],
		pressure: 1,
		timestampMs: 32
	} );
	const reversed = generateBrushGeometry( stroke, 'ribbon', {
		generatorClass: 'QuadStripBrushStretchUV'
	} );
	assert.equal( getGeneratedIndexCount( reversed ), 6 );

	const backfaces = generateBrushGeometry( createStroke(), 'ribbon', {
		geometryParams: { renderBackfaces: true, backfaceHueShift: 120 }
	} );
	assert.equal( getGeneratedVertexCount( backfaces ), 8 );
	assert.equal( getGeneratedIndexCount( backfaces ), 12 );
	assert.deepEqual( Array.from( backfaces.indices.slice( 6 ) ), [ 4, 5, 6, 5, 7, 6 ] );

} );

test( 'smooths FlatGeometryBrush centers like Open Brush', () => {

	const stroke = createStroke();
	stroke.controlPoints.push( {
		position: [ 1, 1, 0 ],
		orientation: [ 0, 0, 0, 1 ],
		pressure: 1,
		timestampMs: 32
	} );
	const geometry = generateBrushGeometry( stroke, 'ribbon', {
		generatorClass: 'FlatGeometryBrush',
		geometryParams: { ribbonOffsetInTexcoord1: true }
	} );
	const left = geometry.positions.slice( 2 * 3, 2 * 3 + 3 );
	const right = geometry.positions.slice( 3 * 3, 3 * 3 + 3 );
	assertClose( ( left[ 0 ] + right[ 0 ] ) * 0.5, 0.7 );
	assertClose( ( left[ 1 ] + right[ 1 ] ) * 0.5, 0.3 );
	// FlatGeometry derives its tangent basis from the two UV-mapped triangles,
	// not directly from the central-difference stroke direction.
	assertClose( geometry.tangents[ 16 ], 0.6 );
	assertClose( geometry.tangents[ 17 ], 0.8 );
	assert.notEqual( geometry.tangents[ 16 ], geometry.tangents[ 20 ] );

} );

test( 'clips non-M11 flat width growth to distance travelled', () => {

	const stroke = createStroke();
	stroke.brushSize = 2;
	stroke.controlPoints[ 0 ].pressure = 0.1;
	stroke.controlPoints[ 1 ].position = [ 0.1, 0, 0 ];
	const clipped = generateBrushGeometry( stroke, 'ribbon', {
		generatorClass: 'FlatGeometryBrush',
		pressureSizeRange: [ 0.1, 1 ],
		geometryParams: { m11Compatibility: false }
	} );
	const retained = generateBrushGeometry( stroke, 'ribbon', {
		generatorClass: 'FlatGeometryBrush',
		pressureSizeRange: [ 0.1, 1 ],
		geometryParams: { m11Compatibility: true }
	} );
	const clippedWidth = Math.abs( clipped.positions[ 10 ] - clipped.positions[ 7 ] );
	const retainedWidth = Math.abs( retained.positions[ 10 ] - retained.positions[ 7 ] );
	// Pressure 0.1 maps to a 0.38 initial width; the smoothed second center
	// travels 0.07, so Open Brush caps the next width at 0.45.
	assertClose( clippedWidth, 0.45 );
	// M11 keeps the original width topology but still applies its 0.1 m
	// pressure-smoothing window: 0.1 -> 0.91 pressure -> 1.838 width.
	assertClose( retainedWidth, 1.838 );

} );

test( 'smooths ribbon pressure over the Open Brush distance window', () => {

	const stroke = createStroke();
	stroke.brushSize = 1;
	stroke.controlPoints[ 0 ].pressure = 0;
	stroke.controlPoints[ 1 ].pressure = 1;
	stroke.controlPoints[ 1 ].position = [ 0.1, 0, 0 ];
	const quad = generateBrushGeometry( stroke, 'ribbon', {
		pressureSizeRange: [ 0, 1 ],
		generatorClass: 'QuadStripBrushDistanceUV'
	} );
	const flatM11 = generateBrushGeometry( stroke, 'ribbon', {
		pressureSizeRange: [ 0, 1 ],
		generatorClass: 'FlatGeometryBrush',
		geometryParams: { m11Compatibility: true }
	} );
	const quadWidth = Math.abs( quad.positions[ 10 ] - quad.positions[ 7 ] );
	const flatWidth = Math.abs( flatM11.positions[ 10 ] - flatM11.positions[ 7 ] );
	assertClose( quadWidth, 1 - Math.pow( 0.1, 0.5 ) );
	assertClose( flatWidth, 0.9 );

} );

test( 'smooths tube pressure over the GeometryBrush distance window', () => {

	const stroke = createStroke();
	stroke.brushSize = 1;
	stroke.controlPoints[ 0 ].pressure = 0;
	stroke.controlPoints[ 1 ].pressure = 1;
	stroke.controlPoints[ 1 ].position = [ 0.1, 0, 0 ];
	const tube = generateBrushGeometry( stroke, 'tube', {
		pressureSizeRange: [ 0, 1 ],
		generatorClass: 'TubeBrush',
		geometryParams: { tubeSideCount: 4, tubeEndCaps: false }
	} );
	const tubeM11 = generateBrushGeometry( stroke, 'tube', {
		pressureSizeRange: [ 0, 1 ],
		generatorClass: 'TubeBrush',
		geometryParams: {
			m11Compatibility: true,
			tubeSideCount: 4,
			tubeEndCaps: false
		}
	} );
	const radiusAtSecondRing = ( geometry ) => Math.max(
		...Array.from( { length: 5 }, ( _, side ) => {
			const offset = ( 5 + side ) * 3;
			return Math.hypot( geometry.positions[ offset + 1 ], geometry.positions[ offset + 2 ] );
		} )
	);
	assertClose( radiusAtSecondRing( tube ), ( 1 - Math.pow( 0.1, 0.5 ) ) * 0.5 );
	assertClose( radiusAtSecondRing( tubeM11 ), 0.45 );

} );

test( 'smooths thick-strip size and opacity as a GeometryBrush', () => {

	const stroke = createStroke();
	stroke.brushSize = 1;
	stroke.controlPoints[ 0 ].pressure = 0;
	stroke.controlPoints[ 1 ].pressure = 1;
	stroke.controlPoints[ 1 ].position = [ 0.1, 0, 0 ];
	const geometry = generateBrushGeometry( stroke, 'thick-strip', {
		pressureSizeRange: [ 0, 1 ],
		pressureOpacityRange: [ 0, 1 ],
		generatorClass: 'ThickGeometryBrush'
	} );
	const expected = 1 - Math.pow( 0.1, 0.5 );
	const positive = 6 * 3;
	const negative = 10 * 3;
	const width = Math.hypot(
		geometry.positions[ positive ] - geometry.positions[ negative ],
		geometry.positions[ positive + 1 ] - geometry.positions[ negative + 1 ],
		geometry.positions[ positive + 2 ] - geometry.positions[ negative + 2 ]
	);
	assertClose( width, expected );
	assertClose( geometry.colors[ 6 * 4 + 3 ], expected );

} );

test( 'generates outward-facing 3D-print triangles for Three.js', () => {

	const stroke = createStroke();
	stroke.controlPoints[ 0 ].position = [ 0, -0.25, 0 ];
	stroke.controlPoints[ 1 ].position = [ 0, 0.25, 0 ];
	const geometry = generateBrushGeometry( stroke, 'print3d', {
		generatorClass: 'Square3DPrintBrush',
		pressureSizeRange: [ 1, 1 ]
	} );

	assert.ok( getGeneratedIndexCount( geometry ) > 0 );
	for ( let offset = 0; offset < geometry.indices.length; offset += 3 ) {
		const [ ia, ib, ic ] = geometry.indices.slice( offset, offset + 3 );
		const a = geometry.positions.slice( ia * 3, ia * 3 + 3 );
		const b = geometry.positions.slice( ib * 3, ib * 3 + 3 );
		const c = geometry.positions.slice( ic * 3, ic * 3 + 3 );
		const ab = [ b[ 0 ] - a[ 0 ], b[ 1 ] - a[ 1 ], b[ 2 ] - a[ 2 ] ];
		const ac = [ c[ 0 ] - a[ 0 ], c[ 1 ] - a[ 1 ], c[ 2 ] - a[ 2 ] ];
		const faceNormal = [
			ab[ 1 ] * ac[ 2 ] - ab[ 2 ] * ac[ 1 ],
			ab[ 2 ] * ac[ 0 ] - ab[ 0 ] * ac[ 2 ],
			ab[ 0 ] * ac[ 1 ] - ab[ 1 ] * ac[ 0 ]
		];
		const normal = geometry.normals.slice( ia * 3, ia * 3 + 3 );
		const alignment = faceNormal[ 0 ] * normal[ 0 ] +
			faceNormal[ 1 ] * normal[ 1 ] + faceNormal[ 2 ] * normal[ 2 ];
		assert.ok( alignment > 0, `Triangle ${offset / 3} faces inward.` );
	}

} );

test( 'smooths 3D-print ring pressure without reusing the end size at the start', () => {

	const stroke = createStroke();
	stroke.brushSize = 1;
	stroke.controlPoints[ 0 ].position = [ 0, -0.05, 0 ];
	stroke.controlPoints[ 0 ].pressure = 0;
	stroke.controlPoints[ 1 ].position = [ 0, 0.05, 0 ];
	stroke.controlPoints[ 1 ].pressure = 1;
	const geometry = generateBrushGeometry( stroke, 'print3d', {
		generatorClass: 'Square3DPrintBrush',
		pressureSizeRange: [ 0, 1 ]
	} );
	const maxRingX = ( firstVertex ) => Math.max(
		...Array.from( { length: 8 }, ( _, vertex ) =>
			Math.abs( geometry.positions[ ( firstVertex + vertex ) * 3 ] ) )
	);
	assertClose( maxRingX( 4 ), 0 );
	assertClose( maxRingX( 12 ), ( 1 - Math.pow( 0.1, 0.5 ) ) * 0.5 );

} );

test( 'smooths spray and Genius particle pressure like GeometryBrush', () => {

	const stroke = createStroke();
	stroke.brushSize = 1;
	stroke.controlPoints[ 0 ].pressure = 0;
	stroke.controlPoints[ 1 ].position = [ 0.1, 0, 0 ];
	stroke.controlPoints[ 1 ].pressure = 1;
	const expected = 1 - Math.pow( 0.1, 0.5 );
	const spray = generateBrushGeometry( stroke, 'particle', {
		generatorClass: 'SprayBrush',
		pressureSizeRange: [ 0.1, 1 ],
		pressureOpacityRange: [ 0, 1 ],
		geometryParams: {
			opacity: 1,
			sprayRateMultiplier: 20,
			particleSizeVariance: 0,
			particlePositionVariance: 0,
			particleRotationVariance: 0
		}
	} );
	assert.ok( getGeneratedVertexCount( spray ) > 0 );
	assertClose( spray.colors[ 3 ], expected );

	const genius = generateBrushGeometry( stroke, 'particle', {
		generatorClass: 'GeniusParticlesBrush',
		pressureSizeRange: [ 0, 1 ],
		pressureOpacityRange: [ 0, 1 ],
		geometryParams: {
			opacity: 1,
			particleRate: 1,
			particleSizeVariance: 0,
			particleSpeed: 0,
			brushSizeRange: [ 1, 1 ]
		}
	} );
	assert.ok( getGeneratedVertexCount( genius ) > 4 );
	assertClose( genius.colors[ 3 ], expected );

} );
