import type {
  BrushGeometryParams,
  BrushGeometryFamily,
  BrushPressureOpacityRange,
  BrushPressureSizeRange,
} from "./brush-types.js";
import { getOpenBrushGeometryDefaults } from "./brush-defaults.js";
import type { ControlPoint, Quat, Rgba, StrokeData, Vec3 } from "./stroke-types.js";

export interface BrushGeometryBounds {
  min: Vec3;
  max: Vec3;
}

export interface GeneratedBrushGeometry {
  family: BrushGeometryFamily;
  positions: Float32Array;
  normals: Float32Array;
  tangents: Float32Array;
  colors: Float32Array;
  uvs: Float32Array;
  uv0Size: 2 | 3 | 4;
  uv1Size: 0 | 3 | 4;
  packedUvs?: Float32Array;
  uv1?: Float32Array;
  indices: Uint32Array;
  bounds: BrushGeometryBounds;
  warning?: string;
}

export interface BrushGeometryOptions {
  pressureSizeRange?: BrushPressureSizeRange;
  pressureOpacityRange?: BrushPressureOpacityRange;
  geometryParams?: BrushGeometryParams;
  generatorClass?: string;
  deterministicBirthTime?: boolean;
  /** Number of leading preview knots already decayed from this stroke. */
  particleKnotIndexOffset?: number;
  /** Total local-space length removed from the head of a particle preview. */
  particleDistanceOffset?: number;
  /** Encode Genius birth times as negative for the preview-shrink shader path. */
  particlePreview?: boolean;
  /** Offset serialized/live particle birth times into the renderer's clock domain. */
  particleBirthTimeOffsetSeconds?: number;
  finalized?: boolean;
  lastControlPointIsKeeper?: boolean;
}

/** Applies the standard brush-GUID defaults, followed by per-call overrides. */
export function resolveBrushGeometryOptions(
  brushGuid: string,
  options: BrushGeometryOptions = {},
): BrushGeometryOptions {
  const defaults = getOpenBrushGeometryDefaults(brushGuid);
  if (!defaults) {
    return options;
  }
  return {
    ...options,
    pressureSizeRange: options.pressureSizeRange ?? defaults.pressureSizeRange,
    pressureOpacityRange:
      options.pressureOpacityRange ?? defaults.pressureOpacityRange,
    generatorClass: options.generatorClass ?? defaults.generatorClass,
    geometryParams: {
      ...defaults.geometryParams,
      ...options.geometryParams,
    },
  };
}

/**
 * Reusable geometry storage: stroke meshes rebuild every sampled frame while
 * drawing, so the arrays grow geometrically and are written in place instead
 * of being reallocated per sample (only vertexCount/indexCount entries are
 * meaningful; renderers bound drawing with setDrawRange).
 */
export interface BrushGeometryArrays {
  family: BrushGeometryFamily;
  positions: Float32Array;
  normals: Float32Array;
  tangents: Float32Array;
  colors: Float32Array;
  uvs: Float32Array;
  packedUvs: Float32Array;
  particleUvs: Float32Array;
  vectorUvs: Float32Array;
  uv1s: Float32Array;
  tubeBreakBefore: Uint8Array;
  tubeFrameRights: Float32Array;
  tubeFrameUps: Float32Array;
  tubeTangents: Float32Array;
  tubeRadii: Float32Array;
  tubeRingUs: Float32Array;
  tubeOpacities: Float32Array;
  tubeSmoothedPressures: Float32Array;
  tubeRetainedControlPoints: ControlPoint[];
  ribbonBreakBefore: Uint8Array;
  ribbonProvisionalSamples: Uint8Array;
  ribbonRunningLengths: Float32Array;
  ribbonSectionLengths: Float32Array;
  ribbonSmoothedPressures: Float32Array;
  quadStripRawPositions: Float32Array;
  quadStripRawNormals: Float32Array;
  quadStripPressuredSizes: Float32Array;
  ribbonPreviousRetained: Int32Array;
  ribbonNextRetained: Int32Array;
  geometrySmoothedPressures: Float32Array;
  geometrySmoothedPositions: Float32Array;
  uv0Size: 2 | 3 | 4;
  uv1Size: 0 | 3 | 4;
  indices: Uint32Array;
  vertexCount: number;
  indexCount: number;
  bounds: BrushGeometryBounds;
  warning?: string;
}

const DEFAULT_PRESSURE_SIZE_MIN = 0.1;
const INITIAL_VERTEX_CAPACITY = 256;
const INITIAL_INDEX_CAPACITY = 1024;

export function createBrushGeometryArrays(): BrushGeometryArrays {
  return {
    family: "ribbon",
    positions: new Float32Array(INITIAL_VERTEX_CAPACITY * 3),
    normals: new Float32Array(INITIAL_VERTEX_CAPACITY * 3),
    tangents: new Float32Array(INITIAL_VERTEX_CAPACITY * 4),
    colors: new Float32Array(INITIAL_VERTEX_CAPACITY * 4),
    uvs: new Float32Array(INITIAL_VERTEX_CAPACITY * 2),
    packedUvs: new Float32Array(INITIAL_VERTEX_CAPACITY * 3),
    particleUvs: new Float32Array(INITIAL_VERTEX_CAPACITY * 4),
    vectorUvs: new Float32Array(INITIAL_VERTEX_CAPACITY * 3),
    uv1s: new Float32Array(INITIAL_VERTEX_CAPACITY * 4),
    tubeBreakBefore: new Uint8Array(INITIAL_VERTEX_CAPACITY),
    tubeFrameRights: new Float32Array(INITIAL_VERTEX_CAPACITY * 3),
    tubeFrameUps: new Float32Array(INITIAL_VERTEX_CAPACITY * 3),
    tubeTangents: new Float32Array(INITIAL_VERTEX_CAPACITY * 3),
    tubeRadii: new Float32Array(INITIAL_VERTEX_CAPACITY),
    tubeRingUs: new Float32Array(INITIAL_VERTEX_CAPACITY),
    tubeOpacities: new Float32Array(INITIAL_VERTEX_CAPACITY),
    tubeSmoothedPressures: new Float32Array(INITIAL_VERTEX_CAPACITY),
    tubeRetainedControlPoints: [],
    ribbonBreakBefore: new Uint8Array(INITIAL_VERTEX_CAPACITY),
    ribbonProvisionalSamples: new Uint8Array(INITIAL_VERTEX_CAPACITY),
    ribbonRunningLengths: new Float32Array(INITIAL_VERTEX_CAPACITY),
    ribbonSectionLengths: new Float32Array(INITIAL_VERTEX_CAPACITY),
    ribbonSmoothedPressures: new Float32Array(INITIAL_VERTEX_CAPACITY),
    quadStripRawPositions: new Float32Array(INITIAL_VERTEX_CAPACITY * 18),
    quadStripRawNormals: new Float32Array(INITIAL_VERTEX_CAPACITY * 18),
    quadStripPressuredSizes: new Float32Array(INITIAL_VERTEX_CAPACITY),
    ribbonPreviousRetained: new Int32Array(INITIAL_VERTEX_CAPACITY),
    ribbonNextRetained: new Int32Array(INITIAL_VERTEX_CAPACITY),
    geometrySmoothedPressures: new Float32Array(INITIAL_VERTEX_CAPACITY),
    geometrySmoothedPositions: new Float32Array(INITIAL_VERTEX_CAPACITY * 3),
    uv0Size: 2,
    uv1Size: 0,
    indices: new Uint32Array(INITIAL_INDEX_CAPACITY),
    vertexCount: 0,
    indexCount: 0,
    bounds: createEmptyBounds(),
  };
}

/** Grows storage to fit the given counts; returns true when reallocated. */
function ensureGeometryCapacity(
  out: BrushGeometryArrays,
  vertexCount: number,
  indexCount: number,
): boolean {
  const currentVertexCapacity = out.positions.length / 3;
  const currentIndexCapacity = out.indices.length;
  if (vertexCount <= currentVertexCapacity && indexCount <= currentIndexCapacity) {
    return false;
  }
  let vertexCapacity = Math.max(currentVertexCapacity, INITIAL_VERTEX_CAPACITY);
  while (vertexCapacity < vertexCount) {
    vertexCapacity *= 2;
  }
  let indexCapacity = Math.max(currentIndexCapacity, INITIAL_INDEX_CAPACITY);
  while (indexCapacity < indexCount) {
    indexCapacity *= 2;
  }
  out.positions = new Float32Array(vertexCapacity * 3);
  out.normals = new Float32Array(vertexCapacity * 3);
  out.tangents = new Float32Array(vertexCapacity * 4);
  out.colors = new Float32Array(vertexCapacity * 4);
  out.uvs = new Float32Array(vertexCapacity * 2);
  out.packedUvs = new Float32Array(vertexCapacity * 3);
  out.particleUvs = new Float32Array(vertexCapacity * 4);
  out.vectorUvs = new Float32Array(vertexCapacity * 3);
  out.uv1s = new Float32Array(vertexCapacity * 4);
  out.indices = new Uint32Array(indexCapacity);
  return true;
}

function ensureTubeScratchCapacity(
  out: BrushGeometryArrays,
  pointCount: number,
): void {
  if (pointCount <= out.tubeBreakBefore.length) {
    out.tubeBreakBefore.fill(0, 0, pointCount);
    return;
  }
  let capacity = Math.max(out.tubeBreakBefore.length, INITIAL_VERTEX_CAPACITY);
  while (capacity < pointCount) {
    capacity *= 2;
  }
  out.tubeBreakBefore = new Uint8Array(capacity);
  out.tubeFrameRights = new Float32Array(capacity * 3);
  out.tubeFrameUps = new Float32Array(capacity * 3);
  out.tubeTangents = new Float32Array(capacity * 3);
  out.tubeRadii = new Float32Array(capacity);
  out.tubeRingUs = new Float32Array(capacity);
  out.tubeOpacities = new Float32Array(capacity);
  out.tubeSmoothedPressures = new Float32Array(capacity);
}

function ensureRibbonScratchCapacity(
  out: BrushGeometryArrays,
  pointCount: number,
): void {
  if (pointCount > out.ribbonBreakBefore.length) {
    let capacity = Math.max(
      out.ribbonBreakBefore.length,
      INITIAL_VERTEX_CAPACITY,
    );
    while (capacity < pointCount) {
      capacity *= 2;
    }
    out.ribbonBreakBefore = new Uint8Array(capacity);
    out.ribbonProvisionalSamples = new Uint8Array(capacity);
    out.ribbonRunningLengths = new Float32Array(capacity);
    out.ribbonSectionLengths = new Float32Array(capacity);
    out.ribbonSmoothedPressures = new Float32Array(capacity);
    out.quadStripRawPositions = new Float32Array(capacity * 18);
    out.quadStripRawNormals = new Float32Array(capacity * 18);
    out.quadStripPressuredSizes = new Float32Array(capacity);
    out.ribbonPreviousRetained = new Int32Array(capacity);
    out.ribbonNextRetained = new Int32Array(capacity);
  } else {
    out.ribbonBreakBefore.fill(0, 0, pointCount);
    out.ribbonProvisionalSamples.fill(0, 0, pointCount);
    out.ribbonRunningLengths.fill(0, 0, pointCount);
    out.ribbonSectionLengths.fill(0, 0, pointCount);
    out.ribbonSmoothedPressures.fill(0, 0, pointCount);
    out.quadStripPressuredSizes.fill(0, 0, pointCount);
    out.ribbonPreviousRetained.fill(0, 0, pointCount);
    out.ribbonNextRetained.fill(0, 0, pointCount);
  }
}

function ensureGeometryPressureCapacity(
  out: BrushGeometryArrays,
  pointCount: number,
): void {
  if (pointCount <= out.geometrySmoothedPressures.length) {
    return;
  }
  let capacity = Math.max(
    out.geometrySmoothedPressures.length,
    INITIAL_VERTEX_CAPACITY,
  );
  while (capacity < pointCount) {
    capacity *= 2;
  }
  out.geometrySmoothedPressures = new Float32Array(capacity);
  out.geometrySmoothedPositions = new Float32Array(capacity * 3);
}

function resetBounds(bounds: BrushGeometryBounds): void {
  bounds.min[0] = Number.POSITIVE_INFINITY;
  bounds.min[1] = Number.POSITIVE_INFINITY;
  bounds.min[2] = Number.POSITIVE_INFINITY;
  bounds.max[0] = Number.NEGATIVE_INFINITY;
  bounds.max[1] = Number.NEGATIVE_INFINITY;
  bounds.max[2] = Number.NEGATIVE_INFINITY;
}

/**
 * Writes stroke geometry into reusable storage; returns true when the
 * backing arrays were reallocated (callers must rebind GPU attributes).
 */
export function generateBrushGeometryInto(
  stroke: StrokeData,
  family: BrushGeometryFamily,
  options: BrushGeometryOptions,
  out: BrushGeometryArrays,
): boolean {
  const resolvedOptions = resolveBrushGeometryOptions(stroke.brushGuid, options);
  out.warning = undefined;
  out.uv1Size = 0;
  resetBounds(out.bounds);
  switch (family) {
    case "ribbon":
      return generateRibbonGeometry(stroke, "ribbon", resolvedOptions, out);
    case "emissive":
      return generateRibbonGeometry(stroke, "emissive", resolvedOptions, out);
    case "tube":
      return generateTubeGeometry(stroke, resolvedOptions, out);
    case "thick-strip":
      return generateThickStripGeometry(stroke, resolvedOptions, out);
    case "hull":
      return generateHullGeometry(stroke, resolvedOptions, out);
    case "concave-hull":
      return generateConcaveHullGeometry(stroke, resolvedOptions, out);
    case "print3d":
      return generateSquare3DPrintGeometry(stroke, resolvedOptions, out);
    case "particle":
      return generateParticleGeometry(stroke, resolvedOptions, out);
    case "unsupported": {
      const reallocated = generateRibbonGeometry(
        stroke,
        "unsupported",
        resolvedOptions,
        out,
      );
      out.warning = "Unsupported brush geometry family; generated fallback ribbon.";
      return reallocated;
    }
  }
}

export function generateBrushGeometry(
  stroke: StrokeData,
  family: BrushGeometryFamily,
  options: BrushGeometryOptions = {},
): GeneratedBrushGeometry {
  const arrays = createBrushGeometryArrays();
  generateBrushGeometryInto(stroke, family, options, arrays);
  return {
    family: arrays.family,
    positions: arrays.positions.subarray(0, arrays.vertexCount * 3),
    normals: arrays.normals.subarray(0, arrays.vertexCount * 3),
    tangents: arrays.tangents.subarray(0, arrays.vertexCount * 4),
    colors: arrays.colors.subarray(0, arrays.vertexCount * 4),
    uvs: arrays.uvs.subarray(0, arrays.vertexCount * 2),
    uv0Size: arrays.uv0Size,
    uv1Size: arrays.uv1Size,
    packedUvs:
      arrays.uv0Size === 3
        ? arrays.packedUvs.subarray(0, arrays.vertexCount * 3)
        : arrays.uv0Size === 4
          ? arrays.particleUvs.subarray(0, arrays.vertexCount * 4)
          : undefined,
    uv1:
      arrays.uv1Size === 3
        ? arrays.vectorUvs.subarray(0, arrays.vertexCount * 3)
        : arrays.uv1Size === 4
          ? arrays.uv1s.subarray(0, arrays.vertexCount * 4)
          : undefined,
    indices: arrays.indices.subarray(0, arrays.indexCount),
    bounds: arrays.bounds,
    warning: arrays.warning,
  };
}

export function getGeneratedVertexCount(geometry: GeneratedBrushGeometry): number {
  return geometry.positions.length / 3;
}

export function getGeneratedIndexCount(geometry: GeneratedBrushGeometry): number {
  return geometry.indices.length;
}

function generateRibbonGeometry(
  stroke: StrokeData,
  family: BrushGeometryFamily,
  options: BrushGeometryOptions,
  out: BrushGeometryArrays,
): boolean {
  const storesRibbonWidth =
    options.geometryParams?.ribbonStoreWidthInTexcoord0Z === true;
  out.uv0Size = storesRibbonWidth ? 3 : 2;
  const hasVectorOffset =
    options.geometryParams?.ribbonOffsetInTexcoord1 === true;
  const usesFlatGeometrySmoothing = options.generatorClass === "FlatGeometryBrush";
  out.uv1Size = hasVectorOffset ? 3 : 0;
  if (options.generatorClass === "QuadStripUnitizedUVBrush") {
    return generateUnitizedRibbonGeometry(stroke, family, options, out);
  }
  const usesQuadStripTriangleSoup =
    options.generatorClass === "QuadStripBrushDistanceUV" ||
    options.generatorClass === "QuadStripBrushStretchUV";
  const pointCount = stroke.controlPoints.length;
  if (usesQuadStripTriangleSoup) {
    prepareQuadStripSections(stroke, options, out);
  } else if (usesFlatGeometrySmoothing) {
    prepareFlatGeometrySections(stroke, options, out);
  } else {
    prepareRibbonSections(stroke, out);
    prepareRibbonSmoothedPressures(stroke, options, out);
  }
  const renderPointCount = resolveRibbonRenderPointCount(
    pointCount,
    options,
    out.ribbonBreakBefore,
  );
  const frontVertexCount = renderPointCount * 2;
  const segmentCount = Math.max(0, renderPointCount - 1);
  const connectedSegmentCount = countConnectedRibbonSegments(
    out.ribbonBreakBefore,
    renderPointCount,
    usesQuadStripTriangleSoup,
  );
  const frontIndexCount = connectedSegmentCount * 6;
  const hasBackfaces = options.geometryParams?.renderBackfaces === true;
  const sourceVertexCount = frontVertexCount * (hasBackfaces ? 2 : 1);
  const vertexCount = usesQuadStripTriangleSoup
    ? frontIndexCount * (hasBackfaces ? 2 : 1)
    : sourceVertexCount;
  const indexCount = frontIndexCount * (hasBackfaces ? 2 : 1);
  const reallocated = ensureGeometryCapacity(
    out,
    vertexCount + (usesQuadStripTriangleSoup ? sourceVertexCount : 0),
    indexCount,
  );
  const {
    positions,
    normals,
    tangents,
    colors,
    uvs,
    vectorUvs,
    indices,
    bounds,
    ribbonBreakBefore,
    ribbonRunningLengths,
    ribbonSectionLengths,
    ribbonSmoothedPressures,
  } = out;
  const pressureSizeMin = normalizePressureSizeMin(options.pressureSizeRange?.[0]);
  const pressureOpacityMin = normalizePressureOpacityMin(
    options.pressureOpacityRange,
  );
  const pressureOpacityMax = normalizePressureOpacityMax(
    options.pressureOpacityRange,
  );
  const descriptorOpacity = normalizeDescriptorOpacity(
    options.geometryParams?.opacity,
  );
  const localBrushSize = getLocalBrushSize(stroke);
  const tileRate = normalizeTileRate(options.geometryParams?.tileRate);
  const usesDistanceUvs =
    options.generatorClass === "QuadStripBrushDistanceUV" ||
    options.geometryParams?.ribbonUvStyle === "distance";
  const atlasRows = normalizeAtlasRows(options.geometryParams?.textureAtlasV);
  let sectionRandom = statelessRandom01(
    stroke.seed,
    usesFlatGeometrySmoothing ? -1 : 0,
  );
  let atlasRow = usesDistanceUvs
    ? Math.floor(sectionRandom * 3331) % atlasRows
    : Math.floor(sectionRandom * atlasRows);
  let v0 = atlasRow / atlasRows;
  let v1 = (atlasRow + 1) / atlasRows;

  // Ribbon surface frames per Open Brush's ComputeSurfaceFrameNew
  // (BaseBrushScript.cs): the frame follows the pointer orientation and the
  // movement direction, disambiguated toward the previous right vector so the
  // strip never flips mid-stroke (the old XZ-planar offset twisted on coils).
  const previousRight: Vec3 = [0, 0, 0];
  const previousTangent: Vec3 = [0, 0, 0];
  const tangent: Vec3 = [0, 0, 0];
  const pointerForward: Vec3 = [0, 0, 0];
  const pointerUp: Vec3 = [0, 0, 0];
  const right: Vec3 = [0, 0, 0];
  const normal: Vec3 = [0, 0, 0];
  const previousFlatNormal: Vec3 = [0, 0, 0];
  const previousFlatCenter: Vec3 = [0, 0, 0];
  const previousFlatForward: Vec3 = [0, 0, 0];
  const flatEdge: Vec3 = [0, 0, 0];
  let previousFlatSize = 0;
  const flatHalfRights = usesFlatGeometrySmoothing
    ? new Float32Array(pointCount * 3)
    : undefined;
  let flatOpenBrushVertexCount = 0;
  let flatPreviousHasGeometry = false;
  let flatDistanceU = sectionRandom;

  for (let index = 0; index < renderPointCount; index += 1) {
    if (usesFlatGeometrySmoothing && ribbonBreakBefore[index] === 2) {
      continue;
    }
    const point = stroke.controlPoints[index];
    const previousPointIndex = usesFlatGeometrySmoothing
      ? out.ribbonPreviousRetained[index]
      : Math.max(0, index - 1);
    const nextPointIndex = usesFlatGeometrySmoothing
      ? out.ribbonNextRetained[index]
      : Math.min(pointCount - 1, index + 1);
    const previousPoint = stroke.controlPoints[previousPointIndex];
    const nextPoint = stroke.controlPoints[nextPointIndex];
    const startsFlatSection =
      usesFlatGeometrySmoothing &&
      index > 0 &&
      ribbonBreakBefore[index] === 0 &&
      !flatPreviousHasGeometry;
    const center: Vec3 =
      usesFlatGeometrySmoothing &&
      options.geometryParams?.m11Compatibility !== true &&
      index > 0
      ? [
          previousPoint.position[0] * 0.3 + point.position[0] * 0.4 + nextPoint.position[0] * 0.3,
          previousPoint.position[1] * 0.3 + point.position[1] * 0.4 + nextPoint.position[1] * 0.3,
          previousPoint.position[2] * 0.3 + point.position[2] * 0.4 + nextPoint.position[2] * 0.3,
        ]
      : point.position;
    if (ribbonBreakBefore[index] === 1 && !usesFlatGeometrySmoothing) {
      sectionRandom = statelessRandom01(stroke.seed, index);
      atlasRow = usesDistanceUvs
        ? Math.floor(sectionRandom * 3331) % atlasRows
        : Math.floor(sectionRandom * atlasRows);
      v0 = atlasRow / atlasRows;
      v1 = (atlasRow + 1) / atlasRows;
    }
    if (
      startsFlatSection
    ) {
      // GeometryBrush seeds each FlatGeometry UV section from the index just
      // before the first solid's Open Brush vertex range. Shared continuation
      // edges add two vertices per side; a fresh double-sided solid adds four.
      sectionRandom = statelessRandom01(
        stroke.seed,
        flatOpenBrushVertexCount === 0 || usesDistanceUvs
          ? flatOpenBrushVertexCount - 1
          : flatOpenBrushVertexCount,
      );
      atlasRow = usesDistanceUvs
        ? Math.floor(sectionRandom * 3331) % atlasRows
        : Math.floor(sectionRandom * atlasRows);
      v0 = atlasRow / atlasRows;
      v1 = (atlasRow + 1) / atlasRows;
      flatDistanceU = sectionRandom;
      const sectionStartVertex = previousPointIndex * 2;
      const sectionStartU = usesDistanceUvs ? sectionRandom : 0;
      writeUv(uvs, sectionStartVertex, [sectionStartU, v1]);
      writeUv(uvs, sectionStartVertex + 1, [sectionStartU, v0]);
    }
    let size =
      localBrushSize *
      getPressureSizeMultiplier(ribbonSmoothedPressures[index], pressureSizeMin);
    if (usesFlatGeometrySmoothing) {
      size =
        Math.fround(
          Math.fround(localBrushSize * OPEN_BRUSH_UNITS_PER_METER) *
            Math.fround(
              getPressureSizeMultiplierUnityFloat(
                ribbonSmoothedPressures[index],
                pressureSizeMin,
              ),
            ),
        ) / OPEN_BRUSH_UNITS_PER_METER;
    }
    const flatUvSize = size;

    if (usesFlatGeometrySmoothing) {
      const tangentStart =
        index === 0
          ? point.position
          : previousPoint.position;
      const tangentEnd =
        (index === 0 || options.geometryParams?.m11Compatibility !== true) &&
        nextPointIndex !== index
          ? nextPoint.position
          : point.position;
      writeOpenBrushFloatDirection(tangentStart, tangentEnd, tangent);
      if (Math.hypot(tangent[0], tangent[1], tangent[2]) < EPSILON) {
        copyVec3(previousTangent, tangent);
      }
    } else {
      writeOpenBrushCentralDifferenceTangent(
        stroke,
        index,
        previousTangent,
        tangent,
      );
    }
    rotateByUnityQuaternionFloat(point.orientation, VEC_FORWARD, pointerForward);
    rotateByUnityQuaternionFloat(point.orientation, VEC_UP, pointerUp);
    computeSurfaceFrameUnityFloat(
      previousRight,
      tangent,
      pointerForward,
      pointerUp,
      index === 0 || startsFlatSection,
      right,
      normal,
    );
    if (
      usesFlatGeometrySmoothing &&
      options.geometryParams?.m11Compatibility !== true &&
      index > 0 &&
      ribbonBreakBefore[index] === 0
    ) {
      cross(previousRight, previousFlatNormal, previousFlatForward);
      flatEdge[0] = point.position[0] + 0.5 * size * right[0] - previousFlatCenter[0];
      flatEdge[1] = point.position[1] + 0.5 * size * right[1] - previousFlatCenter[1];
      flatEdge[2] = point.position[2] + 0.5 * size * right[2] - previousFlatCenter[2];
      const dotRight = dotVec3(previousFlatForward, flatEdge);
      flatEdge[0] = point.position[0] - 0.5 * size * right[0] - previousFlatCenter[0];
      flatEdge[1] = point.position[1] - 0.5 * size * right[1] - previousFlatCenter[1];
      flatEdge[2] = point.position[2] - 0.5 * size * right[2] - previousFlatCenter[2];
      const dotLeft = dotVec3(previousFlatForward, flatEdge);
      if ((dotLeft < 0 && dotRight > 0) || (dotLeft > 0 && dotRight < 0)) {
        const turnSign = dotLeft < 0 ? -1 : 1;
        flatEdge[0] =
          previousFlatCenter[0] +
          turnSign * 0.5 * previousFlatSize * previousRight[0] -
          point.position[0];
        flatEdge[1] =
          previousFlatCenter[1] +
          turnSign * 0.5 * previousFlatSize * previousRight[1] -
          point.position[1];
        flatEdge[2] =
          previousFlatCenter[2] +
          turnSign * 0.5 * previousFlatSize * previousRight[2] -
          point.position[2];
        size = Math.sqrt(dotVec3(flatEdge, flatEdge));
      }
      const moveLength = Math.sqrt(
        (point.position[0] - previousFlatCenter[0]) ** 2 +
          (point.position[1] - previousFlatCenter[1]) ** 2 +
          (point.position[2] - previousFlatCenter[2]) ** 2,
      );
      size = Math.min(size, previousFlatSize + moveLength);
    }
    const width = size * 0.5;
    previousFlatSize = size;
    previousFlatCenter[0] = point.position[0];
    previousFlatCenter[1] = point.position[1];
    previousFlatCenter[2] = point.position[2];
    previousFlatNormal[0] = normal[0];
    previousFlatNormal[1] = normal[1];
    previousFlatNormal[2] = normal[2];
    previousRight[0] = right[0];
    previousRight[1] = right[1];
    previousRight[2] = right[2];
    previousTangent[0] = tangent[0];
    previousTangent[1] = tangent[1];
    previousTangent[2] = tangent[2];
    if (flatHalfRights) {
      const offset = index * 3;
      const sizeSource = Math.fround(size * OPEN_BRUSH_UNITS_PER_METER);
      flatHalfRights[offset] =
        Math.fround(Math.fround(right[0] * sizeSource) * 0.5) /
        OPEN_BRUSH_UNITS_PER_METER;
      flatHalfRights[offset + 1] =
        Math.fround(Math.fround(right[1] * sizeSource) * 0.5) /
        OPEN_BRUSH_UNITS_PER_METER;
      flatHalfRights[offset + 2] =
        Math.fround(Math.fround(right[2] * sizeSource) * 0.5) /
        OPEN_BRUSH_UNITS_PER_METER;
    }

    if (startsFlatSection) {
      // A GeometryBrush section's trailing knot has no frame of its own.
      // FlatGeometryBrush builds that edge from the first geometry knot's
      // frame, while retaining the trailing knot's pressure-derived width.
      const previousLeftVertex = previousPointIndex * 2;
      const previousRightVertex = previousLeftVertex + 1;
      writeNormal(normals, previousLeftVertex, normal);
      writeNormal(normals, previousRightVertex, normal);
      if (hasVectorOffset) {
        const previousWidth =
          localBrushSize *
          getPressureSizeMultiplier(
            ribbonSmoothedPressures[previousPointIndex],
            pressureSizeMin,
          ) *
          0.5;
        const leftOffset = previousLeftVertex * 3;
        const rightOffset = previousRightVertex * 3;
        vectorUvs[leftOffset] = -right[0] * previousWidth;
        vectorUvs[leftOffset + 1] = -right[1] * previousWidth;
        vectorUvs[leftOffset + 2] = -right[2] * previousWidth;
        vectorUvs[rightOffset] = right[0] * previousWidth;
        vectorUvs[rightOffset + 1] = right[1] * previousWidth;
        vectorUvs[rightOffset + 2] = right[2] * previousWidth;
      }
    }

    const leftVertex = index * 2;
    const rightVertex = leftVertex + 1;
    if (usesFlatGeometrySmoothing) {
      writeOpenBrushOffsetPosition(positions, leftVertex, center, right, -width, out.packedUvs);
      writeOpenBrushOffsetPosition(positions, rightVertex, center, right, width, out.packedUvs);
    } else {
      writePosition(positions, leftVertex, [
        center[0] - right[0] * width,
        center[1] - right[1] * width,
        center[2] - right[2] * width,
      ]);
      writePosition(positions, rightVertex, [
        center[0] + right[0] * width,
        center[1] + right[1] * width,
        center[2] + right[2] * width,
      ]);
    }
    writeNormal(normals, leftVertex, normal);
    writeNormal(normals, rightVertex, normal);
    writeTangent(tangents, leftVertex, tangent, 1);
    writeTangent(tangents, rightVertex, tangent, 1);
    const opacity = getPressureOpacityMultiplier(
      ribbonSmoothedPressures[index],
      pressureOpacityMin,
      pressureOpacityMax,
    ) * descriptorOpacity;
    writeColor(colors, leftVertex, stroke.color, opacity);
    writeColor(colors, rightVertex, stroke.color, opacity);
    // Open Brush distance ribbons advance by tileRate * segmentLength / size;
    // stretch ribbons normalize accumulated physical length across the stroke.
    const runningLength = ribbonRunningLengths[index];
    const sectionLength = ribbonSectionLengths[index];
    let u = usesDistanceUvs
      ? sectionRandom +
        (runningLength / Math.max(localBrushSize, EPSILON)) * tileRate
      : sectionLength > EPSILON
        ? runningLength / sectionLength
        : 0;
    if (
      usesFlatGeometrySmoothing &&
      usesDistanceUvs &&
      index > 0 &&
      ribbonBreakBefore[index] === 0
    ) {
      const distanceSource = distanceBetweenOpenBrushPoints(
        previousPoint.position,
        point.position,
      );
      const sizeSource = Math.max(
        Math.fround(flatUvSize * OPEN_BRUSH_UNITS_PER_METER),
        EPSILON,
      );
      flatDistanceU = Math.fround(
        Math.fround(flatDistanceU) +
          Math.fround(
            Math.fround(tileRate) *
              Math.fround(distanceSource / sizeSource),
          ),
      );
      u = flatDistanceU;
    }
    if (usesFlatGeometrySmoothing) {
      // Reflection reverses FlatGeometry's semantic left/right ownership.
      // Preserve Open Brush's BR/BL UV order while keeping the spatial vertex
      // order used by the generated Three mesh.
      writeUv(uvs, leftVertex, [u, v1]);
      writeUv(uvs, rightVertex, [u, v0]);
    } else {
      writeUv(uvs, leftVertex, [u, v0]);
      writeUv(uvs, rightVertex, [u, v1]);
    }
    if (hasVectorOffset) {
      const leftOffset = leftVertex * 3;
      const rightOffset = rightVertex * 3;
      vectorUvs[leftOffset] = -right[0] * width;
      vectorUvs[leftOffset + 1] = -right[1] * width;
      vectorUvs[leftOffset + 2] = -right[2] * width;
      vectorUvs[rightOffset] = right[0] * width;
      vectorUvs[rightOffset + 1] = right[1] * width;
      vectorUvs[rightOffset + 2] = right[2] * width;
    }
    includeBounds(bounds, positions, leftVertex);
    includeBounds(bounds, positions, rightVertex);

    if (usesFlatGeometrySmoothing && ribbonBreakBefore[index] === 1) {
      // FlatGeometryBrush clears the frame of a knot that terminates a strip.
      // The next geometry knot must therefore bootstrap a fresh surface frame,
      // while retaining the break knot's point, pressure, and size as its
      // trailing endpoint.
      previousRight[0] = 0;
      previousRight[1] = 0;
      previousRight[2] = 0;
      previousFlatNormal[0] = 0;
      previousFlatNormal[1] = 0;
      previousFlatNormal[2] = 0;
      if (flatHalfRights) {
        const offset = index * 3;
        flatHalfRights[offset] = 0;
        flatHalfRights[offset + 1] = 0;
        flatHalfRights[offset + 2] = 0;
      }
      flatPreviousHasGeometry = false;
    } else if (usesFlatGeometrySmoothing && index > 0) {
      flatOpenBrushVertexCount += flatPreviousHasGeometry
        ? hasBackfaces
          ? 4
          : 2
        : hasBackfaces
          ? 8
          : 4;
      flatPreviousHasGeometry = true;
    }
  }

  if (flatHalfRights) {
    if (options.geometryParams?.m11Compatibility !== true) {
      smoothFlatGeometryEdges(
        stroke,
        positions,
        flatHalfRights,
        ribbonBreakBefore,
        ribbonSmoothedPressures,
        out.ribbonPreviousRetained,
        out.ribbonNextRetained,
        localBrushSize,
        pressureSizeMin,
        bounds,
        renderPointCount,
        out.packedUvs,
      );
    }
    updateFlatGeometryTangents(
      out.packedUvs,
      normals,
      tangents,
      uvs,
      ribbonBreakBefore,
      renderPointCount,
      true,
    );
  }

  let indexOffset = 0;
  for (let segment = 0; segment < segmentCount; segment += 1) {
    if (
      ribbonBreakBefore[segment + 1] === 1 ||
      (usesFlatGeometrySmoothing && ribbonBreakBefore[segment + 1] === 2)
    ) {
      continue;
    }
    const vertex = segment * 2;
    indices[indexOffset] = vertex;
    indices[indexOffset + 1] = vertex + 2;
    indices[indexOffset + 2] = vertex + 1;
    indices[indexOffset + 3] = vertex + 1;
    indices[indexOffset + 4] = vertex + 2;
    indices[indexOffset + 5] = vertex + 3;
    indexOffset += 6;
  }

  if (hasBackfaces) {
    const hueShift = normalizeHueShift(
      options.geometryParams?.backfaceHueShift,
    );
    const backfaceColor = shiftHue(stroke.color, hueShift);
    for (let vertex = 0; vertex < frontVertexCount; vertex += 1) {
      const backVertex = frontVertexCount + vertex;
      copyPosition(positions, vertex, backVertex);
      copyNegatedNormal(normals, vertex, backVertex);
      copyTangent(tangents, vertex, backVertex, true);
      copyUv(uvs, vertex, backVertex);
      if (hasVectorOffset) {
        copyVec3At(vectorUvs, vertex, backVertex);
      }
      writeColorFromAlpha(
        colors,
        backVertex,
        backfaceColor,
        colors[vertex * 4 + 3],
      );
    }

    let backIndexOffset = frontIndexCount;
    for (let segment = 0; segment < segmentCount; segment += 1) {
      if (
        ribbonBreakBefore[segment + 1] === 1 ||
        (usesFlatGeometrySmoothing && ribbonBreakBefore[segment + 1] === 2)
      ) {
        continue;
      }
      const vertex = frontVertexCount + segment * 2;
      indices[backIndexOffset] = vertex;
      indices[backIndexOffset + 1] = vertex + 1;
      indices[backIndexOffset + 2] = vertex + 2;
      indices[backIndexOffset + 3] = vertex + 1;
      indices[backIndexOffset + 4] = vertex + 3;
      indices[backIndexOffset + 5] = vertex + 2;
      backIndexOffset += 6;
    }
  }

  if (usesQuadStripTriangleSoup) {
    expandRibbonTriangleSoup(
      out,
      ribbonBreakBefore,
      renderPointCount,
      frontVertexCount,
      frontIndexCount,
      hasBackfaces,
      vertexCount,
    );
    applyQuadStripPositionQuads(
      out,
      stroke,
      options,
      ribbonBreakBefore,
      renderPointCount,
    );
    applyQuadStripMidpointFusion(
      out,
      stroke,
      options,
      ribbonBreakBefore,
      renderPointCount,
      frontIndexCount / 6,
      hasBackfaces,
      options.generatorClass,
      tileRate,
      atlasRows,
      stroke.seed,
    );
  }

  const finalizedCounts = usesQuadStripTriangleSoup
    ? finalizeQuadStripUsedGeometry(
        out,
        ribbonBreakBefore,
        renderPointCount,
        frontIndexCount / 6,
        hasBackfaces,
        options,
      )
    : undefined;
  let finalVertexCount = finalizedCounts?.vertexCount ?? vertexCount;
  let finalIndexCount = finalizedCounts?.indexCount ?? indexCount;
  if (
    usesQuadStripTriangleSoup &&
    options.finalized === true &&
    !hasBackfaces &&
    finalVertexCount > 0
  ) {
    const weldedCounts = weldSingleSidedQuadStrip(
      out,
      ribbonBreakBefore,
      renderPointCount,
      finalVertexCount / 6,
    );
    finalVertexCount = weldedCounts.vertexCount;
    finalIndexCount = weldedCounts.indexCount;
  }
  if (usesQuadStripTriangleSoup && hasBackfaces && finalVertexCount > 0) {
    interleaveQuadStripBackfaces(out, finalVertexCount / 12);
  }
  if (usesFlatGeometrySmoothing) {
    const compacted = compactFlatGeometry(
      out,
      ribbonBreakBefore,
      renderPointCount,
      hasBackfaces,
      hasVectorOffset,
    );
    finalVertexCount = compacted.vertexCount;
    finalIndexCount = compacted.indexCount;
  }
  if (storesRibbonWidth && usesQuadStripTriangleSoup) {
    writeQuadStripPackedWidthUvs(
      out,
      finalVertexCount,
      hasBackfaces,
    );
  }
  out.family = family;
  out.vertexCount = finalVertexCount;
  out.indexCount = finalIndexCount;
  return reallocated;
}

function writeQuadStripPackedWidthUvs(
  out: BrushGeometryArrays,
  vertexCount: number,
  hasBackfaces: boolean,
): void {
  const verticesPerSolid = hasBackfaces ? 12 : 6;
  for (let solidVertex = 0; solidVertex < vertexCount; solidVertex += verticesPerSolid) {
    const width = distanceBetweenPositionVertices(
      out.positions,
      solidVertex,
      solidVertex + 1,
    );
    for (let corner = 0; corner < verticesPerSolid; corner += 1) {
      const vertex = solidVertex + corner;
      const uvOffset = vertex * 2;
      const packedOffset = vertex * 3;
      out.packedUvs[packedOffset] = out.uvs[uvOffset];
      out.packedUvs[packedOffset + 1] = out.uvs[uvOffset + 1];
      out.packedUvs[packedOffset + 2] = width;
    }
  }
}

/** Repack point-pair scratch into GeometryBrush's shared indexed strip layout. */
function compactFlatGeometry(
  out: BrushGeometryArrays,
  breakBefore: Uint8Array,
  pointCount: number,
  hasBackfaces: boolean,
  hasVectorOffset: boolean,
): { vertexCount: number; indexCount: number } {
  const sourceFrontVertexCount = pointCount * 2;
  compactFlatGeometryAttribute(
    out.positions,
    3,
    out.particleUvs,
    breakBefore,
    pointCount,
    sourceFrontVertexCount,
    hasBackfaces,
  );
  compactFlatGeometryAttribute(
    out.normals,
    3,
    out.particleUvs,
    breakBefore,
    pointCount,
    sourceFrontVertexCount,
    hasBackfaces,
  );
  compactFlatGeometryAttribute(
    out.tangents,
    4,
    out.particleUvs,
    breakBefore,
    pointCount,
    sourceFrontVertexCount,
    hasBackfaces,
  );
  const compactedVertexUpperBound = pointCount * (hasBackfaces ? 4 : 2);
  for (let vertex = 0; vertex < compactedVertexUpperBound; vertex += 1) {
    out.tangents[vertex * 4 + 3] *= -1;
  }
  compactFlatGeometryAttribute(
    out.colors,
    4,
    out.particleUvs,
    breakBefore,
    pointCount,
    sourceFrontVertexCount,
    hasBackfaces,
  );
  compactFlatGeometryAttribute(
    out.uvs,
    2,
    out.particleUvs,
    breakBefore,
    pointCount,
    sourceFrontVertexCount,
    hasBackfaces,
  );
  if (hasVectorOffset) {
    compactFlatGeometryAttribute(
      out.vectorUvs,
      3,
      out.particleUvs,
      breakBefore,
      pointCount,
      sourceFrontVertexCount,
      hasBackfaces,
    );
  }

  const verticesPerPoint = hasBackfaces ? 4 : 2;
  let vertexWrite = 0;
  let indexWrite = 0;
  let continuesStrip = false;
  for (let pointIndex = 1; pointIndex < pointCount; pointIndex += 1) {
    if (breakBefore[pointIndex] === 2) {
      continue;
    }
    if (breakBefore[pointIndex] === 1) {
      continuesStrip = false;
      continue;
    }
    if (!continuesStrip) {
      vertexWrite += verticesPerPoint;
    }
    const previous = vertexWrite - verticesPerPoint;
    const current = vertexWrite;
    if (hasBackfaces) {
      out.indices[indexWrite] = previous;
      out.indices[indexWrite + 1] = current + 2;
      out.indices[indexWrite + 2] = previous + 2;
      out.indices[indexWrite + 3] = current + 3;
      out.indices[indexWrite + 4] = previous + 1;
      out.indices[indexWrite + 5] = previous + 3;
      out.indices[indexWrite + 6] = previous;
      out.indices[indexWrite + 7] = current;
      out.indices[indexWrite + 8] = current + 2;
      out.indices[indexWrite + 9] = current + 1;
      out.indices[indexWrite + 10] = previous + 1;
      out.indices[indexWrite + 11] = current + 3;
      indexWrite += 12;
    } else {
      out.indices[indexWrite] = previous;
      out.indices[indexWrite + 1] = current + 1;
      out.indices[indexWrite + 2] = previous + 1;
      out.indices[indexWrite + 3] = previous;
      out.indices[indexWrite + 4] = current;
      out.indices[indexWrite + 5] = current + 1;
      indexWrite += 6;
    }
    vertexWrite += verticesPerPoint;
    continuesStrip = true;
  }

  resetBounds(out.bounds);
  for (let vertex = 0; vertex < vertexWrite; vertex += 1) {
    includeBounds(out.bounds, out.positions, vertex);
  }
  return { vertexCount: vertexWrite, indexCount: indexWrite };
}

function compactFlatGeometryAttribute(
  target: Float32Array,
  itemSize: number,
  scratch: Float32Array,
  breakBefore: Uint8Array,
  pointCount: number,
  sourceFrontVertexCount: number,
  hasBackfaces: boolean,
): void {
  const sourceVertexCount = sourceFrontVertexCount * (hasBackfaces ? 2 : 1);
  scratch.set(target.subarray(0, sourceVertexCount * itemSize), 0);
  let vertexWrite = 0;
  let continuesStrip = false;
  let lastRetainedPoint = 0;
  for (let pointIndex = 1; pointIndex < pointCount; pointIndex += 1) {
    if (breakBefore[pointIndex] === 2) {
      continue;
    }
    if (breakBefore[pointIndex] === 1) {
      continuesStrip = false;
      lastRetainedPoint = pointIndex;
      continue;
    }
    if (!continuesStrip) {
      vertexWrite = appendFlatGeometryPointAttribute(
        target,
        itemSize,
        scratch,
        sourceFrontVertexCount,
        hasBackfaces,
        lastRetainedPoint,
        vertexWrite,
      );
    }
    vertexWrite = appendFlatGeometryPointAttribute(
      target,
      itemSize,
      scratch,
      sourceFrontVertexCount,
      hasBackfaces,
      pointIndex,
      vertexWrite,
    );
    continuesStrip = true;
    lastRetainedPoint = pointIndex;
  }
}

function appendFlatGeometryPointAttribute(
  target: Float32Array,
  itemSize: number,
  scratch: Float32Array,
  sourceFrontVertexCount: number,
  hasBackfaces: boolean,
  pointIndex: number,
  vertexWrite: number,
): number {
  for (let side = 0; side < 2; side += 1) {
    const frontSource = pointIndex * 2 + side;
    copyAttributeItem(scratch, target, frontSource, vertexWrite, itemSize);
    vertexWrite += 1;
    if (hasBackfaces) {
      copyAttributeItem(
        scratch,
        target,
        sourceFrontVertexCount + frontSource,
        vertexWrite,
        itemSize,
      );
      vertexWrite += 1;
    }
  }
  return vertexWrite;
}

/** Port of QuadStripBrush.WeldSingleSidedQuadStrip in canonical Three winding. */
function weldSingleSidedQuadStrip(
  out: BrushGeometryArrays,
  breakBefore: Uint8Array,
  pointCount: number,
  solidCount: number,
): { vertexCount: number; indexCount: number } {
  weldSingleSidedQuadStripAttribute(
    out.positions,
    3,
    out.uv1s,
    breakBefore,
    pointCount,
    solidCount,
  );
  weldSingleSidedQuadStripAttribute(
    out.normals,
    3,
    out.uv1s,
    breakBefore,
    pointCount,
    solidCount,
  );
  weldSingleSidedQuadStripAttribute(
    out.tangents,
    4,
    out.uv1s,
    breakBefore,
    pointCount,
    solidCount,
  );
  weldSingleSidedQuadStripAttribute(
    out.colors,
    4,
    out.uv1s,
    breakBefore,
    pointCount,
    solidCount,
  );
  weldSingleSidedQuadStripAttribute(
    out.uvs,
    2,
    out.uv1s,
    breakBefore,
    pointCount,
    solidCount,
  );
  if (out.uv1Size === 3) {
    weldSingleSidedQuadStripAttribute(
      out.vectorUvs,
      3,
      out.uv1s,
      breakBefore,
      pointCount,
      solidCount,
    );
  }

  let solid = 0;
  let vertexWrite = 0;
  let indexWrite = 0;
  let startsStrip = true;
  for (let segment = 0; segment < pointCount - 1 && solid < solidCount; segment += 1) {
    const sectionState = breakBefore[segment + 1];
    if (sectionState === 2) {
      continue;
    }
    startsStrip = startsStrip || sectionState === 1;
    if (startsStrip) {
      out.indices[indexWrite] = vertexWrite;
      out.indices[indexWrite + 1] = vertexWrite + 3;
      out.indices[indexWrite + 2] = vertexWrite + 1;
      out.indices[indexWrite + 3] = vertexWrite;
      out.indices[indexWrite + 4] = vertexWrite + 2;
      out.indices[indexWrite + 5] = vertexWrite + 3;
      vertexWrite += 4;
      startsStrip = false;
    } else {
      const backRight = vertexWrite - 2;
      const backLeft = vertexWrite - 1;
      const frontRight = vertexWrite;
      const frontLeft = vertexWrite + 1;
      out.indices[indexWrite] = backRight;
      out.indices[indexWrite + 1] = frontLeft;
      out.indices[indexWrite + 2] = backLeft;
      out.indices[indexWrite + 3] = backRight;
      out.indices[indexWrite + 4] = frontRight;
      out.indices[indexWrite + 5] = frontLeft;
      vertexWrite += 2;
    }
    indexWrite += 6;
    solid += 1;
  }
  return { vertexCount: vertexWrite, indexCount: indexWrite };
}

function weldSingleSidedQuadStripAttribute(
  target: Float32Array,
  itemSize: number,
  scratch: Float32Array,
  breakBefore: Uint8Array,
  pointCount: number,
  solidCount: number,
): void {
  scratch.set(target.subarray(0, solidCount * 6 * itemSize), 0);
  let solid = 0;
  let vertexWrite = 0;
  let startsStrip = true;
  for (let segment = 0; segment < pointCount - 1 && solid < solidCount; segment += 1) {
    const sectionState = breakBefore[segment + 1];
    if (sectionState === 2) {
      continue;
    }
    startsStrip = startsStrip || sectionState === 1;
    const sourceVertex = solid * 6;
    if (startsStrip) {
      copyAttributeItem(scratch, target, sourceVertex + 1, vertexWrite, itemSize);
      copyAttributeItem(scratch, target, sourceVertex, vertexWrite + 1, itemSize);
      copyAttributeItem(scratch, target, sourceVertex + 4, vertexWrite + 2, itemSize);
      copyAttributeItem(scratch, target, sourceVertex + 2, vertexWrite + 3, itemSize);
      vertexWrite += 4;
      startsStrip = false;
    } else {
      copyAttributeItem(scratch, target, sourceVertex + 4, vertexWrite, itemSize);
      copyAttributeItem(scratch, target, sourceVertex + 2, vertexWrite + 1, itemSize);
      vertexWrite += 2;
    }
    solid += 1;
  }
}

/** Matches Open Brush's per-solid front/back vertex ordering. */
function interleaveQuadStripBackfaces(
  out: BrushGeometryArrays,
  solidCount: number,
): void {
  const frontVertexCount = solidCount * 6;
  const totalVertexCount = frontVertexCount * 2;
  interleaveVertexAttribute(out.positions, 3, solidCount, out.uv1s);
  interleaveVertexAttribute(out.normals, 3, solidCount, out.uv1s);
  interleaveVertexAttribute(out.tangents, 4, solidCount, out.uv1s);
  interleaveVertexAttribute(out.colors, 4, solidCount, out.uv1s);
  interleaveVertexAttribute(out.uvs, 2, solidCount, out.uv1s);
  if (out.uv1Size === 3) {
    interleaveVertexAttribute(out.vectorUvs, 3, solidCount, out.uv1s);
  }
  for (let index = 0; index < totalVertexCount; index += 1) {
    out.indices[index] = index;
  }
}

function interleaveVertexAttribute(
  target: Float32Array,
  itemSize: number,
  solidCount: number,
  scratch: Float32Array,
): void {
  const verticesPerSide = solidCount * 6;
  const valueCount = verticesPerSide * 2 * itemSize;
  scratch.set(target.subarray(0, valueCount), 0);
  for (let solid = 0; solid < solidCount; solid += 1) {
    const frontSource = solid * 6;
    const backSource = verticesPerSide + frontSource;
    const frontDestination = solid * 12;
    const backDestination = frontDestination + 6;
    for (let corner = 0; corner < 6; corner += 1) {
      copyAttributeItem(
        scratch,
        target,
        frontSource + corner,
        frontDestination + corner,
        itemSize,
      );
      copyAttributeItem(
        scratch,
        target,
        backSource + corner,
        backDestination + corner,
        itemSize,
      );
    }
  }
}

function copyAttributeItem(
  source: Float32Array,
  target: Float32Array,
  sourceIndex: number,
  targetIndex: number,
  itemSize: number,
): void {
  const sourceOffset = sourceIndex * itemSize;
  const targetOffset = targetIndex * itemSize;
  for (let component = 0; component < itemSize; component += 1) {
    target[targetOffset + component] = source[sourceOffset + component];
  }
}

function finalizeQuadStripUsedGeometry(
  out: BrushGeometryArrays,
  breakBefore: Uint8Array,
  pointCount: number,
  frontSolidCount: number,
  hasBackfaces: boolean,
  options: BrushGeometryOptions,
): { vertexCount: number; indexCount: number } | undefined {
  if (
    options.finalized !== true ||
    options.lastControlPointIsKeeper !== false ||
    pointCount < 2
  ) {
    return undefined;
  }
  const finalSegment = pointCount - 2;
  const provisionalBreaks = breakBefore[pointCount - 1] === 1;
  let previousSectionSolidCount = 0;
  for (let segment = finalSegment - 1; segment >= 0; segment -= 1) {
    if (breakBefore[segment + 1] === 1) {
      break;
    }
    previousSectionSolidCount += 1;
  }
  let removedSolidCount = 0;
  if (provisionalBreaks) {
    removedSolidCount = previousSectionSolidCount === 1 ? 1 : 0;
  } else if (previousSectionSolidCount === 0) {
    removedSolidCount = 1;
  } else if (previousSectionSolidCount === 1) {
    removedSolidCount = 2;
  }
  const keptFrontSolidCount = Math.max(
    0,
    frontSolidCount - removedSolidCount,
  );
  if (keptFrontSolidCount === frontSolidCount) {
    return undefined;
  }
  const oldFrontVertexCount = frontSolidCount * 6;
  const keptFrontVertexCount = keptFrontSolidCount * 6;
  if (hasBackfaces) {
    for (let vertex = 0; vertex < keptFrontVertexCount; vertex += 1) {
      copyRibbonVertex(
        out,
        oldFrontVertexCount + vertex,
        keptFrontVertexCount + vertex,
      );
    }
  }
  const vertexCount = keptFrontVertexCount * (hasBackfaces ? 2 : 1);
  for (let index = 0; index < vertexCount; index += 1) {
    out.indices[index] = index;
  }
  resetBounds(out.bounds);
  for (let vertex = 0; vertex < vertexCount; vertex += 1) {
    includeBounds(out.bounds, out.positions, vertex);
  }
  return { vertexCount, indexCount: vertexCount };
}

function expandRibbonTriangleSoup(
  out: BrushGeometryArrays,
  breakBefore: Uint8Array,
  pointCount: number,
  frontSourceVertexCount: number,
  frontVertexCount: number,
  hasBackfaces: boolean,
  finalVertexCount: number,
): void {
  const sourceOffset = finalVertexCount;
  const sourceVertexCount = frontSourceVertexCount * (hasBackfaces ? 2 : 1);
  for (let vertex = sourceVertexCount - 1; vertex >= 0; vertex -= 1) {
    copyRibbonVertex(out, vertex, sourceOffset + vertex);
  }

  const frontPattern = [0, 2, 1, 1, 2, 3] as const;
  const backPattern = [0, 1, 2, 1, 3, 2] as const;
  let solid = 0;
  for (let segment = 0; segment < pointCount - 1; segment += 1) {
    if (breakBefore[segment + 1] === 2) {
      continue;
    }
    const frontSource = sourceOffset + segment * 2;
    const frontDestination = solid * 6;
    for (let corner = 0; corner < 6; corner += 1) {
      copyRibbonVertex(
        out,
        frontSource + frontPattern[corner],
        frontDestination + corner,
      );
    }
    if (hasBackfaces) {
      const backSource = sourceOffset + frontSourceVertexCount + segment * 2;
      const backDestination = frontVertexCount + solid * 6;
      for (let corner = 0; corner < 6; corner += 1) {
        copyRibbonVertex(
          out,
          backSource + backPattern[corner],
          backDestination + corner,
        );
      }
    }
    solid += 1;
  }
  for (let index = 0; index < finalVertexCount; index += 1) {
    out.indices[index] = index;
  }
}

function copyRibbonVertex(
  out: BrushGeometryArrays,
  source: number,
  destination: number,
): void {
  copyVec3At(out.positions, source, destination);
  copyVec3At(out.normals, source, destination);
  copyVec4At(out.tangents, source, destination);
  copyVec4At(out.colors, source, destination);
  copyVec2At(out.uvs, source, destination);
  if (out.uv1Size === 3) {
    copyVec3At(out.vectorUvs, source, destination);
  }
}

function applyQuadStripPositionQuads(
  out: BrushGeometryArrays,
  stroke: StrokeData,
  options: BrushGeometryOptions,
  breakBefore: Uint8Array,
  pointCount: number,
): void {
  const previousRight: Vec3 = [0, 0, 0];
  const tangent: Vec3 = [0, 0, 0];
  const pointerForward: Vec3 = [0, 0, 0];
  const pointerUp: Vec3 = [0, 0, 0];
  const right: Vec3 = [0, 0, 0];
  const normal: Vec3 = [0, 0, 0];
  const center: Vec3 = [0, 0, 0];
  const halfForward: Vec3 = [0, 0, 0];
  const halfRight: Vec3 = [0, 0, 0];
  const previousCenter: Vec3 = [0, 0, 0];
  const previousHalfForward: Vec3 = [0, 0, 0];
  const previousHalfRight: Vec3 = [0, 0, 0];
  const lastGeneratedFacing: Vec3 = [0, 0, 0];
  const positionedFacing: Vec3 = [0, 0, 0];
  const centerSource: Vec3 = [0, 0, 0];
  const rightSource: Vec3 = [0, 0, 0];
  const previousCenterSource: Vec3 = [0, 0, 0];
  const previousForwardSource: Vec3 = [0, 0, 0];
  const previousRightSource: Vec3 = [0, 0, 0];
  const edgeSource: Vec3 = [0, 0, 0];
  const preferredForwardSource: Vec3 = [0, 0, 0];
  const crossSource: Vec3 = [0, 0, 0];
  const pressureSizeMin = normalizePressureSizeMin(options.pressureSizeRange?.[0]);
  const pressureOpacityMin = normalizePressureOpacityMin(
    options.pressureOpacityRange,
  );
  const pressureOpacityMax = normalizePressureOpacityMax(
    options.pressureOpacityRange,
  );
  const descriptorOpacity = normalizeDescriptorOpacity(
    options.geometryParams?.opacity,
  );
  const localBrushSize = getLocalBrushSize(stroke);
  const provisionalSamples = out.ribbonProvisionalSamples;
  const rawPositions = out.quadStripRawPositions;
  const rawNormals = out.quadStripRawNormals;
  let previousOpacity = 0;
  let lastSizeShrink = 0;
  let sectionSolidCount = 0;
  let lastSpawnPointIndex = 0;
  let solid = 0;
  for (let pointIndex = 1; pointIndex < pointCount; pointIndex += 1) {
    let sectionState = breakBefore[pointIndex];
    const isTransientProvisional =
      sectionState === 2 && provisionalSamples[pointIndex] === 1;
    if (sectionState === 2 && !isTransientProvisional) {
      continue;
    }
    if (sectionState === 1) {
      sectionSolidCount = 0;
    }
    const previousPoint = stroke.controlPoints[lastSpawnPointIndex];
    const point = stroke.controlPoints[pointIndex];
    const moveLengthSource = distanceBetweenOpenBrushPoints(
      previousPoint.position,
      point.position,
    );
    const moveLength = distanceBetweenControlPoints(previousPoint, point);
    writeOpenBrushFloatDirection(
      previousPoint.position,
      point.position,
      tangent,
    );
    if (Math.hypot(tangent[0], tangent[1], tangent[2]) < EPSILON) {
      continue;
    }
    rotateByUnityQuaternionFloat(point.orientation, VEC_FORWARD, pointerForward);
    rotateByUnityQuaternionFloat(point.orientation, VEC_UP, pointerUp);
    computeSurfaceFrameUnityFloat(
      previousRight,
      tangent,
      pointerForward,
      pointerUp,
      solid === 0,
      right,
      normal,
      true,
      options.geometryParams?.backIsInvisible === true,
    );
    const sourceSize =
      localBrushSize *
      getPressureSizeMultiplier(
        out.ribbonSmoothedPressures[pointIndex],
        pressureSizeMin,
      );
    const sourceSizeSource = Math.fround(
      sourceSize * OPEN_BRUSH_UNITS_PER_METER,
    );
    const spawnIntervalSource = Math.fround(
      Math.fround(0.0015 * OPEN_BRUSH_UNITS_PER_METER) +
        Math.fround(sourceSizeSource * 0.2),
    );
    const generatesNewSolid = moveLengthSource >= spawnIntervalSource;
    if (!generatesNewSolid && normalizeUnityFloatVector(lastGeneratedFacing)) {
      slerpUnityFloatUnitVectors(
        lastGeneratedFacing,
        tangent,
        Math.fround(moveLengthSource / spawnIntervalSource),
        positionedFacing,
      );
    } else {
      copyVec3(tangent, positionedFacing);
    }
    let size =
      Math.fround(
        sourceSizeSource -
          Math.fround(lastSizeShrink * OPEN_BRUSH_UNITS_PER_METER),
      ) / OPEN_BRUSH_UNITS_PER_METER;
    for (let axis = 0; axis < 3; axis += 1) {
      const previousSource = Math.fround(
        previousPoint.position[axis] * OPEN_BRUSH_UNITS_PER_METER,
      );
      const pointSource = Math.fround(
        point.position[axis] * OPEN_BRUSH_UNITS_PER_METER,
      );
      center[axis] =
        Math.fround(Math.fround(previousSource + pointSource) * 0.5) /
        OPEN_BRUSH_UNITS_PER_METER;
      halfForward[axis] =
        Math.fround(
          Math.fround(positionedFacing[axis] * moveLengthSource) * 0.5,
        ) / OPEN_BRUSH_UNITS_PER_METER;
      halfRight[axis] =
        Math.fround(
          Math.fround(
            right[axis] *
              Math.fround(size * OPEN_BRUSH_UNITS_PER_METER),
          ) * 0.5,
        ) /
        OPEN_BRUSH_UNITS_PER_METER;
    }
    let sizeShrink = lastSizeShrink;
    for (let axis = 0; axis < 3; axis += 1) {
      centerSource[axis] = Math.fround(
        center[axis] * OPEN_BRUSH_UNITS_PER_METER,
      );
      rightSource[axis] = Math.fround(
        halfRight[axis] * OPEN_BRUSH_UNITS_PER_METER,
      );
      previousCenterSource[axis] = Math.fround(
        previousCenter[axis] * OPEN_BRUSH_UNITS_PER_METER,
      );
      previousForwardSource[axis] = Math.fround(
        previousHalfForward[axis] * OPEN_BRUSH_UNITS_PER_METER,
      );
      previousRightSource[axis] = Math.fround(
        previousHalfRight[axis] * OPEN_BRUSH_UNITS_PER_METER,
      );
      preferredForwardSource[axis] = Math.fround(
        centerSource[axis] -
          Math.fround(
            previousPoint.position[axis] * OPEN_BRUSH_UNITS_PER_METER,
          ),
      );
    }
    if (
      sectionState !== 1 &&
      sectionSolidCount >= 1 &&
      dotUnityFloat(previousForwardSource, preferredForwardSource) <= 0
    ) {
      // Open Brush tests reversal against the last committed quad forward,
      // which may have been redirected by width clipping. Consecutive control
      // point directions alone miss this break after a tight turn.
      sectionState = 1;
      breakBefore[pointIndex] = 1;
      sectionSolidCount = 0;
    }
    if (sectionSolidCount >= 1) {
      for (let axis = 0; axis < 3; axis += 1) {
        edgeSource[axis] = Math.fround(
          Math.fround(centerSource[axis] + rightSource[axis]) -
            previousCenterSource[axis],
        );
      }
      const dotRight = dotUnityFloat(previousForwardSource, edgeSource);
      for (let axis = 0; axis < 3; axis += 1) {
        edgeSource[axis] = Math.fround(
          Math.fround(centerSource[axis] - rightSource[axis]) -
            previousCenterSource[axis],
        );
      }
      const dotLeft = dotUnityFloat(previousForwardSource, edgeSource);
      if ((dotLeft < 0 && dotRight > 0) || (dotLeft > 0 && dotRight < 0)) {
        for (let axis = 0; axis < 3; axis += 1) {
          const endpoint =
            dotLeft < 0
              ? Math.fround(
                  previousCenterSource[axis] - previousRightSource[axis],
                )
              : Math.fround(
                  previousCenterSource[axis] + previousRightSource[axis],
                );
          rightSource[axis] =
            dotLeft < 0
              ? Math.fround(centerSource[axis] - endpoint)
              : Math.fround(endpoint - centerSource[axis]);
          halfRight[axis] =
            rightSource[axis] / OPEN_BRUSH_UNITS_PER_METER;
        }
        const newSizeSource = Math.fround(
          2 * unityFloatMagnitude(rightSource),
        );
        size = newSizeSource / OPEN_BRUSH_UNITS_PER_METER;
        const lastShrinkSource = Math.fround(
          lastSizeShrink * OPEN_BRUSH_UNITS_PER_METER,
        );
        const sizeShrinkSource = Math.fround(
          lastShrinkSource +
            Math.fround(
              Math.fround(sourceSizeSource - lastShrinkSource) - newSizeSource,
            ),
        );
        sizeShrink = sizeShrinkSource / OPEN_BRUSH_UNITS_PER_METER;
        crossUnityFloat(preferredForwardSource, rightSource, crossSource);
        crossUnityFloat(rightSource, crossSource, preferredForwardSource);
        if (normalizeUnityFloatVector(preferredForwardSource)) {
          for (let axis = 0; axis < 3; axis += 1) {
            edgeSource[axis] = Math.fround(
              centerSource[axis] - previousCenterSource[axis],
            );
          }
          const forwardScale = Math.fround(
            unityFloatMagnitude(edgeSource) * 0.5,
          );
          for (let axis = 0; axis < 3; axis += 1) {
            halfForward[axis] =
              Math.fround(preferredForwardSource[axis] * forwardScale) /
              OPEN_BRUSH_UNITS_PER_METER;
          }
        }
      } else if (generatesNewSolid) {
        const lastShrinkSource = Math.fround(
          lastSizeShrink * OPEN_BRUSH_UNITS_PER_METER,
        );
        sizeShrink =
          Math.fround(
            lastShrinkSource - Math.min(lastShrinkSource, moveLengthSource),
          ) / OPEN_BRUSH_UNITS_PER_METER;
      }
    }
    const vertex = solid * 6;
    writeQuadStripPositionQuad(
      out.positions,
      vertex,
      center,
      halfForward,
      halfRight,
    );
    for (let corner = 0; corner < 6; corner += 1) {
      writeNormal(out.normals, vertex + corner, normal);
    }
    const opacity =
      getPressureOpacityMultiplier(
        out.ribbonSmoothedPressures[pointIndex],
        pressureOpacityMin,
        pressureOpacityMax,
      ) * descriptorOpacity;
    const trailingOpacity = solid === 0 ? opacity : previousOpacity;
    writeColor(out.colors, vertex, stroke.color, trailingOpacity);
    writeColor(out.colors, vertex + 1, stroke.color, trailingOpacity);
    writeColor(out.colors, vertex + 2, stroke.color, opacity);
    writeColor(out.colors, vertex + 3, stroke.color, trailingOpacity);
    writeColor(out.colors, vertex + 4, stroke.color, opacity);
    writeColor(out.colors, vertex + 5, stroke.color, opacity);
    if (out.uv1Size === 3) {
      writeQuadStripVectorOffset(
        out.vectorUvs,
        vertex,
        halfRight[0],
        halfRight[1],
        halfRight[2],
      );
    }
    out.ribbonSectionLengths[solid] = size;
    out.quadStripPressuredSizes[pointIndex] = size;
    rawPositions.set(
      out.positions.subarray(vertex * 3, vertex * 3 + 18),
      pointIndex * 18,
    );
    rawNormals.set(
      out.normals.subarray(vertex * 3, vertex * 3 + 18),
      pointIndex * 18,
    );
    if (isTransientProvisional) {
      continue;
    }
    previousOpacity = opacity;
    copyVec3(center, previousCenter);
    copyVec3(halfForward, previousHalfForward);
    copyVec3(halfRight, previousHalfRight);
    copyVec3(halfRight, previousRight);
    normalizeUnityFloatVector(previousRight);
    lastSizeShrink = sizeShrink;
    if (generatesNewSolid) {
      copyVec3(tangent, lastGeneratedFacing);
      lastSpawnPointIndex = pointIndex;
    }
    sectionSolidCount += 1;
    solid += 1;
  }
}

function writeQuadStripPositionQuad(
  target: Float32Array,
  vertex: number,
  center: Vec3,
  halfForward: Vec3,
  halfRight: Vec3,
): void {
  writeQuadStripSourcePosition(target, vertex, center, halfForward, halfRight, -1, -1);
  writeQuadStripSourcePosition(target, vertex + 1, center, halfForward, halfRight, -1, 1);
  writeQuadStripSourcePosition(target, vertex + 2, center, halfForward, halfRight, 1, -1);
  copyPosition(target, vertex + 1, vertex + 3);
  writeQuadStripSourcePosition(target, vertex + 4, center, halfForward, halfRight, 1, 1);
  copyPosition(target, vertex + 2, vertex + 5);
}

function writeQuadStripSourcePosition(
  target: Float32Array,
  vertex: number,
  center: Vec3,
  halfForward: Vec3,
  halfRight: Vec3,
  forwardSign: -1 | 1,
  rightSign: -1 | 1,
): void {
  const offset = vertex * 3;
  for (let axis = 0; axis < 3; axis += 1) {
    const centerSource = Math.fround(
      center[axis] * OPEN_BRUSH_UNITS_PER_METER,
    );
    const forwardSource = Math.fround(
      halfForward[axis] * OPEN_BRUSH_UNITS_PER_METER,
    );
    const rightSource = Math.fround(
      halfRight[axis] * OPEN_BRUSH_UNITS_PER_METER,
    );
    target[offset + axis] = Math.fround(
      Math.fround(centerSource + Math.fround(forwardSource * forwardSign)) +
        Math.fround(rightSource * rightSign),
    );
  }
}

function writePositionComponents(
  target: Float32Array,
  vertex: number,
  x: number,
  y: number,
  z: number,
): void {
  const offset = vertex * 3;
  target[offset] = x;
  target[offset + 1] = y;
  target[offset + 2] = z;
}

function writeQuadStripVectorOffset(
  target: Float32Array,
  vertex: number,
  halfRightX: number,
  halfRightY: number,
  halfRightZ: number,
): void {
  for (let corner = 0; corner < 6; corner += 1) {
    const offset = (vertex + corner) * 3;
    const side = QUAD_STRIP_CORNER_SIDES[corner];
    target[offset] = halfRightX * side;
    target[offset + 1] = halfRightY * side;
    target[offset + 2] = halfRightZ * side;
  }
}

const QUAD_STRIP_CORNER_SIDES = [-1, 1, -1, 1, 1, -1] as const;

function applyQuadStripMidpointFusion(
  out: BrushGeometryArrays,
  stroke: StrokeData,
  options: BrushGeometryOptions,
  breakBefore: Uint8Array,
  pointCount: number,
  frontSolidCount: number,
  hasBackfaces: boolean,
  generatorClass: string | undefined,
  tileRate: number,
  atlasRows: number,
  seed: number,
): void {
  // Open Brush mutates the newest three solids after every append. Preserve the
  // unsmoothed positions for every accepted input sample because provisional
  // samples temporarily overwrite the mutable leading solid. Starting a
  // detached section also restores the previous committed solid before touching
  // up the end of the old section.
  const rawPositions = out.quadStripRawPositions;
  const rawNormals = out.quadStripRawNormals;
  const provisionalSamples = out.ribbonProvisionalSamples;
  const localBrushSize = getLocalBrushSize(stroke);
  const pressureSizeMin = normalizePressureSizeMin(options.pressureSizeRange?.[0]);
  let solid = 0;
  let sectionStart = 0;
  let lastSpawnPointIndex = 0;
  let pendingDistanceTangentStart = -1;
  let pendingDistanceTangentEnd = -1;
  const requestDistanceTangents = (start: number, end: number): void => {
    if (pendingDistanceTangentStart >= 0 && pendingDistanceTangentStart !== start) {
      updateQuadStripSectionTangents(
        out,
        pendingDistanceTangentStart,
        Math.min(pendingDistanceTangentEnd, frontSolidCount),
      );
      pendingDistanceTangentStart = -1;
      pendingDistanceTangentEnd = -1;
    }
    if (pendingDistanceTangentStart < 0) {
      pendingDistanceTangentStart = start;
      pendingDistanceTangentEnd = end;
    } else {
      pendingDistanceTangentEnd = Math.max(pendingDistanceTangentEnd, end);
    }
  };
  for (let segment = 0; segment < pointCount - 1; segment += 1) {
    const pointIndex = segment + 1;
    const sectionState = breakBefore[pointIndex];
    const previousSectionStart = sectionStart;
    const isTransientProvisional =
      sectionState === 2 && provisionalSamples[pointIndex] === 1;
    if (sectionState === 2 && !isTransientProvisional) {
      continue;
    }
    const previousPosition = stroke.controlPoints[lastSpawnPointIndex].position;
    const position = stroke.controlPoints[pointIndex].position;
    const moveLengthSource = distanceBetweenOpenBrushPoints(
      previousPosition,
      position,
    );
    const sourceSizeSource = Math.fround(
      Math.fround(localBrushSize * OPEN_BRUSH_UNITS_PER_METER) *
        Math.fround(
          getPressureSizeMultiplier(
            out.ribbonSmoothedPressures[pointIndex],
            pressureSizeMin,
          ),
        ),
    );
    const spawnIntervalSource = Math.fround(
      Math.fround(0.0015 * OPEN_BRUSH_UNITS_PER_METER) +
        Math.fround(sourceSizeSource * 0.2),
    );
    const generatesNewSolid = moveLengthSource >= spawnIntervalSource;
    if (sectionState === 1) {
      if (generatorClass === "QuadStripBrushDistanceUV") {
        // Open Brush finalizes the old section before AppendLeadingQuad restores
        // and re-fuses its last solid. Its endpoint alpha therefore reflects the
        // geometry immediately before the detached section begins.
        updateQuadStripDistanceUvsForAppend(
          out,
          sectionStart,
          solid,
          out.quadStripPressuredSizes[pointIndex],
          tileRate,
          atlasRows,
          seed,
          hasBackfaces,
        );
        applyQuadStripSectionOpacityFade(out, sectionStart, solid);
        requestDistanceTangents(sectionStart, solid);
      }
      const previousSectionLength = solid - sectionStart;
      if (solid > 0) {
        restoreRawQuadStripSolidPositions(
          out.positions,
          rawPositions,
          solid - 1,
          lastSpawnPointIndex,
        );
        if (solid + 1 > 2 && previousSectionLength > 1) {
          fuseQuadStripSolids(out, solid - 2, solid - 1, generatesNewSolid);
        } else if (previousSectionLength === 1 && generatesNewSolid) {
          squashRawQuadStripSolid(
            out.positions,
            rawPositions,
            solid - 1,
            lastSpawnPointIndex,
          );
        }
      }
      sectionStart = solid;
    }
    restoreRawQuadStripSolidPositions(
      out.positions,
      rawPositions,
      solid,
      pointIndex,
    );
    restoreRawQuadStripSolidPositions(
      out.normals,
      rawNormals,
      solid,
      pointIndex,
    );
    const sectionLength = solid - sectionStart + 1;
    if (sectionLength === 2) {
      fuseQuadStripSolids(out, solid - 1, solid, generatesNewSolid);
    } else if (sectionLength > 2) {
      averageQuadStripSolid(out, solid - 2, solid - 1, solid);
      fuseQuadStripSolids(out, solid - 2, solid - 1, generatesNewSolid);
      fuseQuadStripSolids(out, solid - 1, solid, generatesNewSolid);
    }
    if (generatorClass === "QuadStripBrushDistanceUV") {
      updateQuadStripDistanceUvsForAppend(
        out,
        sectionStart,
        solid + 1,
        out.quadStripPressuredSizes[pointIndex],
        tileRate,
        atlasRows,
        seed,
        hasBackfaces,
      );
      applyQuadStripSectionOpacityFade(out, sectionStart, solid + 1);
      // DistanceUV unions requests for one section and flushes them when a new
      // section starts. A transient leading solid can extend that request past
      // the committed section boundary.
      requestDistanceTangents(sectionStart, solid + 1);
    } else if (
      generatorClass === "QuadStripUnitizedUVBrush" &&
      sectionState === 1
    ) {
      // The break update computes the completed section together with the new
      // leading solid. Capture those tangents now: later smoothing in the new
      // section moves that solid, but does not revisit the old section.
      updateQuadStripSectionTangents(
        out,
        previousSectionStart,
        Math.min(solid + 1, frontSolidCount),
      );
    }
    if (isTransientProvisional) {
      continue;
    }
    if (generatesNewSolid) {
      lastSpawnPointIndex = pointIndex;
    }
    solid += 1;
  }

  if (generatorClass === "QuadStripBrushStretchUV") {
    applyQuadStripStretchUvs(
      out,
      breakBefore,
      pointCount,
      atlasRows,
      seed,
      hasBackfaces,
    );
  }

  if (generatorClass === "QuadStripBrushDistanceUV") {
    if (pendingDistanceTangentStart >= 0) {
      updateQuadStripSectionTangents(
        out,
        pendingDistanceTangentStart,
        Math.min(pendingDistanceTangentEnd, frontSolidCount),
      );
    }
  } else if (generatorClass === "QuadStripUnitizedUVBrush") {
    updateQuadStripSectionTangents(out, sectionStart, frontSolidCount);
  } else {
    updateQuadStripTangents(out, breakBefore, pointCount, frontSolidCount);
  }

  if (hasBackfaces) {
    const backVertexOffset = frontSolidCount * 6;
    const reverse = [0, 2, 1, 3, 5, 4] as const;
    for (let frontSolid = 0; frontSolid < frontSolidCount; frontSolid += 1) {
      const frontVertex = frontSolid * 6;
      const backVertex = backVertexOffset + frontVertex;
      for (let corner = 0; corner < 6; corner += 1) {
        copyPosition(
          out.positions,
          frontVertex + reverse[corner],
          backVertex + corner,
        );
        copyNegatedNormal(
          out.normals,
          frontVertex + reverse[corner],
          backVertex + corner,
        );
        copyTangent(
          out.tangents,
          frontVertex + reverse[corner],
          backVertex + corner,
          true,
        );
        copyUv(
          out.uvs,
          frontVertex + reverse[corner],
          backVertex + corner,
        );
        out.colors[(backVertex + corner) * 4 + 3] =
          out.colors[(frontVertex + reverse[corner]) * 4 + 3];
        if (out.uv1Size === 3) {
          copyVec3At(
            out.vectorUvs,
            frontVertex + reverse[corner],
            backVertex + corner,
          );
        }
      }
    }
  }

  const vertexCount = frontSolidCount * 6 * (hasBackfaces ? 2 : 1);
  for (let offset = 0; offset < vertexCount * 3; offset += 1) {
    out.positions[offset] =
      out.positions[offset] / OPEN_BRUSH_UNITS_PER_METER;
  }
  resetBounds(out.bounds);
  for (let vertex = 0; vertex < vertexCount; vertex += 1) {
    includeBounds(out.bounds, out.positions, vertex);
  }
}

function restoreRawQuadStripSolidPositions(
  positions: Float32Array,
  rawPositions: Float32Array,
  solid: number,
  pointIndex: number,
): void {
  const destination = solid * 18;
  const source = pointIndex * 18;
  positions.set(rawPositions.subarray(source, source + 18), destination);
}

function squashRawQuadStripSolid(
  positions: Float32Array,
  rawPositions: Float32Array,
  solid: number,
  pointIndex: number,
): void {
  const vertex = solid * 6;
  const firstOffset = pointIndex * 18;
  const oppositeOffset = firstOffset + 12;
  const centerX = (rawPositions[firstOffset] + rawPositions[oppositeOffset]) * 0.5;
  const centerY =
    (rawPositions[firstOffset + 1] + rawPositions[oppositeOffset + 1]) * 0.5;
  const centerZ =
    (rawPositions[firstOffset + 2] + rawPositions[oppositeOffset + 2]) * 0.5;
  for (let corner = 0; corner < 6; corner += 1) {
    writePositionComponents(
      positions,
      vertex + corner,
      centerX,
      centerY,
      centerZ,
    );
  }
}

function applyQuadStripStretchUvs(
  out: BrushGeometryArrays,
  breakBefore: Uint8Array,
  pointCount: number,
  atlasRows: number,
  seed: number,
  hasBackfaces: boolean,
): void {
  let sectionStart = 0;
  let solid = 0;
  for (let segment = 0; segment < pointCount - 1; segment += 1) {
    const sectionState = breakBefore[segment + 1];
    if (sectionState === 2) {
      continue;
    }
    if (sectionState === 1) {
      applyQuadStripStretchUvSection(
        out,
        sectionStart,
        solid,
        atlasRows,
        seed,
        hasBackfaces,
      );
      sectionStart = solid;
    }
    solid += 1;
  }
  applyQuadStripStretchUvSection(
    out,
    sectionStart,
    solid,
    atlasRows,
    seed,
    hasBackfaces,
  );
}

function updateQuadStripDistanceUvsForAppend(
  out: BrushGeometryArrays,
  sectionStart: number,
  sectionEnd: number,
  pressuredSize: number,
  tileRate: number,
  atlasRows: number,
  seed: number,
  hasBackfaces: boolean,
): void {
  const firstUpdatedSolid = Math.max(sectionStart, sectionEnd - 3);
  const size = Math.max(pressuredSize, EPSILON);
  for (let solid = firstUpdatedSolid; solid < sectionEnd; solid += 1) {
    const vertex = solid * 6;
    let previousU: number;
    let previousV0: number;
    let previousV1: number;
    if (solid === sectionStart) {
      const stride = hasBackfaces ? 12 : 6;
      const random = statelessRandom01(seed, sectionStart * stride);
      const atlasRow = Math.floor(random * 3331) % atlasRows;
      previousU = random;
      previousV0 = atlasRow / atlasRows;
      previousV1 = (atlasRow + 1) / atlasRows;
    } else {
      const previousVertex = (solid - 1) * 6;
      previousU = out.uvs[(previousVertex + 2) * 2];
      previousV0 = 1 - out.uvs[(previousVertex + 5) * 2 + 1];
      previousV1 = 1 - out.uvs[(previousVertex + 4) * 2 + 1];
    }
    const lengthSource = getQuadStripSolidLength(out.positions, solid);
    const sizeSource = Math.fround(size * OPEN_BRUSH_UNITS_PER_METER);
    const nextU = Math.fround(
      Math.fround(previousU) +
        Math.fround(
          Math.fround(tileRate) * Math.fround(lengthSource / sizeSource),
        ),
    );
    writeQuadStripUvQuad(
      out.uvs,
      vertex,
      previousU,
      nextU,
      previousV0,
      previousV1,
    );
  }
}

function applyQuadStripStretchUvSection(
  out: BrushGeometryArrays,
  firstSolid: number,
  endSolid: number,
  atlasRows: number,
  seed: number,
  hasBackfaces: boolean,
): void {
  let sectionLength = 0;
  for (let solid = firstSolid; solid < endSolid; solid += 1) {
    sectionLength += getQuadStripSolidLength(out.positions, solid);
  }
  if (sectionLength <= EPSILON) {
    sectionLength = 1;
  }
  let runningLength = 0;
  const quadsPerSolid = hasBackfaces ? 2 : 1;
  const random = statelessRandom01(seed, firstSolid * quadsPerSolid * 6);
  const atlasRow = Math.floor(random * atlasRows);
  const v0 = atlasRow / atlasRows;
  const v1 = (atlasRow + 1) / atlasRows;
  for (let solid = firstSolid; solid < endSolid; solid += 1) {
    const solidLength = getQuadStripSolidLength(out.positions, solid);
    const startU = runningLength / sectionLength;
    runningLength += solidLength;
    const endU = runningLength / sectionLength;
    const vertex = solid * 6;
    writeQuadStripUvQuad(out.uvs, vertex, startU, endU, v0, v1);
  }
}

function writeQuadStripUvQuad(
  uvs: Float32Array,
  vertex: number,
  previousU: number,
  nextU: number,
  v0: number,
  v1: number,
): void {
  let offset = vertex * 2;
  uvs[offset] = previousU;
  uvs[offset + 1] = 1 - v0;
  offset += 2;
  uvs[offset] = previousU;
  uvs[offset + 1] = 1 - v1;
  offset += 2;
  uvs[offset] = nextU;
  uvs[offset + 1] = 1 - v0;
  offset += 2;
  uvs[offset] = previousU;
  uvs[offset + 1] = 1 - v1;
  offset += 2;
  uvs[offset] = nextU;
  uvs[offset + 1] = 1 - v1;
  offset += 2;
  uvs[offset] = nextU;
  uvs[offset + 1] = 1 - v0;
}

function updateQuadStripTangents(
  out: BrushGeometryArrays,
  breakBefore: Uint8Array,
  pointCount: number,
  solidCount: number,
): void {
  let sectionStart = 0;
  let solid = 0;
  for (let segment = 0; segment < pointCount - 1; segment += 1) {
    const sectionState = breakBefore[segment + 1];
    if (sectionState === 2) {
      continue;
    }
    if (sectionState === 1) {
      updateQuadStripSectionTangents(out, sectionStart, solid);
      sectionStart = solid;
    }
    solid += 1;
  }
  updateQuadStripSectionTangents(out, sectionStart, Math.min(solid, solidCount));
}

/** Port of BaseBrushScript.ComputeTangentSpaceForQuads for canonical Three winding. */
function updateQuadStripSectionTangents(
  out: BrushGeometryArrays,
  firstSolid: number,
  endSolid: number,
): void {
  const surfaceTangent: Vec3 = [0, 0, 0];
  const surfaceBitangent: Vec3 = [0, 0, 0];
  const normal: Vec3 = [0, 0, 0];
  const normalCrossTangent: Vec3 = [0, 0, 0];
  let handedness = 1;
  for (let solid = firstSolid; solid < endSolid; solid += 1) {
    const vertex = solid * 6;
    // Open Brush computes S/T from source corners 0,1,2. After reflecting to
    // Three and canonicalizing winding, those records are corners 0,2,1.
    computeTriangleSurfaceTangent(
      out.positions,
      out.uvs,
      vertex,
      vertex + 2,
      vertex + 1,
      surfaceTangent,
      true,
    );
    if (solid === firstSolid) {
      computeTriangleSurfaceBitangent(
        out.positions,
        out.uvs,
        vertex,
        vertex + 2,
        vertex + 1,
        surfaceBitangent,
        true,
      );
      const normalOffset = vertex * 3;
      normal[0] = out.normals[normalOffset];
      normal[1] = out.normals[normalOffset + 1];
      normal[2] = out.normals[normalOffset + 2];
      cross(normal, surfaceTangent, normalCrossTangent);
      // Unity-to-Three reflection reverses tangent-space handedness.
      handedness = dot(normalCrossTangent, surfaceBitangent) < 0 ? -1 : 1;
    } else {
      handedness = out.tangents[(vertex - 6) * 4 + 3];
    }

    writeOrthonormalTangent(
      out.tangents,
      out.normals,
      vertex,
      surfaceTangent,
      handedness,
    );
    writeOrthonormalTangent(
      out.tangents,
      out.normals,
      vertex + 1,
      surfaceTangent,
      handedness,
    );
    copyVec4At(out.tangents, vertex + 1, vertex + 3);

    if (solid > firstSolid) {
      const previousVertex = vertex - 6;
      copyVec4At(out.tangents, vertex, previousVertex + 2);
      copyVec4At(out.tangents, vertex, previousVertex + 5);
      copyVec4At(out.tangents, vertex + 1, previousVertex + 4);
    }

    if (solid + 1 === endSolid) {
      writeOrthonormalTangent(
        out.tangents,
        out.normals,
        vertex + 2,
        surfaceTangent,
        handedness,
      );
      copyVec4At(out.tangents, vertex + 2, vertex + 5);
      writeOrthonormalTangent(
        out.tangents,
        out.normals,
        vertex + 4,
        surfaceTangent,
        handedness,
      );
    }
  }
}

function applyQuadStripSectionOpacityFade(
  out: BrushGeometryArrays,
  firstSolid: number,
  endSolid: number,
): void {
  let distanceFromLeadingEdge = 0;
  for (let solid = endSolid - 1; solid >= firstSolid; solid -= 1) {
    const leadingAlpha = quantizeColorByte(
      Math.min(1, distanceFromLeadingEdge / QUAD_STRIP_OPACITY_FADE_METERS),
    );
    distanceFromLeadingEdge +=
      getQuadStripSolidLength(out.positions, solid) /
      OPEN_BRUSH_UNITS_PER_METER;
    const trailingAlpha =
      solid === firstSolid
        ? 0
        : quantizeColorByte(
            Math.min(
              1,
              distanceFromLeadingEdge / QUAD_STRIP_OPACITY_FADE_METERS,
            ),
          );
    const vertex = solid * 6;
    out.colors[vertex * 4 + 3] = trailingAlpha;
    out.colors[(vertex + 1) * 4 + 3] = trailingAlpha;
    out.colors[(vertex + 3) * 4 + 3] = trailingAlpha;
    out.colors[(vertex + 2) * 4 + 3] = leadingAlpha;
    out.colors[(vertex + 4) * 4 + 3] = leadingAlpha;
    out.colors[(vertex + 5) * 4 + 3] = leadingAlpha;
  }
}

function getQuadStripSolidLength(
  positions: Float32Array,
  solid: number,
): number {
  const vertex = solid * 6;
  return Math.fround(
    Math.fround(
      distanceBetweenPositionVertices(positions, vertex, vertex + 2) +
        distanceBetweenPositionVertices(positions, vertex + 3, vertex + 4),
    ) * 0.5,
  );
}

function distanceBetweenPositionVertices(
  positions: Float32Array,
  firstVertex: number,
  secondVertex: number,
): number {
  const first = firstVertex * 3;
  const second = secondVertex * 3;
  return unityFloatMagnitudeComponents(
    Math.fround(positions[second] - positions[first]),
    Math.fround(positions[second + 1] - positions[first + 1]),
    Math.fround(positions[second + 2] - positions[first + 2]),
  );
}

function quantizeColorByte(value: number): number {
  return Math.floor(value * 255) / 255;
}

function quantizeColorByteRounded(value: number): number {
  return Math.round(value * 255) / 255;
}

const QUAD_STRIP_OPACITY_FADE_METERS = 0.025;

function averageQuadStripSolid(
  out: BrushGeometryArrays,
  backSolid: number,
  middleSolid: number,
  frontSolid: number,
): void {
  const backVertex = backSolid * 6;
  const middleVertex = middleSolid * 6;
  const frontVertex = frontSolid * 6;
  for (let corner = 0; corner < 6; corner += 1) {
    const backOffset = (backVertex + corner) * 3;
    const middleOffset = (middleVertex + corner) * 3;
    const frontOffset = (frontVertex + corner) * 3;
    out.positions[middleOffset] =
      (out.positions[backOffset] + out.positions[frontOffset]) * 0.5;
    out.positions[middleOffset + 1] =
      (out.positions[backOffset + 1] + out.positions[frontOffset + 1]) * 0.5;
    out.positions[middleOffset + 2] =
      (out.positions[backOffset + 2] + out.positions[frontOffset + 2]) * 0.5;
  }
}

function fuseQuadStripSolids(
  out: BrushGeometryArrays,
  backSolid: number,
  frontSolid: number,
  alterBackSolid = true,
): void {
  const backVertex = backSolid * 6;
  const frontVertex = frontSolid * 6;
  const backNormalOffset = (backVertex + 2) * 3;
  const frontNormalOffset = frontVertex * 3;
  let nx = out.normals[backNormalOffset];
  let ny = out.normals[backNormalOffset + 1];
  let nz = out.normals[backNormalOffset + 2];
  if (alterBackSolid) {
    nx += out.normals[frontNormalOffset];
    ny += out.normals[frontNormalOffset + 1];
    nz += out.normals[frontNormalOffset + 2];
    const normalLength = Math.hypot(nx, ny, nz);
    if (normalLength > EPSILON) {
      nx /= normalLength;
      ny /= normalLength;
      nz /= normalLength;
    } else {
      nx = out.normals[backNormalOffset];
      ny = out.normals[backNormalOffset + 1];
      nz = out.normals[backNormalOffset + 2];
    }
  }
  fuseQuadStripEdge(
    out,
    backVertex,
    frontVertex,
    2,
    0,
    nx,
    ny,
    nz,
    alterBackSolid,
  );
  fuseQuadStripEdge(
    out,
    backVertex,
    frontVertex,
    4,
    1,
    nx,
    ny,
    nz,
    alterBackSolid,
  );
  copyPosition(out.positions, backVertex + 2, backVertex + 5);
  copyPosition(out.positions, frontVertex + 1, frontVertex + 3);
  copyVec3At(out.normals, backVertex + 2, backVertex + 5);
  copyVec3At(out.normals, frontVertex + 1, frontVertex + 3);
}

function fuseQuadStripEdge(
  out: BrushGeometryArrays,
  backVertex: number,
  frontVertex: number,
  backCorner: number,
  frontCorner: number,
  nx: number,
  ny: number,
  nz: number,
  alterBackVertex: boolean,
): void {
  const backOffset = (backVertex + backCorner) * 3;
  const frontOffset = (frontVertex + frontCorner) * 3;
  const x = alterBackVertex
    ? (out.positions[backOffset] + out.positions[frontOffset]) * 0.5
    : out.positions[backOffset];
  const y = alterBackVertex
    ? (out.positions[backOffset + 1] + out.positions[frontOffset + 1]) * 0.5
    : out.positions[backOffset + 1];
  const z = alterBackVertex
    ? (out.positions[backOffset + 2] + out.positions[frontOffset + 2]) * 0.5
    : out.positions[backOffset + 2];
  if (alterBackVertex) {
    writeQuadStripFusedCorner(
      out,
      backVertex + backCorner,
      x,
      y,
      z,
      nx,
      ny,
      nz,
    );
  }
  writeQuadStripFusedCorner(
    out,
    frontVertex + frontCorner,
    x,
    y,
    z,
    nx,
    ny,
    nz,
  );
}

function writeQuadStripFusedCorner(
  out: BrushGeometryArrays,
  vertex: number,
  x: number,
  y: number,
  z: number,
  nx: number,
  ny: number,
  nz: number,
): void {
  const offset = vertex * 3;
  out.positions[offset] = x;
  out.positions[offset + 1] = y;
  out.positions[offset + 2] = z;
  out.normals[offset] = nx;
  out.normals[offset + 1] = ny;
  out.normals[offset + 2] = nz;
}

function smoothFlatGeometryEdges(
  stroke: StrokeData,
  positions: Float32Array,
  halfRights: Float32Array,
  breakBefore: Uint8Array,
  smoothedPressures: Float32Array,
  previousRetained: Int32Array,
  nextRetained: Int32Array,
  localBrushSize: number,
  pressureSizeMin: number,
  bounds: BrushGeometryBounds,
  pointCount: number,
  sourcePositions: Float32Array,
): void {
  resetBounds(bounds);
  for (let index = 1; index < pointCount; index += 1) {
    if (breakBefore[index] !== 0) {
      continue;
    }
    const previousIndex = previousRetained[index];
    const nextIndex = nextRetained[index];
    const startsSection =
      previousIndex === 0 || breakBefore[previousIndex] === 1;
    const endsSection =
      nextIndex === index || breakBefore[nextIndex] === 1;
    const point = stroke.controlPoints[index].position;
    const previous = stroke.controlPoints[previousIndex].position;
    const next = stroke.controlPoints[nextIndex].position;
    const center: Vec3 = [
      openBrushWeightedPosition(previous[0], point[0], next[0]),
      openBrushWeightedPosition(previous[1], point[1], next[1]),
      openBrushWeightedPosition(previous[2], point[2], next[2]),
    ];
    const currentOffset = index * 3;
    let rightX = halfRights[currentOffset];
    let rightY = halfRights[currentOffset + 1];
    let rightZ = halfRights[currentOffset + 2];
    if (!endsSection) {
      const previousOffset = previousIndex * 3;
      const nextOffset = nextIndex * 3;
      const previousRightX = previousIndex === 0
        ? halfRights[currentOffset]
        : halfRights[previousOffset];
      const previousRightY = previousIndex === 0
        ? halfRights[currentOffset + 1]
        : halfRights[previousOffset + 1];
      const previousRightZ = previousIndex === 0
        ? halfRights[currentOffset + 2]
        : halfRights[previousOffset + 2];
      rightX = openBrushWeightedOffset(
        previousRightX,
        halfRights[currentOffset],
        halfRights[nextOffset],
      );
      rightY = openBrushWeightedOffset(
        previousRightY,
        halfRights[currentOffset + 1],
        halfRights[nextOffset + 1],
      );
      rightZ = openBrushWeightedOffset(
        previousRightZ,
        halfRights[currentOffset + 2],
        halfRights[nextOffset + 2],
      );
    }
    if (startsSection) {
      const currentLength = Math.hypot(
        halfRights[currentOffset],
        halfRights[currentOffset + 1],
        halfRights[currentOffset + 2],
      );
      const previousHalfSize =
        localBrushSize *
        getPressureSizeMultiplier(
          smoothedPressures[previousIndex],
          pressureSizeMin,
        ) *
        0.5;
      const scale = currentLength > EPSILON ? previousHalfSize / currentLength : 0;
      const previousRightX = halfRights[currentOffset] * scale;
      const previousRightY = halfRights[currentOffset + 1] * scale;
      const previousRightZ = halfRights[currentOffset + 2] * scale;
      const previousLeftVertex = previousIndex * 2;
      const previousRightVertex = previousLeftVertex + 1;
      writeOpenBrushComponentOffsetPosition(
        positions,
        previousLeftVertex,
        previous,
        -previousRightX,
        -previousRightY,
        -previousRightZ,
        sourcePositions,
      );
      writeOpenBrushComponentOffsetPosition(
        positions,
        previousRightVertex,
        previous,
        previousRightX,
        previousRightY,
        previousRightZ,
        sourcePositions,
      );
      includeBounds(bounds, positions, previousLeftVertex);
      includeBounds(bounds, positions, previousRightVertex);
    }
    const leftVertex = index * 2;
    const rightVertex = leftVertex + 1;
    writeOpenBrushComponentOffsetPosition(
      positions,
      leftVertex,
      center,
      -rightX,
      -rightY,
      -rightZ,
      sourcePositions,
    );
    writeOpenBrushComponentOffsetPosition(
      positions,
      rightVertex,
      center,
      rightX,
      rightY,
      rightZ,
      sourcePositions,
    );
    includeBounds(bounds, positions, leftVertex);
    includeBounds(bounds, positions, rightVertex);
  }
}

function updateFlatGeometryTangents(
  positions: Float32Array,
  normals: Float32Array,
  tangents: Float32Array,
  uvs: Float32Array,
  breakBefore: Uint8Array,
  pointCount: number,
  positionsAreOpenBrushUnits = false,
): void {
  const firstTriangle: Vec3 = [0, 0, 0];
  const secondTriangle: Vec3 = [0, 0, 0];
  const combined: Vec3 = [0, 0, 0];
  let previousPoint = 0;
  let previousHasGeometry = false;
  for (let currentPoint = 1; currentPoint < pointCount; currentPoint += 1) {
    if (breakBefore[currentPoint] === 2) {
      continue;
    }
    if (breakBefore[currentPoint] === 1) {
      previousPoint = currentPoint;
      previousHasGeometry = false;
      continue;
    }
    const leftPrevious = previousPoint * 2;
    const rightPrevious = leftPrevious + 1;
    const leftCurrent = currentPoint * 2;
    const rightCurrent = leftCurrent + 1;
    computeTriangleSurfaceTangent(
      positions,
      uvs,
      rightPrevious,
      leftPrevious,
      leftCurrent,
      firstTriangle,
      positionsAreOpenBrushUnits,
    );
    computeTriangleSurfaceTangent(
      positions,
      uvs,
      rightPrevious,
      leftCurrent,
      rightCurrent,
      secondTriangle,
      positionsAreOpenBrushUnits,
    );
    combined[0] = Math.fround(firstTriangle[0] + secondTriangle[0]);
    combined[1] = Math.fround(firstTriangle[1] + secondTriangle[1]);
    combined[2] = Math.fround(firstTriangle[2] + secondTriangle[2]);
    if (!previousHasGeometry) {
      writeOrthonormalTangent(
        tangents,
        normals,
        leftPrevious,
        combined,
      );
      writeOrthonormalTangent(
        tangents,
        normals,
        rightPrevious,
        secondTriangle,
      );
    }
    writeOrthonormalTangent(tangents, normals, leftCurrent, firstTriangle);
    writeOrthonormalTangent(
      tangents,
      normals,
      rightCurrent,
      combined,
    );
    previousPoint = currentPoint;
    previousHasGeometry = true;
  }
}

function computeTriangleSurfaceTangent(
  positions: Float32Array,
  uvs: Float32Array,
  first: number,
  second: number,
  third: number,
  out: Vec3,
  positionsAreOpenBrushUnits = false,
): void {
  const firstPosition = first * 3;
  const secondPosition = second * 3;
  const thirdPosition = third * 3;
  const firstUv = first * 2;
  const secondUv = second * 2;
  const thirdUv = third * 2;
  const scale = positionsAreOpenBrushUnits ? 1 : OPEN_BRUSH_UNITS_PER_METER;
  const x1 = openBrushStoredPositionDifference(positions, secondPosition, firstPosition, scale);
  const x2 = openBrushStoredPositionDifference(positions, thirdPosition, firstPosition, scale);
  const y1 = openBrushStoredPositionDifference(positions, secondPosition + 1, firstPosition + 1, scale);
  const y2 = openBrushStoredPositionDifference(positions, thirdPosition + 1, firstPosition + 1, scale);
  const z1 = openBrushStoredPositionDifference(positions, secondPosition + 2, firstPosition + 2, scale);
  const z2 = openBrushStoredPositionDifference(positions, thirdPosition + 2, firstPosition + 2, scale);
  const s1 = Math.fround(uvs[secondUv] - uvs[firstUv]);
  const s2 = Math.fround(uvs[thirdUv] - uvs[firstUv]);
  const firstV = Math.fround(1 - uvs[firstUv + 1]);
  const t1 = Math.fround(Math.fround(1 - uvs[secondUv + 1]) - firstV);
  const t2 = Math.fround(Math.fround(1 - uvs[thirdUv + 1]) - firstV);
  const determinant = Math.fround(
    Math.fround(s1 * t2) - Math.fround(s2 * t1),
  );
  if (Math.abs(determinant) <= EPSILON) {
    out[0] = x2;
    out[1] = y2;
    out[2] = z2;
    return;
  }
  const reciprocal = Math.fround(1 / determinant);
  out[0] = Math.fround(
    reciprocal * Math.fround(Math.fround(t2 * x1) - Math.fround(t1 * x2)),
  );
  out[1] = Math.fround(
    reciprocal * Math.fround(Math.fround(t2 * y1) - Math.fround(t1 * y2)),
  );
  out[2] = Math.fround(
    reciprocal * Math.fround(Math.fround(t2 * z1) - Math.fround(t1 * z2)),
  );
}

function computeTriangleSurfaceBitangent(
  positions: Float32Array,
  uvs: Float32Array,
  first: number,
  second: number,
  third: number,
  out: Vec3,
  positionsAreOpenBrushUnits = false,
): void {
  const firstPosition = first * 3;
  const secondPosition = second * 3;
  const thirdPosition = third * 3;
  const firstUv = first * 2;
  const secondUv = second * 2;
  const thirdUv = third * 2;
  const scale = positionsAreOpenBrushUnits ? 1 : OPEN_BRUSH_UNITS_PER_METER;
  const x1 = openBrushStoredPositionDifference(positions, secondPosition, firstPosition, scale);
  const x2 = openBrushStoredPositionDifference(positions, thirdPosition, firstPosition, scale);
  const y1 = openBrushStoredPositionDifference(positions, secondPosition + 1, firstPosition + 1, scale);
  const y2 = openBrushStoredPositionDifference(positions, thirdPosition + 1, firstPosition + 1, scale);
  const z1 = openBrushStoredPositionDifference(positions, secondPosition + 2, firstPosition + 2, scale);
  const z2 = openBrushStoredPositionDifference(positions, thirdPosition + 2, firstPosition + 2, scale);
  const s1 = Math.fround(uvs[secondUv] - uvs[firstUv]);
  const s2 = Math.fround(uvs[thirdUv] - uvs[firstUv]);
  const firstV = Math.fround(1 - uvs[firstUv + 1]);
  const t1 = Math.fround(Math.fround(1 - uvs[secondUv + 1]) - firstV);
  const t2 = Math.fround(Math.fround(1 - uvs[thirdUv + 1]) - firstV);
  const determinant = Math.fround(
    Math.fround(s1 * t2) - Math.fround(s2 * t1),
  );
  if (Math.abs(determinant) <= EPSILON) {
    out[0] = x1;
    out[1] = y1;
    out[2] = z1;
    return;
  }
  const reciprocal = Math.fround(1 / determinant);
  out[0] = Math.fround(
    reciprocal * Math.fround(Math.fround(s1 * x2) - Math.fround(s2 * x1)),
  );
  out[1] = Math.fround(
    reciprocal * Math.fround(Math.fround(s1 * y2) - Math.fround(s2 * y1)),
  );
  out[2] = Math.fround(
    reciprocal * Math.fround(Math.fround(s1 * z2) - Math.fround(s2 * z1)),
  );
}

function openBrushStoredPositionDifference(
  positions: Float32Array,
  left: number,
  right: number,
  scale: number,
): number {
  return Math.fround(
    Math.fround(positions[left] * scale) -
      Math.fround(positions[right] * scale),
  );
}

function writeOrthonormalTangent(
  tangents: Float32Array,
  normals: Float32Array,
  vertex: number,
  source: Vec3,
  handedness = 1,
): void {
  const normalOffset = vertex * 3;
  const nx = normals[normalOffset];
  const ny = normals[normalOffset + 1];
  const nz = normals[normalOffset + 2];
  const projection = Math.fround(
    Math.fround(
      Math.fround(source[0] * nx) + Math.fround(source[1] * ny),
    ) + Math.fround(source[2] * nz),
  );
  let x = Math.fround(source[0] - Math.fround(projection * nx));
  let y = Math.fround(source[1] - Math.fround(projection * ny));
  let z = Math.fround(source[2] - Math.fround(projection * nz));
  const length = unityFloatMagnitudeComponents(x, y, z);
  if (length > EPSILON) {
    x = Math.fround(x / length);
    y = Math.fround(y / length);
    z = Math.fround(z / length);
  } else {
    x = 1;
    y = 0;
    z = 0;
  }
  const tangentOffset = vertex * 4;
  tangents[tangentOffset] = x;
  tangents[tangentOffset + 1] = y;
  tangents[tangentOffset + 2] = z;
  tangents[tangentOffset + 3] = handedness;
}

function generateUnitizedRibbonGeometry(
  stroke: StrokeData,
  family: BrushGeometryFamily,
  options: BrushGeometryOptions,
  out: BrushGeometryArrays,
): boolean {
  out.uv0Size = 2;
  out.uv1Size = 0;
  const pointCount = stroke.controlPoints.length;
  prepareQuadStripSections(stroke, options, out);
  const rawSegmentCount = Math.max(0, pointCount - 1);
  const segmentCount = countConnectedRibbonSegments(
    out.ribbonBreakBefore,
    pointCount,
    true,
  );
  const sourceFrontVertexCount = rawSegmentCount * 4;
  const frontIndexCount = segmentCount * 6;
  const hasBackfaces = options.geometryParams?.renderBackfaces === true;
  const sourceVertexCount = sourceFrontVertexCount * (hasBackfaces ? 2 : 1);
  const vertexCount = frontIndexCount * (hasBackfaces ? 2 : 1);
  const indexCount = frontIndexCount * (hasBackfaces ? 2 : 1);
  const reallocated = ensureGeometryCapacity(
    out,
    vertexCount + sourceVertexCount,
    indexCount,
  );
  const {
    positions,
    normals,
    tangents,
    colors,
    uvs,
    indices,
    bounds,
    ribbonSmoothedPressures,
  } = out;
  const pressureSizeMin = normalizePressureSizeMin(options.pressureSizeRange?.[0]);
  const pressureOpacityMin = normalizePressureOpacityMin(
    options.pressureOpacityRange,
  );
  const pressureOpacityMax = normalizePressureOpacityMax(
    options.pressureOpacityRange,
  );
  const descriptorOpacity = normalizeDescriptorOpacity(
    options.geometryParams?.opacity,
  );
  const localBrushSize = getLocalBrushSize(stroke);

  const previousFrameRight: Vec3 = [0, 0, 0];
  const previousFallbackTangent: Vec3 = [0, 0, 0];
  const tangent: Vec3 = [0, 0, 0];
  const pointerForward: Vec3 = [0, 0, 0];
  const pointerUp: Vec3 = [0, 0, 0];
  const right: Vec3 = [0, 0, 0];
  const normal: Vec3 = [0, 0, 0];
  const leftPosition: Vec3 = [0, 0, 0];
  const rightPosition: Vec3 = [0, 0, 0];
  const previousLeftPosition: Vec3 = [0, 0, 0];
  const previousRightPosition: Vec3 = [0, 0, 0];
  const previousNormal: Vec3 = [0, 0, 0];
  const previousVertexTangent: Vec3 = [0, 0, 0];
  let previousOpacity = 1;

  for (let pointIndex = 0; pointIndex < pointCount; pointIndex += 1) {
    const point = stroke.controlPoints[pointIndex];
    const width =
      localBrushSize *
      getPressureSizeMultiplier(ribbonSmoothedPressures[pointIndex], pressureSizeMin) *
      0.5;
    const opacity =
      getPressureOpacityMultiplier(
        ribbonSmoothedPressures[pointIndex],
        pressureOpacityMin,
        pressureOpacityMax,
      ) * descriptorOpacity;

    writeCentralDifferenceTangent(
      stroke,
      pointIndex,
      previousFallbackTangent,
      tangent,
    );
    rotateByQuaternion(point.orientation, VEC_FORWARD, pointerForward);
    rotateByQuaternion(point.orientation, VEC_UP, pointerUp);
    computeSurfaceFrame(
      previousFrameRight,
      tangent,
      pointerForward,
      pointerUp,
      pointIndex === 0,
      right,
      normal,
    );
    leftPosition[0] = point.position[0] - right[0] * width;
    leftPosition[1] = point.position[1] - right[1] * width;
    leftPosition[2] = point.position[2] - right[2] * width;
    rightPosition[0] = point.position[0] + right[0] * width;
    rightPosition[1] = point.position[1] + right[1] * width;
    rightPosition[2] = point.position[2] + right[2] * width;

    if (pointIndex > 0) {
      const vertex = (pointIndex - 1) * 4;
      writePosition(positions, vertex, previousLeftPosition);
      writePosition(positions, vertex + 1, previousRightPosition);
      writePosition(positions, vertex + 2, leftPosition);
      writePosition(positions, vertex + 3, rightPosition);
      writeNormal(normals, vertex, previousNormal);
      writeNormal(normals, vertex + 1, previousNormal);
      writeNormal(normals, vertex + 2, normal);
      writeNormal(normals, vertex + 3, normal);
      writeTangent(tangents, vertex, previousVertexTangent, 1);
      writeTangent(tangents, vertex + 1, previousVertexTangent, 1);
      writeTangent(tangents, vertex + 2, tangent, 1);
      writeTangent(tangents, vertex + 3, tangent, 1);
      writeColor(colors, vertex, stroke.color, previousOpacity);
      writeColor(colors, vertex + 1, stroke.color, previousOpacity);
      writeColor(colors, vertex + 2, stroke.color, opacity);
      writeColor(colors, vertex + 3, stroke.color, opacity);
      writeUv(uvs, vertex, [0, 0]);
      writeUv(uvs, vertex + 1, [0, 1]);
      writeUv(uvs, vertex + 2, [1, 0]);
      writeUv(uvs, vertex + 3, [1, 1]);
      for (let offset = 0; offset < 4; offset += 1) {
        includeBounds(bounds, positions, vertex + offset);
      }
      const indexOffset = (pointIndex - 1) * 6;
      indices[indexOffset] = vertex;
      indices[indexOffset + 1] = vertex + 2;
      indices[indexOffset + 2] = vertex + 1;
      indices[indexOffset + 3] = vertex + 1;
      indices[indexOffset + 4] = vertex + 2;
      indices[indexOffset + 5] = vertex + 3;
    }

    copyVec3(leftPosition, previousLeftPosition);
    copyVec3(rightPosition, previousRightPosition);
    copyVec3(normal, previousNormal);
    copyVec3(tangent, previousVertexTangent);
    copyVec3(right, previousFrameRight);
    copyVec3(tangent, previousFallbackTangent);
    previousOpacity = opacity;
  }

  if (hasBackfaces) {
    const backfaceColor = shiftHue(
      stroke.color,
      normalizeHueShift(options.geometryParams?.backfaceHueShift),
    );
    for (let vertex = 0; vertex < sourceFrontVertexCount; vertex += 1) {
      const backVertex = sourceFrontVertexCount + vertex;
      copyPosition(positions, vertex, backVertex);
      copyNegatedNormal(normals, vertex, backVertex);
      copyTangent(tangents, vertex, backVertex, true);
      copyUv(uvs, vertex, backVertex);
      writeColorFromAlpha(
        colors,
        backVertex,
        backfaceColor,
        colors[vertex * 4 + 3],
      );
    }
    for (let segment = 0; segment < segmentCount; segment += 1) {
      const vertex = sourceFrontVertexCount + segment * 4;
      const indexOffset = frontIndexCount + segment * 6;
      indices[indexOffset] = vertex;
      indices[indexOffset + 1] = vertex + 1;
      indices[indexOffset + 2] = vertex + 2;
      indices[indexOffset + 3] = vertex + 1;
      indices[indexOffset + 4] = vertex + 3;
      indices[indexOffset + 5] = vertex + 2;
    }
  }

  expandUnitizedRibbonTriangleSoup(
    out,
    segmentCount,
    sourceFrontVertexCount,
    frontIndexCount,
    hasBackfaces,
    vertexCount,
  );
  applyQuadStripPositionQuads(
    out,
    stroke,
    options,
    out.ribbonBreakBefore,
    pointCount,
  );
  const unitizedUvs = [
    0, 0,
    0, 1,
    1, 0,
    0, 1,
    1, 1,
    1, 0,
  ] as const;
  for (let solid = 0; solid < segmentCount; solid += 1) {
    out.uvs.set(unitizedUvs, solid * 12);
  }
  applyQuadStripMidpointFusion(
    out,
    stroke,
    options,
    out.ribbonBreakBefore,
    pointCount,
    segmentCount,
    hasBackfaces,
    options.generatorClass,
    normalizeTileRate(options.geometryParams?.tileRate),
    normalizeAtlasRows(options.geometryParams?.textureAtlasV),
    stroke.seed,
  );

  const finalizedCounts = finalizeQuadStripUsedGeometry(
    out,
    out.ribbonBreakBefore,
    pointCount,
    segmentCount,
    hasBackfaces,
    options,
  );
  out.family = family;
  out.vertexCount = finalizedCounts?.vertexCount ?? vertexCount;
  out.indexCount = finalizedCounts?.indexCount ?? indexCount;
  if (hasBackfaces && out.vertexCount > 0) {
    interleaveQuadStripBackfaces(out, out.vertexCount / 12);
  }
  resetBounds(out.bounds);
  for (let vertex = 0; vertex < out.vertexCount; vertex += 1) {
    includeBounds(out.bounds, out.positions, vertex);
  }
  return reallocated;
}

function expandUnitizedRibbonTriangleSoup(
  out: BrushGeometryArrays,
  segmentCount: number,
  sourceFrontVertexCount: number,
  frontVertexCount: number,
  hasBackfaces: boolean,
  finalVertexCount: number,
): void {
  const sourceOffset = finalVertexCount;
  const sourceVertexCount = sourceFrontVertexCount * (hasBackfaces ? 2 : 1);
  for (let vertex = sourceVertexCount - 1; vertex >= 0; vertex -= 1) {
    copyRibbonVertex(out, vertex, sourceOffset + vertex);
  }
  const frontPattern = [0, 2, 1, 1, 2, 3] as const;
  const backPattern = [0, 1, 2, 1, 3, 2] as const;
  for (let segment = 0; segment < segmentCount; segment += 1) {
    const frontSource = sourceOffset + segment * 4;
    const frontDestination = segment * 6;
    for (let corner = 0; corner < 6; corner += 1) {
      copyRibbonVertex(
        out,
        frontSource + frontPattern[corner],
        frontDestination + corner,
      );
    }
    if (hasBackfaces) {
      const backSource = sourceOffset + sourceFrontVertexCount + segment * 4;
      const backDestination = frontVertexCount + segment * 6;
      for (let corner = 0; corner < 6; corner += 1) {
        copyRibbonVertex(
          out,
          backSource + backPattern[corner],
          backDestination + corner,
        );
      }
    }
  }
  for (let index = 0; index < finalVertexCount; index += 1) {
    out.indices[index] = index;
  }
}

const THICK_STRIP_TRIANGLE_PATTERN = [
  0, 8, 2, 0, 6, 8,
  1, 9, 7, 1, 3, 9,
  3, 5, 11, 3, 11, 9,
  2, 8, 10, 2, 10, 4,
] as const;

interface HullFace {
  a: number;
  b: number;
  c: number;
  normal: Vec3;
}

interface ConcaveHullBatch {
  points: Vec3[];
  faces: HullFace[];
}

interface Print3DBasis {
  tangent: Vec3;
  inlineWithPlaneNormal: boolean;
  planeNormal: Vec3;
  planeRight: Vec3;
  width: Vec3;
  thickness: Vec3;
  halfSize: number;
}

function generateSquare3DPrintGeometry(
  stroke: StrokeData,
  options: BrushGeometryOptions,
  out: BrushGeometryArrays,
): boolean {
  stroke = retainPrint3DControlPoints(stroke, out);
  out.family = "print3d";
  out.uv0Size = 2;
  ensureGeometryPressureCapacity(out, stroke.controlPoints.length);
  prepareGeometrySmoothedPressures(stroke, options, out);
  prepareGeometrySmoothedPositions(stroke, out);
  const segments: Array<Print3DBasis | undefined> = [undefined];
  const pressureSizeMin = normalizePressureSizeMin(options.pressureSizeRange?.[0]);
  let previousBasis: Print3DBasis | undefined;
  for (let i = 1; i < stroke.controlPoints.length; i += 1) {
    const basis = createPrint3DBasis(
      stroke,
      i,
      pressureSizeMin,
      out.geometrySmoothedPressures,
      out.geometrySmoothedPositions,
    );
    const breaksForRotation =
      basis !== undefined &&
      previousBasis !== undefined &&
      (dotVec3(previousBasis.planeNormal, basis.planeNormal) < 0.94 ||
        dotVec3(previousBasis.planeRight, basis.planeRight) < 0.94);
    segments.push(breaksForRotation ? undefined : basis);
    previousBasis = basis;
  }

  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  let segment = 1;
  while (segment < segments.length) {
    while (segment < segments.length && !segments[segment]) segment += 1;
    if (segment >= segments.length) break;
    const firstSegment = segment;
    while (segment + 1 < segments.length && segments[segment + 1]) segment += 1;
    const lastSegment = segment;
    appendPrint3DSection(
      stroke,
      segments as Print3DBasis[],
      firstSegment,
      lastSegment,
      positions,
      normals,
      indices,
      out.geometrySmoothedPositions,
      out.geometrySmoothedPressures,
      pressureSizeMin,
    );
    segment += 1;
  }

  const vertexCount = positions.length / 3;
  const reallocated = ensureGeometryCapacity(out, vertexCount, indices.length);
  for (let vertex = 0; vertex < vertexCount; vertex += 1) {
    const offset = vertex * 3;
    writePosition(out.positions, vertex, [positions[offset], positions[offset + 1], positions[offset + 2]]);
    writeNormal(out.normals, vertex, [normals[offset], normals[offset + 1], normals[offset + 2]]);
    writeTangent(out.tangents, vertex, [1, 0, 0], 1);
    writeColor(out.colors, vertex, stroke.color, 1);
    writeUv(out.uvs, vertex, [0, 0]);
    includeBounds(out.bounds, out.positions, vertex);
  }
  out.indices.set(indices, 0);
  out.vertexCount = vertexCount;
  out.indexCount = indices.length;
  return reallocated;
}

function retainPrint3DControlPoints(
  stroke: StrokeData,
  out: BrushGeometryArrays,
): StrokeData {
  const source = stroke.controlPoints;
  if (source.length < 2) {
    return stroke;
  }
  const retained = out.tubeRetainedControlPoints;
  retained.length = 0;
  retained.push(source[0]);
  let lastRetained = source[0];
  for (let pointIndex = 1; pointIndex < source.length; pointIndex += 1) {
    const point = source[pointIndex];
    if (
      pointIndex + 1 === source.length ||
      distanceBetweenControlPoints(lastRetained, point) > 0.005
    ) {
      retained.push(point);
      lastRetained = point;
    }
  }
  return retained.length === source.length
    ? stroke
    : { ...stroke, controlPoints: retained };
}

function createPrint3DBasis(
  stroke: StrokeData,
  index: number,
  pressureSizeMin: number,
  smoothedPressures: Float32Array,
  smoothedPositions: Float32Array,
): Print3DBasis | undefined {
  const current = stroke.controlPoints[index];
  const previousPosition: Vec3 = [0, 0, 0];
  const currentPosition: Vec3 = [0, 0, 0];
  readScratchVec3(smoothedPositions, index - 1, previousPosition);
  readScratchVec3(smoothedPositions, index, currentPosition);
  const tangent = subtractVec3(currentPosition, previousPosition);
  const distance = Math.sqrt(dotVec3(tangent, tangent));
  if (distance < 0.003 || !normalizeInPlace(tangent)) return undefined;
  return createPrint3DBasisForTangent(
    stroke,
    index,
    index,
    tangent,
    pressureSizeMin,
    smoothedPressures,
  );
}

function createPrint3DBasisForTangent(
  stroke: StrokeData,
  orientationIndex: number,
  pressureIndex: number,
  tangent: Vec3,
  pressureSizeMin: number,
  smoothedPressures: Float32Array,
  allowInPlane = false,
): Print3DBasis | undefined {
  const current = stroke.controlPoints[orientationIndex];
  const planeNormal: Vec3 = [0, 0, 0];
  const planeRight: Vec3 = [0, 0, 0];
  const planeForward: Vec3 = [0, 0, 0];
  rotateByQuaternion(current.orientation, VEC_UP, planeNormal);
  rotateByQuaternion(current.orientation, VEC_RIGHT, planeRight);
  rotateByQuaternion(current.orientation, VEC_FORWARD, planeForward);
  const alignment = dotVec3(tangent, planeNormal);
  if (!allowInPlane && Math.abs(alignment) < 0.0087) return undefined;
  const sign = alignment > 0 ? 1 : -1;
  const width: Vec3 = [...planeRight];
  const thickness: Vec3 = [
    planeForward[0] * -sign,
    planeForward[1] * -sign,
    planeForward[2] * -sign,
  ];
  const halfSize =
    getLocalBrushSize(stroke) *
    getPressureSizeMultiplier(smoothedPressures[pressureIndex], pressureSizeMin) *
    0.5;
  return {
    tangent,
    inlineWithPlaneNormal: alignment > 0,
    planeNormal,
    planeRight,
    width,
    thickness,
    halfSize,
  };
}

function appendPrint3DSection(
  stroke: StrokeData,
  segments: Print3DBasis[],
  firstSegment: number,
  lastSegment: number,
  positions: number[],
  normals: number[],
  indices: number[],
  smoothedPositions: Float32Array,
  smoothedPressures: Float32Array,
  pressureSizeMin: number,
): void {
  const firstBasis = segments[firstSegment];
  const center: Vec3 = [0, 0, 0];
  readScratchVec3(smoothedPositions, firstSegment - 1, center);
  const startCap = appendPrint3DCap(
    center,
    firstBasis,
    false,
    positions,
    normals,
  );
  const firstRing = appendPrint3DRing(
    center,
    firstBasis,
    positions,
    normals,
  );
  appendTriangle(indices, startCap + 2, startCap + 3, startCap + 1);
  appendTriangle(indices, startCap + 1, startCap + 3, startCap);
  appendPrint3DCapToRing(indices, firstRing, startCap, true);

  let previousRing = firstRing;
  for (let i = firstSegment; i <= lastSegment; i += 1) {
    const basis = segments[i];
    if (
      i > firstSegment &&
      segments[i - 1].inlineWithPlaneNormal !== basis.inlineWithPlaneNormal
    ) {
      appendPrint3DRingFace(indices, previousRing);
      readScratchVec3(smoothedPositions, i - 1, center);
      const previousBasisOnCurrentTangent = createPrint3DBasisForTangent(
        stroke,
        i - 1,
        i - 1,
        basis.tangent,
        pressureSizeMin,
        smoothedPressures,
        true,
      );
      if (previousBasisOnCurrentTangent) {
        previousRing = appendPrint3DRing(
          center,
          previousBasisOnCurrentTangent,
          positions,
          normals,
        );
      }
    }
    readScratchVec3(smoothedPositions, i, center);
    const ring = appendPrint3DRing(
      center,
      basis,
      positions,
      normals,
    );
    appendPrint3DMiddle(indices, previousRing, ring);
    previousRing = ring;
  }
  const lastBasis = segments[lastSegment];
  readScratchVec3(smoothedPositions, lastSegment, center);
  const endCap = appendPrint3DCap(
    center,
    lastBasis,
    true,
    positions,
    normals,
  );
  appendPrint3DCapToRing(indices, previousRing, endCap, false);
  appendTriangle(indices, endCap + 1, endCap, endCap + 2);
  appendTriangle(indices, endCap + 2, endCap, endCap + 3);
}

function appendPrint3DRingFace(indices: number[], ring: number): void {
  for (let vertex = 2; vertex < 8; vertex += 1) {
    appendTriangle(indices, ring + vertex, ring + vertex - 1, ring);
  }
}

function appendPrint3DRing(
  center: Vec3,
  basis: Print3DBasis,
  positions: number[],
  normals: number[],
  halfSize = basis.halfSize,
): number {
  const first = positions.length / 3;
  const bevelRatio = 0.99;
  const bevelRadius = halfSize * (1 - bevelRatio);
  for (const [startDegrees, stopDegrees] of [[360, 270], [270, 180], [180, 90], [90, 0]] as const) {
    const middle = ((startDegrees + stopDegrees) * Math.PI) / 360;
    const originWidth = Math.sign(Math.cos(middle)) * halfSize * bevelRatio;
    const originThickness = Math.sign(Math.sin(middle)) * halfSize * bevelRatio;
    for (const degrees of [startDegrees, stopDegrees]) {
      const radians = (degrees * Math.PI) / 180;
      const widthOffset = originWidth + Math.cos(radians) * bevelRadius;
      const thicknessOffset = originThickness + Math.sin(radians) * bevelRadius;
      appendPrint3DVertex(
        center,
        basis,
        widthOffset,
        thicknessOffset,
        positions,
        normals,
      );
    }
  }
  return first;
}

function appendPrint3DCap(
  center: Vec3,
  basis: Print3DBasis,
  ending: boolean,
  positions: number[],
  normals: number[],
  halfSize = basis.halfSize,
): number {
  const first = positions.length / 3;
  const inset = halfSize * 0.99;
  const direction = ending ? 1 : -1;
  const capCenter: Vec3 = [
    center[0] + basis.tangent[0] * 0.001 * direction,
    center[1] + basis.tangent[1] * 0.001 * direction,
    center[2] + basis.tangent[2] * 0.001 * direction,
  ];
  for (const [width, thickness] of [[1, -1], [-1, -1], [-1, 1], [1, 1]] as const) {
    const position: Vec3 = [
      capCenter[0] + basis.width[0] * inset * width + basis.thickness[0] * inset * thickness,
      capCenter[1] + basis.width[1] * inset * width + basis.thickness[1] * inset * thickness,
      capCenter[2] + basis.width[2] * inset * width + basis.thickness[2] * inset * thickness,
    ];
    positions.push(...position);
    normals.push(
      basis.tangent[0] * direction,
      basis.tangent[1] * direction,
      basis.tangent[2] * direction,
    );
  }
  return first;
}

function appendPrint3DVertex(
  center: Vec3,
  basis: Print3DBasis,
  widthOffset: number,
  thicknessOffset: number,
  positions: number[],
  normals: number[],
): void {
  positions.push(
    center[0] + basis.width[0] * widthOffset + basis.thickness[0] * thicknessOffset,
    center[1] + basis.width[1] * widthOffset + basis.thickness[1] * thicknessOffset,
    center[2] + basis.width[2] * widthOffset + basis.thickness[2] * thicknessOffset,
  );
  const normal: Vec3 = [
    basis.width[0] * widthOffset + basis.thickness[0] * thicknessOffset,
    basis.width[1] * widthOffset + basis.thickness[1] * thicknessOffset,
    basis.width[2] * widthOffset + basis.thickness[2] * thicknessOffset,
  ];
  normalizeInPlace(normal);
  normals.push(...normal);
}

function appendPrint3DMiddle(indices: number[], ring0: number, ring1: number): void {
  for (let i = 0; i < 8; i += 1) {
    const next = (i + 1) % 8;
    appendQuad(indices, ring0 + next, ring0 + i, ring1 + i, ring1 + next);
  }
}

function appendPrint3DCapToRing(
  indices: number[],
  ring: number,
  cap: number,
  starting: boolean,
): void {
  for (let corner = 0; corner < 4; corner += 1) {
    const inner = cap + corner;
    const fanStart = ring + corner * 2;
    const fanEnd = fanStart + 1;
    const nextInner = cap + ((corner + 1) % 4);
    const nextFan = ring + ((corner + 1) % 4) * 2;
    if (starting) {
      appendTriangle(indices, inner, fanStart, fanEnd);
      appendQuad(indices, inner, fanEnd, nextFan, nextInner);
    } else {
      appendTriangle(indices, inner, fanEnd, fanStart);
      appendQuad(indices, fanEnd, inner, nextInner, nextFan);
    }
  }
}

function appendQuad(indices: number[], v0: number, v1: number, v2: number, v3: number): void {
  appendTriangle(indices, v0, v1, v3);
  appendTriangle(indices, v3, v1, v2);
}

function appendTriangle(indices: number[], a: number, b: number, c: number): void {
  // Open Brush/Unity uses clockwise front faces; Three.js uses counter-clockwise.
  indices.push(a, c, b);
}

function generateConcaveHullGeometry(
  stroke: StrokeData,
  options: BrushGeometryOptions,
  out: BrushGeometryArrays,
): boolean {
  out.family = "concave-hull";
  out.uv0Size = 2;
  const pressureSizeMin = normalizePressureSizeMin(options.pressureSizeRange?.[0]);
  const localBrushSize = getLocalBrushSize(stroke);
  const knotPoints: [Vec3, Vec3][] = [];
  const right: Vec3 = [0, 0, 0];
  for (let knotIndex = 0; knotIndex < stroke.controlPoints.length; knotIndex += 1) {
    const controlPoint = stroke.controlPoints[knotIndex];
    rotateByQuaternion(controlPoint.orientation, VEC_RIGHT, right);
    const sourcePressure = knotIndex < 2 ? 0 : controlPoint.pressure;
    const halfSize =
      localBrushSize *
      getPressureSizeMultiplier(sourcePressure, pressureSizeMin) *
      0.5;
    const extent: Vec3 = [right[0] * halfSize, right[1] * halfSize, right[2] * halfSize];
    knotPoints.push([
      subtractVec3(controlPoint.position, extent),
      [
        controlPoint.position[0] + extent[0],
        controlPoint.position[1] + extent[1],
        controlPoint.position[2] + extent[2],
      ],
    ]);
  }
  const batches: ConcaveHullBatch[] = [];
  for (let knotIndex = 0; knotIndex < knotPoints.length; knotIndex += 1) {
    const first = Math.max(0, knotIndex + 1 - 5);
    const points = knotPoints.slice(first, knotIndex + 1).flat();
    const faces = createConvexHull(points);
    if (faces.length > 0) batches.push({ points, faces });
  }
  const faceCount = batches.reduce((sum, batch) => sum + batch.faces.length, 0);
  const vertexCount = faceCount * 3;
  const indexCount = vertexCount;
  const reallocated = ensureGeometryCapacity(out, vertexCount, indexCount);
  let vertex = 0;
  for (const batch of batches) {
    for (const face of batch.faces) {
      for (const pointIndex of [face.a, face.b, face.c]) {
        writeConcaveHullVertex(
          out,
          vertex,
          batch.points[pointIndex],
          face.normal,
          stroke.color,
        );
        out.indices[vertex] = vertex;
        vertex += 1;
      }
    }
  }
  out.vertexCount = vertexCount;
  out.indexCount = indexCount;
  return reallocated;
}

function writeConcaveHullVertex(
  out: BrushGeometryArrays,
  vertex: number,
  position: Vec3,
  normal: Vec3,
  color: Rgba,
): void {
  writePosition(out.positions, vertex, position);
  writeNormal(out.normals, vertex, normal);
  writeTangent(out.tangents, vertex, [1, 0, 0], 1);
  writeColor(out.colors, vertex, color, 1);
  writeUv(out.uvs, vertex, [0, 0]);
  includeBounds(out.bounds, out.positions, vertex);
}

function generateHullGeometry(
  stroke: StrokeData,
  options: BrushGeometryOptions,
  out: BrushGeometryArrays,
): boolean {
  out.family = "hull";
  out.uv0Size = 3;
  const points = createHullInputPoints(stroke, options);
  const faces = createConvexHull(points);
  const faceted = options.geometryParams?.hullFaceted !== false;
  const doubleSided = options.geometryParams?.renderBackfaces === true;
  const copies = doubleSided ? 2 : 1;
  const hullPointIndices = faceted
    ? []
    : [...new Set(faces.flatMap((face) => [face.a, face.b, face.c]))];
  const frontVertexCount = faceted ? faces.length * 3 : hullPointIndices.length;
  const vertexCount = frontVertexCount * copies;
  const indexCount = faces.length * 3 * copies;
  const reallocated = ensureGeometryCapacity(out, vertexCount, indexCount);
  const normalsByPoint = faceted
    ? undefined
    : createSmoothHullNormals(points, faces, hullPointIndices);
  const pointToVertex = new Map<number, number>();
  const localBrushSize = getLocalBrushSize(stroke);
  let vertex = 0;

  if (faceted) {
    for (const face of faces) {
      for (const pointIndex of [face.a, face.b, face.c]) {
        writeHullVertex(out, vertex, points[pointIndex], face.normal, stroke.color, localBrushSize);
        vertex += copies;
      }
    }
  } else {
    for (const pointIndex of hullPointIndices) {
      pointToVertex.set(pointIndex, vertex);
      writeHullVertex(
        out,
        vertex,
        points[pointIndex],
        normalsByPoint?.get(pointIndex) ?? [0, 1, 0],
        stroke.color,
        localBrushSize,
      );
      vertex += copies;
    }
  }

  if (doubleSided) {
    for (let front = 0; front < frontVertexCount; front += 1) {
      const source = front * 2;
      const back = source + 1;
      copyHullVertexAsBackface(out, source, back);
    }
  }

  let index = 0;
  for (let faceIndex = 0; faceIndex < faces.length; faceIndex += 1) {
    const face = faces[faceIndex];
    const a = faceted ? faceIndex * 3 * copies : pointToVertex.get(face.a) ?? 0;
    const b = faceted ? a + copies : pointToVertex.get(face.b) ?? 0;
    const c = faceted ? b + copies : pointToVertex.get(face.c) ?? 0;
    out.indices[index++] = a;
    out.indices[index++] = b;
    out.indices[index++] = c;
    if (doubleSided) {
      out.indices[index++] = a + 1;
      out.indices[index++] = c + 1;
      out.indices[index++] = b + 1;
    }
  }
  out.vertexCount = vertexCount;
  out.indexCount = indexCount;
  return reallocated;
}

function createHullInputPoints(
  stroke: StrokeData,
  options: BrushGeometryOptions,
): Vec3[] {
  switch (options.geometryParams?.hullKnotConversion ?? "directed-sphere") {
    case "point":
      return createPointHullInputPoints(stroke);
    case "tetrahedron":
      return createTetrahedronHullInputPoints(stroke);
    case "directed-sphere":
      return createDirectedSphereHullInputPoints(stroke, options);
  }
}

function createPointHullInputPoints(stroke: StrokeData): Vec3[] {
  return stroke.controlPoints.map((controlPoint) => [...controlPoint.position]);
}

function createTetrahedronHullInputPoints(stroke: StrokeData): Vec3[] {
  const points: Vec3[] = [];
  const seen = new Set<string>();
  const halfWidth = getLocalBrushSize(stroke) / Math.sqrt(3);
  const offsets: readonly Vec3[] = [
    [-halfWidth, -halfWidth, -halfWidth],
    [halfWidth, halfWidth, -halfWidth],
    [halfWidth, -halfWidth, halfWidth],
    [-halfWidth, halfWidth, halfWidth],
  ];
  for (const controlPoint of stroke.controlPoints) {
    for (const offset of offsets) {
      const point: Vec3 = [
        controlPoint.position[0] + offset[0],
        controlPoint.position[1] + offset[1],
        controlPoint.position[2] + offset[2],
      ];
      const key = `${point[0].toPrecision(12)},${point[1].toPrecision(12)},${point[2].toPrecision(12)}`;
      if (!seen.has(key)) {
        seen.add(key);
        points.push(point);
      }
    }
  }
  return points;
}

/** Port of HullBrush.KnotConversion.DirectedSphere. */
function createDirectedSphereHullInputPoints(
  stroke: StrokeData,
  options: BrushGeometryOptions,
): Vec3[] {
  if (stroke.controlPoints.length === 0) {
    return [];
  }
  const retainedPoints: number[] = [0];
  let previousRetained = 0;
  for (let index = 1; index < stroke.controlPoints.length; index += 1) {
    if (
      distanceBetweenControlPoints(
        stroke.controlPoints[previousRetained],
        stroke.controlPoints[index],
      ) < OPEN_BRUSH_RIBBON_MINIMUM_MOVE_METERS
    ) {
      continue;
    }
    retainedPoints.push(index);
    previousRetained = index;
  }

  const points: Vec3[] = [[...stroke.controlPoints[retainedPoints[0]].position]];
  const pressureSizeMin = normalizePressureSizeMin(options.pressureSizeRange?.[0]);
  const localBrushSize = getLocalBrushSize(stroke);
  const previousRight: Vec3 = [0, 0, 0];
  const direction: Vec3 = [0, 0, 0];
  const pointerForward: Vec3 = [0, 0, 0];
  const pointerUp: Vec3 = [0, 0, 0];
  const right: Vec3 = [0, 0, 0];
  const normal: Vec3 = [0, 0, 0];
  const ringPoint: Vec3 = [0, 0, 0];
  const rotated: Vec3 = [0, 0, 0];
  const ringAngle = Math.PI / 4;
  const aroundRingAngle = Math.PI / 2;

  for (let retainedIndex = 1; retainedIndex < retainedPoints.length; retainedIndex += 1) {
    const pointIndex = retainedPoints[retainedIndex];
    const previousPointIndex = retainedPoints[retainedIndex - 1];
    const controlPoint = stroke.controlPoints[pointIndex];
    const previousPoint = stroke.controlPoints[previousPointIndex];
    direction[0] = controlPoint.position[0] - previousPoint.position[0];
    direction[1] = controlPoint.position[1] - previousPoint.position[1];
    direction[2] = controlPoint.position[2] - previousPoint.position[2];
    if (!normalizeInPlace(direction)) {
      continue;
    }
    rotateByQuaternion(controlPoint.orientation, VEC_FORWARD, pointerForward);
    rotateByQuaternion(controlPoint.orientation, VEC_UP, pointerUp);
    computeSurfaceFrame(
      previousRight,
      direction,
      pointerForward,
      pointerUp,
      retainedIndex === 1,
      right,
      normal,
    );
    copyVec3(right, previousRight);

    const radius =
      localBrushSize *
      getPressureSizeMultiplier(controlPoint.pressure, pressureSizeMin) *
      0.5;
    ringPoint[0] = direction[0] * radius;
    ringPoint[1] = direction[1] * radius;
    ringPoint[2] = direction[2] * radius;
    points.push([
      controlPoint.position[0] + ringPoint[0],
      controlPoint.position[1] + ringPoint[1],
      controlPoint.position[2] + ringPoint[2],
    ]);

    for (let ring = 0; ring < 2; ring += 1) {
      rotateAroundAxis(ringPoint, right, ringAngle, rotated);
      copyVec3(rotated, ringPoint);
      for (let point = 0; point < 4; point += 1) {
        points.push([
          controlPoint.position[0] + ringPoint[0],
          controlPoint.position[1] + ringPoint[1],
          controlPoint.position[2] + ringPoint[2],
        ]);
        rotateAroundAxis(ringPoint, direction, aroundRingAngle, rotated);
        copyVec3(rotated, ringPoint);
      }
    }
  }
  return points;
}

function createConvexHull(points: Vec3[]): HullFace[] {
  if (points.length < 4) {
    return [];
  }
  const initial = findInitialHullTetrahedron(points);
  if (!initial) {
    return [];
  }
  const inside: Vec3 = [0, 0, 0];
  for (const pointIndex of initial) {
    inside[0] += points[pointIndex][0] / 4;
    inside[1] += points[pointIndex][1] / 4;
    inside[2] += points[pointIndex][2] / 4;
  }
  let faces = [
    makeHullFace(initial[0], initial[1], initial[2], points, inside),
    makeHullFace(initial[0], initial[3], initial[1], points, inside),
    makeHullFace(initial[0], initial[2], initial[3], points, inside),
    makeHullFace(initial[1], initial[3], initial[2], points, inside),
  ];
  const initialSet = new Set(initial);
  const epsilon = Math.max(getPointCloudScale(points) * 1e-9, 1e-10);
  for (let pointIndex = 0; pointIndex < points.length; pointIndex += 1) {
    if (initialSet.has(pointIndex)) {
      continue;
    }
    const visible = faces.filter(
      (face) => signedDistanceToFace(points[pointIndex], points[face.a], face.normal) > epsilon,
    );
    if (visible.length === 0) {
      continue;
    }
    const boundary = new Map<string, readonly [number, number]>();
    for (const face of visible) {
      for (const edge of [[face.a, face.b], [face.b, face.c], [face.c, face.a]] as const) {
        const key = edge[0] < edge[1] ? `${edge[0]}:${edge[1]}` : `${edge[1]}:${edge[0]}`;
        if (boundary.has(key)) {
          boundary.delete(key);
        } else {
          boundary.set(key, edge);
        }
      }
    }
    const visibleSet = new Set(visible);
    faces = faces.filter((face) => !visibleSet.has(face));
    for (const edge of boundary.values()) {
      faces.push(makeHullFace(edge[0], edge[1], pointIndex, points, inside));
    }
  }
  return faces;
}

function findInitialHullTetrahedron(points: Vec3[]): [number, number, number, number] | undefined {
  let a = 0;
  for (let i = 1; i < points.length; i += 1) {
    if (points[i][0] < points[a][0]) a = i;
  }
  let b = a;
  let best = 0;
  for (let i = 0; i < points.length; i += 1) {
    const distance = squaredDistance(points[a], points[i]);
    if (distance > best) {
      best = distance;
      b = i;
    }
  }
  let c = a;
  best = 0;
  const ab: Vec3 = subtractVec3(points[b], points[a]);
  for (let i = 0; i < points.length; i += 1) {
    const cross = crossVec3(ab, subtractVec3(points[i], points[a]));
    const distance = dotVec3(cross, cross);
    if (distance > best) {
      best = distance;
      c = i;
    }
  }
  const normal = crossVec3(ab, subtractVec3(points[c], points[a]));
  let d = a;
  best = 0;
  for (let i = 0; i < points.length; i += 1) {
    const distance = Math.abs(dotVec3(normal, subtractVec3(points[i], points[a])));
    if (distance > best) {
      best = distance;
      d = i;
    }
  }
  return best > 1e-12 ? [a, b, c, d] : undefined;
}

function makeHullFace(a: number, b: number, c: number, points: Vec3[], inside: Vec3): HullFace {
  let normal = crossVec3(subtractVec3(points[b], points[a]), subtractVec3(points[c], points[a]));
  if (dotVec3(normal, subtractVec3(inside, points[a])) > 0) {
    [b, c] = [c, b];
    normal = [-normal[0], -normal[1], -normal[2]];
  }
  normalizeInPlace(normal);
  return { a, b, c, normal };
}

function createSmoothHullNormals(
  points: Vec3[],
  faces: HullFace[],
  pointIndices: number[],
): Map<number, Vec3> {
  const normals = new Map(pointIndices.map((index) => [index, [0, 0, 0] as Vec3]));
  for (const face of faces) {
    const vertices = [face.a, face.b, face.c] as const;
    for (let i = 0; i < 3; i += 1) {
      const current = points[vertices[i]];
      const before = subtractVec3(points[vertices[(i + 2) % 3]], current);
      const after = subtractVec3(points[vertices[(i + 1) % 3]], current);
      normalizeInPlace(before);
      normalizeInPlace(after);
      const angle = Math.acos(Math.max(-1, Math.min(1, dotVec3(before, after))));
      const normal = normals.get(vertices[i])!;
      normal[0] += face.normal[0] * angle;
      normal[1] += face.normal[1] * angle;
      normal[2] += face.normal[2] * angle;
    }
  }
  for (const normal of normals.values()) normalizeInPlace(normal);
  return normals;
}

function writeHullVertex(
  out: BrushGeometryArrays,
  vertex: number,
  position: Vec3,
  normal: Vec3,
  color: Rgba,
  brushSize: number,
): void {
  writePosition(out.positions, vertex, position);
  writeNormal(out.normals, vertex, normal);
  writeTangent(out.tangents, vertex, [1, 0, 0], 1);
  writeColor(out.colors, vertex, color, 1);
  writePackedUv(out.packedUvs, vertex, 0, 0, brushSize);
  includeBounds(out.bounds, out.positions, vertex);
}

function copyHullVertexAsBackface(out: BrushGeometryArrays, source: number, target: number): void {
  for (let axis = 0; axis < 3; axis += 1) {
    out.positions[target * 3 + axis] = out.positions[source * 3 + axis];
    out.normals[target * 3 + axis] = -out.normals[source * 3 + axis];
    out.packedUvs[target * 3 + axis] = out.packedUvs[source * 3 + axis];
  }
  for (let axis = 0; axis < 4; axis += 1) {
    out.tangents[target * 4 + axis] = out.tangents[source * 4 + axis];
    out.colors[target * 4 + axis] = out.colors[source * 4 + axis];
  }
  includeBounds(out.bounds, out.positions, target);
}

function subtractVec3(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function crossVec3(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function dotVec3(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function squaredDistance(a: Vec3, b: Vec3): number {
  const delta = subtractVec3(a, b);
  return dotVec3(delta, delta);
}

function signedDistanceToFace(point: Vec3, origin: Vec3, normal: Vec3): number {
  return dotVec3(normal, subtractVec3(point, origin));
}

function getPointCloudScale(points: Vec3[]): number {
  let scale = 0;
  for (const point of points) {
    scale = Math.max(scale, Math.abs(point[0]), Math.abs(point[1]), Math.abs(point[2]));
  }
  return scale;
}

function generateThickStripGeometry(
  stroke: StrokeData,
  options: BrushGeometryOptions,
  out: BrushGeometryArrays,
): boolean {
  stroke = retainGeometryBrushControlPoints(stroke, options, out, false);
  out.family = "thick-strip";
  out.uv0Size = 2;
  const pointCount = stroke.controlPoints.length;
  ensureTubeScratchCapacity(out, pointCount);
  ensureGeometryPressureCapacity(out, pointCount);
  prepareGeometrySmoothedPressures(stroke, options, out);
  const maximumVertexCount = Math.max(0, pointCount - 1) * 12;
  const maximumIndexCount = Math.max(0, pointCount - 1) * 24;
  const reallocated = ensureGeometryCapacity(
    out,
    maximumVertexCount,
    maximumIndexCount,
  );
  const {
    positions,
    normals,
    tangents,
    colors,
    uvs,
    indices,
    bounds,
    geometrySmoothedPressures,
    tubeBreakBefore,
    tubeFrameRights,
    tubeFrameUps,
  } = out;
  const localBrushSize = getLocalBrushSize(stroke);
  const pressureSizeMin = normalizePressureSizeMin(options.pressureSizeRange?.[0]);
  const pressureOpacityMin = normalizePressureOpacityMin(
    options.pressureOpacityRange,
  );
  const pressureOpacityMax = normalizePressureOpacityMax(
    options.pressureOpacityRange,
  );
  const descriptorOpacity = normalizeDescriptorOpacity(
    options.geometryParams?.opacity,
  );
  const tileRate = normalizeTileRate(options.geometryParams?.tileRate);
  const atlasRows = normalizeAtlasRows(options.geometryParams?.textureAtlasV);
  const move: Vec3 = [0, 0, 0];
  const previousMove: Vec3 = [0, 0, 0];
  const right: Vec3 = [0, 0, 0];
  const surface: Vec3 = [0, 0, 0];
  const preferredRight: Vec3 = [0, 0, 0];
  const pointerForward: Vec3 = [0, 0, 0];
  const pointerUp: Vec3 = [0, 0, 0];
  const bellyRatio = Math.fround(1 / 8);
  const hypotenuse = Math.fround(
    Math.sqrt(
      Math.fround(1 + Math.fround(bellyRatio * bellyRatio)),
    ),
  );
  const sinTheta = Math.fround(bellyRatio / hypotenuse);
  const cosTheta = Math.fround(1 / hypotenuse);
  let previousHasGeometry = false;

  // ThickGeometryBrush assigns geometry to the current knot's incoming solid.
  // A rejected knot terminates the preceding section and seeds a fresh frame
  // for the next valid solid.
  for (let pointIndex = 1; pointIndex < pointCount; pointIndex += 1) {
    const previous = stroke.controlPoints[pointIndex - 1].position;
    const point = stroke.controlPoints[pointIndex];
    move[0] = point.position[0] - previous[0];
    move[1] = point.position[1] - previous[1];
    move[2] = point.position[2] - previous[2];
    const length = Math.hypot(move[0], move[1], move[2]);
    let shouldBreak = length < OPEN_BRUSH_TUBE_MINIMUM_MOVE_METERS;
    if (!shouldBreak && previousHasGeometry && pointIndex > 1) {
      const beforePrevious = stroke.controlPoints[pointIndex - 2].position;
      previousMove[0] = previous[0] - beforePrevious[0];
      previousMove[1] = previous[1] - beforePrevious[1];
      previousMove[2] = previous[2] - beforePrevious[2];
      const previousLength = Math.hypot(
        previousMove[0],
        previousMove[1],
        previousMove[2],
      );
      const movementAngle = Math.acos(
        Math.min(
          1,
          Math.max(
            -1,
            dot(previousMove, move) / Math.max(previousLength * length, EPSILON),
          ),
        ),
      );
      const pressuredSize = Math.max(
        localBrushSize *
          getPressureSizeMultiplier(
            geometrySmoothedPressures[pointIndex],
            pressureSizeMin,
          ),
        EPSILON,
      );
      shouldBreak = movementAngle > Math.atan(length / pressuredSize) * 2;
    }
    if (shouldBreak) {
      tubeBreakBefore[pointIndex] = 1;
      preferredRight[0] = 0;
      preferredRight[1] = 0;
      preferredRight[2] = 0;
      previousHasGeometry = false;
      continue;
    }
    writeOpenBrushFloatDirection(previous, point.position, move);
    rotateByUnityQuaternionFloat(point.orientation, VEC_FORWARD, pointerForward);
    rotateByUnityQuaternionFloat(point.orientation, VEC_UP, pointerUp);
    computeSurfaceFrameUnityFloat(
      preferredRight,
      move,
      pointerForward,
      pointerUp,
      !previousHasGeometry,
      right,
      surface,
      true,
    );
    writeScratchVec3(tubeFrameRights, pointIndex, right);
    writeScratchVec3(tubeFrameUps, pointIndex, surface);
    preferredRight[0] = right[0];
    preferredRight[1] = right[1];
    preferredRight[2] = right[2];
    previousHasGeometry = true;
  }

  let vertexCount = 0;
  let indexCount = 0;
  previousHasGeometry = false;
  const frameRight: Vec3 = [0, 0, 0];
  const frameSurface: Vec3 = [0, 0, 0];
  const surfaceTangent: Vec3 = [0, 0, 0];
  for (let pointIndex = 1; pointIndex < pointCount; pointIndex += 1) {
    if (tubeBreakBefore[pointIndex] === 1) {
      previousHasGeometry = false;
      continue;
    }
    const point = stroke.controlPoints[pointIndex];
    const previousPoint = stroke.controlPoints[pointIndex - 1];
    const startsSection = !previousHasGeometry;
    const base = startsSection ? vertexCount : vertexCount - 6;
    readScratchVec3(tubeFrameRights, pointIndex, frameRight);
    readScratchVec3(tubeFrameUps, pointIndex, frameSurface);

    if (startsSection) {
      const previousSize =
        Math.fround(
          Math.fround(localBrushSize * OPEN_BRUSH_UNITS_PER_METER) *
            getPressureSizeMultiplierUnityFloat(
              geometrySmoothedPressures[pointIndex - 1],
              pressureSizeMin,
            ),
        ) / OPEN_BRUSH_UNITS_PER_METER;
      const previousOpacity =
        getPressureOpacityMultiplier(
          geometrySmoothedPressures[pointIndex - 1],
          pressureOpacityMin,
          pressureOpacityMax,
        ) * descriptorOpacity;
      writeThickStripVertex(out, base, previousPoint.position, frameRight, frameSurface, previousSize / 2, 0, 0, 1, stroke.color, previousOpacity);
      writeThickStripVertex(out, base + 1, previousPoint.position, frameRight, frameSurface, previousSize / 2, 0, 0, -1, stroke.color, previousOpacity);
      writeThickStripVertex(out, base + 2, previousPoint.position, frameRight, frameSurface, 0, 0, 0, 1, stroke.color, previousOpacity);
      writeThickStripVertex(out, base + 3, previousPoint.position, frameRight, frameSurface, 0, 0, 0, -1, stroke.color, previousOpacity);
      writeThickStripVertex(out, base + 4, previousPoint.position, frameRight, frameSurface, -previousSize / 2, 0, 0, 1, stroke.color, previousOpacity);
      writeThickStripVertex(out, base + 5, previousPoint.position, frameRight, frameSurface, -previousSize / 2, 0, 0, -1, stroke.color, previousOpacity);
    }

    const size =
      Math.fround(
        Math.fround(localBrushSize * OPEN_BRUSH_UNITS_PER_METER) *
          getPressureSizeMultiplierUnityFloat(
            geometrySmoothedPressures[pointIndex],
            pressureSizeMin,
          ),
      ) / OPEN_BRUSH_UNITS_PER_METER;
    const isEnd =
      pointIndex + 1 === pointCount || tubeBreakBefore[pointIndex + 1] === 1;
    const belly = isEnd ? 0 : size / 16;
    const normalSide = isEnd ? 0 : sinTheta;
    const normalSurface = isEnd ? 1 : cosTheta;
    const opacity =
      getPressureOpacityMultiplier(
        geometrySmoothedPressures[pointIndex],
        pressureOpacityMin,
        pressureOpacityMax,
      ) * descriptorOpacity;
    const front = base + 6;
    writeThickStripVertex(out, front, point.position, frameRight, frameSurface, size / 2, 0, normalSide, normalSurface, stroke.color, opacity);
    writeThickStripVertex(out, front + 1, point.position, frameRight, frameSurface, size / 2, 0, normalSide, -normalSurface, stroke.color, opacity);
    writeThickStripVertex(out, front + 2, point.position, frameRight, frameSurface, 0, belly, 0, 1, stroke.color, opacity);
    writeThickStripVertex(out, front + 3, point.position, frameRight, frameSurface, 0, -belly, 0, -1, stroke.color, opacity);
    writeThickStripVertex(out, front + 4, point.position, frameRight, frameSurface, -size / 2, 0, -normalSide, normalSurface, stroke.color, opacity);
    writeThickStripVertex(out, front + 5, point.position, frameRight, frameSurface, -size / 2, 0, -normalSide, -normalSurface, stroke.color, opacity);

    let u0: number;
    let v0: number;
    let v1: number;
    if (startsSection) {
      const random01 = statelessRandom01(stroke.seed, base - 1);
      const atlasRow = Math.floor(random01 * 3331) % atlasRows;
      u0 = random01;
      v0 = (atlasRow + 0.1) / atlasRows;
      v1 = (atlasRow + 0.9) / atlasRows;
      writeThickStripRingUvs(out.uvs, base, u0, v0, v1);
    } else {
      u0 = out.uvs[(base + 4) * 2];
      v0 = out.uvs[(base + 4) * 2 + 1];
      v1 = out.uvs[base * 2 + 1];
    }
    const length = distanceBetweenControlPoints(previousPoint, point);
    const u1 = u0 + tileRate * (length / Math.max(size, EPSILON));
    writeThickStripRingUvs(out.uvs, front, u1, v0, v1);

    for (const local of THICK_STRIP_TRIANGLE_PATTERN) {
      indices[indexCount] = base + local;
      indexCount += 1;
    }

    // Open Brush computes this from its source-unit Float32 vertex buffer.
    computeTriangleSurfaceTangent(
      out.packedUvs,
      uvs,
      base,
      base + 2,
      front + 2,
      surfaceTangent,
      true,
    );
    if (startsSection) {
      for (let local = 0; local < 6; local += 1) {
        writeOrthonormalTangent(tangents, normals, base + local, surfaceTangent, -1);
      }
    }
    for (let local = 6; local < 12; local += 1) {
      writeOrthonormalTangent(tangents, normals, base + local, surfaceTangent, -1);
    }
    vertexCount = startsSection ? vertexCount + 12 : vertexCount + 6;
    previousHasGeometry = true;
  }

  resetBounds(bounds);
  for (let vertex = 0; vertex < vertexCount; vertex += 1) {
    includeBounds(bounds, positions, vertex);
  }
  out.vertexCount = vertexCount;
  out.indexCount = indexCount;
  return reallocated;
}

function writeThickStripVertex(
  out: BrushGeometryArrays,
  vertex: number,
  center: Vec3,
  right: Vec3,
  surface: Vec3,
  rightOffset: number,
  surfaceOffset: number,
  rightNormal: number,
  surfaceNormal: number,
  color: Rgba,
  opacity: number,
): void {
  const rightOffsetSource = Math.fround(
    rightOffset * OPEN_BRUSH_UNITS_PER_METER,
  );
  const surfaceOffsetSource = Math.fround(
    surfaceOffset * OPEN_BRUSH_UNITS_PER_METER,
  );
  const positionOffset = vertex * 3;
  for (let axis = 0; axis < 3; axis += 1) {
    const sourcePosition = Math.fround(
      Math.fround(
        Math.fround(center[axis] * OPEN_BRUSH_UNITS_PER_METER) +
          Math.fround(right[axis] * rightOffsetSource),
      ) + Math.fround(surface[axis] * surfaceOffsetSource),
    );
    out.packedUvs[positionOffset + axis] = sourcePosition;
    out.positions[positionOffset + axis] =
      sourcePosition / OPEN_BRUSH_UNITS_PER_METER;
  }
  writeNormal(out.normals, vertex, [
    Math.fround(
      Math.fround(right[0] * Math.fround(rightNormal)) +
        Math.fround(surface[0] * Math.fround(surfaceNormal)),
    ),
    Math.fround(
      Math.fround(right[1] * Math.fround(rightNormal)) +
        Math.fround(surface[1] * Math.fround(surfaceNormal)),
    ),
    Math.fround(
      Math.fround(right[2] * Math.fround(rightNormal)) +
        Math.fround(surface[2] * Math.fround(surfaceNormal)),
    ),
  ]);
  writeColor(out.colors, vertex, color, opacity);
}

function writeThickStripRingUvs(
  uvs: Float32Array,
  base: number,
  u: number,
  v0: number,
  v1: number,
): void {
  const middle = (v0 + v1) * 0.5;
  let offset = base * 2;
  for (const v of [v1, v1, middle, middle, v0, v0]) {
    uvs[offset] = u;
    uvs[offset + 1] = v;
    offset += 2;
  }
}

function generateTubeGeometry(
  stroke: StrokeData,
  options: BrushGeometryOptions,
  out: BrushGeometryArrays,
): boolean {
  const isSquareBrush = options.generatorClass === "SquareBrush";
  stroke = retainGeometryBrushControlPoints(stroke, options, out, isSquareBrush);
  const storesRadius =
    options.geometryParams?.tubeStoreRadiusInTexcoord0Z === true;
  out.uv0Size = storesRadius ? 3 : 2;
  const pointCount = stroke.controlPoints.length;
  const segmentCount = Math.max(0, pointCount - 1);
  const sideCount = isSquareBrush
    ? 4
    : normalizeTubeSideCount(options.geometryParams?.tubeSideCount);
  const hardEdges = isSquareBrush || options.geometryParams?.tubeHardEdges === true;
  const ringVertexCount = hardEdges ? sideCount * 2 : sideCount + 1;
  const hasCaps =
    pointCount >= 2 && options.geometryParams?.tubeEndCaps !== false;
  // A sharp turn can split every connection into its own capped section.
  // Reserve that upper bound, then publish only the counts actually written.
  const maximumSectionCount = segmentCount;
  const maximumCapVertexCount = hasCaps && !isSquareBrush
    ? maximumSectionCount * sideCount * 2
    : 0;
  const maximumVertexCount =
    pointCount * ringVertexCount + maximumCapVertexCount;
  const maximumIndexCount =
    segmentCount * sideCount * 6 +
    (hasCaps
      ? maximumSectionCount * 2 * (isSquareBrush ? 6 : sideCount * 3)
      : 0);
  const reallocated = ensureGeometryCapacity(
    out,
    maximumVertexCount,
    maximumIndexCount,
  );
  ensureTubeScratchCapacity(out, pointCount);
  ensureGeometryPressureCapacity(out, pointCount);
  prepareTubeSmoothedPressures(stroke, options, out);
  prepareGeometrySmoothedPositions(stroke, out, true);
  if (isSquareBrush) {
    // SquareBrush frames and emits from point.m_Pos. Unlike TubeBrush, it does
    // not apply GeometryBrush's finalized three-point center smoothing.
    for (let pointIndex = 0; pointIndex < pointCount; pointIndex += 1) {
      writeScratchVec3(
        out.geometrySmoothedPositions,
        pointIndex,
        stroke.controlPoints[pointIndex].position,
      );
    }
  }
  const {
    positions,
    normals,
    tangents,
    colors,
    uvs,
    packedUvs,
    indices,
    bounds,
    tubeBreakBefore,
    tubeFrameRights,
    tubeFrameUps,
    tubeTangents,
    tubeRadii,
    tubeRingUs,
    tubeOpacities,
    tubeSmoothedPressures,
    geometrySmoothedPositions,
  } = out;
  const pressureSizeMin = normalizePressureSizeMin(options.pressureSizeRange?.[0]);
  const localBrushSize = getLocalBrushSize(stroke);
  const tileRate = normalizeTileRate(options.geometryParams?.tileRate);
  // The first TubeBrush knot starts writing at vertex zero and salts its
  // section UV offset with cur.iVert - 1.
  const random01 = statelessRandom01(stroke.seed, -1);
  const atlasRows = normalizeAtlasRows(options.geometryParams?.textureAtlasV);
  let atlasRow = Math.floor(random01 * 3331) % atlasRows;
  let v0 = atlasRow / atlasRows;
  let v1 = (atlasRow + 1) / atlasRows;
  const usesStretchUvs = options.geometryParams?.tubeUvStyle === "stretch";
  const capAspect = normalizeTubeCapAspect(options.geometryParams?.tubeCapAspect);
  const shapeModifier = normalizeTubeShapeModifier(
    options.geometryParams?.tubeShapeModifier,
  );
  const breakAngleMultiplier = normalizeTubeBreakAngleMultiplier(
    options.geometryParams?.tubeBreakAngleMultiplier,
  );
  const totalStrokeLength = measureScratchPathLength(
    geometrySmoothedPositions,
    pointCount,
  );
  let runningDistance = 0;
  let u = Math.fround(random01);
  let sectionStartPoint = 0;
  let completedOpenBrushVertexCount = 0;

  // Frame state: right/up transported along the stroke by the tangent-to-
  // tangent rotation (MathUtils.ComputeMinimalRotationFrame), bootstrapped
  // from the pointer orientation on the first knot.
  const tangent: Vec3 = [0, 0, 0];
  const previousTangent: Vec3 = [0, 0, 0];
  const frameRight: Vec3 = [0, 0, 0];
  const frameUp: Vec3 = [0, 0, 0];
  const bootstrapUp: Vec3 = [0, 0, 0];
  const priorFrameRight: Vec3 = [0, 0, 0];
  const priorFrameUp: Vec3 = [0, 0, 0];
  const radial: Vec3 = [0, 0, 0];
  const displacement: Vec3 = [0, 0, 0];
  const center: Vec3 = [0, 0, 0];

  for (let pointIndex = 0; pointIndex < pointCount; pointIndex += 1) {
    const point = stroke.controlPoints[pointIndex];
    readScratchVec3(geometrySmoothedPositions, pointIndex, center);
    const radius =
      localBrushSize *
      getPressureSizeMultiplier(tubeSmoothedPressures[pointIndex], pressureSizeMin) *
      0.5;
    let segmentLength = 0;
    if (pointIndex > 0) {
      segmentLength = distanceBetweenScratchPoints(
        geometrySmoothedPositions,
        pointIndex - 1,
        pointIndex,
      );
      runningDistance += segmentLength;
      const radiusSource = Math.fround(radius * OPEN_BRUSH_UNITS_PER_METER);
      const circumferenceSource = Math.max(
        Math.fround(OPEN_BRUSH_TWO_PI_FLOAT * radiusSource),
        EPSILON,
      );
      const uRate = Math.fround(Math.fround(tileRate) / circumferenceSource);
      const segmentLengthSource = distanceBetweenOpenBrushSmoothedPoints(
        stroke,
        pointIndex - 1,
        pointIndex,
      );
      u = Math.fround(u + Math.fround(segmentLengthSource * uRate));
    }
    const progress =
      totalStrokeLength > EPSILON ? runningDistance / totalStrokeLength : 0;
    const shapeScale = getTubeShapeScale(
      shapeModifier,
      progress,
      pointIndex,
      pointCount,
      options.geometryParams?.tubeTaperScalar,
      0,
    );
    const petalOffset =
      shapeModifier === 5
        ? Math.pow(
            progress,
            normalizeTubePetalExponent(
              options.geometryParams?.tubePetalDisplacementExponent,
            ),
          ) *
          normalizeTubePetalAmount(
            options.geometryParams?.tubePetalDisplacementAmount,
          ) *
          localBrushSize *
          tubeSmoothedPressures[pointIndex]
        : 0;
    // TubeBrush writes m_Color directly and does not apply the descriptor's
    // pressure-opacity range while constructing its live mesh.
    const opacity = 1;

    writeOpenBrushIncomingTangent(
      stroke,
      pointIndex,
      previousTangent,
      tangent,
    );
    if (pointIndex === 0) {
      initializeTubeFrame(
        point.orientation,
        tangent,
        bootstrapUp,
        frameRight,
        frameUp,
      );
    } else {
      copyVec3(frameRight, priorFrameRight);
      copyVec3(frameUp, priorFrameUp);
      rotateBetweenTangents(previousTangent, tangent, frameRight);
      rotateBetweenTangents(previousTangent, tangent, frameUp);

      const previousSectionContinues = tubeBreakBefore[pointIndex - 1] === 0;
      if (!previousSectionContinues) {
        // The previous knot has no frame in TubeBrush. Seed the next valid
        // section from the current pointer orientation instead of transporting
        // the broken incoming frame.
        initializeTubeFrame(
          point.orientation,
          tangent,
          bootstrapUp,
          frameRight,
          frameUp,
        );
      }
      const pressuredDiameter = Math.max(radius * 2, EPSILON);
      const breakAngle =
        Math.atan(segmentLength / pressuredDiameter) * breakAngleMultiplier;
      const frameAngle = getFrameRotationAngle(
        priorFrameRight,
        priorFrameUp,
        previousTangent,
        frameRight,
        frameUp,
        tangent,
      );
      if (
        segmentLength < OPEN_BRUSH_TUBE_MINIMUM_MOVE_METERS ||
        (pointIndex > 1 && previousSectionContinues && frameAngle > breakAngle)
      ) {
        tubeBreakBefore[pointIndex] = 1;
        initializeTubeFrame(
          point.orientation,
          tangent,
          bootstrapUp,
          frameRight,
          frameUp,
        );
        const completedSectionPointCount = pointIndex - sectionStartPoint;
        completedOpenBrushVertexCount +=
          completedSectionPointCount * ringVertexCount +
          (hasCaps && completedSectionPointCount > 1 ? sideCount * 2 : 0);
        sectionStartPoint = pointIndex;
        const sectionRandom01 = statelessRandom01(
          stroke.seed,
          completedOpenBrushVertexCount - 1,
        );
        u = sectionRandom01;
        atlasRow = Math.floor(sectionRandom01 * 3331) % atlasRows;
        v0 = atlasRow / atlasRows;
        v1 = (atlasRow + 1) / atlasRows;
      }
    }
    previousTangent[0] = tangent[0];
    previousTangent[1] = tangent[1];
    previousTangent[2] = tangent[2];

    const ringU = usesStretchUvs
      ? pointIndex / Math.max(pointCount - 1, 1)
      : u;
    writeScratchVec3(tubeFrameRights, pointIndex, frameRight);
    writeScratchVec3(tubeFrameUps, pointIndex, frameUp);
    writeScratchVec3(tubeTangents, pointIndex, tangent);
    tubeRadii[pointIndex] = radius;
    tubeRingUs[pointIndex] = ringU;
    tubeOpacities[pointIndex] = opacity;
    const ringBase = pointIndex * ringVertexCount;
    if (hardEdges) {
      const halfStep = Math.PI / sideCount;
      for (let side = 0; side < sideCount; side += 1) {
        const angle =
          (side / sideCount) * Math.PI * 2 + (isSquareBrush ? Math.PI / 4 : 0);
        setTubeRadialScaled(
          frameRight,
          frameUp,
          angle,
          isSquareBrush ? 0.375 : 1,
          radial,
        );
        if (isSquareBrush) {
          radial[0] *= Math.SQRT2;
          radial[1] *= Math.SQRT2;
          radial[2] *= Math.SQRT2;
        }
        copyVec3(radial, displacement);
        for (let duplicate = 0; duplicate < 2; duplicate += 1) {
          const vertex = ringBase + side * 2 + duplicate;
          setTubeRadial(
            frameRight,
            frameUp,
            angle + (duplicate === 0 ? -halfStep : halfStep),
            radial,
          );
          writePosition(positions, vertex, [
            center[0] +
              displacement[0] * radius * shapeScale +
              radial[0] * petalOffset,
            center[1] +
              displacement[1] * radius * shapeScale +
              radial[1] * petalOffset,
            center[2] +
              displacement[2] * radius * shapeScale +
              radial[2] * petalOffset,
          ]);
          writeNormal(normals, vertex, radial);
          // TubeBrush.MakeClosedCircleHardEdges stores the undisplaced radial
          // direction as the tangent; the two duplicated vertices only differ
          // in their face normals.
          writeTangent(tangents, vertex, displacement, -1);
          writeColor(colors, vertex, stroke.color, opacity);
          const vFraction = side === 0 && duplicate === 0 ? 1 : side / sideCount;
          const v = v0 + (v1 - v0) * vFraction;
          writeUv(uvs, vertex, isSquareBrush ? [0.5, 0.5] : [ringU, v]);
          if (storesRadius) {
            writePackedUv(packedUvs, vertex, ringU, v, radius);
          }
          includeBounds(bounds, positions, vertex);
          setTubeRadial(frameRight, frameUp, angle, radial);
        }
      }
    } else {
      for (let ringIndex = 0; ringIndex < ringVertexCount; ringIndex += 1) {
        const vertex = ringBase + ringIndex;
        const fraction = ringIndex / sideCount;
        const angle = (ringIndex === sideCount ? 0 : fraction * Math.PI * 2);
        setTubeRadial(frameRight, frameUp, angle, radial);
        writePosition(positions, vertex, [
          center[0] + radial[0] * (radius * shapeScale + petalOffset),
          center[1] + radial[1] * (radius * shapeScale + petalOffset),
          center[2] + radial[2] * (radius * shapeScale + petalOffset),
        ]);
        writeNormal(normals, vertex, radial);
        writeTangent(tangents, vertex, tangent, -1);
        writeColor(colors, vertex, stroke.color, opacity);
        const v = v0 + (v1 - v0) * fraction;
        writeUv(uvs, vertex, [ringU, v]);
        if (storesRadius) {
          writePackedUv(packedUvs, vertex, ringU, v, radius);
        }
        includeBounds(bounds, positions, vertex);
      }
    }
  }

  if (isSquareBrush) {
    prepareSquareBrushBreaks(
      out,
      stroke,
      pointCount,
      localBrushSize,
      pressureSizeMin,
    );
    rewriteSquareBrushFrames(
      out,
      stroke,
      pointCount,
      ringVertexCount,
      sideCount,
    );
  }

  // A broken knot has no geometry in TubeBrush. The following valid knot
  // creates both its own front ring and the broken knot's back ring using the
  // following knot's frame. Correct the retained back-ring frame now that the
  // next valid frame is known, then rebuild ring attributes from those frames.
  let correctedBreakFrame = false;
  for (let pointIndex = 0; pointIndex + 1 < pointCount; pointIndex += 1) {
    if (
      tubeBreakBefore[pointIndex] !== 1 ||
      tubeBreakBefore[pointIndex + 1] === 1
    ) {
      continue;
    }
    copyScratchVec3(tubeFrameRights, pointIndex + 1, pointIndex);
    copyScratchVec3(tubeFrameUps, pointIndex + 1, pointIndex);
    copyScratchVec3(tubeTangents, pointIndex + 1, pointIndex);
    correctedBreakFrame = true;
  }
  if (correctedBreakFrame) {
    rewriteTubeRingFrames(
      out,
      stroke,
      pointCount,
      ringVertexCount,
      sideCount,
      hardEdges,
      isSquareBrush,
    );
  }

  if (shapeModifier !== 0 || usesStretchUvs) {
    applyTubeSectionShapeAndUvs(
      out,
      stroke,
      pointCount,
      ringVertexCount,
      sideCount,
      hardEdges,
      isSquareBrush,
      shapeModifier,
      options.geometryParams?.tubeTaperScalar,
      options.geometryParams?.tubePetalDisplacementAmount,
      options.geometryParams?.tubePetalDisplacementExponent,
      localBrushSize,
      usesStretchUvs,
      pressureSizeMin,
      options.geometryParams?.solidMinLengthMeters,
    );
  }

  let indexOffset = 0;
  for (let segment = 0; segment < segmentCount; segment += 1) {
    if (tubeBreakBefore[segment + 1] === 1) {
      continue;
    }
    const firstRing = segment * ringVertexCount;
    const secondRing = firstRing + ringVertexCount;
    for (let side = 0; side < sideCount; side += 1) {
      const first = hardEdges ? side * 2 + 1 : side;
      const next = hardEdges ? (first + 1) % ringVertexCount : side + 1;
      indices[indexOffset] = firstRing + first;
      indices[indexOffset + 1] = secondRing + first;
      indices[indexOffset + 2] = firstRing + next;
      indices[indexOffset + 3] = firstRing + next;
      indices[indexOffset + 4] = secondRing + first;
      indices[indexOffset + 5] = secondRing + next;
      indexOffset += 6;
    }
  }

  let capVertexCount = 0;
  if (hasCaps && isSquareBrush) {
    let sectionStart = 0;
    for (let boundary = 1; boundary <= pointCount; boundary += 1) {
      const sectionEnds =
        boundary === pointCount || tubeBreakBefore[boundary] === 1;
      if (!sectionEnds) {
        continue;
      }
      const sectionEnd = boundary - 1;
      if (sectionEnd > sectionStart) {
        const startRing = sectionStart * ringVertexCount;
        indices[indexOffset] = startRing + 5;
        indices[indexOffset + 1] = startRing + 6;
        indices[indexOffset + 2] = startRing + 2;
        indices[indexOffset + 3] = startRing + 2;
        indices[indexOffset + 4] = startRing + 6;
        indices[indexOffset + 5] = startRing + 1;
        indexOffset += 6;

        const endRing = sectionEnd * ringVertexCount;
        indices[indexOffset] = endRing + 5;
        indices[indexOffset + 1] = endRing + 2;
        indices[indexOffset + 2] = endRing + 6;
        indices[indexOffset + 3] = endRing + 6;
        indices[indexOffset + 4] = endRing + 2;
        indices[indexOffset + 5] = endRing + 1;
        indexOffset += 6;
      }
      sectionStart = boundary;
    }
  } else if (hasCaps) {
    const capRadial: Vec3 = [0, 0, 0];
    const capTip: Vec3 = [0, 0, 0];
    const capTangent: Vec3 = [0, 0, 0];
    const capRight: Vec3 = [0, 0, 0];
    const capUp: Vec3 = [0, 0, 0];
    let sectionStart = 0;
    for (let boundary = 1; boundary <= pointCount; boundary += 1) {
      const sectionEnds =
        boundary === pointCount || tubeBreakBefore[boundary] === 1;
      if (!sectionEnds) {
        continue;
      }
      const sectionEnd = boundary - 1;
      if (sectionEnd > sectionStart) {
        for (let capIndex = 0; capIndex < 2; capIndex += 1) {
          const isStart = capIndex === 0;
          const pointIndex = isStart ? sectionStart : sectionEnd;
          readScratchVec3(geometrySmoothedPositions, pointIndex, center);
          const capBase =
            pointCount * ringVertexCount + capVertexCount;
          capVertexCount += sideCount;
          const ringBase = pointIndex * ringVertexCount;
          readScratchVec3(tubeTangents, pointIndex, capTangent);
          readScratchVec3(tubeFrameRights, pointIndex, capRight);
          readScratchVec3(tubeFrameUps, pointIndex, capUp);
          const radius = tubeRadii[pointIndex];
          const ringU = tubeRingUs[pointIndex];
          const opacity = tubeOpacities[pointIndex];
          const capV0 = 1 - uvs[
            (ringBase + (hardEdges ? 1 : 0)) * 2 + 1
          ];
          const capV1 = 1 - uvs[
            (ringBase + (hardEdges ? 0 : ringVertexCount - 1)) * 2 + 1
          ];
          const direction = isStart ? -1 : 1;
          capTip[0] =
            center[0] +
            capTangent[0] * radius * capAspect * direction;
          capTip[1] =
            center[1] +
            capTangent[1] * radius * capAspect * direction;
          capTip[2] =
            center[2] +
            capTangent[2] * radius * capAspect * direction;
          const radiusSource = Math.fround(
            radius * OPEN_BRUSH_UNITS_PER_METER,
          );
          const circumferenceSource = Math.max(
            Math.fround(OPEN_BRUSH_TWO_PI_FLOAT * radiusSource),
            EPSILON,
          );
          const uRate = Math.fround(
            Math.fround(tileRate) / circumferenceSource,
          );
          const diagonalSource = getOpenBrushTubeCapDiagonal(
            center,
            capUp,
            capTangent,
            radiusSource,
            capAspect,
            direction,
          );
          const capU = usesStretchUvs
            ? ringU
            : Math.fround(
                ringU +
                  Math.fround(Math.fround(direction * uRate) * diagonalSource),
              );
          // TubeBrush derives this from Mathf.Sign(dot(tip - center, fwd)).
          // Unity's Mathf.Sign(0) is +1, so a zero-aspect start cap has the
          // same forward normal as the coincident end cap.
          const capNormalDirection =
            isStart && capAspect !== 0 ? -1 : 1;

          for (let side = 0; side < sideCount; side += 1) {
            const vertex = capBase + side;
            const fraction = (side + 0.5) / sideCount;
            setTubeRadial(
              capRight,
              capUp,
              fraction * Math.PI * 2,
              capRadial,
            );
            writePosition(positions, vertex, capTip);
            writeNormal(
              normals,
              vertex,
              hardEdges
                ? capRadial
                : [
                    capTangent[0] * capNormalDirection,
                    capTangent[1] * capNormalDirection,
                    capTangent[2] * capNormalDirection,
                  ],
            );
            writeTangent(tangents, vertex, capRadial, -1);
            writeColor(colors, vertex, stroke.color, opacity);
            const v = capV0 + (capV1 - capV0) * fraction;
            writeUv(uvs, vertex, isSquareBrush ? [0.5, 0.5] : [capU, v]);
            if (storesRadius) {
              writePackedUv(packedUvs, vertex, capU, v, 0);
            }
            includeBounds(bounds, positions, vertex);

            const first = hardEdges ? side * 2 + 1 : side;
            const next = hardEdges ? (first + 1) % ringVertexCount : side + 1;
            indices[indexOffset] = vertex;
            indices[indexOffset + 1] =
              ringBase + (isStart ? first : next);
            indices[indexOffset + 2] =
              ringBase + (isStart ? next : first);
            indexOffset += 3;
          }
        }
      }
      sectionStart = boundary;
    }
  }

  if (isSquareBrush) {
    indexOffset = packSquareBrushLikeOpenBrush(out, pointCount);
  } else {
    indexOffset = packTubeLikeOpenBrush(
      out,
      pointCount,
      ringVertexCount,
      sideCount,
      hardEdges,
      hasCaps,
      capVertexCount,
      storesRadius,
    );
  }

  out.family = "tube";
  out.vertexCount = pointCount * ringVertexCount + capVertexCount;
  out.indexCount = indexOffset;
  return reallocated;
}

const SQUARE_BRUSH_VERTEX_REMAP = [0, 1, 4, 5, 3, 2, 7, 6] as const;
const SQUARE_BRUSH_SIDE_TRIANGLES = [
  4, 12, 2, 12, 10, 2,
  5, 1, 13, 1, 9, 13,
  7, 3, 15, 3, 11, 15,
  6, 14, 0, 14, 8, 0,
] as const;
const SQUARE_BRUSH_START_CAP_TRIANGLES = [5, 3, 1, 3, 7, 1] as const;
const SQUARE_BRUSH_END_CAP_TRIANGLES = [13, 9, 11, 9, 15, 11] as const;

function packSquareBrushLikeOpenBrush(
  out: BrushGeometryArrays,
  pointCount: number,
): number {
  // SquareBrush names/order: bottom-right bottom/right, top-left top/left,
  // top-right top/right, bottom-left bottom/left.
  const vertexCount = pointCount * 8;
  const channels: readonly [Float32Array, number][] = [
    [out.positions, 3],
    [out.normals, 3],
    [out.tangents, 4],
    [out.colors, 4],
    [out.uvs, 2],
  ];
  for (const [channel, itemSize] of channels) {
    for (let pointIndex = 0; pointIndex < pointCount; pointIndex += 1) {
      const ringBase = pointIndex * 8;
      for (let vertex = 0; vertex < 8; vertex += 1) {
        out.indices[ringBase + vertex] =
          ringBase + SQUARE_BRUSH_VERTEX_REMAP[vertex];
      }
    }
    permuteVertexChannel(channel, itemSize, vertexCount, out.indices);
  }

  let indexOffset = 0;
  for (let segment = 0; segment + 1 < pointCount; segment += 1) {
    if (out.tubeBreakBefore[segment + 1] === 1) {
      continue;
    }
    const back = segment * 8;
    for (const offset of SQUARE_BRUSH_SIDE_TRIANGLES) {
      out.indices[indexOffset++] = back + offset;
    }

    const startsSection =
      segment === 0 || out.tubeBreakBefore[segment] === 1;
    if (startsSection) {
      for (const offset of SQUARE_BRUSH_START_CAP_TRIANGLES) {
        out.indices[indexOffset++] = back + offset;
      }
    }
    const endsSection =
      segment + 2 === pointCount || out.tubeBreakBefore[segment + 2] === 1;
    if (endsSection) {
      for (const offset of SQUARE_BRUSH_END_CAP_TRIANGLES) {
        out.indices[indexOffset++] = back + offset;
      }
    }
  }
  return indexOffset;
}

/**
 * TubeBrush appends one complete section at a time: start cap, all closed
 * circles, then end cap. The generator builds rings first because that keeps
 * the live frame pass simple, so finalize into the source vertex and triangle
 * order before publishing the buffers.
 */
function packTubeLikeOpenBrush(
  out: BrushGeometryArrays,
  pointCount: number,
  ringVertexCount: number,
  sideCount: number,
  hardEdges: boolean,
  hasCaps: boolean,
  capVertexCount: number,
  storesRadius: boolean,
): number {
  const vertexCount = pointCount * ringVertexCount + capVertexCount;
  const channels: readonly [Float32Array, number][] = [
    [out.positions, 3],
    [out.normals, 3],
    [out.tangents, 4],
    [out.colors, 4],
    [out.uvs, 2],
    [out.packedUvs, 3],
  ];
  for (const [channel, itemSize] of channels) {
    buildTubeOpenBrushVertexMap(
      out,
      pointCount,
      ringVertexCount,
      sideCount,
      hasCaps,
      capVertexCount,
    );
    permuteVertexChannel(channel, itemSize, vertexCount, out.indices);
  }

  // Keep the unused UV representation deterministic too. Only one is exposed,
  // but both share the reusable geometry storage across brush changes.
  if (!storesRadius) {
    out.packedUvs.fill(0, 0, vertexCount * 3);
  }

  let indexOffset = 0;
  let sectionStart = 0;
  for (let boundary = 1; boundary <= pointCount; boundary += 1) {
    const sectionEnds =
      boundary === pointCount || out.tubeBreakBefore[boundary] === 1;
    if (!sectionEnds) {
      continue;
    }
    const sectionEnd = boundary - 1;
    if (sectionEnd > sectionStart) {
      const startRing = out.tubeRingUs[sectionStart];
      if (hasCaps) {
        const startCap = startRing - sideCount;
        for (let side = 0; side < sideCount; side += 1) {
          const first = hardEdges ? side * 2 + 1 : side;
          const next = hardEdges
            ? (first + 1) % ringVertexCount
            : side + 1;
          out.indices[indexOffset] = startCap + side;
          out.indices[indexOffset + 1] = startRing + next;
          out.indices[indexOffset + 2] = startRing + first;
          indexOffset += 3;
        }
      }

      for (let pointIndex = sectionStart; pointIndex < sectionEnd; pointIndex += 1) {
        const backRing = out.tubeRingUs[pointIndex];
        const frontRing = out.tubeRingUs[pointIndex + 1];
        for (let side = 0; side < sideCount; side += 1) {
          const first = hardEdges ? side * 2 + 1 : side;
          const next = hardEdges
            ? (first + 1) % ringVertexCount
            : side + 1;
          out.indices[indexOffset] = backRing + first;
          out.indices[indexOffset + 1] = backRing + next;
          out.indices[indexOffset + 2] = frontRing + first;
          out.indices[indexOffset + 3] = backRing + next;
          out.indices[indexOffset + 4] = frontRing + next;
          out.indices[indexOffset + 5] = frontRing + first;
          indexOffset += 6;
        }
      }

      if (hasCaps) {
        const endRing = out.tubeRingUs[sectionEnd];
        const endCap = endRing + ringVertexCount;
        for (let side = 0; side < sideCount; side += 1) {
          const first = hardEdges ? side * 2 + 1 : side;
          const next = hardEdges
            ? (first + 1) % ringVertexCount
            : side + 1;
          out.indices[indexOffset] = endCap + side;
          out.indices[indexOffset + 1] = endRing + first;
          out.indices[indexOffset + 2] = endRing + next;
          indexOffset += 3;
        }
      }
    }
    sectionStart = boundary;
  }
  return indexOffset;
}

function buildTubeOpenBrushVertexMap(
  out: BrushGeometryArrays,
  pointCount: number,
  ringVertexCount: number,
  sideCount: number,
  hasCaps: boolean,
  capVertexCount: number,
): void {
  const firstCapVertex = pointCount * ringVertexCount;
  let newVertex = 0;
  let oldCapVertex = firstCapVertex;
  let sectionStart = 0;
  for (let boundary = 1; boundary <= pointCount; boundary += 1) {
    const sectionEnds =
      boundary === pointCount || out.tubeBreakBefore[boundary] === 1;
    if (!sectionEnds) {
      continue;
    }
    const sectionEnd = boundary - 1;
    const hasSectionGeometry = sectionEnd > sectionStart;
    if (hasCaps && hasSectionGeometry) {
      for (let side = 0; side < sideCount; side += 1) {
        out.indices[newVertex++] = oldCapVertex++;
      }
    }
    for (let pointIndex = sectionStart; pointIndex <= sectionEnd; pointIndex += 1) {
      out.tubeRingUs[pointIndex] = newVertex;
      const oldRing = pointIndex * ringVertexCount;
      for (let ringVertex = 0; ringVertex < ringVertexCount; ringVertex += 1) {
        out.indices[newVertex++] = oldRing + ringVertex;
      }
    }
    if (hasCaps && hasSectionGeometry) {
      for (let side = 0; side < sideCount; side += 1) {
        out.indices[newVertex++] = oldCapVertex++;
      }
    }
    sectionStart = boundary;
  }
  if (newVertex !== pointCount * ringVertexCount + capVertexCount) {
    throw new Error("Tube vertex packing did not account for every generated vertex.");
  }
}

function permuteVertexChannel(
  channel: Float32Array,
  itemSize: number,
  vertexCount: number,
  newToOld: Uint32Array,
): void {
  for (let start = 0; start < vertexCount; start += 1) {
    if (newToOld[start] === start) {
      continue;
    }
    const startOffset = start * itemSize;
    const saved0 = channel[startOffset];
    const saved1 = channel[startOffset + 1];
    const saved2 = channel[startOffset + 2];
    const saved3 = channel[startOffset + 3];
    let destination = start;
    while (newToOld[destination] !== start) {
      const source = newToOld[destination];
      const destinationOffset = destination * itemSize;
      const sourceOffset = source * itemSize;
      for (let component = 0; component < itemSize; component += 1) {
        channel[destinationOffset + component] = channel[sourceOffset + component];
      }
      newToOld[destination] = destination;
      destination = source;
    }
    const destinationOffset = destination * itemSize;
    channel[destinationOffset] = saved0;
    if (itemSize > 1) channel[destinationOffset + 1] = saved1;
    if (itemSize > 2) channel[destinationOffset + 2] = saved2;
    if (itemSize > 3) channel[destinationOffset + 3] = saved3;
    newToOld[destination] = destination;
  }
}

function retainGeometryBrushControlPoints(
  stroke: StrokeData,
  options: BrushGeometryOptions,
  out: BrushGeometryArrays,
  isSquareBrush: boolean,
): StrokeData {
  const source = stroke.controlPoints;
  if (source.length < 2) {
    return stroke;
  }
  const retained = out.tubeRetainedControlPoints;
  retained.length = 0;
  retained.push(source[0]);
  let lastRetained = source[0];
  const pressureSizeMin = normalizePressureSizeMin(options.pressureSizeRange?.[0]);
  const localBrushSize = getLocalBrushSize(stroke);
  const configuredSolidMinimum = options.geometryParams?.solidMinLengthMeters;
  const solidMinimum =
    typeof configuredSolidMinimum === "number" &&
    Number.isFinite(configuredSolidMinimum)
      ? Math.max(0, configuredSolidMinimum)
      : isSquareBrush
        ? 0.002
        : OPEN_BRUSH_TUBE_MINIMUM_MOVE_METERS;
  for (let pointIndex = 1; pointIndex < source.length; pointIndex += 1) {
    const point = source[pointIndex];
    const deltaX = point.position[0] - lastRetained.position[0];
    const deltaY = point.position[1] - lastRetained.position[1];
    const deltaZ = point.position[2] - lastRetained.position[2];
    const spawnInterval =
      solidMinimum +
      localBrushSize *
        getPressureSizeMultiplier(point.pressure, pressureSizeMin) *
        TUBE_SOLID_ASPECT_RATIO;
    // GeometryBrush always renders its current leading knot. A sub-interval
    // interior update is later overwritten, while the final update remains as
    // the trailing provisional knot even when it was not promoted to a keeper.
    if (
      pointIndex + 1 === source.length ||
      Math.hypot(deltaX, deltaY, deltaZ) > spawnInterval
    ) {
      retained.push(point);
      lastRetained = point;
    }
  }
  return retained.length === source.length
    ? stroke
    : { ...stroke, controlPoints: retained };
}

function prepareSquareBrushBreaks(
  out: BrushGeometryArrays,
  stroke: StrokeData,
  pointCount: number,
  localBrushSize: number,
  pressureSizeMin: number,
): void {
  out.tubeBreakBefore.fill(0, 0, pointCount);
  const previousMove: Vec3 = [0, 0, 0];
  const move: Vec3 = [0, 0, 0];
  let previousHasGeometry = false;
  for (let pointIndex = 1; pointIndex < pointCount; pointIndex += 1) {
    const previous = stroke.controlPoints[pointIndex - 1].position;
    const current = stroke.controlPoints[pointIndex].position;
    move[0] = current[0] - previous[0];
    move[1] = current[1] - previous[1];
    move[2] = current[2] - previous[2];
    const length = Math.hypot(move[0], move[1], move[2]);
    let shouldBreak = length < OPEN_BRUSH_TUBE_MINIMUM_MOVE_METERS;
    if (!shouldBreak && previousHasGeometry && pointIndex > 1) {
      const beforePrevious = stroke.controlPoints[pointIndex - 2].position;
      previousMove[0] = previous[0] - beforePrevious[0];
      previousMove[1] = previous[1] - beforePrevious[1];
      previousMove[2] = previous[2] - beforePrevious[2];
      normalizeInPlace(previousMove);
      move[0] /= length;
      move[1] /= length;
      move[2] /= length;
      const movementAngle = Math.acos(
        Math.min(1, Math.max(-1, dot(previousMove, move))),
      );
      const pressuredSize = Math.max(
        localBrushSize *
          getPressureSizeMultiplier(
            out.tubeSmoothedPressures[pointIndex],
            pressureSizeMin,
          ),
        EPSILON,
      );
      const breakAngle = Math.atan(length / pressuredSize) * 2;
      shouldBreak = movementAngle > breakAngle;
    }
    if (shouldBreak) {
      out.tubeBreakBefore[pointIndex] = 1;
    }
    previousHasGeometry = !shouldBreak;
  }
}

function rewriteSquareBrushFrames(
  out: BrushGeometryArrays,
  stroke: StrokeData,
  pointCount: number,
  ringVertexCount: number,
  sideCount: number,
): void {
  const tangent: Vec3 = [0, 0, 0];
  const right: Vec3 = [0, 0, 0];
  const surface: Vec3 = [0, 0, 0];
  const preferredRight: Vec3 = [0, 0, 0];
  const pointerForward: Vec3 = [0, 0, 0];
  const pointerUp: Vec3 = [0, 0, 0];
  for (let pointIndex = 1; pointIndex < pointCount; pointIndex += 1) {
    if (out.tubeBreakBefore[pointIndex] === 1) {
      preferredRight[0] = 0;
      preferredRight[1] = 0;
      preferredRight[2] = 0;
      continue;
    }
    const previous = stroke.controlPoints[pointIndex - 1].position;
    const point = stroke.controlPoints[pointIndex];
    writeOpenBrushFloatDirection(previous, point.position, tangent);
    if (Math.hypot(tangent[0], tangent[1], tangent[2]) < EPSILON) {
      continue;
    }
    rotateByUnityQuaternionFloat(point.orientation, VEC_FORWARD, pointerForward);
    rotateByUnityQuaternionFloat(point.orientation, VEC_UP, pointerUp);
    const startsSection =
      pointIndex === 1 || out.tubeBreakBefore[pointIndex - 1] === 1;
    computeSurfaceFrameUnityFloat(
      preferredRight,
      tangent,
      pointerForward,
      pointerUp,
      startsSection,
      right,
      surface,
      true,
    );
    writeScratchVec3(out.tubeFrameRights, pointIndex, right);
    writeScratchVec3(out.tubeFrameUps, pointIndex, surface);
    writeScratchVec3(out.tubeTangents, pointIndex, tangent);
    if (startsSection) {
      writeScratchVec3(out.tubeFrameRights, pointIndex - 1, right);
      writeScratchVec3(out.tubeFrameUps, pointIndex - 1, surface);
      writeScratchVec3(out.tubeTangents, pointIndex - 1, tangent);
    }
    preferredRight[0] = right[0];
    preferredRight[1] = right[1];
    preferredRight[2] = right[2];
  }
  rewriteTubeRingFrames(
    out,
    stroke,
    pointCount,
    ringVertexCount,
    sideCount,
    true,
    true,
  );
}

function rewriteTubeRingFrames(
  out: BrushGeometryArrays,
  stroke: StrokeData,
  pointCount: number,
  ringVertexCount: number,
  sideCount: number,
  hardEdges: boolean,
  isSquareBrush: boolean,
): void {
  const center: Vec3 = [0, 0, 0];
  const frameRight: Vec3 = [0, 0, 0];
  const frameUp: Vec3 = [0, 0, 0];
  const tangent: Vec3 = [0, 0, 0];
  const radial: Vec3 = [0, 0, 0];
  const displacement: Vec3 = [0, 0, 0];
  resetBounds(out.bounds);
  for (let pointIndex = 0; pointIndex < pointCount; pointIndex += 1) {
    readScratchVec3(out.geometrySmoothedPositions, pointIndex, center);
    readScratchVec3(out.tubeFrameRights, pointIndex, frameRight);
    readScratchVec3(out.tubeFrameUps, pointIndex, frameUp);
    readScratchVec3(out.tubeTangents, pointIndex, tangent);
    const radius = out.tubeRadii[pointIndex];
    const ringBase = pointIndex * ringVertexCount;
    if (hardEdges) {
      const halfStep = Math.PI / sideCount;
      for (let side = 0; side < sideCount; side += 1) {
        const angle =
          (side / sideCount) * Math.PI * 2 +
          (isSquareBrush ? Math.PI / 4 : 0);
        setTubeRadialScaled(
          frameRight,
          frameUp,
          angle,
          isSquareBrush ? 0.375 : 1,
          displacement,
        );
        if (isSquareBrush) {
          displacement[0] *= Math.SQRT2;
          displacement[1] *= Math.SQRT2;
          displacement[2] *= Math.SQRT2;
        }
        for (let duplicate = 0; duplicate < 2; duplicate += 1) {
          const vertex = ringBase + side * 2 + duplicate;
          setTubeRadial(
            frameRight,
            frameUp,
            angle + (duplicate === 0 ? -halfStep : halfStep),
            radial,
          );
          writePositionComponents(
            out.positions,
            vertex,
            center[0] + displacement[0] * radius,
            center[1] + displacement[1] * radius,
            center[2] + displacement[2] * radius,
          );
          writeNormal(out.normals, vertex, radial);
          writeTangent(out.tangents, vertex, displacement, -1);
          includeBounds(out.bounds, out.positions, vertex);
        }
      }
    } else {
      for (let ringIndex = 0; ringIndex < ringVertexCount; ringIndex += 1) {
        const vertex = ringBase + ringIndex;
        const fraction = ringIndex / sideCount;
        const angle = ringIndex === sideCount ? 0 : fraction * Math.PI * 2;
        setTubeRadial(frameRight, frameUp, angle, radial);
        writePositionComponents(
          out.positions,
          vertex,
          center[0] + radial[0] * radius,
          center[1] + radial[1] * radius,
          center[2] + radial[2] * radius,
        );
        writeNormal(out.normals, vertex, radial);
        writeTangent(out.tangents, vertex, tangent, -1);
        includeBounds(out.bounds, out.positions, vertex);
      }
    }
  }
}

function applyTubeSectionShapeAndUvs(
  out: BrushGeometryArrays,
  stroke: StrokeData,
  pointCount: number,
  ringVertexCount: number,
  sideCount: number,
  hardEdges: boolean,
  isSquareBrush: boolean,
  shapeModifier: number,
  taperScalar: number | undefined,
  petalAmount: number | undefined,
  petalExponent: number | undefined,
  localBrushSize: number,
  usesStretchUvs: boolean,
  pressureSizeMin: number,
  solidMinLengthMeters: number | undefined,
): void {
  const center: Vec3 = [0, 0, 0];
  const frameRight: Vec3 = [0, 0, 0];
  const frameUp: Vec3 = [0, 0, 0];
  const radial: Vec3 = [0, 0, 0];
  const displacement: Vec3 = [0, 0, 0];
  if (shapeModifier !== 0) {
    resetBounds(out.bounds);
  }
  let sectionStart = 0;
  for (let boundary = 1; boundary <= pointCount; boundary += 1) {
    if (boundary < pointCount && out.tubeBreakBefore[boundary] !== 1) {
      continue;
    }
    const sectionEnd = boundary - 1;
    const sectionPointCount = sectionEnd - sectionStart + 1;
    let sectionLength = 0;
    for (let pointIndex = sectionStart + 1; pointIndex <= sectionEnd; pointIndex += 1) {
      sectionLength += distanceBetweenScratchPoints(
        out.geometrySmoothedPositions,
        pointIndex - 1,
        pointIndex,
      );
    }
    let runningLength = 0;
    const lastLength =
      sectionPointCount > 1
        ? distanceBetweenControlPoints(
            stroke.controlPoints[sectionEnd - 1],
            stroke.controlPoints[sectionEnd],
          )
        : 0;
    const lastPressuredSize =
      localBrushSize *
      getPressureSizeMultiplier(
        out.tubeSmoothedPressures[sectionEnd],
        pressureSizeMin,
      );
    const solidMinimum =
      typeof solidMinLengthMeters === "number" &&
      Number.isFinite(solidMinLengthMeters)
        ? Math.max(0, solidMinLengthMeters)
        : 0;
    const loftedPartialProgress = clamp01(
      lastLength /
        Math.max(
          solidMinimum + lastPressuredSize * TUBE_SOLID_ASPECT_RATIO,
          EPSILON,
        ),
    );
    for (let pointIndex = sectionStart; pointIndex <= sectionEnd; pointIndex += 1) {
      if (pointIndex > sectionStart) {
        runningLength += distanceBetweenScratchPoints(
          out.geometrySmoothedPositions,
          pointIndex - 1,
          pointIndex,
        );
      }
      const localIndex = pointIndex - sectionStart;
      const progress =
        sectionLength > EPSILON ? runningLength / sectionLength : 0;
      const sectionSegmentCount = Math.max(sectionPointCount - 1, 1);
      const ringU = usesStretchUvs
        ? Math.min(localIndex, sectionSegmentCount - 1) / sectionSegmentCount
        : out.tubeRingUs[pointIndex];
      out.tubeRingUs[pointIndex] = ringU;
      const ringBase = pointIndex * ringVertexCount;
      for (let ringIndex = 0; ringIndex < ringVertexCount; ringIndex += 1) {
        const vertex = ringBase + ringIndex;
        if (usesStretchUvs) {
          out.uvs[vertex * 2] = ringU;
          if (out.uv0Size === 3) {
            out.packedUvs[vertex * 3] = ringU;
          }
        }
      }
      if (shapeModifier === 0) {
        continue;
      }
      // ModifySilhouetteOfSegment processes a geometry knot's shared back ring
      // and its newly-created front ring together. A later knot therefore
      // rewrites the preceding ring using the later knot's center, radius, and
      // curve parameter; only the displacement direction remains attached to
      // the original vertex.
      const ownerPointIndex = Math.min(pointIndex + 1, sectionEnd);
      const ownerLocalIndex = ownerPointIndex - sectionStart;
      const ownerRunningLength =
        ownerPointIndex === pointIndex
          ? runningLength
          : runningLength +
            distanceBetweenScratchPoints(
              out.geometrySmoothedPositions,
              pointIndex,
              ownerPointIndex,
            );
      const ownerProgress =
        sectionLength > EPSILON ? ownerRunningLength / sectionLength : 0;
      readScratchVec3(out.geometrySmoothedPositions, ownerPointIndex, center);
      readScratchVec3(out.tubeFrameRights, pointIndex, frameRight);
      readScratchVec3(out.tubeFrameUps, pointIndex, frameUp);
      const radius = out.tubeRadii[ownerPointIndex];
      const shapeScale = getTubeShapeScale(
        shapeModifier,
        ownerProgress,
        Math.max(0, ownerLocalIndex - 1),
        Math.max(0, sectionPointCount - 1),
        taperScalar,
        loftedPartialProgress,
      );
      const petalOffset =
        shapeModifier === 5
          ? Math.pow(ownerProgress, normalizeTubePetalExponent(petalExponent)) *
            normalizeTubePetalAmount(petalAmount) *
            localBrushSize *
            out.tubeSmoothedPressures[ownerPointIndex]
          : 0;
      if (hardEdges) {
        const halfStep = Math.PI / sideCount;
        for (let side = 0; side < sideCount; side += 1) {
          const angle =
            (side / sideCount) * Math.PI * 2 +
            (isSquareBrush ? Math.PI / 4 : 0);
          setTubeRadialScaled(
            frameRight,
            frameUp,
            angle,
            isSquareBrush ? 0.375 : 1,
            displacement,
          );
          for (let duplicate = 0; duplicate < 2; duplicate += 1) {
            const vertex = ringBase + side * 2 + duplicate;
            setTubeRadial(
              frameRight,
              frameUp,
              angle + (duplicate === 0 ? -halfStep : halfStep),
              radial,
            );
            writePositionComponents(
              out.positions,
              vertex,
              center[0] + displacement[0] * radius * shapeScale + radial[0] * petalOffset,
              center[1] + displacement[1] * radius * shapeScale + radial[1] * petalOffset,
              center[2] + displacement[2] * radius * shapeScale + radial[2] * petalOffset,
            );
            includeBounds(out.bounds, out.positions, vertex);
          }
        }
      } else {
        for (let ringIndex = 0; ringIndex < ringVertexCount; ringIndex += 1) {
          const vertex = ringBase + ringIndex;
          const fraction = ringIndex / sideCount;
          const angle = ringIndex === sideCount ? 0 : fraction * Math.PI * 2;
          setTubeRadial(frameRight, frameUp, angle, radial);
          writePositionComponents(
            out.positions,
            vertex,
            center[0] + radial[0] * (radius * shapeScale + petalOffset),
            center[1] + radial[1] * (radius * shapeScale + petalOffset),
            center[2] + radial[2] * (radius * shapeScale + petalOffset),
          );
          includeBounds(out.bounds, out.positions, vertex);
        }
      }
    }
    sectionStart = boundary;
  }
}

function generateParticleGeometry(
  stroke: StrokeData,
  options: BrushGeometryOptions,
  out: BrushGeometryArrays,
): boolean {
  if (options.generatorClass === "GeniusParticlesBrush") {
    return generateGeniusParticleGeometry(stroke, options, out);
  }
  if (
    options.generatorClass === "SprayBrush" ||
    options.generatorClass === "MidpointPlusLifetimeSprayBrush"
  ) {
    return generateSprayParticleGeometry(stroke, options, out);
  }
  out.uv0Size = 2;
  const pointCount = stroke.controlPoints.length;
  const vertexCount = pointCount * 4;
  const indexCount = pointCount * 6;
  const reallocated = ensureGeometryCapacity(out, vertexCount, indexCount);
  const { positions, normals, tangents, colors, uvs, indices, bounds } = out;
  const pressureSizeMin = normalizePressureSizeMin(options.pressureSizeRange?.[0]);
  const pressureOpacityMin = normalizePressureOpacityMin(
    options.pressureOpacityRange,
  );
  const pressureOpacityMax = normalizePressureOpacityMax(
    options.pressureOpacityRange,
  );
  const descriptorOpacity = normalizeDescriptorOpacity(
    options.geometryParams?.opacity,
  );
  const localBrushSize = getLocalBrushSize(stroke);

  for (let pointIndex = 0; pointIndex < pointCount; pointIndex += 1) {
    const point = stroke.controlPoints[pointIndex];
    const radius =
      localBrushSize *
      getPressureSizeMultiplier(point.pressure, pressureSizeMin) *
      0.5;
    const vertex = pointIndex * 4;
    const opacity = getPressureOpacityMultiplier(
      point.pressure,
      pressureOpacityMin,
      pressureOpacityMax,
    ) * descriptorOpacity;
    writeParticleVertex(
      positions,
      normals,
      tangents,
      colors,
      uvs,
      bounds,
      vertex,
      point.position,
      stroke.color,
      opacity,
      -radius,
      -radius,
      0,
      0,
    );
    writeParticleVertex(
      positions,
      normals,
      tangents,
      colors,
      uvs,
      bounds,
      vertex + 1,
      point.position,
      stroke.color,
      opacity,
      radius,
      -radius,
      1,
      0,
    );
    writeParticleVertex(
      positions,
      normals,
      tangents,
      colors,
      uvs,
      bounds,
      vertex + 2,
      point.position,
      stroke.color,
      opacity,
      radius,
      radius,
      1,
      1,
    );
    writeParticleVertex(
      positions,
      normals,
      tangents,
      colors,
      uvs,
      bounds,
      vertex + 3,
      point.position,
      stroke.color,
      opacity,
      -radius,
      radius,
      0,
      1,
    );

    const indexOffset = pointIndex * 6;
    indices[indexOffset] = vertex;
    indices[indexOffset + 1] = vertex + 1;
    indices[indexOffset + 2] = vertex + 2;
    indices[indexOffset + 3] = vertex;
    indices[indexOffset + 4] = vertex + 2;
    indices[indexOffset + 5] = vertex + 3;
  }

  out.family = "particle";
  out.vertexCount = vertexCount;
  out.indexCount = indexCount;
  return reallocated;
}

function generateSprayParticleGeometry(
  stroke: StrokeData,
  options: BrushGeometryOptions,
  out: BrushGeometryArrays,
): boolean {
  out.uv0Size = 2;
  const hasLifetime =
    options.generatorClass === "MidpointPlusLifetimeSprayBrush";
  stroke = retainSprayControlPoints(stroke, options, out, hasLifetime);
  out.uv1Size = hasLifetime ? 4 : 0;
  if (hasLifetime) {
    ensureGeometryPressureCapacity(out, stroke.controlPoints.length);
    prepareGeometrySmoothedPressures(stroke, options, out);
  }
  const localBrushSize = getLocalBrushSize(stroke);
  const pressureSizeMin = normalizePressureSizeMin(options.pressureSizeRange?.[0]);
  const particleRate = normalizePositive(
    options.geometryParams?.sprayRateMultiplier,
    1,
  );
  let quadCount = 0;
  for (let pointIndex = 1; pointIndex < stroke.controlPoints.length; pointIndex += 1) {
    const point = stroke.controlPoints[pointIndex];
    const pressure = hasLifetime
      ? out.geometrySmoothedPressures[pointIndex]
      : point.pressure;
    const segmentLength = distanceBetweenControlPoints(
      stroke.controlPoints[pointIndex - 1],
      point,
    );
    const pressuredSize =
      localBrushSize *
      getPressureSizeMultiplier(pressure, pressureSizeMin);
    const spawnInterval = pressuredSize / particleRate;
    if (spawnInterval > EPSILON) {
      quadCount += Math.min(500, Math.floor(segmentLength / spawnInterval));
    }
  }

  const hasBackfaces =
    !hasLifetime && options.geometryParams?.renderBackfaces === true;
  const frontVertexCount = quadCount * 4;
  const frontIndexCount = quadCount * 6;
  const vertexCount = frontVertexCount * (hasBackfaces ? 2 : 1);
  const indexCount = frontIndexCount * (hasBackfaces ? 2 : 1);
  const reallocated = ensureGeometryCapacity(out, vertexCount, indexCount);
  const { positions, normals, tangents, colors, uvs, indices, bounds } = out;
  const pressureOpacityMin = normalizePressureOpacityMin(
    options.pressureOpacityRange,
  );
  const pressureOpacityMax = normalizePressureOpacityMax(
    options.pressureOpacityRange,
  );
  const descriptorOpacity = normalizeDescriptorOpacity(
    options.geometryParams?.opacity,
  );
  const sizeVariance = normalizeNonNegative(
    options.geometryParams?.particleSizeVariance,
  );
  const positionVariance = normalizeNonNegative(
    options.geometryParams?.particlePositionVariance,
  );
  const rotationVarianceDegrees = Math.fround(
    normalizeNonNegative(options.geometryParams?.particleRotationVariance),
  );
  const sizeRatioX = normalizePositive(
    options.geometryParams?.particleSizeRatio?.[0],
    1,
  );
  const sizeRatioY = normalizePositive(
    options.geometryParams?.particleSizeRatio?.[1],
    1,
  );
  const randomizeAlpha =
    options.geometryParams?.particleRandomizeAlpha === true;
  const usesAtlas = normalizeAtlasRows(options.geometryParams?.textureAtlasV) > 1;
  const pointerForward: Vec3 = [0, 0, 0];
  const pointerUp: Vec3 = [0, 0, 0];
  const segmentDirection: Vec3 = [0, 0, 0];
  const frameRight: Vec3 = [0, 0, 0];
  const frameNormal: Vec3 = [0, 0, 0];
  const rotatedRight: Vec3 = [0, 0, 0];
  const rotatedFacing: Vec3 = [0, 0, 0];
  const sourceLastSpawn: Vec3 = [0, 0, 0];
  const sourceCenter: Vec3 = [0, 0, 0];
  const sourceRandomOffset: Vec3 = [0, 0, 0];
  let quadIndex = 0;
  // SprayBrush decays its preview in place and offsets knot salts to preserve
  // its random sequence. MidpointPlusLifetimeSprayBrush instead inherits
  // GeometryBrush's full preview rebuild, so its salts restart with the
  // rebuilt knot indices.
  const knotIndexOffset = hasLifetime
    ? 0
    : normalizeNonNegativeInteger(options.particleKnotIndexOffset);

  for (let pointIndex = 1; pointIndex < stroke.controlPoints.length; pointIndex += 1) {
    const previousPoint = stroke.controlPoints[pointIndex - 1];
    const point = stroke.controlPoints[pointIndex];
    const pressure = hasLifetime
      ? out.geometrySmoothedPressures[pointIndex]
      : point.pressure;
    writeOpenBrushFloatDirection(
      previousPoint.position,
      point.position,
      segmentDirection,
    );
    const segmentLength = Math.hypot(
      point.position[0] - previousPoint.position[0],
      point.position[1] - previousPoint.position[1],
      point.position[2] - previousPoint.position[2],
    );
    if (segmentLength <= EPSILON) {
      continue;
    }
    const pressuredSize =
      localBrushSize *
      getPressureSizeMultiplier(pressure, pressureSizeMin);
    const spawnInterval = pressuredSize / particleRate;
    const sourcePressureSizeMin = Math.fround(pressureSizeMin);
    const sourcePressure = Math.fround(clamp01(pressure));
    const sourcePressureMultiplier = Math.fround(
      sourcePressureSizeMin +
        Math.fround(
          Math.fround(1 - sourcePressureSizeMin) * sourcePressure,
        ),
    );
    const sourcePressuredSize = Math.fround(
      Math.fround(localBrushSize * OPEN_BRUSH_UNITS_PER_METER) *
        sourcePressureMultiplier,
    );
    const sourceSpawnInterval = Math.fround(
      sourcePressuredSize / Math.fround(particleRate),
    );
    const segmentQuadCount =
      spawnInterval > EPSILON
        ? Math.min(500, Math.floor(segmentLength / spawnInterval))
        : 0;
    if (segmentQuadCount === 0) {
      continue;
    }
    rotateByUnityQuaternionFloat(point.orientation, VEC_FORWARD, pointerForward);
    rotateByUnityQuaternionFloat(point.orientation, VEC_UP, pointerUp);
    computeOpenBrushSprayFrame(
      segmentDirection,
      pointerForward,
      pointerUp,
      frameRight,
      frameNormal,
    );
    const baseOpacity =
      getPressureOpacityMultiplier(
        pressure,
        pressureOpacityMin,
        pressureOpacityMax,
      ) * descriptorOpacity;
    sourceLastSpawn[0] = Math.fround(
      previousPoint.position[0] * OPEN_BRUSH_UNITS_PER_METER,
    );
    sourceLastSpawn[1] = Math.fround(
      previousPoint.position[1] * OPEN_BRUSH_UNITS_PER_METER,
    );
    sourceLastSpawn[2] = Math.fround(
      previousPoint.position[2] * OPEN_BRUSH_UNITS_PER_METER,
    );

    for (let segmentQuad = 0; segmentQuad < segmentQuadCount; segmentQuad += 1) {
      const salt = hasLifetime
        ? 10 * ((pointIndex + knotIndexOffset) * 5 + segmentQuad)
        : 10 * ((pointIndex + knotIndexOffset) * 12 + (segmentQuad % 12));
      let rotation = Math.fround(
        -Math.fround(
          -rotationVarianceDegrees +
            Math.fround(
              Math.fround(rotationVarianceDegrees * 2) *
                statelessRandom01(stroke.seed, salt + 1),
            ),
        ),
      );
      // Unity's native Quaternion.AngleAxis path advances this float-range
      // result by one representable value before converting degrees. That bit
      // matters when the rotated quad is written beside a large world offset:
      // it can move FL - BL across a source-buffer rounding boundary.
      rotation = nextFloatAwayFromZero(rotation);
      rotateAroundUnityAxisFloat(frameRight, frameNormal, rotation, rotatedRight);
      rotateAroundUnityAxisFloat(
        segmentDirection,
        frameNormal,
        rotation,
        rotatedFacing,
      );
      const sourceRandomSize = Math.fround(
        1 +
          Math.fround(
            statelessRandom01(stroke.seed, salt) * Math.fround(sizeVariance),
          ),
      );
      const sourceSize = Math.fround(sourcePressuredSize * sourceRandomSize);
      writeRandomInsideSphereUnityFloat(
        stroke.seed,
        salt + 2,
        sourceRandomOffset,
      );
      const sourcePositionScale = Math.fround(
        sourceSize * Math.fround(positionVariance),
      );
      sourceCenter[0] = Math.fround(
        sourceLastSpawn[0] +
          Math.fround(sourceRandomOffset[0] * sourcePositionScale),
      );
      sourceCenter[1] = Math.fround(
        sourceLastSpawn[1] +
          Math.fround(sourceRandomOffset[1] * sourcePositionScale),
      );
      sourceCenter[2] = Math.fround(
        sourceLastSpawn[2] +
          Math.fround(sourceRandomOffset[2] * sourcePositionScale),
      );
      const sourceForwardScale = Math.fround(
        Math.fround(sourceSize * Math.fround(sizeRatioX)) * 0.5,
      );
      const sourceRightScale = Math.fround(
        Math.fround(sourceSize * Math.fround(sizeRatioY)) * 0.5,
      );
      const opacity = randomizeAlpha
        ? statelessRandom01(stroke.seed, salt + 5)
        : baseOpacity;
      const atlasCell = usesAtlas
        ? Math.min(3, Math.floor(statelessRandom01(stroke.seed, salt + 6) * 4))
        : 0;
      writeSprayParticleQuad(
        positions,
        normals,
        tangents,
        colors,
        uvs,
        out.uv1s,
        indices,
        bounds,
        quadIndex,
        rotatedFacing,
        rotatedRight,
        frameNormal,
        stroke.color,
        opacity,
        usesAtlas,
        atlasCell,
        hasLifetime,
        hasBackfaces,
        sourceCenter,
        sourceForwardScale,
        sourceRightScale,
        options.deterministicBirthTime === true
          ? 0
          : point.timestampMs * 0.001 +
            normalizeFinite(options.particleBirthTimeOffsetSeconds),
      );
      quadIndex += 1;
      sourceLastSpawn[0] = Math.fround(
        sourceLastSpawn[0] +
          Math.fround(segmentDirection[0] * sourceSpawnInterval),
      );
      sourceLastSpawn[1] = Math.fround(
        sourceLastSpawn[1] +
          Math.fround(segmentDirection[1] * sourceSpawnInterval),
      );
      sourceLastSpawn[2] = Math.fround(
        sourceLastSpawn[2] +
          Math.fround(segmentDirection[2] * sourceSpawnInterval),
      );
    }
  }

  out.family = "particle";
  out.vertexCount = vertexCount;
  out.indexCount = indexCount;
  return reallocated;
}

function retainSprayControlPoints(
  stroke: StrokeData,
  options: BrushGeometryOptions,
  out: BrushGeometryArrays,
  smoothPressure: boolean,
): StrokeData {
  const source = stroke.controlPoints;
  if (source.length < 2) {
    return stroke;
  }
  const retained = out.tubeRetainedControlPoints;
  retained.length = 0;
  retained.push(source[0]);
  const pressureSizeMin = normalizePressureSizeMin(options.pressureSizeRange?.[0]);
  const particleRate = normalizePositive(
    options.geometryParams?.sprayRateMultiplier,
    1,
  );
  const localBrushSize = getLocalBrushSize(stroke);
  const smoothingWindow = options.geometryParams?.m11Compatibility === true
    ? 0.1
    : 0.2;
  let lastRetained = source[0];
  let lastSmoothedPressure = clamp01(source[0].pressure);
  for (let pointIndex = 1; pointIndex < source.length; pointIndex += 1) {
    const point = source[pointIndex];
    const distance = distanceBetweenControlPoints(lastRetained, point);
    const pressure = smoothPressure
      ? Math.pow(0.1, distance / smoothingWindow) * lastSmoothedPressure +
        (1 - Math.pow(0.1, distance / smoothingWindow)) * clamp01(point.pressure)
      : clamp01(point.pressure);
    const pressuredSize =
      localBrushSize * getPressureSizeMultiplier(pressure, pressureSizeMin);
    const spawnInterval = pressuredSize / particleRate;
    // GeometryBrush repeatedly overwrites its leading knot until the distance
    // from the last keeper exceeds the brush's spawn interval. The current
    // leading knot remains renderable even when it has not become a keeper.
    if (
      pointIndex + 1 === source.length ||
      distance > spawnInterval
    ) {
      retained.push(point);
      lastRetained = point;
      lastSmoothedPressure = pressure;
    }
  }
  return retained.length === source.length
    ? stroke
    : { ...stroke, controlPoints: retained };
}

function generateGeniusParticleGeometry(
  stroke: StrokeData,
  options: BrushGeometryOptions,
  out: BrushGeometryArrays,
): boolean {
  out.uv0Size = 4;
  out.uv1Size = 3;
  const particleRate = normalizePositive(
    options.geometryParams?.particleRate,
    1,
  );
  const spawnInterval = OPEN_BRUSH_GENIUS_PARTICLE_INTERVAL / particleRate;
  stroke = retainGeniusControlPoints(stroke, options, out, spawnInterval);
  const pointCount = stroke.controlPoints.length;
  const distanceRemainder =
    normalizeNonNegative(options.particleDistanceOffset) % spawnInterval;
  const totalLength = measureStrokeLength(stroke) + distanceRemainder;
  const finalizedParticleCount =
    pointCount === 0 ? 0 : Math.floor(totalLength / spawnInterval) + 1;
  const particleCount =
    finalizedParticleCount +
    (pointCount > 0 && options.finalized !== true ? 1 : 0);
  const vertexCount = particleCount * 4;
  const indexCount = particleCount * 6;
  const reallocated = ensureGeometryCapacity(out, vertexCount, indexCount);
  const {
    positions,
    normals,
    tangents,
    colors,
    uvs,
    particleUvs,
    vectorUvs,
    indices,
    bounds,
  } = out;
  const pressureSizeMin = normalizePressureSizeMin(options.pressureSizeRange?.[0]);
  const pressureOpacityMin = normalizePressureOpacityMin(
    options.pressureOpacityRange,
  );
  const pressureOpacityMax = normalizePressureOpacityMax(
    options.pressureOpacityRange,
  );
  const descriptorOpacity = normalizeDescriptorOpacity(
    options.geometryParams?.opacity,
  );
  const localBrushSize = getLocalBrushSize(stroke);
  const sizeVariance = normalizeNonNegative(
    options.geometryParams?.particleSizeVariance,
  );
  const particleSpeed = normalizeNonNegative(
    options.geometryParams?.particleSpeed,
  );
  const minimumBrushSize = normalizePositive(
    options.geometryParams?.brushSizeRange?.[0],
    1,
  );
  const positionScale = particleSpeed / minimumBrushSize;
  const randomizeAlpha =
    options.geometryParams?.particleRandomizeAlpha === true;
  const atlasRows = normalizeAtlasRows(options.geometryParams?.textureAtlasV);
  const center: Vec3 = [0, 0, 0];
  const sphereOffset: Vec3 = [0, 0, 0];
  const particleUp: Vec3 = [0, 0, 0];
  const particleRight: Vec3 = [0, 0, 0];
  const particleRotation: Quat = [0, 0, 0, 1];
  let segmentIndex = Math.min(1, pointCount - 1);
  let segmentStartLength = 0;
  let segmentEndLength =
    pointCount > 1
      ? distanceRemainder + distanceBetweenControlPoints(
          stroke.controlPoints[0],
          stroke.controlPoints[1],
        )
      : distanceRemainder;
  let particleWithinKnot = 0;
  const knotIndexOffset = normalizeNonNegativeInteger(
    options.particleKnotIndexOffset,
  );

  for (let particleIndex = 0; particleIndex < particleCount; particleIndex += 1) {
    const distanceOnStroke = particleIndex * spawnInterval;
    while (
      segmentIndex < pointCount - 1 &&
      distanceOnStroke > segmentEndLength
    ) {
      segmentStartLength = segmentEndLength;
      segmentIndex += 1;
      segmentEndLength += distanceBetweenControlPoints(
        stroke.controlPoints[segmentIndex - 1],
        stroke.controlPoints[segmentIndex],
      );
      particleWithinKnot = 0;
    }
    const previousPoint =
      stroke.controlPoints[Math.max(0, segmentIndex - 1)] ??
      stroke.controlPoints[0];
    const currentPoint =
      stroke.controlPoints[segmentIndex] ?? stroke.controlPoints[0];
    const segmentLength = Math.max(
      segmentEndLength - segmentStartLength,
      EPSILON,
    );
    const ratio = clamp01(
      (distanceOnStroke - segmentStartLength) / segmentLength,
    );
    center[0] =
      previousPoint.position[0] +
      (currentPoint.position[0] - previousPoint.position[0]) * ratio;
    center[1] =
      previousPoint.position[1] +
      (currentPoint.position[1] - previousPoint.position[1]) * ratio;
    center[2] =
      previousPoint.position[2] +
      (currentPoint.position[2] - previousPoint.position[2]) * ratio;

    const rebuildsFinalTwoKnotParticle =
      options.finalized === true &&
      pointCount === 2 &&
      particleIndex === particleCount - 1;
    const pressure = rebuildsFinalTwoKnotParticle
      ? Math.max(0.8, currentPoint.pressure)
      : currentPoint.pressure;
    const salt =
      16 * ((segmentIndex + knotIndexOffset) * 16 + particleWithinKnot);
    const size =
      localBrushSize *
      getPressureSizeMultiplier(pressure, pressureSizeMin) *
      (1 + statelessRandom01(stroke.seed, salt) * sizeVariance);
    writeRandomUnitSphere(stroke.seed, salt + 2, sphereOffset);
    sphereOffset[2] = -sphereOffset[2];
    center[0] += sphereOffset[0] * size * positionScale;
    center[1] += sphereOffset[1] * size * positionScale;
    center[2] += sphereOffset[2] * size * positionScale;
    writeRandomRotation(stroke.seed, salt + 4, particleRotation);
    particleRotation[0] = -particleRotation[0];
    particleRotation[1] = -particleRotation[1];
    rotateByQuaternion(particleRotation, VEC_UP, particleUp);
    rotateByQuaternion(particleRotation, VEC_RIGHT, particleRight);
    const opacity = randomizeAlpha
      ? statelessRandom01(stroke.seed, salt + 1)
      : getPressureOpacityMultiplier(
          pressure,
          pressureOpacityMin,
          pressureOpacityMax,
        ) * descriptorOpacity;
    const quantizedOpacity = Math.floor(clamp01(opacity) * 255) / 255;
    const atlasCell =
      atlasRows > 1
        ? Math.min(3, Math.floor(statelessRandom01(stroke.seed, salt + 8) * 4))
        : 0;
    const halfRotationRange =
      (normalizeNonNegative(
        options.geometryParams?.particleInitialRotationRange,
      ) *
        Math.PI) /
      360;
    const initialRotation =
      (statelessRandom01(stroke.seed, salt + 7) * 2 - 1) * halfRotationRange;
    const birthTimeSeconds =
      options.deterministicBirthTime === true
        ? 0
        : (currentPoint.timestampMs * 0.001 +
            normalizeFinite(options.particleBirthTimeOffsetSeconds)) *
          (options.particlePreview === true ? -1 : 1);
    writeGeniusParticleQuad(
      positions,
      normals,
      tangents,
      colors,
      uvs,
      particleUvs,
      vectorUvs,
      indices,
      bounds,
      particleIndex,
      center,
      particleUp,
      particleRight,
      size,
      stroke.color,
      quantizedOpacity,
      atlasRows > 1,
      atlasCell,
      initialRotation,
      birthTimeSeconds,
      previousPoint.position,
      currentPoint.position,
      ratio,
    );
    particleWithinKnot += 1;
  }

  out.family = "particle";
  out.vertexCount = vertexCount;
  out.indexCount = indexCount;
  return reallocated;
}

function retainGeniusControlPoints(
  stroke: StrokeData,
  options: BrushGeometryOptions,
  out: BrushGeometryArrays,
  spawnInterval: number,
): StrokeData {
  const source = stroke.controlPoints;
  if (
    source.length < 2 ||
    normalizeNonNegativeInteger(options.particleKnotIndexOffset) > 0
  ) {
    return stroke;
  }
  const retained = out.tubeRetainedControlPoints;
  retained.length = 0;
  retained.push(source[0]);
  let distanceTravelled = normalizeNonNegative(options.particleDistanceOffset);
  let crossedSpawnInterval = false;
  for (let pointIndex = 1; pointIndex < source.length; pointIndex += 1) {
    // GeniusParticlesBrush checks its cumulative pointer travel inside the
    // base update before recording the movement to the current sample. The
    // first keeper therefore arrives one sample after crossing the interval.
    crossedSpawnInterval ||= distanceTravelled > spawnInterval;
    if (crossedSpawnInterval || pointIndex + 1 === source.length) {
      retained.push(source[pointIndex]);
    }
    distanceTravelled += distanceBetweenControlPoints(
      source[pointIndex - 1],
      source[pointIndex],
    );
  }
  return retained.length === source.length
    ? stroke
    : { ...stroke, controlPoints: retained };
}

function getPressureSizeMultiplier(
  pressure: number,
  pressureSizeMin: number,
): number {
  const clampedPressure = clamp01(pressure);
  return pressureSizeMin + (1 - pressureSizeMin) * clampedPressure;
}

function getPressureSizeMultiplierUnityFloat(
  pressure: number,
  pressureSizeMin: number,
): number {
  const minimum = Math.fround(pressureSizeMin);
  return Math.fround(
    minimum +
      Math.fround(
        Math.fround(1 - minimum) * Math.fround(clamp01(pressure)),
      ),
  );
}

function getPressureOpacityMultiplier(
  pressure: number,
  pressureOpacityMin: number,
  pressureOpacityMax: number,
): number {
  return (
    pressureOpacityMin +
    (pressureOpacityMax - pressureOpacityMin) * clamp01(pressure)
  );
}

function normalizePressureSizeMin(value: number | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_PRESSURE_SIZE_MIN;
  }
  return clamp01(value);
}

function normalizePressureOpacityMin(
  range: BrushPressureOpacityRange | undefined,
): number {
  return range && Number.isFinite(range[0]) ? clamp01(range[0]) : 1;
}

function normalizePressureOpacityMax(
  range: BrushPressureOpacityRange | undefined,
): number {
  return range && Number.isFinite(range[1]) ? clamp01(range[1]) : 1;
}

function normalizeDescriptorOpacity(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value)
    ? clamp01(value)
    : 1;
}

function normalizePositive(
  value: number | undefined,
  fallback: number,
): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}

function normalizeNonNegative(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, value)
    : 0;
}

function normalizeFinite(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function normalizeNonNegativeInteger(value: number | undefined): number {
  return Math.floor(normalizeNonNegative(value));
}

function normalizeTileRate(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : 1;
}

function normalizeAtlasRows(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 1
    ? Math.max(1, Math.floor(value))
    : 1;
}

function normalizeTubeSideCount(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(12, Math.max(3, Math.floor(value)))
    : 8;
}

function normalizeTubeCapAspect(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, value)
    : 0.8;
}

function normalizeTubeBreakAngleMultiplier(
  value: number | undefined,
): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, value)
    : 2;
}

function normalizeTubeShapeModifier(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(5, Math.max(0, Math.floor(value)))
    : 0;
}

function normalizeTubePetalAmount(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0.5;
}

function normalizeTubePetalExponent(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, value)
    : 3;
}

function getTubeShapeScale(
  modifier: number,
  progress: number,
  pointIndex: number,
  pointCount: number,
  taperScalar: number | undefined,
  partialProgress: number,
): number {
  switch (modifier) {
    case 1:
      return getLoftedTubeScale(
        pointIndex,
        pointCount,
        partialProgress,
      );
    case 2:
    case 5:
      return Math.abs(Math.sin(progress * Math.PI));
    case 3:
      return Math.sin(progress * 1.5 + 1.55);
    case 4:
      return (Number.isFinite(taperScalar) ? (taperScalar as number) : 1) *
        (1 - progress);
    default:
      return 1;
  }
}

function getLoftedTubeScale(
  pointIndex: number,
  pointCount: number,
  partialProgress: number,
): number {
  if (pointCount < 3) {
    return 0;
  }
  const halfCount = Math.ceil(Math.min(5, pointCount / 2));
  const nextHalfCount = Math.ceil(Math.min(5, (pointCount + 1) / 2));
  const reverseIndex = pointCount - pointIndex - 1;
  const nextReverseIndex = pointCount + 1 - pointIndex - 1;
  let current = 1;
  let next = 1;
  if (pointIndex < halfCount) {
    current = pointIndex / Math.max(1, halfCount - 1);
  } else if (reverseIndex < halfCount) {
    current = Math.max(0, reverseIndex - 1) / Math.max(1, halfCount - 1);
  }
  if (pointIndex < nextHalfCount) {
    next = pointIndex / Math.max(1, nextHalfCount - 1);
  } else if (nextReverseIndex < nextHalfCount) {
    next = Math.max(0, nextReverseIndex - 1) /
      Math.max(1, nextHalfCount - 1);
  }
  current += (next - current) * 0.185;
  current += (next - current) * clamp01(partialProgress);
  const attenuation = clamp01((pointCount - 3 + partialProgress) / 7);
  return clamp01(current * attenuation);
}

const TUBE_SOLID_ASPECT_RATIO = 0.2;

function normalizeHueShift(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function statelessRandom01(seed: number, salt: number): number {
  let value = (seed ^ salt) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x7feb352d) >>> 0;
  value = Math.imul(value ^ (value >>> 15), 0x846ca68b) >>> 0;
  value = (value ^ (value >>> 16)) >>> 0;
  return Math.min(Math.fround(value) / 0x1_0000_0000, 1 - 2 ** -24);
}

function writeRandomUnitSphere(
  seed: number,
  salt: number,
  out: Vec3,
): void {
  const z = statelessRandom01(seed, salt) * 2 - 1;
  const angle = statelessRandom01(seed, salt + 1) * Math.PI * 2;
  const radius = Math.sqrt(Math.max(0, 1 - z * z));
  out[0] = radius * Math.cos(angle);
  out[1] = radius * Math.sin(angle);
  out[2] = z;
}

function writeRandomInsideSphereUnityFloat(
  seed: number,
  salt: number,
  out: Vec3,
): void {
  const u = Math.fround(
    -1 + Math.fround(2 * statelessRandom01(seed, salt)),
  );
  const twoPi = Math.fround(2 * Math.fround(Math.PI));
  const theta = Math.fround(
    twoPi * statelessRandom01(seed, salt + 1),
  );
  const circleRadius = Math.fround(
    Math.sqrt(Math.fround(1 - Math.fround(u * u))),
  );
  const sphereX = Math.fround(circleRadius * Math.fround(Math.cos(theta)));
  const sphereY = Math.fround(circleRadius * Math.fround(Math.sin(theta)));
  const volumeRadius = Math.fround(
    Math.pow(
      statelessRandom01(seed, salt + 2),
      Math.fround(1 / Math.fround(3)),
    ),
  );
  out[0] = Math.fround(volumeRadius * sphereX);
  out[1] = Math.fround(volumeRadius * sphereY);
  // Convert the Unity-space random vector to the reflected Three.js basis.
  out[2] = Math.fround(-Math.fround(volumeRadius * u));
}

function rotateAroundAxis(
  input: Vec3,
  axis: Vec3,
  angle: number,
  out: Vec3,
): void {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  const projection = dot(axis, input) * (1 - cosine);
  out[0] =
    input[0] * cosine +
    (axis[1] * input[2] - axis[2] * input[1]) * sine +
    axis[0] * projection;
  out[1] =
    input[1] * cosine +
    (axis[2] * input[0] - axis[0] * input[2]) * sine +
    axis[1] * projection;
  out[2] =
    input[2] * cosine +
    (axis[0] * input[1] - axis[1] * input[0]) * sine +
    axis[2] * projection;
}

function writeRandomRotation(
  seed: number,
  salt: number,
  out: Quat,
): void {
  const firstRadius = Math.sqrt(statelessRandom01(seed, salt + 1));
  const firstAngle = statelessRandom01(seed, salt) * Math.PI * 2;
  const secondRadius = Math.sqrt(Math.max(0, 1 - firstRadius * firstRadius));
  const secondAngle = statelessRandom01(seed, salt + 2) * Math.PI * 2;
  out[0] = Math.sin(firstAngle) * firstRadius;
  out[1] = Math.cos(firstAngle) * firstRadius;
  out[2] = Math.sin(secondAngle) * secondRadius;
  out[3] = Math.cos(secondAngle) * secondRadius;
}

function shiftHue(color: Rgba, hueDegrees: number): Rgba {
  if (hueDegrees === 0) {
    return [color[0], color[1], color[2], color[3]];
  }
  const max = Math.max(color[0], color[1], color[2]);
  const min = Math.min(color[0], color[1], color[2]);
  const lightness = (max + min) * 0.5;
  const delta = max - min;
  if (delta <= EPSILON) {
    return [color[0], color[1], color[2], color[3]];
  }

  const saturation =
    delta / (1 - Math.abs(2 * lightness - 1));
  let hue: number;
  if (max === color[0]) {
    hue = 60 * (((color[1] - color[2]) / delta) % 6);
  } else if (max === color[1]) {
    hue = 60 * ((color[2] - color[0]) / delta + 2);
  } else {
    hue = 60 * ((color[0] - color[1]) / delta + 4);
  }
  hue = ((hue + hueDegrees) % 360 + 360) % 360;

  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const match = lightness - chroma * 0.5;
  let red = 0;
  let green = 0;
  let blue = 0;
  if (hue < 60) {
    red = chroma;
    green = x;
  } else if (hue < 120) {
    red = x;
    green = chroma;
  } else if (hue < 180) {
    green = chroma;
    blue = x;
  } else if (hue < 240) {
    green = x;
    blue = chroma;
  } else if (hue < 300) {
    red = x;
    blue = chroma;
  } else {
    red = chroma;
    blue = x;
  }
  return [red + match, green + match, blue + match, color[3]];
}

function measureStrokeLength(stroke: StrokeData): number {
  let length = 0;
  for (let index = 1; index < stroke.controlPoints.length; index += 1) {
    length += distanceBetweenControlPoints(
      stroke.controlPoints[index - 1],
      stroke.controlPoints[index],
    );
  }
  return length;
}

function prepareRibbonSections(
  stroke: StrokeData,
  out: BrushGeometryArrays,
): number {
  const pointCount = stroke.controlPoints.length;
  ensureRibbonScratchCapacity(out, pointCount);
  const {
    ribbonBreakBefore,
    ribbonRunningLengths,
    ribbonSectionLengths,
  } = out;
  let connectedSegmentCount = 0;
  let sectionStart = 0;
  let runningLength = 0;
  let previousDirectionX = 0;
  let previousDirectionY = 0;
  let previousDirectionZ = 0;
  let hasPreviousDirection = false;

  for (let index = 1; index < pointCount; index += 1) {
    const previous = stroke.controlPoints[index - 1].position;
    const current = stroke.controlPoints[index].position;
    const deltaX = current[0] - previous[0];
    const deltaY = current[1] - previous[1];
    const deltaZ = current[2] - previous[2];
    const segmentLength = Math.hypot(deltaX, deltaY, deltaZ);
    const inverseLength =
      segmentLength > EPSILON ? 1 / segmentLength : 0;
    const directionX = deltaX * inverseLength;
    const directionY = deltaY * inverseLength;
    const directionZ = deltaZ * inverseLength;
    const reverses =
      hasPreviousDirection &&
      previousDirectionX * directionX +
        previousDirectionY * directionY +
        previousDirectionZ * directionZ <
        0;
    const breaks =
      segmentLength < OPEN_BRUSH_RIBBON_MINIMUM_MOVE_METERS || reverses;

    if (breaks) {
      ribbonBreakBefore[index] = 1;
      for (let sectionIndex = sectionStart; sectionIndex < index; sectionIndex += 1) {
        ribbonSectionLengths[sectionIndex] = runningLength;
      }
      sectionStart = index;
      runningLength = 0;
    } else {
      runningLength += segmentLength;
      connectedSegmentCount += 1;
    }
    ribbonRunningLengths[index] = runningLength;
    if (segmentLength >= OPEN_BRUSH_RIBBON_MINIMUM_MOVE_METERS) {
      previousDirectionX = directionX;
      previousDirectionY = directionY;
      previousDirectionZ = directionZ;
      hasPreviousDirection = true;
    }
  }
  for (let sectionIndex = sectionStart; sectionIndex < pointCount; sectionIndex += 1) {
    ribbonSectionLengths[sectionIndex] = runningLength;
  }
  return connectedSegmentCount;
}

/** Frame the retained GeometryBrush knots before FlatGeometry emits strips. */
function prepareFlatGeometrySections(
  stroke: StrokeData,
  options: BrushGeometryOptions,
  out: BrushGeometryArrays,
): void {
  const pointCount = stroke.controlPoints.length;
  ensureRibbonScratchCapacity(out, pointCount);
  const {
    ribbonBreakBefore,
    ribbonRunningLengths,
    ribbonSectionLengths,
  } = out;

  let lastRetainedPoint = 0;
  for (let pointIndex = 1; pointIndex < pointCount; pointIndex += 1) {
    const length = distanceBetweenOpenBrushPoints(
      stroke.controlPoints[lastRetainedPoint].position,
      stroke.controlPoints[pointIndex].position,
    );
    if (
      length <
      OPEN_BRUSH_RIBBON_MINIMUM_MOVE_METERS * OPEN_BRUSH_UNITS_PER_METER
    ) {
      ribbonBreakBefore[pointIndex] = 2;
      continue;
    }
    lastRetainedPoint = pointIndex;
  }

  const smoothedPressures = out.ribbonSmoothedPressures;
  const isM11 = options.geometryParams?.m11Compatibility === true;
  const pressureWindow = isM11 ? 0.1 : 0.2;
  smoothedPressures[0] = isM11
    ? 0
    : clamp01(stroke.controlPoints[0].pressure);
  lastRetainedPoint = 0;
  for (let pointIndex = 1; pointIndex < pointCount; pointIndex += 1) {
    if (ribbonBreakBefore[pointIndex] === 2) {
      smoothedPressures[pointIndex] = smoothedPressures[lastRetainedPoint];
      continue;
    }
    const distanceSource = distanceBetweenOpenBrushPoints(
      stroke.controlPoints[lastRetainedPoint].position,
      stroke.controlPoints[pointIndex].position,
    );
    const retained = Math.fround(
      Math.pow(
        Math.fround(0.1),
        Math.fround(
          distanceSource /
            Math.fround(pressureWindow * OPEN_BRUSH_UNITS_PER_METER),
        ),
      ),
    );
    smoothedPressures[pointIndex] = Math.fround(
      Math.fround(retained * smoothedPressures[lastRetainedPoint]) +
        Math.fround(
          Math.fround(1 - retained) *
            Math.fround(clamp01(stroke.controlPoints[pointIndex].pressure)),
        ),
    );
    lastRetainedPoint = pointIndex;
  }

  lastRetainedPoint = 0;
  for (let pointIndex = 0; pointIndex < pointCount; pointIndex += 1) {
    out.ribbonPreviousRetained[pointIndex] = lastRetainedPoint;
    if (pointIndex > 0 && ribbonBreakBefore[pointIndex] !== 2) {
      lastRetainedPoint = pointIndex;
    }
  }
  let nextRetainedPoint = lastRetainedPoint;
  for (let pointIndex = pointCount - 1; pointIndex >= 0; pointIndex -= 1) {
    out.ribbonNextRetained[pointIndex] = nextRetainedPoint;
    if (ribbonBreakBefore[pointIndex] !== 2) {
      nextRetainedPoint = pointIndex;
    }
  }

  if (options.geometryParams?.m11Compatibility !== true) {
    let previousRetainedPoint = 0;
    let currentRetainedPoint = -1;
    for (let pointIndex = 1; pointIndex < pointCount; pointIndex += 1) {
      if (ribbonBreakBefore[pointIndex] === 2) {
        continue;
      }
      if (currentRetainedPoint < 0) {
        currentRetainedPoint = pointIndex;
        continue;
      }
      const previous = stroke.controlPoints[previousRetainedPoint].position;
      const current = stroke.controlPoints[currentRetainedPoint].position;
      const next = stroke.controlPoints[pointIndex].position;
      const incomingX = current[0] - previous[0];
      const incomingY = current[1] - previous[1];
      const incomingZ = current[2] - previous[2];
      const outgoingX = next[0] - current[0];
      const outgoingY = next[1] - current[1];
      const outgoingZ = next[2] - current[2];
      if (
        incomingX * outgoingX +
          incomingY * outgoingY +
          incomingZ * outgoingZ <
        0
      ) {
        ribbonBreakBefore[currentRetainedPoint] = 1;
      }
      previousRetainedPoint = currentRetainedPoint;
      currentRetainedPoint = pointIndex;
    }
  }

  let sectionStart = 0;
  let runningLength = 0;
  lastRetainedPoint = 0;
  for (let pointIndex = 1; pointIndex < pointCount; pointIndex += 1) {
    const state = ribbonBreakBefore[pointIndex];
    if (state === 2) {
      ribbonRunningLengths[pointIndex] = runningLength;
      continue;
    }
    const length = distanceBetweenOpenBrushPoints(
      stroke.controlPoints[lastRetainedPoint].position,
      stroke.controlPoints[pointIndex].position,
    );
    if (state === 1) {
      for (let index = sectionStart; index < pointIndex; index += 1) {
        ribbonSectionLengths[index] = runningLength;
      }
      sectionStart = pointIndex;
      runningLength = 0;
    } else {
      runningLength = Math.fround(runningLength + length);
    }
    ribbonRunningLengths[pointIndex] = runningLength;
    lastRetainedPoint = pointIndex;
  }
  for (let index = sectionStart; index < pointCount; index += 1) {
    ribbonSectionLengths[index] = runningLength;
  }
}

/**
 * QuadStrip distinguishes an input sample that is too close to the last spawn
 * point from a sharp-turn strip break. The former produces no solid and leaves
 * brush state untouched; the latter still emits the current solid as the first
 * member of a new, unfused section. Values in ribbonBreakBefore therefore mean
 * 0 = ordinary solid, 1 = generated section start, and 2 = skipped sample.
 */
function prepareQuadStripSections(
  stroke: StrokeData,
  options: BrushGeometryOptions,
  out: BrushGeometryArrays,
): void {
  const pointCount = stroke.controlPoints.length;
  ensureRibbonScratchCapacity(out, pointCount);
  const {
    ribbonBreakBefore,
    ribbonRunningLengths,
    ribbonSectionLengths,
    ribbonSmoothedPressures,
  } = out;
  let sectionStart = 0;
  let runningLength = 0;
  let lastSpawnIndex = 0;
  let previousDirectionX = 0;
  let previousDirectionY = 0;
  let previousDirectionZ = 0;
  let hasPreviousDirection = false;
  let lastSpawnPressure = clamp01(stroke.controlPoints[0]?.pressure ?? 0);
  ribbonSmoothedPressures[0] = lastSpawnPressure;
  const localBrushSize = getLocalBrushSize(stroke);
  const pressureSizeMin = normalizePressureSizeMin(options.pressureSizeRange?.[0]);

  for (let index = 1; index < pointCount; index += 1) {
    const previous = stroke.controlPoints[lastSpawnIndex].position;
    const current = stroke.controlPoints[index].position;
    const deltaX = Math.fround(
      Math.fround(current[0] * OPEN_BRUSH_UNITS_PER_METER) -
        Math.fround(previous[0] * OPEN_BRUSH_UNITS_PER_METER),
    );
    const deltaY = Math.fround(
      Math.fround(current[1] * OPEN_BRUSH_UNITS_PER_METER) -
        Math.fround(previous[1] * OPEN_BRUSH_UNITS_PER_METER),
    );
    const deltaZ = Math.fround(
      Math.fround(current[2] * OPEN_BRUSH_UNITS_PER_METER) -
        Math.fround(previous[2] * OPEN_BRUSH_UNITS_PER_METER),
    );
    const segmentLengthSource = unityFloatMagnitudeComponents(
      deltaX,
      deltaY,
      deltaZ,
    );
    const segmentLength = segmentLengthSource / OPEN_BRUSH_UNITS_PER_METER;
    if (
      segmentLengthSource <
      OPEN_BRUSH_RIBBON_MINIMUM_MOVE_METERS * OPEN_BRUSH_UNITS_PER_METER
    ) {
      ribbonBreakBefore[index] = 2;
      ribbonSmoothedPressures[index] = lastSpawnPressure;
      ribbonRunningLengths[index] = runningLength;
      continue;
    }

    // QuadStripBrush smooths pressure from the last committed spawn. Rejected
    // and provisional samples do not advance either pressure or position
    // state, so every preview replacement must start from the same values.
    const rawPressure = clamp01(stroke.controlPoints[index].pressure);
    const retainedPressure = Math.fround(
      Math.pow(Math.fround(0.1), Math.fround(segmentLengthSource / 2)),
    );
    const smoothedPressure = Math.fround(
      Math.fround(retainedPressure * Math.fround(lastSpawnPressure)) +
        Math.fround(Math.fround(1 - retainedPressure) * Math.fround(rawPressure)),
    );
    ribbonSmoothedPressures[index] = smoothedPressure;

    // QuadStripBrush keeps one mutable leading quad for samples that have moved
    // far enough to update the brush but not far enough to commit a new solid.
    // A later sample overwrites that quad; only the final provisional sample is
    // visible in a live/finalized mesh. GetSpawnInterval is the fixed 1.5 mm
    // floor plus 20% of the pressure-adjusted brush size.
    const pressuredSizeSource = Math.fround(
      Math.fround(localBrushSize * OPEN_BRUSH_UNITS_PER_METER) *
        Math.fround(
          getPressureSizeMultiplier(smoothedPressure, pressureSizeMin),
        ),
    );
    const spawnIntervalSource = Math.fround(
      Math.fround(0.0015 * OPEN_BRUSH_UNITS_PER_METER) +
        Math.fround(pressuredSizeSource * 0.2),
    );
    const isFinalProvisional = index === pointCount - 1;
    if (segmentLengthSource < spawnIntervalSource && !isFinalProvisional) {
      ribbonBreakBefore[index] = 2;
      out.ribbonProvisionalSamples[index] = 1;
      ribbonRunningLengths[index] = runningLength;
      continue;
    }

    const directionX = Math.fround(deltaX / segmentLengthSource);
    const directionY = Math.fround(deltaY / segmentLengthSource);
    const directionZ = Math.fround(deltaZ / segmentLengthSource);
    const startsSection =
      hasPreviousDirection &&
      previousDirectionX * directionX +
        previousDirectionY * directionY +
        previousDirectionZ * directionZ <=
        0;
    if (startsSection) {
      for (let sectionIndex = sectionStart; sectionIndex < index; sectionIndex += 1) {
        ribbonSectionLengths[sectionIndex] = runningLength;
      }
      ribbonBreakBefore[index] = 1;
      sectionStart = index;
      runningLength = segmentLength;
    } else {
      runningLength += segmentLength;
    }
    ribbonRunningLengths[index] = runningLength;
    if (segmentLengthSource >= spawnIntervalSource) {
      lastSpawnIndex = index;
      lastSpawnPressure = smoothedPressure;
      previousDirectionX = directionX;
      previousDirectionY = directionY;
      previousDirectionZ = directionZ;
      hasPreviousDirection = true;
    }
  }
  for (let sectionIndex = sectionStart; sectionIndex < pointCount; sectionIndex += 1) {
    ribbonSectionLengths[sectionIndex] = runningLength;
  }
}

function resolveRibbonRenderPointCount(
  pointCount: number,
  options: BrushGeometryOptions,
  breakBefore: Uint8Array,
): number {
  if (
    options.generatorClass !== "FlatGeometryBrush" ||
    options.geometryParams?.m11Compatibility === true
  ) {
    return pointCount;
  }
  for (let index = pointCount - 1; index > 1; index -= 1) {
    if (breakBefore[index] !== 1) {
      continue;
    }
    return pointCount - index < 6 ? index + 1 : pointCount;
  }
  return pointCount;
}

function countConnectedRibbonSegments(
  breakBefore: Uint8Array,
  pointCount: number,
  generatedSectionBreaks = false,
): number {
  let count = 0;
  for (let index = 1; index < pointCount; index += 1) {
    if (generatedSectionBreaks ? breakBefore[index] !== 2 : breakBefore[index] === 0) {
      count += 1;
    }
  }
  return count;
}

function prepareRibbonSmoothedPressures(
  stroke: StrokeData,
  options: BrushGeometryOptions,
  out: BrushGeometryArrays,
): void {
  const pointCount = stroke.controlPoints.length;
  const pressures = out.ribbonSmoothedPressures;
  if (pointCount === 0) {
    return;
  }
  const isM11FlatGeometry =
    options.generatorClass === "FlatGeometryBrush" &&
    options.geometryParams?.m11Compatibility === true;
  pressures[0] = isM11FlatGeometry
    ? 0
    : clamp01(stroke.controlPoints[0].pressure);
  const windowMeters =
    isM11FlatGeometry
      ? 0.1
      : 0.2;
  for (let index = 1; index < pointCount; index += 1) {
    const distance = distanceBetweenControlPoints(
      stroke.controlPoints[index - 1],
      stroke.controlPoints[index],
    );
    const retained = Math.pow(0.1, distance / windowMeters);
    pressures[index] =
      retained * pressures[index - 1] +
      (1 - retained) * clamp01(stroke.controlPoints[index].pressure);
  }
}

function prepareTubeSmoothedPressures(
  stroke: StrokeData,
  options: BrushGeometryOptions,
  out: BrushGeometryArrays,
): void {
  const pointCount = stroke.controlPoints.length;
  const pressures = out.tubeSmoothedPressures;
  if (pointCount === 0) {
    return;
  }
  const isM11 = options.geometryParams?.m11Compatibility === true;
  pressures[0] = isM11 ? 0 : clamp01(stroke.controlPoints[0].pressure);
  const windowMeters = isM11
    ? 0.1
    : 0.2;
  for (let index = 1; index < pointCount; index += 1) {
    const distance = distanceBetweenControlPoints(
      stroke.controlPoints[index - 1],
      stroke.controlPoints[index],
    );
    const retained = Math.pow(0.1, distance / windowMeters);
    pressures[index] =
      retained * pressures[index - 1] +
      (1 - retained) * clamp01(stroke.controlPoints[index].pressure);
  }
}

function prepareGeometrySmoothedPressures(
  stroke: StrokeData,
  options: BrushGeometryOptions,
  out: BrushGeometryArrays,
): void {
  const pointCount = stroke.controlPoints.length;
  const pressures = out.geometrySmoothedPressures;
  if (pointCount === 0) {
    return;
  }
  const isM11 = options.geometryParams?.m11Compatibility === true;
  pressures[0] = isM11 ? 0 : clamp01(stroke.controlPoints[0].pressure);
  const windowMeters = isM11
    ? 0.1
    : 0.2;
  for (let index = 1; index < pointCount; index += 1) {
    const distance = distanceBetweenControlPoints(
      stroke.controlPoints[index - 1],
      stroke.controlPoints[index],
    );
    const retained = Math.pow(0.1, distance / windowMeters);
    pressures[index] =
      retained * pressures[index - 1] +
      (1 - retained) * clamp01(stroke.controlPoints[index].pressure);
  }
}

function prepareGeometrySmoothedPositions(
  stroke: StrokeData,
  out: BrushGeometryArrays,
  useOpenBrushFloatMath = false,
): void {
  const pointCount = stroke.controlPoints.length;
  for (let index = 0; index < pointCount; index += 1) {
    const current = stroke.controlPoints[index].position;
    const offset = index * 3;
    if (useOpenBrushFloatMath) {
      for (let axis = 0; axis < 3; axis += 1) {
        out.geometrySmoothedPositions[offset + axis] =
          getOpenBrushSmoothedPositionComponent(stroke, index, axis) /
          OPEN_BRUSH_UNITS_PER_METER;
      }
    } else if (index === 0 || index === pointCount - 1) {
      out.geometrySmoothedPositions[offset] = current[0];
      out.geometrySmoothedPositions[offset + 1] = current[1];
      out.geometrySmoothedPositions[offset + 2] = current[2];
    } else {
      const previous = stroke.controlPoints[index - 1].position;
      const next = stroke.controlPoints[index + 1].position;
      out.geometrySmoothedPositions[offset] =
        (previous[0] + 2 * current[0] + next[0]) * 0.25;
      out.geometrySmoothedPositions[offset + 1] =
        (previous[1] + 2 * current[1] + next[1]) * 0.25;
      out.geometrySmoothedPositions[offset + 2] =
        (previous[2] + 2 * current[2] + next[2]) * 0.25;
    }
  }
}

function distanceBetweenControlPoints(
  left: StrokeData["controlPoints"][number],
  right: StrokeData["controlPoints"][number],
): number {
  return Math.hypot(
    right.position[0] - left.position[0],
    right.position[1] - left.position[1],
    right.position[2] - left.position[2],
  );
}

function distanceBetweenScratchPoints(
  positions: Float32Array,
  leftIndex: number,
  rightIndex: number,
): number {
  const left = leftIndex * 3;
  const right = rightIndex * 3;
  return Math.hypot(
    positions[right] - positions[left],
    positions[right + 1] - positions[left + 1],
    positions[right + 2] - positions[left + 2],
  );
}

function measureScratchPathLength(
  positions: Float32Array,
  pointCount: number,
): number {
  let length = 0;
  for (let index = 1; index < pointCount; index += 1) {
    length += distanceBetweenScratchPoints(positions, index - 1, index);
  }
  return length;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
}

function writeSprayParticleQuad(
  positions: Float32Array,
  normals: Float32Array,
  tangents: Float32Array,
  colors: Float32Array,
  uvs: Float32Array,
  uv1s: Float32Array,
  indices: Uint32Array,
  bounds: BrushGeometryBounds,
  quadIndex: number,
  facing: Vec3,
  right: Vec3,
  normal: Vec3,
  color: Rgba,
  opacity: number,
  usesAtlas: boolean,
  atlasCell: number,
  hasLifetime: boolean,
  hasBackfaces: boolean,
  sourceCenter: Vec3,
  sourceForwardScale: number,
  sourceRightScale: number,
  birthTimeSeconds: number,
): void {
  const vertexStride = hasBackfaces ? 2 : 1;
  const vertex = quadIndex * 4 * vertexStride;
  const atlasScale = usesAtlas ? 0.5 : 1;
  const atlasU = usesAtlas ? (atlasCell % 2) * 0.5 : 0;
  const atlasV = usesAtlas ? Math.floor(atlasCell / 2) * 0.5 : 0;
  writeSprayParticleVertex(
    positions, normals, tangents, colors, uvs, uv1s, bounds,
    vertex, facing, right, normal,
    sourceCenter, -sourceForwardScale, sourceRightScale,
    color, opacity, atlasU, atlasV + atlasScale, hasLifetime, birthTimeSeconds,
  );
  writeSprayParticleVertex(
    positions, normals, tangents, colors, uvs, uv1s, bounds,
    vertex + vertexStride, facing, right, normal,
    sourceCenter, -sourceForwardScale, -sourceRightScale,
    color, opacity, atlasU, atlasV, hasLifetime, birthTimeSeconds,
  );
  writeSprayParticleVertex(
    positions, normals, tangents, colors, uvs, uv1s, bounds,
    vertex + vertexStride * 2, facing, right, normal,
    sourceCenter, sourceForwardScale, sourceRightScale,
    color, opacity, atlasU + atlasScale, atlasV + atlasScale,
    hasLifetime, birthTimeSeconds,
  );
  writeSprayParticleVertex(
    positions, normals, tangents, colors, uvs, uv1s, bounds,
    vertex + vertexStride * 3, facing, right, normal,
    sourceCenter, sourceForwardScale, -sourceRightScale,
    color, opacity, atlasU + atlasScale, atlasV, hasLifetime, birthTimeSeconds,
  );
  writeOpenBrushSprayTangents(
    tangents,
    normals,
    vertex,
    vertexStride,
    facing,
    right,
    sourceCenter,
    sourceForwardScale,
    sourceRightScale,
  );
  if (hasBackfaces) {
    for (let local = 0; local < 4; local += 1) {
      const frontVertex = vertex + local * 2;
      const backVertex = frontVertex + 1;
      copyPosition(positions, frontVertex, backVertex);
      copyNegatedNormal(normals, frontVertex, backVertex);
      copyTangent(tangents, frontVertex, backVertex, true);
      copyUv(uvs, frontVertex, backVertex);
      writeColorFromAlpha(
        colors,
        backVertex,
        color,
        colors[frontVertex * 4 + 3],
      );
    }
  }
  const indexOffset = quadIndex * 6 * vertexStride;
  indices[indexOffset] = vertex;
  indices[indexOffset + 1] = vertex + vertexStride * 3;
  indices[indexOffset + 2] = vertex + vertexStride;
  if (hasBackfaces) {
    indices[indexOffset + 3] = vertex + 7;
    indices[indexOffset + 4] = vertex + 1;
    indices[indexOffset + 5] = vertex + 3;
    indices[indexOffset + 6] = vertex;
    indices[indexOffset + 7] = vertex + 4;
    indices[indexOffset + 8] = vertex + 6;
    indices[indexOffset + 9] = vertex + 5;
    indices[indexOffset + 10] = vertex + 1;
    indices[indexOffset + 11] = vertex + 7;
  } else {
    indices[indexOffset + 3] = vertex;
    indices[indexOffset + 4] = vertex + 2;
    indices[indexOffset + 5] = vertex + 3;
  }
}

function writeOpenBrushSprayTangents(
  tangents: Float32Array,
  normals: Float32Array,
  vertex: number,
  vertexStride: number,
  facing: Vec3,
  right: Vec3,
  centerSource: Vec3,
  forwardScale: number,
  rightScale: number,
): void {
  const forwardOffset: Vec3 = [
    Math.fround(facing[0] * forwardScale),
    Math.fround(facing[1] * forwardScale),
    Math.fround(facing[2] * forwardScale),
  ];
  const rightOffset: Vec3 = [
    Math.fround(right[0] * rightScale),
    Math.fround(right[1] * rightScale),
    Math.fround(right[2] * rightScale),
  ];
  const tangentSource: Vec3 = [0, 0, 0];
  for (let axis = 0; axis < 3; axis += 1) {
    const backLeft = Math.fround(
      Math.fround(centerSource[axis] - forwardOffset[axis]) -
        rightOffset[axis],
    );
    const frontLeft = Math.fround(
      Math.fround(centerSource[axis] + forwardOffset[axis]) -
        rightOffset[axis],
    );
    tangentSource[axis] = Math.fround(frontLeft - backLeft);
  }
  for (let local = 0; local < 4; local += 1) {
    writeUnityFloatOrthonormalTangent(
      tangents,
      normals,
      vertex + local * vertexStride,
      tangentSource,
      -1,
    );
  }
}

function writeUnityFloatOrthonormalTangent(
  tangents: Float32Array,
  normals: Float32Array,
  vertex: number,
  source: Vec3,
  handedness: number,
): void {
  const normalOffset = vertex * 3;
  const normal: Vec3 = [
    normals[normalOffset],
    normals[normalOffset + 1],
    normals[normalOffset + 2],
  ];
  const projection = dotUnityFloat(source, normal);
  const tangent: Vec3 = [
    Math.fround(source[0] - Math.fround(projection * normal[0])),
    Math.fround(source[1] - Math.fround(projection * normal[1])),
    Math.fround(source[2] - Math.fround(projection * normal[2])),
  ];
  normalizeUnityFloatVector(tangent);
  writeTangent(tangents, vertex, tangent, handedness);
}

function writeSprayParticleVertex(
  positions: Float32Array,
  normals: Float32Array,
  tangents: Float32Array,
  colors: Float32Array,
  uvs: Float32Array,
  uv1s: Float32Array,
  bounds: BrushGeometryBounds,
  vertex: number,
  facing: Vec3,
  right: Vec3,
  normal: Vec3,
  sourceCenter: Vec3,
  sourceForwardScale: number,
  sourceRightScale: number,
  color: Rgba,
  opacity: number,
  u: number,
  v: number,
  hasLifetime: boolean,
  birthTimeSeconds: number,
): void {
  const positionOffset = vertex * 3;
  for (let axis = 0; axis < 3; axis += 1) {
    const sourcePosition = Math.fround(
      Math.fround(
        sourceCenter[axis] +
          Math.fround(facing[axis] * sourceForwardScale),
      ) + Math.fround(right[axis] * sourceRightScale),
    );
    positions[positionOffset + axis] = sourcePosition / OPEN_BRUSH_UNITS_PER_METER;
  }
  normals[positionOffset] = normal[0];
  normals[positionOffset + 1] = normal[1];
  normals[positionOffset + 2] = normal[2];
  writeTangent(tangents, vertex, facing, -1);
  writeColor(colors, vertex, color, opacity);
  const uvOffset = vertex * 2;
  uvs[uvOffset] = u;
  uvs[uvOffset + 1] = 1 - v;
  if (hasLifetime) {
    const uv1Offset = vertex * 4;
    uv1s[uv1Offset] = Math.fround(
      Math.fround(facing[0] * sourceForwardScale) +
        Math.fround(right[0] * sourceRightScale),
    ) / OPEN_BRUSH_UNITS_PER_METER;
    uv1s[uv1Offset + 1] = Math.fround(
      Math.fround(facing[1] * sourceForwardScale) +
        Math.fround(right[1] * sourceRightScale),
    ) / OPEN_BRUSH_UNITS_PER_METER;
    uv1s[uv1Offset + 2] = Math.fround(
      Math.fround(facing[2] * sourceForwardScale) +
        Math.fround(right[2] * sourceRightScale),
    ) / OPEN_BRUSH_UNITS_PER_METER;
    uv1s[uv1Offset + 3] = birthTimeSeconds;
  }
  includeBounds(bounds, positions, vertex);
}

function writeGeniusParticleQuad(
  positions: Float32Array,
  normals: Float32Array,
  tangents: Float32Array,
  colors: Float32Array,
  uvs: Float32Array,
  particleUvs: Float32Array,
  vectorUvs: Float32Array,
  indices: Uint32Array,
  bounds: BrushGeometryBounds,
  particleIndex: number,
  center: Vec3,
  up: Vec3,
  right: Vec3,
  size: number,
  color: Rgba,
  opacity: number,
  usesAtlas: boolean,
  atlasCell: number,
  initialRotation: number,
  birthTimeSeconds: number,
  previousPosition: Vec3,
  currentPosition: Vec3,
  positionRatio: number,
): void {
  const vertex = particleIndex * 4;
  const halfSize = size * 0.5;
  const atlasScale = usesAtlas ? 0.5 : 1;
  const atlasU = usesAtlas ? (atlasCell % 2) * 0.5 : 0;
  const atlasV = usesAtlas ? Math.floor(atlasCell / 2) * 0.5 : 0;
  for (let corner = 0; corner < 4; corner += 1) {
    const isTop = corner >= 2;
    const isRight = corner % 2 === 0;
    writeGeniusParticleVertex(
      positions,
      normals,
      tangents,
      colors,
      uvs,
      particleUvs,
      vectorUvs,
      bounds,
      vertex + corner,
      center,
      up,
      right,
      isTop ? halfSize : -halfSize,
      isRight ? halfSize : -halfSize,
      color,
      opacity,
      atlasU + (isTop ? atlasScale : 0),
      atlasV + (isRight ? atlasScale : 0),
      initialRotation,
      birthTimeSeconds,
      previousPosition,
      currentPosition,
      positionRatio,
    );
  }
  const indexOffset = particleIndex * 6;
  indices[indexOffset] = vertex;
  indices[indexOffset + 1] = vertex + 3;
  indices[indexOffset + 2] = vertex + 1;
  indices[indexOffset + 3] = vertex;
  indices[indexOffset + 4] = vertex + 2;
  indices[indexOffset + 5] = vertex + 3;
}

function writeGeniusParticleVertex(
  positions: Float32Array,
  normals: Float32Array,
  tangents: Float32Array,
  colors: Float32Array,
  uvs: Float32Array,
  particleUvs: Float32Array,
  vectorUvs: Float32Array,
  bounds: BrushGeometryBounds,
  vertex: number,
  center: Vec3,
  up: Vec3,
  right: Vec3,
  upScale: number,
  rightScale: number,
  color: Rgba,
  opacity: number,
  u: number,
  v: number,
  initialRotation: number,
  birthTimeSeconds: number,
  previousPosition: Vec3,
  currentPosition: Vec3,
  positionRatio: number,
): void {
  const positionOffset = vertex * 3;
  positions[positionOffset] =
    center[0] + up[0] * upScale + right[0] * rightScale;
  positions[positionOffset + 1] =
    center[1] + up[1] * upScale + right[1] * rightScale;
  positions[positionOffset + 2] =
    center[2] + up[2] * upScale + right[2] * rightScale;
  normals[positionOffset] = center[0];
  normals[positionOffset + 1] = center[1];
  normals[positionOffset + 2] = center[2];
  const tangentOffset = vertex * 4;
  tangents[tangentOffset] = right[0];
  tangents[tangentOffset + 1] = right[1];
  tangents[tangentOffset + 2] = right[2];
  tangents[tangentOffset + 3] = 1;
  writeColor(colors, vertex, color, opacity);
  const uvOffset = vertex * 2;
  uvs[uvOffset] = u;
  uvs[uvOffset + 1] = 1 - v;
  const packedUvOffset = vertex * 4;
  particleUvs[packedUvOffset] = u;
  particleUvs[packedUvOffset + 1] = 1 - v;
  particleUvs[packedUvOffset + 2] = initialRotation;
  particleUvs[packedUvOffset + 3] = birthTimeSeconds;
  const uv1Offset = vertex * 3;
  vectorUvs[uv1Offset] =
    previousPosition[0] +
    (currentPosition[0] - previousPosition[0]) * positionRatio;
  vectorUvs[uv1Offset + 1] =
    previousPosition[1] +
    (currentPosition[1] - previousPosition[1]) * positionRatio;
  vectorUvs[uv1Offset + 2] =
    previousPosition[2] +
    (currentPosition[2] - previousPosition[2]) * positionRatio;
  includeBounds(bounds, positions, vertex);
}

function writeParticleVertex(
  positions: Float32Array,
  normals: Float32Array,
  tangents: Float32Array,
  colors: Float32Array,
  uvs: Float32Array,
  bounds: BrushGeometryBounds,
  vertex: number,
  center: Vec3,
  color: Rgba,
  opacityMultiplier: number,
  offsetX: number,
  offsetY: number,
  u: number,
  v: number,
): void {
  writePosition(positions, vertex, [
    center[0] + offsetX,
    center[1] + offsetY,
    center[2],
  ]);
  writeNormal(normals, vertex, [0, 0, 1]);
  writeTangent(tangents, vertex, [1, 0, 0], 1);
  writeColor(colors, vertex, color, opacityMultiplier);
  writeUv(uvs, vertex, [u, v]);
  includeBounds(bounds, positions, vertex);
}

// WebXR pointer conventions: -Z is the pointing direction, +Y is up.
const VEC_FORWARD: Vec3 = [0, 0, -1];
const VEC_UP: Vec3 = [0, 1, 0];
const VEC_RIGHT: Vec3 = [1, 0, 0];
const EPSILON = 1e-6;
const OPEN_BRUSH_RIBBON_MINIMUM_MOVE_METERS = 5e-4;
const OPEN_BRUSH_TUBE_MINIMUM_MOVE_METERS = 5e-4;
const OPEN_BRUSH_GENIUS_PARTICLE_INTERVAL = 0.0025;

function getLocalBrushSize(stroke: StrokeData): number {
  const brushScale = Number.isFinite(stroke.brushScale)
    ? Math.max(0, stroke.brushScale)
    : 1;
  return Math.max(0, stroke.brushSize) * brushScale;
}

function initializeTubeFrame(
  orientation: Quat,
  tangent: Vec3,
  bootstrapUp: Vec3,
  frameRight: Vec3,
  frameUp: Vec3,
): void {
  // ComputeMinimalRotationFrame uses the pointer orientation to choose the
  // roll around a new section's tangent.
  rotateByUnityQuaternionFloat(orientation, VEC_UP, bootstrapUp);
  if (Math.abs(dot(bootstrapUp, tangent)) > 0.99) {
    rotateByUnityQuaternionFloat(orientation, VEC_RIGHT, bootstrapUp);
  }
  crossUnityFloat(bootstrapUp, tangent, frameRight);
  if (!normalizeUnityFloatVector(frameRight)) {
    anyPerpendicular(tangent, frameRight);
  }
  crossUnityFloat(tangent, frameRight, frameUp);
  normalizeUnityFloatVector(frameUp);
}

function getFrameRotationAngle(
  previousRight: Vec3,
  previousUp: Vec3,
  previousTangent: Vec3,
  right: Vec3,
  up: Vec3,
  tangent: Vec3,
): number {
  const trace =
    dot(previousRight, right) +
    dot(previousUp, up) +
    dot(previousTangent, tangent);
  return Math.acos(Math.min(1, Math.max(-1, (trace - 1) * 0.5)));
}

function writeScratchVec3(
  target: Float32Array,
  index: number,
  value: Vec3,
): void {
  const offset = index * 3;
  target[offset] = value[0];
  target[offset + 1] = value[1];
  target[offset + 2] = value[2];
}

function readScratchVec3(
  source: Float32Array,
  index: number,
  out: Vec3,
): void {
  const offset = index * 3;
  out[0] = source[offset];
  out[1] = source[offset + 1];
  out[2] = source[offset + 2];
}

function copyScratchVec3(
  target: Float32Array,
  sourceIndex: number,
  targetIndex: number,
): void {
  const sourceOffset = sourceIndex * 3;
  const targetOffset = targetIndex * 3;
  target[targetOffset] = target[sourceOffset];
  target[targetOffset + 1] = target[sourceOffset + 1];
  target[targetOffset + 2] = target[sourceOffset + 2];
}

function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(a: Vec3, b: Vec3, out: Vec3): void {
  const x = a[1] * b[2] - a[2] * b[1];
  const y = a[2] * b[0] - a[0] * b[2];
  const z = a[0] * b[1] - a[1] * b[0];
  out[0] = x;
  out[1] = y;
  out[2] = z;
}

function setTubeRadial(
  right: Vec3,
  up: Vec3,
  angle: number,
  out: Vec3,
): void {
  // Reflection from Unity's left-handed coordinates reverses the direction
  // around the ring while preserving its vertex numbering.
  const rightScale = Math.sin(angle);
  const upScale = -Math.cos(angle);
  out[0] = right[0] * rightScale + up[0] * upScale;
  out[1] = right[1] * rightScale + up[1] * upScale;
  out[2] = right[2] * rightScale + up[2] * upScale;
}

function setTubeRadialScaled(
  right: Vec3,
  up: Vec3,
  angle: number,
  upAspect: number,
  out: Vec3,
): void {
  const rightScale = Math.sin(angle);
  const upScale = -Math.cos(angle) * upAspect;
  out[0] = right[0] * rightScale + up[0] * upScale;
  out[1] = right[1] * rightScale + up[1] * upScale;
  out[2] = right[2] * rightScale + up[2] * upScale;
}

function copyVec3(source: Vec3, target: Vec3): void {
  target[0] = source[0];
  target[1] = source[1];
  target[2] = source[2];
}

function normalizeInPlace(v: Vec3): boolean {
  const length = Math.hypot(v[0], v[1], v[2]);
  if (length < EPSILON) {
    return false;
  }
  v[0] /= length;
  v[1] /= length;
  v[2] /= length;
  return true;
}

/** Matches Vector3.Slerp for unit directions and a clamped interpolation value. */
function slerpUnitVectors(
  from: Vec3,
  to: Vec3,
  amount: number,
  out: Vec3,
): void {
  const t = clamp01(amount);
  const cosine = Math.max(-1, Math.min(1, dot(from, to)));
  const angle = Math.acos(cosine);
  const sine = Math.sin(angle);
  if (sine < EPSILON) {
    out[0] = from[0] + (to[0] - from[0]) * t;
    out[1] = from[1] + (to[1] - from[1]) * t;
    out[2] = from[2] + (to[2] - from[2]) * t;
    normalizeInPlace(out);
    return;
  }
  const fromWeight = Math.sin((1 - t) * angle) / sine;
  const toWeight = Math.sin(t * angle) / sine;
  out[0] = from[0] * fromWeight + to[0] * toWeight;
  out[1] = from[1] * fromWeight + to[1] * toWeight;
  out[2] = from[2] * fromWeight + to[2] * toWeight;
}

function slerpUnityFloatUnitVectors(
  from: Vec3,
  to: Vec3,
  amount: number,
  out: Vec3,
): void {
  const t = Math.fround(clamp01(amount));
  const cosine = Math.max(-1, Math.min(1, dotUnityFloat(from, to)));
  const angle = Math.fround(Math.acos(cosine));
  const sine = Math.fround(Math.sin(angle));
  if (Math.abs(sine) < EPSILON) {
    for (let axis = 0; axis < 3; axis += 1) {
      out[axis] = Math.fround(
        from[axis] + Math.fround(Math.fround(to[axis] - from[axis]) * t),
      );
    }
    normalizeUnityFloatVector(out);
    return;
  }
  const fromWeight = Math.fround(
    Math.fround(Math.sin(Math.fround(Math.fround(1 - t) * angle))) / sine,
  );
  const toWeight = Math.fround(
    Math.fround(Math.sin(Math.fround(t * angle))) / sine,
  );
  for (let axis = 0; axis < 3; axis += 1) {
    out[axis] = Math.fround(
      Math.fround(from[axis] * fromWeight) +
        Math.fround(to[axis] * toWeight),
    );
  }
}

/** Writes some unit vector perpendicular to the given unit vector. */
function anyPerpendicular(v: Vec3, out: Vec3): void {
  if (Math.abs(v[1]) < 0.9) {
    cross(VEC_UP, v, out);
  } else {
    cross(VEC_RIGHT, v, out);
  }
  if (!normalizeInPlace(out)) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
  }
}

/** Rotates a vector by a unit quaternion [x, y, z, w]; zero quats act as identity. */
function rotateByQuaternion(
  q: readonly number[],
  v: Vec3,
  out: Vec3,
): void {
  const x = q[0];
  const y = q[1];
  const z = q[2];
  const w = q[3];
  const lengthSq = x * x + y * y + z * z + w * w;
  if (lengthSq < EPSILON) {
    out[0] = v[0];
    out[1] = v[1];
    out[2] = v[2];
    return;
  }
  // t = 2 q_vec × v; v' = v + w t + q_vec × t
  const tx = 2 * (y * v[2] - z * v[1]);
  const ty = 2 * (z * v[0] - x * v[2]);
  const tz = 2 * (x * v[1] - y * v[0]);
  out[0] = v[0] + w * tx + (y * tz - z * ty);
  out[1] = v[1] + w * ty + (z * tx - x * tz);
  out[2] = v[2] + w * tz + (x * ty - y * tx);
  const invLength = 1 / lengthSq;
  out[0] *= invLength;
  out[1] *= invLength;
  out[2] *= invLength;
}

// Open Brush generates in decimetres with Unity's single-precision vector
// operations. Particle frames recover those source-scale floats from the
// metre-based shared API before reproducing the frame calculation.
const OPEN_BRUSH_UNITS_PER_METER = 10;
const OPEN_BRUSH_TWO_PI_FLOAT = Math.fround(2 * Math.fround(Math.PI));

function writeOpenBrushFloatDirection(from: Vec3, to: Vec3, out: Vec3): void {
  out[0] = Math.fround(
    Math.fround(to[0] * OPEN_BRUSH_UNITS_PER_METER) -
      Math.fround(from[0] * OPEN_BRUSH_UNITS_PER_METER),
  );
  out[1] = Math.fround(
    Math.fround(to[1] * OPEN_BRUSH_UNITS_PER_METER) -
      Math.fround(from[1] * OPEN_BRUSH_UNITS_PER_METER),
  );
  out[2] = Math.fround(
    Math.fround(to[2] * OPEN_BRUSH_UNITS_PER_METER) -
      Math.fround(from[2] * OPEN_BRUSH_UNITS_PER_METER),
  );
  normalizeUnityFloatVector(out);
}

function distanceBetweenOpenBrushPoints(from: Vec3, to: Vec3): number {
  let lengthSquared = 0;
  for (let axis = 0; axis < 3; axis += 1) {
    const delta = Math.fround(
      Math.fround(to[axis] * OPEN_BRUSH_UNITS_PER_METER) -
        Math.fround(from[axis] * OPEN_BRUSH_UNITS_PER_METER),
    );
    lengthSquared = Math.fround(
      lengthSquared + Math.fround(delta * delta),
    );
  }
  return Math.fround(Math.sqrt(lengthSquared));
}

function openBrushWeightedOffset(
  previous: number,
  current: number,
  next: number,
): number {
  const previousSource = Math.fround(previous * OPEN_BRUSH_UNITS_PER_METER);
  const currentSource = Math.fround(current * OPEN_BRUSH_UNITS_PER_METER);
  const nextSource = Math.fround(next * OPEN_BRUSH_UNITS_PER_METER);
  return (
    Math.fround(
      Math.fround(
        Math.fround(previousSource * Math.fround(0.3)) +
          Math.fround(currentSource * Math.fround(0.4)),
      ) + Math.fround(nextSource * Math.fround(0.3)),
    ) / OPEN_BRUSH_UNITS_PER_METER
  );
}

function openBrushWeightedPosition(
  previous: number,
  current: number,
  next: number,
): number {
  const previousSource = Math.fround(previous * OPEN_BRUSH_UNITS_PER_METER);
  const currentSource = Math.fround(current * OPEN_BRUSH_UNITS_PER_METER);
  const nextSource = Math.fround(next * OPEN_BRUSH_UNITS_PER_METER);
  return (
    Math.fround(
      Math.fround(
        Math.fround(previousSource * Math.fround(0.3)) +
          Math.fround(currentSource * Math.fround(0.4)),
      ) + Math.fround(nextSource * Math.fround(0.3)),
    ) / OPEN_BRUSH_UNITS_PER_METER
  );
}

function rotateByUnityQuaternionFloat(
  q: readonly number[],
  v: Vec3,
  out: Vec3,
): void {
  const x = Math.fround(q[0]);
  const y = Math.fround(q[1]);
  const z = Math.fround(q[2]);
  const w = Math.fround(q[3]);
  const x2 = Math.fround(x * 2);
  const y2 = Math.fround(y * 2);
  const z2 = Math.fround(z * 2);
  const xx = Math.fround(x * x2);
  const yy = Math.fround(y * y2);
  const zz = Math.fround(z * z2);
  const xy = Math.fround(x * y2);
  const xz = Math.fround(x * z2);
  const yz = Math.fround(y * z2);
  const wx = Math.fround(w * x2);
  const wy = Math.fround(w * y2);
  const wz = Math.fround(w * z2);
  out[0] = Math.fround(
    Math.fround(Math.fround(1 - Math.fround(yy + zz)) * v[0]) +
      Math.fround(Math.fround(xy - wz) * v[1]) +
      Math.fround(Math.fround(xz + wy) * v[2]),
  );
  out[1] = Math.fround(
    Math.fround(Math.fround(xy + wz) * v[0]) +
      Math.fround(Math.fround(1 - Math.fround(xx + zz)) * v[1]) +
      Math.fround(Math.fround(yz - wx) * v[2]),
  );
  out[2] = Math.fround(
    Math.fround(Math.fround(xz - wy) * v[0]) +
      Math.fround(Math.fround(yz + wx) * v[1]) +
      Math.fround(Math.fround(1 - Math.fround(xx + yy)) * v[2]),
  );
}

function rotateAroundUnityAxisFloat(
  input: Vec3,
  axis: Vec3,
  angleDegrees: number,
  out: Vec3,
): void {
  const normalizedAxis: Vec3 = [axis[0], axis[1], axis[2]];
  normalizeUnityFloatVector(normalizedAxis);
  const halfRadians = Math.fround(
    Math.fround(angleDegrees * Math.fround(Math.PI / 180)) * 0.5,
  );
  const sine = Math.fround(Math.sin(halfRadians));
  const rotation: Quat = [
    Math.fround(normalizedAxis[0] * sine),
    Math.fround(normalizedAxis[1] * sine),
    Math.fround(normalizedAxis[2] * sine),
    Math.fround(Math.cos(halfRadians)),
  ];
  rotateByUnityQuaternionFloat(rotation, input, out);
}

function nextFloatAwayFromZero(value: number): number {
  if (value === 0 || !Number.isFinite(value)) return value;
  const magnitude = Math.abs(value);
  if (magnitude < 2 ** -126) {
    return Math.fround(value + Math.sign(value) * 2 ** -149);
  }
  const ulp = 2 ** (Math.floor(Math.log2(magnitude)) - 23);
  return Math.fround(value + Math.sign(value) * ulp);
}

function computeOpenBrushSprayFrame(
  tangent: Vec3,
  pointerForward: Vec3,
  pointerUp: Vec3,
  outRight: Vec3,
  outNormal: Vec3,
): void {
  const rightFromForward: Vec3 = [0, 0, 0];
  const rightFromUp: Vec3 = [0, 0, 0];
  crossUnityFloat(pointerForward, tangent, rightFromForward);
  crossUnityFloat(pointerUp, tangent, rightFromUp);
  // A cross product changes sign under the Unity-to-Three reflection.
  rightFromForward[0] = Math.fround(-rightFromForward[0]);
  rightFromForward[1] = Math.fround(-rightFromForward[1]);
  rightFromForward[2] = Math.fround(-rightFromForward[2]);
  rightFromUp[0] = Math.fround(-rightFromUp[0]);
  rightFromUp[1] = Math.fround(-rightFromUp[1]);
  rightFromUp[2] = Math.fround(-rightFromUp[2]);
  const upWeight = Math.fround(Math.abs(dotUnityFloat(pointerForward, tangent)));
  outRight[0] = Math.fround(
    rightFromForward[0] + Math.fround(rightFromUp[0] * upWeight),
  );
  outRight[1] = Math.fround(
    rightFromForward[1] + Math.fround(rightFromUp[1] * upWeight),
  );
  outRight[2] = Math.fround(
    rightFromForward[2] + Math.fround(rightFromUp[2] * upWeight),
  );
  normalizeUnityFloatVector(outRight);
  crossUnityFloat(tangent, outRight, outNormal);
  outNormal[0] = Math.fround(-outNormal[0]);
  outNormal[1] = Math.fround(-outNormal[1]);
  outNormal[2] = Math.fround(-outNormal[2]);
}

function crossUnityFloat(a: Vec3, b: Vec3, out: Vec3): void {
  out[0] = Math.fround(
    Math.fround(a[1] * b[2]) - Math.fround(a[2] * b[1]),
  );
  out[1] = Math.fround(
    Math.fround(a[2] * b[0]) - Math.fround(a[0] * b[2]),
  );
  out[2] = Math.fround(
    Math.fround(a[0] * b[1]) - Math.fround(a[1] * b[0]),
  );
}

function dotUnityFloat(a: Vec3, b: Vec3): number {
  return Math.fround(
    Math.fround(Math.fround(a[0] * b[0]) + Math.fround(a[1] * b[1])) +
      Math.fround(a[2] * b[2]),
  );
}

function normalizeUnityFloatVector(value: Vec3): boolean {
  const length = unityFloatMagnitude(value);
  if (length < EPSILON) return false;
  value[0] = Math.fround(value[0] / length);
  value[1] = Math.fround(value[1] / length);
  value[2] = Math.fround(value[2] / length);
  return true;
}

function unityFloatMagnitude(value: Vec3): number {
  return unityFloatMagnitudeComponents(value[0], value[1], value[2]);
}

function unityFloatMagnitudeComponents(x: number, y: number, z: number): number {
  const lengthSquared = Math.fround(
    Math.fround(
      Math.fround(x * x) + Math.fround(y * y),
    ) + Math.fround(z * z),
  );
  return Math.fround(Math.sqrt(lengthSquared));
}

/**
 * Writes the unit central-difference tangent at a control point, falling back
 * to the previous tangent (or the world forward) for degenerate segments.
 */
function writeCentralDifferenceTangent(
  stroke: StrokeData,
  index: number,
  previousTangent: Vec3,
  out: Vec3,
): void {
  const lastIndex = stroke.controlPoints.length - 1;
  const previous = stroke.controlPoints[Math.max(0, index - 1)].position;
  const next = stroke.controlPoints[Math.min(lastIndex, index + 1)].position;
  out[0] = next[0] - previous[0];
  out[1] = next[1] - previous[1];
  out[2] = next[2] - previous[2];
  if (!normalizeInPlace(out)) {
    out[0] = previousTangent[0];
    out[1] = previousTangent[1];
    out[2] = previousTangent[2];
    if (!normalizeInPlace(out)) {
      out[0] = VEC_FORWARD[0];
      out[1] = VEC_FORWARD[1];
      out[2] = VEC_FORWARD[2];
    }
  }
}

function writeOpenBrushCentralDifferenceTangent(
  stroke: StrokeData,
  index: number,
  previousTangent: Vec3,
  out: Vec3,
): void {
  const lastIndex = stroke.controlPoints.length - 1;
  const previous = stroke.controlPoints[Math.max(0, index - 1)].position;
  const next = stroke.controlPoints[Math.min(lastIndex, index + 1)].position;
  writeOpenBrushFloatDirection(previous, next, out);
  if (Math.hypot(out[0], out[1], out[2]) >= EPSILON) return;
  copyVec3(previousTangent, out);
  if (!normalizeUnityFloatVector(out)) copyVec3(VEC_FORWARD, out);
}

function writeOpenBrushIncomingTangent(
  stroke: StrokeData,
  index: number,
  previousTangent: Vec3,
  out: Vec3,
): void {
  const pointCount = stroke.controlPoints.length;
  const startIndex = index === 0 ? 0 : index - 1;
  const endIndex = index === 0 ? Math.min(1, pointCount - 1) : index;
  for (let axis = 0; axis < 3; axis += 1) {
    out[axis] = Math.fround(
      getOpenBrushSmoothedPositionComponent(stroke, endIndex, axis) -
        getOpenBrushSmoothedPositionComponent(stroke, startIndex, axis),
    );
  }
  if (!normalizeUnityFloatVector(out)) {
    out[0] = previousTangent[0];
    out[1] = previousTangent[1];
    out[2] = previousTangent[2];
    if (!normalizeUnityFloatVector(out)) {
      out[0] = VEC_FORWARD[0];
      out[1] = VEC_FORWARD[1];
      out[2] = VEC_FORWARD[2];
    }
  }
}

function getOpenBrushSmoothedPositionComponent(
  stroke: StrokeData,
  index: number,
  axis: number,
): number {
  const points = stroke.controlPoints;
  const current = Math.fround(
    points[index].position[axis] * OPEN_BRUSH_UNITS_PER_METER,
  );
  if (index === 0 || index + 1 === points.length) return current;
  const previous = Math.fround(
    points[index - 1].position[axis] * OPEN_BRUSH_UNITS_PER_METER,
  );
  const next = Math.fround(
    points[index + 1].position[axis] * OPEN_BRUSH_UNITS_PER_METER,
  );
  return Math.fround(
    Math.fround(Math.fround(previous + Math.fround(2 * current)) + next) *
      0.25,
  );
}

function distanceBetweenOpenBrushSmoothedPoints(
  stroke: StrokeData,
  startIndex: number,
  endIndex: number,
): number {
  let lengthSquared = 0;
  for (let axis = 0; axis < 3; axis += 1) {
    const delta = Math.fround(
      getOpenBrushSmoothedPositionComponent(stroke, endIndex, axis) -
        getOpenBrushSmoothedPositionComponent(stroke, startIndex, axis),
    );
    lengthSquared = Math.fround(
      lengthSquared + Math.fround(delta * delta),
    );
  }
  return Math.fround(Math.sqrt(lengthSquared));
}

function getOpenBrushTubeCapDiagonal(
  center: Vec3,
  up: Vec3,
  tangent: Vec3,
  radiusSource: number,
  capAspect: number,
  direction: number,
): number {
  const aspect = Math.fround(capAspect);
  let lengthSquared = 0;
  for (let axis = 0; axis < 3; axis += 1) {
    const centerSource = Math.fround(
      center[axis] * OPEN_BRUSH_UNITS_PER_METER,
    );
    const circlePoint = Math.fround(
      centerSource + Math.fround(up[axis] * radiusSource),
    );
    const tipOffset = Math.fround(
      Math.fround(Math.fround(tangent[axis] * radiusSource) * aspect) *
        direction,
    );
    const tip = Math.fround(centerSource + tipOffset);
    const delta = Math.fround(circlePoint - tip);
    lengthSquared = Math.fround(
      lengthSquared + Math.fround(delta * delta),
    );
  }
  return Math.fround(Math.sqrt(lengthSquared));
}

const surfaceFrameRight1: Vec3 = [0, 0, 0];
const surfaceFrameRight2: Vec3 = [0, 0, 0];

/**
 * Port of Open Brush's BaseBrushScript.ComputeSurfaceFrameNew: an orthogonal
 * ribbon frame from the movement direction and pointer orientation. The
 * pointer-up cross term takes over as pointer-forward approaches the movement
 * direction (pulling the brush), and both terms are flipped toward the
 * previous right vector so the strip never flips mid-stroke.
 */
function computeSurfaceFrame(
  preferredRight: Vec3,
  tangent: Vec3,
  pointerForward: Vec3,
  pointerUp: Vec3,
  isFirst: boolean,
  outRight: Vec3,
  outNormal: Vec3,
  mirrored = false,
  preferPointerFacing = false,
): void {
  cross(pointerForward, tangent, surfaceFrameRight1);
  cross(pointerUp, tangent, surfaceFrameRight2);
  if (mirrored) {
    surfaceFrameRight1[0] = -surfaceFrameRight1[0];
    surfaceFrameRight1[1] = -surfaceFrameRight1[1];
    surfaceFrameRight1[2] = -surfaceFrameRight1[2];
    surfaceFrameRight2[0] = -surfaceFrameRight2[0];
    surfaceFrameRight2[1] = -surfaceFrameRight2[1];
    surfaceFrameRight2[2] = -surfaceFrameRight2[2];
  }

  const hasPreferredRight =
    !isFirst &&
    Math.hypot(preferredRight[0], preferredRight[1], preferredRight[2]) >=
      EPSILON;
  const preferred = preferPointerFacing ? surfaceFrameRight1 : preferredRight;
  const hasPreferred = preferPointerFacing || hasPreferredRight;
  const flip1 = hasPreferred && dot(surfaceFrameRight1, preferred) < 0 ? -1 : 1;
  const upWeight =
    Math.abs(dot(pointerForward, tangent)) *
    (hasPreferred && dot(surfaceFrameRight2, preferred) < 0 ? -1 : 1);
  outRight[0] = surfaceFrameRight1[0] * flip1 + surfaceFrameRight2[0] * upWeight;
  outRight[1] = surfaceFrameRight1[1] * flip1 + surfaceFrameRight2[1] * upWeight;
  outRight[2] = surfaceFrameRight1[2] * flip1 + surfaceFrameRight2[2] * upWeight;
  if (!normalizeInPlace(outRight)) {
    outRight[0] = hasPreferred ? preferred[0] : surfaceFrameRight1[0];
    outRight[1] = hasPreferred ? preferred[1] : surfaceFrameRight1[1];
    outRight[2] = hasPreferred ? preferred[2] : surfaceFrameRight1[2];
    if (!normalizeInPlace(outRight)) {
      anyPerpendicular(tangent, outRight);
    }
  }
  cross(tangent, outRight, outNormal);
  if (mirrored) {
    outNormal[0] = -outNormal[0];
    outNormal[1] = -outNormal[1];
    outNormal[2] = -outNormal[2];
  }
  normalizeInPlace(outNormal);
}

function computeSurfaceFrameUnityFloat(
  preferredRight: Vec3,
  tangent: Vec3,
  pointerForward: Vec3,
  pointerUp: Vec3,
  isFirst: boolean,
  outRight: Vec3,
  outNormal: Vec3,
  mirrored = false,
  preferPointerFacing = false,
): void {
  crossUnityFloat(pointerForward, tangent, surfaceFrameRight1);
  crossUnityFloat(pointerUp, tangent, surfaceFrameRight2);
  if (mirrored) {
    for (let axis = 0; axis < 3; axis += 1) {
      surfaceFrameRight1[axis] = Math.fround(-surfaceFrameRight1[axis]);
      surfaceFrameRight2[axis] = Math.fround(-surfaceFrameRight2[axis]);
    }
  }
  const hasPreviousRight =
    !isFirst &&
    dotUnityFloat(preferredRight, preferredRight) >= EPSILON * EPSILON;
  const preferred = preferPointerFacing ? surfaceFrameRight1 : preferredRight;
  const hasPreferred = preferPointerFacing || hasPreviousRight;
  const flip1 =
    hasPreferred && dotUnityFloat(surfaceFrameRight1, preferred) < 0
      ? -1
      : 1;
  const flip2 =
    hasPreferred && dotUnityFloat(surfaceFrameRight2, preferred) < 0
      ? -1
      : 1;
  const upWeight = Math.fround(
    Math.abs(dotUnityFloat(pointerForward, tangent)) * flip2,
  );
  for (let axis = 0; axis < 3; axis += 1) {
    outRight[axis] = Math.fround(
      Math.fround(surfaceFrameRight1[axis] * flip1) +
        Math.fround(surfaceFrameRight2[axis] * upWeight),
    );
  }
  if (!normalizeUnityFloatVector(outRight)) {
    copyVec3(hasPreferred ? preferred : surfaceFrameRight1, outRight);
    if (!normalizeUnityFloatVector(outRight)) anyPerpendicular(tangent, outRight);
  }
  crossUnityFloat(tangent, outRight, outNormal);
  if (mirrored) {
    for (let axis = 0; axis < 3; axis += 1) {
      outNormal[axis] = Math.fround(-outNormal[axis]);
    }
  }
}

/**
 * Rotates a vector in place by the minimal rotation taking the previous unit
 * tangent to the current one (parallel transport step).
 */
function rotateBetweenTangents(
  previousTangent: Vec3,
  tangent: Vec3,
  v: Vec3,
): void {
  const cx = Math.fround(
    Math.fround(previousTangent[1] * tangent[2]) -
      Math.fround(previousTangent[2] * tangent[1]),
  );
  const cy = Math.fround(
    Math.fround(previousTangent[2] * tangent[0]) -
      Math.fround(previousTangent[0] * tangent[2]),
  );
  const cz = Math.fround(
    Math.fround(previousTangent[0] * tangent[1]) -
      Math.fround(previousTangent[1] * tangent[0]),
  );
  const d = dotUnityFloat(previousTangent, tangent);
  if (d < -0.999999) {
    // 180° reversal: rotate around any axis perpendicular to the tangent.
    const axis: Vec3 = [0, 0, 0];
    anyPerpendicular(previousTangent, axis);
    const projection = Math.fround(2 * dotUnityFloat(axis, v));
    v[0] = Math.fround(Math.fround(axis[0] * projection) - v[0]);
    v[1] = Math.fround(Math.fround(axis[1] * projection) - v[1]);
    v[2] = Math.fround(Math.fround(axis[2] * projection) - v[2]);
    return;
  }
  // Rodrigues form of the from-to rotation applied to v.
  const cDotV = Math.fround(
    Math.fround(
      Math.fround(Math.fround(cx * v[0]) + Math.fround(cy * v[1])) +
        Math.fround(cz * v[2]),
    ) / Math.fround(1 + d),
  );
  const crossX = Math.fround(
    Math.fround(cy * v[2]) - Math.fround(cz * v[1]),
  );
  const crossY = Math.fround(
    Math.fround(cz * v[0]) - Math.fround(cx * v[2]),
  );
  const crossZ = Math.fround(
    Math.fround(cx * v[1]) - Math.fround(cy * v[0]),
  );
  const x = Math.fround(
    Math.fround(Math.fround(v[0] * d) + crossX) +
      Math.fround(cx * cDotV),
  );
  const y = Math.fround(
    Math.fround(Math.fround(v[1] * d) + crossY) +
      Math.fround(cy * cDotV),
  );
  const z = Math.fround(
    Math.fround(Math.fround(v[2] * d) + crossZ) +
      Math.fround(cz * cDotV),
  );
  v[0] = x;
  v[1] = y;
  v[2] = z;
}

function writePosition(target: Float32Array, vertex: number, value: Vec3): void {
  const offset = vertex * 3;
  target[offset] = value[0];
  target[offset + 1] = value[1];
  target[offset + 2] = value[2];
}

function writeOpenBrushOffsetPosition(
  target: Float32Array,
  vertex: number,
  center: Vec3,
  direction: Vec3,
  distance: number,
  sourceTarget?: Float32Array,
): void {
  writeOpenBrushComponentOffsetPosition(
    target,
    vertex,
    center,
    direction[0] * distance,
    direction[1] * distance,
    direction[2] * distance,
    sourceTarget,
  );
}

function writeOpenBrushComponentOffsetPosition(
  target: Float32Array,
  vertex: number,
  center: Vec3,
  offsetX: number,
  offsetY: number,
  offsetZ: number,
  sourceTarget?: Float32Array,
): void {
  const targetOffset = vertex * 3;
  const x = Math.fround(
      Math.fround(center[0] * OPEN_BRUSH_UNITS_PER_METER) +
        Math.fround(offsetX * OPEN_BRUSH_UNITS_PER_METER),
    );
  const y = Math.fround(
      Math.fround(center[1] * OPEN_BRUSH_UNITS_PER_METER) +
        Math.fround(offsetY * OPEN_BRUSH_UNITS_PER_METER),
    );
  const z = Math.fround(
      Math.fround(center[2] * OPEN_BRUSH_UNITS_PER_METER) +
        Math.fround(offsetZ * OPEN_BRUSH_UNITS_PER_METER),
    );
  target[targetOffset] = x / OPEN_BRUSH_UNITS_PER_METER;
  target[targetOffset + 1] = y / OPEN_BRUSH_UNITS_PER_METER;
  target[targetOffset + 2] = z / OPEN_BRUSH_UNITS_PER_METER;
  if (sourceTarget) {
    sourceTarget[targetOffset] = x;
    sourceTarget[targetOffset + 1] = y;
    sourceTarget[targetOffset + 2] = z;
  }
}

function writeNormal(target: Float32Array, vertex: number, value: Vec3): void {
  writePosition(target, vertex, value);
}

function copyPosition(
  target: Float32Array,
  sourceVertex: number,
  targetVertex: number,
): void {
  const sourceOffset = sourceVertex * 3;
  const targetOffset = targetVertex * 3;
  target[targetOffset] = target[sourceOffset];
  target[targetOffset + 1] = target[sourceOffset + 1];
  target[targetOffset + 2] = target[sourceOffset + 2];
}

function copyVec3At(
  values: Float32Array,
  sourceVertex: number,
  targetVertex: number,
): void {
  const sourceOffset = sourceVertex * 3;
  const targetOffset = targetVertex * 3;
  values[targetOffset] = values[sourceOffset];
  values[targetOffset + 1] = values[sourceOffset + 1];
  values[targetOffset + 2] = values[sourceOffset + 2];
}

function copyVec2At(
  values: Float32Array,
  sourceVertex: number,
  targetVertex: number,
): void {
  const sourceOffset = sourceVertex * 2;
  const targetOffset = targetVertex * 2;
  values[targetOffset] = values[sourceOffset];
  values[targetOffset + 1] = values[sourceOffset + 1];
}

function copyVec4At(
  values: Float32Array,
  sourceVertex: number,
  targetVertex: number,
): void {
  const sourceOffset = sourceVertex * 4;
  const targetOffset = targetVertex * 4;
  values[targetOffset] = values[sourceOffset];
  values[targetOffset + 1] = values[sourceOffset + 1];
  values[targetOffset + 2] = values[sourceOffset + 2];
  values[targetOffset + 3] = values[sourceOffset + 3];
}

function copyNegatedNormal(
  target: Float32Array,
  sourceVertex: number,
  targetVertex: number,
): void {
  const sourceOffset = sourceVertex * 3;
  const targetOffset = targetVertex * 3;
  target[targetOffset] = -target[sourceOffset];
  target[targetOffset + 1] = -target[sourceOffset + 1];
  target[targetOffset + 2] = -target[sourceOffset + 2];
}

function writeTangent(
  target: Float32Array,
  vertex: number,
  value: Vec3,
  handedness: number,
): void {
  const offset = vertex * 4;
  target[offset] = value[0];
  target[offset + 1] = value[1];
  target[offset + 2] = value[2];
  target[offset + 3] = handedness;
}

function copyTangent(
  target: Float32Array,
  sourceVertex: number,
  targetVertex: number,
  flipHandedness: boolean,
): void {
  const sourceOffset = sourceVertex * 4;
  const targetOffset = targetVertex * 4;
  target[targetOffset] = target[sourceOffset];
  target[targetOffset + 1] = target[sourceOffset + 1];
  target[targetOffset + 2] = target[sourceOffset + 2];
  target[targetOffset + 3] =
    target[sourceOffset + 3] * (flipHandedness ? -1 : 1);
}

function writeColor(
  target: Float32Array,
  vertex: number,
  value: Rgba,
  opacityMultiplier = 1,
): void {
  const offset = vertex * 4;
  target[offset] = quantizeColorByte(clamp01(value[0]));
  target[offset + 1] = quantizeColorByte(clamp01(value[1]));
  target[offset + 2] = quantizeColorByte(clamp01(value[2]));
  target[offset + 3] = quantizeColorByte(
    clamp01(value[3] * opacityMultiplier),
  );
}

function writeColorFromAlpha(
  target: Float32Array,
  vertex: number,
  value: Rgba,
  alpha: number,
): void {
  const offset = vertex * 4;
  target[offset] = quantizeColorByteRounded(clamp01(value[0]));
  target[offset + 1] = quantizeColorByteRounded(clamp01(value[1]));
  target[offset + 2] = quantizeColorByteRounded(clamp01(value[2]));
  target[offset + 3] = quantizeColorByte(clamp01(alpha));
}

function writeUv(target: Float32Array, vertex: number, value: [number, number]): void {
  const offset = vertex * 2;
  target[offset] = value[0];
  // Open Brush authors UVs in Unity's bottom-left convention. Its glTF
  // exporter flips Y, and the extracted browser shaders/textures consume
  // those exported coordinates with texture.flipY disabled. Generated strokes
  // must cross the same boundary or they sample a mirrored atlas/bump field.
  target[offset + 1] = 1 - value[1];
}

function writePackedUv(
  target: Float32Array,
  vertex: number,
  u: number,
  v: number,
  radius: number,
): void {
  const offset = vertex * 3;
  target[offset] = u;
  target[offset + 1] = 1 - v;
  target[offset + 2] = radius;
}

function copyUv(
  target: Float32Array,
  sourceVertex: number,
  targetVertex: number,
): void {
  const sourceOffset = sourceVertex * 2;
  const targetOffset = targetVertex * 2;
  target[targetOffset] = target[sourceOffset];
  target[targetOffset + 1] = target[sourceOffset + 1];
}

function createEmptyBounds(): BrushGeometryBounds {
  return {
    min: [
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY,
    ],
    max: [
      Number.NEGATIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
    ],
  };
}

function includeBounds(
  bounds: BrushGeometryBounds,
  positions: Float32Array,
  vertex: number,
): void {
  const offset = vertex * 3;
  const x = positions[offset];
  const y = positions[offset + 1];
  const z = positions[offset + 2];
  if (x < bounds.min[0]) {
    bounds.min[0] = x;
  }
  if (y < bounds.min[1]) {
    bounds.min[1] = y;
  }
  if (z < bounds.min[2]) {
    bounds.min[2] = z;
  }
  if (x > bounds.max[0]) {
    bounds.max[0] = x;
  }
  if (y > bounds.max[1]) {
    bounds.max[1] = y;
  }
  if (z > bounds.max[2]) {
    bounds.max[2] = z;
  }
}
