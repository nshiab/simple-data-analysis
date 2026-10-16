[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / logBottom

# Method: logBottom()

> **logBottom**(`count?`, `options?`): `Promise`\<[`SimpleTable`](../SimpleTable.md)\>

Logs the bottom `n` rows of the table to the console. By default, the last row will be returned first. To preserve the original order, use the `originalOrder` option.

Uses the same precision-preserving temporal display, nested stringification,
numeric coloring, and `charsToLog` truncation as `log()`. Unsafe top-level
large integers throw, just as with `getData()`.

## Parameters

### count?

`number`

The number of rows to log from the bottom of the table. Defaults to the table's `rowsToLog` option if not specified.

### options?

An optional object with logging preferences.

#### originalOrder?

`boolean`

If true, the rows are displayed in their original order (top to bottom). Defaults to false.

## Returns

`Promise`\<[`SimpleTable`](../SimpleTable.md)\>

A promise that resolves to the table, so methods can be chained.

## Examples

```ts
// Log bottom rows with default count (uses table's rowsToLog option)
await table.logBottom();
```

```ts
// Log the last 10 rows (displayed with last row first)
await table.logBottom(10);
```

```ts
// Log the last 5 rows in original order (top to bottom)
await table.logBottom(5, { originalOrder: true });
```

## Inherited from

`SimpleTableCore.logBottom`
