from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class GuitarLesson(BaseModel):
    id: str
    title: str
    difficulty: Literal["easy", "medium", "hard"]
    duration_minutes: int
    goals: list[str]
    practice: dict
    tips: list[str]


class ChordEvaluationResponse(BaseModel):
    expected_chord: str
    detected_chord: str
    confidence: float = Field(ge=0, le=1)
    is_match: bool
    feedback: str
    detected_tones: list[str]


class SeparationChoice(BaseModel):
    target: Literal["guitar", "vocals", "instrumental", "full_mix"]
