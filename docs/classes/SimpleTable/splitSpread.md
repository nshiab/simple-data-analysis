[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / splitSpread

# Method: splitSpread()

> **splitSpread**(`column`, `separator`, `newColumns`, `options?`): `this`

Splits strings in a specified column by a separator and spreads the resulting parts into multiple new columns.

Each part of the split string will be stored in a separate column. The number of columns created is determined by the length of the `newColumns` array.
If a row has fewer parts than the number of new columns, a warning will be logged and the extra columns will contain empty strings (unless `strict` is set to `false`).
If a row has more parts than the number of new columns, an error will be thrown unless `strict` is set to `false`.

## Parameters

### column

`string`

The name of the column containing the strings to be split.

### separator

`string`

The substring to use as a delimiter for splitting the strings.

### newColumns

`string`[]

An array of column names for the extracted parts.

### options?

Optional configuration.

#### strict?

`boolean`

If `false`, skips all validation checks (both max and min parts). Defaults to `true`.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Split 'fullName' by comma and spread into 'lastName' and 'firstName'
// e.g., "Shiab, Nael" -> lastName: "Shiab", firstName: "Nael"
await table.splitSpread("fullName", ",", ["lastName", "firstName"]).log();
```

```ts
// Split 'address' by comma and spread into three columns
// e.g., "123 Main St, Anytown, USA" -> street: "123 Main St", city: "Anytown", country: "USA"
await table.splitSpread("address", ",", ["street", "city", "country"]).log();
```

```ts
// Skip validation for performance
await table.splitSpread("data", "|", ["col1", "col2"], { strict: false }).log();
```

## Inherited from

`SimpleTableCore.splitSpread`
