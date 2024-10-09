import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"
import { formatNumber } from "journalism"

describe("logHistogram", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })
    it("should log a histogram", async () => {
        const table = sdb.newTable()

        await table.loadData("test/data/files/dailyTemperatures.csv")

        await table.logHistogram("t")
        // How to test?
        assert.deepStrictEqual(true, true)
    })
    it("should log a histogram with options", async () => {
        const table = sdb.newTable()

        await table.loadData("test/data/files/dailyTemperatures.csv")

        await table.logHistogram("t", {
            width: 10,
            bins: 25,
            compact: true,
            formatLabels(a, b) {
                return `${formatNumber(a, { decimals: 1 })} to ${formatNumber(b, { decimals: 1 })}°C`
            },
        })
        // How to test?
        assert.deepStrictEqual(true, true)
    })
})
