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
	assert.equal( getGeneratedVertexCount( distance ), 12 );
	assert.deepEqual( Array.from( distance.indices ), Array.from( { length: 12 }, ( _, i ) => i ) );
	assertClose( distance.uvs[ 2 ] - initialU, 2 );
	assertClose( distance.uvs[ 14 ] - initialU, 6 );
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
	const unitizedQuadUvs = [ 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0 ];
	assert.equal( getGeneratedVertexCount( unitized ), 12 );
	assert.deepEqual( Array.from( unitized.indices ), Array.from( { length: 12 }, ( _, i ) => i ) );
	assert.deepEqual( Array.from( unitized.uvs.slice( 0, 12 ) ), unitizedQuadUvs );
	assert.deepEqual( Array.from( unitized.uvs.slice( 12, 24 ) ), unitizedQuadUvs );

} );

test( 'replays DistanceUV updates over the newest three fused solids', () => {

	const stroke = createStroke();
	stroke.brushSize = 1;
	stroke.controlPoints[ 0 ].pressure = 0;
	stroke.controlPoints[ 1 ].pressure = 0.2;
	stroke.controlPoints.push(
		{
			position: [ 2, 0, 0 ],
			orientation: [ 0, 0, 0, 1 ],
			pressure: 0.6,
			timestampMs: 32
		},
		{
			position: [ 3, 0, 0 ],
			orientation: [ 0, 0, 0, 1 ],
			pressure: 1,
			timestampMs: 48
		}
	);
	const geometry = generateBrushGeometry( stroke, 'ribbon', {
		generatorClass: 'QuadStripBrushDistanceUV',
		pressureSizeRange: [ 0.5, 1 ],
		geometryParams: { tileRate: 2 }
	} );
	const position = ( vertex ) => geometry.positions.slice( vertex * 3, vertex * 3 + 3 );
	const distance = ( first, second ) => Math.hypot( ...Array.from( position( first ),
		( value, axis ) => position( second )[ axis ] - value ) );
	const solidLength = ( solid ) => {
		const vertex = solid * 6;
		return ( distance( vertex, vertex + 1 ) + distance( vertex + 3, vertex + 5 ) ) * 0.5;
	};
	const finalSize = distance( 13, 17 );
	const initialU = geometry.uvs[ 0 ];
	let expectedU = initialU;
	for ( let solid = 0; solid < 3; solid += 1 ) {
		expectedU += 2 * solidLength( solid ) / finalSize;
		assertClose( geometry.uvs[ ( solid * 6 + 1 ) * 2 ], expectedU );
	}

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
		generatorClass: 'QuadStripBrushStretchUV',
		geometryParams: { renderBackfaces: true, backfaceHueShift: 120 }
	} );
	assert.equal( getGeneratedVertexCount( backfaces ), 12 );
	assert.equal( getGeneratedIndexCount( backfaces ), 12 );
	assert.deepEqual( Array.from( backfaces.indices ), Array.from( { length: 12 }, ( _, i ) => i ) );

} );

test( 'applies QuadStrip used-vertex cleanup only when finalized', () => {

	const options = {
		generatorClass: 'QuadStripBrushStretchUV',
		lastControlPointIsKeeper: false
	};
	const oneSolid = createStroke();
	assert.equal( getGeneratedVertexCount( generateBrushGeometry( oneSolid, 'ribbon', options ) ), 6 );
	assert.equal( getGeneratedVertexCount( generateBrushGeometry( oneSolid, 'ribbon', {
		...options, finalized: true
	} ) ), 0 );

	const twoSolids = createStroke();
	twoSolids.controlPoints.push( {
		position: [ 2, 0, 0 ], orientation: [ 0, 0, 0, 1 ], pressure: 1, timestampMs: 32
	} );
	assert.equal( getGeneratedVertexCount( generateBrushGeometry( twoSolids, 'ribbon', {
		...options, finalized: true
	} ) ), 0 );

	const threeSolids = createStroke();
	threeSolids.controlPoints.push(
		{ position: [ 2, 0, 0 ], orientation: [ 0, 0, 0, 1 ], pressure: 1, timestampMs: 32 },
		{ position: [ 3, 0, 0 ], orientation: [ 0, 0, 0, 1 ], pressure: 1, timestampMs: 48 }
	);
	assert.equal( getGeneratedVertexCount( generateBrushGeometry( threeSolids, 'ribbon', {
		...options, finalized: true
	} ) ), 18 );
	assert.equal( getGeneratedVertexCount( generateBrushGeometry( threeSolids, 'ribbon', {
		...options, finalized: true, lastControlPointIsKeeper: true
	} ) ), 18 );

} );

test( 'smooths QuadStrip bends with the source midpoint and fuse pass', () => {

	const stroke = createStroke();
	stroke.controlPoints.push(
		{
			position: [ 1, 1, 0 ],
			orientation: [ 0, 0, 0, 1 ],
			pressure: 1,
			timestampMs: 32
		},
		{
			position: [ 0, 1, 0 ],
			orientation: [ 0, 0, 0, 1 ],
			pressure: 1,
			timestampMs: 48
		}
	);
	const geometry = generateBrushGeometry( stroke, 'ribbon', {
		generatorClass: 'QuadStripBrushStretchUV'
	} );
	assert.equal( getGeneratedVertexCount( geometry ), 18 );
	const position = ( vertex ) => Array.from( geometry.positions.slice( vertex * 3, vertex * 3 + 3 ) );
	// Unity +Z forward is converted to Three.js -Z, so these are the converted
	// ComputeSurfaceFrameNew half-right vectors for +X, +Y, -X movement.
	const sourceRights = [ [ 0, -0.1, 0 ], [ 0.1, 0, 0 ], [ 0, 0.1, 0 ] ];
	const sourceSolid = ( segment ) => {
		const previous = stroke.controlPoints[ segment ].position;
		const current = stroke.controlPoints[ segment + 1 ].position;
		const right = sourceRights[ segment ];
		const offset = ( point, sign ) => point.map( ( value, axis ) => value + sign * right[ axis ] );
		return [
			offset( previous, -1 ), offset( current, -1 ), offset( previous, 1 ),
			offset( previous, 1 ), offset( current, -1 ), offset( current, 1 )
		];
	};
	const back = sourceSolid( 0 );
	const firstMiddle = sourceSolid( 1 );
	const front = sourceSolid( 2 );
	const average = ( a, b ) => a.map( ( value, axis ) => ( value + b[ axis ] ) * 0.5 );
	const firstTrailingTop = average( back[ 1 ], firstMiddle[ 0 ] );
	const firstTrailingBottom = average( back[ 5 ], firstMiddle[ 2 ] );
	back[ 1 ] = firstTrailingTop;
	back[ 4 ] = firstTrailingTop;
	back[ 5 ] = firstTrailingBottom;
	const middle = back.map( ( point, corner ) => point.map( ( value, axis ) =>
		( value + front[ corner ][ axis ] ) * 0.5 ) );
	const trailingTop = average( back[ 1 ], middle[ 0 ] );
	const trailingBottom = average( back[ 5 ], middle[ 2 ] );
	middle[ 0 ] = trailingTop;
	middle[ 2 ] = trailingBottom;
	middle[ 3 ] = trailingBottom;
	const leadingTop = average( middle[ 1 ], front[ 0 ] );
	const leadingBottom = average( middle[ 5 ], front[ 2 ] );
	middle[ 1 ] = leadingTop;
	middle[ 4 ] = leadingTop;
	middle[ 5 ] = leadingBottom;
	assert.deepEqual( position( 1 ), position( 6 ) );
	assert.deepEqual( position( 5 ), position( 8 ) );
	assert.deepEqual( position( 7 ), position( 12 ) );
	assert.deepEqual( position( 11 ), position( 14 ) );
	for ( let corner = 0; corner < 6; corner += 1 ) {
		for ( let axis = 0; axis < 3; axis += 1 ) {
			assertClose( position( 6 + corner )[ axis ], middle[ corner ][ axis ] );
		}
	}
	const solidLength = ( solid ) => {
		const distance = ( first, second ) => Math.hypot( ...position( first ).map(
			( value, axis ) => position( second )[ axis ] - value ) );
		const vertex = solid * 6;
		return ( distance( vertex, vertex + 1 ) + distance( vertex + 3, vertex + 5 ) ) * 0.5;
	};
	const lengths = [ 0, 1, 2 ].map( solidLength );
	const totalLength = lengths.reduce( ( total, length ) => total + length, 0 );
	assertClose( geometry.uvs[ 2 ], lengths[ 0 ] / totalLength );
	assertClose( geometry.uvs[ 14 ], ( lengths[ 0 ] + lengths[ 1 ] ) / totalLength );
	assertClose( geometry.uvs[ 26 ], 1 );

} );

test( 'adjusts and recovers QuadStrip width with the source bend state', () => {

	const angle = Math.PI / 3;
	const direction = [ Math.cos( angle ), Math.sin( angle ), 0 ];
	const turn = [ 1 + direction[ 0 ] * 0.1, direction[ 1 ] * 0.1, 0 ];
	const stroke = createStroke();
	stroke.brushSize = 2;
	stroke.controlPoints.push( {
		position: turn, orientation: [ 0, 0, 0, 1 ], pressure: 1, timestampMs: 32
	} );
	const options = { generatorClass: 'QuadStripBrushStretchUV' };
	const width = ( geometry, first, second ) => Math.hypot( ...[ 0, 1, 2 ].map(
		axis => geometry.positions[ second * 3 + axis ] - geometry.positions[ first * 3 + axis ] ) );
	const bend = generateBrushGeometry( stroke, 'ribbon', options );
	const bendCenter = [ ( 1 + turn[ 0 ] ) * 0.5, turn[ 1 ] * 0.5, 0 ];
	const expectedBentWidth = 2 * Math.hypot(
		bendCenter[ 0 ] - 0.5,
		bendCenter[ 1 ] - 1,
		0
	);
	assertClose( width( bend, 7, 11 ), expectedBentWidth );

	stroke.controlPoints.push( {
		position: [ turn[ 0 ] + direction[ 0 ] * 3, turn[ 1 ] + direction[ 1 ] * 3, 0 ],
		orientation: [ 0, 0, 0, 1 ], pressure: 1, timestampMs: 48
	} );
	const firstRecovery = generateBrushGeometry( stroke, 'ribbon', options );
	assertClose( width( firstRecovery, 13, 17 ), expectedBentWidth );

	const previous = stroke.controlPoints[ 3 ].position;
	stroke.controlPoints.push( {
		position: [ previous[ 0 ] + direction[ 0 ] * 3, previous[ 1 ] + direction[ 1 ] * 3, 0 ],
		orientation: [ 0, 0, 0, 1 ], pressure: 1, timestampMs: 64
	} );
	const recovered = generateBrushGeometry( stroke, 'ribbon', options );
	assertClose( width( recovered, 19, 23 ), 2 );

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
	// Pressure 0.1 maps to a 0.38 initial width. Open Brush clips widths
	// against raw knot travel before its second-pass edge smoothing.
	assertClose( clippedWidth, 0.48 );
	// M11 forces the initial GeometryBrush knot to zero pressure, then applies
	// its 0.1 m window: 0 -> 0.9 pressure -> 1.82 width.
	assertClose( retainedWidth, 1.82 );

} );

test( 'smooths ribbon pressure over the Open Brush distance window', () => {

	const stroke = createStroke();
	stroke.brushSize = 1;
	stroke.controlPoints[ 0 ].pressure = 0;
	stroke.controlPoints[ 1 ].pressure = 1;
	stroke.controlPoints[ 1 ].position = [ 0.1, 0, 0 ];
	const quad = generateBrushGeometry( stroke, 'ribbon', {
		pressureSizeRange: [ 0, 1 ],
		pressureOpacityRange: [ 0, 1 ],
		generatorClass: 'QuadStripBrushStretchUV'
	} );
	const flatM11 = generateBrushGeometry( stroke, 'ribbon', {
		pressureSizeRange: [ 0, 1 ],
		generatorClass: 'FlatGeometryBrush',
		geometryParams: { m11Compatibility: true }
	} );
	const quadLeadingWidth = Math.abs( quad.positions[ 16 ] - quad.positions[ 4 ] );
	const quadTrailingWidth = Math.abs( quad.positions[ 7 ] - quad.positions[ 1 ] );
	const flatWidth = Math.abs( flatM11.positions[ 10 ] - flatM11.positions[ 7 ] );
	assertClose( quadLeadingWidth, 1 - Math.pow( 0.1, 0.5 ) );
	assertClose( quadTrailingWidth, quadLeadingWidth );
	for ( let vertex = 0; vertex < 6; vertex += 1 ) {
		assertClose( quad.colors[ vertex * 4 + 3 ], quadLeadingWidth );
	}
	assertClose( flatWidth, 0.9 );

} );

test( 'fades DistanceUV QuadStrip endpoints over the source distance', () => {

	const stroke = createStroke();
	stroke.brushSize = 0.01;
	stroke.controlPoints[ 1 ].position = [ 0.02, 0, 0 ];
	stroke.controlPoints.push( {
		position: [ 0.04, 0, 0 ],
		orientation: [ 0, 0, 0, 1 ],
		pressure: 1,
		timestampMs: 32
	} );
	const geometry = generateBrushGeometry( stroke, 'ribbon', {
		generatorClass: 'QuadStripBrushDistanceUV'
	} );
	const fadeAlpha = 203 / 255;
	assertClose( geometry.colors[ 3 ], 0 );
	assertClose( geometry.colors[ 7 ], fadeAlpha );
	assertClose( geometry.colors[ 6 * 4 + 3 ], fadeAlpha );
	assertClose( geometry.colors[ 7 * 4 + 3 ], 0 );

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
	const tubeM11Stroke = createStroke();
	tubeM11Stroke.brushSize = 1;
	tubeM11Stroke.controlPoints[ 0 ].pressure = 1;
	tubeM11Stroke.controlPoints[ 1 ].pressure = 1;
	tubeM11Stroke.controlPoints[ 1 ].position = [ 0.1, 0, 0 ];
	const tubeM11 = generateBrushGeometry( tubeM11Stroke, 'tube', {
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
	assertClose( Math.hypot( tubeM11.positions[ 1 ], tubeM11.positions[ 2 ] ), 0 );

} );

test( 'uses Open Brush radial tangents for hard-edged tube rings', () => {

	const stroke = createStroke();
	stroke.brushSize = 1;
	stroke.controlPoints[ 1 ].position = [ 1, 0, 0 ];
	const geometry = generateBrushGeometry( stroke, 'tube', {
		pressureSizeRange: [ 1, 1 ],
		generatorClass: 'TubeBrush',
		geometryParams: {
			tubeSideCount: 4,
			tubeEndCaps: false,
			tubeHardEdges: true
		}
	} );

	for ( let side = 0; side < 4; side += 1 ) {
		for ( let duplicate = 0; duplicate < 2; duplicate += 1 ) {
			const vertex = side * 2 + duplicate;
			const positionOffset = vertex * 3;
			const tangentOffset = vertex * 4;
			for ( let axis = 0; axis < 3; axis += 1 ) {
				assertClose(
					geometry.tangents[ tangentOffset + axis ],
					geometry.positions[ positionOffset + axis ] * 2
				);
			}
			assertClose( geometry.tangents[ tangentOffset + 3 ], 1 );
		}
	}

} );

test( 'uses flat SquareBrush caps without tube tip vertices', () => {

	const stroke = createStroke();
	stroke.brushSize = 1;
	const geometry = generateBrushGeometry( stroke, 'tube', {
		pressureSizeRange: [ 1, 1 ],
		generatorClass: 'SquareBrush'
	} );

	assert.equal( getGeneratedVertexCount( geometry ), 16 );
	assert.equal( getGeneratedIndexCount( geometry ), 36 );
	assert.deepEqual(
		Array.from( geometry.indices.slice( -12 ) ),
		[ 5, 6, 2, 2, 6, 1, 13, 10, 14, 14, 10, 9 ]
	);
	assertClose( geometry.bounds.min[ 0 ], 0 );
	assertClose( geometry.bounds.max[ 0 ], 1 );

} );

test( 'keeps SquareBrush rings on raw control-point positions', () => {

	const stroke = createStroke();
	stroke.brushSize = 1;
	stroke.controlPoints.push( {
		position: [ 3, 0, 0 ],
		orientation: [ 0, 0, 0, 1 ],
		pressure: 1,
		timestampMs: 32
	} );
	stroke.controlPoints[ 1 ].position = [ 1, 1, 0 ];
	const geometry = generateBrushGeometry( stroke, 'tube', {
		pressureSizeRange: [ 1, 1 ],
		generatorClass: 'SquareBrush',
		finalized: true
	} );
	const center = [ 0, 0, 0 ];
	for ( let vertex = 8; vertex < 16; vertex += 1 ) {
		for ( let axis = 0; axis < 3; axis += 1 ) {
			center[ axis ] += geometry.positions[ vertex * 3 + axis ] / 8;
		}
	}
	assertClose( center[ 0 ], 1 );
	assertClose( center[ 1 ], 1 );
	assertClose( center[ 2 ], 0 );

} );

test( 'frames a SquareBrush section from the current pointer orientation', () => {

	const identityStroke = createStroke();
	identityStroke.brushSize = 1;
	const rolledStroke = createStroke();
	rolledStroke.brushSize = 1;
	rolledStroke.controlPoints[ 1 ].orientation = [
		Math.SQRT1_2, 0, 0, Math.SQRT1_2
	];
	const options = {
		pressureSizeRange: [ 1, 1 ],
		generatorClass: 'SquareBrush'
	};
	const identity = generateBrushGeometry( identityStroke, 'tube', options );
	const rolled = generateBrushGeometry( rolledStroke, 'tube', options );

	assert.notDeepEqual(
		Array.from( identity.positions.slice( 0, 24 ) ),
		Array.from( rolled.positions.slice( 0, 24 ) )
	);
	assert.deepEqual(
		Array.from( rolled.normals.slice( 0, 24 ) ),
		Array.from( rolled.normals.slice( 24, 48 ) )
	);

} );

test( 'restarts tube section frames and atlas rows after a break', () => {

	const stroke = createStroke();
	stroke.brushSize = 10;
	stroke.controlPoints = [
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
		},
		{
			position: [ 2, 0, 0 ],
			orientation: [ 0, 0, 0, 1 ],
			pressure: 1,
			timestampMs: 32
		},
		{
			position: [ 2, 1, 0 ],
			orientation: [ 0, 0, 0, 1 ],
			pressure: 1,
			timestampMs: 48
		},
		{
			position: [ 2, 2, 0 ],
			orientation: [ 0, 0, Math.SQRT1_2, Math.SQRT1_2 ],
			pressure: 1,
			timestampMs: 64
		}
	];
	const geometry = generateBrushGeometry( stroke, 'tube', {
		pressureSizeRange: [ 1, 1 ],
		generatorClass: 'TubeBrush',
		geometryParams: {
			tubeSideCount: 4,
			tubeEndCaps: false,
			textureAtlasV: 64
		}
	} );
	const ringVertexCount = 5;

	for ( let ringVertex = 0; ringVertex < ringVertexCount; ringVertex += 1 ) {
		for ( let axis = 0; axis < 3; axis += 1 ) {
			assertClose(
				geometry.normals[ ( ringVertexCount * 2 + ringVertex ) * 3 + axis ],
				geometry.normals[ ( ringVertexCount * 3 + ringVertex ) * 3 + axis ]
			);
		}
	}
	assert.notEqual(
		geometry.uvs[ 1 ],
		geometry.uvs[ ringVertexCount * 2 * 2 + 1 ]
	);

} );

test( 'restarts Tube modifiers and StretchUV for each broken section', () => {

	const stroke = createStroke();
	stroke.brushSize = 1;
	stroke.controlPoints = [ 0, 1, 2, 1, 0, -1 ].map( ( x, index ) => ( {
		position: [ x, 0, 0 ],
		orientation: [ 0, 0, 0, 1 ],
		pressure: 1,
		timestampMs: index * 16
	} ) );
	const geometry = generateBrushGeometry( stroke, 'tube', {
		generatorClass: 'TubeBrush',
		pressureSizeRange: [ 1, 1 ],
		geometryParams: {
			tubeSideCount: 4,
			tubeEndCaps: false,
			tubeShapeModifier: 2,
			tubeUvStyle: 'stretch'
		}
	} );
	const ringVertexCount = 5;
	const radius = ( ring ) => {
		const first = ring * ringVertexCount;
		const opposite = first + 2;
		return 0.5 * Math.hypot( ...[ 0, 1, 2 ].map( axis =>
			geometry.positions[ opposite * 3 + axis ] - geometry.positions[ first * 3 + axis ] ) );
	};
	for ( const ring of [ 0, 2, 3, 5 ] ) {
		assertClose( radius( ring ), 0 );
	}
	assert.ok( radius( 1 ) > 0.4 );
	assert.ok( radius( 4 ) > 0.4 );
	for ( const [ ring, expectedU ] of [ [ 0, 0 ], [ 1, 0.5 ], [ 2, 1 ], [ 3, 0 ], [ 4, 0.5 ], [ 5, 1 ] ] ) {
		assertClose( geometry.uvs[ ring * ringVertexCount * 2 ], expectedU );
	}

} );

test( 'interpolates LoftedProfile from trailing-knot partial progress', () => {

	const stroke = createStroke();
	stroke.brushSize = 1;
	stroke.controlPoints = [ 0, 1, 2, 2.1 ].map( ( x, index ) => ( {
		position: [ x, 0, 0 ],
		orientation: [ 0, 0, 0, 1 ],
		pressure: 1,
		timestampMs: index * 16
	} ) );
	const geometry = generateBrushGeometry( stroke, 'tube', {
		generatorClass: 'TubeBrush',
		pressureSizeRange: [ 1, 1 ],
		geometryParams: {
			tubeSideCount: 4,
			tubeEndCaps: false,
			tubeShapeModifier: 1,
			solidMinLengthMeters: 0
		}
	} );
	const ringVertexCount = 5;
	const first = ringVertexCount;
	const opposite = first + 2;
	const radius = 0.5 * Math.hypot( ...[ 0, 1, 2 ].map( axis =>
		geometry.positions[ opposite * 3 + axis ] - geometry.positions[ first * 3 + axis ] ) );
	const partialProgress = 0.5;
	const currentCurve = 1 + ( 0.5 - 1 ) * 0.185;
	const interpolatedCurve = currentCurve + ( 0.5 - currentCurve ) * partialProgress;
	const attenuation = ( 4 - 3 + partialProgress ) / 7;
	assertClose( radius, 0.5 * interpolatedCurve * attenuation );

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

test( 'keeps Spray and Genius particle pressure unsmoothed', () => {

	const stroke = createStroke();
	stroke.brushSize = 1;
	stroke.controlPoints[ 0 ].pressure = 0;
	stroke.controlPoints[ 1 ].position = [ 0.1, 0, 0 ];
	stroke.controlPoints[ 1 ].pressure = 1;
	const spray = generateBrushGeometry( stroke, 'particle', {
		generatorClass: 'MidpointPlusLifetimeSprayBrush',
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
	assertClose( spray.colors[ 3 ], 1 );
	assertClose( spray.uv1[ 3 ], 0.016 );
	const loadedSpray = generateBrushGeometry( stroke, 'particle', {
		generatorClass: 'MidpointPlusLifetimeSprayBrush',
		pressureSizeRange: [ 0.1, 1 ],
		geometryParams: { sprayRateMultiplier: 20 },
		deterministicBirthTime: true
	} );
	assertClose( loadedSpray.uv1[ 3 ], 0 );
	const offsetSpray = generateBrushGeometry( stroke, 'particle', {
		generatorClass: 'MidpointPlusLifetimeSprayBrush',
		pressureSizeRange: [ 0.1, 1 ],
		geometryParams: { sprayRateMultiplier: 20 },
		particleBirthTimeOffsetSeconds: 2
	} );
	assertClose( offsetSpray.uv1[ 3 ], 2.016 );

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
	assertClose( genius.colors[ 3 ], 1 );
	assertClose( genius.packedUvs[ 3 ], 0.016 );
	const loadedGenius = generateBrushGeometry( stroke, 'particle', {
		generatorClass: 'GeniusParticlesBrush',
		geometryParams: { particleRate: 1 },
		deterministicBirthTime: true
	} );
	assertClose( loadedGenius.packedUvs[ 3 ], 0 );
	const offsetGenius = generateBrushGeometry( stroke, 'particle', {
		generatorClass: 'GeniusParticlesBrush',
		geometryParams: { particleRate: 1 },
		particleBirthTimeOffsetSeconds: 2
	} );
	assertClose( offsetGenius.packedUvs[ 3 ], 2.016 );
	const previewGenius = generateBrushGeometry( stroke, 'particle', {
		generatorClass: 'GeniusParticlesBrush',
		geometryParams: { particleRate: 1 },
		particlePreview: true
	} );
	assertClose( previewGenius.packedUvs[ 3 ], -0.016 );

} );

test( 'preserves Spray particle salts after preview knots decay', () => {

	for ( const generatorClass of [ 'SprayBrush', 'MidpointPlusLifetimeSprayBrush' ] ) {
		const stroke = createStroke();
		stroke.brushSize = 1;
		stroke.controlPoints[ 1 ].position = [ 1, 0, 0 ];
		stroke.controlPoints.push( {
			position: [ 2, 0, 0 ],
			orientation: [ 0, 0, 0, 1 ],
			pressure: 1,
			timestampMs: 32
		} );
		const options = {
			generatorClass,
			pressureSizeRange: [ 1, 1 ],
			geometryParams: {
				sprayRateMultiplier: 1,
				particleSizeVariance: 0.5,
				particlePositionVariance: 0.5,
				particleRotationVariance: 45
			}
		};
		const full = generateBrushGeometry( stroke, 'particle', options );
		const tailStroke = { ...stroke, controlPoints: stroke.controlPoints.slice( 1 ) };
		const tail = generateBrushGeometry( tailStroke, 'particle', {
			...options,
			particleKnotIndexOffset: 1
		} );

		assert.deepEqual(
			Array.from( tail.positions.slice( 0, 12 ) ),
			Array.from( full.positions.slice( 12, 24 ) ),
			generatorClass
		);
	}

} );

test( 'preserves Genius particle distance phase after preview knots decay', () => {

	const stroke = createStroke();
	stroke.brushSize = 0.1;
	stroke.controlPoints[ 0 ].position = [ 1.3, 0, 0 ];
	stroke.controlPoints[ 1 ].position = [ 2.3, 0, 0 ];
	const geometry = generateBrushGeometry( stroke, 'particle', {
		generatorClass: 'GeniusParticlesBrush',
		particleDistanceOffset: 1.3,
		geometryParams: {
			particleRate: 0.0025,
			particleSizeVariance: 0,
			particleSpeed: 0,
			brushSizeRange: [ 0.1, 0.1 ]
		}
	} );

	assert.equal( getGeneratedVertexCount( geometry ), 12 );
	assertClose( geometry.normals[ 0 ], 1.3 );
	assertClose( geometry.normals[ 12 ], 1.3 + 1 / 1.3 );

} );

test( 'keeps a Genius particle on the live pointer until finalization', () => {

	const stroke = createStroke();
	stroke.brushSize = 0.1;
	stroke.controlPoints[ 1 ].position = [ 0.5, 0, 0 ];
	const options = {
		generatorClass: 'GeniusParticlesBrush',
		geometryParams: {
			particleRate: 0.0025,
			particleSizeVariance: 0,
			particleSpeed: 0,
			brushSizeRange: [ 0.1, 0.1 ]
		}
	};
	const live = generateBrushGeometry( stroke, 'particle', options );
	const finalized = generateBrushGeometry( stroke, 'particle', {
		...options,
		finalized: true
	} );

	assert.equal( getGeneratedVertexCount( live ), 8 );
	assert.equal( getGeneratedVertexCount( finalized ), 4 );
	assertClose( live.normals[ 12 ], 0.5 );

} );

test( 'smooths finalized Tube and 3D Print knot positions', () => {

	const stroke = createStroke();
	stroke.controlPoints[ 0 ].position = [ 0, 0, 0 ];
	stroke.controlPoints[ 1 ].position = [ 0, 1, 0 ];
	stroke.controlPoints.push( {
		position: [ 1, 2, 0 ],
		orientation: [ 0, 0, 0, 1 ],
		pressure: 1,
		timestampMs: 32
	} );
	const tube = generateBrushGeometry( stroke, 'tube', {
		generatorClass: 'TubeBrush',
		pressureSizeRange: [ 1, 1 ],
		geometryParams: { tubeSideCount: 4, tubeEndCaps: false }
	} );
	const middleTubeRing = 5;
	assertClose(
		( tube.positions[ middleTubeRing * 3 ] + tube.positions[ ( middleTubeRing + 2 ) * 3 ] ) * 0.5,
		0.25
	);
	assertClose(
		( tube.positions[ middleTubeRing * 3 + 1 ] + tube.positions[ ( middleTubeRing + 2 ) * 3 + 1 ] ) * 0.5,
		1
	);

	const print = generateBrushGeometry( stroke, 'print3d', {
		generatorClass: 'Square3DPrintBrush',
		pressureSizeRange: [ 1, 1 ]
	} );
	const middlePrintRing = 12;
	let centerX = 0;
	let centerY = 0;
	for ( let vertex = 0; vertex < 8; vertex += 1 ) {
		centerX += print.positions[ ( middlePrintRing + vertex ) * 3 ];
		centerY += print.positions[ ( middlePrintRing + vertex ) * 3 + 1 ];
	}
	assertClose( centerX / 8, 0.25 );
	assertClose( centerY / 8, 1 );

} );

test( 'trims a short non-M11 FlatGeometry tail after a late break', () => {

	const stroke = createStroke();
	stroke.controlPoints = [ 0, 1, 2, 1, 0, -1 ].map( ( x, index ) => ( {
		position: [ x, 0, 0 ],
		orientation: [ 0, 0, 0, 1 ],
		pressure: 1,
		timestampMs: index * 16
	} ) );
	const trimmed = generateBrushGeometry( stroke, 'ribbon', {
		generatorClass: 'FlatGeometryBrush',
		geometryParams: { m11Compatibility: false }
	} );
	const retained = generateBrushGeometry( stroke, 'ribbon', {
		generatorClass: 'FlatGeometryBrush',
		geometryParams: { m11Compatibility: true }
	} );
	assert.equal( getGeneratedVertexCount( trimmed ), 8 );
	assert.equal( getGeneratedIndexCount( trimmed ), 12 );
	assert.equal( getGeneratedVertexCount( retained ), 12 );
	assert.equal( getGeneratedIndexCount( retained ), 24 );

} );
