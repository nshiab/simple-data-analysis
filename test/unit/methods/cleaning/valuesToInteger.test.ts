import assert from "assert"
import valuesToInteger from "../../../../src/methods/cleaning/valuesToInteger.js"

describe("valuesToInteger", function () {
    it("should convert values to integer", function () {
        const data = [
            { key1: "1", key2: 2 },
            { key1: "2.2", key2: 2 },
            { key1: "100,000,000", key2: 2 },
        ]
        const intergerValues = valuesToInteger(data, "key1")
        assert.deepEqual(intergerValues, [
            { key1: 1, key2: 2 },
            { key1: 2, key2: 2 },
            { key1: 100000000, key2: 2 },
        ])
    })

    it("should convert French formatted numbers to integers", function () {
        const data = [
            { key1: "1", key2: 2 },
            { key1: "2,2", key2: 2 },
            { key1: "100 000 000", key2: 2 },
        ]
        const intergerValues = valuesToInteger(data, "key1", "fr")
        assert.deepEqual(intergerValues, [
            { key1: 1, key2: 2 },
            { key1: 2, key2: 2 },
            { key1: 100000000, key2: 2 },
        ])
    })

    it("should convert to integers and skip errors", function () {
        const data = [
            { key1: "1", key2: 2 },
            { key1: 1, key2: 2 },
            { key1: "100 000 000", key2: 2 },
        ]
        const intergerValues = valuesToInteger(data, "key1", "fr", true)
        assert.deepEqual(intergerValues, [
            { key1: 1, key2: 2 },
            { key1: 1, key2: 2 },
            { key1: 100000000, key2: 2 },
        ])
    })
})
