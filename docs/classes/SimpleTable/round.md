[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / round

# Method: round()

> **round**(`columns`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:5581](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L5581)

Rounds numeric values in specified columns.

## Parameters

### columns

`string` \| `string`[]

The column name or an array of column names containing numeric values to be rounded.

### options?

`number` \| \{ `decimals?`: `number`; `method?`: `"round"` \| `"ceiling"` \| `"floor"`; \}

An optional integer specifying the number of decimal places, or an object with configuration options:

`number`

***

#### Type Literal

\{ `decimals?`: `number`; `method?`: `"round"` \| `"ceiling"` \| `"floor"`; \}

An optional integer specifying the number of decimal places, or an object with configuration options:

##### decimals?

`number`

The number of decimal places to round to. Defaults to `0` (rounds to the nearest integer).

##### method?

`"round"` \| `"ceiling"` \| `"floor"`

The rounding method to use: `"round"` (rounds to the nearest integer, with halves rounding up), `"ceiling"` (rounds up to the nearest integer), or `"floor"` (rounds down to the nearest integer). Defaults to `"round"`.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Round 'column1' values to the nearest integer
await table.round("column1").log();
```

```ts
// Round 'column1' values to 2 decimal places
await table.round("column1", { decimals: 2 }).log();
```

```ts
// Round 'column1' values down to the nearest integer (floor)
await table.round("column1", { method: "floor" }).log();
```

```ts
// Round 'columnA' and 'columnB' values to 1 decimal place using ceiling method
await table.round(["columnA", "columnB"], { decimals: 1, method: "ceiling" }).log();
```

```ts
// Round 'column1' values to 2 decimal places using the shorthand
await table.round("column1", 2).log();
```

## Inherited from

`SimpleTableCore.round`
