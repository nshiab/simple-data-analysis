import assert from "assert"
import addOutliers from "../../../../src/methods/analyzing/addOutliers.js"

describe("addOutliers", function () {
    it("should add outliers", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 11, key2: 22 },
            { key1: 1, key2: 222 },
            { key1: 11111, key2: 2222 },
        ]
        const outliersData = addOutliers(data, "key1", "outliers")
        assert.deepEqual(outliersData, [
            { key1: 1, key2: 2, outliers: false },
            { key1: 11, key2: 22, outliers: false },
            { key1: 1, key2: 222, outliers: false },
            { key1: 11111, key2: 2222, outliers: true },
        ])
    })
})
