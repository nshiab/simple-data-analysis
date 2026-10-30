[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / pad

# Method: pad()

> **pad**(`columns`, `length`, `options?`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:5044](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L5044)

Pads the strings in the specified columns to a target length.

The columns must contain string (VARCHAR) values. An error is thrown if any
column is of a different type. `null` values remain `null`. If any string
already exceeds the target length, an error is thrown (no silent truncation).

## Parameters

### columns

`string` \| `string`[]

The column name(s) containing strings to be padded.

### length

`number`

The target length of the padded strings.

### options?

An optional object with configuration options:

#### character?

`string`

The character to use for padding. Defaults to `'0'`.

#### side?

`"left"` \| `"right"`

Which side to pad. `'left'` (default) or `'right'`.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Left-pad 'id' column to 3 characters with zeros (default)
await table.pad("id", 3).log();
// Result: '1' -> '001', '23' -> '023', null -> null
```

```ts
// Right-pad 'code' column to 5 characters with spaces
await table.pad("code", 5, { side: "right", character: " " }).log();
// Result: '123' -> '123  ', '45' -> '45   ', null -> null
```

```ts
// Left-pad multiple columns to 5 characters with dashes
await table.pad(["id", "code"], 5, { side: "left", character: "-" }).log();
// Result: '1' -> '----1', '23' -> '---23'
```

## Throws

If any column is not of string (VARCHAR) type.

## Throws

If any string value exceeds the target length.

## Inherited from

`SimpleTableCore.pad`
