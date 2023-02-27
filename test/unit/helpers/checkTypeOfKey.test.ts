import assert from "assert"
import checkTypeOfKey from "../../../src/helpers/checkTypeOfKey.js"

describe("checkTypeOfKey", function () {
    it("should check the type of values threshold is 1 and return true", function () {
        const data = [
            { key1: 1 },
            { key1: 2 },
            { key1: 3 },
            { key1: 4 },
            { key1: 5 },
        ]
        const isNumber = checkTypeOfKey(
            data,
            "key1",
            "number",
            1,
            100,
            false,
            true
        )
        assert.deepEqual(isNumber, true)
    })

    it("should check the type of values threshold is 1 and return false", function () {
        const data = [
            { key1: 1 },
            { key1: "2" },
            { key1: 3 },
            { key1: 4 },
            { key1: 5 },
        ]
        const isNumber = checkTypeOfKey(
            data,
            "key1",
            "number",
            1,
            100,
            false,
            true
        )
        assert.deepEqual(isNumber, false)
    })

    it("should check the type of values threshold is 0.5 and return false", function () {
        const data = [
            { key1: 1 },
            { key1: "2" },
            { key1: "3" },
            { key1: "4" },
            { key1: 5 },
        ]
        const isNumber = checkTypeOfKey(
            data,
            "key1",
            "number",
            0.5,
            100,
            false,
            true
        )
        assert.deepEqual(isNumber, false)
    })
    it("should check the type of values threshold is 0.5 and return true", function () {
        const data = [
            { key1: 1 },
            { key1: "2" },
            { key1: "3" },
            { key1: "4" },
            { key1: 5 },
        ]
        const isNumber = checkTypeOfKey(
            data,
            "key1",
            "number",
            0.5,
            100,
            false,
            true
        )
        assert.deepEqual(isNumber, false)
    })
    it("should check detect NaN values", function () {
        const data = [
            { key1: 1 },
            { key1: 2 },
            { key1: 3 },
            { key1: NaN },
            { key1: 5 },
        ]
        const isNumber = checkTypeOfKey(
            data,
            "key1",
            "number",
            1,
            100,
            false,
            true
        )
        assert.deepEqual(isNumber, false)
    })
    it("should check detect empty strings", function () {
        const data = [
            { key1: "1" },
            { key1: "2" },
            { key1: "3" },
            { key1: "" },
            { key1: "5" },
        ]
        const isNumber = checkTypeOfKey(
            data,
            "key1",
            "number",
            1,
            100,
            false,
            true
        )
        assert.deepEqual(isNumber, false)
    })
    it("should check detect invalid Dates", function () {
        const data = [
            { key1: new Date() },
            { key1: new Date("2012") },
            { key1: new Date("z") },
            { key1: new Date("2012-01") },
            { key1: new Date("2012-01-01") },
        ]
        const isNumber = checkTypeOfKey(
            data,
            "key1",
            "Date",
            1,
            100,
            false,
            true
        )
        assert.deepEqual(isNumber, false)
    })
})
