[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / filter

# Method: filter()

> **filter**(`conditions`): `this`

Filters rows from this table based on SQL conditions. Note that it's often faster to use the `removeRows` method for simple removals.
With the default `SimpleDB.expressionSyntax: "js"`, conditions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.

## Parameters

### conditions

`string`

The filtering conditions specified as a SQL `WHERE` clause (e.g., `"column1 > 10 AND column2 = 'value'"`).

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Keep only rows where the 'fruit' column is not 'apple'
await table.filter(`fruit != 'apple'`).log();
```

```ts
// Keep rows where 'price' is greater than 100 AND 'quantity' is greater than 0
await table.filter(`price > 100 && quantity > 0`).log(); // Using JS syntax
```

```ts
// Keep rows where 'category' is 'Electronics' OR 'Appliances'
await table.filter(`category === 'Electronics' || category === 'Appliances'`).log(); // Using JS syntax
```

```ts
// Keep rows where 'lastPurchaseDate' is on or after '2023-01-01'
await table.filter(`lastPurchaseDate >= '2023-01-01'`).log();
```

## Inherited from

`SimpleTableCore.filter`
