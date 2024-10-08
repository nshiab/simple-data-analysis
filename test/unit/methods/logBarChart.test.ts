import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("logBarChart", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })
    it("should log a dot chart", async () => {
        const table = sdb.newTable()

        const data = [
            { category: "A", value: 10 },
            { category: "B", value: 20 },
        ]
        await table.loadArray(data)
        await table.logBarChart("category", "value")

        // How to test?
        assert.deepStrictEqual(true, true)
    })
    it("should log a dot chart with options", async () => {
        const table = sdb.newTable()

        const data = [
            { category: "A", value: 10 },
            { category: "B", value: 20 },
        ]
        await table.loadArray(data)
        await table.logBarChart("category", "value", {
            formatLabels: (label: unknown) => (label as string).toUpperCase(),
            formatValues: (value: unknown) => "$" + (value as number),
        })

        // How to test?
        assert.deepStrictEqual(true, true)
    })
})
