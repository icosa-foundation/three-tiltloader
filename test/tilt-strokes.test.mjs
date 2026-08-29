import assert from 'node:assert/strict';
import test from 'node:test';

import { readTiltStrokeData } from '../src/tilt-strokes.js';

test( 'reads Open Brush stroke and control-point extension fields', () => {

	const chunks = [];
	const int32 = ( value ) => {

		const bytes = Buffer.allocUnsafe( 4 );
		bytes.writeInt32LE( value );
		chunks.push( bytes );

	};
	const uint32 = ( value ) => {

		const bytes = Buffer.allocUnsafe( 4 );
		bytes.writeUInt32LE( value );
		chunks.push( bytes );

	};
	const float32 = ( value ) => {

		const bytes = Buffer.allocUnsafe( 4 );
		bytes.writeFloatLE( value );
		chunks.push( bytes );

	};

	uint32( 0xc576a5cd );
	int32( 5 );
	int32( 0 );
	uint32( 0 );
	int32( 1 );

	int32( 0 );
	for ( const value of [ 0.2, 0.4, 0.6, 0.8 ] ) float32( value );
	float32( 0.25 );
	uint32( 0x1f );
	uint32( 0x03 );
	uint32( 2 );
	float32( 1.5 );
	uint32( 7 );
	int32( -9 );
	uint32( 3 );
	int32( 1 );
	for ( const value of [ 1, 2, 3, 0, 0, 0, 1, 0.75 ] ) float32( value );
	uint32( 1234 );

	const strokes = readTiltStrokeData(
		new Uint8Array( Buffer.concat( chunks ) ),
		[ 'D3F3B18A-DA03-F694-B838-28BA8E749A98' ]
	);

	assert.equal( strokes.length, 1 );
	assert.equal( strokes[ 0 ].brushGuid, 'd3f3b18a-da03-f694-b838-28ba8e749a98' );
	assert.equal( strokes[ 0 ].flags, 2 );
	assert.equal( strokes[ 0 ].brushScale, 1.5 );
	assert.equal( strokes[ 0 ].groupId, 7 );
	assert.equal( strokes[ 0 ].seed, -9 );
	assert.equal( strokes[ 0 ].layerIndex, 3 );
	assert.deepEqual( strokes[ 0 ].controlPoints[ 0 ], {
		position: [ 1, 2, 3 ],
		orientation: [ 0, 0, 0, 1 ],
		pressure: 0.75,
		timestampMs: 1234
	} );

} );
