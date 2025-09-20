#!/usr/bin/env bash
set -euo pipefail

echo "🔍 AgroAI Backend Verification - START"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "📦 go.mod tidy..."
go mod tidy

echo "🏗️ Building all packages..."
go build ./...

echo "🧪 Running unit & integration tests..."
if [ -z "${DATABASE_URL:-}" ]; then
  echo "⚠️ DATABASE_URL not set. Running tests without DB integration."
  go test ./... -v
else
  echo "✅ DATABASE_URL detected, running full test suite."
  go test ./... -v
fi

echo "🔎 Linting (golangci-lint)..."
if command -v golangci-lint >/dev/null 2>&1; then
  golangci-lint run ./...
else
  echo "⚠️ golangci-lint not installed. Skipping lint step."
fi

echo "✅ AgroAI Backend Verification - SUCCESS"
