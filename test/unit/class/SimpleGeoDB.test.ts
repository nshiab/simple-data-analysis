import assert from "assert"
import SimpleGeoDB from "../../../src/class/SimpleGeoDB.js"

describe("SimpleGeoDB", () => {
    const simpleGeoDB = new SimpleGeoDB()
    it("should instantiate a SimpleGeoDB class", () => {
        assert.deepStrictEqual(simpleGeoDB instanceof SimpleGeoDB, true)
    })

    // For the rest, testing in https://observablehq.com/@nshiab/testing-simple-data-analysis-v2-0-0
})
