import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("nbVertices", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should count the number of vertices and add the result in a new column", async () => {
        const table = sdb.newTable("geodata")
        await table.loadGeoData("test/geodata/files/triangle.json")
        await table.nbVertices("nbVertices")
        await table.selectColumns(["nbVertices"])

        const data = await table.getData()

        assert.deepStrictEqual(data, [{ nbVertices: 4 }])
    })
    it("should count the number of vertices when checking a specific column", async () => {
        const table = sdb.newTable("geodata")
        await table.loadGeoData("test/geodata/files/triangle.json")
        await table.nbVertices("nbVertices", { column: "geom" })
        await table.selectColumns(["nbVertices"])
        const data = await table.getData()

        assert.deepStrictEqual(data, [{ nbVertices: 4 }])
    })
})
