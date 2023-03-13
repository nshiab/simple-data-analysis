import { JSDOM, VirtualConsole } from "jsdom"
import log from "./log.js"

export default function setJSDom() {
    if (global.window === undefined || global.document === undefined) {
        const virtualConsole = new VirtualConsole().on(
            "jsdomError",
            (error) => {
                if (
                    error.message.includes(
                        "Not implemented: HTMLCanvasElement.prototype.getContext (without installing the canvas npm package)"
                    )
                ) {
                    log(
                        "\n/!\\ We use Observable Plot (https://github.com/observablehq/plot) to generate charts, which is meant to be used on the browser. JSDOM (https://github.com/jsdom/jsdom) simulates the browser, but it has has no implementation of the canvas element. Install canvas if you need it: https://www.npmjs.com/package/canvas",
                        "blue"
                    )
                } else {
                    console.log(error)
                }
            }
        )
        const jsdom = new JSDOM("", { virtualConsole })
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        global.window = jsdom.window
        global.document = jsdom.window.document
    }
}
