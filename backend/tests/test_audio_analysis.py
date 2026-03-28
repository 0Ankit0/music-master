from __future__ import annotations

import io

import pytest

np = pytest.importorskip("numpy")
sf = pytest.importorskip("soundfile")
audio_analysis = pytest.importorskip("app.services.audio_analysis")
play_along = pytest.importorskip("app.services.play_along")

InvalidChordError = audio_analysis.InvalidChordError
detect_chord = audio_analysis.detect_chord
generate_metronome_track = play_along.generate_metronome_track


def _sine(freq: float, sr: int, duration: float) -> np.ndarray:
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    return np.sin(2 * np.pi * freq * t)


def test_detect_c_major_triad() -> None:
    sr = 22050
    duration = 2.0
    signal = (
        0.4 * _sine(261.63, sr, duration)
        + 0.4 * _sine(329.63, sr, duration)
        + 0.4 * _sine(392.00, sr, duration)
    )

    wav = io.BytesIO()
    sf.write(wav, signal, sr, format="WAV")

    result = detect_chord(wav.getvalue(), expected_chord="C")
    assert result.name.lower().startswith("c")
    assert result.confidence > 0.5


def test_invalid_expected_chord_raises() -> None:
    sr = 22050
    duration = 0.5
    signal = 0.4 * _sine(440.0, sr, duration)
    wav = io.BytesIO()
    sf.write(wav, signal, sr, format="WAV")

    with pytest.raises(InvalidChordError):
        detect_chord(wav.getvalue(), expected_chord="NotAChord")


def test_generate_metronome_returns_wav_bytes() -> None:
    wav_bytes = generate_metronome_track(bpm=80, bars=2)
    assert wav_bytes[:4] == b"RIFF"


def test_generate_metronome_rejects_invalid_bpm() -> None:
    with pytest.raises(ValueError):
        generate_metronome_track(bpm=10, bars=4)
