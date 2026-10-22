[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / repeatRows

# Method: repeatRows()

> **repeatRows**(`column`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:5503](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L5503)

Repeats rows based on the values in a column.

If a row has a value of 3 in the specified column, it will be repeated 3 times. If the value is 0 or negative, the row will be removed.

## Parameters

### column

`string`

The name of the column containing the number of times each row should be repeated.

### options?

An optional object with configuration options:

#### index?

`string`

The name of a new column to store the index of the repeated row (starting at 0).

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Before: [{ id: 1, count: 2, category: "A" }, { id: 2, count: 3, category: "B" }]
await table.repeatRows("count").log();
// After:  [{ id: 1, count: 2, category: "A" }, { id: 1, count: 2, category: "A" },
//          { id: 2, count: 3, category: "B" }, { id: 2, count: 3, category: "B" }, { id: 2, count: 3, category: "B" }]
```

```ts
// With an index column
await table.repeatRows("count", { index: "copyId" }).log();
// After:  [{ id: 1, count: 2, category: "A", copyId: 0 }, { id: 1, count: 2, category: "A", copyId: 1 },
//          { id: 2, count: 3, category: "B", copyId: 0 }, { id: 2, count: 3, category: "B", copyId: 1 }, { id: 2, count: 3, category: "B", copyId: 2 }]
```

## Inherited from

`SimpleTableCore.repeatRows`
