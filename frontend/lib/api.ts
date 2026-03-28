const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

async function assertOk(res: Response, fallbackMessage: string): Promise<void> {
  if (res.ok) return;
  const text = await res.text();
  let detail = text;

  try {
    const parsed = JSON.parse(text) as { detail?: string };
    detail = parsed.detail ?? text;
  } catch {
    // keep plain text
  }

  throw new Error(detail || fallbackMessage);
}

export async function getGuitarLessons() {
  const res = await fetch(`${API_BASE}/api/lessons/guitar`, { cache: "no-store" });
  await assertOk(res, "Failed to load lessons");
  return res.json();
}

export async function evaluateChord(expectedChord: string, audioFile: File) {
  const formData = new FormData();
  formData.append("expected_chord", expectedChord);
  formData.append("audio_file", audioFile);

  const res = await fetch(`${API_BASE}/api/chords/evaluate`, {
    method: "POST",
    body: formData,
  });

  await assertOk(res, "Chord evaluation failed");
  return res.json();
}

export async function separateSources(target: string, audioFile: File, engine: string = "baseline") {
  const formData = new FormData();
  formData.append("target", target);
  formData.append("audio_file", audioFile);
  formData.append("engine", engine);

  const res = await fetch(`${API_BASE}/api/songs/separate`, {
    method: "POST",
    body: formData,
  });

  await assertOk(res, "Source separation failed");
  return res.blob();
}


export async function getMetronome(bpm: number, bars: number) {
  const params = new URLSearchParams({ bpm: String(bpm), bars: String(bars) });
  const res = await fetch(`${API_BASE}/api/play-along/metronome?${params.toString()}`);
  await assertOk(res, "Metronome generation failed");
  return res.blob();
}


export async function getSeparationOptions() {
  const res = await fetch(`${API_BASE}/api/songs/separate/options`, { cache: "no-store" });
  await assertOk(res, "Failed to load separation options");
  return res.json();
}


export async function getSupportedChords() {
  const res = await fetch(`${API_BASE}/api/chords/supported`, { cache: "no-store" });
  await assertOk(res, "Failed to load supported chords");
  return res.json();
}
