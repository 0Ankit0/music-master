export const qaSeed = {
  hero: {
    label: "Vite + React",
    title: "Music Master",
    subtitle:
      "Chord practice, metronome playback, and track separation in one focused workflow.",
  },
  checks: [
    {
      name: "Health",
      method: "GET",
      path: "/api/health",
      expected: '{"status":"ok"}',
    },
    {
      name: "Lessons",
      method: "GET",
      path: "/api/lessons/guitar",
      expected: "5 lessons sorted by difficulty",
    },
    {
      name: "Supported chords",
      method: "GET",
      path: "/api/chords/supported",
      expected: "24 triads in the datalist",
    },
    {
      name: "Metronome",
      method: "GET",
      path: "/api/play-along/metronome?bpm=80&bars=2",
      expected: "audio/wav with download filename",
    },
    {
      name: "Chord analysis",
      method: "POST",
      path: "/api/chords/evaluate",
      expected: "C major seed sample returns a match",
    },
    {
      name: "Separation options",
      method: "GET",
      path: "/api/songs/separate/options",
      expected: "targets and engines are populated",
    },
    {
      name: "Song separation",
      method: "POST",
      path: "/api/songs/separate",
      expected: "audio/wav download is returned",
    },
  ],
  presets: [
    {
      name: "C major smoke test",
      expectedChord: "C",
      bpm: 80,
      bars: 2,
      target: "guitar",
      engine: "baseline",
    },
    {
      name: "Em practice loop",
      expectedChord: "Em",
      bpm: 70,
      bars: 4,
      target: "vocals",
      engine: "baseline",
    },
  ],
} as const;