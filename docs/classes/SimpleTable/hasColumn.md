[**Simple Data Analysis v6.0.14**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / hasColumn

# Method: hasColumn()

> **hasColumn**(`column`): `Promise`\<`boolean`\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:1819](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L1819)

Checks if a column with the specified name exists in the table.

## Parameters

### column

`string`

The name of the column to check.

## Returns

`Promise`\<`boolean`\>

A promise that resolves to `true` if the column exists, `false` otherwise.

## Example

```ts
// Check if the table has a column named "age"
const hasAgeColumn = await table.hasColumn("age");
console.log(hasAgeColumn); // Output: true or false
```

## Inherited from

`SimpleTableCore.hasColumn`
