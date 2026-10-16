[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / distances

# Method: distances()

> **distances**(`sourceColumn`, `targetColumn`, `startNodes`, `options?`): `SimpleTable`

Finds the shortest routes from each starting node to every reachable
node. Without options, shortest means the fewest connections. Use `weight`
to report total cost and `elapsedTime` to report duration including waiting
between connections. Use `minimize` to choose which metric defines shortest.

Each row contains `start`, `node`, and `steps`, plus `total` when `weight`
is supplied and `elapsedTimeMs` when enabled. Routes tied on the chosen
metric produce separate rows only when their reported summaries differ;
identical summaries appear once.

Routes cannot repeat nodes except for a final return to the start. A start
appears in its own results only through an actual return or self-connection,
never with zero steps. With `direction: "both"`, a return can follow the
same connection out and back. Use `shortestPath()` to inspect individual
connections between two different nodes.

Reporting weight or elapsed time can require substantial time and memory
on dense networks because many routes may need to be explored.

The next five examples each start with this data:

| origin | destination | minutes |
| --- | --- | ---: |
| A | B | 4 |
| B | C | 1 |
| D | B | 2 |

By default, the method follows connections from source to target and
counts how many connections are needed:

## Parameters

### sourceColumn

`string`

The name of the column containing each connection's source node ID.

### targetColumn

`string`

The name of the column containing each connection's target node ID.

### startNodes

`string` \| `number` \| `bigint` \| (`string` \| `number` \| `bigint`)[]

One starting node ID or a non-empty array of distinct IDs. Unknown IDs and starts with no connections to follow produce no rows. Empty arrays and duplicate IDs throw an error.

### options?

An optional object with direction, time, and result configuration.

#### direction?

`"both"` \| `"outgoing"` \| `"incoming"`

The direction in which to follow connections. Defaults to `"outgoing"`. Chronological traversal supports only `"outgoing"` and `"incoming"`.

#### elapsedTime?

`boolean`

Whether to add cumulative `elapsedTimeMs` in milliseconds, including connection gaps. Defaults to `false`. Requires both time columns. Optimization compares native timestamp precision before conversion to milliseconds.

#### endTimeColumn?

`string`

The name of the column containing each connection's end time. Use this or `startTimeColumn` to follow connections in chronological order.

#### minGapMs?

`number`

The minimum gap between consecutive connections, in milliseconds; does not apply before the first connection. With both time columns, measured from one connection's end to the next's start; with one column, between timestamps. Must be a non-negative integer. Defaults to `0`. Requires a time column.

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

The name of the numeric column used as the cost of each connection. Values must be non-null, finite, and non-negative. Adds `total`, the cumulative sum of those costs. If omitted, no `total` column is generated.

## Returns

`SimpleTable`

The table of distinct optimal summaries with `start`, `node`, and `steps`, plus `total` when `weight` is supplied and `elapsedTimeMs` when enabled, so methods can be chained. Sorted by start, the chosen metric, node, then remaining metrics in the order steps, total, elapsed time.

## Examples

```ts
await connections
  .distances("origin", "destination", "A")
  .log();
```

| start | node | steps |
| --- | --- | ---: |
| A | B | 1 |
| A | C | 2 |

With `weight: "minutes"`, `total` is the sum of travel times:

```ts
await connections
  .distances("origin", "destination", "A", { weight: "minutes" })
  .log();
```

| start | node | steps | total |
| --- | --- | ---: | ---: |
| A | B | 1 | 4 |
| A | C | 2 | 5 |

With `direction: "incoming"`, connections are followed from target to
source. Starting at C:

```ts
await connections
  .distances("origin", "destination", "C", { direction: "incoming" })
  .log();
```

| start | node | steps |
| --- | --- | ---: |
| C | B | 1 |
| C | A | 2 |
| C | D | 2 |

With `direction: "both"`, connections can be followed in either
direction:

```ts
await connections
  .distances("origin", "destination", "A", { direction: "both" })
  .log();
```

| start | node | steps |
| --- | --- | ---: |
| A | B | 1 |
| A | A | 2 |
| A | C | 2 |
| A | D | 2 |

A appears with 2 steps because A → B → A follows a connection out
and back.

An array of starting nodes gives separate distances for each start:

```ts
await connections
  .distances("origin", "destination", ["D", "A"], {
    weight: "minutes",
  })
  .log();
```

| start | node | steps | total |
| --- | --- | ---: | ---: |
| A | B | 1 | 4 |
| A | C | 2 | 5 |
| D | B | 1 | 2 |
| D | C | 2 | 3 |

A direct self-connection and a longer return route can both lead back
to the start. This example uses different data:

| origin | destination | minutes |
| --- | --- | ---: |
| A | A | 10 |
| A | B | 2 |
| B | A | 3 |

The shortest return to A takes 5 minutes through B, compared with
10 minutes for the direct self-connection:

```ts
await connections
  .distances("origin", "destination", "A", { weight: "minutes" })
  .log();
```

| start | node | steps | total |
| --- | --- | ---: | ---: |
| A | B | 1 | 2 |
| A | A | 2 | 5 |

Chronological options can rule out a cheaper sequence that departs too
early. Here, B → C leaves before A → B arrives, while B → D meets the
one-hour minimum exactly:

| origin | destination | departureTime | arrivalTime | minutes |
| --- | --- | --- | --- | ---: |
| A | B | 2025-01-01 08:00 | 2025-01-01 10:00 | 2 |
| B | C | 2025-01-01 09:00 | 2025-01-01 10:00 | 1 |
| B | D | 2025-01-01 11:00 | 2025-01-01 12:00 | 3 |

```ts
await scheduledFlights
  .distances("origin", "destination", "A", {
    startTimeColumn: "departureTime",
    endTimeColumn: "arrivalTime",
    minGapMs: 60 * 60 * 1000,
    weight: "minutes",
  })
  .log();
```

| start | node | steps | total |
| --- | --- | ---: | ---: |
| A | B | 1 | 2 |
| A | D | 2 | 5 |

For the next four examples, `flights` contains these rows, with departure
and arrival stored as timestamps on the same day:

| flightId | origin | destination | departure | arrival | price |
| --- | --- | --- | --- | --- | ---: |
| F1 | A | B | 2025-01-01 09:00 | 2025-01-01 10:00 | 40 |
| F2 | B | C | 2025-01-01 12:00 | 2025-01-01 13:00 | 40 |
| F3 | A | C | 2025-01-01 09:00 | 2025-01-01 12:00 | 120 |

Find the fastest journey from A to each reachable destination, including
layovers:

```ts
await flights
  .distances("origin", "destination", "A", {
    startTimeColumn: "departure",
    endTimeColumn: "arrival",
    minGapMs: 60 * 60 * 1000,
    elapsedTime: true,
  })
  .log();
```

| start | node | steps | elapsedTimeMs |
| --- | --- | ---: | ---: |
| A | B | 1 | 3600000 |
| A | C | 1 | 10800000 |

The direct flight to C takes three hours (10,800,000 milliseconds).
The route through B takes four hours including its layover.

Find the fastest journeys from A while also adding up their prices:

```ts
await flights
  .distances("origin", "destination", "A", {
    startTimeColumn: "departure",
    endTimeColumn: "arrival",
    minGapMs: 60 * 60 * 1000,
    elapsedTime: true,
    weight: "price",
    minimize: "elapsedTime",
  })
  .log();
```

| start | node | steps | total | elapsedTimeMs |
| --- | --- | ---: | ---: | ---: |
| A | B | 1 | 40 | 3600000 |
| A | C | 1 | 120 | 10800000 |

Use `minimize: "weight"` to find the cheapest journeys instead. The
selected route to C now takes two steps through B and costs 80:

```ts
await flights
  .distances("origin", "destination", "A", {
    startTimeColumn: "departure",
    endTimeColumn: "arrival",
    minGapMs: 60 * 60 * 1000,
    elapsedTime: true,
    weight: "price",
    minimize: "weight",
  })
  .log();
```

| start | node | steps | total | elapsedTimeMs |
| --- | --- | ---: | ---: | ---: |
| A | B | 1 | 40 | 3600000 |
| A | C | 2 | 80 | 14400000 |

Choose the fewest connections while still reporting price and elapsed
time. The direct flight to C has one step, even though it costs more:

```ts
await flights
  .distances("origin", "destination", "A", {
    startTimeColumn: "departure",
    endTimeColumn: "arrival",
    minGapMs: 60 * 60 * 1000,
    elapsedTime: true,
    weight: "price",
    minimize: "steps",
  })
  .log();
```

| start | node | steps | total | elapsedTimeMs |
| --- | --- | ---: | ---: | ---: |
| A | B | 1 | 40 | 3600000 |
| A | C | 1 | 120 | 10800000 |

When two routes to C both take two steps but have different prices,
minimizing steps while reporting price returns both summaries:

```ts
await connections
  .loadArray([
    { origin: "A", destination: "B", price: 20 },
    { origin: "B", destination: "C", price: 30 },
    { origin: "A", destination: "D", price: 40 },
    { origin: "D", destination: "C", price: 40 },
  ])
  .distances("origin", "destination", "A", {
    weight: "price",
    minimize: "steps",
  })
  .filter("node = 'C'")
  .log();
```

| start | node | steps | total |
| --- | --- | ---: | ---: |
| A | C | 2 | 50 |
| A | C | 2 | 80 |

## Inherited from

`SimpleTableCore.distances`
