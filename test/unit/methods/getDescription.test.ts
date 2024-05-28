import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("logDescription", () => {
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
                _: "type",
                Name: "VARCHAR",
                "Hire date": "VARCHAR",
                Job: "VARCHAR",
                Salary: "JSON",
                "Department or unit": "JSON",
                "End-of_year-BONUS?": "VARCHAR",
            },
            {
                Name: 4,
                "Hire date": 5,
                Job: 5,
                Salary: 3,
                "Department or unit": 5,
                "End-of_year-BONUS?": 4,
                _: "0-Null",
            },
            {
                Name: 47,
                "Hire date": 46,
                Job: 46,
                Salary: 48,
                "Department or unit": 46,
                "End-of_year-BONUS?": 47,
                _: "1-Not null",
            },
            {
                Name: 46,
                "Hire date": 42,
                Job: 9,
                Salary: 33,
                "Department or unit": 10,
                "End-of_year-BONUS?": 46,
                _: "2-Distinct",
            },
            {
                Name: 51,
                "Hire date": 51,
                Job: 51,
                Salary: 51,
                "Department or unit": 51,
                "End-of_year-BONUS?": 51,
                _: "3-Total",
            },
        ])
    })
})
