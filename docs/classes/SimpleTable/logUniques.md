[**Simple Data Analysis v6.0.17**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / logUniques

# Method: logUniques()

## Call Signature

> **logUniques**(`column`, `options?`): `Promise`\<[`SimpleTable`](../SimpleTable.md)\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:9255](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.21/src/class/SimpleTable.ts#L9255)

Logs a column's sorted unique values as an array without modifying the table.
If your terminal's runtime truncates the array, use `stringify` to see every value.
Pass an array of column names to display unique combinations as a table with
the same options and defaults as `log()` instead.

### Parameters

#### column

`string`

The name of the column whose unique values will be logged.

#### options?

An optional object with configuration options:

##### stringify?

`boolean`

If `true`, logs the values as complete formatted JSON. Defaults to `false`. Only available with a column name, not an array of column names.

### Returns

`Promise`\<[`SimpleTable`](../SimpleTable.md)\>

A promise that resolves to the SimpleTable instance after logging the unique values.

### Examples

```ts
// Logs unique values for the column "name"
await table.logUniques("name");
```

```ts
// Logs unique values for the column "name" and stringifies them
await table.logUniques("name", { stringify: true });
```

### Inherited from

`SimpleTableCore.logUniques`

## Call Signature

> **logUniques**(`column`, `options?`): `Promise`\<[`SimpleTable`](../SimpleTable.md)\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:9255](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.21/src/class/SimpleTable.ts#L9255)

Logs unique combinations as a table without modifying the source table.
Combinations are sorted in ascending order by the columns in the order provided.
An array containing one column also produces a table.
Accepts the same options and defaults as `log()`, including a default of 10 rows
unless configured otherwise. The `stringify` option is only available when
passing a column name as a string.

With the default `SimpleDB.expressionSyntax: "js"`, conditions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.

### Parameters

#### column

`string`[]

A non-empty array of column names whose unique combinations will be logged.

#### options?

`number` \| `"all"` \| \{ `conditions?`: `string`; `count?`: `number` \| `"all"`; `types?`: `boolean`; \}

The number of rows to log, `"all"`, or an object with the same configuration options as `log()`:

`number`

***

`"all"`

***

##### Type Literal

\{ `conditions?`: `string`; `count?`: `number` \| `"all"`; `types?`: `boolean`; \}

The number of rows to log, `"all"`, or an object with the same configuration options as `log()`:

###### conditions?

`string`

A SQL `WHERE` clause condition using the selected columns to filter the combinations before logging.

###### count?

`number` \| `"all"`

The maximum number of combinations to log. Defaults to 10 or the table's `rowsToLog` setting. Use `"all"` to log all combinations.

###### types?

`boolean`

Whether to include column types. Defaults to the table's `typesToLog` setting.

### Returns

`Promise`\<[`SimpleTable`](../SimpleTable.md)\>

A promise that resolves to the SimpleTable instance after logging the unique combinations.

### Examples

```ts
// Log unique combinations of start and end years as a table
await table.logUniques(["yearStart", "yearEnd"]);
```

```ts
// Log up to 20 combinations with their column types
await table.logUniques(["yearStart", "yearEnd"], { count: 20, types: true });
```

```ts
// Log all combinations where the start year is at least 2020
await table.logUniques(["yearStart", "yearEnd"], {
  count: "all",
  conditions: "yearStart >= 2020",
});
```

### Inherited from

`SimpleTableCore.logUniques`
