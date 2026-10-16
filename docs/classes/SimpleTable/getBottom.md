[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getBottom

# Method: getBottom()

> **getBottom**(`count`, `options?`): `Promise`\<`object`[]\>

Returns the bottom `n` rows of the table, optionally filtered by SQL conditions.
By default, the last row will be returned first. To preserve the original order, use the `originalOrder` option.
With the default `SimpleDB.expressionSyntax: "js"`, conditions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.
Temporal values use the same JavaScript representations as `getData()`.

## Parameters

### count

`number`

The number of rows to return from the bottom of the table.

### options?

An optional object with configuration options:

#### conditions?

`string`

The filtering conditions specified as a SQL `WHERE` clause (e.g., `"category = 'Books'"`).

#### originalOrder?

`boolean`

A boolean indicating whether the rows should be returned in their original order (`true`) or in reverse order (last row first, `false`). Defaults to `false`.

## Returns

`Promise`\<`object`[]\>

A promise that resolves to an array of objects representing the bottom `n` rows.

## Examples

```ts
// Get the last 10 rows (last row first)
const bottom10 = await table.getBottom(10);
console.log(bottom10);
```

```ts
// Get the last 10 rows in their original order
const bottom10OriginalOrder = await table.getBottom(10, { originalOrder: true });
console.log(bottom10OriginalOrder);
```

```ts
// Get the last 5 rows where the 'category' is 'Books' (using JS syntax)
const bottom5Books = await table.getBottom(5, { conditions: `category === 'Books'` });
console.log(bottom5Books);
```

## Inherited from

`SimpleTableCore.getBottom`
