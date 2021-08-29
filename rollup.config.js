import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const license = `/*!
 * three-tiltloader
 * https://github.com/icosa-gallery/three-tiltloader
 * Copyright (c) 2021 Icosa Gallery
 * Released under the Apache 2.0 Licence.
 */`;

export default {
	input: 'src/index.ts',
	external: [
		'three', 
		'three/examples/jsm/loaders/GLTFLoader',
		'three/examples/jsm/loaders/TiltLoader'
	],
	output: [
		{
			format: 'umd',
			name: 'three-tiltloader',
			file: 'dist/three-tiltloader.js',
			banner: license,
			indent: '\t',
		},
		{
			format: 'es',
			file: 'dist/three-tiltloader.module.js',
			banner: license,
			indent: '\t',
		},
	],
	plugins: [
		nodeResolve(),
		typescript( { typescript: require( 'typescript' ) } ),
	]
};
