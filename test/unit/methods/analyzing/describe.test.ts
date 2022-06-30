import assert from "assert"
import descr from "../../../../src/methods/analyzing/describe.js"

describe("describe", function () {
    it("should describe", function () {
        const data = [
            { patate: "1", poil: 2 },
            { patate: "11", poil: 22 },
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
