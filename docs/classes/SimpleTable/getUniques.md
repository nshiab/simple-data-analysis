[**Simple Data Analysis v6.0.20**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / getUniques

# Method: getUniques()

## Call Signature

> **getUniques**(`column`): `Promise`\<`unknown`[]\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:7640](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.23/src/class/SimpleTable.ts#L7640)

Returns unique values from a column, or unique combinations from an array of columns,
without modifying the table. Results are sorted in ascending order by the supplied
columns, in the order provided.
A column name returns an array of values. An array of column names returns an array
of row objects, even when the array contains only one column.
Temporal values use the same JavaScript representations as `getData()`.

### Parameters

#### column

`string`

A column name, or a non-empty array of column names whose unique combinations will be retrieved.

### Returns

`Promise`\<`unknown`[]\>

A promise that resolves to sorted unique values for a column name, or sorted unique row objects for an array of column names.

### Examples

```ts
// Get unique values from the 'category' column
const uniqueCategories = await table.getUniques("category");
console.log(uniqueCategories); // e.g., ["Books", "Clothing", "Electronics"]
```

```ts
// Get unique pairs of start and end years, sorted by start year then end year
const uniqueYears = await table.getUniques(["yearStart", "yearEnd"]);
console.log(uniqueYears); // e.g., [{ yearStart: 2020, yearEnd: 2021 }, { yearStart: 2020, yearEnd: 2022 }]
```

### Inherited from

`SimpleTableCore.getUniques`

## Call Signature

> **getUniques**(`column`): `Promise`\<`object`[]\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:7640](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.23/src/class/SimpleTable.ts#L7640)

Returns unique values from a column, or unique combinations from an array of columns,
without modifying the table. Results are sorted in ascending order by the supplied
columns, in the order provided.
A column name returns an array of values. An array of column names returns an array
of row objects, even when the array contains only one column.
Temporal values use the same JavaScript representations as `getData()`.

### Parameters

#### column

`string`[]

A column name, or a non-empty array of column names whose unique combinations will be retrieved.

### Returns

`Promise`\<`object`[]\>

A promise that resolves to sorted unique values for a column name, or sorted unique row objects for an array of column names.

### Examples

```ts
// Get unique values from the 'category' column
const uniqueCategories = await table.getUniques("category");
console.log(uniqueCategories); // e.g., ["Books", "Clothing", "Electronics"]
```

```ts
// Get unique pairs of start and end years, sorted by start year then end year
const uniqueYears = await table.getUniques(["yearStart", "yearEnd"]);
console.log(uniqueYears); // e.g., [{ yearStart: 2020, yearEnd: 2021 }, { yearStart: 2020, yearEnd: 2022 }]
```

### Inherited from

`SimpleTableCore.getUniques`

## Call Signature

> **getUniques**(`column`): `Promise`\<`unknown`[]\>

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:7640](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.23/src/class/SimpleTable.ts#L7640)

Returns unique values from a column, or unique combinations from an array of columns,
without modifying the table. Results are sorted in ascending order by the supplied
columns, in the order provided.
A column name returns an array of values. An array of column names returns an array
of row objects, even when the array contains only one column.
Temporal values use the same JavaScript representations as `getData()`.

### Parameters

#### column

`string` \| `string`[]

A column name, or a non-empty array of column names whose unique combinations will be retrieved.

### Returns

`Promise`\<`unknown`[]\>

A promise that resolves to sorted unique values for a column name, or sorted unique row objects for an array of column names.

### Examples

```ts
// Get unique values from the 'category' column
const uniqueCategories = await table.getUniques("category");
console.log(uniqueCategories); // e.g., ["Books", "Clothing", "Electronics"]
```

```ts
// Get unique pairs of start and end years, sorted by start year then end year
const uniqueYears = await table.getUniques(["yearStart", "yearEnd"]);
console.log(uniqueYears); // e.g., [{ yearStart: 2020, yearEnd: 2021 }, { yearStart: 2020, yearEnd: 2022 }]
```

### Inherited from

`SimpleTableCore.getUniques`
