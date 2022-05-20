import assert from "assert"
import addBins from "../../../src/methods/addBins.js"

describe("addBins", function () {
    it("should add bins", function () {
        const data = [
            { patate: 1 },
            { patate: 2 },
            { patate: 3 },
            { patate: 4 },
            { patate: 5 },
        ]
        const binsData = addBins(data, "patate", "bin", 5)
        assert.deepEqual(binsData, [
            { patate: 1, bin: 1 },
            { patate: 2, bin: 2 },
            { patate: 3, bin: 3 },
            { patate: 4, bin: 4 },
            { patate: 5, bin: 5 },
        ])
    })

    it("should add bins with uneven nbBins", function () {
        const data = [
            { patate: 1 },
            { patate: 2 },
            { patate: 3 },
            { patate: 4 },
            { patate: 5 },
        ]
        const binsData = addBins(data, "patate", "bin", 2)
        assert.deepEqual(binsData, [
            { patate: 1, bin: 1 },
            { patate: 2, bin: 1 },
            { patate: 3, bin: 2 },
            { patate: 4, bin: 2 },
            { patate: 5, bin: 2 },
        ])
    })

    it("should add bins with skewed left distribution", function () {
        const data = [
            { patate: 1 },
            { patate: 2 },
            { patate: 3 },
            { patate: 4 },
            { patate: 50 },
        ]
        const binsData = addBins(data, "patate", "bin", 2)
        assert.deepEqual(binsData, [
            { patate: 1, bin: 1 },
            { patate: 2, bin: 1 },
            { patate: 3, bin: 1 },
            { patate: 4, bin: 1 },
            { patate: 50, bin: 2 },
        ])
    })

    it("should add bins with skewed right distribution", function () {
        const data = [
            { patate: 1 },
            { patate: 2 },
            { patate: 50 },
            { patate: 51 },
            { patate: 52 },
            { patate: 100 },
        ]
        const binsData = addBins(data, "patate", "bin", 4)
        assert.deepEqual(binsData, [
            { patate: 1, bin: 1 },
            { patate: 2, bin: 1 },
            { patate: 50, bin: 2 },
            { patate: 51, bin: 3 },
            { patate: 52, bin: 3 },
            { patate: 100, bin: 4 },
        ])
    })

    it("should throw error if nbBins < 1", function () {
        const data = [{ patate: 1 }]
        assert.throws(() => addBins(data, "patate", "bin", 0))
    })

    it("should throw error if key does not exists", function () {
        const data = [{ patate: 1 }]
        assert.throws(() => addBins(data, "poil", "bin", 5))
    })

    it("should throw error if newKey already exists", function () {
        const data = [{ patate: 1 }]
        assert.throws(() => addBins(data, "patate", "patate", 5))
    })
})
