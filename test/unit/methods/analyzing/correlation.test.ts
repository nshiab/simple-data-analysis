import assert from "assert"
import correlation from "../../../../src/methods/analyzing/correlation.js"

describe("correlation", function () {
    it("should apply correlation", function () {
        const data = [
            { patate: 1, poil: 2 },
            { patate: 11, poil: 22 },
            { patate: 111, poil: 222 },
        ]
        const correlationData = correlation(data, "patate", "poil")
        assert.deepEqual(correlationData, [
            {
                correlation: 1,
                key1: "patate",
                key2: "poil",
            },
        ])
    })
})
