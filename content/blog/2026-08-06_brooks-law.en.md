+++
title = "Brooks's Law, Now With Agents"
date = "2026-08-06T09:00:00Z"
updated = "2026-08-08T13:59:23Z"
description = "A deadline gets nailed down far too late, and from above comes the suggestion to put more people on it. Why that has not worked since 1975."
[taxonomies]
tags = ["ki", "tooling"]
+++

*(Translation was done by AI. Sorry :/)*

This post is not going to be particularly useful, but I need to get the topic
off my chest:
I have seen the following pattern in several projects, and it always runs the
same way.

Months pass without anyone committing to a date. Then a date shows up somewhere
in a slide/mail/meeting, because it was promised to the outside world, and
suddenly a half-finished state has to be done in six weeks. In the meeting after
that comes the suggestion from the C-level that I have learned to expect:

> ... more resources.

The odd part is that the suggestion comes even more reliably the shorter the
remaining time is. With six months left, people discuss scope. With six weeks
left, two extra developers from another project. Fred Brooks wrote down what
happens then, in 1975:

> "Adding manpower to a late software project makes it later."

That is Brooks's Law, from *The Mythical Man-Month*. Brooks had the material
first hand back then: he managed the development of OS/360 at IBM. With
thousands of people involved, every date was missed anyway. The problem he
identified is the unit itself. Cost scales with people times months, progress
explicitly does not.


## Why short deadlines make it worse

Ramp-up eats exactly the window that is left. Anyone joining has to be taught by
the people who already are the bottleneck. With six weeks to go, that is the
entire six weeks.

Then there is coordination. With n people there are `n(n-1)/2` possible
channels, four people have six, eight people have twenty-eight. Every one of
them is a chance for two different assumptions about the same interface, and
those only surface during integration week.

Most expensive of all, much of the work is sequential. Until the schema is migrated, nobody
can rebuild the endpoint on top of it. A second developer then waits exactly as
long as the first one, only on payroll.


## What would have helped

Brooks's own answer is uncomfortable and still the only one:

> Cut scope or move the date.

In the projects that did turn out fine, there was an honest list at the start of
what really had to work on the date. The rest shipped one release later, and
nobody outside the team noticed.

And that is exactly the option that always gets ruled out. Possibly even for
good reasons (usually something along the lines of "time2market beats quality"),
but that does not change the fact that certain things are incompatible with
reality.


## And with agents?

Since I started running several Claude instances in parallel, the question comes
up again, this time without payroll. One of the three causes does fall
away: ramp-up costs almost nothing, the context lives in `AGENTS.md` (or
`CLAUDE.md` or `GEMINI.md`) and gets reused per agent.
The sequence stays, the dependency graph does not care who sits in front of it.
And coordination comes back as duplicated work: two agents refactoring the same
helper, each of them plausibly.

Plus a bottleneck Brooks did not have. I am the only one allowed to accept a
result. Three agents in parallel help me, at ten I am just reading diffs and
deciding worse and worse. What does scale is the deterministic part of review:
linters, type checking, tests and pre-commit hooks judge as fast for ten agents
as for one. Exactly the argument from
[part 5 of the tooling
series](@/blog/2026-07-27_modern-tooling-part-5-ai-harness.en.md) (yes, that is
shameless self-promotion :D).

After 51 years, one of the three causes has fallen away and a fourth has been
added. For that meeting with six weeks left and the suggestion from above, the
arithmetic comes out the same as in 1975.

*(Most of the numbers and examples are adapted and based on old experience, and
have nothing to do with any current events.)*
