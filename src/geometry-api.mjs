import {
	Box3,
	BufferAttribute,
	BufferGeometry,
	Vector3
} from 'three';

function validateAttribute( name, attribute ) {

	if ( ! ArrayBuffer.isView( attribute.array ) || attribute.array instanceof DataView ) {

		throw new TypeError( `Geometry attribute "${name}" must use a typed array.` );

	}

	if ( ! Number.isInteger( attribute.itemSize ) || attribute.itemSize < 1 ) {

		throw new RangeError( `Geometry attribute "${name}" must have a positive integer itemSize.` );

	}

	if ( attribute.array.length % attribute.itemSize !== 0 ) {

		throw new RangeError( `Geometry attribute "${name}" length must be divisible by itemSize.` );

	}

}

/**
 * Converts a renderer-neutral geometry result into Three.js BufferGeometry.
 * The input typed arrays are retained rather than copied.
 */
export function createBufferGeometry( result, target = new BufferGeometry() ) {

	if ( ! result || typeof result !== 'object' || ! result.attributes ) {

		throw new TypeError( 'Geometry result must contain an attributes object.' );

	}

	for ( const [ name, attribute ] of Object.entries( result.attributes ) ) {

		validateAttribute( name, attribute );

	}

	if ( result.index !== undefined &&
		! ( result.index instanceof Uint16Array || result.index instanceof Uint32Array ) ) {

		throw new TypeError( 'Geometry index must be a Uint16Array or Uint32Array.' );

	}

	for ( const name of Object.keys( target.attributes ) ) {

		target.deleteAttribute( name );

	}

	for ( const [ name, attribute ] of Object.entries( result.attributes ) ) {

		target.setAttribute( name, new BufferAttribute(
			attribute.array,
			attribute.itemSize,
			attribute.normalized === true
		) );

	}

	if ( result.index !== undefined ) {

		target.setIndex( new BufferAttribute( result.index, 1 ) );

	} else {

		target.setIndex( null );

	}

	target.clearGroups();
	for ( const group of result.groups || [] ) {

		target.addGroup( group.start, group.count, group.materialIndex || 0 );

	}

	if ( result.drawRange ) {

		target.setDrawRange( result.drawRange.start, result.drawRange.count );

	} else {

		target.setDrawRange( 0, Infinity );

	}

	if ( result.bounds ) {

		target.boundingBox = new Box3(
			new Vector3().fromArray( result.bounds.min ),
			new Vector3().fromArray( result.bounds.max )
		);

	} else {

		target.boundingBox = null;

	}

	target.boundingSphere = null;
	return target;

}
