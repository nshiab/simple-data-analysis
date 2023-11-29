import { existsSync, mkdirSync } from "fs"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"
import writeChart from "../../../src/functions/writeChart.js"
import { dot } from "@observablehq/plot"

const outputPath = "./test/output/"

describe("writeChart", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        if (!existsSync(outputPath)) {
            mkdirSync(outputPath)
        }

        simpleNodeDB = new SimpleNodeDB()
        await simpleNodeDB.loadData(
            "employees",
            "test/data/files/employees.csv"
        )
        await simpleNodeDB.convert(
            "employees",
            { Salary: "bigint" },
            { try: true }
        )
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should write a chart with Observable Plot options", async () => {
        const data = await simpleNodeDB.getChartData("employees")

        writeChart(`${outputPath}chart.svg`, {
            x: { type: "point" },
            marks: [
                dot(data, {
                    x: "Department or unit",
                    y: "Salary",
                }),
            ],
        })
    })
})
