[**Simple Data Analysis v6.0.10**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / commonNeighbors

# Method: commonNeighbors()

> **commonNeighbors**(`sourceColumn`, `targetColumn`, `nodeA`, `nodeB`, `options?`): `SimpleTable`

Finds the neighbors shared by two different nodes. The `direction` option
lets you find neighbors from source to target, from target to source, or
in either direction. The result has one `node` column, sorted in
ascending order.

If either node ID is unknown, or the nodes have no shared neighbors, the
result has no rows. Each shared neighbor appears once, even if
connections are repeated. A self-connection can make one of the requested
nodes a shared neighbor. Using the same ID for both requested nodes
throws an error.

The next three examples each start with this data:

| origin | destination |
| --- | --- |
| A | C |
| A | C |
| B | C |
| B | C |
| D | A |
| D | B |

By default, the method finds shared neighbors from source to target. Both
A and B connect to C:

## Parameters

### sourceColumn

`string`

The name of the column containing each connection's source node ID.

### targetColumn

`string`

The name of the column containing each connection's target node ID.

### nodeA

`string` \| `number` \| `bigint`

The first node ID.

### nodeB

`string` \| `number` \| `bigint`

The second node ID, which must differ from `nodeA`.

### options?

An optional object with direction and result configuration.

#### direction?

`"both"` \| `"outgoing"` \| `"incoming"`

The direction in which to follow connections. Defaults to `"outgoing"`.

#### outputTable?

`string` \| `boolean`

If `true`, stores the result in a new table with a generated name. If a string, uses it as the new table's name. If `false` or omitted, overwrites the current table. Defaults to `false`.

## Returns

`SimpleTable`

The result table, so methods can be chained.

## Examples

```ts
await connections
  .commonNeighbors("origin", "destination", "A", "B")
  .log();
```

| node |
| --- |
| C |

C appears only once, even though the input repeats the connections.

With `direction: "incoming"`, the method follows connections from target
to source. D connects to both A and B:

```ts
await connections
  .commonNeighbors("origin", "destination", "A", "B", { direction: "incoming" })
  .log();
```

| node |
| --- |
| D |

With `direction: "both"`, the method finds shared neighbors in either
direction:

```ts
await connections
  .commonNeighbors("origin", "destination", "A", "B", { direction: "both" })
  .log();
```

| node |
| --- |
| C |
| D |

A self-connection can make a requested node a shared neighbor. For this
input, A is a neighbor of both itself and B:

| source | target |
| --- | --- |
| A | A |
| B | A |

```ts
await connections
  .commonNeighbors("source", "target", "A", "B")
  .log();
```

| node |
| --- |
| A |

## Inherited from

`SimpleTableCore.commonNeighbors`
