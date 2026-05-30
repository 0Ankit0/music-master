import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { qaSeed } from "../data/qaSeed";

export function QASeedPanel() {
  return (
    <section id="qa" className="section-block">
      <Card>
        <CardHeader>
          <CardTitle>Reusable QA seed data</CardTitle>
          <CardDescription>Keep these values handy for repeated manual checks and demos.</CardDescription>
        </CardHeader>
        <CardContent className="seed-layout">
          <div className="seed-grid">
            {qaSeed.presets.map((preset) => (
              <article key={preset.name} className="seed-card">
                <Badge variant="secondary">Preset</Badge>
                <h3>{preset.name}</h3>
                <p>
                  Expected chord {preset.expectedChord}, {preset.bpm} BPM, {preset.bars} bars, target {preset.target}, engine {preset.engine}.
                </p>
              </article>
            ))}
          </div>

          <div className="checklist">
            {qaSeed.checks.map((check) => (
              <div key={check.name} className="check-row">
                <div>
                  <strong>{check.name}</strong>
                  <p>{check.path}</p>
                </div>
                <span>{check.method}</span>
                <span>{check.expected}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}