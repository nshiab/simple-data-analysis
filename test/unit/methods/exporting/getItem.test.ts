import assert from "assert"
import getItem from "../../../../src/methods/exporting/getItem.js"

describe("getItem", function () {
    it("should return a specific item", function () {
        const data = [
            { patate: "red", animal: "caribou", poil: 2 },
            { patate: "red", animal: "castor", poil: 22 },
            { patate: "blue", animal: "castor", poil: 222 },
        ]
        const item = getItem(data, { patate: "red", animal: "castor" })
        assert.deepEqual(item, { patate: "red", animal: "castor", poil: 22 })
    })
})
