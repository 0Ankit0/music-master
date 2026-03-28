from __future__ import annotations

from app.data.guitar_lessons import GUITAR_LESSONS
from app.models import GuitarLesson


class LessonService:
    @staticmethod
    def get_guitar_lessons() -> list[GuitarLesson]:
        lessons = [GuitarLesson(**lesson) for lesson in GUITAR_LESSONS]
        difficulty_order = {"easy": 0, "medium": 1, "hard": 2}
        return sorted(lessons, key=lambda lesson: difficulty_order[lesson.difficulty])
