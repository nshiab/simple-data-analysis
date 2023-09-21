// import assert from "assert"
// import SimpleDB from "../../../src/class/SimpleDB.js"
// import { AsyncDuckDB } from "@duckdb/duckdb-wasm"

// describe("SimpleDB", function () {
//     const simpleDB = new SimpleDB()
//     it("should instantiate a SimpleDB class", function () {
//         assert.deepStrictEqual(simpleDB instanceof SimpleDB, true)
//     })

//     it("should have ready property as false", function () {
//         assert.deepStrictEqual(simpleDB.ready, false)
//     })

//     it("should start and instantiate a db", async function () {
//         await simpleDB.start()
//         assert.deepStrictEqual(simpleDB.getDB() instanceof AsyncDuckDB, true)
//     })

// Add a test on connection

//     it("should have ready property as true if instantiated", function () {
//         assert.deepStrictEqual(simpleDB.ready, true)
//     })

//     it("should stop the db and have ready property as false", async function () {
//         await simpleDB.stop()
//         assert.deepStrictEqual(simpleDB.ready, false)
//     })
// })
