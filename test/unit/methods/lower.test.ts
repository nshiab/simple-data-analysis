import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("lower", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should lowercase strings in one column", async () => {
        await simpleNodeDB.loadArray("data", [
            { firstName: "NAEL", lastName: "SHIAB" },
        ])

        await simpleNodeDB.lower("data", "firstName")

        const data = await simpleNodeDB.getData("data")

        assert.deepStrictEqual(data, [{ firstName: "nael", lastName: "SHIAB" }])
    })
    it("should lowercase strings in two columns", async () => {
        await simpleNodeDB.loadArray("data", [
            { firstName: "NAEL", lastName: "SHIAB" },
        ])

        await simpleNodeDB.lower("data", ["firstName", "lastName"])

        const data = await simpleNodeDB.getData("data")

        assert.deepStrictEqual(data, [{ firstName: "nael", lastName: "shiab" }])
    })
})
