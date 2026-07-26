+++
title = "Modern Tooling Part 2: Consistent Linting and Formatting with ruff"
date = "2026-07-16T17:14:00Z"
description = "Black, Flake8, Isort and pyupgrade replaced by a single Rust binary, including an opt-out strategy with select = [\"ALL\"]."
draft = false
[taxonomies]
tags = ["tooling", "python", "clean-code"]
+++

After tidying up package management with `uv` in
[Part 1](@/blog/2026-07-15_modern-tooling-part-1-uv.en.md), today I want to deal
with **ruff** in Part 2.


### Toolchain soup

"Code quality" long meant chaining four or five tools together:
- Black for formatting
- Isort for import sorting
- Flake8 (or pylint) for linting (plus a dozen plugins)
- pyupgrade for modern syntax
- and Bandit for security checks

Here too the rule held: every tool has its own config file, its own version and
its own conflicts. Black and Isort, for example, had to be explicitly aligned
so they didn't keep reformatting each other's imports.

And it was slow. On medium codebases these checks ran for seconds, sometimes
even minutes. Imho too slow to run on every save or commit. I still kept them
on, was usually already onto the next problem, and got promptly kicked back
because of some trivial issue. So more than once I disabled them and forgot to
run them again at the end, only to get annoyed by a red CI pipeline.


### ruff!

`ruff` is linter **and** formatter in a single Rust binary. It implements the
rules of Flake8 (including the popular plugins), Isort, pyupgrade and large
parts of Bandit, and formats Black-compatibly (with minimal deviations). The
runtime stays in the millisecond range even on large codebases, which makes a
decisive difference:

Checks that are instant run on every save in the editor, on every commit and in
CI. Checks that take seconds eventually only run in CI. Together with `--fix`,
simply brilliant tooling that also works independently of the IDE <3.

The two commands you need:

```bash
# Find linting errors and fix them automatically where possible
uv run ruff check --fix .

# Format the codebase
uv run ruff format .
```

In CI I flip it around: nothing is repaired there, only checked:

```yaml
- name: Formatting Check (Ruff)
  run: uv run ruff format --check .

- name: Linting Check (Ruff)
  run: uv run ruff check .
```


### My configuration: opt-out instead of opt-in

Most projects enable a handful of rule groups and add more over time. My
template goes the other way: **all** rules on, and every exception has to be
justified. That forces a deliberate decision on each `ignore`, and documents
the decision right there:

```toml
# Part of pyproject.toml
[tool.ruff.lint]
# I want to be strict and only opt out deliberately!
select = [ "ALL" ]
fixable = [ "ALL" ]

ignore = [
  # strict
  "D102",    # would require docstrings for every public method
  "D203",    # incompatible with D211 (no blank line before class docstring)
  "EM101",   # would force exception texts into variables first

  # incompatible with "ruff format"
  "COM812",

  # temporary - as an example
  "TC003",   # would enforce TYPE_CHECKING blocks.
]
```

The comment behind each rule is not a nice-to-have but the core of the strategy:
a year from now nobody remembers why `COM812` is off, unless it says so right
next to it.


### Per-file ignores: tests are different

Rules that make sense in production code are often just noise in tests. `assert`
is the normal case in tests (in production code the Bandit rule `S101` forbids
it), and "magic numbers" in a test case are simply the test data:

```toml
# Part of pyproject.toml
[tool.ruff.lint.per-file-ignores]
"tests/*" = [
    "ANN201",   # return annotations for test functions: unnecessary
    "PLR2004",  # magic values in comparisons: those ARE the test data
    "S101",     # assert is essential in pytest
]
```


### Import sorting included

Isort is on board right away as rule group `I`. So the sorting stays
deterministic even in edge cases, I declare explicitly what is third-party and
what is my own code:

```toml
[tool.ruff.lint.isort]
known-third-party = ["fastapi", "pydantic", "starlette"]
known-local-folder = ["app"]
```

Quick reminder: `isort` makes sure the import blocks are roughly split into 3
categories:
1. "batteries included" imports, e.g.: `from math import sqrt`
2. third-party imports: `from fastapi import FastAPI`
3. project imports: `from my_project.domain import ImportantClass`

And within the blocks, alphabetically.


### In the editor: feedback as you type

The real win comes when `ruff` runs as you type, not only at commit time.

**VS Code:** The official
[Ruff extension](https://marketplace.visualstudio.com/items?itemName=charliermarsh.ruff)
(by charliermarsh/Astral) handles both linting and formatting. What matters to
me is that it uses the version pinned in the project: `ruff.importStrategy`
defaults to `fromEnvironment`, so it picks up the `ruff` from the `uv`
environment instead of the bundled one.

```json
// .vscode/settings.json
{
  "[python]": {
    "editor.defaultFormatter": "charliermarsh.ruff",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll.ruff": "explicit",
      "source.organizeImports.ruff": "explicit"
    }
  },
  "ruff.importStrategy": "fromEnvironment"
}
```

The `.ruff` suffix on the code actions makes sure it's really `ruff` doing the
fixing and import sorting, not some other formatter by accident.

**PyCharm:** From version 2025.3 on, Ruff support is built in. Enable it under
*Settings → Tools → Ruff*, and *Reformat Code* and *Optimize Imports* will use
`ruff`. For older versions there's the
[Ruff plugin by koxudaxi](https://plugins.jetbrains.com/plugin/20574-ruff). In
both cases it's worth pointing it at the `ruff` from the project environment
rather than a globally installed one.


### Conclusion

`ruff` replaces four config files with one block in `pyproject.toml` and makes
linting so fast that there's no excuse left not to run it everywhere. The
opt-out strategy with `select = ["ALL"]` is deliberately radical: it costs a bit
of time to set up, but in return you get a ruleset where every exception is a
documented decision instead of a historical accident.

---
**What's next:** [Part 3: The future of type checking with ty](@/blog/2026-07-20_modern-tooling-part-3-ty.en.md)
covers type checking, and [Part 4 (prek)](@/blog/2026-07-20_modern-tooling-part-4-prek.en.md) ties it all
together with Git hooks. Missed the start?
Then head back to [Part 1 (uv)](@/blog/2026-07-15_modern-tooling-part-1-uv.en.md). As a bonus, [Part 5](@/blog/2026-07-27_modern-tooling-part-5-ai-harness.en.md) shows how the same tools become a corset for AI agents.
