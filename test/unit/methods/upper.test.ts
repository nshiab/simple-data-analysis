// import assert from "assert"
// import SimpleDB from "../../../src/class/SimpleDB.js"

// describe("upper", () => {
//     let sdb: SimpleDB
//     before(async function () {
//         sdb = new SimpleDB()
//     })
//     after(async function () {
//         await sdb.done()
//     })

//     it("should uppercase strings in one column", async () => {
//         await sdb.loadArray("data", [{ firstName: "nael", lastName: "shiab" }])

//         await sdb.upper("data", "firstName")

//         const data = await sdb.getData("data")

//         assert.deepStrictEqual(data, [{ firstName: "NAEL", lastName: "shiab" }])
//     })
//     it("should uppercase strings in two columns", async () => {
//         await sdb.loadArray("data", [{ firstName: "nael", lastName: "shiab" }])

//         await sdb.upper("data", ["firstName", "lastName"])

//         const data = await sdb.getData("data")

//         assert.deepStrictEqual(data, [{ firstName: "NAEL", lastName: "SHIAB" }])
//     })
// })
