/**
 * Approximate Nearest Neighbor Search (RAG Retrieval / Recommendation Candidate Generation)
 * Module: 19 — ML Systems & AI Infrastructure
 * Concept: Both a RAG pipeline's retrieval step and a recommender's candidate
 *   generation step reduce to the same primitive: given a query vector, find
 *   the most similar vectors out of a large collection by cosine similarity.
 *   This file implements that primitive directly (a small brute-force scan,
 *   which is exactly what FAISS/HNSW exist to avoid doing at scale), then
 *   demonstrates the speed problem that motivates approximate methods by
 *   timing the scan against a much larger synthetic vector set.
 * Run: npx ts-node ann-search.ts
 * Dependencies: none (Node.js built-ins only)
 */

interface EmbeddedItem {
  id: string;
  text: string;
  vector: number[];
}

// Toy "embedding model": deterministically maps text to a small vector by
// hashing word presence into fixed dimensions. This is NOT a real embedding
// model (no semantic understanding) — it exists only so this file has no
// external dependencies, while still producing vectors where related toy
// documents land closer together than unrelated ones, which is enough to
// demonstrate the retrieval mechanism itself.
const VOCAB = [
  "cache", "database", "queue", "latency", "replica", "shard",
  "model", "embedding", "vector", "token", "gpu", "inference",
  "recommend", "user", "rank", "candidate", "drift", "monitor",
];

function embed(text: string): number[] {
  const words = text.toLowerCase().split(/\W+/).filter(Boolean);
  const vector = new Array(VOCAB.length).fill(0);
  for (const word of words) {
    const idx = VOCAB.indexOf(word);
    if (idx !== -1) vector[idx] += 1;
  }
  // L2-normalize so cosine similarity behaves well even for short/long texts.
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vector.map((v) => v / magnitude);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  // Vectors are already normalized in embed(), so dot product IS cosine
  // similarity here — but computing norms explicitly keeps this function
  // correct even if called with non-normalized vectors elsewhere.
  const normA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const normB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  if (normA === 0 || normB === 0) return 0;
  return dot / (normA * normB);
}

// ---------------------------------------------------------------------------
// Brute-force exact nearest-neighbor search — scans every vector. This is
// what FAISS/HNSW are built to avoid: it's O(n) per query in the number of
// indexed vectors, which becomes the bottleneck at millions of items.
// ---------------------------------------------------------------------------
class BruteForceVectorIndex {
  private items: EmbeddedItem[] = [];

  add(item: EmbeddedItem): void {
    this.items.push(item);
  }

  // The exact same operation a vector database's "top-k" query performs:
  // score the query against every stored vector, keep the highest-scoring k.
  search(queryVector: number[], topK: number): Array<{ item: EmbeddedItem; score: number }> {
    const scored = this.items.map((item) => ({
      item,
      score: cosineSimilarity(queryVector, item.vector),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  size(): number {
    return this.items.length;
  }
}

// === USAGE EXAMPLE ===
function main(): void {
  console.log("=== Simulating RAG retrieval / recommendation candidate generation ===\n");

  // A small "knowledge base" / "item catalog" of toy documents — stand-ins
  // for chunked document passages (RAG) or item descriptions (recommender).
  const corpus = [
    "A cache stores hot data in memory to reduce database latency for repeated reads.",
    "Database replicas serve read traffic while a primary handles writes for consistency.",
    "Sharding splits a database across many machines by key to scale write throughput.",
    "A message queue decouples producers from consumers and smooths traffic bursts.",
    "Vector embeddings represent text as dense numeric vectors for similarity search.",
    "GPU inference for a large language model uses a KV cache to avoid recomputing attention.",
    "Recommendation systems rank candidate items for a user after a cheap candidate generation step.",
    "Model monitoring detects data drift and concept drift before accuracy visibly degrades.",
  ];

  const index = new BruteForceVectorIndex();
  for (let i = 0; i < corpus.length; i++) {
    index.add({ id: `doc-${i}`, text: corpus[i], vector: embed(corpus[i]) });
  }

  const query = "How does caching reduce latency for database reads?";
  const queryVector = embed(query);

  console.log(`Query: "${query}"\n`);
  console.log("=== Top 3 nearest neighbors (simulating RAG retrieval top-k) ===");
  const results = index.search(queryVector, 3);
  results.forEach((r, rank) => {
    console.log(`${rank + 1}. [score=${r.score.toFixed(3)}] ${r.item.text}`);
  });

  console.log("\nIn a real RAG pipeline, these top-k passages would be inserted into");
  console.log("the LLM's prompt as grounding context alongside the user's question.");
  console.log("In a recommender, these would be the candidate items passed to a");
  console.log("heavier ranking model instead of being scored by every item directly.\n");

  // ---------------------------------------------------------------------
  // Demonstrate WHY approximate methods (FAISS, HNSW) exist: brute-force
  // search cost grows linearly with corpus size. We measure wall-clock time
  // scanning a synthetically large vector set to make that cost concrete.
  // ---------------------------------------------------------------------
  console.log("=== Why approximate nearest neighbor search exists: scan cost vs. corpus size ===");
  const sizes = [1_000, 10_000, 100_000];
  for (const size of sizes) {
    const bigIndex = new BruteForceVectorIndex();
    for (let i = 0; i < size; i++) {
      // Synthetic random unit vectors standing in for a large embedded corpus.
      const raw = Array.from({ length: VOCAB.length }, () => Math.random());
      const magnitude = Math.sqrt(raw.reduce((s, v) => s + v * v, 0)) || 1;
      bigIndex.add({ id: `synthetic-${i}`, text: "", vector: raw.map((v) => v / magnitude) });
    }

    const start = process.hrtime.bigint();
    bigIndex.search(queryVector, 5);
    const elapsedMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    console.log(`Brute-force scan over ${size.toLocaleString()} vectors: ${elapsedMs.toFixed(2)}ms`);
  }

  console.log("\n=== Lesson ===");
  console.log("Exact brute-force search cost scales linearly with the number of indexed");
  console.log("vectors — fine for thousands, a real bottleneck at millions, and far too");
  console.log("slow for a real-time RAG or recommendation request budget at that scale.");
  console.log("FAISS (IVF + product quantization) and HNSW (a navigable small-world graph)");
  console.log("both exist to turn this linear scan into a sub-linear search, accepting a");
  console.log("small, tunable amount of recall loss — returning the 2nd-closest vector");
  console.log("instead of the true closest one occasionally — in exchange for the orders");
  console.log("of magnitude in speed that production retrieval at scale requires.");
}

main();
