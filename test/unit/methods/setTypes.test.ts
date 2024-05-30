// import assert from "assert"
// import SimpleDB from "../../../src/class/SimpleDB.js"

// describe("setTypes", () => {
//     let sdb: SimpleDB
//     before(async function () {
//         sdb = new SimpleDB()
//     })
//     after(async function () {
//         await sdb.done()
//     })

//     it("should create a new SimpleTable with types", async () => {
//         const table = sdb.newTable("data")
//         await table.setTypes({ name: "string", age: "number" })
//         const types = await table.getTypes()
//         assert.deepStrictEqual(types, { name: "VARCHAR", age: "DOUBLE" })
//     })
//     it("should create a new SimpleTable with geometrye in types", async () => {
//         const table = sdb.newTable("data")
//         await table.setTypes({
//             name: "string",
//             age: "number",
//             city: "geometry",
//         })
//         const types = await table.getTypes()
//         assert.deepStrictEqual(
//             { name: "VARCHAR", age: "DOUBLE", city: "GEOMETRY" },
//             types
//         )
//     })
// })
