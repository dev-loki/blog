+++
title = "Modern Tooling Part 1: Blazing-Fast Package Management with uv"
date = "2026-07-13T19:50:00Z"
updated = "2026-07-16T15:15:29Z"
description = "uv replaces pip, virtualenv, pyenv and pip-tools with a single Rust binary: from local setup through dependency groups to the Docker build."
draft = false
[taxonomies]
tags = ["tooling", "python"]
+++

Hey and welcome to my four-part series on modern Python tooling. I'm writing it
now because the Python ecosystem is going through a real upheaval. Several, in
fact:

1. The Python ecosystem is being replaced in large part by Rust-based tools.
   I largely have [Astral](https://astral.sh) to thank for that.
2. Ever-larger parts of development are being done by AI from various vendors,
   and keeping it under control leads to growing problems.

Conveniently, these two shifts fit together perfectly.

So my goal is first to introduce these new Rust-based tools, and then to show
how they help in AI-driven development. I'll look at four+ of these tools, not
in the abstract but along a real FastAPI project template: `uv`, `ruff`, `ty`
and `prek` (+more mini tools).

**Part 1 (this one)** is about the foundation: **`uv`**.


### The problem I see: five tools for one job

Anyone who wanted to set up a Python project cleanly used to need a whole
toolbox:

* `pyenv` to install the right Python version
* `venv` or `virtualenv` (I've also used `pipenv`) to create an isolated environment
* `pip` to install packages
* `pip-tools`, `pip freeze` (or `poetry`) to lock dependencies
* plus the `source .venv/bin/activate` ritual (often automated via a zsh/bash script)

Each of these tools has its own configuration (including its own config
formats), its own quirks and its own failure modes. The result: "works on my
machine". Thrown in for free: a CI pipeline that spends minutes resolving
dependencies.


### The solution: uv, a single binary

`uv` replaces the entire stack with a single Rust binary. It's package
installer, environment manager, dependency resolver and Python version manager
in one. The best part: it's orders of magnitude faster while doing it.

Installing it is quick:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
# or on macOS:
brew install uv
```
_(As always: read the install script first, or even download it first and then
run it. For simplicity, only the direct step from the docs is shown here.)_


### Workflow

After that, day-to-day Python comes down to three commands:

```bash
# Install dependencies from the lockfile (incl. venv creation)
uv sync

# Add a package: updates pyproject.toml AND uv.lock
uv add fastapi

# Run any command in the project environment
uv run pytest
```

So there's no more `activate`. `uv run` makes sure the command runs in the
right environment and that this environment matches the lockfile. If it
doesn't, `uv` syncs it beforehand automatically. With `uv venv` (optionally
with `--python 314`) you can also create a `venv` environment separately.
Alternatively, you can add a `.python-version` file to the project with the
content `3.14`. Then `uv` simply downloads the matching interpreter on demand.
`pyenv` becomes unnecessary.


### Dependency groups instead of requirements sprawl

Instead of `requirements.txt`, `requirements-dev.txt` and
`requirements-test.txt`, my template defines everything in `pyproject.toml`,
using the standard for [dependency groups (PEP 735)](https://peps.python.org/pep-0735/),
including groups that include other groups:

```toml
[dependency-groups]
dev = [
  "prek==0.4.9",
  { include-group = "tests" },
  { include-group = "lint" },
]

tests = [
  "httpx==0.*",
  "pytest==9.*",
  "pytest-asyncio",
]

lint = [
  "ruff==0.*",
  "ty==0.*",
  "bandit==1.*",
  "import-linter>=2.11",
]
```

`uv sync` installs the `dev` group by default, `uv sync --no-dev` leaves it
out. Perfect for the production environment. Further flags for the groups are
`--all-groups` or, very specifically, `--group lint|tests|dev`.


### Reproducibility: uv.lock

Important for stable deployments is `uv.lock`: it pins every dependency
(including sub-dependencies) with an exact version and hash, across platforms.
In CI and Docker I use `--frozen` to enforce that the lockfile is current. If
`pyproject.toml` diverges from it, the build fails instead of quietly
installing something else.

Here's how that looks in an example Dockerfile from my template (multi-stage,
with a cache mount):

```dockerfile
# Deliberately not alpine, since that's often extra work right now with binary
# builds (e.g. psycopg2/etc.).
FROM python:3.14-slim AS builder

ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

# First step: have uv. There are also ready-made Docker images!
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv
COPY pyproject.toml uv.lock ./

# Dependencies only first, this layer gets cached
# as long as the lockfile doesn't change
RUN uv sync --frozen --no-dev --no-install-project

# Then the source code -> frequent changes
COPY src ./src

# Install using the cache (makes a huge difference, especially in CI)
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev
```

And in the GitHub Actions pipeline, the official action handles setup and
caching in a single step:

```yaml
- name: Install uv
  uses: astral-sh/setup-uv@v8.2.0
  with:
    python-version: "3.14"
    enable-cache: true

- name: Install dependencies
  run: uv sync --all-groups
```

### Conclusion

`uv` needs less configuration than the old stack and is still noticeably
faster. It's the reason every following part of this series starts with
`uv run ...`. It makes Python development, CI, CD and more faster.

Bonus feature: running [scripts with inline dependencies](https://docs.astral.sh/uv/guides/scripts/#declaring-script-dependencies).
Perfect for DevOps and the like. :)

---

**What's next:** In [Part 2: Consistent Linting and Formatting with ruff](@/blog/2026-07-16_modern-tooling-part-2-ruff.en.md)
I look at how to enforce coding standards without the wait. [Part 3 (ty)](@/blog/2026-07-20_modern-tooling-part-3-ty.en.md)
and [Part 4 (prek)](@/blog/2026-07-20_modern-tooling-part-4-prek.en.md) are out now too.
