import assert from "assert"
import getExtension from "../../../src/helpers/getExtension.js"

describe("getExtension", function () {
    it("should return the extension", function () {
        const extension = getExtension("coucou/poil/pat.a.te.xyz")
        assert.deepEqual(extension, "xyz")
    })
})
