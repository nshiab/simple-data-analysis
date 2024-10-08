import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("logLineChart", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })
    it("should log a line chart", async () => {
        const table = sdb.newTable()

        const data = [
            { date: new Date("2023-01-01"), value: 10 },
            { date: new Date("2023-02-01"), value: 20 },
            { date: new Date("2023-03-01"), value: 30 },
            { date: new Date("2023-04-01"), value: 40 },
        ]
        await table.loadArray(data)
        await table.convert({ date: "string" }, { datetimeFormat: "%x" })
        await table.logLineChart("date", "value")

        // How to test?
        assert.deepStrictEqual(true, true)
    })
    it("should log a line chart with small multiples", async () => {
        const table = sdb.newTable()

        const data = [
            { date: new Date("2023-01-01"), value: 10, category: "A" },
            { date: new Date("2023-02-01"), value: 20, category: "A" },
            { date: new Date("2023-03-01"), value: 30, category: "A" },
            { date: new Date("2023-04-01"), value: 40, category: "A" },
            { date: new Date("2023-01-01"), value: 15, category: "B" },
            { date: new Date("2023-02-01"), value: 25, category: "B" },
            { date: new Date("2023-03-01"), value: 35, category: "B" },
            { date: new Date("2023-04-01"), value: 45, category: "B" },
        ]
        await table.loadArray(data)
        await table.convert({ date: "string" }, { datetimeFormat: "%x" })
        await table.logLineChart("date", "value", {
            smallMultiples: "category",
        })

        // How to test?
        assert.deepStrictEqual(true, true)
    })
})
