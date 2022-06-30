import { JSDOM } from "jsdom"
const jsdom = new JSDOM("")
global.document = jsdom.window.document
import assert from "assert"
import sinon from "sinon"

import { SimpleData } from "../../../src/index.js"

describe("SimpleData", function () {
    it("should instantiate", function () {
        const data = [{ patate: 1, poil: 2 }]
        const simpleData = new SimpleData({ data: data })
        assert.equal(data, simpleData.getData())
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

    // it("should check values", function () {
    //     const data = [
    //         { patate: "1", poil: 2 },
    //         { patate: "11", poil: 22 },
    //     ]
    //     const simpleData = new SimpleData({ data: data })
    //     simpleData.checkValues({ overwrite: true })
    //     assert.deepEqual(simpleData.getData(), [
    //         {
    //             count: 2,
    //             key: "patate",
    //             number: 0,
    //             string: "2 | 100%",
    //             uniques: "2 | 100%",
    //         },
    //         {
    //             count: 2,
    //             key: "poil",
    //             number: "2 | 100%",
    //             string: 0,
    //             uniques: "2 | 100%",
    //         },
    //     ])
    // })

    // it("should summarize", function () {
    //     const data = [
    //         { patate: "1", poil: 2 },
    //         { patate: "11", poil: 22 },
    //     ]
    //     const simpleData = new SimpleData({ data: data })
    //     simpleData.summarize({ overwrite: true })
    //     assert.deepEqual(simpleData.getData(), [
    //         {
    //             value: "poil",
    //             count: 2,
    //             min: 2,
    //             max: 22,
    //             sum: 24,
    //             mean: 12,
    //             median: 12,
    //             deviation: 14.1,
    //         },
    //     ])
    // })

    // it("should remove key", function () {
    //     const data = [
    //         { patate: 1, poil: 2 },
    //         { patate: 11, poil: 22 },
    //     ]
    //     const simpleData = new SimpleData({ data: data })
    //     simpleData.removeKey({ key: "patate" })
    //     assert.deepEqual(simpleData.getData(), [{ poil: 2 }, { poil: 22 }])
    // })

    // it("should add key", function () {
    //     const data = [{ patate: 1 }, { patate: 11 }]
    //     const simpleData = new SimpleData({ data: data })
    //     simpleData.addKey({
    //         key: "poil",
    //         itemGenerator: (item) => (item.patate as number) * 2,
    //     })
    //     assert.deepEqual(simpleData.getData(), [
    //         { patate: 1, poil: 2 },
    //         { patate: 11, poil: 22 },
    //     ])
    // })

    // it("should select keys", function () {
    //     const data = [
    //         { patate: 1, poil: 2, peanut: 3 },
    //         { patate: 11, poil: 22, peanut: 33 },
    //     ]
    //     const simpleData = new SimpleData({ data: data })
    //     simpleData.selectKeys({ keys: ["poil", "peanut"] })
    //     assert.deepEqual(simpleData.getData(), [
    //         { poil: 2, peanut: 3 },
    //         { poil: 22, peanut: 33 },
    //     ])
    // })

    // it("should modify items", function () {
    //     const data = [
    //         { patate: 1, poil: 2 },
    //         { patate: 11, poil: 22 },
    //     ]
    //     const simpleData = new SimpleData({ data: data })
    //     simpleData.modifyItems({
    //         key: "patate",
    //         itemGenerator: (item) =>
    //             (item.patate as number) + (item.poil as number),
    //     })
    //     assert.deepEqual(simpleData.getData(), [
    //         { poil: 2, patate: 3 },
    //         { poil: 22, patate: 33 },
    //     ])
    // })

    // it("should filter values", function () {
    //     const data = [
    //         { patate: 1, poil: 2 },
    //         { patate: 11, poil: 22 },
    //     ]
    //     const simpleData = new SimpleData({ data: data })
    //     simpleData.filterValues({
    //         key: "patate",
    //         valueComparator: (val) => (val as number) >= 10,
    //     })
    //     assert.deepEqual(simpleData.getData(), [{ patate: 11, poil: 22 }])
    // })

    // it("should filter items", function () {
    //     const data = [
    //         { patate: 1, poil: 2 },
    //         { patate: 11, poil: 22 },
    //         { patate: 111, poil: 222 },
    //     ]
    //     const simpleData = new SimpleData({ data: data })
    //     simpleData.filterItems({
    //         itemComparator: (val) =>
    //             (val.patate as number) >= 10 && (val.poil as number) >= 200,
    //     })
    //     assert.deepEqual(simpleData.getData(), [{ patate: 111, poil: 222 }])
    // })

    // it("should add bins", function () {
    //     const data = [
    //         { patate: 1, poil: 2 },
    //         { patate: 11, poil: 22 },
    //         { patate: 111, poil: 222 },
    //         { patate: 1111, poil: 2222 },
    //     ]
    //     const simpleData = new SimpleData({ data: data })
    //     simpleData.addBins({ key: "patate", newKey: "bin", nbBins: 2 })
    //     assert.deepEqual(simpleData.getData(), [
    //         { patate: 1, poil: 2, bin: 1 },
    //         { patate: 11, poil: 22, bin: 1 },
    //         { patate: 111, poil: 222, bin: 1 },
    //         { patate: 1111, poil: 2222, bin: 2 },
    //     ])
    // })

    // it("should add items", function () {
    //     const data = [
    //         { patate: 1, poil: 2 },
    //         { patate: 11, poil: 22 },
    //     ]
    //     const dataToBeAdded = [{ patate: 1, poil: 222 }]
    //     const simpleData = new SimpleData({ data: data })
    //     simpleData.addItems({ dataToBeAdded })
    //     assert.deepEqual(simpleData.getData(), [
    //         { patate: 1, poil: 2 },
    //         { patate: 11, poil: 22 },
    //         { patate: 1, poil: 222 },
    //     ])
    // })

    // it("should add items", function () {
    //     const data = [
    //         { patate: 1, poil: 2 },
    //         { patate: 11, poil: 22 },
    //     ]
    //     const dataToBeAdded = [{ patate: 1, poil: 222 }]
    //     const simpleData = new SimpleData({ data: data })
    //     simpleData.addItems({ dataToBeAdded })
    //     assert.deepEqual(simpleData.getData(), [
    //         { patate: 1, poil: 2 },
    //         { patate: 11, poil: 22 },
    //         { patate: 1, poil: 222 },
    //     ])
    // })

    // it("should merge items", function () {
    //     const data = [
    //         { patate: "1", poil: 2 },
    //         { patate: "11", poil: 22 },
    //     ]
    //     const dataToBeMerged = [
    //         { patate: "1", peanut: 3 },
    //         { patate: "11", peanut: 33 },
    //     ]
    //     const simpleData = new SimpleData({ data: data })
    //     simpleData.mergeItems({ dataToBeMerged, commonKey: "patate" })
    //     // TODO: is this the expected behaviour with strings?
    //     assert.deepEqual(simpleData.getData(), [
    //         { patate: "1", poil: 2, peanut: 3 },
    //         { patate: "11", poil: 22, peanut: 33 },
    //     ])
    // })

    // it("should create a chart and return a string", function () {
    //     const data = [
    //         { patate: "1", poil: 2 },
    //         { patate: "11", poil: 22 },
    //     ]
    //     const chart = new SimpleData({ data: data }).getChart({
    //         type: "dot",
    //         x: "patate",
    //         y: "poil",
    //         color: "patate",
    //     })
    //     // TODO: is this the expected behaviour with strings?
    //     assert.deepEqual(typeof chart, "string")
    // })

    // it("should log data", function () {
    //     const data = [
    //         { patate: 1, poil: 2 },
    //         { patate: 11, poil: 22 },
    //     ]
    //     const dataToBeAdded = [{ patate: 1, poil: 222 }]
    //     const simpleData = new SimpleData({
    //         data: data,
    //         verbose: true,
    //         nbTableItemsToLog: 3,
    //     })
    //     // Spy the console.table function
    //     console.log("! Spy the console.table function !")
    //     const spy = sinon.spy(console, "table")
    //     // Call method
    //     simpleData.addItems({
    //         dataToBeAdded,
    //         overwrite: false,
    //     })
    //     // assert that it was called with the correct value
    //     spy.withArgs(
    //         sinon.match.same([
    //             { patate: 1, poil: 2 },
    //             { patate: 11, poil: 22 },
    //             { patate: 1, poil: 222 },
    //         ])
    //     )
    //     // assert that data is not overridden
    //     assert.deepEqual(simpleData.getData(), [
    //         { patate: 1, poil: 2 },
    //         { patate: 11, poil: 22 },
    //     ])
    //     spy.restore()
    // })

    // it("should remove duplicates", function () {
    //     const data = [
    //         { patate: 1, poil: 2 },
    //         { patate: 11, poil: 22 },
    //         { patate: 11, poil: 22 },
    //     ]
    //     const simpleData = new SimpleData({ data: data })
    //     const newSimpleData = simpleData.removeDuplicates()
    //     assert.deepEqual(newSimpleData.getData(), [
    //         { patate: 1, poil: 2 },
    //         { patate: 11, poil: 22 },
    //     ])
    // })
})
