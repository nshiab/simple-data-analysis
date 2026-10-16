[**Simple Data Analysis v6.0.10**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / logDotChart

# Method: logDotChart()

> **logDotChart**(`x`, `y`, `options?`): `Promise`\<[`SimpleTable`](../SimpleTable.md)\>

Generates and logs a dot chart to the console. The data should be sorted by the x-axis values for accurate representation.

**Data Type Requirements:**
- **X-axis values**: Must be `number` or `Date` objects.
- **Y-axis values**: Must be `number` values.
- All values must be non-null and defined.

## Parameters

### x

`string`

The name of the column to be used for the x-axis. Values must be numbers or Date objects.

### y

`string`

The name of the column to be used for the y-axis. Values must be numbers.

### options?

An optional object with configuration options:

#### fixedScales?

`boolean`

If `true`, all small multiples will share the same y-axis scale. Defaults to `false`.

#### formatX?

(`d`) => `string`

A function to format the x-axis values for display. It receives the raw x-value as input and should return a string. If the first data point's x value is a Date, it defaults to formatting the date as "YYYY-MM-DD".

#### formatY?

(`d`) => `string`

A function to format the y-axis values for display. It receives the raw y-value as input and should return a string.

#### height?

`number`

The height of the chart in characters.

#### smallMultiples?

`string`

The name of a column to create small multiples (also known as facets). Each unique value in this column will generate a separate chart.

#### smallMultiplesPerRow?

`number`

The number of small multiples to display per row.

#### width?

`number`

The width of the chart in characters.

## Returns

`Promise`\<[`SimpleTable`](../SimpleTable.md)\>

A promise that resolves to this table after the chart has been logged to the console.

## Examples

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
