[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / extractDatePart

# Method: extractDatePart()

> **extractDatePart**(`column`, `parts`): `this`

Extracts one or more components from a temporal column into new columns.
Pass a single part to create a column with that part's name, or pass an
object mapping custom new-column names to parts. Existing columns are not
overwritten.

`dayOfWeek` uses Sunday as `0` through Saturday as `6`. `week` follows
ISO week numbering, and `dayOfYear` starts at `1`. DuckDB `DATE`, `TIME`,
`TIMESTAMP`, and `TIMESTAMP WITH TIME ZONE` columns are supported when the
requested component applies to that type: date parts apply to dates and
timestamps, while time parts apply to times and timestamps. `NULL` input
values produce `NULL` extracted values. Parts extracted from
`TIMESTAMP WITH TIME ZONE` values use UTC.

## Parameters

### column

`string`

The temporal column from which to extract components.

### parts

`"year"` \| `"quarter"` \| `"month"` \| `"week"` \| `"day"` \| `"dayOfWeek"` \| `"dayOfYear"` \| `"hour"` \| `"minute"` \| `"second"` \| \{\[`newColumn`: `string`\]: `"year"` \| `"quarter"` \| `"month"` \| `"week"` \| `"day"` \| `"dayOfWeek"` \| `"dayOfYear"` \| `"hour"` \| `"minute"` \| `"second"`; \}

A part to extract using its name as the new column, or an object mapping each custom new-column name to the part it should contain.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Add a column named 'year' from the 'publishedAt' timestamp
await table.extractDatePart("publishedAt", "year").log();
```

```ts
// Extract multiple components with custom column names
await table.extractDatePart("publishedAt", {
  publicationYear: "year",
  publicationMonth: "month",
}).log();
```

## Inherited from

`SimpleTableCore.extractDatePart`
