import assert from "assert"
import loadDataFromUrlNode from "../../../../src/methods/importing/loadDataFromUrlNode.js"

describe("loadDataFromUrlNode", function () {
    it("should return an array of objects from a csv file", async function () {
        const data = await loadDataFromUrlNode(
            "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/unit/methods/importing/testData/localFileTest.csv"
        )
        assert.deepEqual(data, [
            { patate: 1, poil: 2 },
            { patate: 3, poil: "coucou" },
        ])
    })

    it("should return an array of objects from a tsv file", async function () {
        const data = await loadDataFromUrlNode(
            "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/unit/methods/importing/testData/localFileTest.tsv"
        )
        assert.deepEqual(data, [
            { patate: 1, poil: 2 },
            { patate: 3, poil: "coucou" },
        ])
    })

    it("should return an array of objects from a json file", async function () {
        const data = await loadDataFromUrlNode(
            "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/unit/methods/importing/testData/localFileTest.json"
        )
        assert.deepEqual(data, [
            { patate: 1, poil: 2 },
            { patate: 3, poil: "coucou" },
        ])
    })
})
