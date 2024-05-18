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

    it("should clone a column", async () => {
        await sdb.loadArray("data", [
            { firstName: "nael", lastName: "shiab" },
            { firstName: "graeme", lastName: "bruce" },
            { firstName: "wendy", lastName: "martinez" },
            { firstName: "andrew", lastName: "ryan" },
        ])

        await sdb.cloneColumnWithOffset("data", "firstName", "nextFirstName")

        const data = await sdb.getData("data")

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
