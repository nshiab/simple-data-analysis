import assert from "assert"
import descr from "../../../../src/methods/analyzing/describe.js"

describe("describe", function () {
    it("should describe", function () {
        const data = [
            { key1: "1", key2: 2 },
            { key1: "11", key2: 22 },
        ]
        const describeData = descr(data)
        assert.deepEqual(describeData, [
            {
                nbDataPoints: 4,
                nbItems: 2,
                nbKeys: 2,
            },
        ])
    })
})
