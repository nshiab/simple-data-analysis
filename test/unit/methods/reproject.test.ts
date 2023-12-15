import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("reproject", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB({ spatial: true })
        await simpleNodeDB.loadGeoData(
            "geoData",
            "test/geoData/files/CanadianProvincesAndTerritories.geojson"
        )
        await simpleNodeDB.flipCoordinates("geoData", "geom")
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should convert from one projection to another one", async () => {
        await simpleNodeDB.reproject(
            "geoData",
            "geom",
            "EPSG:4326",
            "EPSG:3347"
        )

        // Not sure how to test.
    })
})
