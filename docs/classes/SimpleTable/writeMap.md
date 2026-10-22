[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / writeMap

# Method: writeMap()

> **writeMap**(`map`, `path`, `options?`): `Promise`\<[`SimpleTable`](../SimpleTable.md)\>

Defined in: [src/class/SimpleTable.ts:1864](https://github.com/nshiab/simple-data-analysis/blob/v6.0.13/src/class/SimpleTable.ts#L1864)

Creates an [Observable Plot](https://github.com/observablehq/plot) map as an image file (.png or .svg) from the table's geospatial data.
To create charts from non-geospatial data, use the `writeChart` method.

## Parameters

### map

(`geoData`) => `SVGSVGElement` \| `HTMLElement` \| `Promise`\<`SVGSVGElement` \| `HTMLElement`\>

A function that takes geospatial data (in GeoJSON format) and returns an Observable Plot map (an `SVGSVGElement` or `HTMLElement`), or a promise resolving to one.

### path

`string`

The path where the map will be saved. The file extension must be `.png` or `.svg` (e.g., `"./output/map.png"`).

### options?

An optional object with configuration options:

#### column?

`string`

The name of the column storing geometries. If there is only one geometry column, it will be used by default.

#### dark?

`boolean`

If `true`, switches the map to dark mode. Defaults to `false`.

#### rewind?

`boolean`

If `true`, rewinds the coordinates of polygons to follow the spherical winding order (important for D3.js). Defaults to `true`.

#### style?

`string`

A CSS string inserted into the generated SVG to customize the map's appearance. Use this if the Plot `style` option is insufficient.

## Returns

`Promise`\<[`SimpleTable`](../SimpleTable.md)\>

A promise that resolves to this table after the map image has been saved.

## Example

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
