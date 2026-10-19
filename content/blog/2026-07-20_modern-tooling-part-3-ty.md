+++
title = "Moderne Werkzeuge Teil 3: Die Zukunft des Type Checkings mit ty"
date = "2026-07-20T07:32:00Z"
description = "Astrals Type Checker ty im Praxiseinsatz: Warum Geschwindigkeit über Typdisziplin entscheidet, und wo der Early-Adopter-Preis liegt."
draft = false
[taxonomies]
tags = ["tooling", "python"]
+++

Bisher habe ich in dieser Serie das Paketmanagement mit `uv`
([Teil 1](@/blog/2026-07-15_modern-tooling-part-1-uv.md)) und das Linting mit
`ruff` ([Teil 2](@/blog/2026-07-16_modern-tooling-part-2-ruff.md)) optimiert.
In **Teil 3** kommt der anspruchsvollste Teil der statischen Analyse: das
Type Checking.


### Warum Type Checking?

So richtig in Kontakt mit Typechecking bin ich damals über phpstan/psalm in PHP
gekommen. Das fühlte sich an, als käme die Validierung, die ich aus anderen
Sprachen kannte, endlich auch in den Scriptsprachen an. JA: Es ist etwas mehr
Arbeit, und natürlich sind Arrays (PHP) bzw. Listen nicht mehr ganz so flexibel.
Einfach alles reinschmeißen ist aber ohnehin keine gute Idee. Für mich haben
Typechecker also sinnvolles Verhalten erzwungen.

Der Hauptgrund für mich ist aber, dass Typechecker in Scriptsprachen einfach
komplette Kategorien an Fehlern auslöschen. In Kombination mit Lintern sollte
man in Python extrem viel weniger (oder sogar gar keine) `None`-Fehler mehr
haben. Bei konsequentem Einsatz umgeht man viele Probleme, z. B. nicht
abgefangene logische Branches in `match`/`if-elif-else`-Kaskaden.

Und schließlich: Code Completion. Mit KI ist das natürlich weniger wichtig, aber
jede moderne IDE kann diese Typehints auswerten und damit sinnvolle Vorschläge
machen. Der Erfolg von FastAPI/pydantic beruht zum Teil genau darauf, dass die
DX (Developer Experience) so gut ist!

In meinem Template mit hexagonaler Architektur sind Typen sogar tragend: die
Ports sind als abstrakte, vollständig typisierte Interfaces definiert:

```python
class ItemRepository(ABC):
    @abstractmethod
    async def save(self, item: Item) -> Item: ...

    @abstractmethod
    async def by_id(self, item_id: UUID) -> Item | None: ...
```

Ein Type Checker stellt sicher, dass jeder Adapter diesen Vertrag exakt
erfüllt, und dass niemand vergisst, den `None`-Fall von `by_id` zu behandeln.

Der Haken war immer der Preis: `mypy` wird auf wachsenden
Codebasen spürbar langsam. Und ein Check, der 30 Sekunden dauert, wird lokal
nicht mehr ausgeführt, er wandert in die CI, und Typfehler fallen erst nach
dem Push auf. Genau das Feedback-Loop-Problem, das `ruff` fürs Linting gelöst
hat, existierte beim Type Checking weiter.


### ty

`ty` ist Astrals Antwort darauf: ein in Rust geschriebener, auf massive
Parallelität ausgelegter Type Checker, der sich direkt in die
`uv`/`ruff`-Toolchain einfügt. Der Check läuft so schnell, dass er problemlos
in jeden Pre-Commit-Hook passt:

```bash
uv run ty check
```

Ein typischer Fund sieht dann so aus: hier vergisst jemand, dass
`by_id` auch `None` liefern kann:

```python
item = await repository.by_id(item_id)
print(item.name)  # error: `name` on `Item | None`, `None` hat kein `name`
```

Zur Laufzeit wäre das ein `AttributeError` in Produktion. Mit `ty` ist es eine
rote Zeile, bevor der Commit überhaupt entsteht, je nach CI-Tooling sogar ein
verhinderter Commit oder Merge.


### Meine Typdisziplin

Wichtig zur Einordnung: Dass jede Funktion, Variable und Klasse vollständig
typisiert sein muss und `Any` die absolute Ausnahme bleibt, ist eine
**Projektregel** meines Templates. `ty` ist
das Werkzeug, das sie durchsetzbar macht, gemeinsam mit den `ANN`-Regeln von
`ruff`, [die fehlende Annotationen anmahnen](https://docs.astral.sh/ruff/rules/#flake8-annotations-ann).

Im Pre-Commit-Hook läuft der Check über die gesamte Codebasis:

```yaml
- id: ty
  name: ty-check
  entry: uv run ty check --verbose --output-format=full .
  language: system
  types: [python]
  pass_filenames: false
```

`pass_filenames: false` ist hier bewusst gesetzt: Type Checking ergibt nur
über das ganze Projekt Sinn, denn eine Änderung in Datei A kann einen
Typfehler in Datei B auslösen. Dank der Geschwindigkeit von `ty` kann ich mir
den Voll-Check bei jedem Commit leisten. Nice :).


### Im Editor

`ty` bringt neben dem CLI auch einen eigenen Language Server
mit: Autocompletion, Hover, Go-to-Definition und Auto-Imports, alles in
`ty`-Geschwindigkeit.

**VS Code:** Es gibt eine offizielle
[ty-Extension](https://docs.astral.sh/ty/editors/) von Astral. Sie schaltet den
Language Server der Python-Extension automatisch ab (setzt
`python.languageServer` auf `None`), damit nicht zwei Language Server
gleichzeitig laufen.

**PyCharm:** Ab Version 2025.3 ist `ty` direkt eingebaut. Unter
*Settings → Python | Tools → ty* die Checkbox *Enable* setzen. PyCharm findet die
im Interpreter installierte `ty`-Version dann selbst.

Darunter steckt immer derselbe Language Server, den man auch manuell starten
kann (`uv run ty server`), z. B. für Neovim.


### Einschränkungen

`ty` ist jung. Mein Template pinnt es auf `ty==0.*`: die Null vor dem Punkt ist
im Open-Source-Umfeld nicht immer aussagekräftig. Hier stimmt sie aber durchaus,
`ty` ist bis Version `0.0.61` offiziell noch eine Beta. Meiner Meinung nach
(sehr subjektiv!) ist es aber bereits production ready, der Speed-Vorteil ist es
mir einfach wert.

In meinen Architecture Decision Records markiere ich die Einführung trotzdem als
*Experimental*: Ich evaluiere `ty` als primären Type Checker und beobachte, wie
schnell es bei komplexeren Typing-PEPs (Generics, `ParamSpec`, Overloads) zu
`mypy`/`pyright` aufschließt.

Für ein Template und Greenfield-Projekte ist das Risiko überschaubar, die
Typkonstrukte sind dort selten exotisch. Wer eine große Bestands-Codebasis mit
ausgefeilten `mypy`-Plugin-Setups hat, sollte den Wechsel dagegen bewusst
abwägen: `mypy` ist bei der Regelabdeckung aktuell noch ausgefeilter.


### Fazit

Der eigentliche Gewinn von `ty` ist ein Type Checker, der flott läuft: lokal,
bei jedem Commit, ohne dass man warten muss. Typdisziplin hält man nur durch,
wenn das Feedback schnell kommt.

---

**Die Serie:**
* [Teil 1: uv](@/blog/2026-07-15_modern-tooling-part-1-uv.md)
* [Teil 2: ruff](@/blog/2026-07-16_modern-tooling-part-2-ruff.md)
* Teil 3: ty (dieser Teil)
* [Teil 4: prek](@/blog/2026-07-20_modern-tooling-part-4-prek.md)
* [Teil 5: Korsett für KI-Agenten (Bonus)](@/blog/2026-07-27_modern-tooling-part-5-ai-harness.md)
