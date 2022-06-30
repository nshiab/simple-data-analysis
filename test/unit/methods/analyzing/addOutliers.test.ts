import assert from "assert"
import addOutliers from "../../../../src/methods/analyzing/addOutliers.js"

describe("addOutliers", function () {
    it("should add outliers", function () {
        const data = [
            { patate: 1, poil: 2 },
            { patate: 11, poil: 22 },
            { patate: 1, poil: 222 },
            { patate: 11111, poil: 2222 },
        ]
        const outliersData = addOutliers(data, "patate", "outliers")
        assert.deepEqual(outliersData, [
            { patate: 1, poil: 2, outliers: false },
            { patate: 11, poil: 22, outliers: false },
            { patate: 1, poil: 222, outliers: false },
            { patate: 11111, poil: 2222, outliers: true },
        ])
    })
})
