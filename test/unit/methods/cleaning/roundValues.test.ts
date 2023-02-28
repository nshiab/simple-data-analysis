import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("roundValues", function () {
    it("should round values", function () {
        const data = [
            { key1: 1.1111, key2: 2 },
            { key1: 11.6666, key2: 22 },
        ]
        const sd = new SimpleData({ data }).roundValues({
            key: "key1",
            nbDigits: 2,
        })
        assert.deepEqual(sd.getData(), [
            { key1: 1.11, key2: 2 },
            { key1: 11.67, key2: 22 },
        ])
    })
    it("should round values and skip errors", function () {
        const data = [
            { key1: 1.1111, key2: 2 },
            { key1: "Hi!", key2: 22 },
        ]
        const sd = new SimpleData({ data }).roundValues({
            key: "key1",
            nbDigits: 2,
            skipErrors: true,
        })
        assert.deepEqual(sd.getData(), [
            { key1: 1.11, key2: 2 },
            { key1: "Hi!", key2: 22 },
        ])
    })

    it("should save rounded values with a new key", function () {
        const data = [
            { key1: 1.1111, key2: 2 },
            { key1: 11.6666, key2: 22 },
        ]
        const sd = new SimpleData({ data }).roundValues({
            key: "key1",
            newKey: "key1x",
            nbDigits: 2,
        })
        assert.deepEqual(sd.getData(), [
            { key1: 1.1111, key2: 2, key1x: 1.11 },
            { key1: 11.6666, key2: 22, key1x: 11.67 },
        ])
    })

    it("should throw error if newKey already exists", function () {
        const data = [
            { key1: 1.1111, key2: 2 },
            { key1: 11.6666, key2: 22 },
        ]
        assert.throws(() =>
            new SimpleData({ data }).roundValues({
                key: "key1",
                newKey: "key2",
                nbDigits: 2,
            })
        )
    })
})
