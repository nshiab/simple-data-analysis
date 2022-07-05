import assert from "assert"
import summarize from "../../../../src/methods/analyzing/summarize.js"

describe("summarize", function () {
    it("should summarize without keyCategory", function () {
        const data = [
            { patate: "Rubarbe", poil: 2, animal: new Date("2022-02-14") },
            { patate: "Fraise", poil: 22, animal: new Date("2014-02-14") },
        ]
        const summarizedData = summarize(data)
        assert.deepEqual(summarizedData, [
            {
                value: "patate",
                count: 2,
                min: NaN,
                max: NaN,
                sum: 0,
                mean: NaN,
                median: NaN,
                deviation: NaN,
            },
            {
                value: "poil",
                count: 2,
                min: 2,
                max: 22,
                sum: 24,
                mean: 12,
                median: 12,
                deviation: 14.1,
            },
            {
                value: "animal",
                count: 2,
                min: NaN,
                max: NaN,
                sum: 3037132800000,
                mean: 1518566400000,
                median: 1518566400000,
                deviation: 178516743663.8,
            },
        ])
    })

    it("should summarize with keyCategory", function () {
        const data = [
            { patate: "Rubarbe", poil: 1 },
            { patate: "Fraise", poil: 11 },
            { patate: "Rubarbe", poil: 2 },
            { patate: "Fraise", poil: 22 },
        ]
        const summarizedData = summarize(data, "poil", "patate")
        assert.deepEqual(summarizedData, [
            {
                value: "poil",
                patate: "Rubarbe",
                count: 2,
                min: 1,
                max: 2,
                sum: 3,
                mean: 1.5,
                median: 1.5,
                deviation: 0.7,
            },
            {
                value: "poil",
                patate: "Fraise",
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
