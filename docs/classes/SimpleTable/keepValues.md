[**Simple Data Analysis v6.0.20**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / keepValues

# Method: keepValues()

> **keepValues**(`columnsAndValues`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:2130](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.23/src/class/SimpleTable.ts#L2130)

Keeps rows in this table that have specific values in specified columns, removing all other rows.
By default, a row must match every specified column.

## Parameters

### columnsAndValues

\{\[`key`: `string`\]: `unknown`; \}

An object where keys are column names and values are the specific values (or an array of values) to keep in those columns. Use `null` to keep rows where a column is `NULL`.

### options?

Optional configuration for matching across columns.

#### match?

`"any"` \| `"all"`

Use `"all"` (default) to keep rows that match every specified column or `"any"` to keep rows that match at least one.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Keep only rows where 'job' is 'accountant' or 'developer', AND 'city' is 'Montreal'
await table.keepValues({ job: ["accountant", "developer"], city: "Montreal" }).log();
```

```ts
// Keep rows where 'job' is 'accountant' or 'developer', OR 'city' is 'Montreal'
await table.keepValues({ job: ["accountant", "developer"], city: "Montreal" }, { match: "any" }).log();
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
