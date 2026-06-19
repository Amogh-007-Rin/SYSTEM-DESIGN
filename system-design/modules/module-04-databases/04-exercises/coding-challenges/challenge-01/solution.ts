// SOLUTION FILE — try starter.ts first!
/**
 * Index Performance
 * Module: 04 — Databases
 * Concept: Indexes turn an O(n) scan into an O(log n) seek for selective
 *   queries. This exercise makes that measurable, not just theoretical.
 * Run: npx ts-node solution.ts (requires Node.js 22.5+ for node:sqlite)
 * Dependencies: none (uses Node's built-in node:sqlite module)
 */

import { DatabaseSync } from "node:sqlite";

function buildDatabase(rowCount: number): DatabaseSync {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      email TEXT NOT NULL,
      referral_code TEXT NOT NULL
    );
  `);

  const insert = db.prepare("INSERT INTO users (id, email, referral_code) VALUES (?, ?, ?)");
  db.exec("BEGIN");
  for (let i = 0; i < rowCount; i++) {
    insert.run(i, `user${i}@example.com`, `code-${i}`);
  }
  db.exec("COMMIT");

  return db;
}

function timeQuery(db: DatabaseSync, sql: string, params: unknown[]): number {
  const start = process.hrtime.bigint();
  db.prepare(sql).all(...(params as never[]));
  const end = process.hrtime.bigint();
  return Number(end - start) / 1_000_000;
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
