[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / selectRows

# Method: selectRows()

> **selectRows**(`count`, `options?`): `this`

Selects a specified number of rows from this table. An offset can be applied to skip initial rows, and the results can be output to a new table.

## Parameters

### count

`string` \| `number`

The number of rows to select.

### options?

An optional object with configuration options:

#### offset?

`number`

The number of rows to skip from the beginning of the table before selecting. Defaults to `0`.

#### outputTable?

`string` \| `boolean`

If `true`, the selected rows will be stored in a new table with a generated name. If a string, it will be used as the name for the new table. If `false` or omitted, the current table will be modified. Defaults to `false`.

## Returns

`this`

A table instance containing the selected rows (either the current table or a new table), so methods can be chained.

## Examples

```ts
// Select the first 100 rows of the current table
await table.selectRows(100).log();
```

```ts
// Select 100 rows after skipping the first 50 rows
await table.selectRows(100, { offset: 50 }).log();
```

```ts
// Select 50 rows and store them in a new table with a generated name
const newTable = await table.selectRows(50, { outputTable: true }).log();
```

```ts
// Select 75 rows and store them in a new table named "top_customers"
const topCustomersTable = await table.selectRows(75, { outputTable: "top_customers" }).log();
```

## Inherited from

`SimpleTableCore.selectRows`
