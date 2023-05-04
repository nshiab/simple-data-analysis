import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("exclude", function () {
    it("should exclude only a specific value", function () {
        const data = [
            { key1: null, key2: 2 },
            { key1: NaN, key2: 3 },
            { key1: undefined, key2: 4 },
            { key1: "", key2: 5 },
            { key1: 11, key2: 22 },
            { key1: "coucou", key2: 22 },
        ]

        const sd = new SimpleData({ data }).exclude({
            key: "key1",
            value: 11,
        })

        assert.deepStrictEqual(sd.getData(), [
            { key1: null, key2: 2 },
            { key1: NaN, key2: 3 },
            { key1: undefined, key2: 4 },
            { key1: "", key2: 5 },
            { key1: "coucou", key2: 22 },
        ])
    })
    it("should exclude only specific values", function () {
        const data = [
            { key1: null, key2: 2 },
            { key1: NaN, key2: 3 },
            { key1: undefined, key2: 4 },
            { key1: "", key2: 5 },
            { key1: 11, key2: 22 },
            { key1: "coucou", key2: 22 },
        ]

        const sd = new SimpleData({ data }).exclude({
            key: "key1",
            value: [11, "coucou"],
        })

        assert.deepStrictEqual(sd.getData(), [
            { key1: null, key2: 2 },
            { key1: NaN, key2: 3 },
            { key1: undefined, key2: 4 },
            { key1: "", key2: 5 },
        ])
    })
})
