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

# support both DEPLOY_*/SSH_* naming
DEPLOY_USER="${DEPLOY_USER:-${SSH_USER:-}}"
DEPLOY_HOST="${DEPLOY_HOST:-${SSH_HOST:-}}"
DEPLOY_PATH="${DEPLOY_PATH:-}"
DEPLOY_KEY="${DEPLOY_KEY:-}"

for var in DEPLOY_USER DEPLOY_HOST DEPLOY_PATH; do
  if [[ -z "${!var:-}" ]]; then
    echo "error: $var is empty in .env" >&2
    exit 1
  fi
done

echo "==> Generating llms.txt / llms-full.txt..."
python3 generate_llms.py

echo "==> Building..."
zola build

# expand a leading ~ in the key path (rsync/ssh don't do it themselves)
DEPLOY_KEY="${DEPLOY_KEY/#\~/$HOME}"
SSH_CMD="ssh -o StrictHostKeyChecking=accept-new"
[[ -n "$DEPLOY_KEY" ]] && SSH_CMD="$SSH_CMD -i $DEPLOY_KEY"

echo "==> Deploying to ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}"

# Mirror public/ into the docroot. --delete prunes stale files (e.g. the
# nocontent.html placeholder), but .well-known/ is preserved so Let's Encrypt
# ACME challenges survive. Trailing slash on public/ copies its contents.
rsync -avz --delete \
  --exclude='.well-known/' \
  -e "$SSH_CMD" \
  public/ "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/"

echo "==> Done. https://loki.dev/"
