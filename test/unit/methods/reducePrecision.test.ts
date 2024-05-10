import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("reducePrecision", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB({ spatial: true })
        await simpleNodeDB.loadGeoData(
            "geodata",
            "test/geodata/files/point.json"
        )
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should round the coordinates to 3 decimals", async () => {
        await simpleNodeDB.reducePrecision("geodata", "geom", 3)
        const data = await simpleNodeDB.customQuery(
            `SELECT ST_AsText(geom) as geomText FROM geoData;`,
            { returnDataFrom: "query" }
        )
        assert.deepStrictEqual(data, [{ geomText: "POINT (-73.623 45.514)" }])
    })
})
