import assert from "assert"
import linearRegression from "../../../../src/methods/analyzing/linearRegression.js"

describe("correlation", function () {
    it("should apply linear regression", function () {
        const data = [
            { key1: 0, key2: 0 },
            { key1: 1, key2: 1 },
        ]
        const linearRegressionData = linearRegression(data, "key1", "key2")
        assert.deepEqual(linearRegressionData, [
            { key1: "key1", key2: "key2", slope: 1, intersect: 0 },
        ])
    })

    it("should compute all linear regressions if key1 and key2 are undefined", function () {
        const data = [
            { key1: 1, key2: 2, key3: 3 },
            { key1: 11, key2: 22, key3: 4 },
            { key1: 111, key2: 222, key3: 5 },
        ]
        const linearRegressionData = linearRegression(data)
        assert.deepEqual(linearRegressionData, [
            { key1: "key1", key2: "key2", slope: 2, intersect: 0 },
            { key1: "key1", key2: "key3", slope: 0.0149, intersect: 3.3905 },
            { key1: "key2", key2: "key3", slope: 0.0074, intersect: 3.3905 },
        ])
    })

    it("should compute multiple linear regressions if key2 is an array", function () {
        const data = [
            { key1: 1, key2: 2, key3: 3 },
            { key1: 11, key2: 22, key3: 4 },
            { key1: 111, key2: 222, key3: 5 },
        ]
        const linearRegressionData = linearRegression(data, "key1", [
            "key2",
            "key3",
        ])
        assert.deepEqual(linearRegressionData, [
            { key1: "key1", key2: "key2", slope: 2, intersect: 0 },
            { key1: "key1", key2: "key3", slope: 0.0149, intersect: 3.3905 },
        ])
    })

    it("should compute all linear regressions if key1 is undefined and key2 is an empty array", function () {
        const data = [
            { key1: 1, key2: 2, key3: 3 },
            { key1: 11, key2: 22, key3: 4 },
            { key1: 111, key2: 222, key3: 5 },
        ]
        const linearRegressionData = linearRegression(data, undefined, [])
        assert.deepEqual(linearRegressionData, [
            { key1: "key1", key2: "key2", slope: 2, intersect: 0 },
            { key1: "key1", key2: "key3", slope: 0.0149, intersect: 3.3905 },
            { key1: "key2", key2: "key3", slope: 0.0074, intersect: 3.3905 },
        ])
    })

    it("should compute all linear regressions if key1 is undefined and key2 is an empty array, with only two decimals", function () {
        const data = [
            { key1: 1, key2: 2, key3: 3 },
            { key1: 11, key2: 22, key3: 4 },
            { key1: 111, key2: 222, key3: 5 },
        ]
        const linearRegressionData = linearRegression(data, undefined, [], 2)
        assert.deepEqual(linearRegressionData, [
            { key1: "key1", key2: "key2", slope: 2, intersect: 0 },
            { key1: "key1", key2: "key3", slope: 0.01, intersect: 3.39 },
            { key1: "key2", key2: "key3", slope: 0.01, intersect: 3.39 },
        ])
    })
})
