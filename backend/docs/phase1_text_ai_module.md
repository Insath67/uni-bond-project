# 1. Phase 1 overview

This module adds a first-step AI moderation layer for UniBond posts. It accepts plain post text, sends it to a HuggingFace zero-shot classifier, and returns whether the text looks `study_related` or `non_study_related`.

Why it is useful in UniBond:

- It helps keep the platform focused on academic discussion.
- It gives you a reusable moderation service before you connect it to post creation.
- It creates a clean base for later spam, abuse, recommendation, and image AI features.

Request-to-response flow:

1. Client sends post text to `POST /api/v1/ai/text-moderate`.
2. FastAPI validates the request body with Pydantic.
3. The service layer lazily loads the HuggingFace model on first use.
4. The service classifies the text into study-related or non-study-related.
5. A business rule converts the prediction into `is_allowed`.
6. API returns the label, confidence, and a short explanation.

# 2. Recommended project structure

Inside your current backend, this Phase 1 feature fits like this:

```text
backend/
├── app/
│   ├── core/
│   │   └── config.py
│   ├── routers/
│   │   ├── ai_text.py
│   │   └── health.py
│   ├── schemas/
│   │   └── ai_text.py
│   ├── services/
│   │   └── text_moderation_service.py
│   └── main.py
├── docs/
│   └── phase1_text_ai_module.md
└── requirements.txt
```

Why this structure works:

- `routers/` keeps HTTP endpoint logic thin.
- `schemas/` owns request and response validation.
- `services/` owns AI model loading and prediction logic.
- `core/config.py` keeps settings centralized.
- `docs/` keeps your project explanation/report material in the repo.

# 3. Required packages

Install command:

```bash
pip install fastapi uvicorn pydantic pydantic-settings sqlalchemy psycopg2-binary python-dotenv python-jose passlib bcrypt python-multipart transformers torch tokenizers
```

Recommended `requirements.txt` section:

```txt
fastapi==0.134.0
uvicorn==0.41.0
pydantic==2.12.5
pydantic-settings==2.13.1
sqlalchemy==2.0.47
psycopg2-binary==2.9.11
python-dotenv==1.2.1
python-jose==3.5.0
passlib==1.7.4
bcrypt==4.0.1
python-multipart==0.0.20
transformers==4.57.1
torch==2.8.0
tokenizers==0.22.1
```

# 4. Best model choice for Phase 1

Recommended MVP model: `typeform/distilbert-base-uncased-mnli`

Why this is the best Phase 1 choice:

- It works well for zero-shot classification.
- You do not need a custom labeled dataset to start.
- It is realistic for a university MVP.
- You can test immediately with your own study-related and non-study prompts.
- It is much lighter than `facebook/bart-large-mnli` and `valhalla/distilbart-mnli-12-3`, so local setup is easier.

Important tradeoff:

- A true study-vs-non-study classifier will work best with custom training on UniBond data later.
- For Phase 1, zero-shot classification is the most practical choice because it gives you a working AI moderation endpoint without building a dataset first.

# 5. Full code files

These files are already added in the backend:

- [config.py](/Users/chamudikapramod/FastAPI/myfirstprojectzV2/ITPM-Project-UNI-Bond/backend/app/core/config.py)
- [ai_text.py](/Users/chamudikapramod/FastAPI/myfirstprojectzV2/ITPM-Project-UNI-Bond/backend/app/routers/ai_text.py)
- [health.py](/Users/chamudikapramod/FastAPI/myfirstprojectzV2/ITPM-Project-UNI-Bond/backend/app/routers/health.py)
- [ai_text.py](/Users/chamudikapramod/FastAPI/myfirstprojectzV2/ITPM-Project-UNI-Bond/backend/app/schemas/ai_text.py)
- [text_moderation_service.py](/Users/chamudikapramod/FastAPI/myfirstprojectzV2/ITPM-Project-UNI-Bond/backend/app/services/text_moderation_service.py)
- [main.py](/Users/chamudikapramod/FastAPI/myfirstprojectzV2/ITPM-Project-UNI-Bond/backend/app/main.py)

Main app entry:

- `backend/app/main.py` now registers the AI router and the `/health` endpoint.

Route file:

- `backend/app/routers/ai_text.py` exposes `POST /api/v1/ai/text-moderate`.

Schema file:

- `backend/app/schemas/ai_text.py` contains request, response, health, and error schemas.

Service file:

- `backend/app/services/text_moderation_service.py` contains model loading, prediction, explanation building, and the rule layer.

Config file:

- `backend/app/core/config.py` now contains AI defaults such as model name and text length limits.

# 6. Request and response design

Request schema:

```json
{
  "text": "Can someone explain database normalization with examples?"
}
```

Validation behavior:

- Rejects empty text.
- Rejects whitespace-only text.
- Rejects text shorter than 3 characters.
- Rejects text longer than 2000 characters.

Response shape:

```json
{
  "input_text": "Can someone explain database normalization with examples?",
  "predicted_label": "study_related",
  "confidence": 0.94,
  "is_allowed": true,
  "explanation": "This text appears educational and related to learning or academic discussion."
}
```

Error response example:

```json
{
  "detail": "The moderation model could not be loaded. Check internet access for the first download and verify PyTorch/Transformers installation."
}
```

# 7. Classification logic

How the logic works:

1. API receives the request.
2. `TextModerationRequest` validates the input.
3. `moderate_text()` in the service loads the zero-shot pipeline if needed.
4. It compares the input against two candidate labels:
   - `study related academic discussion`
   - `non-study social, promotional, or irrelevant discussion`
5. The highest score becomes the final class.
6. The result is mapped into:
   - `study_related`
   - `non_study_related`
7. The service adds an explanation and business rule output.

Why these candidate labels were chosen:

- They are descriptive enough for zero-shot NLI.
- They reflect the real use case of a student platform, not just generic sentiment.
- They capture social/promotional/irrelevant text in one MVP label.

# 8. Rule layer on top of AI

Current rule layer:

- If `predicted_label == "study_related"` then `is_allowed = true`
- If `predicted_label == "non_study_related"` then `is_allowed = false`

Why this is good for Phase 1:

- Easy to understand.
- Easy to connect to post creation.
- Easy to replace or expand later.

How to extend later without rewriting everything:

- Add a spam service beside the current service.
- Add an abusive language detector before or after the study classifier.
- Add an advertisement detector as a second-stage classifier.
- Combine scores into one moderation decision object.

# 9. API endpoints

## `GET /health`

Purpose:

- Confirms that the API is up.
- Shows whether the AI model is already loaded in memory.

Example response:

```json
{
  "status": "ok",
  "service": "UniBond API",
  "model_name": "typeform/distilbert-base-uncased-mnli",
  "model_loaded": false
}
```

## `POST /api/v1/ai/text-moderate`

Purpose:

- Accepts post text and returns the moderation result.

Sample input:

```json
{
  "text": "Can someone explain database normalization with examples?"
}
```

Sample output:

```json
{
  "input_text": "Can someone explain database normalization with examples?",
  "predicted_label": "study_related",
  "confidence": 0.9421,
  "is_allowed": true,
  "explanation": "This text appears educational and related to learning, coursework, or academic discussion."
}
```

# 10. Example test cases

1. `Can someone explain database normalization with examples?`
   Expected: `study_related`, allowed.
2. `I need help solving this calculus integration question.`
   Expected: `study_related`, allowed.
3. `Anyone has lecture notes for software engineering tomorrow?`
   Expected: `study_related`, allowed.
4. `How do I prepare for the operating systems mid exam?`
   Expected: `study_related`, allowed.
5. `Can somebody share Java OOP past papers?`
   Expected: `study_related`, allowed.
6. `Who wants to come party tonight?`
   Expected: `non_study_related`, flagged.
7. `Selling my gaming keyboard, DM me if interested.`
   Expected: `non_study_related`, flagged.
8. `Follow my page for funny memes and giveaways.`
   Expected: `non_study_related`, flagged.
9. `Anybody free to discuss our machine learning assignment at 6?`
   Expected: `study_related`, allowed.
10. `Good morning everyone`
    Expected: borderline, likely `non_study_related`, flagged.
11. `Can we reschedule the study group meeting to Friday?`
    Expected: `study_related`, allowed.
12. `This campus event has live music and food stalls tonight.`
    Expected: `non_study_related`, flagged.
13. `Need help understanding binary search tree deletion.`
    Expected: `study_related`, allowed.
14. `Join my crypto channel to earn money fast.`
    Expected: `non_study_related`, flagged.
15. `Any tips for improving my academic presentation slides?`
    Expected: `study_related`, allowed.
16. `LOL that lecture was boring`
    Expected: borderline, likely `non_study_related`, flagged.
17. `Can someone review my database schema for the final project?`
    Expected: `study_related`, allowed.

# 11. How to run locally

From the project root:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Swagger docs:

```text
http://127.0.0.1:8000/docs
```

# 12. How to test in Swagger/Postman

Swagger:

1. Start the backend.
2. Open `/docs`.
3. Open `POST /api/v1/ai/text-moderate`.
4. Click `Try it out`.
5. Paste:

```json
{
  "text": "Can someone explain database normalization with examples?"
}
```

6. Click `Execute`.

Expected response:

```json
{
  "input_text": "Can someone explain database normalization with examples?",
  "predicted_label": "study_related",
  "confidence": 0.94,
  "is_allowed": true,
  "explanation": "This text appears educational and related to learning, coursework, or academic discussion."
}
```

Postman:

- Method: `POST`
- URL: `http://127.0.0.1:8000/api/v1/ai/text-moderate`
- Headers: `Content-Type: application/json`
- Body:

```json
{
  "text": "Who wants to come party tonight?"
}
```

Expected response:

```json
{
  "input_text": "Who wants to come party tonight?",
  "predicted_label": "non_study_related",
  "confidence": 0.91,
  "is_allowed": false,
  "explanation": "This text appears unrelated to academic or study-focused discussion, so it should be flagged for review."
}
```

# 13. Common errors and fixes

Model download issue:

- Cause: first run needs internet to download the HuggingFace model.
- Fix: make sure your machine has internet, rerun the request, and optionally add `HF_TOKEN=your_token` to `backend/.env` for more reliable downloads.

Missing dependencies:

- Cause: `transformers` or `torch` not installed.
- Fix: run `pip install -r requirements.txt`.

Slow first request:

- Cause: model download and model warm-up happen on first use.
- Fix: this is normal. Later requests are much faster.

Validation error:

- Cause: request body is empty, whitespace only, or too short.
- Fix: send valid text with at least 3 non-space characters.

Import/module path issue:

- Cause: running `uvicorn` from the wrong folder.
- Fix: start the server from `backend/` using `uvicorn app.main:app --reload`.

# 14. Production-style improvements for later

- Fine-tune a custom text classifier using real UniBond posts.
- Store moderation results in the database for audit and admin review.
- Add caching for repeated predictions.
- Log flagged content with timestamps and user IDs.
- Combine this with an image moderation module in Phase 2.
- Add confidence thresholds and manual review queues.
- Use async background tasks for heavy AI processing if traffic grows.

# 15. Final implementation notes

Files to create first:

1. `backend/app/schemas/ai_text.py`
2. `backend/app/services/text_moderation_service.py`
3. `backend/app/routers/ai_text.py`
4. `backend/app/routers/health.py`
5. Update `backend/app/core/config.py`
6. Update `backend/app/main.py`
7. Update `backend/requirements.txt`

Which file to run:

- Run `backend/app/main.py` through Uvicorn:

```bash
uvicorn app.main:app --reload
```

What result to expect:

- Swagger shows the new health endpoint and the text moderation endpoint.
- Sending post text returns a label, confidence, explanation, and allow/flag decision.
- The module is ready to be called from your post creation API later.

# “Next step after Phase 1”

Connect to post creation endpoint:

- In `backend/app/routers/post.py`, call `moderate_text(post.content)` before saving a new post.
- If `is_allowed` is `false`, either reject the post or save it with a flagged status for admin review.

Connect to database:

- Add fields such as `moderation_label`, `moderation_confidence`, `is_flagged`, and `moderation_explanation` to the `posts` table.
- Save the AI result when each post is created or updated.

Image moderation phase:

- Create a second service like `image_moderation_service.py`.
- Keep the same router-service-schema structure.
- Return one combined moderation object for text and image.

Search/recommendation phase:

- Reuse the text cleaning and AI service layer pattern.
- Later, replace simple moderation-only logic with embeddings for semantic search and content recommendations.
