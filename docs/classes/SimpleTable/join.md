[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / join

# Method: join()

> **join**(`rightTable`, `options?`): `this`

Merges the data of this table (considered the left table) with another table (the right table) based on a common column or multiple columns.
Note that the order of rows in the returned data is not guaranteed to be the same as in the original tables.
This operation might create temporary files in a `.tmp` folder; consider adding `.tmp` to your `.gitignore`.

## Parameters

### rightTable

`SimpleTable`

The SimpleTable instance to be joined with this table.

### options?

An optional object with configuration options:

#### on?

`string` \| `string`[]

The column(s) to join on. If omitted, the method automatically searches for a column name that exists in both tables. Can be a single string or an array of strings for multiple join keys.

#### outputTable?

`string` \| `boolean`

If `true`, the results will be stored in a new table with a generated name. If a string, it will be used as the name for the new table. If `false` or omitted, the current table will be overwritten. Defaults to `false`.

#### type?

`"inner"` \| `"left"` \| `"right"` \| `"full"`

The type of join operation to perform. Possible values are `"inner"`, `"left"` (default), `"right"`, or `"full"`.

## Returns

`this`

A table instance containing the joined data (either the current table or a new table), so methods can be chained.

## Examples

```ts
// Perform a left join with 'tableB' on a common column (auto-detected), overwriting tableA
await tableA.join(tableB).log();
```

```ts
// Perform an inner join with 'tableB' on the 'id' column, storing results in a new table named 'tableC'
const tableC = await tableA.join(tableB, { on: "id", type: 'inner', outputTable: "tableC" }).log();
```

```ts
// Perform a join on multiple columns ('name' and 'category')
await tableA.join(tableB, { on: ["name", "category"] }).log();
```

## Inherited from

`SimpleTableCore.join`
