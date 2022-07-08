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
            { patate: 8, poil: 10 },
            { patate: "brioche", poil: "croissant" },
        ])
    })

    it("should return an array of objects from a csv file with specific items included", function () {
        const data = loadDataFromLocalFile(
            "./test/unit/methods/importing/testData/localFileTest.csv",
            1,
            2
        )
        assert.deepEqual(data, [
            { patate: 3, poil: "coucou" },
            { patate: 8, poil: 10 },
        ])
    })

    it("should return an array of objects from a tsv file", function () {
        const data = loadDataFromLocalFile(
            "./test/unit/methods/importing/testData/localFileTest.tsv"
        )
        assert.deepEqual(data, [
            { patate: 1, poil: 2 },
            { patate: 3, poil: "coucou" },
            { patate: 8, poil: 10 },
            { patate: "brioche", poil: "croissant" },
        ])
    })

    it("should return an array of objects from a tsv file with specific items included", function () {
        const data = loadDataFromLocalFile(
            "./test/unit/methods/importing/testData/localFileTest.tsv",
            1,
            2
        )
        assert.deepEqual(data, [
            { patate: 3, poil: "coucou" },
            { patate: 8, poil: 10 },
        ])
    })

    it("should return an array of objects from a json file", function () {
        const data = loadDataFromLocalFile(
            "./test/unit/methods/importing/testData/localFileTest.json"
        )
        assert.deepEqual(data, [
            { patate: 1, poil: 2 },
            { patate: 3, poil: "coucou" },
            { patate: 8, poil: 10 },
            { patate: "brioche", poil: "croissant" },
        ])
    })

    it("should return an array of objects from a json file with specific items included", function () {
        const data = loadDataFromLocalFile(
            "./test/unit/methods/importing/testData/localFileTest.json",
            1,
            2
        )
        assert.deepEqual(data, [
            { patate: 3, poil: "coucou" },
            { patate: 8, poil: 10 },
        ])
    })
})
