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
        const table = await sdb.newTable("data")
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
})
