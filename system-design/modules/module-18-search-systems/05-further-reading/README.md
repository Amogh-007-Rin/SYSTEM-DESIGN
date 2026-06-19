# Module 18 — Further Reading

- **Elasticsearch official documentation — "Elasticsearch basics"** (elastic.co/guide/en/elasticsearch/reference/current/elasticsearch-intro.html) — the authoritative reference for indices, shards, replicas, mappings, and the Query DSL covered in this module.
- **OpenSearch documentation** (opensearch.org/docs/latest/) — the open-source fork of Elasticsearch; useful for comparing API surface and understanding what diverged after the licensing split.
- **"The Probabilistic Relevance Framework: BM25 and Beyond" (Robertson & Zaragoza, 2009)** — the canonical paper explaining BM25's derivation and why it improves on classical TF-IDF; the original Okapi BM25 work this paper formalizes traces back to Robertson et al.'s TREC experiments in the early 1990s.
- **Lucene's Practical Scoring Function documentation** (lucene.apache.org — "Scoring") — explains how Lucene (the engine underlying both Elasticsearch and Solr) actually implements BM25-based scoring in practice.
- **Google's S2 Geometry Library documentation** (s2geometry.io) — the authoritative reference for S2 cells, the hierarchical spherical geometry indexing scheme used in production geo-search systems at significant scale.
- **Uber Engineering Blog — "Geofence: Scaling Geospatial Indexing"** and related Uber Engineering posts on H3/geospatial indexing (eng.uber.com) — practical, production-grade discussion of geospatial indexing trade-offs at ride-hailing scale, directly relevant to the geo-search concepts in [02-deep-dive](../02-deep-dive/README.md).
- **PostGIS official documentation** (postgis.net/documentation/) — the authoritative reference for spatial data types and indexes (GiST-based R-trees) directly inside PostgreSQL.
- **"The Engineering Behind Facebook's/Google's autocomplete"-style engineering blog posts** — search engineering blogs (Algolia's blog at algolia.com/blog, and Elastic's own blog at elastic.co/blog) regularly publish practical write-ups on autocomplete-at-scale, completion suggesters, and relevance tuning that complement the conceptual treatment in this module.

→ Continue to [Module 19 — ML Systems](../../module-19-ml-systems/).
