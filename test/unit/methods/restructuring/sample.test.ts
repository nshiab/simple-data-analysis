import assert from "assert"
import SimpleNodeDB from "../../../../src/class/SimpleNodeDB.js"

describe("sample", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = await new SimpleNodeDB().start()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should return 5 random rows", async () => {
        await simpleNodeDB.loadData("employeesRandomRows", [
            "test/data/employees.csv",
        ])

        const data = await simpleNodeDB.sample("employeesRandomRows", 5, {
            returnDataFrom: "table",
        })

        assert.deepStrictEqual(data?.length, 5)
    })

    it("should return the 5 same random rows based on seed", async () => {
        await simpleNodeDB.loadData("employeesRandomRowsSeed", [
            "test/data/employees.csv",
        ])

        const data = await simpleNodeDB.sample("employeesRandomRowsSeed", 5, {
            returnDataFrom: "table",
            seed: 10,
        })

        assert.deepStrictEqual(data, [
            {
                Name: "Mikkilineni, Irene",
                "Hire date": "28-SEP-06",
                Job: "Clerk",
                Salary: "2700",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "11,82%",
            },
            {
                Name: "Khoo, Alexander",
                "Hire date": "18-MAY-03",
                Job: "Clerk",
                Salary: "3100",
                "Departement or unit": "30",
                "End-of_year-BONUS?": "19,81%",
            },
            {
                Name: "Sciarra, Ismael",
                "Hire date": "30-SEP-05",
                Job: "Accountant",
                Salary: "7700",
                "Departement or unit": "100",
                "End-of_year-BONUS?": "13,18%",
            },
            {
                Name: "Himuro, Guy",
                "Hire date": "15-NOV-05",
                Job: "Clerk",
                Salary: "2600",
                "Departement or unit": "30",
                "End-of_year-BONUS?": "25,98%",
            },
            {
                Name: "Raphaely, Den",
                "Hire date": "07-DEC-02",
                Job: "Manager",
                Salary: "11000",
                "Departement or unit": "30",
                "End-of_year-BONUS?": "3,35%",
            },
        ])
    })
})
