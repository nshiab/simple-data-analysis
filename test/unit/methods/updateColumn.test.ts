import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("updateColumn", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
        await simpleNodeDB.loadData("cities", ["test/data/files/cities.csv"])
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should update a column", async () => {
        await simpleNodeDB.updateColumn("cities", "city", `left("city", 3)`)

        const data = await simpleNodeDB.getData("cities")

        assert.deepStrictEqual(data, [
            { id: 1108380, city: "VAN" },
            { id: 6158355, city: "TOR" },
            { id: 7024745, city: "MON" },
        ])
    })
})
