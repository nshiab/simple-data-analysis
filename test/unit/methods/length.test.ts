import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("length", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should calculate the length of geometries in meters", async () => {
        const table = sdb.newTable()
        await table.loadGeoData("test/geodata/files/line.json")
        await table.flipCoordinates("geom")
        await table.length("geom", "length")
        await table.round("length")
        await table.selectColumns("length")
        const data = await table.getData()

        assert.deepStrictEqual(data, [{ length: 70175 }])
    })
    it("should calculate the length of geometries in meters from a file loaded with option toWGS84", async () => {
        const table = sdb.newTable()
        await table.loadGeoData("test/geodata/files/line.json", {
            toWGS84: true,
        })
        // No need to flip
        // await table.flipCoordinates("geom")
        await table.length("geom", "length")
        await table.round("length")
        await table.selectColumns("length")
        const data = await table.getData()

        assert.deepStrictEqual(data, [{ length: 70175 }])
    })
    it("should calculate the length of geometries in kilometers", async () => {
        const table = sdb.newTable()
        await table.loadGeoData("test/geodata/files/line.json")
        await table.flipCoordinates("geom")
        await table.length("geom", "length", { unit: "km" })
        await table.round("length")
        await table.selectColumns("length")
        const data = await table.getData()

        assert.deepStrictEqual(data, [{ length: 70 }])
    })
})
