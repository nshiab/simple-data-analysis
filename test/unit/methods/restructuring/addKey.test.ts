import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("addItems", function () {
    it("should add a new key and generate new values", function () {
        const data = [{ key1: 1 }, { key1: 2 }]
        const sd = new SimpleData({ data }).addKey({
            key: "key2",
            itemGenerator: (item) => (item.key1 as number) * 2,
        })
        assert.deepEqual(sd.getData(), [
            { key1: 1, key2: 2 },
            { key1: 2, key2: 4 },
        ])
    })
})
