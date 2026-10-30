[**Simple Data Analysis v6.0.14**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getHash

# Method: getHash()

> **getHash**(): `Promise`\<`string`\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:7061](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L7061)

Returns a deterministic hash of the table's ordered schema and contents.
Pending operations are executed before the hash is calculated. Computing
the hash scans the complete table inside DuckDB without transferring its
rows to JavaScript.

## Returns

`Promise`\<`string`\>

A promise that resolves to a SHA-256 hash string.

## Example

```ts
const hash = await table.getHash();
console.log(hash); // e.g., "8f14e45fceea..."
```

## Inherited from

`SimpleTableCore.getHash`
