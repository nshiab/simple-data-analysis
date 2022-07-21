import { readFileSync } from "fs";
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
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
	commonjs(),
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
			file: `dist/${meta.name}.min.js`,
			format: 'iife',
			name: "sda",
			banner: banner,
			inlineDynamicImports: true,
			sourcemap: true
		},
		plugins: [
			...commonPlugins,
			terser({
				output: {
					preamble: banner
				}
			}),
			visualizer((opts) => {
				return { gzipSize: true, filename: "bundleSizeMin.html" }
			})
		],
		onwarn(message, warn) {
			if (message.code === "CIRCULAR_DEPENDENCY") return;
			warn(message);
		}
	}
]