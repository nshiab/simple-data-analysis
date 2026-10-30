[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleDB](../SimpleDB.md) / selectTables

# Method: selectTables()

> **selectTables**(`tables`): `Promise`\<[`SimpleDB`](../SimpleDB.md)\>

Defined in: [simple-data-analysis-core/src/class/SimpleDB.ts:705](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleDB.ts#L705)

Selects one or more tables to keep in the database, removing all others.

## Parameters

### tables

`string` \| [`SimpleTable`](../SimpleTable.md) \| (`string` \| [`SimpleTable`](../SimpleTable.md))[]

A single table or an array of tables to select, specified by name or as SimpleTable instances.

## Returns

`Promise`\<[`SimpleDB`](../SimpleDB.md)\>

A promise that resolves to the database, so methods can be chained.

## Examples

```ts
// Select a single table by name, removing all other tables
await sdb.selectTables("employees");
```

```ts
// Select multiple tables by name, removing all other tables
await sdb.selectTables(["customers", "products"]);
```

```ts
// Select a single table using a SimpleTable instance
const employeesTable = sdb.newTable("employees");
// ... load data ...
await sdb.selectTables(employeesTable);
```

## Inherited from

`SimpleDBCore.selectTables`
