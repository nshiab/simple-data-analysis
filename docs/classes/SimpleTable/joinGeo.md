[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / joinGeo

# Method: joinGeo()

> **joinGeo**(`rightTable`, `method`, `options?`): `this`

Merges the data of this table (considered the left table) with another table (the right table) based on a spatial relationship.
Note that the order of rows in the returned data is not guaranteed to be the same as in the original tables.
This operation might create temporary files in a `.tmp` folder; consider adding `.tmp` to your `.gitignore`.

## Parameters

### rightTable

`SimpleTable`

The SimpleTable instance to be joined with this table.

### method

`"intersect"` \| `"inside"` \| `"withinDistance"`

The spatial join method to use: `"intersect"` (geometries overlap), `"inside"` (geometries of the left table are entirely within geometries of the right table), or `"withinDistance"` (geometries of the left table are within a specified distance of geometries in the right table).

### options?

An optional object with configuration options:

#### distance?

`number`

Required if `method` is `"withinDistance"`. The target distance for the spatial join. The unit depends on `distanceMethod`.

#### distanceMethod?

`"srs"` \| `"haversine"` \| `"spheroid"`

The method for distance calculations: `"srs"` (default, uses the SRS unit), `"haversine"` (uses meters, requires EPSG:4326 (WGS84) input), or `"spheroid"` (uses meters, requires EPSG:4326 (WGS84) input, most accurate but slowest).

#### excludeLeftGeometry?

`boolean`

Whether to exclude the selected `leftColumn` geometry from the result. Defaults to `false`.

#### excludeRightGeometry?

`boolean`

Whether to exclude the selected `rightColumn` geometry from the result. Defaults to `false`.

#### leftColumn?

`string`

The name of the column storing geometries in the left table (this table). If omitted, the method attempts to find one.

#### outputTable?

`string` \| `boolean`

If `true`, the results will be stored in a new table with a generated name. If a string, it will be used as the name for the new table. If `false` or omitted, the current table will be overwritten. Defaults to `false`.

#### rightColumn?

`string`

The name of the column storing geometries in the right table. If omitted, the method attempts to find one.

#### type?

`"inner"` \| `"left"` \| `"right"` \| `"full"`

The type of join operation to perform: `"inner"`, `"left"` (default), `"right"`, or `"full"`. For some types (like `"inside"`), the table order is important.

## Returns

`this`

A table instance containing the spatially joined data (either the current table or a new table), so methods can be chained.

## Examples

```ts
// Merge data based on intersecting geometries, overwriting tableA
await tableA.joinGeo(tableB, "intersect").log();
```

```ts
// Merge data where geometries in tableA are inside geometries in tableB
await tableA.joinGeo(tableB, "inside").log();
```

```ts
// Join using both geometries without copying them into the result
await tableA.joinGeo(tableB, "intersect", {
  excludeLeftGeometry: true,
  excludeRightGeometry: true,
}).log();
```

```ts
// Merge data where geometries in tableA are within 10 units (SRS) of geometries in tableB
await tableA.joinGeo(tableB, "withinDistance", { distance: 10 }).log();
```

```ts
// Merge data where geometries in tableA are within 10 kilometers (Haversine) of geometries in tableB
// Input geometries must be in EPSG:4326 (WGS84).
await tableA.joinGeo(tableB, "withinDistance", { distance: 10, distanceMethod: "haversine", unit: "km" }).log();
```

```ts
// Merge data with specific geometry columns and an inner join type, storing results in a new table
const tableC = await tableA.joinGeo(tableB, "intersect", {
  leftColumn: "geometriesA",
  rightColumn: "geometriesB",
  type: "inner",
  outputTable: true,
}).log();
```

## Inherited from

`SimpleTableCore.joinGeo`
