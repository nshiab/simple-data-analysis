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
        await sdb.loadData("dataJson", ["test/data/files/data.json"])

        const schema = await sdb.getSchema("dataJson")
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
