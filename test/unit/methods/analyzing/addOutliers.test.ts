import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("addOutliers", function () {
    it("should add outliers", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 11, key2: 22 },
            { key1: 1, key2: 222 },
            { key1: 11111, key2: 2222 },
        ]
        const sd = new SimpleData({ data }).addOutliers({
            key: "key1",
            newKey: "outliers",
        })
        assert.deepStrictEqual(sd.getData(), [
            { key1: 1, key2: 2, outliers: false },
            { key1: 11, key2: 22, outliers: false },
            { key1: 1, key2: 222, outliers: false },
            { key1: 11111, key2: 2222, outliers: true },
        ])
    })

    it("should throw error if the values are not numbers", function () {
        const data = [
            { key1: 1, key2: "2" },
            { key1: 11, key2: "22" },
            { key1: 1, key2: "222" },
            { key1: 11111, key2: "2222" },
        ]

        assert.throws(() =>
            new SimpleData({ data }).addOutliers({
                key: "key2",
                newKey: "outliers",
            })
        )
    })

    it("should throw error if the key does not exist", function () {
        const data = [
            { key1: 1, key2: "2" },
            { key1: 11, key2: "22" },
            { key1: 1, key2: "222" },
            { key1: 11111, key2: "2222" },
        ]

        assert.throws(() =>
            new SimpleData({ data }).addOutliers({
                key: "key3",
                newKey: "outliers",
            })
        )
    })

    it("should throw error if the key already exist", function () {
        const data = [
            { key1: 1, key2: "2" },
            { key1: 11, key2: "22" },
            { key1: 1, key2: "222" },
            { key1: 11111, key2: "2222" },
        ]

        assert.throws(() =>
            new SimpleData({ data }).addOutliers({
                key: "key1",
                newKey: "key2",
            })
        )
    })
})
