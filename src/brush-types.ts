export type BrushPressureSizeRange = readonly [number, number];
export type BrushPressureOpacityRange = readonly [number, number];

export type BrushGeometryFamily =
  | "ribbon"
  | "tube"
  | "thick-strip"
  | "hull"
  | "concave-hull"
  | "print3d"
  | "emissive"
  | "particle"
  | "unsupported";

export interface BrushGeometryParams {
  brushSizeRange?: readonly [number, number];
  tileRate?: number;
  textureAtlasV?: number;
  renderBackfaces?: boolean;
  backfaceHueShift?: number;
  tubeStoreRadiusInTexcoord0Z?: boolean;
  tubeCapAspect?: number;
  tubeSideCount?: number;
  tubeEndCaps?: boolean;
  tubeHardEdges?: boolean;
  tubeUvStyle?: "distance" | "stretch";
  tubeShapeModifier?: number;
  tubeTaperScalar?: number;
  tubePetalDisplacementAmount?: number;
  tubePetalDisplacementExponent?: number;
  tubeBreakAngleMultiplier?: number;
  ribbonUvStyle?: "distance" | "stretch";
  ribbonOffsetInTexcoord1?: boolean;
  opacity?: number;
  solidMinLengthMeters?: number;
  audioReactive?: boolean;
  colorLuminanceMin?: number;
  colorSaturationMax?: number;
  particleRate?: number;
  sprayRateMultiplier?: number;
  particleSpeed?: number;
  particleInitialRotationRange?: number;
  particleRandomizeAlpha?: boolean;
  particleSizeVariance?: number;
  particlePositionVariance?: number;
  particleRotationVariance?: number;
  particleSizeRatio?: [number, number];
  hullFaceted?: boolean;
}
