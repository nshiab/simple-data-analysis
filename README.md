# Simple data analysis (SDA) in JavaScript

This repository is maintained by [Nael Shiab](http://naelshiab.com/), senior data producer at [CBC/Radio-Canada](https://cbc.radio-canada.ca/).

These project's goals are:

-   To offer a high performance and convenient solution in JavaScript for data analysis. It's based on [DuckDB](https://duckdb.org/) and inspired by [Pandas](https://github.com/pandas-dev/pandas) in Python and the [tidyverse](https://www.tidyverse.org/) in R.

-   To standardize and accelerate frontend/backend workflows with a simple-to-use library working both in the browser and with NodeJS (and other runtimes).

-   To ease the way for non-coders (especially journalists) into the beautiful world of data analysis and data visualization in JavaScript.

We are always trying to improve it. Feel free to start a conversation or open an issue, and check [how you can contribute](https://github.com/nshiab/simple-data-analysis/blob/main/CONTRIBUTING.md).

The documentation is available [here](https://nshiab.github.io/simple-data-analysis.js/). Demos with Observable notebooks can be found [here](https://observablehq.com/@nshiab/simple-data-analysis?collection=@nshiab/simple-data-analysis-in-javascript).

This project is related to [SDA-Flow](https://github.com/nshiab/simple-data-analysis-flow), which allows you to use the simple-data-analysis.js library without code. Test it here (still under heavy development and still running with v1.x): https://nshiab.github.io/simple-data-analysis-flow/.

## About v2

v2.0.0 is a complete rewrite of the library, with many breaking changes.

The minified bundle for the web is two times smaller:

-   v1.8.2 was ≈123kB
-   v2.0.0 is ≈54.4kB

v2.0.0 is almost X times more performant than the previous version and is now as fast as Python (with Pandas) and R scripts (with the tydiverse). Note that DuckDB, that powers SDA, can also be used with Python and R, but wasn't used for the performance test below. To see the code used for this benchmark, check this repo.

## Core principles

Under the hood, SDA is based on [duckdb-node](https://github.com/duckdb/duckdb-node), [duckdb-wasm](https://github.com/duckdb/duckdb-wasm), and [Observable Plot](https://github.com/observablehq/plot). The focus is on providing code that is easy to use and understand, with a library that can be used both in the front-end (web browsers) and back-end (NodeJS and other runtimes).

The library expects **tabular data** and works best when the data is tidy:

1. Every column is a variable

2. Every row is an observation

3. Every cell is a single value

For more about tidy data, you can read [this great article](https://cran.r-project.org/web/packages/tidyr/vignettes/tidy-data.html).

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
    const simpleDB = await new sda.SimpleDB().start();

    // We load data from remote file.
    await simpleDB.loadData(
      "employees",
      "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/employees.csv"
    );

    // We log the data in the console.
    await simpleDB.logTable("employees");
  }

  main();
</script>
```
