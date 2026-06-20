/**
 * ACID Demo: Atomicity via Transactions
 * Module: 04 — Databases
 * Concept: Demonstrates atomicity concretely — a multi-statement transfer
 *   either fully applies or fully rolls back, even when a later statement
 *   fails partway through.
 * Run: npx ts-node acid-demo.ts (requires Node.js 22.5+ for node:sqlite)
 * Dependencies: none (uses Node's built-in node:sqlite module)
 */

import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync(":memory:");

db.exec(`
  CREATE TABLE accounts (
    id TEXT PRIMARY KEY,
    balance INTEGER NOT NULL CHECK (balance >= 0)
  );
`);

db.prepare("INSERT INTO accounts (id, balance) VALUES (?, ?)").run("alice", 100);
db.prepare("INSERT INTO accounts (id, balance) VALUES (?, ?)").run("bob", 50);

function getBalance(id: string): number {
  const row = db.prepare("SELECT balance FROM accounts WHERE id = ?").get(id) as
    | { balance: number }
    | undefined;
  if (!row) throw new Error(`account ${id} not found`);
  return row.balance;
}

// A correct transfer: debit one account, credit another, inside a transaction.
// If anything between BEGIN and COMMIT throws, the whole transaction rolls
// back — the database returns to exactly the state before BEGIN, as if
// nothing happened. This is atomicity.
function transfer(fromId: string, toId: string, amount: number): void {
  db.exec("BEGIN");
  try {
    // Credit runs FIRST and succeeds on its own — this is what proves
    // atomicity below: a statement that succeeded in isolation still gets
    // undone if a later statement in the same transaction fails.
    db.prepare("UPDATE accounts SET balance = balance + ? WHERE id = ?").run(amount, toId);
    db.prepare("UPDATE accounts SET balance = balance - ? WHERE id = ?").run(amount, fromId);
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

// === USAGE EXAMPLE ===
console.log("=== Initial balances ===");
console.log(`alice: ${getBalance("alice")}, bob: ${getBalance("bob")}`);

console.log("\n=== Successful transfer: alice -> bob, 30 ===");
transfer("alice", "bob", 30);
console.log(`alice: ${getBalance("alice")}, bob: ${getBalance("bob")}`);

console.log("\n=== Attempted transfer that violates a constraint: alice -> bob, 1000 ===");
console.log("(alice only has 70 — the CHECK constraint on balance >= 0 will reject the debit)");
try {
  transfer("alice", "bob", 1000);
} catch (err) {
  console.log(`Transfer rejected: ${(err as Error).message}`);
}

console.log("\n=== Balances after the FAILED transfer (must be unchanged — this is atomicity) ===");
console.log(`alice: ${getBalance("alice")}, bob: ${getBalance("bob")}`);
console.log("Notice bob's credit from the failed transfer never stuck, even though it ran");
console.log("before the constraint violation on alice's debit — the whole transaction rolled back.");
