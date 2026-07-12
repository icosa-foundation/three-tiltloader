// Adapted from initial TiltLoader implementation in three.js r128
// https://github.com/mrdoob/three.js/blob/r128/examples/jsm/loaders/TiltLoader.js

import {
	Group,
	Loader,
	LoadingManager
} from 'three';

export {
    createBufferGeometry,
    type ControlPoint,
    type GeometryAttribute,
    type GeometryAttributeArray,
    type GeometryBounds,
    type GeometryGroup,
    type GeometryResult,
    type Quat,
    type Rgba,
    type StrokeInput,
    type Vec3,
} from './geometry-api.mjs';

export class TiltLoader extends Loader {
    constructor(manager?: LoadingManager);

    load(
        url: string,
        onLoad: (object: Group) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (event: ErrorEvent) => void,
    ): void;
    loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<Group>;
    setBrushPath(brushPath: string): void;
}
