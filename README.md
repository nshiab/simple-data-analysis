# Simple data analysis

These project's goals are:

- To ease the way for non-coders (especially journalists) into the beautiful world of data analysis and data visualization in JavaScript.

- To uniformize and accelerate frontend/backend workflows with a simple to use library working both in the browser and with NodeJS.

We are always trying to improve it. Feel free to start a conversation or open an issue. Pull requests are welcome as well!

A demo is available here: https://observablehq.com/@nshiab/simple-data-analysis

# Table of contents

1. [Core principles](#core-principles)
2. [Easiest way to use](#the-easiest-way-to-use-the-library)
3. [Importing from HTML](#importing-from-the-html)
4. [NodeJS and JavaScript bundlers](#working-with-nodejs-and-javascript-bundlers)
5. [SimpleData](#simpledata)
6. [SimpleDataNode](#simpledatanode)
7. [SimpleDocument (experimental)](#simpledocument-experimental-for-nodejs-only)
8. [All functions and methods](#all-functions-and-methods)

## Core principles

The library expects **tabular data** stored in CSV files or **arrays of objects** stored in JSON files. It works best when the data is tidy:

1. Every column (or key) is a variable

2. Every row (or item) is an observation

3. Every cell (or value) is a single value

For more about tidy data, you can read [this great article](https://cran.r-project.org/web/packages/tidyr/vignettes/tidy-data.html).


## The easiest way to use the library

If you don't want to install anything, a great platform is Observable. Check this demo of the library in an [Observable's notebook](https://observablehq.com/@nshiab/simple-data-analysis).

<img src="./assets/observable.png" alt="An Observable notebook using simple-data-analysis" style="display:block;width: 100%; max-width:400px;margin-left:auto;margin-right: auto;margin-bottom: 20px;border-radius: 5px;"/>

## Importing from the HTML

If you want to add the library directly to your webpage, you can use the UMD minified bundle and call **sda**.

```js
<script src="https://cdn.jsdelivr.net/npm/simple-data-analysis@latest"></script>

<script>

async function main() {

    const simpleData = await new sda.SimpleData.loadDataFromUrl({ url: "https://.../some-file.csv" }) // You can also load json files.

    simpleData
        .checkValues()
        .excludeMissingValues()
        // chain methods to clean, analyze and visualize your data
}

main()

</script>
```
## Working with NodeJS and JavaScript Bundlers

First, make sure that your NodeJS version is 16 or higher. To check it, write ```node``` in your terminal and press Enter.

You should see something like this.
<img src="./assets/nodeJSVersion.png" alt="A terminal showing the NodeJS version" style="display:block;width: 100%; max-width:400px;margin-left:auto;margin-right: auto;"/>


If the version is less than 16, update [NodeJS with the latest LTS (long-term support) version](https://nodejs.org/en/) .

With NodeJS installed, you have access to [npm](https://www.npmjs.com/package/simple-data-analysis). To install the library with npm, type this command in your terminal:
```
npm i simple-data-analysis
```

Once installed, you can import what you need. If you use a bundler (Webpack, Rollup, Parcel or others), importing only the required code will make your final project lighter.

**/!\ This is how you should import the functions if you plan to publish your project on the web. /!\\**
```js
import { SimpleData } from "simple-data-analysis"

const someData = [...]

const simpleData = new SimpleData({ data: someData })
```

But you can also import everything if you wish. Just keep in mind that your final build will be bigger.
```js
import * as sda from "simple-data-analysis"

const someData = [...]

const simpleData = new sda.SimpleData({ data: someData })
```

## SimpleData

The SimpleData class is the core of the library. It allows you clean, analyze and visualize your data easily by chaining methods.

When you chain methods, the data is updated at each step and sent to the next one.

```js
import { SimpleData } from "simple-data-analysis"

const someData = [...] // An array of objects. Let's say each object is an employee, with keys and values for salary and job. In a tabular data format (CSV for example), the keys would be the columns name and the values would be the content of the cells.

const simpleData = new SimpleData({ data: someData })
    // A bit of cleaning
    .renameKey({ oldKey: "annualSalary", newKey: "salary" })
    .replaceValues({ key: "salary", oldValue: "$", newValue: "" })
    .valuesToInteger({ key: "salary" })
    .excludeMissingValues({ key: "salary" })
    // Let's add a new information
    .addKey({ key: "union", valueGenerator: employee => employee.job === "Manager" ? "No union" : "Unionized"})
    // Looking for the mean salary for each job.
    .summarize({ keyValue: "salary", keyCategory: "job", summary: "mean" })

// Now let's visualize the result.
const chart = simpleData
    .getChart({ type: "bar", x: "job", y: "mean", color: "union"})
    // getChart returns SVG or HTML so we store the result in a seperate variable
```

The charts are based on the [Observable Plot](https://observablehq.com/@observablehq/plot) library. If you want to create a fancy dataviz, you can pass Observable Plot options directly to getCustomChart.

```js
import * as Plot from "@observablehq/plot"

const chart = simpleData
    .getCustomChart({
        plotOptions: {
            grid: true,
            facet: {
                data: simpleData.getData(),
                y: "job"
            },
            marks: [
                Plot.dotX(simpleData.getData(), { x: "salary", fill: "union" })
            ]
        }
    })
```

When working on a web project, you can insert the chart where needed easily.
```js
document.querySelector("#someDiv").innerHTML = chart
```

If you want to use another library to create your chart, extract the data you want. It's an array of objects, which works very well with D3 for example.

```js
const myData = simpleData
    .selectKeys({ keys: ["job", "mean"] })
    // We selected "job" and "mean". But you could use getData() directly and retrieve everything.
    .getData()

// Do some D3 magic with myData now!
```

## SimpleDataNode

If you use the library with NodeJS, you can import SimpleDataNode instead of SimpleData. It will give you extra methods to load local files, save files and save charts.

```js
import { SimpleDataNode } from "simple-data-analysis"

const simpleData = new SimpleDataNode()
    .loadDataFromLocalFile({path: "./employees.csv"})
    // You can load json files as well.
    .saveChart({ path: "./salaries.html", type: "dot", x: "job", y: "salary", color: "union"})
    // GetChart() returns SVG and HTML and you can't chain after it. But saveChart() returns simpleData so you can keep on chaining. Same for saveCustomChart().
    .filterValues({ key: "job", valueComparator: job => job === "Manager" })
    // All methods from SimpleData to manipulate your data are still available
    .saveData({path: "./managers.csv"})
    // You can also save json files.
```

## SimpleDocument (experimental, for NodeJS only)

While working on your analysis, it's sometimes helpful to build a document that you'll be able to share with your results.

The SimpleDocument allows you to do that. You can pass JSX expressions, React components and SVG to it, and it will render everything as an HTML file or React component.

Note that this class is still under heavy development.

```js
import React from "react"
import {SimpleData, SimpleDocument, Table} from "simple-data-analysis"
import { Typography } from "@mui/material"

const someData = [...] // Let's say it's some employees information again.

const simpleData = new SimpleData({data: someData}) // or SimpleDataNode

const simpleDocument = new SimpleDocument()

simpleDocument
    .add(<h1>Some JSX!</h1>)
    .add(<Typography>An MUI component!</Typography>)
    .add(<Table keys={simpleData.keys} data={simpleData.data} />)
    .add(simpleData.getChart({ type: "dot", x: "job", y: "salary", color: "union"}))
    .saveDocument('somePath/analysis.html')
    .saveDocument('somePath/AnalysisComponent.js') // an HTML string exported as a React component

```

## All functions and methods

For a description of all methods and how to use them, check this Observable notebook: https://observablehq.com/@nshiab/simple-data-analysis