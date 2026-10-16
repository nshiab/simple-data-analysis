[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getLastRow

# Method: getLastRow()

> **getLastRow**(`options?`): `Promise`\<\{\[`key`: `string`\]: `unknown`; \} \| `null`\>

Returns the last row of the table, optionally filtered by SQL conditions.
With the default `SimpleDB.expressionSyntax: "js"`, conditions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.
Temporal values use the same JavaScript representations as `getData()`.

## Parameters

### options?

An optional object with configuration options:

#### conditions?

`string`

The filtering conditions specified as a SQL `WHERE` clause (e.g., `"category = 'Book'"`).

## Returns

`Promise`\<\{\[`key`: `string`\]: `unknown`; \} \| `null`\>

A promise that resolves to an object representing the last row, or `null` if no rows match the conditions.

## Examples

```ts
// Get the very last row of the table
const lastRow = await table.getLastRow();
console.log(lastRow);
```

```ts
// Get the last row where the 'category' is 'Book'
const lastRowBooks = await table.getLastRow({ conditions: `category === 'Book'` }); // Using JS syntax
console.log(lastRowBooks);
```

## Inherited from

`SimpleTableCore.getLastRow`
