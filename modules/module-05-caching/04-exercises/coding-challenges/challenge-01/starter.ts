/**
 * LRU Cache — Least Recently Used
 * Module: 05 — Caching
 * Concept: LRU eviction uses a doubly-linked list (O(1) move-to-front)
 *   + hashmap (O(1) lookup). Both get and put are O(1).
 * Run: npx ts-node starter.ts
 * Dependencies: none
 */

interface DLLNode<V> {
  key: string;
  value: V;
  prev: DLLNode<V> | null;
  next: DLLNode<V> | null;
}

/**
 * TODO: Implement LRUCache<V>.
 *
 * Internals:
 *   map: Map<string, DLLNode<V>>
 *   head: DLLNode (dummy, most-recently-used end)
 *   tail: DLLNode (dummy, least-recently-used end)
 *   size: number
 *
 * Private helpers:
 *   addToFront(node): insert node right after head
 *   removeNode(node): unlink from list (fix prev/next pointers)
 *   removeLRU(): remove node before tail, return it
 *
 * Public:
 *   get(key): V | null — move to front on hit
 *   put(key, value): void — evict LRU if at capacity before adding
 *   printState(): void — already implemented below, do not modify
 */
class LRUCache<V> {
  private capacity: number;
  private size = 0;
  private map: Map<string, DLLNode<V>> = new Map();
  private head: DLLNode<any>;
  private tail: DLLNode<any>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.head = { key: "__head__", value: null, prev: null, next: null };
    this.tail = { key: "__tail__", value: null, prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  private addToFront(node: DLLNode<V>): void {
    // TODO: implement
  }

  private removeNode(node: DLLNode<V>): void {
    // TODO: implement
  }

  private removeLRU(): DLLNode<V> {
    // TODO: implement
    throw new Error("Not implemented");
  }

  get(key: string): V | null {
    // TODO: implement
    throw new Error("Not implemented");
  }

  put(key: string, value: V): void {
    // TODO: implement
  }

  printState(): void {
    const items: string[] = [];
    let curr = this.head.next;
    while (curr && curr !== this.tail) {
      items.push(`${curr.key}:${curr.value}`);
      curr = curr.next;
    }
    console.log(`[MRU→LRU]: [${items.join(", ")}] (${this.size}/${this.capacity})`);
  }
}

// === USAGE EXAMPLE ===
const cache = new LRUCache<number>(3);
cache.put("a", 1); cache.printState(); // [a:1]
cache.put("b", 2); cache.printState(); // [b:2, a:1]
cache.put("c", 3); cache.printState(); // [c:3, b:2, a:1]
cache.get("a");    cache.printState(); // [a:1, c:3, b:2] — a promoted
cache.put("d", 4); cache.printState(); // [d:4, a:1, c:3] — b evicted
console.log("get b:", cache.get("b")); // null
