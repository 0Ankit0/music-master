export type Lesson = {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  duration_minutes: number;
  goals: string[];
  tips: string[];
  practice: {
    drill: string;
    play_along_bpm: number;
    repetitions: number;
  };
};

export type ChordEvaluation = {
  expected_chord: string;
  detected_chord: string;
  confidence: number;
  is_match: boolean;
  feedback: string;
  detected_tones: string[];
};

export type SeparationOptions = {
  targets: string[];
  engines: string[];
};
