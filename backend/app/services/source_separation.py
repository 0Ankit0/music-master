from __future__ import annotations

import io
import shutil
import subprocess
import tempfile
from pathlib import Path

import librosa
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

SUPPORTED_TARGETS = {"guitar", "vocals", "instrumental", "full_mix"}
SUPPORTED_ENGINES = {"baseline", "demucs"}


def _band_pass(signal: np.ndarray, sr: int, low_hz: float, high_hz: float) -> np.ndarray:
    sos = butter(4, [low_hz, high_hz], btype="bandpass", fs=sr, output="sos")
    return sosfilt(sos, signal)


def _separate_baseline(audio_bytes: bytes, target: str) -> tuple[bytes, int]:
    y, sr = librosa.load(io.BytesIO(audio_bytes), sr=44100, mono=True)

    if target == "full_mix":
        output = y
    else:
        harmonic, percussive = librosa.effects.hpss(y)
        instrumental = harmonic + 0.35 * percussive
        vocals = y - harmonic

        if target == "instrumental":
            output = instrumental
        elif target == "vocals":
            output = vocals
        elif target == "guitar":
            output = _band_pass(instrumental, sr=sr, low_hz=80, high_hz=1200)
        else:
            raise ValueError(f"Unsupported target: {target}")

    output = np.clip(output, -1.0, 1.0)
    wav_buffer = io.BytesIO()
    sf.write(wav_buffer, output, sr, format="WAV")
    wav_buffer.seek(0)
    return wav_buffer.read(), sr


def _separate_demucs(audio_bytes: bytes, target: str) -> tuple[bytes, int]:
    if shutil.which("python") is None:
        raise ValueError("Python executable not found for demucs execution")

    with tempfile.TemporaryDirectory(prefix="music-master-demucs-") as tmpdir:
        base_dir = Path(tmpdir)
        in_path = base_dir / "input.wav"
        out_dir = base_dir / "out"
        in_path.write_bytes(audio_bytes)

        cmd = [
            "python",
            "-m",
            "demucs.separate",
            "-n",
            "htdemucs",
            "--two-stems",
            "vocals",
            "-o",
            str(out_dir),
            str(in_path),
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise ValueError(
                "Demucs separation failed. Install optional dependencies with `uv sync --extra ml` in backend/ "
                f"and ensure ffmpeg is available. stderr: {result.stderr.strip()}"
            )

        stems_root = out_dir / "htdemucs" / in_path.stem
        vocals_path = stems_root / "vocals.wav"
        no_vocals_path = stems_root / "no_vocals.wav"

        if target == "vocals":
            stem_path = vocals_path
        elif target in {"instrumental", "guitar"}:
            stem_path = no_vocals_path
        elif target == "full_mix":
            stem_path = in_path
        else:
            raise ValueError(f"Unsupported target: {target}")

        if not stem_path.exists():
            raise ValueError("Expected demucs stem file not generated")

        y, sr = sf.read(stem_path)
        if y.ndim > 1:
            y = np.mean(y, axis=1)

        if target == "guitar":
            y = _band_pass(y, sr=sr, low_hz=80, high_hz=1200)

        wav_buffer = io.BytesIO()
        sf.write(wav_buffer, np.clip(y, -1.0, 1.0), sr, format="WAV")
        wav_buffer.seek(0)
        return wav_buffer.read(), sr


def separate_signal(audio_bytes: bytes, target: str, engine: str = "baseline") -> tuple[bytes, int]:
    if target not in SUPPORTED_TARGETS:
        raise ValueError(f"Unsupported target: {target}")
    if engine not in SUPPORTED_ENGINES:
        raise ValueError(f"Unsupported engine: {engine}")

    if engine == "demucs":
        return _separate_demucs(audio_bytes=audio_bytes, target=target)

    return _separate_baseline(audio_bytes=audio_bytes, target=target)
