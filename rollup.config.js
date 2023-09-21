import { readFileSync } from "fs"
import resolve from "@rollup/plugin-node-resolve"
import terser from "@rollup/plugin-terser"
import commonjs from "@rollup/plugin-commonjs"
import typescript from "@rollup/plugin-typescript"
import { visualizer } from "rollup-plugin-visualizer"
import nodePolyfills from "rollup-plugin-polyfill-node"
import meta from "./package.json" assert { type: "json" }

const copyright = readFileSync("./LICENSE", "utf-8")
    .split(/\n/g)
    .filter((line) => /^Copyright\s+/.test(line))
    .map((line) => line.replace(/^Copyright\s+/, ""))
    .join(", ")

const banner = `// ${meta.homepage} v${meta.version} Copyright ${copyright}`

const commonPlugins = [
    nodePolyfills(),
    typescript(),
    commonjs(),
    resolve({
        jsnext: true,
        main: true,
        browser: true,
    }),
]

export default [
    {
        input: "src/indexWeb.ts",
        output: {
            file: `dist/${meta.name}.min.js`,
            name: "sda",
            format: "umd",
            indent: false,
            extend: true,
            banner: banner,
            sourcemap: true,
            // inlineDynamicImports: true,
        },
        plugins: [
            ...commonPlugins,
            terser({
                output: {
                    preamble: banner,
                },
            }),
            visualizer(() => {
                return { gzipSize: true, filename: "bundleSizeMin.html" }
            }),
        ],
        onwarn(message, warn) {
            if (
                message.code === "CIRCULAR_DEPENDENCY" ||
                message.code === "THIS_IS_UNDEFINED"
            )
                return
            warn(message)
        },
    },
]
