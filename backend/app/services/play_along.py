from __future__ import annotations

import io

import numpy as np
import soundfile as sf


def generate_metronome_track(
    bpm: int,
    bars: int = 4,
    beats_per_bar: int = 4,
    sample_rate: int = 44100,
) -> bytes:
    if bpm < 40 or bpm > 220:
        raise ValueError("BPM must be between 40 and 220")
    if bars < 1 or bars > 64:
        raise ValueError("Bars must be between 1 and 64")

    total_beats = bars * beats_per_bar
    seconds_per_beat = 60.0 / bpm
    duration_seconds = total_beats * seconds_per_beat
    total_samples = int(duration_seconds * sample_rate)

    y = np.zeros(total_samples, dtype=np.float32)
    click_duration = int(0.03 * sample_rate)

    def _click(frequency: float, amplitude: float) -> np.ndarray:
        t = np.linspace(0, click_duration / sample_rate, click_duration, endpoint=False)
        envelope = np.exp(-35 * t)
        return (amplitude * np.sin(2 * np.pi * frequency * t) * envelope).astype(np.float32)

    strong_click = _click(1760.0, 0.9)
    weak_click = _click(1200.0, 0.6)

    for beat_idx in range(total_beats):
        start = int(beat_idx * seconds_per_beat * sample_rate)
        click = strong_click if beat_idx % beats_per_bar == 0 else weak_click
        end = min(start + click.size, total_samples)
        y[start:end] += click[: end - start]

    y = np.clip(y, -1.0, 1.0)
    wav_buffer = io.BytesIO()
    sf.write(wav_buffer, y, sample_rate, format="WAV")
    wav_buffer.seek(0)
    return wav_buffer.read()
