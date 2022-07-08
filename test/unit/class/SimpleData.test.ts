import assert from "assert"
import { SimpleData } from "../../../src/index.js"

describe("SimpleData", function () {
    it("should instantiate empty", function () {
        const simpleData = new SimpleData()
        assert.deepStrictEqual([], simpleData.getData())
    })

    it("should instantiate", function () {
        const data = [{ patate: 1, poil: 2 }]
        const simpleData = new SimpleData({ data: data })
        assert.deepStrictEqual(data, simpleData.getData())
    })

    it("should instantiate with specific starting and ending items", function () {
        const data = [
            { patate: 1, poil: 2 },
            { patate: 2, poil: 3 },
            { patate: 4, poil: 5 },
            { patate: 6, poil: 7 },
        ]
        const simpleData = new SimpleData({
            data: data,
            firstItem: 1,
            lastItem: 2,
        })
        assert.deepStrictEqual(
            [
                { patate: 2, poil: 3 },
                { patate: 4, poil: 5 },
            ],
            simpleData.getData()
        )
    })

    it("should modify public class attributes", function () {
        const data = [{ patate: 1, poil: 2 }]
        const simpleData = new SimpleData({ data: data })
        simpleData.verbose = true
        simpleData.logParameters = true
        simpleData.nbTableItemsToLog = 11
        assert.equal(simpleData.verbose, true)
        assert.equal(simpleData.logParameters, true)
        assert.equal(simpleData.nbTableItemsToLog, 11)
    })

    it("should clone", function () {
        const data = [{ patate: 1, poil: 2 }]
        const simpleData = new SimpleData({ data: data })
        const newSimpleData = simpleData.clone()
        assert.deepEqual(data, newSimpleData.getData())
    })

    it("should clone and return a SimpleData instance", function () {
        const data = [{ patate: 1, poil: 2 }]
        const simpleData = new SimpleData({ data: data })
        const newSimpleData = simpleData.clone()

        assert(newSimpleData instanceof SimpleData)
    })
})
