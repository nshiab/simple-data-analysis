import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("joinGeo", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB({ spatial: true })
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should do a left spatial join the intersect method", async () => {
        await simpleNodeDB.loadGeoData(
            "prov",
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        await simpleNodeDB.loadGeoData(
            "pol",
            "test/geodata/files/polygons.geojson"
        )
        await simpleNodeDB.joinGeo("prov", "intersect", "pol")
        await simpleNodeDB.selectColumns("prov", ["nameEnglish", "name"])

        const data = await simpleNodeDB.getData("prov")
        assert.deepStrictEqual(data, [
            { nameEnglish: "Quebec", name: "polygonA" },
            { nameEnglish: "Ontario", name: "polygonA" },
            { nameEnglish: "Manitoba", name: "polygonB" },
            { nameEnglish: "Saskatchewan", name: "polygonB" },
            { nameEnglish: "Alberta", name: "polygonB" },
            { nameEnglish: "British Columbia", name: "polygonB" },
            { nameEnglish: "Northwest Territories", name: "polygonB" },
            { nameEnglish: "Nunavut", name: "polygonB" },
            { nameEnglish: "Newfoundland and Labrador", name: null },
            { nameEnglish: "Prince Edward Island", name: null },
            { nameEnglish: "Nova Scotia", name: null },
            { nameEnglish: "New Brunswick", name: null },
            { nameEnglish: "Yukon", name: null },
        ])
    })
    it("should do a left spatial join the intersect method with specific options", async () => {
        await simpleNodeDB.loadGeoData(
            "prov",
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        await simpleNodeDB.renameColumns("prov", { geom: "geomProvince" })
        await simpleNodeDB.loadGeoData(
            "pol",
            "test/geodata/files/polygons.geojson"
        )
        await simpleNodeDB.renameColumns("pol", { geom: "geomPolygon" })

        await simpleNodeDB.joinGeo("prov", "intersect", "pol", {
            columnLeftTable: "geomProvince",
            columnRightTable: "geomPolygon",
            type: "inner",
            outputTable: "joined",
        })
        await simpleNodeDB.selectColumns("joined", ["nameEnglish", "name"])

        const data = await simpleNodeDB.getData("joined")
        assert.deepStrictEqual(data, [
            { nameEnglish: "Quebec", name: "polygonA" },
            { nameEnglish: "Ontario", name: "polygonA" },
            { nameEnglish: "Manitoba", name: "polygonB" },
            { nameEnglish: "Saskatchewan", name: "polygonB" },
            { nameEnglish: "Alberta", name: "polygonB" },
            { nameEnglish: "British Columbia", name: "polygonB" },
            { nameEnglish: "Northwest Territories", name: "polygonB" },
            { nameEnglish: "Nunavut", name: "polygonB" },
        ])
    })
    it("should do a left spatial join the inside method", async () => {
        await simpleNodeDB.loadGeoData(
            "points",
            "test/geodata/files/pointsInside.json"
        )
        await simpleNodeDB.loadGeoData(
            "polygon",
            "test/geodata/files/polygonInside.json"
        )
        await simpleNodeDB.renameColumns("polygon", { name: "polygonName" })
        await simpleNodeDB.joinGeo("points", "inside", "polygon")
        await simpleNodeDB.selectColumns("points", ["name", "polygonName"])

        const data = await simpleNodeDB.getData("points")

        assert.deepStrictEqual(data, [
            { name: "pointC", polygonName: "container" },
            { name: "pointD", polygonName: "container" },
            { name: "pointA", polygonName: null },
            { name: "pointB", polygonName: null },
        ])
    })
})
