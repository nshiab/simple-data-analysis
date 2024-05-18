import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("distance", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB({ spatial: true })
    })
    after(async function () {
        await sdb.done()
    })

    it("should calculate the distance between points with the SRS unit", async () => {
        await sdb.loadGeoData("data", "test/geodata/files/coordinates.geojson")
        await sdb.cloneTable("data", "dataClone")
        await sdb.crossJoin("data", "dataClone")
        await sdb.distance("data", "geom", "geom_1", "dist")
        await sdb.selectColumns("data", ["name", "name_1", "dist"])
        await sdb.round("data", "dist", { decimals: 3 })

        const data = await sdb.getData("data")

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
        await sdb.loadGeoData(
            "points",
            "test/geodata/files/coordinates.geojson"
        )
        await sdb.loadGeoData("line", "test/geodata/files/line.json")
        await sdb.crossJoin("points", "line")
        await sdb.distance("points", "geom", "geom_1", "dist")
        await sdb.selectColumns("points", ["name", "dist"])
        await sdb.round("points", "dist", { decimals: 3 })

        const data = await sdb.getData("points")

        assert.deepStrictEqual(data, [
            { name: "toronto", dist: 3.968 },
            { name: "montreal", dist: 1.826 },
            { name: "vancouver", dist: 47.237 },
        ])
    })
    it("should calculate the distance between points and polygons in the SRS unit", async () => {
        await sdb.loadGeoData(
            "points",
            "test/geodata/files/coordinates.geojson"
        )
        await sdb.loadGeoData("polygon", "test/geodata/files/polygon.json")
        await sdb.crossJoin("points", "polygon")
        await sdb.distance("points", "geom", "geom_1", "dist")
        await sdb.selectColumns("points", ["name", "dist"])
        await sdb.round("points", "dist", { decimals: 3 })

        const data = await sdb.getData("points")

        assert.deepStrictEqual(data, [
            { name: "toronto", dist: 3.615 },
            { name: "montreal", dist: 1.509 },
            { name: "vancouver", dist: 47.071 },
        ])
    })
    it("should calculate the distance between points with the haversine method in meters", async () => {
        await sdb.loadGeoData("data", "test/geodata/files/coordinates.geojson")
        await sdb.flipCoordinates("data", "geom")
        await sdb.cloneTable("data", "dataClone")
        await sdb.crossJoin("data", "dataClone")
        await sdb.distance("data", "geom", "geom_1", "dist", {
            method: "haversine",
        })
        await sdb.selectColumns("data", ["name", "name_1", "dist"])
        await sdb.round("data", "dist")

        const data = await sdb.getData("data")

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
        await sdb.loadGeoData("data", "test/geodata/files/coordinates.geojson")
        await sdb.flipCoordinates("data", "geom")
        await sdb.cloneTable("data", "dataClone")
        await sdb.crossJoin("data", "dataClone")
        await sdb.distance("data", "geom", "geom_1", "dist", {
            method: "haversine",
            unit: "km",
        })
        await sdb.selectColumns("data", ["name", "name_1", "dist"])
        await sdb.round("data", "dist")

        const data = await sdb.getData("data")

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
        await sdb.loadGeoData("data", "test/geodata/files/coordinates.geojson")
        await sdb.flipCoordinates("data", "geom")
        await sdb.cloneTable("data", "dataClone")
        await sdb.crossJoin("data", "dataClone")
        await sdb.distance("data", "geom", "geom_1", "dist", {
            method: "spheroid",
        })
        await sdb.selectColumns("data", ["name", "name_1", "dist"])
        await sdb.round("data", "dist")

        const data = await sdb.getData("data")

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
        await sdb.loadGeoData("data", "test/geodata/files/coordinates.geojson")
        await sdb.flipCoordinates("data", "geom")
        await sdb.cloneTable("data", "dataClone")
        await sdb.crossJoin("data", "dataClone")
        await sdb.distance("data", "geom", "geom_1", "dist", {
            method: "spheroid",
            unit: "km",
        })
        await sdb.selectColumns("data", ["name", "name_1", "dist"])
        await sdb.round("data", "dist")

        const data = await sdb.getData("data")

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
