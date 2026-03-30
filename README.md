# Music Master

Music Master is a full-stack learning platform with:

- **Python FastAPI backend** for lesson APIs, chord analysis, and song source extraction.
- **Next.js frontend** for interactive lessons, play-along checks, and download of extracted audio.

## Project structure

- `backend/`: FastAPI application and audio-processing services.
- `frontend/`: Next.js web application.

## Features implemented

1. **Step-by-step guitar learning path (easy → hard)**
   - Posture and open strings
   - Open chords
   - Rhythm and strumming
   - Power chords
   - Barre chords + musical dynamics

2. **Play Along section with metronome + chord correctness check**
   - Generate metronome WAV by BPM and bar count
   - Upload your recording
   - Provide expected chord
   - Backend computes chroma features and triad matching
   - Returns confidence + actionable tips
   - Validates chord symbols and returns clear input errors for invalid labels

3. **Song instrument/vocal extraction section**
   - Upload a song
   - Choose output: guitar only, vocals only, instrumental only, or full mix
   - Choose engine: baseline (fast) or demucs (higher quality, optional)
   - Produces downloadable WAV stems for practice sessions


## Frontend architecture

The frontend is now split into focused UI components:

- `frontend/components/LessonsSection.tsx`
- `frontend/components/ChordPracticeSection.tsx`
- `frontend/components/SourceSeparationSection.tsx`
- shared API + types in `frontend/lib/api.ts` and `frontend/types/music.ts`

## Why backend is still required

The backend was intentionally kept because core features currently rely on Python audio/DSP and ML tooling (`librosa`, `music21`, `scipy`, optional `demucs`). These capabilities are not available in the current React dependency set, so removing backend services would break chord detection and source separation quality.


## Backend vs frontend-only feasibility

Short answer: **the backend is still needed** for this project in its current scope.

| Capability | Current implementation | Frontend-only viability today |
|---|---|---|
| Guitar lessons list | Static JSON/model in FastAPI | ✅ Can move to frontend easily |
| Metronome WAV generation | Python `numpy` + `soundfile` | ⚠️ Possible in browser, but would require adding/maintaining new audio libs |
| Chord detection + validation | Python `librosa` + `music21` | ❌ Not equivalent with current frontend deps |
| Source separation (baseline/demucs) | Python DSP + optional `demucs` | ❌ Not practical with current frontend deps |

So we should keep backend services for chord analysis and source separation, and optionally move only lesson data/metronome in a future frontend-only pass.

## shadcn/ui + Tailwind note

Using shadcn/ui requires Tailwind and supporting packages in the frontend toolchain. In this execution environment, npm registry access for new packages is blocked (`403 Forbidden`), so those packages cannot be installed here right now. Once package access is available, we can migrate the existing React sections to shadcn/ui components in a follow-up.

## Backend setup

```bash
cd backend
uv venv .venv
source .venv/bin/activate
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

## Frontend setup

```bash
cd frontend
npm install
NEXT_PUBLIC_API_BASE=http://localhost:8000 npm run dev
```

Open http://localhost:3000.

## Testing backend

```bash
cd backend
python -m pytest
```

## Notes on source extraction quality

The current implementation uses harmonic/percussive decomposition and spectral filtering for a lightweight, dependency-friendly baseline. For production-grade stem quality, you can replace the separation service with Demucs/Spleeter-based inference.


## Additional API

- `GET /api/chords/supported`: returns supported chord labels for guided chord input.
- `GET /api/play-along/metronome?bpm=80&bars=4`: returns a downloadable WAV click track for practice.
- `GET /api/songs/separate/options`: returns supported targets and available separation engines.


## Test behavior in limited environments

Tests are dependency-aware and will auto-skip when required audio libraries are unavailable, instead of failing at import time.


## Optional high-quality separation

To enable Demucs-backed separation, install optional dependencies:

```bash
cd backend
uv sync --extra ml
```

Then call `POST /api/songs/separate` with `engine=demucs`.
