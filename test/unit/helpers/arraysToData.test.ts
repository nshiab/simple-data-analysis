import assert from "assert"
import arraysToData from "../../../src/helpers/arraysToData.js"

describe("arraysToData", function () {
    it("should return a SimpleDataItem[]", function () {
        const data = arraysToData(
            {
                key1: [1, 2, 3],
                key2: ["a", "b", "c"],
            },
            false
        )

        assert.deepEqual(data, [
            { key1: 1, key2: "a" },
            { key1: 2, key2: "b" },
            { key1: 3, key2: "c" },
        ])
    })
})
