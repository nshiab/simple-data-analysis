# Simple data analysis (SDA) in JavaScript

This repository is maintained by [Nael Shiab](http://naelshiab.com/), computational journalist and senior data producer at [CBC/Radio-Canada](https://cbc.radio-canada.ca/).

To install with NPM:

```
npm i simple-data-analysis
```

These project's goals are:

-   To offer a high performance and convenient solution in JavaScript for data analysis. It's based on [DuckDB](https://duckdb.org/) and inspired by [Pandas](https://github.com/pandas-dev/pandas) (Python) and the [Tidyverse](https://www.tidyverse.org/) (R).

-   To standardize and accelerate frontend/backend workflows with a simple-to-use library working both in the browser and with NodeJS (and similar runtimes).

-   To ease the way for non-coders (especially journalists and web developers) into the beautiful world of data analysis and data visualization in JavaScript.

The documentation is available [here](https://nshiab.github.io/simple-data-analysis.js/). Examples with Observable notebooks can be found [here](https://observablehq.com/@nshiab/simple-data-analysis?collection=@nshiab/simple-data-analysis-in-javascript).

Feel free to start a conversation or open an issue. Check [how you can contribute](https://github.com/nshiab/simple-data-analysis/blob/main/CONTRIBUTING.md).

## Core principles

SDA is based on [duckdb-node](https://github.com/duckdb/duckdb-node) and [duckdb-wasm](https://github.com/duckdb/duckdb-wasm). DuckDB is a high-performance analytical database system. Under the hood, SDA sends SQL queries to be executed by DuckDB. You also have the flexibity of writing your own queries if you want to.

To make charts on the Web, we enjoy using [Observable Plot](https://github.com/observablehq/plot). For NodeJS and similar runtimes, the `writeChart` function is available. It emulates a browser with [jsdom](https://github.com/jsdom/jsdom) and accepts Plot options as a parameter to write a chart as a local file. Of course, you can use any other libraries to make charts if you want to.

The focus is on providing code that is easy to use and understand, with a library that can be used both in the front-end (web browsers) and back-end (NodeJS and similar runtimes).

## About v2

v2.0.0 is a complete rewrite of the library, with many breaking changes.

The minified bundle is two times smaller, when gzipped and delivered with a CDN like [jsDelivr](https://www.jsdelivr.com/package/npm/simple-data-analysis):

-   v1.8.2 was ≈ 123kB
-   v2.0.0 is ≈ 54kB

v2.0.0 is X times faster than v1.8.2. Performance is now comparable to Pandas (Python) and Tidyverse packages (R).

Here's how much time it took to open a X GB CSV file with daily temperatures for XXX cities in Canada, compute the average temperature per decade and export a CSV file again. The scripts used in this very basic test could be found here (ADD REPO) and were run 10 times on a 2021 MacBook Pro, with an M1 Pro chip and 16GB of memory.

-   Node vX.X.X and SDA v1.8.2 : xx sec
-   Bun vX.X.X and SDA v1.8.2 : xx sec
-   Node vX.X.X and v2.0.0 : xx sec
-   Bun vX.X.X and v2.0.0 : xx sec
-   Python vX.X.X and Pandas vX.X.X
-   R vX.X.X and Tidyverse vX.X.X

Note that DuckDB, that powers SDA, can also be used with [Python](https://duckdb.org/docs/api/python/overview.html) and [R](https://duckdb.org/docs/api/r). But it wasn't the purpose of this test.

## SDA in an HTML page

If you want to add the library directly to your webpage, you can use the minified bundle from a npm-based CDN like jsDelivr.

SDA is only ≈50kB.

Here's an example.

```ts
// Load the library in your browser.
<script src="https://cdn.jsdelivr.net/npm/simple-data-analysis@latest">
  // If you have a source map warning in the console,
  // you can use src="https://cdn.jsdelivr.net/npm/simple-data-analysis@latest/dist/simple-data-analysis.min.js"
</script>

<script>
  async function main() {
    // We start a new instance of SimpleDB
    const simpleDB = await new sda.SimpleDB();

    // We load data from remote file.
    await simpleDB.loadData(
      "employees",
      "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/employees.csv"
    );

    // We log the data in the console.
    await simpleDB.logTable("employees");
  }

  main();
</script>
```

## SDA with NodeJS and similar runtimes

## SDA with Observable notebooks

## SDA-Flow

This project is related to [SDA-Flow](https://github.com/nshiab/simple-data-analysis-flow), which allows you to use the simple-data-analysis.js library without code. Test it here (still under heavy development and still running with v1.x): https://nshiab.github.io/simple-data-analysis-flow/.
