[**Simple Data Analysis v6.0.10**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / sample

# Method: sample()

> **sample**(`count`, `options?`): `this`

Selects random rows from the table, removing all others. You can optionally specify a seed to ensure repeatable sampling.

## Parameters

### count

`string` \| `number`

The number of rows to select (e.g., `100`) or a percentage string (e.g., `"10%"`) specifying the sampling size.

### options?

An optional object with configuration options:

#### seed?

`number`

A number specifying the seed for repeatable sampling. Using the same seed will always yield the same random rows. Defaults to a random seed.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Select 100 random rows from the table
await table.sample(100).log();
```

```ts
// Select 10% of the rows randomly
await table.sample("10%").log();
```

```ts
// Select random rows with a specific seed for repeatable results
await table.sample("10%", { seed: 123 }).log();
```

## Inherited from

`SimpleTableCore.sample`
