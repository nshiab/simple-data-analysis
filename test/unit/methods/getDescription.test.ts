import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getDescription", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the count of null values, non null values, and distinct values in each column of a table", async () => {
        const table = sdb.newTable("data")
        await table.loadData("test/data/files/employees.json")

        const description = await table.getDescription()

        assert.deepStrictEqual(description, [
            {
                column: "Department or unit",
                type: "JSON",
                count: 51,
                unique: 10,
                null: 5,
            },
            {
                column: "End-of_year-BONUS?",
                type: "VARCHAR",
                count: 51,
                unique: 46,
                null: 4,
            },
            {
                column: "Hire date",
                type: "VARCHAR",
                count: 51,
                unique: 42,
                null: 5,
            },
            { column: "Job", type: "VARCHAR", count: 51, unique: 9, null: 5 },
            { column: "Name", type: "VARCHAR", count: 51, unique: 46, null: 4 },
            { column: "Salary", type: "JSON", count: 51, unique: 33, null: 3 },
        ])
    })
})
