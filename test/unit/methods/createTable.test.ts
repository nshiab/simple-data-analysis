import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("createTable", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = await new SimpleNodeDB().start()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should create a new table", async () => {
        await simpleNodeDB.createTable("employees", {
            name: "string",
            salary: "integer",
            raise: "float",
        })

        const schema = await simpleNodeDB.getSchema("employees")

        assert.deepStrictEqual(schema, [
            {
                column_name: "name",
                column_type: "VARCHAR",
                null: "YES",
                key: null,
                default: null,
                extra: null,
            },
            {
                column_name: "salary",
                column_type: "BIGINT",
                null: "YES",
                key: null,
                default: null,
                extra: null,
            },
            {
                column_name: "raise",
                column_type: "DOUBLE",
                null: "YES",
                key: null,
                default: null,
                extra: null,
            },
        ])
    })
})
