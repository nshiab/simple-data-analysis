[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / replace

# Method: replace()

> **replace**(`columns`, `replacements`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:4902](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L4902)

Replaces specified strings in the selected columns.
Use `["all"]` to target a column literally named `all`.

## Parameters

### columns

`string` \| `string`[]

The column name, an array of column names, or `"all"` to apply the replacement to every column in the table.

### replacements

\{\[`key`: `string`\]: `string`; \}

An object mapping old strings to new strings (e.g., `{ "oldValue": "newValue" }`).

### options?

An optional object with configuration options:

#### entireString?

`boolean`

A boolean indicating whether the entire cell content must match the `oldString` for replacement to occur. Defaults to `false` (replaces substrings).

#### regex?

`boolean`

A boolean indicating whether the `oldString` should be treated as a regular expression for global replacement. Cannot be used with `entireString: true`. Defaults to `false`.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Replace all occurrences of "kilograms" with "kg" in 'column1'
await table.replace("column1", { "kilograms": "kg" }).log();
```

```ts
// Replace "kilograms" with "kg" and "liters" with "l" in 'column1' and 'column2'
await table.replace(["column1", "column2"], { "kilograms": "kg", "liters": "l" }).log();
```

```ts
// Replace only if the entire string in 'column1' is "kilograms"
await table.replace("column1", { "kilograms": "kg" }, { entireString: true }).log();
```

```ts
// Replace any sequence of one or more digits with a hyphen in 'column1' using regex
await table.replace("column1", { "\d+": "-" }, { regex: true }).log();
```

```ts
// Replace "%" with "" in all columns
await table.replace("all", { "%": "" }).log();
```

## Inherited from

`SimpleTableCore.replace`
