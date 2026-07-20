+++
title = "Moderne Werkzeuge Teil 1: Blitzschnelles Package Management mit uv"
date = "2026-07-13T19:50:00Z"
updated = "2026-07-16T15:15:29Z"
description = "uv ersetzt pip, virtualenv, pyenv und pip-tools durch ein einziges Rust-Binary: vom lokalen Setup über Dependency Groups bis zum Docker-Build."
draft = false
[taxonomies]
tags = ["tooling", "python"]
+++

Hey und willkommen zu meiner vierteiligen Serie über moderne Python-Werkzeuge.
Ich schreibe das gerade, weil das Python-Ökosystem einen echten Umbruch erlebt.
Genau genommen sogar mehrere:

1. Das Python-Ökosystem wird zu großen Teilen durch Rust-basierte Werkzeuge
   ersetzt. Das habe ich zu großen Teilen [Astral](https://astral.sh) zu verdanken.
2. Immer größere Teile der Entwicklung werden von KI diverser Hersteller
   erledigt, und die Kontrolle selbiger führt zu wachsenden Problemen.

Praktischerweise passen diese beiden Umbrüche perfekt zusammen.

Mein Ziel ist also, erst diese neuen Rust-basierten Werkzeuge vorzustellen und
dann zu zeigen, wie sie in der KI-getriebenen Entwicklung helfen können. Ich
schaue mir vier+ dieser Werkzeuge an, und zwar nicht abstrakt, sondern anhand
eines realen FastAPI-Projekt-Templates: `uv`, `ruff`, `ty` und `prek` (+weitere
Mini-Tools).

In **Teil 1 (dieser hier)** geht es um das Fundament: **`uv`**.


### Das Problem, dass ich sehe: fünf Tools für eine Aufgabe

Wer bisher ein Python-Projekt sauber aufsetzen wollte, brauchte einen ganzen
Werkzeugkasten:

* `pyenv`, um die richtige Python-Version zu installieren
* `venv` oder `virtualenv` (`pipenv` habe ich auch schon genutzt), um eine isolierte Umgebung zu erzeugen
* `pip`, um Pakete zu installieren
* `pip-tools`, `pip freeze` (oder `poetry`), um Abhängigkeiten zu locken
* dazu das `source .venv/bin/activate`-Ritual (gerne auch automatisiert via zsh/bash script)

Jedes dieser Tools hat eine eigene Konfiguration (inklusive eigene
Konfigurationstypen), eigene Eigenheiten und eigene Fehlerquellen. Das Ergebnis
ist: "Works on my machine". Gratis dazu: eine CI-Pipeline, die Minuten mit dem
Auflösen von Abhängigkeiten verbringt.


### Die Lösung: uv, ein einzelnes Binary

`uv` ersetzt den kompletten Stack durch ein einziges Rust-Binary. Es ist
Paket-Installer, Environment-Manager, Dependency-Resolver und
Python-Versions-Manager in einem. Das Beste: es ist dabei um Größenordnungen schneller.

Installation geht flott:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
# oder auf macOS:
brew install uv
```
_(Wie immer gilt: install script erst lesen oder sogar erst runterladen und
dann ausführen. Hier ist der Einfachheit halber nur der direkte Schritt aus der
Doku vermerkt)_


### Workflow

Danach reduziert sich der Python-Alltag auf drei Befehle:

```bash
# Abhängigkeiten aus dem Lockfile installieren (inkl. venv-Erstellung)
uv sync

# Ein Paket hinzufügen: aktualisiert pyproject.toml UND uv.lock
uv add fastapi

# Beliebigen Befehl in der Projektumgebung ausführen
uv run pytest
```

Es gibt also kein `activate` mehr. `uv run` sorgt selbst dafür, dass der Befehl
in der richtigen Umgebung läuft und dass diese Umgebung mit dem Lockfile
übereinstimmt. Ist sie es nicht, synchronisiert `uv` sie vorher automatisch.
Via `uv venv` (optional mit `--python 314`) kann man auch getrennt eine `venv`
Umgebung erstellen. Alternativ kann man im Projekt eine `.python-version`
Datei mit dem Inhalt `3.14` anlegen. Dann lädt `uv` den passenden Interpreter
bei Bedarf einfach herunter. `pyenv` wird damit überflüssig.


### Dependency Groups statt requirements-Wildwuchs

Statt `requirements.txt`, `requirements-dev.txt` und `requirements-test.txt`
definiert mein Template alles in der `pyproject.toml`, mit dem Standard für
[Dependency Groups (PEP 735)](https://peps.python.org/pep-0735/), inklusive
Gruppen, die andere Gruppen einbinden:

```toml
[dependency-groups]
dev = [
  "prek==0.4.9",
  { include-group = "tests" },
  { include-group = "lint" },
]

tests = [
  "httpx==0.*",
  "pytest==9.*",
  "pytest-asyncio",
]

lint = [
  "ruff==0.*",
  "ty==0.*",
  "bandit==1.*",
  "import-linter>=2.11",
]
```

`uv sync` installiert standardmäßig die `dev`-Gruppe, `uv sync --no-dev` lässt
sie weg. Perfekt für die Production Environment. Weitere Flags für die Gruppen
sind `--all-groups` bzw. sehr spezifisch `--group lint|tests|dev`.


### Reproduzierbarkeit: uv.lock

Wichtig für stabile Deployments ist die `uv.lock`: Sie hält jede Abhängigkeit
(inklusive Subabhängigkeiten) mit exakter Version und Hash fest,
plattformübergreifend. In CI und Docker erzwinge ich mit `--frozen`, dass das
Lockfile aktuell ist. Weicht die `pyproject.toml` davon ab, schlägt der Build
fehl, statt still etwas anderes zu installieren.

So sieht das in einem beispielhaften Dockerfile meines Templates aus (Multi-Stage, mit Cache-Mount):

```dockerfile
# Bewusst kein alpine, da das gerade mit binary builds (z. B. psycopg2/etc.)
# schonmal Mehrarbeit ist.
FROM python:3.14-slim AS builder

ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

# Erster Schritt: uv haben. Es gibt aber auch fertige Docker Images!
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv
COPY pyproject.toml uv.lock ./

# Erst nur Dependencies, dieser Layer wird gecached,
# solange sich das Lockfile nicht ändert
RUN uv sync --frozen --no-dev --no-install-project

# Dann der sourcecode -> häufige änderungen
COPY src ./src

# Install mithilfe von cache (macht gerade bei CI einen gigantischen Unterschied)
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev
```

Und in der GitHub-Actions-Pipeline übernimmt die offizielle Action Setup und
Caching in einem Schritt:

```yaml
- name: Install uv
  uses: astral-sh/setup-uv@v8.2.0
  with:
    python-version: "3.14"
    enable-cache: true

- name: Install dependencies
  run: uv sync --all-groups
```

### Fazit

`uv` braucht weniger Konfiguration als der alte Stack und ist trotzdem
deutlich schneller. Es ist der Grund, warum alle folgenden Teile dieser Serie
mit `uv run ...` beginnen. Damit werden Python-Entwicklung, CI, CD u. v. m.
schneller.

Bonusfeature: [Scripts mit Inline-Dependencies](https://docs.astral.sh/uv/guides/scripts/#declaring-script-dependencies)
laufen lassen. Perfekt für DevOps und Ähnliches. :)

---

**Wie es weitergeht:** In [Teil 2: Einheitliches Linting und Formatting mit ruff](@/blog/2026-07-16_modern-tooling-part-2-ruff.md) sehe ich mir an, wie
ich Coding-Standards ohne Wartezeiten durchsetze. Auch [Teil 3 (ty)](@/blog/2026-07-20_modern-tooling-part-3-ty.md) ist inzwischen da; Teil 4 (prek) ist noch in Arbeit.
