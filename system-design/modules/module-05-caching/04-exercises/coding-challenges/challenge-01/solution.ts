// SOLUTION FILE — try starter.ts first!
/**
 * LRU Cache — Least Recently Used
 * Module: 05 — Caching
 * Concept: LRU eviction uses a doubly-linked list (O(1) move-to-front)
 *   + hashmap (O(1) lookup). Both get and put are O(1).
 * Run: npx ts-node solution.ts
 * Dependencies: none
 */

interface DLLNode<V> {
  key: string;
  value: V;
  prev: DLLNode<V> | null;
  next: DLLNode<V> | null;
}

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
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  private removeNode(node: DLLNode<V>): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  private removeLRU(): DLLNode<V> {
    const lru = this.tail.prev as DLLNode<V>;
    this.removeNode(lru);
    return lru;
  }

  get(key: string): V | null {
    const node = this.map.get(key);
    if (!node) return null;
    // A read still counts as "use" — move it to the front so it survives
    // longer than entries that are merely sitting in the cache unread.
    this.removeNode(node);
    this.addToFront(node);
    return node.value;
  }

  put(key: string, value: V): void {
    const existing = this.map.get(key);
    if (existing) {
      existing.value = value;
      this.removeNode(existing);
      this.addToFront(existing);
      return;
    }

    if (this.size >= this.capacity) {
      const evicted = this.removeLRU();
      this.map.delete(evicted.key);
      this.size--;
    }

    const node: DLLNode<V> = { key, value, prev: null, next: null };
    this.addToFront(node);
    this.map.set(key, node);
    this.size++;
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
