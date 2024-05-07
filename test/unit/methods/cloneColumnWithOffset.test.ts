import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("cloneColumnWithOffset", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should clone a column", async () => {
        await simpleNodeDB.loadArray("data", [
            { firstName: "nael", lastName: "shiab" },
            { firstName: "graeme", lastName: "bruce" },
            { firstName: "wendy", lastName: "martinez" },
            { firstName: "andrew", lastName: "ryan" },
        ])

        await simpleNodeDB.cloneColumnWithOffset(
            "data",
            "firstName",
            "nextFirstName"
        )

        const data = await simpleNodeDB.getData("data")

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
})
