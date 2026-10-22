+++
title = "Do agents need a new Git branching model?"
date = "2026-10-22T09:00:00Z"
description = "OneFlow has been my branching model of choice for years. Now several agents work in the same repo at once. What still holds, what changes, and what gives the most benefit for the least overhead."
[taxonomies]
tags = ["git", "ki", "tooling"]
+++

*(Translation was done by AI. Sorry :/)*

I like
[OneFlow](https://www.endoflineblog.com/oneflow-a-git-branching-model-and-workflow).
Adam Ruka wrote it up in 2017 as a counter-proposal to GitFlow, and shortly
after it became what I recommend whenever someone asks me about Git branching
(well, sometimes also when nobody asks). One long-lived branch, short branches
around it, releases as tags. Done. So **a lot** less complex than GitFlow.

My day looks different from 2017, though. Often several agents run at the
same time, each in its own worktree (most people don't even notice), each on
its own branch with a `claude-` prefix or similar. By the afternoon there are
branches in the repo I never created myself, and a few PRs that all want into
`main` at once.

Do we need a new model for this? Or does OneFlow do the job, just turned
faster? And which part of it gives the most benefit without me sinking a
weekend into tooling? Or even better: spending three weeks introducing a new
model, and half a year later everything changes again?

I think the model itself can stay. The branches get smaller and live only a
few hours (compared to days before), and at the end a human (still?) has to
decide whether they get back onto the default branch.

## OneFlow in 60 seconds

Just a quick refresher. For details, feel free to click the OneFlow link
above.

- There is exactly one long-lived branch, usually `main`. That is where the
  history happens.
- Feature branches start from `main` and get deleted after the merge.
- Releases are tags. Release branches are temporary and only exist when a
  release needs stabilisation (QA, code freeze), then they go away again.
- Hotfixes branch off the latest release tag.

For features, Ruka recommends rebase plus fast-forward so the history stays
linear. He names two cases where OneFlow does not fit: projects that maintain
several incompatible versions in parallel, and continuous deployment, where
the release process looks completely different.

Fun fact: Vincent Driessen, who invented GitFlow, sees it similarly by now.
Since 2020 there has been a note on top of
[his article](https://nvie.com/posts/a-successful-git-branching-model/)
saying that teams doing continuous delivery should pick something simpler.

## What superintelligence (lol :D) changes

### Many more branches, much shorter ones

Agents work in worktrees. Claude Code does this on its own with
`claude --worktree <name>`: new directory under `.claude/worktrees/`, new
branch `worktree-<name>`, branched from the default branch on the remote.
Subagents get their own with `isolation: worktree`. I wrote about what
`git worktree` is
[back in 2021](@/blog/2021-11-25_advanced_git-worktree.en.md), when it was
still for humans.

A branch now lives only as long as the one task it was created for. If the
agent gets lost, the branch is set up again in ten minutes, changes included,
and that is usually faster than debugging its mess.

On
[trunkbaseddevelopment.com](https://trunkbaseddevelopment.com/short-lived-feature-branches/),
Paul Hammant gives short-lived feature branches a couple of days at most,
including the time spent waiting for review. He now explicitly counts the
developer's own coding agents among those allowed to work on such a branch.

### More conflicts, and size causes the most trouble

The best numbers I found come from
[AgenticFlict](https://arxiv.org/abs/2604.03551) (Ogenrwot and Businge,
AIware 2026). For this study they collected more than 142,000 PRs from coding
agents across more than 59,000 repos and test-merged about 107,000 of them.
27.7% had conflicts. Per agent it ranged from 15% (Copilot) to 32% (Codex).
Claude Code was at 26%, but with only 779 PRs, so the evidence is thin.

I find the size data more interesting than the agent comparison, mostly
because we can learn something from it:

PRs with about two changed lines conflicted around 10% of the time, at about
25 lines it was almost 30%. Above that, the rate levels off at around 32 to
33%.

This lines up with the
[AI Capabilities Model](https://cloud.google.com/blog/products/ai-machine-learning/introducing-doras-inaugural-ai-capabilities-model)
from the 2025 DORA report. Of the seven capabilities that decide whether AI
helps or hurts a team, two are "strong version control practices" and
"working in small batches". According to DORA, teams that commit often and
make use of rollbacks get more out of AI.

### The dangerous conflict is the one Git cannot see

Text conflicts are annoying, but at least Git reports them. Worse is when two
agents change different files, both branches are green, and `main` is red
after the second merge anyway. Agent A renames a parameter, agent B still
calls the function with the old name.

["Passes Alone, Fails Together"](https://arxiv.org/abs/2609.25396) (Xia, Wu,
Park, September 2026) looks at exactly this. In constructed tasks where two
agents work on the same Django helpers, 97% of runs broke. A single message
telling the second agent what the first one had already changed rescued 82%
of them.

On real PR pairs mined from Django, though, the problem showed up in only one
of 834 runs, and the authors themselves warn against reading the 97% as an
everyday number. The tasks were built on purpose so that both agents poke at
the same helpers. In everyday work this is rare. When two agents touch the
same interface, it can happen easily, and then I would not let them run
blindly in parallel.

### Merging stays manual work

Starting agents is trivial by now, no "proof" required :D. Bringing the work
back together is still on me, though. The Claude Code docs describe worktrees
as isolation for file edits. What happens to the branch afterwards is my job.
Of course AI is a useful tool for that too, but real logic conflicts in
particular still have to be resolved by a human.

With review, which I
[wrote about recently](@/blog/2026-10-20_ki-code-review.en.md), it was
similar. Since the agents do the typing, reading is the bottleneck. Branches
play the same game one step later in the process, at the merge.

## And Scion?

[Scion](https://github.com/GoogleCloudPlatform/scion) comes from Google. I had
filed it under Anthropic at first. It is an experimental orchestrator, open
source since April 2026, pre-1.0, and according to its README explicitly not
an officially supported Google product.

The idea: every agent (Claude Code, Gemini CLI, Codex, OpenCode) runs in its
own container, with its own worktree and its own credentials. The agents
coordinate through the Scion CLI and message each other. Humans follow along
through a web UI or via Slack, Teams and friends.

Mostly it showed me how little a worktree isolates. Ports, database, Docker
volumes and caches are still shared by every agent on my machine, only the
files are separate. That is why Scion puts each agent in a container with its
own credentials, and I like the second part in particular. An agent fixing
typos in the docs has no business holding a deploy token.

How the work comes back together is something Scion leaves open too. I found
nothing in the README about branch names, merge strategy or PRs. So I have to
bring the branching model myself either way.

Do I need Scion? Not right now. It pays off when many agents run for a long
time, on several machines and with different permissions. For a handful of
agents on my laptop, worktrees are enough.

## My proposal: OneFlow, turned faster

<figure class="diagram">
<svg viewBox="0 0 640 270" width="100%" role="img" aria-labelledby="flow-title" xmlns="http://www.w3.org/2000/svg" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" fill="currentColor">
<title id="flow-title">One long-lived main branch. Two agent branches run in parallel and come back via squash merge. A third one is discarded and restarted. Release as tag v1.4.0, hotfix from the tag as v1.4.1.</title>
<g fill="none" stroke="currentColor" stroke-width="2">
<line x1="20" y1="170" x2="620" y2="170" stroke-width="4"/>
<path d="M60 170 L90 115 L140 115 L165 170"/>
<path d="M60 170 L100 60 L225 60 L255 170"/>
<path d="M255 170 L280 115 L330 115" stroke-dasharray="6 4"/>
<path d="M345 170 L370 115 L420 115 L440 170"/>
<path d="M440 170 L465 230 L515 230 L535 170"/>
<line x1="324" y1="109" x2="336" y2="121"/>
<line x1="336" y1="109" x2="324" y2="121"/>
</g>
<g>
<circle cx="60" cy="170" r="6"/>
<circle cx="165" cy="170" r="6"/>
<circle cx="255" cy="170" r="6"/>
<circle cx="345" cy="170" r="6"/>
<circle cx="440" cy="170" r="6"/>
<circle cx="535" cy="170" r="6"/>
<circle cx="600" cy="170" r="6"/>
<circle cx="515" cy="230" r="5"/>
</g>
<g font-size="13">
<text x="95" y="105">PROJ-12</text>
<text x="120" y="50">PROJ-14</text>
<text x="270" y="105" opacity="0.7">discarded</text>
<text x="375" y="105">PROJ-15</text>
<text x="555" y="198">main</text>
<text x="385" y="198">v1.4.0</text>
<text x="465" y="258">hotfix</text>
<text x="525" y="248">v1.4.1</text>
</g>
</svg>
</figure>

1. **One long-lived branch, and it is always green.** Same as OneFlow. What is
   new is how expensive a red `main` has become. Every new agent branches off
   the current `main`, which is the default in Claude Code. If it is broken,
   every agent starts from a broken state and burns tokens chasing bugs that
   are not theirs.
2. **One task, one branch, one worktree, one PR.** The ticket number goes into
   the branch name (`agent/PROJ-123-retry-logic`), so three weeks later I still
   know where it came from. Lifetime: hours, one working day at most. If an
   agent heads in the wrong direction, I delete the branch and start again
   with a better ticket.
3. **Cut it small.** Whatever does not fit into a small PR becomes a stack.
   GitHub made
   [stacked PRs](https://github.blog/changelog/2026-10-06-stacked-pull-requests-generally-available/)
   generally available on 6 October 2026, `gh stack` supports worktrees, and a
   stack goes through the merge queue as one group. Unfinished work goes
   behind a feature flag. There are no long-lived feature branches.
4. **Squash merge.** This is where I deviate from Ruka. He cleans up with an
   interactive rebase before merging. With five commits from a human that
   works. Nobody cleans up the dozens of WIP commits an agent leaves behind by
   hand, and squash does the same thing automatically: one PR, one commit on
   `main`, one `git revert` if it goes wrong. That also settles Ruka's own
   complaint about rebase (reverting a feature means reverting several
   commits). The commit message gets the ticket number and an `Assisted-by`
   trailer.
5. **Merge queue as soon as several agents open PRs in parallel.** The queue
   tests each PR against `main` plus every PR ahead of it. That is exactly
   what catches the conflicts Git cannot see. On GitHub it is a branch rule
   (depending on your plan), GitLab calls it a merge train.
6. **If two tasks share an interface, they run one after the other.** Or the
   second agent gets told what the first one changed. In the Django study
   above, exactly that one sentence rescued 82% of the broken runs.
7. **Agents do not merge and do not tag.** Branch protection on `main`,
   changes only via PR, a human merges. Releases stay as in OneFlow: tag on
   `main`, release branch only when needed, hotfix from the tag.

## What gives the most for the least effort?

My estimate, roughly in the order I would introduce things:

| Measure | Effort | Benefit | When |
|---|---|---|---|
| Protected `main`, required CI | about an hour | very high | right away |
| Worktree per agent | one flag | high | right away |
| Small PRs, squash merge | one repo setting, plus discipline | high | right away |
| Ticket in branch name, `Assisted-by` in commit | none | medium | right away |
| Merge queue | one setting, merges take longer | high | several parallel agent PRs per day |
| Stacked PRs | a new habit | medium | features that do not fit into one PR |
| Container per agent (Scion and friends) | days | high for credentials | many agents, several machines, different permissions |

The first four rows together cost an afternoon. After that I would measure
for two weeks before touching anything further down the table.

## What I leave out on purpose

- **The `develop` branch.** Ruka's variant with `develop` as the working
  branch and `master` as a pointer to the latest release is meant for open
  source projects. For agents, a second long-lived branch is mostly a second
  place to branch off from by mistake.
- **Release branches by default.** For web apps with continuous deployment, a
  tag is enough.
- **jj.** [Jujutsu](https://github.com/jj-vcs/jj) treats conflicts as normal
  data you can commit and resolve later, and has an undo for every operation.
  Sounds ideal for agents. I have not tried it seriously yet, and as long as
  Git with worktrees does the job, switching is too expensive for me.
- **Agent sessions in the repo.** [Entire](https://docs.entire.io/core-concepts),
  the company of former GitHub CEO Thomas Dohmke, attaches agent sessions to
  commits via an `Entire-Checkpoint` trailer and keeps the metadata on a
  separate branch. Interesting when traceability is mandatory. For now, a link
  to the session in the PR description is enough for me.

## Conclusion

Do agents need a new branching model? I don't think so. I am sticking with
OneFlow: `main` is the branch that matters, and everything else can go once
its task is done. With agents that just happens a lot more often.

New branches cost me almost nothing today. Getting each one of them back into
`main` still takes as much time as it used to, and there are many more of
them. That is why almost all the rules above are about merging, and about a
human clicking the merge button at the end.

## Sources (selection)

- Adam Ruka,
  [*OneFlow: a Git branching model and workflow*](https://www.endoflineblog.com/oneflow-a-git-branching-model-and-workflow),
  2017
- Vincent Driessen,
  [*A successful Git branching model*](https://nvie.com/posts/a-successful-git-branching-model/),
  with a note from 2020
- Paul Hammant,
  [*Short-Lived Feature Branches*](https://trunkbaseddevelopment.com/short-lived-feature-branches/)
- Ogenrwot, Businge, *AgenticFlict*,
  [arXiv:2604.03551](https://arxiv.org/abs/2604.03551), AIware 2026
- Xia, Wu, Park, *Passes Alone, Fails Together*,
  [arXiv:2609.25396](https://arxiv.org/abs/2609.25396), 2026
- DORA, *State of AI-assisted Software Development 2025*
- Claude Code Docs,
  [*Run parallel sessions with worktrees*](https://code.claude.com/docs/en/worktrees)
- [GoogleCloudPlatform/scion](https://github.com/GoogleCloudPlatform/scion)
- GitHub Changelog,
  [*Stacked pull requests generally available*](https://github.blog/changelog/2026-10-06-stacked-pull-requests-generally-available/),
  6 October 2026
