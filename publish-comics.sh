#!/usr/bin/env bash
# Publish every comic whose date prefix is today or earlier, then commit and deploy.
# Runs weekly via ~/Library/LaunchAgents/dev.loki.publish-comics.plist.
# TODAY=YYYY-MM-DD overrides the date, DRY_RUN=1 only prints what would go live.
set -euo pipefail
cd "$(dirname "$(realpath "$0")")"

today="${TODAY:-$(date -u +%F)}"
published=()

for f in content/comics/????-??-??_*.md; do
  name="$(basename "$f")"
  [[ "${name:0:10}" > "$today" ]] && continue
  grep -q '^draft = true$' "$f" || continue
  published+=("$name")
  [[ -n "${DRY_RUN:-}" ]] || sed -i '' '/^draft = true$/d' "$f"
done

if (( ${#published[@]} == 0 )); then
  echo "$(date): nothing to publish"
  exit 0
fi

printf '%s: publishing %s\n' "$(date)" "${published[*]}"
[[ -n "${DRY_RUN:-}" ]] && exit 0

git add content/comics
git commit -m "content: publish comic ${published[0]%%.*}" \
  -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -- content/comics
./deploy.sh
