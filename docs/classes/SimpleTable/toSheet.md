[**Simple Data Analysis v6.0.13**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / toSheet

# Method: toSheet()

> **toSheet**(`sheetUrl`, `options?`): `Promise`\<[`SimpleTable`](../SimpleTable.md)\>

Defined in: [src/class/SimpleTable.ts:1519](https://github.com/nshiab/simple-data-analysis/blob/v6.0.13/src/class/SimpleTable.ts#L1519)

Writes the table data to a Google Sheet.
This method uses the `pushToSheet` function from the [journalism-google library](https://github.com/nshiab/journalism-google/tree/v2.0.0/docs). Refer to its documentation for more details.

By default, the selected tab is overwritten and values are written without Google Sheets interpretation.

Environment variables are named configuration values supplied to the running process. For authentication, this method reads `GOOGLE_SERVICE_ACCOUNT_EMAIL` (for example, `"service-account@example.iam.gserviceaccount.com"`) with `GOOGLE_PRIVATE_KEY` (for example, `"-----BEGIN PRIVATE KEY-----\n..."`). Alternatively, set `GOOGLE_APPLICATION_CREDENTIALS` to a service-account JSON path (for example, `"./service-account.json"`). Values passed through `options.credentials` override these environment values. For detailed setup instructions, refer to the node-google-spreadsheet authentication guide: https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication.

## Parameters

### sheetUrl

`string`

A Google Sheets URL. It can point to a spreadsheet or a specific tab.

### options?

An optional object with configuration options:

#### create?

`boolean`

If `true`, creates a missing tab selected by `tabTitle`. Defaults to `false`.

#### credentials?

\{ `email`: `string`; `privateKey`: `string`; \}

Optional Google service-account credentials.

#### credentials.email

`string`

The Google service-account email.

#### credentials.privateKey

`string`

The Google service-account private key.

#### lastUpdate?

`boolean` \| `"Canada/Atlantic"` \| `"Canada/Central"` \| `"Canada/Eastern"` \| `"Canada/Mountain"` \| `"Canada/Newfoundland"` \| `"Canada/Pacific"` \| `"Canada/Saskatchewan"` \| `"Canada/Yukon"`

If `true`, adds a UTC timestamp. Pass a Canadian time zone to use it for the timestamp. Available only in overwrite mode.

#### mode?

`"overwrite"` \| `"append"`

Whether to overwrite the tab or append rows. Defaults to `"overwrite"`.

#### prepend?

`string`

Text to add above the header row in overwrite mode.

#### raw?

`boolean`

If `true`, writes values without Google Sheets interpretation. Defaults to `true`.

#### tabTitle?

`string`

Selects a tab by title instead of using the URL's `gid`.

## Returns

`Promise`\<[`SimpleTable`](../SimpleTable.md)\>

A promise that resolves to this table after the data has been written to the sheet.

## Examples

```ts
// Set these environment variables before running:
// GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@example.iam.gserviceaccount.com
// GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...
// Load, transform, and write data to a Google Sheet
const table = await sdb
  .newTable()
  .loadData("sales.csv")
  .selectColumns(["date", "revenue"])
  .toSheet("https://docs.google.com/spreadsheets/d/.../edit#gid=0");

await table.log();
```

```ts
// Append rows to a tab selected by title
await table.toSheet("https://docs.google.com/spreadsheets/d/.../edit", {
  mode: "append",
  tabTitle: "Election results",
});

await table.log();
```

```ts
// Create a missing tab and add context above the data
await table.toSheet("https://docs.google.com/spreadsheets/d/.../edit", {
  tabTitle: "Election results",
  create: true,
  prepend: "Preliminary results",
  lastUpdate: "Canada/Eastern",
});

await table.log();
```

```ts
// Let Google Sheets interpret values, such as formulas and dates
await table.toSheet(
  "https://docs.google.com/spreadsheets/d/.../edit#gid=0",
  { raw: false },
);

await table.log();
```

```ts
// Pass service-account credentials explicitly
await table.toSheet(
  "https://docs.google.com/spreadsheets/d/.../edit#gid=0",
  {
    credentials: {
      email: "service-account@example.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\\n...",
    },
  },
);

await table.log();
```
