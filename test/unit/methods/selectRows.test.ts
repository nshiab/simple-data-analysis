import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("selectRows", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should return the first 5 rows", async () => {
        await simpleNodeDB.loadData("employees", [
            "test/data/files/employees.csv",
        ])

        await simpleNodeDB.selectRows("employees", 5)

        const data = await simpleNodeDB.getData("employees")

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
            {
                Name: null,
                "Hire date": "17-SEP-03",
                Job: "Assistant",
                Salary: "4400",
                "Department or unit": "10",
                "End-of_year-BONUS?": "17,51%",
            },
            {
                Name: "Hartstein, Michael",
                "Hire date": "17-FEB-04",
                Job: "Manager",
                Salary: "13000",
                "Department or unit": "20",
                "End-of_year-BONUS?": "2,71%",
            },
        ])
    })
})
