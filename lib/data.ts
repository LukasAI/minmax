import { ExerciseTemplate, WorkoutTemplate } from "@/lib/types";

export const workoutTemplates: WorkoutTemplate[] = [
  { id: "upper-1", name: "Upper 1", displayOrder: 1 },
  { id: "lower-1", name: "Lower 1", displayOrder: 2 },
  { id: "upper-2", name: "Upper 2", displayOrder: 3 },
  { id: "lower-2", name: "Lower 2", displayOrder: 4 },
  { id: "arms-delts", name: "Arms + Delts", displayOrder: 5 }
];

export const exerciseTemplates: ExerciseTemplate[] = [
  { id: "u1-1", workoutTemplateId: "upper-1", exerciseName: "Barbell Incline Press", bodyPart: "chest", regionGroup: "upper", defaultSetCount: 2, displayOrder: 1 },
  { id: "u1-2", workoutTemplateId: "upper-1", exerciseName: "Pec Deck", bodyPart: "chest", regionGroup: "upper", defaultSetCount: 2, displayOrder: 2 },
  { id: "u1-3", workoutTemplateId: "upper-1", exerciseName: "Wide Grip Pulldown", bodyPart: "lats", regionGroup: "upper", defaultSetCount: 2, displayOrder: 3 },
  { id: "l1-1", workoutTemplateId: "lower-1", exerciseName: "Back Squat", bodyPart: "quads", regionGroup: "lower", defaultSetCount: 3, displayOrder: 1 },
  { id: "l1-2", workoutTemplateId: "lower-1", exerciseName: "Romanian Deadlift", bodyPart: "hamstrings", regionGroup: "lower", defaultSetCount: 2, displayOrder: 2 },
  { id: "u2-1", workoutTemplateId: "upper-2", exerciseName: "Flat Dumbbell Press", bodyPart: "chest", regionGroup: "upper", defaultSetCount: 2, displayOrder: 1 },
  { id: "u2-2", workoutTemplateId: "upper-2", exerciseName: "Chest Supported Row", bodyPart: "upper back", regionGroup: "upper", defaultSetCount: 2, displayOrder: 2 },
  { id: "l2-1", workoutTemplateId: "lower-2", exerciseName: "Leg Press", bodyPart: "quads", regionGroup: "lower", defaultSetCount: 3, displayOrder: 1 },
  { id: "l2-2", workoutTemplateId: "lower-2", exerciseName: "Seated Leg Curl", bodyPart: "hamstrings", regionGroup: "lower", defaultSetCount: 2, displayOrder: 2 },
  { id: "a1", workoutTemplateId: "arms-delts", exerciseName: "EZ Bar Preacher Curl", bodyPart: "biceps", regionGroup: "upper", defaultSetCount: 2, displayOrder: 1 },
  { id: "a2", workoutTemplateId: "arms-delts", exerciseName: "Cable Pressdown", bodyPart: "triceps", regionGroup: "upper", defaultSetCount: 2, displayOrder: 2 },
  { id: "a3", workoutTemplateId: "arms-delts", exerciseName: "Dumbbell Lateral Raise", bodyPart: "shoulders", regionGroup: "upper", defaultSetCount: 3, displayOrder: 3 }
];
