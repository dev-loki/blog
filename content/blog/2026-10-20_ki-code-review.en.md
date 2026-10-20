+++
title = "Who actually reviews the code the AI writes?"
date = "2026-10-20T09:00:00Z"
updated = "2026-10-20T14:00:00Z"
description = "Agents now write a big chunk of our code. What the 2025 and 2026 studies say about review, knowledge and security, and how I would set up pull requests now."
[taxonomies]
tags = ["ki", "clean-code"]
+++

*(Translation was done by AI. Sorry :/)*

At work, agents now write a decent part of our new code. That is fast. Very
fast. And we do it even though (or precisely because?) we are experienced
developers, some of us with 15+ years in the industry.

The problem comes afterwards, in the pull request. Either it is slow, or it is
not thorough enough, or the understanding is simply missing. Lately I have
been sitting in front of 900-line diffs that nobody on the team typed
themselves, asking myself: who actually understands this right now? Honestly:
not me anymore. And since I am not exactly the passive team member type, I
needed a solution :D

![Three-panel comic. Developer: "Claude, who wrote this 900-line pull request?" Robot: "I did!" Robot: "I also wrote the tests, ran the tests, and reviewed it. Everything is green!" Developer: "Great. So who actually understands it?" Robot: "...Define 'understands', pal."](/blog/ki-code-review-comic.jpeg)

But it is 2026. So I had three AIs (Claude, ChatGPT, Gemini Argon) research
the topic independently, added my own experience, merged everything and
looked up the contested numbers in the original sources. Brave new world...

Here is the short version.

## The work has moved

We write more code but barely ship more. The DORA 2025 report (about 5,000
respondents) links AI adoption to higher throughput and higher instability at
the same time. DORA calls the extra checking effort the "verification tax".
Faros AI telemetry (10,000+ developers, vendor data, so take it with a grain
of salt) shows the mechanism: 98% more merged PRs, PRs 154% larger, review
time up 91%, no gain at company level.

Keep in mind that the DORA report is from 2025, and in the last six months
alone we have made huge jumps with Opus 5, Fable & co. Still, my guess is that
the gap has only widened since then. The agents write faster, and reading
still happens at the same speed.

The bottleneck has moved from typing to reading.

I am clearly not alone with this. There is an
[Ask HN with hundreds of comments](https://news.ycombinator.com/item?id=50151036) right now on how to deal with
shipping AI-written code you do not understand. It started with a Meta
engineer whose own code now feels like a black box to them. A senior engineer
with ten years of experience writes there that nobody can seriously review
thousands of changed lines a week, and sums up their daily routine like this:

> "I just approve PRs, because I have to."

That is exactly where I do not want to end up. By the way, the top answer in
the thread is pretty much my station 1 further down: the human does the
design, the agent only fills in the gaps.

## Three things that worry me

**1. We lose our understanding of our own code.** In 1985 Peter Naur wrote in
[Programming as Theory Building](https://pages.cs.wisc.edu/~remzi/Naur.pdf)
that a program is a theory held by the team: why it is built this way and how
it reacts to change. That theory used to form as a side effect of writing. If
an agent plans, writes and tests, the side effect is gone. In a randomized
trial by Anthropic (52 developers, January 2026) the AI group scored 17% lower
on comprehension. The interesting part is the split inside that group: people
who asked the AI to explain things scored 65 to 86%. People who just delegated
scored 24 to 39%. There is even a name for it now:
["comprehension debt"](https://arxiv.org/abs/2607.10856), meaning code the
team accepted before anyone could explain it.

**2. Security.** Veracode tested over 100 models: without security guidance
in the prompt, 45% of the samples contained a known flaw, and that did not
improve across model generations. Then there is a lovely new attack: almost
20% of the packages AIs suggest do not exist, and many of the invented names
come back on every run. Attackers simply register them in advance
("slopsquatting"). And in April 2026 researchers showed that prompt injection
in PR titles and comments makes several AI review bots leak CI secrets.

You can watch what this looks like at scale in public, by the way. The
[Claude Code issue tracker](https://github.com/anthropics/claude-code/issues)
(CLI and desktop app), a project written to a large part by its own agent,
currently has about 14,700 open issues against roughly 86,000 closed ones. So
a good one in seven issues is still open.
[curl](https://github.com/curl/curl/issues), maintained by humans the
old-school way, sits at 15 open against about 5,600 closed. It is not a clean
comparison (user base, age and release cadence are completely different), but
it matches my gut feeling pretty well.

**3. Responsibility.** AI helps with review, just not very well. On
[SWR-Bench](https://arxiv.org/abs/2509.01494) (1,000 real PRs) the best tool
reached an F1 score of 19%. Important: the paper is from September 2025, so it
tested models that are already two generations old. The number is surely
better by now, but still far from a reliable gate. In a
[study across 178 repos](https://arxiv.org/abs/2508.18771), 1 to 19% of AI
comments led to a code change, against 60% for human comments.

The Linux kernel settled this cleanly in 2026: an AI may not add
`Signed-off-by`, and the human who submits is responsible for all of it. That
is also the only approach that works. Neither OpenAI nor Anthropic take
responsibility for the code their models generate. Whoever checks it in owns
it.

## What I take from it

Keep the pull request, give it a new job. To me a PR is now a package a human
can check: what is supposed to happen, how do I see that it works, where is
the risk, and who owns it.

And a PR has to create understanding again, the way writing used to as a side
effect. That only happens if the human author goes through and edits the AI's
work before anyone else looks at it. Passing the PR along just moves the
understanding to the reviewer, who has just as little context.

Five stations for that:

<figure class="diagram">
<svg viewBox="0 0 640 400" width="100%" role="img" aria-labelledby="gates-title-en" xmlns="http://www.w3.org/2000/svg" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" fill="currentColor">
<title id="gates-title-en">Five stations of a PR: intent, author check, automated gates, AI review, human reviews and merges</title>
<defs><marker id="arr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z"/></marker></defs>
<g fill="none" stroke="currentColor" stroke-width="2">
<rect x="20" y="10" width="420" height="56"/>
<rect x="20" y="90" width="420" height="56"/>
<rect x="20" y="170" width="420" height="56" stroke-dasharray="6 4"/>
<rect x="20" y="250" width="420" height="56" stroke-dasharray="6 4"/>
<rect x="20" y="330" width="420" height="56" stroke-width="4"/>
<line x1="230" y1="66" x2="230" y2="86" marker-end="url(#arr)"/>
<line x1="230" y1="146" x2="230" y2="166" marker-end="url(#arr)"/>
<line x1="230" y1="226" x2="230" y2="246" marker-end="url(#arr)"/>
<line x1="230" y1="306" x2="230" y2="326" marker-end="url(#arr)"/>
</g>
<g font-size="17" font-weight="bold">
<text x="36" y="36">1 Intent</text>
<text x="36" y="116">2 Author check</text>
<text x="36" y="196">3 Automated gates</text>
<text x="36" y="276">4 AI review</text>
<text x="36" y="356">5 Human merges</text>
</g>
<g font-size="13" opacity="0.7">
<text x="36" y="56">ticket with acceptance criteria</text>
<text x="36" y="136">read the full diff, explain it yourself</text>
<text x="36" y="216">tests, types, SAST, secrets, packages</text>
<text x="36" y="296">sandboxed, comments only</text>
<text x="36" y="376">depth follows risk</text>
</g>
<g font-size="13">
<text x="460" y="44">human</text>
<text x="460" y="124">human</text>
<text x="460" y="204">machine</text>
<text x="460" y="284">machine</text>
<text x="460" y="364" font-weight="bold">named human</text>
</g>
</svg>
</figure>

1. **Intent first.** Before an agent starts, there is a ticket with acceptance
   criteria, invariants and what is explicitly *out of scope*. Otherwise an AI
   ends up checking the code against itself.
2. **Author check.** Read the full diff, rework what does not fit. Write the
   PR description in your own words. Mark AI use with an `Assisted-by`
   trailer.
3. **Automated gates.** Tests, types, linters, SAST, secret scanning,
   dependency checks (does the package even exist, how old is it).
4. **AI review.** Runs in a sandbox without secrets, writes comments, cannot
   approve anything.
5. **Human reviews and merges.** How deep depends on the risk. Docs and
   formatting: one reviewer is enough. Auth, crypto, personal data, CI/CD:
   code owner or security review, no exceptions.

Plus a few rules I mean quite seriously:

- If you cannot explain the essential logic of your change, you get the PR
  back. No matter who wrote it.
- An approval means "I could maintain this". It does not mean "CI was green",
  and it certainly does not mean "the AI liked it".
- PRs stay small. Google calls about 100 lines reasonable and 1,000 too much.
  I start with a soft limit of around 400 lines.

## Garbage in, garbage out

An agent works only as well as the ticket it gets. That was never different
for humans. What is new is that most models do not notice on their own when
information is missing. If they are allowed to ask clarifying questions,
performance goes up by as much as 74% according to
[Ambig-SWE](https://arxiv.org/abs/2502.13069).

I do not write tickets myself, but this is how I want them: written for two
readers. The colleague who joins next year, and an agent that knows nothing
outside the repo.

In practice: name modules and files, point to the existing implementation to
follow, put quality goals in numbers ("under 16 ms", not "fast") and say how
to verify it.

And this one matters: decisions go into the ticket or an ADR when they are
made. Chat logs and agent sessions disappear at some point, and the reasoning
with them.

## Conclusion

One sentence that never counts as an answer in a post-mortem: "The AI wrote
it." Neither does "Another AI reviewed it." The tools can write as much as they
like. A human has to understand it and sign it.

I have proposed this approach to my team, and hopefully we will try it over
the next few weeks. With numbers before and after: review time, PR size,
defects after merge and whether a second engineer can explain a critical
change. Once there are results, I will write about them.

## Sources (selection)

- DORA, *State of AI-assisted Software Development 2025*
- Anthropic, *How AI assistance impacts the formation of coding skills*, January 2026
- Comprehension debt study, [arXiv:2607.10856](https://arxiv.org/abs/2607.10856), 2026
- Spracklen et al., *We Have a Package for You!*, USENIX Security 2025
- Zeng et al., SWR-Bench, [arXiv:2509.01494](https://arxiv.org/abs/2509.01494)
- Sun et al., *Does AI Code Review Lead to Code Changes?*,
  [arXiv:2508.18771](https://arxiv.org/abs/2508.18771)
- Vijayvargiya et al., Ambig-SWE, [arXiv:2502.13069](https://arxiv.org/abs/2502.13069)
- Naur, [*Programming as Theory Building*](https://pages.cs.wisc.edu/~remzi/Naur.pdf), 1985
- Linux kernel, `Documentation/process/coding-assistants.rst`
