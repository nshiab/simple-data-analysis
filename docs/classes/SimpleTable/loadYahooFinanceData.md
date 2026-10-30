[**Simple Data Analysis v6.0.14**](../../index.md)

***

[Simple Data Analysis](../../globals.md) / [SimpleTable](../SimpleTable.md) / loadYahooFinanceData

# Method: loadYahooFinanceData()

> **loadYahooFinanceData**(`symbol`, `startDate`, `endDate`, `interval`): `this`

Defined in: [simple-data-analysis-core/src/class/SimpleTable.ts:749](https://github.com/nshiab/simple-data-analysis-core/blob/v2.1.18/src/class/SimpleTable.ts#L749)

Downloads historical market data from Yahoo Finance and loads it into this
table as `datetime`, `open`, `high`, `low`, `close`, `adjustedClose`, and
`volume` columns. `datetime` contains Yahoo's timestamps as JavaScript
`Date` values. Unavailable values are preserved as `null`.

All range boundaries are evaluated in UTC. Use ISO date-time strings ending
in `Z`. Yahoo trading sessions may occur on a different UTC date from their
exchange-local date, so choose the range appropriate for the market and
interval. Avoid numeric constructors such as `new Date(2025, 2, 15)`, which
use the runtime's local timezone.

This method uses an undocumented Yahoo Finance endpoint and is not
affiliated with or endorsed by Yahoo. It is provided for educational,
research, and journalistic purposes. Before using it, review Yahoo's terms
and any applicable data-provider restrictions.

## Parameters

### symbol

`string`

The stock or index symbol, such as `"AAPL"` or `"^GSPTSE"`.

### startDate

`Date`

The inclusive UTC start of the requested range.

### endDate

`Date`

The inclusive UTC end of the requested range. The UTC day,
hour, or minute containing this instant is included, according to
`interval`.

### interval

`"1d"` \| `"1h"` \| `"1m"`

The interval between observations: daily, hourly, or every
minute.

## Returns

`this`

The table, so methods can be chained.

## Examples

```ts
// Request daily observations using explicit UTC boundaries.
await table
  .loadYahooFinanceData(
    "^GSPTSE",
    new Date("2025-03-01T00:00:00Z"),
    new Date("2025-03-15T00:00:00Z"),
    "1d",
  )
  .log();
```

```ts
// Include the UTC hours from 13:00 through 16:00.
await table
  .loadYahooFinanceData(
    "AAPL",
    new Date("2025-03-14T13:00:00Z"),
    new Date("2025-03-14T16:00:00Z"),
    "1h",
  )
  .log();
```

## Throws

If either date is invalid or `endDate` is before `startDate`.

## Throws

If Yahoo rejects the request or returns no data.

## See

 - https://legal.yahoo.com/us/en/yahoo/terms/otos/index.html
 - https://help.yahoo.com/kb/finance/SLN2310.html

## Inherited from

`SimpleTableCore.loadYahooFinanceData`
