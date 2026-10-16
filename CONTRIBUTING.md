# How to contribute

Thank you for your interest in contributing!

If you don't feel comfortable playing with the project's code, keep in mind that
starting a conversation about a new feature or flagging a bug is already of
great help! :)

Feel free to start a
[conversation](https://github.com/nshiab/simple-data-analysis/discussions) if
some questions you have are not answered below.

You can also check
[this tutorial](https://github.com/firstcontributions/first-contributions) as a
resource.

## Creating an issue

The first step is to create an issue with a clear title and a description of the
problem you encountered: https://github.com/nshiab/simple-data-analysis/issues

If you want to solve the problem yourself, explain what you have in mind and how
you want to proceed.

## Library architecture

This repository is the **simple-data-analysis** package, which extends
**[simple-data-analysis-core](https://github.com/nshiab/simple-data-analysis-core)**.

- **simple-data-analysis-core** contains all core DuckDB-dependent functionality
  (data loading, filtering, joining, summarizing, geospatial operations, etc.).
- **simple-data-analysis** (this repo) adds AI methods, Google Sheets
  integration, and charting/dataviz methods on top of the core. **This is the
  package that most users should install.**

When contributing, consider where the logic belongs:

- **Core data operations** (new SQL-based methods, new data formats, geospatial
  features) should go in
  [simple-data-analysis-core](https://github.com/nshiab/simple-data-analysis-core).
- **AI, Google Sheets, and charting features** belong in this repository.
- **Generic utilities** that don't depend on DuckDB can go in `src/helpers/`. If
  a utility is used by both packages, it should live in core and be exported
  through its `/helpers` subpath.

## Do your magic

Clone or fork the repository, create a new branch from your issue if relevant,
and have fun!

The suggested workflow is to create tests in `test/unit/` with the expected
outputs and to add or modify classes and methods in `src/`.

Read the tests and the functions already present as inspirations. Do your best
to write clear and understandable code.

Then, do your magic to pass the tests you created. It's a great way to stay
focused and break down the tasks into small steps.

We use Node.js 24.21.0 or newer and Vite+ to build and test the library.
Install dependencies with `npm ci`.

Run a specific test file:

```bash
npx vp test test/unit/methods/writeChart.test.ts
```

Run formatting, lint, type checks, tests, the package build, and documentation:

```bash
npm run all-tests
```

Use `npm run fix` to apply formatting and lint fixes. Tests run with four workers
locally and two when `CI=true`,
each test file using a temporary working directory for outputs and caches.
Fixtures are shared and must remain read-only. Local test runs may load
`.env`; CI does not load it. `CI=true` skips tests that contact public services,
while local HTTP tests and DuckDB extension tests still run. DuckDB may download
native extensions during these tests.

Run `npm run docs` after changing public JSDoc. It generates the HTML site in
`site/`, the Markdown reference in `docs/`, and the agent references `llm.md`
and `llms.txt`.

Benchmarks are separate from the release checks. Use `npm run benchmark` for
tabular and geospatial workflow comparisons.

Releases use `npm run patch`, `npm run minor`, or `npm run major` from `main`.
The version hooks run all checks, regenerate documentation, and atomically push
the version commit and tag. The tag workflow publishes npm provenance, creates
the GitHub release, and deploys documentation to GitHub Pages.

When committing your work, keep in mind that your messages will be public if
your code gets merged into the main branch.

If you have any questions at any step, leave a comment on the relevant issue.

## Pull request

Make sure that your code is up-to-date. Some changes could have been pushed to
the main branch while you worked on your things.

It's now time to create a pull request! Explain what you did in your code and
what issue you solved.

An experienced contributor will look at your proposition. They might ask
questions and suggest modifications to your code.

When all questions are answered, and modifications are made, your code will be
merged into the main branch and officially part of the library! Congrats!
