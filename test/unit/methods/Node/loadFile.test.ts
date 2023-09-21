import assert from "assert"
import SimpleNodeDB from "../../../../src/class/SimpleNodeDB.js"
describe("loadFile", function () {
    const simpleNodeDB = new SimpleNodeDB().start()
    it("should load data from a csv file", async function () {
        simpleNodeDB.loadCSV("data", "test/data/employees.csv")

        const data = await simpleNodeDB.getData("data")
        console.log(data)
    })
})
