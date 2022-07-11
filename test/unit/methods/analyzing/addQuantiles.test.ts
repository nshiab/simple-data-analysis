import assert from "assert"
import addQuantiles from "../../../../src/methods/analyzing/addQuantiles.js"

describe("addQuantiles", function () {
    it("should add quantiles", function () {
        const data = [
            { key1: 1 },
            { key1: 2 },
            { key1: 3 },
            { key1: 4 },
            { key1: 5 },
        ]
        const quantilesData = addQuantiles(data, "key1", "quantile", 5)
        assert.deepEqual(quantilesData, [
            { key1: 1, quantile: 1 },
            { key1: 2, quantile: 2 },
            { key1: 3, quantile: 3 },
            { key1: 4, quantile: 4 },
            { key1: 5, quantile: 5 },
        ])
    })

    it("should add quantiles with uneven nbQuantiles", function () {
        const data = [
            { key1: 1 },
            { key1: 2 },
            { key1: 3 },
            { key1: 4 },
            { key1: 5 },
        ]
        const quantilesData = addQuantiles(data, "key1", "quantile", 2)
        assert.deepEqual(quantilesData, [
            { key1: 1, quantile: 1 },
            { key1: 2, quantile: 1 },
            { key1: 3, quantile: 2 },
            { key1: 4, quantile: 2 },
            { key1: 5, quantile: 2 },
        ])
    })

    it("should add quantiles with skewed distribution", function () {
        const data = [
            { key1: 1 },
            { key1: 2 },
            { key1: 3 },
            { key1: 4 },
            { key1: 50 },
        ]
        const quantilesData = addQuantiles(data, "key1", "quantile", 2)
        assert.deepEqual(quantilesData, [
            { key1: 1, quantile: 1 },
            { key1: 2, quantile: 1 },
            { key1: 3, quantile: 2 },
            { key1: 4, quantile: 2 },
            { key1: 50, quantile: 2 },
        ])
    })

    it("should throw error if nbQuantiles < 1", function () {
        const data = [{ key1: 1 }]
        assert.throws(() => addQuantiles(data, "key1", "quantile", 0))
    })

    it("should throw error if key does not exists", function () {
        const data = [{ key1: 1 }]
        assert.throws(() => addQuantiles(data, "key2", "quantile", 5))
    })

    it("should throw error if newKey already exists", function () {
        const data = [{ key1: 1 }]
        assert.throws(() => addQuantiles(data, "key1", "key1", 5))
    })
})
