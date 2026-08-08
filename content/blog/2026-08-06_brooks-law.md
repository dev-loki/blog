+++
title = "Brooks' Gesetz, jetzt mit Agenten"
date = "2026-08-06T09:00:00Z"
updated = "2026-08-08T13:59:23Z"
description = "Ein Termin wird viel zu spät festgezogen, und von oben kommt der Vorschlag, mehr Leute draufzusetzen. Warum das seit 1975 nicht funktioniert."
[taxonomies]
tags = ["ki", "tooling"]
+++

Der Post wird jetzt wenig sinnstiftend, aber das Thema muss ich jetzt einfach 
loswerden:
Folgendes Muster habe ich in mehreren Projekten gesehen, und es läuft immer gleich.

Monate vergehen, ohne dass jemand einen verbindlichen Termin setzt. Dann steht
irgendwo ein Datum in einer Folie/Mail/Meeting, weil es nach außen zugesagt 
wurde, und plötzlich muss ein halbfertiger Stand in sechs Wochen fertig sein. 
In der Runde danach kommt aus dem C-Level der Vorschlag, den ich inzwischen 
erwarte: 

> ... mehr Ressourcen.

Das Merkwürdige daran ist, dass der Vorschlag mit kürzerer Restlaufzeit sogar
noch sicherer kommt. Bei sechs Monaten diskutiert man Umfang, bei sechs Wochen
zwei zusätzliche Entwickler aus einem anderen Projekt. Fred Brooks hat 1975
aufgeschrieben, was dann passiert:

> "Adding manpower to a late software project makes it later."

Das ist Brooks' Gesetz, aus *The Mythical Man-Month*. Brooks hatte damals das
Material aus erster Hand: Er hat bei IBM die Entwicklung von OS/360 geleitet.
Mit tausenden Beteiligten wurde jeder Termin gerissen. Sein erkanntes Problem
ist die Einheit selbst. Kosten skalieren mit Personen mal Monaten, Fortschritt
tut das aber explizit nicht.


## Warum kurze Fristen es schlimmer machen

Die Einarbeitung frisst genau das Fenster, das noch da ist. Wer neu dazukommt,
muss von den Leuten eingelernt werden, die bereits der Engpass sind. Bei sechs
Wochen Restlaufzeit ist das die ganze Restlaufzeit.

Dazu kommt die Abstimmung. Bei n Personen gibt es `n(n-1)/2` mögliche Kanäle,
vier Leute haben sechs, acht Leute haben achtundzwanzig. Jeder davon ist eine
Gelegenheit für zwei unterschiedliche Annahmen über dieselbe Schnittstelle, und
die fallen erst in der Integrationswoche auf.

Teuer: Viel von der Arbeit ist sequenziell. Solange das Schema nicht migriert
ist, kann niemand den Endpoint darauf umbauen. Ein zweiter Entwickler wartet
dann genauso wie der erste, nur bezahlt.


## Was geholfen hätte

Brooks' eigene Antwort ist unbequem und immer noch die einzige: 

> Umfang kürzen oder Termin verschieben. 

In den Projekten, die doch noch gut ausgegangen sind, stand am Anfang eine
ehrliche Liste, was zum Termin wirklich funktionieren muss. Der Rest kam ein
Release später, und niemand außerhalb des Teams hat es gemerkt.

Und genau das wird immer als Option ausgeschlossen. Vielleicht sogar aus guten
Gründen (meistens etwas wie "time2market beats quality" oder ähnliches), aber
das ändert nichts daran, dass gewisse Dinge nicht mit der Realität vereinbar
sind.


## Und mit Agenten?

Seit ich mehrere Claude-Instanzen parallel laufen lasse, wird die Frage wieder
gestellt, diesmal ohne Personalkosten. Eine der drei Ursachen fällt tatsächlich
weg: Einarbeitung kostet fast nichts, der Kontext steht in `AGENTS.md` (oder
`CLAUDE.md` oder `GEMINI.md`) und wird pro Agent wiederverwendet. 
Die Sequenz bleibt, der Abhängigkeitsgraph interessiert sich nicht dafür, wer
davor sitzt. Und die Abstimmung kommt als Doppelarbeit zurück: zwei Agenten,
die denselben Helper refaktorieren, jeder für sich plausibel.

Dazu ein Engpass, den Brooks nicht hatte. Ich bin der einzige, der Ergebnisse
annehmen darf. Drei Agenten parallel bringen mir etwas, bei zehn lese ich nur
noch Diffs und entscheide immer schlechter. Was mitskaliert, ist der
deterministische Teil des Reviews: Linter, Typprüfung, Tests, Pre-Commit-Hooks
urteilen bei zehn Agenten so schnell wie bei einem. Genau der Gedanke aus
[Teil 5 der
Tooling-Serie](@/blog/2026-07-27_modern-tooling-part-5-ai-harness.md) (ja, das
ist schamlose Eigenwerbung :D).

Nach 51 Jahren ist damit eine der drei Ursachen weggefallen und eine vierte
dazugekommen. Für die Runde mit den sechs Wochen und dem Vorschlag von oben
rechnet sich das genauso wie 1975.

*(Der Großteil der Zahlen und Beispiele sind angepasste und basierend auf alten
Erfahrungen und habe nichts mit aktuellen Ereignissen zu tun)*
