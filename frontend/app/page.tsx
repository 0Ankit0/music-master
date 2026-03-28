"use client";

import { useEffect, useState } from "react";
import {
  evaluateChord,
  getGuitarLessons,
  getMetronome,
  getSeparationOptions,
  getSupportedChords,
  separateSources,
} from "../lib/api";

type Lesson = {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  duration_minutes: number;
  goals: string[];
  tips: string[];
  practice: {
    drill: string;
    play_along_bpm: number;
    repetitions: number;
  };
};

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
  const [separationOptions, setSeparationOptions] = useState<{ targets: string[]; engines: string[] }>({
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

      <section>
        <h2>Structured Guitar Lessons (Easy → Hard)</h2>
        {loadError ? <p>Could not load lessons: {loadError}</p> : null}
        {lessons.map((lesson, index) => (
          <article key={lesson.id}>
            <h3>
              Step {index + 1}: {lesson.title} <small>({lesson.difficulty})</small>
            </h3>
            <p>
              Duration: {lesson.duration_minutes} mins | Play Along BPM: {lesson.practice.play_along_bpm}
            </p>
            <strong>Goals</strong>
            <ul>{lesson.goals.map((goal) => <li key={goal}>{goal}</li>)}</ul>
            <strong>Practice</strong>
            <p>
              {lesson.practice.drill} × {lesson.practice.repetitions}
            </p>
            <strong>Tips & tricks</strong>
            <ul>{lesson.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
          </article>
        ))}
      </section>

      <section>
        <h2>Play Along + Chord Accuracy Check</h2>
        <p>Create a metronome track first, then record your chord in time and upload it.</p>
        <div>
          <label>
            BPM
            <input
              type="number"
              min={40}
              max={220}
              value={metronomeBpm}
              onChange={(e) => setMetronomeBpm(Number(e.target.value))}
            />
          </label>
          <label>
            Bars
            <input
              type="number"
              min={1}
              max={64}
              value={metronomeBars}
              onChange={(e) => setMetronomeBars(Number(e.target.value))}
            />
          </label>
          <button type="button" onClick={handleGenerateMetronome} disabled={metronomeBusy}>
            {metronomeBusy ? "Generating..." : "Generate Metronome"}
          </button>
        </div>
        {metronomeError ? <p>Error: {metronomeError}</p> : null}
        {metronomeUrl ? (
          <div>
            <audio controls src={metronomeUrl} />
            <p>
              <a href={metronomeUrl} download={`metronome-${metronomeBpm}bpm-${metronomeBars}bars.wav`}>
                Download metronome WAV
              </a>
            </p>
          </div>
        ) : null}

        <form onSubmit={handleChordCheck}>
          <label>
            Expected Chord
            <input
              value={chord}
              onChange={(e) => setChord(e.target.value)}
              placeholder="Ex: Em, C, F#, Bb"
              list="supported-chords"
            />
            <datalist id="supported-chords">
              {supportedChords.map((chordOption) => (
                <option key={chordOption} value={chordOption} />
              ))}
            </datalist>
          </label>
          <br />
          <label>
            Upload your chord recording (WAV/MP3)
            <input name="chord_audio" type="file" accept="audio/*" />
          </label>
          <br />
          <button type="submit" disabled={chordBusy}>{chordBusy ? "Analyzing..." : "Analyze Chord"}</button>
        </form>
        {chordResult && <pre>{chordResult}</pre>}
      </section>

      <section>
        <h2>Song Instrument / Vocal Extractor</h2>
        <form onSubmit={handleSeparation}>
          <label>
            Choose output
            <select value={separateTarget} onChange={(e) => setSeparateTarget(e.target.value)}>
              {separationOptions.targets.map((target) => (
                <option key={target} value={target}>
                  {target === "guitar"
                    ? "Guitar only"
                    : target === "vocals"
                      ? "Vocals only"
                      : target === "instrumental"
                        ? "All instruments (no vocals)"
                        : "Original full mix"}
                </option>
              ))}
            </select>
          </label>
          <br />
          <label>
            Separation engine
            <select value={separationEngine} onChange={(e) => setSeparationEngine(e.target.value)}>
              {separationOptions.engines.map((engine) => (
                <option key={engine} value={engine}>
                  {engine === "demucs" ? "Demucs (higher quality)" : "Baseline (fast)"}
                </option>
              ))}
            </select>
          </label>
          <br />
          <label>
            Upload Song
            <input name="song_audio" type="file" accept="audio/*" />
          </label>
          <br />
          <button type="submit" disabled={separationBusy}>{separationBusy ? "Extracting..." : "Extract"}</button>
        </form>
        {downloadUrl && (
          <p>
            <a href={downloadUrl} download={`music-master-${separateTarget}.wav`}>
              Download extracted audio
            </a>
          </p>
        )}
      </section>
    </main>
  );
}
