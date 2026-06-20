# Design Challenge 01 — Solution: Search System for Airbnb

## Document Shape and Mappings

Each listing is indexed as a single denormalized document combining data that lives in several normalized source tables (listing details, host profile, aggregate reviews, current availability calendar):

| Field | Type | Why |
|---|---|---|
| `title`, `description` | `text` | Full-text matching when a user searches free text ("cozy cabin near the lake") |
| `city`, `neighborhood`, `amenities[]`, `instant_book` | `keyword` | Exact-match filtering and faceted aggregation — these are never matched via relevance scoring |
| `location` | `geo_point` | Location-based queries (bounding box, radius, distance ranking) |
| `price_per_night`, `bedrooms`, `max_guests` | numeric | Range filters ("$50-$150," "2+ bedrooms") |
| `host_rating`, `review_count`, `booking_conversion_rate` | numeric | Ranking signals, not user-facing filters |
| `available_date_ranges` | a nested/range structure | Filtering by the user's requested check-in/check-out dates |

## Location Search

- **Map viewport search** ("show listings in this rectangle"): a `geo_bounding_box` query against the `location` field — Elasticsearch's `geo_point` type supports this natively and efficiently.
- **City/place name search** ("Paris"): resolved first to a center point + radius (or a known polygon for the city) via a geocoding step, then executed as a `geo_distance` (radius) query, or a `geo_bounding_box` if using a precomputed city boundary.
- **Indexing technique**: Elasticsearch's internal geo-indexing (conceptually similar to geohashing/quad-trees, covered in [02-deep-dive](../../02-deep-dive/README.md#geo-search-geohashing-and-s2-cells)) means both of the above are efficient prefix-style lookups under the hood, not a per-listing distance computation against every row.

> 🎯 I'd explicitly mention the geohash boundary-adjacency edge case here: a listing just across a grid cell boundary from the map center could be geographically closer than one technically "inside" the matched cell — Elasticsearch's geo queries handle this correctly internally (unlike a naive hand-rolled geohash-prefix-only implementation), which is itself a reason to use the built-in geo query types rather than reimplementing geohashing by hand for a quadrant search like this.

## Filters + Faceted Counts

A single Elasticsearch query combines:
- `filter` clauses for `geo_bounding_box`/`geo_distance` (location), `price_per_night` range, `bedrooms` range, `amenities` terms, `instant_book` term, and a date-range overlap check against `available_date_ranges` — none of these affect relevance scoring, they're strict yes/no narrowing.
- `aggregations` run alongside the filtered query, computing per-facet counts (`terms` aggregation on `amenities` for "342 have a pool," a `range` aggregation on `price_per_night` for the price histogram shown in the UI) — computed within the location + date-filtered set, so facet counts always reflect "results for this location and these dates," updating live as filters are added.

## Ranking

Beyond matching the filters, listings are ordered by a function score blending:
- **Distance** (if searching a specific point, not just a city) — closer listings rank higher, via a distance-decay function, not just a hard cutoff.
- **Host quality** — `host_rating` and `review_count` (with a minimum review-count threshold so one 5-star review doesn't outrank an established Superhost with hundreds of reviews).
- **Booking conversion rate** — listings that historically convert well for similar searches (a strong implicit signal that the listing genuinely satisfies searchers, beyond just matching filters).
- **Price competitiveness** — a relative signal (price vs. comparable listings in the same area), not an absolute one, since "cheapest first" isn't usually what produces the best marketplace outcome (and isn't what most marketplaces actually optimize for by default).

> ⚠️ **Warning:** Pure "cheapest first" or pure "highest rated first" ranking both have known failure modes in two-sided marketplaces — cheapest-first can surface low-quality or even fraudulent listings, and highest-rated-first can create winner-take-all dynamics that starve new, legitimately good listings of bookings before they accumulate reviews. A blended, measured ranking function (and active experimentation) is the realistic answer, not a single dominant signal.

## Keeping the Index in Sync

Different fields have very different freshness requirements:
- **Availability** (a booking was just made) — must be reflected immediately; stale availability means showing bookable listings that are actually unavailable, directly breaking the product. Event-driven (CDC) indexing off the booking service's write path, ideally synchronous or near-synchronous for this specific field.
- **Price changes** — event-driven, near-real-time is good but a few-seconds delay is tolerable.
- **Review count / rating** — relaxed; a periodic (e.g., hourly) batch recompute and reindex is acceptable, since a review count being slightly stale has low user impact.

This is the same polling-vs-event-driven trade-off from [02-deep-dive](../../02-deep-dive/README.md#keeping-search-indexes-in-sync-with-the-database), applied per-field rather than uniformly — a key insight for this specific system: not every field needs the same sync strategy.

## Trade-offs

| Decision | Choice | Trade-off |
|---|---|---|
| Availability freshness | Synchronous/near-real-time event-driven indexing, stricter than other fields | More infrastructure investment specifically for this field; justified because stale availability is a directly broken booking experience, not a cosmetic one |
| Ranking signal mix | Blended function score (distance + quality + conversion + price), not a single dominant signal | Harder to explain/debug than a single sort key; but a single signal produces known-bad marketplace dynamics (race to the bottom on price, or winner-take-all on ratings) |
| Geo query mechanism | Elasticsearch's native `geo_point`/`geo_bounding_box`/`geo_distance`, not a hand-rolled geohash prefix index | Less custom control, but avoids reimplementing the boundary-adjacency edge cases that a naive geohash implementation would need to handle manually |
