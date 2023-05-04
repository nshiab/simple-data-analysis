import assert from "assert"
import cloneData from "../../../src/helpers/cloneData.js"

describe("cloneData", function () {
    it("should clone the data", function () {
        const data = [{ key1: "Coucou", key2: 345 }]

        const clonedData = cloneData(data)

        clonedData[0].key1 = "Hi!"
        clonedData[0].key2 = 10

        assert.deepStrictEqual(data, [{ key1: "Coucou", key2: 345 }])
    })
})
