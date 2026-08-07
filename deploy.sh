#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="$(dirname "$(realpath "$0")")/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  cat >&2 <<EOF
error: .env not found at $ENV_FILE

Create it with:
  DEPLOY_USER=lokidev
  DEPLOY_HOST=janus.uberspace.de
  DEPLOY_PATH=/home/lokidev/www/loki.dev
  DEPLOY_KEY=~/.ssh/id_ed25519_lokidev
EOF
  exit 1
fi

source "$ENV_FILE"

# .env defines these; the :- keeps `set -u` from aborting before the check below.
DEPLOY_USER="${DEPLOY_USER:-}"
DEPLOY_HOST="${DEPLOY_HOST:-}"
DEPLOY_PATH="${DEPLOY_PATH:-}"
DEPLOY_KEY="${DEPLOY_KEY:-}"

for var in DEPLOY_USER DEPLOY_HOST DEPLOY_PATH; do
  if [[ -z "${!var:-}" ]]; then
    echo "error: $var is empty in .env" >&2
    exit 1
  fi
done

# expand a leading ~ in the key path (rsync/ssh don't do it themselves)
DEPLOY_KEY="${DEPLOY_KEY/#\~/$HOME}"
SSH_CMD="ssh -o StrictHostKeyChecking=accept-new"
[[ -n "$DEPLOY_KEY" ]] && SSH_CMD="$SSH_CMD -i $DEPLOY_KEY"

# One-time: give vibe-check.loki.dev its own docroot. Uberspace points every new
# domain at the shared html docroot via symlink, so until this runs the subdomain
# just serves the blog. Nothing is built or uploaded here.
if [[ "${1:-}" == "--setup-vibecheck" ]]; then
  target="$(dirname "$DEPLOY_PATH")/vibe-check.loki.dev"
  $SSH_CMD "${DEPLOY_USER}@${DEPLOY_HOST}" "
    if [ -L '$target' ]; then rm '$target'; mkdir -p '$target'; echo '  symlink -> dir';
    elif [ -d '$target' ]; then echo '  already a dir';
    else mkdir -p '$target'; echo '  created'; fi"
  echo "==> setup done, now run ./deploy.sh"
  exit 0
fi

echo "==> Generating llms.txt / llms-full.txt..."
python3 generate_llms.py

echo "==> Building..."
zola build

echo "==> Deploying to ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}"

# Mirror public/ into the docroot. --delete prunes stale files (e.g. the
# nocontent.html placeholder), but .well-known/ is preserved so Let's Encrypt
# ACME challenges survive. Trailing slash on public/ copies its contents.
rsync -avz --delete \
  --exclude='.well-known/' \
  -e "$SSH_CMD" \
  public/ "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/"

# --- vibe-check.loki.dev ------------------------------------------------------
# One self-contained file in its own docroot beside loki.dev's. It ships from
# here instead of its own script so it reuses the .env, the key and SSH_CMD.
VIBE_DOMAIN="vibe-check.loki.dev"
VIBE_PATH="$(dirname "$DEPLOY_PATH")/${VIBE_DOMAIN}"

# SAFETY: Uberspace creates every new domain as a symlink onto the shared html
# docroot. Writing into that symlink would overwrite the blog with this one page.
# Run ./deploy.sh --setup-vibecheck once to turn it into a real directory.
if $SSH_CMD "${DEPLOY_USER}@${DEPLOY_HOST}" "[ -L '${VIBE_PATH}' ]"; then
  echo "error: ${VIBE_PATH} is still a symlink onto the shared docroot." >&2
  echo "       run: ./deploy.sh --setup-vibecheck" >&2
  exit 1
fi

echo "==> Deploying ${VIBE_DOMAIN}"
rsync -avz -e "$SSH_CMD" \
  static/vibe-check.html \
  "${DEPLOY_USER}@${DEPLOY_HOST}:${VIBE_PATH}/index.html"
rsync -az -e "$SSH_CMD" \
  static/.htaccess \
  "${DEPLOY_USER}@${DEPLOY_HOST}:${VIBE_PATH}/.htaccess"

echo "==> Done. https://loki.dev/ and https://${VIBE_DOMAIN}/"
