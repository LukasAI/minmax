from dataclasses import dataclass


@dataclass(frozen=True)
class WorkoutTemplate:
    id: str
    name: str
    display_order: int


@dataclass(frozen=True)
class ExerciseTemplate:
    id: str
    workout_template_id: str
    exercise_name: str
    body_part: str
    region_group: str
    default_set_count: int
    display_order: int


WORKOUT_TEMPLATES = [
    WorkoutTemplate("upper-1", "Upper 1", 1),
    WorkoutTemplate("lower-1", "Lower 1", 2),
    WorkoutTemplate("upper-2", "Upper 2", 3),
    WorkoutTemplate("lower-2", "Lower 2", 4),
    WorkoutTemplate("arms-delts", "Arms + Delts", 5),
]

EXERCISE_TEMPLATES = [
    ExerciseTemplate("u1-1", "upper-1", "Barbell Incline Press", "chest", "upper", 2, 1),
    ExerciseTemplate("u1-2", "upper-1", "Pec Deck", "chest", "upper", 2, 2),
    ExerciseTemplate("u1-3", "upper-1", "Wide Grip Pulldown", "lats", "upper", 2, 3),
    ExerciseTemplate("l1-1", "lower-1", "Back Squat", "quads", "lower", 3, 1),
    ExerciseTemplate("l1-2", "lower-1", "Romanian Deadlift", "hamstrings", "lower", 2, 2),
    ExerciseTemplate("u2-1", "upper-2", "Flat Dumbbell Press", "chest", "upper", 2, 1),
    ExerciseTemplate("u2-2", "upper-2", "Chest Supported Row", "upper back", "upper", 2, 2),
    ExerciseTemplate("l2-1", "lower-2", "Leg Press", "quads", "lower", 3, 1),
    ExerciseTemplate("l2-2", "lower-2", "Seated Leg Curl", "hamstrings", "lower", 2, 2),
    ExerciseTemplate("a1", "arms-delts", "EZ Bar Preacher Curl", "biceps", "upper", 2, 1),
    ExerciseTemplate("a2", "arms-delts", "Cable Pressdown", "triceps", "upper", 2, 2),
    ExerciseTemplate("a3", "arms-delts", "Dumbbell Lateral Raise", "shoulders", "upper", 3, 3),
]
