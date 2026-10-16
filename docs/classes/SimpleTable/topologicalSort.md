[**Simple Data Analysis v6.0.11**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / topologicalSort

# Method: topologicalSort()

> **topologicalSort**(`sourceColumn`, `targetColumn`, `options?`): `SimpleTable`

Orders nodes so each prerequisite comes before the nodes that depend on
it. Each input row means the source node must come before the target
node. For example, A → B means A must come before B.

The result has `node`, `componentId`, and `order` columns, sorted by
`componentId`, then `order`. Nodes connected directly or through other
nodes belong to the same group, ignoring connection direction.
Groups are numbered from zero, with the group containing the smallest
node ID first.

Within each group, `order` starts at one. When several nodes are ready,
the method chooses the smallest node ID first: numeric order for numbers
and character order for strings. All nodes in the source and target
columns are included.

If dependencies form a loop, there is no valid order and the method
throws an error. A node depending on itself also causes an error. An
empty input produces no rows.

For this example, we start with these connections:

| source | target |
| --- | --- |
| A | B |
| B | C |
| D | C |

A must come before B, and both B and D must come before C:

## Parameters

### sourceColumn

`string`

The name of the column containing each prerequisite node ID.

### targetColumn

`string`

The name of the column containing each dependent node ID.

### options?

An optional object with result configuration.

#### outputTable?

`string` \| `boolean`

If `true`, stores the result in a new table with a generated name. If a string, uses it as the new table's name. If `false` or omitted, overwrites the current table. Defaults to `false`.

## Returns

`SimpleTable`

The result table, so methods can be chained.

## Examples

```ts
await table
  .topologicalSort("source", "target")
  .log();
```

| node | componentId | order |
| --- | ---: | ---: |
| A | 0 | 1 |
| B | 0 | 2 |
| D | 0 | 3 |
| C | 0 | 4 |

C comes last because it depends on both B and D. A comes before D
because both are initially ready and A has the smaller ID. After A,
B is ready and comes before D for the same reason.

With two independent groups, each has its own order starting at one.
This example starts with different data:

| source | target |
| --- | --- |
| A | D |
| B | C |

```ts
await table
  .topologicalSort("source", "target")
  .log();
```

| node | componentId | order |
| --- | ---: | ---: |
| A | 0 | 1 |
| D | 0 | 2 |
| B | 1 | 1 |
| C | 1 | 2 |

## Inherited from

`SimpleTableCore.topologicalSort`
