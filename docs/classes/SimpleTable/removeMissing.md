[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / removeMissing

# Method: removeMissing()

> **removeMissing**(`options?`): `this`

Removes rows with missing values from this table.
By default, missing values include SQL `NULL`, as well as string representations like `"NULL"`, `"null"`, `"NaN"`, `"undefined"`, and empty strings `""`.

## Parameters

### options?

An optional object with configuration options:

#### columns?

`string` \| `string`[]

A string or an array of strings specifying the columns to consider for missing values. If omitted, all columns are considered.

#### invert?

`boolean`

A boolean indicating whether to invert the condition. If `true`, only rows containing missing values will be kept. Defaults to `false`.

#### missingValues?

(`string` \| `number`)[]

An array of values to be treated as missing values instead of the default ones. Defaults to `["undefined", "NaN", "null", "NULL", ""]`.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Remove rows with missing values in any column
await table.removeMissing().log();
```

```ts
// Remove rows with missing values only in 'firstName' or 'lastName' columns
await table.removeMissing({ columns: ["firstName", "lastName"] }).log();
```

```ts
// Keep only rows with missing values in any column
await table.removeMissing({ invert: true }).log();
```

```ts
// Remove rows where 'age' is missing or is equal to -1
await table.removeMissing({ columns: "age", missingValues: [-1] }).log();
```

## Inherited from

`SimpleTableCore.removeMissing`
