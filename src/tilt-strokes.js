const SKETCH_SENTINEL = 0xc576a5cd;
const MIN_SKETCH_VERSION = 5;
const MAX_SKETCH_VERSION = 6;
const ZERO_GUID = '00000000-0000-0000-0000-000000000000';

const STROKE_FLAGS = 1 << 0;
const STROKE_SCALE = 1 << 1;
const STROKE_GROUP = 1 << 2;
const STROKE_SEED = 1 << 3;
const STROKE_LAYER = 1 << 4;
const STROKE_SINGLE_WORD_MASK = 0xffff;

const CONTROL_POINT_PRESSURE = 1 << 0;
const CONTROL_POINT_TIMESTAMP = 1 << 1;

export function readTiltStrokeData( bytes, brushGuids ) {

	const reader = new SketchReader( bytes );
	const sentinel = reader.readUint32();
	if ( sentinel !== SKETCH_SENTINEL ) {

		throw new Error( 'Invalid Open Brush sketch memory: bad sentinel.' );

	}

	const version = reader.readInt32();
	if ( version < MIN_SKETCH_VERSION || version > MAX_SKETCH_VERSION ) {

		throw new Error( `Unsupported Open Brush sketch memory version: ${version}.` );

	}

	reader.readInt32();
	reader.skip( reader.readUint32() );
	const strokeCount = reader.readInt32();
	if ( strokeCount < 0 ) {

		throw new Error( `Invalid Open Brush sketch memory stroke count: ${strokeCount}.` );

	}

	const strokes = [];
	for ( let strokeIndex = 0; strokeIndex < strokeCount; strokeIndex ++ ) {

		const brushIndex = reader.readInt32();
		const brushGuid = normalizeGuid( brushGuids[ brushIndex ] );
		const color = [
			reader.readFloat32(),
			reader.readFloat32(),
			reader.readFloat32(),
			reader.readFloat32()
		];
		const brushSize = reader.readFloat32();
		const strokeExtensionMask = reader.readUint32();
		const controlPointExtensionMask = reader.readUint32();
		const stroke = {
			guid: `${ZERO_GUID.slice( 0, -8 )}${strokeIndex.toString( 16 ).padStart( 8, '0' )}`,
			brushGuid,
			brushSize,
			brushScale: 1,
			color,
			controlPoints: [],
			flags: 0,
			seed: 0,
			groupId: 0,
			layerIndex: 0
		};

		forEachSetBit( strokeExtensionMask, ( bit ) => {

			switch ( bit ) {

				case STROKE_FLAGS:
					stroke.flags = reader.readUint32();
					break;
				case STROKE_SCALE:
					stroke.brushScale = reader.readFloat32();
					break;
				case STROKE_GROUP:
					stroke.groupId = reader.readUint32();
					break;
				case STROKE_SEED:
					stroke.seed = reader.readInt32();
					break;
				case STROKE_LAYER:
					stroke.layerIndex = reader.readUint32();
					break;
				default:
					skipUnknownStrokeExtension( reader, bit );

			}

		} );

		const controlPointCount = reader.readInt32();
		if ( controlPointCount < 0 ) {

			throw new Error(
				`Invalid Open Brush control point count at stroke ${strokeIndex}: ${controlPointCount}.`
			);

		}
		if ( controlPointCount > reader.remainingBytes / 28 ) {

			throw new Error(
				`Open Brush stroke ${strokeIndex} declares ${controlPointCount} control points beyond the available data.`
			);

		}

		for ( let pointIndex = 0; pointIndex < controlPointCount; pointIndex ++ ) {

			const controlPoint = {
				position: [ reader.readFloat32(), reader.readFloat32(), reader.readFloat32() ],
				orientation: [
					reader.readFloat32(),
					reader.readFloat32(),
					reader.readFloat32(),
					reader.readFloat32()
				],
				pressure: 1,
				timestampMs: 0
			};
			forEachSetBit( controlPointExtensionMask, ( bit ) => {

				switch ( bit ) {

					case CONTROL_POINT_PRESSURE:
						controlPoint.pressure = reader.readFloat32();
						break;
					case CONTROL_POINT_TIMESTAMP:
						controlPoint.timestampMs = reader.readUint32();
						break;
					default:
						reader.readInt32();

				}

			} );
			stroke.controlPoints.push( controlPoint );

		}

		strokes.push( stroke );

	}

	return strokes;

}

function normalizeGuid( value ) {

	return typeof value === 'string' ? value.toLowerCase() : ZERO_GUID;

}

function skipUnknownStrokeExtension( reader, bit ) {

	if ( ( bit & STROKE_SINGLE_WORD_MASK ) !== 0 ) {

		reader.readUint32();
		return;

	}

	reader.skip( reader.readUint32() );

}

function forEachSetBit( mask, visit ) {

	for ( let fields = mask >>> 0; fields !== 0; fields &= fields - 1 ) {

		visit( fields & ~ ( fields - 1 ) );

	}

}

class SketchReader {

	constructor( bytes ) {

		this.view = new DataView( bytes.buffer, bytes.byteOffset, bytes.byteLength );
		this.offset = 0;

	}

	get remainingBytes() {

		return this.view.byteLength - this.offset;

	}

	readFloat32() {

		this.requireBytes( 4 );
		const value = this.view.getFloat32( this.offset, true );
		this.offset += 4;
		return value;

	}

	readInt32() {

		this.requireBytes( 4 );
		const value = this.view.getInt32( this.offset, true );
		this.offset += 4;
		return value;

	}

	readUint32() {

		this.requireBytes( 4 );
		const value = this.view.getUint32( this.offset, true );
		this.offset += 4;
		return value;

	}

	skip( byteCount ) {

		this.requireBytes( byteCount );
		this.offset += byteCount;

	}

	requireBytes( byteCount ) {

		if ( ! Number.isInteger( byteCount ) || byteCount < 0 || byteCount > this.remainingBytes ) {

			throw new Error( 'Unexpected end of Open Brush sketch memory.' );

		}

	}

}
