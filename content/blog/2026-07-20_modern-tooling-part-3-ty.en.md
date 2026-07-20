+++
title = "Modern Tooling Part 3: The future of type checking with ty"
date = "2026-07-20T07:32:00Z"
description = "Astral's type checker ty in practice: why speed decides whether type discipline sticks, and where the early-adopter price sits."
draft = false
[taxonomies]
tags = ["tooling", "python"]
+++

So far in this series I've sorted out package management with `uv`
([Part 1](@/blog/2026-07-15_modern-tooling-part-1-uv.en.md)) and linting with
`ruff` ([Part 2](@/blog/2026-07-16_modern-tooling-part-2-ruff.en.md)). **Part 3**
is the most demanding piece of static analysis: type checking.


### Why type checking?

I really got into type checking back in the PHP days, through phpstan/psalm. It
felt like the validation I knew from other languages was finally arriving in the
scripting languages too. YES: it's a bit more work, and of course arrays (PHP)
or lists aren't quite as flexible anymore. But throwing everything in there was
never a good idea anyway. So for me type checkers enforced sensible behaviour
instead of applying random rules that make my life hard.

The main reason for me, though, is that type checkers in scripting languages
simply wipe out entire categories of bugs. Combined with linters, you should
have far fewer (or even zero) `None` errors left in Python. Used consistently,
you avoid a lot of problems, e.g. unhandled logical branches in
`match`/`if-elif-else` cascades.

And finally: code completion. With AI that matters a bit less these days, but
every modern IDE can read these type hints and make useful suggestions. The
success of FastAPI/pydantic rests partly on exactly that: the DX (developer
experience) is so good!

In my template with a hexagonal architecture, types are even load-bearing: the
ports are defined as abstract, fully typed interfaces:

```python
class ItemRepository(ABC):
    @abstractmethod
    async def save(self, item: Item) -> Item: ...

    @abstractmethod
    async def by_id(self, item_id: UUID) -> Item | None: ...
```

A type checker makes sure every adapter fulfils this contract exactly, and that
nobody forgets to handle the `None` case of `by_id`.

The problem was never the value, but the price: `mypy` gets noticeably slow on
growing codebases. And a check that takes 30 seconds stops being run locally, it
moves into CI, and type errors only surface after the push. Exactly the
feedback-loop problem that `ruff` solved for linting still existed for type
checking.


### ty

`ty` is Astral's answer to that: a type checker written in Rust, built for
massive parallelism, that slots directly into the `uv`/`ruff` toolchain. The
check runs so fast that it fits into any pre-commit hook without trouble:

```bash
uv run ty check
```

A typical finding looks like this, where someone forgets that `by_id` can also
return `None`:

```python
item = await repository.by_id(item_id)
print(item.name)  # error: `name` on `Item | None`, `None` has no `name`
```

At runtime that would be an `AttributeError` in production. With `ty` it's a red
line before the commit even exists, or depending on your CI tooling even a
prevented commit or merge.


### My type discipline

Important for context: the rule that every function, variable and class must be
fully typed and that `Any` stays the absolute exception is not a property of
`ty`, but a **project rule** of my template. `ty` is the tool that makes it
enforceable, together with `ruff`'s
[`ANN` rules that flag missing annotations](https://docs.astral.sh/ruff/rules/#flake8-annotations-ann).

In the pre-commit hook the check runs across the whole codebase:

```yaml
- id: ty
  name: ty-check
  entry: uv run ty check --verbose --output-format=full .
  language: system
  types: [python]
  pass_filenames: false
```

`pass_filenames: false` is set deliberately here: type checking only makes sense
across the whole project, since a change in file A can trigger a type error in
file B. Thanks to `ty`'s speed I can afford the full check on every commit.
Nice :).


### Caveats

`ty` is young. My template pins it to `ty==0.*`: the zero before the dot isn't
always meaningful in the open-source world. Here it does hold, though, `ty` is
officially still a beta up to version `0.0.61`. In my opinion (very subjective!)
it's already production ready, and the speed advantage is simply worth it to me.

In my Architecture Decision Records I still mark the adoption as *Experimental*:
I'm evaluating `ty` as the primary type checker and watching how quickly it
catches up to `mypy`/`pyright` on the more complex typing PEPs (generics,
`ParamSpec`, overloads).

For a template and greenfield projects the risk is manageable, the type
constructs there are rarely exotic. Anyone with a large existing codebase and
elaborate `mypy` plugin setups should weigh the switch consciously, though:
`mypy` currently still has more complete rule coverage.


### Conclusion

The real win of `ty` is not the better analysis, but a type checker that runs
fast: locally, on every commit, without anyone having to wait. Type discipline
only sticks when the feedback is fast, and that's exactly what `ty` delivers.

---
**What's next:** The final *Part 4: High-performance Git hooks with prek* is
still in the works; there I tie all these tools together. You can head back to
[Part 1 (uv)](@/blog/2026-07-15_modern-tooling-part-1-uv.en.md) or
[Part 2 (ruff)](@/blog/2026-07-16_modern-tooling-part-2-ruff.en.md).
