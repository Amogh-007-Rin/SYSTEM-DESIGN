# Sample Answer: "Design a Distributed Rate Limiter"

> A fully worked senior/staff-level answer, building on the single-node [token bucket from Module 03](../../module-03-apis/04-exercises/coding-challenges/challenge-03/) and the [distributed rate limiting concepts](../01-concepts/README.md#rate-limiting-at-scale) covered earlier in this module.

---

## Step 1: Clarify Requirements (Stated Out Loud, With Defaults Proposed)

**Functional requirements:**
- Limit each client (identified by API key or user ID) to **N requests per time window** (e.g., 100 requests/minute).
- Requests over the limit are rejected with a clear signal (HTTP 429) and a `Retry-After` hint.
- The limit must hold **regardless of which application server handles the request** — this is the entire reason "distributed" is in the prompt; a per-node limiter is the wrong answer here.

**Non-functional requirements (proposed, since the prompt didn't specify):**
- **Scale:** I'll assume ~50,000 distinct clients, ~500,000 requests/second system-wide at peak — typical of a mid-large API platform. I'll flag if this changes the design.
- **Latency:** the rate-limit check sits on the hot path of every request, so it must add single-digit milliseconds at most — this is the requirement that rules out anything involving a synchronous cross-region call or a slow consensus protocol per check.
- **Accuracy vs. availability:** I'll assume slight over-admission under rare failure conditions (e.g., briefly allowing a few more requests than the exact limit during a Redis failover) is acceptable, in exchange for the rate limiter never becoming a hard availability dependency that takes down the whole API if it's unhealthy. I'll state explicitly where this trade-off is made.

> 🎯 **Interview Tip:** Notice the structure here — state the requirement, propose a number/default, and explicitly invite correction. This is the "drive the conversation" pattern from [`03-interview-prep/README.md`](./README.md) applied directly: move forward with a stated assumption rather than stalling on a question.

---

## Step 2: Capacity Estimation

- **500,000 requests/sec** system-wide, each requiring one rate-limit check.
- Each check is one Redis round trip (a single atomic script execution, detailed below) — Redis can comfortably do single-digit-microsecond in-memory operations, but the real ceiling is network round trips per instance, typically in the high tens-of-thousands to low hundreds-of-thousands of ops/sec per Redis node depending on payload and persistence settings.
- At 500K ops/sec, a single Redis node is not enough headroom for comfort — this tells me **I need to shard the rate-limiter's Redis layer across multiple nodes**, not just lean on one beefy instance. Sharding by client ID (consistent hashing, per [Module 04](../../module-04-databases/04-exercises/coding-challenges/challenge-03/)) is natural here: each client's counter only ever needs to live on one shard, since the limit is per-client, not global.
- Memory: each client needs a small fixed-size record (current token count + last-refill timestamp) — call it ~50 bytes including key overhead. 50,000 clients × 50 bytes is trivial (a few MB) — **memory is not the constraint here, throughput and round-trip latency are.**

---

## Step 3: Architecture

```
Client → Load Balancer → API Server (any node, any region)
                              │
                              ▼
                    Rate Limiter Check
                  (Redis cluster, sharded
                   by client ID, Lua script)
                              │
                  allowed? ───┴─── rejected?
                      │                │
                      ▼                ▼
                Forward to          Return 429
              backend service     + Retry-After
```

### Why Redis + a Lua Script (Not Application-Level Check-Then-Set)

The token bucket logic is: read the current token count and last-refill time, compute how many tokens have accrued since then, cap at bucket capacity, attempt to consume a token, write the new state back. That's multiple logical steps — if done as separate Redis commands from application code (`GET`, compute in app, `SET`), there's a race window: two requests from the same client, landing on two different API servers at the same instant, can both read the same "1 token left" state before either writes back the decrement, and both get allowed. This is the exact race condition called out in [this module's concepts](../01-concepts/README.md#rate-limiting-at-scale).

**The fix: push the entire check-and-decrement into a single Lua script, executed via Redis's `EVAL`.** Redis guarantees a Lua script runs atomically — no other client's command can interleave with it mid-script. This converts "read, compute, write" from three round trips with a race window into one atomic round trip with no race window.

```lua
-- token_bucket.lua
-- KEYS[1] = bucket key (e.g., "ratelimit:{client_id}")
-- ARGV[1] = bucket capacity
-- ARGV[2] = refill rate (tokens per second)
-- ARGV[3] = current timestamp (ms, passed in from the app server, not computed
--           in Lua, since Redis's own clock can differ slightly node to node)
-- ARGV[4] = tokens requested (usually 1)

local capacity      = tonumber(ARGV[1])
local refillRate    = tonumber(ARGV[2])
local now           = tonumber(ARGV[3])
local requested      = tonumber(ARGV[4])

local bucket = redis.call("HMGET", KEYS[1], "tokens", "last_refill_ms")
local tokens = tonumber(bucket[1])
local lastRefill = tonumber(bucket[2])

if tokens == nil then
  -- First request ever for this client: bucket starts full.
  tokens = capacity
  lastRefill = now
end

-- Refill based on elapsed time since the last check (lazy refill — no
-- background timer needed, the same approach as the single-node version).
local elapsedSeconds = math.max(0, (now - lastRefill) / 1000)
tokens = math.min(capacity, tokens + elapsedSeconds * refillRate)

local allowed = 0
if tokens >= requested then
  tokens = tokens - requested
  allowed = 1
end

redis.call("HMSET", KEYS[1], "tokens", tokens, "last_refill_ms", now)
redis.call("EXPIRE", KEYS[1], 3600) -- safety-net TTL: clean up idle clients' keys

return { allowed, tokens }
```

The application server calls this with `EVALSHA` (the cached-script-hash form of `EVAL`, to avoid re-sending the script body on every call) and gets back `{allowed, tokensRemaining}` in one atomic round trip.

### Sharding the Redis Layer

- Hash each client ID to one of N Redis shards (consistent hashing, so adding/removing shards reshuffles a minimal fraction of clients — covered in depth in Module 04).
- Each client's bucket lives entirely on one shard — the per-client check never needs to coordinate across shards, since the limit is per-client, not global across all clients. This keeps every check a single-shard, single-round-trip operation even as the system scales horizontally.

### Failure Handling (the Trade-off Named Up Front)

If the Redis shard responsible for a given client is briefly unavailable, the design has two choices, and I'm naming the trade-off explicitly rather than picking silently:
- **Fail closed (reject all requests)** — never over-admits, but turns a rate-limiter outage into a full API outage for affected clients. Wrong choice here, given the non-functional requirement I proposed in Step 1 that the rate limiter shouldn't become a hard availability dependency.
- **Fail open (allow all requests during the outage)** — the rate limiter briefly stops enforcing the limit, but the API itself stays up. **This is my choice**, given the stated requirement: a short window of unenforced rate limits is a far smaller problem than the whole API going down because a secondary system (the rate limiter) had a blip.

---

## Step 4: Trade-offs Summary

| Decision | Choice | Trade-off |
|---|---|---|
| Atomicity mechanism | Redis Lua script (`EVAL`/`EVALSHA`) | Atomic, single round trip; couples the rate limiter to Redis's scripting feature specifically (a managed Redis offering without Lua support wouldn't work) |
| Sharding key | Client ID, consistent hashing | Each check stays single-shard (fast); a single extremely high-traffic client's checks all land on one shard (a hot-shard risk for the rate limiter itself, separate from the hot-key problem covered in [Module 05](../../module-05-caching/02-deep-dive/README.md)) |
| Failure mode | Fail open on Redis unavailability | API availability preserved; rate limit briefly unenforced during the outage window — acceptable given the stated priority |
| Refill strategy | Lazy refill (computed on each check, not a background timer) | No background job needed, scales naturally with shard count; identical approach to the single-node version in Module 03, just made atomic and shared |

---

## Follow-Up Questions an Interviewer Might Ask

- **"What if you need a global limit across all clients, not per-client?"** — A global counter is a single hot key by definition (every request touches it), which reintroduces the hot-key problem even with sharding. Mitigate by sharding the *global* limit into M sub-counters (each handling limit/M), checked probabilistically or round-robin, accepting slightly less precise global enforcement in exchange for not funneling every single request through one Redis key.
- **"How would you rate-limit by IP instead of API key, given IPs can be spoofed or shared (NAT)?"** — Note this is a real trade-off, not just a key-naming change: shared-NAT clients (e.g., an office behind one IP) would be unfairly limited together. A layered approach — a looser IP-based limit as a coarse defense plus a tighter authenticated-client-ID limit as the real enforcement — handles both unauthenticated abuse and fair per-client limits.
- **"How would you test that this actually enforces the limit correctly under concurrent load?"** — Exactly the scenario the single-node version's test in Module 03 and this module's own examples are designed to make visible: spin up many concurrent simulated clients hitting the same bucket key simultaneously and confirm the total admitted count never exceeds the configured limit, which is the direct test of whether the atomicity actually held.
