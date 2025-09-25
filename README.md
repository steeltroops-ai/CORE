# CORE – Commercialization & Research Evaluator

Hackathon project (Track 1 Tech Transfer implemented) that transforms research inputs into commercialization insights across tech transfer, VC evaluation, and GTM generation.

## Structure
- `backend/` – FastAPI service with stubbed endpoints ready for Logic Mill, Beyond Presence, and ElevenLabs integrations.
- `frontend/` – Next.js App Router interface showcasing Research Ingestor, insight tabs, agent console, and narration controls.
- `docs/` – Planning materials, architecture notes, and delivery roadmaps.

## Getting Started
### Backend
```bash
cd backend
poetry install
poetry run uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Adjust environment variables per the documentation when connecting to external APIs.

