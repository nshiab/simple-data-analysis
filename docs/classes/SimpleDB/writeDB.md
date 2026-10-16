[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleDB](../SimpleDB.md) / writeDB

# Method: writeDB()

> **writeDB**(`file`, `options?`): `Promise`\<[`SimpleDB`](../SimpleDB.md)\>

Exports a snapshot of the current database after executing pending work.
Does not change the working database or where subsequent changes persist.
DuckDB outputs (`.db` and `.duckdb`) preserve database objects and embed SDA
index definitions in the reserved `__sda` schema.

SQLite output (`.sqlite`) materializes main-schema tables and views as
tables. It does not preserve DuckDB schemas, indexes, constraints, or SDA
metadata, and SQLite type conversion may lose type information. Unsupported
conversions fail without replacing an existing destination.

Existing files require explicit overwrite permission. The completed export
is published only after its connection is detached. Database files attached
to this instance, directories, and symbolic links cannot be replaced.

## Parameters

### file

`string`

The relative or absolute path to the output file.

### options?

Configuration options for writing the database.

#### metadata?

`boolean`

If false, omits logical SDA index definitions from DuckDB exports. Defaults to true. Does not control physical indexes; SQLite exports never include SDA metadata.

#### overwrite?

`boolean`

If true, permits atomic replacement of an existing output file. Defaults to false.

## Returns

`Promise`\<[`SimpleDB`](../SimpleDB.md)\>

A promise that resolves to the database, so methods can be chained.

## Examples

```ts
// Write the current database to a DuckDB file
await sdb.writeDB("./my_exported_database.db");
```

```ts
// Explicitly replace an earlier snapshot
await sdb.writeDB("./my_exported_database.duckdb", { overwrite: true });
```

```ts
// Export table data for use with SQLite
await sdb.writeDB("./my_exported_database.sqlite");
```

## Inherited from

`SimpleDBCore.writeDB`
