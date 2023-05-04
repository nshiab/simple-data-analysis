import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("addQuantiles", function () {
    it("should add quantiles", function () {
        const data = [
            { key1: 1 },
            { key1: 2 },
            { key1: 3 },
            { key1: 4 },
            { key1: 5 },
        ]

        const sd = new SimpleData({ data }).addQuantiles({
            key: "key1",
            newKey: "quantile",
            nbQuantiles: 5,
        })
        assert.deepStrictEqual(sd.getData(), [
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

        const sd = new SimpleData({ data }).addQuantiles({
            key: "key1",
            newKey: "quantile",
            nbQuantiles: 2,
        })

        assert.deepStrictEqual(sd.getData(), [
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

        const sd = new SimpleData({ data }).addQuantiles({
            key: "key1",
            newKey: "quantile",
            nbQuantiles: 2,
        })

        assert.deepStrictEqual(sd.getData(), [
            { key1: 1, quantile: 1 },
            { key1: 2, quantile: 1 },
            { key1: 3, quantile: 2 },
            { key1: 4, quantile: 2 },
            { key1: 50, quantile: 2 },
        ])
    })

    it("should throw error if nbQuantiles < 1", function () {
        const data = [{ key1: 1 }]

        assert.throws(() =>
            new SimpleData({ data }).addQuantiles({
                key: "key1",
                newKey: "quantile",
                nbQuantiles: 0,
            })
        )
    })

    it("should throw error if key does not exists", function () {
        const data = [{ key1: 1 }]
        assert.throws(() =>
            new SimpleData({ data }).addQuantiles({
                key: "key2",
                newKey: "quantile",
                nbQuantiles: 5,
            })
        )
    })

    it("should throw error if newKey already exists", function () {
        const data = [{ key1: 1 }]
        assert.throws(() =>
            new SimpleData({ data }).addQuantiles({
                key: "key1",
                newKey: "key1",
                nbQuantiles: 5,
            })
        )
    })
})
