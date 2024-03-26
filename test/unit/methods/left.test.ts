import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("left", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should return the first two strings", async () => {
        await simpleNodeDB.loadArray("data", [
            { firstName: "Nael", lastName: "Shiab" },
            { firstName: "Graeme", lastName: "Bruce" },
        ])

        await simpleNodeDB.left("data", "firstName", 2)

        const data = await simpleNodeDB.getData("data")

        assert.deepStrictEqual(data, [
            { firstName: "Na", lastName: "Shiab" },
            { firstName: "Gr", lastName: "Bruce" },
        ])
    })
})
