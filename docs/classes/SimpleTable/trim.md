[**Simple Data Analysis v6.0.14**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / trim

# Method: trim()

> **trim**(`columns`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:2016](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L2016)

Trims specified characters from the beginning, end, or both sides of string values in the given columns.
Pass `"all"` to trim every string (VARCHAR) column, leaving other types unchanged.
If there are no string columns, `"all"` leaves the table unchanged.
Use `["all"]` to trim a column literally named `all`.

## Parameters

### columns

`string` \| `string`[]

The column name, an array of column names, or `"all"` to trim every string (VARCHAR) column.

### options?

An optional object with configuration options:

#### character?

`string`

The string to trim. Defaults to whitespace characters.

#### side?

`"left"` \| `"right"` \| `"both"`

The side to trim: `"left"` (removes from the beginning), `"right"` (removes from the end), or `"both"` (removes from both sides). Defaults to `"both"`.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Trim whitespace from 'column1'
await table.trim("column1").log();
```

```ts
// Trim whitespace from every string column
await table.trim("all").log();
```

```ts
// Trim leading and trailing asterisks from 'productCode'
await table.trim("productCode", { character: "*" }).log();
```

```ts
// Right-trim whitespace from 'description' and 'notes' columns
await table.trim(["description", "notes"], { side: "right" }).log();
```

## Inherited from

`SimpleTableCore.trim`
