import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("sample", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should return 5 random rows", async () => {
        const table = sdb.newTable()
        await table.loadData(["test/data/files/employees.csv"])

        await table.sample(5)

        const data = await table.getData()

        assert.deepStrictEqual(data.length, 5)
    })

    it("should return 20% random rows", async () => {
        const table = sdb.newTable()
        await table.loadData(["test/data/files/employees.csv"])

        await table.sample("20%")
        const data = await table.getData()

        assert.deepStrictEqual(data.length, 10)
    })

    it("should return the 5 same random rows based on seed", async () => {
        const table = sdb.newTable()
        await table.loadData(["test/data/files/employees.csv"])

        await table.sample(5, {
            seed: 10,
        })
        const data = await table.getData()

        assert.deepStrictEqual(data, [
            {
                Name: "Mikkilineni, Irene",
                "Hire date": "28-SEP-06",
                Job: "Clerk",
                Salary: "2700",
                "Department or unit": "50",
                "End-of_year-BONUS?": "11,82%",
            },
            {
                Name: "Khoo, Alexander",
                "Hire date": "18-MAY-03",
                Job: "Clerk",
                Salary: "3100",
                "Department or unit": "30",
                "End-of_year-BONUS?": "19,81%",
            },
            {
                Name: "Sciarra, Ismael",
                "Hire date": "30-SEP-05",
                Job: "Accountant",
                Salary: "7700",
                "Department or unit": "100",
                "End-of_year-BONUS?": "13,18%",
            },
            {
                Name: "Himuro, Guy",
                "Hire date": "15-NOV-05",
                Job: "Clerk",
                Salary: "2600",
                "Department or unit": "30",
                "End-of_year-BONUS?": "25,98%",
            },
            {
                Name: "Raphaely, Den",
                "Hire date": "07-DEC-02",
                Job: "Manager",
                Salary: "11000",
                "Department or unit": "30",
                "End-of_year-BONUS?": "3,35%",
            },
        ])
    })

    it("should return the same 20% random rows based on a seed", async () => {
        const table = sdb.newTable()
        await table.loadData(["test/data/files/employees.csv"])

        await table.sample("20%", {
            seed: 1,
        })

        const data = await table.getData()

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
                Name: "De Haan, Lex",
                "Hire date": "null",
                Job: "Vice-president",
                Salary: "17000",
                "Department or unit": "90",
                "End-of_year-BONUS?": "23,43%",
            },
            {
                Name: "Patel, Joshua",
                "Hire date": "06-APR-06",
                Job: "Clerk",
                Salary: "2500",
                "Department or unit": "50",
                "End-of_year-BONUS?": "16,19%",
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
                Name: "Weiss, Matthew",
                "Hire date": "18-JUL-04",
                Job: "Manager",
                Salary: "8000",
                "Department or unit": "50",
                "End-of_year-BONUS?": "25,17%",
            },
            {
                Name: "Greenberg, Nancy",
                "Hire date": "17-AUG-02",
                Job: "Manager",
                Salary: "12008",
                "Department or unit": "100",
                "End-of_year-BONUS?": "74,69%",
            },
            {
                Name: "Mavris, Susan",
                "Hire date": "07-JUN-02",
                Job: "Salesperson",
                Salary: "6500",
                "Department or unit": "40",
                "End-of_year-BONUS?": "23,47%",
            },
            {
                Name: "Faviet, Daniel",
                "Hire date": "16-AUG-02",
                Job: "Accountant",
                Salary: "9000",
                "Department or unit": "100",
                "End-of_year-BONUS?": "2,92%",
            },
            {
                Name: "Lorentz, Diana",
                "Hire date": "07-ARB-07",
                Job: "Programmer",
                Salary: "4200",
                "Department or unit": "60",
                "End-of_year-BONUS?": "13,17%",
            },
            {
                Name: "Mourgos, Kevin",
                "Hire date": "undefined",
                Job: "Manager",
                Salary: "5800",
                "Department or unit": "50",
                "End-of_year-BONUS?": "19,07%",
            },
        ])
    })
})
