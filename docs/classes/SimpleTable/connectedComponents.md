[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / connectedComponents

# Method: connectedComponents()

> **connectedComponents**(`sourceColumn`, `targetColumn`, `options?`): `SimpleTable`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:3172](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L3172)

Groups nodes that are connected to one another, directly or through other
nodes. By default, connection direction is ignored. With the `mode`
option set to "strong", nodes belong to the same group only if each can
reach all the others by following connections from source to target.

The result has `componentId` and `node` columns. Without `startTimeColumn`
or `endTimeColumn`, each node appears once, and rows are sorted by node.
Groups are numbered from zero in order of their smallest node ID.

Use the `startTimeColumn` or `endTimeColumn` options to follow connections
in chronological order. The `minGapMs` option sets the minimum gap between
consecutive connections, in milliseconds. With both time columns, gaps are
measured from one connection's end to the next connection's start; with one
column, between their timestamps. The `strictOrdering` option defaults to
`true`, rejecting zero-duration gaps. These options require an explicitly
supplied `mode: "strong"`.

With these options, nodes are grouped when each can reach all the others
in chronological order. Groups can overlap, so a node may appear in
several rows with different `componentId` values.

For the first example, we start with this data:

| origin | destination |
| --- | --- |
| A | B |
| C | D |

By default, the method groups connected nodes without considering
direction. B and D are included even though they only appear as
destinations:

## Parameters

### sourceColumn

`string`

The name of the column containing each connection's source node ID.

### targetColumn

`string`

The name of the column containing each connection's target node ID.

### options?

An optional object with component, time, and result configuration.

#### endTimeColumn?

`string`

The name of the column containing each connection's end time. Use this or `startTimeColumn` to follow connections in chronological order.

#### minGapMs?

`number`

The minimum gap between consecutive connections, in milliseconds. Must be a non-negative integer. Defaults to `0`. Requires a time column.

#### mode?

`"weak"` \| `"strong"`

Whether to find `"weak"` or `"strong"` components. Defaults to `"weak"`. Using `startTimeColumn` or `endTimeColumn` requires explicitly setting `mode: "strong"`.

#### outputTable?

`string` \| `boolean`

If `true`, stores the result in a new table with a generated name. If a string, uses it as the new table's name. If `false` or omitted, overwrites the current table. Defaults to `false`.

#### startTimeColumn?

`string`

The name of the column containing each connection's start time. Use this or `endTimeColumn` to follow connections in chronological order.

#### strictOrdering?

`boolean`

Whether to reject zero-duration gaps between consecutive connections (equal timestamps). Defaults to `true`. Requires a time column.

## Returns

`SimpleTable`

The result table, so methods can be chained.

## Examples

```ts
await table
  .connectedComponents("origin", "destination")
  .log();
```

| componentId | node |
| ---: | --- |
| 0 | A |
| 0 | B |
| 1 | C |
| 1 | D |

The next two examples each start with this chain of connections:

| source | target |
| --- | --- |
| A | B |
| B | C |

By default, all three nodes belong to the same group:

```ts
await graph
  .connectedComponents("source", "target")
  .log();
```

| componentId | node |
| ---: | --- |
| 0 | A |
| 0 | B |
| 0 | C |

With the `mode` option set to "strong", each node forms its own group. A
can reach B and C, but neither can get back to A:

```ts
await graph
  .connectedComponents("source", "target", {
    mode: "strong",
  })
  .log();
```

| componentId | node |
| ---: | --- |
| 0 | A |
| 1 | B |
| 2 | C |

Adding C -> A would let every node reach the others, so all three would
belong to the same group in "strong" mode too.

Chronological strong groups can overlap. The next example uses one
instantaneous timestamp column:

| time | source | target |
| --- | --- | --- |
| 2025-01-01 08:00 | B | C |
| 2025-01-01 09:00 | C | B |
| 2025-01-01 10:00 | A | B |
| 2025-01-01 11:00 | B | A |

A and B can reach each other, as can B and C, but A cannot reach C after
its first event. This produces the maximal groups `{A, B}` and `{B, C}`:

```ts
await transactions
  .connectedComponents("source", "target", {
    mode: "strong",
    startTimeColumn: "time",
  })
  .log();
```

| componentId | node |
| ---: | --- |
| 0 | A |
| 0 | B |
| 1 | B |
| 1 | C |

## Inherited from

`SimpleTableCore.connectedComponents`
