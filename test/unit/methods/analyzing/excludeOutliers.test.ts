import assert from "assert"
import excludeOutliers from "../../../../src/methods/analyzing/excludeOutliers.js"

describe("excludeOutliers", function () {
    it("should exclude outliers", function () {
        const data = [
            { patate: 1, poil: 2 },
            { patate: 11, poil: 22 },
            { patate: 1, poil: 222 },
            { patate: 11111, poil: 2222 },
        ]
        const dataOutliersExcluded = excludeOutliers(data, "patate")
        assert.deepEqual(dataOutliersExcluded, [
            { patate: 1, poil: 2 },
            { patate: 11, poil: 22 },
            { patate: 1, poil: 222 },
        ])
    })
})
