from __future__ import annotations

NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]


def supported_triads() -> list[str]:
    chords: list[str] = []
    for note in NOTE_NAMES:
        chords.append(note)
        chords.append(f"{note}m")
    return chords
