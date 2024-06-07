import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("keep", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should keep only specific rows", async () => {
        const table = sdb.newTable()
        await table.loadData(["test/data/files/employees.csv"])
        await table.cleanColumnNames()

        await table.keep({
            job: ["Clerk"],
            departmentOrUnit: ["50", "30"],
        })
        const data = await table.getData()

        assert.deepStrictEqual(data, [
            {
                name: "OConnell, Donald",
                hireDate: "21-JUN-07",
                job: "Clerk",
                salary: "2600",
                departmentOrUnit: "50",
                endOfYearBonus: "1,94%",
            },
            {
                name: "OConnell, Donald",
                hireDate: "21-JUN-07",
                job: "Clerk",
                salary: "2600",
                departmentOrUnit: "50",
                endOfYearBonus: "1,94%",
            },
            {
                name: "Grant, Douglas",
                hireDate: "13-JAN-08",
                job: "Clerk",
                salary: "NaN",
                departmentOrUnit: "50",
                endOfYearBonus: "23,39%",
            },
            {
                name: "Nayer, Julia",
                hireDate: "16-JUL-05",
                job: "Clerk",
                salary: "3200",
                departmentOrUnit: "50",
                endOfYearBonus: "18,7%",
            },
            {
                name: "Mikkilineni, Irene",
                hireDate: "28-SEP-06",
                job: "Clerk",
                salary: "2700",
                departmentOrUnit: "50",
                endOfYearBonus: "11,82%",
            },
            {
                name: "Landry, James",
                hireDate: "14-JAN-07",
                job: "Clerk",
                salary: "2400",
                departmentOrUnit: "50",
                endOfYearBonus: "NaN",
            },
            {
                name: "Markle, Steven",
                hireDate: "NaN",
                job: "Clerk",
                salary: "2200",
                departmentOrUnit: "50",
                endOfYearBonus: "11,26%",
            },
            {
                name: "Atkinson, Mozhe",
                hireDate: "30-OCT-05",
                job: "Clerk",
                salary: "undefined",
                departmentOrUnit: "50",
                endOfYearBonus: "9,61%",
            },
            {
                name: "Marlow, James",
                hireDate: "16-FEB-05",
                job: "Clerk",
                salary: "2500",
                departmentOrUnit: "50",
                endOfYearBonus: "15,74%",
            },
            {
                name: "undefined",
                hireDate: "14-JUN-04",
                job: "Clerk",
                salary: "3300",
                departmentOrUnit: "50",
                endOfYearBonus: "18,54%",
            },
            {
                name: "Rogers, Michael",
                hireDate: "26-AUG-06",
                job: "Clerk",
                salary: "2900",
                departmentOrUnit: "50",
                endOfYearBonus: "null",
            },
            {
                name: "Stiles, Stephen",
                hireDate: "26-OCT-05",
                job: "Clerk",
                salary: "3200",
                departmentOrUnit: "50",
                endOfYearBonus: null,
            },
            {
                name: "Seo, John",
                hireDate: "12-FEB-06",
                job: "Clerk",
                salary: "2700",
                departmentOrUnit: "50",
                endOfYearBonus: "0,16%",
            },
            {
                name: "Patel, Joshua",
                hireDate: "06-APR-06",
                job: "Clerk",
                salary: "2500",
                departmentOrUnit: "50",
                endOfYearBonus: "16,19%",
            },
            {
                name: "Khoo, Alexander",
                hireDate: "18-MAY-03",
                job: "Clerk",
                salary: "3100",
                departmentOrUnit: "30",
                endOfYearBonus: "19,81%",
            },
            {
                name: "Baida, Shelli",
                hireDate: "24-DEC-05",
                job: "Clerk",
                salary: "2900",
                departmentOrUnit: "30",
                endOfYearBonus: "11,06%",
            },
            {
                name: "Himuro, Guy",
                hireDate: "15-NOV-05",
                job: "Clerk",
                salary: "2600",
                departmentOrUnit: "30",
                endOfYearBonus: "25,98%",
            },
            {
                name: "Colmenares, Karen",
                hireDate: "10-AUG-07",
                job: "Clerk",
                salary: "2500",
                departmentOrUnit: "30",
                endOfYearBonus: "15,8%",
            },
        ])
    })
})
