import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("removeKey", function () {
    it("should remove a key", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 2, key2: 4 },
        ]
        const sd = new SimpleData({ data }).removeKey({ key: "key2" })
        assert.deepEqual(sd.getData(), [{ key1: 1 }, { key1: 2 }])
    })
})
