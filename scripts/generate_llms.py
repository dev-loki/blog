#!/usr/bin/env python3
"""Generate static/llms.txt from Zola content. Run before zola build."""

import re
from pathlib import Path

BASE_URL = "https://loki.dev"
ROOT = Path(__file__).parent.parent


def parse_toml_block(text):
    """Minimal TOML parser for Zola front matter (no deps needed)."""
    m = re.match(r"^\+\+\+\n(.*?)\n\+\+\+", text, re.DOTALL)
    if not m:
        return {}, text.strip()
    raw = m.group(1)
    data = {}
    section = data
    for line in raw.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if re.match(r"^\[[\w.]+\]$", line):
            key = line.strip("[]")
            data[key] = {}
            section = data[key]
        elif "=" in line:
            k, _, v = line.partition("=")
            k, v = k.strip(), v.strip().strip("\"'")
            section[k] = v
    return data, text[m.end():].strip()


def first_sentence(text):
    text = re.sub(r"\s+", " ", text.split("\n")[0]).strip()
    return text[:120]


def get_pages(directory):
    pages = []
    for f in sorted(directory.glob("*.md")):
        if f.name.startswith("_"):
            continue
        fm, body = parse_toml_block(f.read_text(encoding="utf-8"))
        if fm.get("draft", "false").lower() == "true":
            continue
        slug = re.sub(r"^\d{4}-\d{2}-\d{2}_?", "", f.stem).replace("_", "-")
        pages.append({"fm": fm, "body": body, "slug": slug})
    # newest first (reverse chronological by filename)
    pages.reverse()
    return pages


def build():
    out = []

    out += [
        "# loki.dev",
        "",
        "> Torsten Zielke — software architect & tech lead. "
        "Writes about Python, TypeScript, clean code, and engineering culture.",
        "",
        "Source: https://loki.dev  |  Built with Zola.",
        "",
        "## Home",
        "",
        f"- [loki — Torsten Zielke]({BASE_URL}/): "
        "Man-page style home. Software architect and tech lead.",
        "",
        "## Blog",
        "",
    ]

    for p in get_pages(ROOT / "content" / "blog"):
        title = p["fm"].get("title", p["slug"])
        url = f"{BASE_URL}/blog/{p['slug']}/"
        desc = first_sentence(p["body"])
        line = f"- [{title}]({url})"
        if desc:
            line += f": {desc}"
        out.append(line)

    out += ["", "## Talks", ""]

    for p in get_pages(ROOT / "content" / "vortraege"):
        title = p["fm"].get("title", p["slug"])
        url = f"{BASE_URL}/vortraege/{p['slug']}/"
        extra = p["fm"].get("extra", {})
        meta = ", ".join(filter(None, [extra.get("event", ""), extra.get("location", "")]))
        line = f"- [{title}]({url})"
        if meta:
            line += f": {meta}"
        out.append(line)

    out += [
        "",
        "## Legal",
        "",
        f"- [Impressum]({BASE_URL}/impressum/): Legal notice (§5 TMG)",
        "",
    ]

    dest = ROOT / "static" / "llms.txt"
    dest.write_text("\n".join(out), encoding="utf-8")
    print(f"Written {dest} ({len(out)} lines)")


if __name__ == "__main__":
    build()
