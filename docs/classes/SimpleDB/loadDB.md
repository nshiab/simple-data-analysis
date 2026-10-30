[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleDB](../SimpleDB.md) / loadDB

# Method: loadDB()

> **loadDB**(`file`): `Promise`\<[`SimpleDB`](../SimpleDB.md)\>

Defined in: [simple-data-analysis-core/src/class/SimpleDB.ts:925](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleDB.ts#L925)

Imports a copy of a `.db` or `.duckdb` (DuckDB) or `.sqlite` (SQLite)
file into the current database. The source is opened read-only and detached
after importing; subsequent transformations do not modify the source file.
Imports work with in-memory and writable persistent databases. Existing
table-name conflicts are rejected. A failed import may leave partial changes
in the destination database.

DuckDB files restore embedded SDA index definitions when present. SQLite
imports copy data without SDA index metadata. The `__sda` schema is reserved
for SDA metadata.
To edit an existing DuckDB file in place, use `new SimpleDB({ file })`.

## Parameters

### file

`string`

The relative or absolute path to the database file.

## Returns

`Promise`\<[`SimpleDB`](../SimpleDB.md)\>

A promise that resolves to the database, so methods can be chained.

## Examples

```ts
// Load a DuckDB database file
await sdb.loadDB("./my_database.db");
```

```ts
// Import SQLite tables without modifying the original file
await sdb.loadDB("./my_database.sqlite");
```

```ts
// Import a copy into a persistent DuckDB database
const sdb = new SimpleDB({ file: "./analysis.duckdb" });
await sdb.loadDB("./archive.db");
await sdb.close();
```

## Inherited from

`SimpleDBCore.loadDB`
