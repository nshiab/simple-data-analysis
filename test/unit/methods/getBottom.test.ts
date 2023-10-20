import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("getBottom", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = await new SimpleNodeDB().start()
        await simpleNodeDB.loadData("data", ["test/data/employees.csv"])
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should return the bottom 3", async () => {
        const data = await simpleNodeDB.getBottom("data", 3)
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
        const data = await simpleNodeDB.getBottom("data", 3, {
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
})
