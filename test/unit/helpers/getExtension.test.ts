import assert from "assert"
import getExtension from "../../../src/helpers/getExtension.js"

describe("getExtension", function () {
    it("should return the extension when csv", function () {
        const extension = getExtension("coucou/key2/pat.a.te.csv")
        assert.deepStrictEqual(extension, "csv")
    })
    it("should return the extension when csv is compressed", function () {
        const extension = getExtension("coucou/key2/pat.a.te.csv.gz")
        assert.deepStrictEqual(extension, "csv")
    })
    it("should return the extension when json", function () {
        const extension = getExtension("coucou/key2/pat.a.te.json")
        assert.deepStrictEqual(extension, "json")
    })
    it("should return the extension when json is compressed", function () {
        const extension = getExtension("coucou/key2/pat.a.te.json.gz")
        assert.deepStrictEqual(extension, "json")
    })
    it("should return the extension when parquet", function () {
        const extension = getExtension("coucou/key2/pat.a.te.parquet")
        assert.deepStrictEqual(extension, "parquet")
    })
})
