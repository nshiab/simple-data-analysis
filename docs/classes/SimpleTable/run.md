[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / run

# Method: run()

> **run**(): `Promise`\<[`SimpleTable`](../SimpleTable.md)\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:335](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L335)

Executes all queued methods across every table in the database, not just
this table. Sync builder methods (like `filter()` or `convert()`) only
queue their operation; execution happens when an async observer method
(like `getData()`, `log()`, or `writeData()`) is awaited. Use `run()`
when a chain ends in pure mutations with nothing to observe and you want
the work done now.

Because the whole database is flushed in program order, this behaves
identically to `SimpleDB.run()`; call `sdb.run()` when your intent is to
flush the database rather than this specific table.

## Returns

`Promise`\<[`SimpleTable`](../SimpleTable.md)\>

A promise that resolves to the table once the queued methods have been executed.

## Example

```ts
// Nothing is observed after convert(), so run() executes the chain.
await table
  .loadData("data.csv")
  .convert({ price: "number" })
  .run();
await table.log();
```

## Inherited from

`SimpleTableCore.run`
