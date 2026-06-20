# System Design Mastery — Open Source Repository

> A complete build specification for a coding agent to implement from scratch.

---

## Project Overview

**Repository Name:** `system-design-mastery`
**Tagline:** The most comprehensive open-source resource to learn system design — from zero to professional.
**License:** MIT
**Primary Language:** Markdown + TypeScript/JavaScript code examples
**Diagram Format:** Draw.io / Excalidraw source files (`.drawio`, `.excalidraw`) + exported PNGs
**Target Audience:** All levels (beginners to senior engineers)
**Goals:**
- Teach system design in a linear, progressive, prerequisite-aware path (Module 1 → Module 20)
- Serve both interview prep (FAANG-style) and real-world engineering depth
- Be the single best free resource for system design on the internet
- Include hands-on coding exercises and design challenges in every module

---

## Repository Structure

```
system-design-mastery/
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   ├── content_improvement.md
│   │   └── new_topic_request.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
│       └── validate-links.yml
│
├── modules/
│   ├── module-01-foundations/
│   ├── module-02-networking/
│   ├── module-03-apis/
│   ├── module-04-databases/
│   ├── module-05-caching/
│   ├── module-06-scalability/
│   ├── module-07-load-balancing/
│   ├── module-08-message-queues/
│   ├── module-09-storage/
│   ├── module-10-cdn/
│   ├── module-11-microservices/
│   ├── module-12-distributed-systems/
│   ├── module-13-consistency-consensus/
│   ├── module-14-observability/
│   ├── module-15-security/
│   ├── module-16-real-time-systems/
│   ├── module-17-data-pipelines/
│   ├── module-18-search-systems/
│   ├── module-19-ml-systems/
│   └── module-20-advanced-patterns/
│
├── interview-prep/
│   ├── README.md
│   ├── how-to-approach-system-design-interview.md
│   ├── common-mistakes.md
│   ├── estimation-cheatsheet.md
│   ├── question-bank/
│   │   ├── easy/
│   │   ├── medium/
│   │   └── hard/
│   └── mock-interviews/
│       ├── template.md
│       └── example-walkthrough.md
│
├── company-architectures/
│   ├── README.md
│   └── (manually added by repo owner — placeholder structure only)
│
├── cheatsheets/
│   ├── numbers-every-engineer-should-know.md
│   ├── cap-theorem-quick-reference.md
│   ├── database-comparison.md
│   ├── scaling-patterns.md
│   └── system-design-vocabulary.md
│
├── exercises/
│   ├── README.md
│   └── solutions/
│       └── README.md
│
├── assets/
│   ├── diagrams/
│   │   ├── source/        ← .drawio and .excalidraw source files
│   │   └── exports/       ← exported PNGs referenced in markdown
│   └── images/
│
└── scripts/
    ├── validate-links.sh
    └── check-structure.sh
```

---

## Module Structure Template

Every module MUST follow this exact internal structure:

```
module-XX-topic-name/
├── README.md                  ← Module overview, prerequisites, learning objectives
├── 01-concepts/
│   ├── README.md              ← Core theory and explanations
│   ├── diagrams/
│   │   ├── source/            ← .drawio / .excalidraw source files
│   │   └── exports/           ← PNG exports for use in markdown
│   └── examples/
│       └── *.ts               ← TypeScript/JS code examples
├── 02-deep-dive/
│   ├── README.md              ← Advanced nuances, trade-offs, real-world context
│   └── examples/
│       └── *.ts
├── 03-interview-prep/
│   ├── README.md              ← Interview angle, tips, what interviewers look for
│   ├── common-questions.md    ← Curated Q&A for this topic
│   └── sample-answer.md       ← Full worked example interview answer
├── 04-exercises/
│   ├── README.md              ← Exercise instructions
│   ├── coding-challenges/
│   │   └── challenge-01/
│   │       ├── README.md      ← Problem statement
│   │       ├── starter.ts     ← Starter code
│   │       └── solution.ts    ← Reference solution (in /solutions folder ideally)
│   └── design-challenges/
│       ├── challenge-01.md    ← Design problem prompt
│       └── challenge-01-solution.md ← Worked solution with diagrams
├── 05-further-reading/
│   └── README.md              ← Curated external links, papers, blog posts
└── SUMMARY.md                 ← Key takeaways, 1-page cheat sheet for this module
```

---

## Module-by-Module Specification

### MODULE 01 — Foundations of System Design
**Prerequisites:** None
**Difficulty:** Beginner
**Estimated Time:** 3–4 hours

**Learning Objectives:**
- Understand what system design is and why it matters
- Know the vocabulary and mental models used throughout the course
- Understand the system design interview format
- Learn how to read and draw system architecture diagrams

**Topics to Cover:**

`01-concepts/README.md`:
- What is system design? (definition, scope, why it matters)
- System design vs software design vs software architecture — differences
- The anatomy of a system: clients, servers, databases, networks
- Types of systems: monolithic, distributed, event-driven
- Key properties every system designer must reason about: availability, reliability, scalability, maintainability, performance, durability, consistency
- Trade-offs: the core skill of system design (there is no free lunch)
- How to read architecture diagrams
- Introduction to Draw.io and Excalidraw (how to open and read .drawio/.excalidraw files)

`02-deep-dive/README.md`:
- The SDLC (Software Development Life Cycle) and where design fits
- Non-functional requirements (NFRs) vs functional requirements — understanding the difference, why NFRs drive architecture decisions
- SLAs, SLOs, SLIs — definitions and examples
- Capacity estimation fundamentals: how to think about numbers (DAU, QPS, storage, bandwidth)
- Back-of-envelope estimation: worked examples step by step

`03-interview-prep/README.md`:
- The 4-step framework for system design interviews: Clarify → Estimate → Design → Deep Dive
- How to talk through trade-offs out loud
- Whiteboarding tips
- Common questions: "Design a URL shortener", "Design a parking lot"

`04-exercises/`:
- **Coding Challenge 01:** Write a TypeScript function that calculates system capacity estimates (QPS, storage in GB) given DAU, request size, read/write ratio
- **Design Challenge 01:** Design a simple note-taking app (no scale requirements) — draw a diagram, list components, identify trade-offs
- **Design Challenge 02:** Given a set of NFRs (e.g. 99.9% uptime, 1M DAU), write a requirements document

**Diagrams to Create:**
- `client-server-architecture.drawio` — basic client/server/database diagram
- `monolith-vs-distributed.drawio` — side-by-side comparison
- `anatomy-of-a-request.drawio` — flow of a single HTTP request

---

### MODULE 02 — Networking Fundamentals for System Designers
**Prerequisites:** Module 01
**Difficulty:** Beginner–Intermediate
**Estimated Time:** 4–5 hours

**Learning Objectives:**
- Understand the networking concepts that directly impact system design decisions
- Know the difference between TCP and UDP and when to use each
- Understand DNS, IP addressing, and HTTP/HTTPS
- Learn about latency, bandwidth, and throughput

**Topics to Cover:**

`01-concepts/README.md`:
- The OSI model (simplified to what matters for system design: L3, L4, L7)
- IP addresses: IPv4 vs IPv6, public vs private, CIDR notation basics
- DNS: how domain name resolution works end-to-end (recursive resolvers, authoritative servers, TTL, caching)
- TCP vs UDP: connection-oriented vs connectionless, reliability guarantees, use cases
- HTTP/1.1 vs HTTP/2 vs HTTP/3 — key differences and system design implications
- HTTPS and TLS: what encryption means at the transport layer
- WebSockets: what they are, why they exist, when to use them
- Long polling vs short polling vs SSE (Server-Sent Events) vs WebSockets — comparison
- Ports and protocols: common ports every engineer should know (80, 443, 22, 5432, 6379, etc.)

`02-deep-dive/README.md`:
- Latency numbers every engineer should know (memory, disk, network — L1 cache, RAM, SSD, HDD, cross-DC round trip)
- Network bandwidth vs throughput vs latency — the differences
- TCP connection handshake overhead — why this matters for system performance
- Keep-alive connections and connection pooling
- Reverse proxies and forward proxies — what they are and when you'd use each
- NAT (Network Address Translation) — basics and why it matters
- Anycast routing — used in CDNs and DDoS mitigation

`03-interview-prep/`:
- When interviewers ask "how does the request flow?" — how to walk through the network stack
- Latency-related trade-off questions

`04-exercises/`:
- **Coding Challenge 01:** Build a simple TCP server and client in TypeScript (Node.js `net` module) and observe connection handshake behavior in logs
- **Coding Challenge 02:** Implement a basic HTTP long-polling endpoint in TypeScript/Express and a client that polls it
- **Design Challenge 01:** Design the network topology for a globally distributed web application — where do you place servers, what DNS strategy do you use?

**Diagrams to Create:**
- `dns-resolution-flow.drawio` — end-to-end DNS resolution
- `tcp-handshake.drawio` — 3-way handshake sequence diagram
- `polling-vs-websocket.drawio` — comparison of real-time communication strategies

---

### MODULE 03 — API Design
**Prerequisites:** Module 01, Module 02
**Difficulty:** Beginner–Intermediate
**Estimated Time:** 4–5 hours

**Learning Objectives:**
- Understand REST, GraphQL, and gRPC — when to use each
- Design clean, versioned, well-documented APIs
- Understand API gateways and their role in system design
- Know how to handle API authentication and rate limiting

**Topics to Cover:**

`01-concepts/README.md`:
- What is an API? Types of APIs: public, private, partner
- REST: principles (stateless, resource-based, uniform interface), HTTP methods (GET/POST/PUT/PATCH/DELETE), status codes, REST constraints
- RESTful API design best practices: naming conventions, idempotency, pagination strategies (cursor vs offset), filtering, sorting
- GraphQL: schema definition, queries, mutations, subscriptions — advantages and costs
- gRPC: Protocol Buffers, streaming, why it's fast, use cases (internal microservice communication)
- REST vs GraphQL vs gRPC — comparison matrix with use cases
- Webhooks: event-driven callbacks, delivery guarantees, retry strategies
- OpenAPI / Swagger specification

`02-deep-dive/README.md`:
- API versioning strategies: URL versioning (`/v1/`), header versioning, content negotiation — trade-offs
- API Gateway: what it is, what it does (routing, auth, rate limiting, request transformation, logging)
- Rate limiting strategies: token bucket, leaky bucket, fixed window, sliding window — implementation and trade-offs
- Authentication and authorization at the API layer: API keys, OAuth 2.0, JWT tokens — how each works, security implications
- Idempotency keys: why they matter, how to implement them
- Request/response compression (gzip, brotli)
- API pagination deep dive: keyset/cursor pagination vs offset — performance at scale

`03-interview-prep/`:
- "Design the API for Twitter/Instagram/Uber" — walking through API design in an interview
- How to reason about API versioning decisions

`04-exercises/`:
- **Coding Challenge 01:** Build a fully REST-compliant TypeScript/Express API for a blog with CRUD for posts and comments, cursor-based pagination, and proper status codes
- **Coding Challenge 02:** Add JWT authentication middleware to the above API
- **Coding Challenge 03:** Implement a token bucket rate limiter in TypeScript
- **Design Challenge 01:** Design the API surface for a ride-sharing app (Uber-like) — define endpoints, request/response shapes, versioning strategy

**Diagrams to Create:**
- `rest-vs-graphql-vs-grpc.drawio` — comparison diagram
- `api-gateway-architecture.drawio` — API gateway in a microservices context
- `token-bucket-rate-limiter.drawio` — algorithm visualization
- `oauth-flow.drawio` — OAuth 2.0 authorization code flow

---

### MODULE 04 — Databases
**Prerequisites:** Module 01
**Difficulty:** Intermediate
**Estimated Time:** 6–8 hours

**Learning Objectives:**
- Understand relational vs non-relational databases deeply
- Know when to choose SQL vs NoSQL
- Understand indexing, query optimization, and schema design
- Learn about replication, sharding, and partitioning

**Topics to Cover:**

`01-concepts/README.md`:
- Relational databases: tables, rows, columns, primary keys, foreign keys, ACID properties (Atomicity, Consistency, Isolation, Durability)
- SQL fundamentals for system designers: JOINs, indexes, transactions, constraints
- NoSQL database types:
  - Key-Value stores (Redis, DynamoDB) — use cases, data model
  - Document stores (MongoDB, CouchDB) — use cases, flexible schema
  - Column-family / Wide-column (Cassandra, HBase) — use cases, write optimization
  - Graph databases (Neo4j) — use cases, relationship-heavy data
- SQL vs NoSQL — the real trade-offs (not just "scale")
- CAP theorem: introduction (deep dive in Module 13)

`02-deep-dive/README.md`:
- Database indexing deep dive: B-tree indexes, hash indexes, composite indexes, covering indexes, partial indexes — when to use each, performance implications
- Query optimization: EXPLAIN plans, N+1 problem, avoiding table scans
- Database normalization: 1NF, 2NF, 3NF — when to normalize vs denormalize
- Database replication: master-slave (primary-replica), master-master, synchronous vs asynchronous replication, replication lag
- Database sharding / horizontal partitioning: range-based, hash-based, directory-based sharding — trade-offs, resharding problem
- Database partitioning: vertical partitioning vs horizontal partitioning
- Connection pooling: why it exists, how to configure it, PgBouncer
- Transactions and isolation levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable — what each means, when to use
- Database migrations at scale: zero-downtime migrations, expand-contract pattern

`03-interview-prep/`:
- "SQL or NoSQL? How do you decide?" — full framework answer
- "How would you store X?" — common interview DB design questions
- Schema design exercises (Twitter timeline, Instagram posts, Uber trips)

`04-exercises/`:
- **Coding Challenge 01:** Write TypeScript code (using `pg` or `better-sqlite3`) that demonstrates index performance: run the same query with and without an index, measure timing
- **Coding Challenge 02:** Implement a simple connection pool in TypeScript
- **Coding Challenge 03:** Implement a consistent hashing algorithm in TypeScript (used for database sharding)
- **Design Challenge 01:** Design the database schema for a Twitter-like social network — handle tweets, follows, likes, retweets. Justify SQL vs NoSQL choice.
- **Design Challenge 02:** Design a sharding strategy for a database with 1 billion users

**Diagrams to Create:**
- `sql-vs-nosql-decision-tree.drawio`
- `database-replication-topologies.drawio` — master-slave, master-master
- `sharding-strategies.drawio` — range, hash, directory sharding
- `b-tree-index.drawio` — how a B-tree index works visually
- `consistent-hashing-ring.drawio`

---

### MODULE 05 — Caching
**Prerequisites:** Module 04
**Difficulty:** Intermediate
**Estimated Time:** 4–5 hours

**Learning Objectives:**
- Understand caching at every layer of the stack
- Know cache eviction strategies and their trade-offs
- Understand cache invalidation — the hardest problem
- Design caching strategies for real systems

**Topics to Cover:**

`01-concepts/README.md`:
- What is caching and why it matters (latency reduction, load reduction)
- Where you can cache: client-side, CDN, reverse proxy (Nginx), application-level, database query cache, in-process
- Cache-aside (lazy loading) pattern
- Write-through cache pattern
- Write-behind (write-back) cache pattern
- Read-through cache pattern
- Cache eviction policies: LRU (Least Recently Used), LFU (Least Frequently Used), FIFO, TTL-based — comparison
- Redis vs Memcached — when to choose each
- Redis data structures: strings, hashes, lists, sets, sorted sets, bitmaps — system design use cases for each

`02-deep-dive/README.md`:
- Cache invalidation strategies: TTL, event-driven invalidation, cache versioning, cache tags
- Cache stampede (thundering herd) problem and solutions: mutex locking, probabilistic early expiration, background refresh
- Hot key problem in distributed caches — detection and mitigation
- Cache penetration (missing keys attack) — bloom filter solution
- Cache warming strategies
- Distributed caches: Redis Cluster, consistent hashing for cache nodes
- Multi-layer caching architectures
- Cache hit rate — how to measure and optimize

`03-interview-prep/`:
- "How would you add caching to this system?" — framework for answering
- Cache-related trade-off questions
- When NOT to cache

`04-exercises/`:
- **Coding Challenge 01:** Implement an LRU cache in TypeScript from scratch (using Map + doubly-linked list)
- **Coding Challenge 02:** Implement a cache-aside pattern in TypeScript with a mock database and Redis (using `ioredis`)
- **Coding Challenge 03:** Implement a bloom filter in TypeScript to prevent cache penetration
- **Design Challenge 01:** Design a caching strategy for a Twitter feed — what to cache, where, eviction policy, invalidation strategy

**Diagrams to Create:**
- `cache-patterns-comparison.drawio` — cache-aside, write-through, write-behind side by side
- `cache-layers.drawio` — all layers of caching in a web app
- `lru-cache-structure.drawio` — LRU linked list + hashmap visualization
- `cache-stampede-solution.drawio`

---

### MODULE 06 — Scalability
**Prerequisites:** Module 04, Module 05
**Difficulty:** Intermediate
**Estimated Time:** 5–6 hours

**Learning Objectives:**
- Understand horizontal vs vertical scaling deeply
- Know the bottlenecks at every layer and how to address them
- Design systems that scale from 1 user to 1 billion

**Topics to Cover:**

`01-concepts/README.md`:
- Vertical scaling (scale up): adding more CPU/RAM/storage — limits, cost, when it makes sense
- Horizontal scaling (scale out): adding more machines — stateless services, shared-nothing architecture
- Stateless vs stateful services — why statelessness enables horizontal scaling
- The scaling journey: single server → separate DB → caching → multiple app servers → DB replication → sharding
- Amdahl's Law and its implications for parallelization
- Little's Law: L = λW — queue length, arrival rate, wait time

`02-deep-dive/README.md`:
- Identifying bottlenecks: CPU-bound vs I/O-bound vs memory-bound systems
- Auto-scaling: reactive vs predictive scaling, HPA in Kubernetes, scaling policies
- Database scaling patterns: read replicas, CQRS (Command Query Responsibility Segregation)
- Async processing to decouple and scale: offloading work to queues
- Geo-distribution: multi-region architectures, data residency considerations
- Cost of consistency at scale — eventual consistency as a scalability enabler

`04-exercises/`:
- **Design Challenge 01:** Take a single-server monolith design and evolve it through 5 stages of scale (100 → 1K → 10K → 100K → 1M concurrent users). At each stage, identify the bottleneck and the solution.
- **Design Challenge 02:** Design a scalable image upload and processing pipeline

**Diagrams to Create:**
- `scaling-journey.drawio` — the evolution from single server to distributed system
- `vertical-vs-horizontal-scaling.drawio`
- `stateless-scaling.drawio` — how stateless services scale horizontally

---

### MODULE 07 — Load Balancing
**Prerequisites:** Module 06
**Difficulty:** Intermediate
**Estimated Time:** 3–4 hours

**Learning Objectives:**
- Understand load balancers and their role in scalability
- Know different load balancing algorithms and when to use each
- Understand L4 vs L7 load balancing
- Learn about health checks and failover

**Topics to Cover:**

`01-concepts/README.md`:
- What is a load balancer? Hardware vs software (HAProxy, Nginx, AWS ALB/NLB)
- L4 (Transport layer) vs L7 (Application layer) load balancing — differences, capabilities, use cases
- Load balancing algorithms: Round Robin, Weighted Round Robin, Least Connections, IP Hash, Least Response Time, Random — when to use each
- Sticky sessions (session affinity) — why it's needed, why it's a problem, alternatives
- Health checks: active vs passive, graceful degradation
- Load balancer as a single point of failure — making it highly available (active-active, active-passive, floating IPs)
- Global load balancing: GeoDNS, Anycast

`02-deep-dive/README.md`:
- Connection draining (deregistration delay) — zero-downtime deployments
- SSL termination at the load balancer — pros and cons, re-encryption
- Load balancer vs reverse proxy vs API gateway — when each term applies
- Service mesh (Istio, Linkerd) — internal load balancing in microservices

`04-exercises/`:
- **Coding Challenge 01:** Implement a Round Robin and Least Connections load balancer in TypeScript
- **Design Challenge 01:** Design the load balancing strategy for a video streaming service

**Diagrams to Create:**
- `load-balancer-algorithms.drawio`
- `l4-vs-l7-load-balancing.drawio`
- `load-balancer-ha.drawio` — active-active HA setup

---

### MODULE 08 — Message Queues & Event-Driven Architecture
**Prerequisites:** Module 06
**Difficulty:** Intermediate
**Estimated Time:** 5–6 hours

**Learning Objectives:**
- Understand asynchronous communication and why it matters
- Know when to use message queues vs event streams
- Understand Kafka vs RabbitMQ vs SQS
- Design event-driven systems

**Topics to Cover:**

`01-concepts/README.md`:
- Synchronous vs asynchronous communication — trade-offs
- Why message queues exist: decoupling, buffering, load leveling, reliability
- Producer-consumer pattern
- Message queue concepts: queues, topics, exchanges, consumers, consumer groups, partitions, offsets
- Message queues vs event streaming: RabbitMQ/SQS (queue semantics) vs Kafka (log semantics)
- At-most-once vs at-least-once vs exactly-once delivery semantics
- RabbitMQ: exchanges, routing, dead letter queues
- Apache Kafka: topics, partitions, consumer groups, retention, compaction — architecture deep dive
- AWS SQS + SNS: fan-out pattern

`02-deep-dive/README.md`:
- Kafka deep dive: leaders, followers, ISR (in-sync replicas), log compaction, consumer lag
- Backpressure: what it is and how queues provide it
- Idempotent consumers — why you need them with at-least-once delivery
- Outbox pattern: reliable event publishing with databases
- Saga pattern (brief intro — deep dive in Module 11)
- Event sourcing: storing state as a log of events

`04-exercises/`:
- **Coding Challenge 01:** Implement a simple in-memory message queue in TypeScript with producer, consumer, and dead-letter support
- **Coding Challenge 02:** Simulate a Kafka consumer group in TypeScript — partition assignment, rebalancing logic
- **Design Challenge 01:** Design an order processing system using event-driven architecture (order placed → payment → inventory → shipping → notification)

**Diagrams to Create:**
- `message-queue-vs-event-stream.drawio`
- `kafka-architecture.drawio` — brokers, topics, partitions, consumer groups
- `outbox-pattern.drawio`
- `event-driven-order-system.drawio`

---

### MODULE 09 — Storage Systems
**Prerequisites:** Module 04
**Difficulty:** Intermediate
**Estimated Time:** 4–5 hours

**Learning Objectives:**
- Understand different types of storage and their trade-offs
- Know when to use block storage, object storage, or file storage
- Understand how distributed file systems work
- Design storage systems for images, videos, and large files

**Topics to Cover:**

`01-concepts/README.md`:
- Block storage vs object storage vs file storage — definitions, use cases, examples (EBS vs S3 vs EFS)
- Object storage deep dive: S3-compatible APIs, eventually consistent, scalability, metadata
- Blob storage and how CDNs integrate with it
- Distributed file systems: HDFS basics, GFS (Google File System) concepts
- Database storage engines: LSM trees (used in Cassandra, RocksDB) vs B-trees (used in PostgreSQL, MySQL)

`02-deep-dive/README.md`:
- LSM tree deep dive: memtable, SSTables, compaction — why it's fast for writes
- How S3 works internally (at a high level): replication, durability 11 nines, eventual consistency model
- RAID levels: 0, 1, 5, 10 — when relevant in system design context
- Data compression in storage: when to compress, what algorithms (LZ4, Snappy, gzip) and trade-offs
- Checksums and data integrity
- Storage tiering: hot, warm, cold storage — cost optimization

`04-exercises/`:
- **Design Challenge 01:** Design a photo storage system like Instagram — upload flow, storage backend, CDN integration
- **Design Challenge 02:** Design a distributed file system metadata layer

**Diagrams to Create:**
- `block-vs-object-vs-file-storage.drawio`
- `lsm-tree-structure.drawio`
- `s3-upload-flow.drawio`

---

### MODULE 10 — Content Delivery Networks (CDNs)
**Prerequisites:** Module 02, Module 09
**Difficulty:** Intermediate
**Estimated Time:** 3–4 hours

**Learning Objectives:**
- Understand what CDNs are and how they work
- Know CDN caching strategies and cache invalidation
- Understand push vs pull CDNs
- Learn CDN use cases: static assets, video streaming, API acceleration

**Topics to Cover:**

`01-concepts/README.md`:
- What is a CDN? Points of Presence (PoPs), edge nodes, origin server
- How CDN routing works: Anycast DNS, GeoDNS, BGP Anycast
- Push vs pull CDNs: when to use each
- CDN caching: Cache-Control headers, TTL, Vary header, stale-while-revalidate
- CDN cache invalidation: purging, surrogate keys (cache tags), versioned URLs
- CDN use cases: static assets, images, video (progressive download, HLS/DASH adaptive streaming), APIs

`02-deep-dive/README.md`:
- Adaptive bitrate streaming (HLS/DASH) — how Netflix/YouTube deliver video
- CDN and security: DDoS mitigation, WAF at the edge, TLS termination at edge
- Multi-CDN strategies: load balancing across CDN providers
- Edge computing: Cloudflare Workers, Lambda@Edge — running code at the edge

`04-exercises/`:
- **Design Challenge 01:** Design the content delivery architecture for a video streaming platform (YouTube/Netflix scale)

**Diagrams to Create:**
- `cdn-request-flow.drawio` — cache hit vs cache miss flow
- `push-vs-pull-cdn.drawio`
- `adaptive-bitrate-streaming.drawio`

---

### MODULE 11 — Microservices Architecture
**Prerequisites:** Module 03, Module 07, Module 08
**Difficulty:** Intermediate–Advanced
**Estimated Time:** 6–7 hours

**Learning Objectives:**
- Understand microservices vs monolith trade-offs deeply
- Know how to decompose a system into services
- Understand service-to-service communication patterns
- Learn about distributed transactions (Saga pattern)

**Topics to Cover:**

`01-concepts/README.md`:
- Monolith vs SOA vs microservices — definitions, not just buzzwords
- Benefits of microservices: independent deployability, team autonomy, technology flexibility, fault isolation
- Costs of microservices: network overhead, distributed systems complexity, operational burden, data consistency challenges
- When to use microservices (and when NOT to)
- Service decomposition strategies: by business capability, by subdomain (DDD), by team (Conway's Law)
- Service communication: synchronous (REST/gRPC) vs asynchronous (events)
- Service discovery: client-side (Eureka) vs server-side (Consul), DNS-based
- API gateway in a microservices context

`02-deep-dive/README.md`:
- Distributed transactions: why 2-phase commit (2PC) is problematic at scale
- Saga pattern: choreography vs orchestration — detailed comparison with diagrams
- Circuit breaker pattern: Hystrix/Resilience4J — states (closed, open, half-open), how it prevents cascade failures
- Bulkhead pattern: isolating failures
- Strangler fig pattern: migrating from monolith to microservices
- Backends for Frontends (BFF) pattern
- Service mesh: Istio/Linkerd — mTLS, observability, traffic management
- Docker and containerization basics (enough for system design)
- Kubernetes (enough for system design): pods, services, deployments, ingress

`04-exercises/`:
- **Design Challenge 01:** Take a monolithic e-commerce app and design its microservices decomposition — define service boundaries, APIs between them, data ownership
- **Design Challenge 02:** Design the saga for an e-commerce order: payment service fails after inventory is reserved — how do you compensate?
- **Coding Challenge 01:** Implement a circuit breaker in TypeScript

**Diagrams to Create:**
- `monolith-vs-microservices.drawio`
- `saga-choreography.drawio`
- `saga-orchestration.drawio`
- `circuit-breaker-states.drawio`
- `microservices-with-api-gateway.drawio`

---

### MODULE 12 — Distributed Systems Fundamentals
**Prerequisites:** Module 06, Module 08, Module 11
**Difficulty:** Advanced
**Estimated Time:** 6–8 hours

**Learning Objectives:**
- Understand the fundamental problems of distributed systems
- Know about failures, network partitions, and how to reason about them
- Understand replication and its challenges
- Learn the key distributed systems abstractions

**Topics to Cover:**

`01-concepts/README.md`:
- Why distributed systems are hard: partial failures, no global clock, network unreliability
- Fallacies of distributed computing (Peter Deutsch's 8 fallacies)
- Types of failures: crash failures, omission failures, Byzantine failures
- Network partition — what it means and why it matters
- Replication: why we do it, single-leader, multi-leader, leaderless replication
- Leader election: why we need it, basic concepts

`02-deep-dive/README.md`:
- Clocks in distributed systems: physical clocks (NTP drift), logical clocks (Lamport timestamps), vector clocks
- Ordering events in distributed systems: causality vs total order
- Gossip protocol: how nodes discover each other, failure detection
- Anti-entropy: keeping replicas in sync
- Quorum reads and writes: R + W > N for consistency
- Two-Phase Commit (2PC): what it is, why it's problematic (blocking protocol, coordinator failure)
- Distributed locking: problems with it, Redlock (and its controversies)
- Idempotency in distributed systems — why critical

`04-exercises/`:
- **Coding Challenge 01:** Implement Lamport timestamps in TypeScript
- **Coding Challenge 02:** Implement a simple gossip protocol simulation in TypeScript
- **Design Challenge 01:** Design a distributed counter system that works across 5 nodes without a central coordinator

**Diagrams to Create:**
- `distributed-system-failures.drawio`
- `replication-topologies.drawio`
- `vector-clocks.drawio`
- `gossip-protocol.drawio`
- `quorum-reads-writes.drawio`

---

### MODULE 13 — Consistency, Consensus & CAP Theorem
**Prerequisites:** Module 12
**Difficulty:** Advanced
**Estimated Time:** 6–8 hours

**Learning Objectives:**
- Deeply understand CAP theorem and its real-world implications
- Know the consistency models spectrum
- Understand consensus algorithms (Raft, Paxos at a high level)
- Make informed consistency trade-off decisions in system design

**Topics to Cover:**

`01-concepts/README.md`:
- CAP Theorem: formal definition, what each property means
- Why CAP theorem is often misunderstood: "You always get two" is wrong — you always get CP or AP during a partition
- CP systems: examples (HBase, Zookeeper, Etcd), what they sacrifice
- AP systems: examples (Cassandra, DynamoDB in AP mode, CouchDB), what they sacrifice
- CA systems: only possible without network partitions (traditional single-node RDBMS)
- PACELC theorem: extends CAP with latency trade-offs when no partition

`02-deep-dive/README.md`:
- Consistency models spectrum (from weakest to strongest): eventual consistency → monotonic read consistency → read-your-writes consistency → session consistency → linearizability → strict serializability
- What linearizability means and why it's expensive
- Eventual consistency: what it means in practice, convergence, conflict resolution (LWW, vector clocks, CRDTs)
- CRDTs (Conflict-free Replicated Data Types): counters, sets — use cases (collaborative editing, distributed counters)
- Consensus problem: what it means for distributed systems
- Paxos: high-level intuition (don't need to implement, need to understand the concept)
- Raft consensus algorithm: leader election, log replication, safety guarantees — detailed walkthrough
- ZooKeeper / etcd: what they do, how they're used (service discovery, distributed locks, configuration)

`04-exercises/`:
- **Coding Challenge 01:** Implement a G-Counter CRDT (grow-only counter) in TypeScript
- **Coding Challenge 02:** Implement a simplified Raft leader election in TypeScript (no log replication, just election)
- **Design Challenge 01:** You're designing a distributed shopping cart — which consistency model do you choose and why? Walk through failure scenarios.

**Diagrams to Create:**
- `cap-theorem.drawio` — the three properties, partition scenarios
- `consistency-models-spectrum.drawio`
- `raft-leader-election.drawio`
- `raft-log-replication.drawio`
- `crdt-counter.drawio`

---

### MODULE 14 — Observability: Monitoring, Logging & Tracing
**Prerequisites:** Module 11
**Difficulty:** Intermediate
**Estimated Time:** 4–5 hours

**Learning Objectives:**
- Understand the three pillars of observability
- Design monitoring and alerting strategies
- Understand distributed tracing and why it matters
- Know how to detect and respond to incidents

**Topics to Cover:**

`01-concepts/README.md`:
- The three pillars of observability: Metrics, Logs, Traces
- Metrics: counters, gauges, histograms, summaries — Prometheus data model
- Logging: structured logging (JSON), log levels, centralized logging (ELK stack, Loki)
- Distributed tracing: spans, traces, trace context propagation — OpenTelemetry, Jaeger, Zipkin
- Why observability matters: you can't fix what you can't see
- SLIs, SLOs, SLAs — error budgets, alerting on SLOs

`02-deep-dive/README.md`:
- RED method: Rate, Errors, Duration — for services
- USE method: Utilization, Saturation, Errors — for resources
- Alerting best practices: alert on symptoms not causes, avoid alert fatigue
- On-call runbooks and incident response playbooks
- Chaos engineering: Chaos Monkey, GameDays — proactively find failure modes
- Capacity planning using observability data

`04-exercises/`:
- **Coding Challenge 01:** Instrument a TypeScript Express app with Prometheus metrics (request rate, error rate, latency histogram) using `prom-client`
- **Coding Challenge 02:** Add structured logging with correlation IDs to an Express app
- **Design Challenge 01:** Design the observability stack for a microservices e-commerce platform

**Diagrams to Create:**
- `three-pillars-observability.drawio`
- `distributed-trace-flow.drawio`
- `metrics-alerting-pipeline.drawio`

---

### MODULE 15 — Security in System Design
**Prerequisites:** Module 03, Module 11
**Difficulty:** Intermediate
**Estimated Time:** 4–5 hours

**Learning Objectives:**
- Know the key security concerns in system design
- Understand authentication and authorization at scale
- Design secure systems at the architecture level
- Know common attacks and how systems defend against them

**Topics to Cover:**

`01-concepts/README.md`:
- Security principles: least privilege, defense in depth, zero trust
- Authentication vs authorization
- Authentication mechanisms at scale: session tokens, JWTs, OAuth 2.0 + OIDC, SAML — deep comparison
- Authorization models: RBAC (Role-Based), ABAC (Attribute-Based), ACLs
- Common attacks: SQL injection, XSS, CSRF, SSRF, DDoS, man-in-the-middle — what they are and system-level defenses
- HTTPS everywhere: TLS 1.3, certificate management, certificate pinning

`02-deep-dive/README.md`:
- Secrets management: environment variables vs Vault vs AWS Secrets Manager
- Encryption at rest vs in transit — what to encrypt, key management
- Zero trust networking: never trust, always verify — mTLS between services
- API security: OAuth scopes, token rotation, refresh token flow, PKCE
- DDoS mitigation: at the CDN layer, rate limiting, IP reputation
- Compliance considerations: GDPR, HIPAA (data residency, encryption requirements, audit logs)

`04-exercises/`:
- **Design Challenge 01:** Design an authentication system for a multi-tenant SaaS app (SSO, RBAC, audit logging)
- **Design Challenge 02:** Given a system design, identify 5 security vulnerabilities and propose fixes

**Diagrams to Create:**
- `oauth-pkce-flow.drawio`
- `zero-trust-architecture.drawio`
- `defense-in-depth.drawio`

---

### MODULE 16 — Real-Time Systems
**Prerequisites:** Module 02, Module 08
**Difficulty:** Intermediate–Advanced
**Estimated Time:** 5–6 hours

**Learning Objectives:**
- Design systems that deliver data in real time
- Understand WebSockets, SSE, and when to use each
- Design chat systems, live feeds, and notification systems
- Understand presence systems

**Topics to Cover:**

`01-concepts/README.md`:
- What makes a system "real-time"? Hard real-time vs soft real-time
- WebSocket deep dive: connection lifecycle, server-side push, scaling WebSocket connections
- Server-Sent Events (SSE): when it's the right choice
- Long polling at scale: how WhatsApp used it
- Notification systems: push notifications (APNs, FCM), in-app notifications, email/SMS
- Presence systems: online/offline detection, heartbeat mechanisms

`02-deep-dive/README.md`:
- Scaling WebSocket servers: sticky sessions problem, stateful connection challenge, horizontal scaling with pub/sub backbone
- Fan-out problem: delivering a message to millions of subscribers efficiently
- Chat system design deep dive: 1:1 chat, group chat, message ordering, read receipts
- Live sports / stock ticker / collaborative editing — design patterns

`04-exercises/`:
- **Coding Challenge 01:** Build a real-time chat server in TypeScript using WebSockets (`ws` library) with room support
- **Coding Challenge 02:** Implement a presence system in TypeScript (heartbeat + Redis TTL)
- **Design Challenge 01:** Design WhatsApp — message delivery, group chat, read receipts, online presence

**Diagrams to Create:**
- `websocket-scaling-with-pubsub.drawio`
- `chat-system-architecture.drawio`
- `notification-system.drawio`

---

### MODULE 17 — Data Pipelines & Stream Processing
**Prerequisites:** Module 08, Module 09
**Difficulty:** Advanced
**Estimated Time:** 5–6 hours

**Learning Objectives:**
- Understand batch vs stream processing
- Know the Lambda and Kappa architectures
- Understand ETL/ELT pipelines
- Design data warehouse and analytics systems

**Topics to Cover:**

`01-concepts/README.md`:
- Batch processing: what it is, use cases, MapReduce concept, Apache Spark overview
- Stream processing: what it is, use cases, Apache Kafka Streams, Apache Flink overview
- ETL vs ELT: extract-transform-load vs extract-load-transform — when each applies
- Data warehouse concepts: OLAP vs OLTP, star schema, fact tables, dimension tables
- Lambda architecture: batch layer + speed layer + serving layer
- Kappa architecture: stream processing only — simplification of Lambda

`02-deep-dive/README.md`:
- Change Data Capture (CDC): Debezium, reading from DB transaction logs — how to stream DB changes to Kafka
- Data lake vs data warehouse vs data lakehouse — modern data architectures
- Column-oriented storage: Parquet, ORC — why it's faster for analytics
- Apache Airflow: DAG-based workflow orchestration

`04-exercises/`:
- **Design Challenge 01:** Design a real-time analytics pipeline for a ride-sharing app (trips per minute, surge pricing triggers, driver availability heatmaps)
- **Design Challenge 02:** Design a fraud detection pipeline that processes 100K transactions/second with <500ms latency

**Diagrams to Create:**
- `batch-vs-stream-processing.drawio`
- `lambda-architecture.drawio`
- `kappa-architecture.drawio`
- `cdc-pipeline.drawio`

---

### MODULE 18 — Search Systems
**Prerequisites:** Module 04, Module 09
**Difficulty:** Intermediate–Advanced
**Estimated Time:** 4–5 hours

**Learning Objectives:**
- Understand how full-text search engines work
- Know the internals of Elasticsearch
- Design type-ahead / autocomplete systems
- Design geo-search systems

**Topics to Cover:**

`01-concepts/README.md`:
- Full-text search: inverted index — how it works, TF-IDF, BM25 ranking
- Elasticsearch: index, shards, replicas, mappings, queries — architecture overview
- Search relevance: ranking factors, boosts, function score
- Autocomplete / type-ahead: prefix trees (Trie), edge n-grams, completion suggester

`02-deep-dive/README.md`:
- Geo-search: geohashing, S2 cells, PostGIS, Elasticsearch geo queries
- Faceted search: how filtering + aggregation works in Elasticsearch
- Search indexing pipeline: how data gets from source DB to search index
- Keeping search indexes in sync with the database: event-driven indexing vs polling

`04-exercises/`:
- **Coding Challenge 01:** Implement a Trie-based autocomplete system in TypeScript
- **Coding Challenge 02:** Implement a basic inverted index in TypeScript
- **Design Challenge 01:** Design the search system for Airbnb (location search, filters, ranking)
- **Design Challenge 02:** Design a Google-like type-ahead with top-k results

**Diagrams to Create:**
- `inverted-index.drawio`
- `search-indexing-pipeline.drawio`
- `trie-autocomplete.drawio`
- `geohash-grid.drawio`

---

### MODULE 19 — ML Systems & AI Infrastructure
**Prerequisites:** Module 17
**Difficulty:** Advanced
**Estimated Time:** 5–6 hours

**Learning Objectives:**
- Understand the system design challenges specific to ML workloads
- Know how to design ML pipelines, model serving, and feature stores
- Design recommendation systems
- Understand the infrastructure behind LLMs

**Topics to Cover:**

`01-concepts/README.md`:
- ML system design vs traditional system design — what's different
- ML lifecycle: data collection → feature engineering → training → evaluation → deployment → monitoring
- Feature stores: what they are, online vs offline store, why they exist (training-serving skew)
- Model serving: batch inference vs real-time inference, latency requirements
- A/B testing infrastructure for ML models

`02-deep-dive/README.md`:
- Recommendation systems: collaborative filtering, content-based filtering, two-tower models, approximate nearest neighbor search (FAISS, HNSW)
- Model monitoring: data drift, concept drift, prediction drift detection
- LLM infrastructure: GPU clusters, model parallelism, KV cache, inference optimization (quantization, batching)
- Retrieval-Augmented Generation (RAG) system design: vector databases (Pinecone, Weaviate, pgvector), chunking, embedding pipelines

`04-exercises/`:
- **Design Challenge 01:** Design the recommendation system for Netflix
- **Design Challenge 02:** Design a RAG-based document Q&A system — ingestion pipeline, vector DB, retrieval, generation

**Diagrams to Create:**
- `ml-lifecycle.drawio`
- `feature-store-architecture.drawio`
- `recommendation-system-two-tower.drawio`
- `rag-system-architecture.drawio`

---

### MODULE 20 — Advanced Patterns & Putting It All Together
**Prerequisites:** All previous modules
**Difficulty:** Advanced
**Estimated Time:** 6–8 hours

**Learning Objectives:**
- Know the advanced architectural patterns used at FAANG scale
- Understand multi-region and global system design
- Design systems from scratch using the complete toolkit
- Prepare for senior/staff engineer system design expectations

**Topics to Cover:**

`01-concepts/README.md`:
- Multi-region architectures: active-active vs active-passive, data replication across regions, conflict resolution
- Global transaction IDs and distributed ID generation: UUID, Twitter Snowflake, ULID — comparison
- Rate limiting at scale: distributed rate limiting, Redis + Lua scripts, token bucket across nodes
- Idempotency at scale: idempotency keys, deduplication
- Backoff and retry strategies: exponential backoff with jitter — why random jitter matters

`02-deep-dive/README.md`:
- Cell-based architecture: isolating blast radius, used at AWS, Slack — how and why
- Bulkhead and isolation patterns at scale
- Shadow traffic / dark launch: testing new systems with production traffic safely
- Canary deployments and feature flags in distributed systems
- Designing for operability: rollback strategies, blue-green deployments, progressive delivery
- Cost optimization in system design: choosing cheap but correct architecture

`03-interview-prep/`:
- Senior/Staff-level system design expectations — what's different
- Full worked examples: "Design Google Docs", "Design Uber", "Design a distributed rate limiter"
- How to drive the conversation vs follow the interviewer

`04-exercises/`:
- **Design Challenge 01 (Capstone):** Design a URL shortener from scratch — functional requirements, NFRs, capacity estimation, API design, database schema, caching strategy, scaling, observability
- **Design Challenge 02 (Capstone):** Design Twitter from scratch — full system covering all layers
- **Design Challenge 03 (Capstone):** Design Uber from scratch — geospatial, real-time, matching algorithms

**Diagrams to Create:**
- `multi-region-active-active.drawio`
- `snowflake-id-generation.drawio`
- `cell-based-architecture.drawio`
- `blue-green-deployment.drawio`

---

## Interview Prep Section Specification

### `interview-prep/README.md`
- How to use this section alongside the modules
- Recommended study plan: beginner (modules 1-6 + easy questions), intermediate (modules 7-13 + medium), advanced (all modules + hard)
- Links to all question bank entries

### `interview-prep/how-to-approach-system-design-interview.md`
Full guide covering:
- The 4-step framework (with time allocation for a 45-min interview)
  - Step 1: Requirements clarification (5 min) — functional requirements, NFRs, constraints, scale
  - Step 2: Capacity estimation (5 min) — DAU, QPS, storage, bandwidth
  - Step 3: High-level design (15 min) — draw the architecture, explain component roles
  - Step 4: Deep dive (15 min) — go deep on 2–3 components, trade-offs, bottlenecks
  - Step 5: Wrap up (5 min) — identify issues, future improvements
- Communication tips: think out loud, state assumptions, drive the conversation
- How to handle trade-offs verbally
- Red flags interviewers watch for

### `interview-prep/estimation-cheatsheet.md`
- Powers of 2 quick reference
- Latency numbers (memory, SSD, HDD, network)
- Storage size reference (1 byte → 1 TB)
- Common QPS calculations (1M DAU at 100 req/day = ~1150 QPS)
- Bandwidth calculation examples
- Storage calculation examples (tweets, photos, videos)

### `interview-prep/question-bank/`

**easy/** (suitable after Modules 1–6):
- Design a URL shortener
- Design a Pastebin
- Design a rate limiter
- Design a key-value store
- Design a parking lot system

**medium/** (suitable after Modules 7–13):
- Design Twitter
- Design Instagram
- Design a chat system (WhatsApp)
- Design a notification system
- Design a ride-sharing app (Uber)
- Design YouTube
- Design a web crawler
- Design a search autocomplete
- Design a news feed

**hard/** (suitable after all modules):
- Design Google Docs (collaborative editing)
- Design a distributed message queue
- Design a distributed cache (like Redis)
- Design a distributed file system (like S3)
- Design a stock trading system
- Design Airbnb
- Design Netflix
- Design a payment system

Each question file MUST include:
1. Problem statement
2. Clarifying questions to ask
3. Functional requirements
4. Non-functional requirements (scale targets)
5. Capacity estimation (worked through)
6. High-level architecture diagram (Excalidraw/Draw.io)
7. Component deep dives (database schema, API design, caching strategy, etc.)
8. Trade-offs discussed
9. Follow-up questions the interviewer might ask

---

## Cheatsheets Specification

### `cheatsheets/numbers-every-engineer-should-know.md`
- L1 cache: 1ns
- L2 cache: 4ns
- RAM: 100ns
- SSD: 16μs
- HDD: 4ms
- Network same DC: 0.5ms
- Cross-region network: ~100ms
- Disk sequential read: 100MB/s
- Network within DC: 1–10 Gbps
- Powers of 2 table (2^10=1K, 2^20=1M, 2^30=1B...)
- Common request sizes (tweet: 140 bytes, image: 200KB, video minute: 50MB)

### `cheatsheets/database-comparison.md`
Full comparison table: PostgreSQL, MySQL, MongoDB, Cassandra, Redis, DynamoDB, Elasticsearch, Neo4j — covering data model, consistency, scale, query flexibility, best use cases

### `cheatsheets/scaling-patterns.md`
Quick reference of every scaling pattern with one-line description and link to relevant module

### `cheatsheets/system-design-vocabulary.md`
Glossary of every term used across all modules — alphabetical

---

## Company Architectures Section Specification

### `company-architectures/README.md`
- Explanation that this section contains real-world system architecture case studies
- How to read the case studies
- Index of companies (to be filled by repo owner)
- Placeholder folder structure:
  ```
  company-architectures/
  ├── README.md
  ├── _template/
  │   ├── README.md           ← Template for adding a new company
  │   ├── architecture.drawio ← Blank diagram template
  │   └── architecture.png    ← Placeholder image
  └── (company folders added by repo owner)
  ```

### `company-architectures/_template/README.md`
Template structure every company entry should follow:
1. Company & Product Overview
2. Scale (DAU, QPS, storage TB)
3. Architecture diagram
4. Key components and their roles
5. Key design decisions and trade-offs
6. What changed over time (evolution)
7. Lessons learned / what makes it unique
8. References (engineering blog posts, talks)

---

## Root Files Specification

### `README.md`
The main README must include:
- **Hero section**: Repository name, tagline, badges (license, stars, contributors, last updated)
- **Why this repository**: 3–4 compelling differentiators vs other resources
- **What you'll learn**: Overview of the full learning path
- **Learning path visual**: A clear linear diagram showing Module 1 → Module 20 with brief topic labels
- **Module index table**: Module number | Title | Difficulty | Est. Time | Prerequisites
- **How to use this repository**: Instructions for beginners, intermediates, advanced learners, and interview preppers
- **Contributing section**: Link to CONTRIBUTING.md
- **Community section**: GitHub Discussions, Discord (if applicable)
- **License section**
- **Acknowledgements**

### `CONTRIBUTING.md`
- How to contribute: content improvements, new exercises, diagram fixes, typo fixes
- Content standards: tone (clear, direct, no fluff), diagram requirements (must provide both source + PNG), code standards (TypeScript, must run, must include comments)
- Module structure requirements (link to the module template)
- PR process
- Good first issue guide

### `CODE_OF_CONDUCT.md`
Standard Contributor Covenant Code of Conduct

---

## GitHub Actions Specification

### `.github/workflows/validate-links.yml`
- Trigger: on PR and push to main
- Action: use `lychee` or `markdown-link-check` to validate all links in all `.md` files
- Fail PR if broken links detected

---

## Diagram Standards

All diagrams MUST follow these standards:
1. Source file (`.drawio` or `.excalidraw`) stored in `module-XX-topic/01-concepts/diagrams/source/`
2. Exported PNG stored in `module-XX-topic/01-concepts/diagrams/exports/`
3. PNG named identically to source file but with `.png` extension
4. PNGs exported at minimum 1440px wide
5. Every diagram referenced in a markdown file using a relative path: `![alt text](./diagrams/exports/diagram-name.png)`
6. Every diagram must have a caption directly below it explaining what it shows
7. Color convention (document in CONTRIBUTING.md):
   - Client/User: blue (#4A90D9)
   - Server/Service: green (#27AE60)
   - Database: orange (#E67E22)
   - Cache: purple (#8E44AD)
   - Message Queue: yellow (#F39C12)
   - External service: grey (#95A5A6)
   - Load Balancer: teal (#16A085)

---

## Code Example Standards

All code examples MUST follow these standards:
1. Written in TypeScript (with strict mode enabled)
2. Must be runnable standalone or with minimal setup (documented at top of file)
3. Must include inline comments explaining the system design concept being illustrated
4. Include a `// Usage:` section at bottom showing how to run/use the code
5. Where applicable, include timing/performance measurements to illustrate the concept
6. No external dependencies unless absolutely necessary; prefer Node.js built-ins
7. All imports at top of file
8. Files must be named descriptively: `lru-cache.ts`, `consistent-hashing.ts`, `circuit-breaker.ts`

---

## Content Quality Standards

Every piece of content must:
1. Start with a real-world motivation ("Why does this matter?") before diving into theory
2. Use concrete, relatable analogies (not just abstract definitions)
3. Always state trade-offs — never present something as purely good or purely bad
4. Include "Interview Angle" callout boxes in every concept explanation
5. Link backwards to prerequisites and forwards to what this enables
6. End concept sections with a "Key Takeaways" bullet list (max 5 bullets)
7. Be reviewed for accuracy against primary sources (official docs, research papers, engineering blogs)

---

## Implementation Priority Order

The coding agent should implement files in this order:

**Phase 1 — Foundation**
1. `README.md` (root)
2. `LICENSE` (MIT)
3. `CONTRIBUTING.md`
4. `CODE_OF_CONDUCT.md`
5. `.github/` directory and templates
6. `cheatsheets/` — all 4 cheatsheets
7. `company-architectures/README.md` and `_template/`

**Phase 2 — Modules 1–5**
8. All files for Module 01
9. All files for Module 02
10. All files for Module 03
11. All files for Module 04
12. All files for Module 05

**Phase 3 — Modules 6–10**
13. Module 06 through Module 10 (each fully complete)

**Phase 4 — Modules 11–15**
14. Module 11 through Module 15

**Phase 5 — Modules 16–20**
15. Module 16 through Module 20

**Phase 6 — Interview Prep**
16. `interview-prep/README.md`
17. `interview-prep/how-to-approach-system-design-interview.md`
18. `interview-prep/estimation-cheatsheet.md`
19. `interview-prep/common-mistakes.md`
20. All question bank files (easy, medium, hard)

**Phase 7 — Exercises**
21. `exercises/README.md`
22. `exercises/solutions/README.md`
23. All coding challenge starters (`.ts` files with problem statement as comments)

---

## Notes for the Coding Agent

- **Do NOT create diagram files** — diagrams will be created manually. Create placeholder markdown notes where diagrams should be: `> 📊 **Diagram:** \`diagram-name.drawio\` — [description of what the diagram shows]`
- **Create all `.ts` starter files** with problem description as block comments, skeleton code structure, and `// TODO:` markers for students
- **Create all solution files** in a hidden path or clearly separated location
- **All markdown files** must use proper heading hierarchy (H1 for title, H2 for major sections, H3 for subsections)
- **Use callout-style blockquotes** for important notes: `> 💡 **Note:`, `> ⚠️ **Warning:`, `> 🎯 **Interview Tip:`
- **Module READMEs** must always include a prerequisites table at the top
- **Link everything**: modules link to each other, exercises link to relevant concept pages, cheatsheets link to modules
- **Generate a `SUMMARY.md`** at the root that is a flat table of contents of every file in the repo

---

## Success Criteria

The repository is complete when:
- [ ] All 20 module directories exist with all required subdirectory structure
- [ ] Every module has a `README.md`, concepts, deep-dive, interview-prep, exercises, and summary
- [ ] All coding challenge starters (`.ts`) are created and runnable
- [ ] All design challenge prompts are written with clear requirements
- [ ] All cheatsheets are complete and accurate
- [ ] All interview prep files are written
- [ ] Root `README.md` is polished and complete
- [ ] `CONTRIBUTING.md` fully explains how to contribute
- [ ] GitHub Actions workflow is configured
- [ ] All internal links are valid
- [ ] Diagram placeholders are in place for every referenced diagram

---

## Verbatim File Content Specifications

This section provides the exact content that must be written into every key file. The coding agent must use these as the authoritative source for file contents.

---

### `README.md` (root) — Content Spec

The root README must be written with real content — not placeholders. It must contain:

**Hero section:**
```
# 🏗️ System Design Mastery
> The most comprehensive open-source resource to learn system design — from absolute beginner to professional engineer.
Badges: License: MIT | PRs Welcome | Modules: 20 | Exercises: 60+
```

**"Why This Repository?" comparison table** with columns: Feature | This Repo | Other Resources, covering:
- Linear learning path (beginner → pro)
- Real TypeScript code examples
- Coding + design exercises every module
- Interview prep built into every topic
- Real-world company architectures
- Free and open source

**Learning path ASCII diagram:**
```
[01 Foundations] → [02 Networking] → [03 APIs] → [04 Databases] → [05 Caching]
       ↓
[06 Scalability] → [07 Load Balancing] → [08 Message Queues] → [09 Storage] → [10 CDN]
       ↓
[11 Microservices] → [12 Distributed Systems] → [13 Consistency & Consensus]
       ↓
[14 Observability] → [15 Security] → [16 Real-Time Systems]
       ↓
[17 Data Pipelines] → [18 Search Systems] → [19 ML Systems] → [20 Advanced Patterns]
```

**Module index table** — all 20 modules with: # | Module (linked) | Difficulty emoji | Time | Prerequisites

**"How to Use This Repository"** section with 4 tracks:
- 🟢 Beginner track (start at Module 01, work forward in order)
- 🟡 Intermediate track (skim Module 01–05 summaries, start from 06)
- 🔴 Senior/Staff interview track (Interview Prep section first, then question bank)
- 📖 Look-something-up track (cheatsheets + vocabulary)

**Company Architecture Case Studies** section linking to company-architectures/

**Contributing, License, Acknowledgements** sections

---

### `CONTRIBUTING.md` — Content Spec

Must contain all of:
1. **Types of Contributions** — content improvements, exercises, diagrams, typo fixes, further reading, question bank entries
2. **Content Standards** — tone (clear, direct, no fluff), always state trade-offs, always start with "why this matters", end with "Key Takeaways" (max 5), use callout blockquotes: `> 💡 **Note:**`, `> ⚠️ **Warning:**`, `> 🎯 **Interview Tip:**`, `> 📊 **Diagram:**`
3. **Module Structure Requirements** — every module must follow the exact structure in this document
4. **Code Standards** — TypeScript strict mode, runnable with `npx ts-node`, file header comment format (title, module, concept, run command, dependencies), inline comments explaining *why* not *what*, `// === USAGE EXAMPLE ===` section at bottom, no `any`
5. **Diagram Standards** — Draw.io or Excalidraw, PNG at 1440px+ width, source in `diagrams/source/`, PNG in `diagrams/exports/`, color convention table:
   - Client/User: Blue #4A90D9
   - Server/Service: Green #27AE60
   - Database: Orange #E67E22
   - Cache: Purple #8E44AD
   - Message Queue: Yellow #F39C12
   - External Service: Grey #95A5A6
   - Load Balancer: Teal #16A085
   - CDN/Edge: Pink #E91E8C
6. **PR Process** — fork, branch naming convention (`content/module-04-add-sharding-exercise`), run validate-links.sh, PR title format
7. **Good First Issues** — labels: good first issue, typo fix, link fix, exercise needed

---

### `.github/PULL_REQUEST_TEMPLATE.md` — Content Spec

```markdown
## Description
<!-- What does this PR do? Be specific. -->

## Type of Change
- [ ] Content improvement (clarification, accuracy fix)
- [ ] New exercise (coding challenge or design challenge)
- [ ] New diagram
- [ ] Typo / grammar fix
- [ ] New module section
- [ ] Cheatsheet update
- [ ] Infrastructure / tooling

## Module(s) Affected
<!-- e.g. Module 04 — Databases -->

## Checklist
- [ ] I have read CONTRIBUTING.md
- [ ] My content follows the tone and structure standards
- [ ] Any code I added runs with `npx ts-node` and is typed correctly
- [ ] Any diagrams include both source file (.drawio/.excalidraw) and exported PNG
- [ ] I have run `bash scripts/validate-links.sh` and fixed broken links
- [ ] I have updated SUMMARY.md in any affected module

## References
<!-- Link to relevant issues, external sources, or engineering blogs used -->
```

---

### `.github/workflows/validate-links.yml` — Content Spec

```yaml
name: Validate Links
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  validate-links:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Restore lychee cache
        uses: actions/cache@v3
        with:
          path: .lycheecache
          key: cache-lychee-${{ github.sha }}
          restore-keys: cache-lychee-
      - name: Run lychee link checker
        uses: lycheeverse/lychee-action@v1
        with:
          args: |
            --cache --max-cache-age 1d --exclude-mail
            --exclude "https://img.shields.io"
            --timeout 20 --max-retries 3
            '**/*.md'
          fail: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

### `scripts/validate-links.sh` — Content Spec

```bash
#!/bin/bash
# Run locally before submitting a PR
# Requires: npm install -g markdown-link-check
set -e
echo "🔍 Validating all markdown links..."
find . -name "*.md" -not -path "./.git/*" -not -path "./node_modules/*" | while read file; do
  echo "Checking: $file"
  markdown-link-check "$file" --config .markdown-link-check.json
done
echo "✅ All links valid."
```

---

### `scripts/check-structure.sh` — Content Spec

```bash
#!/bin/bash
# Validates all 20 modules have required directory structure
set -e
MODULES_DIR="./modules"
REQUIRED_FILES=("README.md" "SUMMARY.md" "01-concepts/README.md" "02-deep-dive/README.md" "03-interview-prep/README.md" "03-interview-prep/common-questions.md" "04-exercises/README.md" "05-further-reading/README.md")
ERRORS=0
for module_dir in "$MODULES_DIR"/*/; do
  module_name=$(basename "$module_dir")
  for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$module_dir$file" ]; then
      echo "❌ MISSING FILE: $module_name/$file"
      ERRORS=$((ERRORS + 1))
    fi
  done
done
if [ "$ERRORS" -eq 0 ]; then echo "✅ All module structures are valid."; else echo "❌ Found $ERRORS issue(s)."; exit 1; fi
```

---

## TypeScript Starter Files — Full Specifications

### Module 01 — Coding Challenge 01: Capacity Estimator
**File:** `modules/module-01-foundations/04-exercises/coding-challenges/challenge-01/starter.ts`

```typescript
/**
 * Capacity Estimator
 * Module: 01 — Foundations of System Design
 * Concept: Back-of-envelope estimation is a core system design skill.
 * Run: npx ts-node starter.ts
 * Dependencies: none
 */

interface SystemParams {
  dailyActiveUsers: number;
  averageRequestsPerUserPerDay: number;
  averageRequestSizeBytes: number;
  readToWriteRatio: number; // e.g. 10 means 10 reads per 1 write
  dataRetentionYears: number;
}

interface CapacityEstimate {
  totalRequestsPerDay: number;
  averageQPS: number;
  peakQPS: number; // assume peak = 2x average
  readQPS: number;
  writeQPS: number;
  dailyStorageGB: number;
  totalStorageGB: number;
  dailyBandwidthGbps: number;
}

/**
 * TODO: Implement this function.
 * Steps:
 * 1. totalRequests = DAU × requestsPerUser
 * 2. averageQPS = totalRequests / 86400
 * 3. peakQPS = averageQPS × 2
 * 4. readQPS = peakQPS × (ratio / (ratio + 1))
 * 5. writeQPS = peakQPS × (1 / (ratio + 1))
 * 6. dailyStorageGB = (writeQPS × 86400 × avgSizeBytes) / 1e9
 * 7. totalStorageGB = dailyStorageGB × 365 × retentionYears
 * 8. dailyBandwidthGbps = (totalRequests × avgSizeBytes) / 86400 / 1e9
 */
function estimateCapacity(params: SystemParams): CapacityEstimate {
  // TODO: implement
  throw new Error("Not implemented");
}

function formatEstimate(params: SystemParams, estimate: CapacityEstimate): void {
  // TODO: print a human-readable summary — round all numbers to 2 decimal places
  throw new Error("Not implemented");
}

// === USAGE EXAMPLE ===
const twitterLike: SystemParams = {
  dailyActiveUsers: 100_000_000,
  averageRequestsPerUserPerDay: 10,
  averageRequestSizeBytes: 1024,
  readToWriteRatio: 10,
  dataRetentionYears: 5,
};

const estimate = estimateCapacity(twitterLike);
formatEstimate(twitterLike, estimate);
```

---

### Module 03 — Coding Challenge 03: Token Bucket Rate Limiter
**File:** `modules/module-03-apis/04-exercises/coding-challenges/challenge-03/starter.ts`

```typescript
/**
 * Token Bucket Rate Limiter
 * Module: 03 — API Design
 * Concept: Token bucket is the most common API rate limiting algorithm.
 *   Tokens refill at a fixed rate. Each request consumes one token.
 *   If empty, request is rejected.
 * Run: npx ts-node starter.ts
 * Dependencies: none
 */

interface TokenBucketConfig {
  capacity: number;           // Max tokens in bucket
  refillRatePerSecond: number; // Tokens added per second
}

interface RateLimitResult {
  allowed: boolean;
  tokensRemaining: number;
  retryAfterMs?: number;
}

/**
 * TODO: Implement TokenBucket class.
 *
 * private refill(): void
 *   - elapsed = Date.now() - lastRefillTime
 *   - tokensToAdd = elapsed * refillRatePerSecond / 1000
 *   - currentTokens = min(capacity, currentTokens + tokensToAdd)
 *   - lastRefillTime = Date.now()
 *
 * consume(tokens = 1): RateLimitResult
 *   - Call refill() first
 *   - If currentTokens >= tokens: subtract, return allowed: true
 *   - Else: return allowed: false, retryAfterMs = (tokens - currentTokens) / refillRatePerSecond * 1000
 */
class TokenBucket {
  private capacity: number;
  private refillRatePerSecond: number;
  private currentTokens: number;
  private lastRefillTime: number;

  constructor(config: TokenBucketConfig) {
    this.capacity = config.capacity;
    this.refillRatePerSecond = config.refillRatePerSecond;
    this.currentTokens = config.capacity;
    this.lastRefillTime = Date.now();
  }

  private refill(): void {
    // TODO: implement
  }

  consume(tokens: number = 1): RateLimitResult {
    // TODO: implement
    throw new Error("Not implemented");
  }
}

/**
 * TODO: Implement RateLimiter — a per-user map of TokenBuckets.
 * checkLimit(userId): get or create bucket for userId, call consume()
 */
class RateLimiter {
  private buckets: Map<string, TokenBucket> = new Map();
  private config: TokenBucketConfig;

  constructor(config: TokenBucketConfig) {
    this.config = config;
  }

  checkLimit(userId: string): RateLimitResult {
    // TODO: implement
    throw new Error("Not implemented");
  }
}

// === USAGE EXAMPLE ===
const limiter = new RateLimiter({ capacity: 5, refillRatePerSecond: 1 });

async function simulate(): Promise<void> {
  for (let i = 0; i < 10; i++) {
    const result = limiter.checkLimit("alice");
    const icon = result.allowed ? "✅" : "❌";
    console.log(`Request ${i + 1}: ${icon} | Tokens left: ${result.tokensRemaining}${result.retryAfterMs ? ` | Retry after: ${result.retryAfterMs}ms` : ""}`);
    if (i === 6) {
      console.log("--- Waiting 3 seconds for token refill ---");
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}
simulate();
```

---

### Module 04 — Coding Challenge 03: Consistent Hashing
**File:** `modules/module-04-databases/04-exercises/coding-challenges/challenge-03/starter.ts`

```typescript
/**
 * Consistent Hashing
 * Module: 04 — Databases
 * Concept: Consistent hashing minimises key remapping when nodes join/leave.
 *   Used in Cassandra, DynamoDB, and distributed caches.
 * Run: npx ts-node starter.ts
 * Dependencies: none (uses Node.js built-in crypto)
 */

import * as crypto from "crypto";

function hashToRingPosition(key: string, ringSize: number): number {
  const hex = crypto.createHash("md5").update(key).digest("hex");
  return parseInt(hex.substring(0, 8), 16) % ringSize;
}

/**
 * TODO: Implement ConsistentHashRing.
 *
 * Properties:
 *   RING_SIZE = 2 ** 32
 *   virtualNodesPerNode: number (default 150)
 *   ring: Map<number, string>   — position → node name
 *   sortedPositions: number[]   — sorted ring positions
 *
 * addNode(nodeName: string): void
 *   For each vnode i in [0, virtualNodesPerNode):
 *     position = hashToRingPosition(`${nodeName}:vnode-${i}`, RING_SIZE)
 *     ring.set(position, nodeName)
 *   Re-sort sortedPositions.
 *
 * removeNode(nodeName: string): void
 *   Remove all positions that map to nodeName.
 *   Re-sort sortedPositions.
 *
 * getNode(key: string): string
 *   pos = hashToRingPosition(key, RING_SIZE)
 *   First position in sortedPositions >= pos (wrap to [0] if none found)
 *   Return ring.get(that position)
 *
 * getDistribution(keys: string[]): Map<string, number>
 *   Count how many keys map to each node.
 */
class ConsistentHashRing {
  private readonly RING_SIZE = 2 ** 32;
  private virtualNodesPerNode: number;
  private ring: Map<number, string> = new Map();
  private sortedPositions: number[] = [];

  constructor(virtualNodesPerNode = 150) {
    this.virtualNodesPerNode = virtualNodesPerNode;
  }

  addNode(nodeName: string): void {
    // TODO: implement
  }

  removeNode(nodeName: string): void {
    // TODO: implement
  }

  getNode(key: string): string {
    // TODO: implement
    throw new Error("Not implemented");
  }

  getDistribution(keys: string[]): Map<string, number> {
    // TODO: implement
    throw new Error("Not implemented");
  }
}

// === USAGE EXAMPLE ===
const ring = new ConsistentHashRing(150);
["node-A", "node-B", "node-C"].forEach((n) => ring.addNode(n));
const testKeys = Array.from({ length: 1000 }, (_, i) => `user:${i}`);

console.log("=== Distribution with 3 nodes ===");
ring.getDistribution(testKeys).forEach((count, node) =>
  console.log(`  ${node}: ${count} keys (${((count / 1000) * 100).toFixed(1)}%)`)
);

ring.removeNode("node-B");
console.log("\n=== After removing node-B ===");
ring.getDistribution(testKeys).forEach((count, node) =>
  console.log(`  ${node}: ${count} keys (${((count / 1000) * 100).toFixed(1)}%)`)
);
```

---

### Module 05 — Coding Challenge 01: LRU Cache
**File:** `modules/module-05-caching/04-exercises/coding-challenges/challenge-01/starter.ts`

```typescript
/**
 * LRU Cache — Least Recently Used
 * Module: 05 — Caching
 * Concept: LRU eviction uses a doubly-linked list (O(1) move-to-front)
 *   + hashmap (O(1) lookup). Both get and put are O(1).
 * Run: npx ts-node starter.ts
 * Dependencies: none
 */

interface DLLNode<V> {
  key: string;
  value: V;
  prev: DLLNode<V> | null;
  next: DLLNode<V> | null;
}

/**
 * TODO: Implement LRUCache<V>.
 *
 * Internals:
 *   map: Map<string, DLLNode<V>>
 *   head: DLLNode (dummy, most-recently-used end)
 *   tail: DLLNode (dummy, least-recently-used end)
 *   size: number
 *
 * Private helpers:
 *   addToFront(node): insert node right after head
 *   removeNode(node): unlink from list (fix prev/next pointers)
 *   removeLRU(): remove node before tail, return it
 *
 * Public:
 *   get(key): V | null — move to front on hit
 *   put(key, value): void — evict LRU if at capacity before adding
 *   printState(): void — already implemented below, do not modify
 */
class LRUCache<V> {
  private capacity: number;
  private size = 0;
  private map: Map<string, DLLNode<V>> = new Map();
  private head: DLLNode<any>;
  private tail: DLLNode<any>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.head = { key: "__head__", value: null, prev: null, next: null };
    this.tail = { key: "__tail__", value: null, prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  private addToFront(node: DLLNode<V>): void {
    // TODO: implement
  }

  private removeNode(node: DLLNode<V>): void {
    // TODO: implement
  }

  private removeLRU(): DLLNode<V> {
    // TODO: implement
    throw new Error("Not implemented");
  }

  get(key: string): V | null {
    // TODO: implement
    throw new Error("Not implemented");
  }

  put(key: string, value: V): void {
    // TODO: implement
  }

  printState(): void {
    const items: string[] = [];
    let curr = this.head.next;
    while (curr && curr !== this.tail) {
      items.push(`${curr.key}:${curr.value}`);
      curr = curr.next;
    }
    console.log(`[MRU→LRU]: [${items.join(", ")}] (${this.size}/${this.capacity})`);
  }
}

// === USAGE EXAMPLE ===
const cache = new LRUCache<number>(3);
cache.put("a", 1); cache.printState(); // [a:1]
cache.put("b", 2); cache.printState(); // [b:2, a:1]
cache.put("c", 3); cache.printState(); // [c:3, b:2, a:1]
cache.get("a");    cache.printState(); // [a:1, c:3, b:2] — a promoted
cache.put("d", 4); cache.printState(); // [d:4, a:1, c:3] — b evicted
console.log("get b:", cache.get("b")); // null
```

---

### Module 08 — Coding Challenge 01: In-Memory Message Queue with DLQ
**File:** `modules/module-08-message-queues/04-exercises/coding-challenges/challenge-01/starter.ts`

```typescript
/**
 * In-Memory Message Queue with Dead Letter Queue
 * Module: 08 — Message Queues & Event-Driven Architecture
 * Concept: At-least-once delivery with visibility timeout and DLQ.
 *   Messages that fail maxRetries times are moved to the DLQ.
 * Run: npx ts-node starter.ts
 * Dependencies: none
 */

interface Message<T> {
  id: string;
  payload: T;
  attempts: number;
  enqueuedAt: number;
  visibilityTimeout?: number; // epoch ms when message becomes visible again
}

interface QueueConfig {
  maxRetries: number;
  visibilityTimeoutMs: number;
}

/**
 * TODO: Implement MessageQueue<T>.
 *
 * enqueue(payload): string
 *   Create Message (id = Date.now().toString() + Math.random()), add to queue, return id.
 *
 * receive(): Message<T> | null
 *   Find first visible message (no visibilityTimeout, or it has expired).
 *   Set visibilityTimeout = Date.now() + config.visibilityTimeoutMs.
 *   Increment attempts.
 *   If attempts > maxRetries: move to dlq, return null.
 *   Return the message.
 *
 * ack(messageId): boolean
 *   Remove message from queue. Return true if found.
 *
 * nack(messageId): void
 *   Reset visibilityTimeout to undefined (make immediately visible again).
 *
 * getStats(): { queueDepth, dlqDepth, inFlight }
 *   inFlight = messages with a future visibilityTimeout
 */
class MessageQueue<T> {
  private queue: Message<T>[] = [];
  private dlq: Message<T>[] = [];
  private config: QueueConfig;

  constructor(config: QueueConfig) {
    this.config = config;
  }

  enqueue(payload: T): string {
    // TODO: implement
    throw new Error("Not implemented");
  }

  receive(): Message<T> | null {
    // TODO: implement
    throw new Error("Not implemented");
  }

  ack(messageId: string): boolean {
    // TODO: implement
    throw new Error("Not implemented");
  }

  nack(messageId: string): void {
    // TODO: implement
  }

  getStats(): { queueDepth: number; dlqDepth: number; inFlight: number } {
    // TODO: implement
    throw new Error("Not implemented");
  }

  getDLQMessages(): Message<T>[] {
    return [...this.dlq];
  }
}

// === USAGE EXAMPLE ===
async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function simulate(): Promise<void> {
  const q = new MessageQueue<string>({ maxRetries: 3, visibilityTimeoutMs: 500 });
  q.enqueue("order:1001");
  q.enqueue("order:1002");
  q.enqueue("order:1003");
  console.log("After enqueue:", q.getStats());

  const m1 = q.receive();
  if (m1) { console.log(`Processing: ${m1.payload}`); q.ack(m1.id); }

  for (let i = 0; i < 4; i++) {
    const m = q.receive();
    if (m) {
      console.log(`Attempt ${m.attempts} on ${m.payload} — failing`);
      q.nack(m.id);
      await sleep(100);
    }
  }

  console.log("\nFinal stats:", q.getStats());
  console.log("DLQ:", q.getDLQMessages().map((m) => m.payload));
}
simulate();
```

---

### Module 12 — Coding Challenge 01: Lamport Timestamps
**File:** `modules/module-12-distributed-systems/04-exercises/coding-challenges/challenge-01/starter.ts`

```typescript
/**
 * Lamport Timestamps
 * Module: 12 — Distributed Systems Fundamentals
 * Concept: Logical clocks provide happened-before ordering without a global clock.
 *   Rule: increment before send; on receive, clock = max(local, received) + 1.
 * Run: npx ts-node starter.ts
 * Dependencies: none
 */

interface LamportEvent {
  nodeId: string;
  eventName: string;
  timestamp: number;
}

/**
 * TODO: Implement LamportNode.
 *
 * localEvent(name): LamportEvent
 *   clock++; log and return event.
 *
 * send(name): { event, timestamp }
 *   clock++; log and return event + timestamp to include in message.
 *
 * receive(name, senderTimestamp): LamportEvent
 *   clock = max(clock, senderTimestamp) + 1; log and return event.
 *
 * printLog(): void
 *   Print all events sorted by timestamp.
 */
class LamportNode {
  public readonly nodeId: string;
  private clock = 0;
  private eventLog: LamportEvent[] = [];

  constructor(nodeId: string) {
    this.nodeId = nodeId;
  }

  localEvent(name: string): LamportEvent {
    // TODO: implement
    throw new Error("Not implemented");
  }

  send(name: string): { event: LamportEvent; timestamp: number } {
    // TODO: implement
    throw new Error("Not implemented");
  }

  receive(name: string, senderTimestamp: number): LamportEvent {
    // TODO: implement
    throw new Error("Not implemented");
  }

  printLog(): void {
    console.log(`\n[Node ${this.nodeId}] Event Log:`);
    this.eventLog.forEach((e) =>
      console.log(`  T=${String(e.timestamp).padStart(3)} — ${e.eventName}`)
    );
  }
}

// === USAGE EXAMPLE ===
const A = new LamportNode("A");
const B = new LamportNode("B");
const C = new LamportNode("C");

A.localEvent("Process job #1");
const { timestamp: t1 } = A.send("Send request → B");
B.receive("Receive request from A", t1);

B.localEvent("Process request");
const { timestamp: t2 } = B.send("Send result → C");
C.receive("Receive result from B", t2);

C.localEvent("Local computation");
const { timestamp: t3 } = C.send("Send ack → A");
A.receive("Receive ack from C", t3);

A.printLog();
B.printLog();
C.printLog();
```

---

### Module 13 — Coding Challenge 01: G-Counter CRDT
**File:** `modules/module-13-consistency-consensus/04-exercises/coding-challenges/challenge-01/starter.ts`

```typescript
/**
 * G-Counter CRDT (Grow-Only Counter)
 * Module: 13 — Consistency, Consensus & CAP Theorem
 * Concept: CRDTs can be replicated and merged without coordination.
 *   A G-Counter stores per-node counts; merge takes per-node max.
 *   The total value is the sum of all per-node counts.
 * Run: npx ts-node starter.ts
 * Dependencies: none
 */

/**
 * TODO: Implement GCounter.
 *
 * increment(): void
 *   Increment this node's counter by 1.
 *
 * value(): number
 *   Sum of all per-node counters.
 *
 * merge(other: GCounter): void
 *   For each nodeId in other: this[nodeId] = max(this[nodeId] ?? 0, other[nodeId])
 *   This operation is commutative, associative, and idempotent.
 *
 * state(): Record<string, number>
 *   Plain object snapshot for serialisation.
 */
class GCounter {
  private readonly nodeId: string;
  private counters: Map<string, number> = new Map();

  constructor(nodeId: string) {
    this.nodeId = nodeId;
    this.counters.set(nodeId, 0);
  }

  increment(): void {
    // TODO: implement
  }

  value(): number {
    // TODO: implement
    throw new Error("Not implemented");
  }

  merge(other: GCounter): void {
    // TODO: expose internal counters via a getter, then merge
    throw new Error("Not implemented");
  }

  // Helper: expose counters for merging
  getCounters(): Map<string, number> {
    return new Map(this.counters);
  }

  state(): Record<string, number> {
    const obj: Record<string, number> = {};
    this.counters.forEach((v, k) => { obj[k] = v; });
    return obj;
  }
}

// === USAGE EXAMPLE ===
const counterA = new GCounter("node-A");
const counterB = new GCounter("node-B");
const counterC = new GCounter("node-C");

counterA.increment(); counterA.increment(); counterA.increment(); // A: 3
counterB.increment(); counterB.increment();                        // B: 2
counterC.increment();                                              // C: 1

console.log("Before merge:");
console.log("  A value:", counterA.value(), "state:", counterA.state());
console.log("  B value:", counterB.value(), "state:", counterB.state());

counterA.merge(counterB);
counterA.merge(counterC);
counterB.merge(counterA);

console.log("\nAfter merge:");
console.log("  A value:", counterA.value(), "(expected: 6)");
console.log("  B value:", counterB.value(), "(expected: 6)");

// Idempotency check
counterA.merge(counterB);
console.log("  A after re-merge:", counterA.value(), "(should still be 6)");
```

---

### Module 16 — Coding Challenge 01: WebSocket Chat Server
**File:** `modules/module-16-real-time-systems/04-exercises/coding-challenges/challenge-01/starter.ts`

```typescript
/**
 * Real-Time Chat Server with Rooms
 * Module: 16 — Real-Time Systems
 * Concept: WebSockets maintain persistent bidirectional connections.
 *   This server supports multiple named rooms with join/leave/message events.
 * Run: npx ts-node starter.ts
 *   Connect: ws://localhost:8080?room=general&user=alice
 * Dependencies: npm install ws @types/ws
 */

import * as WebSocket from "ws";
import * as http from "http";
import * as url from "url";

interface Client {
  ws: WebSocket;
  userId: string;
  room: string;
  connectedAt: number;
}

interface ChatMessage {
  type: "message" | "join" | "leave" | "error" | "user_list";
  room: string;
  userId?: string;
  content?: string;
  users?: string[];
  timestamp: number;
}

/**
 * TODO: Implement ChatServer.
 *
 * handleConnection(ws, userId, room): void
 *   1. Add to clients map and rooms map
 *   2. Broadcast "join" to everyone else in the room
 *   3. Send "user_list" to the new client
 *   4. Attach ws.on("message") → handleMessage
 *   5. Attach ws.on("close") → handleDisconnect
 *
 * handleMessage(ws, rawData): void
 *   Parse JSON, validate, broadcast to room (include sender).
 *
 * handleDisconnect(ws): void
 *   Remove from clients + rooms, broadcast "leave" to room.
 *
 * broadcast(room, message, exclude?): void
 *   Send to all OPEN connections in room, skip `exclude` if provided.
 *
 * getRoomUsers(room): string[]
 *   Return userIds of all clients in the room.
 */
class ChatServer {
  private clients: Map<WebSocket, Client> = new Map();
  private rooms: Map<string, Set<WebSocket>> = new Map();

  handleConnection(ws: WebSocket, userId: string, room: string): void {
    // TODO: implement
  }

  private handleMessage(ws: WebSocket, rawData: string): void {
    // TODO: implement
  }

  private handleDisconnect(ws: WebSocket): void {
    // TODO: implement
  }

  private broadcast(room: string, message: ChatMessage, exclude?: WebSocket): void {
    // TODO: implement
  }

  private getRoomUsers(room: string): string[] {
    // TODO: implement
    return [];
  }
}

// === SERVER SETUP ===
const server = http.createServer();
const wss = new WebSocket.Server({ server });
const chatServer = new ChatServer();

wss.on("connection", (ws, req) => {
  const parsed = url.parse(req.url ?? "", true);
  const userId = (parsed.query.user as string) || `user-${Date.now()}`;
  const room = (parsed.query.room as string) || "general";
  console.log(`[CONNECT] ${userId} → room: ${room}`);
  chatServer.handleConnection(ws, userId, room);
});

server.listen(8080, () => {
  console.log("Chat server: ws://localhost:8080?room=general&user=alice");
});
```

---

## Interview Prep — `how-to-approach-system-design-interview.md` Full Spec

The file must contain all of the following sections with full written content (not just headers):

**Section 1: The 5-Step Framework**

Step 1 — Clarify Requirements (5 min):
- Ask about functional requirements (core features, scope for interview)
- Ask about NFRs: scale (DAU, QPS, storage), latency requirements (p99 target), availability (99.9%? 99.99%?), read/write ratio, geographic distribution
- Ask about constraints: tech stack restrictions, compliance
- Tip: "What area should we go deepest on?" saves time

Step 2 — Estimate Scale (5 min):
- Calculate: total req/day, average QPS, peak QPS (2x avg), storage/day, total storage, bandwidth
- Time reference table: 1 day = ~86,400 seconds; 1M req/day = ~12 QPS; 1B req/day = ~11,574 QPS
- Tip: round aggressively, order-of-magnitude is the goal

Step 3 — High-Level Design (15 min):
- Start with: Client → Load Balancer → App Servers → Database
- Ask: where does caching fit? async processing? separate read/write paths? CDN? real-time?
- Walk through one critical user flow end-to-end while referencing diagram
- Tip: don't draw boxes without explaining what each does

Step 4 — Deep Dive (15 min):
- Pick 2–3 components: database schema, caching strategy, API design, scalability bottleneck, consistency trade-offs
- Drive the deep dive — don't wait to be asked
- Show trade-off awareness at every decision

Step 5 — Wrap Up (5 min):
- "Here are the main weaknesses in what I designed..."
- "At 10× scale, X would become the bottleneck and I'd address it by..."
- "The key trade-off I made was X over Y because..."

**Section 2: Communication Tips**
- Think out loud — silence is bad
- State assumptions explicitly
- Ask for feedback mid-design
- Don't over-engineer early — start simple, add complexity with reason
- Use concrete numbers

**Section 3: What Interviewers Evaluate** — table with dimensions: Problem solving, Communication, Technical depth, Trade-off reasoning, Scale awareness, Breadth

**Section 4: Common Mistakes** — at least 6 mistakes with brief explanation each

**Section 5: Recommended Study Path** — 6-step path from fundamentals to timed mock interviews

---

## Interview Prep — `estimation-cheatsheet.md` Full Spec

Must contain all of:

**Powers of Two table:** 2^10 through 2^40 with common names (K, M, B, T)

**Time table:** seconds in minute, hour, day, month, year

**QPS from DAU table** — worked examples:
- 1M DAU × 10 req/day = ~116 QPS avg, ~232 peak
- 10M DAU × 10 req/day = ~1,157 QPS avg, ~2,314 peak  
- 100M DAU × 10 req/day = ~11,574 QPS avg, ~23,148 peak

**Latency Numbers table:**
- L1 cache: 1 ns
- L2 cache: 4 ns
- L3 cache: 40 ns
- Main memory (RAM): 100 ns
- SSD random read (NVMe): 16 μs
- SSD sequential read: 200 μs
- HDD seek: 4–10 ms
- Same datacenter packet: 0.5 ms
- US West → US East: ~40 ms
- US → Europe: ~80 ms
- US → Australia: ~150 ms

**Storage sizes table:** KB through PB with byte values

**Common object sizes table:**
- UUID: 16 bytes
- Short URL code: 7 bytes
- Tweet (max): 280 bytes
- Average URL: 200 bytes
- Small JSON payload: 1 KB
- Average web page: 2 MB
- Profile photo (compressed): 200 KB
- High-res photo: 2–5 MB
- 1 min video (720p): ~50 MB
- 1 min audio (MP3): ~1 MB

**Availability and Nines table:** 99% through 99.999% with downtime per year and per month

**Throughput reference table:** network within DC, SSD, HDD, RAM, broadband

**Common QPS benchmarks table:** PostgreSQL, Redis, Nginx, Node.js, Kafka

**Storage calculation template** with worked example (photo sharing app: 50M DAU, 1 photo/day, 200KB/photo, 5 years → 18.25 PB)

---

## Interview Question Bank — Question Template

Every question in the question bank must follow this exact template structure:

```markdown
# Design [System Name]

**Difficulty:** [Easy/Medium/Hard]
**Time:** 35–45 minutes
**Relevant Modules:** [list module numbers]

---

## Problem Statement
[2–3 sentences describing the system and what needs to be designed]

---

## Clarifying Questions to Ask
[6–8 specific questions an interviewer would want you to ask]

---

## Requirements

### Functional
[4–6 bullet points of specific functional requirements]

### Non-Functional
[6–8 bullet points with specific numbers: availability %, latency targets, DAU, QPS estimates]

---

## Capacity Estimation
[Worked calculation of: writes/day, reads/day, avg QPS, peak QPS, storage/day, total storage]

---

## High-Level Architecture
> 📊 **Diagram:** `[system-name]-architecture.drawio` — [description of what diagram shows]

**Components:** [list each component with one sentence on what it does]

---

## API Design
[2–4 key API endpoints with request/response JSON examples]

---

## Database Schema
[SQL schema for the 2–4 most important tables]

---

## Deep Dive: [Most Interesting Component]
[300–500 words going deep on the hardest part of this system design]

---

## Caching Strategy
[What to cache, where, eviction policy, TTL, invalidation approach]

---

## Handling Scale
[How the system evolves at 10× scale — what breaks first, what you'd change]

---

## Trade-offs to Discuss
[Table: Decision | Choice | Trade-off — 4–6 rows]

---

## Follow-up Questions
[5–7 questions an interviewer would ask to probe deeper]
```

All 18 question bank files must use this template with real, substantive answers written out. The agent must write complete answers for all 18 questions — not placeholder text.

---

## Module SUMMARY.md Template

Every module's `SUMMARY.md` must follow this exact structure:

```markdown
# Module [XX] — [Module Name]: Summary

> [One paragraph on what this module covered and why it matters]

---

## Key Concepts

1. **[Concept]** — one sentence definition
2. **[Concept]** — one sentence definition
[... up to 8 concepts]

---

## Key Trade-offs

| Decision | Option A | Option B | Choose A When | Choose B When |
|---|---|---|---|---|
[3–5 rows of real trade-offs from this module]

---

## Common Interview Questions from This Module

- [Question 1]
- [Question 2]
- [Question 3]

---

## Patterns Introduced

| Pattern | What It Solves |
|---|---|
[All patterns introduced in this module]

---

## What This Unlocks

After this module, you can tackle:
- [Topic/module/question this enables]

---

## Quick Reference

[A minimal, scannable summary of the most important facts — fits one screen]

---

← [Previous Module](../module-[XX-1]-[name]/) | [Next Module →](../module-[XX+1]-[name]/)
```

---

## Module README Template

Every module's root `README.md`:

```markdown
# Module [XX] — [Module Name]

> [One sentence pitch for why this module matters]

---

## Prerequisites

| Module | Topics Needed |
|---|---|
| [Linked module] | [Specific concepts needed] |

> 💡 Complete prerequisite modules first — this one builds directly on them.

---

## What You'll Learn

By the end of this module you will be able to:
- [Specific, measurable objective 1]
- [Specific, measurable objective 2]
- [Specific, measurable objective 3]
- [Specific, measurable objective 4]

---

## Estimated Time

**[X–Y hours** total: Concepts: ~Zh | Deep dive: ~Zh | Exercises: ~Zh

---

## Module Contents

| Section | Description |
|---|---|
| [01 — Concepts](./01-concepts/) | Core theory and foundational knowledge |
| [02 — Deep Dive](./02-deep-dive/) | Advanced nuances, internals, trade-offs |
| [03 — Interview Prep](./03-interview-prep/) | Framework, Q&A, sample answers |
| [04 — Exercises](./04-exercises/) | Coding challenges and design challenges |
| [05 — Further Reading](./05-further-reading/) | Curated external resources |
| [Summary](./SUMMARY.md) | Key takeaways and quick reference |

---

→ [Begin with the concepts](./01-concepts/README.md)

← [Previous Module](../module-[prev]/) | [Next Module →](../module-[next]/)
```

---

## `cheatsheets/system-design-vocabulary.md` — Structural Spec

Format for every entry:
```
**[Term]** — [definition in 1–2 sentences]. See [Module XX — Name](../modules/module-XX-name/).
```

Must include minimum 60 terms alphabetically covering:
ACID, Anycast, API Gateway, Availability, Back-pressure, BASE, Bloom Filter, Bulkhead Pattern, CAP Theorem, CDC (Change Data Capture), Circuit Breaker, Consistent Hashing, CRDT, Dead Letter Queue, Distributed Lock, DNS, Durability, Edge Computing, Eventual Consistency, Fan-out, Feature Flag, Geohashing, Gossip Protocol, HLS/DASH, Hot Key, Idempotency, Inverted Index, Kafka, Lamport Timestamp, Latency, Leader Election, Linearizability, Load Balancer, LSM Tree, LRU Cache, Message Queue, Microservices, Monolith, Multi-tenancy, NFR (Non-Functional Requirement), Outbox Pattern, PACELC, Partition, Quorum, RBAC, Read Replica, Replication, Saga Pattern, Sharding, SLA/SLO/SLI, SSE (Server-Sent Events), Sticky Session, Stream Processing, Throughput, Token Bucket, Two-Phase Commit (2PC), Vector Clock, WebSocket, Write-Ahead Log (WAL), Zero-downtime Deployment

---

## `cheatsheets/database-comparison.md` — Full Spec

Must contain:

**Main comparison table** with columns: Database | Type | Consistency | Scale Model | Query Power | Best For

Covering: PostgreSQL, MySQL, MongoDB, Cassandra, Redis, DynamoDB, Elasticsearch, Neo4j, ClickHouse, InfluxDB

**SQL vs NoSQL Decision Flowchart** as ASCII/text tree:
```
Is your data highly relational (many JOINs)?
  YES → SQL (PostgreSQL / MySQL)
  NO ↓
Do you need flexible schema?
  YES → Document store (MongoDB)
  NO ↓
Write-heavy with massive scale (100K+ writes/sec)?
  YES → Wide-column (Cassandra) or Key-value (DynamoDB)
  NO ↓
Full-text search?
  YES → Elasticsearch / OpenSearch
  NO ↓
Graph data?
  YES → Neo4j
  NO ↓
Caching / ephemeral sessions?
  YES → Redis
  NO ↓
Default → PostgreSQL
```

**Replication summary table**: Database | Default Replication | Notes

**"When NOT to Use Each" table**: Database | Avoid When

---

## `cheatsheets/scaling-patterns.md` — Full Spec

Must contain four grouped tables:

**Data Tier Patterns:** Read Replicas, Sharding, Vertical Partitioning, CQRS, Cache-aside, Write-through Cache, Connection Pooling

**Application Tier Patterns:** Horizontal Scaling, Load Balancing, Stateless Services, Circuit Breaker, Bulkhead, Retry with Exponential Backoff, Idempotency Keys

**Async / Decoupling Patterns:** Message Queue, Event Streaming (Kafka), Saga Pattern, Outbox Pattern, Fan-out

**Infrastructure Patterns:** CDN, Multi-region Deployment, Cell-based Architecture, Consistent Hashing, Service Mesh, Blue-Green Deployment, Canary Release, Strangler Fig

Each pattern row: Pattern | What It Solves | Module link

---

## `cheatsheets/cap-theorem-quick-reference.md` — Full Spec

Must contain:
- CAP triangle diagram (ASCII art)
- Definitions of Consistency, Availability, Partition Tolerance
- Why you can only guarantee two (and why partition tolerance is mandatory in distributed systems)
- CP systems table: examples (HBase, ZooKeeper, etcd, MongoDB in strong mode), what they sacrifice
- AP systems table: examples (Cassandra, DynamoDB default, CouchDB), what they sacrifice
- "CA" systems: note that true CA is only possible on a single node (no network partition possible)
- PACELC extension: explains latency vs consistency trade-off when NO partition exists
- PACELC examples table: Cassandra (EL), PostgreSQL (EC), DynamoDB (varies)
- Real-world guidance: "Choose CP when..." / "Choose AP when..."

---

## Complete File Manifest

The coding agent must create every file listed below. Each file requires real, substantive, complete content:

```
system-design-mastery/
├── README.md                                          ← full content spec above
├── LICENSE                                            ← MIT license full text
├── CONTRIBUTING.md                                    ← full content spec above
├── CODE_OF_CONDUCT.md                                 ← Contributor Covenant v2.1 full text
├── SUMMARY.md                                         ← generate last: flat TOC of every file
│
├── .github/
│   ├── PULL_REQUEST_TEMPLATE.md                       ← full content spec above
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md                              ← full content spec above
│   │   ├── content_improvement.md                     ← full content spec above
│   │   └── new_topic_request.md                       ← full content spec above
│   └── workflows/
│       └── validate-links.yml                         ← full content spec above
│
├── scripts/
│   ├── validate-links.sh                              ← full content spec above
│   └── check-structure.sh                             ← full content spec above
│
├── cheatsheets/
│   ├── numbers-every-engineer-should-know.md          ← estimation cheatsheet full spec
│   ├── cap-theorem-quick-reference.md                 ← cap theorem full spec
│   ├── database-comparison.md                         ← full content spec above
│   ├── scaling-patterns.md                            ← full content spec above
│   └── system-design-vocabulary.md                    ← 60+ terms, structural spec above
│
├── interview-prep/
│   ├── README.md                                      ← study paths for 4 audiences, links to all sections
│   ├── how-to-approach-system-design-interview.md     ← full content spec above
│   ├── estimation-cheatsheet.md                       ← full content spec above
│   ├── common-mistakes.md                             ← top 10 mistakes with explanation each
│   ├── mock-interviews/
│   │   ├── template.md                                ← blank 45-min mock interview scorecard
│   │   └── example-walkthrough.md                     ← full mock interview transcript for URL shortener
│   └── question-bank/
│       ├── easy/
│       │   ├── url-shortener.md                       ← full spec in module spec section above
│       │   ├── pastebin.md                            ← full question using template
│       │   ├── rate-limiter.md                        ← full question using template
│       │   ├── key-value-store.md                     ← full question using template
│       │   └── parking-lot.md                         ← full question using template
│       ├── medium/
│       │   ├── twitter.md                             ← full question using template
│       │   ├── instagram.md                           ← full question using template
│       │   ├── whatsapp.md                            ← full question using template
│       │   ├── notification-system.md                 ← full question using template
│       │   ├── uber.md                                ← full question using template
│       │   ├── youtube.md                             ← full question using template
│       │   ├── web-crawler.md                         ← full question using template
│       │   ├── search-autocomplete.md                 ← full question using template
│       │   └── news-feed.md                           ← full question using template
│       └── hard/
│           ├── google-docs.md                         ← full question using template
│           ├── distributed-message-queue.md           ← full question using template
│           ├── distributed-cache.md                   ← full question using template
│           ├── distributed-file-system.md             ← full question using template
│           ├── stock-trading-system.md                ← full question using template
│           ├── airbnb.md                              ← full question using template
│           ├── netflix.md                             ← full question using template
│           └── payment-system.md                      ← full question using template
│
├── company-architectures/
│   ├── README.md                                      ← index table, how-to-read guide, placeholder for entries
│   └── _template/
│       └── README.md                                  ← 8-section company case study template
│
├── exercises/
│   ├── README.md                                      ← overview, difficulty guide, how exercises work
│   └── solutions/
│       └── README.md                                  ← note encouraging students to try first
│
├── assets/
│   ├── diagrams/source/.gitkeep
│   ├── diagrams/exports/.gitkeep
│   └── images/.gitkeep
│
└── modules/
    ├── module-01-foundations/
    │   ├── README.md                                  ← module README template
    │   ├── SUMMARY.md                                 ← summary template
    │   ├── 01-concepts/
    │   │   ├── README.md                              ← full concepts: what is SD, anatomy, properties, trade-offs
    │   │   ├── diagrams/source/.gitkeep
    │   │   ├── diagrams/exports/.gitkeep
    │   │   └── examples/
    │   │       └── availability-calculator.ts         ← TypeScript: calculates uptime % from nines
    │   ├── 02-deep-dive/
    │   │   ├── README.md                              ← NFRs, SLAs/SLOs/SLIs, back-of-envelope estimation
    │   │   └── examples/
    │   │       └── nfr-analysis.ts                    ← TypeScript: compares NFRs for different system types
    │   ├── 03-interview-prep/
    │   │   ├── README.md                              ← 4-step interview framework intro
    │   │   ├── common-questions.md                    ← 10 Q&As: "what is SD?", "NFR vs FR?", etc.
    │   │   └── sample-answer.md                       ← full sample answer: "Design a note-taking app"
    │   ├── 04-exercises/
    │   │   ├── README.md
    │   │   ├── coding-challenges/challenge-01/
    │   │   │   ├── README.md
    │   │   │   ├── starter.ts                         ← capacity estimator (spec above)
    │   │   │   └── solution.ts                        ← working solution
    │   │   └── design-challenges/
    │   │       ├── challenge-01.md                    ← Design a note-taking app
    │   │       ├── challenge-01-solution.md
    │   │       ├── challenge-02.md                    ← Write NFR document from given scenario
    │   │       └── challenge-02-solution.md
    │   └── 05-further-reading/
    │       └── README.md
    │
    ├── module-02-networking/
    │   ├── README.md
    │   ├── SUMMARY.md
    │   ├── 01-concepts/
    │   │   ├── README.md                              ← OSI model, IP, DNS, TCP vs UDP, HTTP versions, WebSockets
    │   │   ├── diagrams/source/.gitkeep
    │   │   ├── diagrams/exports/.gitkeep
    │   │   └── examples/
    │   │       └── http-versions-comparison.ts        ← simulate HTTP/1.1 vs H2 request waterfall
    │   ├── 02-deep-dive/
    │   │   ├── README.md                              ← latency numbers, TCP overhead, connection pooling, NAT, Anycast
    │   │   └── examples/
    │   │       └── latency-reference.ts               ← print latency table, calculate RTT estimates
    │   ├── 03-interview-prep/
    │   │   ├── README.md
    │   │   ├── common-questions.md
    │   │   └── sample-answer.md
    │   ├── 04-exercises/
    │   │   ├── README.md
    │   │   ├── coding-challenges/
    │   │   │   ├── challenge-01/                      ← TCP server + client (spec above)
    │   │   │   │   ├── README.md
    │   │   │   │   ├── starter.ts
    │   │   │   │   └── solution.ts
    │   │   │   └── challenge-02/                      ← HTTP long-polling endpoint
    │   │   │       ├── README.md
    │   │   │       ├── starter.ts
    │   │   │       └── solution.ts
    │   │   └── design-challenges/
    │   │       ├── challenge-01.md                    ← Design network topology for global web app
    │   │       └── challenge-01-solution.md
    │   └── 05-further-reading/
    │       └── README.md
    │
    ├── module-03-apis/
    │   ├── README.md
    │   ├── SUMMARY.md
    │   ├── 01-concepts/
    │   │   ├── README.md                              ← REST principles, GraphQL, gRPC, Webhooks, OpenAPI
    │   │   ├── diagrams/source/.gitkeep
    │   │   ├── diagrams/exports/.gitkeep
    │   │   └── examples/
    │   │       └── rest-api-demo.ts                   ← minimal Express REST API with proper status codes
    │   ├── 02-deep-dive/
    │   │   ├── README.md                              ← versioning, API gateway, rate limiting algorithms, OAuth 2.0, idempotency
    │   │   └── examples/
    │   │       └── cursor-pagination.ts               ← demonstrate cursor vs offset pagination
    │   ├── 03-interview-prep/
    │   │   ├── README.md
    │   │   ├── common-questions.md
    │   │   └── sample-answer.md                       ← "Design the API for Twitter"
    │   ├── 04-exercises/
    │   │   ├── README.md
    │   │   ├── coding-challenges/
    │   │   │   ├── challenge-01/                      ← Full REST blog API with pagination
    │   │   │   │   ├── README.md
    │   │   │   │   ├── starter.ts
    │   │   │   │   └── solution.ts
    │   │   │   ├── challenge-02/                      ← JWT auth middleware
    │   │   │   │   ├── README.md
    │   │   │   │   ├── starter.ts
    │   │   │   │   └── solution.ts
    │   │   │   └── challenge-03/                      ← Token bucket rate limiter (spec above)
    │   │   │       ├── README.md
    │   │   │       ├── starter.ts
    │   │   │       └── solution.ts
    │   │   └── design-challenges/
    │   │       ├── challenge-01.md                    ← Design API for ride-sharing app
    │   │       └── challenge-01-solution.md
    │   └── 05-further-reading/
    │       └── README.md
    │
    ├── module-04-databases/
    │   ├── README.md
    │   ├── SUMMARY.md
    │   ├── 01-concepts/
    │   │   ├── README.md                              ← relational, ACID, NoSQL types, SQL vs NoSQL, CAP intro
    │   │   ├── diagrams/source/.gitkeep
    │   │   ├── diagrams/exports/.gitkeep
    │   │   └── examples/
    │   │       └── acid-demo.ts                       ← demonstrate atomicity with SQLite transactions
    │   ├── 02-deep-dive/
    │   │   ├── README.md                              ← indexing, query optimization, normalization, replication, sharding, isolation levels, migrations
    │   │   └── examples/
    │   │       └── index-performance.ts               ← measure query time with vs without index (better-sqlite3)
    │   ├── 03-interview-prep/
    │   │   ├── README.md
    │   │   ├── common-questions.md
    │   │   └── sample-answer.md                       ← "Design database schema for Twitter"
    │   ├── 04-exercises/
    │   │   ├── README.md
    │   │   ├── coding-challenges/
    │   │   │   ├── challenge-01/                      ← index performance demo (better-sqlite3)
    │   │   │   │   ├── README.md
    │   │   │   │   ├── starter.ts
    │   │   │   │   └── solution.ts
    │   │   │   ├── challenge-02/                      ← simple connection pool implementation
    │   │   │   │   ├── README.md
    │   │   │   │   ├── starter.ts
    │   │   │   │   └── solution.ts
    │   │   │   └── challenge-03/                      ← consistent hashing (spec above)
    │   │   │       ├── README.md
    │   │   │       ├── starter.ts
    │   │   │       └── solution.ts
    │   │   └── design-challenges/
    │   │       ├── challenge-01.md                    ← Twitter schema design
    │   │       ├── challenge-01-solution.md
    │   │       ├── challenge-02.md                    ← Sharding strategy for 1B users
    │   │       └── challenge-02-solution.md
    │   └── 05-further-reading/
    │       └── README.md
    │
    ├── module-05-caching/
    │   ├── README.md
    │   ├── SUMMARY.md
    │   ├── 01-concepts/
    │   │   ├── README.md                              ← where to cache, patterns (cache-aside, write-through, write-behind, read-through), eviction policies, Redis vs Memcached, Redis data structures
    │   │   ├── diagrams/source/.gitkeep
    │   │   ├── diagrams/exports/.gitkeep
    │   │   └── examples/
    │   │       └── cache-patterns.ts                  ← implement cache-aside, write-through with mock DB
    │   ├── 02-deep-dive/
    │   │   ├── README.md                              ← cache invalidation, stampede, hot key, penetration, warming, distributed caches, hit rate
    │   │   └── examples/
    │   │       └── bloom-filter.ts                    ← bloom filter implementation for cache penetration prevention
    │   ├── 03-interview-prep/
    │   │   ├── README.md
    │   │   ├── common-questions.md
    │   │   └── sample-answer.md                       ← "Add caching to Twitter feed"
    │   ├── 04-exercises/
    │   │   ├── README.md
    │   │   ├── coding-challenges/
    │   │   │   ├── challenge-01/                      ← LRU cache (spec above)
    │   │   │   │   ├── README.md
    │   │   │   │   ├── starter.ts
    │   │   │   │   └── solution.ts
    │   │   │   ├── challenge-02/                      ← cache-aside with Redis (ioredis)
    │   │   │   │   ├── README.md
    │   │   │   │   ├── starter.ts
    │   │   │   │   └── solution.ts
    │   │   │   └── challenge-03/                      ← bloom filter
    │   │   │       ├── README.md
    │   │   │       ├── starter.ts
    │   │   │       └── solution.ts
    │   │   └── design-challenges/
    │   │       ├── challenge-01.md                    ← Caching strategy for Twitter feed
    │   │       └── challenge-01-solution.md
    │   └── 05-further-reading/
    │       └── README.md
    │
    [modules 06–20 follow identical structure pattern with topics from module-by-module spec]
```

**For modules 06–20**, create the identical directory structure as module-01 through module-05, with content derived from the Module-by-Module Specification section of this document. Every module must have:
- README.md (module template)
- SUMMARY.md (summary template)
- 01-concepts/README.md (full theory content from topic list)
- 01-concepts/examples/*.ts (working TypeScript examples)
- 02-deep-dive/README.md (full deep dive content)
- 02-deep-dive/examples/*.ts (advanced TypeScript examples)
- 03-interview-prep/README.md, common-questions.md, sample-answer.md
- 04-exercises/README.md + all coding-challenges (with starter.ts + solution.ts) + all design-challenges (with .md + -solution.md)
- 05-further-reading/README.md

---

## Final Instruction to Coding Agent

You now have a complete specification. Follow these rules without exception:

1. **Create all directories first** — use `mkdir -p` for the entire tree before writing any files

2. **No placeholder content** — every file must contain complete, substantive, accurate content. "TODO: fill this in" is not acceptable in any file that isn't a starter.ts exercise file

3. **TypeScript files must run** — test each `.ts` file with `npx ts-node filename.ts` before considering it complete. Fix any compilation or runtime errors

4. **solution.ts files** — always begin with `// SOLUTION FILE — try starter.ts first!` and contain a complete, correct, well-commented implementation that passes all usage examples

5. **Relative links must be correct** — all `[text](../path)` links in markdown must resolve to real files in the repository

6. **Diagram placeholders** — wherever a diagram is referenced, use this exact format:
   ```
   > 📊 **Diagram:** `filename.drawio` — [one sentence describing what the diagram shows, e.g. "Shows a consistent hash ring with 3 nodes and 150 virtual nodes each, illustrating how keys are assigned clockwise to the nearest node"]
   ```

7. **Callout formatting** — use consistently throughout all concept files:
   - `> 💡 **Note:**` for important supplementary information
   - `> ⚠️ **Warning:**` for common mistakes and gotchas
   - `> 🎯 **Interview Tip:**` for interview-specific advice
   - `> 📊 **Diagram:**` for diagram placeholders

8. **Generate SUMMARY.md last** — the root SUMMARY.md is a flat markdown table of contents linking to every file in the repository, ordered by: root files → cheatsheets → interview-prep → company-architectures → exercises → modules (in order)

9. **Consistency** — module numbers in filenames must match content (module-04 content is about databases, not caching)

10. **Content depth target** — each `01-concepts/README.md` should be approximately 800–1500 words; each `02-deep-dive/README.md` approximately 800–1200 words; each question bank file approximately 600–1000 words

