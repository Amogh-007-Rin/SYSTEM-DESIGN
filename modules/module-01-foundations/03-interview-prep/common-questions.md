# Module 01 — Common Interview Questions

**Q1: What is system design, and how is it different from software engineering?**
System design is the practice of defining a system's architecture — its components, how they communicate, and how the whole satisfies functional and non-functional requirements at a target scale. Software engineering (writing the actual code for one of those components) operates one level below it. You can be an excellent software engineer and a weak system designer, and vice versa — they're related but distinct skills.

**Q2: What's the difference between a functional requirement and a non-functional requirement?**
A functional requirement describes a capability ("users can upload a photo"). A non-functional requirement describes a quality constraint on that capability ("upload must complete in under 2 seconds at p99, and uploaded photos must never be lost"). NFRs are what actually determine architecture — the functional requirement "store a photo" doesn't tell you whether to use a single database BLOB column or an object store with a CDN in front of it; the NFRs do.

**Q3: How do you decide what availability target to design for?**
Start from the cost of downtime to the business and the user. A consumer social app can tolerate a few minutes of monthly downtime; a payments processor cannot. In an interview, state a number and justify it against the product rather than defaulting to "as high as possible" — infinite availability isn't free, and a thoughtful answer shows you understand that.

**Q4: What is the difference between latency and throughput?**
Latency is how long a single request takes (time to first byte, or time to completion). Throughput is how many requests the system processes per unit time. They're related but not the same: you can increase throughput by adding more parallel workers without changing the latency of any individual request, and you can decrease latency (faster disks, less network hops) without changing throughput at all.

**Q5: Why does back-of-envelope estimation matter if the numbers are "just estimates"?**
Because the *order of magnitude* of your numbers determines which class of solution is even viable. 1,000 QPS fits comfortably on a single well-tuned database. 100,000 QPS does not, regardless of how good your query optimization is — you need a fundamentally different architecture (caching, sharding, read replicas). Getting the order of magnitude right, fast, is what lets you pick the right family of solutions before you waste time designing the wrong one in detail.

**Q6: What's an SLA versus an SLO?**
An SLA is an external, often contractual promise to customers ("99.9% uptime or you get a credit"). An SLO is the internal target a team holds itself to, usually stricter than the SLA, to leave a safety margin (an error budget) before an SLA breach actually happens.

**Q7: Can a system be reliable but not available?**
Yes. Reliability is about correctness when the system does respond; availability is about whether it responds at all. A database that's down due to a network partition hasn't given you a wrong answer (unreliable) — it's given you no answer (unavailable). The two properties are independent.

**Q8: What does "there is no free lunch" mean in system design?**
It means every improvement to one property of a system (say, availability via multi-region replication) typically costs another property (consistency, in that example) or adds operational/financial cost. A design that claims to improve every property at once without naming a trade-off should be treated with suspicion — either a trade-off is being made implicitly, or the claim doesn't hold at scale.

**Q9: Why do interviewers ask you to "draw a diagram" instead of just describing the system verbally?**
A diagram forces precision. It's easy to gloss over a missing piece verbally ("the service talks to the database") but much harder to do so visually — a missing arrow or a missing box is immediately obvious to both you and the interviewer, which is exactly the self-correcting property that makes diagrams valuable during design, not just during explanation.

**Q10: What's the most common mistake beginners make in their first system design interview?**
Jumping straight into a detailed architecture before clarifying scope and estimating scale. Without those two steps, the candidate often designs a system appropriate for either 100 users or 100 million users — and guesses wrong about which one the interviewer had in mind, wasting most of the interview on a mismatched design.
