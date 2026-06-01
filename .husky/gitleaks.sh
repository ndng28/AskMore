#!/bin/sh
# Run gitleaks on staged changes
gitleaks protect --staged -v 2>&1
exit_code=$?
if [ $exit_code -eq 1 ]; then
  echo ""
  echo "❌ gitleaks detected secrets in staged changes. Aborting commit."
  echo "   Review the findings above and remove any secrets before committing."
  exit 1
fi
exit 0
