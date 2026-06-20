# Coding Challenge 01: Index Performance

## Problem Statement

Using Node's built-in `node:sqlite` module, build a table with 100,000+ rows, then measure the time to run a highly-selective query (matching exactly one row) both before and after creating an index on the filtered column.

## Requirements

1. `buildDatabase(rowCount)` — creates an in-memory SQLite database with a `users` table and inserts `rowCount` rows, each with a unique `referral_code`.
2. `timeQuery(db, sql, params)` — runs a query and returns elapsed time in milliseconds.
3. Run the same `SELECT * FROM users WHERE referral_code = ?` query before and after `CREATE INDEX`, and print the speedup factor.

## Starter / Solution

- [`starter.ts`](./starter.ts)
- [`solution.ts`](./solution.ts)

## Usage Example

```bash
npx ts-node starter.ts
```

Expect a speedup well over 10x once the index exists — the exact number depends on machine and row count, but the direction and order of magnitude should be unmistakable.
