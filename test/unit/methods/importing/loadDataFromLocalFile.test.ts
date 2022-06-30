import assert from "assert"
import loadDataFromLocalFile from "../../../../src/methods/importing/loadDataFromLocalFile.js"

describe("loadDataFromLocalFile", function () {
    it("should return an array of objects", function () {
        const data = loadDataFromLocalFile(
            "./test/unit/methods/importing/testData/localFileTest.csv"
        )
        assert.deepEqual(data, [
            { patate: 1, poil: 2 },
            { patate: 3, poil: "coucou" },
        ])
    })
})
