[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / insertTables

# Method: insertTables()

> **insertTables**(`tables`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:1465](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L1465)

Inserts all rows from one or more other tables into this table. If tables do not have the same columns, an error will be thrown unless the `unifyColumns` option is set to `true`.

## Parameters

### tables

`SimpleTable` \| `SimpleTable`[]

The name(s) of the table(s) or SimpleTable instance(s) from which rows will be inserted.

### options?

An optional object with configuration options:

#### unifyColumns?

`boolean`

A boolean indicating whether to unify the columns of the tables. If `true`, missing columns in a table will be filled with `NULL` values. Defaults to `false`.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Insert all rows from 'tableB' into 'tableA'.
await tableA.insertTables("tableB").log();
```

```ts
// Insert all rows from 'tableB' and 'tableC' into 'tableA'.
await tableA.insertTables(["tableB", "tableC"]).log();
```

```ts
// Insert rows from multiple tables, unifying columns. Missing columns will be filled with NULL.
await tableA.insertTables(["tableB", "tableC"], { unifyColumns: true }).log();
```

## Inherited from

`SimpleTableCore.insertTables`
