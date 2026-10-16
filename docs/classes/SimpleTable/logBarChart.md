[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / logBarChart

# Method: logBarChart()

> **logBarChart**(`labels`, `values`, `options?`): `Promise`\<[`SimpleTable`](../SimpleTable.md)\>

Generates and logs a bar chart to the console.

## Parameters

### labels

`string`

The name of the column to be used for the labels (categories).

### values

`string`

The name of the column to be used for the values.

### options?

An optional object with configuration options:

#### compact?

`boolean`

Reduces vertical space in the logged output. Defaults to `false`.

#### formatLabels?

(`d`) => `string`

A function to format the labels. Defaults to converting the label to a string.

#### formatValues?

(`d`) => `string`

A function to format the values. Defaults to converting the value to a string.

#### showPercentages?

`boolean`

If `true`, displays the percentage each bar represents relative to the total. Defaults to `false`.

#### showTotal?

`boolean`

If `true`, calculates and displays a total summary row. Defaults to `false`.

#### totalLabel?

`string`

Allows customizing the label used for the total row. Defaults to "Total".

#### width?

`number`

The width of the chart in characters. Defaults to 40.

## Returns

`Promise`\<[`SimpleTable`](../SimpleTable.md)\>

A promise that resolves to this table after the chart has been logged to the console.

## Example

```typescript
const data = [
    { category: "A", value: 10 },
    { category: "B", value: 20 },
]
await table
  .loadArray(data)
  .logBarChart("category", "value")

await table.log();
```
