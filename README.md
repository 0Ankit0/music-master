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
