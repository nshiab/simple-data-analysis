import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("cloneTable", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = await new SimpleNodeDB().start()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("clone a table", async () => {
        await simpleNodeDB.loadData(
            "dataCsvOriginal",
            "test/data/employees.csv"
        )

        const data = await simpleNodeDB.cloneTable(
            "dataCsvOriginal",
            "dataCsvCloned",
            {
                returnDataFrom: "table",
            }
        )
        assert.deepStrictEqual(data, fullData)
    })

    it("should keep the original table intact", async () => {
        const data = await simpleNodeDB.getData("dataCsvOriginal")

        assert.deepStrictEqual(data, fullData)
    })

    it("should have the same data in the original table and in the cloned table", async () => {
        const original = await simpleNodeDB.getData("dataCsvOriginal")
        const cloned = await simpleNodeDB.getData("dataCsvCloned")

        assert.deepStrictEqual(original, cloned)
    })
})

const fullData = [
    {
        Name: "OConnell, Donald",
        "Hire date": "21-JUN-07",
        Job: "Clerk",
        Salary: "2600",
        "Departement or unit": "50",
        "End-of_year-BONUS?": "1,94%",
    },
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
    {
        Name: "Kochhar, Neena",
        "Hire date": "21-SEP-05",
        Job: "Vice-president",
        Salary: "&6%",
        "Departement or unit": "90",
        "End-of_year-BONUS?": "11,6%",
    },
    {
        Name: "De Haan, Lex",
        "Hire date": "null",
        Job: "Vice-president",
        Salary: "17000",
        "Departement or unit": "90",
        "End-of_year-BONUS?": "23,43%",
    },
    {
        Name: "Hunold, Alexander",
        "Hire date": "03-JAN-06",
        Job: "Programmer",
        Salary: "9000",
        "Departement or unit": "60",
        "End-of_year-BONUS?": "23,01%",
    },
    {
        Name: "Ernst, Bruce",
        "Hire date": "21-MAY-07",
        Job: "Programmer",
        Salary: "6000",
        "Departement or unit": "60",
        "End-of_year-BONUS?": "25,91%",
    },
    {
        Name: "Austin, David",
        "Hire date": "NaN",
        Job: "Programmer",
        Salary: "4800",
        "Departement or unit": "null",
        "End-of_year-BONUS?": "6,89%",
    },
    {
        Name: "Pataballa, Valli",
        "Hire date": "abc",
        Job: "Programmer",
        Salary: null,
        "Departement or unit": "60",
        "End-of_year-BONUS?": "1,62%",
    },
    {
        Name: "Lorentz, Diana",
        "Hire date": "07-ARB-07",
        Job: "Programmer",
        Salary: "4200",
        "Departement or unit": "60",
        "End-of_year-BONUS?": "13,17%",
    },
    {
        Name: "Greenberg, Nancy",
        "Hire date": "17-AUG-02",
        Job: "Manager",
        Salary: "12008",
        "Departement or unit": "100",
        "End-of_year-BONUS?": "74,69%",
    },
    {
        Name: "Faviet, Daniel",
        "Hire date": "16-AUG-02",
        Job: "Accountant",
        Salary: "9000",
        "Departement or unit": "100",
        "End-of_year-BONUS?": "2,92%",
    },
    {
        Name: "Chen, John",
        "Hire date": "28-SEP-05",
        Job: "Accountant",
        Salary: "8200",
        "Departement or unit": "100",
        "End-of_year-BONUS?": "9,31%",
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
        Name: "Urman, Jose Manuel",
        "Hire date": "07-MAR-06",
        Job: "Accountant",
        Salary: "7800",
        "Departement or unit": "100",
        "End-of_year-BONUS?": "1,33%",
    },
    {
        Name: "Popp, Luis",
        "Hire date": "07-DEC-07",
        Job: "Accountant",
        Salary: "6900",
        "Departement or unit": "100",
        "End-of_year-BONUS?": "2,98%",
    },
    {
        Name: "Raphaely, Den",
        "Hire date": "07-DEC-02",
        Job: "Manager",
        Salary: "11000",
        "Departement or unit": "30",
        "End-of_year-BONUS?": "3,35%",
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
        Name: "Baida, Shelli",
        "Hire date": "24-DEC-05",
        Job: "Clerk",
        Salary: "2900",
        "Departement or unit": "30",
        "End-of_year-BONUS?": "11,06%",
    },
    {
        Name: "Tobias, Sigal",
        "Hire date": "24-JUL-05",
        Job: "NaN",
        Salary: "2800",
        "Departement or unit": null,
        "End-of_year-BONUS?": "undefined",
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
        Name: "Colmenares, Karen",
        "Hire date": "10-AUG-07",
        Job: "Clerk",
        Salary: "2500",
        "Departement or unit": "30",
        "End-of_year-BONUS?": "15,8%",
    },
    {
        Name: "Weiss, Matthew",
        "Hire date": "18-JUL-04",
        Job: "Manager",
        Salary: "8000",
        "Departement or unit": "50",
        "End-of_year-BONUS?": "25,17%",
    },
    {
        Name: "Fripp, Adam",
        "Hire date": "10-APR-05",
        Job: "Manager",
        Salary: "8200",
        "Departement or unit": "50",
        "End-of_year-BONUS?": "21%",
    },
    {
        Name: "Kaufling, Payam",
        "Hire date": "01-MAY-03",
        Job: "Manager",
        Salary: "7900",
        "Departement or unit": "undefined",
        "End-of_year-BONUS?": "21,33%",
    },
    {
        Name: "Vollman, Shanta",
        "Hire date": "10-OCT-05",
        Job: "null",
        Salary: "6500",
        "Departement or unit": "50",
        "End-of_year-BONUS?": "3,45%",
    },
    {
        Name: "Mourgos, Kevin",
        "Hire date": "undefined",
        Job: "Manager",
        Salary: "5800",
        "Departement or unit": "50",
        "End-of_year-BONUS?": "19,07%",
    },
    {
        Name: "Nayer, Julia",
        "Hire date": "16-JUL-05",
        Job: "Clerk",
        Salary: "3200",
        "Departement or unit": "50",
        "End-of_year-BONUS?": "18,7%",
    },
    {
        Name: "Mikkilineni, Irene",
        "Hire date": "28-SEP-06",
        Job: "Clerk",
        Salary: "2700",
        "Departement or unit": "50",
        "End-of_year-BONUS?": "11,82%",
    },
    {
        Name: "Landry, James",
        "Hire date": "14-JAN-07",
        Job: "Clerk",
        Salary: "2400",
        "Departement or unit": "50",
        "End-of_year-BONUS?": "NaN",
    },
    {
        Name: "Markle, Steven",
        "Hire date": "NaN",
        Job: "Clerk",
        Salary: "2200",
        "Departement or unit": "50",
        "End-of_year-BONUS?": "11,26%",
    },
    {
        Name: "Bissot, Laura",
        "Hire date": "20-AUG-05",
        Job: "undefined",
        Salary: "3300",
        "Departement or unit": "50",
        "End-of_year-BONUS?": "4,53%",
    },
    {
        Name: "Atkinson, Mozhe",
        "Hire date": "30-OCT-05",
        Job: "Clerk",
        Salary: "undefined",
        "Departement or unit": "50",
        "End-of_year-BONUS?": "9,61%",
    },
    {
        Name: "Marlow, James",
        "Hire date": "16-FEB-05",
        Job: "Clerk",
        Salary: "2500",
        "Departement or unit": "50",
        "End-of_year-BONUS?": "15,74%",
    },
    {
        Name: "Olson, TJ",
        "Hire date": "10-APR-07",
        Job: "Clerk",
        Salary: "2100",
        "Departement or unit": "null",
        "End-of_year-BONUS?": "22,3%",
    },
    {
        Name: "undefined",
        "Hire date": "14-JUN-04",
        Job: "Clerk",
        Salary: "3300",
        "Departement or unit": "50",
        "End-of_year-BONUS?": "18,54%",
    },
    {
        Name: "Rogers, Michael",
        "Hire date": "26-AUG-06",
        Job: "Clerk",
        Salary: "2900",
        "Departement or unit": "50",
        "End-of_year-BONUS?": "null",
    },
    {
        Name: "Gee, Ki",
        "Hire date": "12-DEC-07",
        Job: "NaN",
        Salary: "2400",
        "Departement or unit": "50",
        "End-of_year-BONUS?": "12,64%",
    },
    {
        Name: "Philtanker, Hazel",
        "Hire date": "06-FEB-08",
        Job: "Clerk",
        Salary: "2200",
        "Departement or unit": "NaN",
        "End-of_year-BONUS?": "24,17%",
    },
    {
        Name: "Ladwig, Renske",
        "Hire date": "14-JUL-03",
        Job: null,
        Salary: "3600",
        "Departement or unit": "50",
        "End-of_year-BONUS?": "17,86%",
    },
    {
        Name: "Stiles, Stephen",
        "Hire date": "26-OCT-05",
        Job: "Clerk",
        Salary: "3200",
        "Departement or unit": "50",
        "End-of_year-BONUS?": null,
    },
    {
        Name: "Seo, John",
        "Hire date": "12-FEB-06",
        Job: "Clerk",
        Salary: "2700",
        "Departement or unit": "50",
        "End-of_year-BONUS?": "0,16%",
    },
    {
        Name: "Patel, Joshua",
        "Hire date": "06-APR-06",
        Job: "Clerk",
        Salary: "2500",
        "Departement or unit": "50",
        "End-of_year-BONUS?": "16,19%",
    },
]
