import { useEffect, useState, type FormEvent } from "react";
import { ChordPracticeSection } from "../components/ChordPracticeSection";
import { LessonsSection } from "../components/LessonsSection";
import { SourceSeparationSection } from "../components/SourceSeparationSection";
import { evaluateChord, getGuitarLessons, getHealth, getMetronome, getSeparationOptions, getSupportedChords, separateSources } from "../lib/api";
import type { Lesson, SeparationOptions } from "../types/music";
import { StudioHeader } from "./components/StudioHeader";
import { WorkflowOverview } from "./components/WorkflowOverview";
import { QASeedPanel } from "./components/QASeedPanel";
import { qaSeed } from "./data/qaSeed";

type StudioTab = "overview" | "practice" | "lessons" | "qa";

const studioTabs: Array<{ id: StudioTab; label: string; description: string }> = [
  { id: "overview", label: "Overview", description: "What this workspace covers" },
  { id: "practice", label: "Practice", description: "Metronome, chord check, separation" },
  { id: "lessons", label: "Lessons", description: "Guitar lesson ladder" },
  { id: "qa", label: "QA", description: "Seed values and smoke tests" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<StudioTab>("overview");
  const [apiStatus, setApiStatus] = useState("connecting");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonError, setLessonError] = useState("");
  const [lessonLoading, setLessonLoading] = useState(true);

  const [chord, setChord] = useState(qaSeed.presets[0].expectedChord);
  const [chordResult, setChordResult] = useState<string>("");
  const [chordBusy, setChordBusy] = useState(false);
  const [supportedChords, setSupportedChords] = useState<string[]>([]);

  const [metronomeBpm, setMetronomeBpm] = useState(qaSeed.presets[0].bpm);
  const [metronomeBars, setMetronomeBars] = useState(qaSeed.presets[0].bars);
  const [metronomeBusy, setMetronomeBusy] = useState(false);
  const [metronomeUrl, setMetronomeUrl] = useState<string>("");
  const [metronomeError, setMetronomeError] = useState<string>("");

  const [separateTarget, setSeparateTarget] = useState(qaSeed.presets[0].target);
  const [separationEngine, setSeparationEngine] = useState(qaSeed.presets[0].engine);
  const [separationOptions, setSeparationOptions] = useState<SeparationOptions>({
    targets: ["guitar", "vocals", "instrumental", "full_mix"],
    engines: ["baseline", "demucs"],
  });
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [separationBusy, setSeparationBusy] = useState(false);

  useEffect(() => {
    getHealth()
      .then(() => setApiStatus("online"))
      .catch(() => setApiStatus("offline"));

    getGuitarLessons()
      .then((data) => setLessons(data.lessons))
      .catch((error) => {
        setLessonError(error instanceof Error ? error.message : "Could not load lessons.");
      })
      .finally(() => setLessonLoading(false));

    getSeparationOptions()
      .then((data) => setSeparationOptions(data))
      .catch(() => {
        // Keep defaults when the backend is unavailable.
      });

    getSupportedChords()
      .then((data) => setSupportedChords(data.supported_chords ?? []))
      .catch(() => {
        // Keep manual input mode if the backend is unavailable.
      });
  }, []);

  useEffect(() => {
    return () => {
      if (metronomeUrl) {
        URL.revokeObjectURL(metronomeUrl);
      }
    };
  }, [metronomeUrl]);

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
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

  async function handleChordCheck(event: FormEvent<HTMLFormElement>) {
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

  async function handleSeparation(event: FormEvent<HTMLFormElement>) {
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
      setDownloadUrl(URL.createObjectURL(blob));
    } finally {
      setSeparationBusy(false);
    }
  }

  return (
    <main className="studio-shell">
      <StudioHeader apiStatus={apiStatus} />

      <div className="studio-tabs" role="tablist" aria-label="Music Master sections">
        {studioTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            className={`studio-tab${activeTab === tab.id ? " studio-tab--active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.label}</span>
            <small>{tab.description}</small>
          </button>
        ))}
      </div>

      <section
        id="panel-overview"
        role="tabpanel"
        aria-labelledby="tab-overview"
        className={`section-block studio-panel${activeTab === "overview" ? " studio-panel--active" : ""}`}
        hidden={activeTab !== "overview"}
      >
        <WorkflowOverview />
      </section>

      <section
        id="panel-practice"
        role="tabpanel"
        aria-labelledby="tab-practice"
        className={`studio-panel${activeTab === "practice" ? " studio-panel--active" : ""}`}
        hidden={activeTab !== "practice"}
      >
        <div className="section-block">
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
        </div>

        <div className="section-block">
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
        </div>
      </section>

      <section
        id="panel-lessons"
        role="tabpanel"
        aria-labelledby="tab-lessons"
        className={`studio-panel${activeTab === "lessons" ? " studio-panel--active" : ""}`}
        hidden={activeTab !== "lessons"}
      >
        <LessonsSection lessons={lessons} loadError={lessonError} isLoading={lessonLoading} />
      </section>

      <section
        id="panel-qa"
        role="tabpanel"
        aria-labelledby="tab-qa"
        className={`studio-panel${activeTab === "qa" ? " studio-panel--active" : ""}`}
        hidden={activeTab !== "qa"}
      >
        <QASeedPanel />
      </section>
    </main>
  );
}