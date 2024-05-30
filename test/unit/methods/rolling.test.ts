// import assert from "assert"
// import SimpleDB from "../../../src/class/SimpleDB.js"

// describe("rolling", () => {
//     let sdb: SimpleDB
//     before(async function () {
//         sdb = new SimpleDB()
//     })
//     after(async function () {
//         await sdb.done()
//     })

//     it("should compute a rolling average with 3 preceding and 3 following", async () => {
//         await sdb.loadArray("data", [
//             { value: 52 },
//             { value: 76 },
//             { value: 36 },
//             { value: 95 },
//             { value: 40 },
//             { value: 19 },
//             { value: 63 },
//             { value: 4 },
//             { value: 83 },
//             { value: 41 },
//         ])

//         await sdb.rolling("data", "value", "rollingAvg", "mean", 3, 3)

//         const data = await sdb.getData("data")

//         assert.deepStrictEqual(data, [
//             { value: 52, rollingAvg: null },
//             { value: 76, rollingAvg: null },
//             { value: 36, rollingAvg: null },
//             { value: 95, rollingAvg: 54.42857142857143 },
//             { value: 40, rollingAvg: 47.57142857142857 },
//             { value: 19, rollingAvg: 48.57142857142857 },
//             { value: 63, rollingAvg: 49.285714285714285 },
//             { value: 4, rollingAvg: null },
//             { value: 83, rollingAvg: null },
//             { value: 41, rollingAvg: null },
//         ])
//     })
//     it("should compute a rolling average with 3 preceding and 3 following, and 4 decimals", async () => {
//         await sdb.loadArray("data", [
//             { value: 52 },
//             { value: 76 },
//             { value: 36 },
//             { value: 95 },
//             { value: 40 },
//             { value: 19 },
//             { value: 63 },
//             { value: 4 },
//             { value: 83 },
//             { value: 41 },
//         ])

//         await sdb.rolling("data", "value", "rollingAvg", "mean", 3, 3, {
//             decimals: 4,
//         })

//         const data = await sdb.getData("data")

//         assert.deepStrictEqual(data, [
//             { value: 52, rollingAvg: null },
//             { value: 76, rollingAvg: null },
//             { value: 36, rollingAvg: null },
//             { value: 95, rollingAvg: 54.4286 },
//             { value: 40, rollingAvg: 47.5714 },
//             { value: 19, rollingAvg: 48.5714 },
//             { value: 63, rollingAvg: 49.2857 },
//             { value: 4, rollingAvg: null },
//             { value: 83, rollingAvg: null },
//             { value: 41, rollingAvg: null },
//         ])
//     })
//     it("should compute a rolling max with 0 preceding and 3 following", async () => {
//         await sdb.loadArray("data", [
//             { value: 52 },
//             { value: 76 },
//             { value: 36 },
//             { value: 95 },
//             { value: 40 },
//             { value: 19 },
//             { value: 63 },
//             { value: 4 },
//             { value: 83 },
//             { value: 41 },
//         ])

//         await sdb.rolling("data", "value", "rollingMax", "max", 0, 3)

//         const data = await sdb.getData("data")

//         assert.deepStrictEqual(data, [
//             { value: 52, rollingMax: 95 },
//             { value: 76, rollingMax: 95 },
//             { value: 36, rollingMax: 95 },
//             { value: 95, rollingMax: 95 },
//             { value: 40, rollingMax: 63 },
//             { value: 19, rollingMax: 83 },
//             { value: 63, rollingMax: 83 },
//             { value: 4, rollingMax: null },
//             { value: 83, rollingMax: null },
//             { value: 41, rollingMax: null },
//         ])
//     })
//     it("should compute a rolling max with 0 preceding and 3 following, and a category", async () => {
//         await sdb.loadArray("data", [
//             { index: 1, group: "a", value: 52 },
//             { index: 2, group: "a", value: 76 },
//             { index: 3, group: "a", value: 36 },
//             { index: 4, group: "a", value: 95 },
//             { index: 5, group: "a", value: 40 },
//             { index: 6, group: "b", value: 19 },
//             { index: 7, group: "b", value: 63 },
//             { index: 8, group: "b", value: 4 },
//             { index: 9, group: "b", value: 83 },
//             { index: 10, group: "b", value: 41 },
//         ])

//         await sdb.rolling("data", "value", "rollingMax", "max", 0, 3, {
//             categories: "group",
//         })
//         await sdb.sort("data", { index: "asc" })
//         const data = await sdb.getData("data")

//         assert.deepStrictEqual(data, [
//             { index: 1, group: "a", value: 52, rollingMax: 95 },
//             { index: 2, group: "a", value: 76, rollingMax: 95 },
//             { index: 3, group: "a", value: 36, rollingMax: null },
//             { index: 4, group: "a", value: 95, rollingMax: null },
//             { index: 5, group: "a", value: 40, rollingMax: null },
//             { index: 6, group: "b", value: 19, rollingMax: 83 },
//             { index: 7, group: "b", value: 63, rollingMax: 83 },
//             { index: 8, group: "b", value: 4, rollingMax: null },
//             { index: 9, group: "b", value: 83, rollingMax: null },
//             { index: 10, group: "b", value: 41, rollingMax: null },
//         ])
//     })
// })
