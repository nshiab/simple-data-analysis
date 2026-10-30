[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / degree

# Method: degree()

> **degree**(`sourceColumn`, `targetColumn`, `options?`): `SimpleTable`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:2757](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L2757)

Counts the incoming and outgoing connections for every node found in the
source and target columns. By default, each input row is counted separately,
even when several rows connect the same two nodes. Set the `count` option to
`"neighbors"` to count distinct neighboring nodes instead. Use the `weight`
option to sum values from a numeric column instead of counting connections.
The `weight` option cannot be combined with `count: "neighbors"`.

The result has `node`, `incoming`, `outgoing`, and `total` columns. The
`total` is the sum of `incoming` and `outgoing`. Results are sorted by
highest total first, then by node in ascending order when totals are equal.
A self-connection contributes once to incoming and once to outgoing, so
it contributes twice to the total. With `count: "neighbors"`, a neighbor
connected in both directions also contributes once in each direction.
Endpoint IDs must be non-null strings or whole numbers in compatible
columns. Supplied weights must be non-null, finite, and non-negative.

The next three examples each start with these flights:

| origin | destination | passengers |
| --- | --- | ---: |
| Montreal | Toronto | 100 |
| Montreal | Toronto | 200 |
| Montreal | Vancouver | 50 |
| Toronto | Montreal | 150 |

By default, the method counts connections and overwrites the input table:

## Parameters

### sourceColumn

`string`

The name of the column containing each connection's source node ID.

### targetColumn

`string`

The name of the column containing each connection's target node ID.

### options?

An optional object with counting and result configuration.

#### count?

`"neighbors"` \| `"edges"`

Whether to count connection rows (`"edges"`) or distinct adjacent nodes (`"neighbors"`). Defaults to `"edges"`.

#### outputTable?

`string` \| `boolean`

If `true`, stores the result in a new table with a generated name. If a string, uses it as the new table's name. If `false` or omitted, overwrites the current table. Defaults to `false`.

#### weight?

`string`

The name of the numeric edge-weight column to sum. This requires edge counting.

## Returns

`SimpleTable`

The result table, so methods can be chained.

## Examples

```ts
await flights
  .degree("origin", "destination")
  .log();
```

| node | incoming | outgoing | total |
| --- | ---: | ---: | ---: |
| Montreal | 1 | 3 | 4 |
| Toronto | 2 | 1 | 3 |
| Vancouver | 1 | 0 | 1 |

With `count: "neighbors"`, the two Montreal-to-Toronto flights count as
one outgoing neighbor for Montreal:

```ts
await flights
  .degree("origin", "destination", { count: "neighbors" })
  .log();
```

| node | incoming | outgoing | total |
| --- | ---: | ---: | ---: |
| Montreal | 1 | 2 | 3 |
| Toronto | 1 | 1 | 2 |
| Vancouver | 1 | 0 | 1 |

With `weight: "passengers"`, the method adds passenger counts for each
city's incoming and outgoing flights:

```ts
await flights
  .degree("origin", "destination", { weight: "passengers" })
  .log();
```

| node | incoming | outgoing | total |
| --- | ---: | ---: | ---: |
| Montreal | 150 | 350 | 500 |
| Toronto | 300 | 150 | 450 |
| Vancouver | 50 | 0 | 50 |

A self-connection is counted once in each direction. For this input:

| source | target |
| --- | --- |
| A | A |
| A | B |

```ts
await connections
  .degree("source", "target")
  .log();
```

| node | incoming | outgoing | total |
| --- | ---: | ---: | ---: |
| A | 1 | 2 | 3 |
| B | 1 | 0 | 1 |

## Inherited from

`SimpleTableCore.degree`
