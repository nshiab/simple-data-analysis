[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / clone

# Method: clone()

> **clone**(`nameOrOptions?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:1570](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L1570)

Returns a new table with the same structure and data as this table. The data can be optionally filtered, limited to a specific number of rows, and offset.
With the default `SimpleDB.expressionSyntax: "js"`, conditions support JavaScript-style operators (`&&`, `||`, `===`, `!==`). Set `expressionSyntax: "sql"` for unchanged SQL.

If `conditions`, `limit`, and `offset` are all used, they are applied in this order: `conditions` (WHERE clause) first, then `offset`, and finally `limit` (LIMIT).

Note that cloning large tables can be a slow operation.

## Parameters

### nameOrOptions?

`string` \| \{ `columns?`: `string` \| `string`[]; `conditions?`: `string`; `limit?`: `number`; `name?`: `string`; `offset?`: `number`; \}

Either a string specifying the name of the new table, or an optional object with configuration options. If not provided, a default name (e.g., "table1", "table2") will be generated.

`string`

***

#### Type Literal

\{ `columns?`: `string` \| `string`[]; `conditions?`: `string`; `limit?`: `number`; `name?`: `string`; `offset?`: `number`; \}

Either a string specifying the name of the new table, or an optional object with configuration options. If not provided, a default name (e.g., "table1", "table2") will be generated.

##### columns?

`string` \| `string`[]

An array of column names to include in the cloned table. If not provided, all columns will be included.

##### conditions?

`string`

A SQL `WHERE` clause condition to filter the data during cloning. Defaults to no condition (clones all rows).

##### limit?

`number`

The number of rows to include in the cloned table. If provided, only the first X rows (potentially after filtering and offset) will be cloned.

##### name?

`string`

The name of the new table to be created in the database. If not provided, a default name (e.g., "table1", "table2") will be generated.

##### offset?

`number`

The number of rows to skip before starting to clone rows.

## Returns

`this`

A new table instance containing the cloned data, so methods can be chained.

## Examples

```ts
// Clone tableA to a new table with a default generated name (e.g., "table1")
const tableB = await tableA.clone().log();
```

```ts
// Clone tableA to a new table named "my_cloned_table" using string parameter
const tableB = await tableA.clone("my_cloned_table").log();
```

```ts
// Clone tableA to a new table named "my_cloned_table" using options object
const tableB = await tableA.clone({ name: "my_cloned_table" }).log();
```

```ts
// Clone tableA, including only rows where 'column1' is greater than 10
const tableB = await tableA.clone({ conditions: `column1 > 10` }).log();
```

```ts
// Clone tableA with only specific columns
const tableB = await tableA.clone({ columns: ["name", "age", "city"] }).log();
```

```ts
// Clone only the first 10 rows of tableA
const tableB = await tableA.clone({ limit: 10 }).log();
```

```ts
// Clone 10 rows after skipping the first 5 rows
const tableB = await tableA.clone({ limit: 10, offset: 5 }).log();
```

```ts
// Clone tableA to a specific table name with filtered data, specific columns, and limited rows
const tableB = await tableA.clone({
  name: "filtered_data",
  conditions: `status = 'active' AND created_date >= '2023-01-01'`,
  columns: ["name", "status", "created_date"],
  limit: 100
}).log();
```

## Inherited from

`SimpleTableCore.clone`
