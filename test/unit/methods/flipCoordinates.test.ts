import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("flipCoordinates", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB({ spatial: true })
        await simpleNodeDB.loadGeoData(
            "geoData",
            "test/geoData/files/CanadianProvincesAndTerritories.geojson"
        )
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should flip the coordinates", async () => {
        await simpleNodeDB.flipCoordinates("geoData", "geom")

        // Not sure how to test
    })
})
