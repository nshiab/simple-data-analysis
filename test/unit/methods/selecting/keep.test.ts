import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("keep", function () {
    it("should keep only a specific value", function () {
        const data = [
            { key1: null, key2: 2 },
            { key1: NaN, key2: 3 },
            { key1: undefined, key2: 4 },
            { key1: "", key2: 5 },
            { key1: 11, key2: 22 },
            { key1: "coucou", key2: 22 },
            { key1: new Date("x"), key2: 22 },
        ]

        const sd = new SimpleData({ data }).keep({
            key: "key1",
            value: 11,
        })

        assert.deepEqual(sd.getData(), [{ key1: 11, key2: 22 }])
    })
    it("should keep only specific values", function () {
        const data = [
            { key1: null, key2: 2 },
            { key1: NaN, key2: 3 },
            { key1: undefined, key2: 4 },
            { key1: "", key2: 5 },
            { key1: 11, key2: 22 },
            { key1: "coucou", key2: 22 },
            { key1: new Date("x"), key2: 22 },
        ]

        const sd = new SimpleData({ data }).keep({
            key: "key1",
            value: [11, "coucou"],
        })

        assert.deepEqual(sd.getData(), [
            { key1: 11, key2: 22 },
            { key1: "coucou", key2: 22 },
        ])
    })
})
