[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / accumulate

# Method: accumulate()

> **accumulate**(`column`, `newColumn`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:6304](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L6304)

Computes the cumulative sum of values in a column. For this method to work properly, ensure your data is sorted first.

## Parameters

### column

`string`

The name of the column storing the values to be accumulated.

### newColumn

`string`

The name of the new column in which the computed cumulative values will be stored.

### options?

An optional object with configuration options:

#### by?

`string` \| `string`[]

The column name or an array of column names to partition by. Accumulation is performed independently within each group.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Compute the cumulative sum of 'sales' in a new 'cumulativeSales' column
// Ensure the table is sorted by a relevant column (e.g., date) before calling this method.
await table.accumulate("sales", "cumulativeSales").log();
```

```ts
// Compute the cumulative sum of 'orders' by 'customer_id'
// Ensure the table is sorted by 'customer_id' and then by a relevant order column (e.g., order_date).
await table.accumulate("orders", "cumulativeOrders", { by: "customer_id" }).log();
```

```ts
// Compute the cumulative sum of 'revenue' by 'region' and 'product_category'
await table.accumulate("revenue", "cumulativeRevenue", { by: ["region", "product_category"] }).log();
```

## Inherited from

`SimpleTableCore.accumulate`
