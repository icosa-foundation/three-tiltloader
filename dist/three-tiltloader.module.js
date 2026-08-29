import {FileLoader as $rINUR$FileLoader, Group as $rINUR$Group, Clock as $rINUR$Clock, Mesh as $rINUR$Mesh, Vector4 as $rINUR$Vector4, Loader as $rINUR$Loader, Vector3 as $rINUR$Vector3, Quaternion as $rINUR$Quaternion, BufferAttribute as $rINUR$BufferAttribute, BufferGeometry as $rINUR$BufferGeometry, Box3 as $rINUR$Box3} from "three";
import {unzipSync as $rINUR$unzipSync, strFromU8 as $rINUR$strFromU8} from "three/examples/jsm/libs/fflate.module.js";
import {TiltShaderLoader as $rINUR$TiltShaderLoader} from "three-icosa";

// Adapted from initial TiltLoader implementation in three.js r128
// https://github.com/mrdoob/three.js/blob/r128/examples/jsm/loaders/TiltLoader.js




function $8da93982032879e2$var$validateAttribute(name, attribute) {
    if (!ArrayBuffer.isView(attribute.array) || attribute.array instanceof DataView) throw new TypeError(`Geometry attribute "${name}" must use a typed array.`);
    if (!Number.isInteger(attribute.itemSize) || attribute.itemSize < 1) throw new RangeError(`Geometry attribute "${name}" must have a positive integer itemSize.`);
    if (attribute.array.length % attribute.itemSize !== 0) throw new RangeError(`Geometry attribute "${name}" length must be divisible by itemSize.`);
}
function $8da93982032879e2$export$c58992c2d0e506a0(result, target = new (0, $rINUR$BufferGeometry)()) {
    if (!result || typeof result !== "object" || !result.attributes) throw new TypeError("Geometry result must contain an attributes object.");
    for (const [name, attribute] of Object.entries(result.attributes))$8da93982032879e2$var$validateAttribute(name, attribute);
    if (result.index !== undefined && !(result.index instanceof Uint16Array || result.index instanceof Uint32Array)) throw new TypeError("Geometry index must be a Uint16Array or Uint32Array.");
    for (const name of Object.keys(target.attributes))target.deleteAttribute(name);
    for (const [name, attribute] of Object.entries(result.attributes))target.setAttribute(name, new (0, $rINUR$BufferAttribute)(attribute.array, attribute.itemSize, attribute.normalized === true));
    if (result.index !== undefined) target.setIndex(new (0, $rINUR$BufferAttribute)(result.index, 1));
    else target.setIndex(null);
    target.clearGroups();
    for (const group of result.groups || [])target.addGroup(group.start, group.count, group.materialIndex || 0);
    if (result.drawRange) target.setDrawRange(result.drawRange.start, result.drawRange.count);
    else target.setDrawRange(0, Infinity);
    if (result.bounds) target.boundingBox = new (0, $rINUR$Box3)(new (0, $rINUR$Vector3)().fromArray(result.bounds.min), new (0, $rINUR$Vector3)().fromArray(result.bounds.max));
    else target.boundingBox = null;
    target.boundingSphere = null;
    return target;
}


const $6fafcf15f6b61d60$var$DEFAULT_PRESSURE_SIZE_MIN = 0.1;
const $6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY = 256;
const $6fafcf15f6b61d60$var$INITIAL_INDEX_CAPACITY = 1024;
function $6fafcf15f6b61d60$export$cbaccd875830d3d0() {
    return {
        family: "ribbon",
        positions: new Float32Array($6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY * 3),
        normals: new Float32Array($6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY * 3),
        tangents: new Float32Array($6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY * 4),
        colors: new Float32Array($6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY * 4),
        uvs: new Float32Array($6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY * 2),
        packedUvs: new Float32Array($6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY * 3),
        particleUvs: new Float32Array($6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY * 4),
        vectorUvs: new Float32Array($6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY * 3),
        uv1s: new Float32Array($6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY * 4),
        tubeBreakBefore: new Uint8Array($6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY),
        tubeFrameRights: new Float32Array($6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY * 3),
        tubeFrameUps: new Float32Array($6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY * 3),
        tubeTangents: new Float32Array($6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY * 3),
        tubeRadii: new Float32Array($6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY),
        tubeRingUs: new Float32Array($6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY),
        tubeOpacities: new Float32Array($6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY),
        tubeSmoothedPressures: new Float32Array($6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY),
        tubeRetainedControlPoints: [],
        ribbonBreakBefore: new Uint8Array($6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY),
        ribbonProvisionalSamples: new Uint8Array($6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY),
        ribbonRunningLengths: new Float32Array($6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY),
        ribbonSectionLengths: new Float32Array($6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY),
        ribbonSmoothedPressures: new Float32Array($6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY),
        quadStripRawPositions: new Float32Array($6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY * 18),
        quadStripRawNormals: new Float32Array($6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY * 18),
        quadStripPressuredSizes: new Float32Array($6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY),
        ribbonPreviousRetained: new Int32Array($6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY),
        ribbonNextRetained: new Int32Array($6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY),
        geometrySmoothedPressures: new Float32Array($6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY),
        geometrySmoothedPositions: new Float32Array($6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY * 3),
        uv0Size: 2,
        uv1Size: 0,
        indices: new Uint32Array($6fafcf15f6b61d60$var$INITIAL_INDEX_CAPACITY),
        vertexCount: 0,
        indexCount: 0,
        bounds: $6fafcf15f6b61d60$var$createEmptyBounds()
    };
}
/** Grows storage to fit the given counts; returns true when reallocated. */ function $6fafcf15f6b61d60$var$ensureGeometryCapacity(out, vertexCount, indexCount) {
    const currentVertexCapacity = out.positions.length / 3;
    const currentIndexCapacity = out.indices.length;
    if (vertexCount <= currentVertexCapacity && indexCount <= currentIndexCapacity) return false;
    let vertexCapacity = Math.max(currentVertexCapacity, $6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY);
    while(vertexCapacity < vertexCount)vertexCapacity *= 2;
    let indexCapacity = Math.max(currentIndexCapacity, $6fafcf15f6b61d60$var$INITIAL_INDEX_CAPACITY);
    while(indexCapacity < indexCount)indexCapacity *= 2;
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
function $6fafcf15f6b61d60$var$ensureTubeScratchCapacity(out, pointCount) {
    if (pointCount <= out.tubeBreakBefore.length) {
        out.tubeBreakBefore.fill(0, 0, pointCount);
        return;
    }
    let capacity = Math.max(out.tubeBreakBefore.length, $6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY);
    while(capacity < pointCount)capacity *= 2;
    out.tubeBreakBefore = new Uint8Array(capacity);
    out.tubeFrameRights = new Float32Array(capacity * 3);
    out.tubeFrameUps = new Float32Array(capacity * 3);
    out.tubeTangents = new Float32Array(capacity * 3);
    out.tubeRadii = new Float32Array(capacity);
    out.tubeRingUs = new Float32Array(capacity);
    out.tubeOpacities = new Float32Array(capacity);
    out.tubeSmoothedPressures = new Float32Array(capacity);
}
function $6fafcf15f6b61d60$var$ensureRibbonScratchCapacity(out, pointCount) {
    if (pointCount > out.ribbonBreakBefore.length) {
        let capacity = Math.max(out.ribbonBreakBefore.length, $6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY);
        while(capacity < pointCount)capacity *= 2;
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
function $6fafcf15f6b61d60$var$ensureGeometryPressureCapacity(out, pointCount) {
    if (pointCount <= out.geometrySmoothedPressures.length) return;
    let capacity = Math.max(out.geometrySmoothedPressures.length, $6fafcf15f6b61d60$var$INITIAL_VERTEX_CAPACITY);
    while(capacity < pointCount)capacity *= 2;
    out.geometrySmoothedPressures = new Float32Array(capacity);
    out.geometrySmoothedPositions = new Float32Array(capacity * 3);
}
function $6fafcf15f6b61d60$var$resetBounds(bounds) {
    bounds.min[0] = Number.POSITIVE_INFINITY;
    bounds.min[1] = Number.POSITIVE_INFINITY;
    bounds.min[2] = Number.POSITIVE_INFINITY;
    bounds.max[0] = Number.NEGATIVE_INFINITY;
    bounds.max[1] = Number.NEGATIVE_INFINITY;
    bounds.max[2] = Number.NEGATIVE_INFINITY;
}
function $6fafcf15f6b61d60$export$b666f4efdc86d990(stroke, family, options, out) {
    out.warning = undefined;
    out.uv1Size = 0;
    $6fafcf15f6b61d60$var$resetBounds(out.bounds);
    switch(family){
        case "ribbon":
            return $6fafcf15f6b61d60$var$generateRibbonGeometry(stroke, "ribbon", options, out);
        case "emissive":
            return $6fafcf15f6b61d60$var$generateRibbonGeometry(stroke, "emissive", options, out);
        case "tube":
            return $6fafcf15f6b61d60$var$generateTubeGeometry(stroke, options, out);
        case "thick-strip":
            return $6fafcf15f6b61d60$var$generateThickStripGeometry(stroke, options, out);
        case "hull":
            return $6fafcf15f6b61d60$var$generateHullGeometry(stroke, options, out);
        case "concave-hull":
            return $6fafcf15f6b61d60$var$generateConcaveHullGeometry(stroke, options, out);
        case "print3d":
            return $6fafcf15f6b61d60$var$generateSquare3DPrintGeometry(stroke, options, out);
        case "particle":
            return $6fafcf15f6b61d60$var$generateParticleGeometry(stroke, options, out);
        case "unsupported":
            {
                const reallocated = $6fafcf15f6b61d60$var$generateRibbonGeometry(stroke, "unsupported", options, out);
                out.warning = "Unsupported brush geometry family; generated fallback ribbon.";
                return reallocated;
            }
    }
}
function $6fafcf15f6b61d60$export$366b94ab2030e692(stroke, family, options = {}) {
    const arrays = $6fafcf15f6b61d60$export$cbaccd875830d3d0();
    $6fafcf15f6b61d60$export$b666f4efdc86d990(stroke, family, options, arrays);
    return {
        family: arrays.family,
        positions: arrays.positions.subarray(0, arrays.vertexCount * 3),
        normals: arrays.normals.subarray(0, arrays.vertexCount * 3),
        tangents: arrays.tangents.subarray(0, arrays.vertexCount * 4),
        colors: arrays.colors.subarray(0, arrays.vertexCount * 4),
        uvs: arrays.uvs.subarray(0, arrays.vertexCount * 2),
        uv0Size: arrays.uv0Size,
        uv1Size: arrays.uv1Size,
        packedUvs: arrays.uv0Size === 3 ? arrays.packedUvs.subarray(0, arrays.vertexCount * 3) : arrays.uv0Size === 4 ? arrays.particleUvs.subarray(0, arrays.vertexCount * 4) : undefined,
        uv1: arrays.uv1Size === 3 ? arrays.vectorUvs.subarray(0, arrays.vertexCount * 3) : arrays.uv1Size === 4 ? arrays.uv1s.subarray(0, arrays.vertexCount * 4) : undefined,
        indices: arrays.indices.subarray(0, arrays.indexCount),
        bounds: arrays.bounds,
        warning: arrays.warning
    };
}
function $6fafcf15f6b61d60$export$25229b7d204fd918(geometry) {
    return geometry.positions.length / 3;
}
function $6fafcf15f6b61d60$export$96e734d2eaa5b48d(geometry) {
    return geometry.indices.length;
}
function $6fafcf15f6b61d60$var$generateRibbonGeometry(stroke, family, options, out) {
    out.uv0Size = 2;
    const hasVectorOffset = options.geometryParams?.ribbonOffsetInTexcoord1 === true;
    const usesFlatGeometrySmoothing = options.generatorClass === "FlatGeometryBrush";
    out.uv1Size = hasVectorOffset ? 3 : 0;
    if (options.generatorClass === "QuadStripUnitizedUVBrush") return $6fafcf15f6b61d60$var$generateUnitizedRibbonGeometry(stroke, family, options, out);
    const usesQuadStripTriangleSoup = options.generatorClass === "QuadStripBrushDistanceUV" || options.generatorClass === "QuadStripBrushStretchUV";
    const pointCount = stroke.controlPoints.length;
    if (usesQuadStripTriangleSoup) $6fafcf15f6b61d60$var$prepareQuadStripSections(stroke, options, out);
    else if (usesFlatGeometrySmoothing) $6fafcf15f6b61d60$var$prepareFlatGeometrySections(stroke, options, out);
    else {
        $6fafcf15f6b61d60$var$prepareRibbonSections(stroke, out);
        $6fafcf15f6b61d60$var$prepareRibbonSmoothedPressures(stroke, options, out);
    }
    const renderPointCount = $6fafcf15f6b61d60$var$resolveRibbonRenderPointCount(pointCount, options, out.ribbonBreakBefore);
    const frontVertexCount = renderPointCount * 2;
    const segmentCount = Math.max(0, renderPointCount - 1);
    const connectedSegmentCount = $6fafcf15f6b61d60$var$countConnectedRibbonSegments(out.ribbonBreakBefore, renderPointCount, usesQuadStripTriangleSoup);
    const frontIndexCount = connectedSegmentCount * 6;
    const hasBackfaces = options.geometryParams?.renderBackfaces === true;
    const sourceVertexCount = frontVertexCount * (hasBackfaces ? 2 : 1);
    const vertexCount = usesQuadStripTriangleSoup ? frontIndexCount * (hasBackfaces ? 2 : 1) : sourceVertexCount;
    const indexCount = frontIndexCount * (hasBackfaces ? 2 : 1);
    const reallocated = $6fafcf15f6b61d60$var$ensureGeometryCapacity(out, vertexCount + (usesQuadStripTriangleSoup ? sourceVertexCount : 0), indexCount);
    const { positions: positions, normals: normals, tangents: tangents, colors: colors, uvs: uvs, vectorUvs: vectorUvs, indices: indices, bounds: bounds, ribbonBreakBefore: ribbonBreakBefore, ribbonRunningLengths: ribbonRunningLengths, ribbonSectionLengths: ribbonSectionLengths, ribbonSmoothedPressures: ribbonSmoothedPressures } = out;
    const pressureSizeMin = $6fafcf15f6b61d60$var$normalizePressureSizeMin(options.pressureSizeRange?.[0]);
    const pressureOpacityMin = $6fafcf15f6b61d60$var$normalizePressureOpacityMin(options.pressureOpacityRange);
    const pressureOpacityMax = $6fafcf15f6b61d60$var$normalizePressureOpacityMax(options.pressureOpacityRange);
    const descriptorOpacity = $6fafcf15f6b61d60$var$normalizeDescriptorOpacity(options.geometryParams?.opacity);
    const localBrushSize = $6fafcf15f6b61d60$var$getLocalBrushSize(stroke);
    const tileRate = $6fafcf15f6b61d60$var$normalizeTileRate(options.geometryParams?.tileRate);
    const usesDistanceUvs = options.generatorClass === "QuadStripBrushDistanceUV" || options.geometryParams?.ribbonUvStyle === "distance";
    const atlasRows = $6fafcf15f6b61d60$var$normalizeAtlasRows(options.geometryParams?.textureAtlasV);
    let sectionRandom = $6fafcf15f6b61d60$var$statelessRandom01(stroke.seed, usesFlatGeometrySmoothing ? -1 : 0);
    let atlasRow = usesDistanceUvs ? Math.floor(sectionRandom * 3331) % atlasRows : Math.floor(sectionRandom * atlasRows);
    let v0 = atlasRow / atlasRows;
    let v1 = (atlasRow + 1) / atlasRows;
    // Ribbon surface frames per Open Brush's ComputeSurfaceFrameNew
    // (BaseBrushScript.cs): the frame follows the pointer orientation and the
    // movement direction, disambiguated toward the previous right vector so the
    // strip never flips mid-stroke (the old XZ-planar offset twisted on coils).
    const previousRight = [
        0,
        0,
        0
    ];
    const previousTangent = [
        0,
        0,
        0
    ];
    const tangent = [
        0,
        0,
        0
    ];
    const pointerForward = [
        0,
        0,
        0
    ];
    const pointerUp = [
        0,
        0,
        0
    ];
    const right = [
        0,
        0,
        0
    ];
    const normal = [
        0,
        0,
        0
    ];
    const previousFlatNormal = [
        0,
        0,
        0
    ];
    const previousFlatCenter = [
        0,
        0,
        0
    ];
    const previousFlatForward = [
        0,
        0,
        0
    ];
    const flatEdge = [
        0,
        0,
        0
    ];
    let previousFlatSize = 0;
    const flatHalfRights = usesFlatGeometrySmoothing ? new Float32Array(pointCount * 3) : undefined;
    let flatOpenBrushVertexCount = 0;
    let flatPreviousHasGeometry = false;
    let flatDistanceU = sectionRandom;
    for(let index = 0; index < renderPointCount; index += 1){
        if (usesFlatGeometrySmoothing && ribbonBreakBefore[index] === 2) continue;
        const point = stroke.controlPoints[index];
        const previousPointIndex = usesFlatGeometrySmoothing ? out.ribbonPreviousRetained[index] : Math.max(0, index - 1);
        const nextPointIndex = usesFlatGeometrySmoothing ? out.ribbonNextRetained[index] : Math.min(pointCount - 1, index + 1);
        const previousPoint = stroke.controlPoints[previousPointIndex];
        const nextPoint = stroke.controlPoints[nextPointIndex];
        const center = usesFlatGeometrySmoothing && options.geometryParams?.m11Compatibility !== true && index > 0 ? [
            previousPoint.position[0] * 0.3 + point.position[0] * 0.4 + nextPoint.position[0] * 0.3,
            previousPoint.position[1] * 0.3 + point.position[1] * 0.4 + nextPoint.position[1] * 0.3,
            previousPoint.position[2] * 0.3 + point.position[2] * 0.4 + nextPoint.position[2] * 0.3
        ] : point.position;
        if (ribbonBreakBefore[index] === 1 && !usesFlatGeometrySmoothing) {
            sectionRandom = $6fafcf15f6b61d60$var$statelessRandom01(stroke.seed, index);
            atlasRow = usesDistanceUvs ? Math.floor(sectionRandom * 3331) % atlasRows : Math.floor(sectionRandom * atlasRows);
            v0 = atlasRow / atlasRows;
            v1 = (atlasRow + 1) / atlasRows;
        }
        if (usesFlatGeometrySmoothing && index > 0 && ribbonBreakBefore[index] === 0 && !flatPreviousHasGeometry) {
            // GeometryBrush seeds each FlatGeometry UV section from the index just
            // before the first solid's Open Brush vertex range. Shared continuation
            // edges add two vertices per side; a fresh double-sided solid adds four.
            sectionRandom = $6fafcf15f6b61d60$var$statelessRandom01(stroke.seed, flatOpenBrushVertexCount === 0 || usesDistanceUvs ? flatOpenBrushVertexCount - 1 : flatOpenBrushVertexCount);
            atlasRow = usesDistanceUvs ? Math.floor(sectionRandom * 3331) % atlasRows : Math.floor(sectionRandom * atlasRows);
            v0 = atlasRow / atlasRows;
            v1 = (atlasRow + 1) / atlasRows;
            flatDistanceU = sectionRandom;
            const sectionStartVertex = previousPointIndex * 2;
            const sectionStartU = usesDistanceUvs ? sectionRandom : 0;
            $6fafcf15f6b61d60$var$writeUv(uvs, sectionStartVertex, [
                sectionStartU,
                v1
            ]);
            $6fafcf15f6b61d60$var$writeUv(uvs, sectionStartVertex + 1, [
                sectionStartU,
                v0
            ]);
        }
        let size = localBrushSize * $6fafcf15f6b61d60$var$getPressureSizeMultiplier(ribbonSmoothedPressures[index], pressureSizeMin);
        if (usesFlatGeometrySmoothing) {
            const tangentStart = index === 0 ? point.position : previousPoint.position;
            const tangentEnd = (index === 0 || options.geometryParams?.m11Compatibility !== true) && nextPointIndex !== index ? nextPoint.position : point.position;
            tangent[0] = tangentEnd[0] - tangentStart[0];
            tangent[1] = tangentEnd[1] - tangentStart[1];
            tangent[2] = tangentEnd[2] - tangentStart[2];
            if (!$6fafcf15f6b61d60$var$normalizeInPlace(tangent)) $6fafcf15f6b61d60$var$copyVec3(previousTangent, tangent);
        } else $6fafcf15f6b61d60$var$writeCentralDifferenceTangent(stroke, index, previousTangent, tangent);
        $6fafcf15f6b61d60$var$rotateByQuaternion(point.orientation, $6fafcf15f6b61d60$var$VEC_FORWARD, pointerForward);
        $6fafcf15f6b61d60$var$rotateByQuaternion(point.orientation, $6fafcf15f6b61d60$var$VEC_UP, pointerUp);
        $6fafcf15f6b61d60$var$computeSurfaceFrame(previousRight, tangent, pointerForward, pointerUp, index === 0, right, normal);
        if (usesFlatGeometrySmoothing && options.geometryParams?.m11Compatibility !== true && index > 0 && ribbonBreakBefore[index] === 0) {
            $6fafcf15f6b61d60$var$cross(previousRight, previousFlatNormal, previousFlatForward);
            flatEdge[0] = point.position[0] + 0.5 * size * right[0] - previousFlatCenter[0];
            flatEdge[1] = point.position[1] + 0.5 * size * right[1] - previousFlatCenter[1];
            flatEdge[2] = point.position[2] + 0.5 * size * right[2] - previousFlatCenter[2];
            const dotRight = $6fafcf15f6b61d60$var$dotVec3(previousFlatForward, flatEdge);
            flatEdge[0] = point.position[0] - 0.5 * size * right[0] - previousFlatCenter[0];
            flatEdge[1] = point.position[1] - 0.5 * size * right[1] - previousFlatCenter[1];
            flatEdge[2] = point.position[2] - 0.5 * size * right[2] - previousFlatCenter[2];
            const dotLeft = $6fafcf15f6b61d60$var$dotVec3(previousFlatForward, flatEdge);
            if (dotLeft < 0 && dotRight > 0 || dotLeft > 0 && dotRight < 0) {
                const turnSign = dotLeft < 0 ? -1 : 1;
                flatEdge[0] = previousFlatCenter[0] + turnSign * 0.5 * previousFlatSize * previousRight[0] - point.position[0];
                flatEdge[1] = previousFlatCenter[1] + turnSign * 0.5 * previousFlatSize * previousRight[1] - point.position[1];
                flatEdge[2] = previousFlatCenter[2] + turnSign * 0.5 * previousFlatSize * previousRight[2] - point.position[2];
                size = Math.sqrt($6fafcf15f6b61d60$var$dotVec3(flatEdge, flatEdge));
            }
            const moveLength = Math.sqrt((point.position[0] - previousFlatCenter[0]) ** 2 + (point.position[1] - previousFlatCenter[1]) ** 2 + (point.position[2] - previousFlatCenter[2]) ** 2);
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
            flatHalfRights[offset] = right[0] * width;
            flatHalfRights[offset + 1] = right[1] * width;
            flatHalfRights[offset + 2] = right[2] * width;
        }
        const leftVertex = index * 2;
        const rightVertex = leftVertex + 1;
        $6fafcf15f6b61d60$var$writePosition(positions, leftVertex, [
            center[0] - right[0] * width,
            center[1] - right[1] * width,
            center[2] - right[2] * width
        ]);
        $6fafcf15f6b61d60$var$writePosition(positions, rightVertex, [
            center[0] + right[0] * width,
            center[1] + right[1] * width,
            center[2] + right[2] * width
        ]);
        $6fafcf15f6b61d60$var$writeNormal(normals, leftVertex, normal);
        $6fafcf15f6b61d60$var$writeNormal(normals, rightVertex, normal);
        $6fafcf15f6b61d60$var$writeTangent(tangents, leftVertex, tangent, 1);
        $6fafcf15f6b61d60$var$writeTangent(tangents, rightVertex, tangent, 1);
        const opacity = $6fafcf15f6b61d60$var$getPressureOpacityMultiplier(ribbonSmoothedPressures[index], pressureOpacityMin, pressureOpacityMax) * descriptorOpacity;
        $6fafcf15f6b61d60$var$writeColor(colors, leftVertex, stroke.color, opacity);
        $6fafcf15f6b61d60$var$writeColor(colors, rightVertex, stroke.color, opacity);
        // Open Brush distance ribbons advance by tileRate * segmentLength / size;
        // stretch ribbons normalize accumulated physical length across the stroke.
        const runningLength = ribbonRunningLengths[index];
        const sectionLength = ribbonSectionLengths[index];
        let u = usesDistanceUvs ? sectionRandom + runningLength / Math.max(localBrushSize, $6fafcf15f6b61d60$var$EPSILON) * tileRate : sectionLength > $6fafcf15f6b61d60$var$EPSILON ? runningLength / sectionLength : 0;
        if (usesFlatGeometrySmoothing && usesDistanceUvs && index > 0 && ribbonBreakBefore[index] === 0) {
            flatDistanceU += tileRate * $6fafcf15f6b61d60$var$distanceBetweenControlPoints(previousPoint, point) / Math.max(size, $6fafcf15f6b61d60$var$EPSILON);
            u = flatDistanceU;
        }
        if (usesFlatGeometrySmoothing) {
            // Reflection reverses FlatGeometry's semantic left/right ownership.
            // Preserve Open Brush's BR/BL UV order while keeping the spatial vertex
            // order used by the generated Three mesh.
            $6fafcf15f6b61d60$var$writeUv(uvs, leftVertex, [
                u,
                v1
            ]);
            $6fafcf15f6b61d60$var$writeUv(uvs, rightVertex, [
                u,
                v0
            ]);
        } else {
            $6fafcf15f6b61d60$var$writeUv(uvs, leftVertex, [
                u,
                v0
            ]);
            $6fafcf15f6b61d60$var$writeUv(uvs, rightVertex, [
                u,
                v1
            ]);
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
        $6fafcf15f6b61d60$var$includeBounds(bounds, positions, leftVertex);
        $6fafcf15f6b61d60$var$includeBounds(bounds, positions, rightVertex);
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
            flatOpenBrushVertexCount += flatPreviousHasGeometry ? hasBackfaces ? 4 : 2 : hasBackfaces ? 8 : 4;
            flatPreviousHasGeometry = true;
        }
    }
    if (flatHalfRights) {
        if (options.geometryParams?.m11Compatibility !== true) $6fafcf15f6b61d60$var$smoothFlatGeometryEdges(stroke, positions, flatHalfRights, ribbonBreakBefore, ribbonSmoothedPressures, out.ribbonPreviousRetained, out.ribbonNextRetained, localBrushSize, pressureSizeMin, bounds, renderPointCount);
        $6fafcf15f6b61d60$var$updateFlatGeometryTangents(positions, normals, tangents, uvs, ribbonBreakBefore, renderPointCount);
    }
    let indexOffset = 0;
    for(let segment = 0; segment < segmentCount; segment += 1){
        if (ribbonBreakBefore[segment + 1] === 1 || usesFlatGeometrySmoothing && ribbonBreakBefore[segment + 1] === 2) continue;
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
        const hueShift = $6fafcf15f6b61d60$var$normalizeHueShift(options.geometryParams?.backfaceHueShift);
        const backfaceColor = $6fafcf15f6b61d60$var$shiftHue(stroke.color, hueShift);
        for(let vertex = 0; vertex < frontVertexCount; vertex += 1){
            const backVertex = frontVertexCount + vertex;
            $6fafcf15f6b61d60$var$copyPosition(positions, vertex, backVertex);
            $6fafcf15f6b61d60$var$copyNegatedNormal(normals, vertex, backVertex);
            $6fafcf15f6b61d60$var$copyTangent(tangents, vertex, backVertex, true);
            $6fafcf15f6b61d60$var$copyUv(uvs, vertex, backVertex);
            if (hasVectorOffset) $6fafcf15f6b61d60$var$copyVec3At(vectorUvs, vertex, backVertex);
            $6fafcf15f6b61d60$var$writeColorFromAlpha(colors, backVertex, backfaceColor, colors[vertex * 4 + 3]);
        }
        let backIndexOffset = frontIndexCount;
        for(let segment = 0; segment < segmentCount; segment += 1){
            if (ribbonBreakBefore[segment + 1] === 1 || usesFlatGeometrySmoothing && ribbonBreakBefore[segment + 1] === 2) continue;
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
        $6fafcf15f6b61d60$var$expandRibbonTriangleSoup(out, ribbonBreakBefore, renderPointCount, frontVertexCount, frontIndexCount, hasBackfaces, vertexCount);
        $6fafcf15f6b61d60$var$applyQuadStripPositionQuads(out, stroke, options, ribbonBreakBefore, renderPointCount);
        $6fafcf15f6b61d60$var$applyQuadStripMidpointFusion(out, stroke, options, ribbonBreakBefore, renderPointCount, frontIndexCount / 6, hasBackfaces, options.generatorClass, tileRate, atlasRows, stroke.seed);
    }
    const finalizedCounts = usesQuadStripTriangleSoup ? $6fafcf15f6b61d60$var$finalizeQuadStripUsedGeometry(out, ribbonBreakBefore, renderPointCount, frontIndexCount / 6, hasBackfaces, options) : undefined;
    let finalVertexCount = finalizedCounts?.vertexCount ?? vertexCount;
    let finalIndexCount = finalizedCounts?.indexCount ?? indexCount;
    if (usesQuadStripTriangleSoup && options.finalized === true && !hasBackfaces && finalVertexCount > 0) {
        const weldedCounts = $6fafcf15f6b61d60$var$weldSingleSidedQuadStrip(out, ribbonBreakBefore, renderPointCount, finalVertexCount / 6);
        finalVertexCount = weldedCounts.vertexCount;
        finalIndexCount = weldedCounts.indexCount;
    }
    if (usesQuadStripTriangleSoup && hasBackfaces && finalVertexCount > 0) $6fafcf15f6b61d60$var$interleaveQuadStripBackfaces(out, finalVertexCount / 12);
    if (usesFlatGeometrySmoothing) {
        const compacted = $6fafcf15f6b61d60$var$compactFlatGeometry(out, ribbonBreakBefore, renderPointCount, hasBackfaces, hasVectorOffset);
        finalVertexCount = compacted.vertexCount;
        finalIndexCount = compacted.indexCount;
    }
    out.family = family;
    out.vertexCount = finalVertexCount;
    out.indexCount = finalIndexCount;
    return reallocated;
}
/** Repack point-pair scratch into GeometryBrush's shared indexed strip layout. */ function $6fafcf15f6b61d60$var$compactFlatGeometry(out, breakBefore, pointCount, hasBackfaces, hasVectorOffset) {
    const sourceFrontVertexCount = pointCount * 2;
    $6fafcf15f6b61d60$var$compactFlatGeometryAttribute(out.positions, 3, out.particleUvs, breakBefore, pointCount, sourceFrontVertexCount, hasBackfaces);
    $6fafcf15f6b61d60$var$compactFlatGeometryAttribute(out.normals, 3, out.particleUvs, breakBefore, pointCount, sourceFrontVertexCount, hasBackfaces);
    $6fafcf15f6b61d60$var$compactFlatGeometryAttribute(out.tangents, 4, out.particleUvs, breakBefore, pointCount, sourceFrontVertexCount, hasBackfaces);
    const compactedVertexUpperBound = pointCount * (hasBackfaces ? 4 : 2);
    for(let vertex = 0; vertex < compactedVertexUpperBound; vertex += 1)out.tangents[vertex * 4 + 3] *= -1;
    $6fafcf15f6b61d60$var$compactFlatGeometryAttribute(out.colors, 4, out.particleUvs, breakBefore, pointCount, sourceFrontVertexCount, hasBackfaces);
    $6fafcf15f6b61d60$var$compactFlatGeometryAttribute(out.uvs, 2, out.particleUvs, breakBefore, pointCount, sourceFrontVertexCount, hasBackfaces);
    if (hasVectorOffset) $6fafcf15f6b61d60$var$compactFlatGeometryAttribute(out.vectorUvs, 3, out.particleUvs, breakBefore, pointCount, sourceFrontVertexCount, hasBackfaces);
    const verticesPerPoint = hasBackfaces ? 4 : 2;
    let vertexWrite = 0;
    let indexWrite = 0;
    let continuesStrip = false;
    for(let pointIndex = 1; pointIndex < pointCount; pointIndex += 1){
        if (breakBefore[pointIndex] === 2) continue;
        if (breakBefore[pointIndex] === 1) {
            continuesStrip = false;
            continue;
        }
        if (!continuesStrip) vertexWrite += verticesPerPoint;
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
    $6fafcf15f6b61d60$var$resetBounds(out.bounds);
    for(let vertex = 0; vertex < vertexWrite; vertex += 1)$6fafcf15f6b61d60$var$includeBounds(out.bounds, out.positions, vertex);
    return {
        vertexCount: vertexWrite,
        indexCount: indexWrite
    };
}
function $6fafcf15f6b61d60$var$compactFlatGeometryAttribute(target, itemSize, scratch, breakBefore, pointCount, sourceFrontVertexCount, hasBackfaces) {
    const sourceVertexCount = sourceFrontVertexCount * (hasBackfaces ? 2 : 1);
    scratch.set(target.subarray(0, sourceVertexCount * itemSize), 0);
    let vertexWrite = 0;
    let continuesStrip = false;
    let lastRetainedPoint = 0;
    for(let pointIndex = 1; pointIndex < pointCount; pointIndex += 1){
        if (breakBefore[pointIndex] === 2) continue;
        if (breakBefore[pointIndex] === 1) {
            continuesStrip = false;
            lastRetainedPoint = pointIndex;
            continue;
        }
        if (!continuesStrip) vertexWrite = $6fafcf15f6b61d60$var$appendFlatGeometryPointAttribute(target, itemSize, scratch, sourceFrontVertexCount, hasBackfaces, lastRetainedPoint, vertexWrite);
        vertexWrite = $6fafcf15f6b61d60$var$appendFlatGeometryPointAttribute(target, itemSize, scratch, sourceFrontVertexCount, hasBackfaces, pointIndex, vertexWrite);
        continuesStrip = true;
        lastRetainedPoint = pointIndex;
    }
}
function $6fafcf15f6b61d60$var$appendFlatGeometryPointAttribute(target, itemSize, scratch, sourceFrontVertexCount, hasBackfaces, pointIndex, vertexWrite) {
    for(let side = 0; side < 2; side += 1){
        const frontSource = pointIndex * 2 + side;
        $6fafcf15f6b61d60$var$copyAttributeItem(scratch, target, frontSource, vertexWrite, itemSize);
        vertexWrite += 1;
        if (hasBackfaces) {
            $6fafcf15f6b61d60$var$copyAttributeItem(scratch, target, sourceFrontVertexCount + frontSource, vertexWrite, itemSize);
            vertexWrite += 1;
        }
    }
    return vertexWrite;
}
/** Port of QuadStripBrush.WeldSingleSidedQuadStrip in canonical Three winding. */ function $6fafcf15f6b61d60$var$weldSingleSidedQuadStrip(out, breakBefore, pointCount, solidCount) {
    $6fafcf15f6b61d60$var$weldSingleSidedQuadStripAttribute(out.positions, 3, out.uv1s, breakBefore, pointCount, solidCount);
    $6fafcf15f6b61d60$var$weldSingleSidedQuadStripAttribute(out.normals, 3, out.uv1s, breakBefore, pointCount, solidCount);
    $6fafcf15f6b61d60$var$weldSingleSidedQuadStripAttribute(out.tangents, 4, out.uv1s, breakBefore, pointCount, solidCount);
    $6fafcf15f6b61d60$var$weldSingleSidedQuadStripAttribute(out.colors, 4, out.uv1s, breakBefore, pointCount, solidCount);
    $6fafcf15f6b61d60$var$weldSingleSidedQuadStripAttribute(out.uvs, 2, out.uv1s, breakBefore, pointCount, solidCount);
    if (out.uv1Size === 3) $6fafcf15f6b61d60$var$weldSingleSidedQuadStripAttribute(out.vectorUvs, 3, out.uv1s, breakBefore, pointCount, solidCount);
    let solid = 0;
    let vertexWrite = 0;
    let indexWrite = 0;
    let startsStrip = true;
    for(let segment = 0; segment < pointCount - 1 && solid < solidCount; segment += 1){
        const sectionState = breakBefore[segment + 1];
        if (sectionState === 2) continue;
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
    return {
        vertexCount: vertexWrite,
        indexCount: indexWrite
    };
}
function $6fafcf15f6b61d60$var$weldSingleSidedQuadStripAttribute(target, itemSize, scratch, breakBefore, pointCount, solidCount) {
    scratch.set(target.subarray(0, solidCount * 6 * itemSize), 0);
    let solid = 0;
    let vertexWrite = 0;
    let startsStrip = true;
    for(let segment = 0; segment < pointCount - 1 && solid < solidCount; segment += 1){
        const sectionState = breakBefore[segment + 1];
        if (sectionState === 2) continue;
        startsStrip = startsStrip || sectionState === 1;
        const sourceVertex = solid * 6;
        if (startsStrip) {
            $6fafcf15f6b61d60$var$copyAttributeItem(scratch, target, sourceVertex + 1, vertexWrite, itemSize);
            $6fafcf15f6b61d60$var$copyAttributeItem(scratch, target, sourceVertex, vertexWrite + 1, itemSize);
            $6fafcf15f6b61d60$var$copyAttributeItem(scratch, target, sourceVertex + 4, vertexWrite + 2, itemSize);
            $6fafcf15f6b61d60$var$copyAttributeItem(scratch, target, sourceVertex + 2, vertexWrite + 3, itemSize);
            vertexWrite += 4;
            startsStrip = false;
        } else {
            $6fafcf15f6b61d60$var$copyAttributeItem(scratch, target, sourceVertex + 4, vertexWrite, itemSize);
            $6fafcf15f6b61d60$var$copyAttributeItem(scratch, target, sourceVertex + 2, vertexWrite + 1, itemSize);
            vertexWrite += 2;
        }
        solid += 1;
    }
}
/** Matches Open Brush's per-solid front/back vertex ordering. */ function $6fafcf15f6b61d60$var$interleaveQuadStripBackfaces(out, solidCount) {
    const frontVertexCount = solidCount * 6;
    const totalVertexCount = frontVertexCount * 2;
    $6fafcf15f6b61d60$var$interleaveVertexAttribute(out.positions, 3, solidCount, out.uv1s);
    $6fafcf15f6b61d60$var$interleaveVertexAttribute(out.normals, 3, solidCount, out.uv1s);
    $6fafcf15f6b61d60$var$interleaveVertexAttribute(out.tangents, 4, solidCount, out.uv1s);
    $6fafcf15f6b61d60$var$interleaveVertexAttribute(out.colors, 4, solidCount, out.uv1s);
    $6fafcf15f6b61d60$var$interleaveVertexAttribute(out.uvs, 2, solidCount, out.uv1s);
    if (out.uv1Size === 3) $6fafcf15f6b61d60$var$interleaveVertexAttribute(out.vectorUvs, 3, solidCount, out.uv1s);
    for(let index = 0; index < totalVertexCount; index += 1)out.indices[index] = index;
}
function $6fafcf15f6b61d60$var$interleaveVertexAttribute(target, itemSize, solidCount, scratch) {
    const verticesPerSide = solidCount * 6;
    const valueCount = verticesPerSide * 2 * itemSize;
    scratch.set(target.subarray(0, valueCount), 0);
    for(let solid = 0; solid < solidCount; solid += 1){
        const frontSource = solid * 6;
        const backSource = verticesPerSide + frontSource;
        const frontDestination = solid * 12;
        const backDestination = frontDestination + 6;
        for(let corner = 0; corner < 6; corner += 1){
            $6fafcf15f6b61d60$var$copyAttributeItem(scratch, target, frontSource + corner, frontDestination + corner, itemSize);
            $6fafcf15f6b61d60$var$copyAttributeItem(scratch, target, backSource + corner, backDestination + corner, itemSize);
        }
    }
}
function $6fafcf15f6b61d60$var$copyAttributeItem(source, target, sourceIndex, targetIndex, itemSize) {
    const sourceOffset = sourceIndex * itemSize;
    const targetOffset = targetIndex * itemSize;
    for(let component = 0; component < itemSize; component += 1)target[targetOffset + component] = source[sourceOffset + component];
}
function $6fafcf15f6b61d60$var$finalizeQuadStripUsedGeometry(out, breakBefore, pointCount, frontSolidCount, hasBackfaces, options) {
    if (options.finalized !== true || options.lastControlPointIsKeeper !== false || pointCount < 2) return undefined;
    const finalSegment = pointCount - 2;
    const provisionalBreaks = breakBefore[pointCount - 1] === 1;
    let previousSectionSolidCount = 0;
    for(let segment = finalSegment - 1; segment >= 0; segment -= 1){
        if (breakBefore[segment + 1] === 1) break;
        previousSectionSolidCount += 1;
    }
    let removedSolidCount = 0;
    if (provisionalBreaks) removedSolidCount = previousSectionSolidCount === 1 ? 1 : 0;
    else if (previousSectionSolidCount === 0) removedSolidCount = 1;
    else if (previousSectionSolidCount === 1) removedSolidCount = 2;
    const keptFrontSolidCount = Math.max(0, frontSolidCount - removedSolidCount);
    if (keptFrontSolidCount === frontSolidCount) return undefined;
    const oldFrontVertexCount = frontSolidCount * 6;
    const keptFrontVertexCount = keptFrontSolidCount * 6;
    if (hasBackfaces) for(let vertex = 0; vertex < keptFrontVertexCount; vertex += 1)$6fafcf15f6b61d60$var$copyRibbonVertex(out, oldFrontVertexCount + vertex, keptFrontVertexCount + vertex);
    const vertexCount = keptFrontVertexCount * (hasBackfaces ? 2 : 1);
    for(let index = 0; index < vertexCount; index += 1)out.indices[index] = index;
    $6fafcf15f6b61d60$var$resetBounds(out.bounds);
    for(let vertex = 0; vertex < vertexCount; vertex += 1)$6fafcf15f6b61d60$var$includeBounds(out.bounds, out.positions, vertex);
    return {
        vertexCount: vertexCount,
        indexCount: vertexCount
    };
}
function $6fafcf15f6b61d60$var$expandRibbonTriangleSoup(out, breakBefore, pointCount, frontSourceVertexCount, frontVertexCount, hasBackfaces, finalVertexCount) {
    const sourceOffset = finalVertexCount;
    const sourceVertexCount = frontSourceVertexCount * (hasBackfaces ? 2 : 1);
    for(let vertex = sourceVertexCount - 1; vertex >= 0; vertex -= 1)$6fafcf15f6b61d60$var$copyRibbonVertex(out, vertex, sourceOffset + vertex);
    const frontPattern = [
        0,
        2,
        1,
        1,
        2,
        3
    ];
    const backPattern = [
        0,
        1,
        2,
        1,
        3,
        2
    ];
    let solid = 0;
    for(let segment = 0; segment < pointCount - 1; segment += 1){
        if (breakBefore[segment + 1] === 2) continue;
        const frontSource = sourceOffset + segment * 2;
        const frontDestination = solid * 6;
        for(let corner = 0; corner < 6; corner += 1)$6fafcf15f6b61d60$var$copyRibbonVertex(out, frontSource + frontPattern[corner], frontDestination + corner);
        if (hasBackfaces) {
            const backSource = sourceOffset + frontSourceVertexCount + segment * 2;
            const backDestination = frontVertexCount + solid * 6;
            for(let corner = 0; corner < 6; corner += 1)$6fafcf15f6b61d60$var$copyRibbonVertex(out, backSource + backPattern[corner], backDestination + corner);
        }
        solid += 1;
    }
    for(let index = 0; index < finalVertexCount; index += 1)out.indices[index] = index;
}
function $6fafcf15f6b61d60$var$copyRibbonVertex(out, source, destination) {
    $6fafcf15f6b61d60$var$copyVec3At(out.positions, source, destination);
    $6fafcf15f6b61d60$var$copyVec3At(out.normals, source, destination);
    $6fafcf15f6b61d60$var$copyVec4At(out.tangents, source, destination);
    $6fafcf15f6b61d60$var$copyVec4At(out.colors, source, destination);
    $6fafcf15f6b61d60$var$copyVec2At(out.uvs, source, destination);
    if (out.uv1Size === 3) $6fafcf15f6b61d60$var$copyVec3At(out.vectorUvs, source, destination);
}
function $6fafcf15f6b61d60$var$applyQuadStripPositionQuads(out, stroke, options, breakBefore, pointCount) {
    const previousRight = [
        0,
        0,
        0
    ];
    const tangent = [
        0,
        0,
        0
    ];
    const pointerForward = [
        0,
        0,
        0
    ];
    const pointerUp = [
        0,
        0,
        0
    ];
    const right = [
        0,
        0,
        0
    ];
    const normal = [
        0,
        0,
        0
    ];
    const center = [
        0,
        0,
        0
    ];
    const halfForward = [
        0,
        0,
        0
    ];
    const halfRight = [
        0,
        0,
        0
    ];
    const previousCenter = [
        0,
        0,
        0
    ];
    const previousHalfForward = [
        0,
        0,
        0
    ];
    const previousHalfRight = [
        0,
        0,
        0
    ];
    const lastGeneratedFacing = [
        0,
        0,
        0
    ];
    const positionedFacing = [
        0,
        0,
        0
    ];
    const pressureSizeMin = $6fafcf15f6b61d60$var$normalizePressureSizeMin(options.pressureSizeRange?.[0]);
    const pressureOpacityMin = $6fafcf15f6b61d60$var$normalizePressureOpacityMin(options.pressureOpacityRange);
    const pressureOpacityMax = $6fafcf15f6b61d60$var$normalizePressureOpacityMax(options.pressureOpacityRange);
    const descriptorOpacity = $6fafcf15f6b61d60$var$normalizeDescriptorOpacity(options.geometryParams?.opacity);
    const localBrushSize = $6fafcf15f6b61d60$var$getLocalBrushSize(stroke);
    const provisionalSamples = out.ribbonProvisionalSamples;
    const rawPositions = out.quadStripRawPositions;
    const rawNormals = out.quadStripRawNormals;
    let previousOpacity = 0;
    let lastSizeShrink = 0;
    let sectionSolidCount = 0;
    let lastSpawnPointIndex = 0;
    let solid = 0;
    for(let pointIndex = 1; pointIndex < pointCount; pointIndex += 1){
        const sectionState = breakBefore[pointIndex];
        const isTransientProvisional = sectionState === 2 && provisionalSamples[pointIndex] === 1;
        if (sectionState === 2 && !isTransientProvisional) continue;
        if (sectionState === 1) sectionSolidCount = 0;
        const previousPoint = stroke.controlPoints[lastSpawnPointIndex];
        const point = stroke.controlPoints[pointIndex];
        tangent[0] = point.position[0] - previousPoint.position[0];
        tangent[1] = point.position[1] - previousPoint.position[1];
        tangent[2] = point.position[2] - previousPoint.position[2];
        const moveLength = Math.hypot(tangent[0], tangent[1], tangent[2]);
        if (!$6fafcf15f6b61d60$var$normalizeInPlace(tangent)) continue;
        $6fafcf15f6b61d60$var$rotateByQuaternion(point.orientation, $6fafcf15f6b61d60$var$VEC_FORWARD, pointerForward);
        $6fafcf15f6b61d60$var$rotateByQuaternion(point.orientation, $6fafcf15f6b61d60$var$VEC_UP, pointerUp);
        $6fafcf15f6b61d60$var$computeSurfaceFrame(previousRight, tangent, pointerForward, pointerUp, solid === 0 || options.geometryParams?.backIsInvisible === true, right, normal, true);
        const sourceSize = localBrushSize * $6fafcf15f6b61d60$var$getPressureSizeMultiplier(out.ribbonSmoothedPressures[pointIndex], pressureSizeMin);
        const spawnInterval = 0.0015 + sourceSize * 0.2;
        const generatesNewSolid = moveLength >= spawnInterval;
        if (!generatesNewSolid && $6fafcf15f6b61d60$var$normalizeInPlace(lastGeneratedFacing)) $6fafcf15f6b61d60$var$slerpUnitVectors(lastGeneratedFacing, tangent, moveLength / spawnInterval, positionedFacing);
        else $6fafcf15f6b61d60$var$copyVec3(tangent, positionedFacing);
        let size = sourceSize - lastSizeShrink;
        center[0] = (previousPoint.position[0] + point.position[0]) * 0.5;
        center[1] = (previousPoint.position[1] + point.position[1]) * 0.5;
        center[2] = (previousPoint.position[2] + point.position[2]) * 0.5;
        halfForward[0] = positionedFacing[0] * moveLength * 0.5;
        halfForward[1] = positionedFacing[1] * moveLength * 0.5;
        halfForward[2] = positionedFacing[2] * moveLength * 0.5;
        halfRight[0] = right[0] * size * 0.5;
        halfRight[1] = right[1] * size * 0.5;
        halfRight[2] = right[2] * size * 0.5;
        let sizeShrink = lastSizeShrink;
        if (sectionSolidCount >= 1) {
            const rightEdgeX = center[0] + halfRight[0] - previousCenter[0];
            const rightEdgeY = center[1] + halfRight[1] - previousCenter[1];
            const rightEdgeZ = center[2] + halfRight[2] - previousCenter[2];
            const leftEdgeX = center[0] - halfRight[0] - previousCenter[0];
            const leftEdgeY = center[1] - halfRight[1] - previousCenter[1];
            const leftEdgeZ = center[2] - halfRight[2] - previousCenter[2];
            const dotRight = previousHalfForward[0] * rightEdgeX + previousHalfForward[1] * rightEdgeY + previousHalfForward[2] * rightEdgeZ;
            const dotLeft = previousHalfForward[0] * leftEdgeX + previousHalfForward[1] * leftEdgeY + previousHalfForward[2] * leftEdgeZ;
            if (dotLeft < 0 && dotRight > 0 || dotLeft > 0 && dotRight < 0) {
                const previousLeftX = previousCenter[0] - previousHalfRight[0];
                const previousLeftY = previousCenter[1] - previousHalfRight[1];
                const previousLeftZ = previousCenter[2] - previousHalfRight[2];
                const previousRightX = previousCenter[0] + previousHalfRight[0];
                const previousRightY = previousCenter[1] + previousHalfRight[1];
                const previousRightZ = previousCenter[2] + previousHalfRight[2];
                if (dotLeft < 0) {
                    halfRight[0] = center[0] - previousLeftX;
                    halfRight[1] = center[1] - previousLeftY;
                    halfRight[2] = center[2] - previousLeftZ;
                } else {
                    halfRight[0] = previousRightX - center[0];
                    halfRight[1] = previousRightY - center[1];
                    halfRight[2] = previousRightZ - center[2];
                }
                size = 2 * Math.hypot(halfRight[0], halfRight[1], halfRight[2]);
                sizeShrink = lastSizeShrink + (sourceSize - lastSizeShrink - size);
                const preferredForwardX = center[0] - previousPoint.position[0];
                const preferredForwardY = center[1] - previousPoint.position[1];
                const preferredForwardZ = center[2] - previousPoint.position[2];
                const rightLengthSquared = $6fafcf15f6b61d60$var$dotVec3(halfRight, halfRight);
                const projection = rightLengthSquared > $6fafcf15f6b61d60$var$EPSILON ? (preferredForwardX * halfRight[0] + preferredForwardY * halfRight[1] + preferredForwardZ * halfRight[2]) / rightLengthSquared : 0;
                halfForward[0] = preferredForwardX - projection * halfRight[0];
                halfForward[1] = preferredForwardY - projection * halfRight[1];
                halfForward[2] = preferredForwardZ - projection * halfRight[2];
                if ($6fafcf15f6b61d60$var$normalizeInPlace(halfForward)) {
                    const forwardScale = 0.5 * Math.hypot(center[0] - previousCenter[0], center[1] - previousCenter[1], center[2] - previousCenter[2]);
                    halfForward[0] *= forwardScale;
                    halfForward[1] *= forwardScale;
                    halfForward[2] *= forwardScale;
                }
            } else sizeShrink = lastSizeShrink - Math.min(lastSizeShrink, moveLength);
        }
        const vertex = solid * 6;
        $6fafcf15f6b61d60$var$writeQuadStripPositionQuad(out.positions, vertex, center, halfForward, halfRight);
        for(let corner = 0; corner < 6; corner += 1)$6fafcf15f6b61d60$var$writeNormal(out.normals, vertex + corner, normal);
        const opacity = $6fafcf15f6b61d60$var$getPressureOpacityMultiplier(out.ribbonSmoothedPressures[pointIndex], pressureOpacityMin, pressureOpacityMax) * descriptorOpacity;
        const trailingOpacity = solid === 0 ? opacity : previousOpacity;
        $6fafcf15f6b61d60$var$writeColor(out.colors, vertex, stroke.color, trailingOpacity);
        $6fafcf15f6b61d60$var$writeColor(out.colors, vertex + 1, stroke.color, trailingOpacity);
        $6fafcf15f6b61d60$var$writeColor(out.colors, vertex + 2, stroke.color, opacity);
        $6fafcf15f6b61d60$var$writeColor(out.colors, vertex + 3, stroke.color, trailingOpacity);
        $6fafcf15f6b61d60$var$writeColor(out.colors, vertex + 4, stroke.color, opacity);
        $6fafcf15f6b61d60$var$writeColor(out.colors, vertex + 5, stroke.color, opacity);
        if (out.uv1Size === 3) $6fafcf15f6b61d60$var$writeQuadStripVectorOffset(out.vectorUvs, vertex, halfRight[0], halfRight[1], halfRight[2]);
        out.ribbonSectionLengths[solid] = size;
        out.quadStripPressuredSizes[pointIndex] = size;
        rawPositions.set(out.positions.subarray(vertex * 3, vertex * 3 + 18), pointIndex * 18);
        rawNormals.set(out.normals.subarray(vertex * 3, vertex * 3 + 18), pointIndex * 18);
        if (isTransientProvisional) continue;
        previousOpacity = opacity;
        $6fafcf15f6b61d60$var$copyVec3(center, previousCenter);
        $6fafcf15f6b61d60$var$copyVec3(halfForward, previousHalfForward);
        $6fafcf15f6b61d60$var$copyVec3(halfRight, previousHalfRight);
        $6fafcf15f6b61d60$var$copyVec3(halfRight, previousRight);
        $6fafcf15f6b61d60$var$normalizeInPlace(previousRight);
        lastSizeShrink = sizeShrink;
        if (generatesNewSolid) $6fafcf15f6b61d60$var$copyVec3(tangent, lastGeneratedFacing);
        sectionSolidCount += 1;
        lastSpawnPointIndex = pointIndex;
        solid += 1;
    }
}
function $6fafcf15f6b61d60$var$writeQuadStripPositionQuad(target, vertex, center, halfForward, halfRight) {
    $6fafcf15f6b61d60$var$writePositionComponents(target, vertex, center[0] - halfForward[0] - halfRight[0], center[1] - halfForward[1] - halfRight[1], center[2] - halfForward[2] - halfRight[2]);
    $6fafcf15f6b61d60$var$writePositionComponents(target, vertex + 1, center[0] - halfForward[0] + halfRight[0], center[1] - halfForward[1] + halfRight[1], center[2] - halfForward[2] + halfRight[2]);
    $6fafcf15f6b61d60$var$writePositionComponents(target, vertex + 2, center[0] + halfForward[0] - halfRight[0], center[1] + halfForward[1] - halfRight[1], center[2] + halfForward[2] - halfRight[2]);
    $6fafcf15f6b61d60$var$copyPosition(target, vertex + 1, vertex + 3);
    $6fafcf15f6b61d60$var$writePositionComponents(target, vertex + 4, center[0] + halfForward[0] + halfRight[0], center[1] + halfForward[1] + halfRight[1], center[2] + halfForward[2] + halfRight[2]);
    $6fafcf15f6b61d60$var$copyPosition(target, vertex + 2, vertex + 5);
}
function $6fafcf15f6b61d60$var$writePositionComponents(target, vertex, x, y, z) {
    const offset = vertex * 3;
    target[offset] = x;
    target[offset + 1] = y;
    target[offset + 2] = z;
}
function $6fafcf15f6b61d60$var$writeQuadStripVectorOffset(target, vertex, halfRightX, halfRightY, halfRightZ) {
    for(let corner = 0; corner < 6; corner += 1){
        const offset = (vertex + corner) * 3;
        const side = $6fafcf15f6b61d60$var$QUAD_STRIP_CORNER_SIDES[corner];
        target[offset] = halfRightX * side;
        target[offset + 1] = halfRightY * side;
        target[offset + 2] = halfRightZ * side;
    }
}
const $6fafcf15f6b61d60$var$QUAD_STRIP_CORNER_SIDES = [
    -1,
    1,
    -1,
    1,
    1,
    -1
];
function $6fafcf15f6b61d60$var$applyQuadStripMidpointFusion(out, stroke, options, breakBefore, pointCount, frontSolidCount, hasBackfaces, generatorClass, tileRate, atlasRows, seed) {
    // Open Brush mutates the newest three solids after every append. Preserve the
    // unsmoothed positions for every accepted input sample because provisional
    // samples temporarily overwrite the mutable leading solid. Starting a
    // detached section also restores the previous committed solid before touching
    // up the end of the old section.
    const rawPositions = out.quadStripRawPositions;
    const rawNormals = out.quadStripRawNormals;
    const provisionalSamples = out.ribbonProvisionalSamples;
    const localBrushSize = $6fafcf15f6b61d60$var$getLocalBrushSize(stroke);
    const pressureSizeMin = $6fafcf15f6b61d60$var$normalizePressureSizeMin(options.pressureSizeRange?.[0]);
    let solid = 0;
    let sectionStart = 0;
    let lastSpawnPointIndex = 0;
    let pendingDistanceTangentStart = -1;
    let pendingDistanceTangentEnd = -1;
    const requestDistanceTangents = (start, end)=>{
        if (pendingDistanceTangentStart >= 0 && pendingDistanceTangentStart !== start) {
            $6fafcf15f6b61d60$var$updateQuadStripSectionTangents(out, pendingDistanceTangentStart, Math.min(pendingDistanceTangentEnd, frontSolidCount));
            pendingDistanceTangentStart = -1;
            pendingDistanceTangentEnd = -1;
        }
        if (pendingDistanceTangentStart < 0) {
            pendingDistanceTangentStart = start;
            pendingDistanceTangentEnd = end;
        } else pendingDistanceTangentEnd = Math.max(pendingDistanceTangentEnd, end);
    };
    for(let segment = 0; segment < pointCount - 1; segment += 1){
        const pointIndex = segment + 1;
        const sectionState = breakBefore[pointIndex];
        const previousSectionStart = sectionStart;
        const isTransientProvisional = sectionState === 2 && provisionalSamples[pointIndex] === 1;
        if (sectionState === 2 && !isTransientProvisional) continue;
        const previousPosition = stroke.controlPoints[lastSpawnPointIndex].position;
        const position = stroke.controlPoints[pointIndex].position;
        const moveLength = Math.hypot(position[0] - previousPosition[0], position[1] - previousPosition[1], position[2] - previousPosition[2]);
        const sourceSize = localBrushSize * $6fafcf15f6b61d60$var$getPressureSizeMultiplier(out.ribbonSmoothedPressures[pointIndex], pressureSizeMin);
        const generatesNewSolid = moveLength >= 0.0015 + sourceSize * 0.2;
        if (sectionState === 1) {
            if (generatorClass === "QuadStripBrushDistanceUV") {
                // Open Brush finalizes the old section before AppendLeadingQuad restores
                // and re-fuses its last solid. Its endpoint alpha therefore reflects the
                // geometry immediately before the detached section begins.
                $6fafcf15f6b61d60$var$updateQuadStripDistanceUvsForAppend(out, sectionStart, solid, out.quadStripPressuredSizes[pointIndex], tileRate, atlasRows, seed, hasBackfaces);
                $6fafcf15f6b61d60$var$applyQuadStripSectionOpacityFade(out, sectionStart, solid);
                requestDistanceTangents(sectionStart, solid);
            }
            const previousSectionLength = solid - sectionStart;
            if (solid > 0) {
                $6fafcf15f6b61d60$var$restoreRawQuadStripSolidPositions(out.positions, rawPositions, solid - 1, lastSpawnPointIndex);
                if (solid + 1 > 2 && previousSectionLength > 1) $6fafcf15f6b61d60$var$fuseQuadStripSolids(out, solid - 2, solid - 1, generatesNewSolid);
                else if (previousSectionLength === 1 && generatesNewSolid) $6fafcf15f6b61d60$var$squashRawQuadStripSolid(out.positions, rawPositions, solid - 1, lastSpawnPointIndex);
            }
            sectionStart = solid;
        }
        $6fafcf15f6b61d60$var$restoreRawQuadStripSolidPositions(out.positions, rawPositions, solid, pointIndex);
        $6fafcf15f6b61d60$var$restoreRawQuadStripSolidPositions(out.normals, rawNormals, solid, pointIndex);
        const sectionLength = solid - sectionStart + 1;
        if (sectionLength === 2) $6fafcf15f6b61d60$var$fuseQuadStripSolids(out, solid - 1, solid, generatesNewSolid);
        else if (sectionLength > 2) {
            $6fafcf15f6b61d60$var$averageQuadStripSolid(out, solid - 2, solid - 1, solid);
            $6fafcf15f6b61d60$var$fuseQuadStripSolids(out, solid - 2, solid - 1, generatesNewSolid);
            $6fafcf15f6b61d60$var$fuseQuadStripSolids(out, solid - 1, solid, generatesNewSolid);
        }
        if (generatorClass === "QuadStripBrushDistanceUV") {
            $6fafcf15f6b61d60$var$updateQuadStripDistanceUvsForAppend(out, sectionStart, solid + 1, out.quadStripPressuredSizes[pointIndex], tileRate, atlasRows, seed, hasBackfaces);
            $6fafcf15f6b61d60$var$applyQuadStripSectionOpacityFade(out, sectionStart, solid + 1);
            // DistanceUV unions requests for one section and flushes them when a new
            // section starts. A transient leading solid can extend that request past
            // the committed section boundary.
            requestDistanceTangents(sectionStart, solid + 1);
        } else if (generatorClass === "QuadStripUnitizedUVBrush" && sectionState === 1) // The break update computes the completed section together with the new
        // leading solid. Capture those tangents now: later smoothing in the new
        // section moves that solid, but does not revisit the old section.
        $6fafcf15f6b61d60$var$updateQuadStripSectionTangents(out, previousSectionStart, Math.min(solid + 1, frontSolidCount));
        if (isTransientProvisional) continue;
        if (generatesNewSolid) lastSpawnPointIndex = pointIndex;
        solid += 1;
    }
    if (generatorClass === "QuadStripBrushStretchUV") $6fafcf15f6b61d60$var$applyQuadStripStretchUvs(out, breakBefore, pointCount, atlasRows, seed, hasBackfaces);
    if (generatorClass === "QuadStripBrushDistanceUV") {
        if (pendingDistanceTangentStart >= 0) $6fafcf15f6b61d60$var$updateQuadStripSectionTangents(out, pendingDistanceTangentStart, Math.min(pendingDistanceTangentEnd, frontSolidCount));
    } else if (generatorClass === "QuadStripUnitizedUVBrush") $6fafcf15f6b61d60$var$updateQuadStripSectionTangents(out, sectionStart, frontSolidCount);
    else $6fafcf15f6b61d60$var$updateQuadStripTangents(out, breakBefore, pointCount, frontSolidCount);
    if (hasBackfaces) {
        const backVertexOffset = frontSolidCount * 6;
        const reverse = [
            0,
            2,
            1,
            3,
            5,
            4
        ];
        for(let frontSolid = 0; frontSolid < frontSolidCount; frontSolid += 1){
            const frontVertex = frontSolid * 6;
            const backVertex = backVertexOffset + frontVertex;
            for(let corner = 0; corner < 6; corner += 1){
                $6fafcf15f6b61d60$var$copyPosition(out.positions, frontVertex + reverse[corner], backVertex + corner);
                $6fafcf15f6b61d60$var$copyNegatedNormal(out.normals, frontVertex + reverse[corner], backVertex + corner);
                $6fafcf15f6b61d60$var$copyTangent(out.tangents, frontVertex + reverse[corner], backVertex + corner, true);
                $6fafcf15f6b61d60$var$copyUv(out.uvs, frontVertex + reverse[corner], backVertex + corner);
                out.colors[(backVertex + corner) * 4 + 3] = out.colors[(frontVertex + reverse[corner]) * 4 + 3];
                if (out.uv1Size === 3) $6fafcf15f6b61d60$var$copyVec3At(out.vectorUvs, frontVertex + reverse[corner], backVertex + corner);
            }
        }
    }
    $6fafcf15f6b61d60$var$resetBounds(out.bounds);
    const vertexCount = frontSolidCount * 6 * (hasBackfaces ? 2 : 1);
    for(let vertex = 0; vertex < vertexCount; vertex += 1)$6fafcf15f6b61d60$var$includeBounds(out.bounds, out.positions, vertex);
}
function $6fafcf15f6b61d60$var$restoreRawQuadStripSolidPositions(positions, rawPositions, solid, pointIndex) {
    const destination = solid * 18;
    const source = pointIndex * 18;
    positions.set(rawPositions.subarray(source, source + 18), destination);
}
function $6fafcf15f6b61d60$var$squashRawQuadStripSolid(positions, rawPositions, solid, pointIndex) {
    const vertex = solid * 6;
    const firstOffset = pointIndex * 18;
    const oppositeOffset = firstOffset + 12;
    const centerX = (rawPositions[firstOffset] + rawPositions[oppositeOffset]) * 0.5;
    const centerY = (rawPositions[firstOffset + 1] + rawPositions[oppositeOffset + 1]) * 0.5;
    const centerZ = (rawPositions[firstOffset + 2] + rawPositions[oppositeOffset + 2]) * 0.5;
    for(let corner = 0; corner < 6; corner += 1)$6fafcf15f6b61d60$var$writePositionComponents(positions, vertex + corner, centerX, centerY, centerZ);
}
function $6fafcf15f6b61d60$var$applyQuadStripStretchUvs(out, breakBefore, pointCount, atlasRows, seed, hasBackfaces) {
    let sectionStart = 0;
    let solid = 0;
    for(let segment = 0; segment < pointCount - 1; segment += 1){
        const sectionState = breakBefore[segment + 1];
        if (sectionState === 2) continue;
        if (sectionState === 1) {
            $6fafcf15f6b61d60$var$applyQuadStripStretchUvSection(out, sectionStart, solid, atlasRows, seed, hasBackfaces);
            sectionStart = solid;
        }
        solid += 1;
    }
    $6fafcf15f6b61d60$var$applyQuadStripStretchUvSection(out, sectionStart, solid, atlasRows, seed, hasBackfaces);
}
function $6fafcf15f6b61d60$var$updateQuadStripDistanceUvsForAppend(out, sectionStart, sectionEnd, pressuredSize, tileRate, atlasRows, seed, hasBackfaces) {
    const firstUpdatedSolid = Math.max(sectionStart, sectionEnd - 3);
    const size = Math.max(pressuredSize, $6fafcf15f6b61d60$var$EPSILON);
    for(let solid = firstUpdatedSolid; solid < sectionEnd; solid += 1){
        const vertex = solid * 6;
        let previousU;
        let previousV0;
        let previousV1;
        if (solid === sectionStart) {
            const stride = hasBackfaces ? 12 : 6;
            const random = $6fafcf15f6b61d60$var$statelessRandom01(seed, sectionStart * stride);
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
        const nextU = previousU + tileRate * $6fafcf15f6b61d60$var$getQuadStripSolidLength(out.positions, solid) / size;
        $6fafcf15f6b61d60$var$writeQuadStripUvQuad(out.uvs, vertex, previousU, nextU, previousV0, previousV1);
    }
}
function $6fafcf15f6b61d60$var$applyQuadStripStretchUvSection(out, firstSolid, endSolid, atlasRows, seed, hasBackfaces) {
    let sectionLength = 0;
    for(let solid = firstSolid; solid < endSolid; solid += 1)sectionLength += $6fafcf15f6b61d60$var$getQuadStripSolidLength(out.positions, solid);
    if (sectionLength <= $6fafcf15f6b61d60$var$EPSILON) sectionLength = 1;
    let runningLength = 0;
    const quadsPerSolid = hasBackfaces ? 2 : 1;
    const random = $6fafcf15f6b61d60$var$statelessRandom01(seed, firstSolid * quadsPerSolid * 6);
    const atlasRow = Math.floor(random * atlasRows);
    const v0 = atlasRow / atlasRows;
    const v1 = (atlasRow + 1) / atlasRows;
    for(let solid = firstSolid; solid < endSolid; solid += 1){
        const solidLength = $6fafcf15f6b61d60$var$getQuadStripSolidLength(out.positions, solid);
        const startU = runningLength / sectionLength;
        runningLength += solidLength;
        const endU = runningLength / sectionLength;
        const vertex = solid * 6;
        $6fafcf15f6b61d60$var$writeQuadStripUvQuad(out.uvs, vertex, startU, endU, v0, v1);
    }
}
function $6fafcf15f6b61d60$var$writeQuadStripUvQuad(uvs, vertex, previousU, nextU, v0, v1) {
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
function $6fafcf15f6b61d60$var$updateQuadStripTangents(out, breakBefore, pointCount, solidCount) {
    let sectionStart = 0;
    let solid = 0;
    for(let segment = 0; segment < pointCount - 1; segment += 1){
        const sectionState = breakBefore[segment + 1];
        if (sectionState === 2) continue;
        if (sectionState === 1) {
            $6fafcf15f6b61d60$var$updateQuadStripSectionTangents(out, sectionStart, solid);
            sectionStart = solid;
        }
        solid += 1;
    }
    $6fafcf15f6b61d60$var$updateQuadStripSectionTangents(out, sectionStart, Math.min(solid, solidCount));
}
/** Port of BaseBrushScript.ComputeTangentSpaceForQuads for canonical Three winding. */ function $6fafcf15f6b61d60$var$updateQuadStripSectionTangents(out, firstSolid, endSolid) {
    const surfaceTangent = [
        0,
        0,
        0
    ];
    const surfaceBitangent = [
        0,
        0,
        0
    ];
    const normal = [
        0,
        0,
        0
    ];
    const normalCrossTangent = [
        0,
        0,
        0
    ];
    let handedness = 1;
    for(let solid = firstSolid; solid < endSolid; solid += 1){
        const vertex = solid * 6;
        // Open Brush computes S/T from source corners 0,1,2. After reflecting to
        // Three and canonicalizing winding, those records are corners 0,2,1.
        $6fafcf15f6b61d60$var$computeTriangleSurfaceTangent(out.positions, out.uvs, vertex, vertex + 2, vertex + 1, surfaceTangent);
        if (solid === firstSolid) {
            $6fafcf15f6b61d60$var$computeTriangleSurfaceBitangent(out.positions, out.uvs, vertex, vertex + 2, vertex + 1, surfaceBitangent);
            const normalOffset = vertex * 3;
            normal[0] = out.normals[normalOffset];
            normal[1] = out.normals[normalOffset + 1];
            normal[2] = out.normals[normalOffset + 2];
            $6fafcf15f6b61d60$var$cross(normal, surfaceTangent, normalCrossTangent);
            // Unity-to-Three reflection reverses tangent-space handedness.
            handedness = $6fafcf15f6b61d60$var$dot(normalCrossTangent, surfaceBitangent) < 0 ? 1 : -1;
        } else handedness = out.tangents[(vertex - 6) * 4 + 3];
        $6fafcf15f6b61d60$var$writeOrthonormalTangent(out.tangents, out.normals, vertex, surfaceTangent, handedness);
        $6fafcf15f6b61d60$var$writeOrthonormalTangent(out.tangents, out.normals, vertex + 1, surfaceTangent, handedness);
        $6fafcf15f6b61d60$var$copyVec4At(out.tangents, vertex + 1, vertex + 3);
        if (solid > firstSolid) {
            const previousVertex = vertex - 6;
            $6fafcf15f6b61d60$var$copyVec4At(out.tangents, vertex, previousVertex + 2);
            $6fafcf15f6b61d60$var$copyVec4At(out.tangents, vertex, previousVertex + 5);
            $6fafcf15f6b61d60$var$copyVec4At(out.tangents, vertex + 1, previousVertex + 4);
        }
        if (solid + 1 === endSolid) {
            $6fafcf15f6b61d60$var$writeOrthonormalTangent(out.tangents, out.normals, vertex + 2, surfaceTangent, handedness);
            $6fafcf15f6b61d60$var$copyVec4At(out.tangents, vertex + 2, vertex + 5);
            $6fafcf15f6b61d60$var$writeOrthonormalTangent(out.tangents, out.normals, vertex + 4, surfaceTangent, handedness);
        }
    }
}
function $6fafcf15f6b61d60$var$applyQuadStripSectionOpacityFade(out, firstSolid, endSolid) {
    let distanceFromLeadingEdge = 0;
    for(let solid = endSolid - 1; solid >= firstSolid; solid -= 1){
        const leadingAlpha = $6fafcf15f6b61d60$var$quantizeColorByte(Math.min(1, distanceFromLeadingEdge / $6fafcf15f6b61d60$var$QUAD_STRIP_OPACITY_FADE_METERS));
        distanceFromLeadingEdge += $6fafcf15f6b61d60$var$getQuadStripSolidLength(out.positions, solid);
        const trailingAlpha = solid === firstSolid ? 0 : $6fafcf15f6b61d60$var$quantizeColorByte(Math.min(1, distanceFromLeadingEdge / $6fafcf15f6b61d60$var$QUAD_STRIP_OPACITY_FADE_METERS));
        const vertex = solid * 6;
        out.colors[vertex * 4 + 3] = trailingAlpha;
        out.colors[(vertex + 1) * 4 + 3] = trailingAlpha;
        out.colors[(vertex + 3) * 4 + 3] = trailingAlpha;
        out.colors[(vertex + 2) * 4 + 3] = leadingAlpha;
        out.colors[(vertex + 4) * 4 + 3] = leadingAlpha;
        out.colors[(vertex + 5) * 4 + 3] = leadingAlpha;
    }
}
function $6fafcf15f6b61d60$var$getQuadStripSolidLength(positions, solid) {
    const vertex = solid * 6;
    return ($6fafcf15f6b61d60$var$distanceBetweenPositionVertices(positions, vertex, vertex + 2) + $6fafcf15f6b61d60$var$distanceBetweenPositionVertices(positions, vertex + 3, vertex + 4)) * 0.5;
}
function $6fafcf15f6b61d60$var$distanceBetweenPositionVertices(positions, firstVertex, secondVertex) {
    const first = firstVertex * 3;
    const second = secondVertex * 3;
    return Math.hypot(positions[second] - positions[first], positions[second + 1] - positions[first + 1], positions[second + 2] - positions[first + 2]);
}
function $6fafcf15f6b61d60$var$quantizeColorByte(value) {
    return Math.floor(value * 255) / 255;
}
const $6fafcf15f6b61d60$var$QUAD_STRIP_OPACITY_FADE_METERS = 0.025;
function $6fafcf15f6b61d60$var$averageQuadStripSolid(out, backSolid, middleSolid, frontSolid) {
    const backVertex = backSolid * 6;
    const middleVertex = middleSolid * 6;
    const frontVertex = frontSolid * 6;
    for(let corner = 0; corner < 6; corner += 1){
        const backOffset = (backVertex + corner) * 3;
        const middleOffset = (middleVertex + corner) * 3;
        const frontOffset = (frontVertex + corner) * 3;
        out.positions[middleOffset] = (out.positions[backOffset] + out.positions[frontOffset]) * 0.5;
        out.positions[middleOffset + 1] = (out.positions[backOffset + 1] + out.positions[frontOffset + 1]) * 0.5;
        out.positions[middleOffset + 2] = (out.positions[backOffset + 2] + out.positions[frontOffset + 2]) * 0.5;
    }
}
function $6fafcf15f6b61d60$var$fuseQuadStripSolids(out, backSolid, frontSolid, alterBackSolid = true) {
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
        if (normalLength > $6fafcf15f6b61d60$var$EPSILON) {
            nx /= normalLength;
            ny /= normalLength;
            nz /= normalLength;
        } else {
            nx = out.normals[backNormalOffset];
            ny = out.normals[backNormalOffset + 1];
            nz = out.normals[backNormalOffset + 2];
        }
    }
    $6fafcf15f6b61d60$var$fuseQuadStripEdge(out, backVertex, frontVertex, 2, 0, nx, ny, nz, alterBackSolid);
    $6fafcf15f6b61d60$var$fuseQuadStripEdge(out, backVertex, frontVertex, 4, 1, nx, ny, nz, alterBackSolid);
    $6fafcf15f6b61d60$var$copyPosition(out.positions, backVertex + 2, backVertex + 5);
    $6fafcf15f6b61d60$var$copyPosition(out.positions, frontVertex + 1, frontVertex + 3);
    $6fafcf15f6b61d60$var$copyVec3At(out.normals, backVertex + 2, backVertex + 5);
    $6fafcf15f6b61d60$var$copyVec3At(out.normals, frontVertex + 1, frontVertex + 3);
}
function $6fafcf15f6b61d60$var$fuseQuadStripEdge(out, backVertex, frontVertex, backCorner, frontCorner, nx, ny, nz, alterBackVertex) {
    const backOffset = (backVertex + backCorner) * 3;
    const frontOffset = (frontVertex + frontCorner) * 3;
    const x = alterBackVertex ? (out.positions[backOffset] + out.positions[frontOffset]) * 0.5 : out.positions[backOffset];
    const y = alterBackVertex ? (out.positions[backOffset + 1] + out.positions[frontOffset + 1]) * 0.5 : out.positions[backOffset + 1];
    const z = alterBackVertex ? (out.positions[backOffset + 2] + out.positions[frontOffset + 2]) * 0.5 : out.positions[backOffset + 2];
    if (alterBackVertex) $6fafcf15f6b61d60$var$writeQuadStripFusedCorner(out, backVertex + backCorner, x, y, z, nx, ny, nz);
    $6fafcf15f6b61d60$var$writeQuadStripFusedCorner(out, frontVertex + frontCorner, x, y, z, nx, ny, nz);
}
function $6fafcf15f6b61d60$var$writeQuadStripFusedCorner(out, vertex, x, y, z, nx, ny, nz) {
    const offset = vertex * 3;
    out.positions[offset] = x;
    out.positions[offset + 1] = y;
    out.positions[offset + 2] = z;
    out.normals[offset] = nx;
    out.normals[offset + 1] = ny;
    out.normals[offset + 2] = nz;
}
function $6fafcf15f6b61d60$var$smoothFlatGeometryEdges(stroke, positions, halfRights, breakBefore, smoothedPressures, previousRetained, nextRetained, localBrushSize, pressureSizeMin, bounds, pointCount) {
    $6fafcf15f6b61d60$var$resetBounds(bounds);
    for(let index = 1; index < pointCount; index += 1){
        if (breakBefore[index] !== 0) continue;
        const previousIndex = previousRetained[index];
        const nextIndex = nextRetained[index];
        const startsSection = previousIndex === 0 || breakBefore[previousIndex] === 1;
        const endsSection = nextIndex === index || breakBefore[nextIndex] === 1;
        const point = stroke.controlPoints[index].position;
        const previous = stroke.controlPoints[previousIndex].position;
        const next = stroke.controlPoints[nextIndex].position;
        const center = [
            previous[0] * 0.3 + point[0] * 0.4 + next[0] * 0.3,
            previous[1] * 0.3 + point[1] * 0.4 + next[1] * 0.3,
            previous[2] * 0.3 + point[2] * 0.4 + next[2] * 0.3
        ];
        const currentOffset = index * 3;
        let rightX = halfRights[currentOffset];
        let rightY = halfRights[currentOffset + 1];
        let rightZ = halfRights[currentOffset + 2];
        if (!endsSection) {
            const previousOffset = previousIndex * 3;
            const nextOffset = nextIndex * 3;
            const previousRightX = previousIndex === 0 ? halfRights[currentOffset] : halfRights[previousOffset];
            const previousRightY = previousIndex === 0 ? halfRights[currentOffset + 1] : halfRights[previousOffset + 1];
            const previousRightZ = previousIndex === 0 ? halfRights[currentOffset + 2] : halfRights[previousOffset + 2];
            rightX = previousRightX * 0.3 + halfRights[currentOffset] * 0.4 + halfRights[nextOffset] * 0.3;
            rightY = previousRightY * 0.3 + halfRights[currentOffset + 1] * 0.4 + halfRights[nextOffset + 1] * 0.3;
            rightZ = previousRightZ * 0.3 + halfRights[currentOffset + 2] * 0.4 + halfRights[nextOffset + 2] * 0.3;
        }
        if (startsSection) {
            const currentLength = Math.hypot(halfRights[currentOffset], halfRights[currentOffset + 1], halfRights[currentOffset + 2]);
            const previousHalfSize = localBrushSize * $6fafcf15f6b61d60$var$getPressureSizeMultiplier(smoothedPressures[previousIndex], pressureSizeMin) * 0.5;
            const scale = currentLength > $6fafcf15f6b61d60$var$EPSILON ? previousHalfSize / currentLength : 0;
            const previousRightX = halfRights[currentOffset] * scale;
            const previousRightY = halfRights[currentOffset + 1] * scale;
            const previousRightZ = halfRights[currentOffset + 2] * scale;
            const previousLeftVertex = previousIndex * 2;
            const previousRightVertex = previousLeftVertex + 1;
            $6fafcf15f6b61d60$var$writePosition(positions, previousLeftVertex, [
                previous[0] - previousRightX,
                previous[1] - previousRightY,
                previous[2] - previousRightZ
            ]);
            $6fafcf15f6b61d60$var$writePosition(positions, previousRightVertex, [
                previous[0] + previousRightX,
                previous[1] + previousRightY,
                previous[2] + previousRightZ
            ]);
            $6fafcf15f6b61d60$var$includeBounds(bounds, positions, previousLeftVertex);
            $6fafcf15f6b61d60$var$includeBounds(bounds, positions, previousRightVertex);
        }
        const leftVertex = index * 2;
        const rightVertex = leftVertex + 1;
        $6fafcf15f6b61d60$var$writePosition(positions, leftVertex, [
            center[0] - rightX,
            center[1] - rightY,
            center[2] - rightZ
        ]);
        $6fafcf15f6b61d60$var$writePosition(positions, rightVertex, [
            center[0] + rightX,
            center[1] + rightY,
            center[2] + rightZ
        ]);
        $6fafcf15f6b61d60$var$includeBounds(bounds, positions, leftVertex);
        $6fafcf15f6b61d60$var$includeBounds(bounds, positions, rightVertex);
    }
}
function $6fafcf15f6b61d60$var$updateFlatGeometryTangents(positions, normals, tangents, uvs, breakBefore, pointCount) {
    const firstTriangle = [
        0,
        0,
        0
    ];
    const secondTriangle = [
        0,
        0,
        0
    ];
    const combined = [
        0,
        0,
        0
    ];
    let previousPoint = 0;
    let previousHasGeometry = false;
    for(let currentPoint = 1; currentPoint < pointCount; currentPoint += 1){
        if (breakBefore[currentPoint] === 2) continue;
        if (breakBefore[currentPoint] === 1) {
            previousPoint = currentPoint;
            previousHasGeometry = false;
            continue;
        }
        const leftPrevious = previousPoint * 2;
        const rightPrevious = leftPrevious + 1;
        const leftCurrent = currentPoint * 2;
        const rightCurrent = leftCurrent + 1;
        $6fafcf15f6b61d60$var$computeTriangleSurfaceTangent(positions, uvs, rightPrevious, leftPrevious, leftCurrent, firstTriangle);
        $6fafcf15f6b61d60$var$computeTriangleSurfaceTangent(positions, uvs, rightPrevious, leftCurrent, rightCurrent, secondTriangle);
        combined[0] = firstTriangle[0] + secondTriangle[0];
        combined[1] = firstTriangle[1] + secondTriangle[1];
        combined[2] = firstTriangle[2] + secondTriangle[2];
        if (!previousHasGeometry) {
            $6fafcf15f6b61d60$var$writeOrthonormalTangent(tangents, normals, leftPrevious, combined);
            $6fafcf15f6b61d60$var$writeOrthonormalTangent(tangents, normals, rightPrevious, secondTriangle);
        }
        $6fafcf15f6b61d60$var$writeOrthonormalTangent(tangents, normals, leftCurrent, firstTriangle);
        $6fafcf15f6b61d60$var$writeOrthonormalTangent(tangents, normals, rightCurrent, combined);
        previousPoint = currentPoint;
        previousHasGeometry = true;
    }
}
function $6fafcf15f6b61d60$var$computeTriangleSurfaceTangent(positions, uvs, first, second, third, out) {
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
    if (Math.abs(determinant) <= $6fafcf15f6b61d60$var$EPSILON) {
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
function $6fafcf15f6b61d60$var$computeTriangleSurfaceBitangent(positions, uvs, first, second, third, out) {
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
    if (Math.abs(determinant) <= $6fafcf15f6b61d60$var$EPSILON) {
        out[0] = x1;
        out[1] = y1;
        out[2] = z1;
        return;
    }
    const reciprocal = 1 / determinant;
    out[0] = reciprocal * (s1 * x2 - s2 * x1);
    out[1] = reciprocal * (s1 * y2 - s2 * y1);
    out[2] = reciprocal * (s1 * z2 - s2 * z1);
}
function $6fafcf15f6b61d60$var$writeOrthonormalTangent(tangents, normals, vertex, source, handedness = 1) {
    const normalOffset = vertex * 3;
    const projection = source[0] * normals[normalOffset] + source[1] * normals[normalOffset + 1] + source[2] * normals[normalOffset + 2];
    let x = source[0] - projection * normals[normalOffset];
    let y = source[1] - projection * normals[normalOffset + 1];
    let z = source[2] - projection * normals[normalOffset + 2];
    const length = Math.sqrt(x * x + y * y + z * z);
    if (length > $6fafcf15f6b61d60$var$EPSILON) {
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
    tangents[tangentOffset + 3] = handedness;
}
function $6fafcf15f6b61d60$var$generateUnitizedRibbonGeometry(stroke, family, options, out) {
    out.uv0Size = 2;
    out.uv1Size = 0;
    const pointCount = stroke.controlPoints.length;
    $6fafcf15f6b61d60$var$prepareQuadStripSections(stroke, options, out);
    const rawSegmentCount = Math.max(0, pointCount - 1);
    const segmentCount = $6fafcf15f6b61d60$var$countConnectedRibbonSegments(out.ribbonBreakBefore, pointCount, true);
    const sourceFrontVertexCount = rawSegmentCount * 4;
    const frontIndexCount = segmentCount * 6;
    const hasBackfaces = options.geometryParams?.renderBackfaces === true;
    const sourceVertexCount = sourceFrontVertexCount * (hasBackfaces ? 2 : 1);
    const vertexCount = frontIndexCount * (hasBackfaces ? 2 : 1);
    const indexCount = frontIndexCount * (hasBackfaces ? 2 : 1);
    const reallocated = $6fafcf15f6b61d60$var$ensureGeometryCapacity(out, vertexCount + sourceVertexCount, indexCount);
    const { positions: positions, normals: normals, tangents: tangents, colors: colors, uvs: uvs, indices: indices, bounds: bounds, ribbonSmoothedPressures: ribbonSmoothedPressures } = out;
    const pressureSizeMin = $6fafcf15f6b61d60$var$normalizePressureSizeMin(options.pressureSizeRange?.[0]);
    const pressureOpacityMin = $6fafcf15f6b61d60$var$normalizePressureOpacityMin(options.pressureOpacityRange);
    const pressureOpacityMax = $6fafcf15f6b61d60$var$normalizePressureOpacityMax(options.pressureOpacityRange);
    const descriptorOpacity = $6fafcf15f6b61d60$var$normalizeDescriptorOpacity(options.geometryParams?.opacity);
    const localBrushSize = $6fafcf15f6b61d60$var$getLocalBrushSize(stroke);
    const previousFrameRight = [
        0,
        0,
        0
    ];
    const previousFallbackTangent = [
        0,
        0,
        0
    ];
    const tangent = [
        0,
        0,
        0
    ];
    const pointerForward = [
        0,
        0,
        0
    ];
    const pointerUp = [
        0,
        0,
        0
    ];
    const right = [
        0,
        0,
        0
    ];
    const normal = [
        0,
        0,
        0
    ];
    const leftPosition = [
        0,
        0,
        0
    ];
    const rightPosition = [
        0,
        0,
        0
    ];
    const previousLeftPosition = [
        0,
        0,
        0
    ];
    const previousRightPosition = [
        0,
        0,
        0
    ];
    const previousNormal = [
        0,
        0,
        0
    ];
    const previousVertexTangent = [
        0,
        0,
        0
    ];
    let previousOpacity = 1;
    for(let pointIndex = 0; pointIndex < pointCount; pointIndex += 1){
        const point = stroke.controlPoints[pointIndex];
        const width = localBrushSize * $6fafcf15f6b61d60$var$getPressureSizeMultiplier(ribbonSmoothedPressures[pointIndex], pressureSizeMin) * 0.5;
        const opacity = $6fafcf15f6b61d60$var$getPressureOpacityMultiplier(ribbonSmoothedPressures[pointIndex], pressureOpacityMin, pressureOpacityMax) * descriptorOpacity;
        $6fafcf15f6b61d60$var$writeCentralDifferenceTangent(stroke, pointIndex, previousFallbackTangent, tangent);
        $6fafcf15f6b61d60$var$rotateByQuaternion(point.orientation, $6fafcf15f6b61d60$var$VEC_FORWARD, pointerForward);
        $6fafcf15f6b61d60$var$rotateByQuaternion(point.orientation, $6fafcf15f6b61d60$var$VEC_UP, pointerUp);
        $6fafcf15f6b61d60$var$computeSurfaceFrame(previousFrameRight, tangent, pointerForward, pointerUp, pointIndex === 0, right, normal);
        leftPosition[0] = point.position[0] - right[0] * width;
        leftPosition[1] = point.position[1] - right[1] * width;
        leftPosition[2] = point.position[2] - right[2] * width;
        rightPosition[0] = point.position[0] + right[0] * width;
        rightPosition[1] = point.position[1] + right[1] * width;
        rightPosition[2] = point.position[2] + right[2] * width;
        if (pointIndex > 0) {
            const vertex = (pointIndex - 1) * 4;
            $6fafcf15f6b61d60$var$writePosition(positions, vertex, previousLeftPosition);
            $6fafcf15f6b61d60$var$writePosition(positions, vertex + 1, previousRightPosition);
            $6fafcf15f6b61d60$var$writePosition(positions, vertex + 2, leftPosition);
            $6fafcf15f6b61d60$var$writePosition(positions, vertex + 3, rightPosition);
            $6fafcf15f6b61d60$var$writeNormal(normals, vertex, previousNormal);
            $6fafcf15f6b61d60$var$writeNormal(normals, vertex + 1, previousNormal);
            $6fafcf15f6b61d60$var$writeNormal(normals, vertex + 2, normal);
            $6fafcf15f6b61d60$var$writeNormal(normals, vertex + 3, normal);
            $6fafcf15f6b61d60$var$writeTangent(tangents, vertex, previousVertexTangent, 1);
            $6fafcf15f6b61d60$var$writeTangent(tangents, vertex + 1, previousVertexTangent, 1);
            $6fafcf15f6b61d60$var$writeTangent(tangents, vertex + 2, tangent, 1);
            $6fafcf15f6b61d60$var$writeTangent(tangents, vertex + 3, tangent, 1);
            $6fafcf15f6b61d60$var$writeColor(colors, vertex, stroke.color, previousOpacity);
            $6fafcf15f6b61d60$var$writeColor(colors, vertex + 1, stroke.color, previousOpacity);
            $6fafcf15f6b61d60$var$writeColor(colors, vertex + 2, stroke.color, opacity);
            $6fafcf15f6b61d60$var$writeColor(colors, vertex + 3, stroke.color, opacity);
            $6fafcf15f6b61d60$var$writeUv(uvs, vertex, [
                0,
                0
            ]);
            $6fafcf15f6b61d60$var$writeUv(uvs, vertex + 1, [
                0,
                1
            ]);
            $6fafcf15f6b61d60$var$writeUv(uvs, vertex + 2, [
                1,
                0
            ]);
            $6fafcf15f6b61d60$var$writeUv(uvs, vertex + 3, [
                1,
                1
            ]);
            for(let offset = 0; offset < 4; offset += 1)$6fafcf15f6b61d60$var$includeBounds(bounds, positions, vertex + offset);
            const indexOffset = (pointIndex - 1) * 6;
            indices[indexOffset] = vertex;
            indices[indexOffset + 1] = vertex + 2;
            indices[indexOffset + 2] = vertex + 1;
            indices[indexOffset + 3] = vertex + 1;
            indices[indexOffset + 4] = vertex + 2;
            indices[indexOffset + 5] = vertex + 3;
        }
        $6fafcf15f6b61d60$var$copyVec3(leftPosition, previousLeftPosition);
        $6fafcf15f6b61d60$var$copyVec3(rightPosition, previousRightPosition);
        $6fafcf15f6b61d60$var$copyVec3(normal, previousNormal);
        $6fafcf15f6b61d60$var$copyVec3(tangent, previousVertexTangent);
        $6fafcf15f6b61d60$var$copyVec3(right, previousFrameRight);
        $6fafcf15f6b61d60$var$copyVec3(tangent, previousFallbackTangent);
        previousOpacity = opacity;
    }
    if (hasBackfaces) {
        const backfaceColor = $6fafcf15f6b61d60$var$shiftHue(stroke.color, $6fafcf15f6b61d60$var$normalizeHueShift(options.geometryParams?.backfaceHueShift));
        for(let vertex = 0; vertex < sourceFrontVertexCount; vertex += 1){
            const backVertex = sourceFrontVertexCount + vertex;
            $6fafcf15f6b61d60$var$copyPosition(positions, vertex, backVertex);
            $6fafcf15f6b61d60$var$copyNegatedNormal(normals, vertex, backVertex);
            $6fafcf15f6b61d60$var$copyTangent(tangents, vertex, backVertex, true);
            $6fafcf15f6b61d60$var$copyUv(uvs, vertex, backVertex);
            $6fafcf15f6b61d60$var$writeColorFromAlpha(colors, backVertex, backfaceColor, colors[vertex * 4 + 3]);
        }
        for(let segment = 0; segment < segmentCount; segment += 1){
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
    $6fafcf15f6b61d60$var$expandUnitizedRibbonTriangleSoup(out, segmentCount, sourceFrontVertexCount, frontIndexCount, hasBackfaces, vertexCount);
    $6fafcf15f6b61d60$var$applyQuadStripPositionQuads(out, stroke, options, out.ribbonBreakBefore, pointCount);
    const unitizedUvs = [
        0,
        0,
        0,
        1,
        1,
        0,
        0,
        1,
        1,
        1,
        1,
        0
    ];
    for(let solid = 0; solid < segmentCount; solid += 1)out.uvs.set(unitizedUvs, solid * 12);
    $6fafcf15f6b61d60$var$applyQuadStripMidpointFusion(out, stroke, options, out.ribbonBreakBefore, pointCount, segmentCount, hasBackfaces, options.generatorClass, $6fafcf15f6b61d60$var$normalizeTileRate(options.geometryParams?.tileRate), $6fafcf15f6b61d60$var$normalizeAtlasRows(options.geometryParams?.textureAtlasV), stroke.seed);
    const finalizedCounts = $6fafcf15f6b61d60$var$finalizeQuadStripUsedGeometry(out, out.ribbonBreakBefore, pointCount, segmentCount, hasBackfaces, options);
    out.family = family;
    out.vertexCount = finalizedCounts?.vertexCount ?? vertexCount;
    out.indexCount = finalizedCounts?.indexCount ?? indexCount;
    if (hasBackfaces && out.vertexCount > 0) $6fafcf15f6b61d60$var$interleaveQuadStripBackfaces(out, out.vertexCount / 12);
    $6fafcf15f6b61d60$var$resetBounds(out.bounds);
    for(let vertex = 0; vertex < out.vertexCount; vertex += 1)$6fafcf15f6b61d60$var$includeBounds(out.bounds, out.positions, vertex);
    return reallocated;
}
function $6fafcf15f6b61d60$var$expandUnitizedRibbonTriangleSoup(out, segmentCount, sourceFrontVertexCount, frontVertexCount, hasBackfaces, finalVertexCount) {
    const sourceOffset = finalVertexCount;
    const sourceVertexCount = sourceFrontVertexCount * (hasBackfaces ? 2 : 1);
    for(let vertex = sourceVertexCount - 1; vertex >= 0; vertex -= 1)$6fafcf15f6b61d60$var$copyRibbonVertex(out, vertex, sourceOffset + vertex);
    const frontPattern = [
        0,
        2,
        1,
        1,
        2,
        3
    ];
    const backPattern = [
        0,
        1,
        2,
        1,
        3,
        2
    ];
    for(let segment = 0; segment < segmentCount; segment += 1){
        const frontSource = sourceOffset + segment * 4;
        const frontDestination = segment * 6;
        for(let corner = 0; corner < 6; corner += 1)$6fafcf15f6b61d60$var$copyRibbonVertex(out, frontSource + frontPattern[corner], frontDestination + corner);
        if (hasBackfaces) {
            const backSource = sourceOffset + sourceFrontVertexCount + segment * 4;
            const backDestination = frontVertexCount + segment * 6;
            for(let corner = 0; corner < 6; corner += 1)$6fafcf15f6b61d60$var$copyRibbonVertex(out, backSource + backPattern[corner], backDestination + corner);
        }
    }
    for(let index = 0; index < finalVertexCount; index += 1)out.indices[index] = index;
}
const $6fafcf15f6b61d60$var$THICK_STRIP_TRIANGLE_PATTERN = [
    0,
    8,
    2,
    0,
    6,
    8,
    1,
    9,
    7,
    1,
    3,
    9,
    3,
    5,
    11,
    3,
    11,
    9,
    2,
    8,
    10,
    2,
    10,
    4
];
function $6fafcf15f6b61d60$var$generateSquare3DPrintGeometry(stroke, options, out) {
    stroke = $6fafcf15f6b61d60$var$retainPrint3DControlPoints(stroke, out);
    out.family = "print3d";
    out.uv0Size = 2;
    $6fafcf15f6b61d60$var$ensureGeometryPressureCapacity(out, stroke.controlPoints.length);
    $6fafcf15f6b61d60$var$prepareGeometrySmoothedPressures(stroke, options, out);
    $6fafcf15f6b61d60$var$prepareGeometrySmoothedPositions(stroke, out);
    const segments = [
        undefined
    ];
    const pressureSizeMin = $6fafcf15f6b61d60$var$normalizePressureSizeMin(options.pressureSizeRange?.[0]);
    let previousBasis;
    for(let i = 1; i < stroke.controlPoints.length; i += 1){
        const basis = $6fafcf15f6b61d60$var$createPrint3DBasis(stroke, i, pressureSizeMin, out.geometrySmoothedPressures, out.geometrySmoothedPositions);
        const breaksForRotation = basis !== undefined && previousBasis !== undefined && ($6fafcf15f6b61d60$var$dotVec3(previousBasis.planeNormal, basis.planeNormal) < 0.94 || $6fafcf15f6b61d60$var$dotVec3(previousBasis.planeRight, basis.planeRight) < 0.94);
        segments.push(breaksForRotation ? undefined : basis);
        previousBasis = basis;
    }
    const positions = [];
    const normals = [];
    const indices = [];
    let segment = 1;
    while(segment < segments.length){
        while(segment < segments.length && !segments[segment])segment += 1;
        if (segment >= segments.length) break;
        const firstSegment = segment;
        while(segment + 1 < segments.length && segments[segment + 1])segment += 1;
        const lastSegment = segment;
        $6fafcf15f6b61d60$var$appendPrint3DSection(stroke, segments, firstSegment, lastSegment, positions, normals, indices, out.geometrySmoothedPositions, out.geometrySmoothedPressures, pressureSizeMin);
        segment += 1;
    }
    const vertexCount = positions.length / 3;
    const reallocated = $6fafcf15f6b61d60$var$ensureGeometryCapacity(out, vertexCount, indices.length);
    for(let vertex = 0; vertex < vertexCount; vertex += 1){
        const offset = vertex * 3;
        $6fafcf15f6b61d60$var$writePosition(out.positions, vertex, [
            positions[offset],
            positions[offset + 1],
            positions[offset + 2]
        ]);
        $6fafcf15f6b61d60$var$writeNormal(out.normals, vertex, [
            normals[offset],
            normals[offset + 1],
            normals[offset + 2]
        ]);
        $6fafcf15f6b61d60$var$writeTangent(out.tangents, vertex, [
            1,
            0,
            0
        ], 1);
        $6fafcf15f6b61d60$var$writeColor(out.colors, vertex, stroke.color, 1);
        $6fafcf15f6b61d60$var$writeUv(out.uvs, vertex, [
            0,
            0
        ]);
        $6fafcf15f6b61d60$var$includeBounds(out.bounds, out.positions, vertex);
    }
    out.indices.set(indices, 0);
    out.vertexCount = vertexCount;
    out.indexCount = indices.length;
    return reallocated;
}
function $6fafcf15f6b61d60$var$retainPrint3DControlPoints(stroke, out) {
    const source = stroke.controlPoints;
    if (source.length < 2) return stroke;
    const retained = out.tubeRetainedControlPoints;
    retained.length = 0;
    retained.push(source[0]);
    let lastRetained = source[0];
    for(let pointIndex = 1; pointIndex < source.length; pointIndex += 1){
        const point = source[pointIndex];
        if (pointIndex + 1 === source.length || $6fafcf15f6b61d60$var$distanceBetweenControlPoints(lastRetained, point) > 0.005) {
            retained.push(point);
            lastRetained = point;
        }
    }
    return retained.length === source.length ? stroke : {
        ...stroke,
        controlPoints: retained
    };
}
function $6fafcf15f6b61d60$var$createPrint3DBasis(stroke, index, pressureSizeMin, smoothedPressures, smoothedPositions) {
    const current = stroke.controlPoints[index];
    const previousPosition = [
        0,
        0,
        0
    ];
    const currentPosition = [
        0,
        0,
        0
    ];
    $6fafcf15f6b61d60$var$readScratchVec3(smoothedPositions, index - 1, previousPosition);
    $6fafcf15f6b61d60$var$readScratchVec3(smoothedPositions, index, currentPosition);
    const tangent = $6fafcf15f6b61d60$var$subtractVec3(currentPosition, previousPosition);
    const distance = Math.sqrt($6fafcf15f6b61d60$var$dotVec3(tangent, tangent));
    if (distance < 0.003 || !$6fafcf15f6b61d60$var$normalizeInPlace(tangent)) return undefined;
    return $6fafcf15f6b61d60$var$createPrint3DBasisForTangent(stroke, index, index, tangent, pressureSizeMin, smoothedPressures);
}
function $6fafcf15f6b61d60$var$createPrint3DBasisForTangent(stroke, orientationIndex, pressureIndex, tangent, pressureSizeMin, smoothedPressures) {
    const current = stroke.controlPoints[orientationIndex];
    const planeNormal = [
        0,
        0,
        0
    ];
    const planeRight = [
        0,
        0,
        0
    ];
    const planeForward = [
        0,
        0,
        0
    ];
    $6fafcf15f6b61d60$var$rotateByQuaternion(current.orientation, $6fafcf15f6b61d60$var$VEC_UP, planeNormal);
    $6fafcf15f6b61d60$var$rotateByQuaternion(current.orientation, $6fafcf15f6b61d60$var$VEC_RIGHT, planeRight);
    $6fafcf15f6b61d60$var$rotateByQuaternion(current.orientation, $6fafcf15f6b61d60$var$VEC_FORWARD, planeForward);
    const alignment = $6fafcf15f6b61d60$var$dotVec3(tangent, planeNormal);
    if (Math.abs(alignment) < 0.0087) return undefined;
    const sign = alignment > 0 ? 1 : -1;
    const width = [
        ...planeRight
    ];
    const thickness = [
        planeForward[0] * -sign,
        planeForward[1] * -sign,
        planeForward[2] * -sign
    ];
    const halfSize = $6fafcf15f6b61d60$var$getLocalBrushSize(stroke) * $6fafcf15f6b61d60$var$getPressureSizeMultiplier(smoothedPressures[pressureIndex], pressureSizeMin) * 0.5;
    return {
        tangent: tangent,
        inlineWithPlaneNormal: alignment > 0,
        planeNormal: planeNormal,
        planeRight: planeRight,
        width: width,
        thickness: thickness,
        halfSize: halfSize
    };
}
function $6fafcf15f6b61d60$var$appendPrint3DSection(stroke, segments, firstSegment, lastSegment, positions, normals, indices, smoothedPositions, smoothedPressures, pressureSizeMin) {
    const firstBasis = segments[firstSegment];
    const center = [
        0,
        0,
        0
    ];
    $6fafcf15f6b61d60$var$readScratchVec3(smoothedPositions, firstSegment - 1, center);
    const startCap = $6fafcf15f6b61d60$var$appendPrint3DCap(center, firstBasis, false, positions, normals);
    const firstRing = $6fafcf15f6b61d60$var$appendPrint3DRing(center, firstBasis, positions, normals);
    $6fafcf15f6b61d60$var$appendTriangle(indices, startCap + 2, startCap + 3, startCap + 1);
    $6fafcf15f6b61d60$var$appendTriangle(indices, startCap + 1, startCap + 3, startCap);
    $6fafcf15f6b61d60$var$appendPrint3DCapToRing(indices, firstRing, startCap, true);
    let previousRing = firstRing;
    for(let i = firstSegment; i <= lastSegment; i += 1){
        const basis = segments[i];
        if (i > firstSegment && segments[i - 1].inlineWithPlaneNormal !== basis.inlineWithPlaneNormal) {
            $6fafcf15f6b61d60$var$appendPrint3DRingFace(indices, previousRing);
            $6fafcf15f6b61d60$var$readScratchVec3(smoothedPositions, i - 1, center);
            const previousBasisOnCurrentTangent = $6fafcf15f6b61d60$var$createPrint3DBasisForTangent(stroke, i - 1, i - 1, basis.tangent, pressureSizeMin, smoothedPressures);
            if (previousBasisOnCurrentTangent) previousRing = $6fafcf15f6b61d60$var$appendPrint3DRing(center, previousBasisOnCurrentTangent, positions, normals);
        }
        $6fafcf15f6b61d60$var$readScratchVec3(smoothedPositions, i, center);
        const ring = $6fafcf15f6b61d60$var$appendPrint3DRing(center, basis, positions, normals);
        $6fafcf15f6b61d60$var$appendPrint3DMiddle(indices, previousRing, ring);
        previousRing = ring;
    }
    const lastBasis = segments[lastSegment];
    $6fafcf15f6b61d60$var$readScratchVec3(smoothedPositions, lastSegment, center);
    const endCap = $6fafcf15f6b61d60$var$appendPrint3DCap(center, lastBasis, true, positions, normals);
    $6fafcf15f6b61d60$var$appendPrint3DCapToRing(indices, previousRing, endCap, false);
    $6fafcf15f6b61d60$var$appendTriangle(indices, endCap + 1, endCap, endCap + 2);
    $6fafcf15f6b61d60$var$appendTriangle(indices, endCap + 2, endCap, endCap + 3);
}
function $6fafcf15f6b61d60$var$appendPrint3DRingFace(indices, ring) {
    for(let vertex = 2; vertex < 8; vertex += 1)$6fafcf15f6b61d60$var$appendTriangle(indices, ring + vertex, ring + vertex - 1, ring);
}
function $6fafcf15f6b61d60$var$appendPrint3DRing(center, basis, positions, normals, halfSize = basis.halfSize) {
    const first = positions.length / 3;
    const bevelRatio = 0.99;
    const bevelRadius = halfSize * (1 - bevelRatio);
    for (const [startDegrees, stopDegrees] of [
        [
            360,
            270
        ],
        [
            270,
            180
        ],
        [
            180,
            90
        ],
        [
            90,
            0
        ]
    ]){
        const middle = (startDegrees + stopDegrees) * Math.PI / 360;
        const originWidth = Math.sign(Math.cos(middle)) * halfSize * bevelRatio;
        const originThickness = Math.sign(Math.sin(middle)) * halfSize * bevelRatio;
        for (const degrees of [
            startDegrees,
            stopDegrees
        ]){
            const radians = degrees * Math.PI / 180;
            const widthOffset = originWidth + Math.cos(radians) * bevelRadius;
            const thicknessOffset = originThickness + Math.sin(radians) * bevelRadius;
            $6fafcf15f6b61d60$var$appendPrint3DVertex(center, basis, widthOffset, thicknessOffset, positions, normals);
        }
    }
    return first;
}
function $6fafcf15f6b61d60$var$appendPrint3DCap(center, basis, ending, positions, normals, halfSize = basis.halfSize) {
    const first = positions.length / 3;
    const inset = halfSize * 0.99;
    const direction = ending ? 1 : -1;
    const capCenter = [
        center[0] + basis.tangent[0] * 0.001 * direction,
        center[1] + basis.tangent[1] * 0.001 * direction,
        center[2] + basis.tangent[2] * 0.001 * direction
    ];
    for (const [width, thickness] of [
        [
            1,
            -1
        ],
        [
            -1,
            -1
        ],
        [
            -1,
            1
        ],
        [
            1,
            1
        ]
    ]){
        const position = [
            capCenter[0] + basis.width[0] * inset * width + basis.thickness[0] * inset * thickness,
            capCenter[1] + basis.width[1] * inset * width + basis.thickness[1] * inset * thickness,
            capCenter[2] + basis.width[2] * inset * width + basis.thickness[2] * inset * thickness
        ];
        positions.push(...position);
        normals.push(basis.tangent[0] * direction, basis.tangent[1] * direction, basis.tangent[2] * direction);
    }
    return first;
}
function $6fafcf15f6b61d60$var$appendPrint3DVertex(center, basis, widthOffset, thicknessOffset, positions, normals) {
    positions.push(center[0] + basis.width[0] * widthOffset + basis.thickness[0] * thicknessOffset, center[1] + basis.width[1] * widthOffset + basis.thickness[1] * thicknessOffset, center[2] + basis.width[2] * widthOffset + basis.thickness[2] * thicknessOffset);
    const normal = [
        basis.width[0] * widthOffset + basis.thickness[0] * thicknessOffset,
        basis.width[1] * widthOffset + basis.thickness[1] * thicknessOffset,
        basis.width[2] * widthOffset + basis.thickness[2] * thicknessOffset
    ];
    $6fafcf15f6b61d60$var$normalizeInPlace(normal);
    normals.push(...normal);
}
function $6fafcf15f6b61d60$var$appendPrint3DMiddle(indices, ring0, ring1) {
    for(let i = 0; i < 8; i += 1){
        const next = (i + 1) % 8;
        $6fafcf15f6b61d60$var$appendQuad(indices, ring0 + next, ring0 + i, ring1 + i, ring1 + next);
    }
}
function $6fafcf15f6b61d60$var$appendPrint3DCapToRing(indices, ring, cap, starting) {
    for(let corner = 0; corner < 4; corner += 1){
        const inner = cap + corner;
        const fanStart = ring + corner * 2;
        const fanEnd = fanStart + 1;
        const nextInner = cap + (corner + 1) % 4;
        const nextFan = ring + (corner + 1) % 4 * 2;
        if (starting) {
            $6fafcf15f6b61d60$var$appendTriangle(indices, inner, fanStart, fanEnd);
            $6fafcf15f6b61d60$var$appendQuad(indices, inner, fanEnd, nextFan, nextInner);
        } else {
            $6fafcf15f6b61d60$var$appendTriangle(indices, inner, fanEnd, fanStart);
            $6fafcf15f6b61d60$var$appendQuad(indices, fanEnd, inner, nextInner, nextFan);
        }
    }
}
function $6fafcf15f6b61d60$var$appendQuad(indices, v0, v1, v2, v3) {
    $6fafcf15f6b61d60$var$appendTriangle(indices, v0, v1, v3);
    $6fafcf15f6b61d60$var$appendTriangle(indices, v3, v1, v2);
}
function $6fafcf15f6b61d60$var$appendTriangle(indices, a, b, c) {
    // Open Brush/Unity uses clockwise front faces; Three.js uses counter-clockwise.
    indices.push(a, c, b);
}
function $6fafcf15f6b61d60$var$generateConcaveHullGeometry(stroke, options, out) {
    out.family = "concave-hull";
    out.uv0Size = 2;
    const pressureSizeMin = $6fafcf15f6b61d60$var$normalizePressureSizeMin(options.pressureSizeRange?.[0]);
    const localBrushSize = $6fafcf15f6b61d60$var$getLocalBrushSize(stroke);
    const knotPoints = [];
    const right = [
        0,
        0,
        0
    ];
    for(let knotIndex = 0; knotIndex < stroke.controlPoints.length; knotIndex += 1){
        const controlPoint = stroke.controlPoints[knotIndex];
        $6fafcf15f6b61d60$var$rotateByQuaternion(controlPoint.orientation, $6fafcf15f6b61d60$var$VEC_RIGHT, right);
        const sourcePressure = knotIndex < 2 ? 0 : controlPoint.pressure;
        const halfSize = localBrushSize * $6fafcf15f6b61d60$var$getPressureSizeMultiplier(sourcePressure, pressureSizeMin) * 0.5;
        const extent = [
            right[0] * halfSize,
            right[1] * halfSize,
            right[2] * halfSize
        ];
        knotPoints.push([
            $6fafcf15f6b61d60$var$subtractVec3(controlPoint.position, extent),
            [
                controlPoint.position[0] + extent[0],
                controlPoint.position[1] + extent[1],
                controlPoint.position[2] + extent[2]
            ]
        ]);
    }
    const batches = [];
    for(let knotIndex = 0; knotIndex < knotPoints.length; knotIndex += 1){
        const first = Math.max(0, knotIndex + 1 - 5);
        const points = knotPoints.slice(first, knotIndex + 1).flat();
        const faces = $6fafcf15f6b61d60$var$createConvexHull(points);
        if (faces.length > 0) batches.push({
            points: points,
            faces: faces
        });
    }
    const faceCount = batches.reduce((sum, batch)=>sum + batch.faces.length, 0);
    const vertexCount = faceCount * 3;
    const indexCount = vertexCount;
    const reallocated = $6fafcf15f6b61d60$var$ensureGeometryCapacity(out, vertexCount, indexCount);
    let vertex = 0;
    for (const batch of batches){
        for (const face of batch.faces)for (const pointIndex of [
            face.a,
            face.b,
            face.c
        ]){
            $6fafcf15f6b61d60$var$writeConcaveHullVertex(out, vertex, batch.points[pointIndex], face.normal, stroke.color);
            out.indices[vertex] = vertex;
            vertex += 1;
        }
    }
    out.vertexCount = vertexCount;
    out.indexCount = indexCount;
    return reallocated;
}
function $6fafcf15f6b61d60$var$writeConcaveHullVertex(out, vertex, position, normal, color) {
    $6fafcf15f6b61d60$var$writePosition(out.positions, vertex, position);
    $6fafcf15f6b61d60$var$writeNormal(out.normals, vertex, normal);
    $6fafcf15f6b61d60$var$writeTangent(out.tangents, vertex, [
        1,
        0,
        0
    ], 1);
    $6fafcf15f6b61d60$var$writeColor(out.colors, vertex, color, 1);
    $6fafcf15f6b61d60$var$writeUv(out.uvs, vertex, [
        0,
        0
    ]);
    $6fafcf15f6b61d60$var$includeBounds(out.bounds, out.positions, vertex);
}
function $6fafcf15f6b61d60$var$generateHullGeometry(stroke, options, out) {
    out.family = "hull";
    out.uv0Size = 3;
    const points = $6fafcf15f6b61d60$var$createHullInputPoints(stroke, options);
    const faces = $6fafcf15f6b61d60$var$createConvexHull(points);
    const faceted = options.geometryParams?.hullFaceted !== false;
    const doubleSided = options.geometryParams?.renderBackfaces === true;
    const copies = doubleSided ? 2 : 1;
    const hullPointIndices = faceted ? [] : [
        ...new Set(faces.flatMap((face)=>[
                face.a,
                face.b,
                face.c
            ]))
    ];
    const frontVertexCount = faceted ? faces.length * 3 : hullPointIndices.length;
    const vertexCount = frontVertexCount * copies;
    const indexCount = faces.length * 3 * copies;
    const reallocated = $6fafcf15f6b61d60$var$ensureGeometryCapacity(out, vertexCount, indexCount);
    const normalsByPoint = faceted ? undefined : $6fafcf15f6b61d60$var$createSmoothHullNormals(points, faces, hullPointIndices);
    const pointToVertex = new Map();
    const localBrushSize = $6fafcf15f6b61d60$var$getLocalBrushSize(stroke);
    let vertex = 0;
    if (faceted) {
        for (const face of faces)for (const pointIndex of [
            face.a,
            face.b,
            face.c
        ]){
            $6fafcf15f6b61d60$var$writeHullVertex(out, vertex, points[pointIndex], face.normal, stroke.color, localBrushSize);
            vertex += copies;
        }
    } else for (const pointIndex of hullPointIndices){
        pointToVertex.set(pointIndex, vertex);
        $6fafcf15f6b61d60$var$writeHullVertex(out, vertex, points[pointIndex], normalsByPoint?.get(pointIndex) ?? [
            0,
            1,
            0
        ], stroke.color, localBrushSize);
        vertex += copies;
    }
    if (doubleSided) for(let front = 0; front < frontVertexCount; front += 1){
        const source = front * 2;
        const back = source + 1;
        $6fafcf15f6b61d60$var$copyHullVertexAsBackface(out, source, back);
    }
    let index = 0;
    for(let faceIndex = 0; faceIndex < faces.length; faceIndex += 1){
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
function $6fafcf15f6b61d60$var$createHullInputPoints(stroke, options) {
    switch(options.geometryParams?.hullKnotConversion ?? "directed-sphere"){
        case "point":
            return $6fafcf15f6b61d60$var$createPointHullInputPoints(stroke);
        case "tetrahedron":
            return $6fafcf15f6b61d60$var$createTetrahedronHullInputPoints(stroke);
        case "directed-sphere":
            return $6fafcf15f6b61d60$var$createDirectedSphereHullInputPoints(stroke, options);
    }
}
function $6fafcf15f6b61d60$var$createPointHullInputPoints(stroke) {
    return stroke.controlPoints.map((controlPoint)=>[
            ...controlPoint.position
        ]);
}
function $6fafcf15f6b61d60$var$createTetrahedronHullInputPoints(stroke) {
    const points = [];
    const seen = new Set();
    const halfWidth = $6fafcf15f6b61d60$var$getLocalBrushSize(stroke) / Math.sqrt(3);
    const offsets = [
        [
            -halfWidth,
            -halfWidth,
            -halfWidth
        ],
        [
            halfWidth,
            halfWidth,
            -halfWidth
        ],
        [
            halfWidth,
            -halfWidth,
            halfWidth
        ],
        [
            -halfWidth,
            halfWidth,
            halfWidth
        ]
    ];
    for (const controlPoint of stroke.controlPoints)for (const offset of offsets){
        const point = [
            controlPoint.position[0] + offset[0],
            controlPoint.position[1] + offset[1],
            controlPoint.position[2] + offset[2]
        ];
        const key = `${point[0].toPrecision(12)},${point[1].toPrecision(12)},${point[2].toPrecision(12)}`;
        if (!seen.has(key)) {
            seen.add(key);
            points.push(point);
        }
    }
    return points;
}
/** Port of HullBrush.KnotConversion.DirectedSphere. */ function $6fafcf15f6b61d60$var$createDirectedSphereHullInputPoints(stroke, options) {
    if (stroke.controlPoints.length === 0) return [];
    const retainedPoints = [
        0
    ];
    let previousRetained = 0;
    for(let index = 1; index < stroke.controlPoints.length; index += 1){
        if ($6fafcf15f6b61d60$var$distanceBetweenControlPoints(stroke.controlPoints[previousRetained], stroke.controlPoints[index]) < $6fafcf15f6b61d60$var$OPEN_BRUSH_RIBBON_MINIMUM_MOVE_METERS) continue;
        retainedPoints.push(index);
        previousRetained = index;
    }
    const points = [
        [
            ...stroke.controlPoints[retainedPoints[0]].position
        ]
    ];
    const pressureSizeMin = $6fafcf15f6b61d60$var$normalizePressureSizeMin(options.pressureSizeRange?.[0]);
    const localBrushSize = $6fafcf15f6b61d60$var$getLocalBrushSize(stroke);
    const previousRight = [
        0,
        0,
        0
    ];
    const direction = [
        0,
        0,
        0
    ];
    const pointerForward = [
        0,
        0,
        0
    ];
    const pointerUp = [
        0,
        0,
        0
    ];
    const right = [
        0,
        0,
        0
    ];
    const normal = [
        0,
        0,
        0
    ];
    const ringPoint = [
        0,
        0,
        0
    ];
    const rotated = [
        0,
        0,
        0
    ];
    const ringAngle = Math.PI / 4;
    const aroundRingAngle = Math.PI / 2;
    for(let retainedIndex = 1; retainedIndex < retainedPoints.length; retainedIndex += 1){
        const pointIndex = retainedPoints[retainedIndex];
        const previousPointIndex = retainedPoints[retainedIndex - 1];
        const controlPoint = stroke.controlPoints[pointIndex];
        const previousPoint = stroke.controlPoints[previousPointIndex];
        direction[0] = controlPoint.position[0] - previousPoint.position[0];
        direction[1] = controlPoint.position[1] - previousPoint.position[1];
        direction[2] = controlPoint.position[2] - previousPoint.position[2];
        if (!$6fafcf15f6b61d60$var$normalizeInPlace(direction)) continue;
        $6fafcf15f6b61d60$var$rotateByQuaternion(controlPoint.orientation, $6fafcf15f6b61d60$var$VEC_FORWARD, pointerForward);
        $6fafcf15f6b61d60$var$rotateByQuaternion(controlPoint.orientation, $6fafcf15f6b61d60$var$VEC_UP, pointerUp);
        $6fafcf15f6b61d60$var$computeSurfaceFrame(previousRight, direction, pointerForward, pointerUp, retainedIndex === 1, right, normal);
        $6fafcf15f6b61d60$var$copyVec3(right, previousRight);
        const radius = localBrushSize * $6fafcf15f6b61d60$var$getPressureSizeMultiplier(controlPoint.pressure, pressureSizeMin) * 0.5;
        ringPoint[0] = direction[0] * radius;
        ringPoint[1] = direction[1] * radius;
        ringPoint[2] = direction[2] * radius;
        points.push([
            controlPoint.position[0] + ringPoint[0],
            controlPoint.position[1] + ringPoint[1],
            controlPoint.position[2] + ringPoint[2]
        ]);
        for(let ring = 0; ring < 2; ring += 1){
            $6fafcf15f6b61d60$var$rotateAroundAxis(ringPoint, right, ringAngle, rotated);
            $6fafcf15f6b61d60$var$copyVec3(rotated, ringPoint);
            for(let point = 0; point < 4; point += 1){
                points.push([
                    controlPoint.position[0] + ringPoint[0],
                    controlPoint.position[1] + ringPoint[1],
                    controlPoint.position[2] + ringPoint[2]
                ]);
                $6fafcf15f6b61d60$var$rotateAroundAxis(ringPoint, direction, aroundRingAngle, rotated);
                $6fafcf15f6b61d60$var$copyVec3(rotated, ringPoint);
            }
        }
    }
    return points;
}
function $6fafcf15f6b61d60$var$createConvexHull(points) {
    if (points.length < 4) return [];
    const initial = $6fafcf15f6b61d60$var$findInitialHullTetrahedron(points);
    if (!initial) return [];
    const inside = [
        0,
        0,
        0
    ];
    for (const pointIndex of initial){
        inside[0] += points[pointIndex][0] / 4;
        inside[1] += points[pointIndex][1] / 4;
        inside[2] += points[pointIndex][2] / 4;
    }
    let faces = [
        $6fafcf15f6b61d60$var$makeHullFace(initial[0], initial[1], initial[2], points, inside),
        $6fafcf15f6b61d60$var$makeHullFace(initial[0], initial[3], initial[1], points, inside),
        $6fafcf15f6b61d60$var$makeHullFace(initial[0], initial[2], initial[3], points, inside),
        $6fafcf15f6b61d60$var$makeHullFace(initial[1], initial[3], initial[2], points, inside)
    ];
    const initialSet = new Set(initial);
    const epsilon = Math.max($6fafcf15f6b61d60$var$getPointCloudScale(points) * 1e-9, 1e-10);
    for(let pointIndex = 0; pointIndex < points.length; pointIndex += 1){
        if (initialSet.has(pointIndex)) continue;
        const visible = faces.filter((face)=>$6fafcf15f6b61d60$var$signedDistanceToFace(points[pointIndex], points[face.a], face.normal) > epsilon);
        if (visible.length === 0) continue;
        const boundary = new Map();
        for (const face of visible)for (const edge of [
            [
                face.a,
                face.b
            ],
            [
                face.b,
                face.c
            ],
            [
                face.c,
                face.a
            ]
        ]){
            const key = edge[0] < edge[1] ? `${edge[0]}:${edge[1]}` : `${edge[1]}:${edge[0]}`;
            if (boundary.has(key)) boundary.delete(key);
            else boundary.set(key, edge);
        }
        const visibleSet = new Set(visible);
        faces = faces.filter((face)=>!visibleSet.has(face));
        for (const edge of boundary.values())faces.push($6fafcf15f6b61d60$var$makeHullFace(edge[0], edge[1], pointIndex, points, inside));
    }
    return faces;
}
function $6fafcf15f6b61d60$var$findInitialHullTetrahedron(points) {
    let a = 0;
    for(let i = 1; i < points.length; i += 1)if (points[i][0] < points[a][0]) a = i;
    let b = a;
    let best = 0;
    for(let i = 0; i < points.length; i += 1){
        const distance = $6fafcf15f6b61d60$var$squaredDistance(points[a], points[i]);
        if (distance > best) {
            best = distance;
            b = i;
        }
    }
    let c = a;
    best = 0;
    const ab = $6fafcf15f6b61d60$var$subtractVec3(points[b], points[a]);
    for(let i = 0; i < points.length; i += 1){
        const cross = $6fafcf15f6b61d60$var$crossVec3(ab, $6fafcf15f6b61d60$var$subtractVec3(points[i], points[a]));
        const distance = $6fafcf15f6b61d60$var$dotVec3(cross, cross);
        if (distance > best) {
            best = distance;
            c = i;
        }
    }
    const normal = $6fafcf15f6b61d60$var$crossVec3(ab, $6fafcf15f6b61d60$var$subtractVec3(points[c], points[a]));
    let d = a;
    best = 0;
    for(let i = 0; i < points.length; i += 1){
        const distance = Math.abs($6fafcf15f6b61d60$var$dotVec3(normal, $6fafcf15f6b61d60$var$subtractVec3(points[i], points[a])));
        if (distance > best) {
            best = distance;
            d = i;
        }
    }
    return best > 1e-12 ? [
        a,
        b,
        c,
        d
    ] : undefined;
}
function $6fafcf15f6b61d60$var$makeHullFace(a, b, c, points, inside) {
    let normal = $6fafcf15f6b61d60$var$crossVec3($6fafcf15f6b61d60$var$subtractVec3(points[b], points[a]), $6fafcf15f6b61d60$var$subtractVec3(points[c], points[a]));
    if ($6fafcf15f6b61d60$var$dotVec3(normal, $6fafcf15f6b61d60$var$subtractVec3(inside, points[a])) > 0) {
        [b, c] = [
            c,
            b
        ];
        normal = [
            -normal[0],
            -normal[1],
            -normal[2]
        ];
    }
    $6fafcf15f6b61d60$var$normalizeInPlace(normal);
    return {
        a: a,
        b: b,
        c: c,
        normal: normal
    };
}
function $6fafcf15f6b61d60$var$createSmoothHullNormals(points, faces, pointIndices) {
    const normals = new Map(pointIndices.map((index)=>[
            index,
            [
                0,
                0,
                0
            ]
        ]));
    for (const face of faces){
        const vertices = [
            face.a,
            face.b,
            face.c
        ];
        for(let i = 0; i < 3; i += 1){
            const current = points[vertices[i]];
            const before = $6fafcf15f6b61d60$var$subtractVec3(points[vertices[(i + 2) % 3]], current);
            const after = $6fafcf15f6b61d60$var$subtractVec3(points[vertices[(i + 1) % 3]], current);
            $6fafcf15f6b61d60$var$normalizeInPlace(before);
            $6fafcf15f6b61d60$var$normalizeInPlace(after);
            const angle = Math.acos(Math.max(-1, Math.min(1, $6fafcf15f6b61d60$var$dotVec3(before, after))));
            const normal = normals.get(vertices[i]);
            normal[0] += face.normal[0] * angle;
            normal[1] += face.normal[1] * angle;
            normal[2] += face.normal[2] * angle;
        }
    }
    for (const normal of normals.values())$6fafcf15f6b61d60$var$normalizeInPlace(normal);
    return normals;
}
function $6fafcf15f6b61d60$var$writeHullVertex(out, vertex, position, normal, color, brushSize) {
    $6fafcf15f6b61d60$var$writePosition(out.positions, vertex, position);
    $6fafcf15f6b61d60$var$writeNormal(out.normals, vertex, normal);
    $6fafcf15f6b61d60$var$writeTangent(out.tangents, vertex, [
        1,
        0,
        0
    ], 1);
    $6fafcf15f6b61d60$var$writeColor(out.colors, vertex, color, 1);
    $6fafcf15f6b61d60$var$writePackedUv(out.packedUvs, vertex, 0, 0, brushSize);
    $6fafcf15f6b61d60$var$includeBounds(out.bounds, out.positions, vertex);
}
function $6fafcf15f6b61d60$var$copyHullVertexAsBackface(out, source, target) {
    for(let axis = 0; axis < 3; axis += 1){
        out.positions[target * 3 + axis] = out.positions[source * 3 + axis];
        out.normals[target * 3 + axis] = -out.normals[source * 3 + axis];
        out.packedUvs[target * 3 + axis] = out.packedUvs[source * 3 + axis];
    }
    for(let axis = 0; axis < 4; axis += 1){
        out.tangents[target * 4 + axis] = out.tangents[source * 4 + axis];
        out.colors[target * 4 + axis] = out.colors[source * 4 + axis];
    }
    $6fafcf15f6b61d60$var$includeBounds(out.bounds, out.positions, target);
}
function $6fafcf15f6b61d60$var$subtractVec3(a, b) {
    return [
        a[0] - b[0],
        a[1] - b[1],
        a[2] - b[2]
    ];
}
function $6fafcf15f6b61d60$var$crossVec3(a, b) {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ];
}
function $6fafcf15f6b61d60$var$dotVec3(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function $6fafcf15f6b61d60$var$squaredDistance(a, b) {
    const delta = $6fafcf15f6b61d60$var$subtractVec3(a, b);
    return $6fafcf15f6b61d60$var$dotVec3(delta, delta);
}
function $6fafcf15f6b61d60$var$signedDistanceToFace(point, origin, normal) {
    return $6fafcf15f6b61d60$var$dotVec3(normal, $6fafcf15f6b61d60$var$subtractVec3(point, origin));
}
function $6fafcf15f6b61d60$var$getPointCloudScale(points) {
    let scale = 0;
    for (const point of points)scale = Math.max(scale, Math.abs(point[0]), Math.abs(point[1]), Math.abs(point[2]));
    return scale;
}
function $6fafcf15f6b61d60$var$generateThickStripGeometry(stroke, options, out) {
    stroke = $6fafcf15f6b61d60$var$retainGeometryBrushControlPoints(stroke, options, out, false);
    out.family = "thick-strip";
    out.uv0Size = 2;
    const pointCount = stroke.controlPoints.length;
    $6fafcf15f6b61d60$var$ensureTubeScratchCapacity(out, pointCount);
    $6fafcf15f6b61d60$var$ensureGeometryPressureCapacity(out, pointCount);
    $6fafcf15f6b61d60$var$prepareGeometrySmoothedPressures(stroke, options, out);
    const maximumVertexCount = Math.max(0, pointCount - 1) * 12;
    const maximumIndexCount = Math.max(0, pointCount - 1) * 24;
    const reallocated = $6fafcf15f6b61d60$var$ensureGeometryCapacity(out, maximumVertexCount, maximumIndexCount);
    const { positions: positions, normals: normals, tangents: tangents, colors: colors, uvs: uvs, indices: indices, bounds: bounds, geometrySmoothedPressures: geometrySmoothedPressures, tubeBreakBefore: tubeBreakBefore, tubeFrameRights: tubeFrameRights, tubeFrameUps: tubeFrameUps } = out;
    const localBrushSize = $6fafcf15f6b61d60$var$getLocalBrushSize(stroke);
    const pressureSizeMin = $6fafcf15f6b61d60$var$normalizePressureSizeMin(options.pressureSizeRange?.[0]);
    const pressureOpacityMin = $6fafcf15f6b61d60$var$normalizePressureOpacityMin(options.pressureOpacityRange);
    const pressureOpacityMax = $6fafcf15f6b61d60$var$normalizePressureOpacityMax(options.pressureOpacityRange);
    const descriptorOpacity = $6fafcf15f6b61d60$var$normalizeDescriptorOpacity(options.geometryParams?.opacity);
    const tileRate = $6fafcf15f6b61d60$var$normalizeTileRate(options.geometryParams?.tileRate);
    const atlasRows = $6fafcf15f6b61d60$var$normalizeAtlasRows(options.geometryParams?.textureAtlasV);
    const move = [
        0,
        0,
        0
    ];
    const previousMove = [
        0,
        0,
        0
    ];
    const right = [
        0,
        0,
        0
    ];
    const surface = [
        0,
        0,
        0
    ];
    const preferredRight = [
        0,
        0,
        0
    ];
    const pointerForward = [
        0,
        0,
        0
    ];
    const pointerUp = [
        0,
        0,
        0
    ];
    const cosTheta = 1 / Math.sqrt(1 + 1 / 64);
    const sinTheta = cosTheta / 8;
    let previousHasGeometry = false;
    // ThickGeometryBrush assigns geometry to the current knot's incoming solid.
    // A rejected knot terminates the preceding section and seeds a fresh frame
    // for the next valid solid.
    for(let pointIndex = 1; pointIndex < pointCount; pointIndex += 1){
        const previous = stroke.controlPoints[pointIndex - 1].position;
        const point = stroke.controlPoints[pointIndex];
        move[0] = point.position[0] - previous[0];
        move[1] = point.position[1] - previous[1];
        move[2] = point.position[2] - previous[2];
        const length = Math.hypot(move[0], move[1], move[2]);
        let shouldBreak = length < $6fafcf15f6b61d60$var$OPEN_BRUSH_TUBE_MINIMUM_MOVE_METERS;
        if (!shouldBreak && previousHasGeometry && pointIndex > 1) {
            const beforePrevious = stroke.controlPoints[pointIndex - 2].position;
            previousMove[0] = previous[0] - beforePrevious[0];
            previousMove[1] = previous[1] - beforePrevious[1];
            previousMove[2] = previous[2] - beforePrevious[2];
            const previousLength = Math.hypot(previousMove[0], previousMove[1], previousMove[2]);
            const movementAngle = Math.acos(Math.min(1, Math.max(-1, $6fafcf15f6b61d60$var$dot(previousMove, move) / Math.max(previousLength * length, $6fafcf15f6b61d60$var$EPSILON))));
            const pressuredSize = Math.max(localBrushSize * $6fafcf15f6b61d60$var$getPressureSizeMultiplier(geometrySmoothedPressures[pointIndex], pressureSizeMin), $6fafcf15f6b61d60$var$EPSILON);
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
        move[0] /= length;
        move[1] /= length;
        move[2] /= length;
        $6fafcf15f6b61d60$var$rotateByQuaternion(point.orientation, $6fafcf15f6b61d60$var$VEC_FORWARD, pointerForward);
        $6fafcf15f6b61d60$var$rotateByQuaternion(point.orientation, $6fafcf15f6b61d60$var$VEC_UP, pointerUp);
        $6fafcf15f6b61d60$var$computeSurfaceFrame(preferredRight, move, pointerForward, pointerUp, !previousHasGeometry, right, surface, true);
        $6fafcf15f6b61d60$var$writeScratchVec3(tubeFrameRights, pointIndex, right);
        $6fafcf15f6b61d60$var$writeScratchVec3(tubeFrameUps, pointIndex, surface);
        preferredRight[0] = right[0];
        preferredRight[1] = right[1];
        preferredRight[2] = right[2];
        previousHasGeometry = true;
    }
    let vertexCount = 0;
    let indexCount = 0;
    previousHasGeometry = false;
    const frameRight = [
        0,
        0,
        0
    ];
    const frameSurface = [
        0,
        0,
        0
    ];
    const surfaceTangent = [
        0,
        0,
        0
    ];
    const previousMiddleTop = [
        0,
        0,
        0
    ];
    const currentMiddleTop = [
        0,
        0,
        0
    ];
    for(let pointIndex = 1; pointIndex < pointCount; pointIndex += 1){
        if (tubeBreakBefore[pointIndex] === 1) {
            previousHasGeometry = false;
            continue;
        }
        const point = stroke.controlPoints[pointIndex];
        const previousPoint = stroke.controlPoints[pointIndex - 1];
        const startsSection = !previousHasGeometry;
        const base = startsSection ? vertexCount : vertexCount - 6;
        $6fafcf15f6b61d60$var$readScratchVec3(tubeFrameRights, pointIndex, frameRight);
        $6fafcf15f6b61d60$var$readScratchVec3(tubeFrameUps, pointIndex, frameSurface);
        if (startsSection) {
            previousMiddleTop[0] = previousPoint.position[0];
            previousMiddleTop[1] = previousPoint.position[1];
            previousMiddleTop[2] = previousPoint.position[2];
            const previousSize = localBrushSize * $6fafcf15f6b61d60$var$getPressureSizeMultiplier(geometrySmoothedPressures[pointIndex - 1], pressureSizeMin);
            const previousOpacity = $6fafcf15f6b61d60$var$getPressureOpacityMultiplier(geometrySmoothedPressures[pointIndex - 1], pressureOpacityMin, pressureOpacityMax) * descriptorOpacity;
            $6fafcf15f6b61d60$var$writeThickStripVertex(out, base, previousPoint.position, frameRight, frameSurface, previousSize / 2, 0, 0, 1, stroke.color, previousOpacity);
            $6fafcf15f6b61d60$var$writeThickStripVertex(out, base + 1, previousPoint.position, frameRight, frameSurface, previousSize / 2, 0, 0, -1, stroke.color, previousOpacity);
            $6fafcf15f6b61d60$var$writeThickStripVertex(out, base + 2, previousPoint.position, frameRight, frameSurface, 0, 0, 0, 1, stroke.color, previousOpacity);
            $6fafcf15f6b61d60$var$writeThickStripVertex(out, base + 3, previousPoint.position, frameRight, frameSurface, 0, 0, 0, -1, stroke.color, previousOpacity);
            $6fafcf15f6b61d60$var$writeThickStripVertex(out, base + 4, previousPoint.position, frameRight, frameSurface, -previousSize / 2, 0, 0, 1, stroke.color, previousOpacity);
            $6fafcf15f6b61d60$var$writeThickStripVertex(out, base + 5, previousPoint.position, frameRight, frameSurface, -previousSize / 2, 0, 0, -1, stroke.color, previousOpacity);
        }
        const size = localBrushSize * $6fafcf15f6b61d60$var$getPressureSizeMultiplier(geometrySmoothedPressures[pointIndex], pressureSizeMin);
        const isEnd = pointIndex + 1 === pointCount || tubeBreakBefore[pointIndex + 1] === 1;
        const belly = isEnd ? 0 : size / 16;
        const normalSide = isEnd ? 0 : sinTheta;
        const normalSurface = isEnd ? 1 : cosTheta;
        const opacity = $6fafcf15f6b61d60$var$getPressureOpacityMultiplier(geometrySmoothedPressures[pointIndex], pressureOpacityMin, pressureOpacityMax) * descriptorOpacity;
        const front = base + 6;
        currentMiddleTop[0] = point.position[0] + frameSurface[0] * belly;
        currentMiddleTop[1] = point.position[1] + frameSurface[1] * belly;
        currentMiddleTop[2] = point.position[2] + frameSurface[2] * belly;
        $6fafcf15f6b61d60$var$writeThickStripVertex(out, front, point.position, frameRight, frameSurface, size / 2, 0, normalSide, normalSurface, stroke.color, opacity);
        $6fafcf15f6b61d60$var$writeThickStripVertex(out, front + 1, point.position, frameRight, frameSurface, size / 2, 0, normalSide, -normalSurface, stroke.color, opacity);
        $6fafcf15f6b61d60$var$writeThickStripVertex(out, front + 2, point.position, frameRight, frameSurface, 0, belly, 0, 1, stroke.color, opacity);
        $6fafcf15f6b61d60$var$writeThickStripVertex(out, front + 3, point.position, frameRight, frameSurface, 0, -belly, 0, -1, stroke.color, opacity);
        $6fafcf15f6b61d60$var$writeThickStripVertex(out, front + 4, point.position, frameRight, frameSurface, -size / 2, 0, -normalSide, normalSurface, stroke.color, opacity);
        $6fafcf15f6b61d60$var$writeThickStripVertex(out, front + 5, point.position, frameRight, frameSurface, -size / 2, 0, -normalSide, -normalSurface, stroke.color, opacity);
        let u0;
        let v0;
        let v1;
        if (startsSection) {
            const random01 = $6fafcf15f6b61d60$var$statelessRandom01(stroke.seed, base - 1);
            const atlasRow = Math.floor(random01 * 3331) % atlasRows;
            u0 = random01;
            v0 = (atlasRow + 0.1) / atlasRows;
            v1 = (atlasRow + 0.9) / atlasRows;
            $6fafcf15f6b61d60$var$writeThickStripRingUvs(out.uvs, base, u0, v0, v1);
        } else {
            u0 = out.uvs[(base + 4) * 2];
            v0 = out.uvs[(base + 4) * 2 + 1];
            v1 = out.uvs[base * 2 + 1];
        }
        const length = $6fafcf15f6b61d60$var$distanceBetweenControlPoints(previousPoint, point);
        const u1 = u0 + tileRate * (length / Math.max(size, $6fafcf15f6b61d60$var$EPSILON));
        $6fafcf15f6b61d60$var$writeThickStripRingUvs(out.uvs, front, u1, v0, v1);
        for (const local of $6fafcf15f6b61d60$var$THICK_STRIP_TRIANGLE_PATTERN){
            indices[indexCount] = base + local;
            indexCount += 1;
        }
        // ComputeST for BRT/BMT/FMT simplifies to the vector from the back
        // middle-top vertex to the front middle-top vertex. Keep those source
        // values in number precision so a distant stroke origin does not erase
        // direction bits when positions are packed into meter-scale Float32Arrays.
        surfaceTangent[0] = currentMiddleTop[0] - previousMiddleTop[0];
        surfaceTangent[1] = currentMiddleTop[1] - previousMiddleTop[1];
        surfaceTangent[2] = currentMiddleTop[2] - previousMiddleTop[2];
        if (startsSection) for(let local = 0; local < 6; local += 1)$6fafcf15f6b61d60$var$writeOrthonormalTangent(tangents, normals, base + local, surfaceTangent, -1);
        for(let local = 6; local < 12; local += 1)$6fafcf15f6b61d60$var$writeOrthonormalTangent(tangents, normals, base + local, surfaceTangent, -1);
        vertexCount = startsSection ? vertexCount + 12 : vertexCount + 6;
        previousMiddleTop[0] = currentMiddleTop[0];
        previousMiddleTop[1] = currentMiddleTop[1];
        previousMiddleTop[2] = currentMiddleTop[2];
        previousHasGeometry = true;
    }
    $6fafcf15f6b61d60$var$resetBounds(bounds);
    for(let vertex = 0; vertex < vertexCount; vertex += 1)$6fafcf15f6b61d60$var$includeBounds(bounds, positions, vertex);
    out.vertexCount = vertexCount;
    out.indexCount = indexCount;
    return reallocated;
}
function $6fafcf15f6b61d60$var$writeThickStripVertex(out, vertex, center, right, surface, rightOffset, surfaceOffset, rightNormal, surfaceNormal, color, opacity) {
    $6fafcf15f6b61d60$var$writePosition(out.positions, vertex, [
        center[0] + right[0] * rightOffset + surface[0] * surfaceOffset,
        center[1] + right[1] * rightOffset + surface[1] * surfaceOffset,
        center[2] + right[2] * rightOffset + surface[2] * surfaceOffset
    ]);
    $6fafcf15f6b61d60$var$writeNormal(out.normals, vertex, [
        right[0] * rightNormal + surface[0] * surfaceNormal,
        right[1] * rightNormal + surface[1] * surfaceNormal,
        right[2] * rightNormal + surface[2] * surfaceNormal
    ]);
    $6fafcf15f6b61d60$var$writeColor(out.colors, vertex, color, opacity);
}
function $6fafcf15f6b61d60$var$writeThickStripRingUvs(uvs, base, u, v0, v1) {
    const middle = (v0 + v1) * 0.5;
    let offset = base * 2;
    for (const v of [
        v1,
        v1,
        middle,
        middle,
        v0,
        v0
    ]){
        uvs[offset] = u;
        uvs[offset + 1] = v;
        offset += 2;
    }
}
function $6fafcf15f6b61d60$var$generateTubeGeometry(stroke, options, out) {
    const isSquareBrush = options.generatorClass === "SquareBrush";
    stroke = $6fafcf15f6b61d60$var$retainGeometryBrushControlPoints(stroke, options, out, isSquareBrush);
    const storesRadius = options.geometryParams?.tubeStoreRadiusInTexcoord0Z === true;
    out.uv0Size = storesRadius ? 3 : 2;
    const pointCount = stroke.controlPoints.length;
    const segmentCount = Math.max(0, pointCount - 1);
    const sideCount = isSquareBrush ? 4 : $6fafcf15f6b61d60$var$normalizeTubeSideCount(options.geometryParams?.tubeSideCount);
    const hardEdges = isSquareBrush || options.geometryParams?.tubeHardEdges === true;
    const ringVertexCount = hardEdges ? sideCount * 2 : sideCount + 1;
    const hasCaps = pointCount >= 2 && options.geometryParams?.tubeEndCaps !== false;
    // A sharp turn can split every connection into its own capped section.
    // Reserve that upper bound, then publish only the counts actually written.
    const maximumSectionCount = segmentCount;
    const maximumCapVertexCount = hasCaps && !isSquareBrush ? maximumSectionCount * sideCount * 2 : 0;
    const maximumVertexCount = pointCount * ringVertexCount + maximumCapVertexCount;
    const maximumIndexCount = segmentCount * sideCount * 6 + (hasCaps ? maximumSectionCount * 2 * (isSquareBrush ? 6 : sideCount * 3) : 0);
    const reallocated = $6fafcf15f6b61d60$var$ensureGeometryCapacity(out, maximumVertexCount, maximumIndexCount);
    $6fafcf15f6b61d60$var$ensureTubeScratchCapacity(out, pointCount);
    $6fafcf15f6b61d60$var$ensureGeometryPressureCapacity(out, pointCount);
    $6fafcf15f6b61d60$var$prepareTubeSmoothedPressures(stroke, options, out);
    $6fafcf15f6b61d60$var$prepareGeometrySmoothedPositions(stroke, out);
    if (isSquareBrush) // SquareBrush frames and emits from point.m_Pos. Unlike TubeBrush, it does
    // not apply GeometryBrush's finalized three-point center smoothing.
    for(let pointIndex = 0; pointIndex < pointCount; pointIndex += 1)$6fafcf15f6b61d60$var$writeScratchVec3(out.geometrySmoothedPositions, pointIndex, stroke.controlPoints[pointIndex].position);
    const { positions: positions, normals: normals, tangents: tangents, colors: colors, uvs: uvs, packedUvs: packedUvs, indices: indices, bounds: bounds, tubeBreakBefore: tubeBreakBefore, tubeFrameRights: tubeFrameRights, tubeFrameUps: tubeFrameUps, tubeTangents: tubeTangents, tubeRadii: tubeRadii, tubeRingUs: tubeRingUs, tubeOpacities: tubeOpacities, tubeSmoothedPressures: tubeSmoothedPressures, geometrySmoothedPositions: geometrySmoothedPositions } = out;
    const pressureSizeMin = $6fafcf15f6b61d60$var$normalizePressureSizeMin(options.pressureSizeRange?.[0]);
    const pressureOpacityMin = $6fafcf15f6b61d60$var$normalizePressureOpacityMin(options.pressureOpacityRange);
    const pressureOpacityMax = $6fafcf15f6b61d60$var$normalizePressureOpacityMax(options.pressureOpacityRange);
    const descriptorOpacity = $6fafcf15f6b61d60$var$normalizeDescriptorOpacity(options.geometryParams?.opacity);
    const localBrushSize = $6fafcf15f6b61d60$var$getLocalBrushSize(stroke);
    const tileRate = $6fafcf15f6b61d60$var$normalizeTileRate(options.geometryParams?.tileRate);
    // The first TubeBrush knot starts writing at vertex zero and salts its
    // section UV offset with cur.iVert - 1.
    const random01 = $6fafcf15f6b61d60$var$statelessRandom01(stroke.seed, -1);
    const atlasRows = $6fafcf15f6b61d60$var$normalizeAtlasRows(options.geometryParams?.textureAtlasV);
    let atlasRow = Math.floor(random01 * 3331) % atlasRows;
    let v0 = atlasRow / atlasRows;
    let v1 = (atlasRow + 1) / atlasRows;
    const usesStretchUvs = options.geometryParams?.tubeUvStyle === "stretch";
    const capAspect = $6fafcf15f6b61d60$var$normalizeTubeCapAspect(options.geometryParams?.tubeCapAspect);
    const shapeModifier = $6fafcf15f6b61d60$var$normalizeTubeShapeModifier(options.geometryParams?.tubeShapeModifier);
    const breakAngleMultiplier = $6fafcf15f6b61d60$var$normalizeTubeBreakAngleMultiplier(options.geometryParams?.tubeBreakAngleMultiplier);
    const totalStrokeLength = $6fafcf15f6b61d60$var$measureScratchPathLength(geometrySmoothedPositions, pointCount);
    let runningDistance = 0;
    let u = random01;
    let sectionStartPoint = 0;
    let completedOpenBrushVertexCount = 0;
    // Frame state: right/up transported along the stroke by the tangent-to-
    // tangent rotation (MathUtils.ComputeMinimalRotationFrame), bootstrapped
    // from the pointer orientation on the first knot.
    const tangent = [
        0,
        0,
        0
    ];
    const previousTangent = [
        0,
        0,
        0
    ];
    const frameRight = [
        0,
        0,
        0
    ];
    const frameUp = [
        0,
        0,
        0
    ];
    const bootstrapUp = [
        0,
        0,
        0
    ];
    const priorFrameRight = [
        0,
        0,
        0
    ];
    const priorFrameUp = [
        0,
        0,
        0
    ];
    const radial = [
        0,
        0,
        0
    ];
    const displacement = [
        0,
        0,
        0
    ];
    const center = [
        0,
        0,
        0
    ];
    for(let pointIndex = 0; pointIndex < pointCount; pointIndex += 1){
        const point = stroke.controlPoints[pointIndex];
        $6fafcf15f6b61d60$var$readScratchVec3(geometrySmoothedPositions, pointIndex, center);
        const radius = localBrushSize * $6fafcf15f6b61d60$var$getPressureSizeMultiplier(tubeSmoothedPressures[pointIndex], pressureSizeMin) * 0.5;
        let segmentLength = 0;
        if (pointIndex > 0) {
            segmentLength = $6fafcf15f6b61d60$var$distanceBetweenScratchPoints(geometrySmoothedPositions, pointIndex - 1, pointIndex);
            runningDistance += segmentLength;
            const circumference = Math.max(2 * Math.PI * radius, $6fafcf15f6b61d60$var$EPSILON);
            u += segmentLength * tileRate / circumference;
        }
        const progress = totalStrokeLength > $6fafcf15f6b61d60$var$EPSILON ? runningDistance / totalStrokeLength : 0;
        const shapeScale = $6fafcf15f6b61d60$var$getTubeShapeScale(shapeModifier, progress, pointIndex, pointCount, options.geometryParams?.tubeTaperScalar, 0);
        const petalOffset = shapeModifier === 5 ? Math.pow(progress, $6fafcf15f6b61d60$var$normalizeTubePetalExponent(options.geometryParams?.tubePetalDisplacementExponent)) * $6fafcf15f6b61d60$var$normalizeTubePetalAmount(options.geometryParams?.tubePetalDisplacementAmount) * localBrushSize * tubeSmoothedPressures[pointIndex] : 0;
        const opacity = $6fafcf15f6b61d60$var$getPressureOpacityMultiplier(tubeSmoothedPressures[pointIndex], pressureOpacityMin, pressureOpacityMax) * descriptorOpacity;
        $6fafcf15f6b61d60$var$writeScratchIncomingTangent(geometrySmoothedPositions, pointCount, pointIndex, previousTangent, tangent);
        if (pointIndex === 0) $6fafcf15f6b61d60$var$initializeTubeFrame(point.orientation, tangent, bootstrapUp, frameRight, frameUp);
        else {
            $6fafcf15f6b61d60$var$copyVec3(frameRight, priorFrameRight);
            $6fafcf15f6b61d60$var$copyVec3(frameUp, priorFrameUp);
            $6fafcf15f6b61d60$var$rotateBetweenTangents(previousTangent, tangent, frameRight);
            $6fafcf15f6b61d60$var$rotateBetweenTangents(previousTangent, tangent, frameUp);
            const previousSectionContinues = tubeBreakBefore[pointIndex - 1] === 0;
            if (!previousSectionContinues) // The previous knot has no frame in TubeBrush. Seed the next valid
            // section from the current pointer orientation instead of transporting
            // the broken incoming frame.
            $6fafcf15f6b61d60$var$initializeTubeFrame(point.orientation, tangent, bootstrapUp, frameRight, frameUp);
            const pressuredDiameter = Math.max(radius * 2, $6fafcf15f6b61d60$var$EPSILON);
            const breakAngle = Math.atan(segmentLength / pressuredDiameter) * breakAngleMultiplier;
            const frameAngle = $6fafcf15f6b61d60$var$getFrameRotationAngle(priorFrameRight, priorFrameUp, previousTangent, frameRight, frameUp, tangent);
            if (segmentLength < $6fafcf15f6b61d60$var$OPEN_BRUSH_TUBE_MINIMUM_MOVE_METERS || pointIndex > 1 && previousSectionContinues && frameAngle > breakAngle) {
                tubeBreakBefore[pointIndex] = 1;
                $6fafcf15f6b61d60$var$initializeTubeFrame(point.orientation, tangent, bootstrapUp, frameRight, frameUp);
                const completedSectionPointCount = pointIndex - sectionStartPoint;
                completedOpenBrushVertexCount += completedSectionPointCount * ringVertexCount + (hasCaps && completedSectionPointCount > 1 ? sideCount * 2 : 0);
                sectionStartPoint = pointIndex;
                const sectionRandom01 = $6fafcf15f6b61d60$var$statelessRandom01(stroke.seed, completedOpenBrushVertexCount - 1);
                u = sectionRandom01;
                atlasRow = Math.floor(sectionRandom01 * 3331) % atlasRows;
                v0 = atlasRow / atlasRows;
                v1 = (atlasRow + 1) / atlasRows;
            }
        }
        previousTangent[0] = tangent[0];
        previousTangent[1] = tangent[1];
        previousTangent[2] = tangent[2];
        const ringU = usesStretchUvs ? pointIndex / Math.max(pointCount - 1, 1) : u;
        $6fafcf15f6b61d60$var$writeScratchVec3(tubeFrameRights, pointIndex, frameRight);
        $6fafcf15f6b61d60$var$writeScratchVec3(tubeFrameUps, pointIndex, frameUp);
        $6fafcf15f6b61d60$var$writeScratchVec3(tubeTangents, pointIndex, tangent);
        tubeRadii[pointIndex] = radius;
        tubeRingUs[pointIndex] = ringU;
        tubeOpacities[pointIndex] = opacity;
        const ringBase = pointIndex * ringVertexCount;
        if (hardEdges) {
            const halfStep = Math.PI / sideCount;
            for(let side = 0; side < sideCount; side += 1){
                const angle = side / sideCount * Math.PI * 2 + (isSquareBrush ? Math.PI / 4 : 0);
                $6fafcf15f6b61d60$var$setTubeRadialScaled(frameRight, frameUp, angle, isSquareBrush ? 0.375 : 1, radial);
                if (isSquareBrush) {
                    radial[0] *= Math.SQRT2;
                    radial[1] *= Math.SQRT2;
                    radial[2] *= Math.SQRT2;
                }
                $6fafcf15f6b61d60$var$copyVec3(radial, displacement);
                for(let duplicate = 0; duplicate < 2; duplicate += 1){
                    const vertex = ringBase + side * 2 + duplicate;
                    $6fafcf15f6b61d60$var$setTubeRadial(frameRight, frameUp, angle + (duplicate === 0 ? -halfStep : halfStep), radial);
                    $6fafcf15f6b61d60$var$writePosition(positions, vertex, [
                        center[0] + displacement[0] * radius * shapeScale + radial[0] * petalOffset,
                        center[1] + displacement[1] * radius * shapeScale + radial[1] * petalOffset,
                        center[2] + displacement[2] * radius * shapeScale + radial[2] * petalOffset
                    ]);
                    $6fafcf15f6b61d60$var$writeNormal(normals, vertex, radial);
                    // TubeBrush.MakeClosedCircleHardEdges stores the undisplaced radial
                    // direction as the tangent; the two duplicated vertices only differ
                    // in their face normals.
                    $6fafcf15f6b61d60$var$writeTangent(tangents, vertex, displacement, -1);
                    $6fafcf15f6b61d60$var$writeColor(colors, vertex, stroke.color, opacity);
                    const vFraction = side === 0 && duplicate === 0 ? 1 : side / sideCount;
                    const v = v0 + (v1 - v0) * vFraction;
                    $6fafcf15f6b61d60$var$writeUv(uvs, vertex, isSquareBrush ? [
                        0.5,
                        0.5
                    ] : [
                        ringU,
                        v
                    ]);
                    if (storesRadius) $6fafcf15f6b61d60$var$writePackedUv(packedUvs, vertex, ringU, v, radius);
                    $6fafcf15f6b61d60$var$includeBounds(bounds, positions, vertex);
                    $6fafcf15f6b61d60$var$setTubeRadial(frameRight, frameUp, angle, radial);
                }
            }
        } else for(let ringIndex = 0; ringIndex < ringVertexCount; ringIndex += 1){
            const vertex = ringBase + ringIndex;
            const fraction = ringIndex / sideCount;
            const angle = ringIndex === sideCount ? 0 : fraction * Math.PI * 2;
            $6fafcf15f6b61d60$var$setTubeRadial(frameRight, frameUp, angle, radial);
            $6fafcf15f6b61d60$var$writePosition(positions, vertex, [
                center[0] + radial[0] * (radius * shapeScale + petalOffset),
                center[1] + radial[1] * (radius * shapeScale + petalOffset),
                center[2] + radial[2] * (radius * shapeScale + petalOffset)
            ]);
            $6fafcf15f6b61d60$var$writeNormal(normals, vertex, radial);
            $6fafcf15f6b61d60$var$writeTangent(tangents, vertex, tangent, -1);
            $6fafcf15f6b61d60$var$writeColor(colors, vertex, stroke.color, opacity);
            const v = v0 + (v1 - v0) * fraction;
            $6fafcf15f6b61d60$var$writeUv(uvs, vertex, [
                ringU,
                v
            ]);
            if (storesRadius) $6fafcf15f6b61d60$var$writePackedUv(packedUvs, vertex, ringU, v, radius);
            $6fafcf15f6b61d60$var$includeBounds(bounds, positions, vertex);
        }
    }
    if (isSquareBrush) {
        $6fafcf15f6b61d60$var$prepareSquareBrushBreaks(out, stroke, pointCount, localBrushSize, pressureSizeMin);
        $6fafcf15f6b61d60$var$rewriteSquareBrushFrames(out, stroke, pointCount, ringVertexCount, sideCount);
    }
    // A broken knot has no geometry in TubeBrush. The following valid knot
    // creates both its own front ring and the broken knot's back ring using the
    // following knot's frame. Correct the retained back-ring frame now that the
    // next valid frame is known, then rebuild ring attributes from those frames.
    let correctedBreakFrame = false;
    for(let pointIndex = 0; pointIndex + 1 < pointCount; pointIndex += 1){
        if (tubeBreakBefore[pointIndex] !== 1 || tubeBreakBefore[pointIndex + 1] === 1) continue;
        $6fafcf15f6b61d60$var$copyScratchVec3(tubeFrameRights, pointIndex + 1, pointIndex);
        $6fafcf15f6b61d60$var$copyScratchVec3(tubeFrameUps, pointIndex + 1, pointIndex);
        $6fafcf15f6b61d60$var$copyScratchVec3(tubeTangents, pointIndex + 1, pointIndex);
        correctedBreakFrame = true;
    }
    if (correctedBreakFrame) $6fafcf15f6b61d60$var$rewriteTubeRingFrames(out, stroke, pointCount, ringVertexCount, sideCount, hardEdges, isSquareBrush);
    if (shapeModifier !== 0 || usesStretchUvs) $6fafcf15f6b61d60$var$applyTubeSectionShapeAndUvs(out, stroke, pointCount, ringVertexCount, sideCount, hardEdges, isSquareBrush, shapeModifier, options.geometryParams?.tubeTaperScalar, options.geometryParams?.tubePetalDisplacementAmount, options.geometryParams?.tubePetalDisplacementExponent, localBrushSize, usesStretchUvs, pressureSizeMin, options.geometryParams?.solidMinLengthMeters);
    let indexOffset = 0;
    for(let segment = 0; segment < segmentCount; segment += 1){
        if (tubeBreakBefore[segment + 1] === 1) continue;
        const firstRing = segment * ringVertexCount;
        const secondRing = firstRing + ringVertexCount;
        for(let side = 0; side < sideCount; side += 1){
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
        for(let boundary = 1; boundary <= pointCount; boundary += 1){
            const sectionEnds = boundary === pointCount || tubeBreakBefore[boundary] === 1;
            if (!sectionEnds) continue;
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
        const capRadial = [
            0,
            0,
            0
        ];
        const capTip = [
            0,
            0,
            0
        ];
        const capTangent = [
            0,
            0,
            0
        ];
        const capRight = [
            0,
            0,
            0
        ];
        const capUp = [
            0,
            0,
            0
        ];
        let sectionStart = 0;
        for(let boundary = 1; boundary <= pointCount; boundary += 1){
            const sectionEnds = boundary === pointCount || tubeBreakBefore[boundary] === 1;
            if (!sectionEnds) continue;
            const sectionEnd = boundary - 1;
            if (sectionEnd > sectionStart) for(let capIndex = 0; capIndex < 2; capIndex += 1){
                const isStart = capIndex === 0;
                const pointIndex = isStart ? sectionStart : sectionEnd;
                $6fafcf15f6b61d60$var$readScratchVec3(geometrySmoothedPositions, pointIndex, center);
                const capBase = pointCount * ringVertexCount + capVertexCount;
                capVertexCount += sideCount;
                const ringBase = pointIndex * ringVertexCount;
                $6fafcf15f6b61d60$var$readScratchVec3(tubeTangents, pointIndex, capTangent);
                $6fafcf15f6b61d60$var$readScratchVec3(tubeFrameRights, pointIndex, capRight);
                $6fafcf15f6b61d60$var$readScratchVec3(tubeFrameUps, pointIndex, capUp);
                const radius = tubeRadii[pointIndex];
                const ringU = tubeRingUs[pointIndex];
                const opacity = tubeOpacities[pointIndex];
                const capV0 = 1 - uvs[(ringBase + (hardEdges ? 1 : 0)) * 2 + 1];
                const capV1 = 1 - uvs[(ringBase + (hardEdges ? 0 : ringVertexCount - 1)) * 2 + 1];
                const direction = isStart ? -1 : 1;
                capTip[0] = center[0] + capTangent[0] * radius * capAspect * direction;
                capTip[1] = center[1] + capTangent[1] * radius * capAspect * direction;
                capTip[2] = center[2] + capTangent[2] * radius * capAspect * direction;
                const diagonal = radius * Math.hypot(1, capAspect);
                const uRate = tileRate / Math.max(2 * Math.PI * radius, $6fafcf15f6b61d60$var$EPSILON);
                const capU = usesStretchUvs ? ringU : ringU + direction * uRate * diagonal;
                // TubeBrush derives this from Mathf.Sign(dot(tip - center, fwd)).
                // Unity's Mathf.Sign(0) is +1, so a zero-aspect start cap has the
                // same forward normal as the coincident end cap.
                const capNormalDirection = isStart && capAspect !== 0 ? -1 : 1;
                for(let side = 0; side < sideCount; side += 1){
                    const vertex = capBase + side;
                    const fraction = (side + 0.5) / sideCount;
                    $6fafcf15f6b61d60$var$setTubeRadial(capRight, capUp, fraction * Math.PI * 2, capRadial);
                    $6fafcf15f6b61d60$var$writePosition(positions, vertex, capTip);
                    $6fafcf15f6b61d60$var$writeNormal(normals, vertex, hardEdges ? capRadial : [
                        capTangent[0] * capNormalDirection,
                        capTangent[1] * capNormalDirection,
                        capTangent[2] * capNormalDirection
                    ]);
                    $6fafcf15f6b61d60$var$writeTangent(tangents, vertex, capRadial, -1);
                    $6fafcf15f6b61d60$var$writeColor(colors, vertex, stroke.color, opacity);
                    const v = capV0 + (capV1 - capV0) * fraction;
                    $6fafcf15f6b61d60$var$writeUv(uvs, vertex, isSquareBrush ? [
                        0.5,
                        0.5
                    ] : [
                        capU,
                        v
                    ]);
                    if (storesRadius) $6fafcf15f6b61d60$var$writePackedUv(packedUvs, vertex, capU, v, 0);
                    $6fafcf15f6b61d60$var$includeBounds(bounds, positions, vertex);
                    const first = hardEdges ? side * 2 + 1 : side;
                    const next = hardEdges ? (first + 1) % ringVertexCount : side + 1;
                    indices[indexOffset] = vertex;
                    indices[indexOffset + 1] = ringBase + (isStart ? first : next);
                    indices[indexOffset + 2] = ringBase + (isStart ? next : first);
                    indexOffset += 3;
                }
            }
            sectionStart = boundary;
        }
    }
    if (isSquareBrush) indexOffset = $6fafcf15f6b61d60$var$packSquareBrushLikeOpenBrush(out, pointCount);
    else indexOffset = $6fafcf15f6b61d60$var$packTubeLikeOpenBrush(out, pointCount, ringVertexCount, sideCount, hardEdges, hasCaps, capVertexCount, storesRadius);
    out.family = "tube";
    out.vertexCount = pointCount * ringVertexCount + capVertexCount;
    out.indexCount = indexOffset;
    return reallocated;
}
const $6fafcf15f6b61d60$var$SQUARE_BRUSH_VERTEX_REMAP = [
    0,
    1,
    4,
    5,
    3,
    2,
    7,
    6
];
const $6fafcf15f6b61d60$var$SQUARE_BRUSH_SIDE_TRIANGLES = [
    4,
    12,
    2,
    12,
    10,
    2,
    5,
    1,
    13,
    1,
    9,
    13,
    7,
    3,
    15,
    3,
    11,
    15,
    6,
    14,
    0,
    14,
    8,
    0
];
const $6fafcf15f6b61d60$var$SQUARE_BRUSH_START_CAP_TRIANGLES = [
    5,
    3,
    1,
    3,
    7,
    1
];
const $6fafcf15f6b61d60$var$SQUARE_BRUSH_END_CAP_TRIANGLES = [
    13,
    9,
    11,
    9,
    15,
    11
];
function $6fafcf15f6b61d60$var$packSquareBrushLikeOpenBrush(out, pointCount) {
    // SquareBrush names/order: bottom-right bottom/right, top-left top/left,
    // top-right top/right, bottom-left bottom/left.
    const vertexCount = pointCount * 8;
    const channels = [
        [
            out.positions,
            3
        ],
        [
            out.normals,
            3
        ],
        [
            out.tangents,
            4
        ],
        [
            out.colors,
            4
        ],
        [
            out.uvs,
            2
        ]
    ];
    for (const [channel, itemSize] of channels){
        for(let pointIndex = 0; pointIndex < pointCount; pointIndex += 1){
            const ringBase = pointIndex * 8;
            for(let vertex = 0; vertex < 8; vertex += 1)out.indices[ringBase + vertex] = ringBase + $6fafcf15f6b61d60$var$SQUARE_BRUSH_VERTEX_REMAP[vertex];
        }
        $6fafcf15f6b61d60$var$permuteVertexChannel(channel, itemSize, vertexCount, out.indices);
    }
    let indexOffset = 0;
    for(let segment = 0; segment + 1 < pointCount; segment += 1){
        if (out.tubeBreakBefore[segment + 1] === 1) continue;
        const back = segment * 8;
        for (const offset of $6fafcf15f6b61d60$var$SQUARE_BRUSH_SIDE_TRIANGLES)out.indices[indexOffset++] = back + offset;
        const startsSection = segment === 0 || out.tubeBreakBefore[segment] === 1;
        if (startsSection) for (const offset of $6fafcf15f6b61d60$var$SQUARE_BRUSH_START_CAP_TRIANGLES)out.indices[indexOffset++] = back + offset;
        const endsSection = segment + 2 === pointCount || out.tubeBreakBefore[segment + 2] === 1;
        if (endsSection) for (const offset of $6fafcf15f6b61d60$var$SQUARE_BRUSH_END_CAP_TRIANGLES)out.indices[indexOffset++] = back + offset;
    }
    return indexOffset;
}
/**
 * TubeBrush appends one complete section at a time: start cap, all closed
 * circles, then end cap. The generator builds rings first because that keeps
 * the live frame pass simple, so finalize into the source vertex and triangle
 * order before publishing the buffers.
 */ function $6fafcf15f6b61d60$var$packTubeLikeOpenBrush(out, pointCount, ringVertexCount, sideCount, hardEdges, hasCaps, capVertexCount, storesRadius) {
    const vertexCount = pointCount * ringVertexCount + capVertexCount;
    const channels = [
        [
            out.positions,
            3
        ],
        [
            out.normals,
            3
        ],
        [
            out.tangents,
            4
        ],
        [
            out.colors,
            4
        ],
        [
            out.uvs,
            2
        ],
        [
            out.packedUvs,
            3
        ]
    ];
    for (const [channel, itemSize] of channels){
        $6fafcf15f6b61d60$var$buildTubeOpenBrushVertexMap(out, pointCount, ringVertexCount, sideCount, hasCaps, capVertexCount);
        $6fafcf15f6b61d60$var$permuteVertexChannel(channel, itemSize, vertexCount, out.indices);
    }
    // Keep the unused UV representation deterministic too. Only one is exposed,
    // but both share the reusable geometry storage across brush changes.
    if (!storesRadius) out.packedUvs.fill(0, 0, vertexCount * 3);
    let indexOffset = 0;
    let sectionStart = 0;
    for(let boundary = 1; boundary <= pointCount; boundary += 1){
        const sectionEnds = boundary === pointCount || out.tubeBreakBefore[boundary] === 1;
        if (!sectionEnds) continue;
        const sectionEnd = boundary - 1;
        if (sectionEnd > sectionStart) {
            const startRing = out.tubeRingUs[sectionStart];
            if (hasCaps) {
                const startCap = startRing - sideCount;
                for(let side = 0; side < sideCount; side += 1){
                    const first = hardEdges ? side * 2 + 1 : side;
                    const next = hardEdges ? (first + 1) % ringVertexCount : side + 1;
                    out.indices[indexOffset] = startCap + side;
                    out.indices[indexOffset + 1] = startRing + next;
                    out.indices[indexOffset + 2] = startRing + first;
                    indexOffset += 3;
                }
            }
            for(let pointIndex = sectionStart; pointIndex < sectionEnd; pointIndex += 1){
                const backRing = out.tubeRingUs[pointIndex];
                const frontRing = out.tubeRingUs[pointIndex + 1];
                for(let side = 0; side < sideCount; side += 1){
                    const first = hardEdges ? side * 2 + 1 : side;
                    const next = hardEdges ? (first + 1) % ringVertexCount : side + 1;
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
                for(let side = 0; side < sideCount; side += 1){
                    const first = hardEdges ? side * 2 + 1 : side;
                    const next = hardEdges ? (first + 1) % ringVertexCount : side + 1;
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
function $6fafcf15f6b61d60$var$buildTubeOpenBrushVertexMap(out, pointCount, ringVertexCount, sideCount, hasCaps, capVertexCount) {
    const firstCapVertex = pointCount * ringVertexCount;
    let newVertex = 0;
    let oldCapVertex = firstCapVertex;
    let sectionStart = 0;
    for(let boundary = 1; boundary <= pointCount; boundary += 1){
        const sectionEnds = boundary === pointCount || out.tubeBreakBefore[boundary] === 1;
        if (!sectionEnds) continue;
        const sectionEnd = boundary - 1;
        const hasSectionGeometry = sectionEnd > sectionStart;
        if (hasCaps && hasSectionGeometry) for(let side = 0; side < sideCount; side += 1)out.indices[newVertex++] = oldCapVertex++;
        for(let pointIndex = sectionStart; pointIndex <= sectionEnd; pointIndex += 1){
            out.tubeRingUs[pointIndex] = newVertex;
            const oldRing = pointIndex * ringVertexCount;
            for(let ringVertex = 0; ringVertex < ringVertexCount; ringVertex += 1)out.indices[newVertex++] = oldRing + ringVertex;
        }
        if (hasCaps && hasSectionGeometry) for(let side = 0; side < sideCount; side += 1)out.indices[newVertex++] = oldCapVertex++;
        sectionStart = boundary;
    }
    if (newVertex !== pointCount * ringVertexCount + capVertexCount) throw new Error("Tube vertex packing did not account for every generated vertex.");
}
function $6fafcf15f6b61d60$var$permuteVertexChannel(channel, itemSize, vertexCount, newToOld) {
    for(let start = 0; start < vertexCount; start += 1){
        if (newToOld[start] === start) continue;
        const startOffset = start * itemSize;
        const saved0 = channel[startOffset];
        const saved1 = channel[startOffset + 1];
        const saved2 = channel[startOffset + 2];
        const saved3 = channel[startOffset + 3];
        let destination = start;
        while(newToOld[destination] !== start){
            const source = newToOld[destination];
            const destinationOffset = destination * itemSize;
            const sourceOffset = source * itemSize;
            for(let component = 0; component < itemSize; component += 1)channel[destinationOffset + component] = channel[sourceOffset + component];
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
function $6fafcf15f6b61d60$var$retainGeometryBrushControlPoints(stroke, options, out, isSquareBrush) {
    const source = stroke.controlPoints;
    if (source.length < 2) return stroke;
    const retained = out.tubeRetainedControlPoints;
    retained.length = 0;
    retained.push(source[0]);
    let lastRetained = source[0];
    const pressureSizeMin = $6fafcf15f6b61d60$var$normalizePressureSizeMin(options.pressureSizeRange?.[0]);
    const localBrushSize = $6fafcf15f6b61d60$var$getLocalBrushSize(stroke);
    const configuredSolidMinimum = options.geometryParams?.solidMinLengthMeters;
    const solidMinimum = typeof configuredSolidMinimum === "number" && Number.isFinite(configuredSolidMinimum) ? Math.max(0, configuredSolidMinimum) : isSquareBrush ? 0.002 : $6fafcf15f6b61d60$var$OPEN_BRUSH_TUBE_MINIMUM_MOVE_METERS;
    for(let pointIndex = 1; pointIndex < source.length; pointIndex += 1){
        const point = source[pointIndex];
        const deltaX = point.position[0] - lastRetained.position[0];
        const deltaY = point.position[1] - lastRetained.position[1];
        const deltaZ = point.position[2] - lastRetained.position[2];
        const spawnInterval = solidMinimum + localBrushSize * $6fafcf15f6b61d60$var$getPressureSizeMultiplier(point.pressure, pressureSizeMin) * $6fafcf15f6b61d60$var$TUBE_SOLID_ASPECT_RATIO;
        // GeometryBrush always renders its current leading knot. A sub-interval
        // interior update is later overwritten, while the final update remains as
        // the trailing provisional knot even when it was not promoted to a keeper.
        if (pointIndex + 1 === source.length || Math.hypot(deltaX, deltaY, deltaZ) > spawnInterval) {
            retained.push(point);
            lastRetained = point;
        }
    }
    return retained.length === source.length ? stroke : {
        ...stroke,
        controlPoints: retained
    };
}
function $6fafcf15f6b61d60$var$prepareSquareBrushBreaks(out, stroke, pointCount, localBrushSize, pressureSizeMin) {
    out.tubeBreakBefore.fill(0, 0, pointCount);
    const previousMove = [
        0,
        0,
        0
    ];
    const move = [
        0,
        0,
        0
    ];
    let previousHasGeometry = false;
    for(let pointIndex = 1; pointIndex < pointCount; pointIndex += 1){
        const previous = stroke.controlPoints[pointIndex - 1].position;
        const current = stroke.controlPoints[pointIndex].position;
        move[0] = current[0] - previous[0];
        move[1] = current[1] - previous[1];
        move[2] = current[2] - previous[2];
        const length = Math.hypot(move[0], move[1], move[2]);
        let shouldBreak = length < $6fafcf15f6b61d60$var$OPEN_BRUSH_TUBE_MINIMUM_MOVE_METERS;
        if (!shouldBreak && previousHasGeometry && pointIndex > 1) {
            const beforePrevious = stroke.controlPoints[pointIndex - 2].position;
            previousMove[0] = previous[0] - beforePrevious[0];
            previousMove[1] = previous[1] - beforePrevious[1];
            previousMove[2] = previous[2] - beforePrevious[2];
            $6fafcf15f6b61d60$var$normalizeInPlace(previousMove);
            move[0] /= length;
            move[1] /= length;
            move[2] /= length;
            const movementAngle = Math.acos(Math.min(1, Math.max(-1, $6fafcf15f6b61d60$var$dot(previousMove, move))));
            const pressuredSize = Math.max(localBrushSize * $6fafcf15f6b61d60$var$getPressureSizeMultiplier(out.tubeSmoothedPressures[pointIndex], pressureSizeMin), $6fafcf15f6b61d60$var$EPSILON);
            const breakAngle = Math.atan(length / pressuredSize) * 2;
            shouldBreak = movementAngle > breakAngle;
        }
        if (shouldBreak) out.tubeBreakBefore[pointIndex] = 1;
        previousHasGeometry = !shouldBreak;
    }
}
function $6fafcf15f6b61d60$var$rewriteSquareBrushFrames(out, stroke, pointCount, ringVertexCount, sideCount) {
    const tangent = [
        0,
        0,
        0
    ];
    const right = [
        0,
        0,
        0
    ];
    const surface = [
        0,
        0,
        0
    ];
    const preferredRight = [
        0,
        0,
        0
    ];
    const pointerForward = [
        0,
        0,
        0
    ];
    const pointerUp = [
        0,
        0,
        0
    ];
    for(let pointIndex = 1; pointIndex < pointCount; pointIndex += 1){
        if (out.tubeBreakBefore[pointIndex] === 1) {
            preferredRight[0] = 0;
            preferredRight[1] = 0;
            preferredRight[2] = 0;
            continue;
        }
        const previous = stroke.controlPoints[pointIndex - 1].position;
        const point = stroke.controlPoints[pointIndex];
        tangent[0] = point.position[0] - previous[0];
        tangent[1] = point.position[1] - previous[1];
        tangent[2] = point.position[2] - previous[2];
        if (!$6fafcf15f6b61d60$var$normalizeInPlace(tangent)) continue;
        $6fafcf15f6b61d60$var$rotateByQuaternion(point.orientation, $6fafcf15f6b61d60$var$VEC_FORWARD, pointerForward);
        $6fafcf15f6b61d60$var$rotateByQuaternion(point.orientation, $6fafcf15f6b61d60$var$VEC_UP, pointerUp);
        const startsSection = pointIndex === 1 || out.tubeBreakBefore[pointIndex - 1] === 1;
        $6fafcf15f6b61d60$var$computeSurfaceFrame(preferredRight, tangent, pointerForward, pointerUp, startsSection, right, surface, true);
        $6fafcf15f6b61d60$var$writeScratchVec3(out.tubeFrameRights, pointIndex, right);
        $6fafcf15f6b61d60$var$writeScratchVec3(out.tubeFrameUps, pointIndex, surface);
        $6fafcf15f6b61d60$var$writeScratchVec3(out.tubeTangents, pointIndex, tangent);
        if (startsSection) {
            $6fafcf15f6b61d60$var$writeScratchVec3(out.tubeFrameRights, pointIndex - 1, right);
            $6fafcf15f6b61d60$var$writeScratchVec3(out.tubeFrameUps, pointIndex - 1, surface);
            $6fafcf15f6b61d60$var$writeScratchVec3(out.tubeTangents, pointIndex - 1, tangent);
        }
        preferredRight[0] = right[0];
        preferredRight[1] = right[1];
        preferredRight[2] = right[2];
    }
    $6fafcf15f6b61d60$var$rewriteTubeRingFrames(out, stroke, pointCount, ringVertexCount, sideCount, true, true);
}
function $6fafcf15f6b61d60$var$rewriteTubeRingFrames(out, stroke, pointCount, ringVertexCount, sideCount, hardEdges, isSquareBrush) {
    const center = [
        0,
        0,
        0
    ];
    const frameRight = [
        0,
        0,
        0
    ];
    const frameUp = [
        0,
        0,
        0
    ];
    const tangent = [
        0,
        0,
        0
    ];
    const radial = [
        0,
        0,
        0
    ];
    const displacement = [
        0,
        0,
        0
    ];
    $6fafcf15f6b61d60$var$resetBounds(out.bounds);
    for(let pointIndex = 0; pointIndex < pointCount; pointIndex += 1){
        $6fafcf15f6b61d60$var$readScratchVec3(out.geometrySmoothedPositions, pointIndex, center);
        $6fafcf15f6b61d60$var$readScratchVec3(out.tubeFrameRights, pointIndex, frameRight);
        $6fafcf15f6b61d60$var$readScratchVec3(out.tubeFrameUps, pointIndex, frameUp);
        $6fafcf15f6b61d60$var$readScratchVec3(out.tubeTangents, pointIndex, tangent);
        const radius = out.tubeRadii[pointIndex];
        const ringBase = pointIndex * ringVertexCount;
        if (hardEdges) {
            const halfStep = Math.PI / sideCount;
            for(let side = 0; side < sideCount; side += 1){
                const angle = side / sideCount * Math.PI * 2 + (isSquareBrush ? Math.PI / 4 : 0);
                $6fafcf15f6b61d60$var$setTubeRadialScaled(frameRight, frameUp, angle, isSquareBrush ? 0.375 : 1, displacement);
                if (isSquareBrush) {
                    displacement[0] *= Math.SQRT2;
                    displacement[1] *= Math.SQRT2;
                    displacement[2] *= Math.SQRT2;
                }
                for(let duplicate = 0; duplicate < 2; duplicate += 1){
                    const vertex = ringBase + side * 2 + duplicate;
                    $6fafcf15f6b61d60$var$setTubeRadial(frameRight, frameUp, angle + (duplicate === 0 ? -halfStep : halfStep), radial);
                    $6fafcf15f6b61d60$var$writePositionComponents(out.positions, vertex, center[0] + displacement[0] * radius, center[1] + displacement[1] * radius, center[2] + displacement[2] * radius);
                    $6fafcf15f6b61d60$var$writeNormal(out.normals, vertex, radial);
                    $6fafcf15f6b61d60$var$writeTangent(out.tangents, vertex, displacement, -1);
                    $6fafcf15f6b61d60$var$includeBounds(out.bounds, out.positions, vertex);
                }
            }
        } else for(let ringIndex = 0; ringIndex < ringVertexCount; ringIndex += 1){
            const vertex = ringBase + ringIndex;
            const fraction = ringIndex / sideCount;
            const angle = ringIndex === sideCount ? 0 : fraction * Math.PI * 2;
            $6fafcf15f6b61d60$var$setTubeRadial(frameRight, frameUp, angle, radial);
            $6fafcf15f6b61d60$var$writePositionComponents(out.positions, vertex, center[0] + radial[0] * radius, center[1] + radial[1] * radius, center[2] + radial[2] * radius);
            $6fafcf15f6b61d60$var$writeNormal(out.normals, vertex, radial);
            $6fafcf15f6b61d60$var$writeTangent(out.tangents, vertex, tangent, -1);
            $6fafcf15f6b61d60$var$includeBounds(out.bounds, out.positions, vertex);
        }
    }
}
function $6fafcf15f6b61d60$var$applyTubeSectionShapeAndUvs(out, stroke, pointCount, ringVertexCount, sideCount, hardEdges, isSquareBrush, shapeModifier, taperScalar, petalAmount, petalExponent, localBrushSize, usesStretchUvs, pressureSizeMin, solidMinLengthMeters) {
    const center = [
        0,
        0,
        0
    ];
    const frameRight = [
        0,
        0,
        0
    ];
    const frameUp = [
        0,
        0,
        0
    ];
    const radial = [
        0,
        0,
        0
    ];
    const displacement = [
        0,
        0,
        0
    ];
    if (shapeModifier !== 0) $6fafcf15f6b61d60$var$resetBounds(out.bounds);
    let sectionStart = 0;
    for(let boundary = 1; boundary <= pointCount; boundary += 1){
        if (boundary < pointCount && out.tubeBreakBefore[boundary] !== 1) continue;
        const sectionEnd = boundary - 1;
        const sectionPointCount = sectionEnd - sectionStart + 1;
        let sectionLength = 0;
        for(let pointIndex = sectionStart + 1; pointIndex <= sectionEnd; pointIndex += 1)sectionLength += $6fafcf15f6b61d60$var$distanceBetweenScratchPoints(out.geometrySmoothedPositions, pointIndex - 1, pointIndex);
        let runningLength = 0;
        const lastLength = sectionPointCount > 1 ? $6fafcf15f6b61d60$var$distanceBetweenControlPoints(stroke.controlPoints[sectionEnd - 1], stroke.controlPoints[sectionEnd]) : 0;
        const lastPressuredSize = localBrushSize * $6fafcf15f6b61d60$var$getPressureSizeMultiplier(out.tubeSmoothedPressures[sectionEnd], pressureSizeMin);
        const solidMinimum = typeof solidMinLengthMeters === "number" && Number.isFinite(solidMinLengthMeters) ? Math.max(0, solidMinLengthMeters) : 0;
        const loftedPartialProgress = $6fafcf15f6b61d60$var$clamp01(lastLength / Math.max(solidMinimum + lastPressuredSize * $6fafcf15f6b61d60$var$TUBE_SOLID_ASPECT_RATIO, $6fafcf15f6b61d60$var$EPSILON));
        for(let pointIndex = sectionStart; pointIndex <= sectionEnd; pointIndex += 1){
            if (pointIndex > sectionStart) runningLength += $6fafcf15f6b61d60$var$distanceBetweenScratchPoints(out.geometrySmoothedPositions, pointIndex - 1, pointIndex);
            const localIndex = pointIndex - sectionStart;
            const progress = sectionLength > $6fafcf15f6b61d60$var$EPSILON ? runningLength / sectionLength : 0;
            const sectionSegmentCount = Math.max(sectionPointCount - 1, 1);
            const ringU = usesStretchUvs ? Math.min(localIndex, sectionSegmentCount - 1) / sectionSegmentCount : out.tubeRingUs[pointIndex];
            out.tubeRingUs[pointIndex] = ringU;
            const ringBase = pointIndex * ringVertexCount;
            for(let ringIndex = 0; ringIndex < ringVertexCount; ringIndex += 1){
                const vertex = ringBase + ringIndex;
                if (usesStretchUvs) {
                    out.uvs[vertex * 2] = ringU;
                    if (out.uv0Size === 3) out.packedUvs[vertex * 3] = ringU;
                }
            }
            if (shapeModifier === 0) continue;
            // ModifySilhouetteOfSegment processes a geometry knot's shared back ring
            // and its newly-created front ring together. A later knot therefore
            // rewrites the preceding ring using the later knot's center, radius, and
            // curve parameter; only the displacement direction remains attached to
            // the original vertex.
            const ownerPointIndex = Math.min(pointIndex + 1, sectionEnd);
            const ownerLocalIndex = ownerPointIndex - sectionStart;
            const ownerRunningLength = ownerPointIndex === pointIndex ? runningLength : runningLength + $6fafcf15f6b61d60$var$distanceBetweenScratchPoints(out.geometrySmoothedPositions, pointIndex, ownerPointIndex);
            const ownerProgress = sectionLength > $6fafcf15f6b61d60$var$EPSILON ? ownerRunningLength / sectionLength : 0;
            $6fafcf15f6b61d60$var$readScratchVec3(out.geometrySmoothedPositions, ownerPointIndex, center);
            $6fafcf15f6b61d60$var$readScratchVec3(out.tubeFrameRights, pointIndex, frameRight);
            $6fafcf15f6b61d60$var$readScratchVec3(out.tubeFrameUps, pointIndex, frameUp);
            const radius = out.tubeRadii[ownerPointIndex];
            const shapeScale = $6fafcf15f6b61d60$var$getTubeShapeScale(shapeModifier, ownerProgress, Math.max(0, ownerLocalIndex - 1), Math.max(0, sectionPointCount - 1), taperScalar, loftedPartialProgress);
            const petalOffset = shapeModifier === 5 ? Math.pow(ownerProgress, $6fafcf15f6b61d60$var$normalizeTubePetalExponent(petalExponent)) * $6fafcf15f6b61d60$var$normalizeTubePetalAmount(petalAmount) * localBrushSize * out.tubeSmoothedPressures[ownerPointIndex] : 0;
            if (hardEdges) {
                const halfStep = Math.PI / sideCount;
                for(let side = 0; side < sideCount; side += 1){
                    const angle = side / sideCount * Math.PI * 2 + (isSquareBrush ? Math.PI / 4 : 0);
                    $6fafcf15f6b61d60$var$setTubeRadialScaled(frameRight, frameUp, angle, isSquareBrush ? 0.375 : 1, displacement);
                    for(let duplicate = 0; duplicate < 2; duplicate += 1){
                        const vertex = ringBase + side * 2 + duplicate;
                        $6fafcf15f6b61d60$var$setTubeRadial(frameRight, frameUp, angle + (duplicate === 0 ? -halfStep : halfStep), radial);
                        $6fafcf15f6b61d60$var$writePositionComponents(out.positions, vertex, center[0] + displacement[0] * radius * shapeScale + radial[0] * petalOffset, center[1] + displacement[1] * radius * shapeScale + radial[1] * petalOffset, center[2] + displacement[2] * radius * shapeScale + radial[2] * petalOffset);
                        $6fafcf15f6b61d60$var$includeBounds(out.bounds, out.positions, vertex);
                    }
                }
            } else for(let ringIndex = 0; ringIndex < ringVertexCount; ringIndex += 1){
                const vertex = ringBase + ringIndex;
                const fraction = ringIndex / sideCount;
                const angle = ringIndex === sideCount ? 0 : fraction * Math.PI * 2;
                $6fafcf15f6b61d60$var$setTubeRadial(frameRight, frameUp, angle, radial);
                $6fafcf15f6b61d60$var$writePositionComponents(out.positions, vertex, center[0] + radial[0] * (radius * shapeScale + petalOffset), center[1] + radial[1] * (radius * shapeScale + petalOffset), center[2] + radial[2] * (radius * shapeScale + petalOffset));
                $6fafcf15f6b61d60$var$includeBounds(out.bounds, out.positions, vertex);
            }
        }
        sectionStart = boundary;
    }
}
function $6fafcf15f6b61d60$var$generateParticleGeometry(stroke, options, out) {
    if (options.generatorClass === "GeniusParticlesBrush") return $6fafcf15f6b61d60$var$generateGeniusParticleGeometry(stroke, options, out);
    if (options.generatorClass === "SprayBrush" || options.generatorClass === "MidpointPlusLifetimeSprayBrush") return $6fafcf15f6b61d60$var$generateSprayParticleGeometry(stroke, options, out);
    out.uv0Size = 2;
    const pointCount = stroke.controlPoints.length;
    const vertexCount = pointCount * 4;
    const indexCount = pointCount * 6;
    const reallocated = $6fafcf15f6b61d60$var$ensureGeometryCapacity(out, vertexCount, indexCount);
    const { positions: positions, normals: normals, tangents: tangents, colors: colors, uvs: uvs, indices: indices, bounds: bounds } = out;
    const pressureSizeMin = $6fafcf15f6b61d60$var$normalizePressureSizeMin(options.pressureSizeRange?.[0]);
    const pressureOpacityMin = $6fafcf15f6b61d60$var$normalizePressureOpacityMin(options.pressureOpacityRange);
    const pressureOpacityMax = $6fafcf15f6b61d60$var$normalizePressureOpacityMax(options.pressureOpacityRange);
    const descriptorOpacity = $6fafcf15f6b61d60$var$normalizeDescriptorOpacity(options.geometryParams?.opacity);
    const localBrushSize = $6fafcf15f6b61d60$var$getLocalBrushSize(stroke);
    for(let pointIndex = 0; pointIndex < pointCount; pointIndex += 1){
        const point = stroke.controlPoints[pointIndex];
        const radius = localBrushSize * $6fafcf15f6b61d60$var$getPressureSizeMultiplier(point.pressure, pressureSizeMin) * 0.5;
        const vertex = pointIndex * 4;
        const opacity = $6fafcf15f6b61d60$var$getPressureOpacityMultiplier(point.pressure, pressureOpacityMin, pressureOpacityMax) * descriptorOpacity;
        $6fafcf15f6b61d60$var$writeParticleVertex(positions, normals, tangents, colors, uvs, bounds, vertex, point.position, stroke.color, opacity, -radius, -radius, 0, 0);
        $6fafcf15f6b61d60$var$writeParticleVertex(positions, normals, tangents, colors, uvs, bounds, vertex + 1, point.position, stroke.color, opacity, radius, -radius, 1, 0);
        $6fafcf15f6b61d60$var$writeParticleVertex(positions, normals, tangents, colors, uvs, bounds, vertex + 2, point.position, stroke.color, opacity, radius, radius, 1, 1);
        $6fafcf15f6b61d60$var$writeParticleVertex(positions, normals, tangents, colors, uvs, bounds, vertex + 3, point.position, stroke.color, opacity, -radius, radius, 0, 1);
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
function $6fafcf15f6b61d60$var$generateSprayParticleGeometry(stroke, options, out) {
    out.uv0Size = 2;
    const hasLifetime = options.generatorClass === "MidpointPlusLifetimeSprayBrush";
    stroke = $6fafcf15f6b61d60$var$retainSprayControlPoints(stroke, options, out, hasLifetime);
    out.uv1Size = hasLifetime ? 4 : 0;
    if (hasLifetime) {
        $6fafcf15f6b61d60$var$ensureGeometryPressureCapacity(out, stroke.controlPoints.length);
        $6fafcf15f6b61d60$var$prepareGeometrySmoothedPressures(stroke, options, out);
    }
    const localBrushSize = $6fafcf15f6b61d60$var$getLocalBrushSize(stroke);
    const pressureSizeMin = $6fafcf15f6b61d60$var$normalizePressureSizeMin(options.pressureSizeRange?.[0]);
    const particleRate = $6fafcf15f6b61d60$var$normalizePositive(options.geometryParams?.sprayRateMultiplier, 1);
    let quadCount = 0;
    for(let pointIndex = 1; pointIndex < stroke.controlPoints.length; pointIndex += 1){
        const point = stroke.controlPoints[pointIndex];
        const pressure = hasLifetime ? out.geometrySmoothedPressures[pointIndex] : point.pressure;
        const segmentLength = $6fafcf15f6b61d60$var$distanceBetweenControlPoints(stroke.controlPoints[pointIndex - 1], point);
        const pressuredSize = localBrushSize * $6fafcf15f6b61d60$var$getPressureSizeMultiplier(pressure, pressureSizeMin);
        const spawnInterval = pressuredSize / particleRate;
        if (spawnInterval > $6fafcf15f6b61d60$var$EPSILON) quadCount += Math.min(500, Math.floor(segmentLength / spawnInterval));
    }
    const hasBackfaces = !hasLifetime && options.geometryParams?.renderBackfaces === true;
    const frontVertexCount = quadCount * 4;
    const frontIndexCount = quadCount * 6;
    const vertexCount = frontVertexCount * (hasBackfaces ? 2 : 1);
    const indexCount = frontIndexCount * (hasBackfaces ? 2 : 1);
    const reallocated = $6fafcf15f6b61d60$var$ensureGeometryCapacity(out, vertexCount, indexCount);
    const { positions: positions, normals: normals, tangents: tangents, colors: colors, uvs: uvs, indices: indices, bounds: bounds } = out;
    const pressureOpacityMin = $6fafcf15f6b61d60$var$normalizePressureOpacityMin(options.pressureOpacityRange);
    const pressureOpacityMax = $6fafcf15f6b61d60$var$normalizePressureOpacityMax(options.pressureOpacityRange);
    const descriptorOpacity = $6fafcf15f6b61d60$var$normalizeDescriptorOpacity(options.geometryParams?.opacity);
    const sizeVariance = $6fafcf15f6b61d60$var$normalizeNonNegative(options.geometryParams?.particleSizeVariance);
    const positionVariance = $6fafcf15f6b61d60$var$normalizeNonNegative(options.geometryParams?.particlePositionVariance);
    const rotationVarianceRadians = $6fafcf15f6b61d60$var$normalizeNonNegative(options.geometryParams?.particleRotationVariance) * Math.PI / 180;
    const sizeRatioX = $6fafcf15f6b61d60$var$normalizePositive(options.geometryParams?.particleSizeRatio?.[0], 1);
    const sizeRatioY = $6fafcf15f6b61d60$var$normalizePositive(options.geometryParams?.particleSizeRatio?.[1], 1);
    const randomizeAlpha = options.geometryParams?.particleRandomizeAlpha === true;
    const usesAtlas = $6fafcf15f6b61d60$var$normalizeAtlasRows(options.geometryParams?.textureAtlasV) > 1;
    const pointerForward = [
        0,
        0,
        0
    ];
    const pointerUp = [
        0,
        0,
        0
    ];
    const preferredRight = [
        0,
        0,
        0
    ];
    const segmentDirection = [
        0,
        0,
        0
    ];
    const frameRight = [
        0,
        0,
        0
    ];
    const frameNormal = [
        0,
        0,
        0
    ];
    const rotatedRight = [
        0,
        0,
        0
    ];
    const rotatedFacing = [
        0,
        0,
        0
    ];
    const randomOffset = [
        0,
        0,
        0
    ];
    const center = [
        0,
        0,
        0
    ];
    let quadIndex = 0;
    // SprayBrush decays its preview in place and offsets knot salts to preserve
    // its random sequence. MidpointPlusLifetimeSprayBrush instead inherits
    // GeometryBrush's full preview rebuild, so its salts restart with the
    // rebuilt knot indices.
    const knotIndexOffset = hasLifetime ? 0 : $6fafcf15f6b61d60$var$normalizeNonNegativeInteger(options.particleKnotIndexOffset);
    for(let pointIndex = 1; pointIndex < stroke.controlPoints.length; pointIndex += 1){
        const previousPoint = stroke.controlPoints[pointIndex - 1];
        const point = stroke.controlPoints[pointIndex];
        const pressure = hasLifetime ? out.geometrySmoothedPressures[pointIndex] : point.pressure;
        segmentDirection[0] = point.position[0] - previousPoint.position[0];
        segmentDirection[1] = point.position[1] - previousPoint.position[1];
        segmentDirection[2] = point.position[2] - previousPoint.position[2];
        const segmentLength = Math.hypot(segmentDirection[0], segmentDirection[1], segmentDirection[2]);
        if (segmentLength <= $6fafcf15f6b61d60$var$EPSILON) continue;
        segmentDirection[0] /= segmentLength;
        segmentDirection[1] /= segmentLength;
        segmentDirection[2] /= segmentLength;
        const pressuredSize = localBrushSize * $6fafcf15f6b61d60$var$getPressureSizeMultiplier(pressure, pressureSizeMin);
        const spawnInterval = pressuredSize / particleRate;
        const segmentQuadCount = spawnInterval > $6fafcf15f6b61d60$var$EPSILON ? Math.min(500, Math.floor(segmentLength / spawnInterval)) : 0;
        if (segmentQuadCount === 0) continue;
        $6fafcf15f6b61d60$var$rotateByQuaternion(point.orientation, $6fafcf15f6b61d60$var$VEC_FORWARD, pointerForward);
        $6fafcf15f6b61d60$var$rotateByQuaternion(point.orientation, $6fafcf15f6b61d60$var$VEC_UP, pointerUp);
        preferredRight[0] = 0;
        preferredRight[1] = 0;
        preferredRight[2] = 0;
        $6fafcf15f6b61d60$var$computeSurfaceFrame(preferredRight, segmentDirection, pointerForward, pointerUp, true, frameRight, frameNormal, true);
        const baseOpacity = $6fafcf15f6b61d60$var$getPressureOpacityMultiplier(pressure, pressureOpacityMin, pressureOpacityMax) * descriptorOpacity;
        for(let segmentQuad = 0; segmentQuad < segmentQuadCount; segmentQuad += 1){
            const salt = hasLifetime ? 10 * ((pointIndex + knotIndexOffset) * 5 + segmentQuad) : 10 * ((pointIndex + knotIndexOffset) * 12 + segmentQuad % 12);
            const rotation = -($6fafcf15f6b61d60$var$statelessRandom01(stroke.seed, salt + 1) * 2 - 1) * rotationVarianceRadians;
            $6fafcf15f6b61d60$var$rotateAroundAxis(frameRight, frameNormal, rotation, rotatedRight);
            $6fafcf15f6b61d60$var$rotateAroundAxis(segmentDirection, frameNormal, rotation, rotatedFacing);
            const size = pressuredSize * (1 + $6fafcf15f6b61d60$var$statelessRandom01(stroke.seed, salt) * sizeVariance);
            center[0] = previousPoint.position[0] + segmentDirection[0] * spawnInterval * segmentQuad;
            center[1] = previousPoint.position[1] + segmentDirection[1] * spawnInterval * segmentQuad;
            center[2] = previousPoint.position[2] + segmentDirection[2] * spawnInterval * segmentQuad;
            $6fafcf15f6b61d60$var$writeRandomInsideSphere(stroke.seed, salt + 2, randomOffset);
            randomOffset[2] = -randomOffset[2];
            center[0] += randomOffset[0] * size * positionVariance;
            center[1] += randomOffset[1] * size * positionVariance;
            center[2] += randomOffset[2] * size * positionVariance;
            const opacity = randomizeAlpha ? $6fafcf15f6b61d60$var$statelessRandom01(stroke.seed, salt + 5) : baseOpacity;
            const atlasCell = usesAtlas ? Math.min(3, Math.floor($6fafcf15f6b61d60$var$statelessRandom01(stroke.seed, salt + 6) * 4)) : 0;
            $6fafcf15f6b61d60$var$writeSprayParticleQuad(positions, normals, tangents, colors, uvs, out.uv1s, indices, bounds, quadIndex, center, rotatedFacing, rotatedRight, frameNormal, size * sizeRatioX * 0.5, size * sizeRatioY * 0.5, stroke.color, opacity, usesAtlas, atlasCell, hasLifetime, hasBackfaces, options.deterministicBirthTime === true ? 0 : point.timestampMs * 0.001 + $6fafcf15f6b61d60$var$normalizeFinite(options.particleBirthTimeOffsetSeconds));
            quadIndex += 1;
        }
    }
    out.family = "particle";
    out.vertexCount = vertexCount;
    out.indexCount = indexCount;
    return reallocated;
}
function $6fafcf15f6b61d60$var$retainSprayControlPoints(stroke, options, out, smoothPressure) {
    const source = stroke.controlPoints;
    if (source.length < 2) return stroke;
    const retained = out.tubeRetainedControlPoints;
    retained.length = 0;
    retained.push(source[0]);
    const pressureSizeMin = $6fafcf15f6b61d60$var$normalizePressureSizeMin(options.pressureSizeRange?.[0]);
    const particleRate = $6fafcf15f6b61d60$var$normalizePositive(options.geometryParams?.sprayRateMultiplier, 1);
    const localBrushSize = $6fafcf15f6b61d60$var$getLocalBrushSize(stroke);
    const smoothingWindow = options.geometryParams?.m11Compatibility === true ? 0.1 : 0.2;
    let lastRetained = source[0];
    let lastSmoothedPressure = $6fafcf15f6b61d60$var$clamp01(source[0].pressure);
    for(let pointIndex = 1; pointIndex < source.length; pointIndex += 1){
        const point = source[pointIndex];
        const distance = $6fafcf15f6b61d60$var$distanceBetweenControlPoints(lastRetained, point);
        const pressure = smoothPressure ? Math.pow(0.1, distance / smoothingWindow) * lastSmoothedPressure + (1 - Math.pow(0.1, distance / smoothingWindow)) * $6fafcf15f6b61d60$var$clamp01(point.pressure) : $6fafcf15f6b61d60$var$clamp01(point.pressure);
        const pressuredSize = localBrushSize * $6fafcf15f6b61d60$var$getPressureSizeMultiplier(pressure, pressureSizeMin);
        const spawnInterval = pressuredSize / particleRate;
        // GeometryBrush repeatedly overwrites its leading knot until the distance
        // from the last keeper exceeds the brush's spawn interval. The current
        // leading knot remains renderable even when it has not become a keeper.
        if (pointIndex + 1 === source.length || distance > spawnInterval) {
            retained.push(point);
            lastRetained = point;
            lastSmoothedPressure = pressure;
        }
    }
    return retained.length === source.length ? stroke : {
        ...stroke,
        controlPoints: retained
    };
}
function $6fafcf15f6b61d60$var$generateGeniusParticleGeometry(stroke, options, out) {
    out.uv0Size = 4;
    out.uv1Size = 3;
    const particleRate = $6fafcf15f6b61d60$var$normalizePositive(options.geometryParams?.particleRate, 1);
    const spawnInterval = $6fafcf15f6b61d60$var$OPEN_BRUSH_GENIUS_PARTICLE_INTERVAL / particleRate;
    stroke = $6fafcf15f6b61d60$var$retainGeniusControlPoints(stroke, options, out, spawnInterval);
    const pointCount = stroke.controlPoints.length;
    const distanceRemainder = $6fafcf15f6b61d60$var$normalizeNonNegative(options.particleDistanceOffset) % spawnInterval;
    const totalLength = $6fafcf15f6b61d60$var$measureStrokeLength(stroke) + distanceRemainder;
    const finalizedParticleCount = pointCount === 0 ? 0 : Math.floor(totalLength / spawnInterval) + 1;
    const particleCount = finalizedParticleCount + (pointCount > 0 && options.finalized !== true ? 1 : 0);
    const vertexCount = particleCount * 4;
    const indexCount = particleCount * 6;
    const reallocated = $6fafcf15f6b61d60$var$ensureGeometryCapacity(out, vertexCount, indexCount);
    const { positions: positions, normals: normals, tangents: tangents, colors: colors, uvs: uvs, particleUvs: particleUvs, vectorUvs: vectorUvs, indices: indices, bounds: bounds } = out;
    const pressureSizeMin = $6fafcf15f6b61d60$var$normalizePressureSizeMin(options.pressureSizeRange?.[0]);
    const pressureOpacityMin = $6fafcf15f6b61d60$var$normalizePressureOpacityMin(options.pressureOpacityRange);
    const pressureOpacityMax = $6fafcf15f6b61d60$var$normalizePressureOpacityMax(options.pressureOpacityRange);
    const descriptorOpacity = $6fafcf15f6b61d60$var$normalizeDescriptorOpacity(options.geometryParams?.opacity);
    const localBrushSize = $6fafcf15f6b61d60$var$getLocalBrushSize(stroke);
    const sizeVariance = $6fafcf15f6b61d60$var$normalizeNonNegative(options.geometryParams?.particleSizeVariance);
    const particleSpeed = $6fafcf15f6b61d60$var$normalizeNonNegative(options.geometryParams?.particleSpeed);
    const minimumBrushSize = $6fafcf15f6b61d60$var$normalizePositive(options.geometryParams?.brushSizeRange?.[0], 1);
    const positionScale = particleSpeed / minimumBrushSize;
    const randomizeAlpha = options.geometryParams?.particleRandomizeAlpha === true;
    const atlasRows = $6fafcf15f6b61d60$var$normalizeAtlasRows(options.geometryParams?.textureAtlasV);
    const center = [
        0,
        0,
        0
    ];
    const sphereOffset = [
        0,
        0,
        0
    ];
    const particleUp = [
        0,
        0,
        0
    ];
    const particleRight = [
        0,
        0,
        0
    ];
    const particleRotation = [
        0,
        0,
        0,
        1
    ];
    let segmentIndex = Math.min(1, pointCount - 1);
    let segmentStartLength = 0;
    let segmentEndLength = pointCount > 1 ? distanceRemainder + $6fafcf15f6b61d60$var$distanceBetweenControlPoints(stroke.controlPoints[0], stroke.controlPoints[1]) : distanceRemainder;
    let particleWithinKnot = 0;
    const knotIndexOffset = $6fafcf15f6b61d60$var$normalizeNonNegativeInteger(options.particleKnotIndexOffset);
    for(let particleIndex = 0; particleIndex < particleCount; particleIndex += 1){
        const distanceOnStroke = particleIndex * spawnInterval;
        while(segmentIndex < pointCount - 1 && distanceOnStroke > segmentEndLength){
            segmentStartLength = segmentEndLength;
            segmentIndex += 1;
            segmentEndLength += $6fafcf15f6b61d60$var$distanceBetweenControlPoints(stroke.controlPoints[segmentIndex - 1], stroke.controlPoints[segmentIndex]);
            particleWithinKnot = 0;
        }
        const previousPoint = stroke.controlPoints[Math.max(0, segmentIndex - 1)] ?? stroke.controlPoints[0];
        const currentPoint = stroke.controlPoints[segmentIndex] ?? stroke.controlPoints[0];
        const segmentLength = Math.max(segmentEndLength - segmentStartLength, $6fafcf15f6b61d60$var$EPSILON);
        const ratio = $6fafcf15f6b61d60$var$clamp01((distanceOnStroke - segmentStartLength) / segmentLength);
        center[0] = previousPoint.position[0] + (currentPoint.position[0] - previousPoint.position[0]) * ratio;
        center[1] = previousPoint.position[1] + (currentPoint.position[1] - previousPoint.position[1]) * ratio;
        center[2] = previousPoint.position[2] + (currentPoint.position[2] - previousPoint.position[2]) * ratio;
        const rebuildsFinalTwoKnotParticle = options.finalized === true && pointCount === 2 && particleIndex === particleCount - 1;
        const pressure = rebuildsFinalTwoKnotParticle ? Math.max(0.8, currentPoint.pressure) : currentPoint.pressure;
        const salt = 16 * ((segmentIndex + knotIndexOffset) * 16 + particleWithinKnot);
        const size = localBrushSize * $6fafcf15f6b61d60$var$getPressureSizeMultiplier(pressure, pressureSizeMin) * (1 + $6fafcf15f6b61d60$var$statelessRandom01(stroke.seed, salt) * sizeVariance);
        $6fafcf15f6b61d60$var$writeRandomUnitSphere(stroke.seed, salt + 2, sphereOffset);
        sphereOffset[2] = -sphereOffset[2];
        center[0] += sphereOffset[0] * size * positionScale;
        center[1] += sphereOffset[1] * size * positionScale;
        center[2] += sphereOffset[2] * size * positionScale;
        $6fafcf15f6b61d60$var$writeRandomRotation(stroke.seed, salt + 4, particleRotation);
        particleRotation[0] = -particleRotation[0];
        particleRotation[1] = -particleRotation[1];
        $6fafcf15f6b61d60$var$rotateByQuaternion(particleRotation, $6fafcf15f6b61d60$var$VEC_UP, particleUp);
        $6fafcf15f6b61d60$var$rotateByQuaternion(particleRotation, $6fafcf15f6b61d60$var$VEC_RIGHT, particleRight);
        const opacity = randomizeAlpha ? $6fafcf15f6b61d60$var$statelessRandom01(stroke.seed, salt + 1) : $6fafcf15f6b61d60$var$getPressureOpacityMultiplier(pressure, pressureOpacityMin, pressureOpacityMax) * descriptorOpacity;
        const quantizedOpacity = Math.floor($6fafcf15f6b61d60$var$clamp01(opacity) * 255) / 255;
        const atlasCell = atlasRows > 1 ? Math.min(3, Math.floor($6fafcf15f6b61d60$var$statelessRandom01(stroke.seed, salt + 8) * 4)) : 0;
        const halfRotationRange = $6fafcf15f6b61d60$var$normalizeNonNegative(options.geometryParams?.particleInitialRotationRange) * Math.PI / 360;
        const initialRotation = ($6fafcf15f6b61d60$var$statelessRandom01(stroke.seed, salt + 7) * 2 - 1) * halfRotationRange;
        const birthTimeSeconds = options.deterministicBirthTime === true ? 0 : (currentPoint.timestampMs * 0.001 + $6fafcf15f6b61d60$var$normalizeFinite(options.particleBirthTimeOffsetSeconds)) * (options.particlePreview === true ? -1 : 1);
        $6fafcf15f6b61d60$var$writeGeniusParticleQuad(positions, normals, tangents, colors, uvs, particleUvs, vectorUvs, indices, bounds, particleIndex, center, particleUp, particleRight, size, stroke.color, quantizedOpacity, atlasRows > 1, atlasCell, initialRotation, birthTimeSeconds, previousPoint.position, currentPoint.position, ratio);
        particleWithinKnot += 1;
    }
    out.family = "particle";
    out.vertexCount = vertexCount;
    out.indexCount = indexCount;
    return reallocated;
}
function $6fafcf15f6b61d60$var$retainGeniusControlPoints(stroke, options, out, spawnInterval) {
    const source = stroke.controlPoints;
    if (source.length < 2 || $6fafcf15f6b61d60$var$normalizeNonNegativeInteger(options.particleKnotIndexOffset) > 0) return stroke;
    const retained = out.tubeRetainedControlPoints;
    retained.length = 0;
    retained.push(source[0]);
    let distanceTravelled = $6fafcf15f6b61d60$var$normalizeNonNegative(options.particleDistanceOffset);
    let crossedSpawnInterval = false;
    for(let pointIndex = 1; pointIndex < source.length; pointIndex += 1){
        // GeniusParticlesBrush checks its cumulative pointer travel inside the
        // base update before recording the movement to the current sample. The
        // first keeper therefore arrives one sample after crossing the interval.
        crossedSpawnInterval ||= distanceTravelled > spawnInterval;
        if (crossedSpawnInterval || pointIndex + 1 === source.length) retained.push(source[pointIndex]);
        distanceTravelled += $6fafcf15f6b61d60$var$distanceBetweenControlPoints(source[pointIndex - 1], source[pointIndex]);
    }
    return retained.length === source.length ? stroke : {
        ...stroke,
        controlPoints: retained
    };
}
function $6fafcf15f6b61d60$var$getPressureSizeMultiplier(pressure, pressureSizeMin) {
    const clampedPressure = $6fafcf15f6b61d60$var$clamp01(pressure);
    return pressureSizeMin + (1 - pressureSizeMin) * clampedPressure;
}
function $6fafcf15f6b61d60$var$getPressureOpacityMultiplier(pressure, pressureOpacityMin, pressureOpacityMax) {
    return pressureOpacityMin + (pressureOpacityMax - pressureOpacityMin) * $6fafcf15f6b61d60$var$clamp01(pressure);
}
function $6fafcf15f6b61d60$var$normalizePressureSizeMin(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) return $6fafcf15f6b61d60$var$DEFAULT_PRESSURE_SIZE_MIN;
    return $6fafcf15f6b61d60$var$clamp01(value);
}
function $6fafcf15f6b61d60$var$normalizePressureOpacityMin(range) {
    return range && Number.isFinite(range[0]) ? $6fafcf15f6b61d60$var$clamp01(range[0]) : 1;
}
function $6fafcf15f6b61d60$var$normalizePressureOpacityMax(range) {
    return range && Number.isFinite(range[1]) ? $6fafcf15f6b61d60$var$clamp01(range[1]) : 1;
}
function $6fafcf15f6b61d60$var$normalizeDescriptorOpacity(value) {
    return typeof value === "number" && Number.isFinite(value) ? $6fafcf15f6b61d60$var$clamp01(value) : 1;
}
function $6fafcf15f6b61d60$var$normalizePositive(value, fallback) {
    return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
}
function $6fafcf15f6b61d60$var$normalizeNonNegative(value) {
    return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : 0;
}
function $6fafcf15f6b61d60$var$normalizeFinite(value) {
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
function $6fafcf15f6b61d60$var$normalizeNonNegativeInteger(value) {
    return Math.floor($6fafcf15f6b61d60$var$normalizeNonNegative(value));
}
function $6fafcf15f6b61d60$var$normalizeTileRate(value) {
    return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 1;
}
function $6fafcf15f6b61d60$var$normalizeAtlasRows(value) {
    return typeof value === "number" && Number.isFinite(value) && value >= 1 ? Math.max(1, Math.floor(value)) : 1;
}
function $6fafcf15f6b61d60$var$normalizeTubeSideCount(value) {
    return typeof value === "number" && Number.isFinite(value) ? Math.min(12, Math.max(3, Math.floor(value))) : 8;
}
function $6fafcf15f6b61d60$var$normalizeTubeCapAspect(value) {
    return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : 0.8;
}
function $6fafcf15f6b61d60$var$normalizeTubeBreakAngleMultiplier(value) {
    return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : 2;
}
function $6fafcf15f6b61d60$var$normalizeTubeShapeModifier(value) {
    return typeof value === "number" && Number.isFinite(value) ? Math.min(5, Math.max(0, Math.floor(value))) : 0;
}
function $6fafcf15f6b61d60$var$normalizeTubePetalAmount(value) {
    return typeof value === "number" && Number.isFinite(value) ? value : 0.5;
}
function $6fafcf15f6b61d60$var$normalizeTubePetalExponent(value) {
    return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : 3;
}
function $6fafcf15f6b61d60$var$getTubeShapeScale(modifier, progress, pointIndex, pointCount, taperScalar, partialProgress) {
    switch(modifier){
        case 1:
            return $6fafcf15f6b61d60$var$getLoftedTubeScale(pointIndex, pointCount, partialProgress);
        case 2:
        case 5:
            return Math.abs(Math.sin(progress * Math.PI));
        case 3:
            return Math.sin(progress * 1.5 + 1.55);
        case 4:
            return (Number.isFinite(taperScalar) ? taperScalar : 1) * (1 - progress);
        default:
            return 1;
    }
}
function $6fafcf15f6b61d60$var$getLoftedTubeScale(pointIndex, pointCount, partialProgress) {
    if (pointCount < 3) return 0;
    const halfCount = Math.ceil(Math.min(5, pointCount / 2));
    const nextHalfCount = Math.ceil(Math.min(5, (pointCount + 1) / 2));
    const reverseIndex = pointCount - pointIndex - 1;
    const nextReverseIndex = pointCount + 1 - pointIndex - 1;
    let current = 1;
    let next = 1;
    if (pointIndex < halfCount) current = pointIndex / Math.max(1, halfCount - 1);
    else if (reverseIndex < halfCount) current = Math.max(0, reverseIndex - 1) / Math.max(1, halfCount - 1);
    if (pointIndex < nextHalfCount) next = pointIndex / Math.max(1, nextHalfCount - 1);
    else if (nextReverseIndex < nextHalfCount) next = Math.max(0, nextReverseIndex - 1) / Math.max(1, nextHalfCount - 1);
    current += (next - current) * 0.185;
    current += (next - current) * $6fafcf15f6b61d60$var$clamp01(partialProgress);
    const attenuation = $6fafcf15f6b61d60$var$clamp01((pointCount - 3 + partialProgress) / 7);
    return $6fafcf15f6b61d60$var$clamp01(current * attenuation);
}
const $6fafcf15f6b61d60$var$TUBE_SOLID_ASPECT_RATIO = 0.2;
function $6fafcf15f6b61d60$var$normalizeHueShift(value) {
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
function $6fafcf15f6b61d60$var$statelessRandom01(seed, salt) {
    let value = (seed ^ salt) >>> 0;
    value = Math.imul(value ^ value >>> 16, 0x7feb352d) >>> 0;
    value = Math.imul(value ^ value >>> 15, 0x846ca68b) >>> 0;
    value = (value ^ value >>> 16) >>> 0;
    return Math.min(Math.fround(value) / 0x100000000, 1 - 2 ** -24);
}
function $6fafcf15f6b61d60$var$writeRandomUnitSphere(seed, salt, out) {
    const z = $6fafcf15f6b61d60$var$statelessRandom01(seed, salt) * 2 - 1;
    const angle = $6fafcf15f6b61d60$var$statelessRandom01(seed, salt + 1) * Math.PI * 2;
    const radius = Math.sqrt(Math.max(0, 1 - z * z));
    out[0] = radius * Math.cos(angle);
    out[1] = radius * Math.sin(angle);
    out[2] = z;
}
function $6fafcf15f6b61d60$var$writeRandomInsideSphere(seed, salt, out) {
    $6fafcf15f6b61d60$var$writeRandomUnitSphere(seed, salt, out);
    const radius = Math.cbrt($6fafcf15f6b61d60$var$statelessRandom01(seed, salt + 2));
    out[0] *= radius;
    out[1] *= radius;
    out[2] *= radius;
}
function $6fafcf15f6b61d60$var$rotateAroundAxis(input, axis, angle, out) {
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    const projection = $6fafcf15f6b61d60$var$dot(axis, input) * (1 - cosine);
    out[0] = input[0] * cosine + (axis[1] * input[2] - axis[2] * input[1]) * sine + axis[0] * projection;
    out[1] = input[1] * cosine + (axis[2] * input[0] - axis[0] * input[2]) * sine + axis[1] * projection;
    out[2] = input[2] * cosine + (axis[0] * input[1] - axis[1] * input[0]) * sine + axis[2] * projection;
}
function $6fafcf15f6b61d60$var$writeRandomRotation(seed, salt, out) {
    const firstRadius = Math.sqrt($6fafcf15f6b61d60$var$statelessRandom01(seed, salt + 1));
    const firstAngle = $6fafcf15f6b61d60$var$statelessRandom01(seed, salt) * Math.PI * 2;
    const secondRadius = Math.sqrt(Math.max(0, 1 - firstRadius * firstRadius));
    const secondAngle = $6fafcf15f6b61d60$var$statelessRandom01(seed, salt + 2) * Math.PI * 2;
    out[0] = Math.sin(firstAngle) * firstRadius;
    out[1] = Math.cos(firstAngle) * firstRadius;
    out[2] = Math.sin(secondAngle) * secondRadius;
    out[3] = Math.cos(secondAngle) * secondRadius;
}
function $6fafcf15f6b61d60$var$shiftHue(color, hueDegrees) {
    if (hueDegrees === 0) return [
        color[0],
        color[1],
        color[2],
        color[3]
    ];
    const max = Math.max(color[0], color[1], color[2]);
    const min = Math.min(color[0], color[1], color[2]);
    const lightness = (max + min) * 0.5;
    const delta = max - min;
    if (delta <= $6fafcf15f6b61d60$var$EPSILON) return [
        color[0],
        color[1],
        color[2],
        color[3]
    ];
    const saturation = delta / (1 - Math.abs(2 * lightness - 1));
    let hue;
    if (max === color[0]) hue = 60 * ((color[1] - color[2]) / delta % 6);
    else if (max === color[1]) hue = 60 * ((color[2] - color[0]) / delta + 2);
    else hue = 60 * ((color[0] - color[1]) / delta + 4);
    hue = ((hue + hueDegrees) % 360 + 360) % 360;
    const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const x = chroma * (1 - Math.abs(hue / 60 % 2 - 1));
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
    return [
        red + match,
        green + match,
        blue + match,
        color[3]
    ];
}
function $6fafcf15f6b61d60$var$measureStrokeLength(stroke) {
    let length = 0;
    for(let index = 1; index < stroke.controlPoints.length; index += 1)length += $6fafcf15f6b61d60$var$distanceBetweenControlPoints(stroke.controlPoints[index - 1], stroke.controlPoints[index]);
    return length;
}
function $6fafcf15f6b61d60$var$prepareRibbonSections(stroke, out) {
    const pointCount = stroke.controlPoints.length;
    $6fafcf15f6b61d60$var$ensureRibbonScratchCapacity(out, pointCount);
    const { ribbonBreakBefore: ribbonBreakBefore, ribbonRunningLengths: ribbonRunningLengths, ribbonSectionLengths: ribbonSectionLengths } = out;
    let connectedSegmentCount = 0;
    let sectionStart = 0;
    let runningLength = 0;
    let previousDirectionX = 0;
    let previousDirectionY = 0;
    let previousDirectionZ = 0;
    let hasPreviousDirection = false;
    for(let index = 1; index < pointCount; index += 1){
        const previous = stroke.controlPoints[index - 1].position;
        const current = stroke.controlPoints[index].position;
        const deltaX = current[0] - previous[0];
        const deltaY = current[1] - previous[1];
        const deltaZ = current[2] - previous[2];
        const segmentLength = Math.hypot(deltaX, deltaY, deltaZ);
        const inverseLength = segmentLength > $6fafcf15f6b61d60$var$EPSILON ? 1 / segmentLength : 0;
        const directionX = deltaX * inverseLength;
        const directionY = deltaY * inverseLength;
        const directionZ = deltaZ * inverseLength;
        const reverses = hasPreviousDirection && previousDirectionX * directionX + previousDirectionY * directionY + previousDirectionZ * directionZ < 0;
        const breaks = segmentLength < $6fafcf15f6b61d60$var$OPEN_BRUSH_RIBBON_MINIMUM_MOVE_METERS || reverses;
        if (breaks) {
            ribbonBreakBefore[index] = 1;
            for(let sectionIndex = sectionStart; sectionIndex < index; sectionIndex += 1)ribbonSectionLengths[sectionIndex] = runningLength;
            sectionStart = index;
            runningLength = 0;
        } else {
            runningLength += segmentLength;
            connectedSegmentCount += 1;
        }
        ribbonRunningLengths[index] = runningLength;
        if (segmentLength >= $6fafcf15f6b61d60$var$OPEN_BRUSH_RIBBON_MINIMUM_MOVE_METERS) {
            previousDirectionX = directionX;
            previousDirectionY = directionY;
            previousDirectionZ = directionZ;
            hasPreviousDirection = true;
        }
    }
    for(let sectionIndex = sectionStart; sectionIndex < pointCount; sectionIndex += 1)ribbonSectionLengths[sectionIndex] = runningLength;
    return connectedSegmentCount;
}
/** Frame the retained GeometryBrush knots before FlatGeometry emits strips. */ function $6fafcf15f6b61d60$var$prepareFlatGeometrySections(stroke, options, out) {
    const pointCount = stroke.controlPoints.length;
    $6fafcf15f6b61d60$var$ensureRibbonScratchCapacity(out, pointCount);
    const { ribbonBreakBefore: ribbonBreakBefore, ribbonRunningLengths: ribbonRunningLengths, ribbonSectionLengths: ribbonSectionLengths } = out;
    let lastRetainedPoint = 0;
    for(let pointIndex = 1; pointIndex < pointCount; pointIndex += 1){
        const length = $6fafcf15f6b61d60$var$distanceBetweenControlPoints(stroke.controlPoints[lastRetainedPoint], stroke.controlPoints[pointIndex]);
        if (length < $6fafcf15f6b61d60$var$OPEN_BRUSH_RIBBON_MINIMUM_MOVE_METERS) {
            ribbonBreakBefore[pointIndex] = 2;
            continue;
        }
        lastRetainedPoint = pointIndex;
    }
    const smoothedPressures = out.ribbonSmoothedPressures;
    const isM11 = options.geometryParams?.m11Compatibility === true;
    const pressureWindow = isM11 ? 0.1 : 0.2;
    smoothedPressures[0] = isM11 ? 0 : $6fafcf15f6b61d60$var$clamp01(stroke.controlPoints[0].pressure);
    lastRetainedPoint = 0;
    for(let pointIndex = 1; pointIndex < pointCount; pointIndex += 1){
        if (ribbonBreakBefore[pointIndex] === 2) {
            smoothedPressures[pointIndex] = smoothedPressures[lastRetainedPoint];
            continue;
        }
        const distance = $6fafcf15f6b61d60$var$distanceBetweenControlPoints(stroke.controlPoints[lastRetainedPoint], stroke.controlPoints[pointIndex]);
        const retained = Math.pow(0.1, distance / pressureWindow);
        smoothedPressures[pointIndex] = retained * smoothedPressures[lastRetainedPoint] + (1 - retained) * $6fafcf15f6b61d60$var$clamp01(stroke.controlPoints[pointIndex].pressure);
        lastRetainedPoint = pointIndex;
    }
    lastRetainedPoint = 0;
    for(let pointIndex = 0; pointIndex < pointCount; pointIndex += 1){
        out.ribbonPreviousRetained[pointIndex] = lastRetainedPoint;
        if (pointIndex > 0 && ribbonBreakBefore[pointIndex] !== 2) lastRetainedPoint = pointIndex;
    }
    let nextRetainedPoint = lastRetainedPoint;
    for(let pointIndex = pointCount - 1; pointIndex >= 0; pointIndex -= 1){
        out.ribbonNextRetained[pointIndex] = nextRetainedPoint;
        if (ribbonBreakBefore[pointIndex] !== 2) nextRetainedPoint = pointIndex;
    }
    if (options.geometryParams?.m11Compatibility !== true) {
        let previousRetainedPoint = 0;
        let currentRetainedPoint = -1;
        for(let pointIndex = 1; pointIndex < pointCount; pointIndex += 1){
            if (ribbonBreakBefore[pointIndex] === 2) continue;
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
            if (incomingX * outgoingX + incomingY * outgoingY + incomingZ * outgoingZ < 0) ribbonBreakBefore[currentRetainedPoint] = 1;
            previousRetainedPoint = currentRetainedPoint;
            currentRetainedPoint = pointIndex;
        }
    }
    let sectionStart = 0;
    let runningLength = 0;
    lastRetainedPoint = 0;
    for(let pointIndex = 1; pointIndex < pointCount; pointIndex += 1){
        const state = ribbonBreakBefore[pointIndex];
        if (state === 2) {
            ribbonRunningLengths[pointIndex] = runningLength;
            continue;
        }
        const length = $6fafcf15f6b61d60$var$distanceBetweenControlPoints(stroke.controlPoints[lastRetainedPoint], stroke.controlPoints[pointIndex]);
        if (state === 1) {
            for(let index = sectionStart; index < pointIndex; index += 1)ribbonSectionLengths[index] = runningLength;
            sectionStart = pointIndex;
            runningLength = 0;
        } else runningLength += length;
        ribbonRunningLengths[pointIndex] = runningLength;
        lastRetainedPoint = pointIndex;
    }
    for(let index = sectionStart; index < pointCount; index += 1)ribbonSectionLengths[index] = runningLength;
}
/**
 * QuadStrip distinguishes an input sample that is too close to the last spawn
 * point from a sharp-turn strip break. The former produces no solid and leaves
 * brush state untouched; the latter still emits the current solid as the first
 * member of a new, unfused section. Values in ribbonBreakBefore therefore mean
 * 0 = ordinary solid, 1 = generated section start, and 2 = skipped sample.
 */ function $6fafcf15f6b61d60$var$prepareQuadStripSections(stroke, options, out) {
    const pointCount = stroke.controlPoints.length;
    $6fafcf15f6b61d60$var$ensureRibbonScratchCapacity(out, pointCount);
    $6fafcf15f6b61d60$var$prepareRibbonSmoothedPressures(stroke, options, out);
    const { ribbonBreakBefore: ribbonBreakBefore, ribbonRunningLengths: ribbonRunningLengths, ribbonSectionLengths: ribbonSectionLengths } = out;
    let sectionStart = 0;
    let runningLength = 0;
    let lastSpawnIndex = 0;
    let previousDirectionX = 0;
    let previousDirectionY = 0;
    let previousDirectionZ = 0;
    let hasPreviousDirection = false;
    const localBrushSize = $6fafcf15f6b61d60$var$getLocalBrushSize(stroke);
    const pressureSizeMin = $6fafcf15f6b61d60$var$normalizePressureSizeMin(options.pressureSizeRange?.[0]);
    for(let index = 1; index < pointCount; index += 1){
        const previous = stroke.controlPoints[lastSpawnIndex].position;
        const current = stroke.controlPoints[index].position;
        const deltaX = current[0] - previous[0];
        const deltaY = current[1] - previous[1];
        const deltaZ = current[2] - previous[2];
        const segmentLength = Math.hypot(deltaX, deltaY, deltaZ);
        if (segmentLength < $6fafcf15f6b61d60$var$OPEN_BRUSH_RIBBON_MINIMUM_MOVE_METERS) {
            ribbonBreakBefore[index] = 2;
            ribbonRunningLengths[index] = runningLength;
            continue;
        }
        // QuadStripBrush keeps one mutable leading quad for samples that have moved
        // far enough to update the brush but not far enough to commit a new solid.
        // A later sample overwrites that quad; only the final provisional sample is
        // visible in a live/finalized mesh. GetSpawnInterval is the fixed 1.5 mm
        // floor plus 20% of the pressure-adjusted brush size.
        const spawnInterval = 0.0015 + localBrushSize * $6fafcf15f6b61d60$var$getPressureSizeMultiplier(out.ribbonSmoothedPressures[index], pressureSizeMin) * 0.2;
        const isFinalProvisional = index === pointCount - 1;
        if (segmentLength < spawnInterval && !isFinalProvisional) {
            ribbonBreakBefore[index] = 2;
            out.ribbonProvisionalSamples[index] = 1;
            ribbonRunningLengths[index] = runningLength;
            continue;
        }
        const inverseLength = 1 / segmentLength;
        const directionX = deltaX * inverseLength;
        const directionY = deltaY * inverseLength;
        const directionZ = deltaZ * inverseLength;
        const startsSection = hasPreviousDirection && previousDirectionX * directionX + previousDirectionY * directionY + previousDirectionZ * directionZ <= 0;
        if (startsSection) {
            for(let sectionIndex = sectionStart; sectionIndex < index; sectionIndex += 1)ribbonSectionLengths[sectionIndex] = runningLength;
            ribbonBreakBefore[index] = 1;
            sectionStart = index;
            runningLength = segmentLength;
        } else runningLength += segmentLength;
        ribbonRunningLengths[index] = runningLength;
        if (segmentLength >= spawnInterval) {
            lastSpawnIndex = index;
            previousDirectionX = directionX;
            previousDirectionY = directionY;
            previousDirectionZ = directionZ;
            hasPreviousDirection = true;
        }
    }
    for(let sectionIndex = sectionStart; sectionIndex < pointCount; sectionIndex += 1)ribbonSectionLengths[sectionIndex] = runningLength;
}
function $6fafcf15f6b61d60$var$resolveRibbonRenderPointCount(pointCount, options, breakBefore) {
    if (options.generatorClass !== "FlatGeometryBrush" || options.geometryParams?.m11Compatibility === true) return pointCount;
    for(let index = pointCount - 1; index > 1; index -= 1){
        if (breakBefore[index] !== 1) continue;
        return pointCount - index < 6 ? index + 1 : pointCount;
    }
    return pointCount;
}
function $6fafcf15f6b61d60$var$countConnectedRibbonSegments(breakBefore, pointCount, generatedSectionBreaks = false) {
    let count = 0;
    for(let index = 1; index < pointCount; index += 1)if (generatedSectionBreaks ? breakBefore[index] !== 2 : breakBefore[index] === 0) count += 1;
    return count;
}
function $6fafcf15f6b61d60$var$prepareRibbonSmoothedPressures(stroke, options, out) {
    const pointCount = stroke.controlPoints.length;
    const pressures = out.ribbonSmoothedPressures;
    if (pointCount === 0) return;
    const isM11FlatGeometry = options.generatorClass === "FlatGeometryBrush" && options.geometryParams?.m11Compatibility === true;
    pressures[0] = isM11FlatGeometry ? 0 : $6fafcf15f6b61d60$var$clamp01(stroke.controlPoints[0].pressure);
    const windowMeters = isM11FlatGeometry ? 0.1 : 0.2;
    for(let index = 1; index < pointCount; index += 1){
        const distance = $6fafcf15f6b61d60$var$distanceBetweenControlPoints(stroke.controlPoints[index - 1], stroke.controlPoints[index]);
        const retained = Math.pow(0.1, distance / windowMeters);
        pressures[index] = retained * pressures[index - 1] + (1 - retained) * $6fafcf15f6b61d60$var$clamp01(stroke.controlPoints[index].pressure);
    }
}
function $6fafcf15f6b61d60$var$prepareTubeSmoothedPressures(stroke, options, out) {
    const pointCount = stroke.controlPoints.length;
    const pressures = out.tubeSmoothedPressures;
    if (pointCount === 0) return;
    const isM11 = options.geometryParams?.m11Compatibility === true;
    pressures[0] = isM11 ? 0 : $6fafcf15f6b61d60$var$clamp01(stroke.controlPoints[0].pressure);
    const windowMeters = isM11 ? 0.1 : 0.2;
    for(let index = 1; index < pointCount; index += 1){
        const distance = $6fafcf15f6b61d60$var$distanceBetweenControlPoints(stroke.controlPoints[index - 1], stroke.controlPoints[index]);
        const retained = Math.pow(0.1, distance / windowMeters);
        pressures[index] = retained * pressures[index - 1] + (1 - retained) * $6fafcf15f6b61d60$var$clamp01(stroke.controlPoints[index].pressure);
    }
}
function $6fafcf15f6b61d60$var$prepareGeometrySmoothedPressures(stroke, options, out) {
    const pointCount = stroke.controlPoints.length;
    const pressures = out.geometrySmoothedPressures;
    if (pointCount === 0) return;
    const isM11 = options.geometryParams?.m11Compatibility === true;
    pressures[0] = isM11 ? 0 : $6fafcf15f6b61d60$var$clamp01(stroke.controlPoints[0].pressure);
    const windowMeters = isM11 ? 0.1 : 0.2;
    for(let index = 1; index < pointCount; index += 1){
        const distance = $6fafcf15f6b61d60$var$distanceBetweenControlPoints(stroke.controlPoints[index - 1], stroke.controlPoints[index]);
        const retained = Math.pow(0.1, distance / windowMeters);
        pressures[index] = retained * pressures[index - 1] + (1 - retained) * $6fafcf15f6b61d60$var$clamp01(stroke.controlPoints[index].pressure);
    }
}
function $6fafcf15f6b61d60$var$prepareGeometrySmoothedPositions(stroke, out) {
    const pointCount = stroke.controlPoints.length;
    for(let index = 0; index < pointCount; index += 1){
        const current = stroke.controlPoints[index].position;
        const offset = index * 3;
        if (index === 0 || index === pointCount - 1) {
            out.geometrySmoothedPositions[offset] = current[0];
            out.geometrySmoothedPositions[offset + 1] = current[1];
            out.geometrySmoothedPositions[offset + 2] = current[2];
        } else {
            const previous = stroke.controlPoints[index - 1].position;
            const next = stroke.controlPoints[index + 1].position;
            out.geometrySmoothedPositions[offset] = (previous[0] + 2 * current[0] + next[0]) * 0.25;
            out.geometrySmoothedPositions[offset + 1] = (previous[1] + 2 * current[1] + next[1]) * 0.25;
            out.geometrySmoothedPositions[offset + 2] = (previous[2] + 2 * current[2] + next[2]) * 0.25;
        }
    }
}
function $6fafcf15f6b61d60$var$distanceBetweenControlPoints(left, right) {
    return Math.hypot(right.position[0] - left.position[0], right.position[1] - left.position[1], right.position[2] - left.position[2]);
}
function $6fafcf15f6b61d60$var$distanceBetweenScratchPoints(positions, leftIndex, rightIndex) {
    const left = leftIndex * 3;
    const right = rightIndex * 3;
    return Math.hypot(positions[right] - positions[left], positions[right + 1] - positions[left + 1], positions[right + 2] - positions[left + 2]);
}
function $6fafcf15f6b61d60$var$measureScratchPathLength(positions, pointCount) {
    let length = 0;
    for(let index = 1; index < pointCount; index += 1)length += $6fafcf15f6b61d60$var$distanceBetweenScratchPoints(positions, index - 1, index);
    return length;
}
function $6fafcf15f6b61d60$var$clamp01(value) {
    if (!Number.isFinite(value)) return 0;
    if (value < 0) return 0;
    if (value > 1) return 1;
    return value;
}
function $6fafcf15f6b61d60$var$writeSprayParticleQuad(positions, normals, tangents, colors, uvs, uv1s, indices, bounds, quadIndex, center, facing, right, normal, forwardScale, rightScale, color, opacity, usesAtlas, atlasCell, hasLifetime, hasBackfaces, birthTimeSeconds) {
    const vertexStride = hasBackfaces ? 2 : 1;
    const vertex = quadIndex * 4 * vertexStride;
    const atlasScale = usesAtlas ? 0.5 : 1;
    const atlasU = usesAtlas ? atlasCell % 2 * 0.5 : 0;
    const atlasV = usesAtlas ? Math.floor(atlasCell / 2) * 0.5 : 0;
    $6fafcf15f6b61d60$var$writeSprayParticleVertex(positions, normals, tangents, colors, uvs, uv1s, bounds, vertex, center, facing, right, normal, -forwardScale, rightScale, color, opacity, atlasU, atlasV + atlasScale, hasLifetime, birthTimeSeconds);
    $6fafcf15f6b61d60$var$writeSprayParticleVertex(positions, normals, tangents, colors, uvs, uv1s, bounds, vertex + vertexStride, center, facing, right, normal, -forwardScale, -rightScale, color, opacity, atlasU, atlasV, hasLifetime, birthTimeSeconds);
    $6fafcf15f6b61d60$var$writeSprayParticleVertex(positions, normals, tangents, colors, uvs, uv1s, bounds, vertex + vertexStride * 2, center, facing, right, normal, forwardScale, rightScale, color, opacity, atlasU + atlasScale, atlasV + atlasScale, hasLifetime, birthTimeSeconds);
    $6fafcf15f6b61d60$var$writeSprayParticleVertex(positions, normals, tangents, colors, uvs, uv1s, bounds, vertex + vertexStride * 3, center, facing, right, normal, forwardScale, -rightScale, color, opacity, atlasU + atlasScale, atlasV, hasLifetime, birthTimeSeconds);
    if (hasBackfaces) for(let local = 0; local < 4; local += 1){
        const frontVertex = vertex + local * 2;
        const backVertex = frontVertex + 1;
        $6fafcf15f6b61d60$var$copyPosition(positions, frontVertex, backVertex);
        $6fafcf15f6b61d60$var$copyNegatedNormal(normals, frontVertex, backVertex);
        $6fafcf15f6b61d60$var$copyTangent(tangents, frontVertex, backVertex, true);
        $6fafcf15f6b61d60$var$copyUv(uvs, frontVertex, backVertex);
        $6fafcf15f6b61d60$var$writeColorFromAlpha(colors, backVertex, color, colors[frontVertex * 4 + 3]);
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
function $6fafcf15f6b61d60$var$writeSprayParticleVertex(positions, normals, tangents, colors, uvs, uv1s, bounds, vertex, center, facing, right, normal, forwardScale, rightScale, color, opacity, u, v, hasLifetime, birthTimeSeconds) {
    const positionOffset = vertex * 3;
    positions[positionOffset] = center[0] + facing[0] * forwardScale + right[0] * rightScale;
    positions[positionOffset + 1] = center[1] + facing[1] * forwardScale + right[1] * rightScale;
    positions[positionOffset + 2] = center[2] + facing[2] * forwardScale + right[2] * rightScale;
    normals[positionOffset] = normal[0];
    normals[positionOffset + 1] = normal[1];
    normals[positionOffset + 2] = normal[2];
    $6fafcf15f6b61d60$var$writeTangent(tangents, vertex, facing, -1);
    $6fafcf15f6b61d60$var$writeColor(colors, vertex, color, opacity);
    const uvOffset = vertex * 2;
    uvs[uvOffset] = u;
    uvs[uvOffset + 1] = 1 - v;
    if (hasLifetime) {
        const uv1Offset = vertex * 4;
        uv1s[uv1Offset] = facing[0] * forwardScale + right[0] * rightScale;
        uv1s[uv1Offset + 1] = facing[1] * forwardScale + right[1] * rightScale;
        uv1s[uv1Offset + 2] = facing[2] * forwardScale + right[2] * rightScale;
        uv1s[uv1Offset + 3] = birthTimeSeconds;
    }
    $6fafcf15f6b61d60$var$includeBounds(bounds, positions, vertex);
}
function $6fafcf15f6b61d60$var$writeGeniusParticleQuad(positions, normals, tangents, colors, uvs, particleUvs, vectorUvs, indices, bounds, particleIndex, center, up, right, size, color, opacity, usesAtlas, atlasCell, initialRotation, birthTimeSeconds, previousPosition, currentPosition, positionRatio) {
    const vertex = particleIndex * 4;
    const halfSize = size * 0.5;
    const atlasScale = usesAtlas ? 0.5 : 1;
    const atlasU = usesAtlas ? atlasCell % 2 * 0.5 : 0;
    const atlasV = usesAtlas ? Math.floor(atlasCell / 2) * 0.5 : 0;
    for(let corner = 0; corner < 4; corner += 1){
        const isTop = corner >= 2;
        const isRight = corner % 2 === 0;
        $6fafcf15f6b61d60$var$writeGeniusParticleVertex(positions, normals, tangents, colors, uvs, particleUvs, vectorUvs, bounds, vertex + corner, center, up, right, isTop ? halfSize : -halfSize, isRight ? halfSize : -halfSize, color, opacity, atlasU + (isTop ? atlasScale : 0), atlasV + (isRight ? atlasScale : 0), initialRotation, birthTimeSeconds, previousPosition, currentPosition, positionRatio);
    }
    const indexOffset = particleIndex * 6;
    indices[indexOffset] = vertex;
    indices[indexOffset + 1] = vertex + 3;
    indices[indexOffset + 2] = vertex + 1;
    indices[indexOffset + 3] = vertex;
    indices[indexOffset + 4] = vertex + 2;
    indices[indexOffset + 5] = vertex + 3;
}
function $6fafcf15f6b61d60$var$writeGeniusParticleVertex(positions, normals, tangents, colors, uvs, particleUvs, vectorUvs, bounds, vertex, center, up, right, upScale, rightScale, color, opacity, u, v, initialRotation, birthTimeSeconds, previousPosition, currentPosition, positionRatio) {
    const positionOffset = vertex * 3;
    positions[positionOffset] = center[0] + up[0] * upScale + right[0] * rightScale;
    positions[positionOffset + 1] = center[1] + up[1] * upScale + right[1] * rightScale;
    positions[positionOffset + 2] = center[2] + up[2] * upScale + right[2] * rightScale;
    normals[positionOffset] = center[0];
    normals[positionOffset + 1] = center[1];
    normals[positionOffset + 2] = center[2];
    const tangentOffset = vertex * 4;
    tangents[tangentOffset] = right[0];
    tangents[tangentOffset + 1] = right[1];
    tangents[tangentOffset + 2] = right[2];
    tangents[tangentOffset + 3] = 1;
    $6fafcf15f6b61d60$var$writeColor(colors, vertex, color, opacity);
    const uvOffset = vertex * 2;
    uvs[uvOffset] = u;
    uvs[uvOffset + 1] = 1 - v;
    const packedUvOffset = vertex * 4;
    particleUvs[packedUvOffset] = u;
    particleUvs[packedUvOffset + 1] = 1 - v;
    particleUvs[packedUvOffset + 2] = initialRotation;
    particleUvs[packedUvOffset + 3] = birthTimeSeconds;
    const uv1Offset = vertex * 3;
    vectorUvs[uv1Offset] = previousPosition[0] + (currentPosition[0] - previousPosition[0]) * positionRatio;
    vectorUvs[uv1Offset + 1] = previousPosition[1] + (currentPosition[1] - previousPosition[1]) * positionRatio;
    vectorUvs[uv1Offset + 2] = previousPosition[2] + (currentPosition[2] - previousPosition[2]) * positionRatio;
    $6fafcf15f6b61d60$var$includeBounds(bounds, positions, vertex);
}
function $6fafcf15f6b61d60$var$writeParticleVertex(positions, normals, tangents, colors, uvs, bounds, vertex, center, color, opacityMultiplier, offsetX, offsetY, u, v) {
    $6fafcf15f6b61d60$var$writePosition(positions, vertex, [
        center[0] + offsetX,
        center[1] + offsetY,
        center[2]
    ]);
    $6fafcf15f6b61d60$var$writeNormal(normals, vertex, [
        0,
        0,
        1
    ]);
    $6fafcf15f6b61d60$var$writeTangent(tangents, vertex, [
        1,
        0,
        0
    ], 1);
    $6fafcf15f6b61d60$var$writeColor(colors, vertex, color, opacityMultiplier);
    $6fafcf15f6b61d60$var$writeUv(uvs, vertex, [
        u,
        v
    ]);
    $6fafcf15f6b61d60$var$includeBounds(bounds, positions, vertex);
}
// WebXR pointer conventions: -Z is the pointing direction, +Y is up.
const $6fafcf15f6b61d60$var$VEC_FORWARD = [
    0,
    0,
    -1
];
const $6fafcf15f6b61d60$var$VEC_UP = [
    0,
    1,
    0
];
const $6fafcf15f6b61d60$var$VEC_RIGHT = [
    1,
    0,
    0
];
const $6fafcf15f6b61d60$var$EPSILON = 1e-6;
const $6fafcf15f6b61d60$var$OPEN_BRUSH_RIBBON_MINIMUM_MOVE_METERS = 5e-4;
const $6fafcf15f6b61d60$var$OPEN_BRUSH_TUBE_MINIMUM_MOVE_METERS = 5e-4;
const $6fafcf15f6b61d60$var$OPEN_BRUSH_GENIUS_PARTICLE_INTERVAL = 0.0025;
function $6fafcf15f6b61d60$var$getLocalBrushSize(stroke) {
    const brushScale = Number.isFinite(stroke.brushScale) ? Math.max(0, stroke.brushScale) : 1;
    return Math.max(0, stroke.brushSize) * brushScale;
}
function $6fafcf15f6b61d60$var$initializeTubeFrame(orientation, tangent, bootstrapUp, frameRight, frameUp) {
    // ComputeMinimalRotationFrame uses the pointer orientation to choose the
    // roll around a new section's tangent.
    $6fafcf15f6b61d60$var$rotateByQuaternion(orientation, $6fafcf15f6b61d60$var$VEC_UP, bootstrapUp);
    if (Math.abs($6fafcf15f6b61d60$var$dot(bootstrapUp, tangent)) > 0.99) $6fafcf15f6b61d60$var$rotateByQuaternion(orientation, $6fafcf15f6b61d60$var$VEC_RIGHT, bootstrapUp);
    $6fafcf15f6b61d60$var$cross(bootstrapUp, tangent, frameRight);
    if (!$6fafcf15f6b61d60$var$normalizeInPlace(frameRight)) $6fafcf15f6b61d60$var$anyPerpendicular(tangent, frameRight);
    $6fafcf15f6b61d60$var$cross(tangent, frameRight, frameUp);
    $6fafcf15f6b61d60$var$normalizeInPlace(frameUp);
}
function $6fafcf15f6b61d60$var$getFrameRotationAngle(previousRight, previousUp, previousTangent, right, up, tangent) {
    const trace = $6fafcf15f6b61d60$var$dot(previousRight, right) + $6fafcf15f6b61d60$var$dot(previousUp, up) + $6fafcf15f6b61d60$var$dot(previousTangent, tangent);
    return Math.acos(Math.min(1, Math.max(-1, (trace - 1) * 0.5)));
}
function $6fafcf15f6b61d60$var$writeScratchVec3(target, index, value) {
    const offset = index * 3;
    target[offset] = value[0];
    target[offset + 1] = value[1];
    target[offset + 2] = value[2];
}
function $6fafcf15f6b61d60$var$readScratchVec3(source, index, out) {
    const offset = index * 3;
    out[0] = source[offset];
    out[1] = source[offset + 1];
    out[2] = source[offset + 2];
}
function $6fafcf15f6b61d60$var$copyScratchVec3(target, sourceIndex, targetIndex) {
    const sourceOffset = sourceIndex * 3;
    const targetOffset = targetIndex * 3;
    target[targetOffset] = target[sourceOffset];
    target[targetOffset + 1] = target[sourceOffset + 1];
    target[targetOffset + 2] = target[sourceOffset + 2];
}
function $6fafcf15f6b61d60$var$dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function $6fafcf15f6b61d60$var$cross(a, b, out) {
    const x = a[1] * b[2] - a[2] * b[1];
    const y = a[2] * b[0] - a[0] * b[2];
    const z = a[0] * b[1] - a[1] * b[0];
    out[0] = x;
    out[1] = y;
    out[2] = z;
}
function $6fafcf15f6b61d60$var$setTubeRadial(right, up, angle, out) {
    // Reflection from Unity's left-handed coordinates reverses the direction
    // around the ring while preserving its vertex numbering.
    const rightScale = Math.sin(angle);
    const upScale = -Math.cos(angle);
    out[0] = right[0] * rightScale + up[0] * upScale;
    out[1] = right[1] * rightScale + up[1] * upScale;
    out[2] = right[2] * rightScale + up[2] * upScale;
}
function $6fafcf15f6b61d60$var$setTubeRadialScaled(right, up, angle, upAspect, out) {
    const rightScale = Math.sin(angle);
    const upScale = -Math.cos(angle) * upAspect;
    out[0] = right[0] * rightScale + up[0] * upScale;
    out[1] = right[1] * rightScale + up[1] * upScale;
    out[2] = right[2] * rightScale + up[2] * upScale;
}
function $6fafcf15f6b61d60$var$copyVec3(source, target) {
    target[0] = source[0];
    target[1] = source[1];
    target[2] = source[2];
}
function $6fafcf15f6b61d60$var$normalizeInPlace(v) {
    const length = Math.hypot(v[0], v[1], v[2]);
    if (length < $6fafcf15f6b61d60$var$EPSILON) return false;
    v[0] /= length;
    v[1] /= length;
    v[2] /= length;
    return true;
}
/** Matches Vector3.Slerp for unit directions and a clamped interpolation value. */ function $6fafcf15f6b61d60$var$slerpUnitVectors(from, to, amount, out) {
    const t = $6fafcf15f6b61d60$var$clamp01(amount);
    const cosine = Math.max(-1, Math.min(1, $6fafcf15f6b61d60$var$dot(from, to)));
    const angle = Math.acos(cosine);
    const sine = Math.sin(angle);
    if (sine < $6fafcf15f6b61d60$var$EPSILON) {
        out[0] = from[0] + (to[0] - from[0]) * t;
        out[1] = from[1] + (to[1] - from[1]) * t;
        out[2] = from[2] + (to[2] - from[2]) * t;
        $6fafcf15f6b61d60$var$normalizeInPlace(out);
        return;
    }
    const fromWeight = Math.sin((1 - t) * angle) / sine;
    const toWeight = Math.sin(t * angle) / sine;
    out[0] = from[0] * fromWeight + to[0] * toWeight;
    out[1] = from[1] * fromWeight + to[1] * toWeight;
    out[2] = from[2] * fromWeight + to[2] * toWeight;
}
/** Writes some unit vector perpendicular to the given unit vector. */ function $6fafcf15f6b61d60$var$anyPerpendicular(v, out) {
    if (Math.abs(v[1]) < 0.9) $6fafcf15f6b61d60$var$cross($6fafcf15f6b61d60$var$VEC_UP, v, out);
    else $6fafcf15f6b61d60$var$cross($6fafcf15f6b61d60$var$VEC_RIGHT, v, out);
    if (!$6fafcf15f6b61d60$var$normalizeInPlace(out)) {
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
    }
}
/** Rotates a vector by a unit quaternion [x, y, z, w]; zero quats act as identity. */ function $6fafcf15f6b61d60$var$rotateByQuaternion(q, v, out) {
    const x = q[0];
    const y = q[1];
    const z = q[2];
    const w = q[3];
    const lengthSq = x * x + y * y + z * z + w * w;
    if (lengthSq < $6fafcf15f6b61d60$var$EPSILON) {
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
 */ function $6fafcf15f6b61d60$var$writeCentralDifferenceTangent(stroke, index, previousTangent, out) {
    const lastIndex = stroke.controlPoints.length - 1;
    const previous = stroke.controlPoints[Math.max(0, index - 1)].position;
    const next = stroke.controlPoints[Math.min(lastIndex, index + 1)].position;
    out[0] = next[0] - previous[0];
    out[1] = next[1] - previous[1];
    out[2] = next[2] - previous[2];
    if (!$6fafcf15f6b61d60$var$normalizeInPlace(out)) {
        out[0] = previousTangent[0];
        out[1] = previousTangent[1];
        out[2] = previousTangent[2];
        if (!$6fafcf15f6b61d60$var$normalizeInPlace(out)) {
            out[0] = $6fafcf15f6b61d60$var$VEC_FORWARD[0];
            out[1] = $6fafcf15f6b61d60$var$VEC_FORWARD[1];
            out[2] = $6fafcf15f6b61d60$var$VEC_FORWARD[2];
        }
    }
}
function $6fafcf15f6b61d60$var$writeScratchIncomingTangent(positions, pointCount, index, previousTangent, out) {
    const startIndex = index === 0 ? 0 : index - 1;
    const endIndex = index === 0 ? Math.min(1, pointCount - 1) : index;
    const startOffset = startIndex * 3;
    const endOffset = endIndex * 3;
    out[0] = positions[endOffset] - positions[startOffset];
    out[1] = positions[endOffset + 1] - positions[startOffset + 1];
    out[2] = positions[endOffset + 2] - positions[startOffset + 2];
    if (!$6fafcf15f6b61d60$var$normalizeInPlace(out)) {
        out[0] = previousTangent[0];
        out[1] = previousTangent[1];
        out[2] = previousTangent[2];
        if (!$6fafcf15f6b61d60$var$normalizeInPlace(out)) {
            out[0] = $6fafcf15f6b61d60$var$VEC_FORWARD[0];
            out[1] = $6fafcf15f6b61d60$var$VEC_FORWARD[1];
            out[2] = $6fafcf15f6b61d60$var$VEC_FORWARD[2];
        }
    }
}
const $6fafcf15f6b61d60$var$surfaceFrameRight1 = [
    0,
    0,
    0
];
const $6fafcf15f6b61d60$var$surfaceFrameRight2 = [
    0,
    0,
    0
];
/**
 * Port of Open Brush's BaseBrushScript.ComputeSurfaceFrameNew: an orthogonal
 * ribbon frame from the movement direction and pointer orientation. The
 * pointer-up cross term takes over as pointer-forward approaches the movement
 * direction (pulling the brush), and both terms are flipped toward the
 * previous right vector so the strip never flips mid-stroke.
 */ function $6fafcf15f6b61d60$var$computeSurfaceFrame(preferredRight, tangent, pointerForward, pointerUp, isFirst, outRight, outNormal, mirrored = false) {
    $6fafcf15f6b61d60$var$cross(pointerForward, tangent, $6fafcf15f6b61d60$var$surfaceFrameRight1);
    $6fafcf15f6b61d60$var$cross(pointerUp, tangent, $6fafcf15f6b61d60$var$surfaceFrameRight2);
    if (mirrored) {
        $6fafcf15f6b61d60$var$surfaceFrameRight1[0] = -$6fafcf15f6b61d60$var$surfaceFrameRight1[0];
        $6fafcf15f6b61d60$var$surfaceFrameRight1[1] = -$6fafcf15f6b61d60$var$surfaceFrameRight1[1];
        $6fafcf15f6b61d60$var$surfaceFrameRight1[2] = -$6fafcf15f6b61d60$var$surfaceFrameRight1[2];
        $6fafcf15f6b61d60$var$surfaceFrameRight2[0] = -$6fafcf15f6b61d60$var$surfaceFrameRight2[0];
        $6fafcf15f6b61d60$var$surfaceFrameRight2[1] = -$6fafcf15f6b61d60$var$surfaceFrameRight2[1];
        $6fafcf15f6b61d60$var$surfaceFrameRight2[2] = -$6fafcf15f6b61d60$var$surfaceFrameRight2[2];
    }
    let preferred = preferredRight;
    if (isFirst || Math.hypot(preferred[0], preferred[1], preferred[2]) < $6fafcf15f6b61d60$var$EPSILON) preferred = Math.hypot($6fafcf15f6b61d60$var$surfaceFrameRight1[0], $6fafcf15f6b61d60$var$surfaceFrameRight1[1], $6fafcf15f6b61d60$var$surfaceFrameRight1[2]) >= $6fafcf15f6b61d60$var$EPSILON ? $6fafcf15f6b61d60$var$surfaceFrameRight1 : $6fafcf15f6b61d60$var$surfaceFrameRight2;
    const flip1 = $6fafcf15f6b61d60$var$dot($6fafcf15f6b61d60$var$surfaceFrameRight1, preferred) < 0 ? -1 : 1;
    const upWeight = Math.abs($6fafcf15f6b61d60$var$dot(pointerForward, tangent)) * ($6fafcf15f6b61d60$var$dot($6fafcf15f6b61d60$var$surfaceFrameRight2, preferred) < 0 ? -1 : 1);
    outRight[0] = $6fafcf15f6b61d60$var$surfaceFrameRight1[0] * flip1 + $6fafcf15f6b61d60$var$surfaceFrameRight2[0] * upWeight;
    outRight[1] = $6fafcf15f6b61d60$var$surfaceFrameRight1[1] * flip1 + $6fafcf15f6b61d60$var$surfaceFrameRight2[1] * upWeight;
    outRight[2] = $6fafcf15f6b61d60$var$surfaceFrameRight1[2] * flip1 + $6fafcf15f6b61d60$var$surfaceFrameRight2[2] * upWeight;
    if (!$6fafcf15f6b61d60$var$normalizeInPlace(outRight)) {
        outRight[0] = preferred[0];
        outRight[1] = preferred[1];
        outRight[2] = preferred[2];
        if (!$6fafcf15f6b61d60$var$normalizeInPlace(outRight)) $6fafcf15f6b61d60$var$anyPerpendicular(tangent, outRight);
    }
    $6fafcf15f6b61d60$var$cross(tangent, outRight, outNormal);
    if (mirrored) {
        outNormal[0] = -outNormal[0];
        outNormal[1] = -outNormal[1];
        outNormal[2] = -outNormal[2];
    }
    $6fafcf15f6b61d60$var$normalizeInPlace(outNormal);
}
/**
 * Rotates a vector in place by the minimal rotation taking the previous unit
 * tangent to the current one (parallel transport step).
 */ function $6fafcf15f6b61d60$var$rotateBetweenTangents(previousTangent, tangent, v) {
    const cx = previousTangent[1] * tangent[2] - previousTangent[2] * tangent[1];
    const cy = previousTangent[2] * tangent[0] - previousTangent[0] * tangent[2];
    const cz = previousTangent[0] * tangent[1] - previousTangent[1] * tangent[0];
    const d = $6fafcf15f6b61d60$var$dot(previousTangent, tangent);
    if (d < -0.999999) {
        // 180° reversal: rotate around any axis perpendicular to the tangent.
        const axis = [
            0,
            0,
            0
        ];
        $6fafcf15f6b61d60$var$anyPerpendicular(previousTangent, axis);
        const projection = 2 * $6fafcf15f6b61d60$var$dot(axis, v);
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
function $6fafcf15f6b61d60$var$writePosition(target, vertex, value) {
    const offset = vertex * 3;
    target[offset] = value[0];
    target[offset + 1] = value[1];
    target[offset + 2] = value[2];
}
function $6fafcf15f6b61d60$var$writeNormal(target, vertex, value) {
    $6fafcf15f6b61d60$var$writePosition(target, vertex, value);
}
function $6fafcf15f6b61d60$var$copyPosition(target, sourceVertex, targetVertex) {
    const sourceOffset = sourceVertex * 3;
    const targetOffset = targetVertex * 3;
    target[targetOffset] = target[sourceOffset];
    target[targetOffset + 1] = target[sourceOffset + 1];
    target[targetOffset + 2] = target[sourceOffset + 2];
}
function $6fafcf15f6b61d60$var$copyVec3At(values, sourceVertex, targetVertex) {
    const sourceOffset = sourceVertex * 3;
    const targetOffset = targetVertex * 3;
    values[targetOffset] = values[sourceOffset];
    values[targetOffset + 1] = values[sourceOffset + 1];
    values[targetOffset + 2] = values[sourceOffset + 2];
}
function $6fafcf15f6b61d60$var$copyVec2At(values, sourceVertex, targetVertex) {
    const sourceOffset = sourceVertex * 2;
    const targetOffset = targetVertex * 2;
    values[targetOffset] = values[sourceOffset];
    values[targetOffset + 1] = values[sourceOffset + 1];
}
function $6fafcf15f6b61d60$var$copyVec4At(values, sourceVertex, targetVertex) {
    const sourceOffset = sourceVertex * 4;
    const targetOffset = targetVertex * 4;
    values[targetOffset] = values[sourceOffset];
    values[targetOffset + 1] = values[sourceOffset + 1];
    values[targetOffset + 2] = values[sourceOffset + 2];
    values[targetOffset + 3] = values[sourceOffset + 3];
}
function $6fafcf15f6b61d60$var$copyNegatedNormal(target, sourceVertex, targetVertex) {
    const sourceOffset = sourceVertex * 3;
    const targetOffset = targetVertex * 3;
    target[targetOffset] = -target[sourceOffset];
    target[targetOffset + 1] = -target[sourceOffset + 1];
    target[targetOffset + 2] = -target[sourceOffset + 2];
}
function $6fafcf15f6b61d60$var$writeTangent(target, vertex, value, handedness) {
    const offset = vertex * 4;
    target[offset] = value[0];
    target[offset + 1] = value[1];
    target[offset + 2] = value[2];
    target[offset + 3] = handedness;
}
function $6fafcf15f6b61d60$var$copyTangent(target, sourceVertex, targetVertex, flipHandedness) {
    const sourceOffset = sourceVertex * 4;
    const targetOffset = targetVertex * 4;
    target[targetOffset] = target[sourceOffset];
    target[targetOffset + 1] = target[sourceOffset + 1];
    target[targetOffset + 2] = target[sourceOffset + 2];
    target[targetOffset + 3] = target[sourceOffset + 3] * (flipHandedness ? -1 : 1);
}
function $6fafcf15f6b61d60$var$writeColor(target, vertex, value, opacityMultiplier = 1) {
    const offset = vertex * 4;
    target[offset] = value[0];
    target[offset + 1] = value[1];
    target[offset + 2] = value[2];
    target[offset + 3] = $6fafcf15f6b61d60$var$clamp01(value[3] * opacityMultiplier);
}
function $6fafcf15f6b61d60$var$writeColorFromAlpha(target, vertex, value, alpha) {
    const offset = vertex * 4;
    target[offset] = value[0];
    target[offset + 1] = value[1];
    target[offset + 2] = value[2];
    target[offset + 3] = $6fafcf15f6b61d60$var$clamp01(alpha);
}
function $6fafcf15f6b61d60$var$writeUv(target, vertex, value) {
    const offset = vertex * 2;
    target[offset] = value[0];
    // Open Brush authors UVs in Unity's bottom-left convention. Its glTF
    // exporter flips Y, and the extracted browser shaders/textures consume
    // those exported coordinates with texture.flipY disabled. Generated strokes
    // must cross the same boundary or they sample a mirrored atlas/bump field.
    target[offset + 1] = 1 - value[1];
}
function $6fafcf15f6b61d60$var$writePackedUv(target, vertex, u, v, radius) {
    const offset = vertex * 3;
    target[offset] = u;
    target[offset + 1] = 1 - v;
    target[offset + 2] = radius;
}
function $6fafcf15f6b61d60$var$copyUv(target, sourceVertex, targetVertex) {
    const sourceOffset = sourceVertex * 2;
    const targetOffset = targetVertex * 2;
    target[targetOffset] = target[sourceOffset];
    target[targetOffset + 1] = target[sourceOffset + 1];
}
function $6fafcf15f6b61d60$var$createEmptyBounds() {
    return {
        min: [
            Number.POSITIVE_INFINITY,
            Number.POSITIVE_INFINITY,
            Number.POSITIVE_INFINITY
        ],
        max: [
            Number.NEGATIVE_INFINITY,
            Number.NEGATIVE_INFINITY,
            Number.NEGATIVE_INFINITY
        ]
    };
}
function $6fafcf15f6b61d60$var$includeBounds(bounds, positions, vertex) {
    const offset = vertex * 3;
    const x = positions[offset];
    const y = positions[offset + 1];
    const z = positions[offset + 2];
    if (x < bounds.min[0]) bounds.min[0] = x;
    if (y < bounds.min[1]) bounds.min[1] = y;
    if (z < bounds.min[2]) bounds.min[2] = z;
    if (x > bounds.max[0]) bounds.max[0] = x;
    if (y > bounds.max[1]) bounds.max[1] = y;
    if (z > bounds.max[2]) bounds.max[2] = z;
}


class $8fc1e38b542b44db$export$36ca96fcead4fad7 extends (0, $rINUR$Loader) {
    constructor(manager){
        super(manager);
        this.tiltShaderLoader = new (0, $rINUR$TiltShaderLoader)(manager);
    }
    load(url, onLoad, onProgress, onError) {
        const scope = this;
        const loader = new (0, $rINUR$FileLoader)(this.manager);
        loader.setPath(this.path);
        loader.setResponseType("arraybuffer");
        loader.setWithCredentials(this.withCredentials);
        loader.load(url, function(buffer) {
            try {
                onLoad(scope.parse(buffer));
            } catch (e) {
                if (onError) onError(e);
                else console.error(e);
                scope.manager.itemError(url);
            }
        }, onProgress, onError);
    }
    async parse(buffer) {
        const group = new (0, $rINUR$Group)();
        // https://docs.google.com/document/d/11ZsHozYn9FnWG7y3s3WAyKIACfbfwb4PbaS8cZ_xjvo/edit#
        const zip = $rINUR$unzipSync(new Uint8Array(buffer.slice(16)));
        /*
		const thumbnail = zip[ 'thumbnail.png' ].buffer;
		const img = document.createElement( 'img' );
		img.src = URL.createObjectURL( new Blob( [ thumbnail ] ) );
		document.body.appendChild( img );
		*/ const metadata = JSON.parse($rINUR$strFromU8(zip["metadata.json"]));
        /*
		const blob = new Blob( [ zip[ 'data.sketch' ].buffer ], { type: 'application/octet-stream' } );
		window.open( URL.createObjectURL( blob ) );
		*/ const data = new DataView(zip["data.sketch"].buffer);
        const num_strokes = data.getInt32(16, true);
        const brushes = {};
        let offset = 20;
        for(let i = 0; i < num_strokes; i++){
            const brush_index = data.getInt32(offset, true);
            const brush_color = [
                data.getFloat32(offset + 4, true),
                data.getFloat32(offset + 8, true),
                data.getFloat32(offset + 12, true),
                data.getFloat32(offset + 16, true)
            ];
            const brush_size = data.getFloat32(offset + 20, true);
            const stroke_mask = data.getUint32(offset + 24, true);
            const controlpoint_mask = data.getUint32(offset + 28, true);
            let offset_stroke_mask = 0;
            let offset_controlpoint_mask = 0;
            for(let j = 0; j < 4; j++){
                // TOFIX: I don't understand these masks yet
                const byte = 1 << j;
                if ((stroke_mask & byte) > 0) offset_stroke_mask += 4;
                if ((controlpoint_mask & byte) > 0) offset_controlpoint_mask += 4;
            }
            // console.log( { brush_index, brush_color, brush_size, stroke_mask, controlpoint_mask } );
            // console.log( offset_stroke_mask, offset_controlpoint_mask );
            offset = offset + 28 + offset_stroke_mask + 4; // TOFIX: This is wrong
            const num_control_points = data.getInt32(offset, true);
            // console.log( { num_control_points } );
            const positions = new Float32Array(num_control_points * 3);
            const quaternions = new Float32Array(num_control_points * 4);
            offset = offset + 4;
            for(let j = 0, k = 0; j < positions.length; j += 3, k += 4){
                positions[j + 0] = data.getFloat32(offset + 0, true);
                positions[j + 1] = data.getFloat32(offset + 4, true);
                positions[j + 2] = data.getFloat32(offset + 8, true);
                quaternions[k + 0] = data.getFloat32(offset + 12, true);
                quaternions[k + 1] = data.getFloat32(offset + 16, true);
                quaternions[k + 2] = data.getFloat32(offset + 20, true);
                quaternions[k + 3] = data.getFloat32(offset + 24, true);
                offset = offset + 28 + offset_controlpoint_mask; // TOFIX: This is wrong
            }
            if (brush_index in brushes === false) brushes[brush_index] = [];
            brushes[brush_index].push([
                positions,
                quaternions,
                brush_size,
                brush_color
            ]);
        }
        const clock = new (0, $rINUR$Clock)();
        for(const brush_index in brushes){
            const geometry = new $8fc1e38b542b44db$var$StrokeGeometry(brushes[brush_index]);
            const materialName = this.tiltShaderLoader.lookupMaterialName(metadata.BrushIndex[brush_index]);
            const material = await this.tiltShaderLoader.loadAsync(materialName);
            const mesh = new (0, $rINUR$Mesh)(geometry, material);
            const scope = this;
            mesh.onBeforeRender = (renderer, scene, camera, geometry, material, group)=>{
                if (material.uniforms["u_time"]) {
                    const elapsedTime = clock.getElapsedTime();
                    // _Time from https://docs.unity3d.com/Manual/SL-UnityShaderVariables.html
                    const time = new (0, $rINUR$Vector4)(elapsedTime / 20, elapsedTime, elapsedTime * 2, elapsedTime * 3);
                    material.uniforms["u_time"].value = time;
                }
                if (material.uniforms["cameraPosition"]) material.uniforms["cameraPosition"].value = camera.position;
            };
            group.add(mesh);
        }
        return group;
    }
    setBrushPath(path) {
        // Quick repair of path if required
        if (path.slice(path.length - 1) !== "/") path += "/";
        this.tiltShaderLoader.setPath(path);
    }
}
class $8fc1e38b542b44db$var$StrokeGeometry extends (0, $rINUR$BufferGeometry) {
    constructor(strokes){
        super();
        const vertices = [];
        const colors = [];
        const uvs = [];
        const position = new (0, $rINUR$Vector3)();
        const prevPosition = new (0, $rINUR$Vector3)();
        const quaternion = new (0, $rINUR$Quaternion)();
        const prevQuaternion = new (0, $rINUR$Quaternion)();
        const vector1 = new (0, $rINUR$Vector3)();
        const vector2 = new (0, $rINUR$Vector3)();
        const vector3 = new (0, $rINUR$Vector3)();
        const vector4 = new (0, $rINUR$Vector3)();
        // size = size / 2;
        for(const k in strokes){
            const stroke = strokes[k];
            const positions = stroke[0];
            const quaternions = stroke[1];
            const size = stroke[2];
            const color = stroke[3];
            prevPosition.fromArray(positions, 0);
            prevQuaternion.fromArray(quaternions, 0);
            for(let i = 3, j = 4, l = positions.length; i < l; i += 3, j += 4){
                position.fromArray(positions, i);
                quaternion.fromArray(quaternions, j);
                vector1.set(-size, 0, 0);
                vector1.applyQuaternion(quaternion);
                vector1.add(position);
                vector2.set(size, 0, 0);
                vector2.applyQuaternion(quaternion);
                vector2.add(position);
                vector3.set(size, 0, 0);
                vector3.applyQuaternion(prevQuaternion);
                vector3.add(prevPosition);
                vector4.set(-size, 0, 0);
                vector4.applyQuaternion(prevQuaternion);
                vector4.add(prevPosition);
                vertices.push(vector1.x, vector1.y, -vector1.z, 1);
                vertices.push(vector2.x, vector2.y, -vector2.z, 1);
                vertices.push(vector4.x, vector4.y, -vector4.z, 1);
                vertices.push(vector2.x, vector2.y, -vector2.z, 1);
                vertices.push(vector3.x, vector3.y, -vector3.z, 1);
                vertices.push(vector4.x, vector4.y, -vector4.z, 1);
                prevPosition.copy(position);
                prevQuaternion.copy(quaternion);
                colors.push(...color);
                colors.push(...color);
                colors.push(...color);
                colors.push(...color);
                colors.push(...color);
                colors.push(...color);
                const p1 = i / l;
                const p2 = (i - 3) / l;
                uvs.push(p1, 0);
                uvs.push(p1, 1);
                uvs.push(p2, 0);
                uvs.push(p1, 1);
                uvs.push(p2, 1);
                uvs.push(p2, 0);
            }
        }
        this.setAttribute("position", new (0, $rINUR$BufferAttribute)(new Float32Array(vertices), 4));
        this.setAttribute("color", new (0, $rINUR$BufferAttribute)(new Float32Array(colors), 4));
        this.setAttribute("uv", new (0, $rINUR$BufferAttribute)(new Float32Array(uvs), 2));
        this.setAttribute("a_position", this.getAttribute("position"));
        this.setAttribute("a_color", this.getAttribute("color"));
        this.setAttribute("a_texcoord0", this.getAttribute("uv"));
    //this.setAttribute("_tb_unity_texcoord_0", this.getAttribute("uv"));
    }
}


export {$8fc1e38b542b44db$export$36ca96fcead4fad7 as TiltLoader, $8da93982032879e2$export$c58992c2d0e506a0 as createBufferGeometry, $6fafcf15f6b61d60$export$cbaccd875830d3d0 as createBrushGeometryArrays, $6fafcf15f6b61d60$export$366b94ab2030e692 as generateBrushGeometry, $6fafcf15f6b61d60$export$b666f4efdc86d990 as generateBrushGeometryInto, $6fafcf15f6b61d60$export$96e734d2eaa5b48d as getGeneratedIndexCount, $6fafcf15f6b61d60$export$25229b7d204fd918 as getGeneratedVertexCount};
//# sourceMappingURL=three-tiltloader.module.js.map
