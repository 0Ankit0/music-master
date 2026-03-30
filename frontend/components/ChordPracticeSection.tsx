import type { FormEvent } from "react";

type ChordPracticeSectionProps = {
  metronomeBpm: number;
  metronomeBars: number;
  metronomeBusy: boolean;
  metronomeUrl: string;
  metronomeError: string;
  chord: string;
  chordBusy: boolean;
  chordResult: string;
  supportedChords: string[];
  onMetronomeBpmChange: (value: number) => void;
  onMetronomeBarsChange: (value: number) => void;
  onGenerateMetronome: () => void;
  onChordChange: (value: string) => void;
  onChordSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ChordPracticeSection({
  metronomeBpm,
  metronomeBars,
  metronomeBusy,
  metronomeUrl,
  metronomeError,
  chord,
  chordBusy,
  chordResult,
  supportedChords,
  onMetronomeBpmChange,
  onMetronomeBarsChange,
  onGenerateMetronome,
  onChordChange,
  onChordSubmit,
}: ChordPracticeSectionProps) {
  return (
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
            onChange={(e) => onMetronomeBpmChange(Number(e.target.value))}
          />
        </label>
        <label>
          Bars
          <input
            type="number"
            min={1}
            max={64}
            value={metronomeBars}
            onChange={(e) => onMetronomeBarsChange(Number(e.target.value))}
          />
        </label>
        <button type="button" onClick={onGenerateMetronome} disabled={metronomeBusy}>
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

      <form onSubmit={onChordSubmit}>
        <label>
          Expected Chord
          <input
            value={chord}
            onChange={(e) => onChordChange(e.target.value)}
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
        <button type="submit" disabled={chordBusy}>
          {chordBusy ? "Analyzing..." : "Analyze Chord"}
        </button>
      </form>

      {chordResult && <pre>{chordResult}</pre>}
    </section>
  );
}
