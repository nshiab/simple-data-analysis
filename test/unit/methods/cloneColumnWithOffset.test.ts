import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("cloneColumnWithOffset", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should clone a column with an offset", async () => {
        const table = sdb.newTable("data")
        await table.loadArray([
            { firstName: "nael", lastName: "shiab" },
            { firstName: "graeme", lastName: "bruce" },
            { firstName: "wendy", lastName: "martinez" },
            { firstName: "andrew", lastName: "ryan" },
        ])

        await table.cloneColumnWithOffset("firstName", "nextFirstName")

        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { firstName: "nael", lastName: "shiab", nextFirstName: "graeme" },
            { firstName: "graeme", lastName: "bruce", nextFirstName: "wendy" },
            {
                firstName: "wendy",
                lastName: "martinez",
                nextFirstName: "andrew",
            },
            { firstName: "andrew", lastName: "ryan", nextFirstName: null },
        ])
    })
    it("should clone a column with an offset when working with geometries and keep the projection", async () => {
        const table = sdb.newTable("data")
        await table.loadGeoData(
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )

        await table.cloneColumnWithOffset("geom", "geomClone")

        assert.deepStrictEqual(
            table.projections["geom"],
            table.projections["geomClone"]
        )
    })
})
