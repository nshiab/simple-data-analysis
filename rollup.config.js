import { readFileSync } from "fs";
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import * as meta from "./package.json";

const copyright = readFileSync("./LICENSE", "utf-8")
	.split(/\n/g)
	.filter(line => /^Copyright\s+/.test(line))
	.map(line => line.replace(/^Copyright\s+/, ""))
	.join(", ");

const banner = `// ${meta.homepage} v${meta.version} Copyright ${copyright}`

export default {
	input: 'dist/index.js',
	output: [
		{
			file: `dist/${meta.name}.js`,
			name: "sda",
			format: "umd",
			banner: banner,
			inlineDynamicImports: true
		},
		{
			file: `dist/${meta.name}.min.js`,
			format: 'iife',
			name: "sda",
			banner: banner,
			inlineDynamicImports: true,
			plugins: [terser()]
		}
	],
	plugins: [
		json(),
		commonjs(),
		resolve()
	]
};