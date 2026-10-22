[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / logHistogram

# Method: logHistogram()

> **logHistogram**(`values`, `options?`): `Promise`\<[`SimpleTable`](../SimpleTable.md)\>

Defined in: [src/class/SimpleTable.ts:2115](https://github.com/nshiab/simple-data-analysis/blob/v6.0.13/src/class/SimpleTable.ts#L2115)

Generates and logs a histogram of a numeric column to the console.

## Parameters

### values

`string`

The name of the numeric column for which to generate the histogram.

### options?

An optional object with configuration options:

#### bins?

`number`

The number of bins (intervals) to use for the histogram. Defaults to 10.

#### compact?

`boolean`

If `true`, the histogram will be displayed in a more compact format. Defaults to `false`.

#### formatLabels?

(`min`, `max`) => `string`

A function to format the labels for the histogram bins. It receives the lower and upper bounds of each bin as arguments.

#### width?

`number`

The maximum width of the histogram bars in characters.

## Returns

`Promise`\<[`SimpleTable`](../SimpleTable.md)\>

A promise that resolves to this table after the histogram has been logged to the console.

## Examples

// Basic histogram of the 'temperature' column
```typescript
await table.logHistogram("temperature")

await table.log();
```

// Histogram with 20 bins and custom label formatting
```typescript
await table.logHistogram("age", {
  bins: 20,
  formatLabels: (min, max) => `${min}-${max} years`,
});

await table.log();
```
