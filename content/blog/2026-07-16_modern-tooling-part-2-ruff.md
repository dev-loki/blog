+++
title = "Moderne Werkzeuge Teil 2: Einheitliches Linting und Formatting mit ruff"
date = "2026-07-16T17:14:00Z"
description = "Black, Flake8, Isort und pyupgrade ersetzt durch ein einziges Rust-Binary, inklusive einer Opt-out-Strategie mit select = [\"ALL\"]."
draft = false
[taxonomies]
tags = ["tooling", "python", "clean-code"]
+++

Nachdem ich in [Teil 1](@/blog/2026-07-15_modern-tooling-part-1-uv.md) das
Paketmanagement mit `uv` aufgeräumt habe, will ich mich heute in Teil 2 um
**ruff** kümmern.


### Toolchain-Suppe

"Code-Qualität" hieß lange, vier bis fünf Tools hintereinander zu
schalten:
- Black für das Formatting
- Isort für die Import-Sortierung
- Flake8 (oder pylint) für das Linting (plus ein Dutzend Plugins)
- pyupgrade für moderne Syntax
- und Bandit für Sicherheitschecks

Auch hier galt: Jedes Tool hat seine eigene Konfigurationsdatei, eine eigene
Version und eigene Konflikte mit: Black und Isort mussten z. B. explizit
aufeinander abgestimmt werden, damit sie sich nicht gegenseitig die Imports
umformatierten.

Und es war langsam. Auf mittleren Codebasen liefen diese Checks sekunden- bzw.
teilweise sogar minutenlang. Imho zu langsam, um sie bei jedem Speichern oder
Commit auszuführen. Ich hatte sie trotzdem immer aktiv, war dann meist schon
beim nächsten Problem und wurde prompt wieder rausgeworfen, weil es irgendein
Trivialproblem gab. Also mehr als einmal deaktiviert und am Ende vergessen, sie
nochmal auszuführen, nur um dann von einer roten CI-Pipeline genervt zu werden.


### ruff!

`ruff` ist Linter **und** Formatter in einem Rust-Binary. Es implementiert die
Regeln von Flake8 (inklusive der populären Plugins), Isort, pyupgrade und
großen Teilen von Bandit, und formatiert Black-kompatibel (mit minimalen
Abweichungen). Die Laufzeit liegt selbst auf großen Codebasen im
Millisekundenbereich, was einen entscheidenden Unterschied macht:

Checks, die instant sind, laufen bei jedem Speichern im Editor, bei jedem
Commit und in der CI. Checks, die Sekunden dauern, laufen irgendwann nur noch
in der CI. Zusammen mit `--fix` einfach geniales Tooling, das auch unabhängig
von der IDE funktioniert <3.

Die beiden Befehle, die du brauchst:

```bash
# Linting-Fehler finden und automatisch beheben, wo möglich
uv run ruff check --fix .

# Die Codebasis formatieren
uv run ruff format .
```

In der CI drehe ich den Spieß um, dort wird nichts repariert, sondern nur
geprüft:

```yaml
- name: Formatting Check (Ruff)
  run: uv run ruff format --check .

- name: Linting Check (Ruff)
  run: uv run ruff check .
```


### Meine Konfiguration: Opt-out statt Opt-in

Die meisten Projekte aktivieren eine Handvoll Regelgruppen und ergänzen nach
und nach. Mein Template geht den umgekehrten Weg: **alle** Regeln an, und
jede Ausnahme muss begründet werden. Das zwingt dazu, sich bei jedem `ignore`
bewusst zu entscheiden, und dokumentiert die Entscheidung gleich mit:

```toml
# Teil der pyproject.toml
[tool.ruff.lint]
# Ich will strikt sein und nur bewusst abwählen!
select = [ "ALL" ]
fixable = [ "ALL" ]

ignore = [
  # strict
  "D102",    # würde Docstrings für jede öffentliche Methode erzwingen
  "D203",    # inkompatibel zu D211 (kein Leerzeile vor Klassen-Docstring)
  "EM101",   # würde erzwingen, Exception-Texte erst in Variablen zu speichern

  # inkompatibel mit "ruff format"
  "COM812",

  # temporär - als Beispiel
  "TC003",   # würde TYPE_CHECKING-Blöcke erzwingen.
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
# Teil der pyproject.toml
[tool.ruff.lint.per-file-ignores]
"tests/*" = [
    "ANN201",   # Rückgabe-Annotationen für Testfunktionen: unnötig
    "PLR2004",  # Magic Values in Vergleichen: das SIND die Testdaten
    "S101",     # assert ist in pytest essentiell
]
```


### Import-Sortierung inklusive

Isort ist als Regelgruppe `I` gleich mit an Bord. Damit die Sortierung auch in
Grenzfällen deterministisch bleibt, deklariere ich explizit, was third-party
und was mein eigener Code ist:

```toml
[tool.ruff.lint.isort]
known-third-party = ["fastapi", "pydantic", "starlette"]
known-local-folder = ["app"]
```

Kurze Erinnerung: `isort` sorgt dafür, dass die Importblöcke grob in 3
Kategorien unterteilt sind:
1. "batteries included" Imports, z. B.: `from math import sqrt`
2. 3rd party Imports: `from fastapi import FastAPI`
3. Projektimports: `from my_project.domain import ImportantClass`

Innerhalb der Blöcke dann alphabetisch.


### Im Editor: Feedback beim Tippen

Der eigentliche Gewinn kommt, wenn `ruff` schon beim Tippen läuft und nicht erst
beim Commit.

**VS Code:** Die offizielle
[Ruff-Extension](https://marketplace.visualstudio.com/items?itemName=charliermarsh.ruff)
(von charliermarsh/Astral) übernimmt Linting und Formatting. Wichtig ist mir,
dass sie die im Projekt gepinnte Version nutzt: `ruff.importStrategy` steht per
Default auf `fromEnvironment`, greift also auf das `ruff` aus der `uv`-Umgebung
zu statt auf die mitgelieferte Version.

```json
// .vscode/settings.json
{
  "[python]": {
    "editor.defaultFormatter": "charliermarsh.ruff",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll.ruff": "explicit",
      "source.organizeImports.ruff": "explicit"
    }
  },
  "ruff.importStrategy": "fromEnvironment"
}
```

Das `.ruff`-Suffix an den Code-Actions sorgt dafür, dass wirklich `ruff` fixt
und die Imports sortiert und nicht versehentlich ein anderer Formatter.

**PyCharm:** Ab Version 2025.3 ist die Ruff-Unterstützung eingebaut. Unter
*Settings → Tools → Ruff* aktivieren, dann greifen *Reformat Code* und *Optimize
Imports* auf `ruff` zu. Für ältere Versionen gibt es das
[Ruff-Plugin von koxudaxi](https://plugins.jetbrains.com/plugin/20574-ruff). In
beiden Fällen lohnt es sich, auf das `ruff` aus der Projektumgebung zu zeigen
statt auf eine global installierte Version.


### Fazit

`ruff` ersetzt vier Konfigurationsdateien durch einen Block in der
`pyproject.toml` und macht Linting so schnell, dass es keine Ausrede mehr
gibt, es nicht überall laufen zu lassen. Die Opt-out-Strategie mit
`select = ["ALL"]` ist dabei bewusst radikal: Sie kostet beim Aufsetzen etwas
Zeit, liefert dafür aber ein Regelwerk, in dem jede Ausnahme ein
dokumentierter Entschluss ist statt ein historischer Zufall.

---
**Wie es weitergeht:** In [Teil 3: Die Zukunft des Type Checkings mit ty](@/blog/2026-07-20_modern-tooling-part-3-ty.md) geht es ans Type Checking, in [Teil 4 (prek)](@/blog/2026-07-20_modern-tooling-part-4-prek.md) bringen Git Hooks alles zusammen. Den Anfang verpasst? Dann geht es zurück zu [Teil 1 (uv)](@/blog/2026-07-15_modern-tooling-part-1-uv.md).
