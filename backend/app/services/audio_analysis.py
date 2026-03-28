from __future__ import annotations

import io
from dataclasses import dataclass

import librosa
import numpy as np
from music21 import harmony, pitch

from app.services.music_theory import NOTE_NAMES


class InvalidChordError(ValueError):
    """Raised when the user-provided expected chord label cannot be parsed."""


@dataclass
class ChordResult:
    name: str
    confidence: float
    tones: list[str]


def _parse_expected_chord(chord_name: str) -> tuple[int, str]:
    """Return expected root index and quality using music21 for validation."""
    try:
        symbol = harmony.ChordSymbol(chord_name)
        root_pitch = symbol.root()
    except Exception as exc:  # pragma: no cover - parser can raise different exception types
        raise InvalidChordError(
            f"Unsupported chord '{chord_name}'. Use labels like C, Em, F#, Bb, Am."
        ) from exc

    if root_pitch is None:
        raise InvalidChordError(
            f"Unsupported chord '{chord_name}'. Use labels like C, Em, F#, Bb, Am."
        )

    root = root_pitch.name
    quality = "minor" if "m" in symbol.figure.lower() and "maj" not in symbol.figure.lower() else "major"
    return NOTE_NAMES.index(pitch.Pitch(root).name), quality


def _triad_template(root_index: int, quality: str) -> np.ndarray:
    template = np.zeros(12)
    template[root_index] = 1.0
    if quality == "major":
        template[(root_index + 4) % 12] = 1.0
    else:
        template[(root_index + 3) % 12] = 1.0
    template[(root_index + 7) % 12] = 1.0
    return template


def detect_chord(audio_bytes: bytes, expected_chord: str | None = None) -> ChordResult:
    stream = io.BytesIO(audio_bytes)
    y, sr = librosa.load(stream, sr=22050, mono=True)

    if y.size == 0:
        return ChordResult(name="Unknown", confidence=0.0, tones=[])

    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
    profile = np.mean(chroma, axis=1)
    norm = np.linalg.norm(profile)
    if norm > 0:
        profile = profile / norm

    candidates: list[tuple[str, float, list[str]]] = []
    for i, note in enumerate(NOTE_NAMES):
        for quality in ("major", "minor"):
            template = _triad_template(i, quality)
            template_norm = np.linalg.norm(template)
            score = float(np.dot(profile, template / template_norm))
            tones = [NOTE_NAMES[idx] for idx, v in enumerate(template) if v > 0]
            candidates.append((f"{note}{'m' if quality == 'minor' else ''}", max(score, 0.0), tones))

    detected_name, confidence, tones = max(candidates, key=lambda x: x[1])

    if expected_chord:
        root_index, quality = _parse_expected_chord(expected_chord)
        expected_template = _triad_template(root_index, quality)
        expected_score = float(np.dot(profile, expected_template / np.linalg.norm(expected_template)))
        if expected_score > confidence:
            detected_name = expected_chord
            confidence = expected_score
            tones = [NOTE_NAMES[idx] for idx, v in enumerate(expected_template) if v > 0]

    confidence = float(np.clip(confidence, 0.0, 1.0))
    return ChordResult(name=detected_name, confidence=confidence, tones=tones)


def build_feedback(expected_chord: str, detected: ChordResult) -> tuple[bool, str]:
    expected_clean = expected_chord.strip().lower()
    detected_clean = detected.name.strip().lower()
    is_match = expected_clean == detected_clean

    if is_match:
        return True, "Great job! Your chord matches the target. Keep your strumming even for better consistency."

    feedback = (
        f"You played {detected.name} while target was {expected_chord}. "
        "Try slower transitions, press near frets, and mute unrelated strings."
    )
    return False, feedback
