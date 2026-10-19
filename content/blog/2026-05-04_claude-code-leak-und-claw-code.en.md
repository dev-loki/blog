+++
title = "Claude Code, Claw Code and the End of Secrets?"
date = "2026-05-04T12:00:00Z"
description = "A look at the Claude Code leak, the Claw Code project born from it, and what this reveals about the current state of AI development and its legal grey zones."
draft = false

[taxonomies]
tags = ["ki", "tooling"]
+++

Sorry for the long silence! Quite a bit of time has passed since the last post. I've still got a whole pile of drafts sitting around (`.md.draft`), but when I look at them, they all need a serious overhaul first, the world (and especially the AI world) is just moving too fast ;).

But right now it's precisely this AI thing keeping me occupied, and I'm missing a voice that's neither swept away by the hype nor hiding in a cave ignoring current developments. So I'm just going to do it, even written entirely without AI.

Claude Code first, since it's fairly clearly leading the popularity charts among developers. It's already fascinating (and a bit ironic) that a tool designed to help us write code released its own source code, even after Mythic (the thing so good it had to be kept from the public) was already in use; or because of it? 🤔 Some might remember similar claims around GPT-5.


### Claw Code

Anyone who wants to look at the whole thing in detail (while it's still online) should check out [Claw Code](https://claw-code.codes/). The project essentially "deductively" processed the leaked code and made it accessible. It's a fascinating piece of software architecture showing how Anthropic orchestrates the interaction between LLM and local shell.


### The legal side: DMCA Whack-A-Mole

Of course Anthropic finds this less amusing. There have apparently been over 8,100 takedown requests already. [Heise published a very good article about it](https://www.heise.de/news/Claude-Code-Leck-8100-Loeschantraege-und-die-Geburtsstunde-von-Claw-Code-11279601.html) that untangles the legal side. It's the classic "birth of a tool from a leak", and the desperate attempt to put the cat back in the bag.

I find this quite telling about the current state of AI:
- The tools are becoming more powerful, but also more complex.
- Code (and bugs) are being produced faster and getting less and less genuine review.
- "Security by Obscurity" works even less with AI than it did before.

I'm still thinking about whether to write a deeper article specifically about **AI Guardrails**, a kind of safety corset for AI. I have the feeling this is still missing for many people, even though it's really a pretty low-hanging fruit.
