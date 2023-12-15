import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("getExtensions", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should return the DuckDB extensions", async () => {
        await simpleNodeDB.getExtensions()

        // Not sure how to test. Different depending on the environment?
    })
})
