[**Simple Data Analysis v6.0.10**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / findCycles

# Method: findCycles()

> **findCycles**(`sourceColumn`, `targetColumn`, `edgeId`, `startNodes`, `options?`): `SimpleTable`

Finds all cycles starting and ending at each node in `startNodes`.
Pass one node ID or an array of node IDs. A cycle cannot visit the same
node twice, except to return to its start, or reuse a connection.
Different cycles can share nodes. The `direction` option lets you
follow connections from source to target, from target to source, or in
either direction. By default, connections are followed from source to
target.

Each connection needs a unique, non-null ID. Pass the name of the column
containing these IDs as the `edgeId` argument. If your table is missing
an ID column, you can easily create one with `addId()`.

The result starts with the `start`, `pathId`, `step`, `weight`, and
`total` columns, followed by all original columns. The `start` column
identifies the requested starting node. Steps start at one and follow
the search direction. The `weight` column is the connection cost, and
`total` is the sum of those costs up to and including the current step.
Without the `weight` option, each connection costs one.

If an input column is already named `start`, `pathId`, `step`, `weight`,
or `total` (regardless of capitalization), the method throws an error.
Rename it with `renameColumns()` first.

Each row is one connection, including the final connection back to the
start. Weights must be non-null, finite, and non-negative.

If a cycle can start at several requested nodes, each starting node
produces a separate result. The `pathId` starts at zero for each starting
node; `start` and `pathId` together identify a cycle. Passing an empty
array or duplicate IDs in `startNodes` throws an error. Unknown IDs or
starts with no cycles produce no rows.

With `direction: "both"`, a cycle and its reverse are returned once per
starting node, choosing the smaller sequence of connection IDs. Within
each start, cycles are numbered by connection-ID sequence. Rows are
sorted by `start`, then `pathId`, then `step`.

Use the `startTimeColumn` or `endTimeColumn` options to follow connections
in chronological order. The `minGapMs` option sets the minimum gap between
consecutive connections, in milliseconds. With both time columns, gaps are
measured from one connection's end to the next connection's start; with one
column, between their timestamps. The `strictOrdering` option defaults to
`true`, rejecting zero-duration gaps. These options only work with
`direction: "outgoing"` or `direction: "incoming"`.

Time rules are checked from each requested starting node. A cycle may
therefore work from one starting node but not another. No gap is checked
from the final connection back to the first. Incoming searches follow
connections backward in chronological order.

A self-connection forms a one-step cycle. With `direction: "both"`, two
separate connections between the same nodes can form a two-step cycle. A
single connection cannot be followed out and back to create a cycle.
Cycles using different connections remain separate, even if they visit
the same nodes. If there are no cycles, the result has no rows.

There is no limit on cycle length or the number of cycles returned.
Finding all cycles can take a long time and use substantial memory.

The next four examples each start with these connections:

| edgeId | source | target |
| --- | --- | --- |
| E1 | A | B |
| E2 | B | C |
| E3 | C | A |

By default, connections are followed from source to target:

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

### startNodes

`string` \| `number` \| `bigint` \| (`string` \| `number` \| `bigint`)[]

One starting node ID or an array of IDs. Finds cycles that start and end at each requested node.

### options?

An optional object with direction, time, cost, and result configuration.

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
await triangle
  .findCycles("source", "target", "edgeId", "A")
  .log();
```

| start | pathId | step | weight | total | edgeId | source | target |
| --- | ---: | ---: | ---: | ---: | --- | --- | --- |
| A | 0 | 1 | 1 | 1 | E1 | A | B |
| A | 0 | 2 | 1 | 2 | E2 | B | C |
| A | 0 | 3 | 1 | 3 | E3 | C | A |

Requesting both A and B returns the cycle separately for each start:

```ts
await triangle
  .findCycles("source", "target", "edgeId", ["A", "B"])
  .log();
```

| start | pathId | step | weight | total | edgeId | source | target |
| --- | ---: | ---: | ---: | ---: | --- | --- | --- |
| A | 0 | 1 | 1 | 1 | E1 | A | B |
| A | 0 | 2 | 1 | 2 | E2 | B | C |
| A | 0 | 3 | 1 | 3 | E3 | C | A |
| B | 0 | 1 | 1 | 1 | E2 | B | C |
| B | 0 | 2 | 1 | 2 | E3 | C | A |
| B | 0 | 3 | 1 | 3 | E1 | A | B |

With `direction: "incoming"`, connections are followed from target to
source:

```ts
await triangle
  .findCycles("source", "target", "edgeId", "A", { direction: "incoming" })
  .log();
```

| start | pathId | step | weight | total | edgeId | source | target |
| --- | ---: | ---: | ---: | ---: | --- | --- | --- |
| A | 0 | 1 | 1 | 1 | E3 | C | A |
| A | 0 | 2 | 1 | 2 | E2 | B | C |
| A | 0 | 3 | 1 | 3 | E1 | A | B |

With `direction: "both"`, either direction is allowed. This cycle appears
once, in the direction that starts with E1:

```ts
await triangle
  .findCycles("source", "target", "edgeId", "A", { direction: "both" })
  .log();
```

| start | pathId | step | weight | total | edgeId | source | target |
| --- | ---: | ---: | ---: | ---: | --- | --- | --- |
| A | 0 | 1 | 1 | 1 | E1 | A | B |
| A | 0 | 2 | 1 | 2 | E2 | B | C |
| A | 0 | 3 | 1 | 3 | E3 | C | A |

Two separate connections between A and B form a cycle with `direction:
"both"`. The self-connection at C forms another cycle. For this input:

| edgeId | source | target | cost |
| --- | --- | --- | ---: |
| P1 | A | B | 1 |
| P2 | A | B | 2 |
| L1 | C | C | 4 |

```ts
await parallelAndLoop
  .findCycles("source", "target", "edgeId", ["A", "C"], {
    direction: "both",
    weight: "cost",
  })
  .log();
```

| start | pathId | step | weight | total | edgeId | source | target | cost |
| --- | ---: | ---: | ---: | ---: | --- | --- | --- | ---: |
| A | 0 | 1 | 1 | 1 | P1 | A | B | 1 |
| A | 0 | 2 | 2 | 3 | P2 | A | B | 2 |
| C | 0 | 1 | 4 | 4 | L1 | C | C | 4 |

With the `weight` option, total is a running total of the selected
values. For these flights:

| flightId | origin | destination | minutes |
| --- | --- | --- | ---: |
| F1 | A | B | 1 |
| F2 | B | C | 2 |
| F3 | C | A | 3 |

```ts
await flights
  .findCycles("origin", "destination", "flightId", "A", {
    weight: "minutes",
  })
  .log();
```

| start | pathId | step | weight | total | flightId | origin | destination | minutes |
| --- | ---: | ---: | ---: | ---: | --- | --- | --- | ---: |
| A | 0 | 1 | 1 | 1 | F1 | A | B | 1 |
| A | 0 | 2 | 2 | 3 | F2 | B | C | 2 |
| A | 0 | 3 | 3 | 6 | F3 | C | A | 3 |

For an input without connection IDs, use `addId()` first:

| source | target |
| --- | --- |
| A | B |
| B | C |
| C | A |

```ts
await unnumberedConnections
  .addId("edgeId", { prefix: "edge-" })
  .findCycles("source", "target", "edgeId", "A")
  .log();
```

| start | pathId | step | weight | total | source | target | edgeId |
| --- | ---: | ---: | ---: | ---: | --- | --- | --- |
| A | 0 | 1 | 1 | 1 | A | B | edge-0 |
| A | 0 | 2 | 1 | 2 | B | C | edge-1 |
| A | 0 | 3 | 1 | 3 | C | A | edge-2 |

For these instantaneous events, requesting A and B as starting nodes
returns only the cycle B → C → A → B. Starting at A would break
chronological order:

| flightId | origin | destination | departureTime |
| --- | --- | --- | --- |
| F1 | B | C | 2025-01-01 09:00 |
| F2 | C | A | 2025-01-01 10:00 |
| F3 | A | B | 2025-01-01 11:00 |

```ts
await timedFlights
  .findCycles("origin", "destination", "flightId", ["A", "B"], {
    startTimeColumn: "departureTime",
  })
  .log();
```

| start | pathId | step | weight | total | flightId | origin | destination | departureTime |
| --- | ---: | ---: | ---: | ---: | --- | --- | --- | --- |
| B | 0 | 1 | 1 | 1 | F1 | B | C | 2025-01-01 09:00:00 |
| B | 0 | 2 | 1 | 2 | F2 | C | A | 2025-01-01 10:00:00 |
| B | 0 | 3 | 1 | 3 | F3 | A | B | 2025-01-01 11:00:00 |

Searching the same events from B in the incoming direction follows
connections backward, from the latest to the earliest:

```ts
await timedFlights
  .findCycles("origin", "destination", "flightId", "B", {
    direction: "incoming",
    startTimeColumn: "departureTime",
  })
  .log();
```

| start | pathId | step | weight | total | flightId | origin | destination | departureTime |
| --- | ---: | ---: | ---: | ---: | --- | --- | --- | --- |
| B | 0 | 1 | 1 | 1 | F3 | A | B | 2025-01-01 11:00:00 |
| B | 0 | 2 | 1 | 2 | F2 | C | A | 2025-01-01 10:00:00 |
| B | 0 | 3 | 1 | 3 | F1 | B | C | 2025-01-01 09:00:00 |

For the next two examples, `flights` contains these rows, with departure
and arrival stored as timestamps on the same day:

| flightId | origin | destination | departure | arrival | price |
| --- | --- | --- | --- | --- | ---: |
| F1 | A | B | 2025-01-01 09:00 | 2025-01-01 10:00 | 40 |
| F2 | B | A | 2025-01-01 12:00 | 2025-01-01 13:00 | 60 |

Report elapsed time for every cycle, including layovers:

```ts
await flights
  .findCycles("origin", "destination", "flightId", "A", {
    startTimeColumn: "departure",
    endTimeColumn: "arrival",
    minGapMs: 60 * 60 * 1000,
    elapsedTime: true,
  })
  .log();
```

| start | pathId | step | weight | total | elapsedTimeMs | flightId | origin | destination | departure | arrival | price |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- | ---: |
| A | 0 | 1 | 1 | 1 | 3600000 | F1 | A | B | 2025-01-01 09:00:00 | 2025-01-01 10:00:00 | 40 |
| A | 0 | 2 | 1 | 2 | 14400000 | F2 | B | A | 2025-01-01 12:00:00 | 2025-01-01 13:00:00 | 60 |

The return journey takes four hours (14,400,000 milliseconds),
including the two-hour layover at B.

Add up prices while continuing to report elapsed time for every cycle:

```ts
await flights
  .findCycles("origin", "destination", "flightId", "A", {
    startTimeColumn: "departure",
    endTimeColumn: "arrival",
    minGapMs: 60 * 60 * 1000,
    elapsedTime: true,
    weight: "price",
  })
  .log();
```

| start | pathId | step | weight | total | elapsedTimeMs | flightId | origin | destination | departure | arrival | price |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- | ---: |
| A | 0 | 1 | 40 | 40 | 3600000 | F1 | A | B | 2025-01-01 09:00:00 | 2025-01-01 10:00:00 | 40 |
| A | 0 | 2 | 60 | 100 | 14400000 | F2 | B | A | 2025-01-01 12:00:00 | 2025-01-01 13:00:00 | 60 |

## Inherited from

`SimpleTableCore.findCycles`
