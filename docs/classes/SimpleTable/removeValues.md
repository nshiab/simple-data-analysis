[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / removeValues

# Method: removeValues()

> **removeValues**(`columnsAndValues`): `this`

Removes rows from this table that have specific values in specified columns.

## Parameters

### columnsAndValues

\{\[`key`: `string`\]: `unknown`; \}

An object where keys are column names and values are the specific values (or an array of values) to remove from those columns. Use `null` to remove rows where a column is `NULL`; otherwise, `NULL` rows are retained.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Remove rows where 'job' is 'accountant' or 'developer', AND 'city' is 'Montreal'
await table.removeValues({ job: ["accountant", "developer"], city: "Montreal" }).log();
```

```ts
// Remove rows where 'status' is 'inactive'
await table.removeValues({ status: "inactive" }).log();
```

```ts
// Remove rows where 'status' is NULL
await table.removeValues({ status: null }).log();
```

## Inherited from

`SimpleTableCore.removeValues`
