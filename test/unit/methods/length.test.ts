import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("length", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB({ spatial: true })
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should calculate the length of geometries in meters", async () => {
        await simpleNodeDB.loadGeoData(
            "geodata",
            "test/geodata/files/line.json"
        )
        await simpleNodeDB.flipCoordinates("geodata", "geom")
        await simpleNodeDB.length("geodata", "geom", "length")
        await simpleNodeDB.round("geodata", "length")
        await simpleNodeDB.selectColumns("geodata", "length")
        const data = await simpleNodeDB.getData("geodata")

        assert.deepStrictEqual(data, [{ length: 70175 }])
    })
    it("should calculate the length of geometries in kilometers", async () => {
        await simpleNodeDB.loadGeoData(
            "geodata",
            "test/geodata/files/line.json"
        )
        await simpleNodeDB.flipCoordinates("geodata", "geom")
        await simpleNodeDB.length("geodata", "geom", "length", { unit: "km" })
        await simpleNodeDB.round("geodata", "length")
        await simpleNodeDB.selectColumns("geodata", "length")
        const data = await simpleNodeDB.getData("geodata")

        assert.deepStrictEqual(data, [{ length: 70 }])
    })
})
