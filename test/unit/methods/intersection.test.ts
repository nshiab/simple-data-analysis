import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("intersection", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB({ spatial: true })
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should compute the intersection of geometries", async () => {
        await simpleNodeDB.loadGeoData(
            "prov",
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        await simpleNodeDB.flipCoordinates("prov", "geom")
        await simpleNodeDB.renameColumns("prov", { geom: "prov" })

        await simpleNodeDB.loadGeoData(
            "pol",
            "test/geodata/files/polygons.geojson"
        )
        await simpleNodeDB.flipCoordinates("pol", "geom")
        await simpleNodeDB.area("pol", "geom", "polArea")
        await simpleNodeDB.renameColumns("pol", { geom: "pol" })

        await simpleNodeDB.crossJoin("prov", "pol", { outputTable: "joined" })
        await simpleNodeDB.intersection("joined", ["pol", "prov"], "intersec")
        await simpleNodeDB.area("joined", "intersec", "intersecArea")
        await simpleNodeDB.addColumn(
            "joined",
            "intersecPerc",
            "double",
            `intersecArea/polArea`
        )

        await simpleNodeDB.selectColumns("joined", [
            "nameEnglish",
            "name",
            "intersecPerc",
        ])
        const data = await simpleNodeDB.getData("joined")

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
            {
                nameEnglish: "Quebec",
                name: "polygonA",
                intersecPerc: 0.6448239635042313,
            },
            {
                nameEnglish: "Ontario",
                name: "polygonA",
                intersecPerc: 0.3319604587606646,
            },
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
            {
                nameEnglish: "Manitoba",
                name: "polygonB",
                intersecPerc: 0.1429911966346303,
            },
            {
                nameEnglish: "Saskatchewan",
                name: "polygonB",
                intersecPerc: 0.2939506678232289,
            },
            {
                nameEnglish: "Alberta",
                name: "polygonB",
                intersecPerc: 0.299169187961885,
            },
            {
                nameEnglish: "British Columbia",
                name: "polygonB",
                intersecPerc: 0.040389250666719306,
            },
            { nameEnglish: "Yukon", name: "polygonB", intersecPerc: 0 },
            {
                nameEnglish: "Northwest Territories",
                name: "polygonB",
                intersecPerc: 0.17956826516012744,
            },
            {
                nameEnglish: "Nunavut",
                name: "polygonB",
                intersecPerc: 0.036643788275493624,
            },
        ])
    })
})
