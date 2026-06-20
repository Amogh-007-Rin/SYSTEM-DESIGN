# How to Approach a System Design Interview

> A system design interview is not a test of whether you've memorized Twitter's actual architecture. It's a test of whether you can take an ambiguous problem, make reasonable assumptions explicit, and reason about trade-offs out loud under time pressure. The framework below is the structure every question-bank answer in this repository follows — internalize it once, reuse it everywhere.

---

## The 5-Step Framework

A 45-minute interview has almost no slack. Budget your time deliberately — candidates who skip Step 1 and jump straight to drawing boxes almost always run out of time mid-deep-dive, which reads as poor planning even if the content was good.

### Step 1 — Clarify Requirements (~5 min)

Do not start designing before this step. An interviewer who watches you ask sharp clarifying questions is already updating their assessment of you upward.

- **Functional requirements** — what are the 3–5 core features in scope? It is fine, and often expected, to explicitly cut scope ("I'll assume we don't need video uploads for this version, just photos — let me know if that's wrong").
- **Non-functional requirements** — scale (DAU, QPS), latency targets (is p99 < 200ms required, or is this a batch system where seconds are fine?), availability target (99.9% vs 99.99% materially changes the architecture), read/write ratio, geographic distribution (single region or global?).
- **Constraints** — any tech stack restrictions, compliance requirements (GDPR, HIPAA), or budget signals the interviewer wants you to design around.

> 🎯 **Interview Tip:** Ask "what should we focus on / go deepest on?" near the end of this step. Interviewers usually have 1–2 components in mind they want to probe — knowing this in advance lets you allocate your high-level design time so you reach that component instead of running out of clock first.

### Step 2 — Estimate Scale (~5 min)

Translate the NFRs from Step 1 into concrete numbers: total requests/day, average QPS, peak QPS (a reasonable default is 2× average unless told otherwise), storage growth per day, total storage over the retention period, and bandwidth.

- Use the [estimation cheatsheet](./estimation-cheatsheet.md) for the recurring numbers (1 day ≈ 86,400 seconds, 1M requests/day ≈ 12 QPS, 1B requests/day ≈ 11,574 QPS).
- Round aggressively. The goal is the right order of magnitude, not the fourth decimal place — an interviewer will not be impressed by precision, but will be unimpressed if your QPS estimate is off by 1000×.

> 💡 **Note:** These numbers matter because they decide your architecture. 100 QPS fits comfortably on a single well-indexed database with no cache. 100,000 QPS does not — and saying so out loud, with the math to back it, is exactly the signal interviewers are scoring.

### Step 3 — High-Level Design (~15 min)

Start from the simplest shape that could plausibly work, then layer in complexity *with a stated reason* for each addition:

```
Client → Load Balancer → App Servers → Database
```

From there, ask yourself (out loud) where caching fits, whether reads and writes need separate paths, whether anything needs to be asynchronous (queues), whether a CDN belongs in front of static content, and whether any part of the system needs real-time delivery (WebSockets/SSE).

Walk through one critical user flow end-to-end against the diagram you're drawing — e.g., "user posts a tweet: request hits the load balancer, routes to an app server, which writes to the primary database and publishes a fan-out event..." A static diagram with no narrated flow leaves the interviewer guessing whether you actually understand what each box does.

> ⚠️ **Warning:** Don't draw a box you can't explain. If you put a message queue in the diagram because "that's what scalable systems have," and the interviewer asks why, you need a real answer (decoupling, buffering against bursty load, etc.) — not "best practice."

### Step 4 — Deep Dive (~15 min)

Pick 2–3 components — usually informed by the hint you got at the end of Step 1 — and go deep: database schema, caching strategy and invalidation, API contract, the specific bottleneck that appears at scale, or a consistency trade-off the system has to make.

- **Drive this yourself.** Don't wait passively for the interviewer to ask "what about the database schema?" — propose what you'd deep dive on and why, then go.
- **Surface a trade-off at every real decision.** "I chose eventual consistency here because availability matters more than perfect freshness for a like counter" is a complete thought. "I'll use eventual consistency" with no justification is not.

### Step 5 — Wrap Up (~5 min)

Close the loop yourself rather than waiting to be asked "anything else?":

- "Here are the main weaknesses in what I designed: ..."
- "At 10× scale, X would become the bottleneck, and I'd address it by ..."
- "The key trade-off I made was X over Y, because ..."

This step is cheap and high-leverage — it signals self-awareness about your own design's limits, which is a trait junior candidates rarely demonstrate and senior candidates are expected to.

---

## Communication Tips

- **Think out loud.** Silence reads as being stuck, even when you're not. Narrate your reasoning continuously, even mid-calculation.
- **State assumptions explicitly.** "I'm assuming reads outnumber writes 100:1, since this is a read-heavy social app — correct me if that's off" invites correction early, before it derails 20 minutes of design.
- **Ask for feedback mid-design.** "Does this direction make sense, or should I go a different way?" costs you nothing and can save you from designing in the wrong direction for ten minutes.
- **Start simple, then add complexity with a reason.** Jumping straight to a 12-microservice architecture for a system with 100 users signals premature optimization, not skill.
- **Use concrete numbers wherever you can.** "This will be fast" is weak. "At 200 bytes/tweet and 5,000 writes/sec, that's 1MB/sec — trivial for a single Kafka partition" is strong.

---

## What Interviewers Evaluate

| Dimension | What "Good" Looks Like |
|---|---|
| **Problem solving** | Breaks an ambiguous prompt into a structured, tractable plan |
| **Communication** | Narrates reasoning clearly; doesn't make the interviewer dig for information |
| **Technical depth** | Can go beyond the surface on at least 2–3 components when pushed |
| **Trade-off reasoning** | Justifies decisions with explicit costs and benefits, not just "best practice" |
| **Scale awareness** | Numbers drive design choices; recognizes what breaks first at 10×/100× scale |
| **Breadth** | Aware of caching, async processing, data modeling, and failure modes — not just the happy path |

---

## Common Mistakes

See [`common-mistakes.md`](./common-mistakes.md) for the full list with explanations. The six most frequent:

1. Diving into the database schema before clarifying requirements
2. Designing for a scale nobody asked for (over-engineering a 1,000-user system like it's Twitter)
3. Drawing boxes without explaining what they do or why they're needed
4. Treating every design decision as having one obviously correct answer, with no trade-off discussion
5. Going silent while thinking instead of narrating the thought process
6. Never circling back to state the design's weaknesses at the end

---

## Recommended Study Path

1. Read this framework once, fully, before attempting any question.
2. Memorize the core numbers in the [estimation cheatsheet](./estimation-cheatsheet.md) — you should be able to compute QPS from DAU without a calculator.
3. Work through 2–3 [easy](./question-bank/easy/) questions, writing your own bullet-point answer before reading the model answer.
4. Move to [medium](./question-bank/medium/) questions once Modules 7–13 are complete, focusing on the deep-dive sections that touch distributed systems concerns.
5. Run a timed mock interview using the [scorecard template](./mock-interviews/template.md) — talking under a clock is a different skill than reading calmly.
6. Tackle [hard](./question-bank/hard/) questions last, after all 20 modules, and review [`common-mistakes.md`](./common-mistakes.md) the day before any real interview.

---

← [Back to Interview Prep](./README.md)
