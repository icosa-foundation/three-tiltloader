import dts from 'rollup-plugin-dts';

const license = `/*!
 * three-tiltloader
 * https://github.com/icosa-gallery/three-tiltloader
 * Copyright (c) 2021-2022 Icosa Gallery
 * Released under the Apache 2.0 Licence.
 */`;

export default [
	{
		input: 'src/TiltLoader.js',
		external: [
			'three',
			'three-icosa',
			'three/examples/libs/fflate.module.js'
		],
		output: [
			{
				format: 'umd',
				name: 'three-tiltloader',
				file: 'dist/three-tiltloader.js',
				banner: license,
				indent: '\t',
				globals: {
					'three': 'three',
					'three-icosa': 'three-icosa',
					'three/examples/libs/fflate.module.js': 'three/examples/libs/fflate.module.js'
				}
			},
			{
				format: 'es',
				file: 'dist/three-tiltloader.module.js',
				banner: license,
				indent: '\t',
			},
		]
	},
	{
		input: 'src/TiltLoader.d.ts',
		external: [
			'three',
		],
		output: [
			{
				format: 'es',
				file: 'dist/three-tiltloader.d.ts',
			}
		],
		plugins: [dts()]
	}
];
