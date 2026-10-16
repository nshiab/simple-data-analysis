[**Simple Data Analysis v6.0.10**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getHash

# Method: getHash()

> **getHash**(): `Promise`\<`string`\>

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
