import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("isClosedGeo", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB({ spatial: true })
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should add a new column with TRUE when geometries are closed", async () => {
        await simpleNodeDB.loadGeoData(
            "geodata",
            "test/geodata/files/earthquake.geojson"
        )
        await simpleNodeDB.unnestGeo("geodata", "geom")
        await simpleNodeDB.isClosedGeo("geodata", "geom", "closed")
        await simpleNodeDB.selectColumns("geodata", ["value", "closed"])
        const data = await simpleNodeDB.getData("geoData")

        assert.deepStrictEqual(data, [
            { value: 1.5, closed: false },
            { value: 2, closed: false },
            { value: 2.5, closed: false },
            { value: 2.5, closed: false },
            { value: 2.5, closed: false },
            { value: 2.5, closed: false },
            { value: 2.5, closed: false },
            { value: 3, closed: false },
            { value: 3, closed: false },
            { value: 3, closed: false },
            { value: 3.5, closed: false },
            { value: 3.5, closed: false },
            { value: 4, closed: false },
            { value: 4.5, closed: true },
            { value: 5, closed: true },
            { value: 5, closed: true },
            { value: 5, closed: true },
            { value: 5.5, closed: true },
            { value: 5.5, closed: true },
            { value: 6, closed: true },
            { value: 6.5, closed: true },
            { value: 7, closed: true },
            { value: 7.5, closed: true },
            { value: 7.5, closed: true },
            { value: 7.5, closed: true },
            { value: 8, closed: true },
        ])
    })
})
