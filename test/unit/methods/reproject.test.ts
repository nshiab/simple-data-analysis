import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("reproject", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB({ spatial: true })
        await simpleNodeDB.loadGeoData(
            "geodata",
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        // Hmmmm... Why?
        await simpleNodeDB.flipCoordinates("geodata", "geom")
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should convert from one projection to another one", async () => {
        await simpleNodeDB.reproject(
            "geodata",
            "geom",
            "EPSG:4326",
            "EPSG:3347"
        )

        // Not sure how to test.
    })
})
