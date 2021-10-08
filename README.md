# three-tiltloader

[![Latest NPM release](https://img.shields.io/npm/v/three-tiltloader.svg)](https://www.npmjs.com/package/three-tiltloader)
[![Support us on Open Collective!](https://img.shields.io/opencollective/all/icosa?logo=open-collective&label=Support%20us%20on%20Open%20Collective%21)](https://opencollective.com/icosa)
[![Twitter](https://img.shields.io/badge/follow-%40IcosaGallery-blue.svg?style=flat&logo=twitter)](https://twitter.com/IcosaGallery)
[![Discord](https://discordapp.com/api/guilds/783806589991780412/embed.png?style=shield)](https://discord.gg/W7NCEYnEfy)

Custom three.js loader for various Tilt Brush/Open Brush formats. The loader will inject the relevant shaders and textures for correct rendering of the file.

This project aims to provide a simple way to load and render raw .tilt files and the various export formats on the web, using the three.js library.

The loader is still a work in progress and subject to change. Please join the [Discord](https://discord.gg/W7NCEYnEfy) to discuss the project!

If you would like to support our projects, we are on [Open Collective](https://opencollective.com/icosa)!

# Supported Formats

|Format|Compatability|
|-|-|
| GLTF 2.0 (glb, exported directly from Tilt Brush/Open Brush) | ✅ |
| GLTF 1.0 (gltf+bin, Google Poly legacy format) | ✅ |
| TILT | In progress, renders control points. |
| FBX | Not Implemented |
| OBJ | Not Implemented |

# Installation

The loader is designed to be used with `three.js`. The library has been tested against `r128`, but may work with other releases.

## Important
You need to pass the loader a path to a folder containing all the relevant brushes and textures. This has been omitted to reduce package size and leave brush location up to the implementer. You can get a copy of the brushes folder in the root of this project's repository.


## Install via npm
`npm install --save three-tiltloader`

# Example Usage
The following is an example implementation for loading in a glTF 2.0 model exported from Tilt Brush / Open Brush. Depending on the model, you may have to adjust the camera to see it fully.

```js
import {
    PerspectiveCamera,
    Scene,
    Clock,
    WebGLRenderer
} from 'three';
    
import { TiltLoader, updateBrushes } from 'three-tiltloader';

function init() {
    
    // General three.js scene setup
    let camera = new PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.01, 100 );
    camera.position.set( 0, 5, -5 );
    camera.lookAt( 0, 0, 0 );

    let scene = new Scene();

    let clock = new Clock();

    let renderer = new WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    let loader = new TiltLoader();

    // Helper variable to store brushes that animate/respond to the scene
    let updateableMeshes;

    /* IMPORTANT: Point the loader to a folder of all the brush shaders and textures.
    *  This has been omitted to reduce package size and leave brush location up to the implementer.
    *  You can get a copy of the brushes folder at this project's repository.
    */
    loader.setBrushDirectory( 'path/to/brush/folder' );
    loader.load( 'path/to/tilt/model.glb', ( tiltData ) => {
        /* The returned object contains two components:
        *  scene : Object3D. This is the model you want to place in the scene
        *  updateableMeshes : Mesh[]. An array of all the brush meshes that require updating. Save this to a variable.
        */
        scene.add( tiltData.scene );
        updateableMeshes = tiltData.updateableMeshes;
    });
    
    function render() {
        // Pass the mesh array to the helper function for animating.
        if( updateableMeshes !== undefined ) {
            updateBrushes( updateableMeshes, clock.getElapsedTime(), camera.position );
        }
        
        renderer.render( scene, camera );
    }

    renderer.setAnimationLoop( render );
}

init();
```