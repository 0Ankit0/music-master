import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";

export function WorkflowOverview() {
  return (
    <section className="workflow-grid" aria-label="Workflow overview">
      <Card>
        <CardHeader>
          <CardTitle>1. Load the backend</CardTitle>
          <CardDescription>Confirm the API is available before starting a workflow.</CardDescription>
        </CardHeader>
        <CardContent>Health check, lesson list, chords, and separation options load on startup.</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>2. Practice in time</CardTitle>
          <CardDescription>Generate a click track and compare your recorded chord to the target.</CardDescription>
        </CardHeader>
        <CardContent>Use the sample presets to verify metronome and chord evaluation quickly.</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>3. Separate audio</CardTitle>
          <CardDescription>Pick a stem target and extract a playable WAV response.</CardDescription>
        </CardHeader>
        <CardContent>Target and engine options are hydrated from the live API so they stay in sync.</CardContent>
      </Card>
    </section>
  );
}