import { existsSync, mkdirSync } from "fs"
import { SimpleDataNode } from "../../src/index.js"
import * as Plot from "@observablehq/plot"

const args = process.argv
const noLogs = args[2] === "noLogs"
console.log("noLogs =>", noLogs)

async function main() {
    const directory = "./test/output/"

    if (!existsSync(directory)) {
        mkdirSync(directory)
    }

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
        .replaceValues({
            key: "bonus",
            oldValue: "%",
            newValue: "",
            method: "partialString",
        })
        .valuesToFloat({ key: "bonus" })

    simpleDataNode
        .saveData({ path: `${directory}/integrationTest.csv` })
        .saveData({ path: `${directory}/integrationTest.json` })
        .saveData({
            path: `${directory}/integrationTestArrays.json`,
            dataAsArrays: true,
        })

    simpleDataNode.saveChart({
        path: `${directory}/dot1.html`,
        type: "dot",
        x: "salary",
        y: "bonus",
        color: "job",
        trend: true,
        showTrendEquation: true,
    })
    simpleDataNode.saveChart({
        path: `${directory}/dot1-small.html`,
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
        path: `${directory}/dot1-small-title.html`,
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
        path: `${directory}/dot1-small-title-noLegend.html`,
        type: "dot",
        x: "salary",
        y: "bonus",
        trend: true,
        showTrendEquation: true,
        width: 400,
        height: 300,
        title: "Awesome chart",
    })

    simpleDataNode.saveChart({
        path: `${directory}/small-multiples.html`,
        type: "dot",
        x: "salary",
        y: "bonus",
        trend: true,
        showTrendEquation: true,
        width: 600,
        title: "Small multiples",
        smallMultipleKey: "job",
        smallMultipleWidth: 200,
        smallMultipleHeight: 200,
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
            path: `${directory}/bar1.html`,
            type: "barHorizontal",
            x: "mean",
            y: "job",
            color: "job",
            marginLeft: 90,
        })
        .saveChart({
            path: `${directory}/bar1-small.html`,
            type: "barHorizontal",
            x: "mean",
            y: "job",
            color: "job",
            marginLeft: 90,
            width: 200,
            height: 100,
        })

    const jobs = simpleDataNode.getUniqueValues({ key: "job" })

    for (const job of jobs) {
        simpleDataNode
            .clone()
            .filterValues({
                key: "job",
                valueComparator: (val) => val === job,
            })
            .saveChart({
                path: `${directory}/${job}.html`,
                type: "dot",
                x: "bonus",
                y: "name",
                color: "bonus",
                marginLeft: 150,
            })
    }

    simpleDataNode.saveCustomChart({
        path: `${directory}/customChart.html`,
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
}

main()
