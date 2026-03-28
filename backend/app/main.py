from __future__ import annotations

import io

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from app.models import ChordEvaluationResponse
from app.services.audio_analysis import InvalidChordError, build_feedback, detect_chord
from app.services.lesson_service import LessonService
from app.services.play_along import generate_metronome_track
from app.services.music_theory import supported_triads
from app.services.source_separation import SUPPORTED_ENGINES, SUPPORTED_TARGETS, separate_signal

app = FastAPI(title="Music Master API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/lessons/guitar")
def guitar_lessons() -> dict:
    lessons = LessonService.get_guitar_lessons()
    return {"count": len(lessons), "lessons": lessons}


@app.get("/api/chords/supported")
def supported_chord_labels() -> dict:
    return {"supported_chords": supported_triads()}


@app.get("/api/play-along/metronome")
def play_along_metronome(bpm: int = 80, bars: int = 4):
    try:
        wav = generate_metronome_track(bpm=bpm, bars=bars)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    headers = {"Content-Disposition": f"attachment; filename=metronome-{bpm}bpm.wav"}
    return StreamingResponse(io.BytesIO(wav), media_type="audio/wav", headers=headers)


@app.post("/api/chords/evaluate", response_model=ChordEvaluationResponse)
async def evaluate_chord(
    expected_chord: str = Form(...),
    audio_file: UploadFile = File(...),
):
    if not audio_file.filename:
        raise HTTPException(status_code=400, detail="Audio file is required")

    try:
        file_bytes = await audio_file.read()
        result = detect_chord(file_bytes, expected_chord=expected_chord)
    except InvalidChordError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - runtime decoding edge cases
        raise HTTPException(status_code=500, detail=f"Chord analysis failed: {exc}") from exc

    is_match, feedback = build_feedback(expected_chord, result)

    return ChordEvaluationResponse(
        expected_chord=expected_chord,
        detected_chord=result.name,
        confidence=result.confidence,
        is_match=is_match,
        feedback=feedback,
        detected_tones=result.tones,
    )


@app.get("/api/songs/separate/options")
def source_separation_options() -> dict:
    return {"targets": sorted(SUPPORTED_TARGETS), "engines": sorted(SUPPORTED_ENGINES)}


@app.post("/api/songs/separate")
async def separate_song_sources(
    target: str = Form(...),
    engine: str = Form("baseline"),
    audio_file: UploadFile = File(...),
):
    if not audio_file.filename:
        raise HTTPException(status_code=400, detail="Audio file is required")

    try:
        file_bytes = await audio_file.read()
        separated, sr = separate_signal(file_bytes, target=target, engine=engine)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - runtime decoding edge cases
        raise HTTPException(status_code=500, detail=f"Separation failed: {exc}") from exc

    headers = {"X-Sample-Rate": str(sr)}
    return StreamingResponse(io.BytesIO(separated), media_type="audio/wav", headers=headers)
