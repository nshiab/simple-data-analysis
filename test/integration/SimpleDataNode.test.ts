import { SimpleDataNode } from "../../src/index.js"
import { temporaryDirectoryTask } from "tempy"
import * as Plot from "@observablehq/plot"

const args = process.argv
const noLogs = args[2] === "noLogs"
console.log("noLogs =>", noLogs)

async function main() {
    new SimpleDataNode({
        verbose: true,
        logParameters: true,
        noLogs: noLogs,
    }).loadDataFromLocalFile({
        path: "./data/employees.json",
        fillMissingKeys: true,
    })

    const simpleDataNode = await new SimpleDataNode({
        verbose: true,
        logParameters: true,
        noLogs: noLogs,
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
        .valuesToFloat({ key: "bonus" })

    temporaryDirectoryTask((tempDir) => {
        // tempDir = "../"

        simpleDataNode
            .saveData({ path: `${tempDir}/integrationTest.csv` })
            .saveData({ path: `${tempDir}/integrationTest.json` })
            .saveData({
                path: `${tempDir}/integrationTestArrays.json`,
                dataAsArrays: true,
            })

        simpleDataNode.saveChart({
            path: `${tempDir}/dot1.html`,
            type: "dot",
            x: "salary",
            y: "bonus",
            color: "job",
            trend: true,
            showTrendEquation: true,
        })
        simpleDataNode.saveChart({
            path: `${tempDir}/dot1-small.html`,
            type: "dot",
            x: "salary",
            y: "bonus",
            color: "job",
            trend: true,
            showTrendEquation: true,
            width: 400,
            height: 300,
        })
        simpleDataNode.saveChart({
            path: `${tempDir}/dot1-small-title.html`,
            type: "dot",
            x: "salary",
            y: "bonus",
            color: "job",
            trend: true,
            showTrendEquation: true,
            width: 400,
            height: 300,
            title: "Awesome chart",
        })

        simpleDataNode.saveChart({
            path: `${tempDir}/dot1-small-title-noLegend.html`,
            type: "dot",
            x: "salary",
            y: "bonus",
            trend: true,
            showTrendEquation: true,
            width: 400,
            height: 300,
            title: "Awesome chart",
        })

        simpleDataNode
            .clone()
            .filterValues({
                key: "salary",
                valueComparator: (salary) => salary !== "&6%",
            })
            .valuesToInteger({ key: "salary" })
            .summarize({
                keyValue: "salary",
                keyCategory: "job",
                summary: "mean",
            })
            .saveChart({
                path: `${tempDir}/bar1.html`,
                type: "barHorizontal",
                x: "mean",
                y: "job",
                color: "job",
                marginLeft: 90,
            })
            .saveChart({
                path: `${tempDir}/bar1-small.html`,
                type: "barHorizontal",
                x: "mean",
                y: "job",
                color: "job",
                marginLeft: 90,
                width: 200,
                height: 100,
            })

        simpleDataNode.saveCustomChart({
            path: `${tempDir}/customChart.html`,
            plotOptions: {
                color: { type: "ordinal" },
                x: { type: "point" },
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
