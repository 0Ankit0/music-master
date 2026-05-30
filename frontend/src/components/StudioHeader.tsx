import { Button } from "../../components/ui/button";
import { ThemeToggle } from "../../components/ThemeToggle";

type StudioHeaderProps = {
  apiStatus: string;
};

export function StudioHeader({ apiStatus }: StudioHeaderProps) {
  return (
    <header className="studio-header">
      <div className="hero-copy">
        <p className="eyebrow">{apiStatus}</p>
        <h1>Music Master</h1>
        <p className="hero-description">
          Practice chords, generate metronome tracks, and isolate stems without switching tools.
        </p>
        <div className="hero-actions">
          <Button type="button" variant="default" onClick={() => document.getElementById("practice")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
            Start practicing
          </Button>
          <Button type="button" variant="outline" onClick={() => document.getElementById("qa")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
            Open QA seeds
          </Button>
        </div>
      </div>
      <div className="hero-controls">
        <div className="status-chip">Backend: {apiStatus}</div>
        <ThemeToggle />
      </div>
    </header>
  );
}