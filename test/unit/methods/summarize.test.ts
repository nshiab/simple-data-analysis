import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("summarize", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = await new SimpleNodeDB().start()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should summarize all numerical columns in a table", async () => {
        await simpleNodeDB.loadData(
            "dataSummarizeAll",
            "test/data/files/dataSummarize.json"
        )

        const data = await simpleNodeDB.summarize("dataSummarizeAll", {
            returnDataFrom: "table",
        })

        assert.deepStrictEqual(data, [
            {
                value: "key2",
                count: 4,
                min: 1,
                max: 22,
                avg: 9,
                median: 6.5,
                sum: 36,
                skew: 0.97,
                stdDev: 9.76,
                var: 95.33,
            },
            {
                value: "key3",
                count: 4,
                min: 2.35,
                max: 12.34,
                avg: 7.44,
                median: 7.53,
                sum: 29.75,
                skew: -0.06,
                stdDev: 4.75,
                var: 22.54,
            },
        ])
    })
    it("should summarize specific numerical columns in a table", async () => {
        await simpleNodeDB.loadData(
            "dataSummarizeOneValue",
            "test/data/files/dataSummarize.json"
        )

        const data = await simpleNodeDB.summarize("dataSummarizeOneValue", {
            values: "key2",
            returnDataFrom: "table",
        })

        assert.deepStrictEqual(data, [
            {
                value: "key2",
                count: 4,
                min: 1,
                max: 22,
                avg: 9,
                median: 6.5,
                sum: 36,
                skew: 0.97,
                stdDev: 9.76,
                var: 95.33,
            },
        ])
    })
})
