[**Simple Data Analysis v6.0.17**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / cloneColumn

# Method: cloneColumn()

> **cloneColumn**(`column`, `newColumn`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:1599](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.21/src/class/SimpleTable.ts#L1599)

Clones an existing column in this table, creating a new column with identical values.

## Parameters

### column

`string`

The name of the original column to clone.

### newColumn

`string`

The name of the new column to be created.

## Returns

`this`

The table, so methods can be chained.

## Example

```ts
// Clone 'firstName' column as 'contactName'
await table.cloneColumn("firstName", "contactName").log();
```

## Inherited from

`SimpleTableCore.cloneColumn`
