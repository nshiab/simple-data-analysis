[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / rowToVector

# Method: rowToVector()

> **rowToVector**(`columns`, `newColumn`, `options?`): `this`

Combines numeric scalar columns into a fixed-size vector. The input
column order determines the vector dimension order, and null values remain
null vector elements.

When all input columns have the same numeric type, that type is preserved.
Mixed numeric types require an explicit `type` option. Casting exact
decimals or large integers to FLOAT or DOUBLE can lose precision.

## Parameters

### columns

`string`[]

Numeric scalar columns to combine, in vector dimension order.

### newColumn

`string`

The name of the vector column to create.

### options?

Optional vector element type settings.

#### type?

`"float"` \| `"double"`

Cast every element to `"float"` or `"double"`. Required when the input column types differ.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
await table
  .rowToVector(["height", "weight"], "measurements")
  .log();
```

```ts
await table
  .rowToVector(["count", "score"], "features", { type: "double" })
  .log();
```

## Inherited from

`SimpleTableCore.rowToVector`
