import { existsSync, mkdirSync } from "fs"
import { SimpleDataNode } from "../../../../src/index.js"

const outputPath = "./test/output/"
if (!existsSync(outputPath)) {
    mkdirSync(outputPath)
}

describe("saveData", function () {
    it("should save a chart", function () {
        new SimpleDataNode()
            .loadDataFromLocalFile({ path: "./test/data/employees.csv" })
            .saveChart({
                path: `${outputPath}dots.html`,
                type: "dot",
                x: "Departement or unit",
                y: "Salary",
            })
    })
})
