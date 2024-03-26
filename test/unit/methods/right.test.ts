import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("right", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should return the last two strings", async () => {
        await simpleNodeDB.loadArray("data", [
            { firstName: "Nael", lastName: "Shiab" },
            { firstName: "Graeme", lastName: "Bruce" },
        ])

        await simpleNodeDB.right("data", "firstName", 2)

        const data = await simpleNodeDB.getData("data")

        assert.deepStrictEqual(data, [
            { firstName: "el", lastName: "Shiab" },
            { firstName: "me", lastName: "Bruce" },
        ])
    })
})
