[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / cloneColumnWithOffset

# Method: cloneColumnWithOffset()

> **cloneColumnWithOffset**(`column`, `newColumn`, `options?`): `this`

Clones a column in the table and offsets its values by a specified number of rows.
This is useful for time-series analysis or comparing values across different time points.

**Important:** The offset is applied based on the current row order in the table. For meaningful results, ensure your data is sorted appropriately (e.g., by date/time for time-series analysis) before calling this method.

## Parameters

### column

`string`

The name of the original column.

### newColumn

`string`

The name of the new column to be created with offset values.

### options?

An optional object with configuration options:

#### by?

`string` \| `string`[]

A column name or an array of column names to partition by. The offset is applied independently within each group.

#### offset?

`number`

The number of rows to offset the values. A positive number shifts values downwards (later rows), a negative number shifts values upwards (earlier rows). Defaults to `1`.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Clone 'value' as 'previous_value', offsetting by 1 row (value of row N-1 goes to row N)
await table.cloneColumnWithOffset("value", "previous_value").log();
```

```ts
// Clone 'sales' as 'sales_2_days_ago', offsetting by 2 rows
await table.cloneColumnWithOffset("sales", "sales_2_days_ago", { offset: 2 }).log();
```

```ts
// Clone 'temperature' as 'prev_temp_by_city', offsetting by 1 row within each 'city' category
await table.cloneColumnWithOffset("temperature", "prev_temp_by_city", {
  offset: 1,
  by: "city",
}).log();
```

```ts
// Clone 'stock_price' as 'prev_price_by_stock_and_exchange', offsetting by 1 row within each 'stock_symbol' and 'exchange' category
await table.cloneColumnWithOffset("stock_price", "prev_price_by_stock_and_exchange", {
  offset: 1,
  by: ["stock_symbol", "exchange"],
}).log();
```

## Inherited from

`SimpleTableCore.cloneColumnWithOffset`
