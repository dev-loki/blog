+++
title = "Moderne Werkzeuge Teil 3: Die Zukunft des Type Checkings mit ty"
date = "2026-07-14T10:00:00Z"
description = "Astrals Type Checker ty im Praxiseinsatz: Warum Geschwindigkeit über Typdisziplin entscheidet, und wo der Early-Adopter-Preis liegt."
draft = true
[taxonomies]
tags = ["tooling", "python"]
+++

Bisher haben wir in dieser Serie das Paketmanagement mit `uv`
([Teil 1](@/blog/2026-07-15_modern-tooling-part-1-uv.md)) und das Linting mit
`ruff` ([Teil 2](@/blog/2026-07-16_modern-tooling-part-2-ruff.md)) optimiert.
In **Teil 3** kommt der anspruchsvollste Teil der statischen Analyse: das
Type Checking.

### Warum Type Checking, und warum es an der Geschwindigkeit scheitert

Type Hints sind in größeren Python-Codebasen längst Standard: Sie machen
Schnittstellen explizit, fangen ganze Fehlerklassen vor der Laufzeit ab und
sind die Grundlage dafür, dass IDE-Autocompletion und Refactorings verlässlich
funktionieren. In unserem Template mit Hexagonaler Architektur sind sie sogar
tragend: die Ports sind als abstrakte, vollständig typisierte Interfaces
definiert:

```python
class ItemRepository(ABC):
    @abstractmethod
    async def save(self, item: Item) -> Item: ...

    @abstractmethod
    async def by_id(self, item_id: UUID) -> Item | None: ...
```

Ein Type Checker stellt sicher, dass jeder Adapter diesen Vertrag exakt
erfüllt, und dass niemand vergisst, den `None`-Fall von `by_id` zu behandeln.

Das Problem war nie der Nutzen, sondern der Preis: `mypy` wird auf wachsenden
Codebasen spürbar langsam. Und ein Check, der 30 Sekunden dauert, wird lokal
nicht mehr ausgeführt, er wandert in die CI, und Typfehler fallen erst nach
dem Push auf. Genau das Feedback-Loop-Problem, das `ruff` fürs Linting gelöst
hat, existierte beim Type Checking weiter.

### ty: Type Checking in Astral-Geschwindigkeit

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
rote Zeile, bevor der Commit überhaupt entsteht.

### Unsere Typdisziplin

Wichtig zur Einordnung: Dass jede Funktion, Variable und Klasse vollständig
typisiert sein muss und `Any` die absolute Ausnahme bleibt, ist keine
Eigenschaft von `ty`, sondern eine **Projektregel** unseres Templates. `ty`
ist das Werkzeug, das sie durchsetzbar macht, gemeinsam mit den
`ANN`-Regeln von `ruff`, die fehlende Annotationen anmahnen. Im
Pre-Commit-Hook läuft der Check über die gesamte Codebasis:

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
Typfehler in Datei B auslösen. Dank der Geschwindigkeit von `ty` können wir
uns den Voll-Check bei jedem Commit leisten.

### Der ehrliche Teil: Early Adoption

`ty` ist jung. Unser Template pinnt es auf `ty==0.*`: die Null vor dem Punkt
ist eine Ansage. In unseren Architecture Decision Records ist die Einführung
entsprechend als *Experimental* markiert: Wir evaluieren `ty` als primären
Type Checker und beobachten, wie schnell es bei komplexeren
Typing-PEPs (Generics, `ParamSpec`, Overloads) zu `mypy`/`pyright`
aufschließt.

Für ein Template und Greenfield-Projekte ist das Risiko überschaubar, die
Typkonstrukte sind dort selten exotisch, und der Geschwindigkeitsgewinn zahlt
sofort ein. Wer eine große Bestands-Codebasis mit ausgefeilten
`mypy`-Plugin-Setups hat, fährt aktuell zweigleisig besser: `ty` lokal für das
schnelle Feedback, `mypy` in der CI als Absicherung, bis Feature-Parität
erreicht ist.

### Fazit

Der eigentliche Gewinn von `ty` ist nicht bessere Analyse, sondern ein Type
Checker, der **tatsächlich läuft**: lokal, bei jedem Commit, ohne dass jemand
auf ihn wartet. Typdisziplin hält man nur durch, wenn das Feedback schnell
kommt, und genau das liefert `ty`.

---
**Wie es weitergeht:** Im abschließenden Artikel, [Teil 4: Hochperformante Git Hooks mit prek](@/blog/2026-07-14_modern-tooling-part-4-prek.md), werden wir all diese Werkzeuge miteinander verknüpfen. Du kannst auch zu [Teil 1](@/blog/2026-07-15_modern-tooling-part-1-uv.md) oder [Teil 2](@/blog/2026-07-16_modern-tooling-part-2-ruff.md) zurückkehren.
