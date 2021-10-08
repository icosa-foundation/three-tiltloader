import { Loader, RawShaderMaterial, LoadingManager, ShaderMaterialParameters } from "three";
export declare class TiltShaderLoader extends Loader {
    constructor(manager: LoadingManager);
    load(brushName: string, onLoad: (response: RawShaderMaterial) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): Promise<void>;
    parse(materialParams: ShaderMaterialParameters): RawShaderMaterial;
}
