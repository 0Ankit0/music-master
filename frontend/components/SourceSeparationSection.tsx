import type { FormEvent } from "react";
import type { SeparationOptions } from "../types/music";

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
    <section>
      <h2>Song Instrument / Vocal Extractor</h2>
      <form onSubmit={onSubmit}>
        <label>
          Choose output
          <select value={separateTarget} onChange={(e) => onTargetChange(e.target.value)}>
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
          <select value={separationEngine} onChange={(e) => onEngineChange(e.target.value)}>
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
        <button type="submit" disabled={separationBusy}>
          {separationBusy ? "Extracting..." : "Extract"}
        </button>
      </form>
      {downloadUrl && (
        <p>
          <a href={downloadUrl} download={`music-master-${separateTarget}.wav`}>
            Download extracted audio
          </a>
        </p>
      )}
    </section>
  );
}
