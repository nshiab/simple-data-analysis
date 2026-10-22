[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / reachable

# Method: reachable()

> **reachable**(`sourceColumn`, `targetColumn`, `startNodes`, `options?`): `SimpleTable`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:3024](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L3024)

Finds all nodes you can reach from one or more starting nodes, following
one or more connections. The `direction` option lets you follow
connections from source to target, from target to source, or in either
direction. The result has `start` and `node` columns, sorted by `start`,
then `node`.

A starting node appears in its own results only if following connections
leads back to it, such as a self-connection or a cycle. Each reachable
node appears only once per start. With `direction: "both"`, following
the same connection out and back also reaches the starting node.

Unknown starting IDs and starts with no connections to follow produce
no rows. Empty start arrays and duplicate starting IDs throw an error.

Use the `startTimeColumn` or `endTimeColumn` options to follow connections
in chronological order. The `minGapMs` option sets the minimum gap between
consecutive connections, in milliseconds. With both time columns, gaps are
measured from one connection's end to the next connection's start; with one
column, between their timestamps. The `strictOrdering` option defaults to
`true`, rejecting zero-duration gaps. These options only work with
`direction: "outgoing"` or `direction: "incoming"`.

The next four examples each start with this data:

| origin | destination |
| --- | --- |
| A | B |
| A | C |
| B | D |
| C | D |
| D | A |

By default, the method follows connections from source to target. A
appears in its own results because A → B → D → A leads back to it:

## Parameters

### sourceColumn

`string`

The name of the column containing each connection's source node ID.

### targetColumn

`string`

The name of the column containing each connection's target node ID.

### startNodes

`string` \| `number` \| `bigint` \| (`string` \| `number` \| `bigint`)[]

One starting node ID or an array of distinct starting node IDs.

### options?

An optional object with direction, time, and result configuration.

#### direction?

`"both"` \| `"outgoing"` \| `"incoming"`

The direction in which to follow connections. Defaults to `"outgoing"`.

#### endTimeColumn?

`string`

The name of the column containing each connection's end time. Use this or `startTimeColumn` to follow connections in chronological order.

#### minGapMs?

`number`

The minimum gap between consecutive connections, in milliseconds. Must be a non-negative integer. Defaults to `0`. Requires a time column.

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
await connections
  .reachable("origin", "destination", "A")
  .log();
```

| start | node |
| --- | --- |
| A | A |
| A | B |
| A | C |
| A | D |

With `direction: "incoming"`, connections are followed from target to
source. Starting at B:

```ts
await connections
  .reachable("origin", "destination", "B", { direction: "incoming" })
  .log();
```

| start | node |
| --- | --- |
| B | A |
| B | B |
| B | C |
| B | D |

With `direction: "both"`, connections can be followed in either
direction:

```ts
await connections
  .reachable("origin", "destination", "B", { direction: "both" })
  .log();
```

| start | node |
| --- | --- |
| B | A |
| B | B |
| B | C |
| B | D |

With multiple starting nodes, each has its own results:

```ts
await connections
  .reachable("origin", "destination", ["B", "A"])
  .log();
```

| start | node |
| --- | --- |
| A | A |
| A | B |
| A | C |
| A | D |
| B | A |
| B | B |
| B | C |
| B | D |

Chronological options retain only journeys with valid connection times.
Here, A → B arrives at 10:00, so the 09:00 connection to C is unavailable,
while the 11:00 connection to D meets the one-hour minimum gap:

| origin | destination | departureTime | arrivalTime |
| --- | --- | --- | --- |
| A | B | 2025-01-01 08:00 | 2025-01-01 10:00 |
| B | C | 2025-01-01 09:00 | 2025-01-01 10:00 |
| B | D | 2025-01-01 11:00 | 2025-01-01 12:00 |

The departure and arrival columns are timestamps:

```ts
await flights
  .reachable("origin", "destination", "A", {
    startTimeColumn: "departureTime",
    endTimeColumn: "arrivalTime",
    minGapMs: 60 * 60 * 1000,
  })
  .log();
```

| start | node |
| --- | --- |
| A | B |
| A | D |

## Inherited from

`SimpleTableCore.reachable`
