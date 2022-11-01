import assert from "assert"
import valuesToInteger from "../../../../src/methods/cleaning/valuesToInteger.js"

describe("valuesToInteger", function () {
    it("should convert values to integer", function () {
        const data = [
            { key1: "1", key2: 2 },
            { key1: "2.2", key2: 2 },
            { key1: "100000000", key2: 2 },
            { key1: "-2", key2: 2 },
        ]
        const intergerValues = valuesToInteger(data, "key1")
        assert.deepEqual(intergerValues, [
            { key1: 1, key2: 2 },
            { key1: 2, key2: 2 },
            { key1: 100000000, key2: 2 },
            { key1: -2, key2: 2 },
        ])
    })

    it("should convert French formatted numbers to integers", function () {
        const data = [
            { key1: "1", key2: 2 },
            { key1: "2,2", key2: 2 },
            { key1: "100 000 000", key2: 2 },
            { key1: "-2", key2: 2 },
        ]
        const intergerValues = valuesToInteger(data, "key1", " ", ",")
        assert.deepEqual(intergerValues, [
            { key1: 1, key2: 2 },
            { key1: 2, key2: 2 },
            { key1: 100000000, key2: 2 },
            { key1: -2, key2: 2 },
        ])
    })

    it("should not throw errors when integers are already here", function () {
        const data = [
            { key1: "1", key2: 2 },
            { key1: 1, key2: 2 },
            { key1: "100 000 000", key2: 2 },
        ]
        const intergerValues = valuesToInteger(data, "key1", " ", ".")
        assert.deepEqual(intergerValues, [
            { key1: 1, key2: 2 },
            { key1: 1, key2: 2 },
            { key1: 100000000, key2: 2 },
        ])
    })

    it("should skip errors", function () {
        const data = [
            { key1: "a", key2: 2 },
            { key1: 1, key2: 2 },
            { key1: "100 000 000", key2: 2 },
        ]
        const intergerValues = valuesToInteger(data, "key1", " ", ".", true)
        assert.deepEqual(intergerValues, [
            { key1: "a", key2: 2 },
            { key1: 1, key2: 2 },
            { key1: 100000000, key2: 2 },
        ])
    })

    it("should save values as integers with a new key", function () {
        const data = [
            { key1: "1", key2: 2 },
            { key1: "2.2", key2: 2 },
            { key1: "100000000", key2: 2 },
            { key1: "-2", key2: 2 },
        ]
        const intergerValues = valuesToInteger(
            data,
            "key1",
            undefined,
            undefined,
            undefined,
            "key1x"
        )
        assert.deepEqual(intergerValues, [
            { key1: "1", key2: 2, key1x: 1 },
            { key1: "2.2", key2: 2, key1x: 2 },
            { key1: "100000000", key2: 2, key1x: 100000000 },
            { key1: "-2", key2: 2, key1x: -2 },
        ])
    })

    it("should throw error if newKey already exists", function () {
        const data = [
            { key1: "1", key2: 2 },
            { key1: "2.2", key2: 2 },
            { key1: "100000000", key2: 2 },
            { key1: "-2", key2: 2 },
        ]
        assert.throws(() =>
            valuesToInteger(
                data,
                "key1",
                undefined,
                undefined,
                undefined,
                "key2"
            )
        )
    })
})
