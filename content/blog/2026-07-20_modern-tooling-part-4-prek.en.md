+++
title = "Modern Tooling Part 4: High-performance Git hooks with prek"
date = "2026-07-20T21:00:00Z"
description = "prek as a drop-in replacement for pre-commit: the same config, parallel execution, and how my whole quality gate runs before every commit."
draft = false
[taxonomies]
tags = ["tooling", "python", "git"]
+++

Over the course of this series I've rebuilt my Python stack with `uv`
([Part 1](@/blog/2026-07-15_modern-tooling-part-1-uv.en.md)), `ruff`
([Part 2](@/blog/2026-07-16_modern-tooling-part-2-ruff.en.md)) and `ty`
([Part 3](@/blog/2026-07-20_modern-tooling-part-3-ty.en.md)). In **Part 4** I
bring it all together: the checks should run automatically, before code even
reaches the repository. Nobody feels like running this stack of tools by hand
all the time.


### Git hooks as a quality gate

Every check that only fails in CI is a delay and pulls me out of my tasks:
write, commit, push, wait five minutes, red pipeline, fix, "Fix linting" commit,
push again. A pre-commit hook moves exactly those same checks to the earliest
possible point: errors get fixed *before* they land in the history, and CI turns
from the thing that finds errors into a pure safety net.


### The bottleneck with classic pre-commit

The [`pre-commit`](https://pre-commit.com) framework has been a standard for
this for years. Tools like lefthook or husky are great too. But prek is fast
and, thanks to its compatibility with pre-commit, my tool of choice. Because
pre-commit has a few downsides: it's a Python package itself, isolates every
hook in its own virtual environment, and runs hooks sequentially. The first
`git commit` after a fresh clone can take minutes while environments are built.


### prek

[`prek`](https://github.com/j178/prek) is a reimplementation of the pre-commit
framework in Rust, and the key point is: **it reads the same
`.pre-commit-config.yaml`**. But with smarter caching and without the virtualenv
overhead:

```bash
# Installation (a single static binary, no Python needed)
uv tool install prek
# alternatively via brew/pacman/apt/etc.

# Enable the git hook in the repository (once per clone)
prek install

# Run hooks manually
prek run                # against staged files
prek run --all-files    # against the whole codebase
prek run gitleaks --all-files  # a single hook specifically
```

### My hook setup in detail

The `.pre-commit-config.yaml` of my template chains together everything I built
in the last three parts. The interesting bit is the distinction between two
kinds of hooks:

**Remote hooks** come from foreign repositories: the basics like YAML/TOML
validation, trailing whitespace, and the secret scanner
[gitleaks](https://github.com/gitleaks/gitleaks):

```yaml
- repo: https://github.com/pre-commit/pre-commit-hooks
  rev: v6.0.0
  hooks:
  - id: check-yaml
  - id: check-toml
  - id: check-merge-conflict
  - id: trailing-whitespace
  - id: end-of-file-fixer

- repo: https://github.com/gitleaks/gitleaks
  rev: v8.30.1
  hooks:
  - id: gitleaks
```

**Local hooks**, on the other hand, run via `uv run` in my project environment:
that way ruff, ty and bandit check with exactly the versions pinned in `uv.lock`,
instead of in some separate hook environment:

```yaml
- repo: local
  hooks:
  - id: ruff-format
    name: ruff format
    entry: uv run ruff format
    language: system
    types: [python]

  - id: ruff-check
    name: ruff check
    entry: uv run ruff check --fix
    language: system
    types: [python]

  - id: ty
    name: ty-check
    entry: uv run ty check --verbose --output-format=full .
    language: system
    types: [python]
    pass_filenames: false

  - id: bandit
    name: bandit
    entry: uv run bandit -r src/app -c pyproject.toml
    language: system
    types: [python]
    pass_filenames: false
```

On top of that there's [import-linter](https://import-linter.readthedocs.io),
which guards my architecture: it fails as soon as someone imports infrastructure
from the domain layer. Architecture rules as an executable check instead of a
wiki page.


### One commit, the whole quality gate

With that, every `git commit` automatically runs: formatting, linting with
auto-fix, type checking, security scan (bandit), secret scan (gitleaks) and the
architecture check. Thanks to prek largely in parallel and within a few seconds,
fast enough that nobody is tempted to switch it off.

For emergencies there's still the back door:

```bash
git commit --no-verify
```

But that's exactly what CI is the safety net for (well, that and the cases where
someone forgot to run `prek install`): there the same checks run again
(`ruff format --check`, `ruff check`, `ty check`, `bandit`, `lint-imports`,
`pytest`), just as the last line of defence, not the first.


### Series conclusion

These four tools, `uv`, `ruff`, `ty` and `prek`, each replace a slow, fragmented
part of the Python toolchain with a fast Rust binary, while staying compatible
with what they replace (`pyproject.toml`, Black formatting,
`.pre-commit-config.yaml`).

And if I'm honest, they're usually the first tools of their kind that fit: a
codebase that was already perfect here is something I've never seen before.

---

**Series overview:**
* [Part 1: uv](@/blog/2026-07-15_modern-tooling-part-1-uv.en.md)
* [Part 2: ruff](@/blog/2026-07-16_modern-tooling-part-2-ruff.en.md)
* [Part 3: ty](@/blog/2026-07-20_modern-tooling-part-3-ty.en.md)
* [Part 4: prek](@/blog/2026-07-20_modern-tooling-part-4-prek.en.md)
* [Part 5: a corset for AI agents](@/blog/2026-07-27_modern-tooling-part-5-ai-harness.en.md) (bonus)
