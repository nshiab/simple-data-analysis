import assert from "assert"
import addProportions from "../../../../src/methods/analyzing/addProportions.js"

describe("addProportions", function () {
    it("should calculate the proportion for a group of keys inside each item", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 12, key2: 21 },
            { key1: 145, key2: 22 },
            { key1: 111, key2: 2222 },
        ]
        const dataWithPercentages = addProportions(data, {
            method: "item",
            keys: ["key1", "key2"],
        })

        assert.deepEqual(dataWithPercentages, [
            { key1: 1, key2: 2, key1Percent: 0.33, key2Percent: 0.67 },
            { key1: 12, key2: 21, key1Percent: 0.36, key2Percent: 0.64 },
            { key1: 145, key2: 22, key1Percent: 0.87, key2Percent: 0.13 },
            { key1: 111, key2: 2222, key1Percent: 0.05, key2Percent: 0.95 },
        ])
    })

    it("should calculate the proportion over the whole data and add the result in a new key", function () {
        const data = [
            { key1: "yellow", key2: 1 },
            { key1: "red", key2: 2 },
            { key1: "yellow", key2: 5 },
            { key1: "yellow", key2: 10 },
            { key1: "red", key2: 5 },
            { key1: "yellow", key2: 2 },
            { key1: "red", key2: 22 },
            { key1: "red", key2: 13 },
        ]
        const dataWithPercentages = addProportions(data, {
            method: "data",
            key: "key2",
            newKey: "key2Percent",
        })

        assert.deepEqual(dataWithPercentages, [
            { key1: "yellow", key2: 1, key2Percent: 0.02 },
            { key1: "red", key2: 2, key2Percent: 0.03 },
            { key1: "yellow", key2: 5, key2Percent: 0.08 },
            { key1: "yellow", key2: 10, key2Percent: 0.17 },
            { key1: "red", key2: 5, key2Percent: 0.08 },
            { key1: "yellow", key2: 2, key2Percent: 0.03 },
            { key1: "red", key2: 22, key2Percent: 0.37 },
            { key1: "red", key2: 13, key2Percent: 0.22 },
        ])
    })

    it("should calculate the proportion over each group in the data and add the result in a new key", function () {
        const data = [
            { key3: "caribou", key1: "yellow", key2: 1 },
            { key3: "caribou", key1: "red", key2: 2 },
            { key3: "caribou", key1: "yellow", key2: 5 },
            { key3: "caribou", key1: "yellow", key2: 10 },
            { key3: "castor", key1: "red", key2: 5 },
            { key3: "castor", key1: "yellow", key2: 2 },
            { key3: "castor", key1: "red", key2: 22 },
            { key3: "castor", key1: "red", key2: 13 },
        ]
        const dataWithPercentages = addProportions(data, {
            method: "data",
            key: "key2",
            newKey: "key3key1Percent",
            keyCategory: ["key3", "key1"],
        })

        assert.deepEqual(dataWithPercentages, [
            {
                key3: "caribou",
                key1: "yellow",
                key2: 1,
                key3key1Percent: 0.06,
            },
            {
                key3: "caribou",
                key1: "red",
                key2: 2,
                key3key1Percent: 1,
            },
            {
                key3: "caribou",
                key1: "yellow",
                key2: 5,
                key3key1Percent: 0.31,
            },
            {
                key3: "caribou",
                key1: "yellow",
                key2: 10,
                key3key1Percent: 0.63,
            },
            {
                key3: "castor",
                key1: "red",
                key2: 5,
                key3key1Percent: 0.13,
            },
            {
                key3: "castor",
                key1: "yellow",
                key2: 2,
                key3key1Percent: 1,
            },
            {
                key3: "castor",
                key1: "red",
                key2: 22,
                key3key1Percent: 0.55,
            },
            {
                key3: "castor",
                key1: "red",
                key2: 13,
                key3key1Percent: 0.33,
            },
        ])
    })
})
