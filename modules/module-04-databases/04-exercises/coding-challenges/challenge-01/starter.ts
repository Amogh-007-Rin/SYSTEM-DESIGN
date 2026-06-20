/**
 * Index Performance
 * Module: 04 — Databases
 * Concept: Indexes turn an O(n) scan into an O(log n) seek for selective
 *   queries. This exercise makes that measurable, not just theoretical.
 * Run: npx ts-node starter.ts (requires Node.js 22.5+ for node:sqlite)
 * Dependencies: none (uses Node's built-in node:sqlite module)
 */

import { DatabaseSync } from "node:sqlite";

/**
 * TODO: Implement buildDatabase.
 * - CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT NOT NULL, referral_code TEXT NOT NULL)
 * - Insert `rowCount` rows inside a single BEGIN/COMMIT for fast bulk insert,
 *   each with a unique referral_code (e.g. `code-${i}`).
 * - Return the DatabaseSync instance.
 */
function buildDatabase(rowCount: number): DatabaseSync {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * TODO: Implement timeQuery.
 * - Use process.hrtime.bigint() before and after running db.prepare(sql).all(...params)
 * - Return elapsed milliseconds (convert from nanoseconds).
 */
function timeQuery(db: DatabaseSync, sql: string, params: unknown[]): number {
  // TODO: implement
  throw new Error("Not implemented");
}

// === USAGE EXAMPLE ===
const ROW_COUNT = 200_000;
console.log(`Building a ${ROW_COUNT.toLocaleString()}-row table...`);
const db = buildDatabase(ROW_COUNT);

const query = "SELECT * FROM users WHERE referral_code = ?";
const targetCode = `code-${ROW_COUNT - 1}`;

console.log("\n=== Without an index ===");
const beforeMs = timeQuery(db, query, [targetCode]);
console.log(`Elapsed: ${beforeMs.toFixed(2)}ms`);

db.exec("CREATE INDEX idx_referral_code ON users(referral_code);");

console.log("\n=== With an index ===");
const afterMs = timeQuery(db, query, [targetCode]);
console.log(`Elapsed: ${afterMs.toFixed(2)}ms`);

console.log(`\nSpeedup: ${(beforeMs / afterMs).toFixed(1)}x faster with the index`);
