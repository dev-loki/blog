+++
title = "Moderne Werkzeuge Teil 5: Die Toolchain als Korsett für KI-Agenten"
date = "2026-07-26T12:00:00Z"
description = "Wie die schnelle, strikte Toolchain aus uv, ruff, ty und prek zum Korsett für KI-Agenten wird: deterministisches Feedback, das produktiven und vertrauenswürdigen Agenten-Code erst möglich macht."
draft = false
[taxonomies]
tags = ["tooling", "python", "ki"]
+++

In [Teil 1](@/blog/2026-07-15_modern-tooling-part-1-uv.md) habe ich von zwei
Umbrüchen geschrieben: das Python-Ökosystem wird auf Rust-basierte Werkzeuge
umgestellt, und immer mehr Code entsteht durch KI. Die vier Teile davor haben
den ersten Umbruch abgearbeitet. In diesem Bonus-Teil kommt der zweite dazu,
denn beide passen besser zusammen, als es zunächst aussieht.

Kurz gesagt: Dieselben `uv`-, `ruff`-, `ty`- und `prek`-Checks, die mir die
Arbeit erleichtern, sind auch das Korsett, das einen KI-Agenten produktiv und
vertrauenswürdig(er) macht.


### Warum ein Agent Leitplanken braucht

Ein KI-Agent schreibt in Sekunden plausibel aussehenden Code. Plausibel heißt
aber nicht korrekt: Er erfindet APIs, übersieht `None`/`null`-Fälle, ignoriert die
Architekturgrenzen des Projekts oder baut sich eben mal eine neue Abhängigkeit
ein. Wer das alles per Hand reviewen will, hat den Geschwindigkeitsgewinn sofort
wieder verloren.

Statt dem Agenten mehr zu vertrauen, gebe ich ihm eine Umgebung, in der Fehler
sofort und deterministisch auffallen. Genau dafür habe ich die Toolchain ohnehin
schon aufgebaut (und auch vor KI schon so genutzt).


### Dieselben Checks, jetzt als Feedback-Loop für den Agenten

Für den Agenten brauche ich dafür kein neues Setup. Die Checks aus den Teilen 2
bis 4 sind schon eine maschinenlesbare, deterministische Wahrheit über den Code:

- `uv run ruff check --fix .` räumt auf und meldet, was es nicht selbst fixen kann
- `uv run ty check` fängt Typ- und `None`-Fehler ab, bevor sie Laufzeitfehler werden
- `uv run bandit` und `import-linter` bewachen Sicherheit und Architektur
- `uv run pytest` sagt, ob der Code überhaupt noch tut, was er soll

Der Agent bekommt diese Befehle an die Hand (bei mir in einer `AGENTS.md` bzw.
`CLAUDE.md`/`GEMINI.md` mit Hinweis auf die `AGENTS.md`) und arbeitet in genau der
Schleife, die ich als Mensch auch nutze: schreiben, prüfen, den Fehlern folgen,
nachbessern, wiederholen. Der Unterschied ist nur, dass er die Schleife viel
häufiger und schneller durchläuft.


### Warum Geschwindigkeit zur Grundvoraussetzung wird

In den bisherigen Teilen war Geschwindigkeit "nur" Komfort. Beim Agenten wird
sie zur Grundvoraussetzung. Ein Check, der 30 Sekunden dauert, killt eine
Agenten-Schleife genauso wie meine eigene, nur dass der Agent vielleicht
zwanzigmal pro Minute prüfen will. Erst weil `ruff` und `ty` im
Millisekundenbereich antworten, kann der Agent eng iterieren, statt nach jedem
Schritt minutenlang zu warten oder, schlimmer, die Checks ganz zu überspringen.


### Das Korsett: Regeln, die der Agent nicht umgehen kann

Meine `select = ["ALL"]`-Strategie aus [Teil 2](@/blog/2026-07-16_modern-tooling-part-2-ruff.md),
die strikte Typdisziplin aus [Teil 3](@/blog/2026-07-20_modern-tooling-part-3-ty.md)
und die Architekturregeln aus [Teil 4](@/blog/2026-07-20_modern-tooling-part-4-prek.md)
sind für einen Agenten wertvoller als für mich: Sie schreiben die Form des
Projekts fest. Der Agent darf produktiv sein, aber nur innerhalb dieser Form.

Und es ist nicht verhandelbar: Der Pre-Commit-Hook blockt schlechten Code,
bevor er in die Historie kommt, und die CI fängt den Rest (auch das
`--no-verify` eines übermotivierten Agenten). Der Agent kann noch so überzeugt
argumentieren, der rote Check bleibt rot.


### Fazit

Dass die beiden Umbrüche aus Teil 1 zeitgleich passieren, ist kein Zufall. Eine
schnelle, strikte, deterministische Toolchain ist die Voraussetzung dafür, dass
KI-gestützte Entwicklung nicht in einem Berg plausibler, aber kaputter Diffs
endet. Die Werkzeuge, die mir die Arbeit erleichtern, sind dieselben, die einen
Agenten in der Spur halten.

---

**Die Serie:**
* [Teil 1: uv](@/blog/2026-07-15_modern-tooling-part-1-uv.md)
* [Teil 2: ruff](@/blog/2026-07-16_modern-tooling-part-2-ruff.md)
* [Teil 3: ty](@/blog/2026-07-20_modern-tooling-part-3-ty.md)
* [Teil 4: prek](@/blog/2026-07-20_modern-tooling-part-4-prek.md)
* Teil 5: Korsett für KI-Agenten (Bonus, dieser Teil)
