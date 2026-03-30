"use client";

import { useEffect, useState } from "react";
import { ChordPracticeSection } from "../components/ChordPracticeSection";
import { LessonsSection } from "../components/LessonsSection";
import { SourceSeparationSection } from "../components/SourceSeparationSection";
import {
  evaluateChord,
  getGuitarLessons,
  getMetronome,
  getSeparationOptions,
  getSupportedChords,
  separateSources,
} from "../lib/api";
import type { Lesson, SeparationOptions } from "../types/music";

export default function HomePage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadError, setLoadError] = useState<string>("");

  const [chord, setChord] = useState("Em");
  const [chordResult, setChordResult] = useState<string>("");
  const [chordBusy, setChordBusy] = useState(false);
  const [supportedChords, setSupportedChords] = useState<string[]>([]);

  const [metronomeBpm, setMetronomeBpm] = useState(80);
  const [metronomeBars, setMetronomeBars] = useState(4);
  const [metronomeBusy, setMetronomeBusy] = useState(false);
  const [metronomeUrl, setMetronomeUrl] = useState<string>("");
  const [metronomeError, setMetronomeError] = useState<string>("");

  const [separateTarget, setSeparateTarget] = useState("guitar");
  const [separationEngine, setSeparationEngine] = useState("baseline");
  const [separationOptions, setSeparationOptions] = useState<SeparationOptions>({
    targets: ["guitar", "vocals", "instrumental", "full_mix"],
    engines: ["baseline", "demucs"],
  });
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [separationBusy, setSeparationBusy] = useState(false);

  useEffect(() => {
    getGuitarLessons()
      .then((data) => {
        setLessons(data.lessons);
        setLoadError("");
      })
      .catch((error: Error) => setLoadError(error.message));

    getSeparationOptions()
      .then((data) => setSeparationOptions(data))
      .catch(() => {
        // keep defaults for offline/local development
      });

    getSupportedChords()
      .then((data) => setSupportedChords(data.supported_chords ?? []))
      .catch(() => {
        // keep manual input mode if backend is unavailable
      });

  }, []);

  useEffect(() => {
    return () => {
      if (metronomeUrl) URL.revokeObjectURL(metronomeUrl);
    };
  }, [metronomeUrl]);

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  async function handleGenerateMetronome() {
    setMetronomeBusy(true);
    try {
      if (metronomeUrl) {
        URL.revokeObjectURL(metronomeUrl);
      }
      const blob = await getMetronome(metronomeBpm, metronomeBars);
      setMetronomeUrl(URL.createObjectURL(blob));
      setMetronomeError("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Metronome generation failed.";
      setMetronomeError(message);
    } finally {
      setMetronomeBusy(false);
    }
  }

  async function handleChordCheck(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem("chord_audio") as HTMLInputElement;
    if (!input.files?.[0]) {
      setChordResult("Please upload a short chord recording first.");
      return;
    }

    setChordBusy(true);
    try {
      const result = await evaluateChord(chord, input.files[0]);
      setChordResult(
        `${result.is_match ? "✅ Match" : "❌ Try Again"} | Detected: ${result.detected_chord} | Confidence: ${(result.confidence * 100).toFixed(1)}%\n${result.feedback}\nDetected tones: ${result.detected_tones.join(", ")}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to analyze chord.";
      setChordResult(`Error: ${message}`);
    } finally {
      setChordBusy(false);
    }
  }

  async function handleSeparation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem("song_audio") as HTMLInputElement;
    if (!input.files?.[0]) {
      return;
    }

    setSeparationBusy(true);
    try {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
      const blob = await separateSources(separateTarget, input.files[0], separationEngine);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } finally {
      setSeparationBusy(false);
    }
  }

  return (
    <main>
      <h1>🎸 Music Master</h1>
      <p>Learn guitar step-by-step, validate your played chord, and isolate specific song parts.</p>

      <LessonsSection lessons={lessons} loadError={loadError} />

      <ChordPracticeSection
        metronomeBpm={metronomeBpm}
        metronomeBars={metronomeBars}
        metronomeBusy={metronomeBusy}
        metronomeUrl={metronomeUrl}
        metronomeError={metronomeError}
        chord={chord}
        chordBusy={chordBusy}
        chordResult={chordResult}
        supportedChords={supportedChords}
        onMetronomeBpmChange={setMetronomeBpm}
        onMetronomeBarsChange={setMetronomeBars}
        onGenerateMetronome={handleGenerateMetronome}
        onChordChange={setChord}
        onChordSubmit={handleChordCheck}
      />

      <SourceSeparationSection
        separateTarget={separateTarget}
        separationEngine={separationEngine}
        separationOptions={separationOptions}
        separationBusy={separationBusy}
        downloadUrl={downloadUrl}
        onTargetChange={setSeparateTarget}
        onEngineChange={setSeparationEngine}
        onSubmit={handleSeparation}
      />
    </main>
  );
}
