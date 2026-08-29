import type {
  BrushGeometryFamily,
  BrushGeometryParams,
  BrushPressureOpacityRange,
  BrushPressureSizeRange,
} from "./brush-types.js";

export interface BrushGeometryDefaults {
  family: BrushGeometryFamily;
  generatorClass: string;
  pressureSizeRange?: BrushPressureSizeRange;
  pressureOpacityRange?: BrushPressureOpacityRange;
  geometryParams: BrushGeometryParams;
}

/** Returns the standard Open Brush geometry configuration for a brush GUID. */
export function getOpenBrushGeometryDefaults(
  brushGuid: string,
): BrushGeometryDefaults | undefined;
