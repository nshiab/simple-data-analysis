[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / writeChart

# Method: writeChart()

> **writeChart**(`chart`, `path`, `options?`): `Promise`\<[`SimpleTable`](../SimpleTable.md)\>

Creates an [Observable Plot](https://github.com/observablehq/plot) chart as an image file (.png or .svg) from the table data.
To create maps, use the `writeMap` method.

## Parameters

### chart

(`data`) => `SVGSVGElement` \| `HTMLElement`

A function that takes data (as an array of objects) and returns an Observable Plot chart (an `SVGSVGElement` or `HTMLElement`).

### path

`string`

The path where the chart will be saved. The file extension must be `.png` or `.svg` (e.g., `"./output/chart.png"`).

### options?

Optional object containing additional settings:

#### dark?

`boolean`

If `true`, switches the chart to dark mode. Defaults to `false`.

#### style?

`string`

A CSS string inserted into the generated SVG to customize the chart's appearance. Use this if the Plot `style` option is insufficient.

## Returns

`Promise`\<[`SimpleTable`](../SimpleTable.md)\>

A promise that resolves to this table after the chart image has been saved.

## Example

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
