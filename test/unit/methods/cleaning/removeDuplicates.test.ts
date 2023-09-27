import assert from "assert"
import SimpleNodeDB from "../../../../src/class/SimpleNodeDB.js"

describe("removeDuplicates", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = await new SimpleNodeDB().start()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should remove duplicates from a table", async () => {
        await simpleNodeDB.loadData("employees", ["test/data/employees.csv"])

        const noDuplicates = await simpleNodeDB.removeDuplicates("employees", {
            returnDataFrom: "table",
        })

        assert.deepStrictEqual(noDuplicates, [
            {
                Name: "OConnell, Donald",
                "Hire date": "21-JUN-07",
                Job: "Clerk",
                Salary: "2600",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "1,94%",
            },
            {
                Name: "Grant, Douglas",
                "Hire date": "13-JAN-08",
                Job: "Clerk",
                Salary: "NaN",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "23,39%",
            },
            {
                Name: null,
                "Hire date": "17-SEP-03",
                Job: "Assistant",
                Salary: "4400",
                "Departement or unit": "10",
                "End-of_year-BONUS?": "17,51%",
            },
            {
                Name: "Hartstein, Michael",
                "Hire date": "17-FEB-04",
                Job: "Manager",
                Salary: "13000",
                "Departement or unit": "20",
                "End-of_year-BONUS?": "2,71%",
            },
            {
                Name: "Fay, Pat",
                "Hire date": "17-AUG-05",
                Job: "Representative",
                Salary: "6000",
                "Departement or unit": "20",
                "End-of_year-BONUS?": "18,68%",
            },
            {
                Name: "Mavris, Susan",
                "Hire date": "07-JUN-02",
                Job: "Salesperson",
                Salary: "6500",
                "Departement or unit": "40",
                "End-of_year-BONUS?": "23,47%",
            },
            {
                Name: "NaN",
                "Hire date": "07-JUN-02",
                Job: "Salesperson",
                Salary: "10000",
                "Departement or unit": "xyz",
                "End-of_year-BONUS?": "17,63%",
            },
            {
                Name: "Higgins, Shelley",
                "Hire date": "07-JUN-02",
                Job: "Manager",
                Salary: "12008",
                "Departement or unit": "110",
                "End-of_year-BONUS?": "17,09%",
            },
            {
                Name: "null",
                "Hire date": "07-JUN-02",
                Job: "Accountant",
                Salary: "8300",
                "Departement or unit": "110",
                "End-of_year-BONUS?": "15,7%",
            },
            {
                Name: "King, Steven",
                "Hire date": null,
                Job: "President",
                Salary: "24000",
                "Departement or unit": "90",
                "End-of_year-BONUS?": "2,46%",
            },
        ])
    })
})
