[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / removeRows

# Method: removeRows()

> **removeRows**(`conditions`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:2152](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L2152)

Removes rows from this table based on SQL conditions. This method is similar to `filter()`, but removes rows instead of keeping them.
With the default `SimpleDB.expressionSyntax: "js"`, conditions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.

## Parameters

### conditions

`string`

The filtering conditions specified as a SQL `WHERE` clause (e.g., `"fruit = 'apple'"`).

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Remove rows where the 'fruit' column is 'apple'
await table.removeRows(`fruit = 'apple'`).log();
```

```ts
// Remove rows where 'quantity' is less than 5
await table.removeRows(`quantity < 5`).log();
```

```ts
// Remove rows where 'price' is less than 100 AND 'quantity' is 0
await table.removeRows(`price < 100 && quantity === 0`).log(); // Using JS syntax
```

```ts
// Remove rows where 'category' is 'Electronics' OR 'Appliances'
await table.removeRows(`category === 'Electronics' || category === 'Appliances'`).log(); // Using JS syntax
```

## Inherited from

`SimpleTableCore.removeRows`
