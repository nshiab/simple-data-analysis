import ReactDOMServer from 'react-dom/server';
import getExtension from "../helpers/getExtension.js"
import fs from "fs"
import log from "../helpers/log.js"

export default function saveDocument(components: any[], path: string) {

    const extension = getExtension(path)
    if (!["html", "js"].includes(extension)) {
        throw new Error("Your analysis must be saved into an html or js file.")
    }

    let string = ""
    for (const component of components) {
        string += ReactDOMServer.renderToString(component)
    }

    if (extension === "js") {
        string = `import React from "react";

        export default function SimpleDocument() {
            return <div>${string}</div>
        }
        `
    }

    fs.writeFileSync(path, string)

    log(`=> Document saved to ${path}`, "blue")
}