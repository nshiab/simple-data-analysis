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

    it("should calculate the distance between geometries in meters", async () => {
        await simpleNodeDB.loadData(
            "data",
            "test/geodata/files/coordinates.csv"
        )
        await simpleNodeDB.points("data", "lon", "lat", "geom")
        await simpleNodeDB.flipCoordinates("data", "geom")
        await simpleNodeDB.selectColumns("data", ["name", "geom"])
        await simpleNodeDB.cloneTable("data", "dataClone")
        await simpleNodeDB.crossJoin("data", "dataClone")
        await simpleNodeDB.distance("data", "geom", "geom_1", "dist")
        await simpleNodeDB.selectColumns("data", ["name", "name_1", "dist"])
        await simpleNodeDB.round("data", "dist")

        const data = await simpleNodeDB.getData("data")

        assert.deepStrictEqual(data, [
            { name: "montreal", name_1: "montreal", dist: 0 },
            { name: "montreal", name_1: "toronto", dist: 465639 },
            { name: "montreal", name_1: "vancouver", dist: 3360308 },
            { name: "toronto", name_1: "montreal", dist: 465639 },
            { name: "toronto", name_1: "toronto", dist: 0 },
            { name: "toronto", name_1: "vancouver", dist: 3676968 },
            { name: "vancouver", name_1: "montreal", dist: 3360308 },
            { name: "vancouver", name_1: "toronto", dist: 3676968 },
            { name: "vancouver", name_1: "vancouver", dist: 0 },
        ])
    })
    it("should calculate the distance between geometries in kilometers", async () => {
        await simpleNodeDB.loadData(
            "data",
            "test/geodata/files/coordinates.csv"
        )
        await simpleNodeDB.points("data", "lon", "lat", "geom")
        await simpleNodeDB.flipCoordinates("data", "geom")
        await simpleNodeDB.selectColumns("data", ["name", "geom"])
        await simpleNodeDB.cloneTable("data", "dataClone")
        await simpleNodeDB.crossJoin("data", "dataClone")
        await simpleNodeDB.distance("data", "geom", "geom_1", "dist", {
            unit: "km",
        })
        await simpleNodeDB.selectColumns("data", ["name", "name_1", "dist"])
        await simpleNodeDB.round("data", "dist")

        const data = await simpleNodeDB.getData("data")

        assert.deepStrictEqual(data, [
            { name: "montreal", name_1: "montreal", dist: 0 },
            { name: "montreal", name_1: "toronto", dist: 466 },
            { name: "montreal", name_1: "vancouver", dist: 3360 },
            { name: "toronto", name_1: "montreal", dist: 466 },
            { name: "toronto", name_1: "toronto", dist: 0 },
            { name: "toronto", name_1: "vancouver", dist: 3677 },
            { name: "vancouver", name_1: "montreal", dist: 3360 },
            { name: "vancouver", name_1: "toronto", dist: 3677 },
            { name: "vancouver", name_1: "vancouver", dist: 0 },
        ])
    })
})
