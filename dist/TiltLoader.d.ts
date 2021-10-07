import { LoadingManager, Loader, Mesh, Object3D } from "three";
export interface TiltModel {
    scene: Object3D;
    updateableMeshes: Mesh[];
}
export declare class TiltLoader extends Loader {
    private rawTiltLoader;
    private gltfLoader;
    private legacygltf;
    private tiltShaderLoader;
    private isGltfLegacy;
    private updateableMeshes;
    private loadedModel?;
    constructor(manager: LoadingManager);
    setPath(path: string): this;
    setBrushDirectory(path: string): this;
    load(url: string, onLoad: (response: TiltModel) => void): Promise<TiltModel>;
    loadGltf2(url: string, onLoad?: (response: TiltModel) => void): Promise<TiltModel>;
    loadTilt(url: string, onLoad?: (response: TiltModel) => void): Promise<TiltModel>;
    loadGltf1(url: string, onLoad?: (response: TiltModel) => void): Promise<TiltModel>;
    private replaceBrushMaterials;
}
