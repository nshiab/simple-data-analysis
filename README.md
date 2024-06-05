# Simple data analysis (SDA) in JavaScript

SDA is an easy-to-use and high-performance JavaScript library for data analysis. You can use it with tabular and geospatial data.

The library is maintained by [Nael Shiab](http://naelshiab.com/), computational journalist and senior data producer for [CBC News](https://www.cbc.ca/news).

To install with NPM:

```
npm i simple-data-analysis
```

With Bun:

```
bun add simple-data-analysis
```

The documentation is available [here](https://nshiab.github.io/simple-data-analysis/).

Tests are run for NodeJS and Bun. Deno is coming! :)

## Core principles

SDA is born from the frustration of switching between Python, R, and JavaScript to produce data journalism projects. Usually, data crunching and analysis are done with Python or R and interactive datavisualizations are coded in JavaScript. But being proficient in multiple programming languages is hard. Why can't we do everything in JS?

The missing piece in the JavaScript/TypeScript ecosystem was an easy-to-use and performant library for data analysis. And this why SDA has been created.

The library is based on [DuckDB](https://duckdb.org/), a fast in-process analytical database. Under the hood, SDA sends SQL queries to be executed by DuckDB. We use [duckdb-node](https://github.com/duckdb/duckdb-node) and [duckdb-wasm](https://github.com/duckdb/duckdb-wasm) which means SDA can run in the browser and with NodeJS and other runtimes.

The syntax and the available methods were inspired by [Pandas](https://github.com/pandas-dev/pandas) (Python) and the [Tidyverse](https://www.tidyverse.org/) (R).

You also have the flexibility of writing your own SQL queries if you want to (check the [customQuery method](https://nshiab.github.io/simple-data-analysis/classes/SimpleWebDB.html#customQuery)) or to use JavaScript to process your data (check the [updateWithJS method](https://nshiab.github.io/simple-data-analysis/classes/SimpleWebTable.html#updateWithJS)).

Feel free to start a conversation or open an issue. Check how you can [contribute](https://github.com/nshiab/simple-data-analysis/blob/main/CONTRIBUTING.md).

You might find the [journalism library](https://github.com/nshiab/journalism) interesting as well.

## Performance

To test and compare the performance of the library, we calculated the average temperature per decade and city with the daily temperatures from the [Adjusted and Homogenized Canadian Climate Data](https://api.weather.gc.ca/collections/ahccd-annual). See [this repository](https://github.com/nshiab/simple-data-analysis-benchmarks) for the code.

We ran the same calculations with **simple-data-analysis@3.0.0** (both NodeJS and Bun), **Pandas (Python)**, and the **tidyverse (R)**.

In each script, we:

1. Loaded a CSV file (_Importing_)
2. Selected four columns, removed rows with missing temperature, converted date strings to date and temperature strings to float (_Cleaning_)
3. Added a new column _decade_ and calculated the decade (_Modifying_)
4. Calculated the average temperature per decade and city (_Summarizing_)
5. Wrote the cleaned-up data that we computed the averages from in a new CSV file (_Writing_)

Each script has been run ten times on a MacBook Pro (Apple M1 Pro / 16 GB). The durations have been averaged and we calculated the standard deviation.

The charts displayed below come from this [Observable notebook](https://observablehq.com/@nshiab/simple-data-analysis-benchmarks).

### Small file

With _ahccd-samples.csv_:

-   74.7 MB
-   19 cities
-   20 columns
-   971,804 rows
-   19,436,080 data points

**simple-data-analysis@3.0.0** is the fastest.

![A chart showing the processing duration of multiple scripts in various languages](./assets/small-file.png)

### Big file

With _ahccd.csv_:

-   1.7 GB
-   773 cities
-   20 columns
-   22,051,025 rows
-   441,020,500 data points

**simple-data-analysis@3.0.0** is the fastest here as well.

![A chart showing the processing duration of multiple scripts in various languages](./assets/big-file.png)

We also tried the One Billion Row Challenge, which involves computing the min, mean, and max temperatures for hundreds of cities in a 1,000,000,000 rows CSV file. The library has been able to crunch the numbers in 1 minute 32 seconds, on the same computer (Apple M1 Pro / 16 GB). For more, check this [repo](https://github.com/nshiab/1brc) forked from this [one](https://github.com/gunnarmorling/1brc). The JavaScript code is [here](https://github.com/nshiab/1brc/blob/main/index.js).

Note that DuckDB, which powers SDA, can also be used with [Python](https://duckdb.org/docs/api/python/overview.html) and [R](https://duckdb.org/docs/api/r).

## SDA in an Observable notebook

Observable notebooks are great for data analysis in JavaScript.

In this [example](https://observablehq.com/@nshiab/hello-simple-data-analysis?collection=@nshiab/simple-data-analysis-in-javascript), we calculate the average temperature per decade in three cities and check for trends. We will also join two tables to retrieve the names of the cities.

This [other example](https://observablehq.com/@nshiab/hello-simple-data-analysis-and-geospatial-data?collection=@nshiab/simple-data-analysis-in-javascript) focuses on geospatial analysis. We create point geometries from the latitude and longitude of 2023 wildfires in Canada, do a spatial join with provinces boundaries and then compute the number of fires and the total area burnt per province.

## SDA in an HTML page

If you want to add the library directly to your webpage, you can use a npm-based CDN like jsDelivr.

Here's some code that you can copy and paste into an HTML file.

Of course, you could also use a framework or a bundler. Install the library with npm (`npm i simple-data-analysis`) and import it into your project (`import { SimpleWebDB } from 'simple-data-analysis'`).

```html
<script type="module">
    // We import the SimpleWebDB class from the esm bundle.
    import { SimpleWebDB } from "https://cdn.jsdelivr.net/npm/simple-data-analysis/+esm"

    async function main() {
        // We start a new instance of SimpleWebDB
        const sdb = new SimpleWebDB()

        // We create a new table
        const tableTemperature = sdb.newTable("temperature")

        // We fetch daily temperatures for three cities.
        await tableTemperature.fetchData(
            "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/dailyTemperatures.csv"
        )

        // We compute the decade from each date
        // and put the result in the decade column.
        await tableTemperature.addColumn(
            "decade",
            "integer",
            "FLOOR(YEAR(time)/10)*10" // This is SQL
        )

        // We summarize the data by computing
        // the average temperature
        // per decade and per city.
        await tableTemperature.summarize({
            values: "t",
            categories: ["decade", "id"],
            summaries: "mean",
        })

        // We run linear regressions
        // to check for trends.
        await tableTemperature.linearRegressions({
            x: "decade",
            y: "mean",
            categories: "id",
            decimals: 4,
        })

        // We create a new table
        const tableCities = sdb.newTable("cities")

        // We load another file with
        // the cities ids and names
        await tableCities.fetchData(
            "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/data/files/cities.csv"
        )

        // We join the two tables based on the ids.
        // By default, join will automatically look
        // for a common column, do a left join, and
        // put the result in the left table.
        await tableCities.join(tableTemperature)

        // We select the columns of interest.
        await tableCities.selectColumns(["city", "slope", "yIntercept", "r2"])

        // We log the table.
        await tableCities.logTable()

        // We can also retrieve the data as an array of objects.
        const data = await tableCities.getData()
        console.log(data)
    }

    main()
</script>
```

And here's the table you'll see in your browser's console tab.

![The console tab in Google Chrome showing the result of simple-data-analysis computations.](./assets/browser-console.png)

## SDA with NodeJS and similar runtimes

First, ensure that you have [NodeJS v20 or higher](https://nodejs.org/en/) installed.

Then run this command to install the library in your code repository.

```bash
npm i simple-data-analysis
```

A _package.json_ file should have been created. Open it and add or change the type to "module" to use a modern syntax. If you use Bun, you can skip this step.

```json
{
    "type": "module",
    "dependencies": {
        "simple-data-analysis": "^3.0.0"
    }
}
```

Copy and paste the code below into an `index.js` file and run it with `node index.js`.

In this example, we load a CSV file with the latitude and longitude of 2023 wildfires in Canada, create point geometries from it, do a spatial join with provinces boundaries and then compute the number of fires and the total area burnt per province.

It's the same as the one you would run in a browser, except we use the _SimpleDB_ class instead of _SimpleWebDB_ and _loadData_ instead of _fetchData_.

With NodeJS and other runtimes, you have more methods available to load and write data from/to local files. Check the [SimpleTable class documentation](https://nshiab.github.io/simple-data-analysis/classes/SimpleTable.html).

```ts
import { SimpleDB } from "simple-data-analysis"

// We start a SimpleDB instance
const sdb = new SimpleDB()

// We create a new table
const provinces = sdb.newTable("provinces")
// We fetch the provinces' boundaries. It's a geoJSON.
await provinces.loadGeoData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/geodata/files/CanadianProvincesAndTerritories.json"
)
// We log the provinces
await provinces.logTable()

// We create a new table
const fires = sdb.newTable("fires")
// We fetch the wildfires data. It's a CSV.
await fires.loadData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/geodata/files/firesCanada2023.csv"
)
// We create point geometries from the lat and lon columns
// and we store the points in the new column geom
await fires.points("lat", "lon", "geom")
// We log the fires
await fires.logTable()

// We match fires with provinces
// and we output the results into a new table.
// By default, joinGeo will automatically look
// for columns storing geometries in the tables,
// do a left join, and put the results
// in the left table.
const firesInsideProvinces = await fires.joinGeo(provinces, "inside", {
    outputTable: "firesInsideProvinces",
})

// We summarize to count the number of fires
// and sum up the area burnt in each province.
await firesInsideProvinces.summarize({
    values: "hectares",
    categories: "nameEnglish",
    summaries: ["count", "sum"],
    decimals: 0,
})
// We rename columns.
await firesInsideProvinces.renameColumns({
    count: "nbFires",
    sum: "burntArea",
})
// We want the province with
// the greatest burnt area first.
await firesInsideProvinces.sort({ burntArea: "desc" })

// We log the results. By default, the method
// logs the first 10 rows, but there is 13
// provinces and territories in Canada.
await firesInsideProvinces.logTable({ nbRowsToLog: 13 })
```

And here's what you should see in your console.

![The console tab in Google Chrome showing the result of simple-data-analysis computations.](./assets/nodejs-console.png)

If you want to generate and save charts with NodeJS and other runtimes, check the [journalism library](https://github.com/nshiab/journalism), more specifically the [savePlotChart function](https://nshiab.github.io/journalism/functions/savePlotChart.html).
