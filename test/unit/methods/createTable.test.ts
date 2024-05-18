import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("createTable", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB({ spatial: true })
    })
    after(async function () {
        await sdb.done()
    })

    it("should create a new table", async () => {
        await sdb.createTable("employees", {
            name: "string",
            salary: "integer",
            raise: "float",
        })

        const schema = await sdb.getSchema("employees")

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
    it("should create a new table with a geometry type", async () => {
        await sdb.createTable("employees", {
            name: "string",
            salary: "integer",
            raise: "float",
            geom: "geometry",
        })

        const schema = await sdb.getSchema("employees")

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
            {
                column_name: "geom",
                column_type: "GEOMETRY",
                null: "YES",
                key: null,
                default: null,
                extra: null,
            },
        ])
    })
})
