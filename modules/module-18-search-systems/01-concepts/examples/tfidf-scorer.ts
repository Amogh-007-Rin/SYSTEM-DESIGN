/**
 * TF-IDF Scorer
 * Module: 18 — Search Systems
 * Concept: Builds an inverted index over a tiny in-memory document set, then
 *   scores and ranks documents for a query using TF-IDF — the classical
 *   relevance formula that rewards terms that are frequent in a document but
 *   rare across the corpus. This is the conceptual ancestor of BM25, which is
 *   what Elasticsearch/Lucene actually use in production (see 02-deep-dive).
 * Run: npx ts-node tfidf-scorer.ts
 * Dependencies: none
 */

interface SearchDocument {
  id: string;
  text: string;
}

// A simple whitespace/punctuation tokenizer + lowercasing — real systems also
// stem and remove stop words (see 01-concepts/README.md), omitted here to keep
// the scoring math the focus of this example.
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 0);
}

class TfIdfIndex {
  // term -> (docId -> term frequency in that doc)
  private postings: Map<string, Map<string, number>> = new Map();
  private docLengths: Map<string, number> = new Map();
  private totalDocs = 0;

  index(doc: SearchDocument): void {
    const tokens = tokenize(doc.text);
    this.docLengths.set(doc.id, tokens.length);
    this.totalDocs++;

    const termCounts = new Map<string, number>();
    tokens.forEach((token) => {
      termCounts.set(token, (termCounts.get(token) ?? 0) + 1);
    });

    termCounts.forEach((count, term) => {
      if (!this.postings.has(term)) {
        this.postings.set(term, new Map());
      }
      this.postings.get(term)!.set(doc.id, count);
    });
  }

  // Term Frequency: how often `term` appears in `docId`, relative to that
  // document's length. Normalizing by length prevents long documents from
  // automatically winning just by containing more words overall.
  private tf(term: string, docId: string): number {
    const rawCount = this.postings.get(term)?.get(docId) ?? 0;
    const docLength = this.docLengths.get(docId) ?? 1;
    return rawCount / docLength;
  }

  // Inverse Document Frequency: how rare `term` is across the whole corpus.
  // log(N / df) pushes common terms (high df) toward zero weight and rare
  // terms (low df) toward a higher weight.
  private idf(term: string): number {
    const docFrequency = this.postings.get(term)?.size ?? 0;
    if (docFrequency === 0) return 0; // term never seen — no signal to give
    return Math.log(this.totalDocs / docFrequency);
  }

  // Score a single document against a multi-term query: sum of tf*idf for
  // every query term, evaluated against that document.
  score(query: string, docId: string): number {
    const queryTerms = tokenize(query);
    return queryTerms.reduce(
      (total, term) => total + this.tf(term, docId) * this.idf(term),
      0
    );
  }

  // Rank every indexed document against the query, highest score first.
  // Documents scoring 0 (no query terms present at all) are dropped, mirroring
  // how a real search engine wouldn't return totally irrelevant documents.
  search(query: string): { docId: string; score: number }[] {
    const allDocIds = Array.from(this.docLengths.keys());
    return allDocIds
      .map((docId) => ({ docId, score: this.score(query, docId) }))
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score);
  }
}

// === USAGE EXAMPLE ===
const documents: SearchDocument[] = [
  { id: "doc1", text: "The quick brown fox jumps over the lazy dog" },
  { id: "doc2", text: "A quick search engine indexes documents quickly" },
  { id: "doc3", text: "Foxes are quick, clever, and elusive forest animals" },
  { id: "doc4", text: "Search engines rank documents by relevance, not just presence" },
  { id: "doc5", text: "The dog chased the fox through the quick-moving stream" },
];

const index = new TfIdfIndex();
for (const doc of documents) {
  index.index(doc);
}

function printResults(query: string): void {
  console.log(`\nQuery: "${query}"`);
  const results = index.search(query);
  if (results.length === 0) {
    console.log("  (no matching documents)");
    return;
  }
  for (const { docId, score } of results) {
    const original = documents.find((d) => d.id === docId)!.text;
    console.log(`  ${docId} (score=${score.toFixed(4)}): "${original}"`);
  }
}

console.log("=== TF-IDF Search over 5 documents ===");
printResults("quick fox");
printResults("search engine relevance");
printResults("lazy dog");

console.log(
  "\nNote how 'quick' (appears in 4/5 docs) contributes far less to the score " +
    "than 'fox' (appears in 2/5 docs) — IDF down-weights common terms and " +
    "up-weights rare, more discriminating ones."
);
