import assert from "assert"
import checkValues from "../../../../src/methods/cleaning/checkValues.js"

describe("checkValues", function () {
    it("should check the type of values", () => {
        const data = [
            { key1: "1", key2: 2 },
            { key1: "11", key2: 22 },
        ]
        const dataChecked = checkValues(data)
        assert.deepEqual(dataChecked, [
            {
                count: 2,
                key: "key1",
                number: 0,
                string: "2 | 100%",
                uniques: "2 | 100%",
            },
            {
                count: 2,
                key: "key2",
                number: "2 | 100%",
                string: 0,
                uniques: "2 | 100%",
            },
        ])
    })
})
