[**Simple Data Analysis v6.0.14**](../index.md)

***

[Simple Data Analysis](../globals.md) / SimpleTable

# Class: SimpleTable

Defined in: [src/class/SimpleTable.ts:69](https://github.com/nshiab/simple-data-analysis/blob/v6.0.14/src/class/SimpleTable.ts#L69)

Represents a table within a SimpleDB database, capable of handling tabular, geospatial, and vector data.
Extends the core [`SimpleTable`](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/docs/classes/SimpleTable.md) class
from [`simple-data-analysis-core`](https://github.com/nshiab/simple-data-analysis-core) to include
additional AI, Google Sheets, and charting methods.
Integration dependencies load only when their operations execute, and are reused
by subsequent calls. Core-only pipelines do not load these dependencies.

All core methods are available on this class.
See the [core SimpleTable reference](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/docs/classes/SimpleTable.md)
for inherited methods such as `loadData()`, `filter()`, and `log()`.

## Examples

```ts
// Create a SimpleDB instance (in-memory by default)
const sdb = new SimpleDB();

// Create a table, load a CSV file, and log its first few rows
const employees = await sdb
  .newTable("employees")
  .loadData("./employees.csv")
  .log();

// Close the database connection and free up resources
await sdb.close();
```

```ts
// Handling geospatial data
// Create a SimpleDB instance
const sdb = new SimpleDB();

// Create a table and load geospatial data from a GeoJSON file
const boundaries = await sdb
  .newTable("boundaries")
  .loadGeoData("./boundaries.geojson")
  .log();

// Close the database connection
await sdb.close();
```

## Extends

- `SimpleTable`

## Constructors

### Constructor

> **new SimpleTable**(`name`, `simpleDB`, `options?`): `SimpleTable`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:294](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L294)

Creates an instance of SimpleTable.

#### Parameters

##### name

`string`

The name of the table.

##### simpleDB

`SimpleDB`

The SimpleDB instance that this table belongs to.

##### options?

An optional object with configuration options:

###### charsToLog?

`number`

The maximum characters to display for text and stringified nested cells, including truncation markers (default: 75). Independent of column width. Use Infinity for unlimited text.

###### rowsToLog?

`number`

The number of rows to log when displaying table data.

###### typesToLog?

`boolean`

A boolean indicating whether to include data types when logging a table.

#### Returns

`SimpleTable`

#### Inherited from

`SimpleTableCore.constructor`

## AI

- [aiEmbeddings](SimpleTable/aiEmbeddings.md)
- [aiQuery](SimpleTable/aiQuery.md)
- [aiRAG](SimpleTable/aiRAG.md)
- [aiRowByRow](SimpleTable/aiRowByRow.md)
- [aiVectorSimilarity](SimpleTable/aiVectorSimilarity.md)
- [hybridSearch](SimpleTable/hybridSearch.md)

## Analyzing Data

- [accumulate](SimpleTable/accumulate.md)
- [addSummaryRows](SimpleTable/addSummaryRows.md)
- [bins](SimpleTable/bins.md)
- [columnProportions](SimpleTable/columnProportions.md)
- [correlations](SimpleTable/correlations.md)
- [indexValues](SimpleTable/indexValues.md)
- [linearRegressions](SimpleTable/linearRegressions.md)
- [normalize](SimpleTable/normalize.md)
- [outliersIQR](SimpleTable/outliersIQR.md)
- [quantiles](SimpleTable/quantiles.md)
- [ranks](SimpleTable/ranks.md)
- [rolling](SimpleTable/rolling.md)
- [rowProportions](SimpleTable/rowProportions.md)
- [rowRanks](SimpleTable/rowRanks.md)
- [similarityMahalanobis](SimpleTable/similarityMahalanobis.md)
- [summarize](SimpleTable/summarize.md)
- [zScore](SimpleTable/zScore.md)

## Caching

- [cache](SimpleTable/cache.md)

## Column Operations

- [addColumn](SimpleTable/addColumn.md)
- [addId](SimpleTable/addId.md)
- [addRowNumber](SimpleTable/addRowNumber.md)
- [cleanColumnNames](SimpleTable/cleanColumnNames.md)
- [cloneColumn](SimpleTable/cloneColumn.md)
- [cloneColumnWithOffset](SimpleTable/cloneColumnWithOffset.md)
- [extractDatePart](SimpleTable/extractDatePart.md)
- [hasColumn](SimpleTable/hasColumn.md)
- [removeColumns](SimpleTable/removeColumns.md)
- [renameColumns](SimpleTable/renameColumns.md)

## Dataviz

- [logBarChart](SimpleTable/logBarChart.md)
- [logDotChart](SimpleTable/logDotChart.md)
- [logHistogram](SimpleTable/logHistogram.md)
- [logLineChart](SimpleTable/logLineChart.md)
- [writeChart](SimpleTable/writeChart.md)
- [writeMap](SimpleTable/writeMap.md)

## Exporting Data

- [toBucket](SimpleTable/toBucket.md)
- [toDatawrapper](SimpleTable/toDatawrapper.md)
- [toGeoDatawrapper](SimpleTable/toGeoDatawrapper.md)
- [toSheet](SimpleTable/toSheet.md)

## File Operations

- [writeData](SimpleTable/writeData.md)
- [writeGeoData](SimpleTable/writeGeoData.md)

## Geospatial

- [addBoundingBox](SimpleTable/addBoundingBox.md)
- [addGeoClosedStatus](SimpleTable/addGeoClosedStatus.md)
- [addGeoNoise](SimpleTable/addGeoNoise.md)
- [addGeoType](SimpleTable/addGeoType.md)
- [addGeoValidity](SimpleTable/addGeoValidity.md)
- [addVertexCount](SimpleTable/addVertexCount.md)
- [aggregateGeo](SimpleTable/aggregateGeo.md)
- [area](SimpleTable/area.md)
- [buffer](SimpleTable/buffer.md)
- [centroid](SimpleTable/centroid.md)
- [coveredBy](SimpleTable/coveredBy.md)
- [createPoints](SimpleTable/createPoints.md)
- [difference](SimpleTable/difference.md)
- [distance](SimpleTable/distance.md)
- [extractLatLon](SimpleTable/extractLatLon.md)
- [fillHoles](SimpleTable/fillHoles.md)
- [fixGeo](SimpleTable/fixGeo.md)
- [flipCoordinates](SimpleTable/flipCoordinates.md)
- [getBoundingBox](SimpleTable/getBoundingBox.md)
- [getProjection](SimpleTable/getProjection.md)
- [intersection](SimpleTable/intersection.md)
- [intersects](SimpleTable/intersects.md)
- [joinGeo](SimpleTable/joinGeo.md)
- [length](SimpleTable/length.md)
- [linesToPolygons](SimpleTable/linesToPolygons.md)
- [loadGeoData](SimpleTable/loadGeoData.md)
- [loadOpenStreetMap](SimpleTable/loadOpenStreetMap.md)
- [perimeter](SimpleTable/perimeter.md)
- [reducePrecision](SimpleTable/reducePrecision.md)
- [reproject](SimpleTable/reproject.md)
- [simplify](SimpleTable/simplify.md)
- [union](SimpleTable/union.md)
- [unnestGeo](SimpleTable/unnestGeo.md)

## Getting Data

- [getBottom](SimpleTable/getBottom.md)
- [getCharacterCount](SimpleTable/getCharacterCount.md)
- [getColumnCount](SimpleTable/getColumnCount.md)
- [getColumns](SimpleTable/getColumns.md)
- [getData](SimpleTable/getData.md)
- [getDataAsCSV](SimpleTable/getDataAsCSV.md)
- [getDescription](SimpleTable/getDescription.md)
- [getExtent](SimpleTable/getExtent.md)
- [getFirstRow](SimpleTable/getFirstRow.md)
- [getGeoData](SimpleTable/getGeoData.md)
- [getHash](SimpleTable/getHash.md)
- [getLastRow](SimpleTable/getLastRow.md)
- [getMax](SimpleTable/getMax.md)
- [getMean](SimpleTable/getMean.md)
- [getMedian](SimpleTable/getMedian.md)
- [getMin](SimpleTable/getMin.md)
- [getName](SimpleTable/getName.md)
- [getQuantile](SimpleTable/getQuantile.md)
- [getRow](SimpleTable/getRow.md)
- [getRowCount](SimpleTable/getRowCount.md)
- [getSchema](SimpleTable/getSchema.md)
- [getSkew](SimpleTable/getSkew.md)
- [getStdDev](SimpleTable/getStdDev.md)
- [getSum](SimpleTable/getSum.md)
- [getTop](SimpleTable/getTop.md)
- [getTypes](SimpleTable/getTypes.md)
- [getUniques](SimpleTable/getUniques.md)
- [getValueCount](SimpleTable/getValueCount.md)
- [getValues](SimpleTable/getValues.md)
- [getVariance](SimpleTable/getVariance.md)
- [stream](SimpleTable/stream.md)

## Graph Operations

- [commonNeighbors](SimpleTable/commonNeighbors.md)
- [connectedComponents](SimpleTable/connectedComponents.md)
- [degree](SimpleTable/degree.md)
- [distances](SimpleTable/distances.md)
- [findCycles](SimpleTable/findCycles.md)
- [neighbors](SimpleTable/neighbors.md)
- [paths](SimpleTable/paths.md)
- [reachable](SimpleTable/reachable.md)
- [shortestPath](SimpleTable/shortestPath.md)
- [topologicalSort](SimpleTable/topologicalSort.md)

## Importing Data

- [insertRows](SimpleTable/insertRows.md)
- [insertTables](SimpleTable/insertTables.md)
- [loadArray](SimpleTable/loadArray.md)
- [loadData](SimpleTable/loadData.md)
- [loadSample](SimpleTable/loadSample.md)
- [loadStatCanData](SimpleTable/loadStatCanData.md)
- [loadYahooFinanceData](SimpleTable/loadYahooFinanceData.md)

## Loading Data

- [loadBucket](SimpleTable/loadBucket.md)
- [loadDatawrapper](SimpleTable/loadDatawrapper.md)
- [loadGeoDatawrapper](SimpleTable/loadGeoDatawrapper.md)
- [loadSheet](SimpleTable/loadSheet.md)

## Logging

- [log](SimpleTable/log.md)
- [logBottom](SimpleTable/logBottom.md)
- [logColumns](SimpleTable/logColumns.md)
- [logDescription](SimpleTable/logDescription.md)
- [logExtent](SimpleTable/logExtent.md)
- [logProjections](SimpleTable/logProjections.md)
- [logRowCount](SimpleTable/logRowCount.md)
- [logTypes](SimpleTable/logTypes.md)
- [logUniques](SimpleTable/logUniques.md)

## Other

### charsToLog

> **charsToLog**: `number` \| `undefined`

Defined in: [simple-data-analysis-core/src/class/Simple.ts:32](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/Simple.ts#L32)

The maximum number of characters to display for text and stringified nested cells, including the truncation marker. This does not control column width. Set to Infinity to show the entire text.

#### Example

```ts
const sdb = new SimpleDB({ charsToLog: 150 });
await sdb.newTable().loadArray([{ text: "x".repeat(200) }]).log();
```

#### Default Value

`75`

#### Inherited from

`SimpleTableCore.charsToLog`

***

### connection

> **connection**: `DuckDBConnection`

Defined in: [simple-data-analysis-core/src/class/Simple.ts:40](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/Simple.ts#L40)

A connection to a DuckDB database.

#### Inherited from

`SimpleTableCore.connection`

***

### db

> **db**: `DuckDBInstance`

Defined in: [simple-data-analysis-core/src/class/Simple.ts:36](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/Simple.ts#L36)

A DuckDB database instance.

#### Inherited from

`SimpleTableCore.db`

***

### defaultTableName

> **defaultTableName**: `boolean`

Defined in: [simple-data-analysis-core/src/class/Simple.ts:46](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/Simple.ts#L46)

A flag indicating if the table name was assigned by default.

#### Default Value

`false`

#### Inherited from

`SimpleTableCore.defaultTableName`

***

### rowsToLog

> **rowsToLog**: `number`

Defined in: [simple-data-analysis-core/src/class/Simple.ts:14](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/Simple.ts#L14)

The number of rows to display when logging a table.

#### Default Value

`10`

#### Inherited from

`SimpleTableCore.rowsToLog`

***

### runQuery

> **runQuery**: (`query`, `connection`, `returnData`, `options`) => `Promise`\<`object`[] \| `null`\>

Defined in: [simple-data-analysis-core/src/class/Simple.ts:73](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/Simple.ts#L73)

A function for running SQL queries. Subclasses can wrap this seam to observe
execution while forwarding every argument. To run custom SQL, use
`SimpleDB.customQuery()` instead.

#### Parameters

##### query

`string`

The exact SQL statement to execute.

##### connection

`DuckDBConnection`

The DuckDB connection that executes the statement.

##### returnData

`boolean`

Whether to convert and return result rows.

##### options

Error-attribution, binding, and observability options.

###### explainSQL

`boolean`

Whether to log a supported DuckDB query plan before execution.

###### logSQL

`boolean`

Whether to log the SQL immediately before execution.

###### method

`string` \| `null`

The SDA method responsible for the query, when available.

###### parameters

\{\[`key`: `string`\]: `unknown`; \} \| `null`

The method arguments recorded for error attribution.

###### table?

`string` \| `null`

The table associated with returned values and warnings.

###### values?

`DuckDBValue`[]

Data values bound to placeholders in the SQL statement.

#### Returns

`Promise`\<`object`[] \| `null`\>

The converted rows when requested, otherwise `null`.

#### Example

```ts
const original = table.runQuery;
table.runQuery = (query, connection, returnData, options) => {
  console.log(query);
  return original(query, connection, returnData, options);
};
```

#### Inherited from

`SimpleTableCore.runQuery`

***

### typesToLog

> **typesToLog**: `boolean`

Defined in: [simple-data-analysis-core/src/class/Simple.ts:20](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/Simple.ts#L20)

A flag indicating whether to include data types when logging a table.

#### Default Value

`false`

#### Inherited from

`SimpleTableCore.typesToLog`

## Properties

### indexes

> **indexes**: (\{ `column`: `string`; `kind`: `"vss"`; `name`: `string`; `options`: \{ `efConstruction?`: `number`; `efSearch?`: `number`; `M?`: `number`; \}; \} \| \{ `idColumn`: `string`; `kind`: `"fts"`; `name`: `string`; `options`: \{ `ignore?`: `string`; `lower?`: `boolean`; `stemmer?`: `string`; `stopwords?`: `string`; `stripAccents?`: `boolean`; \}; `textColumn`: `string`; \})[]

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:243](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L243)

The definitions of the indexes belonging to the table, if any. Do not
mutate this array directly.

#### Example

```ts
console.log(table.indexes);
// [{ kind: "vss", name: "vss_cosine_index_articles", ... }]
```

#### Default Value

`[]`

#### Inherited from

`SimpleTableCore.indexes`

## Restructuring Data

- [longer](SimpleTable/longer.md)
- [sort](SimpleTable/sort.md)
- [wider](SimpleTable/wider.md)

## Selecting or Filtering Data

- [filter](SimpleTable/filter.md)
- [keepValues](SimpleTable/keepValues.md)
- [removeDuplicates](SimpleTable/removeDuplicates.md)
- [removeMissing](SimpleTable/removeMissing.md)
- [removeRows](SimpleTable/removeRows.md)
- [removeValues](SimpleTable/removeValues.md)
- [sample](SimpleTable/sample.md)
- [selectColumns](SimpleTable/selectColumns.md)
- [selectRows](SimpleTable/selectRows.md)
- [skip](SimpleTable/skip.md)

## Table Management

- [clone](SimpleTable/clone.md)
- [removeTable](SimpleTable/removeTable.md)
- [renameTable](SimpleTable/renameTable.md)
- [run](SimpleTable/run.md)
- [setTypes](SimpleTable/setTypes.md)

## Table Operations

- [crossJoin](SimpleTable/crossJoin.md)
- [fuzzyJoin](SimpleTable/fuzzyJoin.md)
- [join](SimpleTable/join.md)

## Text Processing

- [addCharacterCount](SimpleTable/addCharacterCount.md)
- [addWordCount](SimpleTable/addWordCount.md)
- [normalizeString](SimpleTable/normalizeString.md)

## Text Search

- [bm25](SimpleTable/bm25.md)
- [createFtsIndex](SimpleTable/createFtsIndex.md)

## Updating Data

- [addNoise](SimpleTable/addNoise.md)
- [capitalize](SimpleTable/capitalize.md)
- [concatenate](SimpleTable/concatenate.md)
- [convert](SimpleTable/convert.md)
- [fill](SimpleTable/fill.md)
- [firstChars](SimpleTable/firstChars.md)
- [fuzzyClean](SimpleTable/fuzzyClean.md)
- [lastChars](SimpleTable/lastChars.md)
- [lower](SimpleTable/lower.md)
- [nest](SimpleTable/nest.md)
- [pad](SimpleTable/pad.md)
- [repeatRows](SimpleTable/repeatRows.md)
- [replace](SimpleTable/replace.md)
- [replaceNulls](SimpleTable/replaceNulls.md)
- [round](SimpleTable/round.md)
- [rowToText](SimpleTable/rowToText.md)
- [rowToVector](SimpleTable/rowToVector.md)
- [splitExtract](SimpleTable/splitExtract.md)
- [splitSpread](SimpleTable/splitSpread.md)
- [trim](SimpleTable/trim.md)
- [truncate](SimpleTable/truncate.md)
- [unnest](SimpleTable/unnest.md)
- [updateColumn](SimpleTable/updateColumn.md)
- [updateWithJS](SimpleTable/updateWithJS.md)
- [upper](SimpleTable/upper.md)

## Vector Operations

- [normalizeVector](SimpleTable/normalizeVector.md)

## Vector Search

- [createVssIndex](SimpleTable/createVssIndex.md)
- [hdbscan](SimpleTable/hdbscan.md)
- [umap](SimpleTable/umap.md)
