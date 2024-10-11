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

## Do your magic

Clone or fork the repository, create a new branch from your issue if relevant,
and have fun!

The suggested workflow is to create tests in `test/unit/` with the expected
outputs and to add or modify classes and methods in `src/`.

Read the tests and the functions already present as inspirations. Do your best
to write clear and understandable code.

Then, do your magic to pass the tests you created. It's a great way to stay
focused and break down the tasks into small steps.

We use [Deno](https://github.com/denoland/deno) to build and test the library.

Here's how to run a specific test file with one or more tests in it:

```bash
deno test -A test/unit/methods/addColumn.test.ts
```

And here's how to run all tests, including formatting, typescript checks,
linter, and dry run to publish on
[JSR](https://jsr.io/@nshiab/simple-data-analysis):

```bash
deno task all-tests
```

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
