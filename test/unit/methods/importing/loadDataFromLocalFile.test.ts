import assert from "assert"
import loadDataFromLocalFile from "../../../../src/methods/importing/loadDataFromLocalFile.js"

describe("loadDataFromLocalFile", function () {
    it("should return an array of objects from a csv file", function () {
        const data = loadDataFromLocalFile(
            "./test/unit/methods/importing/testData/localFileTest.csv"
        )
        assert.deepEqual(data, [
            { patate: 1, poil: 2 },
            { patate: 3, poil: "coucou" },
        ])
    })

    it("should return an array of objects from a tsv file", function () {
        const data = loadDataFromLocalFile(
            "./test/unit/methods/importing/testData/localFileTest.tsv"
        )
        assert.deepEqual(data, [
            { patate: 1, poil: 2 },
            { patate: 3, poil: "coucou" },
        ])
    })

    it("should return an array of objects from a json file", function () {
        const data = loadDataFromLocalFile(
            "./test/unit/methods/importing/testData/localFileTest.json"
        )
        assert.deepEqual(data, [
            { patate: 1, poil: 2 },
            { patate: 3, poil: "coucou" },
        ])
    })
})
