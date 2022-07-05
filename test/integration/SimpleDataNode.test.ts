import { SimpleDataNode } from "../../src/index.js"
import { temporaryDirectoryTask } from "tempy"
import * as Plot from "@observablehq/plot"

async function main() {
    new SimpleDataNode({
        verbose: true,
        logParameters: true,
    }).loadDataFromLocalFile({
        path: "./data/employees.json",
        fillMissingKeys: true,
    })

    const simpleDataNode = await new SimpleDataNode({
        verbose: true,
        logParameters: true,
    }).loadDataFromUrl({
        url: "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/data/employees.csv",
    })

    simpleDataNode
        .formatAllKeys()
        .excludeMissingValues()
        .renameKey({ oldKey: "departementOrUnit", newKey: "unit" })
        .renameKey({ oldKey: "endOfYearBonus", newKey: "bonus" })
        .replaceStringValues({
            key: "bonus",
            oldValue: "%",
            newValue: "",
            method: "partialString",
        })
        .valuesToFloat({ key: "bonus", language: "fr" })

    temporaryDirectoryTask((tempDir) => {
        // tempDir = "../../"
        simpleDataNode
            .saveData({ path: `${tempDir}/integrationTest.csv` })
            .saveData({ path: `${tempDir}/integrationTest.json` })

        simpleDataNode.saveChart({
            path: `${tempDir}/dot1.html`,
            type: "dot",
            x: "salary",
            y: "bonus",
        })

        simpleDataNode.saveCustomChart({
            path: `${tempDir}/customChart.html`,
            plotOptions: {
                color: { type: "ordinal" },
                grid: true,
                facet: {
                    data: simpleDataNode.getData(),
                    y: "unit",
                },
                marks: [
                    Plot.dotX(simpleDataNode.getData(), {
                        x: "salary",
                        fill: "unit",
                    }),
                ],
            },
        })
    })
}

main()
