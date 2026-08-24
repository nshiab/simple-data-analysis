# `saveChart` 1.0.19 migration notes

Scope: the version currently resolved by this repository
(`@nshiab/journalism-dataviz@1.0.19`). This repository had no existing location
for research notes, so this note lives under `docs/research/`.

## API and execution model

- `saveChart` is a named export from the package root, so the existing
  `import { saveChart } from "@nshiab/journalism-dataviz"` form is correct. The
  package also documents ordinary named imports for its public functions.
  [Package entry point](https://jsr.io/@nshiab/journalism-dataviz/1.0.19/src/index.ts#L16-L24),
  [export list](https://jsr.io/@nshiab/journalism-dataviz/1.0.19/src/index.ts#L27-L49)
- Its signature is `saveChart(data, chart, path, options?)`, where `data` is
  iterable or array-like, `chart` receives that same data and synchronously
  returns an `SVGSVGElement` or `HTMLElement`, `path` ends in `.png` or `.svg`,
  and options are `{ style?: string; dark?: boolean }`.
  [JSDoc and signature](https://jsr.io/@nshiab/journalism-dataviz/1.0.19/src/dataviz/saveChart.ts#L8-L54)
- The callback is invoked directly as `chart(data)` in the caller's JavaScript
  context. It is no longer serialized and executed in a browser process.
  Therefore, as an inference from the direct call (and as exercised by the
  upstream tests), callback code can close over ordinary module imports and
  local values. Observable Plot functions should be imported normally at module
  scope, as this repository's tests and README already do.
  [Direct callback invocation](https://jsr.io/@nshiab/journalism-dataviz/1.0.19/src/dataviz/saveChart.ts#L90-L133),
  [upstream tests](https://github.com/nshiab/journalism-dataviz/blob/v1.0.19/test/dataviz/saveChart.test.ts)
- Rendering is still server-side and temporarily needs DOM-like globals.
  `saveChart` creates a LinkeDOM document, installs `document`, `window`, DOM
  constructors, `Canvas`, and `Image`, invokes the callback, renders PNG with
  Resvg (or writes SVG directly), and restores every global it changed in
  `finally`. It does not launch or automate a browser.
  [Imports](https://jsr.io/@nshiab/journalism-dataviz/1.0.19/src/dataviz/saveChart.ts#L1-L6),
  [DOM setup](https://jsr.io/@nshiab/journalism-dataviz/1.0.19/src/dataviz/saveChart.ts#L58-L133),
  [file rendering](https://jsr.io/@nshiab/journalism-dataviz/1.0.19/src/dataviz/saveChart.ts#L412-L436),
  [global restoration](https://jsr.io/@nshiab/journalism-dataviz/1.0.19/src/dataviz/saveChart.ts#L437-L442)

The browserless SSR change was introduced by upstream commit
[`e3303c5`](https://github.com/nshiab/journalism-dataviz/commit/e3303c5b618fce332dd6745d39798a1dee92817c).
A follow-up commit,
[`f4bc152`](https://github.com/nshiab/journalism-dataviz/commit/f4bc152f9cbf9318fbae2bce1503ea5e7bedc3bb),
removed the now-obsolete injected Plot, D3, and formatting globals.

## Implications for this repository

1. Remove `cleanDatavizGlobals()` from `writeChart` and `writeMap`, and remove
   the helper if unused. Version 1.0.19 already restores its temporary globals.
   The current extra cleanup is not merely redundant: because it deletes any
   matching own properties after `saveChart` restores them, it can erase globals
   that existed before the call.
2. Keep importing Observable Plot helpers (and any other functions used by the
   callback) normally. Existing README, JSDoc, and tests already import `plot`,
   marks such as `dot`/`geo`, and transforms such as `dodgeX` from
   `@observablehq/plot`; no browser-global or callback-string workaround should
   be documented.
3. Update the `style` wording in `writeChart`/`writeMap`. `saveChart` inserts
   `options.style` into a `<style>` element in the generated master SVG; the
   current claim that it styles a wrapping `<div id="chart">` is stale.
   [Style insertion](https://jsr.io/@nshiab/journalism-dataviz/1.0.19/src/dataviz/saveChart.ts#L343-L380)
4. Stop describing `path` as necessarily absolute: the upstream API accepts a
   file path and its own examples use relative paths. State that `.png` and
   `.svg` are the supported extensions.
   [Path documentation and examples](https://jsr.io/@nshiab/journalism-dataviz/1.0.19/src/dataviz/saveChart.ts#L11-L43),
   [extension handling](https://jsr.io/@nshiab/journalism-dataviz/1.0.19/src/dataviz/saveChart.ts#L412-L436)
5. The public callback shapes in SDA can remain specialized (`unknown[]` for
   charts and the current GeoJSON object shape for maps), because SDA supplies
   those concrete shapes. The existing implementation casts bridge to the
   broader upstream `Iterable | ArrayLike` contract. No `saveChart`
   argument-order or options migration is required.
