import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("intersection", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB({ spatial: true })
    })
    after(async function () {
        await sdb.done()
    })

    it("should compute the intersection of geometries", async () => {
        await sdb.loadGeoData(
            "prov",
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        await sdb.flipCoordinates("prov", "geom")
        await sdb.renameColumns("prov", { geom: "prov" })

        await sdb.loadGeoData("pol", "test/geodata/files/polygons.geojson")
        await sdb.flipCoordinates("pol", "geom")
        await sdb.area("pol", "geom", "polArea")
        await sdb.round("pol", "polArea")
        await sdb.renameColumns("pol", { geom: "pol" })

        await sdb.crossJoin("prov", "pol", { outputTable: "joined" })
        await sdb.intersection("joined", ["pol", "prov"], "intersec")
        await sdb.area("joined", "intersec", "intersecArea")
        await sdb.round("joined", "intersecArea")
        await sdb.addColumn(
            "joined",
            "intersecPerc",
            "double",
            `ROUND(intersecArea/polArea, 4)`
        )

        await sdb.selectColumns("joined", [
            "nameEnglish",
            "name",
            "intersecPerc",
        ])
        const data = await sdb.getData("joined")

        assert.deepStrictEqual(data, [
            {
                nameEnglish: "Newfoundland and Labrador",
                name: "polygonA",
                intersecPerc: 0,
            },
            {
                nameEnglish: "Prince Edward Island",
                name: "polygonA",
                intersecPerc: 0,
            },
            { nameEnglish: "Nova Scotia", name: "polygonA", intersecPerc: 0 },
            { nameEnglish: "New Brunswick", name: "polygonA", intersecPerc: 0 },
            { nameEnglish: "Quebec", name: "polygonA", intersecPerc: 0.6448 },
            { nameEnglish: "Ontario", name: "polygonA", intersecPerc: 0.332 },
            { nameEnglish: "Manitoba", name: "polygonA", intersecPerc: 0 },
            { nameEnglish: "Saskatchewan", name: "polygonA", intersecPerc: 0 },
            { nameEnglish: "Alberta", name: "polygonA", intersecPerc: 0 },
            {
                nameEnglish: "British Columbia",
                name: "polygonA",
                intersecPerc: 0,
            },
            { nameEnglish: "Yukon", name: "polygonA", intersecPerc: 0 },
            {
                nameEnglish: "Northwest Territories",
                name: "polygonA",
                intersecPerc: 0,
            },
            { nameEnglish: "Nunavut", name: "polygonA", intersecPerc: 0 },
            {
                nameEnglish: "Newfoundland and Labrador",
                name: "polygonB",
                intersecPerc: 0,
            },
            {
                nameEnglish: "Prince Edward Island",
                name: "polygonB",
                intersecPerc: 0,
            },
            { nameEnglish: "Nova Scotia", name: "polygonB", intersecPerc: 0 },
            { nameEnglish: "New Brunswick", name: "polygonB", intersecPerc: 0 },
            { nameEnglish: "Quebec", name: "polygonB", intersecPerc: 0 },
            { nameEnglish: "Ontario", name: "polygonB", intersecPerc: 0 },
            { nameEnglish: "Manitoba", name: "polygonB", intersecPerc: 0.143 },
            {
                nameEnglish: "Saskatchewan",
                name: "polygonB",
                intersecPerc: 0.294,
            },
            { nameEnglish: "Alberta", name: "polygonB", intersecPerc: 0.2992 },
            {
                nameEnglish: "British Columbia",
                name: "polygonB",
                intersecPerc: 0.0404,
            },
            { nameEnglish: "Yukon", name: "polygonB", intersecPerc: 0 },
            {
                nameEnglish: "Northwest Territories",
                name: "polygonB",
                intersecPerc: 0.1796,
            },
            { nameEnglish: "Nunavut", name: "polygonB", intersecPerc: 0.0366 },
        ])
    })
})
