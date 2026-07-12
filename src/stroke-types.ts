export type Vec3 = [number, number, number];
export type Quat = [number, number, number, number];
export type Rgba = [number, number, number, number];

export const enum StrokeFlags {
  None = 0,
  Deprecated1 = 1 << 0,
  IsGroupContinue = 1 << 1,
}

export const enum StrokeExtension {
  MaskSingleWord = 0xffff,
  None = 0,
  Flags = 1 << 0,
  Scale = 1 << 1,
  Group = 1 << 2,
  Seed = 1 << 3,
  Layer = 1 << 4,
}

export const enum ControlPointExtension {
  None = 0,
  Pressure = 1 << 0,
  Timestamp = 1 << 1,
}

export const CONTROL_POINT_EXTENSION_MASK =
  ControlPointExtension.Pressure | ControlPointExtension.Timestamp;

export const CONTROL_POINT_BINARY_SIZE_BYTES = 36;

export interface ControlPoint {
  position: Vec3;
  orientation: Quat;
  pressure: number;
  timestampMs: number;
}

export interface StrokeData {
  color: Rgba;
  brushGuid: string;
  brushSize: number;
  brushScale: number;
  controlPoints: ControlPoint[];
  flags: StrokeFlags;
  seed: number;
  groupId: number;
  guid: string;
  layerIndex: number;
}

export function createEmptyStrokeData(overrides: Partial<StrokeData>): StrokeData {
  return {
    color: [1, 1, 1, 1],
    brushGuid: "00000000-0000-0000-0000-000000000000",
    brushSize: 1,
    brushScale: 1,
    controlPoints: [],
    flags: StrokeFlags.None,
    seed: 0,
    groupId: 0,
    guid: "00000000-0000-0000-0000-000000000000",
    layerIndex: 0,
    ...overrides,
  };
}
