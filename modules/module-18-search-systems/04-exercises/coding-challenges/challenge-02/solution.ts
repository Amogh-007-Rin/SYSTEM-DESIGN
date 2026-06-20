// SOLUTION FILE — try starter.ts first!
/**
 * Basic Inverted Index
 * Module: 18 — Search Systems
 * Concept: An inverted index maps each unique term to the set of document
 *   IDs containing it (a postings list), turning "find documents with this
 *   word" into a lookup instead of a scan. Multi-term queries become set
 *   operations on postings lists: intersection for AND semantics, union for
 *   OR semantics.
 * Run: npx ts-node solution.ts
 * Dependencies: none
 */

type SearchMode = "AND" | "OR";

// Lowercase + split on any run of non-alphanumeric characters. A real search
// engine would also stem ("jumps" -> "jump") and strip stop words — omitted
// here to keep the postings-list mechanics the focus of this exercise (see
// 01-concepts/README.md for why that's a deliberate simplification).
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 0);
}

class InvertedIndex {
  // term -> set of document IDs containing that term at least once
  private postings: Map<string, Set<string>> = new Map();

  addDocument(id: string, text: string): void {
    const terms = tokenize(text);
    const uniqueTerms = new Set(terms);
    uniqueTerms.forEach((term) => {
      if (!this.postings.has(term)) {
        this.postings.set(term, new Set());
      }
      this.postings.get(term)!.add(id);
    });
  }

  search(query: string, mode: SearchMode): string[] {
    const queryTerms = tokenize(query);
    if (queryTerms.length === 0) return [];

    // Look up each term's postings set — an empty Set for any term that was
    // never indexed, which naturally makes AND queries containing it return
    // nothing (intersecting with empty = empty) and OR queries containing it
    // contribute nothing (union with empty = unchanged).
    const postingsLists: Set<string>[] = queryTerms.map(
      (term) => this.postings.get(term) ?? new Set<string>()
    );

    const result =
      mode === "AND"
        ? this.intersectAll(postingsLists)
        : this.unionAll(postingsLists);

    return Array.from(result).sort();
  }

  // Intersects a list of Sets by folding from the smallest set outward —
  // checking membership against progressively larger sets. Order doesn't
  // affect correctness here, but starting from the first set and narrowing
  // is the simplest correct approach for this exercise's scale.
  private intersectAll(sets: Set<string>[]): Set<string> {
    if (sets.length === 0) return new Set();
    let result = new Set(sets[0]);
    for (let i = 1; i < sets.length; i++) {
      const next = sets[i];
      result = new Set(Array.from(result).filter((id) => next.has(id)));
    }
    return result;
  }

  private unionAll(sets: Set<string>[]): Set<string> {
    const result = new Set<string>();
    sets.forEach((set) => set.forEach((id) => result.add(id)));
    return result;
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
// Expected: ["doc1", "doc2", "doc3"] — any document containing "quick" OR "fox"/"foxes"...
// note "foxes" matches doc3 only via the "quick" term, not "fox"

console.log('search("lazy dog", "AND"):', index.search("lazy dog", "AND"));
// Expected: ["doc1", "doc5"] — both contain "lazy" and "dog"

console.log('search("nonexistent", "AND"):', index.search("nonexistent", "AND"));
// Expected: [] — term was never indexed

console.log('search("relevance ranking", "OR"):', index.search("relevance ranking", "OR"));
// Expected: ["doc4"] — "ranking" was never indexed (doc4 has "rank", not "ranking"),
// but "relevance" alone still matches doc4 under OR semantics

console.log("\nPostings list sizes (term -> document count):");
["quick", "dog", "search", "fox"].forEach((term) => {
  const docs = index.search(term, "OR");
  console.log(`  "${term}" -> ${docs.length} document(s): [${docs.join(", ")}]`);
});
