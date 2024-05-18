import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("isClosedGeo", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB({ spatial: true })
    })
    after(async function () {
        await sdb.done()
    })

    it("should add a new column with TRUE when geometries are closed", async () => {
        await sdb.loadGeoData(
            "geodata",
            "test/geodata/files/earthquake.geojson"
        )
        await sdb.unnestGeo("geodata", "geom")
        await sdb.isClosedGeo("geodata", "geom", "closed")
        await sdb.selectColumns("geodata", ["value", "closed"])
        const data = await sdb.getData("geoData")

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
