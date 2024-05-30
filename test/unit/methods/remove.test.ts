import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("remove", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should remove specific rows", async () => {
        const table = sdb.newTable()
        await table.loadData(["test/data/files/employees.csv"])
        await table.cleanColumnNames()

        await table.remove({
            job: ["Clerk"],
            departmentOrUnit: ["50", "30"],
        })
        const data = await table.getData()

        assert.deepStrictEqual(data, [
            {
                name: null,
                hireDate: "17-SEP-03",
                job: "Assistant",
                salary: "4400",
                departmentOrUnit: "10",
                endOfYearBonus: "17,51%",
            },
            {
                name: "Hartstein, Michael",
                hireDate: "17-FEB-04",
                job: "Manager",
                salary: "13000",
                departmentOrUnit: "20",
                endOfYearBonus: "2,71%",
            },
            {
                name: "Fay, Pat",
                hireDate: "17-AUG-05",
                job: "Representative",
                salary: "6000",
                departmentOrUnit: "20",
                endOfYearBonus: "18,68%",
            },
            {
                name: "Mavris, Susan",
                hireDate: "07-JUN-02",
                job: "Salesperson",
                salary: "6500",
                departmentOrUnit: "40",
                endOfYearBonus: "23,47%",
            },
            {
                name: "NaN",
                hireDate: "07-JUN-02",
                job: "Salesperson",
                salary: "10000",
                departmentOrUnit: "xyz",
                endOfYearBonus: "17,63%",
            },
            {
                name: "Higgins, Shelley",
                hireDate: "07-JUN-02",
                job: "Manager",
                salary: "12008",
                departmentOrUnit: "110",
                endOfYearBonus: "17,09%",
            },
            {
                name: "null",
                hireDate: "07-JUN-02",
                job: "Accountant",
                salary: "8300",
                departmentOrUnit: "110",
                endOfYearBonus: "15,7%",
            },
            {
                name: "King, Steven",
                hireDate: null,
                job: "President",
                salary: "24000",
                departmentOrUnit: "90",
                endOfYearBonus: "2,46%",
            },
            {
                name: "Kochhar, Neena",
                hireDate: "21-SEP-05",
                job: "Vice-president",
                salary: "&6%",
                departmentOrUnit: "90",
                endOfYearBonus: "11,6%",
            },
            {
                name: "De Haan, Lex",
                hireDate: "null",
                job: "Vice-president",
                salary: "17000",
                departmentOrUnit: "90",
                endOfYearBonus: "23,43%",
            },
            {
                name: "Hunold, Alexander",
                hireDate: "03-JAN-06",
                job: "Programmer",
                salary: "9000",
                departmentOrUnit: "60",
                endOfYearBonus: "23,01%",
            },
            {
                name: "Ernst, Bruce",
                hireDate: "21-MAY-07",
                job: "Programmer",
                salary: "6000",
                departmentOrUnit: "60",
                endOfYearBonus: "25,91%",
            },
            {
                name: "Austin, David",
                hireDate: "NaN",
                job: "Programmer",
                salary: "4800",
                departmentOrUnit: "null",
                endOfYearBonus: "6,89%",
            },
            {
                name: "Pataballa, Valli",
                hireDate: "abc",
                job: "Programmer",
                salary: null,
                departmentOrUnit: "60",
                endOfYearBonus: "1,62%",
            },
            {
                name: "Lorentz, Diana",
                hireDate: "07-ARB-07",
                job: "Programmer",
                salary: "4200",
                departmentOrUnit: "60",
                endOfYearBonus: "13,17%",
            },
            {
                name: "Greenberg, Nancy",
                hireDate: "17-AUG-02",
                job: "Manager",
                salary: "12008",
                departmentOrUnit: "100",
                endOfYearBonus: "74,69%",
            },
            {
                name: "Faviet, Daniel",
                hireDate: "16-AUG-02",
                job: "Accountant",
                salary: "9000",
                departmentOrUnit: "100",
                endOfYearBonus: "2,92%",
            },
            {
                name: "Chen, John",
                hireDate: "28-SEP-05",
                job: "Accountant",
                salary: "8200",
                departmentOrUnit: "100",
                endOfYearBonus: "9,31%",
            },
            {
                name: "Sciarra, Ismael",
                hireDate: "30-SEP-05",
                job: "Accountant",
                salary: "7700",
                departmentOrUnit: "100",
                endOfYearBonus: "13,18%",
            },
            {
                name: "Urman, Jose Manuel",
                hireDate: "07-MAR-06",
                job: "Accountant",
                salary: "7800",
                departmentOrUnit: "100",
                endOfYearBonus: "1,33%",
            },
            {
                name: "Popp, Luis",
                hireDate: "07-DEC-07",
                job: "Accountant",
                salary: "6900",
                departmentOrUnit: "100",
                endOfYearBonus: "2,98%",
            },
            {
                name: "Kaufling, Payam",
                hireDate: "01-MAY-03",
                job: "Manager",
                salary: "7900",
                departmentOrUnit: "undefined",
                endOfYearBonus: "21,33%",
            },
        ])
    })
})
