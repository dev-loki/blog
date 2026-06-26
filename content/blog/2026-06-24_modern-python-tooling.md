+++
title = "Modern Python Tooling: uv, ruff, ty, prek and more"
date = "2026-06-24T13:00:00Z"
description = "The current Python tooling landscape has never been better. Here's how the pieces fit together into a fast, zero-drama developer setup."
draft = true
+++

Python tooling had a reputation for being a mess. `pip` + `venv` + `setuptools` +
`poetry` or `pipenv` + `pylint` or `flake8` + `black` or `autopep8` + `isort` —
all fighting each other, all slow, all configured differently.

That era is ending. The [Astral](https://astral.sh) team in particular has been
systematically replacing large parts of this stack with tools that are:

- **Blazing fast** (written in Rust)
- **Opinionated** but reasonably so
- **Composable** — each does one thing well
- **Drop-in compatible** with the ecosystem they replace

Here's the 2026 stack.

## uv — package manager and project tool

[uv](https://github.com/astral-sh/uv) replaces `pip`, `pip-tools`, `virtualenv`,
`venv`, `pyenv` (for Python version management), and partially `poetry`/`hatch`.

```bash
# install
curl -LsSf https://astral.sh/uv/install.sh | sh

# new project
uv init my-project
cd my-project

# add a dependency
uv add httpx

# run in the project's venv (no activation needed)
uv run python main.py

# lock and sync (like pip-compile + pip install)
uv sync
```

The killer feature: `uv` creates and manages virtualenvs automatically. You stop
thinking about venv activation entirely.

### Python version management

```bash
uv python install 3.13
uv python pin 3.13   # writes .python-version
```

No more `pyenv` in most cases.

### `pyproject.toml` first

```toml
[project]
name = "my-project"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = ["httpx>=0.27"]

[tool.uv]
dev-dependencies = ["ruff", "ty", "pytest"]
```

## ruff — linter and formatter

[ruff](https://github.com/astral-sh/ruff) replaces `flake8`, `pylint`, `isort`,
`black`, `pyupgrade`, `bandit` (partially), and dozens of plugins — in a single
binary that runs in milliseconds.

```bash
uv add --dev ruff

# check
ruff check .

# fix auto-fixable issues
ruff check --fix .

# format (black-compatible)
ruff format .
```

### Configuration in `pyproject.toml`

```toml
[tool.ruff]
line-length = 100
target-version = "py312"

[tool.ruff.lint]
select = [
    "E",    # pycodestyle errors
    "W",    # pycodestyle warnings
    "F",    # pyflakes
    "I",    # isort
    "UP",   # pyupgrade
    "B",    # flake8-bugbear
    "S",    # flake8-bandit (security)
    "C90",  # mccabe complexity
]
ignore = ["S101"]  # allow assert in tests
```

Start with the defaults, enable more rules as the team gets comfortable.

## ty — type checker

[ty](https://github.com/astral-sh/ty) is Astral's new type checker (in active development
as of 2025). It's designed to be a faster, stricter alternative to `mypy` and `pyright`.

```bash
uv add --dev ty

ty check
```

Like ruff, it's written in Rust and designed for speed. Configuration lives in `pyproject.toml`:

```toml
[tool.ty]
# TODO: fill in once ty config API stabilises
```

**Current status**: ty is production-ready for many cases but still evolving.
Check [the docs](https://github.com/astral-sh/ty) for latest status before adopting.

If ty is too new for your project, `mypy` remains the stable choice:

```bash
uv add --dev mypy
mypy src/
```

## prek — pre-commit hooks

[prek](<!-- TODO: prek URL -->) runs your checks automatically before every `git commit`.
No more "I forgot to run the linter." See the dedicated article:
[Pre-commit hooks with prek](../2026-06-24_pre-commit-hooks-with-prek).

Short version:

```bash
# TODO: prek install
prek install  # installs the git hook
```

```toml
# TODO: prek config for this stack
```

## pi.dev — project runner

[pi.dev](https://pi.dev) ties it all together as a project task runner. Instead of
remembering `uv run ruff check .` vs `uv run pytest`, you define tasks once:

```toml
# TODO: pi.toml example with lint/format/test/typecheck tasks
```

Then:

```bash
pi run lint
pi run test
pi run all
```

See [pi.dev Basics](../2026-06-24_pi-dev-basics) for the full introduction.

## The full picture

```
┌─────────────────────────────────────────────┐
│  pi.dev        project runner / task glue   │
├──────────┬──────────┬───────────────────────┤
│  uv      │  ruff    │  ty                   │
│  deps /  │  lint +  │  types                │
│  venvs   │  format  │                       │
├──────────┴──────────┴───────────────────────┤
│  prek          git pre-commit hook          │
└─────────────────────────────────────────────┘
```

Each layer is independent — adopt them one at a time.

## Migration path from the old stack

| Old | New |
|-----|-----|
| `pip` + `pip-tools` | `uv` |
| `virtualenv` / `venv` | `uv` (implicit) |
| `pyenv` | `uv python` |
| `black` | `ruff format` |
| `isort` | `ruff check --select I` |
| `flake8` | `ruff check` |
| `pylint` | `ruff check` (+ some mypy) |
| `mypy` | `ty` (or keep mypy) |
| `bandit` | `ruff check --select S` |
| `Makefile` / scripts | `pi.dev` |
| `pre-commit` | `prek` |

You don't have to migrate everything at once. Start with `uv` (biggest
day-one win) and `ruff format` (instant consistency), then add the rest.

## One-time project setup

```bash
# 1. Install uv (once, global)
curl -LsSf https://astral.sh/uv/install.sh | sh

# 2. New project
uv init my-project && cd my-project

# 3. Add dev tools
uv add --dev ruff ty pytest

# 4. Add pi.dev
# TODO: pi install

# 5. Add prek hook
# TODO: prek install

# 6. First check
uv run ruff check .
uv run ty check
```

From blank directory to a fully checked, auto-formatted, type-safe project in under
five minutes.
