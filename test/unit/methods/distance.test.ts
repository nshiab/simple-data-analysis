import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("distance", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB({ spatial: true })
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should calculate the distance between points with the SRS unit", async () => {
        await simpleNodeDB.loadGeoData(
            "data",
            "test/geodata/files/coordinates.geojson"
        )
        await simpleNodeDB.cloneTable("data", "dataClone")
        await simpleNodeDB.crossJoin("data", "dataClone")
        await simpleNodeDB.distance("data", "geom", "geom_1", "dist")
        await simpleNodeDB.selectColumns("data", ["name", "name_1", "dist"])
        await simpleNodeDB.round("data", "dist", { decimals: 3 })

        const data = await simpleNodeDB.getData("data")

        assert.deepStrictEqual(data, [
            { name: "toronto", name_1: "toronto", dist: 0 },
            { name: "toronto", name_1: "montreal", dist: 5.655 },
            { name: "toronto", name_1: "vancouver", dist: 43.99 },
            { name: "montreal", name_1: "toronto", dist: 5.655 },
            { name: "montreal", name_1: "montreal", dist: 0 },
            { name: "montreal", name_1: "vancouver", dist: 49.241 },
            { name: "vancouver", name_1: "toronto", dist: 43.99 },
            { name: "vancouver", name_1: "montreal", dist: 49.241 },
            { name: "vancouver", name_1: "vancouver", dist: 0 },
        ])
    })
    it("should calculate the distance between points and lines in the SRS unit", async () => {
        await simpleNodeDB.loadGeoData(
            "points",
            "test/geodata/files/coordinates.geojson"
        )
        await simpleNodeDB.loadGeoData("line", "test/geodata/files/line.json")
        await simpleNodeDB.crossJoin("points", "line")
        await simpleNodeDB.distance("points", "geom", "geom_1", "dist")
        await simpleNodeDB.selectColumns("points", ["name", "dist"])
        await simpleNodeDB.round("points", "dist", { decimals: 3 })

        const data = await simpleNodeDB.getData("points")

        assert.deepStrictEqual(data, [
            { name: "toronto", dist: 3.968 },
            { name: "montreal", dist: 1.826 },
            { name: "vancouver", dist: 47.237 },
        ])
    })
    it("should calculate the distance between points and polygons in the SRS unit", async () => {
        await simpleNodeDB.loadGeoData(
            "points",
            "test/geodata/files/coordinates.geojson"
        )
        await simpleNodeDB.loadGeoData(
            "polygon",
            "test/geodata/files/polygon.json"
        )
        await simpleNodeDB.crossJoin("points", "polygon")
        await simpleNodeDB.distance("points", "geom", "geom_1", "dist")
        await simpleNodeDB.selectColumns("points", ["name", "dist"])
        await simpleNodeDB.round("points", "dist", { decimals: 3 })

        const data = await simpleNodeDB.getData("points")

        assert.deepStrictEqual(data, [
            { name: "toronto", dist: 3.615 },
            { name: "montreal", dist: 1.509 },
            { name: "vancouver", dist: 47.071 },
        ])
    })
    it("should calculate the distance between points with the haversine method in meters", async () => {
        await simpleNodeDB.loadGeoData(
            "data",
            "test/geodata/files/coordinates.geojson"
        )
        await simpleNodeDB.flipCoordinates("data", "geom")
        await simpleNodeDB.cloneTable("data", "dataClone")
        await simpleNodeDB.crossJoin("data", "dataClone")
        await simpleNodeDB.distance("data", "geom", "geom_1", "dist", {
            method: "haversine",
        })
        await simpleNodeDB.selectColumns("data", ["name", "name_1", "dist"])
        await simpleNodeDB.round("data", "dist")

        const data = await simpleNodeDB.getData("data")

        assert.deepStrictEqual(data, [
            { name: "toronto", name_1: "toronto", dist: 0 },
            { name: "toronto", name_1: "montreal", dist: 464577 },
            { name: "toronto", name_1: "vancouver", dist: 3350989 },
            { name: "montreal", name_1: "toronto", dist: 464577 },
            { name: "montreal", name_1: "montreal", dist: 0 },
            { name: "montreal", name_1: "vancouver", dist: 3666382 },
            { name: "vancouver", name_1: "toronto", dist: 3350989 },
            { name: "vancouver", name_1: "montreal", dist: 3666382 },
            { name: "vancouver", name_1: "vancouver", dist: 0 },
        ])
    })
    it("should calculate the distance between points with the haversine method in km", async () => {
        await simpleNodeDB.loadGeoData(
            "data",
            "test/geodata/files/coordinates.geojson"
        )
        await simpleNodeDB.flipCoordinates("data", "geom")
        await simpleNodeDB.cloneTable("data", "dataClone")
        await simpleNodeDB.crossJoin("data", "dataClone")
        await simpleNodeDB.distance("data", "geom", "geom_1", "dist", {
            method: "haversine",
            unit: "km",
        })
        await simpleNodeDB.selectColumns("data", ["name", "name_1", "dist"])
        await simpleNodeDB.round("data", "dist")

        const data = await simpleNodeDB.getData("data")

        assert.deepStrictEqual(data, [
            { name: "toronto", name_1: "toronto", dist: 0 },
            { name: "toronto", name_1: "montreal", dist: 465 },
            { name: "toronto", name_1: "vancouver", dist: 3351 },
            { name: "montreal", name_1: "toronto", dist: 465 },
            { name: "montreal", name_1: "montreal", dist: 0 },
            { name: "montreal", name_1: "vancouver", dist: 3666 },
            { name: "vancouver", name_1: "toronto", dist: 3351 },
            { name: "vancouver", name_1: "montreal", dist: 3666 },
            { name: "vancouver", name_1: "vancouver", dist: 0 },
        ])
    })
    it("should calculate the distance between points with the spheroid method in m", async () => {
        await simpleNodeDB.loadGeoData(
            "data",
            "test/geodata/files/coordinates.geojson"
        )
        await simpleNodeDB.flipCoordinates("data", "geom")
        await simpleNodeDB.cloneTable("data", "dataClone")
        await simpleNodeDB.crossJoin("data", "dataClone")
        await simpleNodeDB.distance("data", "geom", "geom_1", "dist", {
            method: "spheroid",
        })
        await simpleNodeDB.selectColumns("data", ["name", "name_1", "dist"])
        await simpleNodeDB.round("data", "dist")

        const data = await simpleNodeDB.getData("data")

        assert.deepStrictEqual(data, [
            { name: "toronto", name_1: "toronto", dist: 0 },
            { name: "toronto", name_1: "montreal", dist: 465639 },
            { name: "toronto", name_1: "vancouver", dist: 3360308 },
            { name: "montreal", name_1: "toronto", dist: 465639 },
            { name: "montreal", name_1: "montreal", dist: 0 },
            { name: "montreal", name_1: "vancouver", dist: 3676968 },
            { name: "vancouver", name_1: "toronto", dist: 3360308 },
            { name: "vancouver", name_1: "montreal", dist: 3676968 },
            { name: "vancouver", name_1: "vancouver", dist: 0 },
        ])
    })
    it("should calculate the distance between points with the spheroid method in km", async () => {
        await simpleNodeDB.loadGeoData(
            "data",
            "test/geodata/files/coordinates.geojson"
        )
        await simpleNodeDB.flipCoordinates("data", "geom")
        await simpleNodeDB.cloneTable("data", "dataClone")
        await simpleNodeDB.crossJoin("data", "dataClone")
        await simpleNodeDB.distance("data", "geom", "geom_1", "dist", {
            method: "spheroid",
            unit: "km",
        })
        await simpleNodeDB.selectColumns("data", ["name", "name_1", "dist"])
        await simpleNodeDB.round("data", "dist")

        const data = await simpleNodeDB.getData("data")

        assert.deepStrictEqual(data, [
            { name: "toronto", name_1: "toronto", dist: 0 },
            { name: "toronto", name_1: "montreal", dist: 466 },
            { name: "toronto", name_1: "vancouver", dist: 3360 },
            { name: "montreal", name_1: "toronto", dist: 466 },
            { name: "montreal", name_1: "montreal", dist: 0 },
            { name: "montreal", name_1: "vancouver", dist: 3677 },
            { name: "vancouver", name_1: "toronto", dist: 3360 },
            { name: "vancouver", name_1: "montreal", dist: 3677 },
            { name: "vancouver", name_1: "vancouver", dist: 0 },
        ])
    })

    // Add more tests for haversine and lines / polygons when ready.
})
