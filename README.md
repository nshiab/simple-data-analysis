# Simple data analysis (SDA)

SDA is an easy-to-use and high-performance TypeScript library for data analysis.
You can use it with tabular, geospatial, and vector data.

The library is available on [JSR](https://jsr.io/@nshiab/simple-data-analysis)
with its [documentation](https://jsr.io/@nshiab/simple-data-analysis/doc) and on
[NPM](https://www.npmjs.com/package/@nshiab/simple-data-analysis).

The documentation is also available as the markdown file
[llm.md](https://github.com/nshiab/simple-data-analysis/blob/main/llm.md), which
can be passed as context to improve the use of the library by AI coding
assistants or agents.

The library is maintained by [Nael Shiab](http://naelshiab.com/), computational
journalist and senior data producer for [CBC News](https://www.cbc.ca/news).

> [!TIP]
> To learn how to use SDA, check out
> [Code Like a Journalist](https://www.code-like-a-journalist.com/), a free and
> open-source data analysis and data visualization course in TypeScript.

You might also find the
[journalism library](https://github.com/nshiab/journalism) interesting.

If you wish to contribute, please check the
[guidelines](https://github.com/nshiab/simple-data-analysis/blob/main/CONTRIBUTING.md).

## Library structure

SDA is split into two packages:

- **[`simple-data-analysis-core`](https://github.com/nshiab/simple-data-analysis-core)**
  contains all core functions that depend on DuckDB (data loading, filtering,
  joining, summarizing, geospatial operations, etc.). If you only need these
  core data analysis capabilities, you can use this lighter package directly.

- **`simple-data-analysis`** (this package) extends the core with additional
  features: AI methods (row-by-row processing, embeddings, vector similarity,
  hybrid search, RAG, natural language queries), Google Sheets integration, and
  charting/dataviz methods. These features are built respectively on the
  [`journalism-ai`](https://jsr.io/@nshiab/journalism-ai),
  [`journalism-google`](https://jsr.io/@nshiab/journalism-google), and
  [`journalism-dataviz`](https://jsr.io/@nshiab/journalism-dataviz) libraries.

Most users will want this package (`simple-data-analysis`), which includes all
of the core functionality plus the extended features.

## Installation

The library is available on [JSR](https://jsr.io/@nshiab/simple-data-analysis)
and [NPM](https://www.npmjs.com/package/@nshiab/simple-data-analysis).

```bash
# Deno
deno add jsr:@nshiab/simple-data-analysis

# Node.js
npm i @nshiab/simple-data-analysis

# Bun
bun add @nshiab/simple-data-analysis
```

## Quick setup

To quickly set up a data project with essential folders, configurations, and
documentation for AI agents, you can use
[@nshiab/setup-data-project](https://github.com/nshiab/setup-data-project).

```bash
# Deno
deno run -A jsr:@nshiab/setup-data-project

# Node
npx @nshiab/setup-data-project

# Bun
bunx @nshiab/setup-data-project
```

## Core principles

SDA is born out of the frustration of switching between Python, R, and
JavaScript to produce data journalism projects. Usually, data crunching and
analysis are done with Python or R, and interactive data visualizations are
coded in JavaScript. However, being proficient in multiple programming languages
is hard. Why can't we do everything in JS?

The missing piece in the JavaScript/TypeScript ecosystem was an easy-to-use and
performant library for data analysis. This is why SDA was created.

The library is based on [DuckDB](https://duckdb.org/), a fast in-process
analytical database. Under the hood, SDA executes SQL queries in DuckDB through
[duckdb-node-neo](https://github.com/duckdb/duckdb-node-neo). SDA also uses
[DuckDB extensions](https://duckdb.org/docs/current/extensions/overview) for
additional capabilities, including
[duckdb_spatial](https://github.com/duckdb/duckdb-spatial) for geospatial
computations and other extensions for fuzzy matching, full-text search, vector
indexes, and more. These extensions are loaded lazily, only when the
corresponding features are used.

To keep data pipelines concise and fast, SDA queues core transformations instead
of executing each one immediately. Consecutive compatible operations are fused
into a single DuckDB statement, reducing database round trips. Transformation
methods are synchronous and chainable; async observer methods such as
`getData()`, `log()`, and `writeData()` flush the queue before producing their
result. This means only the final observer needs to be awaited.

Methods that perform external work—such as AI, Google Sheets, and Datawrapper
methods—remain asynchronous and must still be awaited.

The syntax and the available methods were inspired by
[Pandas](https://github.com/pandas-dev/pandas) (Python) and the
[Tidyverse](https://www.tidyverse.org/) (R). Method and option names are kept
simple and descriptive, so anyone can read an SDA pipeline and understand what
is happening step by step.

## Performance

### Tabular data

To test and compare the library's performance, we calculated the average
temperature per decade and city with the daily temperatures from the
[Adjusted and Homogenized Canadian Climate Data](https://api.weather.gc.ca/collections/ahccd-annual).
See [this repository](https://github.com/nshiab/simple-data-analysis-benchmarks)
for the code.

We ran the same calculations with **simple-data-analysis** (Node.js, Bun, and
Deno), **Pandas (Python)**, and the **tidyverse (R)**.

In each script, we:

1. Loaded a CSV file (_Importing_)
2. Selected four columns, removed rows with missing temperature, converted date
   strings to date and temperature strings to float (_Cleaning_)
3. Added a new column _decade_ and calculated the decade (_Modifying_)
4. Calculated the average temperature per decade and city (_Summarizing_)
5. Wrote the cleaned-up data that we computed the averages from in a new CSV
   file (_Writing_)

Each script has been run ten times on a MacBook Pro (Apple M4 Max / 64 GB).

With _ahccd.csv_:

- 1.7 GB
- 773 cities
- 20 columns
- 22,051,025 rows

Thanks to DuckDB, **simple-data-analysis** is the fastest option.

![A chart showing the processing duration of multiple scripts in various languages](./assets/big-file.png)

### Geospatial data

To test the geospatial computation speed, we performed a spatial join to match
each public tree in Montreal to its neighbourhood. We then counted the number of
trees in each neighbourhood. For more information, check this
[repository](https://github.com/nshiab/simple-data-analysis-spatial-benchmarks).

With _trees.csv_:

- 128 MB
- 316,321 trees
- 33 columns

And _neighbourhoods.geojson_:

- 991 KB
- 91 neighbourhoods
- 6 columns

Each script has been run ten times on a MacBook Pro (Apple M4 Max / 64 GB).

As we can see, **simple-data-analysis** is also the fastest option here.

![A chart showing the processing duration of multiple scripts in various languages, for geospatial computations](./assets/spatial.png)

DuckDB, which powers SDA, can also be used with
[Python](https://duckdb.org/docs/api/python/overview.html) and
[R](https://duckdb.org/docs/api/r).

## Examples

### Tabular data

In this example, we load daily temperatures for three Canadian weather stations,
remove missing values, and compute the average temperature for each station. We
then log the results and write them to a CSV file.

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";

const sdb = new SimpleDB();

const data = await sdb
  .newTable("temperatures")
  .loadData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/dailyTemperatures.csv",
  )
  .renameColumns({ t: "temperature", id: "station" })
  .removeMissing({ columns: "temperature" })
  .summarize({
    columns: "temperature",
    by: "station",
    stats: "mean",
    decimals: 2,
  })
  .sort({ mean: "desc" })
  .log();

await data.writeData("sda/output/averageTemperatures.csv");
await sdb.close();
```

### Geospatial data

In this example, we load a CSV file with the latitude and longitude of 2023
wildfires in Canada, create point geometries from it, do a spatial join with
provinces' boundaries, write the joined data to a GeoJSON file, and then compute
the number of fires and the total area burnt per province.

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";

const sdb = new SimpleDB();

const fires = await sdb
  .newTable("fires")
  .loadData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/geodata/files/firesCanada2023.csv",
  )
  .createPoints("lat", "lon", "geom")
  .log();

const provinces = await sdb
  .newTable("provinces")
  .loadGeoData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/geodata/files/CanadianProvincesAndTerritories.json",
  )
  .log();

const firesInsideProvinces = await fires
  .joinGeo(provinces, "inside", {
    outputTable: "firesInsideProvinces",
  })
  .removeMissing()
  .removeColumns("geomProvinces")
  .log();

// Each fire now has a province value.
await firesInsideProvinces.writeGeoData(
  "sda/output/firesInsideProvinces.geojson",
);

// We can use any other method, such as summarize.
await firesInsideProvinces
  .summarize({
    columns: "hectares",
    by: "nameEnglish",
    stats: { nbFires: "count", burntArea: "sum" },
    decimals: 0,
  })
  .sort({ burntArea: "desc" })
  .log();

await sdb.close();
```

### Data visualisations

#### Charts

You can easily display charts directly in the terminal with the
[`logBarChart`](https://jsr.io/@nshiab/simple-data-analysis/doc/~/SimpleTable.prototype.logBarChart),
[`logDotChart`](https://jsr.io/@nshiab/simple-data-analysis/doc/~/SimpleTable.prototype.logDotChart),
[`logLineChart`](https://jsr.io/@nshiab/simple-data-analysis/doc/~/SimpleTable.prototype.logLineChart)
and
[`logHistogram`](https://jsr.io/@nshiab/simple-data-analysis/doc/~/SimpleTable.prototype.logHistogram)
methods.

But you can also create [Observable Plot](https://github.com/observablehq/plot)
charts as an image file (`.png` or `.svg`) with
[`writeChart`](https://jsr.io/@nshiab/simple-data-analysis/doc/~/SimpleTable.prototype.writeChart).

Here's an example.

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
import { dodgeX, dot, plot } from "@observablehq/plot";

const sdb = new SimpleDB();
const table = await sdb
  .newTable()
  .loadData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/geodata/files/firesCanada2023.csv",
  )
  .filter(`hectares > 1`)
  .replace("cause", { "H": "Human", "N": "Natural", "U": "Unknown" })
  .log();

// We create a beeswarm chart with a log scale, faceted by cause.
await table.writeChart(
  (data) =>
    plot({
      height: 600,
      width: 800,
      color: { legend: true },
      y: { type: "log", label: "Hectares" },
      r: { range: [1, 20] },
      marks: [
        dot(
          data,
          dodgeX("middle", {
            fx: "cause",
            y: "hectares",
            fill: "cause",
            r: "hectares",
          }),
        ),
      ],
    }),
  "sda/output/chart.png",
);

await sdb.close();
```

![Beeswarm chart showing the size of wildfires in Canada in 2023.](./assets/beeswarm.png)

#### Maps

If you want to create [Observable Plot](https://github.com/observablehq/plot)
maps, you can use
[`writeMap`](https://jsr.io/@nshiab/simple-data-analysis/doc/~/SimpleTable.prototype.writeMap).

Here's an example.

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
import { geo, plot } from "@observablehq/plot";

const sdb = new SimpleDB();

const provinces = await sdb
  .newTable("provinces")
  .loadGeoData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/geodata/files/CanadianProvincesAndTerritories.json",
  )
  .log();

const fires = await sdb
  .newTable("fires")
  .loadData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/geodata/files/firesCanada2023.csv",
  )
  .createPoints("lat", "lon", "geom")
  .replace("cause", { "H": "Human", "N": "Natural", "U": "Unknown" })
  .selectColumns(["geom", "hectares", "cause"])
  .filter(`hectares > 0`)
  .log();

// We put the provinces and fires in the same table and add an isFire column
// to easily distinguish between them.
const provincesAndFires = await provinces
  .clone({
    name: "provincesAndFires",
  })
  .insertTables(fires, { unifyColumns: true })
  .addColumn("isFire", "boolean", `hectares > 0`)
  .log();

await provincesAndFires.writeMap(
  (geoData) => {
    const fires = geoData.features.filter((d) => d.properties.isFire);
    const provinces = geoData.features.filter((d) => !d.properties.isFire);

    return plot({
      projection: {
        type: "conic-conformal",
        rotate: [100, -60],
        domain: geoData,
      },
      color: {
        legend: true,
      },
      r: { range: [0.5, 25] },
      marks: [
        geo(provinces, {
          stroke: "lightgray",
          fill: "whitesmoke",
        }),
        geo(fires, {
          r: "hectares",
          fill: "cause",
          fillOpacity: 0.25,
          stroke: "cause",
          strokeOpacity: 0.5,
        }),
      ],
    });
  },
  "sda/output/map.png",
);

await sdb.close();
```

![Map showing the wildfires in Canada in 2023.](./assets/map.png)

### AI

SDA can use LLMs and embedding models to enrich data, search text, and answer
questions based on the contents of a table. The examples below rely on
environment variables to connect to an AI provider and select a model. Click the
relevant documentation links below for more information.

SDA's AI capabilities come from
[`journalism-ai`](https://jsr.io/@nshiab/journalism-ai). By default, LLM
responses and embeddings are cached in the hidden `.journalism-cache` folder,
avoiding repeated model calls for the same request.

#### Enrich rows with AI

The
[`aiRowByRow`](https://jsr.io/@nshiab/simple-data-analysis/doc/~/SimpleTable.prototype.aiRowByRow)
method sends the values of a column to an LLM and stores the structured
responses in one or more new columns. It processes requests concurrently and can
record row-level errors, making it useful for cleaning, extracting, classifying,
and enriching data at scale.

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";

const sdb = new SimpleDB();
const cities = await sdb
  .newTable("cities")
  .loadArray([
    { city: "Marrakech" },
    { city: "Kyoto" },
    { city: "Auckland" },
  ])
  .aiRowByRow(
    "city",
    ["country", "continent"],
    "Give me the country and continent of the city.",
    { concurrent: 5, errorColumn: "error" },
  )
  .log();

await sdb.close();
```

#### Semantic search

The
[`hybridSearch`](https://jsr.io/@nshiab/simple-data-analysis/doc/~/SimpleTable.prototype.hybridSearch)
method lets you find exact keyword matches and semantically similar matches
together. SDA generates the embeddings using the provider and model configured
through environment variables. For keyword search or vector search alone, the
[`bm25`](https://jsr.io/@nshiab/simple-data-analysis/doc/~/SimpleTable.prototype.bm25)
and
[`aiVectorSimilarity`](https://jsr.io/@nshiab/simple-data-analysis/doc/~/SimpleTable.prototype.aiVectorSimilarity)
methods used by `hybridSearch` are also available directly.

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";

const sdb = new SimpleDB();
const recipes = sdb
  .newTable("recipes")
  .loadData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/recipesClean.parquet",
  );

// We search both the meaning and the wording of each recipe.
const results = await recipes
  .hybridSearch(
    "buttery pastry for breakfast",
    "Dish",
    "Recipe",
    5,
    { outputTable: "results" },
  )
  .log(); // For example: "Butter Pie" (keyword) and "Croissant" (semantic).
await sdb.close();
```

#### Retrieval-augmented generation (RAG)

The
[`aiRAG`](https://jsr.io/@nshiab/simple-data-analysis/doc/~/SimpleTable.prototype.aiRAG)
method first retrieves relevant rows with hybrid search, then asks an LLM to
answer using only those rows.

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";

const sdb = new SimpleDB();
const recipes = sdb
  .newTable("recipes")
  .loadData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/recipesClean.parquet",
  );

// We retrieve the most relevant recipes and ask the AI to answer
// based only on their contents.
const answer = await recipes.aiRAG(
  "I am vegan. What can I eat for lunch that is spicy?",
  "Dish",
  "Recipe",
  10,
);

console.log(answer);
await sdb.close();
```

#### Natural language query

The
[`aiQuery`](https://jsr.io/@nshiab/simple-data-analysis/doc/~/SimpleTable.prototype.aiQuery)
method turns a natural-language instruction into a SQL query and executes it on
the table.

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";

const sdb = new SimpleDB();
const temperatures = sdb
  .newTable("temperatures")
  .loadData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/dailyTemperatures.csv",
  )
  .renameColumns({ t: "temperature", id: "station" });

const averageTemperatures = await temperatures
  .aiQuery(
    "Compute the average temperature for each station with two decimals.",
  )
  .log();
await sdb.close();
```

### Caching fetched and computed data

Instead of running the same code over and over again, you can cache the results.
This can speed up your workflow, especially when fetching data or performing
computationally expensive operations.

When you use the
[cache method](https://jsr.io/@nshiab/simple-data-analysis-core/doc/~/SimpleTable.prototype.cache),
the data is cached in a hidden `.sda-cache` folder. With `cacheVerbose` enabled,
the logs explain whether the callback, the table, and any additional inputs
match the cached entry. `cache()` passes the table to its callback and
automatically tracks changes made to that table before the cached step, as well
as changes to other `SimpleTable`s used by the callback. Use `inputs` for other
values that should invalidate the cache, such as numbers or strings.

Here's an example caching fetched data and the result of a spatial join.

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";

const sdb = new SimpleDB({ cacheVerbose: true, logDuration: true });

// Cache the data until the callback or table changes.
const provinces = await sdb.newTable("provinces").cache((table) => {
  table.loadGeoData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/geodata/files/CanadianProvincesAndTerritories.json",
  );
});

// Cache the data for 60 seconds or until the callback or table changes.
const fires = await sdb.newTable("fires").cache(
  (table) => {
    table
      .loadData(
        "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/geodata/files/firesCanada2023.csv",
      )
      .createPoints("lat", "lon", "geom");
  },
  { ttl: 60 },
);

// Refresh this cache when the callback, the firesInsideProvinces table,
// or either table used by the callback changes.
const firesInsideProvinces = await sdb.newTable("firesInsideProvinces").cache(
  (table) => {
    table
      .insertTables(fires)
      .joinGeo(provinces, "inside")
      .removeMissing()
      .summarize({
        columns: "hectares",
        by: "nameEnglish",
        stats: { nbFires: "count", burntArea: "sum" },
        decimals: 0,
      })
      .sort({ burntArea: "desc" });
  },
);

await firesInsideProvinces.log("all");
await firesInsideProvinces.logBarChart("nameEnglish", "burntArea");

await sdb.close();
```

After the first run, here's what you'll see in your terminal. For each
`cache()`, a file storing the results has been written in `.sda-cache`.

The whole script took around a second to complete.

```
cache() for provinces
Cache miss.
No matching cache entry exists for this computation.
Running computations and storing a new cache entry.
Computations done in 247 ms.
Wrote in cache in 1 ms.


cache() for fires
Cache miss.
No matching cache entry exists for this computation.
Running computations and storing a new cache entry.
Computations done in 350 ms.
Wrote in cache in 3 ms.


cache() for firesInsideProvinces
Cache miss.
No matching cache entry exists for this computation.
Running computations and storing a new cache entry.
Computations done in 68 ms.
Wrote in cache in 0 ms.


Table firesInsideProvinces:
┌───────────────────────────┬─────────┬───────────┐
│ nameEnglish               │ nbFires │ burntArea │
├───────────────────────────┼─────────┼───────────┤
│ Quebec                    │ 706     │ 5024737   │
│ Northwest Territories     │ 314     │ 4253907   │
│ Alberta                   │ 1208    │ 3214444   │
│ British Columbia          │ 2496    │ 2856625   │
│ Saskatchewan              │ 560     │ 1801903   │
│ Ontario                   │ 741     │ 441581    │
│ Yukon                     │ 227     │ 395461    │
│ Manitoba                  │ 301     │ 199200    │
│ Nova Scotia               │ 208     │ 25017     │
│ Newfoundland and Labrador │ 85      │ 21833     │
│ Nunavut                   │ 1       │ 2700      │
│ New Brunswick             │ 202     │ 854       │
└───────────────────────────┴─────────┴───────────┘
12 rows in total (count: 12)

Bar chart of "burntArea" per "nameEnglish":
                          ┌
                   Quebec ┤████████████████████████████████████████ 5,024,737
                          │
    Northwest Territories ┤██████████████████████████████████ 4,253,907
                          │
                  Alberta ┤██████████████████████████ 3,214,444
                          │
         British Columbia ┤███████████████████████ 2,856,625
                          │
             Saskatchewan ┤██████████████ 1,801,903
                          │
                  Ontario ┤████ 441,581
                          │
                    Yukon ┤███ 395,461
                          │
                 Manitoba ┤██ 199,200
                          │
              Nova Scotia ┤ 25,017
                          │
Newfoundland and Labrador ┤ 21,833
                          │
                  Nunavut ┤ 2,700
                          │
            New Brunswick ┤ 854
                          └


SimpleDB ran for 681 ms / 4 ms spent writing the cache
```

If you run the script less than 60 seconds after the first run, here's what
you'll see.

Most computations are skipped and their cached data is loaded instead. In this
example, the total runtime drops from 681 ms to 27 ms, making the second run
around 25 times faster.

```
cache() for provinces
Cache hit.
Compute function unchanged.
Data loaded in 0 ms.
Running computations previously took 247 ms.
You saved 247 ms.


cache() for fires
Cache hit.
Compute function unchanged.
TTL of 1 min, 0 sec, 0 ms has not expired.
The creation date is May 28, 2026, at 4:37 p.m..
There are 54 sec, 941 ms left.
Data loaded in 21 ms.
Running computations previously took 312 ms.
You saved 291 ms.


cache() for firesInsideProvinces
Cache hit.
Compute function unchanged.
Table dependencies unchanged: "fires", "provinces".
Data loaded in 0 ms.
Running computations previously took 50 ms.
You saved 50 ms.

[Note to readers: I have cut the table and chart.]

SimpleDB ran for 27 ms / 588 ms saved by using the cache
```

After 60 seconds, the fires cache expires while the provinces cache is reused.
Because `firesInsideProvinces` uses both tables in its callback, its cache
refreshes automatically when the fires table changes.

```
cache() for provinces
Cache hit.
Compute function unchanged.
Data loaded in 1 ms.
Running computations previously took 247 ms.
You saved 246 ms.


cache() for fires
Cache entry is stale.
Compute function unchanged.
TTL of 1 min, 0 sec, 0 ms has expired.
The creation date is May 28, 2026, at 4:37 p.m..
It was created 1 min, 17 sec, 465 ms ago.
Running computations and refreshing the cache entry.
Computations done in 340 ms.
Wrote in cache in 3 ms.


cache() for firesInsideProvinces
Cache miss.
Compute function unchanged.
Table dependencies changed: "fires".
Table dependencies unchanged: "provinces".
Running computations and storing a new cache entry.
Computations done in 48 ms.
Wrote in cache in 1 ms.

[Note to readers: I have cut the table and chart.]

SimpleDB ran for 399 ms / 246 ms saved by using the cache / 4 ms spent writing the cache
```
