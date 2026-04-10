import { ExerciseTemplate } from "@/lib/types";

export function calculateExerciseTonnage(weight: number | null, reps: number | null, setCount: number) {
  if (!weight || !reps) return 0;
  return weight * reps * setCount;
}

export function calculateWorkoutTonnage(
  entries: Array<{ exerciseTemplateId: string; weight: number | null; reps: number | null }>,
  templateRows: ExerciseTemplate[]
) {
  return entries.reduce((sum, row) => {
    const match = templateRows.find((t) => t.id === row.exerciseTemplateId);
    if (!match) return sum;
    return sum + calculateExerciseTonnage(row.weight, row.reps, match.defaultSetCount);
  }, 0);
}
