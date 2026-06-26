#!/usr/bin/env python3
"""Generate static/llms.txt and static/llms-full.txt from content directory."""
import re
import tomllib
from pathlib import Path

BASE_URL = "https://loki.dev"


def parse_fm(text):
    m = re.match(r'^\+\+\+\s*\n(.*?)\n\+\+\+\s*\n?', text, re.DOTALL)
    if not m:
        return {}, text
    fm = tomllib.loads(m.group(1))
    return fm, text[m.end():]


def to_slug(stem):
    # Strip Zola's date prefix YYYY-MM-DD_
    stem = re.sub(r'^\d{4}-\d{2}-\d{2}_', '', stem)
    return stem.lower().replace('_', '-')


def get_pages(section, url_prefix):
    pages = []
    for f in sorted(Path(f"content/{section}").glob("*.md")):
        if f.name.startswith("_index"):
            continue
        # Skip translation variants (.en.md, etc.)
        parts = f.stem.rsplit('.', 1)
        if len(parts) == 2 and len(parts[1]) == 2:
            continue
        fm, body = parse_fm(f.read_text(encoding="utf-8"))
        if fm.get("draft", False):
            continue
        slug = fm.get("slug") or to_slug(f.stem)
        pages.append({
            "title": fm.get("title", slug),
            "date": str(fm.get("date", ""))[:10],
            "description": fm.get("description", ""),
            "extra": fm.get("extra", {}),
            "tags": fm.get("taxonomies", {}).get("tags", []),
            "url": f"{BASE_URL}/{url_prefix}/{slug}/",
            "body": body.strip(),
        })
    pages.sort(key=lambda p: p["date"], reverse=True)
    return pages


def llms_txt(blog, talks):
    lines = [
        "# loki.dev",
        "",
        "> Torsten Zielke — software architect & tech lead",
        "",
        f"Source: {BASE_URL}  |  Built with Zola.",
        "",
        "## Home",
        "",
        f"- [Torsten Zielke]({BASE_URL}/): Software architect & tech lead. Man-page style home.",
        "",
        "## Blog",
        "",
    ]
    for p in blog:
        desc = f": {p['description']}" if p["description"] else ""
        lines.append(f"- [{p['title']}]({p['url']}){desc}")
    lines += ["", "## Talks", ""]
    for p in talks:
        event = p["extra"].get("event", "")
        ev = f" ({event})" if event else ""
        desc = f": {p['description']}" if p["description"] else ""
        lines.append(f"- [{p['title']}]({p['url']}){ev}{desc}")
    lines += [
        "",
        "## Legal",
        "",
        f"- [Impressum]({BASE_URL}/impressum/): Legal notice (§5 TMG)",
        "",
    ]
    return "\n".join(lines)


def llms_full_txt(blog, talks):
    lines = [
        "# loki.dev — full content",
        "",
        "> Torsten Zielke — software architect & tech lead",
        "",
        f"Source: {BASE_URL}  |  Built with Zola.",
        "",
        "---",
        "",
        "# Blog",
    ]
    for p in blog:
        lines += ["", f"## [{p['title']}]({p['url']})", "", f"Date: {p['date']}"]
        if p["description"]:
            lines.append(f"Description: {p['description']}")
        if p["tags"]:
            lines.append(f"Tags: {', '.join(p['tags'])}")
        lines += ["", p["body"], "", "---"]
    lines += ["", "# Talks"]
    for p in talks:
        lines += ["", f"## [{p['title']}]({p['url']})", ""]
        event = p["extra"].get("event", "")
        if event:
            loc = p["extra"].get("location", "")
            lines.append(f"Event: {event}{f', {loc}' if loc else ''}")
        lines.append(f"Date: {p['date']}")
        if p["description"]:
            lines.append(f"Description: {p['description']}")
        lines += ["", p["body"], "", "---"]
    lines.append("")
    return "\n".join(lines)


if __name__ == "__main__":
    blog = get_pages("blog", "blog")
    talks = get_pages("vortraege", "vortraege")
    Path("static").mkdir(exist_ok=True)
    Path("static/llms.txt").write_text(llms_txt(blog, talks), encoding="utf-8")
    print(f"  wrote static/llms.txt  ({len(blog)} posts, {len(talks)} talks)")
    Path("static/llms-full.txt").write_text(llms_full_txt(blog, talks), encoding="utf-8")
    print(f"  wrote static/llms-full.txt")
