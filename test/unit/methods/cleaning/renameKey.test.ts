import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("renameKey", function () {
    it("should rename key", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 11, key2: 22 },
        ]
        const sd = new SimpleData({ data }).renameKey({
            oldKey: "key1",
            newKey: "navet",
        })
        assert.deepEqual(sd.getData(), [
            { navet: 1, key2: 2 },
            { navet: 11, key2: 22 },
        ])
    })

    it("should throw error if newKey already exists", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 11, key2: 22 },
        ]
        assert.throws(() =>
            new SimpleData({ data }).renameKey({
                oldKey: "key1",
                newKey: "key2",
            })
        )
    })
})
