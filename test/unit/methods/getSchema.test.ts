import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("logSchema", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the schema of a table", async () => {
        const table = sdb.newTable("data")
        await table.loadData(["test/data/files/data.json"])

        const schema = await table.getSchema()
        assert.deepStrictEqual(schema, [
            {
                column_name: "key1",
                column_type: "BIGINT",
                null: "YES",
                key: null,
                default: null,
                extra: null,
            },
            {
                column_name: "key2",
                column_type: "VARCHAR",
                null: "YES",
                key: null,
                default: null,
                extra: null,
            },
        ])
    })
})
