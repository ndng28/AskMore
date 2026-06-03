#!/bin/sh
# Run gitleaks on staged changes.
#
# Exit codes:
#   0  - clean, no secrets found
#   1  - gitleaks ran and found secrets (block the commit)
#   2  - gitleaks binary missing or broken (block the commit; do not silently pass)
#
# The previous version only checked for exit code 1 and let any other code
# (including "command not found", exit 127) fall through to exit 0. That meant
# the secrets gate was silently bypassed on machines without gitleaks installed.
# CONTRIBUTING.md and AGENTS.md both forbid bypassing gates, so we treat the
# missing-binary case as a hard failure too.

if ! command -v gitleaks >/dev/null 2>&1; then
  echo ""
  echo "❌ gitleaks is not installed. The secrets gate cannot run."
  echo "   Install it before committing:"
  echo "     brew install gitleaks          # macOS (Homebrew)"
  echo "     scoop install gitleaks        # Windows"
  echo "   See CONTRIBUTING.md for setup details."
  echo ""
  exit 2
fi

gitleaks protect --staged -v
exit_code=$?

if [ $exit_code -eq 1 ]; then
  echo ""
  echo "❌ gitleaks detected secrets in staged changes. Aborting commit."
  echo "   Review the findings above and remove any secrets before committing."
  exit 1
fi

# Any other non-zero exit from gitleaks (crash, config error) is also a failure.
if [ $exit_code -ne 0 ]; then
  echo ""
  echo "❌ gitleaks exited with code $exit_code. Aborting commit."
  exit 1
fi

exit 0
