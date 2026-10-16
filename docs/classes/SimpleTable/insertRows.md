[**Simple Data Analysis v6.0.10**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / insertRows

# Method: insertRows()

> **insertRows**(`rows`): `this`

Inserts rows, provided as an array of JavaScript objects, into the table.

## Parameters

### rows

`object`[]

An array of objects, where each object represents a row to be inserted and its properties correspond to column names.

## Returns

`this`

The table, so methods can be chained.

## Example

```ts
// Insert new rows into the table
const newRows = [
  { letter: "c", number: 3 },
  { letter: "d", number: 4 }
];
await table.insertRows(newRows).log();
```

## Inherited from

`SimpleTableCore.insertRows`
