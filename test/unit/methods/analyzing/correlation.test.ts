import assert from "assert"
import correlation from "../../../../src/methods/analyzing/correlation.js"

describe("correlation", function () {
    it("should apply correlation", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 11, key2: 22 },
            { key1: 111, key2: 222 },
        ]
        const correlationData = correlation(data, "key1", "key2")
        assert.deepEqual(correlationData, [
            {
                correlation: 1,
                key1: "key1",
                key2: "key2",
            },
        ])
    })
})
