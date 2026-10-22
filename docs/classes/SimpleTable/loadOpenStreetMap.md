[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / loadOpenStreetMap

# Method: loadOpenStreetMap()

> **loadOpenStreetMap**(`source`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:901](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L901)

Loads OpenStreetMap data into the table from a local `.osm` or `.osm.pbf` file, a remote file URL, or an Overpass bounding-box query. Pass a path or URL string to load an existing file, or pass a bounding box with `filters` to download matching features.

DuckDB's [Osmium community extension](https://duckdb.org/community_extensions/extensions/osmium) materializes the complete result and reconstructs `geom` as EPSG:4326. By default, that canonical result is cached as GeoParquet in `.sda-cache/osm`. Distinct paths, local file fingerprints, normalized URLs, endpoints, queries, and bounding boxes retain independent entries. The cache has no expiration unless `ttl` is set and can be cleared by removing `.sda-cache/osm`. Immutable URLs can safely use the default indefinite cache; mutable URLs should set a TTL.

Bounding-box filters use the standard [Overpass QL filter syntax](https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL#Filters). Equality filters are passed as `[key, value]` tuples and serialized by the method. A raw filter fragment string can be used for advanced Overpass filters.

The default Overpass endpoint is a shared public service. Follow the [Overpass public-instance usage guidelines](https://dev.overpass-api.de/overpass-doc/en/preface/commons.html), and configure another endpoint or run your own instance for high-volume usage.

OpenStreetMap data is licensed under the [Open Data Commons Open Database License](https://www.openstreetmap.org/copyright). Public use requires [OpenStreetMap attribution](https://osmfoundation.org/wiki/Licence/Attribution_Guidelines), and distributing OSM or derivative databases can trigger the licence's share-alike requirements.

## Parameters

### source

`string` \| \{ `east`: `number`; `north`: `number`; `south`: `number`; `west`: `number`; \}

The local path or remote URL of an existing `.osm` or `.osm.pbf` file, or a bounding box to query through Overpass.

`string`

***

#### Type Literal

\{ `east`: `number`; `north`: `number`; `south`: `number`; `west`: `number`; \}

The local path or remote URL of an existing `.osm` or `.osm.pbf` file, or a bounding box to query through Overpass.

##### east

`number`

The eastern longitude, between -180 and 180 and greater than `west`.

##### north

`number`

The northern latitude, between -90 and 90 and greater than `south`.

##### south

`number`

The southern latitude, between -90 and 90 and less than `north`.

##### west

`number`

The western longitude, between -180 and 180 and less than `east`.

### options?

Loading options. When `source` is a bounding box, `options.filters` must be provided.

#### cache?

`boolean`

Whether to read and write the processed GeoParquet cache. Defaults to `true`.

#### endpoint?

`string`

The Overpass interpreter endpoint. Defaults to `https://overpass-api.de/api/interpreter`.

#### filters?

`string` \| \[`string`, `string`\] \| \[`string`, `string`\][]

For a bounding-box query, one `[key, value]` tuple or an array of tuples. Array entries are combined as a union. A raw Overpass QL filter fragment string is also accepted.

#### retries?

`number`

Additional network retries after the initial request. Defaults to `3`, for up to four attempts. Network-only; passing it for a local path throws an error.

#### retryDelay?

`number`

Base retry delay in seconds. Defaults to `5`, producing deterministic delays of 5, 10, and 20 seconds. A longer valid `Retry-After` value takes precedence. Network-only; passing it for a local path throws an error.

#### timeout?

`number`

A positive integer timeout in seconds, applied to both the Overpass query and HTTP request. If omitted, the endpoint's default query timeout applies and no HTTP request timeout is set.

#### ttl?

`number`

Cache lifetime in seconds. Omit for no expiration, use `0` to refresh the matching cache entry immediately, or provide a positive value to refresh once the processed entry reaches that age. Cannot be combined with `cache: false`.

#### verbose?

`boolean`

Whether to log OpenStreetMap cache, network, Osmium, cleanup, and timing lifecycle details. Defaults to `false`. `SimpleDB({ cacheVerbose: true })` also enables these messages and is not overridden by `verbose: false`.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Load an existing local OpenStreetMap PBF file
await table.loadOpenStreetMap("./montreal.osm.pbf").log();
```

```ts
// Filter and project after the complete canonical source has loaded
await table
  .loadOpenStreetMap("./montreal.osm.pbf", { verbose: true })
  .filter("tags['amenity'] = 'school'")
  .selectColumns(["id", "tags", "geom"])
  .log();
```

```ts
// Download features matching one equality filter within a bounding box
await table
  .loadOpenStreetMap(
    { west: -73.587799, south: 45.445078, east: -73.552265, north: 45.471086 },
    { filters: ["amenity", "school"] },
  )
  .log();
```

```ts
// Download features matching either equality filter
await table.loadOpenStreetMap(
  { west: -73.587799, south: 45.445078, east: -73.552265, north: 45.471086 },
  {
    filters: [["amenity", "school"], ["amenity", "college"]],
  },
).log();
```

```ts
// Use a raw Overpass filter fragment for an advanced filter
await table.loadOpenStreetMap(
  { west: -73.587799, south: 45.445078, east: -73.552265, north: 45.471086 },
  { filters: `["amenity"~"school|college"]` },
).log();
```

## Inherited from

`SimpleTableCore.loadOpenStreetMap`
