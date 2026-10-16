[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / addId

# Method: addId()

> **addId**(`newColumn`, `options?`): `this`

Adds a unique, non-null ID for each row in the current table. IDs start at
`0` and identify rows within this table, including rows with identical
contents. Without a prefix, the new column contains numbers. When
a prefix is supplied, the new column contains strings with the
exact prefix followed by the row number. An empty prefix therefore creates
the strings `"0"`, `"1"`, and so on.

IDs are not globally unique: separate tables can generate the same IDs.

## Parameters

### newColumn

`string`

The name of the new ID column.

### options?

An optional object with configuration options.

#### prefix?

`string`

Text to place before each row number. Supplying this option, including an empty string, creates string IDs.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Add numeric IDs: 0, 1, 2, ...
await table
  .addId("edgeId")
  .log();
```

```ts
// Add string IDs: "flight-0", "flight-1", "flight-2", ...
await flights
  .addId("edgeId", { prefix: "flight-" })
  .log();
```

## Inherited from

`SimpleTableCore.addId`
