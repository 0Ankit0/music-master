import type { FormEvent } from "react";
import type { SeparationOptions } from "../types/music";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select } from "./ui/select";

type SourceSeparationSectionProps = {
  separateTarget: string;
  separationEngine: string;
  separationOptions: SeparationOptions;
  separationBusy: boolean;
  downloadUrl: string;
  onTargetChange: (value: string) => void;
  onEngineChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function SourceSeparationSection({
  separateTarget,
  separationEngine,
  separationOptions,
  separationBusy,
  downloadUrl,
  onTargetChange,
  onEngineChange,
  onSubmit,
}: SourceSeparationSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Song Instrument / Vocal Extractor</CardTitle>
        <CardDescription>Upload a full track and choose what part to isolate.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="ui-stack" onSubmit={onSubmit}>
          <Label>
            Choose output
            <Select value={separateTarget} onChange={(e) => onTargetChange(e.target.value)}>
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
            </Select>
          </Label>
          <Label>
            Separation engine
            <Select value={separationEngine} onChange={(e) => onEngineChange(e.target.value)}>
              {separationOptions.engines.map((engine) => (
                <option key={engine} value={engine}>
                  {engine === "demucs" ? "Demucs (higher quality)" : "Baseline (fast)"}
                </option>
              ))}
            </Select>
          </Label>
          <Label>
            Upload Song
            <Input name="song_audio" type="file" accept="audio/*" />
          </Label>
          <Button type="submit" disabled={separationBusy}>
            {separationBusy ? "Extracting..." : "Extract"}
          </Button>
        </form>

        {downloadUrl && (
          <p>
            <a className="ui-link" href={downloadUrl} download={`music-master-${separateTarget}.wav`}>
              Download extracted audio
            </a>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
