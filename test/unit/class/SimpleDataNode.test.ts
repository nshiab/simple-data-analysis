import assert from "assert"
import { SimpleDataNode } from "../../../src/index.js"

describe("SimpleDataNode", function () {
    it("should clone and return a SimpleDataNode instance", function () {
        const data = [{ patate: 1, poil: 2 }]
        const simpleData = new SimpleDataNode({ data: data })
        const newSimpleData = simpleData.clone()

        assert(newSimpleData instanceof SimpleDataNode)
    })

    it("should clone and return a deep copy", function () {
        const data = [{ patate: 1, poil: 2 }]
        const simpleData = new SimpleDataNode({ data: data })
        const newSimpleData = simpleData.clone()
        simpleData.removeKey({ key: "patate", overwrite: true })

        assert.deepEqual(simpleData.getData(), [{ poil: 2 }])
        assert.deepEqual(newSimpleData.getData(), [{ patate: 1, poil: 2 }])
    })
})
