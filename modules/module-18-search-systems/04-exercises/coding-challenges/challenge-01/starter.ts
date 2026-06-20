/**
 * Trie-Based Autocomplete
 * Module: 18 — Search Systems
 * Concept: A prefix tree (Trie) where each node represents one character of
 *   a path from the root. Walking down the tree by the characters typed so
 *   far narrows instantly to every word sharing that prefix — matching. To
 *   support real autocomplete, each word also carries a weight (e.g.
 *   historical search frequency), and getSuggestions must return only the
 *   top-K highest-weighted matches, not just "all of them" — ranking.
 * Run: npx ts-node starter.ts
 * Dependencies: none
 */

/**
 * TODO: Implement TrieNode and Trie.
 *
 * TrieNode should track:
 *   children: Map<string, TrieNode> — one entry per next character
 *   isEndOfWord: boolean — true if a word ends at this node
 *   word: string | null — the full word, only set when isEndOfWord is true
 *   weight: number — only meaningful when isEndOfWord is true
 *
 * Trie should support:
 *   insert(word, weight): void
 *     - Walk/create a path through children for each character of `word`.
 *     - At the final node, mark isEndOfWord = true, store the word and weight.
 *     - If the word already exists, update its weight (don't duplicate).
 *
 *   getSuggestions(prefix, topK): string[]
 *     - Walk to the node representing `prefix`. If the path doesn't fully
 *       exist, return [].
 *     - From that node, collect every word in the subtree (every completed
 *       word reachable below it, including the node itself if it's a
 *       complete word).
 *     - Sort by weight descending and return the top K words (strings only).
 *
 *   (Helper) collectWords(node, results): void
 *     - Recursively walks a subtree collecting { word, weight } pairs.
 */

interface WordWeight {
  word: string;
  weight: number;
}

class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEndOfWord: boolean = false;
  word: string | null = null;
  weight: number = 0;
}

class Trie {
  private root: TrieNode = new TrieNode();

  insert(word: string, weight: number): void {
    // TODO: implement
    throw new Error("Not implemented");
  }

  getSuggestions(prefix: string, topK: number): string[] {
    // TODO: implement
    throw new Error("Not implemented");
  }

  private collectWords(node: TrieNode, results: WordWeight[]): void {
    // TODO: implement
    throw new Error("Not implemented");
  }
}

// === USAGE EXAMPLE ===
const trie = new Trie();
const dictionary: WordWeight[] = [
  { word: "react", weight: 50 },
  { word: "redux", weight: 30 },
  { word: "redis", weight: 80 },
  { word: "red", weight: 10 },
  { word: "reach", weight: 5 },
  { word: "ready", weight: 65 },
];

for (const { word, weight } of dictionary) {
  trie.insert(word, weight);
}

console.log('getSuggestions("re", 3):', trie.getSuggestions("re", 3));
// Expected: ["redis", "ready", "react"] — top 3 by weight among all words starting with "re"

console.log('getSuggestions("rea", 2):', trie.getSuggestions("rea", 2));
// Expected: ["ready", "react"] — only "ready" (65), "react" (50), and
// "reach" (5) start with "rea"; top 2 by weight excludes "reach"

console.log('getSuggestions("xyz", 5):', trie.getSuggestions("xyz", 5));
// Expected: [] — no words start with "xyz"
