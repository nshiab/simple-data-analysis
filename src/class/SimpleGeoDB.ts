import getDuckDB from "../helpers/getDuckDB.js"
import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import aggregateGeoQuery from "../methods/aggregateGeoQuery.js"
import distanceQuery from "../methods/distanceQuery.js"
import getGeoData from "../methods/getGeoData.js"
import getProjection from "../methods/getProjection.js"
import joinGeo from "../methods/joinGeo.js"
import SimpleDB from "./SimpleDB.js"

/**
 * SimpleGeoDB extends the SimpleDB class by adding methods for geospatial analysis. This class provides a simplified interface for working with DuckDB, a high-performance in-memory analytical database. This class is meant to be used in a web browser. For NodeJS and similar runtimes, use SimpleNodeDB with the spatial option set to true.
 *
 * Here's how to instantiate a SimpleGeoDB instance.
 *
 * ```ts
 * const sdb = new SimpleGeoDB()
 *
 * // Same thing but will log useful information in the console. The first 20 rows of tables will be logged.
 * const sdb = new SimpleDB({ debug: true, nbRowsToLog: 20})
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
        this.connection.query("INSTALL spatial; LOAD spatial;")
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
     * Creates point geometries from longitude a latitude columns.
     *
     * ```ts
     * // Uses the columns "lat" and "lon" from "tableA" to create point geometries in column "geom"
     * await sdb.points("tableA", "lat", "lon", "geom")
     * ```
     * @category Geospatial
     */
    async points(
        table: string,
        columnLon: string,
        columnLat: string,
        newColumn: string
    ) {
        await queryDB(
            this,
            `ALTER TABLE ${table} ADD COLUMN "${newColumn}" GEOMETRY; UPDATE ${table} SET "${newColumn}" = ST_Point2D("${columnLon}", "${columnLat}")`,
            mergeOptions(this, {
                table,
                method: "points()",
                parameters: { table, columnLat, columnLon, newColumn },
            })
        )
    }

    /**
     * Adds a column with TRUE/FALSE values depending on the validity of geometries.
     *
     * ```ts
     * // Checks if the geometries in column geom from table tableGeo are valid and returns a boolean in column valid.
     * await sdb.isValidGeo("tableGeo", "geom", "valid")
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
                parameters: { table, column, newColumn },
            })
        )
    }

    /**
     * Adds a column with TRUE if the geometry is closed and FALSE if it's open.
     *
     * ```ts
     * // Checks if the geometries in column geom from table tableGeo are closed and returns a boolean in column closed.
     * await sdb.isClosedGeo("tableGeo", "geom", "closed")
     * ```
     *
     * @param table - The name of the table storing the geospatial data.
     * @param column - The name of the column storing the geometries.
     * @param newColumn - The name of the new column storing the results.
     *
     * @category Geospatial
     */
    async isClosedGeo(table: string, column: string, newColumn: string) {
        await queryDB(
            this,
            `ALTER TABLE ${table} ADD COLUMN "${newColumn}" BOOLEAN; UPDATE ${table} SET "${newColumn}" = ST_IsClosed("${column}")`,
            mergeOptions(this, {
                table,
                method: "isClosedGeo()",
                parameters: { table, column, newColumn },
            })
        )
    }

    /**
     * Adds a column with the geometry type.
     *
     * ```ts
     * // Returns the geometry type in column type.
     * await sdb.typeGeo("tableGeo", "geom", "type")
     * ```
     *
     * @param table - The name of the table storing the geospatial data.
     * @param column - The name of the column storing the geometries.
     * @param newColumn - The name of the new column storing the results.
     *
     * @category Geospatial
     */
    async typeGeo(table: string, column: string, newColumn: string) {
        await queryDB(
            this,
            `ALTER TABLE ${table} ADD COLUMN "${newColumn}" VARCHAR; UPDATE ${table} SET "${newColumn}" = ST_GeometryType("${column}")`,
            mergeOptions(this, {
                table,
                method: "typeGeo()",
                parameters: { table, column, newColumn },
            })
        )
    }

    /**
     * Flips the coordinates of geometries. Useful for some geojson files which have lat and lon inverted.
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
     * Reduce the precision of geometries.
     *
     * ```ts
     * // Reduce the precision to 3 decimals.
     * await sdb.reducePrecision("tableGeo", "geom", 3)
     * ```
     *
     * @param table - The name of the table storing the geospatial data.
     * @param column - The name of the column storing the geometries.
     *
     * @category Geospatial
     */
    async reducePrecision(table: string, column: string, decimals: number) {
        await queryDB(
            this,
            `UPDATE ${table} SET "${column}" = ST_ReducePrecision("${column}", ${1 / Math.pow(10, decimals)})`,
            mergeOptions(this, {
                table,
                method: "reducePrecision()",
                parameters: { table, column, decimals },
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
     * Computes the area of geometries in square meters or optionally square kilometers. The input geometry is assumed to be in the EPSG:4326 coordinate system (WGS84), with [latitude, longitude] axis order.
     *
     * ```ts
     * // Computes the area of the geometries in the column geom from the table tableGeo, and returns the results in the column area.
     * await sdb.area("tableGeo", "geom", "area")
     *
     * // Same things but in square kilometers
     * await sdb.area("tableGeo", "geom", "area", { unit: "km2"})
     * ```
     *
     * @param table - The name of the table storing the geospatial data.
     * @param column - The name of the column storing the geometries.
     * @param newColumn - The name of the new column storing the computed areas.
     * @param options - An optional object with configuration options:
     *   @param options.unit - The area can be returned as square meters or square kilometers.
     *
     * @category Geospatial
     */
    async area(
        table: string,
        column: string,
        newColumn: string,
        options: { unit?: "m2" | "km2" } = {}
    ) {
        await queryDB(
            this,
            `ALTER TABLE ${table} ADD "${newColumn}" DOUBLE; UPDATE ${table} SET "${newColumn}" =  ST_Area_Spheroid("${column}") ${options.unit === "km2" ? "/ 1000000" : ""};`,
            mergeOptions(this, {
                table,
                method: "area()",
                parameters: { table, column, newColumn, options },
            })
        )
    }

    /**
     * Computes the length of line geometries in meters or optionally kilometers. The input geometry is assumed to be in the EPSG:4326 coordinate system (WGS84), with [latitude, longitude] axis order.
     *
     * ```ts
     * // Computes the length of the geometries in the column geom from the table tableGeo, and returns the results in the column length.
     * await sdb.length("tableGeo", "geom", "length")
     *
     * // Same things but in kilometers.
     * await sdb.length("tableGeo", "geom", "length", { unit: "km"})
     * ```
     *
     * @param table - The name of the table storing the geospatial data.
     * @param column - The name of the column storing the geometries.
     * @param newColumn - The name of the new column storing the computed lengths.
     * @param options - An optional object with configuration options:
     *   @param options.unit - The length can be returned as meters or kilometers.
     *
     * @category Geospatial
     */
    async length(
        table: string,
        column: string,
        newColumn: string,
        options: { unit?: "m" | "km" } = {}
    ) {
        await queryDB(
            this,
            `ALTER TABLE ${table} ADD "${newColumn}" DOUBLE; UPDATE ${table} SET "${newColumn}" =  ST_Length_Spheroid("${column}") ${options.unit === "km" ? "/ 1000" : ""};`,
            mergeOptions(this, {
                table,
                method: "length()",
                parameters: { table, column, newColumn, options },
            })
        )
    }

    /**
     * Computes the perimeter of polygon geometries in meters or optionally kilometers. The input geometry is assumed to be in the EPSG:4326 coordinate system (WGS84), with [latitude, longitude] axis order.
     *
     * ```ts
     * // Computes the perimeter of the geometries in the column geom from the table tableGeo, and returns the results in the column perim.
     * await sdb.perimeter("tableGeo", "geom", "perim")
     *
     * // Same things but in kilometers.
     * await sdb.perimeter("tableGeo", "geom", "perim", { unit: "km"})
     * ```
     *
     * @param table - The name of the table storing the geospatial data.
     * @param column - The name of the column storing the geometries.
     * @param newColumn - The name of the new column storing the computed perimeters.
     * @param options - An optional object with configuration options:
     *   @param options.unit - The perimeter can be returned as meters or kilometers.
     *
     * @category Geospatial
     */
    async perimeter(
        table: string,
        column: string,
        newColumn: string,
        options: { unit?: "m" | "km" } = {}
    ) {
        await queryDB(
            this,
            `ALTER TABLE ${table} ADD "${newColumn}" DOUBLE; UPDATE ${table} SET "${newColumn}" =  ST_Perimeter_Spheroid("${column}") ${options.unit === "km" ? "/ 1000" : ""};`,
            mergeOptions(this, {
                table,
                method: "perimeter()",
                parameters: { table, column, newColumn, options },
            })
        )
    }

    /**
     * Computes a buffer around geometries based on a specified distance. The distance is in the SRS unit.
     *
     * ```ts
     * // Creates new geomeotries from the geometries in column geom with a buffer of 1 and puts the results in column buffer.
     * await sdb.buffer("tableGeo", "geom", "buffer", 1)
     * ```
     * @param table - The name of the table storing the geospatial data.
     * @param column - The name of the column storing the geometries.
     * @param newColumn - The name of the new column to store the buffered geometries.
     * @param distance - The distance for the buffer, in SRS unit.
     *
     * @category Geospatial
     */
    async buffer(
        table: string,
        column: string,
        newColumn: string,
        distance: number
    ) {
        await queryDB(
            this,
            `ALTER TABLE ${table} ADD "${newColumn}" GEOMETRY; UPDATE ${table} SET "${newColumn}" =  ST_Buffer("${column}", ${distance});`,
            mergeOptions(this, {
                table,
                method: "buffer()",
                parameters: { table, column, newColumn, distance },
            })
        )
    }

    /**
     * Merges the data of two tables based on a spatial join. Note that the returned data is not guaranteed to be in the same order as the original tables. With SimpleNodeDB, it might create a .tmp folder, so make sure to add .tmp to your gitignore.
     *
     * ```ts
     * // Merges data of tableA and tableB based on geometries that intersect in tableA and tableB. By default, the method looks for columns named 'geom' storing the geometries in the tables, does a left join and overwrites leftTable (tableA) with the results. The method also appends the name of the table to the 'geom' columns in the returned data.
     * await sdb.joinGeo("tableA", "intersect", "tableB",)
     *
     * // Same thing but with specific column names storing geometries, a specific join type, and returning the results in a new table.
     * await sdb.joinGeo("tableA", "intersect", "tableB", {geoColumnLeft: "geometriesA", geoColumnRight: "geometriesB", type: "inner", outputTable: "tableC"})
     *
     * // Merges data based on geometries in table A that are inside geometries in table B. The table order is important.
     * await sdb.joinGeo("tableA", "inside", "tableB")
     * ```
     * @param leftTable - The name of the left table to be joined.
     * @param method - The method for the spatial join.
     * @param rightTable - The name of the right table to be joined.
     * @param options - An optional object with configuration options:
     *   @param options.columnLeftTable - The column storing the geometries in leftTable. It's 'geom' by default.
     *   @param options.columnRightTable - The column storing the geometries in rightTable. It's 'geom' by default.
     *   @param options.type - The type of join operation to perform. For some methods (like 'inside'), the table order is important.
     *   @param options.outputTable - The name of the new table that will store the result of the join operation. Default is the leftTable.
     *
     * @category Geospatial
     */
    async joinGeo(
        leftTable: string,
        method: "intersect" | "inside",
        rightTable: string,
        options: {
            columnLeftTable?: string
            columnRightTable?: string
            type?: "inner" | "left" | "right" | "full"
            outputTable?: string
        } = {}
    ) {
        await joinGeo(this, leftTable, method, rightTable, options)
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
     * Removes the intersection of two geometries.
     *
     * ```ts
     * // Removes the intersection of geomA and geomB from geomA and returns the results in the new column noIntersection.
     * await sdb.removeIntersection("tableGeo", ["geomA", "geomB"], "noIntersection")
     * ```
     *
     * @param table - The name of the table storing the geospatial data.
     * @param columns - The names of the two columns storing the geometries. The order is important.
     * @param newColumn - The name of the new column storing the new geometries.
     *
     * @category Geospatial
     */
    async removeIntersection(
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
            `ALTER TABLE ${table} ADD "${newColumn}" GEOMETRY; UPDATE ${table} SET "${newColumn}" = ST_Difference("${columns[0]}", "${columns[1]}")`,
            mergeOptions(this, {
                table,
                method: "removeIntersection()",
                parameters: { table, columns, newColumn },
            })
        )
    }

    /**
     * Returns true if two geometries intersect.
     *
     * ```ts
     * // Checks if geometries in geomA and in geomB intersect and return true or false in new column inter.
     * await sdb.intersect("tableGeo", ["geomA", "geomB"], "inter")
     * ```
     *
     * @param table - The name of the table storing the geospatial data.
     * @param columns - The names of the two columns storing the geometries.
     * @param newColumn - The name of the new column with true or false values.
     *
     * @category Geospatial
     */
    async intersect(
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
            `ALTER TABLE ${table} ADD "${newColumn}" BOOLEAN; UPDATE ${table} SET "${newColumn}" = ST_Intersects("${columns[0]}", "${columns[1]}")`,
            mergeOptions(this, {
                table,
                method: "intersect()",
                parameters: { table, columns, newColumn },
            })
        )
    }

    /**
     * Computes the union of geometries.
     *
     * ```ts
     * // Computes the union of geometries in geomA and geomB columns from table tableGeo and puts the new geometries in column union.
     * await sdb.union("tableGeo", ["geomA", "geomB"], "union")
     * ```
     *
     * @param table - The name of the table storing the geospatial data.
     * @param columns - The names of the two columns storing the geometries.
     * @param newColumn - The name of the new column storing the computed unions.
     *
     * @category Geospatial
     */
    async union(table: string, columns: [string, string], newColumn: string) {
        if (columns.length !== 2) {
            throw new Error(
                `The columns parameters must be an array with two strings. For example: ["geomA", "geomB"].`
            )
        }
        await queryDB(
            this,
            `ALTER TABLE ${table} ADD "${newColumn}" GEOMETRY; UPDATE ${table} SET "${newColumn}" = ST_Union("${columns[0]}", "${columns[1]}")`,
            mergeOptions(this, {
                table,
                method: "union()",
                parameters: { table, columns, newColumn },
            })
        )
    }

    /**
     * Returns true if all points of a geometry lies inside another geometry.
     *
     * ```ts
     * // Checks if geometries in column geomA are inside geometries in column geomB and return true or false in new column isInside.
     * await sdb.inside("tableGeo", ["geomA", "geomB"], "isInside")
     * ```
     *
     * @param table - The name of the table storing the geospatial data.
     * @param columns - The names of the two columns storing the geometries. The first column holds the geometries that will be tested for containment. The second column stores the geometries to be tested as containers.
     * @param newColumn - The name of the new column with true or false values.
     *
     * @category Geospatial
     */
    async inside(table: string, columns: [string, string], newColumn: string) {
        if (columns.length !== 2) {
            throw new Error(
                `The columns parameters must be an array with two strings. For example: ["geomA", "geomB"].`
            )
        }
        await queryDB(
            this,
            `ALTER TABLE ${table} ADD "${newColumn}" BOOLEAN; UPDATE ${table} SET "${newColumn}" = ST_Covers("${columns[1]}", "${columns[0]}")`,
            mergeOptions(this, {
                table,
                method: "inside()",
                parameters: { table, columns, newColumn },
            })
        )
    }

    /**
     * Extracts the latitude and longitude of points.
     *
     * ```ts
     * // Extracts the latitude and longitude of points from the points in the "geom" column from "tableGeo" and put them in the columns "lat" and "lon"
     * await sdb.latLon("tableGeo", "geom", ["lat", "lon"])
     * ```
     *
     * @param table - The name of the table storing the geospatial data.
     * @param column - The name of the table storing the points.
     * @param newColumns - The names the columns storing the latitude and the longitude, in this order.
     *
     * @category Geospatial
     */
    async latLon(table: string, column: string, newColumns: [string, string]) {
        if (newColumns.length !== 2) {
            throw new Error(
                `The newColumns parameters must be an array with two strings. For example: ["lat", "lon"].`
            )
        }
        await queryDB(
            this,
            `ALTER TABLE ${table} ADD "${newColumns[0]}" DOUBLE; UPDATE ${table} SET "${newColumns[0]}" = ST_Y("${column}");
             ALTER TABLE ${table} ADD "${newColumns[1]}" DOUBLE; UPDATE ${table} SET "${newColumns[1]}" = ST_X("${column}");`,
            mergeOptions(this, {
                table,
                method: "latLon()",
                parameters: { table, column, newColumns },
            })
        )
    }

    /**
     * Simplifies the geometries while preserving their topology. The simplification occurs on an object-by-object basis.
     *
     * ```ts
     * // Simplifies with a tolerance of 0.1.
     * await sdb.simplify("tableGeo", "geomA", 0.1)
     * ```
     *
     * @param table - The name of the table storing the geospatial data.
     * @param column - The name of the column storing the geometries.
     * @param tolerance - A number used for the simplification. A higher tolerance results in a more significant simplification.
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

    /**
     * Computes the distance between geometries. By default, it uses the SRS unit. You can pass "spheroid" or "haversine" as options.method to get results in meters or optionally kilometers. If you do use these methods, the input geometry must use the EPSG:4326 coordinate system (WGS84), with [latitude, longitude] axis order.
     *
     * ```ts
     * // Computes the distance between geometries in columns geomA and geomB. The distance is returned in the new column "distance" in the SRS unit.
     * await sdb.distance("tableGeo", "geomA", "geomB", "distance")
     *
     * // Same but using the haversine distance. The distance is returned in meters by default.
     * await sdb.distance("tableGeo", "geomA", "geomB", "distance", { method: "haversine")
     *
     * // Same but the distance is returned in kilometers.
     * await sdb.distance("tableGeo", "geomA", "geomB", "distance", { method: "haversine", unit: "km"})
     *
     * // Same but using an ellipsoidal model of the earth's surface. It's the most accurate but the slowest. By default, the distance is returned in meters and optionally as kilometers.
     * await sdb.distance("tableGeo", "geomA", "geomB", "distance", { method: "spheroid", unit: "km"})
     * ```
     *
     * @param table - The name of the table storing the geospatial data.
     * @param column1 - The name of a column storing geometries.
     * @param column2 - The name of a column storing geometries.
     * @param newColumn - The name of the new column storing the centroids.
     * @param options - An optional object with configuration options:
     *   @param options.method - The method to be used for the distance calculations. "srs" returns the values in the SRS unit. "spheroid" and "haversine" return the values in meters by default.
     *   @param options.unit - If the method is "spheroid" or "haversine", you can choose between meters or kilometers. It's meters by default.
     *
     * @category Geospatial
     */
    async distance(
        table: string,
        column1: string,
        column2: string,
        newColumn: string,
        options: {
            unit?: "m" | "km"
            method?: "srs" | "haversine" | "spheroid"
        } = {}
    ) {
        await queryDB(
            this,
            distanceQuery(table, column1, column2, newColumn, options),
            mergeOptions(this, {
                table,
                method: "distance()",
                parameters: { table, column1, column2, newColumn },
            })
        )
    }

    /**
     * Unnests geometries recursively.
     *
     * ```ts
     * // Unnests geometries in the column "geom" and returns the same table with unnested items.
     * await sdb.unnestGeo("tableGeo", "geom")
     * ```
     *
     * @param table - The name of the table storing the geospatial data.
     * @param column - The name of a column storing geometries.
     *
     * @category Geospatial
     */
    async unnestGeo(table: string, column: string) {
        await queryDB(
            this,
            `CREATE OR REPLACE TABLE ${table} AS SELECT * EXCLUDE("${column}"), UNNEST(ST_Dump("${column}"), recursive := TRUE) FROM ${table}; ALTER TABLE ${table} DROP COLUMN path;`,
            mergeOptions(this, {
                table,
                method: "unnestGeo()",
                parameters: { table, column },
            })
        )
    }

    /**
     * Aggregates geometries.
     *
     * ```ts
     * // Returns the union of all geometries in the column geom.
     * await sdb.aggregateGeo("tableGeo", "geom", "union")
     *
     * // Same thing but for each value in the column country.
     * await sdb.aggregateGeo("tableGeo", "geom", "union", { categories: "country" })
     *
     * // Same thing but for intersection.
     * await sdb.aggregateGeo("tableGeo", "geom", "intersection", { categories: "country" })
     * ```
     *
     * @param table - The name of the table storing the geospatial data.
     * @param column - The name of the column storing geometries.
     * @param method - The method to use for the aggregation.
     * @param options - An optional object with configuration options:
     *   @param options.categories - The column or columns that define categories for the aggragation. This can be a single column name or an array of column names.
     *   @param options.outputTable - An option to store the results in a new table.
     *
     * @category Geospatial
     */
    async aggregateGeo(
        table: string,
        column: string,
        method: "union" | "intersection",
        options: { categories?: string | string[]; outputTable?: string } = {}
    ) {
        await queryDB(
            this,
            aggregateGeoQuery(table, column, method, options),
            mergeOptions(this, {
                table,
                method: "aggregateGeo()",
                parameters: { table, column, method, options },
            })
        )
    }

    /**
     * Transforms closed lines into polygons.
     *
     * ```ts
     * // Transforms geometries in the column "geom" into polygons.
     * await sdb.linesToPolygons("tableGeo", "geom")
     * ```
     *
     * @param table - The name of the table storing the geospatial data.
     * @param column - The name of a column storing geometries.
     *
     * @category Geospatial
     */
    async linesToPolygons(table: string, column: string) {
        await queryDB(
            this,
            `CREATE OR REPLACE TABLE ${table} AS SELECT * EXCLUDE("${column}"), ST_MakePolygon("${column}") as "${column}" FROM ${table};`,
            mergeOptions(this, {
                table,
                method: "linesToPolygons()",
                parameters: { table, column },
            })
        )
    }

    /**
     * Returns the data as a geojson.
     *
     * ```ts
     * // The colum geom will be used for the features geometries. The other columns in the table will be stored as properties.
     * const geojson = await sdb.getGeoData("tableGeo", "geom")
     * ```
     *
     * @param table - The name of the table storing the geospatial data.
     * @param column - The name of a column storing geometries.
     *
     * @category Geospatial
     */
    async getGeoData(table: string, column: string) {
        return await getGeoData(this, table, column)
    }

    /**
     * Returns the projection of a geospatial data file.
     *
     * ```ts
     * await sdb.getProjection("./some-data.shp")
     * // Returns something like
     * // {
     * //    name: 'WGS 84',
     * //    code: 'ESPG:4326',
     * //    unit: 'degree',
     * //    proj4: '+proj=longlat +datum=WGS84 +no_defs'
     * // }
     * ```
     *
     * @param file - The file storing the geospatial data.
     *
     * @category Geospatial
     */
    async getProjection(file: string) {
        return await getProjection(this, file)
    }
}
