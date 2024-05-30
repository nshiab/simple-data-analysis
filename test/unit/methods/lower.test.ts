// import assert from "assert"
// import SimpleDB from "../../../src/class/SimpleDB.js"

// describe("lower", () => {
//     let sdb: SimpleDB
//     before(async function () {
//         sdb = new SimpleDB()
//     })
//     after(async function () {
//         await sdb.done()
//     })

//     it("should lowercase strings in one column", async () => {
//         await sdb.loadArray("data", [{ firstName: "NAEL", lastName: "SHIAB" }])

//         await sdb.lower("data", "firstName")

//         const data = await sdb.getData("data")

//         assert.deepStrictEqual(data, [{ firstName: "nael", lastName: "SHIAB" }])
//     })
//     it("should lowercase strings in two columns", async () => {
//         await sdb.loadArray("data", [{ firstName: "NAEL", lastName: "SHIAB" }])

//         await sdb.lower("data", ["firstName", "lastName"])

//         const data = await sdb.getData("data")

//         assert.deepStrictEqual(data, [{ firstName: "nael", lastName: "shiab" }])
//     })
// })
