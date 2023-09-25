// import assert from "assert"
import SimpleNodeDB from "../../../../../src/class/SimpleNodeDB.js"

describe("removeMissing()", () => {
    const simpleNodeDB = new SimpleNodeDB({
        nbRowsToLog: 100,
    }).start()

    it("should return a table without any missing values", async () => {
        await simpleNodeDB.loadData("employees", ["test/data/employees.json"])

        const data = await simpleNodeDB.removeMissing("employees", [], {
            returnDataFrom: "table",
        })

        console.log(data)
    })

    simpleNodeDB.done()
})
