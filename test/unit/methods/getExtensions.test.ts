import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getExtensions", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the DuckDB extensions", async () => {
        await sdb.getExtensions()

        // Not sure how to test. Different depending on the environment?
    })
})
