**Simple Data Analysis v6.0.10**

***

# Simple data analysis (SDA)

SDA is a fast and easy-to-use TypeScript library for tabular, geospatial,
vector, and AI-assisted data analysis. It runs on Node.js and
makes it easy to load data from files, databases, and public sources.

> [!TIP]
> Learn how to use SDA with
> [Code Like a Journalist](https://www.code-like-a-journalist.com/), a free and
> open-source TypeScript course for data analysis and visualization.

SDA is maintained by [Nael Shiab](http://naelshiab.com/), computational
journalist and senior data producer for [CBC News](https://www.cbc.ca/news). You
might also find the [journalism library](https://github.com/nshiab/journalism)
useful. Contributions are welcome; see the
[contribution guidelines](https://github.com/nshiab/simple-data-analysis/blob/main/CONTRIBUTING.md).

## Table of contents

- [Library structure](#library-structure)
- [Installation](#installation)
- [Performance](#performance)
- [Core principles](#core-principles)
- [Examples](#examples)
  - [Tabular data](#tabular-data-1)
  - [Geospatial data](#geospatial-data-1)
  - [Data visualisations](#data-visualisations)
  - [Public data sources](#public-data-sources)
  - [AI](#ai)
  - [Analysing relationships](#analysing-relationships)
  - [External services](#external-services)
  - [Caching fetched and computed data](#caching-fetched-and-computed-data)

## Library structure

SDA is split into two packages:

- **[`simple-data-analysis-core`](https://github.com/nshiab/simple-data-analysis-core)**
  contains all core functions that depend on DuckDB (data loading, filtering,
  joining, summarizing, geospatial operations, etc.). If you only need these
  core data analysis capabilities, you can use this lighter package directly.

- **`simple-data-analysis`** (this package) extends the core with additional
  features: AI methods (row-by-row processing, embeddings, vector similarity,
  hybrid search, RAG, natural language queries), Google Cloud Storage and Google
  Sheets integrations, and charting/dataviz methods. These features are built
  respectively on the [`journalism-ai`](https://www.npmjs.com/package/@nshiab/journalism-ai),
  [`journalism-google`](https://www.npmjs.com/package/@nshiab/journalism-google), and
  [`journalism-dataviz`](https://www.npmjs.com/package/@nshiab/journalism-dataviz) libraries.

Most users will want this package (`simple-data-analysis`), which includes all
of the core functionality plus the extended features.

AI, Google, and charting dependencies load only when those operations run. If
you only use core methods, you don't pay their startup cost.

The [documentation](https://nshiab.github.io/simple-data-analysis/) includes
all inherited Core methods. For AI assistants, use [`llm.md`](https://github.com/nshiab/simple-data-analysis/blob/main/llm.md) or
[`llms.txt`](https://github.com/nshiab/simple-data-analysis/blob/main/llms.txt).

## Installation

The library requires Node.js 24.21.0 or newer and is available on
[npm](https://www.npmjs.com/package/@nshiab/simple-data-analysis).

```bash
npm i @nshiab/simple-data-analysis
```

To start a new data project with essential folders, configurations, and
documentation for AI agents, you can use
[@nshiab/setup-data-project](https://github.com/nshiab/setup-data-project).

```bash
npx @nshiab/setup-data-project
```

## Performance

SDA uses DuckDB to handle large tabular and geospatial analyses efficiently,
often outperforming traditional dataframe tools while keeping the code simple
and readable.

These benchmarks were run on a MacBook Pro with an Apple M4 Max and 64 GB of
memory.

### Tabular data

Using 22,051,025 temperature records (`ahccd.csv`, 1.77 GB, in
`benchmarks/data/`), we remove missing temperatures, convert dates and numbers,
save the cleaned data, then calculate average temperatures by station and decade
and export the sorted results.

We ran the same analysis with SDA, pandas, the tidyverse, and raw DuckDB. SDA
stays close to raw DuckDB while keeping the code simple and readable.

<!-- benchmark-tabular:start -->

![Horizontal bars comparing mean duration for the tabular workload; lower is better](https://raw.githubusercontent.com/nshiab/simple-data-analysis/v6.0.10/assets/benchmark-tabular-duration.png)

![Horizontal bars comparing mean peak memory for the tabular workload; lower is better](https://raw.githubusercontent.com/nshiab/simple-data-analysis/v6.0.10/assets/benchmark-tabular-memory.png)

<!-- benchmark-tabular:end -->

### Geospatial data

Using 335,024 Montreal public trees (`arbres-publics.csv`, 135.5 MB) and 91
neighbourhood boundaries (`quartierreferencehabitation.geojson`, 1.14 MB), both
in `benchmarks/data/`, we remove missing coordinates, create points, join trees
to neighbourhoods, then count trees per neighbourhood and export the sorted
results.

We ran the same analysis with SDA, GeoPandas, sf, and raw DuckDB. SDA brings
DuckDB's geospatial tools to the same simple, chainable API.

<!-- benchmark-spatial:start -->

![Horizontal bars comparing mean duration for the spatial workload; lower is better](https://raw.githubusercontent.com/nshiab/simple-data-analysis/v6.0.10/assets/benchmark-spatial-duration.png)

![Horizontal bars comparing mean peak memory for the spatial workload; lower is better](https://raw.githubusercontent.com/nshiab/simple-data-analysis/v6.0.10/assets/benchmark-spatial-memory.png)

<!-- benchmark-spatial:end -->

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

Export and chart observers (`toSheet()`, `toDatawrapper()`,
`toGeoDatawrapper()`, `writeChart()`, `writeMap()`, `logLineChart()`,
`logDotChart()`, `logBarChart()`, and `logHistogram()`) remain asynchronous and
return `Promise<this>`, like `writeData()`. Await the operation to get the same
table back, preserving its subclass type:

```ts
const table = await sdb.newTable().loadGeoData("regions.geojson").writeMap(map, "output/map.svg");
await table.filter("population > 100000").log();
```

`aiRAG()` and `toBucket()` remain asynchronous and return an answer or upload
URI.

The syntax and the available methods were inspired by
[Pandas](https://github.com/pandas-dev/pandas) (Python) and the
[Tidyverse](https://www.tidyverse.org/) (R). Method and option names are kept
simple and descriptive, so anyone can read an SDA pipeline and understand what
is happening step by step.

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

// Join fires with provinces so each fire has its province's attributes attached.
const firesInsideProvinces = await fires
  .joinGeo(provinces, "inside", {
    outputTable: "firesInsideProvinces",
  })
  .removeMissing()
  .removeColumns("geomProvinces")
  .log();

// Write the joined, detailed fire data to a GeoJSON file.
await firesInsideProvinces.writeGeoData("sda/output/firesInsideProvinces.geojson");

// Count the fires and sum the burnt area per province.
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
[`logBarChart`](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#logbarchart),
[`logDotChart`](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#logdotchart),
[`logLineChart`](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#loglinechart)
and
[`logHistogram`](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#loghistogram)
methods.

But you can also create [Observable Plot](https://github.com/observablehq/plot)
charts as an image file (`.png` or `.svg`) with
[`writeChart`](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#writechart).

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
  .replace("cause", { H: "Human", N: "Natural", U: "Unknown" })
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

![Beeswarm chart showing the size of wildfires in Canada in 2023.](https://raw.githubusercontent.com/nshiab/simple-data-analysis/v6.0.10/assets/beeswarm.png)

#### Maps

If you want to create [Observable Plot](https://github.com/observablehq/plot)
maps, you can use
[`writeMap`](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#writemap).

Here's an example.

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
import { geo, plot } from "@observablehq/plot";

const sdb = new SimpleDB();

const fires = await sdb
  .newTable("fires")
  .loadData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/geodata/files/firesCanada2023.csv",
  )
  .createPoints("lat", "lon", "geom")
  .replace("cause", { H: "Human", N: "Natural", U: "Unknown" })
  .selectColumns(["geom", "hectares", "cause"])
  .filter(`hectares > 0`)
  .log();

const provinces = await sdb
  .newTable("provinces")
  .loadGeoData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/geodata/files/CanadianProvincesAndTerritories.json",
  )
  .log();

// Create a map covering all provinces and territories.
await provinces.writeMap(
  // Province polygons are provided as GeoJSON, already rewound for D3.
  async (provinces) => {
    return plot({
      projection: {
        type: "conic-conformal",
        rotate: [100, -60],
        domain: provinces,
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
        // Retrieve the fire locations as GeoJSON for the second layer.
        geo(await fires.getGeoData(), {
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

![Map showing the wildfires in Canada in 2023.](https://raw.githubusercontent.com/nshiab/simple-data-analysis/v6.0.10/assets/map.png)

### Public data sources

SDA can download data directly from established public sources. Retrieved data
is cached locally by default, making it easy to build reproducible workflows
without repeatedly downloading the same datasets.

#### Statistics Canada

Use `loadStatCanData` with a Statistics Canada table identifier:

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";

const sdb = new SimpleDB();

// Fetch population estimates for Canada, provinces, and territories, then keep Canada.
await sdb.newTable("population").loadStatCanData("17-10-0005-01").filter("GEO = 'Canada'").log();

await sdb.close();
```

#### OpenStreetMap

Use `loadOpenStreetMap()` for both existing `.osm` or `.osm.pbf` files and
OpenStreetMap features downloaded through Overpass. Processed OpenStreetMap data
is cached by default.

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";

const sdb = new SimpleDB();

// Load an existing local file.
await sdb
  .newTable("montreal")
  .loadOpenStreetMap("./montreal.osm.pbf", { verbose: true })
  .filter("tags['amenity'] = 'school'")
  .selectColumns(["id", "tags", "geom"])
  .log();

// Download schools within a bounding box.
await sdb
  .newTable("schools")
  .loadOpenStreetMap(
    {
      west: -73.587799,
      south: 45.445078,
      east: -73.552265,
      north: 45.471086,
    },
    { filters: ["amenity", "school"], verbose: true },
  )
  .log();

await sdb.close();
```

### AI

SDA can use LLMs and embedding models to enrich data, search text, and answer
questions based on the contents of a table. Choose one of the following `.env`
configurations.

For the Gemini API:

```dotenv
AI_PROVIDER=gemini
AI_MODEL=gemini-3-flash-preview
AI_EMBEDDINGS_PROVIDER=gemini
AI_EMBEDDINGS_MODEL=gemini-embedding-001
AI_KEY=your-gemini-api-key
```

For Vertex AI, replace `AI_KEY` with your Google Cloud project and location:

```dotenv
AI_PROVIDER=gemini
AI_MODEL=gemini-3-flash-preview
AI_EMBEDDINGS_PROVIDER=gemini
AI_EMBEDDINGS_MODEL=gemini-embedding-001
AI_PROJECT=my-google-cloud-project
AI_LOCATION=us-central1
```

For local Ollama models:

```dotenv
AI_PROVIDER=ollama
AI_MODEL=gemma3:4b
AI_EMBEDDINGS_PROVIDER=ollama
AI_EMBEDDINGS_MODEL=nomic-embed-text
```

SDA's AI capabilities come from
[`journalism-ai`](https://www.npmjs.com/package/@nshiab/journalism-ai). By default, LLM
responses and embeddings are cached in the hidden `.journalism-cache` folder,
avoiding repeated model calls for the same request.

#### Enrich rows with AI

The
[`aiRowByRow`](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#airowbyrow)
method sends the values of a column to an LLM and stores the structured
responses in one or more new columns. It processes requests concurrently and can
record row-level errors, making it useful for cleaning, extracting, classifying,
and enriching data at scale.

```ts
// Uses AI_PROVIDER, AI_MODEL, and any required credentials from .env.
import { SimpleDB } from "@nshiab/simple-data-analysis";

const sdb = new SimpleDB();
const cities = sdb.newTable("cities");

await cities
  .loadArray([{ city: "Marrakech" }, { city: "Kyoto" }, { city: "Auckland" }])
  .aiRowByRow("city", ["country", "continent"], "Give me the country and continent of the city.", {
    concurrency: 5,
    errorColumn: "error",
    logProgress: true,
  })
  .log();

await sdb.close();
```

The resulting table would be:

| city      | country     | continent | error |
| --------- | ----------- | --------- | ----- |
| Marrakech | Morocco     | Africa    | null  |
| Kyoto     | Japan       | Asia      | null  |
| Auckland  | New Zealand | Oceania   | null  |

Use `processResponse` to transform or validate each parsed response batch before
storing it. Return the resulting array (or a promise of it), preserving its row
count and order and the requested columns. Throwing an error follows `retry` and
`retryCheck`; the callback also runs when a response comes from cache.

#### Create embeddings

Embeddings represent text as lists of numbers that capture aspects of its
meaning. Texts with similar meanings tend to have similar embeddings, so we can
compare descriptions even when they use different words.

Let's use
[`aiEmbeddings`](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#aiembeddings)
to turn recipe descriptions into vectors. Each recipe keeps its original columns
and gets a new `embedding` column. These vectors can then be used for
clustering, visualization, and semantic search.

```ts
// Uses AI_EMBEDDINGS_PROVIDER, AI_EMBEDDINGS_MODEL, and any required credentials
// from .env.
import { SimpleDB } from "@nshiab/simple-data-analysis";

const sdb = new SimpleDB();
await sdb
  .newTable("recipes")
  .loadData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/recipesClean.parquet",
  )
  .aiEmbeddings("Recipe", "embedding")
  .log();

await sdb.close();
```

Here are three rows generated with `nomic-embed-text:latest`. Recipe text and
vectors are shortened for readability, and embedding values are rounded.

| Dish    | Recipe                                                         | embedding                          |
| ------- | -------------------------------------------------------------- | ---------------------------------- |
| Pizza   | Pizza is a savory dish of Italian origin…                      | [0.045, 0.099, -0.167, 0.051, …]   |
| Paella  | Paella is a traditional Spanish rice dish…                     | [0.038, 0.085, -0.183, -0.005, …]  |
| Goulash | Goulash is a hearty and flavorful stew of meat and vegetables… | [-0.028, 0.090, -0.181, -0.053, …] |

#### Cluster and visualize embeddings

We can group similar recipe descriptions with
[`hdbscan`](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#hdbscan).
It clusters the original embeddings and labels recipes it cannot confidently
assign as `"noise"`. This example uses the same embedding settings and recipe
data as above.

```ts
// Uses AI_EMBEDDINGS_PROVIDER, AI_EMBEDDINGS_MODEL, and any required credentials
// from .env.
import { SimpleDB } from "@nshiab/simple-data-analysis";

const sdb = new SimpleDB();
const recipes = await sdb
  .newTable("recipes")
  .loadData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/recipesClean.parquet",
  )
  .aiEmbeddings("Recipe", "embedding")
  .hdbscan("embedding", "cluster", {
    metric: "cosine",
    minSamples: 3,
  })
  .log();

await sdb.close();
```

Here are the five recipes in `cluster-0`. For readability, we show only their
names and cluster labels. This group brings together related Middle Eastern
dishes, including hummus, falafel, and bread-based dishes.

| Dish          | cluster   |
| ------------- | --------- |
| Fattet Hummus | cluster-0 |
| Falafel       | cluster-0 |
| Baba Ghanoush | cluster-0 |
| Fattoush      | cluster-0 |
| Fatteh        | cluster-0 |

We can also use
[`umap`](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#umap)
to project the embeddings into two dimensions and draw them with `writeChart`.
After inspecting the recipes in each cluster, we assign descriptive names to the
groups below. Nearby points suggest similar descriptions, but the projection
does not preserve every distance.

```ts
// Uses AI_EMBEDDINGS_PROVIDER, AI_EMBEDDINGS_MODEL, and any required credentials
// from .env.
import { SimpleDB } from "@nshiab/simple-data-analysis";
import { dot, plot } from "@observablehq/plot";

const sdb = new SimpleDB();
const recipes = sdb
  .newTable("recipes")
  .loadData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/recipesClean.parquet",
  )
  .aiEmbeddings("Recipe", "embedding")
  .hdbscan("embedding", "cluster", {
    metric: "cosine",
    minSamples: 3,
  })
  .replace("cluster", {
    "cluster-0": "Middle Eastern dishes",
    "cluster-1": "Mexican dishes",
    "cluster-2": "Latin American dishes",
    "cluster-3": "Meat, rice & curry dishes",
    "cluster-4": "Soups & taro dishes",
  })
  .umap("embedding", { metric: "cosine" });

await recipes.writeChart(
  (data) =>
    plot({
      title: "A map of recipe descriptions",
      subtitle: "Embeddings from Nomic Embed Text, clustered with HDBSCAN.",
      x: { axis: null },
      y: { axis: null },
      color: {
        domain: [
          "Middle Eastern dishes",
          "Mexican dishes",
          "Latin American dishes",
          "Meat, rice & curry dishes",
          "Soups & taro dishes",
        ],
        scheme: "tableau10",
        unknown: "#dedede",
        legend: true,
      },
      marks: [
        dot(data, {
          x: "umapX",
          y: "umapY",
          fill: "cluster",
          r: (d) => (d.cluster === "noise" ? 2 : 4),
          sort: (d: { cluster: string }) => (d.cluster === "noise" ? 0 : 1),
        }),
      ],
    }),
  "sda/output/recipes-umap.png",
);
await sdb.close();
```

![UMAP scatterplot of 335 recipe descriptions, colored by manually named HDBSCAN clusters, with unclustered recipes in gray.](https://raw.githubusercontent.com/nshiab/simple-data-analysis/v6.0.10/assets/recipes-umap.png)

#### Semantic search

Once we have embeddings, we can search by meaning rather than exact wording.
[`aiVectorSimilarity`](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#aivectorsimilarity)
embeds a search query using the same model and finds the closest recipe vectors.
Here, we ask for five recipes similar to "buttery pastry for breakfast".

```ts
// Uses AI_EMBEDDINGS_PROVIDER, AI_EMBEDDINGS_MODEL, and any required credentials
// from .env.
import { SimpleDB } from "@nshiab/simple-data-analysis";

const sdb = new SimpleDB();
const recipes = sdb.newTable("recipes");

// Compare the query embedding with each recipe embedding.
await recipes
  .loadData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/recipesClean.parquet",
  )
  .aiEmbeddings("Recipe", "embedding")
  .aiVectorSimilarity("buttery pastry for breakfast", "embedding", 5, { similarityColumn: true })
  .log();

await sdb.close();
```

Here are the five results with Nomic Embed Text. For readability, we show only
the dish names and similarity scores, rounded to three decimals.

| Dish                    | …   | similarity |
| ----------------------- | --- | ---------- |
| Full English Breakfast  | …   | 0.652      |
| Pancakes                | …   | 0.650      |
| Bagel with Cream Cheese | …   | 0.635      |
| Biscuits and Gravy      | …   | 0.632      |
| Kunafa                  | …   | 0.629      |

#### Retrieval-augmented generation (RAG)

We can take retrieval one step further and use the matching recipes to help an
LLM answer a question.
[`aiRAG`](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#airag)
first retrieves relevant rows with
[`hybridSearch`](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#hybridsearch),
which combines semantic matches from embeddings with
[`bm25`](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#bm25)
keyword matches. It then asks the LLM to answer using only those rows.

```ts
// Uses both AI provider/model pairs and any required credentials from .env.
import { SimpleDB } from "@nshiab/simple-data-analysis";

const sdb = new SimpleDB();
// We retrieve the most relevant recipes and ask the AI to answer
// based only on their contents.
const answer = await sdb
  .newTable("recipes")
  .loadData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/recipesClean.parquet",
  )
  .aiRAG("I am vegan. What can I eat for lunch that is spicy?", "Dish", "Recipe", 10, {
    verbose: true,
  });

console.log(`${answer}\n`);

await sdb.close();
```

Here is the answer returned by `gemma4:12b-mlx` via Ollama, using Nomic Embed
Text for embeddings:

> I found that you can eat Chakalaka for lunch. Chakalaka is a South African
> vegetable stew that is typically spicy and flavorful. It includes the
> following ingredients:
>
> - Vegetable oil
> - Onions
> - Garlic
> - Red chilies
> - Bell peppers
> - Carrots
> - Turmeric
> - Curry powder
> - Cumin
> - Coriander
> - Diced tomatoes
> - Baked beans (or kidney/butter beans)
> - Vegetable broth or water

#### Natural language query

The
[`aiQuery`](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#aiquery)
method turns a natural-language instruction into a SQL query and executes it on
the table.

```ts
// Uses AI_PROVIDER, AI_MODEL, and any required credentials from .env.
import { SimpleDB } from "@nshiab/simple-data-analysis";

const sdb = new SimpleDB();
const temperatures = sdb.newTable("temperatures");

await temperatures
  .loadData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/dailyTemperatures.csv",
  )
  .renameColumns({ t: "temperature", id: "station" })
  .aiQuery("Compute the average temperature for each station with two decimals.", { verbose: true })
  .log();

await sdb.close();
```

With `gemma4:12b-mlx` via Ollama, the model generates the following SQL query,
which SDA executes on the table:

```sql
CREATE OR REPLACE TABLE "temperatures" AS
SELECT
  station,
  ROUND(AVG(temperature), 2) AS average_temperature
FROM "temperatures"
GROUP BY station;
```

The resulting table is:

| station | average_temperature |
| ------- | ------------------- |
| 7024745 | 7.03                |
| 1108380 | 9.85                |
| 6158355 | 8.87                |

### Analysing relationships

#### Similarity analysis

When you want to find items that resemble a specific one, calculating a
similarity score can be very useful, especially when you have many attributes to
compare.

Let's say we love **Louis Jadot Bourgogne Pinot Noir** and want to discover
similar wines. We can use
[`similarityMahalanobis`](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#similaritymahalanobis),
as demonstrated below. Mahalanobis distance is useful because it can compare
features with different units and scales, while also accounting for correlations
between them.

The code loads the
[Vivino Burgundy dataset](https://huggingface.co/datasets/Mr-Bridge/vivino-bourgogne-wines-2026)
of 2,000 named wines, originally from Hugging Face. Many white wines have no
recorded tannin value, so we replace missing tannin values with zero for this
example. This is a simplifying assumption, not a measured value. We exclude 12
wines missing other characteristics. The code retrieves our favorite wine as the
reference, then compares acidity, intensity, sweetness, and tannin to calculate
a distance and similarity score for each wine. Finally, it logs the wines, with
the closest matches first.

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";

const sdb = new SimpleDB();
const wines = sdb
  .newTable("wines")
  .loadData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis-core/main/test/data/files/wine.csv",
  )
  .replaceNulls("tannin", 0)
  .removeMissing({ columns: ["acidity", "intensity", "sweetness"] });

// Retrieve our favorite wine's characteristics as an object.
const reference = await wines.getRow("fullName === 'Louis Jadot Bourgogne Pinot Noir'");

await wines
  .similarityMahalanobis(["acidity", "intensity", "sweetness", "tannin"], reference, "distance", {
    similarityColumn: true,
  })
  .sort({ similarity: "desc" })
  .log();

await sdb.close();
```

For readability, we excluded the reference wine from the table below and show
only the five closest matches, keeping their names, distances, and similarity
scores rounded to three decimals. The code keeps all matching rows and columns,
including the reference wine.

| fullName                                                     | distance | similarity |
| ------------------------------------------------------------ | -------- | ---------- |
| Maison Roche de Bellene Pinot Noir Bourgogne Vieilles Vignes | 0.094    | 0.982      |
| Moillard-Grivot Bourgogne Pinot Noir                         | 0.117    | 0.977      |
| Joseph Drouhin Laforet Bourgogne Pinot Noir                  | 0.119    | 0.977      |
| Louis Latour Bourgogne Pinot Noir                            | 0.151    | 0.971      |
| Albert Bichot Bourgogne Vieilles Vignes de Pinot Noir        | 0.165    | 0.968      |

It's always useful to visualize our data, so let's update our code to create a
chart.

In the code below, we use `similarityMahalanobis` to calculate similarity scores
and
[`hdbscan`](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#hdbscan)
to create clusters of wines with similar characteristics. We rename the
identified clusters, then use
[`umap`](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#umap)
to reduce the four features to X and Y coordinates and `writeChart` to create
the scatter plot.

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
import { dot, plot, text } from "@observablehq/plot";

const sdb = new SimpleDB();
const wines = sdb
  .newTable("wines")
  .loadData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis-core/main/test/data/files/wine.csv",
  )
  .replaceNulls("tannin", 0)
  .removeMissing({ columns: ["acidity", "intensity", "sweetness"] });

const reference = await wines.getRow("fullName === 'Louis Jadot Bourgogne Pinot Noir'");

await wines
  .similarityMahalanobis(["acidity", "intensity", "sweetness", "tannin"], reference, "distance", {
    similarityColumn: true,
  })
  .hdbscan(["acidity", "intensity", "sweetness", "tannin"], "cluster", {
    minClusterSize: 40,
    minSamples: 10,
  })
  .replace("cluster", {
    "cluster-0": "Lower-intensity reds",
    "cluster-1": "Higher-intensity reds",
    "cluster-2": "Mostly Chablis whites",
    "cluster-3": "Higher-intensity whites",
    "cluster-4": "Lower-acidity whites & rosés",
  })
  .umap(["acidity", "intensity", "sweetness", "tannin"])
  .writeChart(
    (data) =>
      plot({
        title: "Wines similar to our favorite Pinot Noir",
        x: { axis: null },
        y: { axis: null },
        color: {
          domain: [
            "Lower-intensity reds",
            "Higher-intensity reds",
            "Mostly Chablis whites",
            "Higher-intensity whites",
            "Lower-acidity whites & rosés",
          ],
          scheme: "tableau10",
          unknown: "#dedede",
          legend: true,
        },
        opacity: { domain: [0, 1], range: [0, 1] },
        marks: [
          dot(data, {
            x: "umapX",
            y: "umapY",
            fill: "cluster",
            fillOpacity: (d) => (d.similarity > 0.95 ? 1 : 0.25),
            r: 3,
            stroke: "black",
            strokeWidth: (d) =>
              d.fullName === reference.fullName ? 2 : d.similarity > 0.95 ? 0.75 : 0,
            strokeOpacity: (d) => (d.fullName === reference.fullName ? 1 : 0.35),
            sort: (d: { fullName: string; cluster: string }) =>
              d.fullName === reference.fullName ? 2 : d.cluster === "noise" ? 0 : 1,
          }),
          text(data, {
            filter: (d) => d.fullName === reference.fullName,
            x: "umapX",
            y: "umapY",
            text: "fullName",
            dy: -16,
            fill: "black",
            stroke: "white",
            strokeWidth: 4,
          }),
        ],
      }),
    "sda/output/wines-umap.png",
  );

await sdb.close();
```

Clustering and UMAP reveal five groups of wines. Our reference wine is
highlighted, with its closest matches appearing nearby.

![UMAP scatterplot of wines colored by HDBSCAN group, with opacity highlighting similarity scores above 0.95, with Louis Jadot Bourgogne Pinot Noir highlighted.](https://raw.githubusercontent.com/nshiab/simple-data-analysis/v6.0.10/assets/wines-umap.png)

#### Network analysis

Network analysis focuses on connections between items, such as transactions
between businesses, flights between airports, or friendships between people. SDA
has useful methods for exploring these relationships
([`degree`](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#degree),
[`neighbors`](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#neighbors),
[`commonNeighbors`](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#commonneighbors),
[`reachable`](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#reachable),
[`distances`](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#distances),
[`shortestPath`](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#shortestpath),
[`paths`](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#paths),
[`findCycles`](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#findcycles),
[`topologicalSort`](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#topologicalsort),
and
[`connectedComponents`](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#connectedcomponents)).

For this example, we use a
[fictional flight schedule](https://github.com/nshiab/simple-data-analysis-core/blob/main/test/data/graphs/flights.csv)
with 33 flights connecting 12 cities around the world. Each row is one flight,
with a unique ID, origin, destination, departure and arrival times, and a price.
Here are the first three rows:

| flightId | origin   | destination | departure (UTC)  | arrival (UTC)    | price |
| -------- | -------- | ----------- | ---------------- | ---------------- | ----- |
| F001     | Montreal | Toronto     | 2030-01-15 08:00 | 2030-01-15 09:30 | 80    |
| F002     | Montreal | New York    | 2030-01-15 09:00 | 2030-01-15 10:30 | 120   |
| F003     | Montreal | Vancouver   | 2030-01-15 10:00 | 2030-01-15 15:30 | 180   |

Starting in Montreal, which cities can we reach, and how many flights would it
take? By default, `distances` counts the fewest connections to each city. This
works for any network: the connections could also be transactions, friendships,
or links between websites.

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";

const sdb = new SimpleDB();
await sdb
  .newTable("flights")
  .loadData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis-core/main/test/data/graphs/flights.csv",
  )
  .distances("origin", "destination", "Montreal")
  .log();

await sdb.close();
```

Here are selected destinations. One step means a direct flight; two or more
steps mean flights with connections.

| node     | steps |
| -------- | ----: |
| Toronto  |     1 |
| New York |     1 |
| London   |     1 |
| Paris    |     1 |
| Tokyo    |     2 |
| Sydney   |     2 |

However, with this flight dataset, we also need to account for takeoff and
landing times and make sure we can catch connecting flights. SDA's graph
analysis methods have convenient options to do this easily.

By rewriting our example with a few more options, we can account for all of
that. We allow at least an hour between flights with `minGapMs`. `weight` adds
up ticket prices, while `elapsedTime` also reports the time from the first
departure to the final arrival, including layovers. Setting `minimize: "weight"`
tells SDA to choose by price. If equally cheap routes have different step counts
or durations, `distances` returns each distinct summary.

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";

const sdb = new SimpleDB();
await sdb
  .newTable("flights")
  .loadData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis-core/main/test/data/graphs/flights.csv",
  )
  .distances("origin", "destination", "Montreal", {
    startTimeColumn: "departure",
    endTimeColumn: "arrival",
    minGapMs: 60 * 60 * 1000,
    elapsedTime: true,
    weight: "price",
    minimize: "weight",
  })
  .sort({ total: "asc" })
  .log();

await sdb.close();
```

For readability, here are selected destinations. `steps` counts the flights in
the journey, and `total` is their combined ticket price. We display
`elapsedTimeMs` as hours below.

| node     | steps | total | elapsed time (hours) |
| -------- | ----: | ----: | -------------------: |
| Toronto  |     1 |    80 |                  1.5 |
| New York |     1 |   120 |                  1.5 |
| London   |     2 |   350 |                   10 |
| Paris    |     3 |   430 |                12.25 |
| Tokyo    |     2 |   700 |                   17 |
| Sydney   |     5 |  1020 |                   38 |

You don't need all these options for every network. Without weights or time
options, routes are measured by their number of connections. With `distances`,
you can also set `minimize: "steps"` while still reporting price and elapsed
time. For transaction data, you might use `reachable` to follow connections or
`degree` to count payments received and sent. The methods handle traversing the
network for you.

### External services

#### Google Cloud Storage

The
[`toBucket`](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#tobucket)
method writes a table to a temporary file and uploads it to Google Cloud
Storage. The
[`loadBucket`](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#loadbucket)
method downloads and loads an object in chain order.

Set the project and bucket in `.env`. Authentication uses Google Application
Default Credentials. If ADC should load credentials from a specific JSON file,
also set `GOOGLE_APPLICATION_CREDENTIALS` to that file's path:

```dotenv
BUCKET_PROJECT=my-google-cloud-project
BUCKET_NAME=my-storage-bucket
# Optional: load credentials from a specific JSON file.
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
```

Load a table from one object, transform it, and upload the result as another
object:

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";

const sdb = new SimpleDB();

const temperatures = await sdb
  .newTable("temperatures")
  .loadBucket("inputs/temperatures.parquet")
  .filter("temperature > 30")
  .log();

const uri = await temperatures.toBucket("outputs/hotTemperatures.parquet", { overwrite: true });

console.log(uri); // gs://my-storage-bucket/outputs/hotTemperatures.parquet

await sdb.close();
```

#### Google Sheets

The
[`toSheet`](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#tosheet)
method sends a table directly to Google Sheets. Authenticate with a service
account by setting its email and private key in `.env`:

```dotenv
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@example.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Alternatively, point `GOOGLE_APPLICATION_CREDENTIALS` to the service-account
JSON file:

```dotenv
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
```

Share the spreadsheet with the service-account email before running the
examples.

##### Load from a sheet

Use `loadSheet()` to load and transform data from a Google Sheet tab:

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";

const sdb = new SimpleDB();

await sdb
  .newTable("temperatures")
  .loadSheet("https://docs.google.com/spreadsheets/d/.../edit#gid=0")
  .filter("temperature > 30")
  .selectColumns(["station", "time", "temperature"])
  .log();

await sdb.close();
```

##### Write to a sheet

Use `toSheet()` to write a table to a Google Sheet tab:

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";

const sdb = new SimpleDB();
const temperatures = sdb.newTable("temperatures");

await temperatures
  .loadData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/dailyTemperatures.csv",
  )
  .renameColumns({ t: "temperature", id: "station" })
  .selectColumns(["station", "time", "temperature"])
  .toSheet("https://docs.google.com/spreadsheets/d/.../edit#gid=0");

await sdb.close();
```

#### Datawrapper

The
[`toDatawrapper`](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#todatawrapper)
method sends a table directly to a Datawrapper chart or table. Add your API key
to `.env`:

```dotenv
DATAWRAPPER_KEY=your-datawrapper-api-key
```

The chart ID is the short identifier in its Datawrapper URL. For maps, use
[`toGeoDatawrapper`](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#togeodatawrapper)
with the same API key. The `loadDatawrapper()` and `loadGeoDatawrapper()`
methods also use it.

```ts
// Uses DATAWRAPPER_KEY from .env.
import { SimpleDB } from "@nshiab/simple-data-analysis";

const sdb = new SimpleDB();
const temperatures = sdb.newTable("temperatures");

await temperatures
  .loadData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/dailyTemperatures.csv",
  )
  .renameColumns({ t: "temperature", id: "station" })
  .selectColumns(["station", "time", "temperature"])
  .toDatawrapper("myChartId", { republish: true });

await sdb.close();
```

### Caching fetched and computed data

Instead of running the same code over and over again, you can cache the results.
This can speed up your workflow, especially when fetching data or performing
computationally expensive operations.

When you use the
[cache method](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#cache),
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
const firesInsideProvinces = await sdb.newTable("firesInsideProvinces").cache((table) => {
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
});

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

## Main

### SimpleTable

Represents a table within a SimpleDB database, capable of handling tabular, geospatial, and vector data.
Extends the core [`SimpleTable`](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/docs/classes/SimpleTable.md) class
from [`simple-data-analysis-core`](https://github.com/nshiab/simple-data-analysis-core) to include
additional AI, Google Sheets, and charting methods.
Integration dependencies load only when their operations execute, and are reused
by subsequent calls. Core-only pipelines do not load these dependencies.

All core methods are available on this class.
See the [core SimpleTable reference](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/docs/classes/SimpleTable.md)
for inherited methods such as `loadData()`, `filter()`, and `log()`.

#### Examples

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

#### Extends

- `SimpleTable`

#### Constructors

##### Constructor

> **new SimpleTable**(`name`, `simpleDB`, `options?`): [`SimpleTable`](#simpletable)

Creates an instance of SimpleTable.

###### Parameters

###### name

`string`

The name of the table.

###### simpleDB

`SimpleDB`

The SimpleDB instance that this table belongs to.

###### options?

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

###### Returns

[`SimpleTable`](#simpletable)

###### Inherited from

`SimpleTableCore.constructor`

#### AI

##### aiEmbeddings()

> **aiEmbeddings**(`column`, `newColumn`, `options?`): `this`

Generates embeddings for a specified text column and stores the results in a new column.

This method supports Gemini, Vertex AI, and Ollama embeddings.

Environment variables are named configuration values supplied to the running process. By default, this method reads `AI_EMBEDDINGS_PROVIDER` (`"gemini"` or `"ollama"`; defaults to `"gemini"`), `AI_EMBEDDINGS_MODEL` (for example, `"gemini-embedding-001"` or `"nomic-embed-text"`), and, for Gemini, either `AI_KEY` (for example, `"your-gemini-api-key"`) or both `AI_PROJECT` (for example, `"my-google-cloud-project"`) and `AI_LOCATION` (for example, `"us-central1"`). Values passed through `embeddings` override the corresponding environment values. When using Ollama, ensure it is running.

Use `rateLimitPerMinute` to space provider request starts across the worker pool, including across transfer batches. Cached responses bypass pacing. The `concurrency` option bounds active tasks, and free slots refill as requests finish. Retries are disabled by default; set `retry` and optionally `retryCheck` to retry failed requests. Each dispatched retry respects the rate limit.

By default, a terminal request failure stops new tasks and settles active work before throwing. Set `errorColumn` to continue instead: failed rows receive a `NULL` embedding and an error message, while successful rows receive `NULL` in the error column. If every request fails, the embedding column is entirely `NULL`. Check errors and handle null embeddings before indexing or searching. Errors in staging or retry-policy callbacks still throw.

Set `logProgress` to log completed request tasks, including failures and cache hits; retries do not increment completion counts. The `verbose` option retains detailed row-processing and index-creation logging.

Individual embedding responses are cached in `.journalism-cache` by default. Set `embeddings.cache` to `false` to disable this request cache, and remember to add `.journalism-cache` to your `.gitignore`.

Every call generates embeddings from the current text and replaces the output column if it already exists. Unchanged text can reuse cached embedding responses. Call this method again after changing the source text to refresh its embeddings.

If `createIndex` is `true`, an HNSW index will be created on the new column using the [duckdb-vss extension](https://github.com/duckdb/duckdb-vss). This is useful for speeding up the `aiVectorSimilarity` method. When refreshing an existing embedding column, its managed VSS index is dropped and rebuilt if `createIndex` is `true`.

Only the input text and generated vectors pass through JavaScript. Unrelated SQL values and types remain in DuckDB. Vectors are staged in bounded batches before replacing the output column, including when dimensions change. Uncaught generation or staging failures leave the original table data unchanged.

The work is queued and runs in chain order at the next awaited observer or `run()` call.

###### Parameters

###### column

`string`

The name of the column to be used as input for generating embeddings.

###### newColumn

`string`

The name of the new column where the generated embeddings will be stored.

###### options?

Configuration options for the AI request.

###### concurrency?

`number`

The number of concurrent requests to send. Defaults to `1`.

###### createIndex?

`boolean`

If `true`, an HNSW index will be created on the new column. Useful for speeding up the `aiVectorSimilarity` method. Defaults to `false`.

###### efConstruction?

`number`

The number of candidate vertices to consider during index construction. Higher values result in more accurate indexes but increase build time. Defaults to 128.

###### efSearch?

`number`

The number of candidate vertices to consider during search. Higher values result in more accurate searches but increase search time. Defaults to 64.

###### embeddings?

\{ `apiKey?`: `undefined`; `cache?`: `boolean`; `contextWindow?`: `undefined`; `location?`: `undefined`; `model?`: `string`; `ollama?`: `undefined`; `project?`: `undefined`; `provider?`: `undefined`; `verbose?`: `boolean`; `vertex?`: `undefined`; \} \| \{ `apiKey?`: `string`; `cache?`: `boolean`; `contextWindow?`: `undefined`; `location?`: `undefined`; `model?`: `string`; `ollama?`: `undefined`; `project?`: `undefined`; `provider`: `"gemini"`; `verbose?`: `boolean`; `vertex?`: `false`; \} \| \{ `apiKey?`: `string`; `cache?`: `boolean`; `contextWindow?`: `undefined`; `location?`: `string`; `model?`: `string`; `ollama?`: `undefined`; `project?`: `string`; `provider`: `"gemini"`; `verbose?`: `boolean`; `vertex`: `true`; \} \| \{ `apiKey?`: `undefined`; `cache?`: `boolean`; `contextWindow?`: `number`; `location?`: `undefined`; `model?`: `string`; `ollama?`: \{ `embeddingEndpoint?`: `string`; `embed`(`request`): `Promise`\<\{ `embeddings`: `number`[][]; \}\>; \}; `project?`: `undefined`; `provider`: `"ollama"`; `verbose?`: `boolean`; `vertex?`: `undefined`; \}

Optional Gemini or Ollama embedding configuration.

###### errorColumn?

`string`

Column receiving terminal request errors instead of throwing. Failed embeddings are `NULL`; successful rows have a `NULL` error. Must differ from `newColumn`. Defaults to `undefined`.

###### logProgress?

`boolean`

If `true`, logs request-task completion counts across transfer batches. Defaults to `false`.

###### M?

`number`

The maximum number of neighbors to keep for each vertex in the graph. Higher values result in more accurate indexes but increase build time and memory usage. Defaults to 16.

###### overwriteIndex?

`boolean`

If `true` and `createIndex` is `true`, drops and recreates the VSS index even if it already exists. Defaults to `false`.

###### rateLimitPerMinute?

`number`

The maximum number of provider requests started per minute. Must be positive and finite. Request starts are spaced across the worker pool; cached responses bypass the limit. Defaults to `undefined` (no limit).

###### retry?

`number`

Number of additional attempts after a request failure. Must be a non-negative safe integer. Defaults to `0`.

###### retryCheck?

(`error`) => `boolean` \| `Promise`\<`boolean`\>

Optional synchronous or asynchronous predicate that decides whether a failed request may be retried while attempts remain. Defaults to `undefined`.

###### verbose?

`boolean`

If `true`, logs additional debugging information. Defaults to `false`.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Set these environment variables before running:
// AI_EMBEDDINGS_PROVIDER=gemini
// AI_EMBEDDINGS_MODEL=gemini-embedding-001
// AI_KEY=your-gemini-api-key
const food = await sdb
  .newTable("food")
  .loadArray([
    { food: "pizza" },
    { food: "sushi" },
    { food: "burger" },
    { food: "pasta" },
    { food: "salad" },
    { food: "tacos" },
  ])
  .aiEmbeddings("food", "embeddings", {
    rateLimitPerMinute: 15,
    createIndex: true,
    verbose: true,
  })
  .log();
```

```ts
// Generate embeddings with a local Ollama model.
const food = await table
  .aiEmbeddings("food", "embeddings", {
    embeddings: { provider: "ollama", model: "nomic-embed-text" },
  })
  .log();
```

```ts
// Retry requests and retain errors for inspection.
await table
  .aiEmbeddings("text", "embedding", {
    embeddings: { provider: "ollama", model: "nomic-embed-text" },
    errorColumn: "embedding_error",
    retry: 2,
    retryCheck: (error) => error instanceof Error,
    logProgress: true,
  })
  .log();
```

##### aiQuery()

> **aiQuery**(`prompt`, `options?`): `this`

Generates and executes a SQL query based on a prompt.
Additional instructions, such as column types, are automatically added to your prompt. Set `verbose` to `true` to see the full prompt.

This method supports Gemini, Vertex AI, and Ollama.

Environment variables are named configuration values supplied to the running process. By default, this method reads `AI_PROVIDER` (`"gemini"` or `"ollama"`; defaults to `"gemini"`), `AI_MODEL` (for example, `"gemini-3-flash-preview"` or `"gemma3:4b"`), and, for Gemini, either `AI_KEY` (for example, `"your-gemini-api-key"`) or both `AI_PROJECT` (for example, `"my-google-cloud-project"`) and `AI_LOCATION` (for example, `"us-central1"`). Values passed through `generation` override the corresponding environment values. When using Ollama, ensure it is running.

Ollama temperature defaults to 0, while Gemini uses the provider's default. Provider-specific controls live under `generation`.

The generated query is cached locally in `.journalism-cache` by default. Set `generation.cache` to `false` to disable caching, and remember to add `.journalism-cache` to your `.gitignore`.
The work is queued and runs in chain order at the next awaited observer or `run()` call.

###### Parameters

###### prompt

`string`

The input string to guide the AI in generating the SQL query.

###### options?

Configuration options for the AI request.

###### extraInstructions?

`string`

Additional instructions to append to the prompt, providing more context or guidance for the AI.

###### generation?

\{ systemPrompt?: string \| undefined; model?: string \| undefined; cache?: boolean \| undefined; processResponse?: ((response: unknown) =\> unknown) \| undefined; temperature?: number \| undefined; \} & (\{ ...; \} \| ... 2 more ... \| \{ ...; \})

Optional Gemini or Ollama generation configuration.

###### includeThoughts?

`boolean`

If `true`, includes the AI model's reasoning process in the logged output when using models that support extended thinking. Only relevant when used with thinking-capable models. Defaults to `false`.

###### outputTable?

`string`

The name of a new table where the results will be stored. If not provided, the current table will be replaced with the query results.

###### verbose?

`boolean`

If `true`, logs additional debugging information, including the full prompt sent to the AI. Defaults to `false`.

###### Returns

`this`

The table that will contain the query results, so methods can be chained.

###### Examples

```ts
// Set these environment variables before running:
// AI_PROVIDER=gemini
// AI_MODEL=gemini-3-flash-preview
// AI_KEY=your-gemini-api-key
// The AI will generate a query that will be executed, and
// the result will replace the existing table.
// If run again, it will use the previous query from the cache.
// Don't forget to add .journalism-cache to your .gitignore file!
const averageSalaryByDepartment = await table
  .aiQuery("Give me the average salary by department", {
    verbose: true,
  })
  .log();
```

```ts
// Save results to a new table without modifying the original
// Original table remains unchanged
const allEmployees = await table.getRowCount();
console.log(allEmployees); // All employees

// Generate the query in chain order and observe the new table.
const topEmployees = await table
  .aiQuery("Give me the top 10 employees by salary", {
    outputTable: "top_employees",
  })
  .log();
console.log(await topEmployees.getRowCount()); // 10
```

```ts
// Generate and execute the query with a local Ollama model.
const averageSalaryByDepartment = await table
  .aiQuery("Give me the average salary by department", {
    generation: { provider: "ollama", model: "gemma3:4b" },
  })
  .log();
```

##### aiRAG()

> **aiRAG**(`query`, `idColumn`, `textColumn`, `nbResults`, `options?`): `Promise`\<`string`\>

Performs Retrieval-Augmented Generation (RAG) by combining semantic vector search and BM25 full-text search to retrieve the most relevant context, then passing it to an LLM for answering queries. This hybrid approach uses both `aiVectorSimilarity` (embeddings-based) and `bm25` (keyword-based) methods in parallel, fusing their results using Reciprocal Rank Fusion (RRF) before calling the `askAI` function from the journalism library.

Internally, this method uses the `hybridSearch` method to retrieve relevant rows. If you want to perform hybrid search without the LLM step (i.e., to get the table of results directly), use `hybridSearch` instead.

When vector search is enabled, retrieval caches embedding responses in `.journalism-cache` and the table with its generated embedding column in `.sda-cache`. The final generated answer is also cached in `.journalism-cache`. Set `embeddings.cache` or `generation.cache` to `false` to disable the corresponding caches.

Remove `.journalism-cache` and `.sda-cache` to clear existing cache entries. Remember to add both directories to your `.gitignore`.

Generation and embeddings are independently configurable.

Environment variables are named configuration values supplied to the running process. By default, generation reads `AI_PROVIDER` (`"gemini"` or `"ollama"`; defaults to `"gemini"`) and `AI_MODEL` (for example, `"gemini-3-flash-preview"` or `"gemma3:4b"`), while embeddings read `AI_EMBEDDINGS_PROVIDER` (`"gemini"` or `"ollama"`; defaults to `"gemini"`) and `AI_EMBEDDINGS_MODEL` (for example, `"gemini-embedding-001"` or `"nomic-embed-text"`). Gemini generation and embeddings also read either `AI_KEY` (for example, `"your-gemini-api-key"`) or both `AI_PROJECT` (for example, `"my-google-cloud-project"`) and `AI_LOCATION` (for example, `"us-central1"`). Values passed through either option override its environment defaults.

For example, `generation.provider` can be `"gemini"` while `embeddings.provider` is `"ollama"`; the same mix can be selected through `AI_PROVIDER=gemini` and `AI_EMBEDDINGS_PROVIDER=ollama`.

Ollama temperature defaults to 0. Gemini uses the provider's default temperature.

When BM25 search is enabled, its required full-text search index is created or reused automatically. When vector search is enabled, set `createIndex` to `true` to also create an HNSW index using the [duckdb-vss extension](https://github.com/duckdb/duckdb-vss).

###### Parameters

###### query

`string`

The question or query to answer using the retrieved context.

###### idColumn

`string`

The name of the column containing unique identifiers for each row.

###### textColumn

`string`

The name of the column containing the text content to search through and use as context.

###### nbResults

`number`

The number of most similar rows to retrieve and use as context for the AI.

###### options?

Configuration options for the RAG process.

###### b?

`number`

The BM25 b parameter controlling document length normalization (0-1 range). Defaults to `0.75`.

###### bm25?

`boolean`

If `true`, includes BM25 text search in the hybrid search. Defaults to `true`.

###### bm25MinScore?

`number`

A threshold to filter BM25 results. Only rows with a BM25 score above this value will be included in the final results. Defaults to `undefined` (no threshold).

###### bm25ScoreColumn?

`string`

If provided, a new column with this name will be added to the output table containing the BM25 score for each row.

###### conjunctive?

`boolean`

If `true`, all terms in the query string must be present in order for a document to be retrieved during the BM25 search. Defaults to `false`.

###### createIndex?

`boolean`

If `true`, creates an HNSW index when vector search is enabled. The BM25 FTS index is managed automatically whenever BM25 search is enabled. Defaults to `false`.

###### efConstruction?

`number`

The number of candidate vertices to consider during index construction. Higher values result in more accurate indexes but increase build time. Defaults to 128.

###### efSearch?

`number`

The number of candidate vertices to consider during search. Higher values result in more accurate searches but increase search time. Defaults to 64.

###### embeddings?

\{ `apiKey?`: `undefined`; `cache?`: `boolean`; `contextWindow?`: `undefined`; `location?`: `undefined`; `model?`: `string`; `ollama?`: `undefined`; `project?`: `undefined`; `provider?`: `undefined`; `verbose?`: `boolean`; `vertex?`: `undefined`; \} \| \{ `apiKey?`: `string`; `cache?`: `boolean`; `contextWindow?`: `undefined`; `location?`: `undefined`; `model?`: `string`; `ollama?`: `undefined`; `project?`: `undefined`; `provider`: `"gemini"`; `verbose?`: `boolean`; `vertex?`: `false`; \} \| \{ `apiKey?`: `string`; `cache?`: `boolean`; `contextWindow?`: `undefined`; `location?`: `string`; `model?`: `string`; `ollama?`: `undefined`; `project?`: `string`; `provider`: `"gemini"`; `verbose?`: `boolean`; `vertex`: `true`; \} \| \{ `apiKey?`: `undefined`; `cache?`: `boolean`; `contextWindow?`: `number`; `location?`: `undefined`; `model?`: `string`; `ollama?`: \{ `embeddingEndpoint?`: `string`; `embed`(`request`): `Promise`\<\{ `embeddings`: `number`[][]; \}\>; \}; `project?`: `undefined`; `provider`: `"ollama"`; `verbose?`: `boolean`; `vertex?`: `undefined`; \}

Optional Gemini or Ollama embedding configuration.

###### embeddingsConcurrency?

`number`

The number of concurrent requests to send to the embeddings service. Defaults to `1`.

###### generation?

\{ systemPrompt?: string \| undefined; model?: string \| undefined; cache?: boolean \| undefined; processResponse?: ((response: unknown) =\> unknown) \| undefined; temperature?: number \| undefined; \} & (\{ ...; \} \| ... 2 more ... \| \{ ...; \})

Optional Gemini or Ollama generation configuration.

###### ignore?

`string`

The regular expression of patterns to be ignored for the BM25 FTS index. Defaults to "(\\.|[^a-z])+".

###### includeThoughts?

`boolean`

If `true`, includes the AI model's reasoning process in the logged output when using models that support extended thinking. Only relevant when used with thinking-capable models. Defaults to `false`.

###### k?

`number`

The BM25 k parameter controlling term frequency saturation. Defaults to `1.2`.

###### lower?

`boolean`

A boolean indicating whether to convert all text to lowercase for the BM25 FTS index. Defaults to true.

###### M?

`number`

The maximum number of neighbors to keep for each vertex in the graph. Higher values result in more accurate indexes but increase build time and memory usage. Defaults to 16.

###### metrics?

\{ `totalCost`: `number`; `totalInputTokens`: `number`; `totalOutputTokens`: `number`; `totalRequests`: `number`; \}

An object to track cumulative metrics across multiple AI requests. Pass an object with totalCost, totalInputTokens, totalOutputTokens, and totalRequests properties (all initialized to 0). The function will update these values after each request. Note: totalCost is only calculated for Google GenAI models, not for Ollama.

###### metrics.totalCost

`number`

###### metrics.totalInputTokens

`number`

###### metrics.totalOutputTokens

`number`

###### metrics.totalRequests

`number`

###### stemmer?

`"arabic"` \| `"basque"` \| `"catalan"` \| `"danish"` \| `"dutch"` \| `"english"` \| `"finnish"` \| `"french"` \| `"german"` \| `"greek"` \| `"hindi"` \| `"hungarian"` \| `"indonesian"` \| `"irish"` \| `"italian"` \| `"lithuanian"` \| `"nepali"` \| `"norwegian"` \| `"porter"` \| `"portuguese"` \| `"romanian"` \| `"russian"` \| `"serbian"` \| `"spanish"` \| `"swedish"` \| `"tamil"` \| `"turkish"` \| `"none"`

The language stemmer to apply for BM25 word normalization. Supports multiple languages or "none" to disable stemming. Defaults to `'porter'`.

###### stopwords?

`string`

The table containing the stopwords to use for the BM25 FTS index. Supports multiple languages or "none" to disable stopwords. Defaults to "english".

###### stripAccents?

`boolean`

A boolean indicating whether to remove accents for the BM25 FTS index. Defaults to true.

###### vectorMinSimilarity?

`number`

A threshold between 0.0 and 1.0 to filter out vector search results that are not similar enough. For example, 0.7 ensures only results with a 70% similarity or higher are included in the final results. Defaults to `undefined` (no threshold).

###### vectorSearch?

`boolean`

If `true`, includes vector similarity search in the hybrid search. Defaults to `true`.

###### vectorSimilarityColumn?

`string`

If provided, a new column with this name will be added to the output table containing the vector similarity score (from 0.0 to 1.0) for each row.

###### verbose?

`boolean`

If `true`, logs additional debugging information. Defaults to `false`.

###### Returns

`Promise`\<`string`\>

A promise that resolves to the AI's answer to the query based on the retrieved context.

###### Examples

```ts
// Set these environment variables before running:
// AI_PROVIDER=gemini
// AI_MODEL=gemini-3-flash-preview
// AI_KEY=your-gemini-api-key
// AI_EMBEDDINGS_PROVIDER=ollama
// AI_EMBEDDINGS_MODEL=nomic-embed-text
// Load a dataset of recipes
const sdb = new SimpleDB();
const answer = await sdb
  .newTable("recipes")
  .loadData("recipes.parquet")
  .aiRAG(
    "I want a buttery pastry for breakfast.",
    "Dish", // Column with unique IDs
    "Recipe", // Column with text to search
    10, // The 10 most relevant recipes passed to the LLM
    { verbose: true }, // Log debugging information and timings
  );

console.log(answer);
// Example output: "I recommend croissants.
// They are a classic buttery pastry perfect for breakfast..."
```

```ts
// Use Ollama for both retrieval embeddings and answer generation.
const answer = await table.aiRAG(
  "I want a buttery pastry for breakfast.",
  "Dish",
  "Recipe",
  10,
  {
    generation: { provider: "ollama", model: "gemma3:4b" },
    embeddings: { provider: "ollama", model: "nomic-embed-text" },
  },
);
```

##### aiRowByRow()

> **aiRowByRow**(`column`, `newColumn`, `prompt`, `options?`): `this`

Applies a prompt to the value of each row in a specified column, storing the AI's response in one or more new columns. Requests are processed by a worker pool with configurable batching and concurrency.

This method automatically appends instructions to your prompt; set `verbose` to `true` to see the full prompt.

This method supports Gemini, Vertex AI, and Ollama.

Environment variables are named configuration values supplied to the running process. By default, this method reads `AI_PROVIDER` (`"gemini"` or `"ollama"`; defaults to `"gemini"`), `AI_MODEL` (for example, `"gemini-3-flash-preview"` or `"gemma3:4b"`), and, for Gemini, either `AI_KEY` (for example, `"your-gemini-api-key"`) or both `AI_PROJECT` (for example, `"my-google-cloud-project"`) and `AI_LOCATION` (for example, `"us-central1"`). Values passed through `generation` override the corresponding environment values. When using Ollama, ensure it is running.

To manage rate limits, use `batchSize` to process multiple rows per request and `rateLimitPerMinute` to pace requests across the worker pool. The `concurrency` option controls how many requests may run in parallel.

Results are cached locally in `.journalism-cache` by default. Set `generation.cache` to `false` to disable caching, and remember to add `.journalism-cache` to your `.gitignore`.

If the AI returns fewer items than expected in a batch, or if a custom `test` function fails, the `retry` option will reattempt the request. The `retryCheck` function can restrict which errors are retried.

By default, a failed batch throws. Set `errorColumn` to store the error on every row in the failed batch, set its output columns to `NULL`, and continue processing other batches. Successful rows contain `NULL` in the error column.

Only the input column and generated columns pass through JavaScript. Unrelated SQL values and types, including vectors and geometry, remain in DuckDB. Generated columns are staged in bounded batches and replace existing output columns with inferred types. Uncaught generation or staging failures leave the original table data unchanged.

This method queues the AI processing; requests are sent when an async observer method (like `getData()` or `log()`) is awaited, or when `run()` is called.

###### Parameters

###### column

`string`

The name of the column to be used as input for the AI prompt.

###### newColumn

`string` \| `string`[]

The name of the new column (or an array of column names) where the AI's response will be stored.

###### prompt

`string`

The input string to guide the AI's response.

###### options?

Configuration options for the AI request.

###### batchSize?

`number`

The number of rows to process in each batch. Defaults to `1`.

###### concurrency?

`number`

The number of concurrent requests to send. Defaults to `1`.

###### errorColumn?

`string`

The optional column where per-row error messages are stored. When omitted, a failed batch throws.

###### extraInstructions?

`string`

Additional instructions to append to the prompt, providing more context or guidance for the AI.

###### generation?

\{ systemPrompt?: string \| undefined; model?: string \| undefined; schemaJson?: unknown; cache?: boolean \| undefined; processResponse?: ((response: unknown) =\> unknown) \| undefined; temperature?: number \| undefined; \} & (\{ ...; \} \| ... 2 more ... \| \{ ...; \})

Optional Gemini or Ollama generation configuration.

###### logProgress?

`boolean`

If `true`, logs request-pool progress. Defaults to `false`.

###### metrics?

\{ `totalCost`: `number`; `totalInputTokens`: `number`; `totalOutputTokens`: `number`; `totalRequests`: `number`; \}

An object to track cumulative metrics across multiple AI requests. Pass an object with totalCost, totalInputTokens, totalOutputTokens, and totalRequests properties (all initialized to 0). The function will update these values after each request. Note: totalCost is only calculated for Google GenAI models, not for Ollama.

###### metrics.totalCost

`number`

###### metrics.totalInputTokens

`number`

###### metrics.totalOutputTokens

`number`

###### metrics.totalRequests

`number`

###### processResponse?

(`response`) => `unknown`

Transforms or validates the parsed response for a batch. Return the resulting array, or a promise of it; throwing or rejecting follows `retry` and `retryCheck`. Runs on cached responses too. The result must preserve row count and order and include every requested column. Defaults to `undefined`.

###### rateLimitPerMinute?

`number`

The maximum number of provider requests started per minute. Request starts are spaced across the worker pool; cached responses bypass the limit. Defaults to `undefined` (no limit).

###### retry?

`number`

The number of times to retry the request in case of failure. Defaults to `0`.

###### retryCheck?

(`error`) => `boolean` \| `Promise`\<`boolean`\>

A function that receives an error and returns whether it should be retried. Defaults to `undefined`.

###### test?

(`result`) => `void`

A function to validate the returned data. If it throws an error, the request will be retried (if `retry` is set). Defaults to `undefined`.

###### verbose?

`boolean`

If `true`, logs additional debugging information, including the full prompt sent to the AI. Defaults to `false`.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
const people = await sdb
  .newTable("people")
  .loadArray([
    { name: "Marie" },
    { name: "John" },
    { name: "Alex" },
  ])
  .aiRowByRow(
    "name",
    "gender",
    `Guess whether it's a "Man" or a "Woman". If it could be both, return "Neutral".`,
    {
      generation: {
        provider: "gemini",
        model: "gemini-3-flash-preview",
      },
      batchSize: 10, // Process 10 rows at once
      concurrency: 5, // Process up to 5 requests concurrently
      errorColumn: "error", // Store failed rows instead of throwing
      test: (data: { [key: string]: unknown }) => { // Validate AI's response
        if (
          typeof data.gender !== "string" ||
          !["Man", "Woman", "Neutral"].includes(data.gender)
        ) {
          throw new Error(`Invalid response: ${data.gender}`);
        }
      },
      retry: 3, // Retry up to 3 times on failure
      rateLimitPerMinute: 15, // Limit requests to 15 per minute
      verbose: true, // Log detailed information
    },
  )
  .log();

// Example results:
// [
//   { name: "Marie", gender: "Woman" },
//   { name: "John", gender: "Man" },
//   { name: "Alex", gender: "Neutral" },
// ]
```

```ts
// Set these environment variables before running:
// AI_PROVIDER=gemini
// AI_MODEL=gemini-3-flash-preview
// AI_KEY=your-gemini-api-key
const cities = await sdb
  .newTable("cities")
  .loadArray([
    { city: "Marrakech" },
    { city: "Kyoto" },
    { city: "Auckland" },
  ])
  .aiRowByRow(
    "city",
    ["country", "continent"], // Multiple new columns
    `Give me the country and continent of the city.`,
    { verbose: true },
  )
  .log();

// Example results:
// [
//   { city: "Marrakech", country: "Morocco", continent: "Africa" },
//   { city: "Kyoto", country: "Japan", continent: "Asia" },
//   { city: "Auckland", country: "New Zealand", continent: "Oceania" },
// ]
```

```ts
const names = await sdb
  .newTable("names")
  .loadArray([{ name: "Marie" }, { name: "John" }])
  .aiRowByRow("name", "description", "Describe this name.", {
    generation: { provider: "ollama", model: "gemma3:4b" },
  })
  .log();
```

```ts
await sdb
  .newTable("country_names")
  .loadArray([{ city: "Paris" }])
  .aiRowByRow("city", "country", "Return the country name.", {
    processResponse: (response) => {
      if (!Array.isArray(response)) throw new Error("Expected an array.");
      return response.map((row: unknown) => {
        if (
          typeof row !== "object" || row === null ||
          !("country" in row) || typeof row.country !== "string"
        ) throw new Error("Expected a country name.");
        return { country: row.country.trim() };
      });
    },
    retry: 2,
  })
  .log();
```

##### aiVectorSimilarity()

> **aiVectorSimilarity**(`text`, `column`, `nbResults`, `options?`): `this`

Creates an embedding from a specified text and returns the most similar text content based on their embeddings.
This method is useful for semantic search and text similarity tasks, computing cosine distance and sorting results by similarity.

Environment variables are named configuration values supplied to the running process. By default, this method reads `AI_EMBEDDINGS_PROVIDER` (`"gemini"` or `"ollama"`; defaults to `"gemini"`), `AI_EMBEDDINGS_MODEL` (for example, `"gemini-embedding-001"` or `"nomic-embed-text"`), and, for Gemini, either `AI_KEY` (for example, `"your-gemini-api-key"`) or both `AI_PROJECT` (for example, `"my-google-cloud-project"`) and `AI_LOCATION` (for example, `"us-central1"`). Values passed through `embeddings` override the corresponding environment values.

Gemini, Vertex AI, and Ollama are supported. The selected provider and model must match those used to create the stored embedding column so the vectors share the same dimensions and embedding space.

The query embedding is cached in `.journalism-cache` by default. Set `embeddings.cache` to `false` to disable this request cache, and remember to add `.journalism-cache` to your `.gitignore`.

If `createIndex` is `true`, an HNSW index will be created on the embeddings column using the [duckdb-vss extension](https://github.com/duckdb/duckdb-vss) to speed up processing. If the index already exists, it will not be recreated unless `overwriteIndex` is `true`.
The work is queued and runs in chain order at the next awaited observer or `run()` call.

###### Parameters

###### text

`string`

The text for which to generate an embedding and find similar content.

###### column

`string`

The name of the column containing the embeddings to be used for the similarity search.

###### nbResults

`number`

The maximum number of most similar results to return.

###### options?

An optional object with configuration options:

###### createIndex?

`boolean`

If `true`, an HNSW index will be created on the embeddings column. Defaults to `false`.

###### efConstruction?

`number`

The number of candidate vertices to consider during index construction. Higher values result in more accurate indexes but increase build time. Defaults to 128.

###### efSearch?

`number`

The number of candidate vertices to consider during search. Higher values result in more accurate searches but increase search time. Defaults to 64.

###### embeddings?

\{ `apiKey?`: `undefined`; `cache?`: `boolean`; `contextWindow?`: `undefined`; `location?`: `undefined`; `model?`: `string`; `ollama?`: `undefined`; `project?`: `undefined`; `provider?`: `undefined`; `verbose?`: `boolean`; `vertex?`: `undefined`; \} \| \{ `apiKey?`: `string`; `cache?`: `boolean`; `contextWindow?`: `undefined`; `location?`: `undefined`; `model?`: `string`; `ollama?`: `undefined`; `project?`: `undefined`; `provider`: `"gemini"`; `verbose?`: `boolean`; `vertex?`: `false`; \} \| \{ `apiKey?`: `string`; `cache?`: `boolean`; `contextWindow?`: `undefined`; `location?`: `string`; `model?`: `string`; `ollama?`: `undefined`; `project?`: `string`; `provider`: `"gemini"`; `verbose?`: `boolean`; `vertex`: `true`; \} \| \{ `apiKey?`: `undefined`; `cache?`: `boolean`; `contextWindow?`: `number`; `location?`: `undefined`; `model?`: `string`; `ollama?`: \{ `embeddingEndpoint?`: `string`; `embed`(`request`): `Promise`\<\{ `embeddings`: `number`[][]; \}\>; \}; `project?`: `undefined`; `provider`: `"ollama"`; `verbose?`: `boolean`; `vertex?`: `undefined`; \}

Optional Gemini or Ollama embedding configuration.

###### M?

`number`

The maximum number of neighbors to keep for each vertex in the graph. Higher values result in more accurate indexes but increase build time and memory usage. Defaults to 16.

###### minSimilarity?

`number`

A threshold between 0.0 and 1.0 to filter out results that are not similar enough. For example, 0.7 ensures only results with a 70% similarity or higher are returned. Defaults to `undefined` (no threshold).

###### outputTable?

`string`

The name of the output table where the results will be stored. If not provided, the current table will be modified. Defaults to `undefined`.

###### overwriteIndex?

`boolean`

If `true` and `createIndex` is `true`, drops and recreates the VSS index even if it already exists. Defaults to `false`.

###### similarityColumn?

`string` \| `boolean`

A custom name, or true for a new column named "similarity" containing cosine similarity scores; false or omitted adds no score. Names must be nonempty and contain no null characters. Existing column names conflict case-insensitively (ASCII), including when outputTable is set, and are rejected before requesting embeddings or modifying the table.

###### verbose?

`boolean`

If `true`, logs additional debugging information. Defaults to `false`.

###### Returns

`this`

The table that will contain the similarity results, so methods can be chained.

###### Examples

```ts
// Set these environment variables before running:
// AI_EMBEDDINGS_PROVIDER=gemini
// AI_EMBEDDINGS_MODEL=gemini-embedding-001
// AI_KEY=your-gemini-api-key
const similarFood = await sdb
  .newTable("food")
  .loadArray([
    { food: "pizza" },
    { food: "sushi" },
    { food: "burger" },
    { food: "pasta" },
    { food: "salad" },
    { food: "tacos" },
  ])
  .aiEmbeddings("food", "embeddings")
  .aiVectorSimilarity("italian food", "embeddings", 3, {
    createIndex: true,
    minSimilarity: 0.6,
    similarityColumn: "score",
  })
  .log();
```

```ts
// Query an embedding column created with the same Ollama model.
const similarFood = await table
  .aiVectorSimilarity("italian food", "embeddings", 3, {
    embeddings: { provider: "ollama", model: "nomic-embed-text" },
  })
  .log();
```

```ts
// Include scores under the default "similarity" column name.
await table
  .aiVectorSimilarity("italian food", "embeddings", 3, {
    similarityColumn: true,
  })
  .log();
```

##### hybridSearch()

> **hybridSearch**(`query`, `idColumn`, `textColumn`, `nbResults`, `options?`): `this`

Performs hybrid text search combining vector similarity and BM25 text search using Reciprocal Rank Fusion (RRF).

This method:
1. Ensures compatible embeddings exist for the text column
2. Runs vector similarity search and BM25 text search in parallel
3. Fuses the results using Reciprocal Rank Fusion to get the best matches
4. Returns the top results ordered by relevance, replacing the current table unless `outputTable` is specified

When vector search is enabled, embedding responses are cached in `.journalism-cache`, and the table with its generated embedding column is cached in `.sda-cache`. Set `embeddings.cache` to `false` to disable both caches.

The method stores document embeddings in `{textColumn}_embeddings`. SDA saves the embedding settings alongside the table in DuckDB so it can check whether existing vectors are compatible, including after reopening the database. Missing, incompatible, or untracked embeddings are generated automatically. Managed vector indexes are dropped before replacing existing embeddings.

Changes to the source text are not detected. After editing or reloading the text, call `aiEmbeddings(textColumn, textColumn + "_embeddings", { embeddings })` with the same embedding options to refresh the vectors before searching.

Remove `.journalism-cache` and `.sda-cache` to clear existing cache entries. Remember to add both directories to your `.gitignore`.

This method supports Gemini, Vertex AI, and Ollama embeddings.

Environment variables are named configuration values supplied to the running process. By default, this method reads `AI_EMBEDDINGS_PROVIDER` (`"gemini"` or `"ollama"`; defaults to `"gemini"`), `AI_EMBEDDINGS_MODEL` (for example, `"gemini-embedding-001"` or `"nomic-embed-text"`), and, for Gemini, either `AI_KEY` (for example, `"your-gemini-api-key"`) or both `AI_PROJECT` (for example, `"my-google-cloud-project"`) and `AI_LOCATION` (for example, `"us-central1"`). Values passed through `embeddings` override the corresponding environment values.

The selected embedding provider is used for both stored row embeddings and the query embedding.

When BM25 search is enabled, its required full-text search index is created or reused automatically. When vector search is enabled, set `createIndex` to `true` to also create an HNSW index using the [duckdb-vss extension](https://github.com/duckdb/duckdb-vss).

The work is queued and runs in chain order at the next awaited observer or `run()` call.

###### Parameters

###### query

`string`

The search query text.

###### idColumn

`string`

The name of the column containing unique identifiers for each row.

###### textColumn

`string`

The name of the column containing the text content to search through.

###### nbResults

`number`

The number of most similar rows to retrieve.

###### options?

Configuration options for the hybrid search.

###### b?

`number`

The BM25 b parameter controlling document length normalization (0-1 range). Defaults to `0.75`.

###### bm25?

`boolean`

If `true`, includes BM25 text search in the hybrid search. Defaults to `true`.

###### bm25MinScore?

`number`

A threshold to filter BM25 results. Only rows with a BM25 score above this value will be included in the final results. Defaults to `undefined` (no threshold).

###### bm25ScoreColumn?

`string`

If provided, a new column with this name will be added to the output table containing the BM25 score for each row.

###### conjunctive?

`boolean`

If `true`, all terms in the query string must be present in order for a document to be retrieved during the BM25 search. Defaults to `false`.

###### createIndex?

`boolean`

If `true`, creates an HNSW index when vector search is enabled. The BM25 FTS index is managed automatically whenever BM25 search is enabled. Defaults to `false`.

###### efConstruction?

`number`

The number of candidate vertices to consider during index construction. Higher values result in more accurate indexes but increase build time. Defaults to 128.

###### efSearch?

`number`

The number of candidate vertices to consider during search. Higher values result in more accurate searches but increase search time. Defaults to 64.

###### embeddings?

\{ `apiKey?`: `undefined`; `cache?`: `boolean`; `contextWindow?`: `undefined`; `location?`: `undefined`; `model?`: `string`; `ollama?`: `undefined`; `project?`: `undefined`; `provider?`: `undefined`; `verbose?`: `boolean`; `vertex?`: `undefined`; \} \| \{ `apiKey?`: `string`; `cache?`: `boolean`; `contextWindow?`: `undefined`; `location?`: `undefined`; `model?`: `string`; `ollama?`: `undefined`; `project?`: `undefined`; `provider`: `"gemini"`; `verbose?`: `boolean`; `vertex?`: `false`; \} \| \{ `apiKey?`: `string`; `cache?`: `boolean`; `contextWindow?`: `undefined`; `location?`: `string`; `model?`: `string`; `ollama?`: `undefined`; `project?`: `string`; `provider`: `"gemini"`; `verbose?`: `boolean`; `vertex`: `true`; \} \| \{ `apiKey?`: `undefined`; `cache?`: `boolean`; `contextWindow?`: `number`; `location?`: `undefined`; `model?`: `string`; `ollama?`: \{ `embeddingEndpoint?`: `string`; `embed`(`request`): `Promise`\<\{ `embeddings`: `number`[][]; \}\>; \}; `project?`: `undefined`; `provider`: `"ollama"`; `verbose?`: `boolean`; `vertex?`: `undefined`; \}

Optional Gemini or Ollama embedding configuration.

###### embeddingsConcurrency?

`number`

The number of concurrent requests to send to the embeddings service. Defaults to `1`.

###### ignore?

`string`

The regular expression of patterns to be ignored for the BM25 FTS index. Defaults to "(\\.|[^a-z])+".

###### k?

`number`

The BM25 k parameter controlling term frequency saturation. Defaults to `1.2`.

###### lower?

`boolean`

A boolean indicating whether to convert all text to lowercase for the BM25 FTS index. Defaults to true.

###### M?

`number`

The maximum number of neighbors to keep for each vertex in the graph. Higher values result in more accurate indexes but increase build time and memory usage. Defaults to 16.

###### outputTable?

`string`

The name of a new table where the results will be stored. If not provided, the current table will be replaced with the search results.

###### stemmer?

`"arabic"` \| `"basque"` \| `"catalan"` \| `"danish"` \| `"dutch"` \| `"english"` \| `"finnish"` \| `"french"` \| `"german"` \| `"greek"` \| `"hindi"` \| `"hungarian"` \| `"indonesian"` \| `"irish"` \| `"italian"` \| `"lithuanian"` \| `"nepali"` \| `"norwegian"` \| `"porter"` \| `"portuguese"` \| `"romanian"` \| `"russian"` \| `"serbian"` \| `"spanish"` \| `"swedish"` \| `"tamil"` \| `"turkish"` \| `"none"`

The language stemmer to apply for BM25 word normalization. Supports multiple languages or "none" to disable stemming. Defaults to `'porter'`.

###### stopwords?

`string`

The table containing the stopwords to use for the BM25 FTS index. Supports multiple languages or "none" to disable stopwords. Defaults to "english".

###### stripAccents?

`boolean`

A boolean indicating whether to remove accents for the BM25 FTS index. Defaults to true.

###### times?

\{ `bm25End?`: `number`; `bm25Start?`: `number`; `embeddingEnd?`: `number`; `embeddingStart?`: `number`; `start?`: `number`; `vectorSearchEnd?`: `number`; `vectorSearchStart?`: `number`; \}

An optional object to track timing information. If provided, it will be updated with detailed timing breakdowns (embeddingStart, embeddingEnd, vectorSearchStart, vectorSearchEnd, bm25Start, bm25End). Useful when calling from aiRAG to get combined timing information.

###### times.bm25End?

`number`

###### times.bm25Start?

`number`

###### times.embeddingEnd?

`number`

###### times.embeddingStart?

`number`

###### times.start?

`number`

###### times.vectorSearchEnd?

`number`

###### times.vectorSearchStart?

`number`

###### vectorMinSimilarity?

`number`

A threshold between 0.0 and 1.0 to filter out vector search results that are not similar enough. For example, 0.7 ensures only results with a 70% similarity or higher are included in the final results. Defaults to `undefined` (no threshold).

###### vectorSearch?

`boolean`

If `true`, includes vector similarity search in the hybrid search. Defaults to `true`.

###### vectorSimilarityColumn?

`string`

If provided, a new column with this name will be added to the output table containing the vector similarity score (from 0.0 to 1.0) for each row.

###### verbose?

`boolean`

If `true`, logs additional debugging information. Defaults to `false`.

###### Returns

`this`

The table that will contain the search results, so methods can be chained.

###### Examples

```ts
// Set these environment variables before running:
// AI_EMBEDDINGS_PROVIDER=gemini
// AI_EMBEDDINGS_MODEL=gemini-embedding-001
// AI_KEY=your-gemini-api-key
// Load a dataset of recipes
const sdb = new SimpleDB();
const results = await sdb
  .newTable("recipes")
  .loadData("recipes.parquet")
  .hybridSearch("buttery pastry for breakfast", "Dish", "Recipe", 10, {
    verbose: true,
  })
  .log();
```

```ts
// Run hybrid search with local Ollama embeddings.
const results = await table
  .hybridSearch("buttery pastry", "Dish", "Recipe", 10, {
    embeddings: { provider: "ollama", model: "nomic-embed-text" },
  })
  .log();
```

#### Analyzing Data

##### accumulate()

> **accumulate**(`column`, `newColumn`, `options?`): `this`

Computes the cumulative sum of values in a column. For this method to work properly, ensure your data is sorted first.

###### Parameters

###### column

`string`

The name of the column storing the values to be accumulated.

###### newColumn

`string`

The name of the new column in which the computed cumulative values will be stored.

###### options?

An optional object with configuration options:

###### by?

`string` \| `string`[]

The column name or an array of column names to partition by. Accumulation is performed independently within each group.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Compute the cumulative sum of 'sales' in a new 'cumulativeSales' column
// Ensure the table is sorted by a relevant column (e.g., date) before calling this method.
await table.accumulate("sales", "cumulativeSales").log();
```

```ts
// Compute the cumulative sum of 'orders' by 'customer_id'
// Ensure the table is sorted by 'customer_id' and then by a relevant order column (e.g., order_date).
await table.accumulate("orders", "cumulativeOrders", { by: "customer_id" }).log();
```

```ts
// Compute the cumulative sum of 'revenue' by 'region' and 'product_category'
await table.accumulate("revenue", "cumulativeRevenue", { by: ["region", "product_category"] }).log();
```

###### Inherited from

`SimpleTableCore.accumulate`

##### addSummaryRows()

> **addSummaryRows**(`columns`, `labelColumn`, `options?`): `this`

Adds one or more summary rows to the table. Each row is calculated from
the original rows before any summary rows are added. This is useful for
preparing totals and other statistics before exporting tabular data.

Passing `"all"` selects every numeric column. Columns that are neither
summarized nor used for labels contain `NULL` in the added rows. A stat
string is also used as its row label; pass an object to customize that
label. If `options.stats` is omitted, every supported stat is added.

###### Parameters

###### columns

`string` \| `string`[]

The numeric column name, an array of numeric column names, or `"all"` to summarize every numeric column.

###### labelColumn

`string`

The existing string column in which stat row labels will be written.

###### options?

An optional object with configuration options:

###### position?

`"bottom"` \| `"top"`

Whether to add the summary rows at the `"top"` or `"bottom"` of the table. Defaults to `"bottom"`.

###### stats?

`"min"` \| `"max"` \| `"mean"` \| `"median"` \| `"sum"` \| `"countDistinct"` \| `"countNull"` \| `"skew"` \| `"stdDev"` \| `"variance"` \| \{ `label?`: `string`; `stat`: `"min"` \| `"max"` \| `"mean"` \| `"median"` \| `"sum"` \| `"countDistinct"` \| `"countNull"` \| `"skew"` \| `"stdDev"` \| `"variance"`; \} \| (`"min"` \| `"max"` \| `"mean"` \| `"median"` \| `"sum"` \| `"countDistinct"` \| `"countNull"` \| `"skew"` \| `"stdDev"` \| `"variance"` \| \{ `label?`: `string`; `stat`: `"min"` \| `"max"` \| `"mean"` \| `"median"` \| `"sum"` \| `"countDistinct"` \| `"countNull"` \| `"skew"` \| `"stdDev"` \| `"variance"`; \})[]

A stat, stat configuration, or array of either. Supported stats are `"countDistinct"`, `"countNull"`, `"min"`, `"max"`, `"mean"`, `"median"`, `"sum"`, `"skew"`, `"stdDev"`, and `"variance"`. An object's `label` defaults to its `stat`. If omitted, all supported stats are added.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Add a total row for every numeric column, labelled "sum" in "region".
await table.addSummaryRows("all", "region", { stats: "sum" }).log();
```

```ts
// Add two summary rows with default labels.
await table.addSummaryRows(["sales", "expenses"], "region", {
  stats: ["sum", "mean"],
  position: "top",
}).log();
```

```ts
// Customize the labels written to the label column.
await table.addSummaryRows("all", "region", {
  stats: [
    { stat: "sum", label: "Total" },
    { stat: "mean", label: "Average" },
  ],
}).log();
```

###### Inherited from

`SimpleTableCore.addSummaryRows`

##### bins()

> **bins**(`column`, `interval`, `startColumn`, `endColumn`, `options?`): `this`

Adds numeric start and end columns for bins of the specified interval size.
Each bin includes its start and excludes its end: `start <= value < end`.
A value exactly on an end boundary belongs to the next bin. Null source
values produce null in both output columns.

###### Parameters

###### column

`string`

The numeric column containing values from which bins will be computed.

###### interval

`number`

The finite, positive interval size for binning the values.

###### startColumn

`string`

The required name of the new numeric column containing inclusive bin starts.

###### endColumn

`string`

The required name of the new numeric column containing exclusive bin ends. Must differ from startColumn.

###### options?

An optional object with configuration options:

###### startValue?

`number`

The finite starting value for binning, no greater than the minimum source value. Defaults to the minimum value in the specified column.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// If the minimum is 5, bins have boundaries 5 and 15, 15 and 25, etc.
await table.bins("column1", 10, "binStart", "binEnd").log();
```

```ts
// Bins start at 0: a value of 10 has binStart 10 and binEnd 20.
await table
  .bins("column1", 10, "binStart", "binEnd", { startValue: 0 })
  .log();
```

###### Inherited from

`SimpleTableCore.bins`

##### columnProportions()

> **columnProportions**(`column`, `newColumn`, `options?`): `this`

Computes proportions vertically over a column's values, relative to the sum of all values in that column or group.

###### Parameters

###### column

`string`

The column containing values for which proportions will be computed. The proportions are calculated based on the sum of values in the specified column.

###### newColumn

`string`

The name of the new column where the proportions will be stored.

###### options?

An optional object with configuration options:

###### base?

`number`

A finite positive value that the proportions in the column or each group sum to before rounding. Defaults to `1`.

###### by?

`string` \| `string`[]

The column name or an array of column names to partition by. Proportions are calculated independently within each group.

###### decimals?

`number`

The number of decimal places to round the computed proportions. Defaults to `undefined` (no rounding).

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Add a new column 'perc' with each 'column1' value divided by the sum of all 'column1' values
await table.columnProportions("column1", "perc").log();
```

```ts
// Compute proportions for 'column1' by 'column2', rounded to two decimal places
await table.columnProportions("column1", "perc", { by: "column2", decimals: 2 }).log();
```

```ts
// Compute percentages that sum to 100 before rounding
await table.columnProportions("sales", "sales_percentage", { base: 100, decimals: 1 }).log();
```

```ts
// Compute proportions for 'sales' by 'region' and 'product_type'
await table.columnProportions("sales", "sales_proportion", { by: ["region", "product_type"] }).log();
```

###### Inherited from

`SimpleTableCore.columnProportions`

##### correlations()

> **correlations**(`options?`): `this`

Calculates correlations between columns. If no `x` and `y` columns are specified, the method computes the correlations for all numeric column combinations.
Note that correlation is symmetrical: the correlation of `x` with `y` is the same as `y` with `x`.

###### Parameters

###### options?

An optional object with configuration options:

###### by?

`string` \| `string`[]

The column name or an array of column names to group by. Correlations are calculated independently within each group.

###### decimals?

`number`

The number of decimal places to round the correlation values. Defaults to `undefined` (no rounding).

###### outputTable?

`string` \| `boolean`

If `true`, the results will be stored in a new table with a generated name. If a string, it will be used as the name for the new table. If `false` or omitted, the current table will be overwritten. Defaults to `false`.

###### x?

`string`

The name of the column for the x-values. If omitted, correlations will be computed for all numeric columns.

###### y?

`string`

The name of the column for the y-values. It can be provided only when `options.x` is also set. If both are omitted, correlations will be computed for all numeric column pairs.

###### Returns

`this`

A table instance containing the correlation results (either the current table or a new table), so methods can be chained.

###### Examples

```ts
// Compute correlations between all numeric columns, overwriting the current table
await table.correlations().log();
```

```ts
// Compute correlations between 'column1' and all other numeric columns
await table.correlations({ x: "column1" }).log();
```

```ts
// Compute the correlation between 'column1' and 'column2'
await table.correlations({ x: "column1", y: "column2" }).log();
```

```ts
// Compute correlations within 'categoryColumn' and store results in a new table
const correlationTable = await table.correlations({ by: "categoryColumn", outputTable: true }).log();
```

```ts
// Compute correlations, rounded to 2 decimal places
await table.correlations({ decimals: 2 }).log();
```

###### Inherited from

`SimpleTableCore.correlations`

##### indexValues()

> **indexValues**(`column`, `newColumn`, `reference`, `options?`): `this`

Indexes a numeric column by dividing each value by a reference value and multiplying the result by a base value.

The reference can be calculated from the indexed column with a statistic, read from exactly one row selected by another column's value, or read from the unique row where another column reaches its minimum or maximum. With `options.by`, references are calculated or selected independently within each group. Null values in the indexed column remain null when their group has a valid reference. The operation throws when a group has no unique selected row or its reference value is null or zero.

Exact temporal references are compared at their full DuckDB precision. JavaScript `Date` objects only have millisecond precision and always represent an instant. Construct them with an explicit timezone, such as `new Date("2001-01-01T00:00:00Z")`; date-time strings without `Z` or an offset use the user's local timezone.

###### Parameters

###### column

`string`

The numeric column containing the values to index.

###### newColumn

`string`

The name of the new column where indexed values will be stored.

###### reference

\{ `at?`: `undefined`; `column?`: `undefined`; `equals?`: `undefined`; `stat`: `"min"` \| `"max"` \| `"mean"` \| `"median"`; \} \| \{ `at?`: `undefined`; `column`: `string`; `equals`: `string` \| `number` \| `bigint` \| `boolean` \| `Date`; `stat?`: `undefined`; \} \| \{ `at`: `"min"` \| `"max"`; `column`: `string`; `equals?`: `undefined`; `stat?`: `undefined`; \}

A statistic calculated from `column`, a column and exact non-null `equals` value selecting a row, or a column and `at` set to `min` or `max` selecting its unique extreme row. The selected row's `column` value becomes the reference.

###### Type Literal

\{ `at?`: `undefined`; `column?`: `undefined`; `equals?`: `undefined`; `stat`: `"min"` \| `"max"` \| `"mean"` \| `"median"`; \}

A statistic calculated from `column`, a column and exact non-null `equals` value selecting a row, or a column and `at` set to `min` or `max` selecting its unique extreme row. The selected row's `column` value becomes the reference.

###### at?

`undefined`

Selects the unique row where `reference.column` reaches its minimum or maximum.

###### column?

`undefined`

The column used to select an exact reference row or its unique minimum or maximum row.

###### equals?

`undefined`

The non-null value used to select an exact reference row. Its JavaScript type must be compatible with the reference column's DuckDB type; string, numeric, boolean, and temporal values are not coerced across type families. Date values should be constructed with an explicit timezone.

###### stat

`"min"` \| `"max"` \| `"mean"` \| `"median"`

The statistic used to calculate the reference directly from the indexed column.

***

###### Type Literal

\{ `at?`: `undefined`; `column`: `string`; `equals`: `string` \| `number` \| `bigint` \| `boolean` \| `Date`; `stat?`: `undefined`; \}

A statistic calculated from `column`, a column and exact non-null `equals` value selecting a row, or a column and `at` set to `min` or `max` selecting its unique extreme row. The selected row's `column` value becomes the reference.

###### at?

`undefined`

Selects the unique row where `reference.column` reaches its minimum or maximum.

###### column

`string`

The column used to select an exact reference row or its unique minimum or maximum row.

###### equals

`string` \| `number` \| `bigint` \| `boolean` \| `Date`

The non-null value used to select an exact reference row. Its JavaScript type must be compatible with the reference column's DuckDB type; string, numeric, boolean, and temporal values are not coerced across type families. Date values should be constructed with an explicit timezone.

###### stat?

`undefined`

The statistic used to calculate the reference directly from the indexed column.

***

###### Type Literal

\{ `at`: `"min"` \| `"max"`; `column`: `string`; `equals?`: `undefined`; `stat?`: `undefined`; \}

A statistic calculated from `column`, a column and exact non-null `equals` value selecting a row, or a column and `at` set to `min` or `max` selecting its unique extreme row. The selected row's `column` value becomes the reference.

###### at

`"min"` \| `"max"`

Selects the unique row where `reference.column` reaches its minimum or maximum.

###### column

`string`

The column used to select an exact reference row or its unique minimum or maximum row.

###### equals?

`undefined`

The non-null value used to select an exact reference row. Its JavaScript type must be compatible with the reference column's DuckDB type; string, numeric, boolean, and temporal values are not coerced across type families. Date values should be constructed with an explicit timezone.

###### stat?

`undefined`

The statistic used to calculate the reference directly from the indexed column.

###### options?

An optional object with configuration options.

###### base?

`number`

The finite positive value assigned to the reference. Defaults to `100`.

###### by?

`string` \| `string`[]

A column name or an array of column names to partition by. The reference is calculated independently within each group.

###### decimals?

`number`

A finite non-negative integer specifying the number of decimal places to retain. By default, values are not rounded.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Index each country's average home price to its January 2001 value.
await table.indexValues(
  "homePrice",
  "homePriceIndexed",
  {
    column: "date",
    equals: new Date("2001-01-01T00:00:00Z"),
  },
  {
    by: "country",
    base: 100,
    decimals: 1,
  },
).log();
```

```ts
// Index each value against the mean of its group.
await table.indexValues("homePrice", "homePriceIndexed", { stat: "mean" }, {
  by: "country",
}).log();
```

```ts
// Index each country's average home price to its earliest value.
// This throws if multiple rows share the earliest date in a country.
await table.indexValues("homePrice", "homePriceIndexed", {
  column: "date",
  at: "min",
}, { by: "country" }).log();
```

###### Inherited from

`SimpleTableCore.indexValues`

##### linearRegressions()

> **linearRegressions**(`options?`): `this`

Performs linear regression analysis. The results include the slope, the y-intercept, and the R-squared value.
If no `x` and `y` columns are specified, the method computes linear regression analysis for all numeric column permutations.
Note that linear regression analysis is asymmetrical: the linear regression of `x` over `y` is not the same as `y` over `x`.

###### Parameters

###### options?

An optional object with configuration options:

###### by?

`string` \| `string`[]

The column name or an array of column names to group by. Linear regressions are calculated independently within each group.

###### decimals?

`number`

The number of decimal places to round the regression values (slope, intercept, r-squared). Defaults to `undefined` (no rounding).

###### outputTable?

`string` \| `boolean`

If `true`, the results will be stored in a new table with a generated name. If a string, it will be used as the name for the new table. If `false` or omitted, the current table will be overwritten. Defaults to `false`.

###### x?

`string`

The name of the column for the independent variable (x-values). If omitted, linear regressions will be computed for all numeric columns as x.

###### y?

`string`

The name of the column for the dependent variable (y-values). It can be provided only when `options.x` is also set. If both are omitted, linear regressions will be computed for all numeric column permutations.

###### Returns

`this`

A table instance containing the linear regression results (either the current table or a new table), so methods can be chained.

###### Examples

```ts
// Compute all linear regressions between all numeric columns, overwriting the current table
await table.linearRegressions().log();
```

```ts
// Compute linear regressions with 'column1' as the independent variable and all other numeric columns as dependent variables
await table.linearRegressions({ x: "column1" }).log();
```

```ts
// Compute the linear regression of 'sales' (y) over 'advertising' (x)
await table.linearRegressions({ x: "advertising", y: "sales" }).log();
```

```ts
// Compute linear regressions by 'region' and store results in a new table
const regressionTable = await table.linearRegressions({ by: "region", outputTable: true }).log();
```

```ts
// Compute linear regressions, rounded to 3 decimal places
await table.linearRegressions({ decimals: 3 }).log();
```

###### Inherited from

`SimpleTableCore.linearRegressions`

##### normalize()

> **normalize**(`column`, `newColumn`, `options?`): `this`

Normalizes the values in a column using min-max normalization.

###### Parameters

###### column

`string`

The name of the column in which values will be normalized.

###### newColumn

`string`

The name of the new column where normalized values will be stored.

###### options?

An optional object with configuration options:

###### by?

`string` \| `string`[]

The column name or an array of column names to partition by. Normalization is performed independently within each group.

###### decimals?

`number`

The number of decimal places to round the normalized values. Defaults to `undefined` (no rounding).

###### range?

\[`number`, `number`\]

The inclusive range to scale normalized values to, as `[minimum, maximum]`. Both values must be finite and the minimum must be less than the maximum. Defaults to `[0, 1]`.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Normalize the values in 'column1' and store them in a new 'normalizedColumn1' column
await table.normalize("column1", "normalizedColumn1").log();
```

```ts
// Normalize 'value' by 'group'
await table.normalize("value", "normalizedValue", { by: "group" }).log();
```

```ts
// Normalize 'data' values, rounded to 2 decimal places
await table.normalize("data", "normalizedData", { decimals: 2 }).log();
```

```ts
// Normalize 'score' values to a range from 0 to 10
await table.normalize("score", "scaledScore", { range: [0, 10] }).log();
```

###### Inherited from

`SimpleTableCore.normalize`

##### outliersIQR()

> **outliersIQR**(`column`, `newColumn`, `options?`): `this`

Identifies outliers in a specified column using the Interquartile Range (IQR) method.

###### Parameters

###### column

`string`

The name of the column in which outliers will be identified.

###### newColumn

`string`

The name of the new column where the boolean results (`TRUE` for outlier, `FALSE` otherwise) will be stored.

###### options?

An optional object with configuration options:

###### by?

`string` \| `string`[]

The column name or an array of column names to partition by. Outliers are detected independently within each group.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Look for outliers in the 'age' column and store results in a new 'isOutlier' column
await table.outliersIQR("age", "isOutlier").log();
```

```ts
// Look for outliers in 'salary' by 'gender'
await table.outliersIQR("salary", "salaryOutlier", { by: "gender" }).log();
```

###### Inherited from

`SimpleTableCore.outliersIQR`

##### quantiles()

> **quantiles**(`column`, `count`, `newColumn`, `options?`): `this`

Assigns quantiles to rows in a new column based on specified column values.

###### Parameters

###### column

`string`

The column containing values from which quantiles will be assigned.

###### count

`number`

The number of quantiles to divide the data into (e.g., `4` for quartiles, `10` for deciles).

###### newColumn

`string`

The name of the new column where the assigned quantiles will be stored.

###### options?

An optional object with configuration options:

###### by?

`string` \| `string`[]

The column name or an array of column names to partition by. Quantiles are assigned independently within each group.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Assigns a quantile from 1 to 10 for each row in a new 'quantiles' column, based on 'column1' values.
await table.quantiles("column1", 10, "quantiles").log();
```

```ts
// Assign quantiles by 'column2', based on 'column1' values.
await table.quantiles("column1", 10, "quantiles", { by: "column2" }).log();
```

```ts
// Assigns quartiles (4 quantiles) to 'sales' data, storing results in 'salesQuartile'
await table.quantiles("sales", 4, "salesQuartile").log();
```

###### Inherited from

`SimpleTableCore.quantiles`

##### ranks()

> **ranks**(`column`, `newColumn`, `options?`): `this`

Assigns ranks to rows in a new column based on the values of a specified column.

###### Parameters

###### column

`string`

The column containing the values to be used for ranking.

###### newColumn

`string`

The name of the new column where the ranks will be stored.

###### options?

An optional object with configuration options:

###### by?

`string` \| `string`[]

The column name or an array of column names to rank by. Ranks are assigned independently within each group.

###### dense?

`boolean`

A boolean indicating whether to use dense ranking (no gaps). If `true`, ranks will be consecutive integers (e.g., 1, 2, 2, 3). If `false` (default), ranks might have gaps (e.g., 1, 2, 2, 4).

###### order?

`"desc"` \| `"asc"`

The order of values for ranking: `"asc"` for ascending (default) or `"desc"` for descending.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Compute ranks in a new 'rank' column based on 'score' values (ascending)
await table.ranks("score", "rank").log();
```

```ts
// Compute ranks in a new 'descRank' column based on 'score' values (descending)
await table.ranks("score", "descRank", { order: "desc" }).log();
```

```ts
// Compute ranks by 'department', based on 'salary' values, without gaps
await table.ranks("salary", "salaryRank", { by: "department", dense: true }).log();
```

```ts
// Compute ranks by both 'department' and 'city'
await table.ranks("sales", "salesRank", { by: ["department", "city"] }).log();
```

###### Inherited from

`SimpleTableCore.ranks`

##### rolling()

> **rolling**(`column`, `newColumn`, `stat`, `preceding`, `following`, `options?`): `this`

Computes rolling aggregations (e.g., rolling average, min, max) over a specified column.
For rows without enough preceding or following rows to form a complete window, `NULL` will be returned.
For this method to work properly, ensure your data is sorted by the relevant column(s) first.

###### Parameters

###### column

`string`

The name of the column storing the values to be aggregated.

###### newColumn

`string`

The name of the new column in which the computed rolling values will be stored.

###### stat

`"min"` \| `"max"` \| `"mean"` \| `"median"` \| `"sum"`

The aggregation function to apply: `"min"`, `"max"`, `"mean"`, `"median"`, or `"sum"`.

###### preceding

`number`

The number of preceding rows to include in the rolling window.

###### following

`number`

The number of following rows to include in the rolling window.

###### options?

An optional object with configuration options:

###### by?

`string` \| `string`[]

The column name or an array of column names to partition by. Rolling statistics are computed independently within each group.

###### decimals?

`number`

The number of decimal places to round the aggregated values. Defaults to `undefined` (no rounding).

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Compute a 7-day rolling average of 'sales' with 3 preceding and 3 following rows
// (total window size of 7: 3 preceding + current + 3 following)
await table.rolling("sales", "rollingAvgSales", "mean", 3, 3).log();
```

```ts
// Compute a rolling sum of 'transactions' by 'customer_id'
await table.rolling("transactions", "rollingSumTransactions", "sum", 5, 0, { by: "customer_id" }).log();
```

```ts
// Compute a rolling maximum of 'temperature' rounded to 1 decimal place
await table.rolling("temperature", "rollingMaxTemp", "max", 2, 2, { decimals: 1 }).log();
```

###### Inherited from

`SimpleTableCore.rolling`

##### rowProportions()

> **rowProportions**(`columns`, `options?`): `this`

Computes proportions horizontally across specified columns for each row.

For example, given a table showing counts of men, women, and non-binary individuals per year:

| Year | Men | Women | NonBinary |
| :--- | :-- | :---- | :-------- |
| 2021 | 564 | 685   | 145       |
| 2022 | 354 | 278   | 56        |
| 2023 | 856 | 321   | 221       |

This method computes the proportion of men, women, and non-binary individuals on each row, adding new columns for these proportions.

###### Parameters

###### columns

`string`[]

An array of column names for which proportions will be computed on each row.

###### options?

An optional object with configuration options:

###### base?

`number`

A finite positive value that the proportions in each row sum to before rounding. Defaults to `1`.

###### decimals?

`number`

The number of decimal places to round the computed proportions. Defaults to `undefined` (no rounding).

###### suffix?

`string`

A string suffix to append to the names of the new columns storing the computed proportions. Defaults to `"Perc"`.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Compute horizontal proportions for 'Men', 'Women', and 'NonBinary' columns, rounded to 2 decimal places
await table.rowProportions(["Men", "Women", "NonBinary"], { decimals: 2 }).log();
```

The table will then look like this:

| Year | Men | Women | NonBinary | MenPerc | WomenPerc | NonBinaryPerc |
| :--- | :-- | :---- | :-------- | :------ | :-------- | :------------ |
| 2021 | 564 | 685   | 145       | 0.4     | 0.49      | 0.10          |
| 2022 | 354 | 278   | 56        | 0.51    | 0.4       | 0.08          |
| 2023 | 856 | 321   | 221       | 0.61    | 0.23      | 0.16          |

By default, the new columns will be named with a suffix of `"Perc"`. You can customize this suffix using the `suffix` option.

```ts
// Compute horizontal proportions with a custom suffix "Prop"
await table.rowProportions(["Men", "Women", "NonBinary"], { suffix: "Prop", decimals: 2 }).log();
```

The table will then look like this:

| Year | Men | Women | NonBinary | MenProp | WomenProp | NonBinaryProp |
| :--- | :-- | :---- | :-------- | :------ | :-------- | :------------ |
| 2021 | 564 | 685   | 145       | 0.4     | 0.49      | 0.10          |
| 2022 | 354 | 278   | 56        | 0.51    | 0.4       | 0.08          |
| 2023 | 856 | 321   | 221       | 0.61    | 0.23      | 0.16          |

```ts
// Compute percentages that sum to 100 on each row before rounding
await table.rowProportions(["Men", "Women", "NonBinary"], { base: 100, decimals: 1 }).log();
```

###### Inherited from

`SimpleTableCore.rowProportions`

##### rowRanks()

> **rowRanks**(`columns`, `options`): `this`

Selects a ranked numeric value within each row and adds its source column
name, its value, or both as new columns.

Values are ranked from highest to lowest by default. Null values are
ignored. By default, a tie at the requested rank throws an error. Set
`options.ties` to `"first"` to select the first tied column in the supplied
order, or to `"all"` to produce one row for each tied column. The `"all"`
option can therefore increase the table's row count. If null values leave
a row without the requested rank, the new columns contain null.

###### Parameters

###### columns

`string`[]

The numeric columns to rank within each row.

###### options

\{ `nameColumn`: `string`; `valueColumn?`: `string`; \} \| \{ `nameColumn?`: `string`; `valueColumn`: `string`; \} & `object`

The output columns and ranking configuration. At least one of `nameColumn` or `valueColumn` is required.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Add the name and value of the highest-scoring party on each row.
await table.rowRanks(["CAQ", "PLQ", "PQ"], {
  nameColumn: "winner",
  valueColumn: "winningVotes",
}).log();
```

```ts
// Add only the second-lowest value on each row.
await table.rowRanks(["CAQ", "PLQ", "PQ"], {
  valueColumn: "secondLowestVotes",
  rank: 2,
  order: "asc",
}).log();
```

###### Inherited from

`SimpleTableCore.rowRanks`

##### similarityMahalanobis()

> **similarityMahalanobis**(`columns`, `referencePoint`, `newColumn`, `options?`): `this`

Measures numeric profile similarity using each row's Mahalanobis distance
from a supplied reference point and stores it in a new DOUBLE column.
Smaller distances indicate more similar profiles. Optionally adds a
dataset-relative similarity score, where larger values mean more similar.
Sample covariance (`n - 1`) is estimated from the dataset, independently
of the reference point.

Accounts for differences in feature scales and correlations between features,
making it useful for comparing profiles with measurements in different units.

Pass one numeric LIST or ARRAY column, or an array of numeric scalar columns.
Reference arrays follow the same dimension order. For scalar columns, a
reference object supplies its own finite numeric values by column name; extra
fields are ignored. Reference values are captured when this method is called.
Inputs are converted privately to DOUBLE, which can lose precision for large
integers and exact
decimals; source columns and types remain unchanged.

Requires more rows than dimensions and finite, non-null, consistent features
with invertible, numerically stable covariance. Invalid inputs leave the
source unchanged.

###### Parameters

###### columns

`string` \| `string`[]

A numeric vector column, or numeric scalar columns in feature order.

###### referencePoint

`number`[] \| \{\[`key`: `string`\]: `unknown`; \}

An array of finite numbers in feature order, or an object with an own finite numeric value for each scalar feature column; may be outside the dataset.

###### newColumn

`string`

The name of the new DOUBLE distance column.

###### options?

Optional output settings.

###### similarityColumn?

`string` \| `boolean`

A custom name, or true for a new DOUBLE column named "similarity"; false or omitted adds no score. The dataset-relative
score is `1 - distance / maxDistance`. Exact matches score 1 and the farthest
rows score 0; if all distances are zero, every score is 1.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Measure distance from a reference height and weight.
await table
  .similarityMahalanobis(["height", "weight"], [175, 70], "distance")
  .log();
```

```ts
// Compare feature vectors and add a dataset-relative similarity score.
await table
  .similarityMahalanobis("features", [175, 70], "distance", {
    similarityColumn: "similarity",
  })
  .log();
```

```ts
// Compare profiles directly with a row and use the default score column.
const reference = await table.getRow("name === 'Alex'");
await table
  .similarityMahalanobis(["height", "weight"], reference, "distance", {
    similarityColumn: true,
  })
  .log();
```

###### Inherited from

`SimpleTableCore.similarityMahalanobis`

##### summarize()

> **summarize**(`options?`): `this`

Creates a summary table from selected columns, optionally grouped by other columns.
This method allows you to aggregate data, calculate statistics (e.g., count, mean, sum), and group results by categorical columns.

###### Parameters

###### options?

An object with configuration options for summarization:

###### by?

`string` \| `string`[]

The column name or an array of column names to group by.

###### columns?

`string` \| `string`[]

The column name or an array of column names to summarize. If omitted, only the row count is returned.

###### datesToMs?

`boolean`

If `true`, timestamps, dates, and times will be converted to milliseconds before summarizing. This is useful when summarizing mixed data types (numbers and dates) as columns must be of the same type for aggregation.

###### decimals?

`number`

The number of decimal places to round the summarized columns. Defaults to `undefined` (no rounding).

###### outputTable?

`string` \| `boolean`

If `true`, the results will be stored in a new table with a generated name. If a string, it will be used as the name for the new table. If `false` or omitted, the current table will be overwritten. Defaults to `false`.

###### stats?

`"min"` \| `"max"` \| `"mean"` \| `"median"` \| `"sum"` \| `"count"` \| `"countDistinct"` \| `"countNull"` \| `"skew"` \| `"stdDev"` \| `"variance"` \| (`"min"` \| `"max"` \| `"mean"` \| `"median"` \| `"sum"` \| `"count"` \| `"countDistinct"` \| `"countNull"` \| `"skew"` \| `"stdDev"` \| `"variance"`)[] \| \{\[`key`: `string`\]: `"min"` \| `"max"` \| `"mean"` \| `"median"` \| `"sum"` \| `"count"` \| `"countDistinct"` \| `"countNull"` \| `"skew"` \| `"stdDev"` \| `"variance"`; \}

The statistics to compute. Can be a single statistic (e.g., `"mean"`), an array (e.g., `["min", "max"]`), or an object mapping output column names to statistics (e.g., `{ avgSalary: "mean" }`). Supported statistics are `"count"`, `"countDistinct"`, `"countNull"`, `"min"`, `"max"`, `"mean"`, `"median"`, `"sum"`, `"skew"`, `"stdDev"`, and `"variance"`.

###### Returns

`this`

A table instance containing the summarized data (either the current table or a new table), so methods can be chained. When summarizing more than one column, a `column` column identifies which input column each row summarizes.

###### Examples

```ts
// Summarize all columns with all available statistics, overwriting the current table
const columns = await table.getColumns();
await table.summarize({ columns }).log();
```

```ts
// Summarize all columns and store the results in a new table with a generated name
const columns = await table.getColumns();
const summaryTable = await table.summarize({ columns, outputTable: true }).log();
```

```ts
// Summarize all columns and store the results in a new table named 'mySummary'
const columns = await table.getColumns();
const mySummaryTable = await table.summarize({ columns, outputTable: "mySummary" }).log();
```

```ts
// Summarize a single column ('sales') with all available statistics
await table.summarize({ columns: "sales" }).log();
```

```ts
// Summarize multiple columns ('sales' and 'profit') with all available statistics
await table.summarize({ columns: ["sales", "profit"] }).log();
```

```ts
// Summarize 'sales' by 'region' (single category)
await table.summarize({ columns: "sales", by: "region" }).log();
```

```ts
// Summarize 'sales' by 'region' and 'product_type'
await table.summarize({ columns: "sales", by: ["region", "product_type"] }).log();
```

```ts
// Summarize 'sales' by 'region' with a specific statistic (mean)
await table.summarize({ columns: "sales", by: "region", stats: "mean" }).log();
```

```ts
// Summarize 'sales' by 'region' with specific statistics (mean and sum)
await table.summarize({ columns: "sales", by: "region", stats: ["mean", "sum"] }).log();
```

```ts
// Summarize 'sales' by 'region' with custom named statistics
await table.summarize({ columns: "sales", by: "region", stats: { averageSales: "mean", totalSales: "sum" } }).log();
```

```ts
// Summarize 'price' and 'cost', rounding aggregated columns to 2 decimal places
await table.summarize({ columns: ["price", "cost"], decimals: 2 }).log();
```

```ts
// Summarize 'timestamp_column' by converting to milliseconds first
await table.summarize({ columns: "timestamp_column", datesToMs: true, stats: "mean" }).log();
```

###### Inherited from

`SimpleTableCore.summarize`

##### zScore()

> **zScore**(`column`, `newColumn`, `options?`): `this`

Computes the Z-score for values in a specified column.

###### Parameters

###### column

`string`

The name of the column for which Z-scores will be calculated.

###### newColumn

`string`

The name of the new column where the computed Z-scores will be stored.

###### options?

An optional object with configuration options:

###### by?

`string` \| `string`[]

The column name or an array of column names to partition by. Z-scores are calculated independently within each group.

###### decimals?

`number`

The number of decimal places to round the Z-score values. Defaults to `undefined` (no rounding).

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Calculate the Z-score for 'age' values and store results in a new 'ageZScore' column
await table.zScore("age", "ageZScore").log();
```

```ts
// Calculate Z-scores for 'salary' by 'department'
await table.zScore("salary", "salaryZScore", { by: "department" }).log();
```

```ts
// Calculate Z-scores for 'score', rounded to 2 decimal places
await table.zScore("score", "scoreZScore", { decimals: 2 }).log();
```

###### Inherited from

`SimpleTableCore.zScore`

#### Caching

##### cache()

> **cache**(`compute`, `options?`): `Promise`\<[`SimpleTable`](#simpletable)\>

Caches the results of computations in `./.sda-cache`.
You should add `./.sda-cache` to your `.gitignore` file.

Callback code and function/class inputs ignore comments, indentation, and
line wrapping where safe.

`cache()` automatically tracks whether earlier SDA operations changed the
table. It also records every other already registered `SimpleTable` read
through `SimpleTable` methods while `compute` runs and invalidates the
cached step when any of their generations change. Tables created inside
`compute` are part of the computation itself and are not dependencies.

Inside `compute`, you may modify the table being cached and create or
modify temporary tables, provided you remove them before the callback
finishes. Other tables that already existed may be read but not modified,
renamed, or removed. `customQuery()` bypasses enforcement of these rules.

`SimpleDB.customQuery()` bypasses this tracking. Reading or changing a
table with `customQuery()` can therefore return stale cached data. Include
a value that identifies the custom query's dependencies in `options.inputs`
(such as a table content hash), or use tracked `SimpleTable` methods.

Cache entries are stored as DuckDB database files. Full-text search (FTS)
indexes are persisted in the cache file and restored directly on a cache
hit. Vector similarity search (VSS/HNSW) indexes are not persisted in the
cache file; their definitions are stored as metadata and used to rebuild
the indexes on every cache hit. If loading the entry or restoring its
indexes fails, the computation runs again and replaces the cache entry.

###### Parameters

###### compute

(`table`) => `void` \| `Promise`\<`void`\>

A function wrapping the computations to be cached. It receives the table on which `cache()` was called. This function will be executed on the first run or if the cached data is invalid/expired.

###### options?

An optional object with configuration options:

###### inputs?

readonly `unknown`[]

An ordered array of additional values captured by `compute` that affect its result. Each position is compared structurally across runs, so adding, removing, moving, or changing an input invalidates the cache. Functions and class constructors are compared by source. `SimpleTable` dependencies read by `compute` are tracked automatically, and the table being cached is already tracked, so neither needs to be included here.

###### ttl?

`number`

Cache lifetime in seconds. Omit for no expiration, use `0` to refresh the matching cache entry immediately, or provide a positive value to refresh once the entry reaches that age. The cache is also invalidated when the `compute` function, the table, or an input changes.

###### Returns

`Promise`\<[`SimpleTable`](#simpletable)\>

A promise that resolves to the table, so methods can be chained.

###### Examples

```ts
// Computations are re-run if the callback changes or earlier operations modify the table
const sdb = new SimpleDB();
const items = await sdb.newTable("items").cache((table) => {
  table
    .loadData("items.csv")
    .summarize({
      columns: "price",
      by: "department",
      stats: ["min", "max", "mean"],
    });
});
await items.log();

// It's important to call close() on the SimpleDB instance to clean up the cache.
// This prevents the cache from growing indefinitely.
await sdb.close();
```

```ts
// Cache with a Time-To-Live (TTL) of 60 seconds
// The computations will be re-run if the cached data is older than 1 minute, the callback changes, or the table changes.
const sdb = new SimpleDB();
const table = await sdb.newTable().cache((table) => {
  table
    .loadData("items.csv")
    .summarize({
      columns: "price",
      by: "department",
      stats: ["min", "max", "mean"],
    });
}, { ttl: 60 });
await table.log();

await sdb.close();
```

```ts
// Enable verbose logging for cache operations via SimpleDB instance
const sdb = new SimpleDB({ cacheVerbose: true });
const table = await sdb.newTable().cache((table) => {
  table
    .loadData("items.csv")
    .summarize({
      columns: "price",
      by: "department",
      stats: ["min", "max", "mean"],
    });
});
await table.log();

await sdb.close();
```

```ts
// Read-only table dependencies are tracked automatically. Other captured values go in inputs.
const year = 2026;
const summary = await sdb.newTable("summary").cache(async (table) => {
  table.loadArray(
    await fires.getData({ conditions: `year = ${year}` }),
  );
}, { inputs: [year] });
await summary.log();
```

###### Inherited from

`SimpleTableCore.cache`

#### Column Operations

##### addColumn()

> **addColumn**(`newColumn`, `type`, `definition`): `this`

Adds a new column to the table based on a specified data type (JavaScript or SQL types) and a SQL definition.
With the default `SimpleDB.expressionSyntax: "js"`, expressions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.

###### Parameters

###### newColumn

`string`

The name of the new column to be added.

###### type

`"string"` \| `"number"` \| `"bigint"` \| `"boolean"` \| `"date"` \| `"integer"` \| `"float"` \| `"time"` \| `"datetime"` \| `"datetimeTz"` \| `"double"` \| `"varchar"` \| `"timestamp"` \| `"timestamp with time zone"` \| `"json"` \| `"JSON"` \| `` `float[${number}]` `` \| `` `FLOAT[${number}]` `` \| `` `geometry('${string}')` `` \| `` `GEOMETRY('${string}')` ``

The data type for the new column. Can be a JavaScript type (e.g., `"number"`, `"string"`) or a SQL type (e.g., `"integer"`, `"varchar"`, `"JSON"`, `"FLOAT[3]"`, `"GEOMETRY('EPSG:4326')"`).

###### definition

`string`

A SQL expression defining how the values for the new column should be computed (e.g., `"column1 + column2"`, `"ST_Centroid(geom_column)"`).

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Add a new column 'total' as a float, calculated from 'column1' and 'column2'
await table.addColumn("total", "float", "column1 + column2").log();
```

```ts
// Add a new geometry column 'centroid' using the centroid of an existing 'country' geometry column
await table.addColumn("centroid", "geometry('EPSG:4326')", `ST_Centroid("country")`).log();
```

```ts
// Read a number from a JSON object into a new column using dot notation.
await table.loadArray([{ details: { count: 3 } }], {
  columnTypes: { details: "JSON" },
})
  .addColumn("count", "integer", "details.count")
  .log();
```

```ts
// Create JSON and fixed-size vector columns with DuckDB expressions.
await table.loadArray([{ count: 3 }])
  .addColumn("details", "JSON", "json_object('count', count)")
  .addColumn("embedding", "FLOAT[3]", "[0.25, 0.5, 0.75]")
  .log();
```

###### Inherited from

`SimpleTableCore.addColumn`

##### addId()

> **addId**(`newColumn`, `options?`): `this`

Adds a unique, non-null ID for each row in the current table. IDs start at
`0` and identify rows within this table, including rows with identical
contents. Without a prefix, the new column contains numbers. When
a prefix is supplied, the new column contains strings with the
exact prefix followed by the row number. An empty prefix therefore creates
the strings `"0"`, `"1"`, and so on.

IDs are not globally unique: separate tables can generate the same IDs.

###### Parameters

###### newColumn

`string`

The name of the new ID column.

###### options?

An optional object with configuration options.

###### prefix?

`string`

Text to place before each row number. Supplying this option, including an empty string, creates string IDs.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Add numeric IDs: 0, 1, 2, ...
await table
  .addId("edgeId")
  .log();
```

```ts
// Add string IDs: "flight-0", "flight-1", "flight-2", ...
await flights
  .addId("edgeId", { prefix: "flight-" })
  .log();
```

###### Inherited from

`SimpleTableCore.addId`

##### addRowNumber()

> **addRowNumber**(`newColumn`, `options?`): `this`

Adds a new column to the table containing the row number, starting at 0 (like an index).

###### Parameters

###### newColumn

`string`

The name of the new column that will store the row number.

###### options?

An optional object with configuration options:

###### by?

`string` \| `string`[]

A column name or an array of column names to partition by. The row number restarts at 0 within each group.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Add a new column named 'rowNumber' with the row number for each row
await table.addRowNumber("rowNumber").log();
```

```ts
// Add a new column named 'rowNumber' with the row number for each 'category'
await table.addRowNumber("rowNumber", { by: "category" }).log();
```

###### Inherited from

`SimpleTableCore.addRowNumber`

##### cleanColumnNames()

> **cleanColumnNames**(): `this`

Cleans column names by removing non-alphanumeric characters and formatting them to camel case.

###### Returns

`this`

The table, so methods can be chained.

###### Example

```ts
// Clean all column names in the table
// e.g., "First Name" becomes "firstName", "Product ID" becomes "productId"
await table.cleanColumnNames().log();
```

###### Inherited from

`SimpleTableCore.cleanColumnNames`

##### cloneColumn()

> **cloneColumn**(`column`, `newColumn`): `this`

Clones an existing column in this table, creating a new column with identical values.

###### Parameters

###### column

`string`

The name of the original column to clone.

###### newColumn

`string`

The name of the new column to be created.

###### Returns

`this`

The table, so methods can be chained.

###### Example

```ts
// Clone 'firstName' column as 'contactName'
await table.cloneColumn("firstName", "contactName").log();
```

###### Inherited from

`SimpleTableCore.cloneColumn`

##### cloneColumnWithOffset()

> **cloneColumnWithOffset**(`column`, `newColumn`, `options?`): `this`

Clones a column in the table and offsets its values by a specified number of rows.
This is useful for time-series analysis or comparing values across different time points.

**Important:** The offset is applied based on the current row order in the table. For meaningful results, ensure your data is sorted appropriately (e.g., by date/time for time-series analysis) before calling this method.

###### Parameters

###### column

`string`

The name of the original column.

###### newColumn

`string`

The name of the new column to be created with offset values.

###### options?

An optional object with configuration options:

###### by?

`string` \| `string`[]

A column name or an array of column names to partition by. The offset is applied independently within each group.

###### offset?

`number`

The number of rows to offset the values. A positive number shifts values downwards (later rows), a negative number shifts values upwards (earlier rows). Defaults to `1`.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Clone 'value' as 'previous_value', offsetting by 1 row (value of row N-1 goes to row N)
await table.cloneColumnWithOffset("value", "previous_value").log();
```

```ts
// Clone 'sales' as 'sales_2_days_ago', offsetting by 2 rows
await table.cloneColumnWithOffset("sales", "sales_2_days_ago", { offset: 2 }).log();
```

```ts
// Clone 'temperature' as 'prev_temp_by_city', offsetting by 1 row within each 'city' category
await table.cloneColumnWithOffset("temperature", "prev_temp_by_city", {
  offset: 1,
  by: "city",
}).log();
```

```ts
// Clone 'stock_price' as 'prev_price_by_stock_and_exchange', offsetting by 1 row within each 'stock_symbol' and 'exchange' category
await table.cloneColumnWithOffset("stock_price", "prev_price_by_stock_and_exchange", {
  offset: 1,
  by: ["stock_symbol", "exchange"],
}).log();
```

###### Inherited from

`SimpleTableCore.cloneColumnWithOffset`

##### extractDatePart()

> **extractDatePart**(`column`, `parts`): `this`

Extracts one or more components from a temporal column into new columns.
Pass a single part to create a column with that part's name, or pass an
object mapping custom new-column names to parts. Existing columns are not
overwritten.

`dayOfWeek` uses Sunday as `0` through Saturday as `6`. `week` follows
ISO week numbering, and `dayOfYear` starts at `1`. DuckDB `DATE`, `TIME`,
`TIMESTAMP`, and `TIMESTAMP WITH TIME ZONE` columns are supported when the
requested component applies to that type: date parts apply to dates and
timestamps, while time parts apply to times and timestamps. `NULL` input
values produce `NULL` extracted values. Parts extracted from
`TIMESTAMP WITH TIME ZONE` values use UTC.

###### Parameters

###### column

`string`

The temporal column from which to extract components.

###### parts

`"year"` \| `"quarter"` \| `"month"` \| `"week"` \| `"day"` \| `"dayOfWeek"` \| `"dayOfYear"` \| `"hour"` \| `"minute"` \| `"second"` \| \{\[`newColumn`: `string`\]: `"year"` \| `"quarter"` \| `"month"` \| `"week"` \| `"day"` \| `"dayOfWeek"` \| `"dayOfYear"` \| `"hour"` \| `"minute"` \| `"second"`; \}

A part to extract using its name as the new column, or an object mapping each custom new-column name to the part it should contain.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Add a column named 'year' from the 'publishedAt' timestamp
await table.extractDatePart("publishedAt", "year").log();
```

```ts
// Extract multiple components with custom column names
await table.extractDatePart("publishedAt", {
  publicationYear: "year",
  publicationMonth: "month",
}).log();
```

###### Inherited from

`SimpleTableCore.extractDatePart`

##### hasColumn()

> **hasColumn**(`column`): `Promise`\<`boolean`\>

Checks if a column with the specified name exists in the table.

###### Parameters

###### column

`string`

The name of the column to check.

###### Returns

`Promise`\<`boolean`\>

A promise that resolves to `true` if the column exists, `false` otherwise.

###### Example

```ts
// Check if the table has a column named "age"
const hasAgeColumn = await table.hasColumn("age");
console.log(hasAgeColumn); // Output: true or false
```

###### Inherited from

`SimpleTableCore.hasColumn`

##### removeColumns()

> **removeColumns**(`columns`): `this`

Removes one or more columns from this table.

###### Parameters

###### columns

`string` \| `string`[]

The name or an array of names of the columns to be removed.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Remove 'column1' and 'column2' from the table
await table.removeColumns(["column1", "column2"]).log();
```

```ts
// Remove a single column named 'tempColumn'
await table.removeColumns("tempColumn").log();
```

###### Inherited from

`SimpleTableCore.removeColumns`

##### renameColumns()

> **renameColumns**(`names`, `options?`): `this`

Renames one or more columns in the table. Throws if a source column does
not exist, so a typo fails loudly instead of being silently ignored.

###### Parameters

###### names

\{\[`key`: `string`\]: `string`; \}

An object mapping old column names to their new column names (e.g., `{ "oldName": "newName", "anotherOld": "anotherNew" }`).

###### options?

Configuration options.

###### strict?

`boolean`

Whether to verify the source columns exist before renaming. Defaults to `true`. Set to `false` to skip the check and its schema lookup when you know the columns exist and are renaming across many tables where the extra round-trip adds up.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Rename "How old?" to "age" and "Man or woman?" to "sex"
await table.renameColumns({ "How old?": "age", "Man or woman?": "sex" }).log();
```

```ts
// Rename a single column
await table.renameColumns({ "product_id": "productId" }).log();
```

```ts
// Skip the existence check when renaming across many tables
await table.renameColumns({ "product_id": "productId" }, { strict: false }).log();
```

###### Inherited from

`SimpleTableCore.renameColumns`

#### Dataviz

##### logBarChart()

> **logBarChart**(`labels`, `values`, `options?`): `Promise`\<[`SimpleTable`](#simpletable)\>

Generates and logs a bar chart to the console.

###### Parameters

###### labels

`string`

The name of the column to be used for the labels (categories).

###### values

`string`

The name of the column to be used for the values.

###### options?

An optional object with configuration options:

###### compact?

`boolean`

Reduces vertical space in the logged output. Defaults to `false`.

###### formatLabels?

(`d`) => `string`

A function to format the labels. Defaults to converting the label to a string.

###### formatValues?

(`d`) => `string`

A function to format the values. Defaults to converting the value to a string.

###### showPercentages?

`boolean`

If `true`, displays the percentage each bar represents relative to the total. Defaults to `false`.

###### showTotal?

`boolean`

If `true`, calculates and displays a total summary row. Defaults to `false`.

###### totalLabel?

`string`

Allows customizing the label used for the total row. Defaults to "Total".

###### width?

`number`

The width of the chart in characters. Defaults to 40.

###### Returns

`Promise`\<[`SimpleTable`](#simpletable)\>

A promise that resolves to this table after the chart has been logged to the console.

###### Example

```typescript
const data = [
    { category: "A", value: 10 },
    { category: "B", value: 20 },
]
await table
  .loadArray(data)
  .logBarChart("category", "value")

await table.log();
```

##### logDotChart()

> **logDotChart**(`x`, `y`, `options?`): `Promise`\<[`SimpleTable`](#simpletable)\>

Generates and logs a dot chart to the console. The data should be sorted by the x-axis values for accurate representation.

**Data Type Requirements:**
- **X-axis values**: Must be `number` or `Date` objects.
- **Y-axis values**: Must be `number` values.
- All values must be non-null and defined.

###### Parameters

###### x

`string`

The name of the column to be used for the x-axis. Values must be numbers or Date objects.

###### y

`string`

The name of the column to be used for the y-axis. Values must be numbers.

###### options?

An optional object with configuration options:

###### fixedScales?

`boolean`

If `true`, all small multiples will share the same y-axis scale. Defaults to `false`.

###### formatX?

(`d`) => `string`

A function to format the x-axis values for display. It receives the raw x-value as input and should return a string. If the first data point's x value is a Date, it defaults to formatting the date as "YYYY-MM-DD".

###### formatY?

(`d`) => `string`

A function to format the y-axis values for display. It receives the raw y-value as input and should return a string.

###### height?

`number`

The height of the chart in characters.

###### smallMultiples?

`string`

The name of a column to create small multiples (also known as facets). Each unique value in this column will generate a separate chart.

###### smallMultiplesPerRow?

`number`

The number of small multiples to display per row.

###### width?

`number`

The width of the chart in characters.

###### Returns

`Promise`\<[`SimpleTable`](#simpletable)\>

A promise that resolves to this table after the chart has been logged to the console.

###### Examples

// Basic dot chart
```typescript
const data = [
    { date: new Date("2023-01-01"), value: 10 },
    { date: new Date("2023-02-01"), value: 20 },
    { date: new Date("2023-03-01"), value: 30 },
    { date: new Date("2023-04-01"), value: 40 },
]
await table
  .loadArray(data)
  .convert({ date: "string" }, { datetimeFormat: "%x" })
  .logDotChart("date", "value")

await table.log();
```

// Dot chart with small multiples
```typescript
const data = [
    { date: new Date("2023-01-01"), value: 10, category: "A" },
    { date: new Date("2023-02-01"), value: 20, category: "A" },
    { date: new Date("2023-03-01"), value: 30, category: "A" },
    { date: new Date("2023-04-01"), value: 40, category: "A" },
    { date: new Date("2023-01-01"), value: 15, category: "B" },
    { date: new Date("2023-02-01"), value: 25, category: "B" },
    { date: new Date("2023-03-01"), value: 35, category: "B" },
    { date: new Date("2023-04-01"), value: 45, category: "B" },
]
await table
  .loadArray(data)
  .convert({ date: "string" }, { datetimeFormat: "%x" })
  .logDotChart("date", "value", {
    smallMultiples: "category",
  })

await table.log();
```

##### logHistogram()

> **logHistogram**(`values`, `options?`): `Promise`\<[`SimpleTable`](#simpletable)\>

Generates and logs a histogram of a numeric column to the console.

###### Parameters

###### values

`string`

The name of the numeric column for which to generate the histogram.

###### options?

An optional object with configuration options:

###### bins?

`number`

The number of bins (intervals) to use for the histogram. Defaults to 10.

###### compact?

`boolean`

If `true`, the histogram will be displayed in a more compact format. Defaults to `false`.

###### formatLabels?

(`min`, `max`) => `string`

A function to format the labels for the histogram bins. It receives the lower and upper bounds of each bin as arguments.

###### width?

`number`

The maximum width of the histogram bars in characters.

###### Returns

`Promise`\<[`SimpleTable`](#simpletable)\>

A promise that resolves to this table after the histogram has been logged to the console.

###### Examples

// Basic histogram of the 'temperature' column
```typescript
await table.logHistogram("temperature")

await table.log();
```

// Histogram with 20 bins and custom label formatting
```typescript
await table.logHistogram("age", {
  bins: 20,
  formatLabels: (min, max) => `${min}-${max} years`,
});

await table.log();
```

##### logLineChart()

> **logLineChart**(`x`, `y`, `options?`): `Promise`\<[`SimpleTable`](#simpletable)\>

Generates and logs a line chart to the console. The data should be sorted by the x-axis values for accurate representation.

**Data Type Requirements:**
- **X-axis values**: Must be `number` or `Date` objects.
- **Y-axis values**: Must be `number` values.
- All values must be non-null and defined.

###### Parameters

###### x

`string`

The name of the column to be used for the x-axis. Values must be numbers or Date objects.

###### y

`string`

The name of the column to be used for the y-axis. Values must be numbers.

###### options?

An optional object with configuration options:

###### fixedScales?

`boolean`

If `true`, all small multiples will share the same y-axis scale. Defaults to `false`.

###### formatX?

(`d`) => `string`

A function to format the x-axis values for display. It receives the raw x-value as input and should return a string. If the first data point's x value is a Date, it defaults to formatting the date as "YYYY-MM-DD".

###### formatY?

(`d`) => `string`

A function to format the y-axis values for display. It receives the raw y-value as input and should return a string.

###### height?

`number`

The height of the chart in characters.

###### smallMultiples?

`string`

The name of a column to create small multiples (also known as facets or trellis charts). Each unique value in this column will generate a separate chart.

###### smallMultiplesPerRow?

`number`

The number of small multiples to display per row.

###### width?

`number`

The width of the chart in characters.

###### Returns

`Promise`\<[`SimpleTable`](#simpletable)\>

A promise that resolves to this table after the chart has been logged to the console.

###### Examples

// Basic line chart
```typescript
const data = [
    { date: new Date("2023-01-01"), value: 10 },
    { date: new Date("2023-02-01"), value: 20 },
    { date: new Date("2023-03-01"), value: 30 },
    { date: new Date("2023-04-01"), value: 40 },
]
await table
  .loadArray(data)
  .convert({ date: "string" }, { datetimeFormat: "%x" })
  .logLineChart("date", "value")

await table.log();
```

// Line chart with small multiples
```typescript
const data = [
    { date: new Date("2023-01-01"), value: 10, category: "A" },
    { date: new Date("2023-02-01"), value: 20, category: "A" },
    { date: new Date("2023-03-01"), value: 30, category: "A" },
    { date: new Date("2023-04-01"), value: 40, category: "A" },
    { date: new Date("2023-01-01"), value: 15, category: "B" },
    { date: new Date("2023-02-01"), value: 25, category: "B" },
    { date: new Date("2023-03-01"), value: 35, category: "B" },
    { date: new Date("2023-04-01"), value: 45, category: "B" },
]
await table
  .loadArray(data)
  .convert({ date: "string" }, { datetimeFormat: "%x" })
  .logLineChart("date", "value", {
    smallMultiples: "category",
  })

await table.log();
```

##### writeChart()

> **writeChart**(`chart`, `path`, `options?`): `Promise`\<[`SimpleTable`](#simpletable)\>

Creates an [Observable Plot](https://github.com/observablehq/plot) chart as an image file (.png or .svg) from the table data.
To create maps, use the `writeMap` method.

###### Parameters

###### chart

(`data`) => `SVGSVGElement` \| `HTMLElement`

A function that takes data (as an array of objects) and returns an Observable Plot chart (an `SVGSVGElement` or `HTMLElement`).

###### path

`string`

The path where the chart will be saved. The file extension must be `.png` or `.svg` (e.g., `"./output/chart.png"`).

###### options?

Optional object containing additional settings:

###### dark?

`boolean`

If `true`, switches the chart to dark mode. Defaults to `false`.

###### style?

`string`

A CSS string inserted into the generated SVG to customize the chart's appearance. Use this if the Plot `style` option is insufficient.

###### Returns

`Promise`\<[`SimpleTable`](#simpletable)\>

A promise that resolves to this table after the chart image has been saved.

###### Example

```ts
import { dot, plot } from "@observablehq/plot";

const sdb = new SimpleDB();
const data = [{ year: 2024, value: 10 }, { year: 2025, value: 15 }];

const chartFunction = (plotData: unknown[]) =>
  plot({
    marks: [
      dot(plotData, { x: "year", y: "value" }),
    ],
  });

const outputPath = "output/chart.png";

const table = await sdb
  .newTable()
  .loadArray(data)
  .writeChart(chartFunction, outputPath);

await table.log();
```

##### writeMap()

> **writeMap**(`map`, `path`, `options?`): `Promise`\<[`SimpleTable`](#simpletable)\>

Creates an [Observable Plot](https://github.com/observablehq/plot) map as an image file (.png or .svg) from the table's geospatial data.
To create charts from non-geospatial data, use the `writeChart` method.

###### Parameters

###### map

(`geoData`) => `SVGSVGElement` \| `HTMLElement` \| `Promise`\<`SVGSVGElement` \| `HTMLElement`\>

A function that takes geospatial data (in GeoJSON format) and returns an Observable Plot map (an `SVGSVGElement` or `HTMLElement`), or a promise resolving to one.

###### path

`string`

The path where the map will be saved. The file extension must be `.png` or `.svg` (e.g., `"./output/map.png"`).

###### options?

An optional object with configuration options:

###### column?

`string`

The name of the column storing geometries. If there is only one geometry column, it will be used by default.

###### dark?

`boolean`

If `true`, switches the map to dark mode. Defaults to `false`.

###### rewind?

`boolean`

If `true`, rewinds the coordinates of polygons to follow the spherical winding order (important for D3.js). Defaults to `true`.

###### style?

`string`

A CSS string inserted into the generated SVG to customize the map's appearance. Use this if the Plot `style` option is insufficient.

###### Returns

`Promise`\<[`SimpleTable`](#simpletable)\>

A promise that resolves to this table after the map image has been saved.

###### Example

```ts
import { geo, plot } from "@observablehq/plot";

const sdb = new SimpleDB();
const mapFunction = (geoJsonData: { features: unknown[] }) =>
  plot({
    projection: {
      type: "conic-conformal",
      rotate: [100, -60],
      domain: geoJsonData,
    },
    marks: [
      geo(geoJsonData, { stroke: "black", fill: "lightblue" }),
    ],
  });

const outputPath = "./output/map.png";

const table = await sdb
  .newTable()
  .loadGeoData("./CanadianProvincesAndTerritories.geojson")
  .writeMap(mapFunction, outputPath);

await table.log();
```

#### Exporting Data

##### toBucket()

> **toBucket**(`destination`, `options?`): `Promise`\<`string`\>

Writes the table to a file and uploads it to a Google Cloud Storage bucket.
Supported destinations are `.csv`, `.csv.gz`, `.json`, `.json.gz`,
`.parquet`, `.geojson`, `.geoparquet`, and `.shp.zip`.

This method uses the `toBucket` function from the
[journalism-google library](https://github.com/nshiab/journalism-google/tree/v2.0.0/docs).
Set `BUCKET_PROJECT` and `BUCKET_NAME` in your `.env` file, or pass
`project` and `bucket`.
Authentication uses Google Application Default Credentials. To load
credentials from a specific JSON file, set `GOOGLE_APPLICATION_CREDENTIALS`
in your `.env` file to that file's path.

###### Parameters

###### destination

`string`

The path and filename for the object within the bucket.

###### options?

Upload options.

###### bucket?

`string`

The Google Cloud Storage bucket name. Defaults to `BUCKET_NAME`.

###### metadata?

`unknown`

Metadata object passed to `journalism-google` for the uploaded object.

###### overwrite?

`boolean`

If `true`, replaces an existing object. Cannot be combined with `skip`. Defaults to `false`.

###### project?

`string`

The Google Cloud project ID. Defaults to `BUCKET_PROJECT`.

###### skip?

`boolean`

If `true`, skips the upload when the object already exists. Cannot be combined with `overwrite`. Defaults to `false`.

###### Returns

`Promise`\<`string`\>

The `gs://` URI of the uploaded object.

###### Examples

```ts
// Set BUCKET_PROJECT and BUCKET_NAME in .env, and configure Google Application Default Credentials.
const uri = await sdb
  .newTable("results")
  .loadData("results.csv")
  .selectColumns(["name", "value"])
  .toBucket("exports/results.parquet", { overwrite: true });
console.log(uri); // gs://my-bucket/exports/results.parquet
```

```ts
// Export a geometry table as one zipped Shapefile object.
await sdb
  .newTable("districts")
  .loadGeoData("districts.geojson")
  .toBucket("maps/districts.shp.zip", {
    project: "my-project",
    bucket: "my-bucket",
  });
```

##### toDatawrapper()

> **toDatawrapper**(`chartId`, `options?`): `Promise`\<[`SimpleTable`](#simpletable)\>

Writes the table data as CSV to a Datawrapper chart or table.

Environment variables are named configuration values supplied to the running process. By default, this method reads the API key from `DATAWRAPPER_KEY` (for example, `"your-datawrapper-api-key"`).

###### Parameters

###### chartId

`string`

The unique ID of the Datawrapper chart or table to update. This ID can be found in the Datawrapper URL or dashboard.

###### options?

An optional object with configuration options:

###### apiKeyEnvVar?

`string`

A custom environment-variable name from which to read the Datawrapper API key. Defaults to `"DATAWRAPPER_KEY"`.

###### description?

`string`

The description below the chart's title. Omit to preserve it, or pass an empty string to clear it.

###### note?

`string`

The chart's notes (e.g., a last-updated timestamp). Omit to preserve them, or pass an empty string to clear them.

###### republish?

`boolean`

If `true`, republishes the chart after updating the data and any supplied title, description, or notes. Defaults to `false`.

###### title?

`string`

The chart's title. Omit to preserve it, or pass an empty string to clear it.

###### Returns

`Promise`\<[`SimpleTable`](#simpletable)\>

A promise that resolves to this table after the data has been sent to Datawrapper.

###### Examples

```ts
// Set DATAWRAPPER_KEY=your-datawrapper-api-key before running.
// Load, transform, and send data to a Datawrapper chart
const table = await sdb
  .newTable()
  .loadData("sales.csv")
  .selectColumns(["date", "revenue"])
  .toDatawrapper("myChartId");

await table.log();
```

```ts
// Update data, title, description, and notes, then republish
await table.toDatawrapper("myChartId", {
  title: "Monthly sales",
  description: "Revenue since January 2025.",
  note: `Last updated: ${new Date().toLocaleString()}`,
  republish: true,
});

await table.log();
```

##### toGeoDatawrapper()

> **toGeoDatawrapper**(`chartId`, `options?`): `Promise`\<[`SimpleTable`](#simpletable)\>

Writes the table's geospatial data as GeoJSON to a Datawrapper map.

Environment variables are named configuration values supplied to the running process. By default, this method reads the API key from `DATAWRAPPER_KEY` (for example, `"your-datawrapper-api-key"`).

###### Parameters

###### chartId

`string`

The unique ID of the Datawrapper map to update. This ID can be found in the Datawrapper URL or dashboard.

###### options?

An optional object with configuration options:

###### apiKeyEnvVar?

`string`

A custom environment-variable name from which to read the Datawrapper API key. Defaults to `"DATAWRAPPER_KEY"`.

###### column?

`string`

The name of the geometry column to use. If omitted, the method will automatically attempt to find a geometry column.

###### description?

`string`

The description below the map's title. Omit to preserve it, or pass an empty string to clear it.

###### note?

`string`

The map's notes (e.g., a last-updated timestamp). Omit to preserve them, or pass an empty string to clear them.

###### republish?

`boolean`

If `true`, republishes the map after updating the data and any supplied title, description, or notes. Defaults to `false`.

###### title?

`string`

The map's title. Omit to preserve it, or pass an empty string to clear it.

###### Returns

`Promise`\<[`SimpleTable`](#simpletable)\>

A promise that resolves to this table after the data has been sent to Datawrapper.

###### Examples

```ts
// Set DATAWRAPPER_KEY=your-datawrapper-api-key before running.
// Load, transform, and send geospatial data to a Datawrapper map
const table = await sdb
  .newTable()
  .loadGeoData("regions.geojson")
  .selectColumns(["name", "population", "geometry"])
  .toGeoDatawrapper("myMapId");

await table.log();
```

```ts
// Update data, title, description, and notes, then republish
await table.toGeoDatawrapper("myMapId", {
  title: "Population by region",
  description: "Latest population estimates.",
  note: `Last updated: ${new Date().toLocaleString()}`,
  republish: true,
});

await table.log();
```

##### toSheet()

> **toSheet**(`sheetUrl`, `options?`): `Promise`\<[`SimpleTable`](#simpletable)\>

Writes the table data to a Google Sheet.
This method uses the `pushToSheet` function from the [journalism-google library](https://github.com/nshiab/journalism-google/tree/v2.0.0/docs). Refer to its documentation for more details.

By default, the selected tab is overwritten and values are written without Google Sheets interpretation.

Environment variables are named configuration values supplied to the running process. For authentication, this method reads `GOOGLE_SERVICE_ACCOUNT_EMAIL` (for example, `"service-account@example.iam.gserviceaccount.com"`) with `GOOGLE_PRIVATE_KEY` (for example, `"-----BEGIN PRIVATE KEY-----\n..."`). Alternatively, set `GOOGLE_APPLICATION_CREDENTIALS` to a service-account JSON path (for example, `"./service-account.json"`). Values passed through `options.credentials` override these environment values. For detailed setup instructions, refer to the node-google-spreadsheet authentication guide: https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication.

###### Parameters

###### sheetUrl

`string`

A Google Sheets URL. It can point to a spreadsheet or a specific tab.

###### options?

An optional object with configuration options:

###### create?

`boolean`

If `true`, creates a missing tab selected by `tabTitle`. Defaults to `false`.

###### credentials?

\{ `email`: `string`; `privateKey`: `string`; \}

Optional Google service-account credentials.

###### credentials.email

`string`

The Google service-account email.

###### credentials.privateKey

`string`

The Google service-account private key.

###### lastUpdate?

`boolean` \| `"Canada/Atlantic"` \| `"Canada/Central"` \| `"Canada/Eastern"` \| `"Canada/Mountain"` \| `"Canada/Newfoundland"` \| `"Canada/Pacific"` \| `"Canada/Saskatchewan"` \| `"Canada/Yukon"`

If `true`, adds a UTC timestamp. Pass a Canadian time zone to use it for the timestamp. Available only in overwrite mode.

###### mode?

`"overwrite"` \| `"append"`

Whether to overwrite the tab or append rows. Defaults to `"overwrite"`.

###### prepend?

`string`

Text to add above the header row in overwrite mode.

###### raw?

`boolean`

If `true`, writes values without Google Sheets interpretation. Defaults to `true`.

###### tabTitle?

`string`

Selects a tab by title instead of using the URL's `gid`.

###### Returns

`Promise`\<[`SimpleTable`](#simpletable)\>

A promise that resolves to this table after the data has been written to the sheet.

###### Examples

```ts
// Set these environment variables before running:
// GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@example.iam.gserviceaccount.com
// GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...
// Load, transform, and write data to a Google Sheet
const table = await sdb
  .newTable()
  .loadData("sales.csv")
  .selectColumns(["date", "revenue"])
  .toSheet("https://docs.google.com/spreadsheets/d/.../edit#gid=0");

await table.log();
```

```ts
// Append rows to a tab selected by title
await table.toSheet("https://docs.google.com/spreadsheets/d/.../edit", {
  mode: "append",
  tabTitle: "Election results",
});

await table.log();
```

```ts
// Create a missing tab and add context above the data
await table.toSheet("https://docs.google.com/spreadsheets/d/.../edit", {
  tabTitle: "Election results",
  create: true,
  prepend: "Preliminary results",
  lastUpdate: "Canada/Eastern",
});

await table.log();
```

```ts
// Let Google Sheets interpret values, such as formulas and dates
await table.toSheet(
  "https://docs.google.com/spreadsheets/d/.../edit#gid=0",
  { raw: false },
);

await table.log();
```

```ts
// Pass service-account credentials explicitly
await table.toSheet(
  "https://docs.google.com/spreadsheets/d/.../edit#gid=0",
  {
    credentials: {
      email: "service-account@example.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\\n...",
    },
  },
);

await table.log();
```

#### File Operations

##### writeData()

> **writeData**(`file`, `options?`): `Promise`\<[`SimpleTable`](#simpletable)\>

Writes the table's data to a file in various formats (CSV, JSON, Parquet, DuckDB, SQLite).
Tables with geometry columns must use `writeGeoData()` instead.
If the specified path does not exist, it will be created.

###### Parameters

###### file

`string`

The absolute path to the output file (e.g., `"./output.csv"`, `"./output.json"`).

###### options?

An optional object with configuration options:

###### compression?

`boolean`

A boolean indicating whether to compress the output file. If `true`, CSV and JSON files will be compressed with GZIP, while Parquet files will use ZSTD. Defaults to `false`.

###### dataAsArrays?

`boolean`

For JSON files only. If `true`, JSON files are written as a single object with arrays for each column (e.g., `{ "col1": [v1, v2], "col2": [v3, v4] }`) instead of an array of objects. This can reduce file size for web projects. You can use the `arraysToData` function from the [journalism-format library](https://nshiab.github.io/journalism-format/functions/arraysToData.html) to convert it back.

###### formatDates?

`boolean`

For CSV and JSON files only. If `true`, date and timestamp columns will be formatted as ISO 8601 strings (e.g., `"2025-01-01T01:00:00.000Z"`). Defaults to `false`.

###### Returns

`Promise`\<[`SimpleTable`](#simpletable)\>

A promise that resolves to the table, so methods can be chained.

###### Examples

```ts
// Write data to a CSV file
await table.writeData("./output.csv");
```

```ts
// Write data to a JSON file with GZIP compression.
// The output file will be named output.json.gz.
await table.writeData("./output.json", { compression: true });
```

```ts
// Write data to a Parquet file
await table.writeData("./output.parquet");
```

```ts
// Write data to a DuckDB database file
await table.writeData("./my_database.db");
```

```ts
// Write data to a SQLite database file
await table.writeData("./my_database.sqlite");
```

```ts
// Write JSON data with dates formatted as ISO strings
await table.writeData("./output_dates.json", { formatDates: true });
```

###### Inherited from

`SimpleTableCore.writeData`

##### writeGeoData()

> **writeGeoData**(`file`, `options?`): `Promise`\<[`SimpleTable`](#simpletable)\>

Writes the table's geospatial data to a file in GeoJSON, GeoParquet, or Shapefile format.
If the specified path does not exist, it will be created.

###### Parameters

###### file

`string`

The absolute path to the output file (e.g., `"./output.geojson"`, `"./output.geoparquet"`, `"./shapefile-folder/output.shp"`, `"./output.shp.zip"`). A `.shp.zip` extension writes a ZIP archive using fast DEFLATE compression. Creating the archive temporarily requires enough disk space for both the uncompressed Shapefile and the ZIP, and ZIP archives are limited to 4 GB.

###### options?

An optional object with configuration options:

###### compression?

`boolean`

For GeoParquet, if `true`, uses ZSTD compression; otherwise, uses DuckDB's default SNAPPY compression. SNAPPY prioritizes faster compression, while ZSTD typically produces smaller files but takes longer to write. Read performance depends on the data and storage because smaller files can reduce I/O. This option is not supported for GeoJSON or Shapefiles. Defaults to `false`.

###### formatDates?

`boolean`

For GeoJSON, if `true`, formats date and timestamp columns to ISO 8601 strings. Defaults to `false`.

###### metadata?

`unknown`

For GeoJSON, an object to be added as top-level metadata to the GeoJSON output.

###### precision?

`number`

For GeoJSON, the maximum number of figures after the decimal separator to write in coordinates. Defaults to `undefined` (full precision).

###### rewind?

`boolean`

For GeoJSON, if `true`, rewinds the coordinates of polygons to follow the right-hand rule (RFC 7946). Defaults to `false`.

###### Returns

`Promise`\<[`SimpleTable`](#simpletable)\>

A promise that resolves to the table, so methods can be chained.

###### Examples

```ts
// Write geospatial data to a GeoJSON file
await table.writeGeoData("./output.geojson");
```

```ts
// Write geospatial data to a ZSTD-compressed GeoParquet file
await table.writeGeoData("./output.geoparquet", { compression: true });
```

```ts
// Write geospatial data to a Shapefile with all relevant files  in the same folder
await table.writeGeoData("./shapefile-folder/output.shp");
```

```ts
// Write a Shapefile and its related files to output.shp.zip
await table.writeGeoData("./output.shp.zip");
```

```ts
// Write GeoJSON with specific precision and metadata
await table.writeGeoData("./output_high_precision.geojson", {
  precision: 6,
  metadata: { source: "SimpleDataAnalysis" },
});
```

###### Inherited from

`SimpleTableCore.writeGeoData`

#### Geospatial

##### addBoundingBox()

> **addBoundingBox**(`options?`): `this`

Adds the bounding box coordinates of geometries in a specified column as four new columns: `minLon`, `minLat`, `maxLon`, and `maxLat`.

###### Parameters

###### options?

An optional object with configuration options:

###### column?

`string`

The name of the column storing the geometries for which the bounding box will be computed. If omitted, the method will automatically attempt to find a geometry column.

###### decimals?

`number`

The number of decimal places to round the bounding box coordinates. Defaults to `undefined` (no rounding).

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Compute the bounding box for geometries in the default column
await table.addBoundingBox().log();
// The table now has minLon, minLat, maxLon, and maxLat columns.
```

```ts
// Compute the bounding box for geometries in 'geom' column and round coordinates to 2 decimal places
await table.addBoundingBox({ column: "geom", decimals: 2 }).log();
// The table now has minLon, minLat, maxLon, and maxLat columns with values rounded to 2 decimal places.
```

###### Inherited from

`SimpleTableCore.addBoundingBox`

##### addGeoClosedStatus()

> **addGeoClosedStatus**(`newColumn`, `options?`): `this`

Adds a column with boolean values indicating whether geometries are closed (e.g., polygons) or open (e.g., linestrings).

###### Parameters

###### newColumn

`string`

The name of the new column where the boolean results (`TRUE` for closed, `FALSE` for open) will be stored.

###### options?

An optional object with configuration options:

###### column?

`string`

The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Check if geometries are closed and store results in a new 'isClosed' column
await table.addGeoClosedStatus("isClosed").log();
```

```ts
// Check closed status of geometries in a specific column named 'boundaryGeom'
await table.addGeoClosedStatus("boundaryClosed", { column: "boundaryGeom" }).log();
```

###### Inherited from

`SimpleTableCore.addGeoClosedStatus`

##### addGeoNoise()

> **addGeoNoise**(`maxDistance`, `options?`): `this`

Moves EPSG:4326 point geometries to random locations within a maximum great-circle distance of their original positions.

Points are sampled uniformly within the requested distance using the spherical direct geodesic (destination-point) formula and the same spherical Earth model as DuckDB's `ST_Distance_Sphere()`. This accounts for longitude scale changing with latitude. This method adds random jitter; it does not provide anonymization or differential privacy guarantees.

This method supports only `POINT` geometries in `EPSG:4326`. Null and empty geometries are preserved.

###### Parameters

###### maxDistance

`number`

The maximum great-circle displacement in the selected unit. Must be a finite number greater than or equal to `0` and no greater than half Earth's circumference.

###### options?

An optional object with configuration options:

###### column?

`string`

The name of the EPSG:4326 point geometry column. If omitted, the method will automatically attempt to find a geometry column.

###### onlyDuplicates?

`boolean`

If `true`, moves only points whose complete original geometry occurs more than once in the selected geometry column. Every point in a duplicated group is moved. Defaults to `false`.

###### unit?

`"m"` \| `"km"`

The unit of `maxDistance`: `"m"` for metres or `"km"` for kilometres. Defaults to `"m"`.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Move every point by no more than 500 metres
await table.addGeoNoise(500).log();
```

```ts
// Separate duplicated points by up to 0.1 kilometres
await table.addGeoNoise(0.1, {
  column: "geom",
  unit: "km",
  onlyDuplicates: true,
}).log();
```

###### Inherited from

`SimpleTableCore.addGeoNoise`

##### addGeoType()

> **addGeoType**(`newColumn`, `options?`): `this`

Adds a column with the geometry type (e.g., `"POINT"`, `"LINESTRING"`, `"POLYGON"`) for each geometry.

###### Parameters

###### newColumn

`string`

The name of the new column where the geometry types will be stored.

###### options?

An optional object with configuration options:

###### column?

`string`

The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Add a new column 'geometryType' with the type of each geometry
await table.addGeoType("geometryType").log();
```

```ts
// Get the geometry type for geometries in a specific column named 'featureGeom'
await table.addGeoType("featureType", { column: "featureGeom" }).log();
```

###### Inherited from

`SimpleTableCore.addGeoType`

##### addGeoValidity()

> **addGeoValidity**(`newColumn`, `options?`): `this`

Adds a column with boolean values indicating the validity of geometries.

###### Parameters

###### newColumn

`string`

The name of the new column where the boolean results (`TRUE` for valid, `FALSE` for invalid) will be stored.

###### options?

An optional object with configuration options:

###### column?

`string`

The name of the column storing the geometries to be checked. If omitted, the method will automatically attempt to find a geometry column.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Check if geometries are valid and store results in a new 'isValid' column
// The method will automatically detect the geometry column.
await table.addGeoValidity("isValid").log();
```

```ts
// Check validity of geometries in a specific column named 'myGeom'
await table.addGeoValidity("isValidMyGeom", { column: "myGeom" }).log();
```

###### Inherited from

`SimpleTableCore.addGeoValidity`

##### addVertexCount()

> **addVertexCount**(`newColumn`, `options?`): `this`

Adds a column with the number of vertices (points) in each geometry.

###### Parameters

###### newColumn

`string`

The name of the new column where the vertex counts will be stored.

###### options?

An optional object with configuration options:

###### column?

`string`

The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Add a new column 'vertexCount' with the number of vertices for each geometry
// The method will automatically detect the geometry column.
await table.addVertexCount("vertexCount").log();
```

```ts
// Add vertex counts for geometries in a specific column named 'myGeom'
await table.addVertexCount("myGeomVertices", { column: "myGeom" }).log();
```

###### Inherited from

`SimpleTableCore.addVertexCount`

##### aggregateGeo()

> **aggregateGeo**(`method`, `options?`): `this`

Aggregates geometries in a specified column based on a chosen aggregation method.

###### Parameters

###### method

`"union"` \| `"intersection"`

The aggregation method to apply: `"union"` (combines all geometries into a single multi-geometry) or `"intersection"` (computes the intersection of all geometries).

###### options?

An optional object with configuration options:

###### by?

`string` \| `string`[]

The column name or an array of column names to group by. Geometries are aggregated independently within each group.

###### column?

`string`

The name of the column storing the geometries to be aggregated. If omitted, the method will automatically attempt to find a geometry column.

###### outputTable?

`string` \| `boolean`

If `true`, the results will be stored in a new table with a generated name. If a string, it will be used as the name for the new table. If `false` or omitted, the current table will be overwritten. Defaults to `false`.

###### Returns

`this`

A table instance containing the aggregated geometries (either the current table or a new table), so methods can be chained.

###### Examples

```ts
// Aggregate all geometries in the default column into a single union geometry
await table.aggregateGeo("union").log();
```

```ts
// Aggregate geometries by 'country' and compute their union
await table.aggregateGeo("union", { by: "country" }).log();
```

```ts
// Aggregate geometries in 'regions' column into their intersection, storing results in a new table
const intersectionTable = await table.aggregateGeo("intersection", { column: "regions", outputTable: true }).log();
```

###### Inherited from

`SimpleTableCore.aggregateGeo`

##### area()

> **area**(`newColumn`, `options?`): `this`

Computes the area of geometries in square meters (`"m2"`) or optionally square kilometers (`"km2"`).
The input geometry is assumed to be in EPSG:4326 (WGS84).

###### Parameters

###### newColumn

`string`

The name of the new column where the computed areas will be stored.

###### options?

An optional object with configuration options:

###### column?

`string`

The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.

###### decimals?

`number`

The number of decimal places to round the computed areas. Defaults to `undefined` (no rounding).

###### unit?

`"m2"` \| `"km2"`

The unit for the computed area: `"m2"` (square meters) or `"km2"` (square kilometers). Defaults to `"m2"`.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Compute the area of geometries in square meters and store in 'area_m2'
await table.area("area_m2").log();
```

```ts
// Compute the area of geometries in square kilometers and store in 'area_km2'
await table.area("area_km2", { unit: "km2" }).log();
```

```ts
// Compute areas in square kilometers rounded to two decimal places
await table.area("area_km2", { unit: "km2", decimals: 2 }).log();
```

```ts
// Compute the area of geometries in a specific column named 'myGeom'
await table.area("myGeomArea", { column: "myGeom" }).log();
```

###### Inherited from

`SimpleTableCore.area`

##### buffer()

> **buffer**(`newColumn`, `distance`, `options?`): `this`

Computes a buffer (a polygon representing a specified distance around a geometry) for geometries in a specified column.
The distance is in the Spatial Reference System (SRS) unit of the input geometries.

###### Parameters

###### newColumn

`string`

The name of the new column where the buffered geometries will be stored.

###### distance

`number`

The distance for the buffer. This value is in the units of the geometry's SRS.

###### options?

An optional object with configuration options:

###### column?

`string`

The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Create a buffer of 1 unit around geometries in the default column, storing results in 'bufferedGeom'
await table.buffer("bufferedGeom", 1).log();
```

```ts
// Create a buffer of 10 units around geometries in a specific column named 'pointsGeom'
await table.buffer("pointsBuffer", 10, { column: "pointsGeom" }).log();
```

###### Inherited from

`SimpleTableCore.buffer`

##### centroid()

> **centroid**(`newColumn`, `options?`): `this`

Computes the centroid of geometries.
The values are returned in the SRS unit of the input geometries.

###### Parameters

###### newColumn

`string`

The name of the new column where the computed centroid geometries will be stored.

###### options?

An optional object with configuration options:

###### column?

`string`

The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Compute the centroid of geometries in the default column, storing results in 'centerPoint'
await table.centroid("centerPoint").log();
```

```ts
// Compute the centroid of geometries in a specific column named 'areaGeom'
await table.centroid("areaCentroid", { column: "areaGeom" }).log();
```

###### Inherited from

`SimpleTableCore.centroid`

##### coveredBy()

> **coveredBy**(`column`, `containerColumn`, `newColumn`): `this`

Returns `TRUE` if every point of a geometry in `column` is covered by a geometry in `containerColumn`, including their boundaries, and `FALSE` otherwise.

###### Parameters

###### column

`string`

The name of the column storing the geometries to be tested for containment.

###### containerColumn

`string`

The name of the column storing the geometries to be tested as containers. Both columns must have the same projection.

###### newColumn

`string`

The name of the new column where the boolean results (`TRUE` when covered, `FALSE` otherwise) will be stored.

###### Returns

`this`

The table, so methods can be chained.

###### Example

```ts
// Check if geometries in 'pointGeom' are covered by 'polygonGeom', storing results in 'isCovered'
await table.coveredBy("pointGeom", "polygonGeom", "isCovered").log();
```

###### Inherited from

`SimpleTableCore.coveredBy`

##### createPoints()

> **createPoints**(`latColumn`, `lonColumn`, `newColumn`, `options?`): `this`

Creates point geometries from latitude (y) and longitude (x) columns.

###### Parameters

###### latColumn

`string`

The name of the column storing the latitude (y-coordinate) values.

###### lonColumn

`string`

The name of the column storing the longitude (x-coordinate) values.

###### newColumn

`string`

The name of the new column where the point geometries will be stored.

###### options?

An optional object with configuration options:

###### projection?

`string`

The projection of the coordinates. Defaults to EPSG:4326 (WGS84), passed as `"EPSG:4326"`.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Create point geometries in a new 'geom' column using latitude (y) and longitude (x) columns.
// The resulting coordinates are ordered as [longitude, latitude], or [x, y].
// The projection is assumed to be EPSG:4326 (WGS84).
await table.createPoints("lat", "lon", "geom").log();
```

```ts
// Create point geometries from coordinates in a projected coordinate system
await table.createPoints("y", "x", "geom", { projection: "EPSG:3347" }).log();
```

###### Inherited from

`SimpleTableCore.createPoints`

##### difference()

> **difference**(`column1`, `column2`, `newColumn`): `this`

Computes the geometric difference between two geometries, returning the portion of the first geometry that does not intersect the second.

###### Parameters

###### column1

`string`

The name of the column storing the geometries from which the second geometries will be subtracted.

###### column2

`string`

The name of the column storing the geometries to subtract. Both columns must have the same projection.

###### newColumn

`string`

The name of the new column where the geometric differences will be stored.

###### Returns

`this`

The table, so methods can be chained.

###### Example

```ts
// Subtract 'geomB' from 'geomA', storing the result in 'geomA_minus_geomB'
await table.difference("geomA", "geomB", "geomA_minus_geomB").log();
```

###### Inherited from

`SimpleTableCore.difference`

##### distance()

> **distance**(`column1`, `column2`, `newColumn`, `options?`): `this`

Computes the distance between geometries in two specified columns.
By default, the distance is calculated in the Spatial Reference System (SRS) unit of the input geometries.
You can optionally specify `"spheroid"` or `"haversine"` methods to get results in meters or kilometers.
If using `"spheroid"` or `"haversine"`, the input geometries must be in EPSG:4326 (WGS84).

###### Parameters

###### column1

`string`

The name of the first column storing geometries.

###### column2

`string`

The name of the second column storing geometries.

###### newColumn

`string`

The name of the new column where the computed distances will be stored.

###### options?

An optional object with configuration options:

###### decimals?

`number`

The number of decimal places to round the distance values. Defaults to `undefined` (no rounding).

###### method?

`"srs"` \| `"haversine"` \| `"spheroid"`

The method to use for distance calculations: `"srs"` (default, uses SRS unit), `"haversine"` (meters, requires EPSG:4326 (WGS84)), or `"spheroid"` (meters, requires EPSG:4326 (WGS84), most accurate but slowest).

###### unit?

`"m"` \| `"km"`

If `method` is `"spheroid"` or `"haversine"`, you can choose between `"m"` (meters, default) or `"km"` (kilometers).

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Compute distance between 'geomA' and 'geomB' in SRS units, store in 'distance_srs'
await table.distance("geomA", "geomB", "distance_srs").log();
```

```ts
// Compute Haversine distance in meters between 'point1' and 'point2', store in 'distance_m'
// Input geometries must be in EPSG:4326 (WGS84).
await table.distance("point1", "point2", "distance_m", { method: "haversine" }).log();
```

```ts
// Compute Haversine distance in kilometers, rounded to 2 decimal places
// Input geometries must be in EPSG:4326 (WGS84).
await table.distance("point1", "point2", "distance_km", { method: "haversine", unit: "km", decimals: 2 }).log();
```

```ts
// Compute Spheroid distance in kilometers
// Input geometries must be in EPSG:4326 (WGS84).
await table.distance("area1", "area2", "distance_spheroid_km", { method: "spheroid", unit: "km" }).log();
```

###### Inherited from

`SimpleTableCore.distance`

##### extractLatLon()

> **extractLatLon**(`column`, `latColumn`, `lonColumn`): `this`

Extracts the latitude (y) and longitude (x) coordinates from point geometries.
The input geometry is assumed to be in EPSG:4326 (WGS84).

###### Parameters

###### column

`string`

The name of the column storing the point geometries.

###### latColumn

`string`

The name of the new column where the extracted latitude (y-coordinate) values will be stored.

###### lonColumn

`string`

The name of the new column where the extracted longitude (x-coordinate) values will be stored.

###### Returns

`this`

The table, so methods can be chained.

###### Example

```ts
// Extract latitude (y) and longitude (x) from 'geom' into new 'lat' and 'lon' columns.
await table.extractLatLon("geom", "lat", "lon").log();
```

###### Inherited from

`SimpleTableCore.extractLatLon`

##### fillHoles()

> **fillHoles**(`column?`): `this`

Fills holes in polygon geometries.

###### Parameters

###### column?

`string`

The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Fill holes in geometries in the default geometry column
await table.fillHoles().log();
```

```ts
// Fill holes in geometries in a specific column named 'polygonGeom'
await table.fillHoles("polygonGeom").log();
```

###### Inherited from

`SimpleTableCore.fillHoles`

##### fixGeo()

> **fixGeo**(`column?`): `this`

Attempts to make invalid geometries valid without removing any vertices.

###### Parameters

###### column?

`string`

The name of the column storing the geometries to be fixed. If omitted, the method will automatically attempt to find a geometry column.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Fix invalid geometries in the default geometry column
await table.fixGeo().log();
```

```ts
// Fix invalid geometries in a specific column named 'myGeom'
await table.fixGeo("myGeom").log();
```

###### Inherited from

`SimpleTableCore.fixGeo`

##### flipCoordinates()

> **flipCoordinates**(`column?`): `this`

Flips the coordinate order of geometries in a specified column (e.g., from `[longitude (x), latitude (y)]` to `[latitude (y), longitude (x)]` or vice-versa).
**Warning:** This method should be used with caution as it directly manipulates coordinate order and can affect the accuracy of geospatial operations if not used correctly.

###### Parameters

###### column?

`string`

The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Flip coordinates in the default geometry column
await table.flipCoordinates().log();
```

```ts
// Flip coordinates in a specific column named 'myGeom'
await table.flipCoordinates("myGeom").log();
```

###### Inherited from

`SimpleTableCore.flipCoordinates`

##### getBoundingBox()

> **getBoundingBox**(`column?`): `Promise`\<\[`number`, `number`, `number`, `number`\]\>

Returns the bounding box of geometries in `[minLon, minLat, maxLon, maxLat]` order.
By default, the method will try to find the column with the geometries. The input geometry is assumed to be in EPSG:4326 (WGS84).

###### Parameters

###### column?

`string`

The name of the column storing geometries. If omitted, the method will automatically attempt to find a geometry column.

###### Returns

`Promise`\<\[`number`, `number`, `number`, `number`\]\>

A promise that resolves to an array `[minLon, minLat, maxLon, maxLat]` representing the bounding box.

###### Examples

```ts
// Get the bounding box of geometries in the default column
const bbox = await table.getBoundingBox();
console.log(bbox); // e.g., [-75.0, 45.0, -73.0, 46.0]
```

```ts
// Get the bounding box of geometries in a specific column named 'areaGeom'
const areaBbox = await table.getBoundingBox("areaGeom");
console.log(areaBbox);
```

###### Inherited from

`SimpleTableCore.getBoundingBox`

##### getProjection()

> **getProjection**(`column`): `Promise`\<`string`\>

Retrieves the projection of a specified geospatial column.

###### Parameters

###### column

`string`

The name of the geospatial column for which to retrieve the projection.

###### Returns

`Promise`\<`string`\>

A promise that resolves to the projection of the specified column.

###### Example

```ts
// Get the projection of the 'geom' column
const projection = await table.getProjection("geom");
```

###### Inherited from

`SimpleTableCore.getProjection`

##### intersection()

> **intersection**(`column1`, `column2`, `newColumn`): `this`

Computes the intersection of two sets of geometries, creating new geometries where they overlap.

###### Parameters

###### column1

`string`

The name of the first column storing geometries.

###### column2

`string`

The name of the second column storing geometries. Both columns must have the same projection.

###### newColumn

`string`

The name of the new column where the computed intersection geometries will be stored.

###### Returns

`this`

The table, so methods can be chained.

###### Example

```ts
// Compute the intersection of geometries in 'geomA' and 'geomB' columns, storing results in 'intersectGeom'
await table.intersection("geomA", "geomB", "intersectGeom").log();
```

###### Inherited from

`SimpleTableCore.intersection`

##### intersects()

> **intersects**(`column1`, `column2`, `newColumn`): `this`

Returns `TRUE` if two geometries intersect (overlap in any way), and `FALSE` otherwise.

###### Parameters

###### column1

`string`

The name of the first column storing geometries.

###### column2

`string`

The name of the second column storing geometries. Both columns must have the same projection.

###### newColumn

`string`

The name of the new column where the boolean results (`TRUE` for intersection, `FALSE` otherwise) will be stored.

###### Returns

`this`

The table, so methods can be chained.

###### Example

```ts
// Check if geometries in 'geomA' and 'geomB' intersect, storing results in 'doIntersect'
await table.intersects("geomA", "geomB", "doIntersect").log();
```

###### Inherited from

`SimpleTableCore.intersects`

##### joinGeo()

> **joinGeo**(`rightTable`, `method`, `options?`): `this`

Merges the data of this table (considered the left table) with another table (the right table) based on a spatial relationship.
Note that the order of rows in the returned data is not guaranteed to be the same as in the original tables.
This operation might create temporary files in a `.tmp` folder; consider adding `.tmp` to your `.gitignore`.

###### Parameters

###### rightTable

`SimpleTable`

The SimpleTable instance to be joined with this table.

###### method

`"intersect"` \| `"inside"` \| `"withinDistance"`

The spatial join method to use: `"intersect"` (geometries overlap), `"inside"` (geometries of the left table are entirely within geometries of the right table), or `"withinDistance"` (geometries of the left table are within a specified distance of geometries in the right table).

###### options?

An optional object with configuration options:

###### distance?

`number`

Required if `method` is `"withinDistance"`. The target distance for the spatial join. The unit depends on `distanceMethod`.

###### distanceMethod?

`"srs"` \| `"haversine"` \| `"spheroid"`

The method for distance calculations: `"srs"` (default, uses the SRS unit), `"haversine"` (uses meters, requires EPSG:4326 (WGS84) input), or `"spheroid"` (uses meters, requires EPSG:4326 (WGS84) input, most accurate but slowest).

###### excludeLeftGeometry?

`boolean`

Whether to exclude the selected `leftColumn` geometry from the result. Defaults to `false`.

###### excludeRightGeometry?

`boolean`

Whether to exclude the selected `rightColumn` geometry from the result. Defaults to `false`.

###### leftColumn?

`string`

The name of the column storing geometries in the left table (this table). If omitted, the method attempts to find one.

###### outputTable?

`string` \| `boolean`

If `true`, the results will be stored in a new table with a generated name. If a string, it will be used as the name for the new table. If `false` or omitted, the current table will be overwritten. Defaults to `false`.

###### rightColumn?

`string`

The name of the column storing geometries in the right table. If omitted, the method attempts to find one.

###### type?

`"inner"` \| `"left"` \| `"right"` \| `"full"`

The type of join operation to perform: `"inner"`, `"left"` (default), `"right"`, or `"full"`. For some types (like `"inside"`), the table order is important.

###### Returns

`this`

A table instance containing the spatially joined data (either the current table or a new table), so methods can be chained.

###### Examples

```ts
// Merge data based on intersecting geometries, overwriting tableA
await tableA.joinGeo(tableB, "intersect").log();
```

```ts
// Merge data where geometries in tableA are inside geometries in tableB
await tableA.joinGeo(tableB, "inside").log();
```

```ts
// Join using both geometries without copying them into the result
await tableA.joinGeo(tableB, "intersect", {
  excludeLeftGeometry: true,
  excludeRightGeometry: true,
}).log();
```

```ts
// Merge data where geometries in tableA are within 10 units (SRS) of geometries in tableB
await tableA.joinGeo(tableB, "withinDistance", { distance: 10 }).log();
```

```ts
// Merge data where geometries in tableA are within 10 kilometers (Haversine) of geometries in tableB
// Input geometries must be in EPSG:4326 (WGS84).
await tableA.joinGeo(tableB, "withinDistance", { distance: 10, distanceMethod: "haversine", unit: "km" }).log();
```

```ts
// Merge data with specific geometry columns and an inner join type, storing results in a new table
const tableC = await tableA.joinGeo(tableB, "intersect", {
  leftColumn: "geometriesA",
  rightColumn: "geometriesB",
  type: "inner",
  outputTable: true,
}).log();
```

###### Inherited from

`SimpleTableCore.joinGeo`

##### length()

> **length**(`newColumn`, `options?`): `this`

Computes the length of line geometries in meters (`"m"`) or optionally kilometers (`"km"`).
The input geometry is assumed to be in EPSG:4326 (WGS84).

###### Parameters

###### newColumn

`string`

The name of the new column where the computed lengths will be stored.

###### options?

An optional object with configuration options:

###### column?

`string`

The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.

###### decimals?

`number`

The number of decimal places to round the computed lengths. Defaults to `undefined` (no rounding).

###### unit?

`"m"` \| `"km"`

The unit for the computed length: `"m"` (meters) or `"km"` (kilometers). Defaults to `"m"`.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Compute the length of line geometries in meters and store in 'length_m'
await table.length("length_m").log();
```

```ts
// Compute the length of line geometries in kilometers and store in 'length_km'
await table.length("length_km", { unit: "km" }).log();
```

```ts
// Compute lengths in kilometers rounded to two decimal places
await table.length("length_km", { unit: "km", decimals: 2 }).log();
```

```ts
// Compute the length of geometries in a specific column named 'routeGeom'
await table.length("routeLength", { column: "routeGeom" }).log();
```

###### Inherited from

`SimpleTableCore.length`

##### linesToPolygons()

> **linesToPolygons**(`column?`): `this`

Transforms closed linestring geometries into polygon geometries.

###### Parameters

###### column?

`string`

The name of the column storing the linestring geometries. If omitted, the method will automatically attempt to find a geometry column.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Transform closed linestrings in the default geometry column into polygons
await table.linesToPolygons().log();
```

```ts
// Transform closed linestrings in a specific column named 'routeLines' into polygons
await table.linesToPolygons("routeLines").log();
```

###### Inherited from

`SimpleTableCore.linesToPolygons`

##### loadGeoData()

> **loadGeoData**(`file`, `options?`): `this`

Loads geospatial data from an external file or URL into the table.
With the default `SimpleDB.expressionSyntax: "js"`, conditions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.

###### Parameters

###### file

`string`

The path or URL of the external file containing the geospatial data.

###### options?

An optional object with configuration options:

###### columns?

`string`[]

The columns to load. Include the geometry column that should remain in the resulting table, usually `"geom"`. By default, all columns are loaded.

###### conditions?

`string`

A SQL `WHERE` clause expression, without the `WHERE` keyword, to filter source rows before materialization and reprojection. Can reference source columns excluded from `columns`. Geometry conditions use the source coordinate system.

###### toEPSG4326?

`boolean`

If `true`, the method will attempt to reproject the data to EPSG:4326 (WGS84).

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Load geospatial data from a URL
await table.loadGeoData("https://some-website.com/some-data.geojson").log();
```

```ts
// Load geospatial data from a local file
await table.loadGeoData("./some-data.geojson").log();
```

```ts
// Load only the name and geometry columns
await table
  .loadGeoData("./boundaries.geojson", {
    columns: ["name", "geom"],
  })
  .log();
```

```ts
// Load geospatial data from a shapefile (with relevant files in the same folder) and reproject to EPSG:4326 (WGS84)
await table.loadGeoData("./some-data/some-data.shp", { toEPSG4326: true }).log();
```

```ts
// Load geospatial data from a zipped shapefile and reproject to EPSG:4326 (WGS84)
await table.loadGeoData("./some-data.shp.zip", { toEPSG4326: true }).log();
```

```ts
// Filter on a source property without retaining it in the table
await table
  .loadGeoData("./boundaries.geojson", {
    conditions: "population > 100000",
    columns: ["name", "geom"],
  })
  .log();
```

###### Inherited from

`SimpleTableCore.loadGeoData`

##### loadOpenStreetMap()

> **loadOpenStreetMap**(`source`, `options?`): `this`

Loads OpenStreetMap data into the table from a local `.osm` or `.osm.pbf` file, a remote file URL, or an Overpass bounding-box query. Pass a path or URL string to load an existing file, or pass a bounding box with `filters` to download matching features.

DuckDB's [Osmium community extension](https://duckdb.org/community_extensions/extensions/osmium) materializes the complete result and reconstructs `geom` as EPSG:4326. By default, that canonical result is cached as GeoParquet in `.sda-cache/osm`. Distinct paths, local file fingerprints, normalized URLs, endpoints, queries, and bounding boxes retain independent entries. The cache has no expiration unless `ttl` is set and can be cleared by removing `.sda-cache/osm`. Immutable URLs can safely use the default indefinite cache; mutable URLs should set a TTL.

Bounding-box filters use the standard [Overpass QL filter syntax](https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL#Filters). Equality filters are passed as `[key, value]` tuples and serialized by the method. A raw filter fragment string can be used for advanced Overpass filters.

The default Overpass endpoint is a shared public service. Follow the [Overpass public-instance usage guidelines](https://dev.overpass-api.de/overpass-doc/en/preface/commons.html), and configure another endpoint or run your own instance for high-volume usage.

OpenStreetMap data is licensed under the [Open Data Commons Open Database License](https://www.openstreetmap.org/copyright). Public use requires [OpenStreetMap attribution](https://osmfoundation.org/wiki/Licence/Attribution_Guidelines), and distributing OSM or derivative databases can trigger the licence's share-alike requirements.

###### Parameters

###### source

`string` \| \{ `east`: `number`; `north`: `number`; `south`: `number`; `west`: `number`; \}

The local path or remote URL of an existing `.osm` or `.osm.pbf` file, or a bounding box to query through Overpass.

`string`

***

###### Type Literal

\{ `east`: `number`; `north`: `number`; `south`: `number`; `west`: `number`; \}

The local path or remote URL of an existing `.osm` or `.osm.pbf` file, or a bounding box to query through Overpass.

###### east

`number`

The eastern longitude, between -180 and 180 and greater than `west`.

###### north

`number`

The northern latitude, between -90 and 90 and greater than `south`.

###### south

`number`

The southern latitude, between -90 and 90 and less than `north`.

###### west

`number`

The western longitude, between -180 and 180 and less than `east`.

###### options?

Loading options. When `source` is a bounding box, `options.filters` must be provided.

###### cache?

`boolean`

Whether to read and write the processed GeoParquet cache. Defaults to `true`.

###### endpoint?

`string`

The Overpass interpreter endpoint. Defaults to `https://overpass-api.de/api/interpreter`.

###### filters?

`string` \| \[`string`, `string`\] \| \[`string`, `string`\][]

For a bounding-box query, one `[key, value]` tuple or an array of tuples. Array entries are combined as a union. A raw Overpass QL filter fragment string is also accepted.

###### retries?

`number`

Additional network retries after the initial request. Defaults to `3`, for up to four attempts. Network-only; passing it for a local path throws an error.

###### retryDelay?

`number`

Base retry delay in seconds. Defaults to `5`, producing deterministic delays of 5, 10, and 20 seconds. A longer valid `Retry-After` value takes precedence. Network-only; passing it for a local path throws an error.

###### timeout?

`number`

A positive integer timeout in seconds, applied to both the Overpass query and HTTP request. If omitted, the endpoint's default query timeout applies and no HTTP request timeout is set.

###### ttl?

`number`

Cache lifetime in seconds. Omit for no expiration, use `0` to refresh the matching cache entry immediately, or provide a positive value to refresh once the processed entry reaches that age. Cannot be combined with `cache: false`.

###### verbose?

`boolean`

Whether to log OpenStreetMap cache, network, Osmium, cleanup, and timing lifecycle details. Defaults to `false`. `SimpleDB({ cacheVerbose: true })` also enables these messages and is not overridden by `verbose: false`.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

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

###### Inherited from

`SimpleTableCore.loadOpenStreetMap`

##### perimeter()

> **perimeter**(`newColumn`, `options?`): `this`

Computes the perimeter of polygon geometries in meters (`"m"`) or optionally kilometers (`"km"`).
The input geometry is assumed to be in EPSG:4326 (WGS84).

###### Parameters

###### newColumn

`string`

The name of the new column where the computed perimeters will be stored.

###### options?

An optional object with configuration options:

###### column?

`string`

The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.

###### decimals?

`number`

The number of decimal places to round the computed perimeters. Defaults to `undefined` (no rounding).

###### unit?

`"m"` \| `"km"`

The unit for the computed perimeter: `"m"` (meters) or `"km"` (kilometers). Defaults to `"m"`.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Compute the perimeter of polygon geometries in meters and store in 'perimeter_m'
await table.perimeter("perimeter_m").log();
```

```ts
// Compute the perimeter of polygon geometries in kilometers and store in 'perimeter_km'
await table.perimeter("perimeter_km", { unit: "km" }).log();
```

```ts
// Compute perimeters in kilometers rounded to two decimal places
await table.perimeter("perimeter_km", { unit: "km", decimals: 2 }).log();
```

```ts
// Compute the perimeter of geometries in a specific column named 'landParcelGeom'
await table.perimeter("landParcelPerimeter", { column: "landParcelGeom" }).log();
```

###### Inherited from

`SimpleTableCore.perimeter`

##### reducePrecision()

> **reducePrecision**(`decimals`, `options?`): `this`

Reduces the precision of geometries in a specified column to a given number of decimal places.

###### Parameters

###### decimals

`number`

The number of decimal places to keep in the coordinates of the geometries.

###### options?

An optional object with configuration options:

###### column?

`string`

The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Reduce the precision of geometries in the default column to 3 decimal places
await table.reducePrecision(3).log();
```

```ts
// Reduce the precision of geometries in a specific column named 'myGeom' to 2 decimal places
await table.reducePrecision(2, { column: "myGeom" }).log();
```

###### Inherited from

`SimpleTableCore.reducePrecision`

##### reproject()

> **reproject**(`crs`, `options?`): `this`

Reprojects the geometries in a specified column to another Spatial Reference System (SRS).

###### Parameters

###### crs

`string`

The target SRS (e.g., `"EPSG:3347"`, or `"EPSG:4326"` for EPSG:4326 (WGS84)).

###### options?

An optional object with configuration options:

###### column?

`string`

The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Reproject geometries in the default column to EPSG:3347 (NAD83/Statistics Canada Lambert)
await table.reproject("EPSG:3347").log();
```

```ts
// Reproject geometries in a specific column named 'myGeom' to EPSG:3347
await table.reproject("EPSG:3347", { column: "myGeom" }).log();
```

###### Inherited from

`SimpleTableCore.reproject`

##### simplify()

> **simplify**(`tolerance`, `options?`): `this`

Simplifies geometries while preserving their overall coverage. A higher tolerance results in more significant simplification.

###### Parameters

###### tolerance

`number`

A numeric value representing the simplification tolerance. A higher value leads to greater simplification.

###### options?

An optional object with configuration options:

###### column?

`string`

The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.

###### simplifyBoundary?

`boolean`

If `true` (default), the boundary of the geometries will also be simplified. If `false`, only the interior of the geometries will be simplified, preserving the original boundary.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Simplify geometries in the default column with a tolerance of 0.1
await table.simplify(0.1).log();
```

```ts
// Simplify geometries in 'myGeom' column, preserving the boundary
await table.simplify(0.05, { column: "myGeom", simplifyBoundary: false }).log();
```

###### Inherited from

`SimpleTableCore.simplify`

##### union()

> **union**(`column1`, `column2`, `newColumn`): `this`

Computes the union of two geometries, creating a new geometry that represents the merged area of both.

###### Parameters

###### column1

`string`

The name of the first column storing geometries.

###### column2

`string`

The name of the second column storing geometries. Both columns must have the same projection.

###### newColumn

`string`

The name of the new column where the computed union geometries will be stored.

###### Returns

`this`

The table, so methods can be chained.

###### Example

```ts
// Compute the union of geometries in 'geomA' and 'geomB', storing results in 'unionGeom'
await table.union("geomA", "geomB", "unionGeom").log();
```

###### Inherited from

`SimpleTableCore.union`

##### unnestGeo()

> **unnestGeo**(`column?`): `this`

Unnests geometries recursively, transforming multi-part geometries (e.g., MultiPolygon) into individual single-part geometries (e.g., Polygon).

###### Parameters

###### column?

`string`

The name of the column storing the geometries to be unnested. If omitted, the method will automatically attempt to find a geometry column.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Unnest geometries in the default column
await table.unnestGeo().log();
```

```ts
// Unnest geometries in a specific column named 'multiGeom'
await table.unnestGeo("multiGeom").log();
```

###### Inherited from

`SimpleTableCore.unnestGeo`

#### Getting Data

##### getBottom()

> **getBottom**(`count`, `options?`): `Promise`\<`object`[]\>

Returns the bottom `n` rows of the table, optionally filtered by SQL conditions.
By default, the last row will be returned first. To preserve the original order, use the `originalOrder` option.
With the default `SimpleDB.expressionSyntax: "js"`, conditions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.
Temporal values use the same JavaScript representations as `getData()`.

###### Parameters

###### count

`number`

The number of rows to return from the bottom of the table.

###### options?

An optional object with configuration options:

###### conditions?

`string`

The filtering conditions specified as a SQL `WHERE` clause (e.g., `"category = 'Books'"`).

###### originalOrder?

`boolean`

A boolean indicating whether the rows should be returned in their original order (`true`) or in reverse order (last row first, `false`). Defaults to `false`.

###### Returns

`Promise`\<`object`[]\>

A promise that resolves to an array of objects representing the bottom `n` rows.

###### Examples

```ts
// Get the last 10 rows (last row first)
const bottom10 = await table.getBottom(10);
console.log(bottom10);
```

```ts
// Get the last 10 rows in their original order
const bottom10OriginalOrder = await table.getBottom(10, { originalOrder: true });
console.log(bottom10OriginalOrder);
```

```ts
// Get the last 5 rows where the 'category' is 'Books' (using JS syntax)
const bottom5Books = await table.getBottom(5, { conditions: `category === 'Books'` });
console.log(bottom5Books);
```

###### Inherited from

`SimpleTableCore.getBottom`

##### getCharacterCount()

> **getCharacterCount**(`column`): `Promise`\<`number`\>

Returns the total number of characters in a column storing strings.
Counts are based on Unicode code points, not grapheme clusters. A user-perceived character composed of multiple code points, such as some emoji or decomposed accented letters, counts as multiple characters.

###### Parameters

###### column

`string`

The name of the string column to count characters from.

###### Returns

`Promise`\<`number`\>

A promise that resolves to the total number of characters across all rows in the specified column.

###### Example

```ts
// Get the total number of characters in the 'name' column
const totalChars = await table.getCharacterCount("name");
console.log(totalChars); // e.g., 523
```

###### Inherited from

`SimpleTableCore.getCharacterCount`

##### getColumnCount()

> **getColumnCount**(): `Promise`\<`number`\>

Returns the number of columns in the table.

###### Returns

`Promise`\<`number`\>

A promise that resolves to a number representing the total count of columns.

###### Example

```ts
// Get the number of columns in the table
const columnCount = await table.getColumnCount();
console.log(columnCount); // e.g., 3
```

###### Inherited from

`SimpleTableCore.getColumnCount`

##### getColumns()

> **getColumns**(): `Promise`\<`string`[]\>

Returns a list of all column names in the table.

###### Returns

`Promise`\<`string`[]\>

A promise that resolves to an array of strings, where each string is a column name.

###### Example

```ts
// Get all column names from the table
const columns = await table.getColumns();
console.log(columns); // e.g., ["id", "name", "age"]
```

###### Inherited from

`SimpleTableCore.getColumns`

##### getData()

> **getData**(`options?`): `Promise`\<`object`[]\>

Returns the data from the table as an array of objects, optionally filtered by SQL conditions.
With the default `SimpleDB.expressionSyntax: "js"`, conditions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.

Top-level DuckDB `DATE` and `TIMESTAMP` columns are returned as JavaScript
`Date` objects interpreted in UTC. `TIMESTAMP WITH TIME ZONE` values are
returned as UTC strings, preserving DuckDB's microsecond precision;
JavaScript `Date` supports only milliseconds.

Top-level `BIGINT`, `UBIGINT`, `HUGEINT`, and `UHUGEINT` columns are
returned as JavaScript numbers. Values outside `Number.MIN_SAFE_INTEGER`
through `Number.MAX_SAFE_INTEGER` throw instead of losing precision.
Use `convert({ columnName: "string" })` before `getData()` to retrieve
their exact digits as strings.

SQL arrays and lists, including float vectors, return their actual elements
as JavaScript arrays. Null cells and null elements remain null.

Nested SQL lists and structs become JavaScript arrays and objects. Within
them, `BIGINT`, `UBIGINT`, `HUGEINT`, `UHUGEINT`, and `DECIMAL` values remain
strings to preserve precision, even for small integers.

###### Parameters

###### options?

An optional object with configuration options:

###### columns?

`string` \| `string`[]

An array of column names to include in the result. If omitted, all columns will be included.

###### conditions?

`string`

The filtering conditions specified as a SQL `WHERE` clause (e.g., `"category = 'Book'"`).

###### limit?

`number`

The maximum number of rows to return. Must be an integer greater than or equal to `0`.

###### Returns

`Promise`\<`object`[]\>

A promise that resolves to an array of objects, where each object represents a row in the table.

###### Examples

```ts
// Get all data from the table
const allData = await table.getData();
console.log(allData);
```

```ts
// Get data filtered by a condition (using JS or SQL syntax)
const booksData = await table.getData({ conditions: `category === 'Book'` });
console.log(booksData);
```

```ts
// Get data filtered by a condition and specific columns
const booksData = await table.getData({ columns: ["title", "author"], conditions: `category === 'Book'` });
console.log(booksData);
```

```ts
// Return at most two rows.
const preview = await table.getData({ limit: 2 });
```

```ts
// Read nested integers without losing digits. SQL creates the nested types.
await sdb.customQuery(`CREATE TABLE nested_example AS SELECT
  [42::BIGINT, 9007199254740993::BIGINT] AS ids,
  {'count': 2::INTEGER, 'amount': 123.450::DECIMAL(6,3)} AS details`);
const nested = sdb.newTable("nested_example");
const rows = await nested.getData();
// [{ ids: ["42", "9007199254740993"], details: { count: 2, amount: "123.450" } }]
await nested.log();
```

###### Inherited from

`SimpleTableCore.getData`

##### getDataAsCSV()

> **getDataAsCSV**(`options?`): `Promise`\<`string`\>

Returns the data from the table as a CSV string, optionally filtered by SQL conditions.
With the default `SimpleDB.expressionSyntax: "js"`, conditions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.
Temporal values are first converted as they are in `getData()`, then
serialized using UTC date and timestamp text.

###### Parameters

###### options?

An optional object with configuration options:

###### columns?

`string` \| `string`[]

An array of column names to include in the CSV. If omitted, all columns will be included.

###### conditions?

`string`

The filtering conditions specified as a SQL `WHERE` clause (e.g., `"category = 'Book'"`).

###### Returns

`Promise`\<`string`\>

A promise that resolves to a CSV-formatted string representation of the table data.

###### Examples

```ts
// Get all data from the table as CSV
const allDataCSV = await table.getDataAsCSV();
console.log(allDataCSV);
```

```ts
// Get data filtered by a condition (using JS syntax or SQL syntax) as CSV
const booksDataCSV = await table.getDataAsCSV({ conditions: `category === 'Book'` });
console.log(booksDataCSV);
```

```ts
// Get data filtered by a condition and specific columns as CSV
const booksDataCSV = await table.getDataAsCSV({ columns: ["title", "author"], conditions: `category === 'Book'` });
console.log(booksDataCSV);
```

###### Inherited from

`SimpleTableCore.getDataAsCSV`

##### getDescription()

> **getDescription**(): `Promise`\<`object`[]\>

Returns descriptive statistical information about the columns, including details like data types, number of null values, and distinct values.

###### Returns

`Promise`\<`object`[]\>

A promise that resolves to an array of objects, each representing descriptive statistics for a column.

###### Example

```ts
// Get and log descriptive information about the table's columns
const description = await table.getDescription();
console.table(description);
```

###### Inherited from

`SimpleTableCore.getDescription`

##### getExtent()

> **getExtent**(`column`): `Promise`\<\[`unknown`, `unknown`\]\>

Returns the extent (minimum and maximum values) of a specific column as an array.
Temporal values use the same JavaScript representations as `getData()`.

###### Parameters

###### column

`string`

The name of the column from which to retrieve the extent.

###### Returns

`Promise`\<\[`unknown`, `unknown`\]\>

A promise that resolves to an array `[min, max]` containing the minimum and maximum values of the specified column.

###### Example

```ts
// Get the extent of the 'temperature' column
const tempExtent = await table.getExtent("temperature");
console.log(tempExtent); // e.g., [15.2, 30.1]
```

###### Inherited from

`SimpleTableCore.getExtent`

##### getFirstRow()

> **getFirstRow**(`options?`): `Promise`\<\{\[`key`: `string`\]: `unknown`; \} \| `null`\>

Returns the first row of the table, optionally filtered by SQL conditions.
With the default `SimpleDB.expressionSyntax: "js"`, conditions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.
Temporal values use the same JavaScript representations as `getData()`.

###### Parameters

###### options?

An optional object with configuration options:

###### conditions?

`string`

The filtering conditions specified as a SQL `WHERE` clause (e.g., `"category = 'Book'"`).

###### Returns

`Promise`\<\{\[`key`: `string`\]: `unknown`; \} \| `null`\>

A promise that resolves to an object representing the first row, or `null` if no rows match the conditions.

###### Examples

```ts
// Get the very first row of the table
const firstRow = await table.getFirstRow();
console.log(firstRow);
```

```ts
// Get the first row where the 'category' is 'Book'
const firstRowBooks = await table.getFirstRow({ conditions: `category === 'Book'` }); // Using JS syntax
console.log(firstRowBooks);
```

###### Inherited from

`SimpleTableCore.getFirstRow`

##### getGeoData()

> **getGeoData**(`options?`): `Promise`\<\{ `features`: `unknown`[]; `type`: `string`; \}\>

Returns the table's geospatial data as a GeoJSON FeatureCollection.
Each row becomes a Feature: the selected geometry column becomes its geometry,
and the remaining columns become its properties.
If the table has multiple geometry columns, you must specify which one to use.

###### Parameters

###### options?

An optional object with configuration options:

###### column?

`string`

The name of the column storing the geometries. If omitted, the table must have exactly one geometry column, which will be selected automatically.

###### rewind?

`boolean`

If `true`, rewinds the coordinates of polygons to follow the spherical winding order (important for D3.js). Defaults to `false`.

###### Returns

`Promise`\<\{ `features`: `unknown`[]; `type`: `string`; \}\>

A promise that resolves to a GeoJSON object representing the table's geospatial data.

###### Examples

```ts
// Get GeoJSON data from the default geometry column
const geojson = await table.getGeoData();
console.log(geojson);
```

```ts
// Get GeoJSON data from a specific geometry column named 'myGeometries'
const myGeomJson = await table.getGeoData({ column: "myGeometries" });
console.log(myGeomJson);
```

```ts
// Get GeoJSON data and rewind polygon coordinates for D3.js compatibility
const rewoundGeojson = await table.getGeoData({ rewind: true });
console.log(rewoundGeojson);
```

###### Inherited from

`SimpleTableCore.getGeoData`

##### getHash()

> **getHash**(): `Promise`\<`string`\>

Returns a deterministic hash of the table's ordered schema and contents.
Pending operations are executed before the hash is calculated. Computing
the hash scans the complete table inside DuckDB without transferring its
rows to JavaScript.

###### Returns

`Promise`\<`string`\>

A promise that resolves to a SHA-256 hash string.

###### Example

```ts
const hash = await table.getHash();
console.log(hash); // e.g., "8f14e45fceea..."
```

###### Inherited from

`SimpleTableCore.getHash`

##### getLastRow()

> **getLastRow**(`options?`): `Promise`\<\{\[`key`: `string`\]: `unknown`; \} \| `null`\>

Returns the last row of the table, optionally filtered by SQL conditions.
With the default `SimpleDB.expressionSyntax: "js"`, conditions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.
Temporal values use the same JavaScript representations as `getData()`.

###### Parameters

###### options?

An optional object with configuration options:

###### conditions?

`string`

The filtering conditions specified as a SQL `WHERE` clause (e.g., `"category = 'Book'"`).

###### Returns

`Promise`\<\{\[`key`: `string`\]: `unknown`; \} \| `null`\>

A promise that resolves to an object representing the last row, or `null` if no rows match the conditions.

###### Examples

```ts
// Get the very last row of the table
const lastRow = await table.getLastRow();
console.log(lastRow);
```

```ts
// Get the last row where the 'category' is 'Book'
const lastRowBooks = await table.getLastRow({ conditions: `category === 'Book'` }); // Using JS syntax
console.log(lastRowBooks);
```

###### Inherited from

`SimpleTableCore.getLastRow`

##### getMax()

> **getMax**(`column`): `Promise`\<`unknown`\>

Returns the maximum value from a specific column.
Temporal values use the same JavaScript representations as `getData()`.

###### Parameters

###### column

`string`

The name of the column from which to retrieve the maximum value.

###### Returns

`Promise`\<`unknown`\>

A promise that resolves to the maximum value of the specified column.

###### Example

```ts
// Get the maximum value from the 'price' column
const maxPrice = await table.getMax("price");
console.log(maxPrice); // e.g., 99.99
```

###### Inherited from

`SimpleTableCore.getMax`

##### getMean()

> **getMean**(`column`, `options?`): `Promise`\<`number`\>

Returns the mean (average) value from a specific numeric column.

###### Parameters

###### column

`string`

The name of the numeric column from which to retrieve the mean value.

###### options?

An optional object with configuration options:

###### decimals?

`number`

The number of decimal places to round the result to. Defaults to `undefined` (no rounding).

###### Returns

`Promise`\<`number`\>

A promise that resolves to the mean value of the specified column.

###### Examples

```ts
// Get the mean of the 'age' column
const meanAge = await table.getMean("age");
console.log(meanAge); // e.g., 35.75
```

```ts
// Get the mean of the 'salary' column, rounded to 2 decimal places
const meanSalary = await table.getMean("salary", { decimals: 2 });
console.log(meanSalary); // e.g., 55000.23
```

###### Inherited from

`SimpleTableCore.getMean`

##### getMedian()

> **getMedian**(`column`, `options?`): `Promise`\<`number`\>

Returns the median value from a specific numeric column.

###### Parameters

###### column

`string`

The name of the numeric column from which to retrieve the median value.

###### options?

An optional object with configuration options:

###### decimals?

`number`

The number of decimal places to round the result to. Defaults to `undefined` (no rounding).

###### Returns

`Promise`\<`number`\>

A promise that resolves to the median value of the specified column.

###### Examples

```ts
// Get the median of the 'age' column
const medianAge = await table.getMedian("age");
console.log(medianAge); // e.g., 30
```

```ts
// Get the median of the 'salary' column, rounded to 2 decimal places
const medianSalary = await table.getMedian("salary", { decimals: 2 });
console.log(medianSalary); // e.g., 50000.00
```

###### Inherited from

`SimpleTableCore.getMedian`

##### getMin()

> **getMin**(`column`): `Promise`\<`unknown`\>

Returns the minimum value from a specific column.
Temporal values use the same JavaScript representations as `getData()`.

###### Parameters

###### column

`string`

The name of the column from which to retrieve the minimum value.

###### Returns

`Promise`\<`unknown`\>

A promise that resolves to the minimum value of the specified column.

###### Example

```ts
// Get the minimum value from the 'price' column
const minPrice = await table.getMin("price");
console.log(minPrice); // e.g., 10.50
```

###### Inherited from

`SimpleTableCore.getMin`

##### getName()

> **getName**(): `string`

Returns the name of the table.

###### Returns

`string`

The name of the table as a string.

###### Example

```ts
// Get the table name
const tableName = table.getName();
console.log(tableName); // e.g., "employees"
```

###### Inherited from

`SimpleTableCore.getName`

##### getQuantile()

> **getQuantile**(`column`, `quantile`, `options?`): `Promise`\<`number`\>

Returns the value of a specific quantile from the values in a given numeric column.

###### Parameters

###### column

`string`

The name of the numeric column from which to calculate the quantile.

###### quantile

`number`

The quantile to calculate, expressed as a number between 0 and 1 (e.g., `0.25` for the first quartile, `0.5` for the median, `0.75` for the third quartile).

###### options?

An optional object with configuration options:

###### decimals?

`number`

The number of decimal places to round the result to. Defaults to `undefined` (no rounding).

###### Returns

`Promise`\<`number`\>

A promise that resolves to the quantile value of the specified column.

###### Examples

```ts
// Get the first quartile (25th percentile) of 'column1'
const firstQuartile = await table.getQuantile("column1", 0.25);
console.log(firstQuartile); // e.g., 15.7
```

```ts
// Get the 90th percentile of 'score' values, rounded to 2 decimal places
const ninetiethPercentile = await table.getQuantile("score", 0.9, { decimals: 2 });
console.log(ninetiethPercentile); // e.g., 88.55
```

###### Inherited from

`SimpleTableCore.getQuantile`

##### getRow()

> **getRow**(`conditions`, `options?`): `Promise`\<\{\[`key`: `string`\]: `unknown`; \}\>

Returns a single row that matches the specified conditions. Always throws if no row matches. By default, also throws if more than one row matches.
With the default `SimpleDB.expressionSyntax: "js"`, conditions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.
Temporal values use the same JavaScript representations as `getData()`.

###### Parameters

###### conditions

`string`

The conditions to match, specified as a SQL `WHERE` clause.

###### options?

Optional settings:

###### strict?

`boolean`

If `false`, returns the first row when multiple rows match. A missing match always throws. Defaults to `true`.

###### Returns

`Promise`\<\{\[`key`: `string`\]: `unknown`; \}\>

A promise that resolves to an object representing the matched row.

###### Examples

```ts
// Get a row where 'name' is 'John'
const johnsRow = await table.getRow(`name = 'John'`);
console.log(johnsRow);
```

```ts
// Get a row where 'id' is 123 (using JS syntax)
const rowById = await table.getRow(`id === 123`);
console.log(rowById);
```

```ts
// Get the first matching row when multiple rows may match
const flexibleRow = await table.getRow(`status = 'pending'`, { strict: false });
console.log(flexibleRow);
```

###### Throws

If no row matches, or if `strict` is `true` and more than one row matches the conditions.

###### Inherited from

`SimpleTableCore.getRow`

##### getRowCount()

> **getRowCount**(`options?`): `Promise`\<`number`\>

Returns the number of rows in the table.
With the default `SimpleDB.expressionSyntax: "js"`, conditions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.

###### Parameters

###### options?

An optional object with configuration options:

###### conditions?

`string`

The filtering conditions specified as a SQL `WHERE` clause (e.g., `"category = 'Book'"`).

###### Returns

`Promise`\<`number`\>

A promise that resolves to a number representing the total count of rows.

###### Examples

```ts
// Get the number of rows in the table
const rowCount = await table.getRowCount();
console.log(rowCount); // e.g., 100
```

```ts
// Get the number of rows where 'category' is 'Book'
const bookCount = await table.getRowCount({ conditions: "category = 'Book'" });
console.log(bookCount);
```

###### Inherited from

`SimpleTableCore.getRowCount`

##### getSchema()

> **getSchema**(): `Promise`\<`object`[]\>

Returns the schema of the table, including column names and their data types.

###### Returns

`Promise`\<`object`[]\>

A promise that resolves to an array of objects, where each object represents a column with its name and data type.

###### Example

```ts
// Get the schema of the table
const schema = await table.getSchema();
console.table(schema); // Log the schema in a readable table format
```

###### Inherited from

`SimpleTableCore.getSchema`

##### getSkew()

> **getSkew**(`column`, `options?`): `Promise`\<`number`\>

Returns the skewness of values from a specific numeric column.

###### Parameters

###### column

`string`

The name of the numeric column from which to retrieve the skewness.

###### options?

An optional object with configuration options:

###### decimals?

`number`

The number of decimal places to round the result to. Defaults to `undefined` (no rounding).

###### Returns

`Promise`\<`number`\>

A promise that resolves to the skewness value of the specified column.

###### Examples

```ts
// Get the skewness of the 'data' column
const dataSkew = await table.getSkew("data");
console.log(dataSkew); // e.g., 0.5
```

```ts
// Get the skewness of the 'values' column, rounded to 2 decimal places
const valuesSkew = await table.getSkew("values", { decimals: 2 });
console.log(valuesSkew); // e.g., -0.25
```

###### Inherited from

`SimpleTableCore.getSkew`

##### getStdDev()

> **getStdDev**(`column`, `options?`): `Promise`\<`number`\>

Returns the standard deviation of values from a specific numeric column.

###### Parameters

###### column

`string`

The name of the numeric column from which to retrieve the standard deviation.

###### options?

An optional object with configuration options:

###### decimals?

`number`

The number of decimal places to round the result to. Defaults to `undefined` (no rounding).

###### Returns

`Promise`\<`number`\>

A promise that resolves to the standard deviation value of the specified column.

###### Examples

```ts
// Get the standard deviation of the 'height' column
const heightStdDev = await table.getStdDev("height");
console.log(heightStdDev); // e.g., 5.2
```

```ts
// Get the standard deviation of the 'score' column, rounded to 3 decimal places
const scoreStdDev = await table.getStdDev("score", { decimals: 3 });
console.log(scoreStdDev); // e.g., 12.345
```

###### Inherited from

`SimpleTableCore.getStdDev`

##### getSum()

> **getSum**(`column`): `Promise`\<`number`\>

Returns the sum of values from a specific numeric column.

###### Parameters

###### column

`string`

The name of the numeric column from which to retrieve the sum.

###### Returns

`Promise`\<`number`\>

A promise that resolves to the sum of values in the specified column.

###### Example

```ts
// Get the sum of the 'quantity' column
const totalQuantity = await table.getSum("quantity");
console.log(totalQuantity); // e.g., 1250
```

###### Inherited from

`SimpleTableCore.getSum`

##### getTop()

> **getTop**(`count`, `options?`): `Promise`\<`object`[]\>

Returns the top `n` rows of the table, optionally filtered by SQL conditions.
With the default `SimpleDB.expressionSyntax: "js"`, conditions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.
Temporal values use the same JavaScript representations as `getData()`.

###### Parameters

###### count

`number`

The number of rows to return from the top of the table.

###### options?

An optional object with configuration options:

###### conditions?

`string`

The filtering conditions specified as a SQL `WHERE` clause (e.g., `"category = 'Books'"`).

###### Returns

`Promise`\<`object`[]\>

A promise that resolves to an array of objects representing the top `n` rows.

###### Examples

```ts
// Get the first 10 rows of the table
const top10 = await table.getTop(10);
console.log(top10);
```

```ts
// Get the first 5 rows where the 'category' is 'Books'
const top5Books = await table.getTop(5, { conditions: `category === 'Books'` }); // Using JS syntax
console.log(top5Books);
```

###### Inherited from

`SimpleTableCore.getTop`

##### getTypes()

> **getTypes**(): `Promise`\<\{\[`key`: `string`\]: `string`; \}\>

Returns the data types of all columns in the table.

###### Returns

`Promise`\<\{\[`key`: `string`\]: `string`; \}\>

A promise that resolves to an object where keys are column names and values are their corresponding data types (e.g., `{ "id": "BIGINT", "name": "VARCHAR" }`).

###### Example

```ts
// Get the data types of all columns
const dataTypes = await table.getTypes();
console.log(dataTypes);
```

###### Inherited from

`SimpleTableCore.getTypes`

##### getUniques()

> **getUniques**(`column`): `Promise`\<`unknown`[]\>

Returns unique values from a specific column. The values are returned in ascending order.
Temporal values use the same JavaScript representations as `getData()`.

###### Parameters

###### column

`string`

The name of the column from which to retrieve unique values.

###### Returns

`Promise`\<`unknown`[]\>

A promise that resolves to an array containing the unique values from the specified column, sorted in ascending order.

###### Example

```ts
// Get unique values from the 'category' column
const uniqueCategories = await table.getUniques("category");
console.log(uniqueCategories); // e.g., ["Books", "Clothing", "Electronics"]
```

###### Inherited from

`SimpleTableCore.getUniques`

##### getValueCount()

> **getValueCount**(): `Promise`\<`number`\>

Returns the total number of values in the table (number of columns multiplied by the number of rows).

###### Returns

`Promise`\<`number`\>

A promise that resolves to a number representing the total count of values.

###### Example

```ts
// Get the total number of values in the table
const valueCount = await table.getValueCount();
console.log(valueCount); // e.g., 300 (if 3 columns and 100 rows)
```

###### Inherited from

`SimpleTableCore.getValueCount`

##### getValues()

> **getValues**(`column`): `Promise`\<`unknown`[]\>

Returns all values from a specific column.
Temporal values use the same JavaScript representations as `getData()`.

###### Parameters

###### column

`string`

The name of the column from which to retrieve values.

###### Returns

`Promise`\<`unknown`[]\>

A promise that resolves to an array containing all values from the specified column.

###### Example

```ts
// Get all values from the 'productName' column
const productNames = await table.getValues("productName");
console.log(productNames); // e.g., ["Laptop", "Mouse", "Keyboard"]
```

###### Inherited from

`SimpleTableCore.getValues`

##### getVariance()

> **getVariance**(`column`, `options?`): `Promise`\<`number`\>

Returns the variance of values from a specific numeric column.

###### Parameters

###### column

`string`

The name of the numeric column from which to retrieve the variance.

###### options?

An optional object with configuration options:

###### decimals?

`number`

The number of decimal places to round the result to. Defaults to `undefined` (no rounding).

###### Returns

`Promise`\<`number`\>

A promise that resolves to the variance value of the specified column.

###### Examples

```ts
// Get the variance of the 'data' column
const dataVariance = await table.getVariance("data");
console.log(dataVariance); // e.g., 25.5
```

```ts
// Get the variance of the 'values' column, rounded to 2 decimal places
const valuesVariance = await table.getVariance("values", { decimals: 2 });
console.log(valuesVariance); // e.g., 10.23
```

###### Inherited from

`SimpleTableCore.getVariance`

##### stream()

> **stream**(`options?`): `AsyncGenerator`\<\{\[`key`: `string`\]: `unknown`; \}, `void`, `undefined`\>

Streams the table rows one by one as an async iterator, without
materializing the whole table in memory. Values are converted to
JavaScript types the same way as `getData()`.
With the default `SimpleDB.expressionSyntax: "js"`, conditions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.

The underlying DuckDB result is streamed chunk by chunk, so tables
larger than the available memory can be iterated. Avoid running other
queries on the same database while iterating.

###### Parameters

###### options?

An optional object with configuration options:

###### columns?

`string` \| `string`[]

The column name or an array of column names to include. If omitted, all columns are streamed.

###### conditions?

`string`

A SQL `WHERE` clause condition to filter the rows.

###### Returns

`AsyncGenerator`\<\{\[`key`: `string`\]: `unknown`; \}, `void`, `undefined`\>

An async generator yielding one row object at a time.

###### Examples

```ts
// Stream all rows
for await (const row of table.stream()) {
  console.log(row);
}
```

```ts
// Stream specific columns and rows
for await (const row of table.stream({ columns: "temperature", conditions: `temperature > 20` })) {
  console.log(row);
}
```

###### Inherited from

`SimpleTableCore.stream`

#### Graph Operations

##### commonNeighbors()

> **commonNeighbors**(`sourceColumn`, `targetColumn`, `nodeA`, `nodeB`, `options?`): `SimpleTable`

Finds the neighbors shared by two different nodes. The `direction` option
lets you find neighbors from source to target, from target to source, or
in either direction. The result has one `node` column, sorted in
ascending order.

If either node ID is unknown, or the nodes have no shared neighbors, the
result has no rows. Each shared neighbor appears once, even if
connections are repeated. A self-connection can make one of the requested
nodes a shared neighbor. Using the same ID for both requested nodes
throws an error.

The next three examples each start with this data:

| origin | destination |
| --- | --- |
| A | C |
| A | C |
| B | C |
| B | C |
| D | A |
| D | B |

By default, the method finds shared neighbors from source to target. Both
A and B connect to C:

###### Parameters

###### sourceColumn

`string`

The name of the column containing each connection's source node ID.

###### targetColumn

`string`

The name of the column containing each connection's target node ID.

###### nodeA

`string` \| `number` \| `bigint`

The first node ID.

###### nodeB

`string` \| `number` \| `bigint`

The second node ID, which must differ from `nodeA`.

###### options?

An optional object with direction and result configuration.

###### direction?

`"both"` \| `"outgoing"` \| `"incoming"`

The direction in which to follow connections. Defaults to `"outgoing"`.

###### outputTable?

`string` \| `boolean`

If `true`, stores the result in a new table with a generated name. If a string, uses it as the new table's name. If `false` or omitted, overwrites the current table. Defaults to `false`.

###### Returns

`SimpleTable`

The result table, so methods can be chained.

###### Examples

```ts
await connections
  .commonNeighbors("origin", "destination", "A", "B")
  .log();
```

| node |
| --- |
| C |

C appears only once, even though the input repeats the connections.

With `direction: "incoming"`, the method follows connections from target
to source. D connects to both A and B:

```ts
await connections
  .commonNeighbors("origin", "destination", "A", "B", { direction: "incoming" })
  .log();
```

| node |
| --- |
| D |

With `direction: "both"`, the method finds shared neighbors in either
direction:

```ts
await connections
  .commonNeighbors("origin", "destination", "A", "B", { direction: "both" })
  .log();
```

| node |
| --- |
| C |
| D |

A self-connection can make a requested node a shared neighbor. For this
input, A is a neighbor of both itself and B:

| source | target |
| --- | --- |
| A | A |
| B | A |

```ts
await connections
  .commonNeighbors("source", "target", "A", "B")
  .log();
```

| node |
| --- |
| A |

###### Inherited from

`SimpleTableCore.commonNeighbors`

##### connectedComponents()

> **connectedComponents**(`sourceColumn`, `targetColumn`, `options?`): `SimpleTable`

Groups nodes that are connected to one another, directly or through other
nodes. By default, connection direction is ignored. With the `mode`
option set to "strong", nodes belong to the same group only if each can
reach all the others by following connections from source to target.

The result has `componentId` and `node` columns. Without `startTimeColumn`
or `endTimeColumn`, each node appears once, and rows are sorted by node.
Groups are numbered from zero in order of their smallest node ID.

Use the `startTimeColumn` or `endTimeColumn` options to follow connections
in chronological order. The `minGapMs` option sets the minimum gap between
consecutive connections, in milliseconds. With both time columns, gaps are
measured from one connection's end to the next connection's start; with one
column, between their timestamps. The `strictOrdering` option defaults to
`true`, rejecting zero-duration gaps. These options require an explicitly
supplied `mode: "strong"`.

With these options, nodes are grouped when each can reach all the others
in chronological order. Groups can overlap, so a node may appear in
several rows with different `componentId` values.

For the first example, we start with this data:

| origin | destination |
| --- | --- |
| A | B |
| C | D |

By default, the method groups connected nodes without considering
direction. B and D are included even though they only appear as
destinations:

###### Parameters

###### sourceColumn

`string`

The name of the column containing each connection's source node ID.

###### targetColumn

`string`

The name of the column containing each connection's target node ID.

###### options?

An optional object with component, time, and result configuration.

###### endTimeColumn?

`string`

The name of the column containing each connection's end time. Use this or `startTimeColumn` to follow connections in chronological order.

###### minGapMs?

`number`

The minimum gap between consecutive connections, in milliseconds. Must be a non-negative integer. Defaults to `0`. Requires a time column.

###### mode?

`"weak"` \| `"strong"`

Whether to find `"weak"` or `"strong"` components. Defaults to `"weak"`. Using `startTimeColumn` or `endTimeColumn` requires explicitly setting `mode: "strong"`.

###### outputTable?

`string` \| `boolean`

If `true`, stores the result in a new table with a generated name. If a string, uses it as the new table's name. If `false` or omitted, overwrites the current table. Defaults to `false`.

###### startTimeColumn?

`string`

The name of the column containing each connection's start time. Use this or `endTimeColumn` to follow connections in chronological order.

###### strictOrdering?

`boolean`

Whether to reject zero-duration gaps between consecutive connections (equal timestamps). Defaults to `true`. Requires a time column.

###### Returns

`SimpleTable`

The result table, so methods can be chained.

###### Examples

```ts
await table
  .connectedComponents("origin", "destination")
  .log();
```

| componentId | node |
| ---: | --- |
| 0 | A |
| 0 | B |
| 1 | C |
| 1 | D |

The next two examples each start with this chain of connections:

| source | target |
| --- | --- |
| A | B |
| B | C |

By default, all three nodes belong to the same group:

```ts
await graph
  .connectedComponents("source", "target")
  .log();
```

| componentId | node |
| ---: | --- |
| 0 | A |
| 0 | B |
| 0 | C |

With the `mode` option set to "strong", each node forms its own group. A
can reach B and C, but neither can get back to A:

```ts
await graph
  .connectedComponents("source", "target", {
    mode: "strong",
  })
  .log();
```

| componentId | node |
| ---: | --- |
| 0 | A |
| 1 | B |
| 2 | C |

Adding C -> A would let every node reach the others, so all three would
belong to the same group in "strong" mode too.

Chronological strong groups can overlap. The next example uses one
instantaneous timestamp column:

| time | source | target |
| --- | --- | --- |
| 2025-01-01 08:00 | B | C |
| 2025-01-01 09:00 | C | B |
| 2025-01-01 10:00 | A | B |
| 2025-01-01 11:00 | B | A |

A and B can reach each other, as can B and C, but A cannot reach C after
its first event. This produces the maximal groups `{A, B}` and `{B, C}`:

```ts
await transactions
  .connectedComponents("source", "target", {
    mode: "strong",
    startTimeColumn: "time",
  })
  .log();
```

| componentId | node |
| ---: | --- |
| 0 | A |
| 0 | B |
| 1 | B |
| 1 | C |

###### Inherited from

`SimpleTableCore.connectedComponents`

##### degree()

> **degree**(`sourceColumn`, `targetColumn`, `options?`): `SimpleTable`

Counts the incoming and outgoing connections for every node found in the
source and target columns. By default, each input row is counted separately,
even when several rows connect the same two nodes. Set the `count` option to
`"neighbors"` to count distinct neighboring nodes instead. Use the `weight`
option to sum values from a numeric column instead of counting connections.
The `weight` option cannot be combined with `count: "neighbors"`.

The result has `node`, `incoming`, `outgoing`, and `total` columns. The
`total` is the sum of `incoming` and `outgoing`. Results are sorted by
highest total first, then by node in ascending order when totals are equal.
A self-connection contributes once to incoming and once to outgoing, so
it contributes twice to the total. With `count: "neighbors"`, a neighbor
connected in both directions also contributes once in each direction.
Endpoint IDs must be non-null strings or whole numbers in compatible
columns. Supplied weights must be non-null, finite, and non-negative.

The next three examples each start with these flights:

| origin | destination | passengers |
| --- | --- | ---: |
| Montreal | Toronto | 100 |
| Montreal | Toronto | 200 |
| Montreal | Vancouver | 50 |
| Toronto | Montreal | 150 |

By default, the method counts connections and overwrites the input table:

###### Parameters

###### sourceColumn

`string`

The name of the column containing each connection's source node ID.

###### targetColumn

`string`

The name of the column containing each connection's target node ID.

###### options?

An optional object with counting and result configuration.

###### count?

`"neighbors"` \| `"edges"`

Whether to count connection rows (`"edges"`) or distinct adjacent nodes (`"neighbors"`). Defaults to `"edges"`.

###### outputTable?

`string` \| `boolean`

If `true`, stores the result in a new table with a generated name. If a string, uses it as the new table's name. If `false` or omitted, overwrites the current table. Defaults to `false`.

###### weight?

`string`

The name of the numeric edge-weight column to sum. This requires edge counting.

###### Returns

`SimpleTable`

The result table, so methods can be chained.

###### Examples

```ts
await flights
  .degree("origin", "destination")
  .log();
```

| node | incoming | outgoing | total |
| --- | ---: | ---: | ---: |
| Montreal | 1 | 3 | 4 |
| Toronto | 2 | 1 | 3 |
| Vancouver | 1 | 0 | 1 |

With `count: "neighbors"`, the two Montreal-to-Toronto flights count as
one outgoing neighbor for Montreal:

```ts
await flights
  .degree("origin", "destination", { count: "neighbors" })
  .log();
```

| node | incoming | outgoing | total |
| --- | ---: | ---: | ---: |
| Montreal | 1 | 2 | 3 |
| Toronto | 1 | 1 | 2 |
| Vancouver | 1 | 0 | 1 |

With `weight: "passengers"`, the method adds passenger counts for each
city's incoming and outgoing flights:

```ts
await flights
  .degree("origin", "destination", { weight: "passengers" })
  .log();
```

| node | incoming | outgoing | total |
| --- | ---: | ---: | ---: |
| Montreal | 150 | 350 | 500 |
| Toronto | 300 | 150 | 450 |
| Vancouver | 50 | 0 | 50 |

A self-connection is counted once in each direction. For this input:

| source | target |
| --- | --- |
| A | A |
| A | B |

```ts
await connections
  .degree("source", "target")
  .log();
```

| node | incoming | outgoing | total |
| --- | ---: | ---: | ---: |
| A | 1 | 2 | 3 |
| B | 1 | 0 | 1 |

###### Inherited from

`SimpleTableCore.degree`

##### distances()

> **distances**(`sourceColumn`, `targetColumn`, `startNodes`, `options?`): `SimpleTable`

Finds the shortest routes from each starting node to every reachable
node. Without options, shortest means the fewest connections. Use `weight`
to report total cost and `elapsedTime` to report duration including waiting
between connections. Use `minimize` to choose which metric defines shortest.

Each row contains `start`, `node`, and `steps`, plus `total` when `weight`
is supplied and `elapsedTimeMs` when enabled. Routes tied on the chosen
metric produce separate rows only when their reported summaries differ;
identical summaries appear once.

Routes cannot repeat nodes except for a final return to the start. A start
appears in its own results only through an actual return or self-connection,
never with zero steps. With `direction: "both"`, a return can follow the
same connection out and back. Use `shortestPath()` to inspect individual
connections between two different nodes.

Reporting weight or elapsed time can require substantial time and memory
on dense networks because many routes may need to be explored.

The next five examples each start with this data:

| origin | destination | minutes |
| --- | --- | ---: |
| A | B | 4 |
| B | C | 1 |
| D | B | 2 |

By default, the method follows connections from source to target and
counts how many connections are needed:

###### Parameters

###### sourceColumn

`string`

The name of the column containing each connection's source node ID.

###### targetColumn

`string`

The name of the column containing each connection's target node ID.

###### startNodes

`string` \| `number` \| `bigint` \| (`string` \| `number` \| `bigint`)[]

One starting node ID or a non-empty array of distinct IDs. Unknown IDs and starts with no connections to follow produce no rows. Empty arrays and duplicate IDs throw an error.

###### options?

An optional object with direction, time, and result configuration.

###### direction?

`"both"` \| `"outgoing"` \| `"incoming"`

The direction in which to follow connections. Defaults to `"outgoing"`. Chronological traversal supports only `"outgoing"` and `"incoming"`.

###### elapsedTime?

`boolean`

Whether to add cumulative `elapsedTimeMs` in milliseconds, including connection gaps. Defaults to `false`. Requires both time columns. Optimization compares native timestamp precision before conversion to milliseconds.

###### endTimeColumn?

`string`

The name of the column containing each connection's end time. Use this or `startTimeColumn` to follow connections in chronological order.

###### minGapMs?

`number`

The minimum gap between consecutive connections, in milliseconds; does not apply before the first connection. With both time columns, measured from one connection's end to the next's start; with one column, between timestamps. Must be a non-negative integer. Defaults to `0`. Requires a time column.

###### minimize?

`"steps"` \| `"weight"` \| `"elapsedTime"`

The metric used to select optimal routes: `"steps"`, `"weight"`, or `"elapsedTime"`. Defaults to `"weight"` when only `weight` is enabled, `"elapsedTime"` when only elapsed-time reporting is enabled, and `"steps"` when neither is enabled. Required when both are enabled. `"steps"` is always available; the other metrics require their corresponding options.

###### outputTable?

`string` \| `boolean`

If `true`, stores the result in a new table with a generated name. If a string, uses it as the new table's name. If `false` or omitted, overwrites the current table. Defaults to `false`.

###### startTimeColumn?

`string`

The name of the column containing each connection's start time. Use this or `endTimeColumn` to follow connections in chronological order.

###### strictOrdering?

`boolean`

Whether to reject zero-duration gaps between consecutive connections (equal timestamps). Defaults to `true`. Requires a time column.

###### weight?

`string`

The name of the numeric column used as the cost of each connection. Values must be non-null, finite, and non-negative. Adds `total`, the cumulative sum of those costs. If omitted, no `total` column is generated.

###### Returns

`SimpleTable`

The table of distinct optimal summaries with `start`, `node`, and `steps`, plus `total` when `weight` is supplied and `elapsedTimeMs` when enabled, so methods can be chained. Sorted by start, the chosen metric, node, then remaining metrics in the order steps, total, elapsed time.

###### Examples

```ts
await connections
  .distances("origin", "destination", "A")
  .log();
```

| start | node | steps |
| --- | --- | ---: |
| A | B | 1 |
| A | C | 2 |

With `weight: "minutes"`, `total` is the sum of travel times:

```ts
await connections
  .distances("origin", "destination", "A", { weight: "minutes" })
  .log();
```

| start | node | steps | total |
| --- | --- | ---: | ---: |
| A | B | 1 | 4 |
| A | C | 2 | 5 |

With `direction: "incoming"`, connections are followed from target to
source. Starting at C:

```ts
await connections
  .distances("origin", "destination", "C", { direction: "incoming" })
  .log();
```

| start | node | steps |
| --- | --- | ---: |
| C | B | 1 |
| C | A | 2 |
| C | D | 2 |

With `direction: "both"`, connections can be followed in either
direction:

```ts
await connections
  .distances("origin", "destination", "A", { direction: "both" })
  .log();
```

| start | node | steps |
| --- | --- | ---: |
| A | B | 1 |
| A | A | 2 |
| A | C | 2 |
| A | D | 2 |

A appears with 2 steps because A → B → A follows a connection out
and back.

An array of starting nodes gives separate distances for each start:

```ts
await connections
  .distances("origin", "destination", ["D", "A"], {
    weight: "minutes",
  })
  .log();
```

| start | node | steps | total |
| --- | --- | ---: | ---: |
| A | B | 1 | 4 |
| A | C | 2 | 5 |
| D | B | 1 | 2 |
| D | C | 2 | 3 |

A direct self-connection and a longer return route can both lead back
to the start. This example uses different data:

| origin | destination | minutes |
| --- | --- | ---: |
| A | A | 10 |
| A | B | 2 |
| B | A | 3 |

The shortest return to A takes 5 minutes through B, compared with
10 minutes for the direct self-connection:

```ts
await connections
  .distances("origin", "destination", "A", { weight: "minutes" })
  .log();
```

| start | node | steps | total |
| --- | --- | ---: | ---: |
| A | B | 1 | 2 |
| A | A | 2 | 5 |

Chronological options can rule out a cheaper sequence that departs too
early. Here, B → C leaves before A → B arrives, while B → D meets the
one-hour minimum exactly:

| origin | destination | departureTime | arrivalTime | minutes |
| --- | --- | --- | --- | ---: |
| A | B | 2025-01-01 08:00 | 2025-01-01 10:00 | 2 |
| B | C | 2025-01-01 09:00 | 2025-01-01 10:00 | 1 |
| B | D | 2025-01-01 11:00 | 2025-01-01 12:00 | 3 |

```ts
await scheduledFlights
  .distances("origin", "destination", "A", {
    startTimeColumn: "departureTime",
    endTimeColumn: "arrivalTime",
    minGapMs: 60 * 60 * 1000,
    weight: "minutes",
  })
  .log();
```

| start | node | steps | total |
| --- | --- | ---: | ---: |
| A | B | 1 | 2 |
| A | D | 2 | 5 |

For the next four examples, `flights` contains these rows, with departure
and arrival stored as timestamps on the same day:

| flightId | origin | destination | departure | arrival | price |
| --- | --- | --- | --- | --- | ---: |
| F1 | A | B | 2025-01-01 09:00 | 2025-01-01 10:00 | 40 |
| F2 | B | C | 2025-01-01 12:00 | 2025-01-01 13:00 | 40 |
| F3 | A | C | 2025-01-01 09:00 | 2025-01-01 12:00 | 120 |

Find the fastest journey from A to each reachable destination, including
layovers:

```ts
await flights
  .distances("origin", "destination", "A", {
    startTimeColumn: "departure",
    endTimeColumn: "arrival",
    minGapMs: 60 * 60 * 1000,
    elapsedTime: true,
  })
  .log();
```

| start | node | steps | elapsedTimeMs |
| --- | --- | ---: | ---: |
| A | B | 1 | 3600000 |
| A | C | 1 | 10800000 |

The direct flight to C takes three hours (10,800,000 milliseconds).
The route through B takes four hours including its layover.

Find the fastest journeys from A while also adding up their prices:

```ts
await flights
  .distances("origin", "destination", "A", {
    startTimeColumn: "departure",
    endTimeColumn: "arrival",
    minGapMs: 60 * 60 * 1000,
    elapsedTime: true,
    weight: "price",
    minimize: "elapsedTime",
  })
  .log();
```

| start | node | steps | total | elapsedTimeMs |
| --- | --- | ---: | ---: | ---: |
| A | B | 1 | 40 | 3600000 |
| A | C | 1 | 120 | 10800000 |

Use `minimize: "weight"` to find the cheapest journeys instead. The
selected route to C now takes two steps through B and costs 80:

```ts
await flights
  .distances("origin", "destination", "A", {
    startTimeColumn: "departure",
    endTimeColumn: "arrival",
    minGapMs: 60 * 60 * 1000,
    elapsedTime: true,
    weight: "price",
    minimize: "weight",
  })
  .log();
```

| start | node | steps | total | elapsedTimeMs |
| --- | --- | ---: | ---: | ---: |
| A | B | 1 | 40 | 3600000 |
| A | C | 2 | 80 | 14400000 |

Choose the fewest connections while still reporting price and elapsed
time. The direct flight to C has one step, even though it costs more:

```ts
await flights
  .distances("origin", "destination", "A", {
    startTimeColumn: "departure",
    endTimeColumn: "arrival",
    minGapMs: 60 * 60 * 1000,
    elapsedTime: true,
    weight: "price",
    minimize: "steps",
  })
  .log();
```

| start | node | steps | total | elapsedTimeMs |
| --- | --- | ---: | ---: | ---: |
| A | B | 1 | 40 | 3600000 |
| A | C | 1 | 120 | 10800000 |

When two routes to C both take two steps but have different prices,
minimizing steps while reporting price returns both summaries:

```ts
await connections
  .loadArray([
    { origin: "A", destination: "B", price: 20 },
    { origin: "B", destination: "C", price: 30 },
    { origin: "A", destination: "D", price: 40 },
    { origin: "D", destination: "C", price: 40 },
  ])
  .distances("origin", "destination", "A", {
    weight: "price",
    minimize: "steps",
  })
  .filter("node = 'C'")
  .log();
```

| start | node | steps | total |
| --- | --- | ---: | ---: |
| A | C | 2 | 50 |
| A | C | 2 | 80 |

###### Inherited from

`SimpleTableCore.distances`

##### findCycles()

> **findCycles**(`sourceColumn`, `targetColumn`, `edgeId`, `startNodes`, `options?`): `SimpleTable`

Finds all cycles starting and ending at each node in `startNodes`.
Pass one node ID or an array of node IDs. A cycle cannot visit the same
node twice, except to return to its start, or reuse a connection.
Different cycles can share nodes. The `direction` option lets you
follow connections from source to target, from target to source, or in
either direction. By default, connections are followed from source to
target.

Each connection needs a unique, non-null ID. Pass the name of the column
containing these IDs as the `edgeId` argument. If your table is missing
an ID column, you can easily create one with `addId()`.

The result starts with the `start`, `pathId`, `step`, `weight`, and
`total` columns, followed by all original columns. The `start` column
identifies the requested starting node. Steps start at one and follow
the search direction. The `weight` column is the connection cost, and
`total` is the sum of those costs up to and including the current step.
Without the `weight` option, each connection costs one.

If an input column is already named `start`, `pathId`, `step`, `weight`,
or `total` (regardless of capitalization), the method throws an error.
Rename it with `renameColumns()` first.

Each row is one connection, including the final connection back to the
start. Weights must be non-null, finite, and non-negative.

If a cycle can start at several requested nodes, each starting node
produces a separate result. The `pathId` starts at zero for each starting
node; `start` and `pathId` together identify a cycle. Passing an empty
array or duplicate IDs in `startNodes` throws an error. Unknown IDs or
starts with no cycles produce no rows.

With `direction: "both"`, a cycle and its reverse are returned once per
starting node, choosing the smaller sequence of connection IDs. Within
each start, cycles are numbered by connection-ID sequence. Rows are
sorted by `start`, then `pathId`, then `step`.

Use the `startTimeColumn` or `endTimeColumn` options to follow connections
in chronological order. The `minGapMs` option sets the minimum gap between
consecutive connections, in milliseconds. With both time columns, gaps are
measured from one connection's end to the next connection's start; with one
column, between their timestamps. The `strictOrdering` option defaults to
`true`, rejecting zero-duration gaps. These options only work with
`direction: "outgoing"` or `direction: "incoming"`.

Time rules are checked from each requested starting node. A cycle may
therefore work from one starting node but not another. No gap is checked
from the final connection back to the first. Incoming searches follow
connections backward in chronological order.

A self-connection forms a one-step cycle. With `direction: "both"`, two
separate connections between the same nodes can form a two-step cycle. A
single connection cannot be followed out and back to create a cycle.
Cycles using different connections remain separate, even if they visit
the same nodes. If there are no cycles, the result has no rows.

There is no limit on cycle length or the number of cycles returned.
Finding all cycles can take a long time and use substantial memory.

The next four examples each start with these connections:

| edgeId | source | target |
| --- | --- | --- |
| E1 | A | B |
| E2 | B | C |
| E3 | C | A |

By default, connections are followed from source to target:

###### Parameters

###### sourceColumn

`string`

The name of the column containing each connection's source node ID.

###### targetColumn

`string`

The name of the column containing each connection's target node ID.

###### edgeId

`string`

The name of the column uniquely identifying each connection (edge).

###### startNodes

`string` \| `number` \| `bigint` \| (`string` \| `number` \| `bigint`)[]

One starting node ID or an array of IDs. Finds cycles that start and end at each requested node.

###### options?

An optional object with direction, time, cost, and result configuration.

###### direction?

`"both"` \| `"outgoing"` \| `"incoming"`

The direction in which to follow connections. Defaults to `"outgoing"`.

###### elapsedTime?

`boolean`

Whether to add cumulative `elapsedTimeMs` in milliseconds, including connection gaps. Defaults to `false`. Requires both time columns.

###### endTimeColumn?

`string`

The name of the column containing each connection's end time. Use this or `startTimeColumn` to follow connections in chronological order.

###### minGapMs?

`number`

The minimum gap between consecutive connections, in milliseconds. Must be a non-negative integer. Defaults to `0`. Requires a time column.

###### outputTable?

`string` \| `boolean`

If `true`, stores the result in a new table with a generated name. If a string, uses it as the new table's name. If `false` or omitted, overwrites the current table. Defaults to `false`.

###### startTimeColumn?

`string`

The name of the column containing each connection's start time. Use this or `endTimeColumn` to follow connections in chronological order.

###### strictOrdering?

`boolean`

Whether to reject zero-duration gaps between consecutive connections (equal timestamps). Defaults to `true`. Requires a time column.

###### weight?

`string`

The name of the numeric column used as the cost of each connection. If omitted, each connection costs one.

###### Returns

`SimpleTable`

The result table, so methods can be chained.

###### Examples

```ts
await triangle
  .findCycles("source", "target", "edgeId", "A")
  .log();
```

| start | pathId | step | weight | total | edgeId | source | target |
| --- | ---: | ---: | ---: | ---: | --- | --- | --- |
| A | 0 | 1 | 1 | 1 | E1 | A | B |
| A | 0 | 2 | 1 | 2 | E2 | B | C |
| A | 0 | 3 | 1 | 3 | E3 | C | A |

Requesting both A and B returns the cycle separately for each start:

```ts
await triangle
  .findCycles("source", "target", "edgeId", ["A", "B"])
  .log();
```

| start | pathId | step | weight | total | edgeId | source | target |
| --- | ---: | ---: | ---: | ---: | --- | --- | --- |
| A | 0 | 1 | 1 | 1 | E1 | A | B |
| A | 0 | 2 | 1 | 2 | E2 | B | C |
| A | 0 | 3 | 1 | 3 | E3 | C | A |
| B | 0 | 1 | 1 | 1 | E2 | B | C |
| B | 0 | 2 | 1 | 2 | E3 | C | A |
| B | 0 | 3 | 1 | 3 | E1 | A | B |

With `direction: "incoming"`, connections are followed from target to
source:

```ts
await triangle
  .findCycles("source", "target", "edgeId", "A", { direction: "incoming" })
  .log();
```

| start | pathId | step | weight | total | edgeId | source | target |
| --- | ---: | ---: | ---: | ---: | --- | --- | --- |
| A | 0 | 1 | 1 | 1 | E3 | C | A |
| A | 0 | 2 | 1 | 2 | E2 | B | C |
| A | 0 | 3 | 1 | 3 | E1 | A | B |

With `direction: "both"`, either direction is allowed. This cycle appears
once, in the direction that starts with E1:

```ts
await triangle
  .findCycles("source", "target", "edgeId", "A", { direction: "both" })
  .log();
```

| start | pathId | step | weight | total | edgeId | source | target |
| --- | ---: | ---: | ---: | ---: | --- | --- | --- |
| A | 0 | 1 | 1 | 1 | E1 | A | B |
| A | 0 | 2 | 1 | 2 | E2 | B | C |
| A | 0 | 3 | 1 | 3 | E3 | C | A |

Two separate connections between A and B form a cycle with `direction:
"both"`. The self-connection at C forms another cycle. For this input:

| edgeId | source | target | cost |
| --- | --- | --- | ---: |
| P1 | A | B | 1 |
| P2 | A | B | 2 |
| L1 | C | C | 4 |

```ts
await parallelAndLoop
  .findCycles("source", "target", "edgeId", ["A", "C"], {
    direction: "both",
    weight: "cost",
  })
  .log();
```

| start | pathId | step | weight | total | edgeId | source | target | cost |
| --- | ---: | ---: | ---: | ---: | --- | --- | --- | ---: |
| A | 0 | 1 | 1 | 1 | P1 | A | B | 1 |
| A | 0 | 2 | 2 | 3 | P2 | A | B | 2 |
| C | 0 | 1 | 4 | 4 | L1 | C | C | 4 |

With the `weight` option, total is a running total of the selected
values. For these flights:

| flightId | origin | destination | minutes |
| --- | --- | --- | ---: |
| F1 | A | B | 1 |
| F2 | B | C | 2 |
| F3 | C | A | 3 |

```ts
await flights
  .findCycles("origin", "destination", "flightId", "A", {
    weight: "minutes",
  })
  .log();
```

| start | pathId | step | weight | total | flightId | origin | destination | minutes |
| --- | ---: | ---: | ---: | ---: | --- | --- | --- | ---: |
| A | 0 | 1 | 1 | 1 | F1 | A | B | 1 |
| A | 0 | 2 | 2 | 3 | F2 | B | C | 2 |
| A | 0 | 3 | 3 | 6 | F3 | C | A | 3 |

For an input without connection IDs, use `addId()` first:

| source | target |
| --- | --- |
| A | B |
| B | C |
| C | A |

```ts
await unnumberedConnections
  .addId("edgeId", { prefix: "edge-" })
  .findCycles("source", "target", "edgeId", "A")
  .log();
```

| start | pathId | step | weight | total | source | target | edgeId |
| --- | ---: | ---: | ---: | ---: | --- | --- | --- |
| A | 0 | 1 | 1 | 1 | A | B | edge-0 |
| A | 0 | 2 | 1 | 2 | B | C | edge-1 |
| A | 0 | 3 | 1 | 3 | C | A | edge-2 |

For these instantaneous events, requesting A and B as starting nodes
returns only the cycle B → C → A → B. Starting at A would break
chronological order:

| flightId | origin | destination | departureTime |
| --- | --- | --- | --- |
| F1 | B | C | 2025-01-01 09:00 |
| F2 | C | A | 2025-01-01 10:00 |
| F3 | A | B | 2025-01-01 11:00 |

```ts
await timedFlights
  .findCycles("origin", "destination", "flightId", ["A", "B"], {
    startTimeColumn: "departureTime",
  })
  .log();
```

| start | pathId | step | weight | total | flightId | origin | destination | departureTime |
| --- | ---: | ---: | ---: | ---: | --- | --- | --- | --- |
| B | 0 | 1 | 1 | 1 | F1 | B | C | 2025-01-01 09:00:00 |
| B | 0 | 2 | 1 | 2 | F2 | C | A | 2025-01-01 10:00:00 |
| B | 0 | 3 | 1 | 3 | F3 | A | B | 2025-01-01 11:00:00 |

Searching the same events from B in the incoming direction follows
connections backward, from the latest to the earliest:

```ts
await timedFlights
  .findCycles("origin", "destination", "flightId", "B", {
    direction: "incoming",
    startTimeColumn: "departureTime",
  })
  .log();
```

| start | pathId | step | weight | total | flightId | origin | destination | departureTime |
| --- | ---: | ---: | ---: | ---: | --- | --- | --- | --- |
| B | 0 | 1 | 1 | 1 | F3 | A | B | 2025-01-01 11:00:00 |
| B | 0 | 2 | 1 | 2 | F2 | C | A | 2025-01-01 10:00:00 |
| B | 0 | 3 | 1 | 3 | F1 | B | C | 2025-01-01 09:00:00 |

For the next two examples, `flights` contains these rows, with departure
and arrival stored as timestamps on the same day:

| flightId | origin | destination | departure | arrival | price |
| --- | --- | --- | --- | --- | ---: |
| F1 | A | B | 2025-01-01 09:00 | 2025-01-01 10:00 | 40 |
| F2 | B | A | 2025-01-01 12:00 | 2025-01-01 13:00 | 60 |

Report elapsed time for every cycle, including layovers:

```ts
await flights
  .findCycles("origin", "destination", "flightId", "A", {
    startTimeColumn: "departure",
    endTimeColumn: "arrival",
    minGapMs: 60 * 60 * 1000,
    elapsedTime: true,
  })
  .log();
```

| start | pathId | step | weight | total | elapsedTimeMs | flightId | origin | destination | departure | arrival | price |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- | ---: |
| A | 0 | 1 | 1 | 1 | 3600000 | F1 | A | B | 2025-01-01 09:00:00 | 2025-01-01 10:00:00 | 40 |
| A | 0 | 2 | 1 | 2 | 14400000 | F2 | B | A | 2025-01-01 12:00:00 | 2025-01-01 13:00:00 | 60 |

The return journey takes four hours (14,400,000 milliseconds),
including the two-hour layover at B.

Add up prices while continuing to report elapsed time for every cycle:

```ts
await flights
  .findCycles("origin", "destination", "flightId", "A", {
    startTimeColumn: "departure",
    endTimeColumn: "arrival",
    minGapMs: 60 * 60 * 1000,
    elapsedTime: true,
    weight: "price",
  })
  .log();
```

| start | pathId | step | weight | total | elapsedTimeMs | flightId | origin | destination | departure | arrival | price |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- | ---: |
| A | 0 | 1 | 40 | 40 | 3600000 | F1 | A | B | 2025-01-01 09:00:00 | 2025-01-01 10:00:00 | 40 |
| A | 0 | 2 | 60 | 100 | 14400000 | F2 | B | A | 2025-01-01 12:00:00 | 2025-01-01 13:00:00 | 60 |

###### Inherited from

`SimpleTableCore.findCycles`

##### neighbors()

> **neighbors**(`sourceColumn`, `targetColumn`, `startNodes`, `options?`): `SimpleTable`

Finds the distinct nodes directly connected to one or more starting nodes.
The `direction` option lets you find neighbors from source to target,
from target to source, or in either direction. The result has `start` and
`node` columns, sorted in ascending order by `start`, then `node`.

Unknown starting IDs and starts with no neighbors in the selected
direction produce no rows.
A self-connection includes the starting node once. Empty start arrays and
duplicate starting IDs throw an error.

The next three examples each start with this data:

| origin | destination |
| --- | --- |
| A | B |
| A | B |
| C | A |

By default, the method finds neighbors from source to target:

###### Parameters

###### sourceColumn

`string`

The name of the column containing each connection's source node ID.

###### targetColumn

`string`

The name of the column containing each connection's target node ID.

###### startNodes

`string` \| `number` \| `bigint` \| (`string` \| `number` \| `bigint`)[]

One starting node ID or an array of distinct starting node IDs.

###### options?

An optional object with direction and result configuration.

###### direction?

`"both"` \| `"outgoing"` \| `"incoming"`

The direction in which to follow connections. Defaults to `"outgoing"`.

###### outputTable?

`string` \| `boolean`

If `true`, stores the result in a new table with a generated name. If a string, uses it as the new table's name. If `false` or omitted, overwrites the current table. Defaults to `false`.

###### Returns

`SimpleTable`

The result table, so methods can be chained.

###### Examples

```ts
await table
  .neighbors("origin", "destination", "A")
  .log();
```

| start | node |
| --- | --- |
| A | B |

B appears only once, even though the input has two connections from A to B.

With `direction: "incoming"`, the method finds neighbors from target to
source. Here, C connects to A:

```ts
await table
  .neighbors("origin", "destination", "A", { direction: "incoming" })
  .log();
```

| start | node |
| --- | --- |
| A | C |

With `direction: "both"`, the method finds neighbors in either direction:

```ts
await table
  .neighbors("origin", "destination", "A", { direction: "both" })
  .log();
```

| start | node |
| --- | --- |
| A | B |
| A | C |

Multiple starts are evaluated independently. For this input:

| source | target | cost |
| --- | --- | ---: |
| Montreal | Ottawa | 2 |
| Ottawa | Toronto | 3 |

```ts
await table
  .neighbors("source", "target", ["Montreal", "Ottawa"])
  .log();
```

| start | node |
| --- | --- |
| Montreal | Ottawa |
| Ottawa | Toronto |

###### Inherited from

`SimpleTableCore.neighbors`

##### paths()

> **paths**(`sourceColumn`, `targetColumn`, `edgeId`, `start`, `end`, `options?`): `SimpleTable`

Finds all routes between two different nodes. A route cannot visit the
same node twice, to avoid loops. Different routes can still share the
same nodes.

The `direction` option lets you follow connections from source to target,
from target to source, or in either direction.

Each connection needs a unique, non-null ID. Pass the name of the column
containing these IDs as the `edgeId` argument. If your table is missing
an ID column, you can easily create one with `addId()`.

The result starts with the `pathId`, `step`, `weight`, and `total`
columns, followed by all original columns. Steps start at one and follow
the search direction. The `weight` column is the connection cost, and
`total` is the sum of those costs up to and including the current step.
Without the `weight` option, each connection costs one.

If an input column is already named `pathId`, `step`, `weight`, or `total`
(regardless of capitalization), the method throws an error. Rename it
with `renameColumns()` first.

Each row is one connection along a route.

Use the `startTimeColumn` or `endTimeColumn` options to follow connections
in chronological order. The `minGapMs` option sets the minimum gap between
consecutive connections, in milliseconds. With both time columns, gaps are
measured from one connection's end to the next connection's start; with one
column, between their timestamps. The `strictOrdering` option defaults to
`true`, rejecting zero-duration gaps. These options only work with
`direction: "outgoing"` or `direction: "incoming"`.

The minimum gap applies only between consecutive connections, not before
the first connection.

Routes are numbered from zero by comparing their sequences of connection
IDs, element by element. Rows are sorted by `pathId`, then `step`.

Unknown IDs or nodes with no route between them produce no rows. The
start and end must differ. Self-connections are ignored. Weights must
be non-null, finite, and non-negative.

There is no limit on route length or the number of routes returned.
Finding all routes can take a long time and use substantial memory.

For the first example, we start with these connections:

| edgeId | source | target |
| --- | --- | --- |
| E1 | A | B |
| E2 | A | C |
| E3 | B | D |
| E4 | C | D |

By default, connections are followed from source to target. Both routes
from A to D are returned:

###### Parameters

###### sourceColumn

`string`

The name of the column containing each connection's source node ID.

###### targetColumn

`string`

The name of the column containing each connection's target node ID.

###### edgeId

`string`

The name of the column uniquely identifying each connection (edge).

###### start

`string` \| `number` \| `bigint`

The starting node ID.

###### end

`string` \| `number` \| `bigint`

The ending node ID, which must differ from `start`.

###### options?

An optional object with direction, time, and result configuration.

###### direction?

`"both"` \| `"outgoing"` \| `"incoming"`

The direction in which to follow connections. Defaults to `"outgoing"`.

###### elapsedTime?

`boolean`

Whether to add cumulative `elapsedTimeMs` in milliseconds, including connection gaps. Defaults to `false`. Requires both time columns.

###### endTimeColumn?

`string`

The name of the column containing each connection's end time. Use this or `startTimeColumn` to follow connections in chronological order.

###### minGapMs?

`number`

The minimum gap between consecutive connections, in milliseconds. Must be a non-negative integer. Defaults to `0`. Requires a time column.

###### outputTable?

`string` \| `boolean`

If `true`, stores the result in a new table with a generated name. If a string, uses it as the new table's name. If `false` or omitted, overwrites the current table. Defaults to `false`.

###### startTimeColumn?

`string`

The name of the column containing each connection's start time. Use this or `endTimeColumn` to follow connections in chronological order.

###### strictOrdering?

`boolean`

Whether to reject zero-duration gaps between consecutive connections (equal timestamps). Defaults to `true`. Requires a time column.

###### weight?

`string`

The name of the numeric column used as the cost of each connection. If omitted, each connection costs one.

###### Returns

`SimpleTable`

The result table, so methods can be chained.

###### Examples

```ts
await connections
  .paths("source", "target", "edgeId", "A", "D")
  .log();
```

| pathId | step | weight | total | edgeId | source | target |
| ---: | ---: | ---: | ---: | --- | --- | --- |
| 0 | 1 | 1 | 1 | E1 | A | B |
| 0 | 2 | 1 | 2 | E3 | B | D |
| 1 | 1 | 1 | 1 | E2 | A | C |
| 1 | 2 | 1 | 2 | E4 | C | D |

For an input without connection IDs, use `addId()` first:

| source | target |
| --- | --- |
| A | B |
| B | D |

The generated IDs identify the connections in the result:

```ts
await unnumberedConnections
  .addId("edgeId", { prefix: "edge-" })
  .paths("source", "target", "edgeId", "A", "D")
  .log();
```

| pathId | step | weight | total | source | target | edgeId |
| ---: | ---: | ---: | ---: | --- | --- | --- |
| 0 | 1 | 1 | 1 | A | B | edge-0 |
| 0 | 2 | 1 | 2 | B | D | edge-1 |

The next three examples each start with these flights. The direct flight
takes ten minutes; the route through B takes three:

| flightId | origin | destination | minutes |
| --- | --- | --- | ---: |
| F1 | A | D | 10 |
| F2 | A | B | 1 |
| F3 | B | D | 2 |

With `weight: "minutes"`, both routes are returned with their travel
times:

```ts
await flights
  .paths("origin", "destination", "flightId", "A", "D", {
    weight: "minutes",
  })
  .log();
```

| pathId | step | weight | total | flightId | origin | destination | minutes |
| ---: | ---: | ---: | ---: | --- | --- | --- | ---: |
| 0 | 1 | 10 | 10 | F1 | A | D | 10 |
| 1 | 1 | 1 | 1 | F2 | A | B | 1 |
| 1 | 2 | 2 | 3 | F3 | B | D | 2 |

Without the `weight` option, the same routes are returned and total
counts connections:

```ts
await flights
  .paths("origin", "destination", "flightId", "A", "D")
  .log();
```

| pathId | step | weight | total | flightId | origin | destination | minutes |
| ---: | ---: | ---: | ---: | --- | --- | --- | ---: |
| 0 | 1 | 1 | 1 | F1 | A | D | 10 |
| 1 | 1 | 1 | 1 | F2 | A | B | 1 |
| 1 | 2 | 1 | 2 | F3 | B | D | 2 |

With `direction: "incoming"`, the search runs from D to A. Steps follow
that direction, while the original origin and destination values stay
unchanged:

```ts
await flights
  .paths("origin", "destination", "flightId", "D", "A", {
    direction: "incoming",
    weight: "minutes",
  })
  .log();
```

| pathId | step | weight | total | flightId | origin | destination | minutes |
| ---: | ---: | ---: | ---: | --- | --- | --- | ---: |
| 0 | 1 | 10 | 10 | F1 | A | D | 10 |
| 1 | 1 | 2 | 2 | F3 | B | D | 2 |
| 1 | 2 | 1 | 3 | F2 | A | B | 1 |

Chronological routes enforce the connection time between every pair of
steps. For the next two examples, the 09:00 flight leaves before F1
arrives, while F3 meets the one-hour minimum exactly:

| flightId | origin | destination | departureTime | arrivalTime | cost |
| --- | --- | --- | --- | --- | ---: |
| F1 | A | B | 2025-01-01 08:00 | 2025-01-01 10:00 | 2 |
| F2 | B | C | 2025-01-01 09:00 | 2025-01-01 10:00 | 9 |
| F3 | B | D | 2025-01-01 11:00 | 2025-01-01 12:00 | 3 |

The route from A to D contains F1 and F3:

```ts
await scheduledFlights
  .paths("origin", "destination", "flightId", "A", "D", {
    startTimeColumn: "departureTime",
    endTimeColumn: "arrivalTime",
    minGapMs: 60 * 60 * 1000,
    weight: "cost",
  })
  .log();
```

| pathId | step | weight | total | flightId | origin | destination | departureTime | arrivalTime | cost |
| ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- | ---: |
| 0 | 1 | 2 | 2 | F1 | A | B | 2025-01-01 08:00:00 | 2025-01-01 10:00:00 | 2 |
| 0 | 2 | 3 | 5 | F3 | B | D | 2025-01-01 11:00:00 | 2025-01-01 12:00:00 | 3 |

Searching backward from D finds the same physical journey. The steps and
cumulative totals follow the incoming search from D to A:

```ts
await scheduledFlights
  .paths("origin", "destination", "flightId", "D", "A", {
    direction: "incoming",
    startTimeColumn: "departureTime",
    endTimeColumn: "arrivalTime",
    minGapMs: 60 * 60 * 1000,
    weight: "cost",
  })
  .log();
```

| pathId | step | weight | total | flightId | origin | destination | departureTime | arrivalTime | cost |
| ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- | ---: |
| 0 | 1 | 3 | 3 | F3 | B | D | 2025-01-01 11:00:00 | 2025-01-01 12:00:00 | 3 |
| 0 | 2 | 2 | 5 | F1 | A | B | 2025-01-01 08:00:00 | 2025-01-01 10:00:00 | 2 |

For the next two examples, `flights` contains these rows, with departure
and arrival stored as timestamps on the same day:

| flightId | origin | destination | departure | arrival | price |
| --- | --- | --- | --- | --- | ---: |
| F1 | A | B | 2025-01-01 09:00 | 2025-01-01 10:00 | 40 |
| F2 | B | C | 2025-01-01 12:00 | 2025-01-01 13:00 | 40 |
| F3 | A | C | 2025-01-01 09:00 | 2025-01-01 12:00 | 120 |

Report elapsed time for every path, including layovers:

```ts
await flights
  .paths("origin", "destination", "flightId", "A", "C", {
    startTimeColumn: "departure",
    endTimeColumn: "arrival",
    minGapMs: 60 * 60 * 1000,
    elapsedTime: true,
  })
  .log();
```

| pathId | step | weight | total | elapsedTimeMs | flightId | origin | destination | departure | arrival | price |
| ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- | ---: |
| 0 | 1 | 1 | 1 | 3600000 | F1 | A | B | 2025-01-01 09:00:00 | 2025-01-01 10:00:00 | 40 |
| 0 | 2 | 1 | 2 | 14400000 | F2 | B | C | 2025-01-01 12:00:00 | 2025-01-01 13:00:00 | 40 |
| 1 | 1 | 1 | 1 | 10800000 | F3 | A | C | 2025-01-01 09:00:00 | 2025-01-01 12:00:00 | 120 |

The route through B takes four hours (14,400,000 milliseconds),
including its two-hour layover. The direct flight takes three hours.

Add up prices while continuing to report elapsed time for every path:

```ts
await flights
  .paths("origin", "destination", "flightId", "A", "C", {
    startTimeColumn: "departure",
    endTimeColumn: "arrival",
    minGapMs: 60 * 60 * 1000,
    elapsedTime: true,
    weight: "price",
  })
  .log();
```

| pathId | step | weight | total | elapsedTimeMs | flightId | origin | destination | departure | arrival | price |
| ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- | ---: |
| 0 | 1 | 40 | 40 | 3600000 | F1 | A | B | 2025-01-01 09:00:00 | 2025-01-01 10:00:00 | 40 |
| 0 | 2 | 40 | 80 | 14400000 | F2 | B | C | 2025-01-01 12:00:00 | 2025-01-01 13:00:00 | 40 |
| 1 | 1 | 120 | 120 | 10800000 | F3 | A | C | 2025-01-01 09:00:00 | 2025-01-01 12:00:00 | 120 |

###### Inherited from

`SimpleTableCore.paths`

##### reachable()

> **reachable**(`sourceColumn`, `targetColumn`, `startNodes`, `options?`): `SimpleTable`

Finds all nodes you can reach from one or more starting nodes, following
one or more connections. The `direction` option lets you follow
connections from source to target, from target to source, or in either
direction. The result has `start` and `node` columns, sorted by `start`,
then `node`.

A starting node appears in its own results only if following connections
leads back to it, such as a self-connection or a cycle. Each reachable
node appears only once per start. With `direction: "both"`, following
the same connection out and back also reaches the starting node.

Unknown starting IDs and starts with no connections to follow produce
no rows. Empty start arrays and duplicate starting IDs throw an error.

Use the `startTimeColumn` or `endTimeColumn` options to follow connections
in chronological order. The `minGapMs` option sets the minimum gap between
consecutive connections, in milliseconds. With both time columns, gaps are
measured from one connection's end to the next connection's start; with one
column, between their timestamps. The `strictOrdering` option defaults to
`true`, rejecting zero-duration gaps. These options only work with
`direction: "outgoing"` or `direction: "incoming"`.

The next four examples each start with this data:

| origin | destination |
| --- | --- |
| A | B |
| A | C |
| B | D |
| C | D |
| D | A |

By default, the method follows connections from source to target. A
appears in its own results because A → B → D → A leads back to it:

###### Parameters

###### sourceColumn

`string`

The name of the column containing each connection's source node ID.

###### targetColumn

`string`

The name of the column containing each connection's target node ID.

###### startNodes

`string` \| `number` \| `bigint` \| (`string` \| `number` \| `bigint`)[]

One starting node ID or an array of distinct starting node IDs.

###### options?

An optional object with direction, time, and result configuration.

###### direction?

`"both"` \| `"outgoing"` \| `"incoming"`

The direction in which to follow connections. Defaults to `"outgoing"`.

###### endTimeColumn?

`string`

The name of the column containing each connection's end time. Use this or `startTimeColumn` to follow connections in chronological order.

###### minGapMs?

`number`

The minimum gap between consecutive connections, in milliseconds. Must be a non-negative integer. Defaults to `0`. Requires a time column.

###### outputTable?

`string` \| `boolean`

If `true`, stores the result in a new table with a generated name. If a string, uses it as the new table's name. If `false` or omitted, overwrites the current table. Defaults to `false`.

###### startTimeColumn?

`string`

The name of the column containing each connection's start time. Use this or `endTimeColumn` to follow connections in chronological order.

###### strictOrdering?

`boolean`

Whether to reject zero-duration gaps between consecutive connections (equal timestamps). Defaults to `true`. Requires a time column.

###### Returns

`SimpleTable`

The result table, so methods can be chained.

###### Examples

```ts
await connections
  .reachable("origin", "destination", "A")
  .log();
```

| start | node |
| --- | --- |
| A | A |
| A | B |
| A | C |
| A | D |

With `direction: "incoming"`, connections are followed from target to
source. Starting at B:

```ts
await connections
  .reachable("origin", "destination", "B", { direction: "incoming" })
  .log();
```

| start | node |
| --- | --- |
| B | A |
| B | B |
| B | C |
| B | D |

With `direction: "both"`, connections can be followed in either
direction:

```ts
await connections
  .reachable("origin", "destination", "B", { direction: "both" })
  .log();
```

| start | node |
| --- | --- |
| B | A |
| B | B |
| B | C |
| B | D |

With multiple starting nodes, each has its own results:

```ts
await connections
  .reachable("origin", "destination", ["B", "A"])
  .log();
```

| start | node |
| --- | --- |
| A | A |
| A | B |
| A | C |
| A | D |
| B | A |
| B | B |
| B | C |
| B | D |

Chronological options retain only journeys with valid connection times.
Here, A → B arrives at 10:00, so the 09:00 connection to C is unavailable,
while the 11:00 connection to D meets the one-hour minimum gap:

| origin | destination | departureTime | arrivalTime |
| --- | --- | --- | --- |
| A | B | 2025-01-01 08:00 | 2025-01-01 10:00 |
| B | C | 2025-01-01 09:00 | 2025-01-01 10:00 |
| B | D | 2025-01-01 11:00 | 2025-01-01 12:00 |

The departure and arrival columns are timestamps:

```ts
await flights
  .reachable("origin", "destination", "A", {
    startTimeColumn: "departureTime",
    endTimeColumn: "arrivalTime",
    minGapMs: 60 * 60 * 1000,
  })
  .log();
```

| start | node |
| --- | --- |
| A | B |
| A | D |

###### Inherited from

`SimpleTableCore.reachable`

##### shortestPath()

> **shortestPath**(`sourceColumn`, `targetColumn`, `edgeId`, `start`, `end`, `options?`): `SimpleTable`

Finds the shortest route between two different nodes. If several routes
tie for shortest, all of them are returned. By default, the shortest
route uses the fewest connections. Use the `weight` option to find the
route with the smallest sum of values from a numeric column, such as
travel time. A route cannot visit the same node twice, to avoid loops.
Different routes can still share the same nodes.

The `direction` option lets you follow connections from source to target,
from target to source, or in either direction.

Each connection needs a unique, non-null ID. Pass the name of the column
containing these IDs as the `edgeId` argument. If your table is missing
an ID column, you can easily create one with `addId()`.

The result starts with `pathId`, `step`, and `weight`, followed by the
optional metric columns and all original columns. Steps start at one and
follow the search direction. The `weight` column is the connection cost,
or one when no `weight` option is supplied. Supplying `weight` also adds
`total`, the sum of those costs up to and including the current step.
Enabling `elapsedTime` adds cumulative `elapsedTimeMs`, including gaps.

If an input column conflicts with a generated result column (regardless
of capitalization), the method throws an error. Rename it with
`renameColumns()` first. `total` is reserved only when `weight` is supplied,
and `elapsedTimeMs` only when elapsed-time reporting is enabled.

Each row is one connection along a route.

Use the `startTimeColumn` or `endTimeColumn` options to follow connections
in chronological order. The `minGapMs` option sets the minimum gap between
consecutive connections, in milliseconds. With both time columns, gaps are
measured from one connection's end to the next connection's start; with one
column, between their timestamps. The `strictOrdering` option defaults to
`true`, rejecting zero-duration gaps. These options only work with
`direction: "outgoing"` or `direction: "incoming"`.

The minimum gap applies only between consecutive connections, not before
the first connection.

Use `minimize: "steps"` to choose the fewest connections even when weight
or elapsed-time reporting is enabled. Without an explicit `minimize`, the
method minimizes weight when only `weight` is enabled, elapsed time when
only `elapsedTime` is enabled, and steps when neither is enabled. With
both enabled, specify `"steps"`, `"weight"`, or `"elapsedTime"` explicitly.
Elapsed-time reporting requires both time columns.

All routes tied on the selected metric are returned, even if their other
metrics differ. Each route reports its own weights and elapsed times.

Routes are numbered from zero by comparing their sequences of connection
IDs, element by element. Rows are sorted by `pathId`, then `step`.

Unknown IDs or nodes with no route between them produce no rows. The
start and end must differ. Self-connections are ignored. Weights must
be non-null, finite, and non-negative.

There is no limit on route length or the number of tied routes returned.
Finding many tied routes can take a long time and use substantial memory.

The first example uses this table:

| edgeId | source | target |
| --- | --- | --- |
| E1 | A | B |
| E2 | A | C |
| E3 | B | D |
| E4 | C | D |
| E5 | D | E |

By default, the method finds routes from source to target with the fewest
connections. Two routes from A to E tie at three connections each:

###### Parameters

###### sourceColumn

`string`

The name of the column containing each connection's source node ID.

###### targetColumn

`string`

The name of the column containing each connection's target node ID.

###### edgeId

`string`

The name of the column uniquely identifying each connection (edge).

###### start

`string` \| `number` \| `bigint`

The starting node ID.

###### end

`string` \| `number` \| `bigint`

The ending node ID, which must differ from `start`.

###### options?

An optional object with direction, time, and result configuration.

###### direction?

`"both"` \| `"outgoing"` \| `"incoming"`

The direction in which to follow connections. Defaults to `"outgoing"`.

###### elapsedTime?

`boolean`

Whether to add cumulative `elapsedTimeMs` in milliseconds, including connection gaps. Defaults to `false`. Requires both time columns.

###### endTimeColumn?

`string`

The name of the column containing each connection's end time. Use this or `startTimeColumn` to follow connections in chronological order.

###### minGapMs?

`number`

The minimum gap between consecutive connections, in milliseconds. Must be a non-negative integer. Defaults to `0`. Requires a time column.

###### minimize?

`"steps"` \| `"weight"` \| `"elapsedTime"`

The metric used to select optimal routes: `"steps"`, `"weight"`, or `"elapsedTime"`. Defaults to `"weight"` when only `weight` is enabled, `"elapsedTime"` when only elapsed-time reporting is enabled, and `"steps"` when neither is enabled. Required when both are enabled. `"steps"` is always available; the other metrics require their corresponding options.

###### outputTable?

`string` \| `boolean`

If `true`, stores the result in a new table with a generated name. If a string, uses it as the new table's name. If `false` or omitted, overwrites the current table. Defaults to `false`.

###### startTimeColumn?

`string`

The name of the column containing each connection's start time. Use this or `endTimeColumn` to follow connections in chronological order.

###### strictOrdering?

`boolean`

Whether to reject zero-duration gaps between consecutive connections (equal timestamps). Defaults to `true`. Requires a time column.

###### weight?

`string`

The name of the numeric column used as the cost of each connection. Adds `total`, the cumulative sum of those costs. If omitted, no `total` column is generated.

###### Returns

`SimpleTable`

The table of route connections with optional cumulative `total` and `elapsedTimeMs` metrics, so methods can be chained.

###### Examples

```ts
await connections
  .shortestPath("source", "target", "edgeId", "A", "E")
  .log();
```

| pathId | step | weight | edgeId | source | target |
| ---: | ---: | ---: | --- | --- | --- |
| 0 | 1 | 1 | E1 | A | B |
| 0 | 2 | 1 | E3 | B | D |
| 0 | 3 | 1 | E5 | D | E |
| 1 | 1 | 1 | E2 | A | C |
| 1 | 2 | 1 | E4 | C | D |
| 1 | 3 | 1 | E5 | D | E |

For an input without connection IDs, use `addId()` first:

| source | target |
| --- | --- |
| A | B |
| B | E |

The generated IDs identify the connections in the result:

```ts
await unnumberedConnections
  .addId("edgeId", { prefix: "edge-" })
  .shortestPath("source", "target", "edgeId", "A", "E")
  .log();
```

| pathId | step | weight | source | target | edgeId |
| ---: | ---: | ---: | --- | --- | --- |
| 0 | 1 | 1 | A | B | edge-0 |
| 0 | 2 | 1 | B | E | edge-1 |

The next two examples each start with these flights. The direct flight
takes ten minutes; the route through B and D takes three:

| flightId | origin | destination | minutes |
| --- | --- | --- | ---: |
| F1 | A | E | 10 |
| F2 | A | B | 1 |
| F3 | B | D | 1 |
| F4 | D | E | 1 |

With `weight: "minutes"`, the route with the shortest travel time is
chosen:

```ts
await flights
  .shortestPath("origin", "destination", "flightId", "A", "E", {
    weight: "minutes",
  })
  .log();
```

| pathId | step | weight | total | flightId | origin | destination | minutes |
| ---: | ---: | ---: | ---: | --- | --- | --- | ---: |
| 0 | 1 | 1 | 1 | F2 | A | B | 1 |
| 0 | 2 | 1 | 2 | F3 | B | D | 1 |
| 0 | 3 | 1 | 3 | F4 | D | E | 1 |

Without the `weight` option, the direct flight is shortest because it
uses only one connection:

```ts
await flights
  .shortestPath("origin", "destination", "flightId", "A", "E")
  .log();
```

| pathId | step | weight | flightId | origin | destination | minutes |
| ---: | ---: | ---: | --- | --- | --- | ---: |
| 0 | 1 | 1 | F1 | A | E | 10 |

With time options, the cheaper route through B is ruled out because F2
leaves before F1 arrives. The route through C meets the one-hour minimum
gap:

| flightId | origin | destination | departureTime | arrivalTime | cost |
| --- | --- | --- | --- | --- | ---: |
| F1 | A | B | 2025-01-01 08:00 | 2025-01-01 10:00 | 1 |
| F2 | B | E | 2025-01-01 09:00 | 2025-01-01 10:00 | 1 |
| F3 | A | C | 2025-01-01 08:00 | 2025-01-01 09:00 | 2 |
| F4 | C | E | 2025-01-01 10:00 | 2025-01-01 11:00 | 2 |

```ts
await scheduledFlights
  .shortestPath("origin", "destination", "flightId", "A", "E", {
    startTimeColumn: "departureTime",
    endTimeColumn: "arrivalTime",
    minGapMs: 60 * 60 * 1000,
    weight: "cost",
  })
  .log();
```

| pathId | step | weight | total | flightId | origin | destination | departureTime | arrivalTime | cost |
| ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- | ---: |
| 0 | 1 | 2 | 2 | F3 | A | C | 2025-01-01 08:00:00 | 2025-01-01 09:00:00 | 2 |
| 0 | 2 | 2 | 4 | F4 | C | E | 2025-01-01 10:00:00 | 2025-01-01 11:00:00 | 2 |

With `direction: "incoming"`, connections are followed from target to
source. The original source and target values remain unchanged. For
this input:

| edgeId | source | target |
| --- | --- | --- |
| F1 | A | B |

```ts
await reverseExample
  .shortestPath("source", "target", "edgeId", "B", "A", {
    direction: "incoming",
  })
  .log();
```

| pathId | step | weight | edgeId | source | target |
| ---: | ---: | ---: | --- | --- | --- |
| 0 | 1 | 1 | F1 | A | B |

For the next three examples, `flights` contains these rows, with departure
and arrival stored as timestamps on the same day:

| flightId | origin | destination | departure | arrival | price |
| --- | --- | --- | --- | --- | ---: |
| F1 | A | B | 2025-01-01 09:00 | 2025-01-01 10:00 | 40 |
| F2 | B | C | 2025-01-01 12:00 | 2025-01-01 13:00 | 40 |
| F3 | A | C | 2025-01-01 09:00 | 2025-01-01 12:00 | 120 |
| F4 | A | D | 2025-01-01 09:00 | 2025-01-01 09:30 | 60 |
| F5 | D | C | 2025-01-01 10:30 | 2025-01-01 11:00 | 80 |

Find the fastest journey from A to C, including layovers:

```ts
await flights
  .shortestPath("origin", "destination", "flightId", "A", "C", {
    startTimeColumn: "departure",
    endTimeColumn: "arrival",
    minGapMs: 60 * 60 * 1000,
    elapsedTime: true,
  })
  .log();
```

| pathId | step | weight | elapsedTimeMs | flightId | origin | destination | departure | arrival | price |
| ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- | ---: |
| 0 | 1 | 1 | 1800000 | F4 | A | D | 2025-01-01 09:00:00 | 2025-01-01 09:30:00 | 60 |
| 0 | 2 | 1 | 7200000 | F5 | D | C | 2025-01-01 10:30:00 | 2025-01-01 11:00:00 | 80 |

The route through D takes two hours (7,200,000 milliseconds), including
a one-hour layover. The direct flight takes three hours.

Find the fastest journey while also adding up its price:

```ts
await flights
  .shortestPath("origin", "destination", "flightId", "A", "C", {
    startTimeColumn: "departure",
    endTimeColumn: "arrival",
    minGapMs: 60 * 60 * 1000,
    elapsedTime: true,
    weight: "price",
    minimize: "elapsedTime",
  })
  .log();
```

| pathId | step | weight | total | elapsedTimeMs | flightId | origin | destination | departure | arrival | price |
| ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- | ---: |
| 0 | 1 | 60 | 60 | 1800000 | F4 | A | D | 2025-01-01 09:00:00 | 2025-01-01 09:30:00 | 60 |
| 0 | 2 | 80 | 140 | 7200000 | F5 | D | C | 2025-01-01 10:30:00 | 2025-01-01 11:00:00 | 80 |

Use `minimize: "weight"` to find the cheapest journey instead.
All ties on the chosen metric are returned.

Choose the fewest flights while still reporting price and elapsed time.
The direct flight takes one step, although the route through D is faster:

```ts
await flights
  .shortestPath("origin", "destination", "flightId", "A", "C", {
    startTimeColumn: "departure",
    endTimeColumn: "arrival",
    minGapMs: 60 * 60 * 1000,
    elapsedTime: true,
    weight: "price",
    minimize: "steps",
  })
  .log();
```

| pathId | step | weight | total | elapsedTimeMs | flightId | origin | destination | departure | arrival | price |
| ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- | ---: |
| 0 | 1 | 120 | 120 | 10800000 | F3 | A | C | 2025-01-01 09:00:00 | 2025-01-01 12:00:00 | 120 |

###### Inherited from

`SimpleTableCore.shortestPath`

##### topologicalSort()

> **topologicalSort**(`sourceColumn`, `targetColumn`, `options?`): `SimpleTable`

Orders nodes so each prerequisite comes before the nodes that depend on
it. Each input row means the source node must come before the target
node. For example, A → B means A must come before B.

The result has `node`, `componentId`, and `order` columns, sorted by
`componentId`, then `order`. Nodes connected directly or through other
nodes belong to the same group, ignoring connection direction.
Groups are numbered from zero, with the group containing the smallest
node ID first.

Within each group, `order` starts at one. When several nodes are ready,
the method chooses the smallest node ID first: numeric order for numbers
and character order for strings. All nodes in the source and target
columns are included.

If dependencies form a loop, there is no valid order and the method
throws an error. A node depending on itself also causes an error. An
empty input produces no rows.

For this example, we start with these connections:

| source | target |
| --- | --- |
| A | B |
| B | C |
| D | C |

A must come before B, and both B and D must come before C:

###### Parameters

###### sourceColumn

`string`

The name of the column containing each prerequisite node ID.

###### targetColumn

`string`

The name of the column containing each dependent node ID.

###### options?

An optional object with result configuration.

###### outputTable?

`string` \| `boolean`

If `true`, stores the result in a new table with a generated name. If a string, uses it as the new table's name. If `false` or omitted, overwrites the current table. Defaults to `false`.

###### Returns

`SimpleTable`

The result table, so methods can be chained.

###### Examples

```ts
await table
  .topologicalSort("source", "target")
  .log();
```

| node | componentId | order |
| --- | ---: | ---: |
| A | 0 | 1 |
| B | 0 | 2 |
| D | 0 | 3 |
| C | 0 | 4 |

C comes last because it depends on both B and D. A comes before D
because both are initially ready and A has the smaller ID. After A,
B is ready and comes before D for the same reason.

With two independent groups, each has its own order starting at one.
This example starts with different data:

| source | target |
| --- | --- |
| A | D |
| B | C |

```ts
await table
  .topologicalSort("source", "target")
  .log();
```

| node | componentId | order |
| --- | ---: | ---: |
| A | 0 | 1 |
| D | 0 | 2 |
| B | 1 | 1 |
| C | 1 | 2 |

###### Inherited from

`SimpleTableCore.topologicalSort`

#### Importing Data

##### insertRows()

> **insertRows**(`rows`): `this`

Inserts rows, provided as an array of JavaScript objects, into the table.

###### Parameters

###### rows

`object`[]

An array of objects, where each object represents a row to be inserted and its properties correspond to column names.

###### Returns

`this`

The table, so methods can be chained.

###### Example

```ts
// Insert new rows into the table
const newRows = [
  { letter: "c", number: 3 },
  { letter: "d", number: 4 }
];
await table.insertRows(newRows).log();
```

###### Inherited from

`SimpleTableCore.insertRows`

##### insertTables()

> **insertTables**(`tables`, `options?`): `this`

Inserts all rows from one or more other tables into this table. If tables do not have the same columns, an error will be thrown unless the `unifyColumns` option is set to `true`.

###### Parameters

###### tables

`SimpleTable` \| `SimpleTable`[]

The name(s) of the table(s) or SimpleTable instance(s) from which rows will be inserted.

###### options?

An optional object with configuration options:

###### unifyColumns?

`boolean`

A boolean indicating whether to unify the columns of the tables. If `true`, missing columns in a table will be filled with `NULL` values. Defaults to `false`.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Insert all rows from 'tableB' into 'tableA'.
await tableA.insertTables("tableB").log();
```

```ts
// Insert all rows from 'tableB' and 'tableC' into 'tableA'.
await tableA.insertTables(["tableB", "tableC"]).log();
```

```ts
// Insert rows from multiple tables, unifying columns. Missing columns will be filled with NULL.
await tableA.insertTables(["tableB", "tableC"], { unifyColumns: true }).log();
```

###### Inherited from

`SimpleTableCore.insertTables`

##### loadArray()

> **loadArray**(`rows`, `options?`): `this`

Loads an array of JavaScript objects into the table. Types are inferred for
numbers, bigints, strings, booleans, and Date values. Array and object cells
require an explicit supported type in columnTypes. Types can also be
specified for scalar columns instead of inferred from their values.
Inferred bigints use signed 64-bit `BIGINT`; values outside that range throw
when written instead of wrapping.

JavaScript `Date` values are inferred as DuckDB `TIMESTAMP` values. Their
instant is preserved, but JavaScript `Date` does not retain the timezone or
offset originally used to construct it.

Declare `JSON` for general nested data, `FLOAT[n]` for a fixed-size float
vector, or `GEOMETRY('EPSG:4326')` for GeoJSON geometries in WGS84.

###### Parameters

###### rows

`object`[]

An array of objects, where each object represents a row and its properties represent columns.

###### options?

Options for loading the array, captured when called.

###### columnTypes?

\{\[`key`: `string`\]: `"string"` \| `"number"` \| `"bigint"` \| `"boolean"` \| `"date"` \| `"integer"` \| `"float"` \| `"time"` \| `"datetime"` \| `"datetimeTz"` \| `"double"` \| `"varchar"` \| `"timestamp"` \| `"timestamp with time zone"` \| `"json"` \| `"JSON"` \| `` `float[${number}]` `` \| `` `FLOAT[${number}]` `` \| `"geometry('EPSG:4326')"` \| `"INTEGER"` \| `"BIGINT"` \| `"DOUBLE"` \| `"VARCHAR"` \| `"BOOLEAN"` \| `"DATE"` \| `"TIME"` \| `"TIMESTAMP"` \| `"TIMESTAMP WITH TIME ZONE"` \| `"GEOMETRY('EPSG:4326')"`; \}

Types for specific columns. Required for array and object cells; omitted scalar columns are inferred, and all-null columns default to VARCHAR. Values must be compatible with the selected type without losing information.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Load scalar columns without columnTypes; strings and numbers are inferred.
const data = [
  { letter: "a", number: 1 },
  { letter: "b", number: 2 }
];
await table.loadArray(data).log();
```

```ts
// Choose a numeric type when all-null values provide nothing to infer.
await table.loadArray(
  [{ name: "A", value: null }, { name: "B", value: null }],
  { columnTypes: { value: "DOUBLE" } },
).log();
```

```ts
// Store the Date as a UTC timestamp with JavaScript's millisecond precision.
// The original -04:00 offset is not retained.
await table.loadArray([{
  observedAt: new Date("2024-04-07T13:00:00-04:00"),
}]).log();
```

```ts
// Declare JSON to load nested objects and variable-length arrays directly.
await table.loadArray([{
  name: "Station",
  metadata: { active: true, tags: ["weather", "urban"] },
  measurements: [1, 2.5, null],
}], { columnTypes: { metadata: "JSON", measurements: "JSON" } }).log();
```

```ts
// Declare FLOAT[3] to store each three-element array as a fixed-size vector.
await table.loadArray([{ vector: [1, 2, 3] }], {
  columnTypes: { vector: "FLOAT[3]" },
}).log();
```

```ts
// Declare a geometry type to store WGS84 GeoJSON as a spatial column.
await table.loadArray([{
  name: "Montreal",
  geom: { type: "Point", coordinates: [-73.57, 45.50] },
}], { columnTypes: { geom: "GEOMETRY('EPSG:4326')" } }).log();
```

###### Inherited from

`SimpleTableCore.loadArray`

##### loadData()

> **loadData**(`files`, `options?`): `this`

Loads data from one or more local or remote files into the table.
Supported file formats include CSV, JSON, Parquet, and Excel.

With the default `SimpleDB.expressionSyntax: "js"`, conditions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.

###### Parameters

###### files

`string` \| `string`[]

The path(s) or URL(s) of the file(s) containing the data to be loaded.

###### options?

An optional object with configuration options:

###### allText?

`boolean`

A boolean indicating whether all columns should be treated as text. Applicable to CSV files. Defaults to `false`.

###### autoDetect?

`boolean`

A boolean indicating whether to automatically detect the data format. Defaults to `true`.

###### columns?

`string`[]

An array of column names to load. When provided, only the specified columns are loaded, reducing memory usage and improving load times. Not supported for Excel files — combining `columns` with Excel files throws an error. If an invalid column name is provided, DuckDB will throw its native error. An empty array behaves the same as omitting the option (loads all columns). Defaults to loading all columns.

###### columnTypes?

\{\[`key`: `string`\]: `string`; \}

An object mapping column names to their expected data types. By default, types are inferred. Geometry types are not supported; use loadGeoData() instead.

###### compression?

`"none"` \| `"gzip"` \| `"zstd"`

The compression type of the file. Applicable to CSV files. Defaults to `none`.

###### conditions?

`string`

A SQL `WHERE` clause expression, without the `WHERE` keyword, to filter source rows before applying `limit`. Can reference source columns excluded from `columns`.

###### delim?

`string`

The delimiter used in the file. Applicable to CSV and DSV files. By default, the delimiter is inferred.

###### encoding?

`string`

The encoding of the file. Applicable to CSV files. Defaults to `utf-8`.

###### fileType?

`"json"` \| `"csv"` \| `"parquet"` \| `"dsv"` \| `"excel"`

The type of file to load ("csv", "dsv", "json", "parquet", "excel"). Defaults to being inferred from the file extension.

###### header?

`boolean`

A boolean indicating whether the file has a header row. Applicable to CSV files. Defaults to `true`.

###### ignoreErrors?

`boolean`

If `true`, parsing errors encountered will be ignored, and rows with errors will be skipped. Defaults to `false`.

###### includeFilename?

`boolean`

A boolean indicating whether to include the filename as a new column in the loaded data. Defaults to `false`.

###### jsonFormat?

`"array"` \| `"unstructured"` \| `"newlineDelimited"`

The format of JSON files ("unstructured", "newlineDelimited", "array"). By default, the format is inferred.

###### limit?

`number`

A number indicating the maximum number of matching rows to load, after applying `conditions` if provided. Defaults to all matching rows.

###### nullPadding?

`boolean`

If `true`, when a row has fewer columns than expected, the remaining columns on the right will be padded with `NULL` values. Defaults to `false`.

###### records?

`boolean`

A boolean indicating whether each line in a newline-delimited JSON file represents a record. Applicable to JSON files. By default, it's inferred.

###### sheet?

`string`

A string indicating a specific sheet to import from an Excel file. By default, the first sheet is imported.

###### skip?

`number`

The number of lines to skip at the beginning of the file. Applicable to CSV files. Defaults to `0`.

###### strict?

`boolean`

If `true`, an error will be thrown when encountering any issues. If `false`, structurally incorrect files will be parsed tentatively. Defaults to `true`.

###### unifyColumns?

`boolean`

A boolean indicating whether to unify columns across multiple files when their structures differ. Missing columns will be filled with `NULL` values. Defaults to `false`.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Load data from a single local CSV file
await table.loadData("./some-data.csv").log();
```

```ts
// Load data from a remote Parquet file
await table.loadData("https://some-website.com/some-data.parquet").log();
```

```ts
// Load data from multiple local JSON files
await table.loadData([
  "./some-data1.json",
  "./some-data2.json",
  "./some-data3.json"
]).log();
```

```ts
// Load multiple CSV files and unify columns that differ between files
await table.loadData("./data/*.csv", { unifyColumns: true }).log();
```

```ts
// Keep the source filename when loading multiple files
await table
  .loadData("./data/*.csv", { includeFilename: true })
  .log();
```

```ts
// Load only specific columns from a CSV file
await table.loadData("./employees.csv", { columns: ["name", "salary"] }).log();
```

```ts
// Load up to 100 matching employees, keeping only their names
await table
  .loadData("./employees.parquet", {
    conditions: "salary > 100000",
    columns: ["name"],
    limit: 100,
  })
  .log();
```

###### Inherited from

`SimpleTableCore.loadData`

##### loadSample()

> **loadSample**(`sample`): `this`

Fetches sample data from the simple-data-analysis-core GitHub repository.

###### Parameters

###### sample

`"fires"` \| `"recipes"` \| `"temperatures"` \| `"temperaturesCities"` \| `"canada"` \| `"firesGeo"`

The name of the sample to load.

Tabular data:
- "fires": [firesCanada2023.csv](https://raw.githubusercontent.com/nshiab/simple-data-analysis-core/refs/heads/main/test/geodata/files/firesCanada2023.csv)
- "recipes": [recipes.parquet](https://github.com/nshiab/simple-data-analysis-core/raw/refs/heads/main/test/data/files/recipes.parquet)
- "temperatures": [dailyTemperatures.csv](https://raw.githubusercontent.com/nshiab/simple-data-analysis-core/refs/heads/main/test/data/files/dailyTemperatures.csv)
- "temperaturesCities": [cities.csv](https://raw.githubusercontent.com/nshiab/simple-data-analysis-core/refs/heads/main/test/data/files/cities.csv)

Geospatial data:
- "canada": [CanadianProvincesAndTerritories.json](https://raw.githubusercontent.com/nshiab/simple-data-analysis-core/refs/heads/main/test/geodata/files/CanadianProvincesAndTerritories.json)
- "firesGeo": [firesCanada2023.geojson](https://raw.githubusercontent.com/nshiab/simple-data-analysis-core/refs/heads/main/test/geodata/files/firesCanada2023.geojson)

###### Returns

`this`

###### Example

```ts
// Load the fires sample data
await table.loadSample("fires").log();
```

###### Inherited from

`SimpleTableCore.loadSample`

##### loadStatCanData()

> **loadStatCanData**(`pid`, `options?`): `this`

Downloads a complete Statistics Canada table and loads it into this table.

Results are cached as Parquet files in `.sda-cache/statcan` by default.
Cached data does not expire unless a TTL is provided.

###### Parameters

###### pid

`string`

The Statistics Canada Product ID. Eight-digit PIDs, ten-digit view PIDs, and hyphenated table identifiers are accepted.

###### options?

Optional retrieval and cache settings.

###### cache?

`boolean`

Whether to read and write the cache. Defaults to `true`.

###### lang?

`"en"` \| `"fr"`

The language of the table data. Defaults to `"en"`.

###### ttl?

`number`

Cache lifetime in seconds. Omit for no expiration, use `0` to refresh the matching cache entry immediately, or provide a positive value to refresh once the entry reaches that age.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
await sdb
  .newTable("population")
  .loadStatCanData("17-10-0005-01")
  .filter("GEO = 'Canada'")
  .log();
```

```ts
// Refresh French data when the cached table is at least one day old.
await table
  .loadStatCanData("17-10-0005", {
    lang: "fr",
    ttl: 24 * 60 * 60,
  })
  .log();
```

###### Inherited from

`SimpleTableCore.loadStatCanData`

##### loadYahooFinanceData()

> **loadYahooFinanceData**(`symbol`, `startDate`, `endDate`, `interval`): `this`

Downloads historical market data from Yahoo Finance and loads it into this
table as `datetime`, `open`, `high`, `low`, `close`, `adjustedClose`, and
`volume` columns. `datetime` contains Yahoo's timestamps as JavaScript
`Date` values. Unavailable values are preserved as `null`.

All range boundaries are evaluated in UTC. Use ISO date-time strings ending
in `Z`. Yahoo trading sessions may occur on a different UTC date from their
exchange-local date, so choose the range appropriate for the market and
interval. Avoid numeric constructors such as `new Date(2025, 2, 15)`, which
use the runtime's local timezone.

This method uses an undocumented Yahoo Finance endpoint and is not
affiliated with or endorsed by Yahoo. It is provided for educational,
research, and journalistic purposes. Before using it, review Yahoo's terms
and any applicable data-provider restrictions.

###### Parameters

###### symbol

`string`

The stock or index symbol, such as `"AAPL"` or `"^GSPTSE"`.

###### startDate

`Date`

The inclusive UTC start of the requested range.

###### endDate

`Date`

The inclusive UTC end of the requested range. The UTC day,
hour, or minute containing this instant is included, according to
`interval`.

###### interval

`"1d"` \| `"1h"` \| `"1m"`

The interval between observations: daily, hourly, or every
minute.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Request daily observations using explicit UTC boundaries.
await table
  .loadYahooFinanceData(
    "^GSPTSE",
    new Date("2025-03-01T00:00:00Z"),
    new Date("2025-03-15T00:00:00Z"),
    "1d",
  )
  .log();
```

```ts
// Include the UTC hours from 13:00 through 16:00.
await table
  .loadYahooFinanceData(
    "AAPL",
    new Date("2025-03-14T13:00:00Z"),
    new Date("2025-03-14T16:00:00Z"),
    "1h",
  )
  .log();
```

###### Throws

If either date is invalid or `endDate` is before `startDate`.

###### Throws

If Yahoo rejects the request or returns no data.

###### See

 - https://legal.yahoo.com/us/en/yahoo/terms/otos/index.html
 - https://help.yahoo.com/kb/finance/SLN2310.html

###### Inherited from

`SimpleTableCore.loadYahooFinanceData`

#### Loading Data

##### loadBucket()

> **loadBucket**(`source`, `options?`): `this`

Downloads a file from Google Cloud Storage and loads it into the table.
Supported sources are `.csv`, `.csv.gz`, `.json`, `.json.gz`, `.parquet`,
`.geojson`, `.geoparquet`, and `.shp.zip`.

This method uses the `downloadFromBucket` function from the
[journalism-google library](https://github.com/nshiab/journalism-google/tree/v2.0.0/docs).
Set `BUCKET_PROJECT` and `BUCKET_NAME` in your `.env` file, or pass
`project` and `bucket`.
Authentication uses Google Application Default Credentials. To load
credentials from a specific JSON file, set `GOOGLE_APPLICATION_CREDENTIALS`
in your `.env` file to that file's path.

The download and load are queued and run in chain order at the next awaited
observer or `run()` call.

###### Parameters

###### source

`string`

The path and filename of the object within the bucket.

###### options?

Download options.

###### bucket?

`string`

The Google Cloud Storage bucket name. Defaults to `BUCKET_NAME`.

###### project?

`string`

The Google Cloud project ID. Defaults to `BUCKET_PROJECT`.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Set BUCKET_PROJECT and BUCKET_NAME in .env, and configure Google Application Default Credentials.
await sdb
  .newTable("results")
  .loadBucket("exports/results.parquet")
  .filter("value > 0")
  .log();
```

```ts
await sdb
  .newTable("districts")
  .loadBucket("maps/districts.shp.zip", {
    project: "my-project",
    bucket: "my-bucket",
  })
  .log();
```

##### loadDatawrapper()

> **loadDatawrapper**(`chartId`, `options?`): `this`

Loads data from a Datawrapper chart or table into the table.

Environment variables are named configuration values supplied to the running process. By default, this method reads the API key from `DATAWRAPPER_KEY` (for example, `"your-datawrapper-api-key"`).
The download is queued and runs in chain order at the next awaited observer or `run()` call.

###### Parameters

###### chartId

`string`

The unique ID of the Datawrapper chart or table. This ID can be found in the Datawrapper URL or dashboard.

###### options?

An optional object with configuration options:

###### apiKeyEnvVar?

`string`

A custom environment-variable name from which to read the Datawrapper API key. Defaults to `"DATAWRAPPER_KEY"`.

###### Returns

`this`

The table, so methods can be chained.

###### Example

```ts
// Set DATAWRAPPER_KEY=your-datawrapper-api-key before running.
// Load data from a Datawrapper chart
const chartData = await sdb
  .newTable("chartData")
  .loadDatawrapper("myChartId")
  .log();
```

##### loadGeoDatawrapper()

> **loadGeoDatawrapper**(`chartId`, `options?`): `this`

Loads geospatial data from a Datawrapper map into the table.

Environment variables are named configuration values supplied to the running process. By default, this method reads the API key from `DATAWRAPPER_KEY` (for example, `"your-datawrapper-api-key"`).

The data is temporarily written to `.sda-cache/tmp/dataviz/<uuid>.geojson` and removed after loading. Remember to add `.sda-cache` to your `.gitignore`.
The download is queued and runs in chain order at the next awaited observer or `run()` call.

###### Parameters

###### chartId

`string`

The unique ID of the Datawrapper map. This ID can be found in the Datawrapper URL or dashboard.

###### options?

An optional object with configuration options:

###### apiKeyEnvVar?

`string`

A custom environment-variable name from which to read the Datawrapper API key. Defaults to `"DATAWRAPPER_KEY"`.

###### Returns

`this`

The table, so methods can be chained.

###### Example

```ts
// Set DATAWRAPPER_KEY=your-datawrapper-api-key before running.
// Load geo data from a Datawrapper map
const mapData = await sdb
  .newTable("mapData")
  .loadGeoDatawrapper("myMapId")
  .log();
```

##### loadSheet()

> **loadSheet**(`sheetUrl`, `options?`): `this`

Loads data from a Google Sheet into the table.
This method uses the `getSheetData` function from the [journalism-google library](https://github.com/nshiab/journalism-google/blob/v2.0.0/docs/functions/getSheetData.md). Refer to its documentation for more details.

Environment variables are named configuration values supplied to the running process. By default, this method reads `GOOGLE_SERVICE_ACCOUNT_EMAIL` (for example, `"service-account@example.iam.gserviceaccount.com"`) with `GOOGLE_PRIVATE_KEY` (for example, `"-----BEGIN PRIVATE KEY-----\n..."`). Alternatively, set `GOOGLE_APPLICATION_CREDENTIALS` to a service-account JSON path (for example, `"./service-account.json"`).
The download is queued and runs in chain order at the next awaited observer or `run()` call.

###### Parameters

###### sheetUrl

`string`

The URL pointing to a specific Google Sheet (e.g., `"https://docs.google.com/spreadsheets/d/.../edit#gid=0"`).

###### options?

An optional object with configuration options:

###### apiEmailEnvVar?

`string`

A custom environment-variable name from which to read the Google service-account email. Defaults to `"GOOGLE_SERVICE_ACCOUNT_EMAIL"`.

###### apiKeyEnvVar?

`string`

A custom environment-variable name from which to read the Google service-account private key. Defaults to `"GOOGLE_PRIVATE_KEY"`.

###### skip?

`number`

The number of rows to skip from the top of the sheet before reading data. Useful when the sheet contains metadata or headers that should not be included in the data.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Set these environment variables before running:
// GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@example.iam.gserviceaccount.com
// GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...
// Load data from a Google Sheet
const sheetData = await sdb
  .newTable("sheetData")
  .loadSheet("https://docs.google.com/spreadsheets/d/.../edit#gid=0")
  .log();
```

```ts
// Load data from a Google Sheet, skipping the first 2 rows (e.g., to skip a prepended message and timestamp)
const sheetData = await table
  .loadSheet("https://docs.google.com/spreadsheets/d/.../edit#gid=0", {
    skip: 2,
  })
  .log();
```

#### Logging

##### log()

> **log**(`options?`): `Promise`\<[`SimpleTable`](#simpletable)\>

Logs up to a specified number of rows from the table to the console. By default, the first 10 rows are logged.
You can optionally log the column types and filter the data based on conditions.
The footer reports the total number of matching rows and, only when some rows
are omitted, the number actually shown (for example, `100 rows in total / showing 15 rows`).
SQL dates and timestamps retain their native precision for display, including
temporal infinities. Lists and objects are stringified using the same nested
representations as `getData()`, then truncated according to `charsToLog`.
Unsafe top-level large integers throw, just as with `getData()`.
Type annotations describe the SQL type and the JavaScript extraction type
before display formatting; nulls do not determine the column's annotation.
Colors reflect the SQL value's meaning, so exact decimal strings use numeric
coloring. Column width is independent of the content truncation budget.

With the default `SimpleDB.expressionSyntax: "js"`, conditions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.

###### Parameters

###### options?

`number` \| `"all"` \| \{ `conditions?`: `string`; `count?`: `number` \| `"all"`; `types?`: `boolean`; \}

Either the number of rows to log (a specific number or `"all"`) or an object with configuration options:

`number`

***

`"all"`

***

###### Type Literal

\{ `conditions?`: `string`; `count?`: `number` \| `"all"`; `types?`: `boolean`; \}

Either the number of rows to log (a specific number or `"all"`) or an object with configuration options:

###### conditions?

`string`

A SQL `WHERE` clause condition to filter the data before logging. Defaults to no condition.

###### count?

`number` \| `"all"`

The maximum number of rows to log. Defaults to 10 or the value set in the SimpleDB instance. Use `"all"` to log all rows.

###### types?

`boolean`

Whether to log the column types along with the data. Defaults to the value set in the SimpleDB instance.

###### Returns

`Promise`\<[`SimpleTable`](#simpletable)\>

A promise that resolves to the table, so methods can be chained.

###### Examples

```ts
// Log the first 10 rows (default behavior)
await table.log();
```

```ts
// Log the first 50 rows
await table.log(50);
```

```ts
// Log all rows
await table.log("all");
```

```ts
// Log the first 20 rows and include column types
await table.log({ count: 20, types: true });
```

```ts
// Log rows where 'status' is 'active' (using JS syntax for conditions)
await table.log({ conditions: `status === 'active'` });
```

###### Inherited from

`SimpleTableCore.log`

##### logBottom()

> **logBottom**(`count?`, `options?`): `Promise`\<[`SimpleTable`](#simpletable)\>

Logs the bottom `n` rows of the table to the console. By default, the last row will be returned first. To preserve the original order, use the `originalOrder` option.

Uses the same precision-preserving temporal display, nested stringification,
numeric coloring, and `charsToLog` truncation as `log()`. Unsafe top-level
large integers throw, just as with `getData()`.

###### Parameters

###### count?

`number`

The number of rows to log from the bottom of the table. Defaults to the table's `rowsToLog` option if not specified.

###### options?

An optional object with logging preferences.

###### originalOrder?

`boolean`

If true, the rows are displayed in their original order (top to bottom). Defaults to false.

###### Returns

`Promise`\<[`SimpleTable`](#simpletable)\>

A promise that resolves to the table, so methods can be chained.

###### Examples

```ts
// Log bottom rows with default count (uses table's rowsToLog option)
await table.logBottom();
```

```ts
// Log the last 10 rows (displayed with last row first)
await table.logBottom(10);
```

```ts
// Log the last 5 rows in original order (top to bottom)
await table.logBottom(5, { originalOrder: true });
```

###### Inherited from

`SimpleTableCore.logBottom`

##### logColumns()

> **logColumns**(`options?`): `Promise`\<[`SimpleTable`](#simpletable)\>

Logs the columns in the table to the console. You can optionally include their data types.

###### Parameters

###### options?

An optional object with configuration options:

###### types?

`boolean`

If `true`, logs the column names along with their data types. Defaults to `false`.

###### Returns

`Promise`\<[`SimpleTable`](#simpletable)\>

A promise that resolves to the SimpleTable instance after logging the columns.

###### Examples

```ts
// Log only the column names
await table.logColumns();
```

```ts
// Log column names along with their types
await table.logColumns({ types: true });
```

###### Inherited from

`SimpleTableCore.logColumns`

##### logDescription()

> **logDescription**(): `Promise`\<[`SimpleTable`](#simpletable)\>

Logs descriptive information about the columns in the table to the console. This includes details such as data types, number of null values, and number of distinct values for each column.
It internally calls the `getDescription` method to retrieve the descriptive statistics.

###### Returns

`Promise`\<[`SimpleTable`](#simpletable)\>

A promise that resolves to the table, so methods can be chained.

###### Example

```ts
// Log descriptive information for all columns in the table
await table.logDescription();
```

###### Inherited from

`SimpleTableCore.logDescription`

##### logExtent()

> **logExtent**(`column`): `Promise`\<[`SimpleTable`](#simpletable)\>

Logs the extent (minimum and maximum values) of a numeric column to the console.

###### Parameters

###### column

`string`

The name of the numeric column for which to log the extent.

###### Returns

`Promise`\<[`SimpleTable`](#simpletable)\>

A promise that resolves to the table, so methods can be chained.

###### Example

```ts
// Log the extent of the 'price' column
await table.logExtent("price");
```

###### Inherited from

`SimpleTableCore.logExtent`

##### logProjections()

> **logProjections**(): `Promise`\<[`SimpleTable`](#simpletable)\>

Logs the projections of the geospatial data (if any) to the console.

###### Returns

`Promise`\<[`SimpleTable`](#simpletable)\>

A promise that resolves to the SimpleTable instance after logging the projections.

###### Example

```ts
// Log the geospatial projections of the table
await table.logProjections();
```

###### Inherited from

`SimpleTableCore.logProjections`

##### logRowCount()

> **logRowCount**(): `Promise`\<[`SimpleTable`](#simpletable)\>

Logs the total number of rows in the table to the console.

###### Returns

`Promise`\<[`SimpleTable`](#simpletable)\>

A promise that resolves to the SimpleTable instance after logging the row count.

###### Example

```ts
// Log the total number of rows in the table
await table.logRowCount();
```

###### Inherited from

`SimpleTableCore.logRowCount`

##### logTypes()

> **logTypes**(): `Promise`\<[`SimpleTable`](#simpletable)\>

Logs the types of all columns in the table to the console.

###### Returns

`Promise`\<[`SimpleTable`](#simpletable)\>

A promise that resolves to the SimpleTable instance after logging the column types.

###### Example

```ts
// Log the data types of all columns in the table
await table.logTypes();
```

###### Inherited from

`SimpleTableCore.logTypes`

##### logUniques()

> **logUniques**(`column`, `options?`): `Promise`\<[`SimpleTable`](#simpletable)\>

Logs unique values for a specified column to the console. By default, a maximum of 100 values are logged (depending on your runtime).
You can optionally stringify the values to see them all.

###### Parameters

###### column

`string`

The name of the column from which to retrieve and log unique values.

###### options?

An optional object with configuration options:

###### stringify?

`boolean`

If `true`, converts the unique values to a JSON string before logging. Defaults to `false`.

###### Returns

`Promise`\<[`SimpleTable`](#simpletable)\>

A promise that resolves to the SimpleTable instance after logging the unique values.

###### Examples

```ts
// Logs unique values for the column "name"
await table.logUniques("name");
```

```ts
// Logs unique values for the column "name" and stringifies them
await table.logUniques("name", { stringify: true });
```

###### Inherited from

`SimpleTableCore.logUniques`

#### Other

##### charsToLog

> **charsToLog**: `number` \| `undefined`

The maximum number of characters to display for text and stringified nested cells, including the truncation marker. This does not control column width. Set to Infinity to show the entire text.

###### Example

```ts
const sdb = new SimpleDB({ charsToLog: 150 });
await sdb.newTable().loadArray([{ text: "x".repeat(200) }]).log();
```

###### Default Value

`75`

###### Inherited from

`SimpleTableCore.charsToLog`

##### connection

> **connection**: `DuckDBConnection`

A connection to a DuckDB database.

###### Inherited from

`SimpleTableCore.connection`

##### db

> **db**: `DuckDBInstance`

A DuckDB database instance.

###### Inherited from

`SimpleTableCore.db`

##### defaultTableName

> **defaultTableName**: `boolean`

A flag indicating if the table name was assigned by default.

###### Default Value

`false`

###### Inherited from

`SimpleTableCore.defaultTableName`

##### rowsToLog

> **rowsToLog**: `number`

The number of rows to display when logging a table.

###### Default Value

`10`

###### Inherited from

`SimpleTableCore.rowsToLog`

##### runQuery

> **runQuery**: (`query`, `connection`, `returnData`, `options`) => `Promise`\<`object`[] \| `null`\>

A function for running SQL queries. Subclasses can wrap this seam to observe
execution while forwarding every argument. To run custom SQL, use
`SimpleDB.customQuery()` instead.

###### Parameters

###### query

`string`

The exact SQL statement to execute.

###### connection

`DuckDBConnection`

The DuckDB connection that executes the statement.

###### returnData

`boolean`

Whether to convert and return result rows.

###### options

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

###### Returns

`Promise`\<`object`[] \| `null`\>

The converted rows when requested, otherwise `null`.

###### Example

```ts
const original = table.runQuery;
table.runQuery = (query, connection, returnData, options) => {
  console.log(query);
  return original(query, connection, returnData, options);
};
```

###### Inherited from

`SimpleTableCore.runQuery`

##### typesToLog

> **typesToLog**: `boolean`

A flag indicating whether to include data types when logging a table.

###### Default Value

`false`

###### Inherited from

`SimpleTableCore.typesToLog`

##### randomPoint()

> **randomPoint**(`newColumn`, `tries`, `options?`): `this`

Generates a random point within the geometries of a specified column.

###### Parameters

###### newColumn

`string`

The name of the new column where the random points will be stored.

###### tries

`number`

The number of points to generate within the bounding box of each geometry to find one that is within the geometry itself.

###### options?

An optional object with configuration options:

###### column?

`string`

The name of the column storing the geometries within which the random points will be generated. If omitted, the method will automatically attempt to find a geometry column.

###### strict?

`boolean`

If `false`, the method will not throw an error if some points cannot be generated. Corresponding rows will have `NULL` in the new column. Defaults to `true`.

###### Returns

`this`

###### Examples

```ts
// Generate a random point for each geometry in the default column, trying 100 points
await table.randomPoint("randomPoint", 100).log();
```

```ts
// Generate a random point for each geometry in a specific column named 'areaGeom', trying 50 points
await table.randomPoint("pointInArea", 50, { column: "areaGeom" }).log();
```

```ts
// Generate a random point for each geometry, but don't throw if some points cannot be generated
await table.randomPoint("pointInArea", 1, { strict: false }).log();
```

###### Inherited from

`SimpleTableCore.randomPoint`

#### Properties

##### indexes

> **indexes**: (\{ `column`: `string`; `kind`: `"vss"`; `name`: `string`; `options`: \{ `efConstruction?`: `number`; `efSearch?`: `number`; `M?`: `number`; \}; \} \| \{ `idColumn`: `string`; `kind`: `"fts"`; `name`: `string`; `options`: \{ `ignore?`: `string`; `lower?`: `boolean`; `stemmer?`: `string`; `stopwords?`: `string`; `stripAccents?`: `boolean`; \}; `textColumn`: `string`; \})[]

The definitions of the indexes belonging to the table, if any. Do not
mutate this array directly.

###### Example

```ts
console.log(table.indexes);
// [{ kind: "vss", name: "vss_cosine_index_articles", ... }]
```

###### Default Value

`[]`

###### Inherited from

`SimpleTableCore.indexes`

##### name

###### Get Signature

> **get** **name**(): `string`

Name of the table in the database.

###### Example

```ts
console.log(table.name); // e.g., "employees"
```

###### Returns

`string`

###### Inherited from

`SimpleTableCore.name`

#### Restructuring Data

##### longer()

> **longer**(`columns`, `namesTo`, `valuesTo`): `this`

Restructures this table by stacking (unpivoting) columns. This is useful for tidying up data from a wide format to a long format.

For example, given a table showing employee counts per department per year:

| Department | 2021 | 2022 | 2023 |
| :--------- | :--- | :--- | :--- |
| Accounting | 10   | 9    | 15   |
| Sales      | 52   | 75   | 98   |

We can restructure it by putting all year columns into a new column named `Year` and their corresponding employee counts into a new column named `Employees`.

###### Parameters

###### columns

`string`[]

An array of strings representing the names of the columns to be stacked (unpivoted).

###### namesTo

`string`

The name of the new column that will contain the original column names (e.g., "Year").

###### valuesTo

`string`

The name of the new column that will contain the values from the stacked columns (e.g., "Employees").

###### Returns

`this`

The table, so methods can be chained.

###### Example

```ts
// Restructure the table by stacking year columns into 'year' and 'employees'
await table.longer(["2021", "2022", "2023"], "year", "employees").log();
```

The table will then look like this:

| Department | Year | Employees |
| :--------- | :--- | :-------- |
| Accounting | 2021 | 10        |
| Accounting | 2022 | 9         |
| Accounting | 2023 | 15        |
| Sales      | 2021 | 52        |
| Sales      | 2022 | 75        |
| Sales      | 2023 | 98        |

###### Inherited from

`SimpleTableCore.longer`

##### sort()

> **sort**(`order?`, `options?`): `this`

Sorts the rows of the table based on specified column(s) and order(s).
If no columns are specified, all columns are sorted from left to right in ascending order.

Order-preserving transformations after a sort retain that order. Operations such as joins, grouping, aggregation, and sampling do not guarantee input order; chain `sort()` after them when deterministic output order matters.

###### Parameters

###### order?

\{\[`key`: `string`\]: `"desc"` \| `"asc"`; \} \| `null`

An object mapping column names to their sorting order: `"asc"` for ascending or `"desc"` for descending. If `null`, all columns are sorted ascendingly.

###### options?

An optional object with configuration options:

###### lang?

\{\[`key`: `string`\]: `string`; \}

An object mapping column names to language codes for collation (e.g., `{ column1: "fr" }`). See DuckDB Collations documentation for more details: https://duckdb.org/docs/sql/expressions/collations.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Sort all columns from left to right in ascending order
await table.sort().log();
```

```ts
// Sort 'column1' in ascending order
await table.sort({ column1: "asc" }).log();
```

```ts
// Sort 'column1' ascendingly, then 'column2' descendingly
await table.sort({ column1: "asc", column2: "desc" }).log();
```

```ts
// Sort 'column1' considering French accents
await table.sort({ column1: "asc" }, { lang: { column1: "fr" } }).log();
```

###### Inherited from

`SimpleTableCore.sort`

##### wider()

> **wider**(`namesFrom`, `valuesFrom`, `options?`): `this`

Restructures this table by unstacking (pivoting) values, transforming data from a long format to a wide format.

For example, given a table showing employee counts per department per year:

| Department | Year | Employees |
| :--------- | :--- | :-------- |
| Accounting | 2021 | 10        |
| Accounting | 2022 | 9         |
| Accounting | 2023 | 15        |
| Sales      | 2021 | 52        |
| Sales      | 2022 | 75        |
| Sales      | 2023 | 98        |

We can restructure it by creating new columns for each year, with the associated employee counts as values.

###### Parameters

###### namesFrom

`string`

The name of the column containing the values that will be transformed into new column headers (e.g., "Year").

###### valuesFrom

`string`

The name of the column containing the values to be spread across the new columns (e.g., "Employees").

###### options?

An optional object with configuration options:

###### stat?

`"min"` \| `"max"` \| `"mean"` \| `"median"` \| `"sum"` \| `"count"` \| `"first"`

The stat function applied when multiple rows share the same `namesFrom`/grouping combination: `"sum"`, `"count"`, `"min"`, `"max"`, `"mean"`, `"median"`, or `"first"`. Defaults to `"sum"`.

###### Returns

`this`

The table, so methods can be chained.

###### Example

```ts
// Restructure the table by pivoting 'Year' into new columns with 'Employees' as values
await table.wider("Year", "Employees").log();
```

The table will then look like this:

| Department | 2021 | 2022 | 2023 |
| :--------- | :--- | :--- | :--- |
| Accounting | 10   | 9    | 15   |
| Sales      | 52   | 75   | 98   |

When multiple rows share the same `namesFrom`/grouping combination, their `valuesFrom` values are combined with the `options.stat` function (`"sum"` by default).

###### Inherited from

`SimpleTableCore.wider`

#### Selecting or Filtering Data

##### filter()

> **filter**(`conditions`): `this`

Filters rows from this table based on SQL conditions. Note that it's often faster to use the `removeRows` method for simple removals.
With the default `SimpleDB.expressionSyntax: "js"`, conditions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.

###### Parameters

###### conditions

`string`

The filtering conditions specified as a SQL `WHERE` clause (e.g., `"column1 > 10 AND column2 = 'value'"`).

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Keep only rows where the 'fruit' column is not 'apple'
await table.filter(`fruit != 'apple'`).log();
```

```ts
// Keep rows where 'price' is greater than 100 AND 'quantity' is greater than 0
await table.filter(`price > 100 && quantity > 0`).log(); // Using JS syntax
```

```ts
// Keep rows where 'category' is 'Electronics' OR 'Appliances'
await table.filter(`category === 'Electronics' || category === 'Appliances'`).log(); // Using JS syntax
```

```ts
// Keep rows where 'lastPurchaseDate' is on or after '2023-01-01'
await table.filter(`lastPurchaseDate >= '2023-01-01'`).log();
```

###### Inherited from

`SimpleTableCore.filter`

##### keepValues()

> **keepValues**(`columnsAndValues`): `this`

Keeps rows in this table that have specific values in specified columns, removing all other rows.

###### Parameters

###### columnsAndValues

\{\[`key`: `string`\]: `unknown`; \}

An object where keys are column names and values are the specific values (or an array of values) to keep in those columns. Use `null` to keep rows where a column is `NULL`.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Keep only rows where 'job' is 'accountant' or 'developer', AND 'city' is 'Montreal'
await table.keepValues({ job: ["accountant", "developer"], city: "Montreal" }).log();
```

```ts
// Keep only rows where 'status' is 'active'
await table.keepValues({ status: "active" }).log();
```

```ts
// Keep only rows where 'status' is NULL
await table.keepValues({ status: null }).log();
```

###### Inherited from

`SimpleTableCore.keepValues`

##### removeDuplicates()

> **removeDuplicates**(`options?`): `this`

Removes duplicate rows from this table, keeping only unique rows.
Note that the resulting data order might differ from the original.

###### Parameters

###### options?

An optional object with configuration options:

###### on?

`string` \| `string`[]

A column name or an array of column names to consider when identifying duplicates. If specified, duplicates are determined based only on the values in these columns. If omitted, all columns are considered.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Remove duplicate rows based on all columns
await table.removeDuplicates().log();
```

```ts
// Remove duplicate rows based only on the 'email' column
await table.removeDuplicates({ on: "email" }).log();
```

```ts
// Remove duplicate rows based on 'firstName' and 'lastName' columns
await table.removeDuplicates({ on: ["firstName", "lastName"] }).log();
```

###### Inherited from

`SimpleTableCore.removeDuplicates`

##### removeMissing()

> **removeMissing**(`options?`): `this`

Removes rows with missing values from this table.
By default, missing values include SQL `NULL`, as well as string representations like `"NULL"`, `"null"`, `"NaN"`, `"undefined"`, and empty strings `""`.

###### Parameters

###### options?

An optional object with configuration options:

###### columns?

`string` \| `string`[]

A string or an array of strings specifying the columns to consider for missing values. If omitted, all columns are considered.

###### invert?

`boolean`

A boolean indicating whether to invert the condition. If `true`, only rows containing missing values will be kept. Defaults to `false`.

###### missingValues?

(`string` \| `number`)[]

An array of values to be treated as missing values instead of the default ones. Defaults to `["undefined", "NaN", "null", "NULL", ""]`.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Remove rows with missing values in any column
await table.removeMissing().log();
```

```ts
// Remove rows with missing values only in 'firstName' or 'lastName' columns
await table.removeMissing({ columns: ["firstName", "lastName"] }).log();
```

```ts
// Keep only rows with missing values in any column
await table.removeMissing({ invert: true }).log();
```

```ts
// Remove rows where 'age' is missing or is equal to -1
await table.removeMissing({ columns: "age", missingValues: [-1] }).log();
```

###### Inherited from

`SimpleTableCore.removeMissing`

##### removeRows()

> **removeRows**(`conditions`): `this`

Removes rows from this table based on SQL conditions. This method is similar to `filter()`, but removes rows instead of keeping them.
With the default `SimpleDB.expressionSyntax: "js"`, conditions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.

###### Parameters

###### conditions

`string`

The filtering conditions specified as a SQL `WHERE` clause (e.g., `"fruit = 'apple'"`).

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Remove rows where the 'fruit' column is 'apple'
await table.removeRows(`fruit = 'apple'`).log();
```

```ts
// Remove rows where 'quantity' is less than 5
await table.removeRows(`quantity < 5`).log();
```

```ts
// Remove rows where 'price' is less than 100 AND 'quantity' is 0
await table.removeRows(`price < 100 && quantity === 0`).log(); // Using JS syntax
```

```ts
// Remove rows where 'category' is 'Electronics' OR 'Appliances'
await table.removeRows(`category === 'Electronics' || category === 'Appliances'`).log(); // Using JS syntax
```

###### Inherited from

`SimpleTableCore.removeRows`

##### removeValues()

> **removeValues**(`columnsAndValues`): `this`

Removes rows from this table that have specific values in specified columns.

###### Parameters

###### columnsAndValues

\{\[`key`: `string`\]: `unknown`; \}

An object where keys are column names and values are the specific values (or an array of values) to remove from those columns. Use `null` to remove rows where a column is `NULL`; otherwise, `NULL` rows are retained.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Remove rows where 'job' is 'accountant' or 'developer', AND 'city' is 'Montreal'
await table.removeValues({ job: ["accountant", "developer"], city: "Montreal" }).log();
```

```ts
// Remove rows where 'status' is 'inactive'
await table.removeValues({ status: "inactive" }).log();
```

```ts
// Remove rows where 'status' is NULL
await table.removeValues({ status: null }).log();
```

###### Inherited from

`SimpleTableCore.removeValues`

##### sample()

> **sample**(`count`, `options?`): `this`

Selects random rows from the table, removing all others. You can optionally specify a seed to ensure repeatable sampling.

###### Parameters

###### count

`string` \| `number`

The number of rows to select (e.g., `100`) or a percentage string (e.g., `"10%"`) specifying the sampling size.

###### options?

An optional object with configuration options:

###### seed?

`number`

A number specifying the seed for repeatable sampling. Using the same seed will always yield the same random rows. Defaults to a random seed.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Select 100 random rows from the table
await table.sample(100).log();
```

```ts
// Select 10% of the rows randomly
await table.sample("10%").log();
```

```ts
// Select random rows with a specific seed for repeatable results
await table.sample("10%", { seed: 123 }).log();
```

###### Inherited from

`SimpleTableCore.sample`

##### selectColumns()

> **selectColumns**(`columns`): `this`

Selects specific columns in the table, removing all others.

###### Parameters

###### columns

`string` \| `string`[]

The name or an array of names of the columns to be selected.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Select only the 'firstName' and 'lastName' columns, removing all other columns.
await table.selectColumns(["firstName", "lastName"]).log();
```

```ts
// Select only the 'productName' column.
await table.selectColumns("productName").log();
```

###### Inherited from

`SimpleTableCore.selectColumns`

##### selectRows()

> **selectRows**(`count`, `options?`): `this`

Selects a specified number of rows from this table. An offset can be applied to skip initial rows, and the results can be output to a new table.

###### Parameters

###### count

`string` \| `number`

The number of rows to select.

###### options?

An optional object with configuration options:

###### offset?

`number`

The number of rows to skip from the beginning of the table before selecting. Defaults to `0`.

###### outputTable?

`string` \| `boolean`

If `true`, the selected rows will be stored in a new table with a generated name. If a string, it will be used as the name for the new table. If `false` or omitted, the current table will be modified. Defaults to `false`.

###### Returns

`this`

A table instance containing the selected rows (either the current table or a new table), so methods can be chained.

###### Examples

```ts
// Select the first 100 rows of the current table
await table.selectRows(100).log();
```

```ts
// Select 100 rows after skipping the first 50 rows
await table.selectRows(100, { offset: 50 }).log();
```

```ts
// Select 50 rows and store them in a new table with a generated name
const newTable = await table.selectRows(50, { outputTable: true }).log();
```

```ts
// Select 75 rows and store them in a new table named "top_customers"
const topCustomersTable = await table.selectRows(75, { outputTable: "top_customers" }).log();
```

###### Inherited from

`SimpleTableCore.selectRows`

##### skip()

> **skip**(`count`): `this`

Skips the first `n` rows of the table, effectively removing them.

###### Parameters

###### count

`number`

The number of rows to skip from the beginning of the table.

###### Returns

`this`

The table, so methods can be chained.

###### Example

```ts
// Skip the first 10 rows of the table
await table.skip(10).log();
```

###### Inherited from

`SimpleTableCore.skip`

#### Table Management

##### clone()

> **clone**(`nameOrOptions?`): `this`

Returns a new table with the same structure and data as this table. The data can be optionally filtered, limited to a specific number of rows, and offset.
With the default `SimpleDB.expressionSyntax: "js"`, conditions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.

If `conditions`, `limit`, and `offset` are all used, they are applied in this order: `conditions` (WHERE clause) first, then `offset`, and finally `limit` (LIMIT).

Note that cloning large tables can be a slow operation.

###### Parameters

###### nameOrOptions?

`string` \| \{ `columns?`: `string` \| `string`[]; `conditions?`: `string`; `limit?`: `number`; `name?`: `string`; `offset?`: `number`; \}

Either a string specifying the name of the new table, or an optional object with configuration options. If not provided, a default name (e.g., "table1", "table2") will be generated.

`string`

***

###### Type Literal

\{ `columns?`: `string` \| `string`[]; `conditions?`: `string`; `limit?`: `number`; `name?`: `string`; `offset?`: `number`; \}

Either a string specifying the name of the new table, or an optional object with configuration options. If not provided, a default name (e.g., "table1", "table2") will be generated.

###### columns?

`string` \| `string`[]

An array of column names to include in the cloned table. If not provided, all columns will be included.

###### conditions?

`string`

A SQL `WHERE` clause condition to filter the data during cloning. Defaults to no condition (clones all rows).

###### limit?

`number`

The number of rows to include in the cloned table. If provided, only the first X rows (potentially after filtering and offset) will be cloned.

###### name?

`string`

The name of the new table to be created in the database. If not provided, a default name (e.g., "table1", "table2") will be generated.

###### offset?

`number`

The number of rows to skip before starting to clone rows.

###### Returns

`this`

A new table instance containing the cloned data, so methods can be chained.

###### Examples

```ts
// Clone tableA to a new table with a default generated name (e.g., "table1")
const tableB = await tableA.clone().log();
```

```ts
// Clone tableA to a new table named "my_cloned_table" using string parameter
const tableB = await tableA.clone("my_cloned_table").log();
```

```ts
// Clone tableA to a new table named "my_cloned_table" using options object
const tableB = await tableA.clone({ name: "my_cloned_table" }).log();
```

```ts
// Clone tableA, including only rows where 'column1' is greater than 10
const tableB = await tableA.clone({ conditions: `column1 > 10` }).log();
```

```ts
// Clone tableA with only specific columns
const tableB = await tableA.clone({ columns: ["name", "age", "city"] }).log();
```

```ts
// Clone only the first 10 rows of tableA
const tableB = await tableA.clone({ limit: 10 }).log();
```

```ts
// Clone 10 rows after skipping the first 5 rows
const tableB = await tableA.clone({ limit: 10, offset: 5 }).log();
```

```ts
// Clone tableA to a specific table name with filtered data, specific columns, and limited rows
const tableB = await tableA.clone({
  name: "filtered_data",
  conditions: `status = 'active' AND created_date >= '2023-01-01'`,
  columns: ["name", "status", "created_date"],
  limit: 100
}).log();
```

###### Inherited from

`SimpleTableCore.clone`

##### removeTable()

> **removeTable**(): `Promise`\<[`SimpleTable`](#simpletable)\>

Removes the table from the database. After this operation, invoking methods on this SimpleTable instance will result in an error.

###### Returns

`Promise`\<[`SimpleTable`](#simpletable)\>

A promise that resolves after the table is removed.

###### Example

```ts
// Remove the current table from the database
await table.removeTable();
```

###### Inherited from

`SimpleTableCore.removeTable`

##### renameTable()

> **renameTable**(`name`): `Promise`\<[`SimpleTable`](#simpletable)\>

Renames the current table.
The new name must not belong to another registered table, ignoring ASCII letter case.

###### Parameters

###### name

`string`

The new name for the table.

###### Returns

`Promise`\<[`SimpleTable`](#simpletable)\>

A promise that resolves to the renamed table.

###### Example

```ts
// Rename the table to "new_employees"
await table.renameTable("new_employees");
await table.log();
```

###### Inherited from

`SimpleTableCore.renameTable`

##### run()

> **run**(): `Promise`\<[`SimpleTable`](#simpletable)\>

Executes all queued methods across every table in the database, not just
this table. Sync builder methods (like `filter()` or `convert()`) only
queue their operation; execution happens when an async observer method
(like `getData()`, `log()`, or `writeData()`) is awaited. Use `run()`
when a chain ends in pure mutations with nothing to observe and you want
the work done now.

Because the whole database is flushed in program order, this behaves
identically to `SimpleDB.run()`; call `sdb.run()` when your intent is to
flush the database rather than this specific table.

###### Returns

`Promise`\<[`SimpleTable`](#simpletable)\>

A promise that resolves to the table once the queued methods have been executed.

###### Example

```ts
// Nothing is observed after convert(), so run() executes the chain.
await table
  .loadData("data.csv")
  .convert({ price: "number" })
  .run();
await table.log();
```

###### Inherited from

`SimpleTableCore.run`

##### setTypes()

> **setTypes**(`types`): `this`

Sets the data types for columns in a new table. If the table already exists, it will be replaced.
To convert the types of an existing table, use the `.convert()` method instead.

###### Parameters

###### types

\{\[`key`: `string`\]: `"string"` \| `"number"` \| `"bigint"` \| `"boolean"` \| `"date"` \| `"integer"` \| `"float"` \| `"time"` \| `"datetime"` \| `"datetimeTz"` \| `"double"` \| `"varchar"` \| `"timestamp"` \| `"timestamp with time zone"` \| `"json"` \| `"JSON"` \| `` `float[${number}]` `` \| `` `FLOAT[${number}]` `` \| `` `geometry('${string}')` `` \| `` `GEOMETRY('${string}')` ``; \}

An object specifying the column names and their target data types (JavaScript or SQL types), including JSON, FLOAT[n] vectors, and GEOMETRY with a CRS.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Set types for a new table
await table.setTypes({
  name: "string",
  salary: "integer",
  raise: "float",
}).log();
```

```ts
// Create an empty table with JSON, embedding, and geometry columns.
await table.setTypes({
  details: "JSON",
  embedding: "FLOAT[3]",
  geom: "GEOMETRY('EPSG:4326')",
}).log();
```

###### Inherited from

`SimpleTableCore.setTypes`

#### Table Operations

##### crossJoin()

> **crossJoin**(`rightTable`, `options?`): `this`

Performs a cross join operation with another table. A cross join returns the Cartesian product of the rows from both tables, meaning all possible pairs of rows will be in the resulting table.
This means that if the left table has `n` rows and the right table has `m` rows, the result will have `n * m` rows.

###### Parameters

###### rightTable

`SimpleTable`

The SimpleTable instance to cross join with.

###### options?

An optional object with configuration options:

###### outputTable?

`string` \| `boolean`

If `true`, the results will be stored in a new table with a generated name. If a string, it will be used as the name for the new table. If `false` or omitted, the current table will be overwritten. Defaults to `false`.

###### Returns

`this`

A table instance containing the cross-joined data (either the current table or a new table), so methods can be chained.

###### Examples

```ts
// Perform a cross join with 'tableB', overwriting the current table (tableA)
await tableA.crossJoin(tableB).log();
```

```ts
// Perform a cross join with 'tableB' and store the results in a new table with a generated name
const tableC = await tableA.crossJoin(tableB, { outputTable: true }).log();
```

```ts
// Perform a cross join with 'tableB' and store the results in a new table named 'tableC'
const tableC = await tableA.crossJoin(tableB, { outputTable: "tableC" }).log();
```

###### Inherited from

`SimpleTableCore.crossJoin`

##### fuzzyJoin()

> **fuzzyJoin**(`rightTable`, `leftColumn`, `rightColumn`, `threshold`, `options?`): `this`

Performs a fuzzy left join between this table (considered the left table) and another table
(the right table) based on string similarity between two text columns. Uses the
[rapidfuzz](https://query.farm/duckdb_extension_rapidfuzz) DuckDB community extension.

If a similarity score column is added to the results, the rows will be ordered alphabetically by the left column, and then by descending similarity score within each group of identical left column values. Otherwise, the rows will be order alphabetically by the left column and then by the right column.

This operation might create temporary files in a `.tmp` folder; consider adding `.tmp` to your `.gitignore`.

###### Parameters

###### rightTable

`SimpleTable`

The SimpleTable instance to be joined with this table.

###### leftColumn

`string`

The name of the column in this (left) table containing the text to compare.

###### rightColumn

`string`

The name of the column in the right table containing the text to compare.

###### threshold

`number`

The minimum similarity score (0–100) required for two rows to be joined. For `method: "ratio"`, a length-based pre-filter is automatically applied based on the threshold to improve performance without losing accuracy.

###### options?

An optional object with configuration options:

###### method?

`"ratio"` \| `"partial_ratio"` \| `"token_sort_ratio"` \| `"token_set_ratio"`

The rapidfuzz similarity algorithm to use. Defaults to `"ratio"`.
  - `"ratio"`: Overall similarity (Levenshtein-based).
  - `"partial_ratio"`: Best partial/substring similarity.
  - `"token_sort_ratio"`: Similarity after sorting tokens (words), useful for reordered words.
  - `"token_set_ratio"`: Similarity based on sets of tokens, ignoring duplicates and word order.

###### outputTable?

`string` \| `boolean`

If `true`, the results will be stored in a new table with a generated name. If a string, it will be used as the name for the new table. If `false` or omitted, the current table will be overwritten. Defaults to `false`.

###### prefilterPrefixLength?

`number`

An optional prefix length. Only strings sharing the same first N characters are compared. Note that prefix filtering is lossy (e.g. "John" vs. "Phon" will not match despite high similarity).

###### similarityColumn?

`string`

If provided, a column with this name is added to the result containing the similarity score (0–100). If omitted, the score is not included in the output.

###### Returns

`this`

A table instance containing the fuzzy-joined data (either the current table or a new table), so methods can be chained.

###### Examples

```ts
// Fuzzy left join tableA with tableB on 'name' (left) and 'standardName' (right) with a threshold of 80
// A length-based pre-filter is automatically applied.
await tableA.fuzzyJoin(tableB, "name", "standardName", 80).log();
```

```ts
// Fuzzy join with a prefix-based pre-filter and a threshold of 80
await tableA.fuzzyJoin(tableB, "name", "standardName", 80, {
  prefilterPrefixLength: 3, // Must share the same first 3 characters
}).log();
```

```ts
// Fuzzy join with a custom threshold and method, storing results in a new table
const tableC = await tableA.fuzzyJoin(tableB, "name", "standardName", 90, {
  method: "token_sort_ratio",
  outputTable: "tableC",
}).log();
```

```ts
// Fuzzy join with a custom similarity column name and a threshold of 80
await tableA.fuzzyJoin(tableB, "name", "standardName", 80, {
  similarityColumn: "matchScore",
}).log();
```

###### Inherited from

`SimpleTableCore.fuzzyJoin`

##### join()

> **join**(`rightTable`, `options?`): `this`

Merges the data of this table (considered the left table) with another table (the right table) based on a common column or multiple columns.
Note that the order of rows in the returned data is not guaranteed to be the same as in the original tables.
This operation might create temporary files in a `.tmp` folder; consider adding `.tmp` to your `.gitignore`.

###### Parameters

###### rightTable

`SimpleTable`

The SimpleTable instance to be joined with this table.

###### options?

An optional object with configuration options:

###### on?

`string` \| `string`[]

The column(s) to join on. If omitted, the method automatically searches for a column name that exists in both tables. Can be a single string or an array of strings for multiple join keys.

###### outputTable?

`string` \| `boolean`

If `true`, the results will be stored in a new table with a generated name. If a string, it will be used as the name for the new table. If `false` or omitted, the current table will be overwritten. Defaults to `false`.

###### type?

`"inner"` \| `"left"` \| `"right"` \| `"full"`

The type of join operation to perform. Possible values are `"inner"`, `"left"` (default), `"right"`, or `"full"`.

###### Returns

`this`

A table instance containing the joined data (either the current table or a new table), so methods can be chained.

###### Examples

```ts
// Perform a left join with 'tableB' on a common column (auto-detected), overwriting tableA
await tableA.join(tableB).log();
```

```ts
// Perform an inner join with 'tableB' on the 'id' column, storing results in a new table named 'tableC'
const tableC = await tableA.join(tableB, { on: "id", type: 'inner', outputTable: "tableC" }).log();
```

```ts
// Perform a join on multiple columns ('name' and 'category')
await tableA.join(tableB, { on: ["name", "category"] }).log();
```

###### Inherited from

`SimpleTableCore.join`

#### Text Processing

##### addCharacterCount()

> **addCharacterCount**(`column`, `newColumn`): `this`

Adds a new column containing the number of characters in each string in the specified column.
Counts are based on Unicode code points, not grapheme clusters. A user-perceived character composed of multiple code points, such as some emoji or decomposed accented letters, counts as multiple characters.
`NULL` input values produce `NULL` counts.

###### Parameters

###### column

`string`

The name of the column containing the strings to count.

###### newColumn

`string`

The name of the new column where the character counts will be stored.

###### Returns

`this`

The table, so methods can be chained.

###### Example

```ts
// Add a character count for each value in the 'name' column
await table.addCharacterCount("name", "nameCharacterCount").log();
```

###### Inherited from

`SimpleTableCore.addCharacterCount`

##### addWordCount()

> **addWordCount**(`column`, `newColumn`): `this`

Adds a new column containing the word count for each string in the specified column.
A word is any contiguous sequence of non-whitespace characters. Spaces, tabs, and line breaks separate words. Punctuation is not removed, so a standalone punctuation sequence counts as a word. Text without whitespace counts as one word, regardless of language. Empty or whitespace-only strings produce `0`, and `NULL` input values produce `NULL` counts.

###### Parameters

###### column

`string`

The name of the column containing the strings to count.

###### newColumn

`string`

The name of the new column where the word counts will be stored.

###### Returns

`this`

The table, so methods can be chained.

###### Example

```ts
// Add a word count for each value in the 'article' column
await table.addWordCount("article", "wordCount").log();
```

###### Inherited from

`SimpleTableCore.addWordCount`

##### normalizeString()

> **normalizeString**(`column`, `newColumn`, `options?`): `this`

Normalizes string values in a column by:
1. Stripping accents
2. Optionally stripping punctuation (default: true)
3. Converting to lowercase
4. Normalizing whitespace (multiple spaces/tabs/newlines → single space)
5. Trimming leading/trailing whitespace

Produces identical output to `journalism-format`'s `normalizeString()` function
for all common cases including accented Latin characters.

###### Parameters

###### column

`string`

The column containing the text to normalize

###### newColumn

`string`

The column to store the normalized results

###### options?

Configuration options

###### stripPunctuation?

`boolean`

Strip punctuation and underscores (default: true)

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Normalize text column and store in new column
await table.normalizeString("recipeName", "recipeNameNormalized").log();
// "Épicerie Parisienne!" → "epicerie parisienne"
```

```ts
// Keep punctuation for emails and URLs
await table.normalizeString("email", "emailNormalized", { stripPunctuation: false }).log();
// "User@Example.com" → "user@example.com"
await table.normalizeString("url", "urlNormalized", { stripPunctuation: false }).log();
// "https://Example.com/path" → "https://example.com/path"
```

###### Inherited from

`SimpleTableCore.normalizeString`

#### Text Search

##### bm25()

> **bm25**(`text`, `idColumn`, `textColumn`, `count`, `options?`): `this`

Searches a text column using DuckDB's BM25 ranking function, which scores
matches using factors including term frequency and document length.

This method creates the required index with DuckDB's [FTS extension](https://duckdb.org/docs/stable/core_extensions/full_text_search).
It reuses the table's existing FTS index unless `overwriteIndex` is `true`.
DuckDB FTS indexes do not update automatically when the source table
changes; use `overwriteIndex: true` to rebuild the index after modifying
the table.

###### Parameters

###### text

`string`

The search query text to match against the text column.

###### idColumn

`string`

The name of the column containing unique identifiers for each row.

###### textColumn

`string`

The name of the column containing the text to search.

###### count

`number`

The number of top-ranked results to return.

###### options?

An optional object with configuration options:

###### b?

`number`

The BM25 b parameter controlling document length normalization (0-1 range). Defaults to 0.75.

###### conjunctive?

`boolean`

If `true`, all terms in the query string must be present in order for a document to be retrieved. Defaults to `false`.

###### ignore?

`string`

The regular expression of patterns to be ignored. Defaults to "(\\.|[^a-z])+".

###### k?

`number`

The BM25 k parameter controlling term frequency saturation. Defaults to 1.2.

###### lower?

`boolean`

A boolean indicating whether to convert all text to lowercase. Defaults to true.

###### minScore?

`number`

A threshold to filter out results with a BM25 score below this value.

###### outputTable?

`string`

The name of a new table where the results will be stored. If not provided, the current table will be replaced with the search results.

###### overwriteIndex?

`boolean`

If `true`, drops and recreates the FTS index even if it already exists. Defaults to `false`.

###### scoreColumn?

`string`

If provided, the BM25 score will be included in the output table under this column name.

###### stemmer?

`"arabic"` \| `"basque"` \| `"catalan"` \| `"danish"` \| `"dutch"` \| `"english"` \| `"finnish"` \| `"french"` \| `"german"` \| `"greek"` \| `"hindi"` \| `"hungarian"` \| `"indonesian"` \| `"irish"` \| `"italian"` \| `"lithuanian"` \| `"nepali"` \| `"norwegian"` \| `"porter"` \| `"portuguese"` \| `"romanian"` \| `"russian"` \| `"serbian"` \| `"spanish"` \| `"swedish"` \| `"tamil"` \| `"turkish"` \| `"none"`

The language stemmer to apply for word normalization. Supports multiple languages or "none" to disable stemming. Defaults to 'porter'.

###### stopwords?

`string`

The table containing the stopwords to use for the FTS index. Supports multiple languages or "none" to disable stopwords. Defaults to "english".

###### stripAccents?

`boolean`

A boolean indicating whether to remove accents. Defaults to true.

###### verbose?

`boolean`

If `true`, logs FTS index creation status. Defaults to `false`.

###### Returns

`this`

A table instance containing the search results, ordered by relevance (best matches first), so methods can be chained.

###### Examples

```ts
// Load a dataset of recipes
const dishes = await table
  .loadData("recipes.parquet")
  .bm25("italian food", "Dish", "Recipe", 5)
  .log();
// Logs the five most relevant dishes.
```

```ts
// Search with a specific language stemmer
await table.bm25("french food", "Dish", "Recipe", 5, {
  stemmer: "french",
}).log();
```

```ts
// Recreate the index with different settings and perform search
await table.bm25("italian food", "Dish", "Recipe", 5, {
  stemmer: "english",
  overwriteIndex: true,
}).log();
```

```ts
// Save results to a new table without modifying the original
const italianDishes = await table.bm25("italian food", "Dish", "Recipe", 5, {
  outputTable: "italian_results",
}).log();

// Original table remains unchanged
const allDishes = await table.getValues("Dish");
console.log(allDishes.length); // 336 (all dishes)

// New table contains only search results
const italianOnly = await italianDishes.getValues("Dish");
console.log(italianOnly.length); // 5 (top results)
```

```ts
// Multiple searches reuse the same index for better performance
// The first search creates the index
const italian = await table.bm25("italian food", "Dish", "Recipe", 5, {
  outputTable: "italian",
}).log();

// The second search reuses the existing index, so it's faster
const french = await table.bm25("french food", "Dish", "Recipe", 5, {
  outputTable: "french",
}).log();
```

```ts
// Filter results by a minimum BM25 score and include the score in the output
await table.bm25("spicy noodles", "Dish", "Recipe", 10, {
  minScore: 5.5,
  scoreColumn: "bm25_score",
}).log();
```

```ts
// Use the conjunctive option to require all terms
await table.bm25("italian sauce", "Dish", "Recipe", 5, {
  conjunctive: true,
}).log();
```

###### Inherited from

`SimpleTableCore.bm25`

##### createFtsIndex()

> **createFtsIndex**(`idColumn`, `textColumn`, `options?`): `this`

Creates a full-text search (FTS) index on a specified text column using DuckDB's [FTS extension](https://duckdb.org/docs/stable/core_extensions/full_text_search).

If an FTS index already exists on the table, this method will skip creation and log a message (when verbose is enabled), unless the `overwrite` option is set to `true`.
The index definition is recorded in [indexes](#indexes). The [bm25](#bm25)
method requires an FTS index and creates one automatically when needed.
DuckDB FTS indexes do not update automatically when the table changes; use
`overwrite: true` to rebuild the index after modifying the table.

###### Parameters

###### idColumn

`string`

The column containing the document identifiers.

###### textColumn

`string`

The column containing the text to search.

###### options?

An optional object with configuration options:

###### ignore?

`string`

The regular expression of patterns to be ignored. Defaults to "(\\.|[^a-z])+".

###### lower?

`boolean`

A boolean indicating whether to convert all text to lowercase. Defaults to true.

###### overwrite?

`boolean`

A boolean indicating whether to overwrite the existing FTS index. Defaults to false.

###### stemmer?

`"arabic"` \| `"basque"` \| `"catalan"` \| `"danish"` \| `"dutch"` \| `"english"` \| `"finnish"` \| `"french"` \| `"german"` \| `"greek"` \| `"hindi"` \| `"hungarian"` \| `"indonesian"` \| `"irish"` \| `"italian"` \| `"lithuanian"` \| `"nepali"` \| `"norwegian"` \| `"porter"` \| `"portuguese"` \| `"romanian"` \| `"russian"` \| `"serbian"` \| `"spanish"` \| `"swedish"` \| `"tamil"` \| `"turkish"` \| `"none"`

The stemmer to use for the FTS index. Supports multiple languages or "none" to disable stemming. Defaults to "porter".

###### stopwords?

`string`

The table containing the stopwords to use for the FTS index. Supports multiple languages or "none" to disable stopwords. Defaults to "english".

###### stripAccents?

`boolean`

A boolean indicating whether to remove accents. Defaults to true.

###### verbose?

`boolean`

If `true`, logs FTS index creation status. Defaults to `false`.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Load a dataset and create an FTS index for later searches
await table
  .loadData("recipes.parquet")
  .createFtsIndex("Dish", "Recipe").log();
```

```ts
// Create an index with a specific language stemmer
await table.createFtsIndex("Dish", "Recipe", {
  stemmer: "french",
}).log();
```

```ts
// Recreate an existing index with different settings
await table.createFtsIndex("Dish", "Recipe", {
  stemmer: "english",
  overwrite: true,
}).log();
```

```ts
// Create index with verbose logging
await table.createFtsIndex("Dish", "Recipe", {
  verbose: true,
}).log();
// Logs: 'Creating FTS index on "Recipe" column...'
// Logs: "FTS index created successfully."
```

###### Inherited from

`SimpleTableCore.createFtsIndex`

#### Updating Data

##### addNoise()

> **addNoise**(`columns`, `max`, `options?`): `this`

Adds independently generated uniform random noise to numeric values in one or more columns.
Each changed value receives an offset between `-max` and `max`. Selected integer and decimal columns become `DOUBLE` columns so fractional noise is retained. This method adds random jitter; it does not provide anonymization or differential privacy guarantees.

###### Parameters

###### columns

`string` \| `string`[]

The numeric column name or array of numeric column names to which noise will be added. When multiple columns are provided, each value receives an independent random offset.

###### max

`number`

The maximum absolute offset, expressed in each column's units. Must be a finite number greater than or equal to `0`.

###### options?

An optional object with configuration options:

###### onlyDuplicates?

`boolean`

If `true`, adds noise only to values that occur more than once in their column. Each selected column is evaluated independently, and every occurrence of a duplicated value is changed. Defaults to `false`.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Add an offset between -0.01 and 0.01 to every value
await table.addNoise("measurement", 0.01).log();
```

```ts
// Add noise independently to duplicated x values and duplicated y values
await table.addNoise(["x", "y"], 0.1, {
  onlyDuplicates: true,
}).log();
```

###### Inherited from

`SimpleTableCore.addNoise`

##### capitalize()

> **capitalize**(`columns`): `this`

Capitalizes the first letter of each string in the specified columns and converts the rest of the string to lowercase.

###### Parameters

###### columns

`string` \| `string`[]

The column name or an array of column names to be capitalized.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Capitalize strings in 'column1' (e.g., "hello world" becomes "Hello world")
await table.capitalize("column1").log();
```

```ts
// Capitalize strings in 'column1' and 'column2'
await table.capitalize(["column1", "column2"]).log();
```

###### Inherited from

`SimpleTableCore.capitalize`

##### concatenate()

> **concatenate**(`columns`, `newColumn`, `options?`): `this`

Concatenates values from specified columns into a new column.

###### Parameters

###### columns

`string`[]

An array of column names whose values will be concatenated.

###### newColumn

`string`

The name of the new column to store the concatenated values.

###### options?

An optional object with configuration options:

###### separator?

`string`

The string used to separate concatenated values. Defaults to an empty string (`""`).

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Concatenate 'firstName' and 'lastName' into a new 'fullName' column
await table.concatenate(["firstName", "lastName"], "fullName").log();
```

```ts
// Concatenate 'city' and 'country' into 'location', separated by a comma and space
await table.concatenate(["city", "country"], "location", { separator: ", " }).log();
```

###### Inherited from

`SimpleTableCore.concatenate`

##### convert()

> **convert**(`types`, `options?`): `this`

Converts data types of specified columns to target types (JavaScript or SQL types).

When converting non-standard timestamp, date, or time strings, provide a `datetimeFormat` option using [DuckDB's format specifiers](https://duckdb.org/docs/sql/functions/dateformat).
Strings converted to `datetimeTz` or `timestamp with time zone` use an
explicit `Z` or numeric offset when present; strings without an offset are
interpreted as UTC. Returned `TIMESTAMP WITH TIME ZONE` values are rendered
as UTC strings.

When converting timestamps, dates, or times to/from numbers, the numerical representation will be in milliseconds since the Unix epoch (1970-01-01 00:00:00 UTC).

When converting strings to numbers, commas (often used as thousand separators) will be automatically removed before conversion.

###### Parameters

###### types

\{\[`key`: `string`\]: `"string"` \| `"number"` \| `"bigint"` \| `"boolean"` \| `"date"` \| `"integer"` \| `"float"` \| `"time"` \| `"datetime"` \| `"datetimeTz"` \| `"double"` \| `"varchar"` \| `"timestamp"` \| `"timestamp with time zone"` \| `"json"` \| `"JSON"` \| `` `float[${number}]` `` \| `` `FLOAT[${number}]` `` \| `` `geometry('${string}')` `` \| `` `GEOMETRY('${string}')` ``; \}

An object mapping column names to their target data types for conversion, including JSON, FLOAT[n] vectors, and GEOMETRY with a CRS.

###### options?

An optional object with configuration options:

###### datetimeFormat?

`string`

A string specifying the format for date and time conversions. Uses `strftime` and `strptime` functions from DuckDB. For format specifiers, see [DuckDB's documentation](https://duckdb.org/docs/sql/functions/dateformat).

###### strict?

`boolean`

If `false`, values that cannot be converted will be replaced by `NULL` instead of throwing an error. Defaults to `true`.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Convert 'column1' to string and 'column2' to integer (JavaScript types)
await table.convert({ column1: "string", column2: "integer" }).log();
```

```ts
// Convert 'column1' to VARCHAR and 'column2' to BIGINT (SQL types)
await table.convert({ column1: "varchar", column2: "bigint" }).log();
```

```ts
// Convert strings in 'column3' to datetime using a specific format
await table.convert({ column3: "datetime" }, { datetimeFormat: "%Y-%m-%d" }).log();
```

```ts
// Both values identify instants and are rendered in UTC.
await table
  .loadArray([
    { observedAt: "2024-04-07T13:00:00-04:00" },
    { observedAt: "2024-04-07T17:00:00Z" },
  ])
  .convert({ observedAt: "datetimeTz" }).log();
```

```ts
// Convert datetime values in 'column3' to strings using a specific format
await table.convert({ column3: "string" }, { datetimeFormat: "%Y-%m-%d %H:%M:%S" }).log();
```

```ts
// Convert 'amount' to float, replacing unconvertible values with NULL
await table.convert({ amount: "float" }, { strict: false }).log();
```

```ts
// Parse JSON, a fixed-size float vector, and WKT geometry from text.
await table.loadArray([{
  details: '{"count":3}',
  embedding: "[0.25,0.5,0.75]",
  geom: "POINT (-73 45)",
}])
  .convert({ details: "JSON", embedding: "FLOAT[3]", geom: "GEOMETRY('EPSG:4326')" })
  .log();
```

###### Inherited from

`SimpleTableCore.convert`

##### fill()

> **fill**(`columns`, `options?`): `this`

Fills `NULL` values in specified columns. By default, each `NULL` is replaced with the last non-`NULL` value from the preceding row. When `interpolate` is `true`, `NULL` values are replaced using linear interpolation (or extrapolation at the ends). Pass `interpolateBy` with a real numeric or date column name to use it as the X-axis, so that interpolated values are proportional to the actual distances between X-axis values rather than treating every row as equidistant. When `interpolateBy` is set, `interpolate` is automatically assumed `true`.

###### Parameters

###### columns

`string` \| `string`[]

The column(s) for which to fill `NULL` values.

###### options?

An optional object with configuration options:

###### by?

`string` \| `string`[]

A column name or an array of column names to partition by. The fill is applied independently within each group.

###### interpolate?

`boolean`

If `true`, replaces `NULL` values with linearly interpolated values using DuckDB's `fill()` window function. When `interpolateBy` is not set, row positions are used as the X-axis, treating rows as equidistant. For `NULL` values at the ends, linear extrapolation is used. Both the column values and the X-axis values must support arithmetic. If `false` or omitted, the previous non-`NULL` value is used instead. Automatically assumed `true` when `interpolateBy` is set.

###### interpolateBy?

`string`

A column name to use as the X-axis for interpolation instead of equidistant row positions. When provided, `interpolate` is automatically assumed `true`. Use this when rows are not evenly spaced (e.g., timestamps or non-uniform numeric indices) so that interpolated values are proportional to the actual distance between X-axis values.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Fill NULL values in 'column1' with the previous non-NULL value
await table.fill("column1").log();
```

```ts
// Fill NULL values in multiple columns
await table.fill(["columnA", "columnB"]).log();
```

```ts
// Fill NULL values in 'value' independently within each 'group'
await table.fill("value", { by: "group" }).log();
```

```ts
// Fill NULL values in 'value' using linear interpolation
await table.fill("value", { interpolate: true }).log();
```

```ts
// Fill NULL values in 'value' using linear interpolation, independently within each 'group'
await table.fill("value", { by: "group", interpolate: true }).log();
```

```ts
// Fill NULL values in 'value' using linear interpolation proportional to 'x' distances
await table.fill("value", { interpolate: true, interpolateBy: "x" }).log();
```

```ts
// interpolateBy implies interpolate: true, so this is equivalent to the previous example
await table.fill("value", { interpolateBy: "x" }).log();
```

###### Inherited from

`SimpleTableCore.fill`

##### firstChars()

> **firstChars**(`column`, `count`): `this`

Extracts a specific number of characters from the beginning (left side) of string values in the specified column.

###### Parameters

###### column

`string`

The name of the column containing the strings to be modified.

###### count

`number`

The number of characters to extract from the left side of each string.

###### Returns

`this`

The table, so methods can be chained.

###### Example

```ts
// Replace strings in 'productCode' with their first two characters
// e.g., "ABC-123" becomes "AB"
await table.firstChars("productCode", 2).log();
```

###### Inherited from

`SimpleTableCore.firstChars`

##### fuzzyClean()

> **fuzzyClean**(`column`, `newColumn`, `threshold`, `options?`): `this`

Normalizes string values in a column by detecting fuzzy duplicates and replacing them with a single canonical value.

Similar strings are grouped into clusters. Matching is transitive: if `"New York"` is similar to `"New Yorke"` and
`"New Yorke"` is similar to `"New Yorkk"`, all three land in the same cluster even if `"New York"` and `"New Yorkk"`
would not match directly. Each cluster is then collapsed to one representative value based on the `strategy` option.

Similarity is computed using the [rapidfuzz](https://query.farm/duckdb_extension_rapidfuzz) DuckDB community extension,
which is installed and loaded automatically.

###### Parameters

###### column

`string`

The name of the column containing the strings to normalize.

###### newColumn

`string`

The name of the column to write the normalized values to. Use the same name as `column` to normalize in-place.

###### threshold

`number`

The minimum similarity score (0–100) for two strings to be considered duplicates. For `method: "ratio"`, a length-based pre-filter is automatically applied based on the threshold to improve performance without losing accuracy.

###### options?

An optional object with configuration options:

###### method?

`"ratio"` \| `"partial_ratio"` \| `"token_sort_ratio"` \| `"token_set_ratio"`

The rapidfuzz similarity algorithm to use. Defaults to `"ratio"`.
  - `"ratio"`: Overall similarity.
  - `"partial_ratio"`: Best partial/substring similarity.
  - `"token_sort_ratio"`: Similarity after sorting tokens (words), useful for reordered words.
  - `"token_set_ratio"`: Similarity based on sets of tokens, ignoring duplicates and word order.

###### prefilterPrefixLength?

`number`

An optional prefix length. Only strings sharing the same first N characters are compared. Note that prefix filtering is lossy (e.g. "John" vs. "Phon" will not match despite high similarity).

###### strategy?

`"mostCommon"` \| `"longestString"` \| `"shortestString"` \| `"mostCentral"` \| `"maxScore"`

The strategy for choosing the canonical value within each cluster of similar strings. Defaults to `"mostCommon"`.
  - `"mostCommon"`: Keep the value that appears most frequently in the original column.
  - `"longestString"`: Keep the longest string in the cluster.
  - `"shortestString"`: Keep the shortest string in the cluster.
  - `"mostCentral"`: Keep the string with the highest total similarity score to all other cluster members (the most "central" string).
  - `"maxScore"`: Keep the string that participates in the single highest-scoring pairwise match within the cluster.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Normalize 'city' into a new 'cityClean' column, keeping the most common string per cluster with a threshold of 80
// A length-based pre-filter is automatically applied.
await table.fuzzyClean("city", "cityClean", 80).log();
```

```ts
// Normalize with a prefix-based pre-filter and a threshold of 80
await table.fuzzyClean("city", "cityClean", 80, {
  prefilterPrefixLength: 5, // Must share the same first 5 characters
}).log();
```

```ts
// Normalize 'companyName' into a new column using token_sort_ratio and a threshold of 90
await table.fuzzyClean("companyName", "companyNameClean", 90, { method: "token_sort_ratio" }).log();
```

```ts
// Normalize 'category' in-place, keeping the longest string in each cluster and a threshold of 80
await table.fuzzyClean("category", "category", 80, { strategy: "longestString" }).log();
```

###### Inherited from

`SimpleTableCore.fuzzyClean`

##### lastChars()

> **lastChars**(`column`, `count`): `this`

Extracts a specific number of characters from the end (right side) of string values in the specified column.

###### Parameters

###### column

`string`

The name of the column containing the strings to be modified.

###### count

`number`

The number of characters to extract from the right side of each string.

###### Returns

`this`

The table, so methods can be chained.

###### Example

```ts
// Replace strings in 'productCode' with their last two characters
// e.g., "ABC-123" becomes "23"
await table.lastChars("productCode", 2).log();
```

###### Inherited from

`SimpleTableCore.lastChars`

##### lower()

> **lower**(`columns`): `this`

Converts string values in the specified columns to lowercase.

###### Parameters

###### columns

`string` \| `string`[]

The column name or an array of column names to be converted to lowercase.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Convert strings in 'column1' to lowercase
await table.lower("column1").log();
```

```ts
// Convert strings in 'column1' and 'column2' to lowercase
await table.lower(["column1", "column2"]).log();
```

###### Inherited from

`SimpleTableCore.lower`

##### nest()

> **nest**(`column`, `separator`, `by`): `this`

Nests (collapses) rows by aggregating a column's values into a single string per group, separated by a delimiter.

This is the inverse operation of `unnest()`. Multiple rows are combined into fewer rows by grouping on specified category columns and concatenating the target column values with a separator.

###### Parameters

###### column

`string`

The name of the column whose values will be aggregated and concatenated.

###### separator

`string`

The delimiter string used to join the column values.

###### by

`string` \| `string`[]

The column name or an array of column names to group by.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Nest 'neighborhoods' column separated by " / " for each city
// Before: [{ city: "Montreal", neighborhoods: "Old Montreal" },
//         { city: "Montreal", neighborhoods: "Chinatown" },
//         { city: "Montreal", neighborhoods: "Griffintown" }]
// After:  [{ city: "Montreal", neighborhoods: "Old Montreal / Chinatown / Griffintown" }]
await table.nest("neighborhoods", " / ", "city").log();
```

```ts
// Nest with multiple category columns
// Before: [{ country: "Canada", city: "Montreal", tags: "red" },
//         { country: "Canada", city: "Montreal", tags: "blue" }]
// After:  [{ country: "Canada", city: "Montreal", tags: "red,blue" }]
await table.nest("tags", ",", ["country", "city"]).log();
```

###### Inherited from

`SimpleTableCore.nest`

##### pad()

> **pad**(`columns`, `length`, `options?`): `this`

Pads the strings in the specified columns to a target length.

The columns must contain string (VARCHAR) values. An error is thrown if any
column is of a different type. `null` values remain `null`. If any string
already exceeds the target length, an error is thrown (no silent truncation).

###### Parameters

###### columns

`string` \| `string`[]

The column name(s) containing strings to be padded.

###### length

`number`

The target length of the padded strings.

###### options?

An optional object with configuration options:

###### character?

`string`

The character to use for padding. Defaults to `'0'`.

###### side?

`"left"` \| `"right"`

Which side to pad. `'left'` (default) or `'right'`.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Left-pad 'id' column to 3 characters with zeros (default)
await table.pad("id", 3).log();
// Result: '1' -> '001', '23' -> '023', null -> null
```

```ts
// Right-pad 'code' column to 5 characters with spaces
await table.pad("code", 5, { side: "right", character: " " }).log();
// Result: '123' -> '123  ', '45' -> '45   ', null -> null
```

```ts
// Left-pad multiple columns to 5 characters with dashes
await table.pad(["id", "code"], 5, { side: "left", character: "-" }).log();
// Result: '1' -> '----1', '23' -> '---23'
```

###### Throws

If any column is not of string (VARCHAR) type.

###### Throws

If any string value exceeds the target length.

###### Inherited from

`SimpleTableCore.pad`

##### repeatRows()

> **repeatRows**(`column`, `options?`): `this`

Repeats rows based on the values in a column.

If a row has a value of 3 in the specified column, it will be repeated 3 times. If the value is 0 or negative, the row will be removed.

###### Parameters

###### column

`string`

The name of the column containing the number of times each row should be repeated.

###### options?

An optional object with configuration options:

###### index?

`string`

The name of a new column to store the index of the repeated row (starting at 0).

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Before: [{ id: 1, count: 2, category: "A" }, { id: 2, count: 3, category: "B" }]
await table.repeatRows("count").log();
// After:  [{ id: 1, count: 2, category: "A" }, { id: 1, count: 2, category: "A" },
//          { id: 2, count: 3, category: "B" }, { id: 2, count: 3, category: "B" }, { id: 2, count: 3, category: "B" }]
```

```ts
// With an index column
await table.repeatRows("count", { index: "copyId" }).log();
// After:  [{ id: 1, count: 2, category: "A", copyId: 0 }, { id: 1, count: 2, category: "A", copyId: 1 },
//          { id: 2, count: 3, category: "B", copyId: 0 }, { id: 2, count: 3, category: "B", copyId: 1 }, { id: 2, count: 3, category: "B", copyId: 2 }]
```

###### Inherited from

`SimpleTableCore.repeatRows`

##### replace()

> **replace**(`columns`, `replacements`, `options?`): `this`

Replaces specified strings in the selected columns.
Use `["all"]` to target a column literally named `all`.

###### Parameters

###### columns

`string` \| `string`[]

The column name, an array of column names, or `"all"` to apply the replacement to every column in the table.

###### replacements

\{\[`key`: `string`\]: `string`; \}

An object mapping old strings to new strings (e.g., `{ "oldValue": "newValue" }`).

###### options?

An optional object with configuration options:

###### entireString?

`boolean`

A boolean indicating whether the entire cell content must match the `oldString` for replacement to occur. Defaults to `false` (replaces substrings).

###### regex?

`boolean`

A boolean indicating whether the `oldString` should be treated as a regular expression for global replacement. Cannot be used with `entireString: true`. Defaults to `false`.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Replace all occurrences of "kilograms" with "kg" in 'column1'
await table.replace("column1", { "kilograms": "kg" }).log();
```

```ts
// Replace "kilograms" with "kg" and "liters" with "l" in 'column1' and 'column2'
await table.replace(["column1", "column2"], { "kilograms": "kg", "liters": "l" }).log();
```

```ts
// Replace only if the entire string in 'column1' is "kilograms"
await table.replace("column1", { "kilograms": "kg" }, { entireString: true }).log();
```

```ts
// Replace any sequence of one or more digits with a hyphen in 'column1' using regex
await table.replace("column1", { "\d+": "-" }, { regex: true }).log();
```

```ts
// Replace "%" with "" in all columns
await table.replace("all", { "%": "" }).log();
```

###### Inherited from

`SimpleTableCore.replace`

##### replaceNulls()

> **replaceNulls**(`columns`, `value`): `this`

Replaces `NULL` values in the specified columns with a given value.
Use `["all"]` to target a column literally named `all`.

###### Parameters

###### columns

`string` \| `string`[]

The column name, an array of column names, or `"all"` to apply the replacement to every column in the table.

###### value

`unknown`

The value to replace `NULL` occurrences with.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Replace NULL values in 'column1' with 0
await table.replaceNulls("column1", 0).log();
```

```ts
// Replace NULL values in 'columnA' and 'columnB' with the string "N/A"
await table.replaceNulls(["columnA", "columnB"], "N/A").log();
```

```ts
// Replace NULL values in 'dateColumn' with a specific date
await table.replaceNulls("dateColumn", new Date("2023-01-01")).log();
```

```ts
// Replace NULL values in all columns with 0
await table.replaceNulls("all", 0).log();
```

###### Inherited from

`SimpleTableCore.replaceNulls`

##### round()

> **round**(`columns`, `options?`): `this`

Rounds numeric values in specified columns.

###### Parameters

###### columns

`string` \| `string`[]

The column name or an array of column names containing numeric values to be rounded.

###### options?

`number` \| \{ `decimals?`: `number`; `method?`: `"round"` \| `"ceiling"` \| `"floor"`; \}

An optional integer specifying the number of decimal places, or an object with configuration options:

`number`

***

###### Type Literal

\{ `decimals?`: `number`; `method?`: `"round"` \| `"ceiling"` \| `"floor"`; \}

An optional integer specifying the number of decimal places, or an object with configuration options:

###### decimals?

`number`

The number of decimal places to round to. Defaults to `0` (rounds to the nearest integer).

###### method?

`"round"` \| `"ceiling"` \| `"floor"`

The rounding method to use: `"round"` (rounds to the nearest integer, with halves rounding up), `"ceiling"` (rounds up to the nearest integer), or `"floor"` (rounds down to the nearest integer). Defaults to `"round"`.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Round 'column1' values to the nearest integer
await table.round("column1").log();
```

```ts
// Round 'column1' values to 2 decimal places
await table.round("column1", { decimals: 2 }).log();
```

```ts
// Round 'column1' values down to the nearest integer (floor)
await table.round("column1", { method: "floor" }).log();
```

```ts
// Round 'columnA' and 'columnB' values to 1 decimal place using ceiling method
await table.round(["columnA", "columnB"], { decimals: 1, method: "ceiling" }).log();
```

```ts
// Round 'column1' values to 2 decimal places using the shorthand
await table.round("column1", 2).log();
```

###### Inherited from

`SimpleTableCore.round`

##### rowToText()

> **rowToText**(`columns`, `newColumn`): `this`

Concatenates values from multiple columns into a new column with labeled rows.

This method creates a new column where each value is a concatenation of the specified columns,
with each column value prefixed by its column name and a colon, followed by a newline.
Column entries are separated by double newlines ("\n\n").

All values must be string, otherwise an error will be thrown. Use the `convert()` method first to convert non-string columns to string.

If a column value is `NULL`, it will be replaced by `'Unknown'` in the concatenated result.

###### Parameters

###### columns

`string`[]

An array of column names whose values will be concatenated with labels.

###### newColumn

`string`

The name of the new column to create with the concatenated values.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Concatenate multiple string columns into a labeled text field
await table.rowToText(
  ["summary", "findings", "context", "date", "quote"],
  "fullText"
).log();
// Result in "fullText" will look like:
// summary:
// [value]
//
// findings:
// [value]
//
// context:
// [value]
//
// date:
// [value]
//
// quote:
// [value]
```

```ts
// Convert numeric columns to strings first, then concatenate
// NULL values will appear as 'Unknown'
await table
  .convert({ age: "string", salary: "string" })
  .rowToText(["name", "age", "salary"], "profile").log();
```

###### Inherited from

`SimpleTableCore.rowToText`

##### rowToVector()

> **rowToVector**(`columns`, `newColumn`, `options?`): `this`

Combines numeric scalar columns into a fixed-size vector. The input
column order determines the vector dimension order, and null values remain
null vector elements.

When all input columns have the same numeric type, that type is preserved.
Mixed numeric types require an explicit `type` option. Casting exact
decimals or large integers to FLOAT or DOUBLE can lose precision.

###### Parameters

###### columns

`string`[]

Numeric scalar columns to combine, in vector dimension order.

###### newColumn

`string`

The name of the vector column to create.

###### options?

Optional vector element type settings.

###### type?

`"float"` \| `"double"`

Cast every element to `"float"` or `"double"`. Required when the input column types differ.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
await table
  .rowToVector(["height", "weight"], "measurements")
  .log();
```

```ts
await table
  .rowToVector(["count", "score"], "features", { type: "double" })
  .log();
```

###### Inherited from

`SimpleTableCore.rowToVector`

##### splitExtract()

> **splitExtract**(`column`, `separator`, `index`, `newColumn`): `this`

Splits strings in a specified column by a separator and extracts a substring at a given index, storing the result in a new or existing column.
If the index is out of bounds, an empty string will be returned for that row.

###### Parameters

###### column

`string`

The name of the column containing the strings to be split.

###### separator

`string`

The substring to use as a delimiter for splitting the strings.

###### index

`number`

The zero-based index of the substring to extract after splitting. For example, `0` for the first part, `1` for the second, etc.

###### newColumn

`string`

The name of the column where the extracted substrings will be stored. To overwrite the original column, use the same name as `column`.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Split 'address' by comma and extract the second part (index 1) into a new 'city' column
// e.g., "123 Main St, Anytown, USA" -> "Anytown"
await table.splitExtract("address", ",", 1, "city").log();
```

```ts
// Split 'filename' by dot and extract the first part (index 0), overwriting 'filename'
// e.g., "document.pdf" -> "document"
await table.splitExtract("filename", ".", 0, "filename").log();
```

###### Inherited from

`SimpleTableCore.splitExtract`

##### splitSpread()

> **splitSpread**(`column`, `separator`, `newColumns`, `options?`): `this`

Splits strings in a specified column by a separator and spreads the resulting parts into multiple new columns.

Each part of the split string will be stored in a separate column. The number of columns created is determined by the length of the `newColumns` array.
If a row has fewer parts than the number of new columns, a warning will be logged and the extra columns will contain empty strings (unless `strict` is set to `false`).
If a row has more parts than the number of new columns, an error will be thrown unless `strict` is set to `false`.

###### Parameters

###### column

`string`

The name of the column containing the strings to be split.

###### separator

`string`

The substring to use as a delimiter for splitting the strings.

###### newColumns

`string`[]

An array of column names for the extracted parts.

###### options?

Optional configuration.

###### strict?

`boolean`

If `false`, skips all validation checks (both max and min parts). Defaults to `true`.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Split 'fullName' by comma and spread into 'lastName' and 'firstName'
// e.g., "Shiab, Nael" -> lastName: "Shiab", firstName: "Nael"
await table.splitSpread("fullName", ",", ["lastName", "firstName"]).log();
```

```ts
// Split 'address' by comma and spread into three columns
// e.g., "123 Main St, Anytown, USA" -> street: "123 Main St", city: "Anytown", country: "USA"
await table.splitSpread("address", ",", ["street", "city", "country"]).log();
```

```ts
// Skip validation for performance
await table.splitSpread("data", "|", ["col1", "col2"], { strict: false }).log();
```

###### Inherited from

`SimpleTableCore.splitSpread`

##### trim()

> **trim**(`columns`, `options?`): `this`

Trims specified characters from the beginning, end, or both sides of string values in the given columns.
Pass `"all"` to trim every string (VARCHAR) column, leaving other types unchanged.
If there are no string columns, `"all"` leaves the table unchanged.
Use `["all"]` to trim a column literally named `all`.

###### Parameters

###### columns

`string` \| `string`[]

The column name, an array of column names, or `"all"` to trim every string (VARCHAR) column.

###### options?

An optional object with configuration options:

###### character?

`string`

The string to trim. Defaults to whitespace characters.

###### side?

`"left"` \| `"right"` \| `"both"`

The side to trim: `"left"` (removes from the beginning), `"right"` (removes from the end), or `"both"` (removes from both sides). Defaults to `"both"`.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Trim whitespace from 'column1'
await table.trim("column1").log();
```

```ts
// Trim whitespace from every string column
await table.trim("all").log();
```

```ts
// Trim leading and trailing asterisks from 'productCode'
await table.trim("productCode", { character: "*" }).log();
```

```ts
// Right-trim whitespace from 'description' and 'notes' columns
await table.trim(["description", "notes"], { side: "right" }).log();
```

###### Inherited from

`SimpleTableCore.trim`

##### truncate()

> **truncate**(`column`, `length`): `this`

Truncates string values in a specified column to a maximum number of characters.

###### Parameters

###### column

`string`

The column name containing strings to be truncated.

###### length

`number`

The maximum number of characters to keep.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Truncate strings in 'description' column to 50 characters
await table.truncate("description", 50).log();
```

```ts
// Truncate strings in 'name' column to 10 characters
await table.truncate("name", 10).log();
```

###### Inherited from

`SimpleTableCore.truncate`

##### unnest()

> **unnest**(`column`, `separator`): `this`

Unnests (expands) rows by splitting a column's string values into multiple rows based on a separator.

Each value in the specified column is split using the provided separator, and a new row is created for each resulting substring. All other column values are duplicated across the newly created rows.

###### Parameters

###### column

`string`

The name of the column containing string values to be split and unnested.

###### separator

`string`

The delimiter string used to split the column values.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Unnest 'tags' column separated by commas
// Before: [{ id: 1, tags: "red,blue,green" }]
// After:  [{ id: 1, tags: "red" }, { id: 1, tags: "blue" }, { id: 1, tags: "green" }]
await table.unnest("tags", ",").log();
```

```ts
// Unnest 'neighborhoods' column separated by " / "
// Before: [{ city: "Montreal", neighborhoods: "Old Montreal / Chinatown / Griffintown" }]
// After:  [{ city: "Montreal", neighborhoods: "Old Montreal" },
//         { city: "Montreal", neighborhoods: "Chinatown" },
//         { city: "Montreal", neighborhoods: "Griffintown" }]
await table.unnest("neighborhoods", " / ").log();
```

###### Inherited from

`SimpleTableCore.unnest`

##### updateColumn()

> **updateColumn**(`column`, `definition`): `this`

Updates values in a specified column using a SQL expression.
With the default `SimpleDB.expressionSyntax: "js"`, expressions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.

###### Parameters

###### column

`string`

The name of the column to be updated.

###### definition

`string`

The SQL expression used to set the new values in the column (e.g., `"column1 * 2"`, `"UPPER(column_name)"`).

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Update 'column1' with the left 5 characters of 'column2'
await table.updateColumn("column1", `LEFT(column2, 5)`).log();
```

```ts
// Double the values in 'price' column
await table.updateColumn("price", `price * 2`).log();
```

```ts
// Set 'status' to 'active' where 'isActive' is true
await table.updateColumn("status", `CASE WHEN isActive THEN 'active' ELSE 'inactive' END`).log();
```

```ts
// Update an existing column with a value from a JSON object using dot notation.
await table.loadArray([{ count: 0, details: { count: 3 } }], {
  columnTypes: { details: "JSON" },
})
  .updateColumn("count", "details.count")
  .log();
```

###### Inherited from

`SimpleTableCore.updateColumn`

##### updateWithJS()

> **updateWithJS**(`dataModifier`, `options?`): `this`

Updates data in the table using a JavaScript function. The function receives the existing rows as an array of objects and must return the modified rows as an array of objects.
This method offers high flexibility for data manipulation but can be slow for large tables as it involves transferring data between DuckDB and JavaScript.
Before writing a JavaScript callback, check for an existing SDA method that
performs the same operation; it will usually be faster and more efficient.
Existing integer and enum columns retain their types. Fractional or
out-of-range integers and unknown enum members throw when written. The
original table is replaced after all callback results have been converted
successfully.

If the table has geometry columns, the callback can read and modify their
GeoJSON geometry objects directly. Extra properties added to these objects
are ignored; create new columns on the returned rows to store additional
attributes. All geometry columns must use EPSG:4326; use reproject() first
if needed.

###### Parameters

###### dataModifier

((`rows`) => `Promise`\<`object`[]\>) \| ((`rows`) => `object`[])

A synchronous or asynchronous function that takes the existing rows (as an array of objects) and returns the modified rows (as an array of objects).

###### options?

An optional object with configuration options:

###### batchSize?

`number`

If provided, rows are processed in batches of this size instead of all at once, so large tables don't have to be materialized entirely in memory. This limits input rows per batch, but does not eliminate conversion work or bound geometry size or callback output expansion. The modifier function is called once per batch. Tables with a column named `rowid` or `__sda_rowid` (case-insensitive) are rejected before the modifier runs; rename the column or omit batchSize.

###### columnTypes?

\{\[`key`: `string`\]: `string`; \}

Explicit types for newly added columns, following loadArray's columnTypes contract. Declare geometry as GEOMETRY('EPSG:4326'); geometry is never inferred from object shape. Existing columns cannot be redeclared.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Double the value in each row with a JavaScript callback.
await table.loadArray([{ value: 1 }, { value: 2 }])
  .updateWithJS((rows) => rows.map((row) => ({
    value: Number(row.value) * 2,
  })))
  .log();
```

```ts
// Process two rows per callback to limit how many rows are handled at once.
await table.loadArray([{ value: 1 }, { value: 2 }, { value: 3 }])
  .updateWithJS((rows) => rows.map((row) => ({
    value: Number(row.value) * 2,
  })), { batchSize: 2 })
  .log();
```

```ts
// Add a JSON object column to keep related attributes together.
await table.loadArray([{ name: "Station" }])
  .updateWithJS((rows) => rows.map((row) => ({
    ...row, details: { active: true, category: "weather" },
  })), { columnTypes: { details: "JSON" } })
  .log();
```

```ts
// Add a three-element float vector, such as an embedding.
await table.loadArray([{ name: "Station" }])
  .updateWithJS((rows) => rows.map((row) => ({
    ...row, embedding: [0.25, 0.5, 0.75],
  })), { columnTypes: { embedding: "FLOAT[3]" } })
  .log();
```

```ts
// Move each point slightly east by editing its longitude.
await sdb.newTable().loadArray([{
  geom: { type: "Point", coordinates: [-73, 45] },
}], { columnTypes: { geom: "GEOMETRY('EPSG:4326')" } })
  .updateWithJS((rows) => rows.map((row) => {
    // This example loads only Points. Narrow the type for coordinate access.
    const geom = row.geom as { type: "Point"; coordinates: number[] } | null;
    if (geom !== null) geom.coordinates[0] += 0.01;
    return row;
  })).log();
```

```ts
// Create a geometry column from longitude and latitude values.
await sdb.newTable().loadArray([{ longitude: -73, latitude: 45 }])
  .updateWithJS((rows) => rows.map((row) => ({
    ...row, geom: { type: "Point", coordinates: [row.longitude, row.latitude] },
  })), { columnTypes: { geom: "GEOMETRY('EPSG:4326')" } }).log();
```

###### Inherited from

`SimpleTableCore.updateWithJS`

##### upper()

> **upper**(`columns`): `this`

Converts string values in the specified columns to uppercase.

###### Parameters

###### columns

`string` \| `string`[]

The column name or an array of column names to be converted to uppercase.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Convert strings in 'column1' to uppercase
await table.upper("column1").log();
```

```ts
// Convert strings in 'column1' and 'column2' to uppercase
await table.upper(["column1", "column2"]).log();
```

###### Inherited from

`SimpleTableCore.upper`

#### Vector Operations

##### normalizeVector()

> **normalizeVector**(`column`, `newColumn`, `options?`): `this`

Normalizes a numeric vector column. By default, each dimension is scaled
independently to `[0, 1]` across rows: all first elements together, all
second elements together, and so on. With `normalization: "rowL2"`, each
row is scaled to Euclidean unit length while preserving its direction;
zero vectors remain zero.

The input may be a numeric LIST or fixed-size ARRAY. The output is a
fixed-size DOUBLE ARRAY. Converting large integers and exact decimals to
DOUBLE can lose precision. With `"dimensionMinMax"`, a dimension whose
converted values are all equal cannot be normalized.

###### Parameters

###### column

`string`

The numeric vector column to normalize.

###### newColumn

`string`

The output column. Use the source column's name to
replace the source column with the normalized DOUBLE vector.

###### options?

Normalization settings.

###### normalization?

`"dimensionMinMax"` \| `"rowL2"`

`"dimensionMinMax"` scales each dimension
across rows; `"rowL2"` scales each row to unit length. Defaults to
`"dimensionMinMax"`.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Scale each dimension across rows to [0, 1] in a new column.
await table
  .normalizeVector("features", "scaledFeatures")
  .log();
```

```ts
// Replace each vector with its unit-length version; zero vectors stay zero.
await table
  .normalizeVector("features", "features", { normalization: "rowL2" })
  .log();
```

###### Inherited from

`SimpleTableCore.normalizeVector`

#### Vector Search

##### createVssIndex()

> **createVssIndex**(`column`, `options?`): `this`

Creates a vector similarity search (VSS) index on a specified column using DuckDB's [VSS extension](https://duckdb.org/docs/stable/extensions/vss).

If a VSS index already exists on the table, this method will skip creation and log a message (when verbose is enabled), unless the `overwrite` option is set to `true`.
The index definition is recorded in [indexes](#indexes).

###### Parameters

###### column

`string`

The name of the column containing vector embeddings (must be FLOAT array type).

###### options?

An optional object with configuration options:

###### efConstruction?

`number`

The number of candidate vertices to consider during index construction. Higher values result in more accurate indexes but increase build time. Defaults to 128.

###### efSearch?

`number`

The number of candidate vertices to consider during search. Higher values result in more accurate searches but increase search time. Defaults to 64.

###### M?

`number`

The maximum number of neighbors to keep for each vertex in the graph. Higher values result in more accurate indexes but increase build time and memory usage. Defaults to 16.

###### overwrite?

`boolean`

If `true`, drops and recreates the index even if it already exists. Defaults to `false`.

###### verbose?

`boolean`

If `true`, logs VSS index creation status. Defaults to `false`.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Load data that already contains an embedding column
await table
  .loadData("data.csv")
  .createVssIndex("embedding_column").log();
```

```ts
// Recreate an existing index
await table.createVssIndex("embedding_column", {
  overwrite: true,
}).log();
```

```ts
// Create index with verbose logging
await table.createVssIndex("embedding_column", {
  verbose: true,
}).log();
// Logs: 'Creating VSS index on "embedding_column" column...'
// Logs: "VSS index created successfully."
```

```ts
// Create index with custom HNSW parameters for higher accuracy
await table.createVssIndex("embedding_column", {
  efConstruction: 256,
  efSearch: 128,
  M: 32,
}).log();
```

###### Inherited from

`SimpleTableCore.createVssIndex`

##### hdbscan()

> **hdbscan**(`columns`, `newColumn`, `options?`): `this`

Groups rows with similar numeric features using HDBSCAN, without requiring
a predefined number of clusters. Adds a VARCHAR column containing
`"cluster-0"`, `"cluster-1"`, etc., or `"noise"` for rows outside clusters.
Labels identify groups, not their rank.

Accepts a numeric vector column or several numeric scalar columns. Features
are used as supplied. If their scales differ, consider preparing them with
`normalize()`, `zScore()`, or `normalizeVector()` before clustering.

Exact clustering is the default and can be expensive for large datasets.
Set `approximate: true` to use approximate clustering, which can produce
different results, including between repeated runs.

###### Parameters

###### columns

`string` \| `string`[]

A numeric vector column, or numeric scalar columns in
feature-dimension order.

###### newColumn

`string`

The cluster-label column to create.

###### options?

HDBSCAN clustering and output settings.

###### allowSingleCluster?

`boolean`

Allow a result with just one cluster,
possibly alongside noise. Defaults to `false`. Setting this to `true` can
favor one broad group, even when there is little meaningful structure.

###### approximate?

`boolean`

Use approximate clustering. Defaults to `false`.

###### membershipScoreColumn?

`string`

Optional DOUBLE column for membership
strength from `0` to `1`. Higher values indicate stronger membership in the
assigned cluster; noise scores `0`.

###### metric?

`"euclidean"` \| `"cosine"`

Use `"euclidean"` to compare feature values, or
`"cosine"` to compare vector direction regardless of overall magnitude.
Defaults to `"euclidean"`.

###### minClusterSize?

`number`

Minimum cluster size, from `2` through the
row count. Defaults to `5`.

###### minSamples?

`number`

Number of neighbors used to estimate local
density, excluding the point itself. Higher values make clustering more
conservative, generally labeling more rows as noise. Set this separately
to adjust density sensitivity independently of minimum cluster size.
Defaults to `minClusterSize`.

###### outlierScoreColumn?

`string`

Optional DOUBLE column for outlier
scores from `0` to `1`. Higher values indicate more unusual rows relative to
their surroundings, including within clusters. This is not necessarily
`1 - membershipScore`.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
// Cluster numeric columns and add membership and outlier scores.
await table
  .hdbscan(["height", "weight"], "cluster", {
    minClusterSize: 5,
    membershipScoreColumn: "membership",
    outlierScoreColumn: "outlierScore",
  })
  .log();
```

```ts
// Scale vector dimensions before clustering.
await table
  .normalizeVector("features", "scaledFeatures")
  .hdbscan("scaledFeatures", "cluster")
  .log();
```

###### Inherited from

`SimpleTableCore.hdbscan`

##### umap()

> **umap**(`columns`, `options?`): `this`

Reduces numeric features, such as embeddings, to a two-dimensional UMAP
projection. The resulting coordinates are added as `umapX` and `umapY`,
while all existing columns (including the source feature columns), their
values and types, and the input row order are preserved. DuckDB computes
neighbors and the fuzzy graph; TypeScript optimizes the coordinates without
copying the input vectors into JavaScript. Neighbor search is selected
automatically.

Accepts a numeric LIST or ARRAY column, or an array of numeric scalar column
names combined internally into a vector in the supplied order. Features
must be finite and non-null; vectors must be nonempty and equally sized.
Features are converted to DOUBLE without automatic scaling. Large integers
and exact decimals can lose precision in this conversion. If feature scales
differ, consider `normalize()` or `zScore()` before projection.

The defaults are a starting point for exploration. To adjust the projection:

- `neighbors` (default `15`): How many nearby points influence the layout.
  Smaller values emphasize local detail but can fragment groups. Larger
  values emphasize broader structure, can hide local detail, and generally
  require more time and memory.
- `metric` (default `"euclidean"`): How similarity is measured. Euclidean
  compares distance, including differences in vector magnitude. Cosine
  compares direction, ignoring magnitude. Choose according to what makes
  vectors similar in your data; neither is universally better.
- `epochs` (default `200`): How many passes refine the coordinates. Fewer
  passes finish sooner but may leave the layout unfinished. More passes
  allow further refinement and take longer, with diminishing returns.
- `minDistance` (default `0.1`): How tightly points can group in the
  projection. Smaller values allow tighter clumps; larger values spread
  points out. This changes the layout's appearance, not an accuracy level
  or the number of optimization passes.
- `learningRate` (default `1`): The initial size of coordinate adjustments.
  Smaller values make gentler adjustments and may need more epochs. Larger
  values make bigger adjustments but can overshoot useful positions. This
  does not change the number of passes.
- `negativeSamples` (default `5`): How many random points are sampled for
  repulsion per attractive update. Smaller values reduce work and
  repulsion; larger values increase both, tending to separate unrelated
  points more strongly. More samples do not guarantee a better projection.

###### Parameters

###### columns

`string` \| `string`[]

A numeric vector column name, or a nonempty array of numeric scalar column names in feature order. Use a one-element array for a single scalar feature.

###### options?

Optional projection settings.

###### epochs?

`number`

Integer number of refinement passes, at least 1. Defaults to 200.

###### learningRate?

`number`

Finite, positive initial learning rate. Defaults to 1.

###### metric?

`"euclidean"` \| `"cosine"`

Input distance metric: "euclidean" or "cosine". Defaults to "euclidean".

###### minDistance?

`number`

Grouping distance parameter between 0 and 1. Defaults to 0.1.

###### negativeSamples?

`number`

Integer number of samples used to separate unrelated points, at least 1. Defaults to 5.

###### neighbors?

`number`

Neighborhood size, including the point itself. Integer of at least 2, clamped to row count minus one. Defaults to 15.

###### seed?

`number`

Integer used to initialize random choices. Defaults to 42.

###### Returns

`this`

The table, so methods can be chained.

###### Examples

```ts
await table.umap("embedding", {
  metric: "cosine",
  seed: 42,
}).log();
```

```ts
await table.umap("embedding", {
  neighbors: 30,
  minDistance: 0.25,
}).selectColumns(["label", "umapX", "umapY"]).log();
```

```ts
await table
  .umap(["height", "weight", "age"], { seed: 42 })
  .log();
```

###### Inherited from

`SimpleTableCore.umap`

## Other

### SimpleDB

Manages a DuckDB database instance, providing a simplified interface for database operations.
Extends the core [`SimpleDB`](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/docs/classes/SimpleDB.md) class
from [`simple-data-analysis-core`](https://github.com/nshiab/simple-data-analysis-core) to use
our extended SimpleTable class which includes additional AI, Google Sheets, and charting methods.

All core methods are available on this class.
See the [core SimpleDB reference](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/docs/classes/SimpleDB.md)
for inherited methods such as `newTable()` and `close()`.

#### Examples

```ts
// Create an in-memory database instance
const sdb = new SimpleDB();
// Create a table, load a CSV file, and log its first few rows
const employees = await sdb
  .newTable("employees")
  .loadData("./employees.csv")
  .log();

// Close the database connection and clean up resources
await sdb.close();
```

```ts
// Open an existing DuckDB file, or create it on first use
const sdb = new SimpleDB({ file: "./my_database.db" });
// Perform database operations...
// Execute pending work, save metadata, and close the database connection
await sdb.close();
```

```ts
// Create a database instance with custom options
const sdb = new SimpleDB({
  logSQL: true, // Log SQL immediately before execution
  rowsToLog: 20 // Set the number of rows to log by default
});
```

#### Extends

- `SimpleDB`\<[`SimpleTable`](#simpletable)\>

#### Constructors

##### Constructor

> **new SimpleDB**(`options?`): [`SimpleDB`](#simpledb)

Creates a new SimpleDB instance.

###### Parameters

###### options?

Configuration options for the SimpleDB instance.

###### cacheVerbose?

`boolean`

A flag indicating whether to log verbose cache-related messages.

###### charsToLog?

`number`

The maximum number of characters to display for text-based cells.

###### duckDbCache?

`boolean` \| `null`

A flag indicating whether to use DuckDB's external file cache.

###### explainSQL?

`boolean`

A flag indicating whether to log DuckDB query plans for supported statements.

###### file?

`string`

The path to a persistent DuckDB file, opened or created on first use. If not provided, an in-memory database is used.

###### logDuration?

`boolean`

A flag indicating whether to log the total execution duration.

###### logSQL?

`boolean`

A flag indicating whether to log SQL immediately before execution.

###### memoryLimit?

`string`

The maximum amount of memory DuckDB is allowed to use (for example, `"4GB"`).

###### overwrite?

`boolean`

Whether to replace an existing DuckDB file on first use instead of opening it. Defaults to false.

###### progressBar?

`boolean`

A flag indicating whether to display a progress bar for long-running operations.

###### readOnly?

`boolean`

Opens an existing DuckDB file read-only. Defaults to false. Requires a file and cannot be combined with overwrite.

###### rowsToLog?

`number`

The number of rows to display when logging a table.

###### tempDir?

`string`

The path to the directory used for temporary files.

###### typesToLog?

`boolean`

A flag indicating whether to include data types when logging a table.

###### Returns

[`SimpleDB`](#simpledb)

###### Example

```ts
const sdb = new SimpleDB({ file: "./archive.duckdb", readOnly: true });
const table = await sdb.getTable("employees");
await table.log();
await sdb.close();
```

###### Overrides

`SimpleDBCore<SimpleTable>.constructor`

#### DuckDB

##### customQuery()

> **customQuery**(`query`, `options?`): `Promise`\<`object`[] \| `null`\>

Executes a custom SQL query directly against the DuckDB instance.
With the default `SimpleDB.expressionSyntax: "js"`, queries support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.
Queries run in UTC. When data is returned, temporal values use the same
JavaScript representations as `SimpleTable.getData()`.

`customQuery()` bypasses the dependency and table-generation tracking used
by `SimpleTable.cache()`. Reading or changing a table with `customQuery()`
can therefore cause `cache()` to return stale data. Include a value that
identifies the custom query's dependencies in the cache's `options.inputs`
(such as a table content hash), or use tracked `SimpleTable` methods.

###### Parameters

###### query

`string`

The SQL query string to execute.

###### options?

Configuration options for the query.

###### returnData?

`boolean`

If `true`, the query result is returned. Defaults to `false`.

###### table?

`string`

The name of the table associated with the query, primarily used for debugging and logging.

###### Returns

`Promise`\<`object`[] \| `null`\>

A promise that resolves to the query result as an array of objects if `returnData` is `true`, otherwise `null`.

###### Examples

```ts
// Execute a query without returning data
await sdb.customQuery("CREATE TABLE young_employees AS SELECT * FROM employees WHERE age > 30");
```

```ts
// Execute a query and return the results
const youngEmployees = await sdb.customQuery(
  "SELECT * FROM employees WHERE age < 30",
  { returnData: true }
);
console.log(youngEmployees);
```

###### Inherited from

`SimpleDBCore.customQuery`

##### getExtensions()

> **getExtensions**(): `Promise`\<`object`[]\>

Returns a list of installed DuckDB extensions.

###### Returns

`Promise`\<`object`[]\>

A promise that resolves to an array of objects, each representing an installed extension.

###### Example

```ts
// Get a list of all installed extensions
const extensions = await sdb.getExtensions();
console.log(extensions); // Output: [{ extension_name: "spatial", loaded: true, ... }]
```

###### Inherited from

`SimpleDBCore.getExtensions`

#### File Operations

##### loadDB()

> **loadDB**(`file`): `Promise`\<[`SimpleDB`](#simpledb)\>

Imports a copy of a `.db` or `.duckdb` (DuckDB) or `.sqlite` (SQLite)
file into the current database. The source is opened read-only and detached
after importing; subsequent transformations do not modify the source file.
Imports work with in-memory and writable persistent databases. Existing
table-name conflicts are rejected. A failed import may leave partial changes
in the destination database.

DuckDB files restore embedded SDA index definitions when present. SQLite
imports copy data without SDA index metadata. The `__sda` schema is reserved
for SDA metadata.
To edit an existing DuckDB file in place, use `new SimpleDB({ file })`.

###### Parameters

###### file

`string`

The relative or absolute path to the database file.

###### Returns

`Promise`\<[`SimpleDB`](#simpledb)\>

A promise that resolves to the database, so methods can be chained.

###### Examples

```ts
// Load a DuckDB database file
await sdb.loadDB("./my_database.db");
```

```ts
// Import SQLite tables without modifying the original file
await sdb.loadDB("./my_database.sqlite");
```

```ts
// Import a copy into a persistent DuckDB database
const sdb = new SimpleDB({ file: "./analysis.duckdb" });
await sdb.loadDB("./archive.db");
await sdb.close();
```

###### Inherited from

`SimpleDBCore.loadDB`

##### writeDB()

> **writeDB**(`file`, `options?`): `Promise`\<[`SimpleDB`](#simpledb)\>

Exports a snapshot of the current database after executing pending work.
Does not change the working database or where subsequent changes persist.
DuckDB outputs (`.db` and `.duckdb`) preserve database objects and embed SDA
index definitions in the reserved `__sda` schema.

SQLite output (`.sqlite`) materializes main-schema tables and views as
tables. It does not preserve DuckDB schemas, indexes, constraints, or SDA
metadata, and SQLite type conversion may lose type information. Unsupported
conversions fail without replacing an existing destination.

Existing files require explicit overwrite permission. The completed export
is published only after its connection is detached. Database files attached
to this instance, directories, and symbolic links cannot be replaced.

###### Parameters

###### file

`string`

The relative or absolute path to the output file.

###### options?

Configuration options for writing the database.

###### metadata?

`boolean`

If false, omits logical SDA index definitions from DuckDB exports. Defaults to true. Does not control physical indexes; SQLite exports never include SDA metadata.

###### overwrite?

`boolean`

If true, permits atomic replacement of an existing output file. Defaults to false.

###### Returns

`Promise`\<[`SimpleDB`](#simpledb)\>

A promise that resolves to the database, so methods can be chained.

###### Examples

```ts
// Write the current database to a DuckDB file
await sdb.writeDB("./my_exported_database.db");
```

```ts
// Explicitly replace an earlier snapshot
await sdb.writeDB("./my_exported_database.duckdb", { overwrite: true });
```

```ts
// Export table data for use with SQLite
await sdb.writeDB("./my_exported_database.sqlite");
```

###### Inherited from

`SimpleDBCore.writeDB`

#### Lifecycle

##### close()

> **close**(): `Promise`\<`SimpleDB`\<`SimpleTable`\>\>

Executes pending transformations, saves SDA metadata for writable persistent
databases, and closes the connection and instance. Also cleans up temporary
files and the cache. Does not copy, compact, or replace the database file.

###### Returns

`Promise`\<`SimpleDB`\<`SimpleTable`\>\>

A promise that resolves to the SimpleDB instance after cleanup.

###### Example

```ts
// close() executes queued transformations before cleaning up resources.
table.loadData("data.csv").convert({ price: "number" });
await sdb.close();
```

###### Throws

An error after cleanup when pending execution or cleanup fails.

###### Inherited from

`SimpleDBCore.close`

##### run()

> **run**(): `Promise`\<`SimpleDB`\<`SimpleTable`\>\>

Executes all queued methods across every table in the database. Sync
builder methods (like `filter()` or `convert()`) only queue their
operation; execution happens when an async observer method (like
`getData()`, `log()`, or `writeData()`) is awaited. Use `run()` when
your script ends in pure mutations with nothing to observe and you want
the work done now.

The whole database is flushed in program order, so operations on
different tables execute exactly in the order they were queued. This is
the database-level counterpart to `SimpleTable.run()`.

###### Returns

`Promise`\<`SimpleDB`\<`SimpleTable`\>\>

A promise that resolves to the SimpleDB instance once the queued methods have been executed.

###### Example

```ts
// Nothing is observed after the mutations, so run() executes them.
table1.loadData("data1.csv").convert({ price: "number" });
table2.loadData("data2.csv").filter(`price > 0`);
await sdb.run();
```

###### Inherited from

`SimpleDBCore.run`

#### Other

##### charsToLog

> **charsToLog**: `number` \| `undefined`

The maximum number of characters to display for text and stringified nested cells, including the truncation marker. This does not control column width. Set to Infinity to show the entire text.

###### Example

```ts
const sdb = new SimpleDB({ charsToLog: 150 });
await sdb.newTable().loadArray([{ text: "x".repeat(200) }]).log();
```

###### Default Value

`75`

###### Inherited from

`SimpleDBCore.charsToLog`

##### connection

> **connection**: `DuckDBConnection`

A connection to a DuckDB database.

###### Inherited from

`SimpleDBCore.connection`

##### db

> **db**: `DuckDBInstance`

A DuckDB database instance.

###### Inherited from

`SimpleDBCore.db`

##### defaultTableName

> **defaultTableName**: `boolean`

A flag indicating if the table name was assigned by default.

###### Default Value

`false`

###### Inherited from

`SimpleDBCore.defaultTableName`

##### rowsToLog

> **rowsToLog**: `number`

The number of rows to display when logging a table.

###### Default Value

`10`

###### Inherited from

`SimpleDBCore.rowsToLog`

##### runQuery

> **runQuery**: (`query`, `connection`, `returnData`, `options`) => `Promise`\<`object`[] \| `null`\>

A function for running SQL queries. Subclasses can wrap this seam to observe
execution while forwarding every argument. To run custom SQL, use
`SimpleDB.customQuery()` instead.

###### Parameters

###### query

`string`

The exact SQL statement to execute.

###### connection

`DuckDBConnection`

The DuckDB connection that executes the statement.

###### returnData

`boolean`

Whether to convert and return result rows.

###### options

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

###### Returns

`Promise`\<`object`[] \| `null`\>

The converted rows when requested, otherwise `null`.

###### Example

```ts
const original = table.runQuery;
table.runQuery = (query, connection, returnData, options) => {
  console.log(query);
  return original(query, connection, returnData, options);
};
```

###### Inherited from

`SimpleDBCore.runQuery`

##### typesToLog

> **typesToLog**: `boolean`

A flag indicating whether to include data types when logging a table.

###### Default Value

`false`

###### Inherited from

`SimpleDBCore.typesToLog`

#### Properties

##### cacheSourcesUsed

> **cacheSourcesUsed**: `string`[]

An array of paths to the data sources used in the cache.

###### Default Value

`[]`

###### Inherited from

`SimpleDBCore.cacheSourcesUsed`

##### cacheTimeSaved

> **cacheTimeSaved**: `number`

The total time saved by using the cache, in milliseconds.

###### Default Value

`0`

###### Inherited from

`SimpleDBCore.cacheTimeSaved`

##### cacheTimeWriting

> **cacheTimeWriting**: `number`

The total time spent writing to the cache, in milliseconds.

###### Default Value

`0`

###### Inherited from

`SimpleDBCore.cacheTimeWriting`

##### cacheVerbose

> **cacheVerbose**: `boolean`

Whether to log cache hits and misses, code and input changes, TTL status,
and cache read/write timing.

###### Default Value

`false`

###### Inherited from

`SimpleDBCore.cacheVerbose`

##### duckDbCache

> **duckDbCache**: `boolean` \| `null`

A flag indicating whether to use DuckDB's external file cache.

###### Default Value

`false`

###### Inherited from

`SimpleDBCore.duckDbCache`

##### durationStart

> **durationStart**: `number` \| `undefined`

A timestamp marking the start of a duration measurement.

###### Default Value

`undefined`

###### Inherited from

`SimpleDBCore.durationStart`

##### explainSQL

> **explainSQL**: `boolean`

Whether to log DuckDB query plans before supported statements execute.

###### Example

```ts
const sdb = new SimpleDB({ explainSQL: true });
```

###### Default Value

`false`

###### Inherited from

`SimpleDBCore.explainSQL`

##### expressionSyntax

> `readonly` **expressionSyntax**: `"js"` \| `"sql"`

The operator syntax used by expressions and custom queries in this database.
`"js"` translates JavaScript-style operators (`&&`, `||`, `==`, `===`,
`!==`) and null comparisons within SQL expressions. It does not evaluate
arbitrary JavaScript. `||` remains concatenation when string literals, list
literals, explicit text casts, or `concat()` results make that intent clear.
Otherwise `||` becomes OR; column types are not inferred. Use `concat()`
when concatenation would otherwise be ambiguous, such as `first || last`.
`"sql"` passes SQL through unchanged, including `||` and null comparisons.
Choose the syntax when constructing the database; it applies to all tables.

###### Examples

```ts
const sdb = new SimpleDB({ expressionSyntax: "js" }); // The default mode
// || becomes SQL OR: keep rows where at least one condition is true.
await sdb.newTable().loadArray([{ active: true, admin: false }])
  .filter("active || admin").log();
```

```ts
const sdb = new SimpleDB({ expressionSyntax: "js" });
// && becomes SQL AND: both conditions must be true.
// === becomes SQL =: compare the age with 18.
await sdb.newTable().loadArray([{ active: true, age: 18 }])
  .filter("active && age === 18").log();
```

```ts
const sdb = new SimpleDB({ expressionSyntax: "js" });
// SQL AND and OR also work in JS mode; they pass through unchanged.
// Keep active adults, or anyone who is an admin.
await sdb.newTable().loadArray([{ active: true, age: 18, admin: false }])
  .filter("(active AND age >= 18) OR admin").log();
```

```ts
const sdb = new SimpleDB({ expressionSyntax: "js" });
// Bare column names do not establish concatenation. Use concat() explicitly.
await sdb.newTable().loadArray([{ first: "Jane", last: "Doe" }])
  .addColumn("name", "string", "concat(first, ' ', last)").log();
```

```ts
const sdb = new SimpleDB(); // JS mode is the default
// The string literal ' ' makes concatenation clear, so both || stay unchanged.
await sdb.newTable().loadArray([{ first: "Jane", last: "Doe" }])
  .addColumn("name", "string", "first || ' ' || last").log();
```

```ts
const sdb = new SimpleDB({ expressionSyntax: "sql" });
// SQL mode preserves || as concatenation: the name becomes "Jane Doe".
await sdb.newTable().loadArray([{ first: "Jane", last: "Doe" }])
  .addColumn("name", "string", "first || ' ' || last").log();
```

```ts
const sdb = new SimpleDB({ expressionSyntax: "sql" });
// Use SQL AND and OR for logical conditions; && and || are not translated.
// Both active and adult must be true, unless admin is true.
await sdb.newTable().loadArray([{ active: true, age: 18, admin: false }])
  .filter("(active AND age >= 18) OR admin").log();
```

###### Default Value

`"js"`

###### Inherited from

`SimpleDBCore.expressionSyntax`

##### file

> **file**: `string`

The path to the persistent DuckDB database, opened or created on first use.
If not provided, an in-memory database is used. Imports and exports do not change this path.

###### Default Value

`:memory:`

###### Inherited from

`SimpleDBCore.file`

##### logDuration

> **logDuration**: `boolean`

A flag indicating whether to log the total execution duration.

###### Default Value

`false`

###### Inherited from

`SimpleDBCore.logDuration`

##### logSQL

> **logSQL**: `boolean`

Whether to log each SQL statement immediately before execution.

###### Example

```ts
const sdb = new SimpleDB({ logSQL: true });
```

###### Default Value

`false`

###### Inherited from

`SimpleDBCore.logSQL`

##### memoryLimit

> **memoryLimit**: `string` \| `undefined`

The maximum amount of memory DuckDB is allowed to use (e.g., `'4GB'`). Defaults to 80% of system RAM.

###### Default Value

`undefined`

###### Inherited from

`SimpleDBCore.memoryLimit`

##### overwrite

> **overwrite**: `boolean`

Whether to replace an existing DuckDB file on first use instead of opening it.

###### Default Value

`false`

###### Inherited from

`SimpleDBCore.overwrite`

##### progressBar

> **progressBar**: `boolean`

A flag indicating whether to display a progress bar for long-running operations.

###### Default Value

`false`

###### Inherited from

`SimpleDBCore.progressBar`

##### readOnly

> **readOnly**: `boolean`

Whether the persistent DuckDB file is opened read-only. Requires an existing
file and cannot be combined with `overwrite`. DuckDB rejects writes to it.

###### Example

```ts
const sdb = new SimpleDB({ file: "./archive.duckdb", readOnly: true });
const table = await sdb.getTable("employees");
await table.log();
await sdb.close();
```

###### Default Value

`false`

###### Inherited from

`SimpleDBCore.readOnly`

##### tableIncrement

> **tableIncrement**: `number`

A counter for incrementing default table names.

###### Default Value

`1`

###### Inherited from

`SimpleDBCore.tableIncrement`

##### tempDir

> **tempDir**: `string` \| `undefined`

The path to the directory used for temporary files when data exceeds the memory limit (e.g., `'/tmp/duckdb_swap'`). Defaults to `.tmp` for in-memory databases or `<file>.tmp` for file-based databases. Temporary directories are automatically removed when calling `close()`.

###### Default Value

`undefined`

###### Inherited from

`SimpleDBCore.tempDir`

#### Table Management

##### getTable()

> **getTable**(`name`): `Promise`\<[`SimpleTable`](#simpletable)\>

Retrieves an existing SimpleTable instance from the database.

###### Parameters

###### name

`string`

The name of the table to retrieve.

###### Returns

`Promise`\<[`SimpleTable`](#simpletable)\>

A promise that resolves to the SimpleTable instance if found.

###### Example

```ts
// Retrieve the "employees" table
const employees = await sdb.getTable("employees");
await employees.log();
```

###### Inherited from

`SimpleDBCore.getTable`

##### getTableNames()

> **getTableNames**(): `Promise`\<`string`[]\>

Returns an array of all table names in the database, sorted alphabetically.

###### Returns

`Promise`\<`string`[]\>

A promise that resolves to an array of table names.

###### Example

```ts
// Get all table names
const tableNames = await sdb.getTableNames();
console.log(tableNames); // Output: ["employees", "customers"]
```

###### Inherited from

`SimpleDBCore.getTableNames`

##### getTables()

> **getTables**(): readonly [`SimpleTable`](#simpletable)[]

Returns an array of all SimpleTable instances in the database.

The returned array is a snapshot and cannot mutate the database's internal
table registry.

###### Returns

readonly [`SimpleTable`](#simpletable)[]

A read-only array of SimpleTable instances.

###### Example

```ts
// Get all SimpleTable instances
const tables = sdb.getTables();
```

###### Inherited from

`SimpleDBCore.getTables`

##### hasTable()

> **hasTable**(`table`): `Promise`\<`boolean`\>

Checks if a table exists in the database.

###### Parameters

###### table

`string` \| [`SimpleTable`](#simpletable)

The name of the table or a SimpleTable instance.

###### Returns

`Promise`\<`boolean`\>

A promise that resolves to `true` if the table exists, `false` otherwise.

###### Examples

```ts
// Check if a table named "employees" exists
const exists = await sdb.hasTable("employees");
console.log(exists); // Output: true or false
```

```ts
// Check if a SimpleTable instance exists in the database
const myTable = sdb.newTable("my_data");
const existsInstance = await sdb.hasTable(myTable);
console.log(existsInstance); // Output: true or false
```

###### Inherited from

`SimpleDBCore.hasTable`

##### logTableNames()

> **logTableNames**(): `Promise`\<[`SimpleDB`](#simpledb)\>

Logs the names of all tables in the database to the console, sorted alphabetically.

###### Returns

`Promise`\<[`SimpleDB`](#simpledb)\>

A promise that resolves to the database, so methods can be chained.

###### Example

```ts
// Log all table names to the console
await sdb.logTableNames();
// Example output: SimpleDB - Tables:  ["employees","customers"]
```

###### Inherited from

`SimpleDBCore.logTableNames`

##### newTable()

> **newTable**(`name?`): [`SimpleTable`](#simpletable)

Creates a new SimpleTable instance within the database.
The name must be unique among registered tables, ignoring ASCII letter case.

###### Parameters

###### name?

`string`

The name of the new table. If not provided, a default name is generated (e.g., "table1").

###### Returns

[`SimpleTable`](#simpletable)

A new table instance.

###### Examples

```ts
// Create a table with a default name (e.g., "table1", "table2", etc.)
const dataTable = await sdb
  .newTable()
  .loadArray([{ value: 1 }])
  .log();
```

```ts
// Create a table with a specific name
const employees = await sdb
  .newTable("employees")
  .loadData("employees.csv")
  .log();
```

###### Inherited from

`SimpleDBCore.newTable`

##### removeTables()

> **removeTables**(`tables`): `Promise`\<[`SimpleDB`](#simpledb)\>

Removes one or more tables from the database.

###### Parameters

###### tables

`string` \| [`SimpleTable`](#simpletable) \| (`string` \| [`SimpleTable`](#simpletable))[]

A single table or an array of tables to remove, specified by name or as SimpleTable instances. Pass `"all"` to remove all tables.

###### Returns

`Promise`\<[`SimpleDB`](#simpledb)\>

A promise that resolves to the database, so methods can be chained.

###### Examples

```ts
// Remove a single table by name
await sdb.removeTables("employees");
```

```ts
// Remove multiple tables by name
await sdb.removeTables(["customers", "products"]);
```

```ts
// Remove a single table using a SimpleTable instance
const employeesTable = sdb.newTable("employees");
// ... load data ...
await sdb.removeTables(employeesTable);
```

```ts
// Remove all tables
await sdb.removeTables("all");
```

###### Inherited from

`SimpleDBCore.removeTables`

##### selectTables()

> **selectTables**(`tables`): `Promise`\<[`SimpleDB`](#simpledb)\>

Selects one or more tables to keep in the database, removing all others.

###### Parameters

###### tables

`string` \| [`SimpleTable`](#simpletable) \| (`string` \| [`SimpleTable`](#simpletable))[]

A single table or an array of tables to select, specified by name or as SimpleTable instances.

###### Returns

`Promise`\<[`SimpleDB`](#simpledb)\>

A promise that resolves to the database, so methods can be chained.

###### Examples

```ts
// Select a single table by name, removing all other tables
await sdb.selectTables("employees");
```

```ts
// Select multiple tables by name, removing all other tables
await sdb.selectTables(["customers", "products"]);
```

```ts
// Select a single table using a SimpleTable instance
const employeesTable = sdb.newTable("employees");
// ... load data ...
await sdb.selectTables(employeesTable);
```

###### Inherited from

`SimpleDBCore.selectTables`
