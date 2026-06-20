/**
 * Cursor vs. Offset Pagination
 * Module: 03 — API Design
 * Concept: Offset pagination scans and discards rows up to the offset; cursor
 *   pagination seeks directly to a position. This file simulates both against
 *   an in-memory "table" and counts how many rows each strategy actually
 *   touches, which is what changes (not just the API shape) at real scale.
 * Run: npx ts-node cursor-pagination.ts
 * Dependencies: none
 */

interface Row {
  id: number;
  name: string;
}

// Simulates a sorted table (sorted by id, as a real indexed column would be).
const TABLE_SIZE = 100_000;
const table: Row[] = Array.from({ length: TABLE_SIZE }, (_, i) => ({
  id: i + 1,
  name: `item-${i + 1}`,
}));

interface PageResult {
  rows: Row[];
  rowsTouched: number; // models how much work the database actually did
}

// OFFSET-based: to return rows [offset, offset+limit), a naive scan touches
// every row from 0 up to offset+limit, even though most are discarded.
function offsetPage(offset: number, limit: number): PageResult {
  const rowsTouched = Math.min(offset + limit, table.length);
  const rows = table.slice(offset, offset + limit);
  return { rows, rowsTouched };
}

// CURSOR-based: an index seek jumps directly to the first row matching
// `id > cursor`, then reads exactly `limit` rows forward — touched work is
// independent of how deep into the dataset the cursor points.
function cursorPage(cursor: number, limit: number): PageResult {
  // Array.findIndex models the index seek; a real B-tree index does this in
  // O(log n), not O(n) — the point illustrated here is rows READ, not the
  // seek's own cost.
  const startIndex = table.findIndex((row) => row.id > cursor);
  if (startIndex === -1) return { rows: [], rowsTouched: 0 };
  const rows = table.slice(startIndex, startIndex + limit);
  return { rows, rowsTouched: rows.length };
}

// === USAGE EXAMPLE ===
const PAGE_SIZE = 20;

console.log("=== Fetching page 5 (rows ~80-100) ===");
const offsetEarly = offsetPage(80, PAGE_SIZE);
console.log(`Offset pagination touched ${offsetEarly.rowsTouched} rows to return ${offsetEarly.rows.length}`);
const cursorEarly = cursorPage(80, PAGE_SIZE);
console.log(`Cursor pagination touched ${cursorEarly.rowsTouched} rows to return ${cursorEarly.rows.length}`);

console.log("\n=== Fetching deep into the dataset (row ~99,000) ===");
const offsetDeep = offsetPage(99_000, PAGE_SIZE);
console.log(`Offset pagination touched ${offsetDeep.rowsTouched.toLocaleString()} rows to return ${offsetDeep.rows.length}`);
const cursorDeep = cursorPage(99_000, PAGE_SIZE);
console.log(`Cursor pagination touched ${cursorDeep.rowsTouched} rows to return ${cursorDeep.rows.length}`);

console.log("\nNotice: offset pagination's cost grows with depth; cursor pagination's doesn't.");

console.log("\n=== Stability under concurrent writes ===");
console.log("If 5 new rows are inserted before id=50 while a user is on page 3:");
console.log("- Offset pagination: page boundaries shift, causing skipped or duplicated rows");
console.log("- Cursor pagination: next page still starts exactly after the last seen id — no shift");
