import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("cloneColumn", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should clone a column", async () => {
        await simpleNodeDB.loadArray("data", [
            { firstName: "nael", lastName: "shiab" },
        ])

        await simpleNodeDB.cloneColumn("data", "firstName", "firstNameCloned")

        const data = await simpleNodeDB.getData("data")

        assert.deepStrictEqual(data, [
            { firstName: "nael", lastName: "shiab", firstNameCloned: "nael" },
        ])
    })
})
