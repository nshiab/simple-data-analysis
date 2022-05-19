import assert from "assert"
import addQuantiles from "../../../src/methods/addQuantiles.js"

describe("addQuantiles", function() {
    it("should add quantiles", function () {
        const data = [
            { patate: 1 },
            { patate: 2 },
            { patate: 3 },
            { patate: 4 },
            { patate: 5 },
        ]
        const quantilesData = addQuantiles(data, "patate", "quantile", 5)
        assert.deepEqual(quantilesData, [
            { patate: 1, quantile: 1 },
            { patate: 2, quantile: 2 },
            { patate: 3, quantile: 3 },
            { patate: 4, quantile: 4 },
            { patate: 5, quantile: 5 },
        ])
    })

    it("should add quantiles with uneven nbQuantiles", function () {
        const data = [
            { patate: 1 },
            { patate: 2 },
            { patate: 3 },
            { patate: 4 },
            { patate: 5 },
        ]
        const quantilesData = addQuantiles(data, "patate", "quantile", 2)
        assert.deepEqual(quantilesData, [
            { patate: 1, quantile: 1 },
            { patate: 2, quantile: 1 },
            { patate: 3, quantile: 2 },
            { patate: 4, quantile: 2 },
            { patate: 5, quantile: 2 },
        ])
    })

    it("should throw error if nbQuantiles < 1", function () {
        const data = [
            { patate: 1 },
        ]
        assert.throws(() => addQuantiles(data, "patate", "quantile", 0))
    })

    it("should throw error if key does not exists", function () {
        const data = [
            { patate: 1 },
        ]
        assert.throws(() => addQuantiles(data, "poil", "quantile", 5))
    })

    it("should throw error if newKey already exists", function () {
        const data = [
            { patate: 1 },
        ]
        assert.throws(() => addQuantiles(data, "patate", "patate", 5))
    })
})