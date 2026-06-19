// SOLUTION FILE — try starter.ts first!
/**
 * Trie-Based Autocomplete
 * Module: 18 — Search Systems
 * Concept: A prefix tree (Trie) where each node represents one character of
 *   a path from the root. Walking down the tree by the characters typed so
 *   far narrows instantly to every word sharing that prefix — matching. To
 *   support real autocomplete, each word also carries a weight (e.g.
 *   historical search frequency), and getSuggestions returns only the
 *   top-K highest-weighted matches, not just "all of them" — ranking.
 * Run: npx ts-node solution.ts
 * Dependencies: none
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

  // Walks (creating nodes as needed) one path per character of `word`.
  // Re-inserting an existing word simply overwrites its weight in place,
  // rather than creating a duplicate entry anywhere.
  insert(word: string, weight: number): void {
    let current = this.root;
    for (const char of word) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
    }
    current.isEndOfWord = true;
    current.word = word;
    current.weight = weight;
  }

  // Two-phase: (1) walk to the node representing `prefix` — O(prefix length)
  // and touches nothing outside that path; (2) collect every completed word
  // in the subtree below that node, which only visits words that actually
  // share the prefix, never the whole Trie.
  getSuggestions(prefix: string, topK: number): string[] {
    let current = this.root;
    for (const char of prefix) {
      const next = current.children.get(char);
      if (!next) {
        return []; // no word in the Trie has this prefix at all
      }
      current = next;
    }

    const matches: WordWeight[] = [];
    this.collectWords(current, matches);

    matches.sort((a, b) => b.weight - a.weight);
    return matches.slice(0, topK).map((m) => m.word);
  }

  // Recursively walks a subtree, collecting every completed word found
  // (including at `node` itself, if it happens to be a complete word and not
  // just a prefix of a longer one — e.g. "red" is both a complete word and a
  // prefix of "redux").
  private collectWords(node: TrieNode, results: WordWeight[]): void {
    if (node.isEndOfWord && node.word !== null) {
      results.push({ word: node.word, weight: node.weight });
    }
    node.children.forEach((child) => this.collectWords(child, results));
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

console.log('getSuggestions("red", 10):', trie.getSuggestions("red", 10));
// Expected: ["redis", "redux", "red"] — "red" is itself a complete word AND a
// prefix of "redux"/"redis", demonstrating a node can be both at once.

// Re-inserting an existing word updates its weight rather than duplicating it.
trie.insert("red", 999);
console.log('After re-inserting "red" with weight 999:');
console.log('getSuggestions("red", 10):', trie.getSuggestions("red", 10));
// Expected: ["red", "redis", "redux"] — "red" now outranks the others
