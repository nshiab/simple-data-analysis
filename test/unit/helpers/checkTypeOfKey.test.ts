import assert from "assert"
import checkTypeOfKey from "../../../src/helpers/checkTypeOfKey.js"

describe("checkTypeOfKey", function () {
    it("should check the type of values threshold is 1", function () {
        const data = [
            { patate: 1 },
            { patate: 2 },
            { patate: 3 },
            { patate: 4 },
            { patate: 5 },
        ]
        const isNumber = checkTypeOfKey(data, "patate", "number", 1)
        assert.deepEqual(isNumber, true)
    })

    it("should check the type of values threshold is 0.5", function () {
        const data = [
            { patate: 1 },
            { patate: "2" },
            { patate: "3" },
            { patate: "4" },
            { patate: 5 },
        ]
        const isNumber = checkTypeOfKey(data, "patate", "number", 0.5)
        assert.deepEqual(isNumber, false)
    })
})
