import assert from "assert"
import { SimpleDataGeo } from "../../../src/index.js"
import geoJson from "../../../data/canadian-census-divisions-geojson-small.json" assert { type: "json" }
import topoJson from "../../../data/canadian-census-divisions-topojson-small.json" assert { type: "json" }
import { FeatureCollection } from "@turf/turf"
import { Topology } from "topojson-specification"

const geoData = [
    {
        geometry: {
            type: "Polygon",
            coordinates: [
                [
                    [-54.078, 47.881],
                    [-53.898, 47.576],
                    [-54.195, 46.885],
                    [-53.782, 47.032],
                    [-53.524, 46.618],
                    [-53.091, 46.646],
                    [-52.832, 47.278],
                    [-53.552, 47.527],
                    [-53.81, 47.907],
                    [-53.974, 47.959],
                    [-54.078, 47.881],
                ],
            ],
        },
        CDUID: "1001",
        DGUID: "2021A00031001",
        CDNAME: "Division No.  1",
        CDTYPE: "CDR",
        LANDAREA: 9104.5799,
        PRUID: "10",
    },
    {
        geometry: {
            type: "Polygon",
            coordinates: [
                [
                    [-53.974, 47.959],
                    [-54.43, 48.202],
                    [-54.747, 48.11],
                    [-55.086, 47.59],
                    [-54.587, 47.349],
                    [-54.078, 47.881],
                    [-53.974, 47.959],
                ],
            ],
        },
        CDUID: "1002",
        DGUID: "2021A00031002",
        CDNAME: "Division No.  2",
        CDTYPE: "CDR",
        LANDAREA: 5915.5695,
        PRUID: "10",
    },
    {
        geometry: {
            type: "Polygon",
            coordinates: [
                [
                    [-54.747, 48.11],
                    [-55.279, 48.269],
                    [-55.895, 48.247],
                    [-56.089, 48.537],
                    [-56.522, 48.526],
                    [-56.989, 48.295],
                    [-57.247, 48.474],
                    [-57.922, 48.224],
                    [-58.516, 47.919],
                    [-59.309, 47.661],
                    [-59.166, 47.565],
                    [-58.108, 47.699],
                    [-56.804, 47.535],
                    [-56.047, 47.701],
                    [-55.812, 47.456],
                    [-55.086, 47.59],
                    [-54.747, 48.11],
                ],
            ],
        },
        CDUID: "1003",
        DGUID: "2021A00031003",
        CDNAME: "Division No.  3",
        CDTYPE: "CDR",
        LANDAREA: 19272.1069,
        PRUID: "10",
    },
]

const fromTopoData = [
    {
        geometry: {
            type: "Polygon",
            coordinates: [
                [
                    [-54.078, 47.881],
                    [-53.974, 47.959],
                    [-53.81, 47.907000000000004],
                    [-53.552, 47.527],
                    [-52.832, 47.278],
                    [-53.091, 46.646],
                    [-53.524, 46.618],
                    [-53.782, 47.032000000000004],
                    [-54.195, 46.885000000000005],
                    [-53.897999999999996, 47.576],
                    [-54.078, 47.881],
                ],
            ],
        },
        CDUID: "1001",
        DGUID: "2021A00031001",
        CDNAME: "Division No.  1",
        CDTYPE: "CDR",
        LANDAREA: 9104.5799,
        PRUID: "10",
    },
    {
        geometry: {
            type: "Polygon",
            coordinates: [
                [
                    [-53.974, 47.959],
                    [-54.078, 47.881],
                    [-54.587, 47.349000000000004],
                    [-55.086, 47.59],
                    [-54.747, 48.11],
                    [-54.43, 48.202],
                    [-53.974, 47.959],
                ],
            ],
        },
        CDUID: "1002",
        DGUID: "2021A00031002",
        CDNAME: "Division No.  2",
        CDTYPE: "CDR",
        LANDAREA: 5915.5695,
        PRUID: "10",
    },
    {
        geometry: {
            type: "Polygon",
            coordinates: [
                [
                    [-54.747, 48.11],
                    [-55.086, 47.59],
                    [-55.812, 47.456],
                    [-56.047, 47.701],
                    [-56.804, 47.535000000000004],
                    [-58.108, 47.699],
                    [-59.166, 47.565],
                    [-59.309, 47.661],
                    [-58.516, 47.919],
                    [-57.922, 48.224],
                    [-57.247, 48.474],
                    [-56.989, 48.295],
                    [-56.522, 48.525999999999996],
                    [-56.089, 48.537],
                    [-55.894999999999996, 48.247],
                    [-55.278999999999996, 48.269],
                    [-54.747, 48.11],
                ],
            ],
        },
        CDUID: "1003",
        DGUID: "2021A00031003",
        CDNAME: "Division No.  3",
        CDTYPE: "CDR",
        LANDAREA: 19272.1069,
        PRUID: "10",
    },
]

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
        assert.deepStrictEqual(geoData, simpleDataGeo.getData())
    })
    it("should instanciate with geoData from topoJson", function () {
        const simpleDataGeo = new SimpleDataGeo({
            topoData: topoJson as unknown as Topology,
            topoKey: "canadian-census-divisions-topojson-small",
        })
        assert.deepStrictEqual(fromTopoData, simpleDataGeo.getData())
    })
})
