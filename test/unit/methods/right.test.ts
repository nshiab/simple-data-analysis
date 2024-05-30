// import assert from "assert"
// import SimpleDB from "../../../src/class/SimpleDB.js"

// describe("right", () => {
//     let sdb: SimpleDB
//     before(async function () {
//         sdb = new SimpleDB()
//     })
//     after(async function () {
//         await sdb.done()
//     })

//     it("should return the last two strings", async () => {
//         await sdb.loadArray("data", [
//             { firstName: "Nael", lastName: "Shiab" },
//             { firstName: "Graeme", lastName: "Bruce" },
//         ])

//         await sdb.right("data", "firstName", 2)

//         const data = await sdb.getData("data")

//         assert.deepStrictEqual(data, [
//             { firstName: "el", lastName: "Shiab" },
//             { firstName: "me", lastName: "Bruce" },
//         ])
//     })
// })
