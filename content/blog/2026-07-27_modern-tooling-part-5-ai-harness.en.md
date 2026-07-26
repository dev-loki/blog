+++
title = "Modern Tooling Part 5: The toolchain as a corset for AI agents"
date = "2026-07-26T12:00:00Z"
description = "How the fast, strict toolchain of uv, ruff, ty and prek becomes a corset for AI agents: deterministic feedback that makes productive, trustworthy agent code possible in the first place."
draft = false
[taxonomies]
tags = ["tooling", "python", "ki"]
+++

In [Part 1](@/blog/2026-07-15_modern-tooling-part-1-uv.en.md) I wrote about two
upheavals: the Python ecosystem is moving to Rust-based tools, and more and more
code is written by AI. The four parts before this one worked through the first
upheaval. This bonus part adds the second, because the two fit together better
than it first looks.

In short: the same `uv`, `ruff`, `ty` and `prek` checks that make my work easier
are also the corset that makes an AI agent productive and (more) trustworthy.


### Why an agent needs guardrails

An AI agent writes plausible-looking code in seconds. Plausible doesn't mean
correct, though: it invents APIs, misses `None`/`null` cases, ignores the
project's architecture boundaries, or just pulls in a new dependency. Reviewing
all of that by hand and the speed gain is gone immediately.

Instead of trusting the agent more, I give it an environment where mistakes show
up instantly and deterministically. I'd built the toolchain for exactly that
anyway (and used it this way long before AI).


### The same checks, now as a feedback loop for the agent

I don't need a new setup for the agent. The checks from parts 2 to 4 are already
a machine-readable, deterministic truth about the code:

- `uv run ruff check --fix .` cleans up and reports what it can't fix itself
- `uv run ty check` catches type and `None` errors before they become runtime errors
- `uv run bandit` and `import-linter` guard security and architecture
- `uv run pytest` tells me whether the code still does what it should

The agent gets these commands (for me in an `AGENTS.md`, with a `CLAUDE.md`/`GEMINI.md`
pointing to it) and works in exactly the loop I use as a human: write, check,
follow the errors, fix, repeat. The only difference is that it runs the loop far
more often and faster.


### Why speed becomes a prerequisite

In the earlier parts, speed was "just" comfort. With an agent it becomes a
prerequisite. A check that takes 30 seconds kills an agent's loop the same way it
kills mine, except the agent might want to check twenty times a minute. Only
because `ruff` and `ty` answer in the millisecond range can the agent iterate
tightly, instead of waiting minutes after every step or, worse, skipping the
checks entirely.


### The corset: rules the agent can't get around

My `select = ["ALL"]` strategy from [Part 2](@/blog/2026-07-16_modern-tooling-part-2-ruff.en.md),
the strict type discipline from [Part 3](@/blog/2026-07-20_modern-tooling-part-3-ty.en.md),
and the architecture rules from [Part 4](@/blog/2026-07-20_modern-tooling-part-4-prek.en.md)
are more valuable for an agent than for me: they fix the shape of the project.
The agent is free to be productive, but only within that shape.

And it's not negotiable: the pre-commit hook blocks bad code before it reaches
the history, and CI catches the rest (including the `--no-verify` of an
over-eager agent). The agent can argue as convincingly as it likes, the red
check stays red.


### Conclusion

That the two upheavals from Part 1 happen at the same time is no coincidence. A
fast, strict, deterministic toolchain is the precondition for AI-assisted
development not ending in a pile of plausible but broken diffs. The tools that
make my work easier are the same ones that keep an agent on track.

---

**The series:**
* [Part 1: uv](@/blog/2026-07-15_modern-tooling-part-1-uv.en.md)
* [Part 2: ruff](@/blog/2026-07-16_modern-tooling-part-2-ruff.en.md)
* [Part 3: ty](@/blog/2026-07-20_modern-tooling-part-3-ty.en.md)
* [Part 4: prek](@/blog/2026-07-20_modern-tooling-part-4-prek.en.md)
