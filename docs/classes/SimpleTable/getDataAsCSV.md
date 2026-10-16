[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getDataAsCSV

# Method: getDataAsCSV()

> **getDataAsCSV**(`options?`): `Promise`\<`string`\>

Returns the data from the table as a CSV string, optionally filtered by SQL conditions.
With the default `SimpleDB.expressionSyntax: "js"`, conditions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.
Temporal values are first converted as they are in `getData()`, then
serialized using UTC date and timestamp text.

## Parameters

### options?

An optional object with configuration options:

#### columns?

`string` \| `string`[]

An array of column names to include in the CSV. If omitted, all columns will be included.

#### conditions?

`string`

The filtering conditions specified as a SQL `WHERE` clause (e.g., `"category = 'Book'"`).

## Returns

`Promise`\<`string`\>

A promise that resolves to a CSV-formatted string representation of the table data.

## Examples

```ts
// Get all data from the table as CSV
const allDataCSV = await table.getDataAsCSV();
console.log(allDataCSV);
```

```ts
// Get data filtered by a condition (using JS syntax or SQL syntax) as CSV
const booksDataCSV = await table.getDataAsCSV({ conditions: `category === 'Book'` });
console.log(booksDataCSV);
```

```ts
// Get data filtered by a condition and specific columns as CSV
const booksDataCSV = await table.getDataAsCSV({ columns: ["title", "author"], conditions: `category === 'Book'` });
console.log(booksDataCSV);
```

## Inherited from

`SimpleTableCore.getDataAsCSV`
