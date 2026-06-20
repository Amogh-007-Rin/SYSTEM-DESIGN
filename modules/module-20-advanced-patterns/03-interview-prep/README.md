# Module 20 — Interview Prep: Senior/Staff-Level System Design

## Why This Matters

A mid-level system design interview rewards knowing the patterns: can you name caching, sharding, load balancing, and apply them to a prompt. A senior/staff-level interview assumes you know the patterns already and instead evaluates something harder to fake: **judgment under ambiguity, depth on demand, and the ability to drive a 45-minute conversation toward the parts that actually matter for this specific system** — not a memorized checklist recited in the same order every time.

---

## What's Different at Senior/Staff Level

| Dimension | Mid-Level Expectation | Senior/Staff-Level Expectation |
|---|---|---|
| **Breadth vs. depth** | Cover the major components correctly | Cover the major components quickly, then go deep on the 1–2 components that are actually hard for *this* system |
| **Trade-offs** | State that a trade-off exists | Quantify it where possible, and state which side you'd pick and why, given the stated requirements |
| **Ambiguity** | Wait for the interviewer to specify requirements | Proactively surface the ambiguous requirements yourself and propose a reasonable default, stated explicitly, so the interviewer can correct you instead of you guessing silently |
| **Failure modes** | Mention "what if the database goes down" | Walk through specific failure modes for the specific design (what happens if this exact queue backs up, what happens if this exact cache's hot key gets 10x traffic) |
| **Operability** | Design the happy path | Also address rollout, rollback, monitoring, and how you'd know the system is unhealthy in production |
| **Cost** | Rarely mentioned | An explicit, named design dimension — "cheapest architecture that meets the bar," not "fanciest architecture I know" |
| **Conversation dynamic** | Answers the interviewer's questions | Drives the structure of the conversation itself (see below) |

> 🎯 **Interview Tip:** The single highest-leverage thing a senior/staff candidate can do differently from a mid-level candidate is **explicitly narrate the trade-off space before committing to a choice** — "I'm choosing eventual consistency here because the requirement said X; if instead the requirement were Y, I'd choose strong consistency and accept the latency cost" demonstrates the judgment itself, not just the vocabulary.

---

## Driving the Conversation vs. Following the Interviewer

At mid-level, it's normal (and fine) to wait for the interviewer to ask "now what about caching?" or "how would this scale?" At senior/staff level, the expectation flips: **you propose the structure of the conversation**, and the interviewer mostly steers by occasionally redirecting or pushing deeper on something you raised.

A candidate who only answers exactly what's asked, in the order it's asked, is implicitly signaling "I need to be told what to think about next" — which is a real signal interviewers are trained to pick up on, because it's a preview of how that person would behave designing a real system with an ambiguous, open-ended problem and no one telling them what to think about next.

### A Concrete Way to Drive Instead of Follow

1. **State the plan out loud before executing it.** "I'm going to clarify a few requirements, do rough capacity estimation, sketch the high-level architecture, then go deep on [the part I expect to be hardest]. Let me know if you want me to focus elsewhere." This single sentence converts you from "answering questions" to "running the session," and gives the interviewer an explicit, easy hook to redirect you if they want something different.
2. **Surface the requirement ambiguities yourself, with a proposed default.** Instead of "what's the read/write ratio?" (a question, putting the burden back on the interviewer), say "I'll assume this is read-heavy, roughly 100:1 read-to-write, which is typical for this kind of system — let me know if that's wrong." Now you've moved forward *and* given them an easy correction point.
3. **After finishing a section, state what you'd go deeper on next and why**, rather than stopping and waiting silently. "The feed generation fan-out is the part I think is most interesting here — should I go deeper there, or would you rather I cover the search/ranking path?" This is the literal mechanism of "driving" — you're proposing the next branch of the conversation, not waiting to be handed one.
4. **When you don't know something, say what you'd do to find out**, rather than guessing silently or freezing. "I don't have the exact number for X memorized, but I'd estimate it as [reasoning], or in practice I'd check [the relevant metric/dashboard/source]." This demonstrates the actual on-the-job skill (knowing how to get an answer) rather than just the answer itself.

> ⚠️ **Warning:** "Driving the conversation" does not mean talking over the interviewer or ignoring redirection. If an interviewer says "let's skip ahead to the database schema," do that immediately and without resistance — driving means *proposing* structure, not *insisting* on your own agenda over explicit signals from the person running the interview.

---

## What Interviewers Are Actually Listening For

- **Did the candidate ask (or state and check) the requirements that actually change the design?** Not every requirement matters equally — a senior candidate identifies which 2–3 numbers (scale, latency bound, consistency requirement) would actually change their architecture, and prioritizes getting those right over exhaustively listing every possible requirement.
- **Did trade-offs get stated with a chosen side, not left hanging?** "We could use SQL or NoSQL here" with no follow-up is an unfinished thought. "We could use SQL or NoSQL here; I'm choosing [X] because [the specific access pattern stated in the requirements] fits it better, and I'm accepting [the specific cost] as a result" is a finished one.
- **Did the candidate self-correct when they noticed a problem with their own earlier design**, rather than defending an early choice past the point it made sense? Catching and revising your own mistake out loud is a stronger signal than never appearing to make one.
- **Did the design account for failure, not just success?** At minimum: what happens when each major component is slow, down, or returns bad data — and does the system degrade gracefully or fall over completely.

This module's three full worked capstone solutions ([URL shortener](../04-exercises/design-challenges/challenge-01-solution.md), [Twitter](../04-exercises/design-challenges/challenge-02-solution.md), [Uber](../04-exercises/design-challenges/challenge-03-solution.md)) are written to model exactly this — see [`sample-answer.md`](./sample-answer.md) for a full worked answer to a fourth classic prompt, "design a distributed rate limiter," structured the same way: requirements first, explicit trade-offs throughout, and a final review of what was deprioritized and why.

See [`common-questions.md`](./common-questions.md) for senior/staff-level meta-questions about depth, trade-off articulation, and ambiguity handling.
