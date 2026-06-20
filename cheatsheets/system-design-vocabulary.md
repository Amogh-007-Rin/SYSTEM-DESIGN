# System Design Vocabulary

> An alphabetical glossary of every major term used across this repository. Each entry links to the module where it's covered in depth.

---

**ACID** — Atomicity, Consistency, Isolation, Durability: the four guarantees relational database transactions provide. See [Module 04 — Databases](../modules/module-04-databases/).

**Anycast** — A routing technique where the same IP address is announced from many locations; the network routes a client to the topologically nearest one. See [Module 02 — Networking](../modules/module-02-networking/).

**API Gateway** — A single entry point that handles routing, auth, rate limiting, and transformation for a set of backend services. See [Module 03 — API Design](../modules/module-03-apis/).

**Availability** — The proportion of time a system is able to respond to requests, usually expressed in "nines" (99.9%, 99.99%). See [Module 01 — Foundations](../modules/module-01-foundations/).

**Back-pressure** — A mechanism for a slow consumer to signal a fast producer to slow down, preventing unbounded queue growth. See [Module 08 — Message Queues](../modules/module-08-message-queues/).

**BASE** — Basically Available, Soft state, Eventually consistent: the consistency model many distributed NoSQL systems favor over ACID. See [Module 13 — Consistency, Consensus & CAP Theorem](../modules/module-13-consistency-consensus/).

**Bloom Filter** — A probabilistic data structure that tests set membership with no false negatives but possible false positives, using far less memory than a hash set. See [Module 05 — Caching](../modules/module-05-caching/).

**Bulkhead Pattern** — Isolating resource pools (threads, connections) per dependency so one failing dependency can't exhaust resources needed by others. See [Module 11 — Microservices](../modules/module-11-microservices/).

**CAP Theorem** — During a network partition, a distributed system must choose between Consistency and Availability; Partition tolerance is not optional. See [Module 13 — Consistency, Consensus & CAP Theorem](../modules/module-13-consistency-consensus/).

**CDC (Change Data Capture)** — Streaming a database's change log (inserts/updates/deletes) to downstream consumers in near-real-time. See [Module 17 — Data Pipelines](../modules/module-17-data-pipelines/).

**Circuit Breaker** — A pattern that stops calling a failing dependency for a cooldown period, failing fast instead of piling up timeouts. See [Module 11 — Microservices](../modules/module-11-microservices/).

**Consistent Hashing** — A hashing scheme that minimizes key remapping when nodes are added or removed from a cluster. See [Module 04 — Databases](../modules/module-04-databases/).

**CRDT (Conflict-free Replicated Data Type)** — A data structure that can be updated independently on multiple replicas and merged deterministically without coordination. See [Module 13 — Consistency, Consensus & CAP Theorem](../modules/module-13-consistency-consensus/).

**Dead Letter Queue (DLQ)** — A holding queue for messages that failed processing after exceeding a retry limit, so they don't block the main queue. See [Module 08 — Message Queues](../modules/module-08-message-queues/).

**Distributed Lock** — A mechanism to ensure mutual exclusion across multiple processes/machines, typically backed by a coordination service like Redis or ZooKeeper. See [Module 12 — Distributed Systems](../modules/module-12-distributed-systems/).

**DNS (Domain Name System)** — The hierarchical, distributed naming system that resolves human-readable domain names to IP addresses. See [Module 02 — Networking](../modules/module-02-networking/).

**Durability** — The guarantee that once a write is acknowledged, it survives crashes, power loss, and restarts. See [Module 01 — Foundations](../modules/module-01-foundations/).

**Edge Computing** — Running code physically close to users (at CDN PoPs) instead of in a centralized origin datacenter. See [Module 10 — CDN](../modules/module-10-cdn/).

**Eventual Consistency** — A consistency model where replicas converge to the same value over time, but may return stale data immediately after a write. See [Module 13 — Consistency, Consensus & CAP Theorem](../modules/module-13-consistency-consensus/).

**Fan-out** — Delivering a single event or message to many downstream consumers or subscribers. See [Module 16 — Real-Time Systems](../modules/module-16-real-time-systems/).

**Feature Flag** — A runtime toggle that controls whether a code path is active, enabling safe rollout and rollback without redeployment. See [Module 20 — Advanced Patterns](../modules/module-20-advanced-patterns/).

**Geohashing** — Encoding latitude/longitude into a short string such that nearby locations share string prefixes, enabling efficient proximity queries. See [Module 18 — Search Systems](../modules/module-18-search-systems/).

**Gossip Protocol** — A peer-to-peer communication style where nodes periodically exchange state with random peers until information propagates cluster-wide. See [Module 12 — Distributed Systems](../modules/module-12-distributed-systems/).

**HLS/DASH** — Adaptive bitrate streaming protocols that split video into chunks at multiple quality levels, letting clients switch quality based on bandwidth. See [Module 10 — CDN](../modules/module-10-cdn/).

**Hot Key** — A single cache or database key receiving disproportionate traffic, capable of overwhelming the single node/shard that owns it. See [Module 05 — Caching](../modules/module-05-caching/).

**Idempotency** — The property that performing an operation multiple times has the same effect as performing it once — critical for safe retries. See [Module 03 — API Design](../modules/module-03-apis/).

**Inverted Index** — A mapping from terms to the documents containing them, the core data structure behind full-text search engines. See [Module 18 — Search Systems](../modules/module-18-search-systems/).

**Kafka** — A distributed log-based event streaming platform organized into topics, partitions, and consumer groups, offering durable replayable storage of events. See [Module 08 — Message Queues](../modules/module-08-message-queues/).

**Lamport Timestamp** — A logical clock that assigns monotonically increasing counters to events to establish a "happened-before" partial ordering without synchronized physical clocks. See [Module 12 — Distributed Systems](../modules/module-12-distributed-systems/).

**Latency** — The time between issuing a request and receiving the first byte (or full response) back. See [Module 02 — Networking](../modules/module-02-networking/).

**Leader Election** — The process by which a group of distributed nodes agree on a single coordinator, used for tasks requiring a single writer. See [Module 12 — Distributed Systems](../modules/module-12-distributed-systems/).

**Linearizability** — The strongest consistency model: every operation appears to take effect instantaneously at a single point in time, consistent with real-time ordering. See [Module 13 — Consistency, Consensus & CAP Theorem](../modules/module-13-consistency-consensus/).

**Load Balancer** — A component that distributes incoming requests across multiple backend instances to spread load and provide failover. See [Module 07 — Load Balancing](../modules/module-07-load-balancing/).

**LSM Tree (Log-Structured Merge Tree)** — A write-optimized storage engine structure that buffers writes in memory and periodically flushes/merges sorted files to disk. See [Module 09 — Storage Systems](../modules/module-09-storage/).

**LRU Cache (Least Recently Used)** — A cache eviction policy that discards the item that hasn't been accessed for the longest time when the cache is full. See [Module 05 — Caching](../modules/module-05-caching/).

**Message Queue** — A component that holds messages between a producer and consumer, decoupling them in time and load. See [Module 08 — Message Queues](../modules/module-08-message-queues/).

**Microservices** — An architectural style where a system is decomposed into small, independently deployable services, each owning its own data. See [Module 11 — Microservices](../modules/module-11-microservices/).

**Monolith** — An architectural style where all functionality is built and deployed as a single unit. See [Module 11 — Microservices](../modules/module-11-microservices/).

**Multi-tenancy** — A single deployment of a system serving multiple distinct customers (tenants), typically with logical or physical data isolation between them. See [Module 15 — Security](../modules/module-15-security/).

**NFR (Non-Functional Requirement)** — A requirement describing *how well* a system performs a function (latency, availability, scalability) rather than *what* it does. See [Module 01 — Foundations](../modules/module-01-foundations/).

**Outbox Pattern** — Writing an event to an "outbox" table in the same transaction as the business data change, then relaying it to a message broker, guaranteeing at-least-once delivery without dual-write inconsistency. See [Module 08 — Message Queues](../modules/module-08-message-queues/).

**PACELC** — An extension of CAP that also addresses the Latency vs. Consistency trade-off when there is no partition (Else). See [Module 13 — Consistency, Consensus & CAP Theorem](../modules/module-13-consistency-consensus/).

**Partition (network)** — A failure where some nodes in a distributed system cannot communicate with others, though each side may still be reachable internally. See [Module 12 — Distributed Systems](../modules/module-12-distributed-systems/).

**Quorum** — Requiring a minimum number of nodes (commonly a majority) to agree before a read or write is considered successful, ensuring overlap between reads and writes. See [Module 12 — Distributed Systems](../modules/module-12-distributed-systems/).

**RBAC (Role-Based Access Control)** — An authorization model that grants permissions to roles, then assigns roles to users, rather than granting permissions directly to individuals. See [Module 15 — Security](../modules/module-15-security/).

**Read Replica** — A copy of a primary database that serves read traffic, reducing load on the primary and enabling horizontal read scaling. See [Module 04 — Databases](../modules/module-04-databases/).

**Replication** — Maintaining copies of the same data on multiple nodes for redundancy, availability, and read scaling. See [Module 12 — Distributed Systems](../modules/module-12-distributed-systems/).

**Saga Pattern** — A way of managing a multi-step distributed transaction as a sequence of local transactions with compensating actions for rollback, avoiding two-phase commit. See [Module 11 — Microservices](../modules/module-11-microservices/).

**Sharding** — Splitting a dataset across multiple database nodes (shards) by some key, so no single node holds all the data. See [Module 04 — Databases](../modules/module-04-databases/).

**SLA/SLO/SLI** — Service Level Agreement (a promise to customers), Service Level Objective (an internal target), Service Level Indicator (the metric measured to know if you're meeting the objective). See [Module 01 — Foundations](../modules/module-01-foundations/).

**SSE (Server-Sent Events)** — A one-way, HTTP-based protocol for a server to push a stream of text events to a client over a single long-lived connection. See [Module 02 — Networking](../modules/module-02-networking/) and [Module 16 — Real-Time Systems](../modules/module-16-real-time-systems/).

**Sticky Session** — Routing all requests from a given client to the same backend instance, usually to preserve in-memory session state. See [Module 07 — Load Balancing](../modules/module-07-load-balancing/).

**Stream Processing** — Processing data continuously as it arrives, rather than in periodic batches. See [Module 17 — Data Pipelines](../modules/module-17-data-pipelines/).

**Throughput** — The amount of work (requests, bytes, transactions) a system can process per unit time. See [Module 02 — Networking](../modules/module-02-networking/).

**Token Bucket** — A rate-limiting algorithm where tokens refill at a fixed rate into a bucket of fixed capacity, and each request consumes a token. See [Module 03 — API Design](../modules/module-03-apis/).

**Two-Phase Commit (2PC)** — A blocking distributed transaction protocol where a coordinator asks all participants to prepare, then commits only if all agree. See [Module 12 — Distributed Systems](../modules/module-12-distributed-systems/).

**Vector Clock** — A logical clock structure that tracks a per-node counter for every node a replica has observed, enabling detection of concurrent (conflicting) updates. See [Module 12 — Distributed Systems](../modules/module-12-distributed-systems/).

**WebSocket** — A protocol providing a persistent, full-duplex connection between client and server over a single TCP connection. See [Module 02 — Networking](../modules/module-02-networking/) and [Module 16 — Real-Time Systems](../modules/module-16-real-time-systems/).

**Write-Ahead Log (WAL)** — A durability technique where changes are written to an append-only log before being applied to the main data structure, enabling crash recovery. See [Module 04 — Databases](../modules/module-04-databases/) and [Module 09 — Storage Systems](../modules/module-09-storage/).

**Zero-downtime Deployment** — Deploying new code without interrupting service, typically via rolling, blue-green, or canary strategies. See [Module 20 — Advanced Patterns](../modules/module-20-advanced-patterns/).
