[**Simple Data Analysis v6.0.10**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / rowProportions

# Method: rowProportions()

> **rowProportions**(`columns`, `options?`): `this`

Computes proportions horizontally across specified columns for each row.

For example, given a table showing counts of men, women, and non-binary individuals per year:

| Year | Men | Women | NonBinary |
| :--- | :-- | :---- | :-------- |
| 2021 | 564 | 685   | 145       |
| 2022 | 354 | 278   | 56        |
| 2023 | 856 | 321   | 221       |

This method computes the proportion of men, women, and non-binary individuals on each row, adding new columns for these proportions.

## Parameters

### columns

`string`[]

An array of column names for which proportions will be computed on each row.

### options?

An optional object with configuration options:

#### base?

`number`

A finite positive value that the proportions in each row sum to before rounding. Defaults to `1`.

#### decimals?

`number`

The number of decimal places to round the computed proportions. Defaults to `undefined` (no rounding).

#### suffix?

`string`

A string suffix to append to the names of the new columns storing the computed proportions. Defaults to `"Perc"`.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Compute horizontal proportions for 'Men', 'Women', and 'NonBinary' columns, rounded to 2 decimal places
await table.rowProportions(["Men", "Women", "NonBinary"], { decimals: 2 }).log();
```

The table will then look like this:

| Year | Men | Women | NonBinary | MenPerc | WomenPerc | NonBinaryPerc |
| :--- | :-- | :---- | :-------- | :------ | :-------- | :------------ |
| 2021 | 564 | 685   | 145       | 0.4     | 0.49      | 0.10          |
| 2022 | 354 | 278   | 56        | 0.51    | 0.4       | 0.08          |
| 2023 | 856 | 321   | 221       | 0.61    | 0.23      | 0.16          |

By default, the new columns will be named with a suffix of `"Perc"`. You can customize this suffix using the `suffix` option.

```ts
// Compute horizontal proportions with a custom suffix "Prop"
await table.rowProportions(["Men", "Women", "NonBinary"], { suffix: "Prop", decimals: 2 }).log();
```

The table will then look like this:

| Year | Men | Women | NonBinary | MenProp | WomenProp | NonBinaryProp |
| :--- | :-- | :---- | :-------- | :------ | :-------- | :------------ |
| 2021 | 564 | 685   | 145       | 0.4     | 0.49      | 0.10          |
| 2022 | 354 | 278   | 56        | 0.51    | 0.4       | 0.08          |
| 2023 | 856 | 321   | 221       | 0.61    | 0.23      | 0.16          |

```ts
// Compute percentages that sum to 100 on each row before rounding
await table.rowProportions(["Men", "Women", "NonBinary"], { base: 100, decimals: 1 }).log();
```

## Inherited from

`SimpleTableCore.rowProportions`
