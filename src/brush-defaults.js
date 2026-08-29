import { OPEN_BRUSH_GEOMETRY_DEFAULTS } from "./open-brush-defaults.generated.js";

/** Returns the standard Open Brush geometry configuration for a brush GUID. */
export function getOpenBrushGeometryDefaults(brushGuid) {
  return OPEN_BRUSH_GEOMETRY_DEFAULTS[brushGuid.toLowerCase()];
}
