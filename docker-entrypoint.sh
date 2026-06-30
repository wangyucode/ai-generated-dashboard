#!/bin/sh
set -e

# ──────────────────────────────────────────────
# Docker entrypoint: pre-create data dirs & trigger meta DB init
# Ensures /app/data/meta/meta.db exists before the app starts.
# ──────────────────────────────────────────────

echo "→ Pre-creating data directories..."

mkdir -p /app/data/meta
mkdir -p /app/data/db

# Fix ownership if running as non-root (nextjs user)
if [ "$(id -u)" != "0" ]; then
  chown -R $(id -u):$(id -g) /app/data 2>/dev/null || true
fi

echo "→ Data directories ready."

# If a DB_INIT_SQL env var is set, run it against meta.db (knex style)
if [ -n "$DB_INIT_SQL" ]; then
  echo "→ Running init SQL..."
  node -e "
    const knex = require('knex');
    const db = knex({ client: 'better-sqlite3', connection: { filename: '/app/data/meta/meta.db' }, useNullAsDefault: true });
    (async () => {
      await db.raw(\$process.env.DB_INIT_SQL);
      console.log('→ Init SQL executed.');
      process.exit(0);
    })();
  " || true
fi

# Start the app
exec "$@"
