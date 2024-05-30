// import assert from "assert"
// import SimpleDB from "../../../src/class/SimpleDB.js"

// describe("remove", () => {
//     let sdb: SimpleDB
//     before(async function () {
//         sdb = new SimpleDB()
//     })
//     after(async function () {
//         await sdb.done()
//     })

//     it("should remove specific rows", async () => {
//         await sdb.loadData("employees", ["test/data/files/employees.csv"])

//         await sdb.remove("employees", {
//             Job: ["Clerk"],
//             "Department or unit": ["50", "30"],
//         })
//         const data = await sdb.getData("employees")

//         assert.deepStrictEqual(data, [
//             {
//                 Name: null,
//                 "Hire date": "17-SEP-03",
//                 Job: "Assistant",
//                 Salary: "4400",
//                 "Department or unit": "10",
//                 "End-of_year-BONUS?": "17,51%",
//             },
//             {
//                 Name: "Hartstein, Michael",
//                 "Hire date": "17-FEB-04",
//                 Job: "Manager",
//                 Salary: "13000",
//                 "Department or unit": "20",
//                 "End-of_year-BONUS?": "2,71%",
//             },
//             {
//                 Name: "Fay, Pat",
//                 "Hire date": "17-AUG-05",
//                 Job: "Representative",
//                 Salary: "6000",
//                 "Department or unit": "20",
//                 "End-of_year-BONUS?": "18,68%",
//             },
//             {
//                 Name: "Mavris, Susan",
//                 "Hire date": "07-JUN-02",
//                 Job: "Salesperson",
//                 Salary: "6500",
//                 "Department or unit": "40",
//                 "End-of_year-BONUS?": "23,47%",
//             },
//             {
//                 Name: "NaN",
//                 "Hire date": "07-JUN-02",
//                 Job: "Salesperson",
//                 Salary: "10000",
//                 "Department or unit": "xyz",
//                 "End-of_year-BONUS?": "17,63%",
//             },
//             {
//                 Name: "Higgins, Shelley",
//                 "Hire date": "07-JUN-02",
//                 Job: "Manager",
//                 Salary: "12008",
//                 "Department or unit": "110",
//                 "End-of_year-BONUS?": "17,09%",
//             },
//             {
//                 Name: "null",
//                 "Hire date": "07-JUN-02",
//                 Job: "Accountant",
//                 Salary: "8300",
//                 "Department or unit": "110",
//                 "End-of_year-BONUS?": "15,7%",
//             },
//             {
//                 Name: "King, Steven",
//                 "Hire date": null,
//                 Job: "President",
//                 Salary: "24000",
//                 "Department or unit": "90",
//                 "End-of_year-BONUS?": "2,46%",
//             },
//             {
//                 Name: "Kochhar, Neena",
//                 "Hire date": "21-SEP-05",
//                 Job: "Vice-president",
//                 Salary: "&6%",
//                 "Department or unit": "90",
//                 "End-of_year-BONUS?": "11,6%",
//             },
//             {
//                 Name: "De Haan, Lex",
//                 "Hire date": "null",
//                 Job: "Vice-president",
//                 Salary: "17000",
//                 "Department or unit": "90",
//                 "End-of_year-BONUS?": "23,43%",
//             },
//             {
//                 Name: "Hunold, Alexander",
//                 "Hire date": "03-JAN-06",
//                 Job: "Programmer",
//                 Salary: "9000",
//                 "Department or unit": "60",
//                 "End-of_year-BONUS?": "23,01%",
//             },
//             {
//                 Name: "Ernst, Bruce",
//                 "Hire date": "21-MAY-07",
//                 Job: "Programmer",
//                 Salary: "6000",
//                 "Department or unit": "60",
//                 "End-of_year-BONUS?": "25,91%",
//             },
//             {
//                 Name: "Austin, David",
//                 "Hire date": "NaN",
//                 Job: "Programmer",
//                 Salary: "4800",
//                 "Department or unit": "null",
//                 "End-of_year-BONUS?": "6,89%",
//             },
//             {
//                 Name: "Pataballa, Valli",
//                 "Hire date": "abc",
//                 Job: "Programmer",
//                 Salary: null,
//                 "Department or unit": "60",
//                 "End-of_year-BONUS?": "1,62%",
//             },
//             {
//                 Name: "Lorentz, Diana",
//                 "Hire date": "07-ARB-07",
//                 Job: "Programmer",
//                 Salary: "4200",
//                 "Department or unit": "60",
//                 "End-of_year-BONUS?": "13,17%",
//             },
//             {
//                 Name: "Greenberg, Nancy",
//                 "Hire date": "17-AUG-02",
//                 Job: "Manager",
//                 Salary: "12008",
//                 "Department or unit": "100",
//                 "End-of_year-BONUS?": "74,69%",
//             },
//             {
//                 Name: "Faviet, Daniel",
//                 "Hire date": "16-AUG-02",
//                 Job: "Accountant",
//                 Salary: "9000",
//                 "Department or unit": "100",
//                 "End-of_year-BONUS?": "2,92%",
//             },
//             {
//                 Name: "Chen, John",
//                 "Hire date": "28-SEP-05",
//                 Job: "Accountant",
//                 Salary: "8200",
//                 "Department or unit": "100",
//                 "End-of_year-BONUS?": "9,31%",
//             },
//             {
//                 Name: "Sciarra, Ismael",
//                 "Hire date": "30-SEP-05",
//                 Job: "Accountant",
//                 Salary: "7700",
//                 "Department or unit": "100",
//                 "End-of_year-BONUS?": "13,18%",
//             },
//             {
//                 Name: "Urman, Jose Manuel",
//                 "Hire date": "07-MAR-06",
//                 Job: "Accountant",
//                 Salary: "7800",
//                 "Department or unit": "100",
//                 "End-of_year-BONUS?": "1,33%",
//             },
//             {
//                 Name: "Popp, Luis",
//                 "Hire date": "07-DEC-07",
//                 Job: "Accountant",
//                 Salary: "6900",
//                 "Department or unit": "100",
//                 "End-of_year-BONUS?": "2,98%",
//             },
//             {
//                 Name: "Kaufling, Payam",
//                 "Hire date": "01-MAY-03",
//                 Job: "Manager",
//                 Salary: "7900",
//                 "Department or unit": "undefined",
//                 "End-of_year-BONUS?": "21,33%",
//             },
//         ])
//     })
// })
