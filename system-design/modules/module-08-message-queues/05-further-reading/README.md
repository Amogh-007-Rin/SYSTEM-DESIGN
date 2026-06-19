# Module 08 — Further Reading

- **Apache Kafka official documentation — "Introduction" and "Design"** (kafka.apache.org/documentation) — the authoritative reference for topics, partitions, replication, the ISR model, and log compaction.
- **RabbitMQ official documentation — "Tutorials" and "AMQP 0-9-1 Model Explained"** (rabbitmq.com/tutorials, rabbitmq.com/tutorials/amqp-concepts) — covers exchanges, routing, queues, and dead lettering with runnable examples.
- **AWS documentation — "Amazon SQS" and "Amazon SNS" developer guides** (docs.aws.amazon.com/sqs, docs.aws.amazon.com/sns) — covers visibility timeout, DLQ redrive policies, and the SNS fan-out-to-SQS pattern in detail.
- **Chris Richardson, microservices.io — "Pattern: Transactional outbox"** (microservices.io/patterns/data/transactional-outbox.html) — the canonical reference for the outbox pattern, including variants using change data capture.
- **Martin Kleppmann — "Turning the database inside-out with Apache Samza"** — an influential talk/post connecting event streaming, log compaction, and event sourcing into one coherent mental model.
- **Martin Fowler — "Event Sourcing"** (martinfowler.com/eaaDev/EventSourcing.html) — the original, widely-cited explanation of storing state as a sequence of events.
- **Confluent Engineering Blog — posts on consumer lag, exactly-once semantics, and rebalancing protocols** (confluent.io/blog) — practical, production-grade discussion from the company founded by Kafka's original authors.
- **Chris Richardson, microservices.io — "Pattern: Saga"** (microservices.io/patterns/data/saga.html) — a concise introduction to saga orchestration vs. choreography, ahead of the full treatment in Module 11.

→ Continue to [Module 09 — Storage](../../module-09-storage/).
