import type { Lesson } from "../types/music";

type LessonsSectionProps = {
  lessons: Lesson[];
  loadError: string;
};

export function LessonsSection({ lessons, loadError }: LessonsSectionProps) {
  return (
    <section>
      <h2>Structured Guitar Lessons (Easy → Hard)</h2>
      {loadError ? <p>Could not load lessons: {loadError}</p> : null}
      {lessons.map((lesson, index) => (
        <article key={lesson.id}>
          <h3>
            Step {index + 1}: {lesson.title} <small>({lesson.difficulty})</small>
          </h3>
          <p>
            Duration: {lesson.duration_minutes} mins | Play Along BPM: {lesson.practice.play_along_bpm}
          </p>
          <strong>Goals</strong>
          <ul>{lesson.goals.map((goal) => <li key={goal}>{goal}</li>)}</ul>
          <strong>Practice</strong>
          <p>
            {lesson.practice.drill} × {lesson.practice.repetitions}
          </p>
          <strong>Tips & tricks</strong>
          <ul>{lesson.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
        </article>
      ))}
    </section>
  );
}
