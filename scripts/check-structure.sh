#!/bin/bash
# Validates all 20 modules have required directory structure
set -e
MODULES_DIR="./modules"
REQUIRED_FILES=("README.md" "SUMMARY.md" "01-concepts/README.md" "02-deep-dive/README.md" "03-interview-prep/README.md" "03-interview-prep/common-questions.md" "04-exercises/README.md" "05-further-reading/README.md")
ERRORS=0
for module_dir in "$MODULES_DIR"/*/; do
  module_name=$(basename "$module_dir")
  for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$module_dir$file" ]; then
      echo "❌ MISSING FILE: $module_name/$file"
      ERRORS=$((ERRORS + 1))
    fi
  done
done
if [ "$ERRORS" -eq 0 ]; then echo "✅ All module structures are valid."; else echo "❌ Found $ERRORS issue(s)."; exit 1; fi
