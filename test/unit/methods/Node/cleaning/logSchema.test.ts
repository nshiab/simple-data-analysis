import assert from "assert"
import SimpleNodeDB from "../../../../../src/class/SimpleNodeDB.js"

describe("logSchema", () => {
    const simpleNodeDB = new SimpleNodeDB().start()

    it("should return the schema of a table", async () => {
        await simpleNodeDB.loadData("dataJson", ["test/data/files/data.json"])

        const schema = await simpleNodeDB.logSchema("dataJson", {
            logTable: false,
            returnData: true,
        })
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

    simpleNodeDB.done()
})
