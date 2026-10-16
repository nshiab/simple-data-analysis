[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getTop

# Method: getTop()

> **getTop**(`count`, `options?`): `Promise`\<`object`[]\>

Returns the top `n` rows of the table, optionally filtered by SQL conditions.
With the default `SimpleDB.expressionSyntax: "js"`, conditions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.
Temporal values use the same JavaScript representations as `getData()`.

## Parameters

### count

`number`

The number of rows to return from the top of the table.

### options?

An optional object with configuration options:

#### conditions?

`string`

The filtering conditions specified as a SQL `WHERE` clause (e.g., `"category = 'Books'"`).

## Returns

`Promise`\<`object`[]\>

A promise that resolves to an array of objects representing the top `n` rows.

## Examples

```ts
// Get the first 10 rows of the table
const top10 = await table.getTop(10);
console.log(top10);
```

```ts
// Get the first 5 rows where the 'category' is 'Books'
const top5Books = await table.getTop(5, { conditions: `category === 'Books'` }); // Using JS syntax
console.log(top5Books);
```

## Inherited from

`SimpleTableCore.getTop`
