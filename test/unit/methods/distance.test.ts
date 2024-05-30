import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("distance", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should calculate the distance between points with the SRS unit", async () => {
        const table = sdb.newTable("data")
        await table.loadGeoData("test/geodata/files/coordinates.geojson")
        const clone = await table.cloneTable()
        await table.crossJoin(clone)
        await table.distance("geom", "geom_1", "dist")
        await table.selectColumns(["name", "name_1", "dist"])
        await table.round("dist", { decimals: 3 })

        const data = await table.getData()

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
        const points = sdb.newTable("points")
        await points.loadGeoData("test/geodata/files/coordinates.geojson")
        const line = sdb.newTable("line")
        await line.loadGeoData("test/geodata/files/line.json")
        await points.crossJoin(line)
        await points.distance("geom", "geom_1", "dist")
        await points.selectColumns(["name", "dist"])
        await points.round("dist", { decimals: 3 })

        const data = await points.getData()

        assert.deepStrictEqual(data, [
            { name: "toronto", dist: 3.968 },
            { name: "montreal", dist: 1.826 },
            { name: "vancouver", dist: 47.237 },
        ])
    })
    it("should calculate the distance between points and polygons in the SRS unit", async () => {
        const points = sdb.newTable("points")
        await points.loadGeoData("test/geodata/files/coordinates.geojson")
        const polygon = sdb.newTable("polygon")
        await polygon.loadGeoData("test/geodata/files/polygon.json")
        await points.crossJoin(polygon)
        await points.distance("geom", "geom_1", "dist")
        await points.selectColumns(["name", "dist"])
        await points.round("dist", { decimals: 3 })

        const data = await points.getData()

        assert.deepStrictEqual(data, [
            { name: "toronto", dist: 3.615 },
            { name: "montreal", dist: 1.509 },
            { name: "vancouver", dist: 47.071 },
        ])
    })
    it("should calculate the distance between points with the haversine method in meters", async () => {
        const points = sdb.newTable("points")
        await points.loadGeoData("test/geodata/files/coordinates.geojson")
        await points.flipCoordinates("geom")
        const pointsCloned = await points.cloneTable()
        await points.crossJoin(pointsCloned)
        await points.distance("geom", "geom_1", "dist", {
            method: "haversine",
        })
        await points.selectColumns(["name", "name_1", "dist"])
        await points.round("dist")

        const data = await points.getData()

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
        const points = sdb.newTable("points")
        await points.loadGeoData("test/geodata/files/coordinates.geojson")
        await points.flipCoordinates("geom")
        const pointsCloned = await points.cloneTable()
        await points.crossJoin(pointsCloned)
        await points.distance("geom", "geom_1", "dist", {
            method: "haversine",
            unit: "km",
        })
        await points.selectColumns(["name", "name_1", "dist"])
        await points.round("dist")

        const data = await points.getData()

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
        const points = sdb.newTable("points")
        await points.loadGeoData("test/geodata/files/coordinates.geojson")
        await points.flipCoordinates("geom")
        const pointsCloned = await points.cloneTable()
        await points.crossJoin(pointsCloned)
        await points.distance("geom", "geom_1", "dist", {
            method: "spheroid",
        })
        await points.selectColumns(["name", "name_1", "dist"])
        await points.round("dist")

        const data = await points.getData()

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
        const points = sdb.newTable("points")
        await points.loadGeoData("test/geodata/files/coordinates.geojson")
        await points.flipCoordinates("geom")
        const pointsCloned = await points.cloneTable()
        await points.crossJoin(pointsCloned)
        await points.distance("geom", "geom_1", "dist", {
            method: "spheroid",
            unit: "km",
        })
        await points.selectColumns(["name", "name_1", "dist"])
        await points.round("dist")

        const data = await points.getData()

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
