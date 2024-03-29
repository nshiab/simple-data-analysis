import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("logSchema", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should return the schema of a table", async () => {
        await simpleNodeDB.loadData("dataJson", ["test/data/files/data.json"])

        const schema = await simpleNodeDB.getSchema("dataJson")
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
