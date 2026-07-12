import { BufferGeometry } from 'three';

export type Vec3 = readonly [number, number, number];
export type Quat = readonly [number, number, number, number];
export type Rgba = readonly [number, number, number, number];

export interface ControlPoint {
    position: Vec3;
    orientation: Quat;
    pressure: number;
    timestampMs: number;
}

export interface StrokeInput {
    brushGuid: string;
    color: Rgba;
    brushSize: number;
    brushScale: number;
    controlPoints: readonly ControlPoint[];
    flags: number;
    seed: number;
    groupId: number;
    strokeGuid: string;
    layerIndex: number;
}

export type GeometryAttributeArray = Float32Array | Int8Array | Uint8Array |
    Int16Array | Uint16Array | Int32Array | Uint32Array;

export interface GeometryAttribute {
    array: GeometryAttributeArray;
    itemSize: number;
    normalized?: boolean;
}

export interface GeometryGroup {
    start: number;
    count: number;
    materialIndex?: number;
}

export interface GeometryBounds {
    min: Vec3;
    max: Vec3;
}

export interface GeometryResult {
    attributes: Readonly<Record<string, GeometryAttribute>>;
    index?: Uint16Array | Uint32Array;
    groups?: readonly GeometryGroup[];
    drawRange?: Readonly<{ start: number; count: number }>;
    bounds?: GeometryBounds;
    warning?: string;
}

export function createBufferGeometry(
    result: GeometryResult,
    target?: BufferGeometry,
): BufferGeometry;
