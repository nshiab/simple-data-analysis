[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / hasColumn

# Method: hasColumn()

> **hasColumn**(`column`): `Promise`\<`boolean`\>

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
