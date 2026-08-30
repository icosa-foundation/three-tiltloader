import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { getOpenBrushGeometryDefaults } from '../src/brush-defaults.js';
import { generateBrushGeometry } from '../src/brush-geometry.ts';

const DEFAULT_TOLERANCE = 1e-5;
const DEFAULT_UNIT_SCALE = 0.1;
const CHANNELS = [
	[ 'position', 'positions', 3 ],
	[ 'normal', 'normals', 3 ],
	[ 'tangent', 'tangents', 4 ],
	[ 'color', 'colors', 4 ],
	[ 'texcoord0', 'uv0', undefined ],
	[ 'texcoord1', 'uv1', undefined ]
];

function usage() {
	return [
		'Compare three-tiltloader geometry with Open Brush live-mesh fixtures.',
		'',
		'Usage:',
		'  npm run compare:open-brush-fixtures -- --fixtures <directory> [options]',
		'',
		'Options:',
		'  --tolerance <number>  Maximum absolute float error (default: 1e-5)',
		'  --unit-scale <number> Open Brush units to generator units (default: 0.1)',
		'  --handedness <mode>   unity-to-three or none (default: unity-to-three)',
		'  --format <text|json>  Report format (default: text)',
		'  --output <file>       Write the report to a file instead of stdout',
		'  --help                Show this help',
		'',
		'Paths are supplied by the caller; no machine-specific checkout paths are embedded.'
	].join( '\n' );
}

function parseArguments( argv ) {
	const options = {
		fixtures: undefined,
		tolerance: DEFAULT_TOLERANCE,
		unitScale: DEFAULT_UNIT_SCALE,
		handedness: 'unity-to-three',
		format: 'text',
		output: undefined,
		help: false
	};
	for ( let index = 0; index < argv.length; index += 1 ) {
		const argument = argv[ index ];
		if ( argument === '--help' || argument === '-h' ) {
			options.help = true;
			continue;
		}
		const value = argv[ index + 1 ];
		if ( value === undefined || value.startsWith( '--' ) ) {
			throw new Error( `Missing value for ${argument}.` );
		}
		index += 1;
		switch ( argument ) {
			case '--fixtures':
				options.fixtures = value;
				break;
			case '--tolerance':
				options.tolerance = Number( value );
				break;
			case '--unit-scale':
				options.unitScale = Number( value );
				break;
			case '--handedness':
				options.handedness = value;
				break;
			case '--format':
				options.format = value;
				break;
			case '--output':
				options.output = value;
				break;
			default:
				throw new Error( `Unknown argument: ${argument}.` );
		}
	}
	if ( options.help ) return options;
	if ( ! options.fixtures ) throw new Error( '--fixtures is required.' );
	if ( ! Number.isFinite( options.tolerance ) || options.tolerance < 0 ) {
		throw new Error( '--tolerance must be a finite non-negative number.' );
	}
	if ( ! Number.isFinite( options.unitScale ) || options.unitScale <= 0 ) {
		throw new Error( '--unit-scale must be a finite positive number.' );
	}
	if ( options.handedness !== 'unity-to-three' && options.handedness !== 'none' ) {
		throw new Error( '--handedness must be "unity-to-three" or "none".' );
	}
	if ( options.format !== 'text' && options.format !== 'json' ) {
		throw new Error( '--format must be "text" or "json".' );
	}
	return options;
}

function resolveGeometryFamily( record ) {
	switch ( record.family ) {
		case 'ribbon':
		case 'tube':
		case 'particle':
		case 'thick-strip':
		case 'hull':
		case 'concave-hull':
		case 'print3d':
			return record.family;
		default:
			return undefined;
	}
}

function createGeometryOptions() {
	return {
		// UiScreenshotter records a finalized stroke before copying its live mesh.
		finalized: true,
		// The fixture does not currently expose keeper/trailing-point state.
		// Retaining the final point avoids guessing that it was provisional.
		lastControlPointIsKeeper: true,
		deterministicBirthTime: true
	};
}

function createStroke( input, fixtureIndex, unitScale, handedness ) {
	const reflect = handedness === 'unity-to-three';
	return {
		guid: `open-brush-fixture-${fixtureIndex}`,
		brushGuid: input.brushGuid,
		brushSize: input.brushSize * unitScale,
		brushScale: input.brushScale,
		color: input.color,
		controlPoints: input.controlPoints.map( ( point ) => ( {
			...point,
			position: [
				point.position[ 0 ] * unitScale,
				point.position[ 1 ] * unitScale,
				point.position[ 2 ] * unitScale * ( reflect ? -1 : 1 )
			],
			orientation: reflect
				? [
					-point.orientation[ 0 ],
					-point.orientation[ 1 ],
					point.orientation[ 2 ],
					point.orientation[ 3 ]
				]
				: point.orientation
		} ) ),
		flags: Number( input.flags ),
		seed: input.seed,
		groupId: 0,
		layerIndex: 0
	};
}

function normalizedReferenceAttribute(
	name,
	attribute,
	unitScale,
	handedness
) {
	if ( attribute === undefined ) return undefined;
	let scaledComponents = [];
	if ( name === 'position' ||
		( name === 'normal' && attribute.semantic === 'Position' ) ) {
		scaledComponents = [ 0, 1, 2 ];
	} else if ( name === 'texcoord0' &&
		attribute.semantic === 'XyIsUvZIsDistance' ) {
		scaledComponents = [ 2 ];
	} else if ( name === 'texcoord1' &&
		( attribute.semantic === 'Position' || attribute.semantic === 'Vector' ) ) {
		scaledComponents = [ 0, 1, 2 ];
	}
	const data = attribute.data.map( ( value, index ) =>
		scaledComponents.includes( index % attribute.itemSize )
			? value * unitScale
			: value
	);
	if ( ( name === 'texcoord0' || name === 'texcoord1' ) &&
		( attribute.semantic === 'XyIsUv' ||
			attribute.semantic === 'XyIsUvZIsDistance' ) ) {
		for ( let index = 1; index < data.length; index += attribute.itemSize ) {
			data[ index ] = 1 - data[ index ];
		}
	}
	if ( handedness === 'unity-to-three' ) {
		const reflectsZ = name === 'position' ||
			name === 'normal' ||
			name === 'tangent' ||
			( name === 'texcoord1' &&
				( attribute.semantic === 'Position' || attribute.semantic === 'Vector' ) );
		if ( reflectsZ && attribute.itemSize >= 3 ) {
			for ( let index = 2; index < data.length; index += attribute.itemSize ) {
				data[ index ] = -data[ index ];
			}
		}
		if ( name === 'tangent' && attribute.itemSize === 4 ) {
			for ( let index = 3; index < data.length; index += 4 ) {
				data[ index ] = -data[ index ];
			}
		}
	}
	return { ...attribute, data };
}

function normalizeReferenceMesh( live, unitScale, handedness ) {
	const attributes = Object.fromEntries(
		Object.entries( live.attributes ).map( ( [ name, attribute ] ) => [
			name,
			normalizedReferenceAttribute( name, attribute, unitScale, handedness )
		] )
	);
	const indices = [ ...live.indices ];
	if ( handedness === 'unity-to-three' ) {
		const isTriangleSoup = live.vertexCount === indices.length &&
			indices.every( ( value, index ) => value === index );
		if ( isTriangleSoup ) {
			for ( const attribute of Object.values( attributes ) ) {
				reverseTriangleSoupWinding( attribute );
			}
		} else {
			for ( let index = 0; index + 2 < indices.length; index += 3 ) {
				[ indices[ index + 1 ], indices[ index + 2 ] ] =
					[ indices[ index + 2 ], indices[ index + 1 ] ];
			}
		}
	}
	const sourceBounds = live.bounds;
	const bounds = handedness === 'unity-to-three'
		? {
			min: [
				sourceBounds.min[ 0 ] * unitScale,
				sourceBounds.min[ 1 ] * unitScale,
				-sourceBounds.max[ 2 ] * unitScale
			],
			max: [
				sourceBounds.max[ 0 ] * unitScale,
				sourceBounds.max[ 1 ] * unitScale,
				-sourceBounds.min[ 2 ] * unitScale
			]
		}
		: {
			min: sourceBounds.min.map( ( value ) => value * unitScale ),
			max: sourceBounds.max.map( ( value ) => value * unitScale )
		};
	return { attributes, indices, bounds };
}

function reverseTriangleSoupWinding( attribute ) {
	const { data, itemSize } = attribute;
	for ( let triangle = 0; triangle * 3 + 2 < data.length / itemSize; triangle += 1 ) {
		const secondOffset = ( triangle * 3 + 1 ) * itemSize;
		const thirdOffset = secondOffset + itemSize;
		for ( let component = 0; component < itemSize; component += 1 ) {
			[ data[ secondOffset + component ], data[ thirdOffset + component ] ] =
				[ data[ thirdOffset + component ], data[ secondOffset + component ] ];
		}
	}
}

function actualChannels( geometry ) {
	return {
		position: { itemSize: 3, data: geometry.positions },
		normal: { itemSize: 3, data: geometry.normals },
		tangent: { itemSize: 4, data: geometry.tangents },
		color: { itemSize: 4, data: geometry.colors },
		texcoord0: {
			itemSize: geometry.uv0Size,
			data: geometry.packedUvs ?? geometry.uvs
		},
		texcoord1: geometry.uv1 === undefined
			? undefined
			: { itemSize: geometry.uv1Size, data: geometry.uv1 }
	};
}

function hullPointKey( point, tolerance ) {
	return point.map( ( value ) => Math.round( value / tolerance ) ).join( ':' );
}

function hullEdgeKey( first, second ) {
	return first <= second ? `${first}|${second}` : `${second}|${first}`;
}

function convexFaceBoundaryVertices( vertices, normal, tolerance ) {
	if ( vertices.length <= 3 ) return vertices;
	const absoluteNormal = normal.map( Math.abs );
	const droppedAxis = absoluteNormal[ 0 ] >= absoluteNormal[ 1 ] &&
		absoluteNormal[ 0 ] >= absoluteNormal[ 2 ]
		? 0
		: absoluteNormal[ 1 ] >= absoluteNormal[ 2 ]
			? 1
			: 2;
	const projectedAxes = [ 0, 1, 2 ].filter( ( axis ) => axis !== droppedAxis );
	const points = vertices.map( ( point ) => ( {
		point,
		x: point[ projectedAxes[ 0 ] ],
		y: point[ projectedAxes[ 1 ] ]
	} ) ).sort( ( first, second ) => first.x - second.x || first.y - second.y );
	const projectedScale = Math.max(
		points[ points.length - 1 ].x - points[ 0 ].x,
		Math.max( ...points.map( ( point ) => point.y ) ) -
			Math.min( ...points.map( ( point ) => point.y ) ),
		tolerance
	);
	const cross2 = ( origin, first, second ) =>
		( first.x - origin.x ) * ( second.y - origin.y ) -
		( first.y - origin.y ) * ( second.x - origin.x );
	const crossTolerance = tolerance * projectedScale * 2;
	const lower = [];
	for ( const point of points ) {
		while ( lower.length >= 2 &&
			cross2( lower[ lower.length - 2 ], lower[ lower.length - 1 ], point ) <= crossTolerance ) {
			lower.pop();
		}
		lower.push( point );
	}
	const upper = [];
	for ( let index = points.length - 1; index >= 0; index -= 1 ) {
		const point = points[ index ];
		while ( upper.length >= 2 &&
			cross2( upper[ upper.length - 2 ], upper[ upper.length - 1 ], point ) <= crossTolerance ) {
			upper.pop();
		}
		upper.push( point );
	}
	lower.pop();
	upper.pop();
	return [ ...lower, ...upper ].map( ( value ) => value.point );
}

function buildPolygonFaces( geometry, fixturePolygonFaces, unitScale, tolerance ) {
	const pointTolerance = Math.max(
		fixturePolygonFaces.pointTolerance * unitScale,
		tolerance
	);
	const planeTolerance = Math.max(
		fixturePolygonFaces.planeTolerance * unitScale,
		tolerance
	);
	const normalDotTolerance = fixturePolygonFaces.normalDotTolerance;
	const positions = geometry.positions;
	const center = [
		( geometry.bounds.min[ 0 ] + geometry.bounds.max[ 0 ] ) * 0.5,
		( geometry.bounds.min[ 1 ] + geometry.bounds.max[ 1 ] ) * 0.5,
		( geometry.bounds.min[ 2 ] + geometry.bounds.max[ 2 ] ) * 0.5
	];
	const triangles = [];
	const edgeTriangles = new Map();
	for ( let offset = 0; offset + 2 < geometry.indices.length; offset += 3 ) {
		const vertices = [ 0, 1, 2 ].map( ( corner ) => {
			const vertex = geometry.indices[ offset + corner ] * 3;
			return [ positions[ vertex ], positions[ vertex + 1 ], positions[ vertex + 2 ] ];
		} );
		const first = vertices[ 0 ];
		const ab = vertices[ 1 ].map( ( value, index ) => value - first[ index ] );
		const ac = vertices[ 2 ].map( ( value, index ) => value - first[ index ] );
		let normal = [
			ab[ 1 ] * ac[ 2 ] - ab[ 2 ] * ac[ 1 ],
			ab[ 2 ] * ac[ 0 ] - ab[ 0 ] * ac[ 2 ],
			ab[ 0 ] * ac[ 1 ] - ab[ 1 ] * ac[ 0 ]
		];
		const normalLength = Math.hypot( ...normal );
		if ( normalLength <= 1e-6 ) continue;
		normal = normal.map( ( value ) => value / normalLength );
		const centerDirection = center.map( ( value, index ) => value - first[ index ] );
		if ( dot3( normal, centerDirection ) > 0 ) {
			normal = normal.map( ( value ) => -value );
		}
		const vertexKeys = vertices.map( ( point ) => hullPointKey( point, pointTolerance ) );
		const triangleIndex = triangles.length;
		triangles.push( {
			normal,
			planeDistance: dot3( normal, first ),
			vertices,
			vertexKeys
		} );
		for ( const [ a, b ] of [ [ 0, 1 ], [ 1, 2 ], [ 2, 0 ] ] ) {
			const key = hullEdgeKey( vertexKeys[ a ], vertexKeys[ b ] );
			const members = edgeTriangles.get( key ) ?? [];
			members.push( triangleIndex );
			edgeTriangles.set( key, members );
		}
	}

	const adjacency = triangles.map( () => new Set() );
	for ( const members of edgeTriangles.values() ) {
		for ( let first = 0; first < members.length; first += 1 ) {
			for ( let second = first + 1; second < members.length; second += 1 ) {
				const a = triangles[ members[ first ] ];
				const b = triangles[ members[ second ] ];
				if ( dot3( a.normal, b.normal ) < normalDotTolerance ||
					Math.abs( a.planeDistance - b.planeDistance ) > planeTolerance ) continue;
				adjacency[ members[ first ] ].add( members[ second ] );
				adjacency[ members[ second ] ].add( members[ first ] );
			}
		}
	}

	const visited = new Uint8Array( triangles.length );
	const faces = [];
	for ( let start = 0; start < triangles.length; start += 1 ) {
		if ( visited[ start ] ) continue;
		const pending = [ start ];
		const component = [];
		visited[ start ] = 1;
		while ( pending.length > 0 ) {
			const current = pending.pop();
			component.push( current );
			for ( const neighbor of adjacency[ current ] ) {
				if ( visited[ neighbor ] ) continue;
				visited[ neighbor ] = 1;
				pending.push( neighbor );
			}
		}
		const uniqueVertices = new Map();
		for ( const triangleIndex of component ) {
			const triangle = triangles[ triangleIndex ];
			for ( let vertex = 0; vertex < 3; vertex += 1 ) {
				uniqueVertices.set( triangle.vertexKeys[ vertex ], triangle.vertices[ vertex ] );
			}
		}
		const firstTriangle = triangles[ component[ 0 ] ];
		faces.push( {
			normal: firstTriangle.normal,
			planeDistance: firstTriangle.planeDistance,
			vertices: convexFaceBoundaryVertices(
				[ ...uniqueVertices.values() ],
				firstTriangle.normal,
				pointTolerance
			)
		} );
	}
	return { faces, pointTolerance, planeTolerance, normalDotTolerance };
}

function dot3( first, second ) {
	return first[ 0 ] * second[ 0 ] + first[ 1 ] * second[ 1 ] + first[ 2 ] * second[ 2 ];
}

function normalizeReferencePolygonFaces( polygonFaces, unitScale, handedness ) {
	const reflect = handedness === 'unity-to-three';
	return {
		faces: polygonFaces.faces.map( ( face ) => ( {
			normal: [ face.normal[ 0 ], face.normal[ 1 ], face.normal[ 2 ] * ( reflect ? -1 : 1 ) ],
			planeDistance: face.planeDistance * unitScale,
			vertices: face.vertices.map( ( point ) => [
				point[ 0 ] * unitScale,
				point[ 1 ] * unitScale,
				point[ 2 ] * unitScale * ( reflect ? -1 : 1 )
			] )
		} ) )
	};
}

function comparePolygonFaces(
	geometry,
	fixturePolygonFaces,
	unitScale,
	handedness,
	tolerance,
	allowReferenceVertexCoverage
) {
	const actual = buildPolygonFaces(
		geometry,
		fixturePolygonFaces,
		unitScale,
		tolerance
	);
	const expected = normalizeReferencePolygonFaces(
		fixturePolygonFaces,
		unitScale,
		handedness
	);
	const unmatchedExpected = new Set( expected.faces.map( ( _, index ) => index ) );
	let maximumPointError = 0;
	let maximumPlaneError = 0;
	let minimumNormalDot = 1;
	let matchedFaceCount = 0;
	for ( const actualFace of actual.faces ) {
		let matchedIndex = -1;
		let matchedMetrics;
		for ( const expectedIndex of unmatchedExpected ) {
			const expectedFace = expected.faces[ expectedIndex ];
			if ( actualFace.vertices.length !== expectedFace.vertices.length ) continue;
			const normalDot = dot3( actualFace.normal, expectedFace.normal );
			const planeError = Math.abs(
				actualFace.planeDistance - expectedFace.planeDistance
			);
			if ( normalDot < actual.normalDotTolerance || planeError > actual.planeTolerance ) continue;
			const remainingVertices = new Set(
				expectedFace.vertices.map( ( _, index ) => index )
			);
			let facePointError = 0;
			let verticesMatch = true;
			for ( const actualPoint of actualFace.vertices ) {
				let closestIndex = -1;
				let closestError = Number.POSITIVE_INFINITY;
				for ( const expectedVertexIndex of remainingVertices ) {
					const expectedPoint = expectedFace.vertices[ expectedVertexIndex ];
					const error = Math.max(
						Math.abs( actualPoint[ 0 ] - expectedPoint[ 0 ] ),
						Math.abs( actualPoint[ 1 ] - expectedPoint[ 1 ] ),
						Math.abs( actualPoint[ 2 ] - expectedPoint[ 2 ] )
					);
					if ( error < closestError ) {
						closestError = error;
						closestIndex = expectedVertexIndex;
					}
				}
				if ( closestError > actual.pointTolerance ) {
					verticesMatch = false;
					break;
				}
				remainingVertices.delete( closestIndex );
				facePointError = Math.max( facePointError, closestError );
			}
			if ( ! verticesMatch ) continue;
			matchedIndex = expectedIndex;
			matchedMetrics = { facePointError, planeError, normalDot };
			break;
		}
		if ( matchedIndex === -1 ) continue;
		unmatchedExpected.delete( matchedIndex );
		matchedFaceCount += 1;
		maximumPointError = Math.max( maximumPointError, matchedMetrics.facePointError );
		maximumPlaneError = Math.max( maximumPlaneError, matchedMetrics.planeError );
		minimumNormalDot = Math.min( minimumNormalDot, matchedMetrics.normalDot );
	}
	const unmatchedActualCount = actual.faces.length - matchedFaceCount;
	const unmatchedExpectedCount = unmatchedExpected.size;
	const actualPointsByKey = new Map();
	for ( let offset = 0; offset + 2 < geometry.positions.length; offset += 3 ) {
		const point = [
			geometry.positions[ offset ],
			geometry.positions[ offset + 1 ],
			geometry.positions[ offset + 2 ]
		];
		actualPointsByKey.set( hullPointKey( point, actual.pointTolerance ), point );
	}
	const expectedPointsByKey = new Map();
	for ( const face of expected.faces ) {
		for ( const point of face.vertices ) {
			expectedPointsByKey.set( hullPointKey( point, actual.pointTolerance ), point );
		}
	}
	let maximumOutsidePlaneDistance = 0;
	for ( const point of actualPointsByKey.values() ) {
		for ( const face of expected.faces ) {
			maximumOutsidePlaneDistance = Math.max(
				maximumOutsidePlaneDistance,
				dot3( face.normal, point ) - face.planeDistance
			);
		}
	}
	let maximumExpectedPointError = 0;
	for ( const expectedPoint of expectedPointsByKey.values() ) {
		let closestError = Number.POSITIVE_INFINITY;
		for ( const actualPoint of actualPointsByKey.values() ) {
			closestError = Math.min(
				closestError,
				Math.max(
					Math.abs( actualPoint[ 0 ] - expectedPoint[ 0 ] ),
					Math.abs( actualPoint[ 1 ] - expectedPoint[ 1 ] ),
					Math.abs( actualPoint[ 2 ] - expectedPoint[ 2 ] )
				)
			);
		}
		maximumExpectedPointError = Math.max(
			maximumExpectedPointError,
			closestError
		);
	}
	let maximumActualPointError = 0;
	for ( const actualPoint of actualPointsByKey.values() ) {
		let closestError = Number.POSITIVE_INFINITY;
		for ( const expectedPoint of expectedPointsByKey.values() ) {
			closestError = Math.min(
				closestError,
				Math.max(
					Math.abs( actualPoint[ 0 ] - expectedPoint[ 0 ] ),
					Math.abs( actualPoint[ 1 ] - expectedPoint[ 1 ] ),
					Math.abs( actualPoint[ 2 ] - expectedPoint[ 2 ] )
				)
			);
		}
		maximumActualPointError = Math.max(
			maximumActualPointError,
			closestError
		);
	}
	const surfaceMatches =
		maximumOutsidePlaneDistance <= actual.planeTolerance &&
		maximumExpectedPointError <= actual.pointTolerance;
	const referenceVerticesMatch =
		maximumExpectedPointError <= actual.pointTolerance;
	const countsMatch = actual.faces.length === expected.faces.length;
	return {
		status: ( allowReferenceVertexCoverage && referenceVerticesMatch ) ||
			( countsMatch && surfaceMatches )
			? 'match'
			: countsMatch
				? 'value-mismatch'
				: 'count-mismatch',
		actualCount: actual.faces.length,
		expectedCount: expected.faces.length,
		matchedFaceCount: countsMatch && surfaceMatches
			? actual.faces.length
			: matchedFaceCount,
		directFaceMatchCount: matchedFaceCount,
		unmatchedActualCount: countsMatch && surfaceMatches ? 0 : unmatchedActualCount,
		unmatchedExpectedCount: countsMatch && surfaceMatches ? 0 : unmatchedExpectedCount,
		maximumPointError,
		maximumPlaneError,
		minimumNormalDot,
		maximumOutsidePlaneDistance,
		maximumExpectedPointError,
		maximumActualPointError,
		equivalence: allowReferenceVertexCoverage
			? 'Open Brush surface vertices covered; additional decomposition permitted'
			: 'polygon face count and convex surface',
		pointTolerance: actual.pointTolerance,
		planeTolerance: actual.planeTolerance,
		normalDotTolerance: actual.normalDotTolerance
	};
}

function compareExactArray( actual, expected ) {
	if ( actual.length !== expected.length ) {
		return {
			status: 'count-mismatch',
			actualCount: actual.length,
			expectedCount: expected.length
		};
	}
	for ( let index = 0; index < actual.length; index += 1 ) {
		if ( actual[ index ] !== expected[ index ] ) {
			return {
				status: 'value-mismatch',
				actualCount: actual.length,
				expectedCount: expected.length,
				firstMismatch: index,
				actual: actual[ index ],
				expected: expected[ index ]
			};
		}
	}
	return {
		status: 'match',
		actualCount: actual.length,
		expectedCount: expected.length
	};
}

function compareFloatArray( actual, expected, tolerance ) {
	if ( actual.length !== expected.length ) {
		return {
			status: 'count-mismatch',
			actualCount: actual.length,
			expectedCount: expected.length
		};
	}
	let maximumError = 0;
	let maximumErrorIndex = 0;
	let firstMismatch = -1;
	for ( let index = 0; index < actual.length; index += 1 ) {
		// Unity mesh attributes are Float32 values. JsonUtility writes their
		// shortest round-trippable decimal representation, which JavaScript
		// otherwise parses as a Float64 value and can move a comparison across
		// the tolerance boundary at larger magnitudes.
		const expectedFloat = Math.fround( expected[ index ] );
		const error = Math.abs( actual[ index ] - expectedFloat );
		if ( ! Number.isFinite( error ) ) {
			return {
				status: 'non-finite',
				actualCount: actual.length,
				expectedCount: expected.length,
				maximumError: error,
				maximumErrorIndex: index
			};
		}
		if ( error > maximumError ) {
			maximumError = error;
			maximumErrorIndex = index;
		}
		if ( firstMismatch === -1 && error > tolerance ) {
			firstMismatch = index;
		}
	}
	const result = {
		status: maximumError <= tolerance ? 'match' : 'value-mismatch',
		actualCount: actual.length,
		expectedCount: expected.length,
		maximumError,
		maximumErrorIndex,
		actual: actual[ maximumErrorIndex ],
		expected: Math.fround( expected[ maximumErrorIndex ] )
	};
	if ( firstMismatch !== -1 ) {
		result.firstMismatch = firstMismatch;
		result.firstMismatchActual = actual[ firstMismatch ];
		result.firstMismatchExpected = Math.fround( expected[ firstMismatch ] );
	}
	return result;
}

function compareAttribute( actual, expected, tolerance ) {
	if ( expected === undefined ) return { status: 'not-present-in-reference' };
	if ( actual === undefined ) {
		return {
			status: 'missing',
			expectedCount: expected.data.length,
			expectedItemSize: expected.itemSize
		};
	}
	if ( actual.itemSize !== expected.itemSize ) {
		return {
			status: 'item-size-mismatch',
			actualItemSize: actual.itemSize,
			expectedItemSize: expected.itemSize,
			actualCount: actual.data.length,
			expectedCount: expected.data.length
		};
	}
	return {
		...compareFloatArray( actual.data, expected.data, tolerance ),
		itemSize: actual.itemSize
	};
}

function compareStroke(
	fixtureStroke,
	record,
	strokeIndex,
	tolerance,
	unitScale,
	handedness
) {
	const family = resolveGeometryFamily( record );
	if ( ! family ) {
		return {
			strokeIndex,
			status: 'configuration-error',
			error: `Unsupported generator mapping ${record.generatorClass ?? record.generatorFamily ?? 'unknown'}.`
		};
	}
	const stroke = createStroke(
		fixtureStroke.input,
		strokeIndex,
		unitScale,
		handedness
	);
	const geometry = generateBrushGeometry(
		stroke,
		family,
		createGeometryOptions()
	);
	const actual = actualChannels( geometry );
	const expected = normalizeReferenceMesh(
		fixtureStroke.live,
		unitScale,
		handedness
	);
	const usesPolygonFaces =
		( family === 'hull' || family === 'concave-hull' ) &&
		fixtureStroke.polygonFaces?.faces !== undefined;
	const polygonFaces = usesPolygonFaces
		? comparePolygonFaces(
			geometry,
			fixtureStroke.polygonFaces,
			unitScale,
			handedness,
			tolerance,
			family === 'concave-hull'
		)
		: undefined;
	const channels = {};
	for ( const [ fixtureName ] of CHANNELS ) {
		channels[ fixtureName ] = usesPolygonFaces
			? { status: 'not-compared-for-polygonal-hull' }
			: compareAttribute(
				actual[ fixtureName ],
				expected.attributes[ fixtureName ],
				tolerance
			);
	}
	const indices = usesPolygonFaces
		? { status: 'replaced-by-polygon-faces' }
		: compareExactArray( geometry.indices, expected.indices );
	const isEmpty = geometry.positions.length === 0 && fixtureStroke.live.vertexCount === 0;
	const bounds = isEmpty
		? { status: 'empty' }
		: compareFloatArray(
			[ ...geometry.bounds.min, ...geometry.bounds.max ],
			[ ...expected.bounds.min, ...expected.bounds.max ],
			tolerance
		);
	const comparedChannels = Object.values( channels ).filter( ( channel ) =>
		channel.status !== 'not-present-in-reference' &&
		channel.status !== 'not-compared-for-polygonal-hull'
	);
	const passed = ( usesPolygonFaces
		? polygonFaces.status === 'match'
		: indices.status === 'match' &&
			comparedChannels.every( ( channel ) => channel.status === 'match' ) ) &&
		( bounds.status === 'match' || bounds.status === 'empty' );
	return {
		strokeIndex,
		status: passed ? 'match' : 'mismatch',
		family,
		generatorClass: record.generatorClass,
		vertexCount: {
			actual: geometry.positions.length / 3,
			expected: fixtureStroke.live.vertexCount
		},
		indexCount: {
			actual: geometry.indices.length,
			expected: fixtureStroke.live.indexCount
		},
		indices,
		polygonFaces,
		channels,
		bounds,
		warning: geometry.warning
	};
}

async function loadJson( file ) {
	return JSON.parse( await readFile( file, 'utf8' ) );
}

async function compareFixtures( options ) {
	const fixtureFiles = ( await readdir( options.fixtures, { withFileTypes: true } ) )
		.filter( ( entry ) => entry.isFile() && entry.name.endsWith( '.mesh.json' ) )
		.map( ( entry ) => entry.name )
		.sort( ( left, right ) => left.localeCompare( right ) );
	if ( fixtureFiles.length === 0 ) {
		throw new Error( 'Fixture directory contains no .mesh.json files.' );
	}

	const brushes = [];
	for ( const file of fixtureFiles ) {
		const fixture = await loadJson( path.join( options.fixtures, file ) );
		if ( fixture.schemaVersion !== 1 ) {
			brushes.push( {
				file,
				brushGuid: fixture.brushGuid,
				durableName: fixture.durableName,
				status: 'fixture-error',
				error: `Unsupported schema version ${fixture.schemaVersion}.`
			} );
			continue;
		}
		const record = getOpenBrushGeometryDefaults( fixture.brushGuid );
		if ( ! record ) {
			brushes.push( {
				file,
				brushGuid: fixture.brushGuid,
				durableName: fixture.durableName,
				status: 'configuration-error',
				error: 'Brush GUID is absent from three-tiltloader defaults.'
			} );
			continue;
		}
		const strokes = fixture.strokes.map( ( stroke, strokeIndex ) =>
			compareStroke(
				stroke,
				record,
				strokeIndex,
				options.tolerance,
				options.unitScale,
				options.handedness
			)
		);
		brushes.push( {
			file,
			brushGuid: fixture.brushGuid,
			durableName: fixture.durableName,
			status: strokes.every( ( stroke ) => stroke.status === 'match' )
				? 'match'
				: strokes.some( ( stroke ) => stroke.status === 'configuration-error' )
					? 'configuration-error'
					: 'mismatch',
			strokes
		} );
	}
	const counts = brushes.reduce( ( summary, brush ) => {
		summary[ brush.status ] = ( summary[ brush.status ] ?? 0 ) + 1;
		return summary;
	}, {} );
	return {
		schemaVersion: 1,
		comparison: 'Open Brush finalized live mesh vs three-tiltloader generator',
		coordinateHandling: options.handedness === 'unity-to-three'
			? 'Uniform Open Brush unit conversion and Unity-to-Three handedness conversion'
			: 'Uniform Open Brush unit conversion; no handedness conversion',
		unitScale: options.unitScale,
		handedness: options.handedness,
		tolerance: options.tolerance,
		counts: {
			total: brushes.length,
			match: counts.match ?? 0,
			mismatch: counts.mismatch ?? 0,
			configurationError: counts[ 'configuration-error' ] ?? 0,
			fixtureError: counts[ 'fixture-error' ] ?? 0
		},
		brushes
	};
}

function compactStatus( comparison ) {
	if ( ! comparison ) return '-';
	switch ( comparison.status ) {
		case 'match':
			return comparison.maximumError === undefined
				? 'match'
				: comparison.maximumError.toExponential( 2 );
		case 'value-mismatch':
			return comparison.maximumError === undefined
				? 'value'
				: `!${comparison.maximumError.toExponential( 2 )}`;
		case 'count-mismatch':
			return `${comparison.actualCount}/${comparison.expectedCount}`;
		case 'not-present-in-reference':
		case 'empty':
			return '-';
		case 'replaced-by-polygon-faces':
			return 'faces';
		case 'not-compared-for-polygonal-hull':
			return '-';
		default:
			return comparison.status;
	}
}

function formatTextReport( report ) {
	const lines = [
		'Open Brush live-mesh comparison',
		`Fixtures: ${report.counts.total}`,
		`Matches: ${report.counts.match}`,
		`Mismatches: ${report.counts.mismatch}`,
		`Configuration errors: ${report.counts.configurationError}`,
		`Fixture errors: ${report.counts.fixtureError}`,
		`Float tolerance: ${report.tolerance}`,
		`Open Brush unit scale: ${report.unitScale}`,
		`Handedness: ${report.handedness}`,
		'',
		'Brush\tFamily\tVertices actual/reference\tIndices actual/reference\tTopology\tPosition\tNormal\tTangent\tColor\tUV0\tUV1\tBounds'
	];
	for ( const brush of report.brushes ) {
		if ( ! brush.strokes ) {
			lines.push( `${brush.durableName}\t-\t-\t-\t${brush.status}: ${brush.error}` );
			continue;
		}
		for ( const stroke of brush.strokes ) {
			if ( stroke.status === 'configuration-error' ) {
				lines.push( `${brush.durableName}\t-\t-\t-\tconfiguration-error: ${stroke.error}` );
				continue;
			}
			lines.push( [
				brush.durableName,
				stroke.family,
				`${stroke.vertexCount.actual}/${stroke.vertexCount.expected}`,
				`${stroke.indexCount.actual}/${stroke.indexCount.expected}`,
				stroke.polygonFaces
					? stroke.polygonFaces.status === 'match'
						? `match (${stroke.polygonFaces.actualCount} faces)`
						: `!${stroke.polygonFaces.actualCount}/${stroke.polygonFaces.expectedCount} faces; ${stroke.polygonFaces.matchedFaceCount} matched`
					: compactStatus( stroke.indices ),
				compactStatus( stroke.channels.position ),
				compactStatus( stroke.channels.normal ),
				compactStatus( stroke.channels.tangent ),
				compactStatus( stroke.channels.color ),
				compactStatus( stroke.channels.texcoord0 ),
				compactStatus( stroke.channels.texcoord1 ),
				compactStatus( stroke.bounds )
			].join( '\t' ) );
		}
	}
	return `${lines.join( '\n' )}\n`;
}

async function main() {
	const options = parseArguments( process.argv.slice( 2 ) );
	if ( options.help ) {
		process.stdout.write( `${usage()}\n` );
		return;
	}
	const report = await compareFixtures( options );
	const output = options.format === 'json'
		? `${JSON.stringify( report, null, 2 )}\n`
		: formatTextReport( report );
	if ( options.output ) {
		await writeFile( options.output, output, 'utf8' );
		process.stdout.write( `Wrote ${options.output}\n` );
	} else {
		process.stdout.write( output );
	}
}

main().catch( ( error ) => {
	process.stderr.write( `${error.message}\n\n${usage()}\n` );
	process.exitCode = 1;
} );
