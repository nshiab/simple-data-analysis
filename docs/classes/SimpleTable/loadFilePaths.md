[**Simple Data Analysis v6.0.18**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / loadFilePaths

# Method: loadFilePaths()

> **loadFilePaths**(`patterns`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:677](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.22/src/class/SimpleTable.ts#L677)

Loads the absolute paths of local files that match one or more glob patterns
into a single `path` column. Use `*` to match within one folder and `**` to
search at any depth.

Relative patterns start from the current working directory when you call
this method. For example, if you run your script from `/project`,
`./documents/*.pdf` searches `/project/documents`.

## Parameters

### patterns

`string` \| `string`[]

A local glob pattern or an array of local glob patterns.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
await table.loadFilePaths("./documents/*.pdf").log();
```

```ts
// Find all files under documents and JPGs directly inside photos.
await table.loadFilePaths(["./documents/**", "./photos/*.jpg"]).log();
```

## Inherited from

`SimpleTableCore.loadFilePaths`
