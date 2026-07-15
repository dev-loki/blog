+++
title = "Moderne Werkzeuge Teil 2: Einheitliches Linting und Formatting mit ruff"
date = "2026-07-14T10:00:00Z"
description = "Black, Flake8, Isort und pyupgrade ersetzt durch ein einziges Rust-Binary, inklusive einer Opt-out-Strategie mit select = [\"ALL\"]."
draft = true
[taxonomies]
tags = ["tooling", "python", "clean-code"]
+++

Nachdem wir in [Teil 1](@/blog/2026-07-14_modern-tooling-part-1-uv.md) das
Paketmanagement mit `uv` aufgeräumt haben, widmen wir uns in **Teil 2** der
Code-Qualität: **`ruff`**.

### Das Problem: Toolchain-Suppe

Code-Qualität in Python bedeutete lange, vier bis fünf Tools hintereinander zu
schalten: Black für das Formatting, Isort für die Import-Sortierung, Flake8
für das Linting (plus ein Dutzend Flake8-Plugins), pyupgrade für moderne
Syntax und Bandit für Sicherheitschecks. Jedes Tool brachte eine eigene
Konfigurationsdatei, eine eigene Version und eigene Konflikte mit: Black und
Isort mussten z. B. explizit aufeinander abgestimmt werden, damit sie sich
nicht gegenseitig die Imports umformatierten.

Und es war langsam. Auf mittleren Codebasen liefen diese Checks sekunden- bis
minutenlang, zu langsam, um sie bei jedem Speichern oder Commit auszuführen.
Die Folge: Sie liefen nur in der CI, und Fehler fielen erst nach dem Push auf.

### Die Lösung: ruff

`ruff` ist Linter **und** Formatter in einem Rust-Binary. Es implementiert die
Regeln von Flake8 (inklusive der populären Plugins), Isort, pyupgrade und
großen Teilen von Bandit, und formatiert Black-kompatibel. Die Laufzeit liegt
selbst auf großen Codebasen im Millisekundenbereich, was einen entscheidenden
Unterschied macht: Checks, die instant sind, laufen bei jedem Speichern im
Editor, bei jedem Commit und in der CI. Checks, die Sekunden dauern, laufen
irgendwann nur noch in der CI.

Die beiden Befehle, die du brauchst:

```bash
# Linting-Fehler finden und automatisch beheben, wo möglich
uv run ruff check --fix .

# Die Codebasis formatieren
uv run ruff format .
```

In der CI drehen wir den Spieß um, dort wird nichts repariert, sondern nur
geprüft:

```yaml
- name: Formatting Check (Ruff)
  run: uv run ruff format --check .

- name: Linting Check (Ruff)
  run: uv run ruff check .
```

### Unsere Konfiguration: Opt-out statt Opt-in

Die meisten Projekte aktivieren eine Handvoll Regelgruppen und ergänzen nach
und nach. Unser Template geht den umgekehrten Weg: **alle** Regeln an, und
jede Ausnahme muss begründet werden. Das zwingt dazu, sich bei jedem `ignore`
bewusst zu entscheiden, und dokumentiert die Entscheidung gleich mit:

```toml
[tool.ruff.lint]
# Wir wollen strikt sein und nur bewusst abwählen!
select = [ "ALL" ]
fixable = [ "ALL" ]

ignore = [
  # strict
  "D102",    # würde Docstrings für jede öffentliche Methode erzwingen
  "D203",    # inkompatibel zu D211 (kein Leerzeile vor Klassen-Docstring)
  "EM101",   # würde erzwingen, Exception-Texte erst in Variablen zu speichern

  # inkompatibel mit "ruff format"
  "COM812",

  # temporär
  "TC003",   # würde TYPE_CHECKING-Blöcke erzwingen, noch nicht ausgereift
]
```

Der Kommentar hinter jeder Regel ist kein Nice-to-have, sondern der Kern der
Strategie: In einem Jahr weiß niemand mehr, warum `COM812` aus ist, außer es
steht daneben.

### Per-File-Ignores: Tests sind anders

Regeln, die im Produktivcode sinnvoll sind, sind in Tests oft Lärm. `assert`
ist in Tests der Normalfall (im Produktivcode verbietet ihn die
Bandit-Regel `S101`), und "Magic Numbers" in einem Testfall sind schlicht die
Testdaten:

```toml
[tool.ruff.lint.per-file-ignores]
"tests/*" = [
    "ANN201",   # Rückgabe-Annotationen für Testfunktionen: unnötig
    "PLR2004",  # Magic Values in Vergleichen: das SIND die Testdaten
    "S101",     # assert ist in pytest der Standard
]
```

### Import-Sortierung inklusive

Isort ist als Regelgruppe `I` gleich mit an Bord. Damit die Sortierung auch in
Grenzfällen deterministisch bleibt, deklarieren wir explizit, was third-party
und was unser eigener Code ist:

```toml
[tool.ruff.lint.isort]
known-third-party = ["fastapi", "pydantic", "starlette"]
known-local-folder = ["app"]
```

### Fazit

`ruff` ersetzt vier Konfigurationsdateien durch einen Block in der
`pyproject.toml` und macht Linting so schnell, dass es keine Ausrede mehr
gibt, es nicht überall laufen zu lassen. Die Opt-out-Strategie mit
`select = ["ALL"]` ist dabei bewusst radikal: Sie kostet beim Aufsetzen etwas
Zeit, liefert dafür aber ein Regelwerk, in dem jede Ausnahme ein
dokumentierter Entschluss ist statt ein historischer Zufall.

---
**Wie es weitergeht:** In [Teil 3: Die Zukunft des Type Checkings mit ty](@/blog/2026-07-14_modern-tooling-part-3-ty.md) erkunden wir den nächsten Schritt im Bereich Strict Typing. Den Anfang verpasst? Gehe zurück zu [Teil 1 (uv)](@/blog/2026-07-14_modern-tooling-part-1-uv.md) oder schaue dir [Teil 4 (prek)](@/blog/2026-07-14_modern-tooling-part-4-prek.md) an.
