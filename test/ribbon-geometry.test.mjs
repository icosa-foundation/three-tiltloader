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
