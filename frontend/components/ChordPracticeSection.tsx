import type { FormEvent } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

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
    <Card>
      <CardHeader>
        <CardTitle>Play Along + Chord Accuracy Check</CardTitle>
        <CardDescription>Create a metronome track first, then record your chord in time and upload it.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="ui-grid ui-grid--3">
          <Label>
            BPM
            <Input
              type="number"
              min={40}
              max={220}
              value={metronomeBpm}
              onChange={(e) => onMetronomeBpmChange(Number(e.target.value))}
            />
          </Label>
          <Label>
            Bars
            <Input
              type="number"
              min={1}
              max={64}
              value={metronomeBars}
              onChange={(e) => onMetronomeBarsChange(Number(e.target.value))}
            />
          </Label>
          <div className="ui-row-end">
            <Button type="button" onClick={onGenerateMetronome} disabled={metronomeBusy}>
              {metronomeBusy ? "Generating..." : "Generate Metronome"}
            </Button>
          </div>
        </div>

        {metronomeError ? <p className="ui-error">Error: {metronomeError}</p> : null}
        {metronomeUrl ? (
          <div className="ui-stack-sm">
            <audio controls src={metronomeUrl} />
            <a className="ui-link" href={metronomeUrl} download={`metronome-${metronomeBpm}bpm-${metronomeBars}bars.wav`}>
              Download metronome WAV
            </a>
          </div>
        ) : null}

        <form className="ui-stack" onSubmit={onChordSubmit}>
          <Label>
            Expected Chord
            <Input
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
          </Label>
          <Label>
            Upload your chord recording (WAV/MP3)
            <Input name="chord_audio" type="file" accept="audio/*" />
          </Label>
          <Button type="submit" disabled={chordBusy}>
            {chordBusy ? "Analyzing..." : "Analyze Chord"}
          </Button>
        </form>

        {chordResult && <pre className="ui-result">{chordResult}</pre>}
      </CardContent>
    </Card>
  );
}
