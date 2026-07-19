# MaterialWatch

A document intelligence pipeline . It ingests SEBI/BSE/NSE disclosure PDFs, retrieves the relevant text for each one using semantic search, and uses Gemini to classify each disclosure into a material event category and extract the key figures into structured JSON.

---

## How to Run

**Prerequisites**
- Node.js v18+
- A MongoDB Atlas cluster (free tier works)
- An ImageKit account (used as PDF storage)
- A Google AI Studio API key

**Setup**

```bash
git clone <repository-url>
cd Backend
npm install
cp .env.example .env
# fill in MONGO_URI, GEMINI_API_KEY, and the three IMAGEKIT_* values in .env
npm run dev
```

The server starts on `http://localhost:3000` (or whatever `PORT` is set to).

**Running the full pipeline over the dataset**

1. Upload each PDF: `POST /api/upload` (multipart form field `file`) — repeat for all 49 documents.
2. Process each uploaded document (extract text → chunk → embed): `POST /api/process/:documentId`
3. Run extraction across everything that's been processed: `POST /api/extraction/run-all`
4. Generate the final deliverable JSON:
   ```bash
   node scripts/generateOutput.js
   ```
   This writes `output.json` in the project root, matching the assignment schema exactly.

Alternatively, `GET /api/export` returns the same aggregated JSON over HTTP without writing to disk, if you want to inspect it before generating the file.

### API Reference

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/upload` | Upload a single disclosure PDF |
| POST | `/api/process/:documentId` | Extract text, chunk, and embed one document |
| POST | `/api/extraction/run` | Run RAG extraction for one document |
| POST | `/api/extraction/run-all` | Run extraction across every uploaded document |
| GET | `/api/extraction/:documentId` | Fetch the stored extraction for one document |
| GET | `/api/export` | Return the aggregated, schema-compliant output as JSON |

---

## Architectural Approach

The pipeline follows a Retrieval-Augmented Generation(RAG) design rather than feeding entire PDFs to the LLM. Each document is uploaded to ImageKit, parsed with `pdf-parse`, and split into overlapping chunks using LangChain's `RecursiveCharacterTextSplitter` (1000 chars, 200 overlap). Every chunk is embedded with Gemini's `gemini-embedding-001` and stored in MongoDB alongside the chunk text and its parent document reference.

At extraction time, a fixed query ("Extract all material financial disclosure information") is embedded and compared against every stored chunk for that document using cosine similarity, computed in application memory rather than through MongoDB Atlas's native `$vectorSearch`. The top-scoring chunks are concatenated into a context block and passed to Gemini (`gemini-3.5-flash`) along with a structured prompt that enforces the exact output schema, the five allowed event categories, and explicit "return null, don't guess" instructions.

The extracted JSON is parsed, validated, and upserted into a dedicated `Extraction` collection keyed by document ID — so re-running extraction on a document overwrites rather than duplicates. A batch controller loops over every uploaded document and calls this same single-document extraction path, collecting successes and failures independently so one bad PDF doesn't halt the run. Finally, an export layer (both an HTTP endpoint and a standalone script) reads every stored extraction, computes category counts, flags any document with no corresponding extraction as failed, and assembles the final schema-compliant JSON.

The codebase is layered into routes, controllers, services, and models, with a shared `runExtractionForDocument` service reused by both the single-document and batch endpoints — so there's one code path for the actual extraction logic, not two copies that can drift apart.

---

## Key Tradeoffs

**1. In-memory cosine similarity instead of Atlas Vector Search.**
MongoDB Atlas Vector Search was configured and is available (`vector.service.js`), but retrieval currently loads all chunks for a given document and scores them in plain JavaScript. At 49 documents with a handful of chunks each, this is correct, deterministic, and easy to debug — there's no index-building step to go wrong mid-assignment. It does not scale: at 5,000 documents I'd switch to `$vectorSearch` so retrieval is a database-side ANN query instead of pulling every chunk into memory per request.

**2. Sequential batch processing, not concurrent.**
`run-all` processes documents one at a time rather than in parallel. This was a deliberate choice to avoid hitting Gemini rate limits mid-run and to keep failures isolated and easy to trace back to a specific document. The cost is wall-clock time — 49 sequential LLM calls is noticeably slower than it needs to be. At production scale I'd move to bounded concurrency (a small worker pool, 5-10 documents in flight) with retry/backoff on rate-limit errors specifically, rather than either full sequential or full parallel.

**3. LLM-based extraction over rule-based parsing.**
Given 49 documents with inconsistent BSE/NSE formatting, I used Gemini for both classification and figure extraction instead of writing per-template regex/rule parsers. This trades determinism for robustness — the model generalizes across layout variation that rule-based parsing would need dozens of special cases to handle, but it also means extraction quality is bounded by prompt quality and occasionally produces malformed JSON (handled via cleanup + a parse-failure path that marks the document as failed rather than crashing the batch). With more time, I'd add a lightweight rule-based pre-pass for the most structurally consistent fields (dates, tickers) as a cross-check against what Gemini returns, rather than trusting the LLM as the sole source for every field.

---

## Edge Cases

**Handled**
- Missing ticker symbols, dates, or figures → explicitly `null`, not guessed
- Documents that don't fit any of the four specific categories → `other`
- Malformed/non-JSON responses from Gemini → caught, document marked failed, batch continues
- Documents with no retrievable chunks (e.g. extraction/chunking never completed) → skipped with an explicit error, not a silent empty result
- Re-running extraction on an already-processed document → upserts instead of duplicating
- One document's extraction failure during `run-all` doesn't stop the remaining documents

**Not handled**
- Multi-event disclosures (a single filing that both declares a dividend and reports quarterly results) are currently classified into one dominant category rather than emitting multiple records — the schema is single-category-per-record, and I didn't extend it to multi-label.
- Financial unit normalization (crore vs. lakh vs. plain rupees vs. percentages) relies entirely on the prompt instructing Gemini to normalize — there's no deterministic post-processing pass that re-derives figures from raw text as a cross-check, so an occasional unit-conversion slip from the model would go uncaught.
- Company short-name resolution (a filing that introduces "XYZ Limited" once and refers to it as "XYZ" afterward) depends on the LLM correctly carrying that context across retrieved chunks — if the chunk containing the full name isn't among the top-K retrieved, the short name may be extracted as-is.

---

## AI Services & Libraries

| Tool | Why |
|---|---|
| **Gemini 3.5 Flash** (`@google/genai`) | Structured classification + extraction. Chosen for JSON-mode reliability and cost relative to larger models; the assignment's exact-schema requirement fits a model that follows structured-output instructions well. |
| **Gemini Embedding 001** | Chunk and query embeddings for semantic retrieval. Kept in the same provider as generation to avoid managing two AI vendors for one pipeline. |
| **LangChain (`@langchain/textsplitters`)** | `RecursiveCharacterTextSplitter` for chunking — handles paragraph/sentence-boundary splitting better than a naive fixed-length splitter, which matters for retrieval quality on long disclosure text. |
| **MongoDB / Mongoose** | Storage for documents, chunks (with embeddings), and extractions. Chosen to keep the whole pipeline on one database rather than adding a dedicated vector store, since Atlas supports vector search natively if needed later. |
| **pdf-parse** | Text extraction from PDFs. |
| **ImageKit** | PDF file storage; documents are uploaded there and referenced by URL rather than stored as blobs in Mongo. |
| **Multer** | Multipart upload handling for the `/api/upload` route. |

---

## Evaluation

Extraction quality was checked manually by spot-comparing a sample of outputs against their source PDFs across all five categories — company name, ticker, date, category, and figures were verified by eye rather than through an automated scoring script. Classification was reliable on documents that clearly matched one category; extraction of figures was accurate for the common formats (single-figure dividend announcements, standard quarterly result tables) but I'd expect lower reliability on documents with dense tables, multiple time periods reported in one filing, or the multi-event and unit-normalization cases noted above. I did not build an automated ground-truth comparison for this submission, so this assessment is based on manual sampling rather than a measured accuracy percentage — treat the `extraction_confidence` field as the model's own indicative signal, not a validated score.

---

## Known Limitations

- Multi-event disclosures are classified into a single dominant category, not split into multiple records.
- Unit normalization (crore/lakh/rupees/percentages) is prompt-driven with no deterministic verification pass.
- Retrieval uses in-memory cosine similarity rather than Atlas `$vectorSearch` (see Tradeoffs).
- Batch processing (`run-all`) is sequential, not concurrent.

---

