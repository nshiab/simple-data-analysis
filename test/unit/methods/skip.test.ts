import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("skip", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should skip rows", async () => {
        const table = await sdb
            .newTable()
            .loadArray([
                { first: "Nael" },
                { first: "Graeme" },
                { first: "Andrew" },
            ])
        await table.skip(1)
        const data = await table.getData()
        assert.deepStrictEqual(data, [{ first: "Graeme" }, { first: "Andrew" }])
    })
})
