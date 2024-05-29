import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("isClosedGeo", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should add a new column with TRUE when geometries are closed", async () => {
        const table = sdb.newTable("geodata")
        await table.loadGeoData("test/geodata/files/earthquake.geojson")
        await table.unnestGeo("geom")
        await table.isClosedGeo("geom", "closed")
        await table.selectColumns(["value", "closed"])
        const data = await table.getData()

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
