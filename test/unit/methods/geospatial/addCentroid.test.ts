import assert from "assert"
import { SimpleDataGeo } from "../../../../src/index.js"
import geoJson from "../../../data/geo/canadian-census-divisions-geojson.json" assert { type: "json" }
import addCentroidResults from "../../../data/geo/testResults/addCentroid.json" assert { type: "json" }
import { FeatureCollection } from "@turf/turf"

describe("addCentroid", function () {
    it("should add the centroid of features", function () {
        const sd = new SimpleDataGeo({
            geoData: geoJson as FeatureCollection,
        }).addCentroid()

        assert.deepStrictEqual(sd.getData(), addCentroidResults.noArguments)
    })
    it("should add the centroid of features with a new key", function () {
        const sd = new SimpleDataGeo({
            geoData: geoJson as FeatureCollection,
        }).addCentroid({ newKey: "centr" })

        assert.deepStrictEqual(sd.getData(), addCentroidResults.newKey)
    })
})
