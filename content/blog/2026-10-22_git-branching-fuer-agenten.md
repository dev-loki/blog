+++
title = "Brauchen Agenten ein neues Git-Branching-Modell?"
date = "2026-10-22T09:00:00Z"
description = "OneFlow ist seit Jahren mein Branching-Modell der Wahl. Jetzt arbeiten mehrere Agenten parallel im selben Repo. Was davon noch trägt, was sich ändert, und was am meisten bringt für den wenigsten Aufwand."
[taxonomies]
tags = ["git", "ki", "tooling"]
+++

Ich mag
[OneFlow](https://www.endoflineblog.com/oneflow-a-git-branching-model-and-workflow).
Adam Ruka hat das Modell 2017 als Gegenentwurf zu GitFlow aufgeschrieben, und
kurz darauf ist es das geworden, was ich empfehle, wenn mich jemand
nach Git Branching fragt (naja manchmal auch einfach so). Ein langlebiger
Branch, kurze Branches drumherum, Releases als Tags. Fertig. Also **deutlich**
unkomplexer als GitFlow.

Nur sieht mein Alltag inzwischen anders aus als 2017. Oft laufen mehrere
Agenten gleichzeitig, jeder in seinem eigenen Worktree (die meisten kriegen das
nicht einmal mit), jeder auf seinem eigenen Branch mit `claude-` Präfix oder
ähnlichem. Nachmittags liegen dann Branches im Repo, die ich nie selbst
angelegt habe, und ein paar PRs, die alle gleichzeitig nach `main` wollen.

Brauchen wir dafür ein neues Modell? Oder reicht OneFlow, nur schneller
gedreht? Und was davon bringt am meisten, ohne dass ich ein Wochenende in
Tooling versenke? Oder noch besser: drei Wochen lang ein neues Modell einführe, und
ein halbes Jahr später ändert sich wieder alles?

Ich glaube, das Modell selbst kann bleiben. Die Branches werden kleiner und
leben nur noch ein paar Stunden (im Vergleich zu Tagen früher), und am Ende
muss (noch?) ein Mensch entscheiden, ob sie zurück auf den Default-Branch dürfen.


## OneFlow in 60 Sekunden

Nur kurz als Refresher. Für Details gerne oben auf den Link von OneFlow
klicken.

- Es gibt genau einen langlebigen Branch, meist `main`. Dort entsteht die
  Historie.
- Feature-Branches zweigen von `main` ab und werden nach dem Merge gelöscht.
- Releases sind Tags. Release-Branches sind temporär und gibt es nur, wenn ein
  Release Stabilisierung braucht (QA, Code Freeze), danach verschwinden sie
  wieder.
- Hotfixes zweigen vom letzten Release-Tag ab.

Für Features empfiehlt Ruka Rebase plus Fast-Forward, damit die Historie
linear bleibt. Zwei Fälle nimmt er selbst aus: Projekte, die mehrere
inkompatible Versionen parallel pflegen, und Continuous Deployment, wo der
Release-Prozess ganz anders aussieht.

Funfact: Vincent Driessen, der GitFlow erfunden hat, sieht das inzwischen
ähnlich. Seit 2020 steht über
[seinem Artikel](https://nvie.com/posts/a-successful-git-branching-model/)
eine Notiz, dass Teams mit Continuous Delivery lieber etwas Einfacheres nehmen
sollen.


## Was sich durch Superintelligenz (lol :D) ändert

### Viel mehr Branches, viel kürzer

Agenten arbeiten in Worktrees. Claude Code macht das mit
`claude --worktree <name>` von selbst: neues Verzeichnis unter
`.claude/worktrees/`, neuer Branch `worktree-<name>`, abgezweigt vom
Default-Branch auf dem Remote. Subagents bekommen mit `isolation: worktree`
jeweils einen eigenen. Was `git worktree` überhaupt ist, habe ich
[2021 schon mal aufgeschrieben](@/blog/2021-11-25_advanced_git-worktree.md),
damals noch für Menschen.

Ein Branch lebt damit nur noch so lange wie die eine Aufgabe, für die er
angelegt wurde. Verrennt sich der Agent, ist der Branch in zehn Minuten
inklusive Änderungen neu aufgesetzt, und das geht meistens schneller, als
seinen Murks zu debuggen.

Paul Hammant gibt kurzen Feature-Branches auf
[trunkbaseddevelopment.com](https://trunkbaseddevelopment.com/short-lived-feature-branches/)
höchstens ein paar Tage, die Wartezeit aufs Review eingerechnet. Er zählt
inzwischen übrigens ausdrücklich die Coding-Agenten des Entwicklers zu denen,
die auf so einem Branch arbeiten dürfen.


### Mehr Konflikte, und am meisten macht die Größe zu schaffen

Die beste Zahl dazu kommt aus
[AgenticFlict](https://arxiv.org/abs/2604.03551) (Ogenrwot und Businge,
AIware 2026). Die beiden haben im Rahmen dieser Studie über 142.000 PRs von
Coding-Agenten aus mehr als 59.000 Repos gesammelt und gut 107.000 davon
testweise gemergt. Bei 27,7 % gab es Konflikte. Je nach Agent zwischen 15 %
(Copilot) und 32 % (Codex), Claude Code lag bei 26 %, allerdings mit nur 779
PRs, also mit wenig Evidenz.

Spannender als der Agentenvergleich finde ich die Größe. Vor allem auch, weil
wir daraus lernen können:

PRs mit rund zwei geänderten Zeilen hatten zu etwa 10 % Konflikte, ab etwa 25
Zeilen waren es schon fast 30 %. Darüber pendelt sich die Rate bei 32 bis 33 %
ein.

Das passt zum
[AI Capabilities Model](https://cloud.google.com/blog/products/ai-machine-learning/introducing-doras-inaugural-ai-capabilities-model)
aus dem DORA-Report 2025. Von den sieben Fähigkeiten, die dort darüber
entscheiden, ob KI einem Team hilft oder schadet, sind zwei "strong version
control practices" und "working in small batches". Teams, die oft committen
und Rollbacks auch nutzen, profitieren laut DORA mehr von KI.

### Der gefährliche Konflikt ist der, den Git nicht sieht

Textkonflikte nerven, aber Git meldet sie wenigstens. Schlimmer ist es, wenn
zwei Agenten verschiedene Dateien ändern, beide Branches grün sind und
`main` nach dem zweiten Merge trotzdem rot ist. Agent A benennt einen Parameter
um, Agent B ruft die Funktion noch mit dem alten Namen auf.

Genau das untersucht
["Passes Alone, Fails Together"](https://arxiv.org/abs/2609.25396) (Xia, Wu,
Park, September 2026). Bei konstruierten Aufgaben, in denen zwei Agenten an
denselben Django-Helfern arbeiten, ging das in 97 % der Läufe schief. Eine
einzige Nachricht an den zweiten Agenten, was der erste schon geändert hat,
rettete 82 % davon.

Bei echten PR-Paaren aus Django trat das Problem allerdings nur in einem von
834 Läufen auf, und die Autoren warnen selbst davor, die 97 % als Alltagswert
zu lesen. Die Aufgaben waren schließlich extra so gebaut, dass beide Agenten an
denselben Helfern herumschrauben. Im Alltag ist das also selten. Fassen zwei
Agenten aber dieselbe Schnittstelle an, kann es leicht passieren, und dann
würde ich sie nicht blind parallel laufen lassen.

### Zusammenführen bleibt Handarbeit

Agenten zu starten ist inzwischen trivial, kein "Beweis" benötigt :D. Die
Arbeit wieder zusammenführen muss ich aber immer noch selbst. Die
Claude-Code-Doku beschreibt Worktrees als Isolation für Datei-Änderungen. Was
danach mit dem Branch passiert, ist mein Job. Natürlich ist KI ein hilfreiches
Tool dabei, aber gerade echte Logik-Konflikte müssen noch von einem Menschen
behoben werden.

Beim Review, über das ich [neulich geschrieben
habe](@/blog/2026-10-20_ki-code-review.md), war es ähnlich. Seit die Agenten
tippen, ist das Lesen der Engpass. Mit den Branches ist es dasselbe Spiel, nur
eine Stufe später im Prozess, beim Merge.


## Und Scion?

[Scion](https://github.com/GoogleCloudPlatform/scion) kommt von Google. Ich
hatte es erst bei Anthropic einsortiert. Ein experimenteller Orchestrator,
seit April 2026 Open Source, pre-1.0 und laut README ausdrücklich kein
offiziell unterstütztes Google-Produkt.

Die Idee: Jeder Agent (Claude Code, Gemini CLI, Codex, OpenCode) läuft in
einem eigenen Container, mit eigenem Worktree und eigenen Zugangsdaten. Die
Agenten koordinieren sich über die Scion-CLI und schicken sich gegenseitig
Nachrichten. Menschen schauen über eine Web-UI oder per Slack, Teams und Co.
zu.

Gelernt habe ich daraus vor allem, wie wenig ein Worktree isoliert. Ports,
Datenbank, Docker-Volumes und Caches teilen sich alle Agenten auf meinem
Rechner trotzdem, getrennt sind nur die Dateien. Scion steckt deshalb jeden
Agenten in einen Container mit eigenen Credentials, und gerade der zweite Teil
gefällt mir. Ein Agent, der Tippfehler in der Doku fixt, braucht keinen
Deploy-Token.

Wie die Arbeit am Ende zusammenkommt, regelt allerdings auch Scion nicht. Zu
Branch-Namen, Merge-Strategie oder PRs habe ich im README nichts gefunden. Das
Branching-Modell muss ich also so oder so selbst mitbringen.

Brauche ich Scion? Gerade nicht. Das lohnt sich, wenn viele Agenten lange
laufen, auf mehreren Maschinen und mit unterschiedlichen Rechten. Für eine
Handvoll Agenten auf meinem Laptop reichen Worktrees.


## Mein Vorschlag: OneFlow, schneller gedreht

<figure class="diagram">
<svg viewBox="0 0 640 270" width="100 %" role="img" aria-labelledby="flow-title" xmlns="http://www.w3.org/2000/svg" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" fill="currentColor">
<title id="flow-title">Ein langlebiger main-Branch. Zwei Agenten-Branches laufen parallel und kommen per Squash-Merge zurück. Ein dritter wird verworfen und neu gestartet. Release als Tag v1.4.0, Hotfix vom Tag als v1.4.1.</title>
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
<text x="270" y="105" opacity="0.7">verworfen</text>
<text x="375" y="105">PROJ-15</text>
<text x="555" y="198">main</text>
<text x="385" y="198">v1.4.0</text>
<text x="465" y="258">hotfix</text>
<text x="525" y="248">v1.4.1</text>
</g>
</svg>
</figure>

1. **Ein langlebiger Branch, und der ist immer grün.** Wie bei OneFlow. Neu
   ist, wie teuer ein roter `main` geworden ist. Jeder neue Agent zweigt vom
   aktuellen `main` ab, bei Claude Code ist das der Default. Ist der kaputt,
   starten alle Agenten auf einem kaputten Stand und verbrennen Tokens mit
   Fehlern, die nicht ihre sind.
2. **Eine Aufgabe, ein Branch, ein Worktree, ein PR.** Die Ticket-Nummer
   gehört in den Branch-Namen (`agent/PROJ-123-retry-logik`), damit ich in drei
   Wochen noch weiß, wo er herkam. Lebensdauer: Stunden, höchstens ein
   Arbeitstag. Läuft ein Agent in die falsche Richtung, lösche ich den Branch
   und starte neu, mit einem besseren Ticket.
3. **Klein schneiden.** Was nicht in einen kleinen PR passt, wird ein Stack.
   GitHub hat
   [Stacked PRs](https://github.blog/changelog/2026-10-06-stacked-pull-requests-generally-available/)
   seit dem 6. Oktober 2026 allgemein verfügbar, `gh stack` kann Worktrees,
   und ein Stack geht als eine Gruppe durch die Merge Queue. Unfertiges kommt
   hinter ein Feature-Flag. Einen langlebigen Feature-Branch gibt es nicht.
4. **Squash-Merge.** Hier weiche ich von Ruka ab. Er räumt vor dem Merge per
   interaktivem Rebase auf. Bei fünf Commits von einem Menschen geht das. Die
   Dutzenden WIP-Commits eines Agenten räumt niemand von Hand auf, und Squash
   macht dasselbe automatisch: ein PR, ein Commit auf `main`, ein `git revert`,
   wenn es schiefgeht. Rukas eigener Kritikpunkt an Rebase (ein Feature
   zurückdrehen heißt mehrere Commits zurückdrehen) ist damit auch erledigt. In
   die Commit-Nachricht kommen die Ticket-Nummer und ein `Assisted-by`-Trailer.
5. **Merge Queue, sobald mehrere Agenten parallel PRs aufmachen.** Die Queue
   testet jeden PR gegen `main` plus alle PRs, die vor ihm drankommen. Genau
   das fängt die Konflikte, die Git nicht sieht. Bei GitHub ist das eine
   Branch-Regel (je nach Plan), bei GitLab heißt es Merge Train.
6. **Teilen sich zwei Aufgaben eine Schnittstelle, laufen sie nacheinander.**
   Oder der zweite Agent bekommt gesagt, was der erste geändert hat. Bei der
   Django-Studie oben hat genau dieser eine Satz 82 % der kaputten Läufe
   gerettet.
7. **Agenten mergen nicht und taggen nicht.** Branch Protection auf `main`,
   Änderungen nur per PR, gemergt wird von einem Menschen. Releases bleiben wie
   bei OneFlow: Tag auf `main`, Release-Branch nur bei Bedarf, Hotfix vom Tag.

## Was bringt am meisten für den wenigsten Aufwand?

Meine Einschätzung, grob in der Reihenfolge, in der ich es einführen würde:

| Maßnahme | Aufwand | Nutzen | Ab wann |
|---|---|---|---|
| `main` geschützt, Pflicht-CI | etwa eine Stunde | sehr hoch | sofort |
| Worktree pro Agent | ein Flag | hoch | sofort |
| Kleine PRs, Squash-Merge | eine Repo-Einstellung, plus Disziplin | hoch | sofort |
| Ticket im Branch, `Assisted-by` im Commit | keiner | mittel | sofort |
| Merge Queue | eine Einstellung, Merges dauern länger | hoch | mehrere parallele Agenten-PRs am Tag |
| Stacked PRs | neue Gewohnheit | mittel | Features, die nicht in einen PR passen |
| Container pro Agent (Scion und Co.) | Tage | hoch bei Credentials | viele Agenten, mehrere Maschinen, unterschiedliche Rechte |

Die ersten vier Zeilen kosten zusammen einen Nachmittag. Danach würde ich
erstmal zwei Wochen messen, bevor ich irgendetwas aus den unteren Zeilen
anfasse.

## Was ich bewusst weglasse

- **Der `develop`-Branch.** Rukas Variante mit `develop` als Arbeitsbranch und
  `master` als Zeiger aufs letzte Release ist für Open-Source-Projekte gedacht.
  Für Agenten ist ein zweiter langlebiger Branch vor allem ein zweiter Ort, von
  dem sie falsch abzweigen können.
- **Release-Branches als Standard.** Bei Web-Apps mit Continuous Deployment
  reicht ein Tag.
- **jj.** [Jujutsu](https://github.com/jj-vcs/jj) behandelt Konflikte als
  normale Daten, die man committen und später lösen kann, und hat ein Undo für
  jede Operation. Klingt für Agenten ideal. Ich habe es noch nicht ernsthaft
  ausprobiert, und solange Git mit Worktrees reicht, ist mir der Umstieg zu
  teuer.
- **Agenten-Sessions im Repo.** [Entire](https://docs.entire.io/core-concepts),
  die Firma vom ehemaligen GitHub-CEO Thomas Dohmke, hängt Agenten-Sessions per
  `Entire-Checkpoint`-Trailer an Commits und legt die Metadaten auf einem
  eigenen Branch ab. Spannend, wenn Nachvollziehbarkeit Pflicht ist. Mir reicht
  vorerst ein Link zur Session in der PR-Beschreibung.


## Fazit

Brauchen Agenten ein neues Branching-Modell? Ich glaube nicht. An OneFlow halte
ich fest: `main` ist der Branch, auf den es ankommt, und alles andere darf
verschwinden, sobald seine Aufgabe erledigt ist. Mit Agenten passiert das halt
deutlich öfter.

Neue Branches kosten mich heute fast nichts. Jeden einzelnen davon wieder nach
`main` zu bringen, kostet dagegen noch genauso viel Zeit wie früher, und es
sind viel mehr geworden. Deshalb drehen sich fast alle Regeln oben ums
Zusammenführen und darum, dass am Ende ein Mensch auf Merge klickt.


## Quellen (Auswahl)

- Adam Ruka,
  [*OneFlow: a Git branching model and workflow*](https://www.endoflineblog.com/oneflow-a-git-branching-model-and-workflow),
  2017
- Vincent Driessen,
  [*A successful Git branching model*](https://nvie.com/posts/a-successful-git-branching-model/),
  mit Notiz von 2020
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
  6. Oktober 2026
