import { readFileSync } from "fs";
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { optimizeLodashImports } from "@optimize-lodash/rollup-plugin";
import typescript from '@rollup/plugin-typescript';
import { visualizer } from "rollup-plugin-visualizer";
import * as meta from "./package.json";

const copyright = readFileSync("./LICENSE", "utf-8")
	.split(/\n/g)
	.filter(line => /^Copyright\s+/.test(line))
	.map(line => line.replace(/^Copyright\s+/, ""))
	.join(", ");

const banner = `// ${meta.homepage} v${meta.version} Copyright ${copyright}`

const commonPlugins = [
	typescript(),
	optimizeLodashImports(),
	commonjs(),
	nodePolyfills(),
	json(),
	resolve({
		jsnext: true,
		main: true,
		browser: true
	})
]

export default [
	{
		input: 'src/indexWeb.ts',
		output: {
			file: `dist/${meta.name}.js`,
			name: "sda",
			format: "umd",
			sourcemap: true,
			banner: banner,
			inlineDynamicImports: true
		},
		plugins: [
			...commonPlugins,
			visualizer((opts) => {
				return { gzipSize: true, filename: "bundleSizeUMD.html" }
			})
		]
	},
	{
		input: 'src/indexWeb.ts',
		output: {
			file: `dist/${meta.name}.min.js`,
			format: 'iife',
			sourcemap: true,
			name: "sda",
			banner: banner,
			inlineDynamicImports: true,
		},
		plugins: [
			...commonPlugins,
			terser(),
			visualizer((opts) => {
				return { gzipSize: true, filename: "bundleSizeMin.html" }
			})
		]
	}
]