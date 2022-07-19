import assert from "assert"
import valuesToFloat from "../../../../src/methods/cleaning/valuesToFloat.js"

describe("valuesToFloat", function () {
    it("should convert values to float", function () {
        const data = [{ key1: "1,000,000.5", key2: 2 }]
        const floatsData = valuesToFloat(data, "key1")
        assert.deepEqual(floatsData, [{ key1: 1000000.5, key2: 2 }])
    })

    it("should convert French formatted numbers to float", function () {
        const data = [{ key1: "1 000 000,5", key2: 2 }]
        const floatsData = valuesToFloat(data, "key1", "fr")
        assert.deepEqual(floatsData, [{ key1: 1000000.5, key2: 2 }])
    })

    it("should convert values to float and skip errors", function () {
        const data = [
            { key1: 12, key2: 2 },
            { key1: "1 000 000,5", key2: 2 },
        ]
        const floatsData = valuesToFloat(data, "key1", "fr", true)
        assert.deepEqual(floatsData, [
            { key1: 12, key2: 2 },
            { key1: 1000000.5, key2: 2 },
        ])
    })
})
