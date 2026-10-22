[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / bins

# Method: bins()

> **bins**(`column`, `interval`, `startColumn`, `endColumn`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:5784](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L5784)

Adds numeric start and end columns for bins of the specified interval size.
Each bin includes its start and excludes its end: `start <= value < end`.
A value exactly on an end boundary belongs to the next bin. Null source
values produce null in both output columns.

## Parameters

### column

`string`

The numeric column containing values from which bins will be computed.

### interval

`number`

The finite, positive interval size for binning the values.

### startColumn

`string`

The required name of the new numeric column containing inclusive bin starts.

### endColumn

`string`

The required name of the new numeric column containing exclusive bin ends. Must differ from startColumn.

### options?

An optional object with configuration options:

#### startValue?

`number`

The finite starting value for binning, no greater than the minimum source value. Defaults to the minimum value in the specified column.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// If the minimum is 5, bins have boundaries 5 and 15, 15 and 25, etc.
await table.bins("column1", 10, "binStart", "binEnd").log();
```

```ts
// Bins start at 0: a value of 10 has binStart 10 and binEnd 20.
await table
  .bins("column1", 10, "binStart", "binEnd", { startValue: 0 })
  .log();
```

## Inherited from

`SimpleTableCore.bins`
