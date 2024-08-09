import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("updateColumn", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })
    it("should update a column", async () => {
        const table = sdb.newTable()
        await table.loadData(["test/data/files/cities.csv"])
        await table.updateColumn("city", `left("city", 3)`)

        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { id: 1108380, city: "VAN" },
            { id: 6158355, city: "TOR" },
            { id: 7024745, city: "MON" },
        ])
    })
    it("should update a column with a space in its name", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/employees.csv")
        await table.updateColumn(
            "Department or unit",
            `left("Department or unit", 1)`
        )
        await table.selectRows(3)

        const data = await table.getData()

        assert.deepStrictEqual(data, [
            {
                Name: "OConnell, Donald",
                "Hire date": "21-JUN-07",
                Job: "Clerk",
                Salary: "2600",
                "Department or unit": "5",
                "End-of_year-BONUS?": "1,94%",
            },
            {
                Name: "OConnell, Donald",
                "Hire date": "21-JUN-07",
                Job: "Clerk",
                Salary: "2600",
                "Department or unit": "5",
                "End-of_year-BONUS?": "1,94%",
            },
            {
                Name: "Grant, Douglas",
                "Hire date": "13-JAN-08",
                Job: "Clerk",
                Salary: "NaN",
                "Department or unit": "5",
                "End-of_year-BONUS?": "23,39%",
            },
        ])
    })
})
