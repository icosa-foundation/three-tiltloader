import assert from 'node:assert/strict';
import test from 'node:test';
import { BufferAttribute, BufferGeometry } from 'three';
import { createBufferGeometry } from '../src/geometry-api.mjs';

test( 'creates BufferGeometry without copying typed arrays', () => {
	const positions = new Float32Array( [ 0, 0, 0, 1, 0, 0, 0, 1, 0 ] );
	const indices = new Uint16Array( [ 0, 1, 2 ] );
	const geometry = createBufferGeometry( {
		attributes: { position: { array: positions, itemSize: 3 } },
		index: indices,
		groups: [ { start: 0, count: 3, materialIndex: 2 } ],
		drawRange: { start: 0, count: 3 },
		bounds: { min: [ 0, 0, 0 ], max: [ 1, 1, 0 ] }
	} );

	assert.equal( geometry.getAttribute( 'position' ).array, positions );
	assert.equal( geometry.index.array, indices );
	assert.deepEqual( geometry.groups, [ { start: 0, count: 3, materialIndex: 2 } ] );
	assert.deepEqual( geometry.drawRange, { start: 0, count: 3 } );
	assert.deepEqual( geometry.boundingBox.min.toArray(), [ 0, 0, 0 ] );
	assert.deepEqual( geometry.boundingBox.max.toArray(), [ 1, 1, 0 ] );
} );

test( 'can update an existing BufferGeometry', () => {
	const target = new BufferGeometry();
	target.setAttribute( 'stale', new BufferAttribute( new Float32Array( [ 1 ] ), 1 ) );
	target.addGroup( 0, 1, 4 );
	target.setDrawRange( 2, 5 );
	const geometry = createBufferGeometry( {
		attributes: { position: { array: new Float32Array( [ 0, 0, 0 ] ), itemSize: 3 } }
	}, target );

	assert.equal( geometry, target );
	assert.equal( geometry.groups.length, 0 );
	assert.equal( geometry.index, null );
	assert.equal( geometry.getAttribute( 'stale' ), undefined );
	assert.deepEqual( geometry.drawRange, { start: 0, count: Infinity } );
} );

test( 'rejects malformed attributes and indices', () => {
	const target = new BufferGeometry();
	const stale = new BufferAttribute( new Float32Array( [ 1 ] ), 1 );
	target.setAttribute( 'stale', stale );
	assert.throws( () => createBufferGeometry( {
		attributes: { position: { array: new Float32Array( 4 ), itemSize: 3 } }
	}, target ), /divisible/ );
	assert.equal( target.getAttribute( 'stale' ), stale );

	assert.throws( () => createBufferGeometry( {
		attributes: { position: { array: new Float32Array( 3 ), itemSize: 3 } },
		index: new Uint8Array( [ 0 ] )
	} ), /Uint16Array or Uint32Array/ );
} );
