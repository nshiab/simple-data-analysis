import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("cloneColumn", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should clone a column", async () => {
        const table = sdb.newTable("data")
        await table.loadArray([{ firstName: "nael", lastName: "shiab" }])

        await table.cloneColumn("firstName", "firstNameCloned")

        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { firstName: "nael", lastName: "shiab", firstNameCloned: "nael" },
        ])
    })

    it("should clone a column with geometries and keep the projection", async () => {
        const table = sdb.newTable("data")
        await table.loadGeoData(
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )

        await table.cloneColumn("geom", "geomClone")

        assert.deepStrictEqual(
            table.projections["geom"],
            table.projections["geomClone"]
        )
    })
})
