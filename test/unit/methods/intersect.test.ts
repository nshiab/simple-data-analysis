import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("intersect", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB({ spatial: true })
    })
    after(async function () {
        await sdb.done()
    })

    it("should check if geometries intersect", async () => {
        await sdb.loadGeoData(
            "prov",
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        await sdb.renameColumns("prov", { geom: "prov" })

        await sdb.loadGeoData("pol", "test/geodata/files/polygons.geojson")
        await sdb.renameColumns("pol", { geom: "pol" })

        await sdb.crossJoin("prov", "pol", { outputTable: "joined" })
        await sdb.intersect("joined", ["pol", "prov"], "intersec")

        await sdb.selectColumns("joined", ["nameEnglish", "name", "intersec"])

        const data = await sdb.getData("joined")

        assert.deepStrictEqual(data, [
            {
                nameEnglish: "Newfoundland and Labrador",
                name: "polygonA",
                intersec: false,
            },
            {
                nameEnglish: "Prince Edward Island",
                name: "polygonA",
                intersec: false,
            },
            { nameEnglish: "Nova Scotia", name: "polygonA", intersec: false },
            { nameEnglish: "New Brunswick", name: "polygonA", intersec: false },
            { nameEnglish: "Quebec", name: "polygonA", intersec: true },
            { nameEnglish: "Ontario", name: "polygonA", intersec: true },
            { nameEnglish: "Manitoba", name: "polygonA", intersec: false },
            { nameEnglish: "Saskatchewan", name: "polygonA", intersec: false },
            { nameEnglish: "Alberta", name: "polygonA", intersec: false },
            {
                nameEnglish: "British Columbia",
                name: "polygonA",
                intersec: false,
            },
            { nameEnglish: "Yukon", name: "polygonA", intersec: false },
            {
                nameEnglish: "Northwest Territories",
                name: "polygonA",
                intersec: false,
            },
            { nameEnglish: "Nunavut", name: "polygonA", intersec: false },
            {
                nameEnglish: "Newfoundland and Labrador",
                name: "polygonB",
                intersec: false,
            },
            {
                nameEnglish: "Prince Edward Island",
                name: "polygonB",
                intersec: false,
            },
            { nameEnglish: "Nova Scotia", name: "polygonB", intersec: false },
            { nameEnglish: "New Brunswick", name: "polygonB", intersec: false },
            { nameEnglish: "Quebec", name: "polygonB", intersec: false },
            { nameEnglish: "Ontario", name: "polygonB", intersec: false },
            { nameEnglish: "Manitoba", name: "polygonB", intersec: true },
            { nameEnglish: "Saskatchewan", name: "polygonB", intersec: true },
            { nameEnglish: "Alberta", name: "polygonB", intersec: true },
            {
                nameEnglish: "British Columbia",
                name: "polygonB",
                intersec: true,
            },
            { nameEnglish: "Yukon", name: "polygonB", intersec: false },
            {
                nameEnglish: "Northwest Territories",
                name: "polygonB",
                intersec: true,
            },
            { nameEnglish: "Nunavut", name: "polygonB", intersec: true },
        ])
    })
    it("should check if geometries intersect and the returned booleans could be used to filter", async () => {
        await sdb.loadGeoData(
            "prov",
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        await sdb.renameColumns("prov", { geom: "prov" })

        await sdb.loadGeoData("pol", "test/geodata/files/polygons.geojson")
        await sdb.renameColumns("pol", { geom: "pol" })

        await sdb.crossJoin("prov", "pol", { outputTable: "joined" })
        await sdb.intersect("joined", ["pol", "prov"], "intersec")

        await sdb.selectColumns("joined", ["nameEnglish", "name", "intersec"])

        await sdb.filter("joined", "intersec = TRUE")

        const data = await sdb.getData("joined")

        assert.deepStrictEqual(data, [
            { nameEnglish: "Quebec", name: "polygonA", intersec: true },
            { nameEnglish: "Ontario", name: "polygonA", intersec: true },
            { nameEnglish: "Manitoba", name: "polygonB", intersec: true },
            { nameEnglish: "Saskatchewan", name: "polygonB", intersec: true },
            { nameEnglish: "Alberta", name: "polygonB", intersec: true },
            {
                nameEnglish: "British Columbia",
                name: "polygonB",
                intersec: true,
            },
            {
                nameEnglish: "Northwest Territories",
                name: "polygonB",
                intersec: true,
            },
            { nameEnglish: "Nunavut", name: "polygonB", intersec: true },
        ])
    })
})
