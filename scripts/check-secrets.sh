#!/usr/bin/env bash
# Blocks commits that contain obvious hardcoded secrets in the staged diff.
# Not a substitute for a real scanner (gitleaks/trufflehog) — just a cheap
# gate for the incident classes we've actually hit: DB URLs with embedded
# passwords, cloud access keys, private key blocks, common API token shapes.
set -euo pipefail

PATTERN='(postgres(ql)?|mysql|mongodb(\+srv)?):\/\/[^:[:space:]]+:[^@[:space:]]+@|AKIA[0-9A-Z]{16}|-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----|sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{10,}'

HITS=$(git diff --cached -U0 --diff-filter=ACM -- . ':(exclude)scripts/check-secrets.sh' \
  | grep -EnI "$PATTERN" || true)

if [ -n "$HITS" ]; then
  echo "Posible secreto detectado en el commit (bloqueado por scripts/check-secrets.sh):"
  echo "$HITS"
  echo
  echo "Si es un falso positivo, ajusta el patrón en scripts/check-secrets.sh."
  echo "Ver constitution.md -> Security: MUST NOT be hardcoded."
  exit 1
fi
