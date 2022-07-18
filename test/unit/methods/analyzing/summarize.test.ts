import assert from "assert"
import summarize from "../../../../src/methods/analyzing/summarize.js"

describe("summarize", function () {
    it("should summarize without keyCategory", function () {
        const data = [
            { key1: "Rubarbe", key2: 2, key3: new Date("2022-02-14") },
            { key1: "Fraise", key2: 22, key3: new Date("2014-02-14") },
        ]
        const summarizedData = summarize(data)
        assert.deepEqual(summarizedData, [
            {
                value: "key1",
                count: 2,
                min: NaN,
                max: NaN,
                sum: NaN,
                mean: NaN,
                median: NaN,
                deviation: NaN,
            },
            {
                value: "key2",
                count: 2,
                min: 2,
                max: 22,
                sum: 24,
                mean: 12,
                median: 12,
                deviation: 14.1,
            },
            {
                value: "key3",
                count: 2,
                min: NaN,
                max: NaN,
                sum: NaN,
                mean: NaN,
                median: NaN,
                deviation: NaN,
            },
        ])
    })

    it("should summarize with keyCategory", function () {
        const data = [
            { key1: "Rubarbe", key2: 1 },
            { key1: "Fraise", key2: 11 },
            { key1: "Rubarbe", key2: 2 },
            { key1: "Fraise", key2: 22 },
        ]
        const summarizedData = summarize(data, "key2", "key1")
        assert.deepEqual(summarizedData, [
            {
                value: "key2",
                key1: "Rubarbe",
                count: 2,
                min: 1,
                max: 2,
                sum: 3,
                mean: 1.5,
                median: 1.5,
                deviation: 0.7,
            },
            {
                value: "key2",
                key1: "Fraise",
                count: 2,
                min: 11,
                max: 22,
                sum: 33,
                mean: 16.5,
                median: 16.5,
                deviation: 7.8,
            },
        ])
    })
})
