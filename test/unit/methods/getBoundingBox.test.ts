import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getBoundingBox", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the bounding box in [minX, minY, maxX, maxY]", async () => {
        const table = sdb.newTable()
        await table.loadGeoData(
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        const bbox = await table.getBoundingBox()
        assert.deepStrictEqual(bbox, [-141.014, 41.981, -52.636, 83.111])
    })
    it("should return the bounding box in [minX, minY, maxX, maxY] from a specific column", async () => {
        const table = sdb.newTable()
        await table.loadGeoData(
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        const bbox = await table.getBoundingBox("geom")
        assert.deepStrictEqual(bbox, [-141.014, 41.981, -52.636, 83.111])
    })
})
