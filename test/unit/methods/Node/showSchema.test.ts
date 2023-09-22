import assert from "assert"
import SimpleNodeDB from "../../../../src/class/SimpleNodeDB.js"

describe("loadData", () => {
    const simpleNodeDB = new SimpleNodeDB().start()
    simpleNodeDB.noLogs = true

    it("should return the schema of a table", async () => {
        await simpleNodeDB.loadData("dataJson", ["test/data/files/data.json"])

        const schema = await simpleNodeDB.showSchema("dataJson", true)
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
