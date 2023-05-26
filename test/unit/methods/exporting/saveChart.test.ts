import { SimpleDataNode } from "../../../../src/index.js"

describe("saveData", function () {
    it("should save a chart", function () {
        new SimpleDataNode()
            .loadDataFromLocalFile({ path: "./test/data/employees.csv" })
            .saveChart({
                path: "./test/output/dots.html",
                type: "dot",
                x: "Departement or unit",
                y: "Salary",
            })
    })
})
