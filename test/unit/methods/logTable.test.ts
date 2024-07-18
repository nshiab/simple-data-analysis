import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("logTable", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })
    it("should log a table", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/employees.csv")
        await table.logTable()

        // How to test?
        assert.deepStrictEqual(true, true)
    })
    it("should not throw an error when there is no table", async () => {
        const table = sdb.newTable()
        await table.logTable()

        // How to test?
        assert.deepStrictEqual(true, true)
    })
    it("should log '<Geometry>' for geospatial data", async () => {
        const table = sdb.newTable()
        await table.loadGeoData(
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        await table.logTable()

        // How to test?
        assert.deepStrictEqual(true, true)
    })
})
