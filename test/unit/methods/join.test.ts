import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("join", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = await new SimpleNodeDB().start()
        await simpleNodeDB.loadData("dishes", "test/data/joins/dishes.csv")
        await simpleNodeDB.loadData(
            "categories",
            "test/data/joins/categories.csv"
        )
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should put the result of an inner join into a new table", async () => {
        const data = await simpleNodeDB.join(
            "dishes",
            "categories",
            "dishId",
            "inner",
            "innerJoin",
            { returnDataFrom: "table" }
        )

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
        const data = await simpleNodeDB.join(
            "dishes",
            "categories",
            "dishId",
            "left",
            "leftJoin",
            { returnDataFrom: "table" }
        )

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
        const data = await simpleNodeDB.join(
            "dishes",
            "categories",
            "dishId",
            "right",
            "rightJoin",
            { returnDataFrom: "table" }
        )

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
        const data = await simpleNodeDB.join(
            "dishes",
            "categories",
            "dishId",
            "full",
            "fullJoin",
            { returnDataFrom: "table" }
        )

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
            { dishId: null, name: null, country: null, category: "Dessert" },
            { dishId: null, name: null, country: null, category: "Main" },
            { dishId: null, name: null, country: null, category: "Main" },
        ])
    })
})
