# Music Master QA Guide

This guide matches the current Vite + React frontend and the FastAPI backend.

## Seed data

Use the reusable values in [src/data/qaSeed.ts](src/data/qaSeed.ts) for repeatable checks:

- `C major smoke test` for chord evaluation
- `Em practice loop` for alternate chord and separation runs

## Manual smoke test sequence

1. Start the backend on port `8000`.
2. Start the frontend on port `5173`.
3. Open the frontend and confirm the header shows `Backend: online`.
4. Generate a metronome track with `80 BPM` and `2 bars`.
5. Upload a short WAV recording and run chord analysis with the expected chord set to `C`.
6. Upload a full song clip and run source separation with target `guitar` and engine `baseline`.
7. Confirm the lessons panel loads five lessons in easy-to-hard order.

## Endpoint checks

| Method | Path | Expected |
|---|---|---|
| GET | `/api/health` | `{"status":"ok"}` |
| GET | `/api/lessons/guitar` | `count = 5` and ordered lessons |
| GET | `/api/chords/supported` | Supported triad labels |
| GET | `/api/play-along/metronome?bpm=80&bars=2` | WAV download with attachment header |
| POST | `/api/chords/evaluate` | Match for the `C major smoke test` sample |
| GET | `/api/songs/separate/options` | Targets and engines |
| POST | `/api/songs/separate` | WAV download for the selected target |

## Sample audio for QA

The backend tests already generate valid WAV samples programmatically. If you want a reusable local sample, generate one with the same chord mix used in `backend/tests/test_audio_analysis.py` and keep it in `/tmp` or another scratch location for manual uploads.
