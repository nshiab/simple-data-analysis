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
            {
                Name: "King, Steven",
                Job: "President",
                Salary: "24000",
                "Departement or unit": "90",
                "End-of_year-BONUS?": "2,46%",
            },
            {
                Name: "Kochhar, Neena",
                Job: "Vice-president",
                Salary: "&6%",
                "Departement or unit": "90",
                "End-of_year-BONUS?": "11,6%",
            },
            {
                Name: "De Haan, Lex",
                Job: "Vice-president",
                Salary: "17000",
                "Departement or unit": "90",
                "End-of_year-BONUS?": "23,43%",
            },
            {
                Name: "Hunold, Alexander",
                Job: "Programmer",
                Salary: "9000",
                "Departement or unit": "60",
                "End-of_year-BONUS?": "23,01%",
            },
            {
                Name: "Ernst, Bruce",
                Job: "Programmer",
                Salary: "6000",
                "Departement or unit": "60",
                "End-of_year-BONUS?": "25,91%",
            },
            {
                Name: "Austin, David",
                Job: "Programmer",
                Salary: "4800",
                "Departement or unit": "null",
                "End-of_year-BONUS?": "6,89%",
            },
            {
                Name: "Pataballa, Valli",
                Job: "Programmer",
                Salary: null,
                "Departement or unit": "60",
                "End-of_year-BONUS?": "1,62%",
            },
            {
                Name: "Lorentz, Diana",
                Job: "Programmer",
                Salary: "4200",
                "Departement or unit": "60",
                "End-of_year-BONUS?": "13,17%",
            },
            {
                Name: "Greenberg, Nancy",
                Job: "Manager",
                Salary: "12008",
                "Departement or unit": "100",
                "End-of_year-BONUS?": "74,69%",
            },
            {
                Name: "Faviet, Daniel",
                Job: "Accountant",
                Salary: "9000",
                "Departement or unit": "100",
                "End-of_year-BONUS?": "2,92%",
            },
            {
                Name: "Chen, John",
                Job: "Accountant",
                Salary: "8200",
                "Departement or unit": "100",
                "End-of_year-BONUS?": "9,31%",
            },
            {
                Name: "Sciarra, Ismael",
                Job: "Accountant",
                Salary: "7700",
                "Departement or unit": "100",
                "End-of_year-BONUS?": "13,18%",
            },
            {
                Name: "Urman, Jose Manuel",
                Job: "Accountant",
                Salary: "7800",
                "Departement or unit": "100",
                "End-of_year-BONUS?": "1,33%",
            },
            {
                Name: "Popp, Luis",
                Job: "Accountant",
                Salary: "6900",
                "Departement or unit": "100",
                "End-of_year-BONUS?": "2,98%",
            },
            {
                Name: "Raphaely, Den",
                Job: "Manager",
                Salary: "11000",
                "Departement or unit": "30",
                "End-of_year-BONUS?": "3,35%",
            },
            {
                Name: "Khoo, Alexander",
                Job: "Clerk",
                Salary: "3100",
                "Departement or unit": "30",
                "End-of_year-BONUS?": "19,81%",
            },
            {
                Name: "Baida, Shelli",
                Job: "Clerk",
                Salary: "2900",
                "Departement or unit": "30",
                "End-of_year-BONUS?": "11,06%",
            },
            {
                Name: "Tobias, Sigal",
                Job: "NaN",
                Salary: "2800",
                "Departement or unit": null,
                "End-of_year-BONUS?": "undefined",
            },
            {
                Name: "Himuro, Guy",
                Job: "Clerk",
                Salary: "2600",
                "Departement or unit": "30",
                "End-of_year-BONUS?": "25,98%",
            },
            {
                Name: "Colmenares, Karen",
                Job: "Clerk",
                Salary: "2500",
                "Departement or unit": "30",
                "End-of_year-BONUS?": "15,8%",
            },
            {
                Name: "Weiss, Matthew",
                Job: "Manager",
                Salary: "8000",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "25,17%",
            },
            {
                Name: "Fripp, Adam",
                Job: "Manager",
                Salary: "8200",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "21%",
            },
            {
                Name: "Kaufling, Payam",
                Job: "Manager",
                Salary: "7900",
                "Departement or unit": "undefined",
                "End-of_year-BONUS?": "21,33%",
            },
            {
                Name: "Vollman, Shanta",
                Job: "null",
                Salary: "6500",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "3,45%",
            },
            {
                Name: "Mourgos, Kevin",
                Job: "Manager",
                Salary: "5800",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "19,07%",
            },
            {
                Name: "Nayer, Julia",
                Job: "Clerk",
                Salary: "3200",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "18,7%",
            },
            {
                Name: "Mikkilineni, Irene",
                Job: "Clerk",
                Salary: "2700",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "11,82%",
            },
            {
                Name: "Landry, James",
                Job: "Clerk",
                Salary: "2400",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "NaN",
            },
            {
                Name: "Markle, Steven",
                Job: "Clerk",
                Salary: "2200",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "11,26%",
            },
            {
                Name: "Bissot, Laura",
                Job: "undefined",
                Salary: "3300",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "4,53%",
            },
            {
                Name: "Atkinson, Mozhe",
                Job: "Clerk",
                Salary: "undefined",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "9,61%",
            },
            {
                Name: "Marlow, James",
                Job: "Clerk",
                Salary: "2500",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "15,74%",
            },
            {
                Name: "Olson, TJ",
                Job: "Clerk",
                Salary: "2100",
                "Departement or unit": "null",
                "End-of_year-BONUS?": "22,3%",
            },
            {
                Name: "undefined",
                Job: "Clerk",
                Salary: "3300",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "18,54%",
            },
            {
                Name: "Rogers, Michael",
                Job: "Clerk",
                Salary: "2900",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "null",
            },
            {
                Name: "Gee, Ki",
                Job: "NaN",
                Salary: "2400",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "12,64%",
            },
            {
                Name: "Philtanker, Hazel",
                Job: "Clerk",
                Salary: "2200",
                "Departement or unit": "NaN",
                "End-of_year-BONUS?": "24,17%",
            },
            {
                Name: "Ladwig, Renske",
                Job: null,
                Salary: "3600",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "17,86%",
            },
            {
                Name: "Stiles, Stephen",
                Job: "Clerk",
                Salary: "3200",
                "Departement or unit": "50",
                "End-of_year-BONUS?": null,
            },
            {
                Name: "Seo, John",
                Job: "Clerk",
                Salary: "2700",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "0,16%",
            },
            {
                Name: "Patel, Joshua",
                Job: "Clerk",
                Salary: "2500",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "16,19%",
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
            {
                Name: "King, Steven",
                "Departement or unit": "90",
                "End-of_year-BONUS?": "2,46%",
            },
            {
                Name: "Kochhar, Neena",
                "Departement or unit": "90",
                "End-of_year-BONUS?": "11,6%",
            },
            {
                Name: "De Haan, Lex",
                "Departement or unit": "90",
                "End-of_year-BONUS?": "23,43%",
            },
            {
                Name: "Hunold, Alexander",
                "Departement or unit": "60",
                "End-of_year-BONUS?": "23,01%",
            },
            {
                Name: "Ernst, Bruce",
                "Departement or unit": "60",
                "End-of_year-BONUS?": "25,91%",
            },
            {
                Name: "Austin, David",
                "Departement or unit": "null",
                "End-of_year-BONUS?": "6,89%",
            },
            {
                Name: "Pataballa, Valli",
                "Departement or unit": "60",
                "End-of_year-BONUS?": "1,62%",
            },
            {
                Name: "Lorentz, Diana",
                "Departement or unit": "60",
                "End-of_year-BONUS?": "13,17%",
            },
            {
                Name: "Greenberg, Nancy",
                "Departement or unit": "100",
                "End-of_year-BONUS?": "74,69%",
            },
            {
                Name: "Faviet, Daniel",
                "Departement or unit": "100",
                "End-of_year-BONUS?": "2,92%",
            },
            {
                Name: "Chen, John",
                "Departement or unit": "100",
                "End-of_year-BONUS?": "9,31%",
            },
            {
                Name: "Sciarra, Ismael",
                "Departement or unit": "100",
                "End-of_year-BONUS?": "13,18%",
            },
            {
                Name: "Urman, Jose Manuel",
                "Departement or unit": "100",
                "End-of_year-BONUS?": "1,33%",
            },
            {
                Name: "Popp, Luis",
                "Departement or unit": "100",
                "End-of_year-BONUS?": "2,98%",
            },
            {
                Name: "Raphaely, Den",
                "Departement or unit": "30",
                "End-of_year-BONUS?": "3,35%",
            },
            {
                Name: "Khoo, Alexander",
                "Departement or unit": "30",
                "End-of_year-BONUS?": "19,81%",
            },
            {
                Name: "Baida, Shelli",
                "Departement or unit": "30",
                "End-of_year-BONUS?": "11,06%",
            },
            {
                Name: "Tobias, Sigal",
                "Departement or unit": null,
                "End-of_year-BONUS?": "undefined",
            },
            {
                Name: "Himuro, Guy",
                "Departement or unit": "30",
                "End-of_year-BONUS?": "25,98%",
            },
            {
                Name: "Colmenares, Karen",
                "Departement or unit": "30",
                "End-of_year-BONUS?": "15,8%",
            },
            {
                Name: "Weiss, Matthew",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "25,17%",
            },
            {
                Name: "Fripp, Adam",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "21%",
            },
            {
                Name: "Kaufling, Payam",
                "Departement or unit": "undefined",
                "End-of_year-BONUS?": "21,33%",
            },
            {
                Name: "Vollman, Shanta",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "3,45%",
            },
            {
                Name: "Mourgos, Kevin",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "19,07%",
            },
            {
                Name: "Nayer, Julia",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "18,7%",
            },
            {
                Name: "Mikkilineni, Irene",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "11,82%",
            },
            {
                Name: "Landry, James",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "NaN",
            },
            {
                Name: "Markle, Steven",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "11,26%",
            },
            {
                Name: "Bissot, Laura",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "4,53%",
            },
            {
                Name: "Atkinson, Mozhe",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "9,61%",
            },
            {
                Name: "Marlow, James",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "15,74%",
            },
            {
                Name: "Olson, TJ",
                "Departement or unit": "null",
                "End-of_year-BONUS?": "22,3%",
            },
            {
                Name: "undefined",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "18,54%",
            },
            {
                Name: "Rogers, Michael",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "null",
            },
            {
                Name: "Gee, Ki",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "12,64%",
            },
            {
                Name: "Philtanker, Hazel",
                "Departement or unit": "NaN",
                "End-of_year-BONUS?": "24,17%",
            },
            {
                Name: "Ladwig, Renske",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "17,86%",
            },
            {
                Name: "Stiles, Stephen",
                "Departement or unit": "50",
                "End-of_year-BONUS?": null,
            },
            {
                Name: "Seo, John",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "0,16%",
            },
            {
                Name: "Patel, Joshua",
                "Departement or unit": "50",
                "End-of_year-BONUS?": "16,19%",
            },
        ])
    })
})
