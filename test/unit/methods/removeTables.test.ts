// import assert from "assert"
// import SimpleDB from "../../../src/class/SimpleDB.js"

// describe("removeTables", () => {
//     let sdb: SimpleDB
//     before(async function () {
//         sdb = new SimpleDB()
//     })
//     after(async function () {
//         await sdb.done()
//     })

//     it("should remove one table", async () => {
//         await sdb.loadData("dataCsv", "test/data/files/employees.csv")
//         await sdb.loadData("dataJson", "test/data/files/employees.json")

//         await sdb.removeTables("dataJson")

//         const tables = await sdb.getTables()
//         assert.deepStrictEqual(tables, ["dataCsv"])
//     })

//     it("should remove multiple tables", async () => {
//         await sdb.loadData("dataJson", "test/data/files/employees.json")
//         await sdb.removeTables(["dataJson", "dataCsv"])

//         const tables = await sdb.getTables()

//         assert.deepStrictEqual(tables, [])
//     })
// })
