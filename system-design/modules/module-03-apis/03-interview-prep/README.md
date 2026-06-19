# Module 03 — Interview Prep: Designing API Surfaces

## Why This Matters

"Design the API for X" is either the whole question or the first deep-dive component of a larger system design question. Interviewers use it to check whether you can translate a product idea into concrete, well-formed endpoints — not abstractly, but down to method, path, status codes, and request/response shape.

---

## Approaching "Design the API for Twitter/Instagram/Uber"

1. **List the core actions first, in plain English** — "post a tweet," "follow a user," "view a timeline" — before writing any endpoint syntax.
2. **Map each action to a resource and method** — "post a tweet" → `POST /tweets`; "view a timeline" → `GET /timelines/home`.
3. **Decide what's in the request/response body** — be specific: field names, types, and which fields are required vs. optional.
4. **State your pagination strategy once, and apply it consistently** — don't redesign pagination per-endpoint.
5. **Name your versioning and auth strategy explicitly**, even briefly — "URL-versioned, bearer token auth" is enough to show you considered it.

> 🎯 **Interview Tip:** Resist the urge to design every possible endpoint. Interviewers want to see 4–6 well-designed core endpoints with clear shapes far more than 15 shallow ones.

---

## Reasoning About Versioning Decisions

If asked to justify a versioning choice, anchor your answer in the *consumers* of the API: a public API with many third-party integrators benefits from the explicitness of URL versioning (easy for humans to spot in logs and docs); an internal API where you control all clients can get away with more aggressive, less-versioned evolution since you can coordinate rollout directly.

See [`common-questions.md`](./common-questions.md) and the full worked example in [`sample-answer.md`](./sample-answer.md) ("Design the API for Twitter").
