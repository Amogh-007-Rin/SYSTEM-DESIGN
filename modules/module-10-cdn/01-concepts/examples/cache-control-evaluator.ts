/**
 * Cache-Control Header Evaluator
 * Module: 10 — Content Delivery Networks (CDNs)
 * Concept: A CDN edge node decides whether to serve a cached response as a
 *   HIT, a MISS, or a STALE-WHILE-REVALIDATE hit purely by parsing the
 *   Cache-Control header stored alongside the cached response and comparing
 *   it against the entry's age. This models exactly that decision, the same
 *   logic a real edge node runs on every single request.
 * Run: npx ts-node cache-control-evaluator.ts
 * Dependencies: none
 */

// Parsed representation of a Cache-Control header. Real headers are a
// comma-separated list of directives (e.g. "public, max-age=3600,
// stale-while-revalidate=60") — modeling them as a typed object instead of
// passing the raw string around is what makes the rest of the logic readable.
interface CacheControlDirectives {
  public: boolean;
  private: boolean;
  noStore: boolean;
  noCache: boolean;
  maxAgeSeconds: number | null;
  staleWhileRevalidateSeconds: number | null;
}

// Parses a raw Cache-Control header string into structured directives.
// Real edge nodes do this once per response and cache the parsed result —
// re-parsing the same header string on every request would be wasted work.
function parseCacheControl(header: string): CacheControlDirectives {
  const directives: CacheControlDirectives = {
    public: false,
    private: false,
    noStore: false,
    noCache: false,
    maxAgeSeconds: null,
    staleWhileRevalidateSeconds: null,
  };

  for (const rawPart of header.split(",")) {
    const part = rawPart.trim().toLowerCase();
    if (part === "public") directives.public = true;
    else if (part === "private") directives.private = true;
    else if (part === "no-store") directives.noStore = true;
    else if (part === "no-cache") directives.noCache = true;
    else if (part.startsWith("max-age=")) {
      directives.maxAgeSeconds = parseInt(part.split("=")[1], 10);
    } else if (part.startsWith("stale-while-revalidate=")) {
      directives.staleWhileRevalidateSeconds = parseInt(part.split("=")[1], 10);
    }
  }

  return directives;
}

type CacheDecision = "MISS_NOT_CACHEABLE" | "HIT" | "STALE_WHILE_REVALIDATE" | "MISS_EXPIRED";

interface CachedResponse {
  url: string;
  cacheControlHeader: string;
  cachedAtEpochSeconds: number;
}

// The core decision an edge node makes on every request: given a cached
// entry's age (now - cachedAt) versus its max-age and optional
// stale-while-revalidate window, what should the edge do?
//
//   age <= maxAge                          -> HIT (serve from cache, origin never contacted)
//   maxAge < age <= maxAge + swr            -> STALE_WHILE_REVALIDATE (serve stale immediately,
//                                              kick off an async refresh in the background)
//   age > maxAge + swr (or no-store/private) -> MISS (must go to origin synchronously)
function evaluateCacheEntry(entry: CachedResponse, nowEpochSeconds: number): CacheDecision {
  const directives = parseCacheControl(entry.cacheControlHeader);

  // no-store/no-cache mean "never cache this at all," and private means
  // "only the end user's own browser may cache this — not a SHARED cache
  // like a CDN edge node." A real edge node wouldn't have stored any of
  // these in the first place, but we check explicitly here for clarity.
  if (directives.noStore || directives.noCache || directives.private) {
    return "MISS_NOT_CACHEABLE";
  }

  if (directives.maxAgeSeconds === null) {
    // No explicit freshness lifetime stated — treat as immediately stale,
    // mirroring how most real CDNs behave conservatively by default.
    return "MISS_EXPIRED";
  }

  const ageSeconds = nowEpochSeconds - entry.cachedAtEpochSeconds;

  if (ageSeconds <= directives.maxAgeSeconds) {
    return "HIT";
  }

  const swr = directives.staleWhileRevalidateSeconds ?? 0;
  if (ageSeconds <= directives.maxAgeSeconds + swr) {
    return "STALE_WHILE_REVALIDATE";
  }

  return "MISS_EXPIRED";
}

// === USAGE EXAMPLE ===
function secondsAgo(n: number): number {
  return Math.floor(Date.now() / 1000) - n;
}

const now = Math.floor(Date.now() / 1000);

const scenarios: { label: string; entry: CachedResponse }[] = [
  {
    label: "Fresh static asset (max-age=3600, cached 10s ago)",
    entry: {
      url: "/static/app.a1b2c3.js",
      cacheControlHeader: "public, max-age=3600, immutable",
      cachedAtEpochSeconds: secondsAgo(10),
    },
  },
  {
    label: "Expired API response within the stale-while-revalidate window",
    entry: {
      url: "/api/trending-products",
      cacheControlHeader: "public, max-age=30, stale-while-revalidate=60",
      cachedAtEpochSeconds: secondsAgo(45), // 45s old: past max-age=30, within +60s swr window
    },
  },
  {
    label: "Expired API response PAST the stale-while-revalidate window",
    entry: {
      url: "/api/trending-products",
      cacheControlHeader: "public, max-age=30, stale-while-revalidate=60",
      cachedAtEpochSeconds: secondsAgo(120), // 120s old: past max-age=30 AND past +60s swr window
    },
  },
  {
    label: "Personalized response marked private (never edge-cacheable, even though fresh)",
    entry: {
      url: "/api/account/balance",
      cacheControlHeader: "private, max-age=60",
      cachedAtEpochSeconds: secondsAgo(5),
    },
  },
  {
    label: "Explicit no-store response",
    entry: {
      url: "/api/checkout/submit",
      cacheControlHeader: "no-store",
      cachedAtEpochSeconds: secondsAgo(1),
    },
  },
];

console.log("=== CDN Edge Cache Decision Simulator ===\n");
for (const { label, entry } of scenarios) {
  const decision = evaluateCacheEntry(entry, now);
  console.log(`${label}`);
  console.log(`  URL: ${entry.url}`);
  console.log(`  Cache-Control: "${entry.cacheControlHeader}"`);
  console.log(`  Decision: ${decision}\n`);
}

console.log("=== Why this matters ===");
console.log("HIT                      -> origin never contacted, fastest possible response");
console.log("STALE_WHILE_REVALIDATE   -> user gets an instant (slightly stale) response while");
console.log("                            the edge refreshes its copy in the background");
console.log("MISS_EXPIRED / NOT_CACHEABLE -> origin must be contacted synchronously now");
