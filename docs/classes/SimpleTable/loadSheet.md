[**Simple Data Analysis v6.0.12**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / loadSheet

# Method: loadSheet()

> **loadSheet**(`sheetUrl`, `options?`): `this`

Defined in: [src/class/SimpleTable.ts:1584](https://github.com/nshiab/simple-data-analysis/blob/v6.0.12/src/class/SimpleTable.ts#L1584)

Loads data from a Google Sheet into the table.
This method uses the `getSheetData` function from the [journalism-google library](https://github.com/nshiab/journalism-google/blob/v2.0.0/docs/functions/getSheetData.md). Refer to its documentation for more details.

Environment variables are named configuration values supplied to the running process. By default, this method reads `GOOGLE_SERVICE_ACCOUNT_EMAIL` (for example, `"service-account@example.iam.gserviceaccount.com"`) with `GOOGLE_PRIVATE_KEY` (for example, `"-----BEGIN PRIVATE KEY-----\n..."`). Alternatively, set `GOOGLE_APPLICATION_CREDENTIALS` to a service-account JSON path (for example, `"./service-account.json"`).
The download is queued and runs in chain order at the next awaited observer or `run()` call.

## Parameters

### sheetUrl

`string`

The URL pointing to a specific Google Sheet (e.g., `"https://docs.google.com/spreadsheets/d/.../edit#gid=0"`).

### options?

An optional object with configuration options:

#### apiEmailEnvVar?

`string`

A custom environment-variable name from which to read the Google service-account email. Defaults to `"GOOGLE_SERVICE_ACCOUNT_EMAIL"`.

#### apiKeyEnvVar?

`string`

A custom environment-variable name from which to read the Google service-account private key. Defaults to `"GOOGLE_PRIVATE_KEY"`.

#### skip?

`number`

The number of rows to skip from the top of the sheet before reading data. Useful when the sheet contains metadata or headers that should not be included in the data.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Set these environment variables before running:
// GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@example.iam.gserviceaccount.com
// GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...
// Load data from a Google Sheet
const sheetData = await sdb
  .newTable("sheetData")
  .loadSheet("https://docs.google.com/spreadsheets/d/.../edit#gid=0")
  .log();
```

```ts
// Load data from a Google Sheet, skipping the first 2 rows (e.g., to skip a prepended message and timestamp)
const sheetData = await table
  .loadSheet("https://docs.google.com/spreadsheets/d/.../edit#gid=0", {
    skip: 2,
  })
  .log();
```
