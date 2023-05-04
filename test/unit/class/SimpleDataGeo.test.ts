import assert from "assert"
import { SimpleDataGeo } from "../../../src/index.js"
import geoJson from "../../data/geo/canadian-census-divisions-geojson.json" assert { type: "json" }
import topoJson from "../../data/geo/canadian-census-divisions-topojson.json" assert { type: "json" }
import geoDataTestResult from "../../data/geo/geoDataTestResult.json" assert { type: "json" }
import topoDataTestResult from "../../data/geo/topoDataTestResult.json" assert { type: "json" }
import { FeatureCollection } from "@turf/turf"
import { Topology } from "topojson-specification"

describe("SimpleDataGeo", function () {
    it("should instanciate empty", function () {
        const simpleDataGeo = new SimpleDataGeo()
        assert.deepStrictEqual([], simpleDataGeo.getData())
    })
    it("should instanciate with data", function () {
        const data = [{ key1: 1, key2: 2 }]
        const simpleDataGeo = new SimpleDataGeo({ data: data })
        assert.deepStrictEqual(data, simpleDataGeo.getData())
    })
    it("should instanciate with geoData from geoJson", function () {
        const simpleDataGeo = new SimpleDataGeo({
            geoData: geoJson as FeatureCollection,
        })
        assert.deepStrictEqual(geoDataTestResult, simpleDataGeo.getData())
    })
    it("should instanciate with geoData from topoJson", function () {
        const simpleDataGeo = new SimpleDataGeo({
            topoData: topoJson as unknown as Topology,
        })

        assert.deepStrictEqual(topoDataTestResult, simpleDataGeo.getData())
    })
})
