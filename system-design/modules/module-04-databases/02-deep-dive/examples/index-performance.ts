/**
 * Index Performance: With vs. Without
 * Module: 04 — Databases
 * Concept: Runs the identical highly-selective query against a large table
 *   with and without an index on the filtered column, timing both, to make
 *   the abstract "indexes speed up reads" claim concrete and measurable.
 * Run: npx ts-node index-performance.ts (requires Node.js 22.5+ for node:sqlite)
 * Dependencies: none (uses Node's built-in node:sqlite module)
 */

import { DatabaseSync } from "node:sqlite";

const ROW_COUNT = 200_000;

function buildDatabase(): DatabaseSync {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      email TEXT NOT NULL,
      referral_code TEXT NOT NULL
    );
  `);

  // referral_code is unique per row (high cardinality) — this matters: a
  // selective filter is exactly the case where an index has the most to
  // offer, versus a low-cardinality column like "country" where a third of
  // the table matches regardless of an index.
  const insert = db.prepare("INSERT INTO users (id, email, referral_code) VALUES (?, ?, ?)");

  db.exec("BEGIN");
  for (let i = 0; i < ROW_COUNT; i++) {
    insert.run(i, `user${i}@example.com`, `code-${i}`);
  }
  db.exec("COMMIT");

  return db;
}

function timeQuery(db: DatabaseSync, sql: string, params: unknown[]): number {
  const start = process.hrtime.bigint();
  db.prepare(sql).all(...(params as never[]));
  const end = process.hrtime.bigint();
  return Number(end - start) / 1_000_000; // nanoseconds -> milliseconds
}

// === USAGE EXAMPLE ===
console.log(`Building a ${ROW_COUNT.toLocaleString()}-row table...`);
const db = buildDatabase();

const query = "SELECT * FROM users WHERE referral_code = ?";
const targetCode = `code-${ROW_COUNT - 1}`; // worst case: the last row inserted
const params = [targetCode];

console.log(`\n=== Query WITHOUT an index on \`referral_code\` (full table scan for 1 of ${ROW_COUNT.toLocaleString()} rows) ===`);
const beforeMs = timeQuery(db, query, params);
console.log(`Elapsed: ${beforeMs.toFixed(2)}ms`);

console.log("\nCreating index: CREATE INDEX idx_referral_code ON users(referral_code);");
db.exec("CREATE INDEX idx_referral_code ON users(referral_code);");

console.log("\n=== Same query WITH the index (direct seek) ===");
const afterMs = timeQuery(db, query, params);
console.log(`Elapsed: ${afterMs.toFixed(2)}ms`);

console.log(`\nSpeedup: ${(beforeMs / afterMs).toFixed(1)}x faster with the index`);
console.log("\n=== EXPLAIN QUERY PLAN with the index in place ===");
const plan = db.prepare(`EXPLAIN QUERY PLAN ${query}`).all(...params);
console.log(plan);
console.log("Notice 'SEARCH ... USING INDEX' (an O(log n) seek) instead of 'SCAN users' (O(n)).");
