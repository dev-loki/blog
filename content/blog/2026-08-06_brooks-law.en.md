+++
title = "Brooks's Law, Now With Agents"
date = "2026-08-06T09:00:00Z"
description = "A deadline gets nailed down far too late, and management suggests adding more people. Why that has not worked since 1975."
draft = false
[taxonomies]
tags = ["ki", "tooling"]
+++

*(Translation was done by AI. Sorry :/)*

I have seen this pattern in several projects, and it always runs the same way.
Months pass without anyone committing to a date. Then a date shows up on a slide
somewhere, because it was promised to a customer, and suddenly a half-finished
state has to ship in six weeks. In the meeting after that comes the suggestion
from the C-level that I have learned to expect: more resources.

The odd part is that the suggestion arrives more confidently the shorter the
remaining time is. With six months left, people discuss scope. With six weeks
left, they discuss two extra developers from another project. Fred Brooks wrote
down what happens then, in 1975:

> Adding manpower to a late software project makes it later.

That is Brooks's Law, from *The Mythical Man-Month*. Brooks had the material
first hand: he managed the development of OS/360 at IBM, a thousand people, every
date missed. His point is the unit itself. Cost scales with people times months,
progress does not.

## Why short deadlines make it worse

Ramp-up eats exactly the window that is left. Anyone joining has to be taught by
the people who already are the bottleneck. With six weeks to go, that is the
entire six weeks.

Then there is coordination. With n people there are n(n-1)/2 possible channels;
four people have six, eight people have twenty-eight. Every one of them is a
chance for two different assumptions about the same interface, and those surface
during integration week.

And the hard part: much of the work is sequential. Until the schema is migrated,
nobody can rebuild the endpoint on top of it. A second developer then waits
exactly as long as the first one, only on payroll.

## What would have helped in those meetings

Brooks's own answer is uncomfortable and still the only one: cut scope or move the
date. In the cases that did turn out fine, it was never the extra headcount, it
was an honest list of what actually had to work on the date. The rest shipped one
release later.

## And with agents?

Since I started running several Claude instances in parallel, the question comes
up again, this time without payroll. One of the three causes really does fall
away: ramp-up costs almost nothing, the context lives in `AGENTS.md` and gets
reused per agent. The sequence stays, because the dependency graph does not care
who sits in front of it. And coordination comes back as duplicated work: two
agents refactoring the same helper, each of them plausibly.

Plus a bottleneck Brooks did not have. I am the only one allowed to accept a
result. Three agents in parallel help me; at ten I am just reading diffs and
deciding worse every time. What does scale is the deterministic part of review:
linters, type checking, tests and pre-commit hooks judge as fast for ten agents
as for one. Exactly the argument from
[part 5 of the tooling series](@/blog/2026-07-27_modern-tooling-part-5-ai-harness.en.md).

After 51 years, one cause has fallen away and one has been added. It changes
nothing about the suggestion in the meeting.
