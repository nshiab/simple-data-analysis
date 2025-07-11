# Simple data analysis (SDA)

SDA is an easy-to-use and high-performance JavaScript library for data analysis.
You can use it with tabular and geospatial data.

The library is available on [JSR](https://jsr.io/@nshiab/simple-data-analysis)
with its [documentation](https://jsr.io/@nshiab/simple-data-analysis/doc).

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

## Quick setup

Create a folder and run [setup-sda](https://github.com/nshiab/setup-sda) in it
with:

```bash
# Deno >= 2.2.x
deno -A jsr:@nshiab/setup-sda

# Node.js >= 22.6.x
npx setup-sda

# Bun
bunx --bun setup-sda
```

Here are available options:

- `--example`: adds example files
- `--scrape`: adds web scraping dependencies
- `--svelte`: adds a Svelte project
- `--pages`: adds a GitHub Pages Actions workflow (works just with `--svelte`)
- `--git`: initializes a git repository and commits the initial files
- `--env`: adds a `.env` file for environment variables and loads them when
  running

You can combine options, for example, this will install web scraping
dependencies, set up a Svelte project with example files, initialize a git
repository, make a first commit, and add a GitHub Pages Actions workflow:

```bash
deno -A jsr:@nshiab/setup-sda --scrape --svelte --example --pages --git
```

## Manual installation

If you want to add the library to an existing project, run this:

```bash
# Deno >= 2.2.x
deno install --node-modules-dir=auto --allow-scripts=npm:playwright-chromium jsr:@nshiab/simple-data-analysis
# To run with Deno
deno run -A main.ts

# Node.js
npx jsr add @nshiab/simple-data-analysis

# Bun
bunx jsr add @nshiab/simple-data-analysis
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
analytical database. Under the hood, SDA sends SQL queries to be executed by
DuckDB. We use [duckdb-node-neo](https://github.com/duckdb/duckdb-node-neo). For
geospatial computations, we rely on the
[duckdb_spatial](https://github.com/duckdb/duckdb_spatial) extension.

The syntax and the available methods were inspired by
[Pandas](https://github.com/pandas-dev/pandas) (Python) and the
[Tidyverse](https://www.tidyverse.org/) (R).

You can also write your own SQL queries if you want to (check the
[customQuery method](https://jsr.io/@nshiab/simple-data-analysis/doc/~/SimpleDB.prototype.customQuery))
or use JavaScript to process your data (check the
[updateWithJS method](https://jsr.io/@nshiab/simple-data-analysis/doc/~/SimpleTable.prototype.updateWithJS)).

Several methods can also leverage LLMs (large language models). See
[aiRowByRow](https://jsr.io/@nshiab/simple-data-analysis/doc/~/SimpleTable.prototype.aiRowByRow)
for cleaning, extracting, or categorizing data, and
[aiQuery](https://jsr.io/@nshiab/simple-data-analysis/doc/~/SimpleTable.prototype.aiQuery)
for interacting with your data using natural language. For embeddings and
semantic search, have a look at
[aiEmbeddings](https://jsr.io/@nshiab/simple-data-analysis/doc/~/SimpleTable.prototype.aiEmbeddings)
and
[aiVectorSimilarity](https://jsr.io/@nshiab/simple-data-analysis/doc/~/SimpleTable.prototype.aiVectorSimilarity).

Feel free to start a conversation or open an issue. Check how you can
[contribute](https://github.com/nshiab/simple-data-analysis/blob/main/CONTRIBUTING.md).

## Performance

### Tabular data

To test and compare the library's performance, we calculated the average
temperature per decade and city with the daily temperatures from the
[Adjusted and Homogenized Canadian Climate Data](https://api.weather.gc.ca/collections/ahccd-annual).
See [this repository](https://github.com/nshiab/simple-data-analysis-benchmarks)
for the code.

We ran the same calculations with **simple-data-analysis@4.0.1** (Node.js, Bun,
and Deno), **Pandas (Python)**, and the **tidyverse (R)**.

In each script, we:

1. Loaded a CSV file (_Importing_)
2. Selected four columns, removed rows with missing temperature, converted date
   strings to date and temperature strings to float (_Cleaning_)
3. Added a new column _decade_ and calculated the decade (_Modifying_)
4. Calculated the average temperature per decade and city (_Summarizing_)
5. Wrote the cleaned-up data that we computed the averages from in a new CSV
   file (_Writing_)

Each script has been run ten times on a MacBook Pro (Apple M1 Pro / 16 GB).

With _ahccd.csv_:

- 1.7 GB
- 773 cities
- 20 columns
- 22,051,025 rows

Thanks to DuckDB, **simple-data-analysis** is the fastest option.

![A chart showing the processing duration of multiple scripts in various languages](./assets/big-file.png)

We also tried the One Billion Row Challenge, which involves computing the min,
mean, and max temperatures for hundreds of cities in a 1,000,000,000 rows CSV
file. The library has been able to crunch the numbers in 50 seconds on the same
computer (Apple M1 Pro / 16 GB). For more, check this
[repo](https://github.com/nshiab/1brc) forked from this
[one](https://github.com/gunnarmorling/1brc). The JavaScript code is
[here](https://github.com/nshiab/1brc/blob/main/index.js).

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

Each script has been run ten times on a MacBook Pro (Apple M1 Pro / 16 GB).

As we can see, **simple-data-analysis** is a bit slower than Python's GeoPandas
but faster than R's sf package. Note that the spatial extension for DuckDB is a
[work in progress](https://github.com/duckdb/duckdb_spatial).

![A chart showing the processing duration of multiple scripts in various languages, for geospatial computations](./assets/spatial.png)

DuckDB, which powers SDA, can also be used with
[Python](https://duckdb.org/docs/api/python/overview.html) and
[R](https://duckdb.org/docs/api/r).

## Examples

In this example, we load a CSV file with the latitude and longitude of 2023
wildfires in Canada, create point geometries from it, do a spatial join with
provinces' boundaries, and then compute the number of fires and the total area
burnt per province. We are create charts and write the results to a file.

If you are using Deno, make sure to install and enable the
[Deno extension](https://docs.deno.com/runtime/getting_started/setup_your_environment/).

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
import { barX, plot } from "@observablehq/plot";

// We start a SimpleDB instance.
const sdb = new SimpleDB();

// We create a new table
const fires = sdb.newTable("fires");
// We fetch the wildfires data. It's a csv.
await fires.loadData(
  "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/geodata/files/firesCanada2023.csv",
);
// We create point geometries from the lat and lon columns
// and we store the points in the new column geom
await fires.points("lat", "lon", "geom");
// We log the fires
await fires.logTable();

// We create a new table
const provinces = sdb.newTable("provinces");
// We fetch the provinces' boundaries. It's a geojson.
await provinces.loadGeoData(
  "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/geodata/files/CanadianProvincesAndTerritories.json",
);
// We log the provinces
await provinces.logTable();

// We match fires with provinces
// and we output the results into a new table.
// By default, joinGeo will automatically look
// for columns storing geometries in the tables,
// do a left join, and put the results
// in the left table. For non-spatial data,
// you can use the method join.
const firesInsideProvinces = await fires.joinGeo(provinces, "inside", {
  outputTable: "firesInsideProvinces",
});

// We summarize to count the number of fires
// and sum up the area burnt in each province.
await firesInsideProvinces.summarize({
  values: "hectares",
  categories: "nameEnglish",
  summaries: ["count", "sum"],
  decimals: 0,
});
// We rename columns.
await firesInsideProvinces.renameColumns({
  count: "nbFires",
  sum: "burntArea",
});
// We want the province with
// the greatest burnt area first.
await firesInsideProvinces.sort({ burntArea: "desc" });

// We log the results. By default, the method
// logs the first 10 rows, but there is 13
// rows in our data. We also log the data types.
await firesInsideProvinces.logTable({ nbRowsToLog: 13, types: true });

// We can also log a bar chart directly in the terminal...
await firesInsideProvinces.logBarChart("nameEnglish", "burntArea");

// ... or make a fancier chart or map
// with Observable Plot (don't forget to install it)
// and save it to a file.
const chart = (data: unknown[]) =>
  plot({
    marginLeft: 170,
    grid: true,
    x: { tickFormat: (d) => `${d / 1_000_000}M`, label: "Burnt area (ha)" },
    y: { label: null },
    color: { scheme: "Reds" },
    marks: [
      barX(data, {
        x: "burntArea",
        y: "nameEnglish",
        fill: "burntArea",
        sort: { y: "-x" },
      }),
    ],
  });
await firesInsideProvinces.writeChart(chart, "./chart.png");

// And we can write the data to a parquet, json or csv file.
// For geospatial data, you can use writeGeoData to
// write geojson or geoparquet files.
await firesInsideProvinces.writeData("./firesInsideProvinces.parquet");

// We close everything.
await sdb.done();
```

Here's what you should see in your console if your run this script.

![The console tab in VS Code showing the result of simple-data-analysis computations.](./assets/nodejs-console-with-chart.png)

You'll also find a `chart.png` file and a `firesInsideProvinces.parquet` file in
your folder.

![A chart showing the burnt area of wildfires in Canadian provinces.](./assets/chart.png)

## More on charts and maps

You can easily display charts and maps directly in the terminal with the
[`logBarChart`](https://jsr.io/@nshiab/simple-data-analysis/doc/~/SimpleTable.prototype.logBarChart),
[`logDotChart`](https://jsr.io/@nshiab/simple-data-analysis/doc/~/SimpleTable.prototype.logDotChart),
[`logLineChart`](https://jsr.io/@nshiab/simple-data-analysis/doc/~/SimpleTable.prototype.logLineChart)
and
[`logHistogram`](https://jsr.io/@nshiab/simple-data-analysis/doc/~/SimpleTable.prototype.logHistogram)
methods.

But you can also create [Observable Plot](https://github.com/observablehq/plot)
charts as an image file (`.png`, `.jpeg` or `.svg`) with
[`writeChart`](https://jsr.io/@nshiab/simple-data-analysis/doc/~/SimpleTable.prototype.writeChart).

Here's an example.

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
import { dodgeX, dot, plot } from "@observablehq/plot";

const sdb = new SimpleDB();
const table = sdb.newTable();

await table.loadData(
  "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/geodata/files/firesCanada2023.csv",
);
// We keep only the fires that are larger than 1 hectare.
await table.filter(`hectares > 1`);
// We rename the causes.
await table.replace("cause", { "H": "Human", "N": "Natural", "U": "Unknown" });
await table.logTable();

// Let's create a beeswarm chart with a log scale.
// We facet over the causes.
const chart = (data: unknown[]) =>
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
  });

const path = "./chart.png";

await table.writeChart(chart, path);

await sdb.done();
```

![Beeswarm chart showing the size of wildfires in Canada in 2023.](./assets/beeswarm.png)

If you want to create [Observable Plot](https://github.com/observablehq/plot)
maps, you can use
[`writeMap`](https://jsr.io/@nshiab/simple-data-analysis/doc/~/SimpleTable.prototype.writeMap).

Here's an example.

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";
import { geo, plot } from "@observablehq/plot";

const sdb = new SimpleDB();
const provinces = sdb.newTable("provinces");

// We fetch the Canadian provinces boundaries.
await provinces.loadGeoData(
  "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/geodata/files/CanadianProvincesAndTerritories.json",
);
await provinces.logTable();

// We fetch the fires.
const fires = sdb.newTable("fires");
await fires.loadData(
  "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/geodata/files/firesCanada2023.csv",
);
// We create a new column to store the points as geometries.
await fires.points("lat", "lon", "geom");
// We select the columns of interest and filter out
// fires less than 1 hectare.
await fires.replace("cause", { "H": "Human", "N": "Natural", "U": "Unknown" });
await fires.selectColumns(["geom", "hectares", "cause"]);
await fires.filter(`hectares > 0`);
await fires.logTable();

// Now, we want the provinces and the fires in the same table
// to draw our map with the writeMap method.
// First, we clone the provinces table.
const provincesAndFires = await provinces.cloneTable({
  outputTable: "provincesAndFires",
});
// Now we can insert the fires into the provincesAndFires table.
// By default, SDA will throw an error if the tables don't have the
// same columns. So we set the unifyColumns option to true.
await provincesAndFires.insertTables(fires, { unifyColumns: true });
// To make our lives easier, we add a column to
// distinguish between provinces and fires.
await provincesAndFires.addColumn("isFire", "boolean", `hectares > 0`);
await provincesAndFires.logTable();

// This is our function to draw the map, using the Plot library.
// The geoData will come from the our provincesAndFires table
// as GeoJSON data. Each row of the table is a feature, and each
// feature has properties matching the columns of the table.
const map = (geoData: {
  features: {
    properties: { [key: string]: unknown };
  }[];
}) => {
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
};

// This is the path where the map will be saved.
const path = "./map.png";

// Now we can call writeMap.
await provincesAndFires.writeMap(map, path);

await sdb.done();
```

![Map showing the wildfires in Canada in 2023.](./assets/map.png)

## Caching fetched and computed data

Instead of running the same code over and over again, you can cache the results.
This can speed up your workflow, especially when fetching data or performing
computationally expensive operations.

Here's the previous example adapted to cache data. For more information, check
the
[cache method documentation](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html#cache).

The data is cached in the hidden folder `.sda-cache` at the root of your code
repository. Make sure to add it to your `.gitignore`. If you want to clean your
cache, just delete the folder.

If you set up with `setup-sda` (see _Quick setup_ at the top), `.sda-cache` is
automatically added to your `.gitignore` and you can use `npm run clean` or
`bun run clean` or `deno task clean` to clear the cache.

```ts
import { SimpleDB } from "@nshiab/simple-data-analysis";

// We enable two options to make our lives easier.
// cacheVerbose will log information about the cached
// data, and logDuration will log the total duration between
// the creation of this SimpleDB instance and its last operation.
const sdb = new SimpleDB({ cacheVerbose: true, logDuration: true });

const fires = sdb.newTable("fires");

// We cache these steps with a ttl of 60 seconds.
// On the first run, the data will be fetched
// and stored in the hidden folder .sda-cache.
// If you rerun the script less than 60 seconds
// later, the data won't be fetched but loaded
// from the local cache. However, if you run the
// code after 60 seconds, the data will be
// considered outdated and fetched again.
// After another 60 seconds, the new data in the cache will
// expire again. This is useful when working with scraped data.
// If you update the code passed to the cache method,
// everything starts over.
await fires.cache(
  async () => {
    await fires.loadData(
      "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/geodata/files/firesCanada2023.csv",
    );
    await fires.points("lat", "lon", "geom");
  },
  { ttl: 60 },
);

const provinces = sdb.newTable("provinces");

// Same thing here, except there is no ttl option,
// so the cached data will never expire unless you delete
// the hidden folder .sda-cache. Again, if you update
// the code passed to the cache method, everything
// starts over.
await provinces.cache(async () => {
  await provinces.loadGeoData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/geodata/files/CanadianProvincesAndTerritories.json",
  );
});

const firesInsideProvinces = sdb.newTable("firesInsideProvinces");

// While caching is quite useful when fetching data,
// it's also handy for computationally expensive
// operations like joins and summaries.
// Since the fires table has a ttl of 60 seconds
// and we depend on it here, we need a ttl equal
// or lower. Otherwise, we won't work with
// up-to-date data.
await firesInsideProvinces.cache(
  async () => {
    await fires.joinGeo(provinces, "inside", {
      outputTable: "firesInsideProvinces",
    });
    await firesInsideProvinces.removeMissing();
    await firesInsideProvinces.summarize({
      values: "hectares",
      categories: "nameEnglish",
      summaries: ["count", "sum"],
      decimals: 0,
    });
    await firesInsideProvinces.renameColumns({
      count: "nbFires",
      sum: "burntArea",
    });
    await firesInsideProvinces.sort({ burntArea: "desc" });
  },
  { ttl: 60 },
);

await firesInsideProvinces.logTable({ nbRowsToLog: 13, types: true });
await firesInsideProvinces.logBarChart("nameEnglish", "burntArea");

// It's important to call done() at the end.
// This method will remove the unused files
// in the cache. It will also log the total duration
// if the logDuration option was set to true.
await sdb.done();
```

After the first run, here's what you'll see in your terminal. For each
`cache()`, a file storing the results has been written in `.sda-cache`.

The whole script took around a second to complete.

```
Nothing in cache. Running and storing in cache.
Duration: 311 ms. Wrote ./.sda-cache/fires.ff...68f.geojson.

Nothing in cache. Running and storing in cache.
Duration: 397 ms. Wrote ./.sda-cache/provinces.42...55.geojson.

Nothing in cache. Running and storing in cache.
Duration: 49 ms. Wrote ./.sda-cache/firesInsideProvinces.71...a8.parquet.

table firesInsideProvinces:
┌─────────┬────────────┬─────────────────────────────┬─────────┬───────────┐
│ (index) │ value      │ nameEnglish                 │ nbFires │ burntArea │
├─────────┼────────────┼─────────────────────────────┼─────────┼───────────┤
│ 0       │ 'hectares' │ 'Quebec'                    │ 706     │ 5024737   │
│ 1       │ 'hectares' │ 'Northwest Territories'     │ 314     │ 4253907   │
│ 2       │ 'hectares' │ 'Alberta'                   │ 1208    │ 3214444   │
│ 3       │ 'hectares' │ 'British Columbia'          │ 2496    │ 2856625   │
│ 4       │ 'hectares' │ 'Saskatchewan'              │ 560     │ 1801903   │
│ 5       │ 'hectares' │ 'Ontario'                   │ 741     │ 441581    │
│ 6       │ 'hectares' │ 'Yukon'                     │ 227     │ 395461    │
│ 7       │ 'hectares' │ 'Manitoba'                  │ 301     │ 199200    │
│ 8       │ 'hectares' │ 'Nova Scotia'               │ 208     │ 25017     │
│ 9       │ 'hectares' │ 'Newfoundland and Labrador' │ 85      │ 21833     │
│ 10      │ 'hectares' │ 'Nunavut'                   │ 1       │ 2700      │
│ 11      │ 'hectares' │ 'New Brunswick'             │ 202     │ 854       │
│ 12      │ 'hectares' │ null                        │ 124     │ 258       │
└─────────┴────────────┴─────────────────────────────┴─────────┴───────────┘
13 rows in total (nbRowsToLog: 13)

SimpleDB - Done in 891 ms
```

If you run the script less than 60 seconds after the first run, here's what
you'll see.

Thanks to caching, the script ran five times faster!

```
Found ./.sda-cache/fires.ff...8f.geojson in cache.
ttl of 60 sec has not expired. The creation date is July 5, 2024, at 4:25 p.m.. There are 11 sec, 491 ms left.
Data loaded in 151 ms. Running the computations took 311 ms last time. You saved 160 ms.

Found ./.sda-cache/provinces.42...55.geojson in cache.
Data loaded in 8 ms. Running the computations took 397 ms last time. You saved 389 ms.

Found ./.sda-cache/firesInsideProvinces.71...a8.parquet in cache.
ttl of 60 sec has not expired. The creation date is July 5, 2024, at 4:25 p.m.. There are 11 sec, 792 ms left.
Data loaded in 1 ms. Running the computations took 49 ms last time. You saved 48 ms.

table firesInsideProvinces:
┌─────────┬────────────┬─────────────────────────────┬─────────┬───────────┐
│ (index) │ value      │ nameEnglish                 │ nbFires │ burntArea │
├─────────┼────────────┼─────────────────────────────┼─────────┼───────────┤
│ 0       │ 'hectares' │ 'Quebec'                    │ 706     │ 5024737   │
│ 1       │ 'hectares' │ 'Northwest Territories'     │ 314     │ 4253907   │
│ 2       │ 'hectares' │ 'Alberta'                   │ 1208    │ 3214444   │
│ 3       │ 'hectares' │ 'British Columbia'          │ 2496    │ 2856625   │
│ 4       │ 'hectares' │ 'Saskatchewan'              │ 560     │ 1801903   │
│ 5       │ 'hectares' │ 'Ontario'                   │ 741     │ 441581    │
│ 6       │ 'hectares' │ 'Yukon'                     │ 227     │ 395461    │
│ 7       │ 'hectares' │ 'Manitoba'                  │ 301     │ 199200    │
│ 8       │ 'hectares' │ 'Nova Scotia'               │ 208     │ 25017     │
│ 9       │ 'hectares' │ 'Newfoundland and Labrador' │ 85      │ 21833     │
│ 10      │ 'hectares' │ 'Nunavut'                   │ 1       │ 2700      │
│ 11      │ 'hectares' │ 'New Brunswick'             │ 202     │ 854       │
│ 12      │ 'hectares' │ null                        │ 124     │ 258       │
└─────────┴────────────┴─────────────────────────────┴─────────┴───────────┘
13 rows in total (nbRowsToLog: 13)

SimpleDB - Done in 184 ms / You saved 707 ms by using the cache
```

And if you run the script 60 seconds later, the fires and join/summary caches
will have expired, but not the provinces one. Some of the code will have run,
but not everything. The script still ran 1.5 times faster. This is quite handy
in complex analysis with big datasets. The less you wait, the more fun you have!

```
Found ./.sda-cache/fires.ff...8f.geojson in cache
ttl of 60 sec has expired. The creation date is July 5, 2024, at 4:25 p.m.. It's is 4 min, 1 sec, 172 ms ago.
Running and storing in cache.
Duration: 424 ms. Wrote ./.sda-cache/fires.ff...8f.geojson.

Found ./.sda-cache/provinces.42...55.geojson in cache.
Data loaded in 10 ms. Running the computations took 397 ms last time. You saved 387 ms.

Fond ./.sda-cache/firesInsideProvinces.71...a8.parquet in cache
ttl of 60 sec has expired. The creation date is July 5, 2024, at 4:25 p.m.. It's is 4 min, 1 sec, 239 ms ago.
Running and storing in cache.
Duration: 42 ms. Wrote ./.sda-cache/firesInsideProvinces.71...a8.parquet.

table firesInsideProvinces:
┌─────────┬────────────┬─────────────────────────────┬─────────┬───────────┐
│ (index) │ value      │ nameEnglish                 │ nbFires │ burntArea │
├─────────┼────────────┼─────────────────────────────┼─────────┼───────────┤
│ 0       │ 'hectares' │ 'Quebec'                    │ 706     │ 5024737   │
│ 1       │ 'hectares' │ 'Northwest Territories'     │ 314     │ 4253907   │
│ 2       │ 'hectares' │ 'Alberta'                   │ 1208    │ 3214444   │
│ 3       │ 'hectares' │ 'British Columbia'          │ 2496    │ 2856625   │
│ 4       │ 'hectares' │ 'Saskatchewan'              │ 560     │ 1801903   │
│ 5       │ 'hectares' │ 'Ontario'                   │ 741     │ 441581    │
│ 6       │ 'hectares' │ 'Yukon'                     │ 227     │ 395461    │
│ 7       │ 'hectares' │ 'Manitoba'                  │ 301     │ 199200    │
│ 8       │ 'hectares' │ 'Nova Scotia'               │ 208     │ 25017     │
│ 9       │ 'hectares' │ 'Newfoundland and Labrador' │ 85      │ 21833     │
│ 10      │ 'hectares' │ 'Nunavut'                   │ 1       │ 2700      │
│ 11      │ 'hectares' │ 'New Brunswick'             │ 202     │ 854       │
│ 12      │ 'hectares' │ null                        │ 124     │ 258       │
└─────────┴────────────┴─────────────────────────────┴─────────┴───────────┘
13 rows in total (nbRowsToLog: 13)

SimpleDB - Done in 594 ms / You saved 297 ms by using the cache
```
