[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / paths

# Method: paths()

> **paths**(`sourceColumn`, `targetColumn`, `edgeId`, `start`, `end`, `options?`): `SimpleTable`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:4188](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.14/src/class/SimpleTable.ts#L4188)

Finds all routes between two different nodes. A route cannot visit the
same node twice, to avoid loops. Different routes can still share the
same nodes.

The `direction` option lets you follow connections from source to target,
from target to source, or in either direction.

Each connection needs a unique, non-null ID. Pass the name of the column
containing these IDs as the `edgeId` argument. If your table is missing
an ID column, you can easily create one with `addId()`.

The result starts with the `pathId`, `step`, `weight`, and `total`
columns, followed by all original columns. Steps start at one and follow
the search direction. The `weight` column is the connection cost, and
`total` is the sum of those costs up to and including the current step.
Without the `weight` option, each connection costs one.

If an input column is already named `pathId`, `step`, `weight`, or `total`
(regardless of capitalization), the method throws an error. Rename it
with `renameColumns()` first.

Each row is one connection along a route.

Use the `startTimeColumn` or `endTimeColumn` options to follow connections
in chronological order. The `minGapMs` option sets the minimum gap between
consecutive connections, in milliseconds. With both time columns, gaps are
measured from one connection's end to the next connection's start; with one
column, between their timestamps. The `strictOrdering` option defaults to
`true`, rejecting zero-duration gaps. These options only work with
`direction: "outgoing"` or `direction: "incoming"`.

The minimum gap applies only between consecutive connections, not before
the first connection.

Routes are numbered from zero by comparing their sequences of connection
IDs, element by element. Rows are sorted by `pathId`, then `step`.

Unknown IDs or nodes with no route between them produce no rows. The
start and end must differ. Self-connections are ignored. Weights must
be non-null, finite, and non-negative.

There is no limit on route length or the number of routes returned.
Finding all routes can take a long time and use substantial memory.

For the first example, we start with these connections:

| edgeId | source | target |
| --- | --- | --- |
| E1 | A | B |
| E2 | A | C |
| E3 | B | D |
| E4 | C | D |

By default, connections are followed from source to target. Both routes
from A to D are returned:

## Parameters

### sourceColumn

`string`

The name of the column containing each connection's source node ID.

### targetColumn

`string`

The name of the column containing each connection's target node ID.

### edgeId

`string`

The name of the column uniquely identifying each connection (edge).

### start

`string` \| `number` \| `bigint`

The starting node ID.

### end

`string` \| `number` \| `bigint`

The ending node ID, which must differ from `start`.

### options?

An optional object with direction, time, and result configuration.

#### direction?

`"both"` \| `"outgoing"` \| `"incoming"`

The direction in which to follow connections. Defaults to `"outgoing"`.

#### elapsedTime?

`boolean`

Whether to add cumulative `elapsedTimeMs` in milliseconds, including connection gaps. Defaults to `false`. Requires both time columns.

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

#### weight?

`string`

The name of the numeric column used as the cost of each connection. If omitted, each connection costs one.

## Returns

`SimpleTable`

The result table, so methods can be chained.

## Examples

```ts
await connections
  .paths("source", "target", "edgeId", "A", "D")
  .log();
```

| pathId | step | weight | total | edgeId | source | target |
| ---: | ---: | ---: | ---: | --- | --- | --- |
| 0 | 1 | 1 | 1 | E1 | A | B |
| 0 | 2 | 1 | 2 | E3 | B | D |
| 1 | 1 | 1 | 1 | E2 | A | C |
| 1 | 2 | 1 | 2 | E4 | C | D |

For an input without connection IDs, use `addId()` first:

| source | target |
| --- | --- |
| A | B |
| B | D |

The generated IDs identify the connections in the result:

```ts
await unnumberedConnections
  .addId("edgeId", { prefix: "edge-" })
  .paths("source", "target", "edgeId", "A", "D")
  .log();
```

| pathId | step | weight | total | source | target | edgeId |
| ---: | ---: | ---: | ---: | --- | --- | --- |
| 0 | 1 | 1 | 1 | A | B | edge-0 |
| 0 | 2 | 1 | 2 | B | D | edge-1 |

The next three examples each start with these flights. The direct flight
takes ten minutes; the route through B takes three:

| flightId | origin | destination | minutes |
| --- | --- | --- | ---: |
| F1 | A | D | 10 |
| F2 | A | B | 1 |
| F3 | B | D | 2 |

With `weight: "minutes"`, both routes are returned with their travel
times:

```ts
await flights
  .paths("origin", "destination", "flightId", "A", "D", {
    weight: "minutes",
  })
  .log();
```

| pathId | step | weight | total | flightId | origin | destination | minutes |
| ---: | ---: | ---: | ---: | --- | --- | --- | ---: |
| 0 | 1 | 10 | 10 | F1 | A | D | 10 |
| 1 | 1 | 1 | 1 | F2 | A | B | 1 |
| 1 | 2 | 2 | 3 | F3 | B | D | 2 |

Without the `weight` option, the same routes are returned and total
counts connections:

```ts
await flights
  .paths("origin", "destination", "flightId", "A", "D")
  .log();
```

| pathId | step | weight | total | flightId | origin | destination | minutes |
| ---: | ---: | ---: | ---: | --- | --- | --- | ---: |
| 0 | 1 | 1 | 1 | F1 | A | D | 10 |
| 1 | 1 | 1 | 1 | F2 | A | B | 1 |
| 1 | 2 | 1 | 2 | F3 | B | D | 2 |

With `direction: "incoming"`, the search runs from D to A. Steps follow
that direction, while the original origin and destination values stay
unchanged:

```ts
await flights
  .paths("origin", "destination", "flightId", "D", "A", {
    direction: "incoming",
    weight: "minutes",
  })
  .log();
```

| pathId | step | weight | total | flightId | origin | destination | minutes |
| ---: | ---: | ---: | ---: | --- | --- | --- | ---: |
| 0 | 1 | 10 | 10 | F1 | A | D | 10 |
| 1 | 1 | 2 | 2 | F3 | B | D | 2 |
| 1 | 2 | 1 | 3 | F2 | A | B | 1 |

Chronological routes enforce the connection time between every pair of
steps. For the next two examples, the 09:00 flight leaves before F1
arrives, while F3 meets the one-hour minimum exactly:

| flightId | origin | destination | departureTime | arrivalTime | cost |
| --- | --- | --- | --- | --- | ---: |
| F1 | A | B | 2025-01-01 08:00 | 2025-01-01 10:00 | 2 |
| F2 | B | C | 2025-01-01 09:00 | 2025-01-01 10:00 | 9 |
| F3 | B | D | 2025-01-01 11:00 | 2025-01-01 12:00 | 3 |

The route from A to D contains F1 and F3:

```ts
await scheduledFlights
  .paths("origin", "destination", "flightId", "A", "D", {
    startTimeColumn: "departureTime",
    endTimeColumn: "arrivalTime",
    minGapMs: 60 * 60 * 1000,
    weight: "cost",
  })
  .log();
```

| pathId | step | weight | total | flightId | origin | destination | departureTime | arrivalTime | cost |
| ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- | ---: |
| 0 | 1 | 2 | 2 | F1 | A | B | 2025-01-01 08:00:00 | 2025-01-01 10:00:00 | 2 |
| 0 | 2 | 3 | 5 | F3 | B | D | 2025-01-01 11:00:00 | 2025-01-01 12:00:00 | 3 |

Searching backward from D finds the same physical journey. The steps and
cumulative totals follow the incoming search from D to A:

```ts
await scheduledFlights
  .paths("origin", "destination", "flightId", "D", "A", {
    direction: "incoming",
    startTimeColumn: "departureTime",
    endTimeColumn: "arrivalTime",
    minGapMs: 60 * 60 * 1000,
    weight: "cost",
  })
  .log();
```

| pathId | step | weight | total | flightId | origin | destination | departureTime | arrivalTime | cost |
| ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- | ---: |
| 0 | 1 | 3 | 3 | F3 | B | D | 2025-01-01 11:00:00 | 2025-01-01 12:00:00 | 3 |
| 0 | 2 | 2 | 5 | F1 | A | B | 2025-01-01 08:00:00 | 2025-01-01 10:00:00 | 2 |

For the next two examples, `flights` contains these rows, with departure
and arrival stored as timestamps on the same day:

| flightId | origin | destination | departure | arrival | price |
| --- | --- | --- | --- | --- | ---: |
| F1 | A | B | 2025-01-01 09:00 | 2025-01-01 10:00 | 40 |
| F2 | B | C | 2025-01-01 12:00 | 2025-01-01 13:00 | 40 |
| F3 | A | C | 2025-01-01 09:00 | 2025-01-01 12:00 | 120 |

Report elapsed time for every path, including layovers:

```ts
await flights
  .paths("origin", "destination", "flightId", "A", "C", {
    startTimeColumn: "departure",
    endTimeColumn: "arrival",
    minGapMs: 60 * 60 * 1000,
    elapsedTime: true,
  })
  .log();
```

| pathId | step | weight | total | elapsedTimeMs | flightId | origin | destination | departure | arrival | price |
| ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- | ---: |
| 0 | 1 | 1 | 1 | 3600000 | F1 | A | B | 2025-01-01 09:00:00 | 2025-01-01 10:00:00 | 40 |
| 0 | 2 | 1 | 2 | 14400000 | F2 | B | C | 2025-01-01 12:00:00 | 2025-01-01 13:00:00 | 40 |
| 1 | 1 | 1 | 1 | 10800000 | F3 | A | C | 2025-01-01 09:00:00 | 2025-01-01 12:00:00 | 120 |

The route through B takes four hours (14,400,000 milliseconds),
including its two-hour layover. The direct flight takes three hours.

Add up prices while continuing to report elapsed time for every path:

```ts
await flights
  .paths("origin", "destination", "flightId", "A", "C", {
    startTimeColumn: "departure",
    endTimeColumn: "arrival",
    minGapMs: 60 * 60 * 1000,
    elapsedTime: true,
    weight: "price",
  })
  .log();
```

| pathId | step | weight | total | elapsedTimeMs | flightId | origin | destination | departure | arrival | price |
| ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- | ---: |
| 0 | 1 | 40 | 40 | 3600000 | F1 | A | B | 2025-01-01 09:00:00 | 2025-01-01 10:00:00 | 40 |
| 0 | 2 | 40 | 80 | 14400000 | F2 | B | C | 2025-01-01 12:00:00 | 2025-01-01 13:00:00 | 40 |
| 1 | 1 | 120 | 120 | 10800000 | F3 | A | C | 2025-01-01 09:00:00 | 2025-01-01 12:00:00 | 120 |

## Inherited from

`SimpleTableCore.paths`
