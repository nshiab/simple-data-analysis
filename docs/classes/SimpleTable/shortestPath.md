[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / shortestPath

# Method: shortestPath()

> **shortestPath**(`sourceColumn`, `targetColumn`, `edgeId`, `start`, `end`, `options?`): `SimpleTable`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:3891](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L3891)

Finds the shortest route between two different nodes. If several routes
tie for shortest, all of them are returned. By default, the shortest
route uses the fewest connections. Use the `weight` option to find the
route with the smallest sum of values from a numeric column, such as
travel time. A route cannot visit the same node twice, to avoid loops.
Different routes can still share the same nodes.

The `direction` option lets you follow connections from source to target,
from target to source, or in either direction.

Each connection needs a unique, non-null ID. Pass the name of the column
containing these IDs as the `edgeId` argument. If your table is missing
an ID column, you can easily create one with `addId()`.

The result starts with `pathId`, `step`, and `weight`, followed by the
optional metric columns and all original columns. Steps start at one and
follow the search direction. The `weight` column is the connection cost,
or one when no `weight` option is supplied. Supplying `weight` also adds
`total`, the sum of those costs up to and including the current step.
Enabling `elapsedTime` adds cumulative `elapsedTimeMs`, including gaps.

If an input column conflicts with a generated result column (regardless
of capitalization), the method throws an error. Rename it with
`renameColumns()` first. `total` is reserved only when `weight` is supplied,
and `elapsedTimeMs` only when elapsed-time reporting is enabled.

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

Use `minimize: "steps"` to choose the fewest connections even when weight
or elapsed-time reporting is enabled. Without an explicit `minimize`, the
method minimizes weight when only `weight` is enabled, elapsed time when
only `elapsedTime` is enabled, and steps when neither is enabled. With
both enabled, specify `"steps"`, `"weight"`, or `"elapsedTime"` explicitly.
Elapsed-time reporting requires both time columns.

All routes tied on the selected metric are returned, even if their other
metrics differ. Each route reports its own weights and elapsed times.

Routes are numbered from zero by comparing their sequences of connection
IDs, element by element. Rows are sorted by `pathId`, then `step`.

Unknown IDs or nodes with no route between them produce no rows. The
start and end must differ. Self-connections are ignored. Weights must
be non-null, finite, and non-negative.

There is no limit on route length or the number of tied routes returned.
Finding many tied routes can take a long time and use substantial memory.

The first example uses this table:

| edgeId | source | target |
| --- | --- | --- |
| E1 | A | B |
| E2 | A | C |
| E3 | B | D |
| E4 | C | D |
| E5 | D | E |

By default, the method finds routes from source to target with the fewest
connections. Two routes from A to E tie at three connections each:

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

#### minimize?

`"steps"` \| `"weight"` \| `"elapsedTime"`

The metric used to select optimal routes: `"steps"`, `"weight"`, or `"elapsedTime"`. Defaults to `"weight"` when only `weight` is enabled, `"elapsedTime"` when only elapsed-time reporting is enabled, and `"steps"` when neither is enabled. Required when both are enabled. `"steps"` is always available; the other metrics require their corresponding options.

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

The name of the numeric column used as the cost of each connection. Adds `total`, the cumulative sum of those costs. If omitted, no `total` column is generated.

## Returns

`SimpleTable`

The table of route connections with optional cumulative `total` and `elapsedTimeMs` metrics, so methods can be chained.

## Examples

```ts
await connections
  .shortestPath("source", "target", "edgeId", "A", "E")
  .log();
```

| pathId | step | weight | edgeId | source | target |
| ---: | ---: | ---: | --- | --- | --- |
| 0 | 1 | 1 | E1 | A | B |
| 0 | 2 | 1 | E3 | B | D |
| 0 | 3 | 1 | E5 | D | E |
| 1 | 1 | 1 | E2 | A | C |
| 1 | 2 | 1 | E4 | C | D |
| 1 | 3 | 1 | E5 | D | E |

For an input without connection IDs, use `addId()` first:

| source | target |
| --- | --- |
| A | B |
| B | E |

The generated IDs identify the connections in the result:

```ts
await unnumberedConnections
  .addId("edgeId", { prefix: "edge-" })
  .shortestPath("source", "target", "edgeId", "A", "E")
  .log();
```

| pathId | step | weight | source | target | edgeId |
| ---: | ---: | ---: | --- | --- | --- |
| 0 | 1 | 1 | A | B | edge-0 |
| 0 | 2 | 1 | B | E | edge-1 |

The next two examples each start with these flights. The direct flight
takes ten minutes; the route through B and D takes three:

| flightId | origin | destination | minutes |
| --- | --- | --- | ---: |
| F1 | A | E | 10 |
| F2 | A | B | 1 |
| F3 | B | D | 1 |
| F4 | D | E | 1 |

With `weight: "minutes"`, the route with the shortest travel time is
chosen:

```ts
await flights
  .shortestPath("origin", "destination", "flightId", "A", "E", {
    weight: "minutes",
  })
  .log();
```

| pathId | step | weight | total | flightId | origin | destination | minutes |
| ---: | ---: | ---: | ---: | --- | --- | --- | ---: |
| 0 | 1 | 1 | 1 | F2 | A | B | 1 |
| 0 | 2 | 1 | 2 | F3 | B | D | 1 |
| 0 | 3 | 1 | 3 | F4 | D | E | 1 |

Without the `weight` option, the direct flight is shortest because it
uses only one connection:

```ts
await flights
  .shortestPath("origin", "destination", "flightId", "A", "E")
  .log();
```

| pathId | step | weight | flightId | origin | destination | minutes |
| ---: | ---: | ---: | --- | --- | --- | ---: |
| 0 | 1 | 1 | F1 | A | E | 10 |

With time options, the cheaper route through B is ruled out because F2
leaves before F1 arrives. The route through C meets the one-hour minimum
gap:

| flightId | origin | destination | departureTime | arrivalTime | cost |
| --- | --- | --- | --- | --- | ---: |
| F1 | A | B | 2025-01-01 08:00 | 2025-01-01 10:00 | 1 |
| F2 | B | E | 2025-01-01 09:00 | 2025-01-01 10:00 | 1 |
| F3 | A | C | 2025-01-01 08:00 | 2025-01-01 09:00 | 2 |
| F4 | C | E | 2025-01-01 10:00 | 2025-01-01 11:00 | 2 |

```ts
await scheduledFlights
  .shortestPath("origin", "destination", "flightId", "A", "E", {
    startTimeColumn: "departureTime",
    endTimeColumn: "arrivalTime",
    minGapMs: 60 * 60 * 1000,
    weight: "cost",
  })
  .log();
```

| pathId | step | weight | total | flightId | origin | destination | departureTime | arrivalTime | cost |
| ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- | ---: |
| 0 | 1 | 2 | 2 | F3 | A | C | 2025-01-01 08:00:00 | 2025-01-01 09:00:00 | 2 |
| 0 | 2 | 2 | 4 | F4 | C | E | 2025-01-01 10:00:00 | 2025-01-01 11:00:00 | 2 |

With `direction: "incoming"`, connections are followed from target to
source. The original source and target values remain unchanged. For
this input:

| edgeId | source | target |
| --- | --- | --- |
| F1 | A | B |

```ts
await reverseExample
  .shortestPath("source", "target", "edgeId", "B", "A", {
    direction: "incoming",
  })
  .log();
```

| pathId | step | weight | edgeId | source | target |
| ---: | ---: | ---: | --- | --- | --- |
| 0 | 1 | 1 | F1 | A | B |

For the next three examples, `flights` contains these rows, with departure
and arrival stored as timestamps on the same day:

| flightId | origin | destination | departure | arrival | price |
| --- | --- | --- | --- | --- | ---: |
| F1 | A | B | 2025-01-01 09:00 | 2025-01-01 10:00 | 40 |
| F2 | B | C | 2025-01-01 12:00 | 2025-01-01 13:00 | 40 |
| F3 | A | C | 2025-01-01 09:00 | 2025-01-01 12:00 | 120 |
| F4 | A | D | 2025-01-01 09:00 | 2025-01-01 09:30 | 60 |
| F5 | D | C | 2025-01-01 10:30 | 2025-01-01 11:00 | 80 |

Find the fastest journey from A to C, including layovers:

```ts
await flights
  .shortestPath("origin", "destination", "flightId", "A", "C", {
    startTimeColumn: "departure",
    endTimeColumn: "arrival",
    minGapMs: 60 * 60 * 1000,
    elapsedTime: true,
  })
  .log();
```

| pathId | step | weight | elapsedTimeMs | flightId | origin | destination | departure | arrival | price |
| ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- | ---: |
| 0 | 1 | 1 | 1800000 | F4 | A | D | 2025-01-01 09:00:00 | 2025-01-01 09:30:00 | 60 |
| 0 | 2 | 1 | 7200000 | F5 | D | C | 2025-01-01 10:30:00 | 2025-01-01 11:00:00 | 80 |

The route through D takes two hours (7,200,000 milliseconds), including
a one-hour layover. The direct flight takes three hours.

Find the fastest journey while also adding up its price:

```ts
await flights
  .shortestPath("origin", "destination", "flightId", "A", "C", {
    startTimeColumn: "departure",
    endTimeColumn: "arrival",
    minGapMs: 60 * 60 * 1000,
    elapsedTime: true,
    weight: "price",
    minimize: "elapsedTime",
  })
  .log();
```

| pathId | step | weight | total | elapsedTimeMs | flightId | origin | destination | departure | arrival | price |
| ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- | ---: |
| 0 | 1 | 60 | 60 | 1800000 | F4 | A | D | 2025-01-01 09:00:00 | 2025-01-01 09:30:00 | 60 |
| 0 | 2 | 80 | 140 | 7200000 | F5 | D | C | 2025-01-01 10:30:00 | 2025-01-01 11:00:00 | 80 |

Use `minimize: "weight"` to find the cheapest journey instead.
All ties on the chosen metric are returned.

Choose the fewest flights while still reporting price and elapsed time.
The direct flight takes one step, although the route through D is faster:

```ts
await flights
  .shortestPath("origin", "destination", "flightId", "A", "C", {
    startTimeColumn: "departure",
    endTimeColumn: "arrival",
    minGapMs: 60 * 60 * 1000,
    elapsedTime: true,
    weight: "price",
    minimize: "steps",
  })
  .log();
```

| pathId | step | weight | total | elapsedTimeMs | flightId | origin | destination | departure | arrival | price |
| ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- | ---: |
| 0 | 1 | 120 | 120 | 10800000 | F3 | A | C | 2025-01-01 09:00:00 | 2025-01-01 12:00:00 | 120 |

## Inherited from

`SimpleTableCore.shortestPath`
