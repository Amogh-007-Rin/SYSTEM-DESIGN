#!/bin/bash
# Run locally before submitting a PR
# Requires: npm install -g markdown-link-check
set -e
echo "🔍 Validating all markdown links..."
find . -name "*.md" -not -path "./.git/*" -not -path "./node_modules/*" | while read file; do
  echo "Checking: $file"
  markdown-link-check "$file" --config .markdown-link-check.json
done
echo "✅ All links valid."
