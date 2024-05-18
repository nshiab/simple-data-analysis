import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("cloneColumn", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should clone a column", async () => {
        await sdb.loadArray("data", [{ firstName: "nael", lastName: "shiab" }])

        await sdb.cloneColumn("data", "firstName", "firstNameCloned")

        const data = await sdb.getData("data")

        assert.deepStrictEqual(data, [
            { firstName: "nael", lastName: "shiab", firstNameCloned: "nael" },
        ])
    })
})
