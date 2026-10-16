[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / skip

# Method: skip()

> **skip**(`count`): `this`

Skips the first `n` rows of the table, effectively removing them.

## Parameters

### count

`number`

The number of rows to skip from the beginning of the table.

## Returns

`this`

The table, so methods can be chained.

## Example

```ts
// Skip the first 10 rows of the table
await table.skip(10).log();
```

## Inherited from

`SimpleTableCore.skip`
