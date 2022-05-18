import { readFileSync } from "fs";
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import { visualizer } from "rollup-plugin-visualizer";
import * as meta from "./package.json";

const copyright = readFileSync("./LICENSE", "utf-8")
	.split(/\n/g)
	.filter(line => /^Copyright\s+/.test(line))
	.map(line => line.replace(/^Copyright\s+/, ""))
	.join(", ");

const banner = `// ${meta.homepage} v${meta.version} Copyright ${copyright}`

const commonPlugins = [
	json(),
	commonjs(),
	resolve(),
]

export default [
	{
		input: 'dist/index.js',
		output: {
			file: `dist/${meta.name}.js`,
			name: "sda",
			format: "umd",
			banner: banner,
			inlineDynamicImports: true
		},
		plugins: [
			...commonPlugins,
			visualizer((opts) => {
				return { gzipSize: true, filename: "statsNodeJS.html" }
			})
		]
	},
	{
		input: 'dist/indexBrowser.js',
		output: {
			file: `dist/${meta.name}.min.js`,
			format: 'iife',
			name: "sda",
			banner: banner,
			inlineDynamicImports: true,
		},
		plugins: [
			...commonPlugins,
			terser(),
			visualizer((opts) => {
				return { gzipSize: true, filename: "statsBrowser.html" }
			})
		]
	}
]