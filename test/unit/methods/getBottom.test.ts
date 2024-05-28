import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getBottom", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the bottom 3", async () => {
        const table = sdb.newTable("data")
        await table.loadData("test/data/files/employees.csv")
        const data = await table.getBottom(3)
        assert.deepStrictEqual(data, [
            {
                Name: "Patel, Joshua",
                "Hire date": "06-APR-06",
                Job: "Clerk",
                Salary: "2500",
                "Department or unit": "50",
                "End-of_year-BONUS?": "16,19%",
            },
            {
                Name: "Seo, John",
                "Hire date": "12-FEB-06",
                Job: "Clerk",
                Salary: "2700",
                "Department or unit": "50",
                "End-of_year-BONUS?": "0,16%",
            },
            {
                Name: "Stiles, Stephen",
                "Hire date": "26-OCT-05",
                Job: "Clerk",
                Salary: "3200",
                "Department or unit": "50",
                "End-of_year-BONUS?": null,
            },
        ])
    })
    it("should return the bottom 3 with the original order", async () => {
        const table = sdb.newTable("data")
        await table.loadData("test/data/files/employees.csv")
        const data = await table.getBottom(3, {
            originalOrder: true,
        })
        assert.deepStrictEqual(data, [
            {
                Name: "Stiles, Stephen",
                "Hire date": "26-OCT-05",
                Job: "Clerk",
                Salary: "3200",
                "Department or unit": "50",
                "End-of_year-BONUS?": null,
            },
            {
                Name: "Seo, John",
                "Hire date": "12-FEB-06",
                Job: "Clerk",
                Salary: "2700",
                "Department or unit": "50",
                "End-of_year-BONUS?": "0,16%",
            },
            {
                Name: "Patel, Joshua",
                "Hire date": "06-APR-06",
                Job: "Clerk",
                Salary: "2500",
                "Department or unit": "50",
                "End-of_year-BONUS?": "16,19%",
            },
        ])
    })
    it("should return the bottom 3 with a condition", async () => {
        const table = sdb.newTable("data")
        await table.loadData("test/data/files/employees.csv")
        const data = await table.getBottom(3, {
            condition: `Job = 'Programmer'`,
        })
        assert.deepStrictEqual(data, [
            {
                Name: "Lorentz, Diana",
                "Hire date": "07-ARB-07",
                Job: "Programmer",
                Salary: "4200",
                "Department or unit": "60",
                "End-of_year-BONUS?": "13,17%",
            },
            {
                Name: "Pataballa, Valli",
                "Hire date": "abc",
                Job: "Programmer",
                Salary: null,
                "Department or unit": "60",
                "End-of_year-BONUS?": "1,62%",
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
    it("should return the bottom 3 with a condition with original order", async () => {
        const table = sdb.newTable("data")
        await table.loadData("test/data/files/employees.csv")
        const data = await table.getBottom(3, {
            condition: `Job = 'Programmer'`,
            originalOrder: true,
        })

        assert.deepStrictEqual(data, [
            {
                Name: "Austin, David",
                "Hire date": "NaN",
                Job: "Programmer",
                Salary: "4800",
                "Department or unit": "null",
                "End-of_year-BONUS?": "6,89%",
            },
            {
                Name: "Pataballa, Valli",
                "Hire date": "abc",
                Job: "Programmer",
                Salary: null,
                "Department or unit": "60",
                "End-of_year-BONUS?": "1,62%",
            },
            {
                Name: "Lorentz, Diana",
                "Hire date": "07-ARB-07",
                Job: "Programmer",
                Salary: "4200",
                "Department or unit": "60",
                "End-of_year-BONUS?": "13,17%",
            },
        ])
    })
})
