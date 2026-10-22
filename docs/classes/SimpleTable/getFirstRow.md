[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getFirstRow

# Method: getFirstRow()

> **getFirstRow**(`options?`): `Promise`\<\{\[`key`: `string`\]: `unknown`; \} \| `null`\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:7378](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L7378)

Returns the first row of the table, optionally filtered by SQL conditions.
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

A promise that resolves to an object representing the first row, or `null` if no rows match the conditions.

## Examples

```ts
// Get the very first row of the table
const firstRow = await table.getFirstRow();
console.log(firstRow);
```

```ts
// Get the first row where the 'category' is 'Book'
const firstRowBooks = await table.getFirstRow({ conditions: `category === 'Book'` }); // Using JS syntax
console.log(firstRowBooks);
```

## Inherited from

`SimpleTableCore.getFirstRow`
