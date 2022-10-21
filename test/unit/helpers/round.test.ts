import assert from "assert"
import round from "../../../src/helpers/round.js"

describe("hasKey", function () {
    it("should round with no decimals", function () {
        assert.deepEqual(round(1.05, 0), 1)
    })
    it("should round with 1 decimal", function () {
        assert.deepEqual(round(1.49, 1), 1.5)
    })
    it("should round with 2 decimals", function () {
        assert.deepEqual(round(1.455, 2), 1.46)
    })
    it("should round with 3 decimals an integer with no error", function () {
        assert.deepEqual(round(2, 3), 2)
    })
})
