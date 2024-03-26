import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("splitExtract", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should extract a substring based on a separator and substring", async () => {
        await simpleNodeDB.loadArray("data", [
            { name: "Shiab, Nael" },
            { name: "Bruce, Graeme" },
        ])

        await simpleNodeDB.splitExtract("data", "name", ",", 0)

        const data = await simpleNodeDB.getData("data")

        assert.deepStrictEqual(data, [{ name: "Shiab" }, { name: "Bruce" }])
    })
})
