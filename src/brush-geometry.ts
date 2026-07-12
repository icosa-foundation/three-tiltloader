import type {
  BrushGeometryParams,
  BrushGeometryFamily,
  BrushPressureOpacityRange,
  BrushPressureSizeRange,
} from "./brush-types.js";
import type { Quat, Rgba, StrokeData, Vec3 } from "./stroke-types.js";

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
  ribbonBreakBefore: Uint8Array;
  ribbonRunningLengths: Float32Array;
  ribbonSectionLengths: Float32Array;
  ribbonSmoothedPressures: Float32Array;
  geometrySmoothedPressures: Float32Array;
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
    ribbonBreakBefore: new Uint8Array(INITIAL_VERTEX_CAPACITY),
    ribbonRunningLengths: new Float32Array(INITIAL_VERTEX_CAPACITY),
    ribbonSectionLengths: new Float32Array(INITIAL_VERTEX_CAPACITY),
    ribbonSmoothedPressures: new Float32Array(INITIAL_VERTEX_CAPACITY),
    geometrySmoothedPressures: new Float32Array(INITIAL_VERTEX_CAPACITY),
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
    out.ribbonRunningLengths = new Float32Array(capacity);
    out.ribbonSectionLengths = new Float32Array(capacity);
    out.ribbonSmoothedPressures = new Float32Array(capacity);
  } else {
    out.ribbonBreakBefore.fill(0, 0, pointCount);
    out.ribbonRunningLengths.fill(0, 0, pointCount);
    out.ribbonSectionLengths.fill(0, 0, pointCount);
    out.ribbonSmoothedPressures.fill(0, 0, pointCount);
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
  out.warning = undefined;
  out.uv1Size = 0;
  resetBounds(out.bounds);
  switch (family) {
    case "ribbon":
      return generateRibbonGeometry(stroke, "ribbon", options, out);
    case "emissive":
      return generateRibbonGeometry(stroke, "emissive", options, out);
    case "tube":
      return generateTubeGeometry(stroke, options, out);
    case "thick-strip":
      return generateThickStripGeometry(stroke, options, out);
    case "hull":
      return generateHullGeometry(stroke, options, out);
    case "concave-hull":
      return generateConcaveHullGeometry(stroke, options, out);
    case "print3d":
      return generateSquare3DPrintGeometry(stroke, options, out);
    case "particle":
      return generateParticleGeometry(stroke, options, out);
    case "unsupported": {
      const reallocated = generateRibbonGeometry(stroke, "unsupported", options, out);
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
  out.uv0Size = 2;
  const hasVectorOffset =
    options.geometryParams?.ribbonOffsetInTexcoord1 === true;
  const usesFlatGeometrySmoothing = options.generatorClass === "FlatGeometryBrush";
  out.uv1Size = hasVectorOffset ? 3 : 0;
  if (options.generatorClass === "QuadStripUnitizedUVBrush") {
    return generateUnitizedRibbonGeometry(stroke, family, options, out);
  }
  const pointCount = stroke.controlPoints.length;
  const frontVertexCount = pointCount * 2;
  const segmentCount = Math.max(0, pointCount - 1);
  const connectedSegmentCount = prepareRibbonSections(stroke, out);
  prepareRibbonSmoothedPressures(stroke, options, out);
  const frontIndexCount = connectedSegmentCount * 6;
  const hasBackfaces = options.geometryParams?.renderBackfaces === true;
  const vertexCount = frontVertexCount * (hasBackfaces ? 2 : 1);
  const indexCount = frontIndexCount * (hasBackfaces ? 2 : 1);
  const reallocated = ensureGeometryCapacity(out, vertexCount, indexCount);
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
  let sectionRandom = statelessRandom01(stroke.seed, 0);
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

  for (let index = 0; index < pointCount; index += 1) {
    const point = stroke.controlPoints[index];
    const previousPoint = stroke.controlPoints[Math.max(0, index - 1)];
    const nextPoint = stroke.controlPoints[Math.min(pointCount - 1, index + 1)];
    const center: Vec3 = usesFlatGeometrySmoothing && index > 0
      ? [
          previousPoint.position[0] * 0.3 + point.position[0] * 0.4 + nextPoint.position[0] * 0.3,
          previousPoint.position[1] * 0.3 + point.position[1] * 0.4 + nextPoint.position[1] * 0.3,
          previousPoint.position[2] * 0.3 + point.position[2] * 0.4 + nextPoint.position[2] * 0.3,
        ]
      : point.position;
    if (ribbonBreakBefore[index] === 1) {
      sectionRandom = statelessRandom01(stroke.seed, index);
      atlasRow = usesDistanceUvs
        ? Math.floor(sectionRandom * 3331) % atlasRows
        : Math.floor(sectionRandom * atlasRows);
      v0 = atlasRow / atlasRows;
      v1 = (atlasRow + 1) / atlasRows;
    }
    let size =
      localBrushSize *
      getPressureSizeMultiplier(ribbonSmoothedPressures[index], pressureSizeMin);

    writeCentralDifferenceTangent(stroke, index, previousTangent, tangent);
    rotateByQuaternion(point.orientation, VEC_FORWARD, pointerForward);
    rotateByQuaternion(point.orientation, VEC_UP, pointerUp);
    computeSurfaceFrame(
      previousRight,
      tangent,
      pointerForward,
      pointerUp,
      index === 0,
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
      flatEdge[0] = center[0] + 0.5 * size * right[0] - previousFlatCenter[0];
      flatEdge[1] = center[1] + 0.5 * size * right[1] - previousFlatCenter[1];
      flatEdge[2] = center[2] + 0.5 * size * right[2] - previousFlatCenter[2];
      const dotRight = dotVec3(previousFlatForward, flatEdge);
      flatEdge[0] = center[0] - 0.5 * size * right[0] - previousFlatCenter[0];
      flatEdge[1] = center[1] - 0.5 * size * right[1] - previousFlatCenter[1];
      flatEdge[2] = center[2] - 0.5 * size * right[2] - previousFlatCenter[2];
      const dotLeft = dotVec3(previousFlatForward, flatEdge);
      if ((dotLeft < 0 && dotRight > 0) || (dotLeft > 0 && dotRight < 0)) {
        const turnSign = dotLeft < 0 ? -1 : 1;
        flatEdge[0] =
          previousFlatCenter[0] +
          turnSign * 0.5 * previousFlatSize * previousRight[0] -
          center[0];
        flatEdge[1] =
          previousFlatCenter[1] +
          turnSign * 0.5 * previousFlatSize * previousRight[1] -
          center[1];
        flatEdge[2] =
          previousFlatCenter[2] +
          turnSign * 0.5 * previousFlatSize * previousRight[2] -
          center[2];
        size = Math.sqrt(dotVec3(flatEdge, flatEdge));
      }
      const moveLength = Math.sqrt(
        (center[0] - previousFlatCenter[0]) ** 2 +
          (center[1] - previousFlatCenter[1]) ** 2 +
          (center[2] - previousFlatCenter[2]) ** 2,
      );
      size = Math.min(size, previousFlatSize + moveLength);
    }
    const width = size * 0.5;
    previousFlatSize = size;
    previousFlatCenter[0] = center[0];
    previousFlatCenter[1] = center[1];
    previousFlatCenter[2] = center[2];
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
      flatHalfRights[offset] = right[0] * width;
      flatHalfRights[offset + 1] = right[1] * width;
      flatHalfRights[offset + 2] = right[2] * width;
    }

    const leftVertex = index * 2;
    const rightVertex = leftVertex + 1;
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
    const u = usesDistanceUvs
      ? sectionRandom +
        (runningLength / Math.max(localBrushSize, EPSILON)) * tileRate
      : sectionLength > EPSILON
        ? runningLength / sectionLength
        : 0;
    writeUv(uvs, leftVertex, [u, v0]);
    writeUv(uvs, rightVertex, [u, v1]);
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
  }

  if (flatHalfRights) {
    smoothFlatGeometryEdges(
      stroke,
      positions,
      flatHalfRights,
      ribbonBreakBefore,
      bounds,
    );
    updateFlatGeometryTangents(
      positions,
      normals,
      tangents,
      uvs,
      ribbonBreakBefore,
      pointCount,
    );
  }

  let indexOffset = 0;
  for (let segment = 0; segment < segmentCount; segment += 1) {
    if (ribbonBreakBefore[segment + 1] === 1) {
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
      if (ribbonBreakBefore[segment + 1] === 1) {
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

  out.family = family;
  out.vertexCount = vertexCount;
  out.indexCount = indexCount;
  return reallocated;
}

function smoothFlatGeometryEdges(
  stroke: StrokeData,
  positions: Float32Array,
  halfRights: Float32Array,
  breakBefore: Uint8Array,
  bounds: BrushGeometryBounds,
): void {
  resetBounds(bounds);
  const pointCount = stroke.controlPoints.length;
  for (let index = 0; index < pointCount; index += 1) {
    const startsSection = index === 0 || breakBefore[index] === 1;
    const endsSection =
      index === pointCount - 1 || breakBefore[index + 1] === 1;
    const previousIndex = startsSection ? index : index - 1;
    const nextIndex = endsSection ? index : index + 1;
    const point = stroke.controlPoints[index].position;
    const previous = stroke.controlPoints[previousIndex].position;
    const next = stroke.controlPoints[nextIndex].position;
    const center: Vec3 = startsSection
      ? point
      : [
          previous[0] * 0.3 + point[0] * 0.4 + next[0] * 0.3,
          previous[1] * 0.3 + point[1] * 0.4 + next[1] * 0.3,
          previous[2] * 0.3 + point[2] * 0.4 + next[2] * 0.3,
        ];
    const rightSource = startsSection && !endsSection ? nextIndex : index;
    const rightOffset = rightSource * 3;
    let rightX = halfRights[rightOffset];
    let rightY = halfRights[rightOffset + 1];
    let rightZ = halfRights[rightOffset + 2];
    if (!startsSection && !endsSection) {
      const previousOffset = previousIndex * 3;
      const currentOffset = index * 3;
      const nextOffset = nextIndex * 3;
      rightX =
        halfRights[previousOffset] * 0.3 +
        halfRights[currentOffset] * 0.4 +
        halfRights[nextOffset] * 0.3;
      rightY =
        halfRights[previousOffset + 1] * 0.3 +
        halfRights[currentOffset + 1] * 0.4 +
        halfRights[nextOffset + 1] * 0.3;
      rightZ =
        halfRights[previousOffset + 2] * 0.3 +
        halfRights[currentOffset + 2] * 0.4 +
        halfRights[nextOffset + 2] * 0.3;
    }
    const leftVertex = index * 2;
    const rightVertex = leftVertex + 1;
    writePosition(positions, leftVertex, [
      center[0] - rightX,
      center[1] - rightY,
      center[2] - rightZ,
    ]);
    writePosition(positions, rightVertex, [
      center[0] + rightX,
      center[1] + rightY,
      center[2] + rightZ,
    ]);
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
): void {
  const firstTriangle: Vec3 = [0, 0, 0];
  const secondTriangle: Vec3 = [0, 0, 0];
  const combined: Vec3 = [0, 0, 0];
  for (let segment = 0; segment < pointCount - 1; segment += 1) {
    if (breakBefore[segment + 1] === 1) {
      continue;
    }
    const leftPrevious = segment * 2;
    const rightPrevious = leftPrevious + 1;
    const leftCurrent = leftPrevious + 2;
    const rightCurrent = leftPrevious + 3;
    computeTriangleSurfaceTangent(
      positions,
      uvs,
      rightPrevious,
      leftPrevious,
      leftCurrent,
      firstTriangle,
    );
    computeTriangleSurfaceTangent(
      positions,
      uvs,
      rightPrevious,
      leftCurrent,
      rightCurrent,
      secondTriangle,
    );
    combined[0] = firstTriangle[0] + secondTriangle[0];
    combined[1] = firstTriangle[1] + secondTriangle[1];
    combined[2] = firstTriangle[2] + secondTriangle[2];
    if (segment === 0 || breakBefore[segment] === 1) {
      writeOrthonormalTangent(
        tangents,
        normals,
        leftPrevious,
        firstTriangle,
      );
      writeOrthonormalTangent(
        tangents,
        normals,
        rightPrevious,
        combined,
      );
    }
    writeOrthonormalTangent(tangents, normals, leftCurrent, combined);
    writeOrthonormalTangent(
      tangents,
      normals,
      rightCurrent,
      secondTriangle,
    );
  }
}

function computeTriangleSurfaceTangent(
  positions: Float32Array,
  uvs: Float32Array,
  first: number,
  second: number,
  third: number,
  out: Vec3,
): void {
  const firstPosition = first * 3;
  const secondPosition = second * 3;
  const thirdPosition = third * 3;
  const firstUv = first * 2;
  const secondUv = second * 2;
  const thirdUv = third * 2;
  const x1 = positions[secondPosition] - positions[firstPosition];
  const x2 = positions[thirdPosition] - positions[firstPosition];
  const y1 = positions[secondPosition + 1] - positions[firstPosition + 1];
  const y2 = positions[thirdPosition + 1] - positions[firstPosition + 1];
  const z1 = positions[secondPosition + 2] - positions[firstPosition + 2];
  const z2 = positions[thirdPosition + 2] - positions[firstPosition + 2];
  const s1 = uvs[secondUv] - uvs[firstUv];
  const s2 = uvs[thirdUv] - uvs[firstUv];
  const t1 = uvs[secondUv + 1] - uvs[firstUv + 1];
  const t2 = uvs[thirdUv + 1] - uvs[firstUv + 1];
  const determinant = s1 * t2 - s2 * t1;
  if (Math.abs(determinant) <= EPSILON) {
    out[0] = x2;
    out[1] = y2;
    out[2] = z2;
    return;
  }
  const reciprocal = 1 / determinant;
  out[0] = reciprocal * (t2 * x1 - t1 * x2);
  out[1] = reciprocal * (t2 * y1 - t1 * y2);
  out[2] = reciprocal * (t2 * z1 - t1 * z2);
}

function writeOrthonormalTangent(
  tangents: Float32Array,
  normals: Float32Array,
  vertex: number,
  source: Vec3,
): void {
  const normalOffset = vertex * 3;
  const projection =
    source[0] * normals[normalOffset] +
    source[1] * normals[normalOffset + 1] +
    source[2] * normals[normalOffset + 2];
  let x = source[0] - projection * normals[normalOffset];
  let y = source[1] - projection * normals[normalOffset + 1];
  let z = source[2] - projection * normals[normalOffset + 2];
  const length = Math.sqrt(x * x + y * y + z * z);
  if (length > EPSILON) {
    x /= length;
    y /= length;
    z /= length;
  } else {
    x = 1;
    y = 0;
    z = 0;
  }
  const tangentOffset = vertex * 4;
  tangents[tangentOffset] = x;
  tangents[tangentOffset + 1] = y;
  tangents[tangentOffset + 2] = z;
  tangents[tangentOffset + 3] = 1;
}

function generateUnitizedRibbonGeometry(
  stroke: StrokeData,
  family: BrushGeometryFamily,
  options: BrushGeometryOptions,
  out: BrushGeometryArrays,
): boolean {
  out.uv0Size = 2;
  const pointCount = stroke.controlPoints.length;
  ensureRibbonScratchCapacity(out, pointCount);
  prepareRibbonSmoothedPressures(stroke, options, out);
  const segmentCount = Math.max(0, pointCount - 1);
  const frontVertexCount = segmentCount * 4;
  const frontIndexCount = segmentCount * 6;
  const hasBackfaces = options.geometryParams?.renderBackfaces === true;
  const vertexCount = frontVertexCount * (hasBackfaces ? 2 : 1);
  const indexCount = frontIndexCount * (hasBackfaces ? 2 : 1);
  const reallocated = ensureGeometryCapacity(out, vertexCount, indexCount);
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
    for (let vertex = 0; vertex < frontVertexCount; vertex += 1) {
      const backVertex = frontVertexCount + vertex;
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
      const vertex = frontVertexCount + segment * 4;
      const indexOffset = frontIndexCount + segment * 6;
      indices[indexOffset] = vertex;
      indices[indexOffset + 1] = vertex + 1;
      indices[indexOffset + 2] = vertex + 2;
      indices[indexOffset + 3] = vertex + 1;
      indices[indexOffset + 4] = vertex + 3;
      indices[indexOffset + 5] = vertex + 2;
    }
  }

  out.family = family;
  out.vertexCount = vertexCount;
  out.indexCount = indexCount;
  return reallocated;
}

const THICK_STRIP_TRIANGLE_PATTERN = [
  0, 2, 8, 0, 8, 6,
  1, 7, 9, 1, 9, 3,
  3, 11, 5, 3, 9, 11,
  2, 10, 8, 2, 4, 10,
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
  planeNormal: Vec3;
  planeRight: Vec3;
  width: Vec3;
  thickness: Vec3;
  halfSize: number;
  startHalfSize: number;
}

function generateSquare3DPrintGeometry(
  stroke: StrokeData,
  options: BrushGeometryOptions,
  out: BrushGeometryArrays,
): boolean {
  out.family = "print3d";
  out.uv0Size = 2;
  ensureGeometryPressureCapacity(out, stroke.controlPoints.length);
  prepareGeometrySmoothedPressures(stroke, options, out);
  const segments: Array<Print3DBasis | undefined> = [undefined];
  const pressureSizeMin = normalizePressureSizeMin(options.pressureSizeRange?.[0]);
  let previousBasis: Print3DBasis | undefined;
  for (let i = 1; i < stroke.controlPoints.length; i += 1) {
    const basis = createPrint3DBasis(
      stroke,
      i,
      pressureSizeMin,
      out.geometrySmoothedPressures,
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

function createPrint3DBasis(
  stroke: StrokeData,
  index: number,
  pressureSizeMin: number,
  smoothedPressures: Float32Array,
): Print3DBasis | undefined {
  const previous = stroke.controlPoints[index - 1];
  const current = stroke.controlPoints[index];
  const tangent = subtractVec3(current.position, previous.position);
  const distance = Math.sqrt(dotVec3(tangent, tangent));
  if (distance < 0.003 || !normalizeInPlace(tangent)) return undefined;
  const planeNormal: Vec3 = [0, 0, 0];
  const planeRight: Vec3 = [0, 0, 0];
  const planeForward: Vec3 = [0, 0, 0];
  rotateByQuaternion(current.orientation, VEC_UP, planeNormal);
  rotateByQuaternion(current.orientation, VEC_RIGHT, planeRight);
  rotateByQuaternion(current.orientation, VEC_FORWARD, planeForward);
  const alignment = dotVec3(tangent, planeNormal);
  if (Math.abs(alignment) < 0.0087) return undefined;
  const sign = alignment > 0 ? 1 : -1;
  const width: Vec3 = [...planeRight];
  const thickness: Vec3 = [
    planeForward[0] * -sign,
    planeForward[1] * -sign,
    planeForward[2] * -sign,
  ];
  const halfSize =
    getLocalBrushSize(stroke) *
    getPressureSizeMultiplier(smoothedPressures[index], pressureSizeMin) *
    0.5;
  const startHalfSize =
    getLocalBrushSize(stroke) *
    getPressureSizeMultiplier(smoothedPressures[index - 1], pressureSizeMin) *
    0.5;
  return {
    tangent,
    planeNormal,
    planeRight,
    width,
    thickness,
    halfSize,
    startHalfSize,
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
): void {
  const firstBasis = segments[firstSegment];
  const startCap = appendPrint3DCap(
    stroke.controlPoints[firstSegment - 1].position,
    firstBasis,
    false,
    positions,
    normals,
    firstBasis.startHalfSize,
  );
  const firstRing = appendPrint3DRing(
    stroke.controlPoints[firstSegment - 1].position,
    firstBasis,
    positions,
    normals,
    firstBasis.startHalfSize,
  );
  appendTriangle(indices, startCap + 2, startCap + 3, startCap + 1);
  appendTriangle(indices, startCap + 1, startCap + 3, startCap);
  appendPrint3DCapToRing(indices, firstRing, startCap, true);

  let previousRing = firstRing;
  for (let i = firstSegment; i <= lastSegment; i += 1) {
    const ring = appendPrint3DRing(
      stroke.controlPoints[i].position,
      segments[i],
      positions,
      normals,
    );
    appendPrint3DMiddle(indices, previousRing, ring);
    previousRing = ring;
  }
  const lastBasis = segments[lastSegment];
  const endCap = appendPrint3DCap(
    stroke.controlPoints[lastSegment].position,
    lastBasis,
    true,
    positions,
    normals,
  );
  appendPrint3DCapToRing(indices, previousRing, endCap, false);
  appendTriangle(indices, endCap + 1, endCap, endCap + 2);
  appendTriangle(indices, endCap + 2, endCap, endCap + 3);
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
    center[0] + basis.tangent[0] * 0.01 * direction,
    center[1] + basis.tangent[1] * 0.01 * direction,
    center[2] + basis.tangent[2] * 0.01 * direction,
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
  const points = createHullInputPoints(stroke);
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

function createHullInputPoints(stroke: StrokeData): Vec3[] {
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
  out.family = "thick-strip";
  out.uv0Size = 2;
  const pointCount = stroke.controlPoints.length;
  const vertexCount = pointCount * 6;
  const indexCount = Math.max(0, pointCount - 1) * 24;
  const reallocated = ensureGeometryCapacity(out, vertexCount, indexCount);
  ensureGeometryPressureCapacity(out, pointCount);
  prepareGeometrySmoothedPressures(stroke, options, out);
  const {
    positions,
    normals,
    tangents,
    colors,
    uvs,
    indices,
    bounds,
    geometrySmoothedPressures,
  } = out;
  const localBrushSize = getLocalBrushSize(stroke);
  const pressureSizeMin = normalizePressureSizeMin(options.pressureSizeRange?.[0]);
  const pressureOpacityMin = normalizePressureOpacityMin(
    options.pressureOpacityRange,
  );
  const pressureOpacityMax = normalizePressureOpacityMax(
    options.pressureOpacityRange,
  );
  const tileRate = normalizePositive(options.geometryParams?.tileRate, 1);
  const tangent: Vec3 = [0, 0, 0];
  const right: Vec3 = [0, 0, 0];
  const surface: Vec3 = [0, 0, 0];
  const preferredRight: Vec3 = [0, 0, 0];
  const pointerForward: Vec3 = [0, 0, 0];
  const pointerUp: Vec3 = [0, 0, 0];
  const cosTheta = 1 / Math.sqrt(1 + 1 / 64);
  const sinTheta = cosTheta / 8;
  let distance = 0;

  for (let pointIndex = 0; pointIndex < pointCount; pointIndex += 1) {
    const point = stroke.controlPoints[pointIndex];
    const before = stroke.controlPoints[Math.max(0, pointIndex - 1)] ?? point;
    const after = stroke.controlPoints[Math.min(pointCount - 1, pointIndex + 1)] ?? point;
    tangent[0] = after.position[0] - before.position[0];
    tangent[1] = after.position[1] - before.position[1];
    tangent[2] = after.position[2] - before.position[2];
    if (!normalizeInPlace(tangent)) {
      tangent[0] = 1;
      tangent[1] = 0;
      tangent[2] = 0;
    }
    rotateByQuaternion(point.orientation, VEC_FORWARD, pointerForward);
    rotateByQuaternion(point.orientation, VEC_UP, pointerUp);
    computeSurfaceFrame(
      preferredRight,
      tangent,
      pointerForward,
      pointerUp,
      pointIndex === 0,
      right,
      surface,
    );
    preferredRight[0] = right[0];
    preferredRight[1] = right[1];
    preferredRight[2] = right[2];

    if (pointIndex > 0) {
      distance += distanceBetweenControlPoints(
        stroke.controlPoints[pointIndex - 1],
        point,
      );
    }
    const size =
      localBrushSize *
      getPressureSizeMultiplier(
        geometrySmoothedPressures[pointIndex],
        pressureSizeMin,
      );
    const isEnd = pointIndex === 0 || pointIndex === pointCount - 1;
    const belly = isEnd ? 0 : size / 16;
    const normalSide = isEnd ? 0 : sinTheta;
    const opacity = getPressureOpacityMultiplier(
      geometrySmoothedPressures[pointIndex],
      pressureOpacityMin,
      pressureOpacityMax,
    );
    const u = size > EPSILON ? (distance / size) * tileRate : 0;
    const base = pointIndex * 6;
    writeThickStripVertex(out, base, point.position, right, surface, tangent, size / 2, 0, normalSide, cosTheta, stroke.color, opacity, u, 0.9);
    writeThickStripVertex(out, base + 1, point.position, right, surface, tangent, size / 2, 0, normalSide, -cosTheta, stroke.color, opacity, u, 0.9);
    writeThickStripVertex(out, base + 2, point.position, right, surface, tangent, 0, belly, 0, 1, stroke.color, opacity, u, 0.5);
    writeThickStripVertex(out, base + 3, point.position, right, surface, tangent, 0, -belly, 0, -1, stroke.color, opacity, u, 0.5);
    writeThickStripVertex(out, base + 4, point.position, right, surface, tangent, -size / 2, 0, -normalSide, cosTheta, stroke.color, opacity, u, 0.1);
    writeThickStripVertex(out, base + 5, point.position, right, surface, tangent, -size / 2, 0, -normalSide, -cosTheta, stroke.color, opacity, u, 0.1);
    for (let local = 0; local < 6; local += 1) {
      includeBounds(bounds, positions, base + local);
    }
  }

  let indexOffset = 0;
  for (let segment = 0; segment < pointCount - 1; segment += 1) {
    const base = segment * 6;
    for (const local of THICK_STRIP_TRIANGLE_PATTERN) {
      indices[indexOffset] = base + local;
      indexOffset += 1;
    }
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
  tangent: Vec3,
  rightOffset: number,
  surfaceOffset: number,
  rightNormal: number,
  surfaceNormal: number,
  color: Rgba,
  opacity: number,
  u: number,
  v: number,
): void {
  writePosition(out.positions, vertex, [
    center[0] + right[0] * rightOffset + surface[0] * surfaceOffset,
    center[1] + right[1] * rightOffset + surface[1] * surfaceOffset,
    center[2] + right[2] * rightOffset + surface[2] * surfaceOffset,
  ]);
  writeNormal(out.normals, vertex, [
    right[0] * rightNormal + surface[0] * surfaceNormal,
    right[1] * rightNormal + surface[1] * surfaceNormal,
    right[2] * rightNormal + surface[2] * surfaceNormal,
  ]);
  writeTangent(out.tangents, vertex, tangent, 1);
  writeColor(out.colors, vertex, color, opacity);
  writeUv(out.uvs, vertex, [u, v]);
}

function generateTubeGeometry(
  stroke: StrokeData,
  options: BrushGeometryOptions,
  out: BrushGeometryArrays,
): boolean {
  const storesRadius =
    options.geometryParams?.tubeStoreRadiusInTexcoord0Z === true;
  out.uv0Size = storesRadius ? 3 : 2;
  const pointCount = stroke.controlPoints.length;
  const segmentCount = Math.max(0, pointCount - 1);
  const isSquareBrush = options.generatorClass === "SquareBrush";
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
  const maximumCapVertexCount = hasCaps
    ? maximumSectionCount * sideCount * 2
    : 0;
  const maximumVertexCount =
    pointCount * ringVertexCount + maximumCapVertexCount;
  const maximumIndexCount =
    segmentCount * sideCount * 6 +
    (hasCaps ? maximumSectionCount * 2 * sideCount * 3 : 0);
  const reallocated = ensureGeometryCapacity(
    out,
    maximumVertexCount,
    maximumIndexCount,
  );
  ensureTubeScratchCapacity(out, pointCount);
  prepareTubeSmoothedPressures(stroke, options, out);
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
  const random01 = statelessRandom01(stroke.seed, 0);
  const atlasRows = normalizeAtlasRows(options.geometryParams?.textureAtlasV);
  const atlasRow = Math.floor(random01 * 3331) % atlasRows;
  const v0 = atlasRow / atlasRows;
  const v1 = (atlasRow + 1) / atlasRows;
  const usesStretchUvs = options.geometryParams?.tubeUvStyle === "stretch";
  const capAspect = normalizeTubeCapAspect(options.geometryParams?.tubeCapAspect);
  const shapeModifier = normalizeTubeShapeModifier(
    options.geometryParams?.tubeShapeModifier,
  );
  const breakAngleMultiplier = normalizeTubeBreakAngleMultiplier(
    options.geometryParams?.tubeBreakAngleMultiplier,
  );
  const totalStrokeLength = measureStrokeLength(stroke);
  let runningDistance = 0;
  let u = random01;

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

  for (let pointIndex = 0; pointIndex < pointCount; pointIndex += 1) {
    const point = stroke.controlPoints[pointIndex];
    const radius =
      localBrushSize *
      getPressureSizeMultiplier(tubeSmoothedPressures[pointIndex], pressureSizeMin) *
      0.5;
    let segmentLength = 0;
    if (pointIndex > 0) {
      segmentLength = distanceBetweenControlPoints(
        stroke.controlPoints[pointIndex - 1],
        point,
      );
      runningDistance += segmentLength;
      const circumference = Math.max(2 * Math.PI * radius, EPSILON);
      u += (segmentLength * tileRate) / circumference;
    }
    const progress =
      totalStrokeLength > EPSILON ? runningDistance / totalStrokeLength : 0;
    const shapeScale = getTubeShapeScale(
      shapeModifier,
      progress,
      pointIndex,
      pointCount,
      options.geometryParams?.tubeTaperScalar,
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
    const opacity = getPressureOpacityMultiplier(
      tubeSmoothedPressures[pointIndex],
      pressureOpacityMin,
      pressureOpacityMax,
    ) * descriptorOpacity;

    writeCentralDifferenceTangent(stroke, pointIndex, previousTangent, tangent);
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
      // Re-orthonormalize against drift.
      const drift = dot(frameRight, tangent);
      frameRight[0] -= tangent[0] * drift;
      frameRight[1] -= tangent[1] * drift;
      frameRight[2] -= tangent[2] * drift;
      if (!normalizeInPlace(frameRight)) {
        anyPerpendicular(tangent, frameRight);
      }
      cross(tangent, frameRight, frameUp);
      normalizeInPlace(frameUp);

      const previousSectionContinues = tubeBreakBefore[pointIndex - 1] === 0;
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
        u = statelessRandom01(stroke.seed, pointIndex);
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
            point.position[0] +
              displacement[0] * radius * shapeScale +
              radial[0] * petalOffset,
            point.position[1] +
              displacement[1] * radius * shapeScale +
              radial[1] * petalOffset,
            point.position[2] +
              displacement[2] * radius * shapeScale +
              radial[2] * petalOffset,
          ]);
          writeNormal(normals, vertex, radial);
          writeTangent(tangents, vertex, tangent, 1);
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
          point.position[0] + radial[0] * (radius * shapeScale + petalOffset),
          point.position[1] + radial[1] * (radius * shapeScale + petalOffset),
          point.position[2] + radial[2] * (radius * shapeScale + petalOffset),
        ]);
        writeNormal(normals, vertex, radial);
        writeTangent(tangents, vertex, tangent, 1);
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
  if (hasCaps) {
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
          const point = stroke.controlPoints[pointIndex];
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
          const direction = isStart ? -1 : 1;
          capTip[0] =
            point.position[0] +
            capTangent[0] * radius * capAspect * direction;
          capTip[1] =
            point.position[1] +
            capTangent[1] * radius * capAspect * direction;
          capTip[2] =
            point.position[2] +
            capTangent[2] * radius * capAspect * direction;
          const diagonal = radius * Math.hypot(1, capAspect);
          const uRate = tileRate / Math.max(2 * Math.PI * radius, EPSILON);
          const capU = usesStretchUvs
            ? ringU
            : ringU + direction * uRate * diagonal;

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
                    capTangent[0] * direction,
                    capTangent[1] * direction,
                    capTangent[2] * direction,
                  ],
            );
            writeTangent(tangents, vertex, capRadial, 1);
            writeColor(colors, vertex, stroke.color, opacity);
            const v = v0 + (v1 - v0) * fraction;
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

  out.family = "tube";
  out.vertexCount = pointCount * ringVertexCount + capVertexCount;
  out.indexCount = indexOffset;
  return reallocated;
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
  out.uv1Size = hasLifetime ? 4 : 0;
  const localBrushSize = getLocalBrushSize(stroke);
  ensureGeometryPressureCapacity(out, stroke.controlPoints.length);
  prepareGeometrySmoothedPressures(stroke, options, out);
  const smoothedPressures = out.geometrySmoothedPressures;
  const pressureSizeMin = normalizePressureSizeMin(options.pressureSizeRange?.[0]);
  const particleRate = normalizePositive(
    options.geometryParams?.sprayRateMultiplier,
    1,
  );
  let quadCount = 0;
  for (let pointIndex = 1; pointIndex < stroke.controlPoints.length; pointIndex += 1) {
    const point = stroke.controlPoints[pointIndex];
    const segmentLength = distanceBetweenControlPoints(
      stroke.controlPoints[pointIndex - 1],
      point,
    );
    const pressuredSize =
      localBrushSize *
      getPressureSizeMultiplier(smoothedPressures[pointIndex], pressureSizeMin);
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
  const rotationVarianceRadians =
    (normalizeNonNegative(options.geometryParams?.particleRotationVariance) *
      Math.PI) /
    180;
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
  const preferredRight: Vec3 = [0, 0, 0];
  const segmentDirection: Vec3 = [0, 0, 0];
  const frameRight: Vec3 = [0, 0, 0];
  const frameNormal: Vec3 = [0, 0, 0];
  const rotatedRight: Vec3 = [0, 0, 0];
  const rotatedFacing: Vec3 = [0, 0, 0];
  const randomOffset: Vec3 = [0, 0, 0];
  const center: Vec3 = [0, 0, 0];
  let quadIndex = 0;

  for (let pointIndex = 1; pointIndex < stroke.controlPoints.length; pointIndex += 1) {
    const previousPoint = stroke.controlPoints[pointIndex - 1];
    const point = stroke.controlPoints[pointIndex];
    segmentDirection[0] = point.position[0] - previousPoint.position[0];
    segmentDirection[1] = point.position[1] - previousPoint.position[1];
    segmentDirection[2] = point.position[2] - previousPoint.position[2];
    const segmentLength = Math.hypot(
      segmentDirection[0],
      segmentDirection[1],
      segmentDirection[2],
    );
    if (segmentLength <= EPSILON) {
      continue;
    }
    segmentDirection[0] /= segmentLength;
    segmentDirection[1] /= segmentLength;
    segmentDirection[2] /= segmentLength;
    const pressuredSize =
      localBrushSize *
      getPressureSizeMultiplier(smoothedPressures[pointIndex], pressureSizeMin);
    const spawnInterval = pressuredSize / particleRate;
    const segmentQuadCount =
      spawnInterval > EPSILON
        ? Math.min(500, Math.floor(segmentLength / spawnInterval))
        : 0;
    if (segmentQuadCount === 0) {
      continue;
    }
    rotateByQuaternion(point.orientation, VEC_FORWARD, pointerForward);
    rotateByQuaternion(point.orientation, VEC_UP, pointerUp);
    preferredRight[0] = 0;
    preferredRight[1] = 0;
    preferredRight[2] = 0;
    computeSurfaceFrame(
      preferredRight,
      segmentDirection,
      pointerForward,
      pointerUp,
      true,
      frameRight,
      frameNormal,
    );
    const baseOpacity =
      getPressureOpacityMultiplier(
        smoothedPressures[pointIndex],
        pressureOpacityMin,
        pressureOpacityMax,
      ) * descriptorOpacity;

    for (let segmentQuad = 0; segmentQuad < segmentQuadCount; segmentQuad += 1) {
      const salt = hasLifetime
        ? 10 * (pointIndex * 5 + segmentQuad)
        : 10 * (pointIndex * 12 + (segmentQuad % 12));
      const rotation =
        (statelessRandom01(stroke.seed, salt + 1) * 2 - 1) *
        rotationVarianceRadians;
      rotateAroundAxis(frameRight, frameNormal, rotation, rotatedRight);
      rotateAroundAxis(segmentDirection, frameNormal, rotation, rotatedFacing);
      const size =
        pressuredSize *
        (1 + statelessRandom01(stroke.seed, salt) * sizeVariance);
      center[0] =
        previousPoint.position[0] +
        segmentDirection[0] * spawnInterval * segmentQuad;
      center[1] =
        previousPoint.position[1] +
        segmentDirection[1] * spawnInterval * segmentQuad;
      center[2] =
        previousPoint.position[2] +
        segmentDirection[2] * spawnInterval * segmentQuad;
      writeRandomInsideSphere(stroke.seed, salt + 2, randomOffset);
      center[0] += randomOffset[0] * size * positionVariance;
      center[1] += randomOffset[1] * size * positionVariance;
      center[2] += randomOffset[2] * size * positionVariance;
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
        center,
        rotatedFacing,
        rotatedRight,
        frameNormal,
        size * sizeRatioX * 0.5,
        size * sizeRatioY * 0.5,
        stroke.color,
        opacity,
        usesAtlas,
        atlasCell,
        hasLifetime,
        point.timestampMs * 0.001,
      );
      quadIndex += 1;
    }
  }

  if (hasBackfaces) {
    const backfaceColor = shiftHue(
      stroke.color,
      normalizeHueShift(options.geometryParams?.backfaceHueShift),
    );
    for (let vertex = 0; vertex < frontVertexCount; vertex += 1) {
      const backVertex = frontVertexCount + vertex;
      copyPosition(positions, vertex, backVertex);
      copyNegatedNormal(normals, vertex, backVertex);
      copyTangent(tangents, vertex, backVertex, true);
      copyUv(uvs, vertex, backVertex);
      writeColorFromAlpha(colors, backVertex, backfaceColor, colors[vertex * 4 + 3]);
    }
    for (let quad = 0; quad < quadCount; quad += 1) {
      const vertex = frontVertexCount + quad * 4;
      const indexOffset = frontIndexCount + quad * 6;
      indices[indexOffset] = vertex;
      indices[indexOffset + 1] = vertex + 3;
      indices[indexOffset + 2] = vertex + 1;
      indices[indexOffset + 3] = vertex;
      indices[indexOffset + 4] = vertex + 2;
      indices[indexOffset + 5] = vertex + 3;
    }
  }

  out.family = "particle";
  out.vertexCount = vertexCount;
  out.indexCount = indexCount;
  return reallocated;
}

function generateGeniusParticleGeometry(
  stroke: StrokeData,
  options: BrushGeometryOptions,
  out: BrushGeometryArrays,
): boolean {
  out.uv0Size = 4;
  out.uv1Size = 4;
  const pointCount = stroke.controlPoints.length;
  const totalLength = measureStrokeLength(stroke);
  const particleRate = normalizePositive(
    options.geometryParams?.particleRate,
    1,
  );
  const spawnInterval = OPEN_BRUSH_GENIUS_PARTICLE_INTERVAL / particleRate;
  const particleCount =
    pointCount === 0 ? 0 : Math.floor(totalLength / spawnInterval) + 1;
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
    uv1s,
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
  ensureGeometryPressureCapacity(out, pointCount);
  prepareGeometrySmoothedPressures(stroke, options, out);
  const smoothedPressures = out.geometrySmoothedPressures;
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
      ? distanceBetweenControlPoints(
          stroke.controlPoints[0],
          stroke.controlPoints[1],
        )
      : 0;
  let particleWithinKnot = 0;

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

    const pressure =
      particleCount === 1
        ? Math.max(0.8, smoothedPressures[segmentIndex])
        : smoothedPressures[segmentIndex];
    const salt = 16 * (segmentIndex * 16 + particleWithinKnot);
    const size =
      localBrushSize *
      getPressureSizeMultiplier(pressure, pressureSizeMin) *
      (1 + statelessRandom01(stroke.seed, salt) * sizeVariance);
    writeRandomUnitSphere(stroke.seed, salt + 2, sphereOffset);
    center[0] += sphereOffset[0] * size * positionScale;
    center[1] += sphereOffset[1] * size * positionScale;
    center[2] += sphereOffset[2] * size * positionScale;
    writeRandomRotation(stroke.seed, salt + 4, particleRotation);
    rotateByQuaternion(particleRotation, VEC_UP, particleUp);
    rotateByQuaternion(particleRotation, VEC_RIGHT, particleRight);
    const opacity = randomizeAlpha
      ? statelessRandom01(stroke.seed, salt + 1)
      : getPressureOpacityMultiplier(
          pressure,
          pressureOpacityMin,
          pressureOpacityMax,
        ) * descriptorOpacity;
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
      (statelessRandom01(stroke.seed, salt + 7) * 2 - 1) *
      halfRotationRange;
    const birthTimeSeconds = currentPoint.timestampMs * 0.001;
    writeGeniusParticleQuad(
      positions,
      normals,
      tangents,
      colors,
      uvs,
      particleUvs,
      uv1s,
      indices,
      bounds,
      particleIndex,
      center,
      particleUp,
      particleRight,
      size,
      stroke.color,
      opacity,
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

function getPressureSizeMultiplier(
  pressure: number,
  pressureSizeMin: number,
): number {
  const clampedPressure = clamp01(pressure);
  return pressureSizeMin + (1 - pressureSizeMin) * clampedPressure;
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
): number {
  switch (modifier) {
    case 1:
      return getLoftedTubeScale(pointIndex, pointCount);
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

function getLoftedTubeScale(pointIndex: number, pointCount: number): number {
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
  const attenuation = clamp01((pointCount - 3) / 7);
  return clamp01(current * attenuation);
}

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

function writeRandomInsideSphere(
  seed: number,
  salt: number,
  out: Vec3,
): void {
  writeRandomUnitSphere(seed, salt, out);
  const radius = Math.cbrt(statelessRandom01(seed, salt + 2));
  out[0] *= radius;
  out[1] *= radius;
  out[2] *= radius;
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
  pressures[0] = clamp01(stroke.controlPoints[0].pressure);
  const windowMeters =
    options.generatorClass === "FlatGeometryBrush" &&
    options.geometryParams?.m11Compatibility === true
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
  pressures[0] = clamp01(stroke.controlPoints[0].pressure);
  const windowMeters = options.geometryParams?.m11Compatibility === true
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
  pressures[0] = clamp01(stroke.controlPoints[0].pressure);
  const windowMeters = options.geometryParams?.m11Compatibility === true
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
  center: Vec3,
  facing: Vec3,
  right: Vec3,
  normal: Vec3,
  forwardScale: number,
  rightScale: number,
  color: Rgba,
  opacity: number,
  usesAtlas: boolean,
  atlasCell: number,
  hasLifetime: boolean,
  birthTimeSeconds: number,
): void {
  const vertex = quadIndex * 4;
  const atlasScale = usesAtlas ? 0.5 : 1;
  const atlasU = usesAtlas ? (atlasCell % 2) * 0.5 : 0;
  const atlasV = usesAtlas ? Math.floor(atlasCell / 2) * 0.5 : 0;
  writeSprayParticleVertex(
    positions, normals, tangents, colors, uvs, uv1s, bounds,
    vertex, center, facing, right, normal, -forwardScale, rightScale,
    color, opacity, atlasU, atlasV + atlasScale, hasLifetime, birthTimeSeconds,
  );
  writeSprayParticleVertex(
    positions, normals, tangents, colors, uvs, uv1s, bounds,
    vertex + 1, center, facing, right, normal, -forwardScale, -rightScale,
    color, opacity, atlasU, atlasV, hasLifetime, birthTimeSeconds,
  );
  writeSprayParticleVertex(
    positions, normals, tangents, colors, uvs, uv1s, bounds,
    vertex + 2, center, facing, right, normal, forwardScale, rightScale,
    color, opacity, atlasU + atlasScale, atlasV + atlasScale,
    hasLifetime, birthTimeSeconds,
  );
  writeSprayParticleVertex(
    positions, normals, tangents, colors, uvs, uv1s, bounds,
    vertex + 3, center, facing, right, normal, forwardScale, -rightScale,
    color, opacity, atlasU + atlasScale, atlasV, hasLifetime, birthTimeSeconds,
  );
  const indexOffset = quadIndex * 6;
  indices[indexOffset] = vertex;
  indices[indexOffset + 1] = vertex + 1;
  indices[indexOffset + 2] = vertex + 3;
  indices[indexOffset + 3] = vertex;
  indices[indexOffset + 4] = vertex + 3;
  indices[indexOffset + 5] = vertex + 2;
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
  center: Vec3,
  facing: Vec3,
  right: Vec3,
  normal: Vec3,
  forwardScale: number,
  rightScale: number,
  color: Rgba,
  opacity: number,
  u: number,
  v: number,
  hasLifetime: boolean,
  birthTimeSeconds: number,
): void {
  const positionOffset = vertex * 3;
  positions[positionOffset] =
    center[0] + facing[0] * forwardScale + right[0] * rightScale;
  positions[positionOffset + 1] =
    center[1] + facing[1] * forwardScale + right[1] * rightScale;
  positions[positionOffset + 2] =
    center[2] + facing[2] * forwardScale + right[2] * rightScale;
  normals[positionOffset] = normal[0];
  normals[positionOffset + 1] = normal[1];
  normals[positionOffset + 2] = normal[2];
  writeTangent(tangents, vertex, facing, 1);
  writeColor(colors, vertex, color, opacity);
  const uvOffset = vertex * 2;
  uvs[uvOffset] = u;
  uvs[uvOffset + 1] = v;
  if (hasLifetime) {
    const uv1Offset = vertex * 4;
    uv1s[uv1Offset] = facing[0] * forwardScale + right[0] * rightScale;
    uv1s[uv1Offset + 1] =
      facing[1] * forwardScale + right[1] * rightScale;
    uv1s[uv1Offset + 2] =
      facing[2] * forwardScale + right[2] * rightScale;
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
  uv1s: Float32Array,
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
      uv1s,
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
  indices[indexOffset + 1] = vertex + 1;
  indices[indexOffset + 2] = vertex + 3;
  indices[indexOffset + 3] = vertex;
  indices[indexOffset + 4] = vertex + 3;
  indices[indexOffset + 5] = vertex + 2;
}

function writeGeniusParticleVertex(
  positions: Float32Array,
  normals: Float32Array,
  tangents: Float32Array,
  colors: Float32Array,
  uvs: Float32Array,
  particleUvs: Float32Array,
  uv1s: Float32Array,
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
  const uv1Offset = vertex * 4;
  uv1s[uv1Offset] =
    previousPosition[0] +
    (currentPosition[0] - previousPosition[0]) * positionRatio;
  uv1s[uv1Offset + 1] =
    previousPosition[1] +
    (currentPosition[1] - previousPosition[1]) * positionRatio;
  uv1s[uv1Offset + 2] =
    previousPosition[2] +
    (currentPosition[2] - previousPosition[2]) * positionRatio;
  uv1s[uv1Offset + 3] = vertex;
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
  rotateByQuaternion(orientation, VEC_UP, bootstrapUp);
  if (Math.abs(dot(bootstrapUp, tangent)) > 0.99) {
    rotateByQuaternion(orientation, VEC_RIGHT, bootstrapUp);
  }
  cross(bootstrapUp, tangent, frameRight);
  if (!normalizeInPlace(frameRight)) {
    anyPerpendicular(tangent, frameRight);
  }
  cross(tangent, frameRight, frameUp);
  normalizeInPlace(frameUp);
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
  const rightScale = -Math.sin(angle);
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
  const rightScale = -Math.sin(angle);
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
): void {
  cross(pointerForward, tangent, surfaceFrameRight1);
  cross(pointerUp, tangent, surfaceFrameRight2);

  let preferred = preferredRight;
  if (isFirst || Math.hypot(preferred[0], preferred[1], preferred[2]) < EPSILON) {
    preferred =
      Math.hypot(
        surfaceFrameRight1[0],
        surfaceFrameRight1[1],
        surfaceFrameRight1[2],
      ) >= EPSILON
        ? surfaceFrameRight1
        : surfaceFrameRight2;
  }

  const flip1 = dot(surfaceFrameRight1, preferred) < 0 ? -1 : 1;
  const upWeight =
    Math.abs(dot(pointerForward, tangent)) *
    (dot(surfaceFrameRight2, preferred) < 0 ? -1 : 1);
  outRight[0] = surfaceFrameRight1[0] * flip1 + surfaceFrameRight2[0] * upWeight;
  outRight[1] = surfaceFrameRight1[1] * flip1 + surfaceFrameRight2[1] * upWeight;
  outRight[2] = surfaceFrameRight1[2] * flip1 + surfaceFrameRight2[2] * upWeight;
  if (!normalizeInPlace(outRight)) {
    outRight[0] = preferred[0];
    outRight[1] = preferred[1];
    outRight[2] = preferred[2];
    if (!normalizeInPlace(outRight)) {
      anyPerpendicular(tangent, outRight);
    }
  }
  cross(tangent, outRight, outNormal);
  normalizeInPlace(outNormal);
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
  const cx = previousTangent[1] * tangent[2] - previousTangent[2] * tangent[1];
  const cy = previousTangent[2] * tangent[0] - previousTangent[0] * tangent[2];
  const cz = previousTangent[0] * tangent[1] - previousTangent[1] * tangent[0];
  const d = dot(previousTangent, tangent);
  if (d < -0.999999) {
    // 180° reversal: rotate around any axis perpendicular to the tangent.
    const axis: Vec3 = [0, 0, 0];
    anyPerpendicular(previousTangent, axis);
    const projection = 2 * dot(axis, v);
    v[0] = axis[0] * projection - v[0];
    v[1] = axis[1] * projection - v[1];
    v[2] = axis[2] * projection - v[2];
    return;
  }
  // Rodrigues form of the from-to rotation applied to v.
  const cDotV = (cx * v[0] + cy * v[1] + cz * v[2]) / (1 + d);
  const x = v[0] * d + (cy * v[2] - cz * v[1]) + cx * cDotV;
  const y = v[1] * d + (cz * v[0] - cx * v[2]) + cy * cDotV;
  const z = v[2] * d + (cx * v[1] - cy * v[0]) + cz * cDotV;
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
  target[offset] = value[0];
  target[offset + 1] = value[1];
  target[offset + 2] = value[2];
  target[offset + 3] = clamp01(value[3] * opacityMultiplier);
}

function writeColorFromAlpha(
  target: Float32Array,
  vertex: number,
  value: Rgba,
  alpha: number,
): void {
  const offset = vertex * 4;
  target[offset] = value[0];
  target[offset + 1] = value[1];
  target[offset + 2] = value[2];
  target[offset + 3] = clamp01(alpha);
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
