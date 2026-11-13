[**Simple Data Analysis v6.0.21**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / loadHtmlTable

# Method: loadHtmlTable()

> **loadHtmlTable**(`url`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:728](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.24/src/class/SimpleTable.ts#L728)

Loads a simple HTML table from a web page. A first row made entirely of
`<th>` cells supplies the column names. Data rows are loaded as strings.

Provide `columns` to rename the headers or load a table whose first row
contains data. The number of names must match the number of cells per row.

## Parameters

### url

`string`

The HTTP or HTTPS URL of the web page.

### options?

Options for choosing the table and naming its columns.

#### columns?

`string`[]

Custom column names. Required when the table has no header row.

#### id?

`string`

The HTML `id` of a table or an element containing tables. A table with this ID is selected at index `0`.

#### index?

`number`

The zero-based table index within the page or the element selected by `id`. Defaults to `0`.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Load the first table on the page.
await table.loadHtmlTable("https://example.com/results").log();
```

```ts
// Load the second table on the page.
await table.loadHtmlTable("https://example.com/results", { index: 1 }).log();
```

```ts
// Load the table with this HTML ID.
await table.loadHtmlTable("https://example.com/results", { id: "results-table" }).log();
```

```ts
// Load the second table in the section and name its columns.
await table
  .loadHtmlTable("https://example.com/results", {
    id: "results-section",
    index: 1,
    columns: ["city", "population"],
  })
  .log();
```

## Inherited from

`SimpleTableCore.loadHtmlTable`
