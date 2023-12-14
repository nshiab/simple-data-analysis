import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("getExtensions", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should return the DuckDB extensions", async () => {
        const extensions = await simpleNodeDB.getExtensions()

        assert.deepStrictEqual(extensions, [
            {
                extension_name: "arrow",
                loaded: false,
                installed: true,
                install_path:
                    "/Users/naelshiab/.duckdb/extensions/v0.9.2/osx_arm64/arrow.duckdb_extension",
                description:
                    "A zero-copy data integration between Apache Arrow and DuckDB",
                aliases: [],
            },
            {
                extension_name: "autocomplete",
                loaded: false,
                installed: false,
                install_path: "",
                description: "Adds support for autocomplete in the shell",
                aliases: [],
            },
            {
                extension_name: "aws",
                loaded: false,
                installed: false,
                install_path: "",
                description: "Provides features that depend on the AWS SDK",
                aliases: [],
            },
            {
                extension_name: "azure",
                loaded: false,
                installed: false,
                install_path: "",
                description:
                    "Adds a filesystem abstraction for Azure blob storage to DuckDB",
                aliases: [],
            },
            {
                extension_name: "excel",
                loaded: false,
                installed: false,
                install_path: "",
                description: "Adds support for Excel-like format strings",
                aliases: [],
            },
            {
                extension_name: "fts",
                loaded: false,
                installed: false,
                install_path: "",
                description: "Adds support for Full-Text Search Indexes",
                aliases: [],
            },
            {
                extension_name: "httpfs",
                loaded: false,
                installed: true,
                install_path:
                    "/Users/naelshiab/.duckdb/extensions/v0.9.2/osx_arm64/httpfs.duckdb_extension",
                description:
                    "Adds support for reading and writing files over a HTTP(S) connection",
                aliases: ["http", "https", "s3"],
            },
            {
                extension_name: "iceberg",
                loaded: false,
                installed: false,
                install_path: "",
                description: "Adds support for Apache Iceberg",
                aliases: [],
            },
            {
                extension_name: "icu",
                loaded: true,
                installed: true,
                install_path: "(BUILT-IN)",
                description:
                    "Adds support for time zones and collations using the ICU library",
                aliases: [],
            },
            {
                extension_name: "inet",
                loaded: false,
                installed: false,
                install_path: "",
                description:
                    "Adds support for IP-related data types and functions",
                aliases: [],
            },
            {
                extension_name: "jemalloc",
                loaded: false,
                installed: false,
                install_path: "",
                description: "Overwrites system allocator with JEMalloc",
                aliases: [],
            },
            {
                extension_name: "json",
                loaded: true,
                installed: true,
                install_path: "(BUILT-IN)",
                description: "Adds support for JSON operations",
                aliases: [],
            },
            {
                extension_name: "motherduck",
                loaded: false,
                installed: false,
                install_path: "",
                description: "Enables motherduck integration with the system",
                aliases: ["md"],
            },
            {
                extension_name: "mysql_scanner",
                loaded: false,
                installed: false,
                install_path: "",
                description: "Adds support for connecting to a MySQL database",
                aliases: ["mysql"],
            },
            {
                extension_name: "parquet",
                loaded: true,
                installed: true,
                install_path: "(BUILT-IN)",
                description:
                    "Adds support for reading and writing parquet files",
                aliases: [],
            },
            {
                extension_name: "postgres_scanner",
                loaded: false,
                installed: false,
                install_path: "",
                description:
                    "Adds support for connecting to a Postgres database",
                aliases: ["postgres"],
            },
            {
                extension_name: "spatial",
                loaded: false,
                installed: true,
                install_path:
                    "/Users/naelshiab/.duckdb/extensions/v0.9.2/osx_arm64/spatial.duckdb_extension",
                description:
                    "Geospatial extension that adds support for working with spatial data and functions",
                aliases: [],
            },
            {
                extension_name: "sqlite_scanner",
                loaded: false,
                installed: false,
                install_path: "",
                description:
                    "Adds support for reading and writing SQLite database files",
                aliases: ["sqlite", "sqlite3"],
            },
            {
                extension_name: "substrait",
                loaded: false,
                installed: false,
                install_path: "",
                description: "Adds support for the Substrait integration",
                aliases: [],
            },
            {
                extension_name: "tpcds",
                loaded: false,
                installed: false,
                install_path: "",
                description: "Adds TPC-DS data generation and query support",
                aliases: [],
            },
            {
                extension_name: "tpch",
                loaded: false,
                installed: false,
                install_path: "",
                description: "Adds TPC-H data generation and query support",
                aliases: [],
            },
            {
                extension_name: "visualizer",
                loaded: false,
                installed: false,
                install_path: "",
                description:
                    "Creates an HTML-based visualization of the query plan",
                aliases: [],
            },
        ])
    })
})
