[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getRowCount

# Method: getRowCount()

> **getRowCount**(`options?`): `Promise`\<`number`\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:7005](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L7005)

Returns the number of rows in the table.
With the default `SimpleDB.expressionSyntax: "js"`, conditions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.

## Parameters

### options?

An optional object with configuration options:

#### conditions?

`string`

The filtering conditions specified as a SQL `WHERE` clause (e.g., `"category = 'Book'"`).

## Returns

`Promise`\<`number`\>

A promise that resolves to a number representing the total count of rows.

## Examples

```ts
// Get the number of rows in the table
const rowCount = await table.getRowCount();
console.log(rowCount); // e.g., 100
```

```ts
// Get the number of rows where 'category' is 'Book'
const bookCount = await table.getRowCount({ conditions: "category = 'Book'" });
console.log(bookCount);
```

## Inherited from

`SimpleTableCore.getRowCount`
