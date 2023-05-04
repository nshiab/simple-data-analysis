import assert from "assert"
import { SimpleDataNode } from "../../../src/index.js"

describe("SimpleDataNode", function () {
    it("should clone and return a SimpleDataNode instance", function () {
        const data = [{ key1: 1, key2: 2 }]
        const simpleData = new SimpleDataNode({ data: data })
        const newSimpleData = simpleData.clone()

        assert(newSimpleData instanceof SimpleDataNode)
    })

    it("should clone and return a deep copy of the data", function () {
        const data = [{ key1: 1, key2: 2 }]
        const simpleData = new SimpleDataNode({ data: data })
        const newSimpleData = simpleData.clone()
        simpleData.removeKey({ key: "key1" })

        assert.deepStrictEqual(simpleData.getData(), [{ key2: 2 }])
        assert.deepStrictEqual(newSimpleData.getData(), [{ key1: 1, key2: 2 }])
    })

    it("should clone and run a method", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 3, key2: 4 },
            { key1: 5, key2: 6 },
        ]
        const simpleData = new SimpleDataNode({ data: data })
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
})
