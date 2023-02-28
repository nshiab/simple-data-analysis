import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("removeDuplicates", function () {
    it("should not remove items", function () {
        const data = [
            { key1: 1, key2: 1 },
            { key1: 2, key2: 2 },
            { key1: 3, key2: 3 },
        ]

        const sd = new SimpleData({ data }).removeDuplicates()
        assert.deepEqual(sd.getData(), data)
    })

    it("should remove duplicates but keep one", function () {
        const data = [
            { key1: 1, key2: 1 },
            { key1: 1, key2: 1 },
            { key1: 2, key2: 2 },
        ]
        const sd = new SimpleData({ data }).removeDuplicates()
        assert.deepEqual(sd.getData(), [
            { key1: 1, key2: 1 },
            { key1: 2, key2: 2 },
        ])
    })

    it("should remove duplicates with specific key but keep one", function () {
        const data = [
            { id: 0, key1: 1, key2: 1 },
            { id: 1, key1: 2, key2: 2 },
            { id: 1, key1: 3, key2: 3 },
            { id: 2, key1: 4, key2: 4 },
        ]
        const sd = new SimpleData({ data }).removeDuplicates({ key: "id" })
        assert.deepEqual(sd.getData(), [
            { id: 0, key1: 1, key2: 1 },
            { id: 1, key1: 2, key2: 2 },
            { id: 2, key1: 4, key2: 4 },
        ])
    })

    it("should keep only duplicates with specific key", function () {
        const data = [
            { id: 0, key1: 1, key2: 1 },
            { id: 1, key1: 2, key2: 2 },
            { id: 1, key1: 3, key2: 3 },
            { id: 2, key1: 4, key2: 4 },
        ]
        const sd = new SimpleData({ data }).removeDuplicates({
            key: "id",
            keepDuplicatesOnly: true,
        })
        assert.deepEqual(sd.getData(), [
            { id: 1, key1: 2, key2: 2 },
            { id: 1, key1: 3, key2: 3 },
        ])
    })

    it("should remove duplicates but keep none", function () {
        const data = [
            { key1: 1, key2: 1 },
            { key1: 1, key2: 1 },
            { key1: 2, key2: 2 },
        ]
        const sd = new SimpleData({ data }).removeDuplicates({
            key: "key1",
            nbToKeep: 0,
        })
        assert.deepEqual(sd.getData(), [{ key1: 2, key2: 2 }])
    })

    it("should remove duplicates with specific key but none", function () {
        const data = [
            { id: 0, key1: 1, key2: 1 },
            { id: 1, key1: 2, key2: 2 },
            { id: 1, key1: 3, key2: 3 },
            { id: 2, key1: 4, key2: 4 },
        ]
        const sd = new SimpleData({ data }).removeDuplicates({
            key: "id",
            nbToKeep: 0,
        })
        assert.deepEqual(sd.getData(), [
            { id: 0, key1: 1, key2: 1 },
            { id: 2, key1: 4, key2: 4 },
        ])
    })

    it("should throw with non existing key", function () {
        const data = [
            { id: 0, key1: 1, key2: 1 },
            { id: 1, key1: 2, key2: 2 },
            { id: 1, key1: 3, key2: 3 },
            { id: 2, key1: 4, key2: 4 },
        ]
        assert.throws(() =>
            new SimpleData({ data }).removeDuplicates({
                key: "peanut",
            })
        )
    })
})
