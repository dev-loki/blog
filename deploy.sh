#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="$(dirname "$(realpath "$0")")/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  cat >&2 <<EOF
error: .env not found at $ENV_FILE

Create it with:
  DEPLOY_USER=user
  DEPLOY_HOST=example.com
  DEPLOY_PATH=/var/www/loki.dev
  DEPLOY_KEY=~/.ssh/id_rsa
EOF
  exit 1
fi

source "$ENV_FILE"

# support both SSH_*/DEPLOY_* naming
SSH_USER="${SSH_USER:-${DEPLOY_USER:-}}"
SSH_HOST="${SSH_HOST:-${DEPLOY_HOST:-}}"
SSH_PASS="${SSH_PASS:-}"
DEPLOY_PATH="${DEPLOY_PATH:-~/lokidev}"

for var in SSH_USER SSH_HOST; do
  if [[ -z "${!var:-}" ]]; then
    echo "error: $var is empty in .env" >&2
    exit 1
  fi
done

echo "==> Generating llms.txt / llms-full.txt..."
python3 generate_llms.py

echo "==> Building..."
zola build

echo "==> Deploying to ${SSH_USER}@${SSH_HOST}:${DEPLOY_PATH}"

if [[ -n "$SSH_PASS" ]]; then
  which sshpass >/dev/null 2>&1 || { echo "error: SSH_PASS set but sshpass not installed (brew install sshpass)" >&2; exit 1; }
  export SSHPASS="$SSH_PASS"
  SSHPASS_PREFIX="sshpass -e"
else
  SSHPASS_PREFIX=""
fi

# tar+pipe is used because the target server may not have rsync
COPYFILE_DISABLE=1 tar czf - --no-xattrs -C public . | \
  $SSHPASS_PREFIX ssh -o StrictHostKeyChecking=accept-new \
    ${DEPLOY_KEY:+-i "$DEPLOY_KEY"} \
    "${SSH_USER}@${SSH_HOST}" \
    "find ${DEPLOY_PATH} -mindepth 1 -delete && tar xzf - -C ${DEPLOY_PATH}"

echo "==> Done."
