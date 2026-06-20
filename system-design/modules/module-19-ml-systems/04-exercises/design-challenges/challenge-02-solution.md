# Design Challenge 02 — Solution: A RAG-Based Document Q&A System

## Separating the Two Pipelines

A RAG system is really two systems sharing one vector database:

- **Offline ingestion pipeline**: runs whenever documents are added, updated, or deleted — chunking, embedding, and indexing. Throughput-oriented, not latency-sensitive; processing a new batch of documents in seconds-to-minutes is fine.
- **Online query pipeline**: runs per user question — embed the query, retrieve top-k chunks, generate an answer. Latency-sensitive; a user is waiting synchronously for an answer.

Conflating them — e.g., re-chunking and re-embedding source documents on every query — would make every question pay the full cost of document processing, turning a sub-second query into a multi-second (or worse) one for no benefit, since the documents haven't changed between queries. Keeping them separate means the expensive part (embedding potentially large documents) happens once per document, not once per question.

## Chunking Strategy

Documents are split into chunks of roughly 200–500 tokens, with a modest overlap (10–20% of chunk size) between consecutive chunks. The size trade-off: chunks that are too large dilute the embedding's semantic precision (a 2,000-token chunk's embedding becomes a blurry average of everything in it, hurting retrieval precision) and eat into the LLM's context window budget once retrieved; chunks that are too small lose the surrounding context needed to correctly interpret an isolated sentence (e.g., a clause referring to "this policy" without the policy's name nearby). Overlap exists so a fact split across a chunk boundary in the source document still appears whole in at least one chunk. Chunking should also respect document structure where available (don't split mid-sentence or mid-table; prefer splitting at paragraph/section boundaries) rather than blindly cutting at a fixed token count.

## Embedding Pipeline

A dedicated embedding model (much smaller and cheaper than the generation LLM) runs once per chunk at ingestion time, producing a dense vector stored alongside the chunk's text and source-document metadata (document ID, version, last-updated timestamp) in the vector database. When a source document is updated, the ingestion pipeline **re-chunks and re-embeds only that document**, then deletes its old chunk vectors and inserts the new ones (using the document ID as the deletion key) — versioning by document ID rather than trying to diff and patch individual chunks keeps the update path simple and correct. When a document is deleted, its chunks are deleted from the vector database in the same pass, preventing stale content from ever being retrievable.

![RAG system architecture diagram](../../01-concepts/diagrams/exports/rag-system-architecture.png)
*The two distinct pipelines in RAG: an offline ingestion pipeline (documents → chunking → embedding model → vector database) and an online query pipeline (question → embedding → top-k retrieval → prompt assembly → LLM generation).*

## Vector Database Choice

For an internal company document Q&A system — likely tens of thousands to low millions of chunks, not billions — **pgvector** is a strong default choice if the company already operates PostgreSQL: it avoids standing up an entirely new piece of infrastructure just for vector search, keeps chunk metadata and vectors in the same transactional store (simplifying the update/delete-on-document-change logic above), and is more than capable at this scale. If the company anticipates scaling to tens of millions+ chunks across many document sources, or wants built-in hybrid (vector + keyword) search and multi-tenancy out of the box, **Weaviate** (open-source, self-operated) or **Pinecone** (fully managed) become more attractive — trading operational simplicity (pgvector) for specialized scale and features (Weaviate/Pinecone) at the cost of operating or paying for a dedicated system.

## Retrieval and Generation (Online Query Path)

1. User submits a question.
2. The question is embedded using the **same embedding model** used during ingestion (using a different or mismatched embedding model between ingestion and query is the RAG equivalent of training-serving skew — the query vector and the document vectors would no longer live in a comparable space).
3. The vector database returns the top-k most similar chunks (k typically 3–10, tuned empirically).
4. Retrieved chunks are assembled into the LLM's prompt alongside the original question, with an instruction to answer **only** using the supplied context and to say so explicitly if the context doesn't contain the answer.
5. The LLM generates the answer, ideally with citations back to source chunks/documents so a user can verify the answer rather than trusting it blindly.

**If retrieval returns no good matches** (all similarity scores fall below a confidence threshold), the system should not force the LLM to answer anyway — it should return an explicit "I couldn't find relevant information in the documentation" response, or route to a human, rather than letting the LLM generate a plausible-sounding but ungrounded answer from its parametric memory.

## Failure Modes and Mitigations

- **LLM hallucinates despite grounded context**: even with relevant retrieved chunks supplied, an LLM can still ignore them and generate something not actually supported by the context. Mitigation: prompt the model explicitly to cite which retrieved chunk supports each claim, and/or add a lightweight verification step (a second, cheaper model call, or a rules-based check) that confirms the generated answer's key claims actually appear in the retrieved context before returning it to the user.
- **Retrieval returns stale information from an updated document**: if document versioning/deletion (described above) has a bug or a race condition during re-ingestion, a user could retrieve an outdated chunk. Mitigation: always store and surface the source document's last-updated timestamp alongside retrieved chunks (both to the generation prompt and to the user as a citation), so staleness is at least visible rather than silent, and treat re-ingestion on document update as an atomic delete-then-insert (or a single transaction, if the vector DB supports it) to eliminate the race window where both old and new chunks briefly coexist.

## Trade-offs Discussed

| Decision | Choice | Trade-off |
|---|---|---|
| Pipeline architecture | Separate offline ingestion / online query pipelines | Query latency stays low and predictable; adds operational complexity of keeping two pipelines and a shared vector store in sync |
| Chunk size | ~200–500 tokens with overlap | Balances embedding precision against context loss; requires empirical tuning per document type, no single universally correct size |
| Vector database | pgvector (assuming existing PostgreSQL use) | Minimizes new infrastructure and simplifies transactional updates; less specialized scale/feature ceiling than a dedicated vector DB like Pinecone or Weaviate |
| Low-confidence retrieval | Explicit "no answer found" instead of forcing generation | Prevents confident-sounding hallucinated answers; reduces the system's apparent helpfulness on edge-case questions |
