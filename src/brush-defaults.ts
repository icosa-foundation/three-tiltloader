import type {
  BrushGeometryFamily,
  BrushGeometryParams,
  BrushPressureOpacityRange,
  BrushPressureSizeRange,
} from "./brush-types.js";
import { OPEN_BRUSH_GEOMETRY_DEFAULTS } from "./open-brush-defaults.generated.ts";

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
): BrushGeometryDefaults | undefined {
  return OPEN_BRUSH_GEOMETRY_DEFAULTS[
    brushGuid.toLowerCase() as keyof typeof OPEN_BRUSH_GEOMETRY_DEFAULTS
  ];
}
