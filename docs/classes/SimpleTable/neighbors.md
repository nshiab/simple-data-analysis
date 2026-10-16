[**Simple Data Analysis v6.0.10**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / neighbors

# Method: neighbors()

> **neighbors**(`sourceColumn`, `targetColumn`, `startNodes`, `options?`): `SimpleTable`

Finds the distinct nodes directly connected to one or more starting nodes.
The `direction` option lets you find neighbors from source to target,
from target to source, or in either direction. The result has `start` and
`node` columns, sorted in ascending order by `start`, then `node`.

Unknown starting IDs and starts with no neighbors in the selected
direction produce no rows.
A self-connection includes the starting node once. Empty start arrays and
duplicate starting IDs throw an error.

The next three examples each start with this data:

| origin | destination |
| --- | --- |
| A | B |
| A | B |
| C | A |

By default, the method finds neighbors from source to target:

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
await table
  .neighbors("origin", "destination", "A")
  .log();
```

| start | node |
| --- | --- |
| A | B |

B appears only once, even though the input has two connections from A to B.

With `direction: "incoming"`, the method finds neighbors from target to
source. Here, C connects to A:

```ts
await table
  .neighbors("origin", "destination", "A", { direction: "incoming" })
  .log();
```

| start | node |
| --- | --- |
| A | C |

With `direction: "both"`, the method finds neighbors in either direction:

```ts
await table
  .neighbors("origin", "destination", "A", { direction: "both" })
  .log();
```

| start | node |
| --- | --- |
| A | B |
| A | C |

Multiple starts are evaluated independently. For this input:

| source | target | cost |
| --- | --- | ---: |
| Montreal | Ottawa | 2 |
| Ottawa | Toronto | 3 |

```ts
await table
  .neighbors("source", "target", ["Montreal", "Ottawa"])
  .log();
```

| start | node |
| --- | --- |
| Montreal | Ottawa |
| Ottawa | Toronto |

## Inherited from

`SimpleTableCore.neighbors`
