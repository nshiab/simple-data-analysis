import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("describe", function () {
    it("should describe", function () {
        const data = [
            { key1: "1", key2: 2 },
            { key1: "11", key2: 22 },
        ]
        const sd = new SimpleData({ data }).describe()
        assert.deepStrictEqual(sd.getData(), [
            {
                nbDataPoints: 4,
                nbItems: 2,
                nbKeys: 2,
            },
        ])
    })
})
