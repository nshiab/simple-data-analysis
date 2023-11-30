import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("getTables", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should return one table", async () => {
        await simpleNodeDB.loadData("dataCsv", ["test/data/files/data.csv"])

        const tables = await simpleNodeDB.getTables()

        assert.deepStrictEqual(tables, ["dataCsv"])
    })
    it("should return multiple tables", async () => {
        await simpleNodeDB.loadData("dataJson", ["test/data/files/data.json"])

        const tables = await simpleNodeDB.getTables()

        assert.deepStrictEqual(tables, ["dataCsv", "dataJson"])
    })
})
