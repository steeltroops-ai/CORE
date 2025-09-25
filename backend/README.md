# CORE Backend

FastAPI service delivering Track 1 (Tech Transfer) capabilities for CORE.

## Quickstart
1. Create virtual environment and install dependencies (Poetry recommended).
2. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```
3. Explore docs at `http://localhost:8000/docs`.

## Available Endpoints
- `GET /health` – service heartbeat.
- `POST /ingest` – submit research metadata and trigger Tech Transfer analysis.
- `GET /analysis/{id}` – retrieve combined summary (novelty, patents, publications, stakeholders).
- `GET /analysis/{id}/tech-transfer` – detailed Tech Transfer analysis payload.
- `GET /analysis/{id}/vc` – placeholder response (Track 2 pending).
- `GET /analysis/{id}/gtm` – placeholder response (Track 3 pending).
- `POST /analysis/{id}/narrate` – stub ElevenLabs narration job.
- `POST /agent/{id}` – agent response grounded in Track 1 outputs.

## Integrations
- Logic Mill GraphQL API (live when `CORE_LOGIC_MILL_TOKEN` is set, otherwise curated fallback dataset).
- Future hooks for Beyond Presence and ElevenLabs per delivery roadmap.

## Next Steps
- Persist analyses in SQLite/Postgres instead of in-memory store.
- Add Retriever caching and scoring heuristics tuning.
- Expand endpoints for VC and GTM tracks.
