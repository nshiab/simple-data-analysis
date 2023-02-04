import assert from "assert"
import { SimpleDataGeo } from "../../../../src/index.js"
import geoJson from "../../../../data/canadian-census-divisions-geojson-small.json" assert { type: "json" }
import addCentroid from "../../../../src/methods/geospatial/addCentroid.js"
import { FeatureCollection } from "@turf/turf"

describe("addCentroid", function () {
    it("should add the centroid of features", function () {
        const data = new SimpleDataGeo({
            geoData: geoJson as FeatureCollection,
        }).getData()
        const newData = addCentroid(data, "feature")
    })
})
