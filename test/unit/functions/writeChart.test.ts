import { existsSync, mkdirSync } from "fs"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"
import writeChart from "../../../src/functions/writeChart.js"
import { Data, dot } from "@observablehq/plot"

const outputPath = "./test/output/"

describe("writeChart", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        if (!existsSync(outputPath)) {
            mkdirSync(outputPath)
        }

        simpleNodeDB = await new SimpleNodeDB().start()
        await simpleNodeDB.loadData("employees", "test/data/employees.csv")
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
        const data = (await simpleNodeDB.getData("employees")) as Data

        writeChart(`${outputPath}chart.html`, {
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
