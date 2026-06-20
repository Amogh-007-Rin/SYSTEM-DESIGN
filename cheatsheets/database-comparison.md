# Database Comparison Cheatsheet

> Full treatment in [Module 04 — Databases](../modules/module-04-databases/). This page is a fast lookup for choosing between databases, not a tutorial on how each one works internally.

---

## Main Comparison Table

| Database | Type | Consistency | Scale Model | Query Power | Best For |
|---|---|---|---|---|---|
| PostgreSQL | Relational (SQL) | Strong (ACID) | Vertical + read replicas; sharding is manual | High — full SQL, joins, window functions | Transactional systems with relational data, complex queries |
| MySQL | Relational (SQL) | Strong (ACID) | Vertical + read replicas; sharding via Vitess/ProxySQL | High — full SQL | Web apps, well-understood operational tooling |
| MongoDB | Document | Tunable (strong by default per-replica-set) | Horizontal via sharding | Medium — rich query language, weaker joins | Flexible/evolving schemas, document-shaped data |
| Cassandra | Wide-column | Tunable (AP-leaning) | Horizontal, masterless, linear scale-out | Low — query by partition key, no joins | Massive write throughput, time-series, multi-DC |
| Redis | Key-value (in-memory) | Strong on single node; eventual with replicas | Horizontal via Redis Cluster | Low — key lookups, rich data structures | Caching, session storage, leaderboards, rate limiting |
| DynamoDB | Key-value / document | Tunable (eventual default, strong optional) | Fully managed horizontal | Low–Medium — primary key + secondary indexes | Serverless apps, predictable low-latency at scale |
| Elasticsearch | Search / document | Eventual (near-real-time) | Horizontal via shards | High for search — full-text, aggregations | Full-text search, log analytics, faceted search |
| Neo4j | Graph | Strong (single-node ACID) | Vertical mainly; clustering for HA | High for graph traversal, low for tabular | Relationship-heavy data: social graphs, recommendations, fraud rings |
| ClickHouse | Columnar OLAP | Eventual (replication async) | Horizontal via sharding | High — analytical SQL, very fast aggregation | Real-time analytics dashboards, large-scale aggregation |
| InfluxDB | Time-series | Eventual (clustered) | Horizontal in enterprise edition | Medium — time-series specific query language | Metrics, IoT sensor data, monitoring data |

---

## SQL vs NoSQL Decision Flowchart

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

> 🎯 **Interview Tip:** Don't just name a database — name the *property* you need (strong consistency, flexible schema, write throughput, full-text search) and let that property lead you to the database. Interviewers are scoring your reasoning, not your trivia recall.

---

## Replication Summary

| Database | Default Replication | Notes |
|---|---|---|
| PostgreSQL | Single-primary, async streaming replicas (sync optional) | Manual failover unless using Patroni/similar |
| MySQL | Single-primary, async binlog replication | Group Replication available for multi-primary |
| MongoDB | Replica sets (1 primary, N secondaries), automatic failover | Majority write concern for durability |
| Cassandra | Multi-master, configurable replication factor (commonly 3) | No single point of failure by design |
| Redis | Primary-replica, async; Redis Sentinel/Cluster for HA | Replication lag can cause stale reads |
| DynamoDB | Multi-AZ synchronous within a region, async cross-region (Global Tables) | Fully managed, no operator action needed |
| Elasticsearch | Primary + replica shards, configurable replica count | Replicas also serve read traffic |
| Neo4j | Causal clustering (core + read replicas) | Strong consistency on core servers |

---

## When NOT to Use Each

| Database | Avoid When |
|---|---|
| PostgreSQL | You need linear horizontal write scaling beyond what one primary + replicas can handle without significant sharding investment |
| MySQL | You need advanced JSON/document querying or very flexible schemas |
| MongoDB | You need complex multi-document transactions across many collections at high throughput |
| Cassandra | Your query patterns require ad-hoc joins or secondary-index-heavy access |
| Redis | You need data sets far larger than available memory at reasonable cost, or strict durability guarantees |
| DynamoDB | Your access patterns are unpredictable and don't map cleanly to a partition key design |
| Elasticsearch | You need it as your system of record — it's a search index, not an ACID-compliant primary store |
| Neo4j | Your workload is mostly tabular aggregation rather than relationship traversal |
| ClickHouse | You need frequent row-level updates/deletes — it's optimized for append-heavy analytical workloads |
| InfluxDB | Your data isn't naturally time-ordered, or you need relational joins |

See also: [cap-theorem-quick-reference.md](./cap-theorem-quick-reference.md), [Module 04 — Databases](../modules/module-04-databases/), [Module 13 — Consistency, Consensus & CAP Theorem](../modules/module-13-consistency-consensus/).
