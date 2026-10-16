[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / updateColumn

# Method: updateColumn()

> **updateColumn**(`column`, `definition`): `this`

Updates values in a specified column using a SQL expression.
With the default `SimpleDB.expressionSyntax: "js"`, expressions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.

## Parameters

### column

`string`

The name of the column to be updated.

### definition

`string`

The SQL expression used to set the new values in the column (e.g., `"column1 * 2"`, `"UPPER(column_name)"`).

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Update 'column1' with the left 5 characters of 'column2'
await table.updateColumn("column1", `LEFT(column2, 5)`).log();
```

```ts
// Double the values in 'price' column
await table.updateColumn("price", `price * 2`).log();
```

```ts
// Set 'status' to 'active' where 'isActive' is true
await table.updateColumn("status", `CASE WHEN isActive THEN 'active' ELSE 'inactive' END`).log();
```

```ts
// Update an existing column with a value from a JSON object using dot notation.
await table.loadArray([{ count: 0, details: { count: 3 } }], {
  columnTypes: { details: "JSON" },
})
  .updateColumn("count", "details.count")
  .log();
```

## Inherited from

`SimpleTableCore.updateColumn`
