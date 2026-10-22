[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / loadSample

# Method: loadSample()

> **loadSample**(`sample`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:1495](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L1495)

Fetches sample data from the simple-data-analysis-core GitHub repository.

## Parameters

### sample

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

## Returns

`this`

## Example

```ts
// Load the fires sample data
await table.loadSample("fires").log();
```

## Inherited from

`SimpleTableCore.loadSample`
