# Module 07 — Further Reading

- **HAProxy Documentation — "Load Balancing"** (haproxy.org/#docs) — the official documentation for one of the most widely deployed open-source software load balancers, including its load balancing algorithms (`roundrobin`, `leastconn`, `source` for IP-hash-style affinity) and health check configuration.
- **Nginx Documentation — "HTTP Load Balancing"** (nginx.org/en/docs/http/load_balancing.html) — the official guide to Nginx's load balancing methods, weights, and health checks, from one of the most common reverse-proxy/load-balancer combinations in production.
- **AWS Documentation — "What Is Elastic Load Balancing?"** (docs.aws.amazon.com/elasticloadbalancing) — covers the differences between Application Load Balancer (L7), Network Load Balancer (L4), and Gateway Load Balancer, plus deregistration delay (connection draining) configuration.
- **AWS Documentation — "Connection Draining for Your Classic Load Balancer" / Target Group Deregistration Delay** — the authoritative source for how AWS implements the connection draining concept covered in [02-deep-dive](../02-deep-dive/README.md).
- **Google Cloud Documentation — "Load Balancing Overview"** (cloud.google.com/load-balancing/docs/load-balancing-overview) — explains Google's global Anycast-based load balancing architecture, a real-world example of the global load balancing concepts in [01-concepts](../01-concepts/README.md).
- **Istio Documentation — "Traffic Management"** (istio.io/latest/docs/concepts/traffic-management/) — the official explanation of how a service mesh handles client-side load balancing, retries, and circuit breaking between microservices.
- **NGINX Blog — "What Is a Service Mesh?"** — a practical, widely cited explainer on service mesh architecture and how it relates to traditional load balancing and API gateways.
- **"Power of Two Choices" — Mitzenmacher's research on randomized load balancing** — the theoretical backing for why the Random and "pick the best of two random choices" algorithms perform far better than naive intuition suggests, referenced in this module's discussion of the Random algorithm.

→ Continue to [Module 08 — Message Queues](../../module-08-message-queues/).
