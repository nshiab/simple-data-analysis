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

    it("should calculate the distance between geometries", async () => {
        await simpleNodeDB.loadData(
            "data",
            "test/geodata/files/coordinates.csv"
        )
        await simpleNodeDB.points("data", "lon", "lat", "geom")
        await simpleNodeDB.flipCoordinates("data", "geom")
        await simpleNodeDB.reproject("data", "geom", "EPSG:4326", "EPSG:3347")
        await simpleNodeDB.selectColumns("data", ["name", "geom"])
        await simpleNodeDB.cloneTable("data", "dataClone")
        await simpleNodeDB.crossJoin("data", "dataClone")
        await simpleNodeDB.distance("data", "geom", "geom_1", "dist")
        await simpleNodeDB.selectColumns("data", ["name", "name_1", "dist"])

        const data = await simpleNodeDB.getData("data")

        assert.deepStrictEqual(data, [
            { name: "montreal", name_1: "montreal", dist: 0 },
            { name: "montreal", name_1: "toronto", dist: 474717.89401638263 },
            { name: "montreal", name_1: "vancouver", dist: 3375210.3233094704 },
            { name: "toronto", name_1: "montreal", dist: 474717.89401638263 },
            { name: "toronto", name_1: "toronto", dist: 0 },
            { name: "toronto", name_1: "vancouver", dist: 3675512.5531728626 },
            { name: "vancouver", name_1: "montreal", dist: 3375210.3233094704 },
            { name: "vancouver", name_1: "toronto", dist: 3675512.5531728626 },
            { name: "vancouver", name_1: "vancouver", dist: 0 },
        ])
    })
})
