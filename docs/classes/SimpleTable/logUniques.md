[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / logUniques

# Method: logUniques()

> **logUniques**(`column`, `options?`): `Promise`\<[`SimpleTable`](../SimpleTable.md)\>

Logs unique values for a specified column to the console. By default, a maximum of 100 values are logged (depending on your runtime).
You can optionally stringify the values to see them all.

## Parameters

### column

`string`

The name of the column from which to retrieve and log unique values.

### options?

An optional object with configuration options:

#### stringify?

`boolean`

If `true`, converts the unique values to a JSON string before logging. Defaults to `false`.

## Returns

`Promise`\<[`SimpleTable`](../SimpleTable.md)\>

A promise that resolves to the SimpleTable instance after logging the unique values.

## Examples

```ts
// Logs unique values for the column "name"
await table.logUniques("name");
```

```ts
// Logs unique values for the column "name" and stringifies them
await table.logUniques("name", { stringify: true });
```

## Inherited from

`SimpleTableCore.logUniques`
