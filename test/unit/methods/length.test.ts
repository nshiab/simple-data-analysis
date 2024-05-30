// import assert from "assert"
// import SimpleDB from "../../../src/class/SimpleDB.js"

// describe("length", () => {
//     let sdb: SimpleDB
//     before(async function () {
//         sdb = new SimpleDB({ spatial: true })
//     })
//     after(async function () {
//         await sdb.done()
//     })

//     it("should calculate the length of geometries in meters", async () => {
//         await sdb.loadGeoData("geodata", "test/geodata/files/line.json")
//         await sdb.flipCoordinates("geodata", "geom")
//         await sdb.length("geodata", "geom", "length")
//         await sdb.round("geodata", "length")
//         await sdb.selectColumns("geodata", "length")
//         const data = await sdb.getData("geodata")

//         assert.deepStrictEqual(data, [{ length: 70175 }])
//     })
//     it("should calculate the length of geometries in kilometers", async () => {
//         await sdb.loadGeoData("geodata", "test/geodata/files/line.json")
//         await sdb.flipCoordinates("geodata", "geom")
//         await sdb.length("geodata", "geom", "length", { unit: "km" })
//         await sdb.round("geodata", "length")
//         await sdb.selectColumns("geodata", "length")
//         const data = await sdb.getData("geodata")

//         assert.deepStrictEqual(data, [{ length: 70 }])
//     })
// })
