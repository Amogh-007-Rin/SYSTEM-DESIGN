# Coding Challenge 03: Bloom Filter

## Problem Statement

Implement a Bloom filter from scratch: a fixed-size bit array plus multiple hash functions, supporting `add(value)` and `mightContain(value)`, with no false negatives and a tunable false-positive rate.

This is the same data structure demonstrated in [`02-deep-dive/examples/bloom-filter.ts`](../../../02-deep-dive/examples/bloom-filter.ts) — implement it yourself here before checking that version.

## Requirements

1. `add(value)` — hashes `value` with `hashCount` independent positions and sets each corresponding bit.
2. `mightContain(value)` — returns `false` only if at least one of the value's bit positions is unset (guaranteed absent); returns `true` otherwise (present, or a false positive).
3. Derive multiple hash positions from two underlying hash functions via double hashing, rather than computing `hashCount` fully independent hashes.

## Starter / Solution

- [`starter.ts`](./starter.ts)
- [`solution.ts`](./solution.ts)

## Usage Example

```bash
npx ts-node starter.ts
```

Expect every added value to be correctly reported as `mightContain() === true`, and a small but nonzero false-positive rate (a handful of false positives out of 1000 never-added values, with the configuration in the example) when checking values that were never added.
