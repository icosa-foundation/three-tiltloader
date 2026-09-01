import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createOpenBrushReferenceControlPoints,
	createOpenBrushReferencePath,
	createOpenBrushReferenceStroke,
	OPEN_BRUSH_REFERENCE_COLOR,
	OPEN_BRUSH_REFERENCE_SIZE
} from '../src/open-brush-reference-stroke.js';

function assertClose( actual, expected, tolerance = 5e-6 ) {

	assert.ok( Math.abs( actual - expected ) <= tolerance, `${actual} != ${expected}` );

}

test( 'recreates the Open Brush screenshot path and DrawNestedTrList samples', () => {

	const path = createOpenBrushReferencePath();
	const points = createOpenBrushReferenceControlPoints( path );
	assert.equal( path.length, 36 );
	assert.equal( points.length, 38 );
	assert.deepEqual( points[ 0 ].position, [ -1.25, 100, -4 ] );
	assertClose( points[ 1 ].position[ 0 ], -1.24999 );
	assertClose( points[ 2 ].position[ 0 ], -1.2 );
	assertClose( points[ 3 ].position[ 0 ], -1.15001 );
	assert.equal( points[ 37 ].timestampMs, 37 );
	assertClose( points[ 37 ].position[ 0 ], 0.05 );
	assertClose( points[ 37 ].position[ 1 ], 100.260216 );
	assertClose( points[ 37 ].position[ 2 ], -3.96475673 );
	assertClose( points[ 11 ].orientation[ 0 ], -0.2558063 );
	assertClose( points[ 11 ].orientation[ 1 ], -0.06262134 );
	assertClose( points[ 11 ].orientation[ 2 ], 0.2164515 );
	assertClose( points[ 11 ].orientation[ 3 ], 0.9401013 );

} );

test( 'creates the fixed reference stroke settings', () => {

	const stroke = createOpenBrushReferenceStroke( 'test-guid' );
	assert.equal( stroke.brushGuid, 'test-guid' );
	assert.equal( stroke.brushSize, OPEN_BRUSH_REFERENCE_SIZE );
	assert.deepEqual( stroke.color, OPEN_BRUSH_REFERENCE_COLOR );
	assert.equal( stroke.seed, 0 );
	assert.equal( stroke.controlPoints.length, 38 );

} );
