# Interview Prep

> Everything here is built to be used *alongside* the [modules](../modules/), not instead of them. The modules teach the concepts; this section teaches you how to perform under interview conditions — time pressure, a skeptical interviewer, and a whiteboard that doesn't forgive rambling.

---

## How to Use This Section

1. **Read the framework once, end to end.** [`how-to-approach-system-design-interview.md`](./how-to-approach-system-design-interview.md) is the single most important file in this folder. It defines the 5-step structure every answer in the question bank follows.
2. **Memorize the estimation numbers.** [`estimation-cheatsheet.md`](./estimation-cheatsheet.md) is what lets you do back-of-envelope math fluently instead of fumbling with a calculator mid-interview.
3. **Work the question bank in order of difficulty**, pausing to write your own answer (even just bullet points) *before* reading the model answer. Reading a solution you didn't struggle with first teaches you very little.
4. **Run a timed mock interview** using [`mock-interviews/template.md`](./mock-interviews/template.md) once you've worked through a few questions — reading is not the same skill as talking out loud under a clock.
5. **Review [`common-mistakes.md`](./common-mistakes.md)** before any real interview — it's a 5-minute read that fixes the most common ways candidates lose points.

> 💡 **Note:** If a question bank answer references a concept you don't recognize (e.g. "fan-out-on-write" or "consistent hashing"), that's a signal to go back to the relevant module — every answer links to the modules it depends on.

---

## Recommended Study Plan

| Track | Modules to Complete First | Question Bank Tier |
|---|---|---|
| 🟢 **Beginner** | [Modules 1–6](../modules/) (Foundations → Scalability) | [`easy/`](./question-bank/easy/) |
| 🟡 **Intermediate** | [Modules 7–13](../modules/) (Load Balancing → Consistency & Consensus) | [`medium/`](./question-bank/medium/) |
| 🔴 **Advanced / Senior** | All 20 modules | [`hard/`](./question-bank/hard/) |

> 🎯 **Interview Tip:** Difficulty tiers reflect breadth of concepts required, not just "harder topic." A senior candidate asked an "easy" question (e.g. rate limiter) is expected to go deeper — distributed rate limiting across nodes, not just a single-process token bucket — so don't skip the easy tier assuming it's beneath your level.

---

## Question Bank Index

### Easy — suitable after Modules 1–6

- [URL Shortener](./question-bank/easy/url-shortener.md)
- [Pastebin](./question-bank/easy/pastebin.md)
- [Rate Limiter](./question-bank/easy/rate-limiter.md)
- [Key-Value Store](./question-bank/easy/key-value-store.md)
- [Parking Lot System](./question-bank/easy/parking-lot.md)

### Medium — suitable after Modules 7–13

- [Twitter](./question-bank/medium/twitter.md)
- [Instagram](./question-bank/medium/instagram.md)
- [WhatsApp (Chat System)](./question-bank/medium/whatsapp.md)
- [Notification System](./question-bank/medium/notification-system.md)
- [Uber (Ride-Sharing)](./question-bank/medium/uber.md)
- [YouTube](./question-bank/medium/youtube.md)
- [Web Crawler](./question-bank/medium/web-crawler.md)
- [Search Autocomplete](./question-bank/medium/search-autocomplete.md)
- [News Feed](./question-bank/medium/news-feed.md)

### Hard — suitable after all 20 modules

- [Google Docs (Collaborative Editing)](./question-bank/hard/google-docs.md)
- [Distributed Message Queue](./question-bank/hard/distributed-message-queue.md)
- [Distributed Cache](./question-bank/hard/distributed-cache.md)
- [Distributed File System](./question-bank/hard/distributed-file-system.md)
- [Stock Trading System](./question-bank/hard/stock-trading-system.md)
- [Airbnb](./question-bank/hard/airbnb.md)
- [Netflix](./question-bank/hard/netflix.md)
- [Payment System](./question-bank/hard/payment-system.md)

---

## Other Resources in This Section

| File | Purpose |
|---|---|
| [`how-to-approach-system-design-interview.md`](./how-to-approach-system-design-interview.md) | The 5-step framework used in every answer in this repo |
| [`estimation-cheatsheet.md`](./estimation-cheatsheet.md) | Powers of two, latency numbers, QPS/storage math, worked examples |
| [`common-mistakes.md`](./common-mistakes.md) | The 10 most common ways candidates lose points |
| [`mock-interviews/template.md`](./mock-interviews/template.md) | A blank 45-minute scorecard for running your own mock interviews |
| [`mock-interviews/example-walkthrough.md`](./mock-interviews/example-walkthrough.md) | A full transcript of a mock interview, annotated |

---

← [Back to root](../README.md) · See also: [cheatsheets/](../cheatsheets/) for quick reference material used throughout these answers
