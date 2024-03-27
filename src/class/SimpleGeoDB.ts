import getDuckDB from "../helpers/getDuckDB.js"
import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "./SimpleDB.js"

/**
 * SimpleGeoDB extends the SimpleDB class by adding methods for geospatial analysis. This class provides a simplified interface for working with DuckDB, a high-performance in-memory analytical database. This class is meant to be used in a web browser. For NodeJS and similar runtimes, use SimpleNodeDB with the spatial option set to true.
 *
 * Here's how to instantiate a SimpleGeoDB instance.
 *
 * ```ts
 * const sdb = new SimpleGeoDB()
 * ```
 *
 * The start() method will be called internally automatically with the first method you'll run. It initializes DuckDB and establishes a connection to the database. It loads the [spatial](https://duckdb.org/docs/extensions/spatial) extension.
 *
 */
export default class SimpleGeoDB extends SimpleDB {
    constructor(
        options: {
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        super(options)
        this.spatial = true
    }

    /**
     * Initializes DuckDB and establishes a connection to the database. It installs and loads the [spatial](https://duckdb.org/docs/extensions/spatial) extension. It's called automatically with the first method you'll run.
     */
    async start() {
        this.debug && console.log("\nstart()\n")
        const duckDB = await getDuckDB()
        this.db = duckDB.db
        this.connection = await this.db.connect()
        this.connection.query("INSTALL spatial; LOAD spatial;") // Not working?
        this.worker = duckDB.worker
    }

    /**
     * Creates or replaces a table and loads geospatial data from an external file into it.
     *
     * ```ts
     * // With a URL
     * await sdb.loadGeoData("tableGeo", "https://some-website.com/some-data.geojson")
     *
     * // With a local file
     * await sdb.loadGeoData("tableGeo", "./some-data.geojson")
     * ```
     *
     * @param table - The name of the new table.
     * @param file - The URL or path to the external file containing the geospatial data.
     *
     * @category Geospatial
     */
    async loadGeoData(table: string, file: string) {
        if (this.spatial === false) {
            // Just for SimpleNodeDB
            throw new Error(
                "You must instanciate with spatial set to true => new SimpleNodeDB({spatial: true})"
            )
        }

        await queryDB(
            this,
            `CREATE OR REPLACE TABLE ${table} AS SELECT * FROM ST_Read('${file}');`,
            mergeOptions(this, {
                table,
                method: "loadGeoData()",
                parameters: { table, file },
            })
        )
    }

    /**
     * Checks if a geometry is valid.
     *
     * ```ts
     * // Checks if the geometries in column geom from table tableGeo are valid and returns a boolean in column isValid.
     * await sdb.isValidGeo("tableGeo", "geom", "isValid")
     * ```
     *
     * @param table - The name of the table storing the geospatial data.
     * @param column - The name of the column storing the geometries.
     * @param newColumn - The name of the new column storing the results.
     *
     * @category Geospatial
     */
    async isValidGeo(table: string, column: string, newColumn: string) {
        await queryDB(
            this,
            `ALTER TABLE ${table} ADD COLUMN "${newColumn}" BOOLEAN; UPDATE ${table} SET "${newColumn}" = ST_IsValid("${column}")`,
            mergeOptions(this, {
                table,
                method: "isValidGeo()",
                parameters: { table, column },
            })
        )
    }

    /**
     * Flips the coordinates of a geometry. Useful for some geojson files which have lat and lon inverted.
     *
     * ```ts
     * await sdb.flipCoordinates("tableGeo", "geom")
     * ```
     *
     * @param table - The name of the table storing the geospatial data.
     * @param column - The name of the column storing the geometries.
     *
     * @category Geospatial
     */
    async flipCoordinates(table: string, column: string) {
        await queryDB(
            this,
            `UPDATE ${table} SET "${column}" = ST_FlipCoordinates("${column}")`,
            mergeOptions(this, {
                table,
                method: "flipCoordinates()",
                parameters: { table, column },
            })
        )
    }

    /**
     * Reprojects the data from one Spatial Reference System (SRS) to another.
     *
     * ```ts
     * // From EPSG:3347 (also called NAD83/Statistics Canada Lambert with coordinates in meters) to EPSG:4326 (also called WGS84, with lat and lon in degrees)
     * await sdb.reproject("tableGeo", "geom", "EPSG:3347", "EPSG:4326")
     * ```
     * @param table - The name of the table storing the geospatial data.
     * @param column - The name of the column storing the geometries.
     * @param from - The original SRS.
     * @param to - The target SRS.
     * @category Geospatial
     */
    async reproject(table: string, column: string, from: string, to: string) {
        await queryDB(
            this,
            `UPDATE ${table} SET "${column}" = ST_Transform("${column}", '${from}', '${to}')`,
            mergeOptions(this, {
                table,
                method: "reproject()",
                parameters: { table, column, from, to },
            })
        )
    }

    /**
     * Computes the area of geometries. The values are returned in the SRS unit.
     *
     * ```ts
     * // Computes the area of the geometries in the column geom from the table tableGeo, and returns the results in the column area.
     * await sdb.area("tableGeo", "geom", "area")
     * ```
     *
     * @param table - The name of the table storing the geospatial data.
     * @param column - The name of the column storing the geometries.
     * @param newColumn - The name of the new column storing the computed areas.
     *
     * @category Geospatial
     */
    async area(table: string, column: string, newColumn: string) {
        await queryDB(
            this,
            `ALTER TABLE ${table} ADD "${newColumn}" DOUBLE; UPDATE ${table} SET "${newColumn}" =  ST_Area("${column}");`,
            mergeOptions(this, {
                table,
                method: "area()",
                parameters: { table, column, newColumn },
            })
        )
    }

    /**
     * Computes the intersection of geometries.
     *
     * ```ts
     * // Computes the intersection of geometries in geomA and geomB columns from table tableGeo and puts the new geometries in column inter.
     * await sdb.intersection("tableGeo", ["geomA", "geomB"], "inter")
     * ```
     *
     * @param table - The name of the table storing the geospatial data.
     * @param columns - The names of the two columns storing the geometries.
     * @param newColumn - The name of the new column storing the computed intersections.
     *
     * @category Geospatial
     */
    async intersection(
        table: string,
        columns: [string, string],
        newColumn: string
    ) {
        if (columns.length !== 2) {
            throw new Error(
                `The columns parameters must be an array with two strings. For example: ["geomA", "geomB"].`
            )
        }
        await queryDB(
            this,
            `ALTER TABLE ${table} ADD "${newColumn}" GEOMETRY; UPDATE ${table} SET "${newColumn}" = ST_Intersection("${columns[0]}", "${columns[1]}")`,
            mergeOptions(this, {
                table,
                method: "intersection()",
                parameters: { table, columns, newColumn },
            })
        )
    }

    /**
     * Simplifies the geometries while preserving their topology. The simplification occurs on an object-by-object basis.
     *
     * ```ts
     * // Simplifies with a tolerance of 0.1. A higher tolerance results in a more significant simplification.
     * await sdb.simplify("tableGeo", "geomA", 0.1)
     * ```
     *
     * @param table - The name of the table storing the geospatial data.
     * @param column - The name of the column storing the geometries.
     *
     * @category Geospatial
     */
    async simplify(table: string, column: string, tolerance: number) {
        await queryDB(
            this,
            `UPDATE ${table} SET "${column}" = ST_SimplifyPreserveTopology("${column}", ${tolerance})`,
            mergeOptions(this, {
                table,
                method: "simplify()",
                parameters: { table, column, tolerance },
            })
        )
    }

    /**
     * Computes the centroid of geometries. The values are returned in the SRS unit.
     *
     * ```ts
     * // Computes the centroid of the geometries in the column geom from the table tableGeo, and returns the results in the column centroid.
     * await sdb.centroid("tableGeo", "geom", "centroid")
     * ```
     *
     * @param table - The name of the table storing the geospatial data.
     * @param column - The name of the column storing the geometries.
     * @param newColumn - The name of the new column storing the centroids.
     *
     * @category Geospatial
     */
    async centroid(table: string, column: string, newColumn: string) {
        await queryDB(
            this,
            `ALTER TABLE ${table} ADD "${newColumn}" GEOMETRY; UPDATE ${table} SET "${newColumn}" =  ST_Centroid("${column}");`,
            mergeOptions(this, {
                table,
                method: "centroid()",
                parameters: { table, column, newColumn },
            })
        )
    }
}
