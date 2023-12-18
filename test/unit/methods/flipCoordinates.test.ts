import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("flipCoordinates", () => {
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

    it("should flip the coordinates", async () => {
        await simpleNodeDB.flipCoordinates("geodata", "geom")
        const data = await simpleNodeDB.customQuery(
            `SELECT ST_AsText(geom) as geomText FROM geoData;`,
            { returnDataFrom: "query" }
        )

        assert.deepStrictEqual(data, [
            { geomText: "POINT (45.51412791316409 -73.62315106245389)" },
        ])
    })
})
