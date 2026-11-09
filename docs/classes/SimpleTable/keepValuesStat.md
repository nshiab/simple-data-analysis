[**Simple Data Analysis v6.0.18**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / keepValuesStat

# Method: keepValuesStat()

> **keepValuesStat**(`column`, `stat`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:2170](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.22/src/class/SimpleTable.ts#L2170)

Keeps the full rows whose value in a column matches its minimum or maximum.
All tied rows are kept. Null values are ignored, so a group with only null
values in the target column contributes no rows.

## Parameters

### column

`string`

The column whose values are compared with the statistic.

### stat

`"min"` \| `"max"`

Use `"min"` to keep the lowest values or `"max"` to keep the highest values.

### options?

Optional configuration for grouping rows.

#### by?

`string` \| `string`[]

A column name or an array of column names to group by. If omitted, the statistic is computed across the whole table.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Keep the rows with the lowest price across the whole table.
await table.keepValuesStat("price", "min").log();
```

Keep the highest-spending year or tied years in each division.

**Input**

| division | year | spending |
| --- | ---: | ---: |
| Parks | 2022 | 120 |
| Parks | 2023 | 120 |
| Parks | 2024 | 95 |
| Transit | 2024 | 85 |

```ts
await table.keepValuesStat("spending", "max", { by: "division" }).log();
```

**Rows kept** (order may vary)

The Parks rows for 2022 and 2023 tie at 120, so the method keeps both.

| division | year | spending |
| --- | ---: | ---: |
| Parks | 2022 | 120 |
| Parks | 2023 | 120 |
| Transit | 2024 | 85 |

## Inherited from

`SimpleTableCore.keepValuesStat`
