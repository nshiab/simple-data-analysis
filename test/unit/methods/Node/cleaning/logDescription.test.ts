import assert from "assert"
import SimpleNodeDB from "../../../../../src/class/SimpleNodeDB.js"

describe("logDescription", () => {
    const simpleNodeDB = new SimpleNodeDB().start()
    // simpleNodeDB.noLogs = true

    it("should return the number of null values in each column of a table", async () => {
        await simpleNodeDB.loadData("employees", ["test/data/employees.json"])

        const description = await simpleNodeDB.logDescription("employees", {
            returnData: true,
        })

        assert.deepStrictEqual(description, [
            {
                _: "type",
                Name: "VARCHAR",
                "Hire date": "VARCHAR",
                Job: "VARCHAR",
                Salary: "JSON",
                "Departement or unit": "JSON",
                "End-of_year-BONUS?": "VARCHAR",
            },
            {
                Name: 51,
                "Hire date": 51,
                Job: 51,
                Salary: 51,
                "Departement or unit": 51,
                "End-of_year-BONUS?": 51,
                _: "total count",
            },
            {
                Name: 4,
                "Hire date": 5,
                Job: 5,
                Salary: 3,
                "Departement or unit": 5,
                "End-of_year-BONUS?": 4,
                _: "null count",
            },
            {
                Name: 47,
                "Hire date": 46,
                Job: 46,
                Salary: 48,
                "Departement or unit": 46,
                "End-of_year-BONUS?": 47,
                _: "non null count",
            },
        ])
    })

    simpleNodeDB.done()
})
