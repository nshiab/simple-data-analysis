// import assert from "assert"
// import SimpleDB from "../../../src/class/SimpleDB.js"

// describe("zScore", () => {
//     let sdb: SimpleDB
//     before(async function () {
//         sdb = new SimpleDB()
//         await sdb.loadArray("people", [
//             { name: "Chloe", age: 33 },
//             { name: "Philip", age: 33 },
//             { name: "Sonny", age: 57 },
//             { name: "Frazer", age: 64 },
//             { name: "Sarah", age: 64 },
//             { name: "Frankie", age: 65 },
//             { name: "Morgan", age: 33 },
//             { name: "Jeremy", age: 34 },
//             { name: "Claudia", age: 35 },
//             { name: "Evangeline", age: 21 },
//             { name: "Amelia", age: 29 },
//             { name: "Marie", age: 30 },
//             { name: "Kiara", age: 31 },
//             { name: "Isobel", age: 31 },
//             { name: "Genevieve", age: 32 },
//             { name: "Jane", age: 32 },
//         ])
//         await sdb.cloneTable("people", "peopleTwoDecimals")
//         await sdb.cloneTable("people", "peopleDifferentName")
//         await sdb.cloneTable("people", "peopleThreeDecimals")
//         await sdb.loadArray("peopleGender", [
//             { name: "Chloe", age: 33, gender: "Woman" },
//             { name: "Philip", age: 33, gender: "Man" },
//             { name: "Sonny", age: 57, gender: "Man" },
//             { name: "Frazer", age: 64, gender: "Man" },
//             { name: "Sarah", age: 64, gender: "Woman" },
//             { name: "Frankie", age: 65, gender: "Woman" },
//             { name: "Morgan", age: 33, gender: "Woman" },
//             { name: "Jeremy", age: 34, gender: "Man" },
//             { name: "Claudia", age: 35, gender: "Woman" },
//             { name: "Evangeline", age: 21, gender: "Woman" },
//             { name: "Amelia", age: 29, gender: "Woman" },
//             { name: "Marie", age: 30, gender: "Woman" },
//             { name: "Kiara", age: 31, gender: "Woman" },
//             { name: "Isobel", age: 31, gender: "Woman" },
//             { name: "Genevieve", age: 32, gender: "Woman" },
//             { name: "Jane", age: 32, gender: "Woman" },
//         ])
//     })
//     after(async function () {
//         await sdb.done()
//     })

//     it("should add a column with the zScore", async () => {
//         await sdb.zScore("people", "age", "ageZ")

//         await sdb.sort("people", { ageZ: "asc" })

//         const data = await sdb.getData("people")

//         assert.deepStrictEqual(data, [
//             { name: "Evangeline", age: 21, ageZ: -1.2460801157839236 },
//             { name: "Amelia", age: 29, ageZ: -0.6922667309910687 },
//             { name: "Marie", age: 30, ageZ: -0.6230400578919618 },
//             { name: "Kiara", age: 31, ageZ: -0.5538133847928549 },
//             { name: "Isobel", age: 31, ageZ: -0.5538133847928549 },
//             { name: "Genevieve", age: 32, ageZ: -0.48458671169374806 },
//             { name: "Jane", age: 32, ageZ: -0.48458671169374806 },
//             { name: "Chloe", age: 33, ageZ: -0.4153600385946412 },
//             { name: "Philip", age: 33, ageZ: -0.4153600385946412 },
//             { name: "Morgan", age: 33, ageZ: -0.4153600385946412 },
//             { name: "Jeremy", age: 34, ageZ: -0.34613336549553436 },
//             { name: "Claudia", age: 35, ageZ: -0.27690669239642746 },
//             { name: "Sonny", age: 57, ageZ: 1.2460801157839236 },
//             { name: "Frazer", age: 64, ageZ: 1.7306668274776718 },
//             { name: "Sarah", age: 64, ageZ: 1.7306668274776718 },
//             { name: "Frankie", age: 65, ageZ: 1.7998935005767784 },
//         ])
//     })

//     it("should add a column with the zScore rounded to 3 decimals", async () => {
//         await sdb.zScore("peopleThreeDecimals", "age", "ageSigma", {
//             decimals: 3,
//         })

//         await sdb.sort("peopleThreeDecimals", { ageSigma: "asc" })

//         const data = await sdb.getData("peopleThreeDecimals")

//         assert.deepStrictEqual(data, [
//             { name: "Evangeline", age: 21, ageSigma: -1.246 },
//             { name: "Amelia", age: 29, ageSigma: -0.692 },
//             { name: "Marie", age: 30, ageSigma: -0.623 },
//             { name: "Kiara", age: 31, ageSigma: -0.554 },
//             { name: "Isobel", age: 31, ageSigma: -0.554 },
//             { name: "Genevieve", age: 32, ageSigma: -0.485 },
//             { name: "Jane", age: 32, ageSigma: -0.485 },
//             { name: "Chloe", age: 33, ageSigma: -0.415 },
//             { name: "Philip", age: 33, ageSigma: -0.415 },
//             { name: "Morgan", age: 33, ageSigma: -0.415 },
//             { name: "Jeremy", age: 34, ageSigma: -0.346 },
//             { name: "Claudia", age: 35, ageSigma: -0.277 },
//             { name: "Sonny", age: 57, ageSigma: 1.246 },
//             { name: "Frazer", age: 64, ageSigma: 1.731 },
//             { name: "Sarah", age: 64, ageSigma: 1.731 },
//             { name: "Frankie", age: 65, ageSigma: 1.8 },
//         ])
//     })
//     it("should add a column with the zScore rounded to 3 decimals and with a category", async () => {
//         await sdb.zScore("peopleGender", "age", "ageSigma", {
//             categories: "gender",
//             decimals: 3,
//         })

//         await sdb.sort("peopleGender", {
//             gender: "asc",
//             ageSigma: "asc",
//         })
//         const data = await sdb.getData("peopleGender")

//         assert.deepStrictEqual(data, [
//             { name: "Philip", age: 33, gender: "Man", ageSigma: -0.883 },
//             { name: "Jeremy", age: 34, gender: "Man", ageSigma: -0.82 },
//             { name: "Sonny", age: 57, gender: "Man", ageSigma: 0.631 },
//             { name: "Frazer", age: 64, gender: "Man", ageSigma: 1.072 },
//             { name: "Evangeline", age: 21, gender: "Woman", ageSigma: -1.127 },
//             { name: "Amelia", age: 29, gender: "Woman", ageSigma: -0.539 },
//             { name: "Marie", age: 30, gender: "Woman", ageSigma: -0.466 },
//             { name: "Kiara", age: 31, gender: "Woman", ageSigma: -0.392 },
//             { name: "Isobel", age: 31, gender: "Woman", ageSigma: -0.392 },
//             { name: "Genevieve", age: 32, gender: "Woman", ageSigma: -0.319 },
//             { name: "Jane", age: 32, gender: "Woman", ageSigma: -0.319 },
//             { name: "Chloe", age: 33, gender: "Woman", ageSigma: -0.245 },
//             { name: "Morgan", age: 33, gender: "Woman", ageSigma: -0.245 },
//             { name: "Claudia", age: 35, gender: "Woman", ageSigma: -0.098 },
//             { name: "Sarah", age: 64, gender: "Woman", ageSigma: 2.034 },
//             { name: "Frankie", age: 65, gender: "Woman", ageSigma: 2.108 },
//         ])
//     })
// })
