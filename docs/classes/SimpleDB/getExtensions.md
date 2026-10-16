[**Simple Data Analysis v6.0.10**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleDB](../SimpleDB.md) / getExtensions

# Method: getExtensions()

> **getExtensions**(): `Promise`\<`object`[]\>

Returns a list of installed DuckDB extensions.

## Returns

`Promise`\<`object`[]\>

A promise that resolves to an array of objects, each representing an installed extension.

## Example

```ts
// Get a list of all installed extensions
const extensions = await sdb.getExtensions();
console.log(extensions); // Output: [{ extension_name: "spatial", loaded: true, ... }]
```

## Inherited from

`SimpleDBCore.getExtensions`
