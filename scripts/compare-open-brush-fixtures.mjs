import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

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
		'  npm run compare:open-brush-fixtures -- --fixtures <directory> --brush-assets <file> [options]',
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
		brushAssets: undefined,
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
			case '--brush-assets':
				options.brushAssets = value;
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
	if ( ! options.brushAssets ) throw new Error( '--brush-assets is required.' );
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
	if ( record.generatorClass === 'SquareBrush' ) return 'tube';
	if ( record.generatorClass === 'Square3DPrintBrush' ) return 'print3d';
	if ( record.generatorClass === 'ConcaveHullBrush' ) return 'concave-hull';
	switch ( record.generatorFamily ) {
		case 'ribbon':
		case 'tube':
		case 'particle':
		case 'thick-strip':
		case 'hull':
		case 'print3d':
			return record.generatorFamily;
		default:
			return undefined;
	}
}

function createGeometryOptions( record ) {
	const geometry = record.geometry ?? {};
	const {
		pressureSizeRange,
		pressureOpacityRange,
		...geometryParams
	} = geometry;
	return {
		pressureSizeRange,
		pressureOpacityRange,
		geometryParams,
		generatorClass: record.generatorClass,
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
		const error = Math.abs( actual[ index ] - expected[ index ] );
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
		expected: expected[ maximumErrorIndex ]
	};
	if ( firstMismatch !== -1 ) {
		result.firstMismatch = firstMismatch;
		result.firstMismatchActual = actual[ firstMismatch ];
		result.firstMismatchExpected = expected[ firstMismatch ];
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
		createGeometryOptions( record )
	);
	const actual = actualChannels( geometry );
	const expected = normalizeReferenceMesh(
		fixtureStroke.live,
		unitScale,
		handedness
	);
	const channels = {};
	for ( const [ fixtureName ] of CHANNELS ) {
		channels[ fixtureName ] = compareAttribute(
			actual[ fixtureName ],
			expected.attributes[ fixtureName ],
			tolerance
		);
	}
	const indices = compareExactArray( geometry.indices, expected.indices );
	const isEmpty = geometry.positions.length === 0 && fixtureStroke.live.vertexCount === 0;
	const bounds = isEmpty
		? { status: 'empty' }
		: compareFloatArray(
			[ ...geometry.bounds.min, ...geometry.bounds.max ],
			[ ...expected.bounds.min, ...expected.bounds.max ],
			tolerance
		);
	const comparedChannels = Object.values( channels ).filter(
		( channel ) => channel.status !== 'not-present-in-reference'
	);
	const passed = indices.status === 'match' &&
		( bounds.status === 'match' || bounds.status === 'empty' ) &&
		comparedChannels.every( ( channel ) => channel.status === 'match' );
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
		channels,
		bounds,
		warning: geometry.warning
	};
}

async function loadJson( file ) {
	return JSON.parse( await readFile( file, 'utf8' ) );
}

async function compareFixtures( options ) {
	const brushAssetDocument = await loadJson( options.brushAssets );
	const brushAssets = brushAssetDocument.brushes;
	if ( ! brushAssets || typeof brushAssets !== 'object' ) {
		throw new Error( 'Brush assets file must contain a "brushes" object.' );
	}
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
		const record = brushAssets[ fixture.brushGuid.toLowerCase() ];
		if ( ! record ) {
			brushes.push( {
				file,
				brushGuid: fixture.brushGuid,
				durableName: fixture.durableName,
				status: 'configuration-error',
				error: 'Brush GUID is absent from the supplied brush assets.'
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
				compactStatus( stroke.indices ),
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
