import { existsSync, mkdirSync, readFileSync } from "fs"
import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("writeData", () => {
    const output = "./test/output/"

    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        if (!existsSync(output)) {
            mkdirSync(output)
        }
        simpleNodeDB = new SimpleNodeDB({ spatial: true })
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should write geojson file", async () => {
        const originalFile = "test/geodata/files/polygons.geojson"

        await simpleNodeDB.loadGeoData("data", originalFile)
        await simpleNodeDB.writeGeoData("data", `${output}data.geojson`)

        const originalData = JSON.parse(readFileSync(originalFile, "utf-8"))
        originalData.name = "data"
        const writtenData = JSON.parse(
            readFileSync(`${output}data.geojson`, "utf-8")
        )

        assert.deepStrictEqual(writtenData, originalData)
    })
})
