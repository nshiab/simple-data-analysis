import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("addBins", function () {
    it("should add bins", function () {
        const data = [
            { key1: 1 },
            { key1: 2 },
            { key1: 3 },
            { key1: 4 },
            { key1: 5 },
        ]
        const sd = new SimpleData({ data }).addBins({
            key: "key1",
            newKey: "bin",
            nbBins: 5,
        })
        assert.deepStrictEqual(sd.getData(), [
            { key1: 1, bin: 1 },
            { key1: 2, bin: 2 },
            { key1: 3, bin: 3 },
            { key1: 4, bin: 4 },
            { key1: 5, bin: 5 },
        ])
    })

    it("should add bins with uneven nbBins", function () {
        const data = [
            { key1: 1 },
            { key1: 2 },
            { key1: 3 },
            { key1: 4 },
            { key1: 5 },
        ]
        const sd = new SimpleData({ data }).addBins({
            key: "key1",
            newKey: "bin",
            nbBins: 2,
        })
        assert.deepStrictEqual(sd.getData(), [
            { key1: 1, bin: 1 },
            { key1: 2, bin: 1 },
            { key1: 3, bin: 2 },
            { key1: 4, bin: 2 },
            { key1: 5, bin: 2 },
        ])
    })

    it("should add bins with skewed left distribution", function () {
        const data = [
            { key1: 1 },
            { key1: 2 },
            { key1: 3 },
            { key1: 4 },
            { key1: 50 },
        ]
        const sd = new SimpleData({ data }).addBins({
            key: "key1",
            newKey: "bin",
            nbBins: 2,
        })
        assert.deepStrictEqual(sd.getData(), [
            { key1: 1, bin: 1 },
            { key1: 2, bin: 1 },
            { key1: 3, bin: 1 },
            { key1: 4, bin: 1 },
            { key1: 50, bin: 2 },
        ])
    })

    it("should add bins with skewed right distribution", function () {
        const data = [
            { key1: 1 },
            { key1: 2 },
            { key1: 50 },
            { key1: 51 },
            { key1: 52 },
            { key1: 100 },
        ]
        const sd = new SimpleData({ data }).addBins({
            key: "key1",
            newKey: "bin",
            nbBins: 4,
        })
        assert.deepStrictEqual(sd.getData(), [
            { key1: 1, bin: 1 },
            { key1: 2, bin: 1 },
            { key1: 50, bin: 2 },
            { key1: 51, bin: 3 },
            { key1: 52, bin: 3 },
            { key1: 100, bin: 4 },
        ])
    })

    it("should throw error if nbBins < 1", function () {
        const data = [{ key1: 1 }]
        assert.throws(() =>
            new SimpleData({ data }).addBins({
                key: "key1",
                newKey: "bin",
                nbBins: 0,
            })
        )
    })

    it("should throw error if key does not exists", function () {
        const data = [{ key1: 1 }]
        assert.throws(() =>
            new SimpleData({ data }).addBins({
                key: "key2",
                newKey: "bin",
                nbBins: 5,
            })
        )
    })

    it("should throw error if newKey already exists", function () {
        const data = [{ key1: 1 }]
        assert.throws(() =>
            new SimpleData({ data }).addBins({
                key: "key1",
                newKey: "key1",
                nbBins: 5,
            })
        )
    })
})
