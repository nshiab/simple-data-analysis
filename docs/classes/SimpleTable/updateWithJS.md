[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / updateWithJS

# Method: updateWithJS()

> **updateWithJS**(`dataModifier`, `options?`): `this`

Updates data in the table using a JavaScript function. The function receives the existing rows as an array of objects and must return the modified rows as an array of objects.
This method offers high flexibility for data manipulation but can be slow for large tables as it involves transferring data between DuckDB and JavaScript.
Before writing a JavaScript callback, check for an existing SDA method that
performs the same operation; it will usually be faster and more efficient.
Existing integer and enum columns retain their types. Fractional or
out-of-range integers and unknown enum members throw when written. The
original table is replaced after all callback results have been converted
successfully.

If the table has geometry columns, the callback can read and modify their
GeoJSON geometry objects directly. Extra properties added to these objects
are ignored; create new columns on the returned rows to store additional
attributes. All geometry columns must use EPSG:4326; use reproject() first
if needed.

## Parameters

### dataModifier

((`rows`) => `Promise`\<`object`[]\>) \| ((`rows`) => `object`[])

A synchronous or asynchronous function that takes the existing rows (as an array of objects) and returns the modified rows (as an array of objects).

### options?

An optional object with configuration options:

#### batchSize?

`number`

If provided, rows are processed in batches of this size instead of all at once, so large tables don't have to be materialized entirely in memory. This limits input rows per batch, but does not eliminate conversion work or bound geometry size or callback output expansion. The modifier function is called once per batch. Tables with a column named `rowid` or `__sda_rowid` (case-insensitive) are rejected before the modifier runs; rename the column or omit batchSize.

#### columnTypes?

\{\[`key`: `string`\]: `string`; \}

Explicit types for newly added columns, following loadArray's columnTypes contract. Declare geometry as GEOMETRY('EPSG:4326'); geometry is never inferred from object shape. Existing columns cannot be redeclared.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Double the value in each row with a JavaScript callback.
await table.loadArray([{ value: 1 }, { value: 2 }])
  .updateWithJS((rows) => rows.map((row) => ({
    value: Number(row.value) * 2,
  })))
  .log();
```

```ts
// Process two rows per callback to limit how many rows are handled at once.
await table.loadArray([{ value: 1 }, { value: 2 }, { value: 3 }])
  .updateWithJS((rows) => rows.map((row) => ({
    value: Number(row.value) * 2,
  })), { batchSize: 2 })
  .log();
```

```ts
// Add a JSON object column to keep related attributes together.
await table.loadArray([{ name: "Station" }])
  .updateWithJS((rows) => rows.map((row) => ({
    ...row, details: { active: true, category: "weather" },
  })), { columnTypes: { details: "JSON" } })
  .log();
```

```ts
// Add a three-element float vector, such as an embedding.
await table.loadArray([{ name: "Station" }])
  .updateWithJS((rows) => rows.map((row) => ({
    ...row, embedding: [0.25, 0.5, 0.75],
  })), { columnTypes: { embedding: "FLOAT[3]" } })
  .log();
```

```ts
// Move each point slightly east by editing its longitude.
await sdb.newTable().loadArray([{
  geom: { type: "Point", coordinates: [-73, 45] },
}], { columnTypes: { geom: "GEOMETRY('EPSG:4326')" } })
  .updateWithJS((rows) => rows.map((row) => {
    // This example loads only Points. Narrow the type for coordinate access.
    const geom = row.geom as { type: "Point"; coordinates: number[] } | null;
    if (geom !== null) geom.coordinates[0] += 0.01;
    return row;
  })).log();
```

```ts
// Create a geometry column from longitude and latitude values.
await sdb.newTable().loadArray([{ longitude: -73, latitude: 45 }])
  .updateWithJS((rows) => rows.map((row) => ({
    ...row, geom: { type: "Point", coordinates: [row.longitude, row.latitude] },
  })), { columnTypes: { geom: "GEOMETRY('EPSG:4326')" } }).log();
```

## Inherited from

`SimpleTableCore.updateWithJS`
