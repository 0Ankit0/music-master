import type { Lesson } from "../types/music";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

type LessonsSectionProps = {
  lessons: Lesson[];
  loadError: string;
  isLoading?: boolean;
};

export function LessonsSection({ lessons, loadError, isLoading = false }: LessonsSectionProps) {
  const difficultyVariant = {
    easy: "secondary",
    medium: "default",
    hard: "outline",
  } as const;

  return (
    <section className="section-block" aria-labelledby="lesson-library">
      <Card>
        <CardHeader>
          <CardTitle id="lesson-library">Structured Guitar Lessons</CardTitle>
          <CardDescription>Sorted from easy to hard so QA can validate the lesson flow predictably.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadError ? <p className="ui-error">Could not load lessons: {loadError}</p> : null}
          {isLoading ? <p>Loading lessons from the backend…</p> : null}
          <div className="lesson-grid">
            {lessons.map((lesson, index) => (
              <article key={lesson.id} className="lesson-card">
                <div className="lesson-meta">
                  <Badge variant={difficultyVariant[lesson.difficulty]}>Step {index + 1}</Badge>
                  <Badge variant="outline">{lesson.difficulty}</Badge>
                </div>
                <h3>{lesson.title}</h3>
                <p>
                  Duration {lesson.duration_minutes} minutes. Practice tempo {lesson.practice.play_along_bpm} BPM.
                </p>
                <div className="lesson-practice">
                  <Badge variant="secondary">{lesson.practice.drill}</Badge>
                  <Badge variant="secondary">{lesson.practice.repetitions} repetitions</Badge>
                </div>
                <strong>Goals</strong>
                <ul className="lesson-list">
                  {lesson.goals.map((goal) => (
                    <li key={goal}>{goal}</li>
                  ))}
                </ul>
                <strong>Tips</strong>
                <ul className="lesson-list">
                  {lesson.tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
