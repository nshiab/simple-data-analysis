import assert from "assert"
import addFileNameAsValue from "../../../src/helpers/addFileNameAsValue.js"

describe("addFileNameAsValue", function () {
    it("should return add a key file with the name of the file", function () {
        const data = addFileNameAsValue("file.csv", [
            { key1: "coucou", key: 3 },
            { key1: "hi", key: 10 },
        ])

        assert.deepStrictEqual(data, [
            { key1: "coucou", key: 3, file: "file.csv" },
            { key1: "hi", key: 10, file: "file.csv" },
        ])
    })
})
