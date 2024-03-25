import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("upper", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should uppercase strings in one column", async () => {
        await simpleNodeDB.loadArray("data", [
            { firstName: "nael", lastName: "shiab" },
        ])

        await simpleNodeDB.upper("data", "firstName")

        const data = await simpleNodeDB.getData("data")

        assert.deepStrictEqual(data, [{ firstName: "NAEL", lastName: "shiab" }])
    })
    it("should uppercase strings in two columns", async () => {
        await simpleNodeDB.loadArray("data", [
            { firstName: "nael", lastName: "shiab" },
        ])

        await simpleNodeDB.upper("data", ["firstName", "lastName"])

        const data = await simpleNodeDB.getData("data")

        assert.deepStrictEqual(data, [{ firstName: "NAEL", lastName: "SHIAB" }])
    })
})
