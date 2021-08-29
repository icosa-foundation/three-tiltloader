# three-tiltloader

[![Latest NPM release](https://img.shields.io/npm/v/three-tiltloader.svg)](https://www.npmjs.com/package/three-tiltloader)
[![Twitter](https://img.shields.io/badge/follow-%40IcosaGallery-blue.svg?style=flat&logo=twitter)](https://twitter.com/IcosaGallery)
[![Discord](https://discordapp.com/api/guilds/783806589991780412/embed.png?style=shield)](https://discord.gg/W7NCEYnEfy)
[![Open Collective backers and sponsors](https://img.shields.io/opencollective/all/icosa?logo=open-collective)](https://opencollective.com/icosa)

Custom three.js loader for various Tilt Brush/Open Brush formats. The loader will inject the relevant shaders and textures for correct rendering of the file.

## Supported Formats

|Format|Compatability|
|-|-|
| GLTF 2.0 (glb, exported direct from Tilt Brush/Open Brush) | ✅ |
| GLTF 1.0 (gltf+bin, Google Poly legacy format) | ✅ |
| TILT | Partially supported |
| FBX | Not Implemented |
| OBJ | Not Implemented |

This project aims to provide a simple way to add raw .tilt files and the various export formats on the web, using the three.js library.

The loader is still a work in progress and subject to change. Please join the [Discord](https://discord.gg/W7NCEYnEfy) to discuss the project!

If you would like to 

## Installation

The loader is designed to be used with `three.js`. The library has been tested against `r128`, but may work with other releases.

`npm install --save three-tiltloader`