from __future__ import annotations

from app.data.guitar_lessons import GUITAR_LESSONS
from app.services.music_theory import supported_triads


_DIFFICULTY_RANK = {"easy": 0, "medium": 1, "hard": 2}


def test_guitar_lessons_are_progressive() -> None:
    ranks = [_DIFFICULTY_RANK[lesson["difficulty"]] for lesson in GUITAR_LESSONS]
    assert ranks == sorted(ranks)


def test_guitar_lessons_include_practice_and_tips() -> None:
    for lesson in GUITAR_LESSONS:
        assert lesson["practice"]["play_along_bpm"] > 0
        assert lesson["practice"]["repetitions"] > 0
        assert len(lesson["tips"]) >= 3


def test_supported_triads_contains_major_and_minor_pairs() -> None:
    chords = supported_triads()
    assert len(chords) == 24
    assert "C" in chords
    assert "Cm" in chords
    assert "G#" in chords
    assert "G#m" in chords
