# three-tiltloader

[![Latest NPM release](https://img.shields.io/npm/v/three-tiltloader.svg)](https://www.npmjs.com/package/three-tiltloader)
[![Support us on Open Collective!](https://img.shields.io/opencollective/all/icosa?logo=open-collective&label=Support%20us%20on%20Open%20Collective%21)](https://opencollective.com/icosa)
[![Twitter](https://img.shields.io/badge/follow-%40IcosaGallery-blue.svg?style=flat&logo=twitter)](https://twitter.com/IcosaGallery)
[![Discord](https://discordapp.com/api/guilds/783806589991780412/embed.png?style=shield)](https://discord.gg/W7NCEYnEfy)

Custom three.js loader for the `.tilt` format used by Tilt Brush and Open Brush. The loader will inject the relevant shaders and textures for correct rendering of the file.

Adapted from the initial [TiltLoader](https://github.com/mrdoob/three.js/blob/r128/examples/jsm/loaders/TiltLoader.js) in three.js.

This project aims to provide a simple way to load and render raw .tilt files on the web, using the three.js library.

The loader is still a work in progress and subject to change. Please join the [Discord](https://discord.gg/W7NCEYnEfy) to discuss the project!

If you would like to support our projects, we are on [Open Collective](https://opencollective.com/icosa)!


# Installation

The loader is designed to be used with `three.js`. The library has been tested against `r128`, but may work with other releases.

## Important

You need to pass the loader a path to a folder containing all the relevant brushes and textures. This has been omitted to reduce package size and leave brush location up to the implementer. You can get a copy of the brushes folder in the root of this project's repository.

## Install via npm

`npm install --save three-tiltloader`

# Example Usage

```js
import { TiltLoader } from 'three-tiltloader';
...

let loader = new TiltLoader();
loader.setPath('path/to/brush/folder');

loader.setBrushDirectory( 'path/to/brush/folder' );
loader.load( 'path/to/tilt/sketch.tilt', ( model ) => {
    scene.add( model );
});
```

## Brush reference screenshots

Generate deterministic 1024×1024 browser renders using the same authored path,
color, brush size, camera framing, black-environment lighting, and fixed shader
time as Open Brush's `UiScreenshotter`:

```sh
npm run screenshots:brushes
```

The default output is `Support/Screenshots/brushes-postfx-disabled`. To select
the exact brush GUIDs and durable filenames from an Open Brush reference run,
pass its mesh-fixture directory:

```sh
npm run screenshots:brushes -- --fixtures <open-brush-checkout>/Support/BrushFixtures
```

As in `gallery-viewer`, brush shaders and textures are supplied independently
of this library. Point the capture at the `brushes/` directory beneath the
asset base URL or asset checkout:

```sh
npm run screenshots:brushes -- \
  --fixtures <open-brush-checkout>/Support/BrushFixtures \
  --assets <sketch-assets-checkout>/brushes
```

Use `--brush Marker` for a bounded single-brush run, `--output <directory>` to
change the destination, or `--headed` to watch the capture in Chrome. Chrome is
run with a temporary automation profile; normal browser profiles are not used.
