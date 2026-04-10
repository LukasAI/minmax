export type BodyPart =
  | "chest"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "forearms"
  | "abs"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "lats"
  | "upper back";

export type RegionGroup = "upper" | "lower";

export interface WorkoutTemplate {
  id: string;
  name: string;
  displayOrder: number;
}

export interface ExerciseTemplate {
  id: string;
  workoutTemplateId: string;
  exerciseName: string;
  bodyPart: BodyPart;
  regionGroup: RegionGroup;
  defaultSetCount: number;
  displayOrder: number;
}

export type AutosaveState = "Saving..." | "Saved" | "Offline Draft" | "Syncing...";

export interface ExerciseLogInput {
  exerciseTemplateId: string;
  weight: number | null;
  reps: number | null;
}

export interface StoredWorkoutDraft {
  workoutTemplateId: string;
  logDate: string;
  entries: Record<string, { weight: string; reps: string }>;
  updatedAt: string;
}

export interface StoredWorkoutHistory {
  id: string;
  workoutTemplateId: string;
  logDate: string;
  isDraft: boolean;
  entries: Array<{
    exerciseTemplateId: string;
    weight: number | null;
    reps: number | null;
    tonnage: number;
    skipped: boolean;
  }>;
  totalTonnage: number;
}
