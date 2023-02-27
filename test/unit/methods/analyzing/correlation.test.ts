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
                keyX: "key1",
                keyY: "key2",
            },
        ])
    })

    it("should compute all correlations if key1 and key2 are undefined", function () {
        const data = [
            { key1: 1, key2: 2, key3: 3 },
            { key1: 11, key2: 22, key3: 4 },
            { key1: 111, key2: 222, key3: 5 },
        ]
        const correlationData = correlation(data)
        assert.deepEqual(correlationData, [
            { keyX: "key1", keyY: "key2", correlation: 1 },
            { keyX: "key1", keyY: "key3", correlation: 0.9042 },
            { keyX: "key2", keyY: "key3", correlation: 0.9042 },
        ])
    })

    it("should compute all correlations if key1 and key2 are undefined, but for each value in key4", function () {
        const data = [
            { key1: 1, key2: 2, key3: 3, key4: "a" },
            { key1: 11, key2: 22, key3: 4, key4: "b" },
            { key1: 111, key2: 222, key3: 5, key4: "b" },
            { key1: 1111, key2: 2222, key3: 6, key4: "b" },
            { key1: 11111, key2: 22222, key3: 7, key4: "a" },
            { key1: 111111, key2: 222222, key3: 8, key4: "a" },
        ]
        const correlationData = correlation(data, undefined, undefined, "key4")

        assert.deepEqual(correlationData, [
            { key4: "a", keyX: "key1", keyY: "key2", correlation: 1 },
            { key4: "a", keyX: "key1", keyY: "key3", correlation: 0.7206 },
            { key4: "a", keyX: "key2", keyY: "key3", correlation: 0.7206 },
            { key4: "b", keyX: "key1", keyY: "key2", correlation: 1 },
            { key4: "b", keyX: "key1", keyY: "key3", correlation: 0.9042 },
            { key4: "b", keyX: "key2", keyY: "key3", correlation: 0.9042 },
        ])
    })

    it("should compute correlation between key1 and key2, but for each value in key4", function () {
        const data = [
            { key1: 1, key2: 2, key3: 3, key4: "a" },
            { key1: 11, key2: 22, key3: 4, key4: "b" },
            { key1: 111, key2: 222, key3: 5, key4: "b" },
            { key1: 1111, key2: 2222, key3: 6, key4: "b" },
            { key1: 11111, key2: 22222, key3: 7, key4: "a" },
            { key1: 111111, key2: 222222, key3: 8, key4: "a" },
        ]
        const correlationData = correlation(data, "key1", "key2", "key4")

        assert.deepEqual(correlationData, [
            { key4: "a", keyX: "key1", keyY: "key2", correlation: 1 },
            { key4: "b", keyX: "key1", keyY: "key2", correlation: 1 },
        ])
    })

    it("should compute multiple correlations if key2 is an array", function () {
        const data = [
            { key1: 1, key2: 2, key3: 3 },
            { key1: 11, key2: 22, key3: 4 },
            { key1: 111, key2: 222, key3: 5 },
        ]
        const correlationData = correlation(data, "key1", ["key2", "key3"])
        assert.deepEqual(correlationData, [
            {
                correlation: 1,
                keyX: "key1",
                keyY: "key2",
            },
            {
                correlation: 0.9042,
                keyX: "key1",
                keyY: "key3",
            },
        ])
    })

    it("should compute all correlations if key1 is undefined and key2 is an empty array", function () {
        const data = [
            { key1: 1, key2: 2, key3: 3 },
            { key1: 11, key2: 22, key3: 4 },
            { key1: 111, key2: 222, key3: 5 },
        ]
        const correlationData = correlation(data, undefined, [])
        assert.deepEqual(correlationData, [
            { keyX: "key1", keyY: "key2", correlation: 1 },
            { keyX: "key1", keyY: "key3", correlation: 0.9042 },
            { keyX: "key2", keyY: "key3", correlation: 0.9042 },
        ])
    })

    it("should compute all correlations if key1 is undefined and key2 is an empty array, with only two decimals.", function () {
        const data = [
            { key1: 1, key2: 2, key3: 3 },
            { key1: 11, key2: 22, key3: 4 },
            { key1: 111, key2: 222, key3: 5 },
        ]
        const correlationData = correlation(data, undefined, [], undefined, 2)
        assert.deepEqual(correlationData, [
            { keyX: "key1", keyY: "key2", correlation: 1 },
            { keyX: "key1", keyY: "key3", correlation: 0.9 },
            { keyX: "key2", keyY: "key3", correlation: 0.9 },
        ])
    })
})
