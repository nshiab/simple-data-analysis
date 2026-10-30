[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / outliersIQR

# Method: outliersIQR()

> **outliersIQR**(`column`, `newColumn`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:6497](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L6497)

Identifies outliers in a specified column using the Interquartile Range (IQR) method.

## Parameters

### column

`string`

The name of the column in which outliers will be identified.

### newColumn

`string`

The name of the new column where the boolean results (`TRUE` for outlier, `FALSE` otherwise) will be stored.

### options?

An optional object with configuration options:

#### by?

`string` \| `string`[]

The column name or an array of column names to partition by. Outliers are detected independently within each group.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Look for outliers in the 'age' column and store results in a new 'isOutlier' column
await table.outliersIQR("age", "isOutlier").log();
```

```ts
// Look for outliers in 'salary' by 'gender'
await table.outliersIQR("salary", "salaryOutlier", { by: "gender" }).log();
```

## Inherited from

`SimpleTableCore.outliersIQR`
