[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / log

# Method: log()

> **log**(`options?`): `Promise`\<[`SimpleTable`](../SimpleTable.md)\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:8995](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L8995)

Logs up to a specified number of rows from the table to the console. By default, the first 10 rows are logged.
You can optionally log the column types and filter the data based on conditions.
The footer reports the total number of matching rows and, only when some rows
are omitted, the number actually shown (for example, `100 rows in total / showing 15 rows`).
SQL dates and timestamps retain their native precision for display, including
temporal infinities. Lists and objects are stringified using the same nested
representations as `getData()`, then truncated according to `charsToLog`.
Unsafe top-level large integers throw, just as with `getData()`.
Type annotations describe the SQL type and the JavaScript extraction type
before display formatting; nulls do not determine the column's annotation.
Colors reflect the SQL value's meaning, so exact decimal strings use numeric
coloring. Column width is independent of the content truncation budget.

With the default `SimpleDB.expressionSyntax: "js"`, conditions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.

## Parameters

### options?

`number` \| `"all"` \| \{ `conditions?`: `string`; `count?`: `number` \| `"all"`; `types?`: `boolean`; \}

Either the number of rows to log (a specific number or `"all"`) or an object with configuration options:

`number`

***

`"all"`

***

#### Type Literal

\{ `conditions?`: `string`; `count?`: `number` \| `"all"`; `types?`: `boolean`; \}

Either the number of rows to log (a specific number or `"all"`) or an object with configuration options:

##### conditions?

`string`

A SQL `WHERE` clause condition to filter the data before logging. Defaults to no condition.

##### count?

`number` \| `"all"`

The maximum number of rows to log. Defaults to 10 or the value set in the SimpleDB instance. Use `"all"` to log all rows.

##### types?

`boolean`

Whether to log the column types along with the data. Defaults to the value set in the SimpleDB instance.

## Returns

`Promise`\<[`SimpleTable`](../SimpleTable.md)\>

A promise that resolves to the table, so methods can be chained.

## Examples

```ts
// Log the first 10 rows (default behavior)
await table.log();
```

```ts
// Log the first 50 rows
await table.log(50);
```

```ts
// Log all rows
await table.log("all");
```

```ts
// Log the first 20 rows and include column types
await table.log({ count: 20, types: true });
```

```ts
// Log rows where 'status' is 'active' (using JS syntax for conditions)
await table.log({ conditions: `status === 'active'` });
```

## Inherited from

`SimpleTableCore.log`
