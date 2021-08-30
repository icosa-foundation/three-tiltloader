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
    Material,
    Mesh,
    RawShaderMaterial,
    Vector3,
    Vector4
} from 'three';

export function updateBrushes(updateableMeshes : Mesh[], elapsedTime : number, cameraPosition : Vector3) {
    // _Time from https://docs.unity3d.com/Manual/SL-UnityShaderVariables.html
    var time = new Vector4(elapsedTime/20, elapsedTime, elapsedTime*2, elapsedTime*3);

    // Update uniforms of meshes that need it.
    updateableMeshes.forEach((mesh) => {
        var material = mesh.material as Material;
        switch (material.name) {
            case "material_DiamondHull":
                (material as RawShaderMaterial).uniforms!["cameraPosition"].value = cameraPosition;
                (material as RawShaderMaterial).uniforms!["u_time"].value = time;
                break;
            case "material_ChromaticWave":
            case "material_Comet":
            case "material_Disco":
            case "material_Electricity":
            case "material_Embers":
            case "material_Fire":
            case "material_Hypercolor":
            case "material_LightWire":
            case "material_NeonPulse":
            case "material_Plasma":
            case "material_Rainbow":
            case "material_Snow":
            case "material_Stars":
            case "material_Streamers":
            case "material_Waveform":
            case "material_WigglyGraphite":
                (material as RawShaderMaterial).uniforms!["u_time"].value = time;
                break;
        }
    });
}
