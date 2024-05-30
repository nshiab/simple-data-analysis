// import assert from "assert"
// import SimpleDB from "../../../src/class/SimpleDB.js"

// describe("updateColumn", () => {
//     let sdb: SimpleDB
//     before(async function () {
//         sdb = new SimpleDB()
//         await sdb.loadData("cities", ["test/data/files/cities.csv"])
//     })
//     after(async function () {
//         await sdb.done()
//     })

//     it("should update a column", async () => {
//         await sdb.updateColumn("cities", "city", `left("city", 3)`)

//         const data = await sdb.getData("cities")

//         assert.deepStrictEqual(data, [
//             { id: 1108380, city: "VAN" },
//             { id: 6158355, city: "TOR" },
//             { id: 7024745, city: "MON" },
//         ])
//     })
// })
