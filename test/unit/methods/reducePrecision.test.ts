// import assert from "assert"
// import SimpleDB from "../../../src/class/SimpleDB.js"

// describe("reducePrecision", () => {
//     let sdb: SimpleDB
//     before(async function () {
//         sdb = new SimpleDB({ spatial: true })
//         await sdb.loadGeoData("geodata", "test/geodata/files/point.json")
//     })
//     after(async function () {
//         await sdb.done()
//     })

//     it("should round the coordinates to 3 decimals", async () => {
//         await sdb.reducePrecision("geodata", "geom", 3)
//         const data = await sdb.customQuery(
//             `SELECT ST_AsText(geom) as geomText FROM geoData;`,
//             { returnDataFrom: "query" }
//         )
//         assert.deepStrictEqual(data, [{ geomText: "POINT (-73.623 45.514)" }])
//     })
// })
