# Design Challenge 01: Search System for Airbnb

**Difficulty:** Hard

## Prompt

Design the search system behind a marketplace like Airbnb: a user searches a location ("Paris" or a map viewport), applies filters (price range, number of bedrooms, amenities, instant book), and gets back a ranked list of listings. Unlike a typical text search problem, location and structured filters matter as much as — or more than — free text relevance.

## What to Produce

1. What gets indexed per listing (the document shape), and which fields are `text` vs. `keyword` vs. `geo_point`, and why.
2. How location search works: given a city name or a map bounding box, how do you find listings within it? Name the geo-indexing technique you'd use and why.
3. How filters (price, bedrooms, amenities, instant book) combine with location search in a single query — and how faceted counts (e.g., "342 results have a pool") get computed alongside the filtered results.
4. A ranking strategy: what signals beyond "matches the filters" determine the order listings appear in (consider: price competitiveness, host quality/ratings, booking conversion history, availability for the requested dates)?
5. How the search index stays in sync with listing data that changes constantly — price updates, availability changes when a booking is made, a host editing their listing. Which freshness requirements are strict (availability) vs. relaxed (review count)?
6. At least 2 trade-offs you made and why.

A full worked solution is in [`challenge-01-solution.md`](./challenge-01-solution.md).
