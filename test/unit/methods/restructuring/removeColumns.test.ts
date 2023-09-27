import assert from "assert"
import SimpleNodeDB from "../../../../src/class/SimpleNodeDB.js"

describe("removeColumns", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = await new SimpleNodeDB().start()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should remove one column", async () => {
        await simpleNodeDB.loadData("dataCsv", "test/data/employees.csv")

        const data = await simpleNodeDB.removeColumns("dataCsv", "Hire date", {
            returnDataFrom: "table",
        })

        assert.deepStrictEqual(data, [
            {
                Name: "OConnell, Donald",
                Job: "Clerk",
                Salary: "2600",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "1,94%",
            },
            {
                Name: "OConnell, Donald",
                Job: "Clerk",
                Salary: "2600",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "1,94%",
            },
            {
                Name: "Grant, Douglas",
                Job: "Clerk",
                Salary: "NaN",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "23,39%",
            },
            {
                Name: null,
                Job: "Assistant",
                Salary: "4400",
                "Departement or unit": "10",
                "End-of_year-BONUS?": "17,51%",
            },
            {
                Name: "Hartstein, Michael",
                Job: "Manager",
                Salary: "13000",
                "Departement or unit": "20",
                "End-of_year-BONUS?": "2,71%",
            },
            {
                Name: "Fay, Pat",
                Job: "Representative",
                Salary: "6000",
                "Departement or unit": "20",
                "End-of_year-BONUS?": "18,68%",
            },
            {
                Name: "Mavris, Susan",
                Job: "Salesperson",
                Salary: "6500",
                "Departement or unit": "40",
                "End-of_year-BONUS?": "23,47%",
            },
            {
                Name: "NaN",
                Job: "Salesperson",
                Salary: "10000",
                "Departement or unit": "xyz",
                "End-of_year-BONUS?": "17,63%",
            },
            {
                Name: "Higgins, Shelley",
                Job: "Manager",
                Salary: "12008",
                "Departement or unit": "110",
                "End-of_year-BONUS?": "17,09%",
            },
            {
                Name: "null",
                Job: "Accountant",
                Salary: "8300",
                "Departement or unit": "110",
                "End-of_year-BONUS?": "15,7%",
            },
        ])
    })

    it("should remove multiple columns", async () => {
        const data = await simpleNodeDB.removeColumns(
            "dataCsv",
            ["Job", "Salary"],
            {
                returnDataFrom: "table",
            }
        )

        assert.deepStrictEqual(data, [
            {
                Name: "OConnell, Donald",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "1,94%",
            },
            {
                Name: "OConnell, Donald",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "1,94%",
            },
            {
                Name: "Grant, Douglas",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "23,39%",
            },
            {
                Name: null,
                "Departement or unit": "10",
                "End-of_year-BONUS?": "17,51%",
            },
            {
                Name: "Hartstein, Michael",
                "Departement or unit": "20",
                "End-of_year-BONUS?": "2,71%",
            },
            {
                Name: "Fay, Pat",
                "Departement or unit": "20",
                "End-of_year-BONUS?": "18,68%",
            },
            {
                Name: "Mavris, Susan",
                "Departement or unit": "40",
                "End-of_year-BONUS?": "23,47%",
            },
            {
                Name: "NaN",
                "Departement or unit": "xyz",
                "End-of_year-BONUS?": "17,63%",
            },
            {
                Name: "Higgins, Shelley",
                "Departement or unit": "110",
                "End-of_year-BONUS?": "17,09%",
            },
            {
                Name: "null",
                "Departement or unit": "110",
                "End-of_year-BONUS?": "15,7%",
            },
        ])
    })
})
