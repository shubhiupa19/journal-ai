# AI Journal - Production Roadmap

## Phase 1: Feedback Collection ✅ COMPLETE
- [x] Database tables (feedback + model_versions)
- [x] Flask /feedback endpoint
- [x] Next.js /api/feedback route
- [x] Frontend feedback UI

## Phase 2: Retraining Pipeline ✅ COMPLETE
- [x] Script to export feedback data for training (`get_training_feedback()` in database.py)
- [x] Update train_model.py to include feedback data (pd.concat with CSV)
- [x] Retrain model and save new .pkl file
- [x] Update model_versions table with new version info (`save_model_version()`, `get_latest_version()`)
- [x] Mark feedback rows as `used_in_training = TRUE` after retraining (`mark_used_feedback()`)
- [x] Error handling with try/except on DB operations
- [x] Bug fix: "No Distortion" sentences now clickable for feedback
- [x] Bug fix: stale feedback state reset on new analysis

## Phase 3: Deployment ✅ COMPLETE
- [x] Deploy updated model to Render (auto-deploys on push to main)
- [x] Fixed Vercel environment variable (BACKEND_URL was missing from Vercel dashboard)
- [ ] (Future) Automate retraining on schedule or when enough feedback collected
- [ ] (Future) Move from SQLite to persistent DB (Supabase/PostgreSQL) — Render's ephemeral filesystem wipes feedback.db on redeploy

## Phase 4: Advanced ML Features
- [ ] Admin dashboard to view feedback stats
- [ ] A/B testing between model versions
- [ ] Active learning - prioritize uncertain predictions for feedback

## Phase 5: Security & Hardening ✅ COMPLETE
- [x] Lock down CORS to frontend domain only
- [x] Add rate limiting (Flask-Limiter) — 20/min predict, 10/min feedback
- [x] Input validation - length limits (5000 chars predict, 500 chars feedback)
- [x] Sanitize error responses (no tracebacks in production)
- [x] Add request size limits (16KB MAX_CONTENT_LENGTH)
- [x] Add API key auth for feedback endpoint (X-API-Key header, server-side only)

## Phase 6: Error Handling & Resilience ✅ COMPLETE
- [x] Frontend: try-catch on all API calls, show error messages to users
- [x] Frontend: input validation (empty text check with early return)
- [x] Fix /feedback response format (now returns proper JSON object)
- [x] Backend: try-catch on /feedback route
- [x] Backend: removed traceback from /predict error responses
- [x] Code cleanup: removed unnecessary comments, renamed variables for clarity
- [x] Extracted ResultsDisplay component from page.js
- [ ] (Future) Add React error boundaries
- [ ] (Future) Add toast notifications for feedback confirmation

## Phase 7: Testing 🔄 IN PROGRESS
- [x] Backend: tests for database operations (test_database.py — 3 tests)
- [ ] Backend: test `mark_used_feedback` function
- [ ] Backend: pytest for Flask routes (/predict, /feedback) via test client
- [ ] Backend: model prediction sanity tests
- [ ] Model regression tests (accuracy doesn't drop after retrain)
- [ ] Frontend: error path tests (API failures, network errors)

## Phase 8: CI/CD & DevOps
- [ ] GitHub Actions workflow (lint + test on PR)
- [ ] Automated deployment (main → Vercel + Render)
- [ ] Dockerize the backend
- [ ] Create .env.example file
- [ ] Add Prettier config
- [ ] Add pre-commit hooks (Husky + lint-staged)

## Phase 9: ML Model Improvements (Partially Complete)
- [x] Cross-validation and hyperparameter tuning (GridSearchCV) — best: max_features=3000, ngram_range=(1,3), C=1.0
- [x] Try better models — SVM tested, no improvement over LR (~34% both), kept LR for speed
- [x] Data augmentation — 1,280 AI-generated sentence-level samples added
- [x] Switched training from full paragraphs to distorted sentences (matches inference)
- [x] Downsampled "No Distortion" to 400 (split paragraphs into sentences first)
- [ ] Context-aware prediction (sentence-in-context, not independent)
- [ ] Confidence thresholds - hide low-confidence predictions
- [ ] Multi-label support (sentence can have multiple distortions)
- [ ] Try transformer model (DistilBERT) for deeper language understanding
- [ ] Collect more real user feedback to improve training data

## Phase 10: UX & Accessibility
- [ ] ARIA labels and roles throughout
- [ ] Keyboard navigation support
- [ ] Color + icon differentiation (colorblind-friendly)
- [ ] Dark mode
- [ ] Character count and input limits on textarea
- [ ] History/sessions - revisit past analyses
- [ ] Toast/notification for feedback confirmation

## Phase 11: Observability
- [ ] Structured logging (replace print statements)
- [ ] Error tracking (Sentry or similar)
- [ ] Model performance monitoring (prediction distribution, confidence drift)
- [ ] Usage analytics

## Cleanup
- [ ] Remove unused deps: cohere-ai, react-highlight-words
- [ ] Consider PostgreSQL migration if concurrent usage grows
- [x] Populate model_versions table with current model info

## Priority Order
1. Phase 7 (testing) — finish what's in progress
2. Phase 8 (CI/CD) — automates quality, safety net for future changes
3. Phase 9 (model accuracy) — 34% → 60%+ transforms the app
4. Phase 10-11 (UX, observability) — polish
