+++
title = "Moderne Werkzeuge Teil 4: Hochperformante Git Hooks mit prek"
date = "2026-07-14T10:00:00Z"
description = "prek als Drop-in-Ersatz für pre-commit: dieselbe Config, parallele Ausführung, und wie unser komplettes Quality Gate vor jedem Commit läuft."
draft = true
[taxonomies]
tags = ["tooling", "python", "git"]
+++

Im Laufe dieser Serie haben wir unseren Python-Stack mit `uv`
([Teil 1](@/blog/2026-07-14_modern-tooling-part-1-uv.md)), `ruff`
([Teil 2](@/blog/2026-07-14_modern-tooling-part-2-ruff.md)) und `ty`
([Teil 3](@/blog/2026-07-14_modern-tooling-part-3-ty.md)) neu aufgebaut. In
**Teil 4** bringen wir alles zusammen: Die Checks sollen automatisch laufen,
bevor Code überhaupt ins Repository gelangt.

### Warum Git Hooks das effektivste Quality Gate sind

Jeder Check, der erst in der CI läuft, hat eine eingebaute Verzögerung: Code
schreiben, committen, pushen, fünf Minuten warten, rote Pipeline, fixen,
"Fix linting"-Commit, nochmal pushen. Ein Pre-Commit-Hook verschiebt genau
dieselben Checks an den frühestmöglichen Punkt: Fehler werden behoben,
*bevor* sie in der Historie landen, und die CI wird vom Fehlerfinder zum
reinen Sicherheitsnetz.

### Der Engpass beim klassischen pre-commit

Das [`pre-commit`](https://pre-commit.com)-Framework ist seit Jahren der
Standard dafür, und sein Konfigurationsformat (`.pre-commit-config.yaml`)
ist de facto ein Ökosystem-Standard. Aber es hat Reibungspunkte: Es ist
selbst ein Python-Paket, isoliert jeden Hook in einer eigenen virtuellen
Umgebung und führt Hooks sequenziell aus. Das erste `git commit` nach einem
frischen Clone kann Minuten dauern, während Umgebungen aufgebaut werden, und
jeder weitere Commit zahlt den Overhead erneut.

### prek: dieselbe Config, ohne den Overhead

[`prek`](https://github.com/j178/prek) ist eine Reimplementierung des
pre-commit-Frameworks in Rust, und der entscheidende Punkt ist:
**Es liest dieselbe `.pre-commit-config.yaml`.** Es gibt keine Migration,
keine neue Konfigurationssprache. Du installierst prek, und deine bestehenden
Hooks laufen, parallel, mit smartem Caching und ohne den
Virtualenv-Overhead:

```bash
# Installation (ein statisches Binary, kein Python nötig)
uv tool install prek

# Git-Hook im Repository aktivieren (einmalig pro Clone)
prek install

# Hooks manuell ausführen
prek run                # gegen gestagte Dateien
prek run --all-files    # gegen die gesamte Codebasis
prek run gitleaks --all-files  # einen einzelnen Hook gezielt
```

### Unser Hook-Setup im Detail

Die `.pre-commit-config.yaml` unseres Templates verkettet alles, was wir in
den letzten drei Teilen aufgebaut haben. Interessant ist dabei die
Unterscheidung zwischen zwei Hook-Arten:

**Remote-Hooks** kommen aus fremden Repositories: die Basics wie
YAML/TOML-Validierung, Trailing Whitespace und der Secret-Scanner
[gitleaks](https://github.com/gitleaks/gitleaks):

```yaml
- repo: https://github.com/pre-commit/pre-commit-hooks
  rev: v6.0.0
  hooks:
  - id: check-yaml
  - id: check-toml
  - id: check-merge-conflict
  - id: trailing-whitespace
  - id: end-of-file-fixer

- repo: https://github.com/gitleaks/gitleaks
  rev: v8.30.1
  hooks:
  - id: gitleaks
```

**Lokale Hooks** dagegen laufen über `uv run` in unserer Projektumgebung:
damit prüfen ruff, ty und bandit exakt in den Versionen, die in der
`uv.lock` gepinnt sind, statt in irgendeiner separaten Hook-Umgebung:

```yaml
- repo: local
  hooks:
  - id: ruff-format
    name: ruff format
    entry: uv run ruff format
    language: system
    types: [python]

  - id: ruff-check
    name: ruff check
    entry: uv run ruff check --fix
    language: system
    types: [python]

  - id: ty
    name: ty-check
    entry: uv run ty check --verbose --output-format=full .
    language: system
    types: [python]
    pass_filenames: false

  - id: bandit
    name: bandit
    entry: uv run bandit -r src/app -c pyproject.toml
    language: system
    types: [python]
    pass_filenames: false
```

Dazu kommt noch [import-linter](https://import-linter.readthedocs.io), der
unsere Hexagonale Architektur bewacht: Er schlägt fehl, sobald jemand aus der
Domain-Schicht heraus Infrastruktur importiert: Architekturregeln als
ausführbarer Check statt als Wiki-Seite.

### Ein Commit, das ganze Quality Gate

Bei jedem `git commit` läuft damit automatisch: Formatting, Linting mit
Auto-Fix, Type Checking, Security-Scan (bandit), Secret-Scan (gitleaks) und
die Architekturprüfung. Dank prek weitgehend parallel und in wenigen
Sekunden, schnell genug, dass niemand in Versuchung kommt, es abzuschalten.

Für den Notfall gibt es die trotzdem, die Hintertür:

```bash
git commit --no-verify
```

Aber genau dafür ist die CI das Sicherheitsnetz: Dort laufen dieselben Checks
(`ruff format --check`, `ruff check`, `ty check`, `bandit`, `lint-imports`,
`pytest`) noch einmal, nur eben als letzte Instanz, nicht als erste.

### Fazit der Serie

Vier Tools, ein Muster: `uv`, `ruff`, `ty` und `prek` ersetzen jeweils einen
langsamen, fragmentierten Teil der Python-Toolchain durch ein schnelles
Rust-Binary, und bleiben dabei kompatibel zu dem, was sie ablösen
(`pyproject.toml`, Black-Formatierung, `.pre-commit-config.yaml`). Zusammen
wirken sie stärker als einzeln: Wenn jeder Check in Sekundenbruchteilen läuft,
laufen die Checks tatsächlich: bei jedem Speichern, bei jedem Commit, in jeder
Pipeline. Statt auf unsere Werkzeuge zu warten, arbeiten wir wieder an der
Software selbst.

---
**Serienübersicht:**
* [Teil 1: uv](@/blog/2026-07-14_modern-tooling-part-1-uv.md)
* [Teil 2: ruff](@/blog/2026-07-14_modern-tooling-part-2-ruff.md)
* [Teil 3: ty](@/blog/2026-07-14_modern-tooling-part-3-ty.md)
* [Teil 4: prek](@/blog/2026-07-14_modern-tooling-part-4-prek.md)
