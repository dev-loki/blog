+++
title = "Brooks' Gesetz, jetzt mit Agenten"
date = "2026-08-06T09:00:00Z"
description = "Ein Termin wird viel zu spät festgezogen, und von oben kommt der Vorschlag, mehr Leute draufzusetzen. Warum das seit 1975 nicht funktioniert."
draft = false
[taxonomies]
tags = ["ki", "tooling"]
+++

Das Muster habe ich in mehreren Projekten gesehen, und es läuft immer gleich.
Monate vergehen, ohne dass jemand einen verbindlichen Termin setzt. Dann steht
irgendwo ein Datum in einer Folie, weil es nach außen zugesagt wurde, und
plötzlich muss ein halbfertiger Stand in sechs Wochen fertig sein. In der
Runde danach kommt aus dem C-Level der Vorschlag, den ich inzwischen erwarte:
mehr Ressourcen.

Das Merkwürdige daran ist, dass der Vorschlag mit kürzerer Restlaufzeit sicherer
kommt. Bei sechs Monaten diskutiert man Umfang, bei sechs Wochen zwei zusätzliche
Entwickler aus einem anderen Projekt. Fred Brooks hat 1975 aufgeschrieben, was
dann passiert:

> Adding manpower to a late software project makes it later.

Das ist Brooks' Gesetz, aus *The Mythical Man-Month*. Brooks hatte das Material
aus erster Hand: Er hat bei IBM die Entwicklung von OS/360 geleitet, tausend
Beteiligte, jeder Termin gerissen. Sein Punkt ist die Einheit selbst. Kosten
skalieren mit Personen mal Monaten, Fortschritt tut das nicht.

## Warum kurze Fristen es schlimmer machen

Die Einarbeitung frisst genau das Fenster, das noch da ist. Wer neu dazukommt,
muss von den Leuten eingelernt werden, die bereits der Engpass sind. Bei sechs
Wochen Restlaufzeit ist das die ganze Restlaufzeit.

Dazu kommt die Abstimmung. Bei n Personen gibt es n(n-1)/2 mögliche Kanäle, vier
Leute haben sechs, acht Leute haben achtundzwanzig. Jeder davon ist eine
Gelegenheit für zwei unterschiedliche Annahmen über dieselbe Schnittstelle, und
die fallen erst in der Integrationswoche auf.

Und der harte Teil: Viel von der Arbeit ist sequenziell. Solange das Schema
nicht migriert ist, kann niemand den Endpoint darauf umbauen. Ein zweiter
Entwickler wartet dann genauso wie der erste, nur bezahlt.

## Was in diesen Runden geholfen hätte

Brooks' eigene Antwort ist unbequem und immer noch die einzige: Umfang kürzen
oder Termin verschieben. In den Fällen, in denen es doch noch gut ausgegangen
ist, war es nie das zusätzliche Personal, sondern eine ehrliche Liste, was zum
Termin wirklich funktionieren muss. Der Rest kam ein Release später.

## Und mit Agenten?

Seit ich mehrere Claude-Instanzen parallel laufen lasse, wird die Frage wieder
gestellt, diesmal ohne Personalkosten. Eine der drei Ursachen fällt tatsächlich
weg: Einarbeitung kostet fast nichts, der Kontext steht in `AGENTS.md` und wird
pro Agent wiederverwendet. Die Sequenz bleibt, der Abhängigkeitsgraph
interessiert sich nicht dafür, wer davor sitzt. Und die Abstimmung kommt als
Doppelarbeit zurück: zwei Agenten, die denselben Helper refaktorieren, jeder für
sich plausibel.

Dazu ein Engpass, den Brooks nicht hatte. Ich bin der einzige, der Ergebnisse
annehmen darf. Drei Agenten parallel bringen mir etwas, bei zehn lese ich nur
noch Diffs und entscheide immer schlechter. Was mitskaliert, ist der
deterministische Teil des Reviews: Linter, Typprüfung, Tests, Pre-Commit-Hooks
urteilen bei zehn Agenten so schnell wie bei einem. Genau der Gedanke aus
[Teil 5 der Tooling-Serie](@/blog/2026-07-27_modern-tooling-part-5-ai-harness.md).

Nach 51 Jahren ist eine Ursache weggefallen und eine dazugekommen. Am Vorschlag
aus der Runde ändert das nichts.
