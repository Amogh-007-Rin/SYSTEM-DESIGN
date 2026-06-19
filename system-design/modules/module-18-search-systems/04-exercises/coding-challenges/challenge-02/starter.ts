/**
 * Basic Inverted Index
 * Module: 18 — Search Systems
 * Concept: An inverted index maps each unique term to the set of document
 *   IDs containing it (a postings list), turning "find documents with this
 *   word" into a lookup instead of a scan. Multi-term queries become set
 *   operations on postings lists: intersection for AND semantics, union for
 *   OR semantics.
 * Run: npx ts-node starter.ts
 * Dependencies: none
 */

type SearchMode = "AND" | "OR";

/**
 * TODO: Implement tokenize().
 * Lowercase the input and split on any run of non-alphanumeric characters,
 * filtering out empty strings (e.g. from leading/trailing punctuation).
 * "Hello, World!" -> ["hello", "world"]
 */
function tokenize(text: string): string[] {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * TODO: Implement InvertedIndex.
 *
 * Internals:
 *   postings: Map<string, Set<string>> — term -> set of document IDs
 *
 * addDocument(id, text):
 *   - Tokenize `text`.
 *   - For each unique term, ensure a postings Set exists for it, and add `id`.
 *
 * search(query, mode):
 *   - Tokenize `query` into query terms.
 *   - Look up each term's postings Set (an empty Set if the term was never
 *     indexed).
 *   - mode === "AND": intersect all postings sets.
 *   - mode === "OR": union all postings sets.
 *   - Return the result as a SORTED array of document IDs.
 */
class InvertedIndex {
  private postings: Map<string, Set<string>> = new Map();

  addDocument(id: string, text: string): void {
    // TODO: implement
    throw new Error("Not implemented");
  }

  search(query: string, mode: SearchMode): string[] {
    // TODO: implement
    throw new Error("Not implemented");
  }
}

// === USAGE EXAMPLE ===
const index = new InvertedIndex();
index.addDocument("doc1", "The quick brown fox jumps over the lazy dog");
index.addDocument("doc2", "A quick search engine indexes documents quickly");
index.addDocument("doc3", "Foxes are quick and clever forest animals");
index.addDocument("doc4", "Search engines rank documents by relevance");
index.addDocument("doc5", "The lazy dog sleeps all day in the warm sun");

console.log('search("fox", "OR"):', index.search("fox", "OR"));
// Expected: ["doc1"] — only "fox" (singular) is indexed for doc1; "foxes" in
// doc3 is a different token since this index doesn't stem plurals

console.log('search("quick fox", "AND"):', index.search("quick fox", "AND"));
// Expected: ["doc1"] — only doc1 contains BOTH "quick" and "fox"

console.log('search("quick fox", "OR"):', index.search("quick fox", "OR"));
// Expected: ["doc1", "doc2", "doc3"] — any document containing "quick" OR "fox"

console.log('search("lazy dog", "AND"):', index.search("lazy dog", "AND"));
// Expected: ["doc1", "doc5"] — both contain "lazy" and "dog"

console.log('search("nonexistent", "AND"):', index.search("nonexistent", "AND"));
// Expected: [] — term was never indexed
