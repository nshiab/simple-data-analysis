import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

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
        assert.deepStrictEqual(
            new SimpleData({ data }).getMin({ key: "key1" }),
            44
        )
    })

    it("should throw an error when different types", function () {
        assert.throws(() => new SimpleData({ data }).getMin({ key: "key2" }))
    })
    it("should throw an error when not working with with numbers", function () {
        assert.throws(() => new SimpleData({ data }).getMin({ key: "key3" }))
    })
    it("should return min value when the type provided (Date)", function () {
        const value = new SimpleData({ data }).getMin({
            key: "key3",
            type: "Date",
        })
        assert.deepStrictEqual(value, new Date(Date.UTC(2022, 7, 1)))
    })
    it("should return min rounded value when the nbDigits is provided", function () {
        assert.deepStrictEqual(
            new SimpleData({ data }).getMin({ key: "key4", nbDigits: 1 }),
            -44.8
        )
    })
})
