[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / concatenate

# Method: concatenate()

> **concatenate**(`columns`, `newColumn`, `options?`): `this`

Concatenates values from specified columns into a new column.

## Parameters

### columns

`string`[]

An array of column names whose values will be concatenated.

### newColumn

`string`

The name of the new column to store the concatenated values.

### options?

An optional object with configuration options:

#### separator?

`string`

The string used to separate concatenated values. Defaults to an empty string (`""`).

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Concatenate 'firstName' and 'lastName' into a new 'fullName' column
await table.concatenate(["firstName", "lastName"], "fullName").log();
```

```ts
// Concatenate 'city' and 'country' into 'location', separated by a comma and space
await table.concatenate(["city", "country"], "location", { separator: ", " }).log();
```

## Inherited from

`SimpleTableCore.concatenate`
