import assert from "assert"
import { SimpleDataNode } from "../../../src/index.js"

describe("SimpleDataNode", function () {
    it("should clone and return a SimpleDataNode instance", function () {
        const data = [{ key1: 1, key2: 2 }]
        const simpleData = new SimpleDataNode({ data: data })
        const newSimpleData = simpleData.clone()

        assert(newSimpleData instanceof SimpleDataNode)
    })

    it("should clone and return a deep copy", function () {
        const data = [{ key1: 1, key2: 2 }]
        const simpleData = new SimpleDataNode({ data: data })
        const newSimpleData = simpleData.clone()
        simpleData.removeKey({ key: "key1", overwrite: true })

        assert.deepEqual(simpleData.getData(), [{ key2: 2 }])
        assert.deepEqual(newSimpleData.getData(), [{ key1: 1, key2: 2 }])
    })
})
