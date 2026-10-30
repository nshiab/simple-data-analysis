[**Simple Data Analysis v6.0.14**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleDB](../SimpleDB.md) / run

# Method: run()

> **run**(): `Promise`\<`SimpleDB`\<`SimpleTable`\>\>

Defined in: [simple-data-analysis-core/src/class/SimpleDB.ts:1001](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleDB.ts#L1001)

Executes all queued methods across every table in the database. Sync
builder methods (like `filter()` or `convert()`) only queue their
operation; execution happens when an async observer method (like
`getData()`, `log()`, or `writeData()`) is awaited. Use `run()` when
your script ends in pure mutations with nothing to observe and you want
the work done now.

The whole database is flushed in program order, so operations on
different tables execute exactly in the order they were queued. This is
the database-level counterpart to `SimpleTable.run()`.

## Returns

`Promise`\<`SimpleDB`\<`SimpleTable`\>\>

A promise that resolves to the SimpleDB instance once the queued methods have been executed.

## Example

```ts
// Nothing is observed after the mutations, so run() executes them.
table1.loadData("data1.csv").convert({ price: "number" });
table2.loadData("data2.csv").filter(`price > 0`);
await sdb.run();
```

## Inherited from

`SimpleDBCore.run`
