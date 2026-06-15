# 1. Phase 4 overview

Smart Search lets UniBond understand the meaning of a student's query instead of only matching exact words. A search like `How to fix stack overflow in recursion?` can still find a post titled `Recursion keeps causing stack overflow in my factorial program` even if the wording is different.

This is useful in UniBond because students often ask the same question using different phrasing. Semantic search helps them discover earlier discussions, solutions, and explanations before creating duplicate posts.

In simple words, semantic search works like this:

1. Convert each post into a numeric vector called an embedding.
2. Convert the user's query into another embedding.
3. Compare the query vector with stored post vectors.
4. Return the posts whose meaning is closest to the query.

This helps students find similar solutions faster, learn from older discussions, and keep the platform more organized.

# 2. Recommended project structure

```text
backend/
├── app/
│   ├── core/
│   │   └── config.py
│   ├── main.py
│   ├── routers/
│   │   ├── health.py
│   │   └── search.py
│   ├── schemas/
│   │   └── search.py
│   └── services/
│       ├── embedding_service.py
│       ├── faiss_index_service.py
│       ├── smart_search_repository.py
│       └── smart_search_service.py
├── data/
│   ├── faiss_index/
│   │   ├── posts.index
│   │   └── posts_metadata.json
│   └── search/
│       └── sample_posts.json
├── docs/
│   └── phase4_smart_search_module.md
└── requirements.txt
```

Where each responsibility lives:

- Embedding logic: `app/services/embedding_service.py`
- FAISS index logic: `app/services/faiss_index_service.py`
- Search orchestration: `app/services/smart_search_service.py`
- Request and response schemas: `app/schemas/search.py`
- API endpoints: `app/routers/search.py`
- Sample dataset loader: `app/services/smart_search_repository.py`
- Local index files: `data/faiss_index/`
- Sample posts: `data/search/sample_posts.json`

# 3. Required packages

Install command:

```bash
pip install fastapi uvicorn pydantic pydantic-settings sentence-transformers faiss-cpu numpy
```

`requirements.txt` section:

```txt
fastapi==0.134.0
uvicorn==0.41.0
pydantic==2.12.5
pydantic-settings==2.13.1
numpy==2.3.4
sentence-transformers==5.1.1
faiss-cpu==1.12.0
torch==2.8.0
transformers==4.57.1
tokenizers==0.22.1
```

# 4. Best MVP architecture choice

The best MVP design for this phase is:

- One embedding service to load the model once and create vectors
- One FAISS index service to build, save, load, and search the vector index
- One search service to control the full flow
- One router layer to expose clean API endpoints
- One simple metadata list to map FAISS positions back to posts

This is better than putting everything in one route because:

- The route stays small and easy to read
- Model loading is not repeated inside each request
- FAISS logic is isolated and easier to debug
- The service layer is easier to replace later with database-backed posts
- The code is much easier to extend for recommendations, filtering, and background indexing

# 5. Search system design

MVP capabilities:

- Index posts
- Store embeddings inside a local FAISS index
- Save index metadata locally
- Rebuild the index on demand
- Search top-k similar posts
- Return ranked results with similarity scores

Flow:

1. Read posts from `sample_posts.json`
2. Convert `title + content` into one searchable text string
3. Generate embeddings with `sentence-transformers`
4. Add embeddings to a FAISS `IndexFlatIP` index
5. Save the FAISS index and post metadata locally
6. When a query arrives, embed it with the same model
7. Search the FAISS index for the nearest vectors
8. Map vector positions back to posts
9. Return a clean ranked API response

# 6. Data model assumptions

For the MVP, each post contains:

- `id`
- `title`
- `content`
- `author_name`
- `created_at`

Searchable text preparation:

```text
Title: {title}
Content: {content}
```

This keeps the title important while still giving the model the full question context from the content.

# 7. Best model choice for embeddings

Recommended model:

```text
sentence-transformers/all-MiniLM-L6-v2
```

Why it is a strong MVP choice:

- Lightweight and fast for local development
- Good semantic similarity performance
- Widely used for beginner-friendly semantic search demos
- Works well for short questions and post-sized text

Simple tradeoff:

- Smaller and faster than large transformer models
- Not as strong as heavier embedding models on very hard retrieval tasks
- Ideal for a university MVP because it is easy to run and easy to explain

# 8. Full code files

These files are implemented in the project:

- [main.py](/Users/chamudikapramod/FastAPI/myfirstprojectzV2/ITPM-Project-UNI-Bond/backend/app/main.py)
- [search.py](/Users/chamudikapramod/FastAPI/myfirstprojectzV2/ITPM-Project-UNI-Bond/backend/app/routers/search.py)
- [search.py](/Users/chamudikapramod/FastAPI/myfirstprojectzV2/ITPM-Project-UNI-Bond/backend/app/schemas/search.py)
- [embedding_service.py](/Users/chamudikapramod/FastAPI/myfirstprojectzV2/ITPM-Project-UNI-Bond/backend/app/services/embedding_service.py)
- [faiss_index_service.py](/Users/chamudikapramod/FastAPI/myfirstprojectzV2/ITPM-Project-UNI-Bond/backend/app/services/faiss_index_service.py)
- [smart_search_repository.py](/Users/chamudikapramod/FastAPI/myfirstprojectzV2/ITPM-Project-UNI-Bond/backend/app/services/smart_search_repository.py)
- [smart_search_service.py](/Users/chamudikapramod/FastAPI/myfirstprojectzV2/ITPM-Project-UNI-Bond/backend/app/services/smart_search_service.py)
- [config.py](/Users/chamudikapramod/FastAPI/myfirstprojectzV2/ITPM-Project-UNI-Bond/backend/app/core/config.py)
- [sample_posts.json](/Users/chamudikapramod/FastAPI/myfirstprojectzV2/ITPM-Project-UNI-Bond/backend/data/search/sample_posts.json)

The code is already connected so `main.py` includes the new semantic search router.

# 9. Request and response design

Main request model:

```json
{
  "query": "How to solve SQL join confusion?",
  "top_k": 5
}
```

Main response model:

```json
{
  "query": "How to solve SQL join confusion?",
  "total_results": 2,
  "results": [
    {
      "rank": 1,
      "post_id": 3,
      "title": "Need help understanding INNER JOIN and LEFT JOIN",
      "content_preview": "I am confused about the difference between INNER JOIN and LEFT JOIN in SQL...",
      "author_name": "Sahan",
      "similarity_score": 0.8721,
      "created_at": "2026-03-05T14:30:00"
    }
  ]
}
```

Extra response for rebuild:

```json
{
  "status": "success",
  "message": "Smart search index rebuilt successfully.",
  "indexed_posts": 15,
  "embedding_dimension": 384,
  "index_path": "data/faiss_index/posts.index",
  "metadata_path": "data/faiss_index/posts_metadata.json"
}
```

# 10. Embedding logic

The embedding service:

- Loads the `SentenceTransformer` model lazily
- Encodes post texts and query texts
- Normalizes embeddings so cosine similarity works with FAISS inner product
- Returns `numpy.float32` vectors for FAISS compatibility
- Raises clear HTTP errors if the model package is missing or fails to load

The important rule is consistency: posts and query must both use the same model and the same vector dimension.

# 11. FAISS index logic

The FAISS service does these jobs:

- Create a `faiss.IndexFlatIP` index
- Add normalized post embeddings
- Search with query embeddings
- Save the index to `data/faiss_index/posts.index`
- Load the index back from disk
- Keep track of the embedding dimension

Mapping back to posts is handled by `posts_metadata.json`, which stores the post data in the same order used to add vectors into the index.

# 12. Search service layer

The search service is the main controller. It:

- Loads posts from the repository
- Prepares searchable text
- Creates embeddings
- Builds and saves the FAISS index
- Loads saved metadata and index if available
- Performs semantic search
- Filters weak matches using a minimum similarity threshold
- Formats API-friendly ranked results

This keeps the route file simple and avoids putting model logic inside the endpoint.

# 13. API endpoints

`GET /health`

- Existing project health endpoint
- Confirms the API is running

`POST /api/v1/search/rebuild-index`

- Reads posts from the sample dataset
- Rebuilds the local FAISS index
- Saves the index and metadata

Sample response:

```json
{
  "status": "success",
  "message": "Smart search index rebuilt successfully.",
  "indexed_posts": 15,
  "embedding_dimension": 384,
  "index_path": "data/faiss_index/posts.index",
  "metadata_path": "data/faiss_index/posts_metadata.json"
}
```

`POST /api/v1/search/query`

- Accepts a user query
- Finds the top similar indexed posts
- Returns ranked results

Sample request:

```json
{
  "query": "How do SQL joins work?",
  "top_k": 5
}
```

`GET /api/v1/search/posts`

- Returns the current indexed posts and their prepared searchable text
- Useful for debugging and demos

# 14. Example search scenarios

1. `How to fix stack overflow in recursion?`
Expected: post about recursion base cases and stack overflow should rank near the top.

2. `Why does my recursive function never stop?`
Expected: recursion post should still match even with different wording.

3. `I do not understand inner join vs left join`
Expected: SQL join post should rank first.

4. `Can someone explain database normalization for my assignment?`
Expected: normalization post should be highly relevant.

5. `What are the four deadlock conditions?`
Expected: deadlock post should rank first.

6. `How do I calculate hosts from CIDR subnet masks?`
Expected: subnetting post should rank first.

7. `React state updates are delayed`
Expected: React `useState` post should rank first.

8. `How does JWT auth work in FastAPI?`
Expected: FastAPI JWT post should rank first.

9. `How do I resolve a git merge conflict safely?`
Expected: Git merge conflict post should rank first.

10. `Why is my machine learning model overfitting?`
Expected: overfitting post should rank first.

11. `Explain binary search tree insertion recursively`
Expected: BST insertion post should rank first.

12. `Difference between process and thread`
Expected: process/thread post should rank first.

13. `How does Dijkstra shortest path algorithm work?`
Expected: Dijkstra post should rank first.

14. `How do foreign keys come from ER diagrams?`
Expected: ER diagram and foreign key post should rank first.

15. `What is the weather in Colombo today?`
Expected: likely no results or very weak results because it is unrelated to the study dataset.

16. `a`
Expected: validation error because the query is too short.

# 15. Sample dataset

The included MVP dataset contains 15 realistic study-related posts covering:

- Java OOP inheritance
- Recursion stack overflow
- SQL joins
- Normalization
- Operating systems deadlock
- Networking subnetting
- React state updates
- FastAPI JWT authentication
- Git merge conflict
- Machine learning overfitting
- Binary search tree insertion
- Processes vs threads
- Dijkstra algorithm
- Backend security concepts
- ER diagrams and foreign keys

Dataset file:

- [sample_posts.json](/Users/chamudikapramod/FastAPI/myfirstprojectzV2/ITPM-Project-UNI-Bond/backend/data/search/sample_posts.json)

# 16. How to run locally

From the project root:

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open Swagger UI:

```text
http://127.0.0.1:8000/docs
```

# 17. How to test in Swagger/Postman

Recommended order:

1. Open `/docs`
2. Run `POST /api/v1/search/rebuild-index`
3. Run `POST /api/v1/search/query`

Example search request:

```json
{
  "query": "How to solve SQL join confusion?",
  "top_k": 5
}
```

How to interpret results:

- Higher `similarity_score` means stronger semantic match
- `rank = 1` means the best result
- `total_results` tells how many results passed the minimum similarity threshold

Successful response:

```json
{
  "query": "How to solve SQL join confusion?",
  "total_results": 2,
  "results": [
    {
      "rank": 1,
      "post_id": 3,
      "title": "Need help understanding INNER JOIN and LEFT JOIN",
      "content_preview": "I am confused about the difference between INNER JOIN and LEFT JOIN in SQL...",
      "author_name": "Sahan",
      "similarity_score": 0.8721,
      "created_at": "2026-03-05T14:30:00"
    }
  ]
}
```

Failing examples:

- Empty or whitespace query: `422`
- Query shorter than minimum length: `422`
- Missing `sentence-transformers` or `faiss-cpu`: `503`

# 18. Common errors and fixes

`sentence-transformers not installed`

- Install dependencies again with `pip install -r requirements.txt`

`FAISS install problems`

- Use `faiss-cpu` for local development
- Recreate the virtual environment if wheel conflicts appear

`numpy issues`

- Upgrade `pip`
- Reinstall `numpy`, `faiss-cpu`, and `sentence-transformers` together

`slow first model load`

- Normal on the first run because the embedding model downloads and initializes

`empty index`

- Call `POST /api/v1/search/rebuild-index`
- Check that `data/search/sample_posts.json` exists

`index not rebuilt`

- Verify the server has write access to `data/faiss_index/`

`import/module path issues`

- Run the app from inside `backend/`
- Start with `uvicorn app.main:app --reload`

`no results found`

- The query may be unrelated
- The minimum similarity threshold may filter weak matches

`inconsistent embedding dimensions`

- Always use the same embedding model for both indexing and searching
- Rebuild the index after changing the model

# 19. Production-style improvements for later

Good next improvements after the MVP:

- Store posts in PostgreSQL instead of JSON
- Rebuild or update the index automatically when approved posts are created
- Move indexing into a background job
- Filter by category, module, or course
- Combine BM25 keyword search with semantic search
- Add a reranking step for better final ordering
- Move to a vector database later if the dataset grows
- Store search history
- Reuse embeddings for recommendations and related-post suggestions

# 20. Final implementation notes

Create or review these files first:

1. `backend/app/schemas/search.py`
2. `backend/app/services/embedding_service.py`
3. `backend/app/services/faiss_index_service.py`
4. `backend/app/services/smart_search_repository.py`
5. `backend/app/services/smart_search_service.py`
6. `backend/app/routers/search.py`
7. `backend/data/search/sample_posts.json`

Run this file to start the app:

- `backend/app/main.py`

What to expect:

- Rebuild the smart search index
- Send a natural-language study query
- Receive ranked similar posts with similarity scores

Why this phase matters:

- It clearly demonstrates semantic search
- It creates a clean base for future recommendation systems
- It prepares UniBond for approved-post indexing, related-content features, and RAG-style retrieval later

# Next step after Phase 4

After this phase, connect Smart Search to the rest of UniBond in this order:

1. Post creation endpoint
When a new post is created, generate its searchable text and add it to the index.

2. Moderation-approved posts only
Only index posts that pass your moderation pipeline so Smart Search stays academic and relevant.

3. Recommendation system
Use the same embeddings to recommend related posts under each post detail page.

4. Similar post suggestions before posting
When a student starts writing a new question, show similar existing posts first to reduce duplicate posts.

5. Chatbot or RAG later
The same semantic retrieval flow can become the retrieval layer for a future chatbot that answers from UniBond content.
