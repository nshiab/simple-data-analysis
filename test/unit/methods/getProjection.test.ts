import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("getProjection", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB({ spatial: true })
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should retrieve the projection of a json file", async () => {
        const proj = await simpleNodeDB.getProjection(
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        assert.deepStrictEqual(proj, {
            name: "WGS 84",
            code: "EPSG:4326",
            unit: "degree",
            proj4: "+proj=longlat +datum=WGS84 +no_defs",
        })
    })
    it("should retrieve the projection of a zipped shapefile", async () => {
        const proj = await simpleNodeDB.getProjection(
            "test/geodata/files/canada-not-4326.shp.zip"
        )
        assert.deepStrictEqual(proj, {
            name: "NAD83 / Statistics Canada Lambert",
            code: "EPSG:3347",
            unit: "metre",
            proj4: "+proj=lcc +lat_0=63.390675 +lon_0=-91.8666666666667 +lat_1=49 +lat_2=77 +x_0=6200000 +y_0=3000000 +datum=NAD83 +units=m +no_defs",
        })
    })
})
