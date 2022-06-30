import assert from "assert"
import summarize from "../../../../src/methods/analyzing/summarize.js"

describe("summarize", function () {
    it("should summarize", function () {
        const data = [
            { patate: "1", poil: 2 },
            { patate: "11", poil: 22 },
        ]
        const summarizedData = summarize(data)
        assert.deepEqual(summarizedData, [
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
        ])
    })
})
