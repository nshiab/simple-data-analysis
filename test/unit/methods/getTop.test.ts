import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getTop", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
        await sdb.loadData("data", ["test/data/files/employees.csv"])
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the top 3", async () => {
        const data = await sdb.getTop("data", 3)
        assert.deepStrictEqual(data, [
            {
                Name: "OConnell, Donald",
                "Hire date": "21-JUN-07",
                Job: "Clerk",
                Salary: "2600",
                "Department or unit": "50",
                "End-of_year-BONUS?": "1,94%",
            },
            {
                Name: "OConnell, Donald",
                "Hire date": "21-JUN-07",
                Job: "Clerk",
                Salary: "2600",
                "Department or unit": "50",
                "End-of_year-BONUS?": "1,94%",
            },
            {
                Name: "Grant, Douglas",
                "Hire date": "13-JAN-08",
                Job: "Clerk",
                Salary: "NaN",
                "Department or unit": "50",
                "End-of_year-BONUS?": "23,39%",
            },
        ])
    })
    it("should return the top 3 with a condition", async () => {
        const data = await sdb.getTop("data", 3, {
            condition: `Job = 'Programmer'`,
        })
        assert.deepStrictEqual(data, [
            {
                Name: "Hunold, Alexander",
                "Hire date": "03-JAN-06",
                Job: "Programmer",
                Salary: "9000",
                "Department or unit": "60",
                "End-of_year-BONUS?": "23,01%",
            },
            {
                Name: "Ernst, Bruce",
                "Hire date": "21-MAY-07",
                Job: "Programmer",
                Salary: "6000",
                "Department or unit": "60",
                "End-of_year-BONUS?": "25,91%",
            },
            {
                Name: "Austin, David",
                "Hire date": "NaN",
                Job: "Programmer",
                Salary: "4800",
                "Department or unit": "null",
                "End-of_year-BONUS?": "6,89%",
            },
        ])
    })
})
