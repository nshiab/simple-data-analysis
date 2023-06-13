import assert from "assert"
import { SimpleData } from "../../../src/index.js"

describe("SimpleData", function () {
    it("should instantiate empty", function () {
        const simpleData = new SimpleData()
        assert.deepStrictEqual([], simpleData.getData())
    })

    it("should instantiate", function () {
        const data = [{ key1: 1, key2: 2 }]
        const simpleData = new SimpleData({ data: data })
        assert.deepStrictEqual(data, simpleData.getData())
    })

    it("should instantiate with specific starting and ending items", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 2, key2: 3 },
            { key1: 4, key2: 5 },
            { key1: 6, key2: 7 },
        ]
        const simpleData = new SimpleData({
            data: data,
            firstItem: 1,
            lastItem: 2,
        })
        assert.deepStrictEqual(
            [
                { key1: 2, key2: 3 },
                { key1: 4, key2: 5 },
            ],
            simpleData.getData()
        )
    })

    it("should modify public class attributes", function () {
        const data = [{ key1: 1, key2: 2 }]
        const simpleData = new SimpleData({ data: data })
        simpleData.verbose = true
        simpleData.nbTableItemsToLog = 11
        assert.deepStrictEqual(simpleData.verbose, true)
        assert.deepStrictEqual(simpleData.nbTableItemsToLog, 11)
    })

    it("should clone", function () {
        const data = [{ key1: 1, key2: 2 }]
        const simpleData = new SimpleData({ data: data })
        const newSimpleData = simpleData.clone()
        assert.deepStrictEqual(data, newSimpleData.getData())
    })

    it("should clone and return a SimpleData instance", function () {
        const data = [{ key1: 1, key2: 2 }]
        const simpleData = new SimpleData({ data: data })
        const newSimpleData = simpleData.clone()

        assert(newSimpleData instanceof SimpleData)
    })

    it("should clone, return a SimpleData instance and run a method", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 3, key2: 4 },
            { key1: 5, key2: 6 },
        ]
        const simpleData = new SimpleData({ data: data })
        const newSimpleData = simpleData.clone().filterValues({
            key: "key1",
            valueComparator: (val) => (val as number) < 5,
        })

        assert.deepStrictEqual(simpleData.getData(), [
            { key1: 1, key2: 2 },
            { key1: 3, key2: 4 },
            { key1: 5, key2: 6 },
        ])

        assert.deepStrictEqual(newSimpleData.getData(), [
            { key1: 1, key2: 2 },
            { key1: 3, key2: 4 },
        ])
    })

    it("should convert a { [key: string]: SimpleDataValue[] } to SimpleDataItem[]", function () {
        const data = {
            key1: [1, 2, 3],
            key2: ["a", "b", "c"],
        }

        const simpleData = new SimpleData({ data: data, dataAsArrays: true })

        assert.deepStrictEqual(simpleData.getData(), [
            { key1: 1, key2: "a" },
            { key1: 2, key2: "b" },
            { key1: 3, key2: "c" },
        ])
    })

    it("should empty the data in the SimpleData instance", function () {
        const data = [
            { key1: 1, key2: "a" },
            { key1: 2, key2: "b" },
            { key1: 3, key2: "c" },
        ]

        const simpleData = new SimpleData({ data: data }).empty()

        assert.deepStrictEqual(simpleData.getData(), [])
    })
})
