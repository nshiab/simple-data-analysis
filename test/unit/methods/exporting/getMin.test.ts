import assert from "assert"
import getMin from "../../../../src/methods/exporting/getMin.js"

const data = [
    { key1: 66, key2: 5, key3: new Date(Date.UTC(2022, 7, 1)), key4: 66.567 },
    {
        key1: 88,
        key2: null,
        key3: new Date(Date.UTC(2022, 7, 2)),
        key4: 88.123,
    },
    { key1: 77, key2: 9, key3: new Date(Date.UTC(2022, 7, 3)), key4: 77.789 },
    {
        key1: 99,
        key2: -11.1,
        key3: new Date(Date.UTC(2022, 7, 4)),
        key4: 99.123,
    },
    { key1: 44, key2: 6, key3: new Date(Date.UTC(2022, 7, 5)), key4: 44.789 },
    {
        key1: 55,
        key2: undefined,
        key3: new Date(Date.UTC(2022, 7, 6)),
        key4: 55.159,
    },
    {
        key1: 44,
        key2: "haha",
        key3: new Date(Date.UTC(2022, 7, 7)),
        key4: -44.751,
    },
]

describe("getMin", function () {
    it("should return min value 44 from key holding all numbers", function () {
        const minValue = getMin(data, "key1")
        assert.deepEqual(minValue, 44)
    })

    it("should throw an error when different types", function () {
        assert.throws(() => getMin(data, "key2"))
    })
    it("should throw an error when not working with with numbers", function () {
        assert.throws(() => getMin(data, "key3"))
    })
    it("should return min value when the type provided (Date)", function () {
        const value = getMin(data, "key3", undefined, undefined, "Date")
        assert.deepEqual(value, new Date(Date.UTC(2022, 7, 1)))
    })
    it("should return min rounded value when the nbDigits is provided", function () {
        const value = getMin(data, "key4", 1)
        assert.deepEqual(value, -44.8)
    })
})
