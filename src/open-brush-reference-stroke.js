import { Euler, Quaternion } from 'three';

export const OPEN_BRUSH_REFERENCE_COLOR = Object.freeze( [ 51 / 255, 51 / 255, 230 / 255, 1 ] );
export const OPEN_BRUSH_REFERENCE_SIZE = 0.1125;
export const OPEN_BRUSH_REFERENCE_TIME_SECONDS = 0.5;
export const OPEN_BRUSH_REFERENCE_ORIGIN = Object.freeze( [ -1.25, 100, 4 ] );

const DEGREES_TO_RADIANS = Math.PI / 180;

function unityEulerQuaternion( xDegrees, yDegrees, zDegrees ) {

	// Unity's Quaternion.Euler applies its Euler components in Z-X-Y order. The
	// equivalent intrinsic order accepted by three.js is YXZ.
	return new Quaternion().setFromEuler( new Euler(
		xDegrees * DEGREES_TO_RADIANS,
		yDegrees * DEGREES_TO_RADIANS,
		zDegrees * DEGREES_TO_RADIANS,
		'YXZ'
	) ).toArray();

}

/** Recreates UiScreenshotter.CreateBrushReferencePath in Unity coordinates. */
export function createOpenBrushReferencePath() {

	const pointCount = 36;
	const path = [];
	for ( let index = 0; index < pointCount; index ++ ) {

		const t = index / ( pointCount - 1 );
		const x = index <= 22
			? index * 0.1
			: 2.2 - ( index - 22 ) * 0.075;
		let position = [
			x,
			0.55 * Math.sin( index * 0.47 ) + 0.012 * index,
			0.38 * Math.sin( index * 0.31 ) + 0.009 * index
		];
		if ( index === 10 ) {

			const previous = path[ path.length - 1 ].position;
			position = [ previous[ 0 ] + 0.00001, previous[ 1 ] + 0.00004, previous[ 2 ] - 0.00002 ];

		}

		path.push( {
			position,
			orientation: unityEulerQuaternion(
				28 * Math.sin( index * 0.23 ),
				65 * t,
				140 * t + 18 * Math.sin( index * 0.41 )
			),
			pressure: 0.25 + 0.75 * ( 0.5 + 0.5 * Math.sin( index * 0.37 - Math.PI * 0.5 ) )
		} );

	}
	return path;

}

function lerpPosition( start, end, amount ) {

	return start.map( ( value, axis ) => value + ( end[ axis ] - value ) * amount );

}

function toThreeControlPoint( point, timestampMs, origin ) {

	const unityPosition = point.position.map( ( value, axis ) => value + origin[ axis ] );
	return {
		position: [ unityPosition[ 0 ], unityPosition[ 1 ], -unityPosition[ 2 ] ],
		orientation: [
			-point.orientation[ 0 ],
			-point.orientation[ 1 ],
			point.orientation[ 2 ],
			point.orientation[ 3 ]
		],
		pressure: point.pressure,
		timestampMs
	};

}

/**
 * Recreates the default-smoothing DrawStrokes.DrawNestedTrList control points
 * used by UiScreenshotter, then converts Unity coordinates to three.js.
 */
export function createOpenBrushReferenceControlPoints(
	path = createOpenBrushReferencePath(),
	origin = OPEN_BRUSH_REFERENCE_ORIGIN
) {

	const points = [];
	let timestampMs = 0;
	for ( let index = 0; index < path.length - 1; index ++ ) {

		const point = path[ index ];
		const addPoint = position => {

			points.push( toThreeControlPoint( { ...point, position }, timestampMs ++, origin ) );

		};
		addPoint( point.position );
		if ( index === 0 ) {

			const next = path[ index + 1 ].position;
			addPoint( lerpPosition( point.position, next, 0.0001 ) );
			addPoint( lerpPosition( point.position, next, 0.5 ) );
			addPoint( lerpPosition( point.position, next, 0.9999 ) );

		}

	}
	return points;

}

export function createOpenBrushReferenceStroke( brushGuid, brushSize = OPEN_BRUSH_REFERENCE_SIZE ) {

	return {
		guid: '00000000-0000-0000-0000-000000000000',
		brushGuid,
		brushSize,
		brushScale: 1,
		color: [ ...OPEN_BRUSH_REFERENCE_COLOR ],
		controlPoints: createOpenBrushReferenceControlPoints(),
		flags: 0,
		seed: 0,
		groupId: 0,
		layerIndex: 0
	};

}
