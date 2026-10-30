[**Simple Data Analysis v6.0.14**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / keepValues

# Method: keepValues()

> **keepValues**(`columnsAndValues`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:2087](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L2087)

Keeps rows in this table that have specific values in specified columns, removing all other rows.

## Parameters

### columnsAndValues

\{\[`key`: `string`\]: `unknown`; \}

An object where keys are column names and values are the specific values (or an array of values) to keep in those columns. Use `null` to keep rows where a column is `NULL`.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Keep only rows where 'job' is 'accountant' or 'developer', AND 'city' is 'Montreal'
await table.keepValues({ job: ["accountant", "developer"], city: "Montreal" }).log();
```

```ts
// Keep only rows where 'status' is 'active'
await table.keepValues({ status: "active" }).log();
```

```ts
// Keep only rows where 'status' is NULL
await table.keepValues({ status: null }).log();
```

## Inherited from

`SimpleTableCore.keepValues`
