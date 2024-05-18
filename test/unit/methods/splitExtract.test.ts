import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("splitExtract", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should extract a substring based on a separator and substring", async () => {
        await sdb.loadArray("data", [
            { name: "Shiab, Nael" },
            { name: "Bruce, Graeme" },
        ])

        await sdb.splitExtract("data", "name", ",", 0)

        const data = await sdb.getData("data")

        assert.deepStrictEqual(data, [{ name: "Shiab" }, { name: "Bruce" }])
    })
})
