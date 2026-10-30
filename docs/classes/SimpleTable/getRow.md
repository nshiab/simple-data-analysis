[**Simple Data Analysis v6.0.14**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getRow

# Method: getRow()

> **getRow**(`conditions`, `options?`): `Promise`\<\{\[`key`: `string`\]: `unknown`; \}\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:7540](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L7540)

Returns a single row that matches the specified conditions. Always throws if no row matches. By default, also throws if more than one row matches.
With the default `SimpleDB.expressionSyntax: "js"`, conditions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.
Temporal values use the same JavaScript representations as `getData()`.

## Parameters

### conditions

`string`

The conditions to match, specified as a SQL `WHERE` clause.

### options?

Optional settings:

#### strict?

`boolean`

If `false`, returns the first row when multiple rows match. A missing match always throws. Defaults to `true`.

## Returns

`Promise`\<\{\[`key`: `string`\]: `unknown`; \}\>

A promise that resolves to an object representing the matched row.

## Examples

```ts
// Get a row where 'name' is 'John'
const johnsRow = await table.getRow(`name = 'John'`);
console.log(johnsRow);
```

```ts
// Get a row where 'id' is 123 (using JS syntax)
const rowById = await table.getRow(`id === 123`);
console.log(rowById);
```

```ts
// Get the first matching row when multiple rows may match
const flexibleRow = await table.getRow(`status = 'pending'`, { strict: false });
console.log(flexibleRow);
```

## Throws

If no row matches, or if `strict` is `true` and more than one row matches the conditions.

## Inherited from

`SimpleTableCore.getRow`
