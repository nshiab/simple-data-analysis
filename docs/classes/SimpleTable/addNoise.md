[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / addNoise

# Method: addNoise()

> **addNoise**(`columns`, `max`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:5618](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L5618)

Adds independently generated uniform random noise to numeric values in one or more columns.
Each changed value receives an offset between `-max` and `max`. Selected integer and decimal columns become `DOUBLE` columns so fractional noise is retained. This method adds random jitter; it does not provide anonymization or differential privacy guarantees.

## Parameters

### columns

`string` \| `string`[]

The numeric column name or array of numeric column names to which noise will be added. When multiple columns are provided, each value receives an independent random offset.

### max

`number`

The maximum absolute offset, expressed in each column's units. Must be a finite number greater than or equal to `0`.

### options?

An optional object with configuration options:

#### onlyDuplicates?

`boolean`

If `true`, adds noise only to values that occur more than once in their column. Each selected column is evaluated independently, and every occurrence of a duplicated value is changed. Defaults to `false`.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Add an offset between -0.01 and 0.01 to every value
await table.addNoise("measurement", 0.01).log();
```

```ts
// Add noise independently to duplicated x values and duplicated y values
await table.addNoise(["x", "y"], 0.1, {
  onlyDuplicates: true,
}).log();
```

## Inherited from

`SimpleTableCore.addNoise`
