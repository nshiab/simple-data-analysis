import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("summarize", function () {
    it("should summarize without keyCategory", function () {
        const data = [
            { key1: 1, key2: 2, key3: 55 },
            { key1: 2, key2: 22, key3: 99 },
        ]

        const sd = new SimpleData({ data }).summarize({
            nbDigits: 1,
        })
        assert.deepEqual(sd.getData(), [
            {
                value: "key1",
                count: 2,
                min: 1,
                max: 2,
                sum: 3,
                mean: 1.5,
                median: 1.5,
                deviation: 0.7,
            },
            {
                value: "key2",
                count: 2,
                min: 2,
                max: 22,
                sum: 24,
                mean: 12,
                median: 12,
                deviation: 14.1,
            },
            {
                value: "key3",
                count: 2,
                min: 55,
                max: 99,
                sum: 154,
                mean: 77,
                median: 77,
                deviation: 31.1,
            },
        ])
    })

    it("should summarize and filter out keys with non numerical values", function () {
        const data = [
            { key1: 1, key2: 2, key3: "a" },
            { key1: 2, key2: 22, key3: "b" },
            { key1: 2, key2: 22, key3: "c" },
            { key1: 2, key2: 22, key3: "d" },
        ]

        const sd = new SimpleData({ data }).summarize({
            nbDigits: 1,
        })
        assert.deepEqual(sd.getData(), [
            {
                value: "key1",
                count: 4,
                min: 1,
                max: 2,
                sum: 7,
                mean: 1.8,
                median: 2,
                deviation: 0.5,
            },
            {
                value: "key2",
                count: 4,
                min: 2,
                max: 22,
                sum: 68,
                mean: 17,
                median: 22,
                deviation: 10,
            },
        ])
    })

    it("should summarize with keyCategory", function () {
        const data = [
            { key1: "Rubarbe", key2: 1 },
            { key1: "Fraise", key2: 11 },
            { key1: "Rubarbe", key2: 2 },
            { key1: "Fraise", key2: 22 },
        ]
        const sd = new SimpleData({ data }).summarize({
            keyValue: "key2",
            keyCategory: "key1",
            nbDigits: 1,
        })
        assert.deepEqual(sd.getData(), [
            {
                value: "key2",
                key1: "Rubarbe",
                count: 2,
                min: 1,
                max: 2,
                sum: 3,
                mean: 1.5,
                median: 1.5,
                deviation: 0.7,
            },
            {
                value: "key2",
                key1: "Fraise",
                count: 2,
                min: 11,
                max: 22,
                sum: 33,
                mean: 16.5,
                median: 16.5,
                deviation: 7.8,
            },
        ])
    })
})
