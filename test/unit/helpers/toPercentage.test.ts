import assert from "assert"
import toPercentage from "../../../src/helpers/toPercentage.js"

describe("toPercentage", function () {
    it("should return a percentage as a string", function () {
        const perc = toPercentage(32, 452, 2)
        assert.deepEqual(perc, "7.08%")
    })
})
