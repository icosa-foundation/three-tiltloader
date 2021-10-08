// Copyright 2021 Icosa Gallery
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { 
    LoadingManager, 
    Loader, 
    Material, 
    Matrix4, 
    Mesh, 
    Object3D, 
    RawShaderMaterial 
} from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { TiltLoader as RawTiltLoader }  from "three/examples/jsm/loaders/TiltLoader";
import { LegacyGLTFLoader } from "./legacy/LegacyGLTFLoader";
import { TiltShaderLoader } from "./TiltShaderLoader";

export interface TiltModel {
    scene: Object3D;
    updateableMeshes: Mesh[];
}

export class TiltLoader extends Loader {
    private rawTiltLoader: RawTiltLoader;
    private gltfLoader: GLTFLoader;
    private legacygltf: LegacyGLTFLoader;
    
    private tiltShaderLoader: TiltShaderLoader;

    private isGltfLegacy: boolean = false;

    private updateableMeshes: Mesh[] = [];

    private loadedModel?: Object3D;

    constructor (manager: LoadingManager) {
        super(manager);

        this.rawTiltLoader = new RawTiltLoader(manager);
        this.gltfLoader = new GLTFLoader(manager);
        this.legacygltf = new LegacyGLTFLoader(manager);
        
        this.tiltShaderLoader = new TiltShaderLoader(manager);
    }

    public setPath(path: string): this {
        this.rawTiltLoader.setPath(path);
        this.gltfLoader.setPath(path);
        this.legacygltf.setPath(path);
        return this;
    }

    public setBrushDirectory(path: string): this {
        this.tiltShaderLoader.setPath(path);
        return this;
    }

    public async load(
        url: string, 
        onLoad: (response: TiltModel) => void
    ): Promise<TiltModel> {
        return await this.loadGltf2(url, onLoad);
    }

    public async loadGltf2(
        url: string, 
        onLoad?: (response: TiltModel) => void
    ): Promise<TiltModel> {
        this.loadedModel = (await this.gltfLoader.loadAsync(url)).scene;
        await this.replaceBrushMaterials();

        let data: TiltModel;
        data = { scene: this.loadedModel, updateableMeshes: this.updateableMeshes };
        if (onLoad) {
            onLoad(data);
        }
        return data;
    }

    public async loadTilt(url: string,
        onLoad?: (response: TiltModel) => void
    ): Promise<TiltModel> {
        this.loadedModel = await this.rawTiltLoader.loadAsync(url);
        
        let data: TiltModel;
        data = { scene: this.loadedModel, updateableMeshes: [] };
        if(onLoad) {
            onLoad(data);
        }
        return data;
    }

    public async loadGltf1(url : string,
        onLoad?: (response: TiltModel) => void
    ): Promise<TiltModel> {
        this.loadedModel = (await this.legacygltf.loadAsync(url)).scene;

        if(!this.loadedModel)
            return Promise.reject();

        this.isGltfLegacy = true;
        await this.replaceBrushMaterials();

        let data: TiltModel;
        data = { scene: this.loadedModel, updateableMeshes: this.updateableMeshes };
        if(onLoad) {
            onLoad(data);
        }
        return data;
    }

    private async replaceBrushMaterials() {
        if(!this.loadedModel) 
            return;

        // Attempt to set and fetch light settings.
        let light0transform = new Matrix4().identity();
        let light1transform = new Matrix4().identity();
        
        light0transform = this.loadedModel.getObjectByName("node_SceneLight_0")?.matrix ?? light0transform;
        light1transform = this.loadedModel.getObjectByName("node_SceneLight_1")?.matrix ?? light1transform;

        if(!light0transform || !light1transform) {
            this.loadedModel.traverse((object : Object3D) => {
                if(object.name.startsWith("node_SceneLight_0")) {
                    light0transform = object.modelViewMatrix;
                }
                else if (object.name.startsWith("node_SceneLight_1")) {
                    light1transform = object.modelViewMatrix;
                }
            });
        }

        this.loadedModel.traverse(async (object: Object3D) => {
            if(object.type === "Mesh") {
                var targetFilter: string = "";

                var mesh = object as Mesh;
                var material = mesh.material as Material;
                var shader: RawShaderMaterial

                // GLTF1 models need to be handled differently
                if(!this.isGltfLegacy) {
                    targetFilter = material.name;
                } else {
                    targetFilter = "brush_" + mesh.name.split('_')[1];
                }

                switch(targetFilter) {
                    case "brush_BlocksBasic":
                        mesh.geometry.name = "geometry_BlocksBasic";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        //mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("BlocksBasic");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_BlocksBasic";
                        break;
                    case "brush_BlocksGem":
                        mesh.geometry.name = "geometry_BlocksGem";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        //mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("BlocksGem");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_BlocksGem";
                        break;
                    case "brush_BlocksGlass":
                        mesh.geometry.name = "geometry_BlocksGlass";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        //mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("BlocksGlass");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_BlocksGlass";
                        break;

                    case "brush_Bubbles":
                        mesh.geometry.name = "geometry_Bubbles";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute(this.isGltfLegacy ? "normal" : "_tb_unity_normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        mesh.geometry.setAttribute("a_texcoord1", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv2" : "_tb_unity_texcoord_1"));
                        shader = await this.tiltShaderLoader.loadAsync("Bubbles");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_Bubbles";
                        break;

                    case "brush_CelVinyl":
                        mesh.geometry.name = "geometry_CelVinyl";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("CelVinyl");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_CelVinyl";
                        break;

                    case "brush_ChromaticWave":
                        mesh.geometry.name = "geometry_ChromaticWave";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("ChromaticWave");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_ChromaticWave";
                        this.updateableMeshes.push(mesh);
                        break;

                    case "brush_CoarseBristles":
                        mesh.geometry.name = "geometry_CoarseBristles";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("CoarseBristles");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_CoarseBristles";
                        break;

                    case "brush_Comet":
                        mesh.geometry.name = "geometry_Comet";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("Comet");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_Comet";
                        this.updateableMeshes.push(mesh);
                        break;

                    case "brush_DiamondHull":
                        mesh.geometry.name = "geometry_DiamondHull";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("DiamondHull");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_DiamondHull";
                        this.updateableMeshes.push(mesh);
                        break;

                    case "brush_Disco":
                        mesh.geometry.name = "geometry_Disco";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("Disco");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_Disco";
                        this.updateableMeshes.push(mesh);
                        break;

                    case "brush_DotMarker":
                        mesh.geometry.name = "geometry_DotMarker";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("DotMarker");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_DotMarker";
                        break;

                    case "brush_Dots":
                        mesh.geometry.name = "geometry_Dots";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute(this.isGltfLegacy ? "normal" : "_tb_unity_normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        mesh.geometry.setAttribute("a_texcoord1", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv2" : "_tb_unity_texcoord_1"));
                        shader = await this.tiltShaderLoader.loadAsync("Dots");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_Dots";
                        break;

                    case "brush_DoubleTaperedFlat":
                        mesh.geometry.name = "geometry_DoubleTaperedFlat";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("DoubleTaperedFlat");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_DoubleTaperedFlat";
                        break;

                    case "brush_DoubleTaperedMarker":
                        mesh.geometry.name = "geometry_DoubleTaperedMarker";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("DoubleTaperedMarker");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_DoubleTaperedMarker";
                        break;

                    case "brush_DuctTape":
                        mesh.geometry.name = "geometry_DuctTape";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("DuctTape");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_DuctTape";
                        break;

                    case "brush_Electricity":
                        mesh.geometry.name = "geometry_Electricity";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        mesh.geometry.setAttribute("a_texcoord1", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv2" :"_tb_unity_texcoord_1"));
                        shader = await this.tiltShaderLoader.loadAsync("Electricity");
                        mesh.material = shader;
                        mesh.material.name = "material_Electricity";
                        this.updateableMeshes.push(mesh);
                        break;

                    case "brush_Embers":
                        mesh.geometry.name = "geometry_Embers";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute(this.isGltfLegacy ? "normal" : "_tb_unity_normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        mesh.geometry.setAttribute("a_texcoord1", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv2" :"_tb_unity_texcoord_1"));
                        shader = await this.tiltShaderLoader.loadAsync("Embers");
                        mesh.material = shader;
                        mesh.material.name = "material_Embers";
                        this.updateableMeshes.push(mesh);
                        break;

                    case "brush_EnvironmentDiffuse":
                        mesh.geometry.name = "geometry_EnvironmentDiffuse";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("EnvironmentDiffuse");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_EnvironmentDiffuse";
                        break;

                    case "brush_EnvironmentDiffuseLightMap":
                        mesh.geometry.name = "geometry_EnvironmentDiffuseLightMap";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("EnvironmentDiffuseLightMap");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_EnvironmentDiffuseLightMap";
                        break;

                    case "brush_Fire":
                        mesh.geometry.name = "geometry_Fire";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("Fire");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_Fire";
                        this.updateableMeshes.push(mesh);
                        break;

                    case "brush_Flat":
                        mesh.geometry.name = "geometry_Flat";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("Flat");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_Flat";
                        break;

                    case "brush_FlatDeprecated":
                        mesh.geometry.name = "geometry_FlatDeprecated";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("FlatDeprecated");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_FlatDeprecated";
                        this.updateableMeshes.push(mesh);
                        break;

                    case "brush_Highlighter":
                        mesh.geometry.name = "geometry_Highlighter";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("Highlighter");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_Highlighter";
                        break;

                    case "brush_Hypercolor":
                        mesh.geometry.name = "geometry_Hypercolor";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("Hypercolor");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_Hypercolor";
                        this.updateableMeshes.push(mesh);
                        break;

                    case "brush_HyperGrid":
                        mesh.geometry.name = "geometry_HyperGrid";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        mesh.geometry.setAttribute("a_texcoord1", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv2" :"_tb_unity_texcoord_1"));
                        shader = await this.tiltShaderLoader.loadAsync("HyperGrid");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_HyperGrid";
                        break;

                    case "brush_Icing":
                        mesh.geometry.name = "geometry_Icing";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));

                        shader = await this.tiltShaderLoader.loadAsync("Icing");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_Icing";
                        break;

                    case "brush_Ink":
                        mesh.geometry.name = "geometry_Ink";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("Ink");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_Ink";
                        break;

                    case "brush_Leaves":
                        mesh.geometry.name = "geometry_Leaves";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("Leaves");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_Leaves";
                        break;

                    case "brush_Light":
                        mesh.geometry.name = "geometry_Light";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("Light");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_Light";
                        break;

                    case "brush_LightWire":
                        mesh.geometry.name = "geometry_LightWire";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("LightWire");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_LightWire";
                        this.updateableMeshes.push(mesh);
                        break;

                    case "brush_Lofted":
                        mesh.geometry.name = "geometry_Lofted";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("Lofted");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_Lofted";
                        break;

                    case "brush_Marker":
                        mesh.geometry.name = "geometry_Marker";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("Marker");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_Marker";
                        break;

                    case "brush_MatteHull":
                        mesh.geometry.name = "geometry_MatteHull";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        shader = await this.tiltShaderLoader.loadAsync("MatteHull");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_MatteHull";
                        break;

                    case "brush_NeonPulse":
                        mesh.geometry.name = "geometry_NeonPulse";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("NeonPulse");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_NeonPulse";
                        this.updateableMeshes.push(mesh);
                        break;

                    case "brush_OilPaint":
                        mesh.geometry.name = "geometry_OilPaint";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("OilPaint");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_OilPaint";
                        break;

                    case "brush_Paper":
                        mesh.geometry.name = "geometry_Paper";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("Paper");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_Paper";
                        break;

                    case "brush_PbrTemplate":
                        mesh.geometry.name = "geometry_PbrTemplate";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("PbrTemplate");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_PbrTemplate";
                        break;

                    case "brush_PbrTransparentTemplate":
                        mesh.geometry.name = "geometry_PbrTransparentTemplate";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("PbrTransparentTemplate");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_PbrTransparentTemplate";
                        break;

                    case "brush_Petal":
                        mesh.geometry.name = "geometry_Petal";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("Petal");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_Petal";
                        break;

                    case "brush_Plasma":
                        mesh.geometry.name = "geometry_Plasma";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("Plasma");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_Plasma";
                        this.updateableMeshes.push(mesh);
                        break;

                    case "brush_Rainbow":
                        mesh.geometry.name = "geometry_Rainbow";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("Rainbow");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_Rainbow";
                        this.updateableMeshes.push(mesh);
                        break;

                    case "brush_ShinyHull":
                        mesh.geometry.name = "geometry_ShinyHull";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("ShinyHull");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_ShinyHull";
                        break;

                    case "brush_Smoke":
                        mesh.geometry.name = "geometry_Smoke";
                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute(this.isGltfLegacy ? "normal" : "_tb_unity_normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        mesh.geometry.setAttribute("a_texcoord1", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv2" :"_tb_unity_texcoord_1"));
                        shader = await this.tiltShaderLoader.loadAsync("Smoke");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_Smoke";
                        break;

                    case "brush_Snow":
                        mesh.geometry.name = "geometry_Snow";
                        
                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute(this.isGltfLegacy ? "normal" : "_tb_unity_normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        mesh.geometry.setAttribute("a_texcoord1", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv2" :"_tb_unity_texcoord_1"));
                        shader = await this.tiltShaderLoader.loadAsync("Snow");
                        mesh.material = shader;
                        mesh.material.name = "material_Snow";
                        this.updateableMeshes.push(mesh);
                        break;

                    case "brush_SoftHighlighter":
                        mesh.geometry.name = "geometry_SoftHighlighter";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("SoftHighlighter");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_SoftHighlighter";
                        break;

                    case "brush_Spikes":
                        mesh.geometry.name = "geometry_Spikes";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("Spikes");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_Spikes";
                        break;

                    case "brush_Splatter":
                        mesh.geometry.name = "geometry_Splatter";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("Splatter");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_Splatter";
                        break;

                    case "brush_Stars":
                        mesh.geometry.name = "geometry_Stars";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute(this.isGltfLegacy ? "normal" : "_tb_unity_normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        mesh.geometry.setAttribute("a_texcoord1", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv2" :"_tb_unity_texcoord_1"));
                        shader = await this.tiltShaderLoader.loadAsync("Stars");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_Stars";
                        this.updateableMeshes.push(mesh);
                        break;

                    case "brush_Streamers":
                        mesh.geometry.name = "geometry_Streamers";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("Streamers");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_Streamers";
                        this.updateableMeshes.push(mesh);
                        break;

                    case "brush_Taffy":
                        mesh.geometry.name = "geometry_Taffy";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("DiamondHull");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_DiamondHull";
                        this.updateableMeshes.push(mesh);
                        break;

                    case "brush_TaperedFlat":
                        mesh.geometry.name = "geometry_TaperedFlat";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("TaperedFlat");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_TaperedFlat";
                        break;

                    case "brush_TaperedMarker":
                        mesh.geometry.name = "geometry_TaperedMarker";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("TaperedMarker");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_TaperedMarker";
                        break;

                    case "brush_TaperedMarker_Flat":
                        mesh.geometry.name = "geometry_Flat";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("Flat");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_Flat";
                        break;

                    case "brush_ThickPaint":
                        mesh.geometry.name = "geometry_ThickPaint";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("ThickPaint");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_ThickPaint";
                        break;

                    case "brush_Toon":
                        mesh.geometry.name = "geometry_Toon";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        shader = await this.tiltShaderLoader.loadAsync("Toon");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_Toon";
                        break;

                    case "brush_UnlitHull":
                        mesh.geometry.name = "geometry_UnlitHull";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        shader = await this.tiltShaderLoader.loadAsync("UnlitHull");
                        mesh.material = shader;
                        mesh.material.name = "material_UnlitHull";
                        break;

                    case "brush_VelvetInk":
                        mesh.geometry.name = "geometry_VelvetInk";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("VelvetInk");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_VelvetInk";
                        break;

                    case "brush_Waveform":
                        mesh.geometry.name = "geometry_Waveform";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("Waveform");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_Waveform";
                        this.updateableMeshes.push(mesh);
                        break;

                    case "brush_WetPaint":
                        mesh.geometry.name = "geometry_WetPaint";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("WetPaint");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_WetPaint";
                        break;

                    case "brush_WigglyGraphite":
                        mesh.geometry.name = "geometry_WigglyGraphite";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute(this.isGltfLegacy ? "uv" : "_tb_unity_texcoord_0"));
                        shader = await this.tiltShaderLoader.loadAsync("WigglyGraphite");
                        shader.uniforms["u_SceneLight_0_matrix"]!.value = light0transform;
                        shader.uniforms["u_SceneLight_1_matrix"]!.value = light1transform;
                        shader.uniformsNeedUpdate = true;
                        mesh.material = shader;
                        mesh.material.name = "material_WigglyGraphite";
                        this.updateableMeshes.push(mesh);
                        break;

                    case "brush_Wire":
                        mesh.geometry.name = "geometry_Wire";

                        mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                        mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                        mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                        shader = await this.tiltShaderLoader.loadAsync("Wire");
                        mesh.material = shader;
                        mesh.material.name = "material_Wire";
                        break;
                }
            }
        });
    }
}
