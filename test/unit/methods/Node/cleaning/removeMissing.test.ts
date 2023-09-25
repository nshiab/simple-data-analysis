// import assert from "assert"
import SimpleNodeDB from "../../../../../src/class/SimpleNodeDB.js"

describe("removeMissing()", () => {
    const simpleNodeDB = new SimpleNodeDB({ verbose: true }).start()

    it("should return a table without any missing values", async () => {
        await simpleNodeDB.loadData("employees", ["test/data/employees.json"])
        console.log(
            await simpleNodeDB.removeMissing("employees", [], {
                returnData: true,
            })
        )
    })

    simpleNodeDB.done()
})
