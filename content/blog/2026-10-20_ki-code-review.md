+++
title = "Wer reviewt eigentlich den Code, den die KI schreibt?"
date = "2026-10-20T09:00:00Z"
updated = "2026-10-20T14:00:00Z"
description = "Agenten schreiben inzwischen einen großen Teil unseres Codes. Was die Studien von 2025 und 2026 über Review, Wissen und Sicherheit sagen, und wie ich Pull Requests jetzt aufbauen würde."
[taxonomies]
tags = ["ki", "clean-code"]
+++

Bei uns schreiben Agenten inzwischen einen ordentlichen Teil des neuen Codes.
Das geht schnell. Sehr schnell. Und wir machen das, obwohl (oder gerade weil?)
wir erfahrene Entwickler mit teils 15+ Jahren in der Industrie sind.

Das Problem kommt danach, beim Pull Request. Der geht entweder nicht schnell,
oder er ist nicht gründlich genug, oder es fehlt schlicht das Verständnis. Ich
saß zuletzt öfter vor einem Diff mit 900 Zeilen, den niemand im Team selbst
getippt hatte, und habe mich gefragt: Wer versteht das hier eigentlich gerade?
Ehrlich gesagt: Ich nicht mehr. Und weil ich nicht so das passive
Team-Mitglied bin, musste eine Lösung her :D

![Comic in drei Bildern. Entwickler: "Claude, who wrote this 900-line pull request?" Roboter: "I did!" Roboter: "I also wrote the tests, ran the tests, and reviewed it. Everything is green!" Entwickler: "Great. So who actually understands it?" Roboter: "...Define 'understands', pal."](/blog/ki-code-review-comic.jpeg)

Wir haben aber nun mal 2026. Also habe ich drei KIs (Claude, ChatGPT, Gemini
Argon) unabhängig voneinander recherchieren lassen, meine eigenen Erfahrungen
dazugepackt, alles zusammengeworfen und die strittigen Zahlen in den
Originalquellen nachgelesen. Schöne neue Welt...

Hier die Kurzfassung.

## Die Arbeit hat sich verschoben

Wir schreiben mehr Code, liefern aber kaum mehr aus. Der DORA-Report 2025
(rund 5.000 Befragte) sieht mit KI mehr Durchsatz und gleichzeitig mehr
Instabilität. DORA nennt den Mehraufwand fürs Prüfen "verification tax".
Telemetrie von Faros AI (über 10.000 Entwickler, Herstellerdaten, also mit
Vorsicht genießen) zeigt den Mechanismus: 98 % mehr gemergte PRs, PRs 154 %
größer, Review-Zeit plus 91 %, auf Firmenebene kein Gewinn.

Dabei ist der DORA-Report von 2025, und allein in den letzten sechs Monaten
haben wir mit Opus 5, Fable & Co. riesige Sprünge gemacht. Ich vermute
allerdings, dass sich die Schere seitdem eher weiter geöffnet hat. Die
Agenten schreiben schneller, gelesen wird immer noch im selben Tempo.

Der Flaschenhals ist also vom Tippen zum Lesen gewandert.

Dass ich damit nicht allein bin, zeigt gerade ein
[Ask HN mit Hunderten Kommentaren](https://news.ycombinator.com/item?id=50151036) zur Frage, wie man mit KI-Code
umgeht, den man selbst nicht versteht. Auslöser war ein Meta-Engineer, dem
sein eigener Code inzwischen wie eine Blackbox vorkommt. Ein Senior-Entwickler
mit zehn Jahren Erfahrung schreibt dort, dass bei Tausenden geänderten Zeilen
pro Woche niemand mehr ernsthaft reviewen kann, und fasst den eigenen Alltag so
zusammen:

> "I just approve PRs, because I have to."

Genau da will ich nicht landen. Die Antwort ganz oben im Thread ist übrigens
ziemlich genau meine Station 1 weiter unten: Das Design macht der Mensch, der
Agent füllt nur die Lücken.

## Drei Sorgen, die ich habe

**1. Wir verlieren das Verständnis für unseren eigenen Code.** Peter Naur hat
1985 in
[Programming as Theory Building](https://pages.cs.wisc.edu/~remzi/Naur.pdf)
geschrieben, ein Programm sei eine Theorie im Kopf des Teams: warum es so
gebaut ist und wie es auf Änderungen reagiert. Diese Theorie entstand früher
nebenbei, beim Schreiben. Wenn ein Agent plant, schreibt und testet, fällt das
weg. In einer randomisierten Studie von Anthropic (52 Entwickler, Januar 2026)
schnitt die KI-Gruppe beim Verständnis 17 % schlechter ab. Spannend ist der
Unterschied innerhalb der Gruppe: Wer sich von der KI Dinge erklären ließ,
landete bei 65 bis 86 %. Wer einfach delegierte, bei 24 bis 39 %. Dafür gibt es
inzwischen sogar einen Namen:
["comprehension debt"](https://arxiv.org/abs/2607.10856), also Code, den das
Team akzeptiert hat, bevor ihn jemand erklären kann.

**2. Sicherheit.** Veracode hat über 100 Modelle getestet: Ohne
Sicherheitshinweise im Prompt enthielten 45 % der Beispiele eine bekannte
Schwachstelle, und das wurde über die Modellgenerationen nicht besser. Dazu
kommt ein schöner neuer Angriff: Knapp 20 % der von KIs vorgeschlagenen Pakete
existieren gar nicht, und viele der erfundenen Namen tauchen bei jedem Lauf
wieder auf. Angreifer registrieren die einfach vorab ("slopsquatting"). Und im
April 2026 wurde gezeigt, dass Prompt Injection in PR-Titeln und Kommentaren
mehrere KI-Review-Bots dazu bringt, CI-Secrets auszuplaudern.

Wie das im Großen aussieht, kann man sich übrigens öffentlich anschauen. Der
[Issue-Tracker von Claude Code](https://github.com/anthropics/claude-code/issues)
(CLI und Desktop-App), einem Projekt, das zu einem großen Teil von seinem
eigenen Agenten geschrieben wird, hat Stand heute rund 14.700 offene Issues
bei etwa 86.000 geschlossenen. Gut jedes siebte Issue ist also noch offen.
[curl](https://github.com/curl/curl/issues), ganz oldschool von Menschen
gepflegt, liegt bei 15 offenen zu rund 5.600 geschlossenen. Das ist kein
sauberer Vergleich (Nutzerzahl, Alter, Release-Takt sind völlig
verschieden), aber es passt schon sehr gut zu meinem Bauchgefühl.

**3. Verantwortung.** Die KI hilft beim Review, aber nicht besonders gut. Auf
[SWR-Bench](https://arxiv.org/abs/2509.01494) (1.000 echte PRs) kam das beste
Tool auf einen F1-Score von 19 %. Wichtig: Das Paper ist von September 2025,
getestet wurden also Modelle, die heute schon wieder zwei Generationen alt
sind. Die Zahl ist inzwischen sicher besser, aber von einem verlässlichen
Gate ist sie trotzdem weit weg. In einer
[Studie über 178 Repos](https://arxiv.org/abs/2508.18771) führten 1 bis 19 %
der KI-Kommentare zu einer Codeänderung, bei menschlichen Kommentaren waren es
60 %.

Der Linux-Kernel hat das 2026 sauber geregelt: Eine KI darf kein
`Signed-off-by` setzen, der Mensch, der einreicht, steht für alles gerade. Das
ist auch der einzige Weg, der funktioniert. Weder OpenAI noch Anthropic
übernehmen Verantwortung für den Code, den ihre Modelle generieren. Wer ihn
eincheckt, dem gehört er.

## Was ich daraus mache

Den Pull Request behalten, ihm aber einen neuen Job geben. Ein PR ist für mich
jetzt ein Paket, das ein Mensch prüfen kann: Was soll passieren, woran sehe
ich, dass es funktioniert, wo ist das Risiko, und wer steht dafür gerade.

Und ein PR muss wieder Verständnis erzeugen, so wie früher nebenbei beim
Schreiben. Das passiert nur, wenn der menschliche Autor die Arbeit der KI
selbst durchgeht und redigiert, bevor jemand anders draufschaut. Wer den PR
einfach weiterreicht, schiebt das Verstehen nur zum Reviewer, und der hat
genauso wenig Kontext.

Dafür fünf Stationen:

<figure class="diagram">
<svg viewBox="0 0 640 400" width="100%" role="img" aria-labelledby="gates-title" xmlns="http://www.w3.org/2000/svg" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" fill="currentColor">
<title id="gates-title">Fünf Stationen eines PRs: Absicht, Selbstcheck des Autors, automatische Gates, KI-Review, Mensch reviewt und merged</title>
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
<text x="36" y="36">1 Absicht</text>
<text x="36" y="116">2 Selbstcheck Autor</text>
<text x="36" y="196">3 Automatische Gates</text>
<text x="36" y="276">4 KI-Review</text>
<text x="36" y="356">5 Mensch merged</text>
</g>
<g font-size="13" opacity="0.7">
<text x="36" y="56">Ticket mit Akzeptanzkriterien</text>
<text x="36" y="136">ganzen Diff lesen, selbst erklären</text>
<text x="36" y="216">Tests, Typen, SAST, Secrets, Pakete</text>
<text x="36" y="296">Sandbox, nur Kommentare</text>
<text x="36" y="376">Tiefe nach Risiko</text>
</g>
<g font-size="13">
<text x="460" y="44">Mensch</text>
<text x="460" y="124">Mensch</text>
<text x="460" y="204">Maschine</text>
<text x="460" y="284">Maschine</text>
<text x="460" y="364" font-weight="bold">Mensch, mit Namen</text>
</g>
</svg>
</figure>

1. **Absicht zuerst.** Bevor ein Agent loslegt, gibt es ein Ticket mit
   Akzeptanzkriterien, Invarianten und dem, was ausdrücklich *nicht*
   dazugehört. Sonst prüft eine KI am Ende den Code gegen sich selbst.
2. **Selbstcheck des Autors.** Ganzen Diff lesen, umbauen, was nicht passt.
   PR-Beschreibung in eigenen Worten. KI-Nutzung mit einem
   `Assisted-by`-Trailer markieren.
3. **Automatische Gates.** Tests, Typen, Linter, SAST, Secret-Scanning,
   Dependency-Checks (existiert das Paket überhaupt, wie alt ist es).
4. **KI-Review.** Läuft in einer Sandbox ohne Secrets, schreibt Kommentare,
   darf aber nichts freigeben.
5. **Mensch reviewt und merged.** Wie gründlich, hängt vom Risiko ab. Doku
   und Formatierung: ein Reviewer reicht. Auth, Krypto, personenbezogene
   Daten, CI/CD: Code-Owner oder Security-Review, ohne Ausnahme.

Dazu ein paar Regeln, die ich ziemlich ernst meine:

- Wer die wesentliche Logik seiner Änderung nicht erklären kann, bekommt den PR
  zurück. Egal, wer ihn geschrieben hat.
- Ein Approve heißt: "Ich könnte das warten." Er heißt nicht "Die CI war
  grün", und erst recht nicht "Die KI fand's gut".
- PRs bleiben klein. Google hält etwa 100 Zeilen für vernünftig und 1.000 für
  zu viel. Ich starte mit einer weichen Grenze bei rund 400 Zeilen.

## Mist rein, Mist raus

Ein Agent arbeitet nur so gut wie das Ticket, das er bekommt. Bei Menschen war
das übrigens nie anders. Neu ist, dass die meisten Modelle nicht von selbst
merken, wenn Informationen fehlen. Dürfen sie Rückfragen stellen, steigt die
Leistung laut [Ambig-SWE](https://arxiv.org/abs/2502.13069) um bis zu 74 %.

Ich schreibe selbst keine Tickets, aber so wünsche ich sie mir: geschrieben
für zwei Leser. Die Kollegin, die nächstes Jahr dazukommt, und einen Agenten,
der nichts außerhalb des Repos kennt.

Konkret heißt das: Module und Dateien nennen, auf die bestehende
Implementierung verweisen, der gefolgt werden soll, Qualitätsziele in Zahlen
fassen ("unter 16 ms", nicht "schnell") und dazuschreiben, wie man es prüft.

Und ganz wichtig: Entscheidungen gehören ins Ticket oder in ein ADR, sobald sie
fallen. Chat-Verläufe und Agenten-Sessions sind irgendwann weg, und die
Begründung gleich mit.

## Fazit

Ein Satz, der in keinem Post-Mortem als Antwort durchgeht: "Das hat die KI
geschrieben." Genauso wenig "Eine andere KI hat's reviewt." Die Werkzeuge
dürfen so viel schreiben, wie sie wollen. Verstehen und unterschreiben muss es
ein Mensch.

Ich habe das Vorgehen meinem Team vorgeschlagen, und wir probieren es
hoffentlich die nächsten Wochen aus. Mit Zahlen vorher und nachher:
Review-Zeit, PR-Größe, Fehler nach dem Merge und ob ein zweiter Entwickler
eine kritische Änderung erklären kann. Wenn es Ergebnisse gibt, schreibe ich
darüber.

## Quellen (Auswahl)

- DORA, *State of AI-assisted Software Development 2025*
- Anthropic, *How AI assistance impacts the formation of coding skills*, Januar 2026
- Comprehension-Debt-Studie, [arXiv:2607.10856](https://arxiv.org/abs/2607.10856), 2026
- Spracklen et al., *We Have a Package for You!*, USENIX Security 2025
- Zeng et al., SWR-Bench, [arXiv:2509.01494](https://arxiv.org/abs/2509.01494)
- Sun et al., *Does AI Code Review Lead to Code Changes?*,
  [arXiv:2508.18771](https://arxiv.org/abs/2508.18771)
- Vijayvargiya et al., Ambig-SWE, [arXiv:2502.13069](https://arxiv.org/abs/2502.13069)
- Naur, [*Programming as Theory Building*](https://pages.cs.wisc.edu/~remzi/Naur.pdf), 1985
- Linux-Kernel, `Documentation/process/coding-assistants.rst`
