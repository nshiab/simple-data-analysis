import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("join", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should put the result of an inner join into a new table", async () => {
        const dishes = sdb.newTable("dishes")
        await dishes.loadData("test/data/joins/dishes.csv")
        const categories = sdb.newTable("categories")
        await categories.loadData("test/data/joins/categories.csv")

        const joined = await dishes.join(categories, {
            commonColumn: "dishId",
            type: "inner",
            outputTable: true,
        })

        const data = await joined.getData()

        assert.deepStrictEqual(data, [
            {
                dishId: 1,
                name: "Crème brûlée",
                country: "France",
                category: "Dessert",
            },
            { dishId: 2, name: "Pizza", country: "Italy", category: "Main" },
            {
                dishId: 3,
                name: "Churros",
                country: "Mexico",
                category: "Dessert",
            },
        ])
    })
    it("should put the result of a left join into a new table", async () => {
        const dishes = sdb.newTable("dishes")
        await dishes.loadData("test/data/joins/dishes.csv")
        const categories = sdb.newTable("categories")
        await categories.loadData("test/data/joins/categories.csv")

        const joined = await dishes.join(categories, {
            commonColumn: "dishId",
            type: "left",
            outputTable: true,
        })

        const data = await joined.getData()

        assert.deepStrictEqual(data, [
            {
                dishId: 1,
                name: "Crème brûlée",
                country: "France",
                category: "Dessert",
            },
            { dishId: 2, name: "Pizza", country: "Italy", category: "Main" },
            {
                dishId: 3,
                name: "Churros",
                country: "Mexico",
                category: "Dessert",
            },
            {
                dishId: 4,
                name: "Couscous",
                country: "Morrocco",
                category: null,
            },
            { dishId: 5, name: "Mochi", country: "Japan", category: null },
        ])
    })
    it("should put the result of a right join into a new table", async () => {
        const dishes = sdb.newTable("dishes")
        await dishes.loadData("test/data/joins/dishes.csv")
        const categories = sdb.newTable("categories")
        await categories.loadData("test/data/joins/categories.csv")

        const joined = await dishes.join(categories, {
            commonColumn: "dishId",
            type: "right",
            outputTable: true,
        })

        const data = await joined.getData()

        assert.deepStrictEqual(data, [
            {
                dishId: 1,
                name: "Crème brûlée",
                country: "France",
                category: "Dessert",
            },
            { dishId: 2, name: "Pizza", country: "Italy", category: "Main" },
            {
                dishId: 3,
                name: "Churros",
                country: "Mexico",
                category: "Dessert",
            },
            { dishId: null, name: null, country: null, category: "Main" },
            { dishId: null, name: null, country: null, category: "Main" },
            { dishId: null, name: null, country: null, category: "Dessert" },
        ])
    })
    it("should put the result of a full join into a new table", async () => {
        const dishes = sdb.newTable("dishes")
        await dishes.loadData("test/data/joins/dishes.csv")
        const categories = sdb.newTable("categories")
        await categories.loadData("test/data/joins/categories.csv")

        const joined = await dishes.join(categories, {
            commonColumn: "dishId",
            type: "full",
            outputTable: true,
        })

        const data = await joined.getData()

        assert.deepStrictEqual(data, [
            {
                dishId: 1,
                name: "Crème brûlée",
                country: "France",
                category: "Dessert",
            },
            { dishId: 2, name: "Pizza", country: "Italy", category: "Main" },
            {
                dishId: 3,
                name: "Churros",
                country: "Mexico",
                category: "Dessert",
            },
            { dishId: null, name: null, country: null, category: "Main" },
            { dishId: null, name: null, country: null, category: "Main" },
            { dishId: null, name: null, country: null, category: "Dessert" },
            { dishId: 5, name: "Mochi", country: "Japan", category: null },
            {
                dishId: 4,
                name: "Couscous",
                country: "Morrocco",
                category: null,
            },
        ])
    })
    it("should put the result of a full join into a new table with a specific name in the DB", async () => {
        const dishes = sdb.newTable("dishes")
        await dishes.loadData("test/data/joins/dishes.csv")
        const categories = sdb.newTable("categories")
        await categories.loadData("test/data/joins/categories.csv")

        await dishes.join(categories, {
            commonColumn: "dishId",
            type: "full",
            outputTable: "joined",
        })

        const data = await sdb.customQuery("select * from joined", {
            returnDataFrom: "query",
        })

        assert.deepStrictEqual(data, [
            {
                dishId: 1,
                name: "Crème brûlée",
                country: "France",
                category: "Dessert",
            },
            { dishId: 2, name: "Pizza", country: "Italy", category: "Main" },
            {
                dishId: 3,
                name: "Churros",
                country: "Mexico",
                category: "Dessert",
            },
            { dishId: null, name: null, country: null, category: "Main" },
            { dishId: null, name: null, country: null, category: "Main" },
            { dishId: null, name: null, country: null, category: "Dessert" },
            { dishId: 5, name: "Mochi", country: "Japan", category: null },
            {
                dishId: 4,
                name: "Couscous",
                country: "Morrocco",
                category: null,
            },
        ])
    })
    it("should automatically find a common column, make left join and put the result into leftTable", async () => {
        const dishes = sdb.newTable("dishes")
        await dishes.loadData("test/data/joins/dishes.csv")
        const categories = sdb.newTable("categories")
        await categories.loadData("test/data/joins/categories.csv")

        await dishes.join(categories)

        const data = await dishes.getData()

        assert.deepStrictEqual(data, [
            {
                dishId: 1,
                name: "Crème brûlée",
                country: "France",
                category: "Dessert",
            },
            { dishId: 2, name: "Pizza", country: "Italy", category: "Main" },
            {
                dishId: 3,
                name: "Churros",
                country: "Mexico",
                category: "Dessert",
            },
            {
                dishId: 4,
                name: "Couscous",
                country: "Morrocco",
                category: null,
            },
            { dishId: 5, name: "Mochi", country: "Japan", category: null },
        ])
    })
    it("should keep all projections", async () => {
        const dishes = sdb.newTable("dishes")
        await dishes.loadData("test/data/joins/dishes.csv")
        const categories = sdb.newTable("categories")
        await categories.loadData("test/data/joins/categories.csv")
        await categories.addColumn("lat", "double", `45.50`)
        await categories.addColumn("lon", "double", `-73.57`)
        await categories.points("lat", "lon", "points")

        await dishes.join(categories)

        assert.deepStrictEqual(dishes.projections, {
            points: "+proj=latlong +datum=WGS84 +no_defs",
        })
    })
})
