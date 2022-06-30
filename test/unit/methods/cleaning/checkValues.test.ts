import assert from "assert"
import checkValues from "../../../../src/methods/cleaning/checkValues.js"

describe("checkValues", function () {
    it("should check the type of values", () => {
        const data = [
            { patate: "1", poil: 2 },
            { patate: "11", poil: 22 },
        ]
        const dataChecked = checkValues(data)
        assert.deepEqual(dataChecked, [
            {
                count: 2,
                key: "patate",
                number: 0,
                string: "2 | 100%",
                uniques: "2 | 100%",
            },
            {
                count: 2,
                key: "poil",
                number: "2 | 100%",
                string: 0,
                uniques: "2 | 100%",
            },
        ])
    })
})
