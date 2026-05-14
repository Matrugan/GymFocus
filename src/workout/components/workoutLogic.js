export const workoutDayOptions = [
  "Treino A",
  "Treino B",
  "Treino C",
  "Treino D",
  "Treino E",
  "Full Body",
];

export function getWorkoutDateKey(workoutDate) {
  if (!workoutDate) {
    return "";
  }

  return String(workoutDate).split("T")[0];
}

export function sortWorkoutLogs(logs = []) {
  return [...logs].sort((a, b) => {
    const dateA = getWorkoutDateKey(a.workout_date);
    const dateB = getWorkoutDateKey(b.workout_date);

    if (dateA !== dateB) {
      return dateB.localeCompare(dateA);
    }

    return String(b.created_at || "").localeCompare(String(a.created_at || ""));
  });
}

export function getOrderedWorkoutDaysFromExercises(exercises = []) {
  const daysFromExercises = exercises.map(
    (exercise) => exercise.workout_day || "Treino A",
  );

  const uniqueDays = [...new Set(daysFromExercises)];

  return workoutDayOptions.filter((day) => uniqueDays.includes(day));
}

export function getNextWorkoutDayAfter(day, exercises = []) {
  const orderedDays = getOrderedWorkoutDaysFromExercises(exercises);

  if (orderedDays.length === 0) {
    return "Treino A";
  }

  const currentIndex = orderedDays.indexOf(day);

  if (currentIndex === -1) {
    return orderedDays[0];
  }

  const nextIndex = (currentIndex + 1) % orderedDays.length;

  return orderedDays[nextIndex];
}

export function getCurrentWorkoutDay(exercises = [], logs = []) {
  const orderedDays = getOrderedWorkoutDaysFromExercises(exercises);

  if (orderedDays.length === 0) {
    return "Treino A";
  }

  const sortedLogs = sortWorkoutLogs(logs);

  const validLogs = sortedLogs.filter((log) => {
    const status = log.status || "completed";

    return (
      orderedDays.includes(log.workout_day) &&
      ["completed", "skipped"].includes(status)
    );
  });

  if (validLogs.length === 0) {
    return orderedDays[0];
  }

  return getNextWorkoutDayAfter(validLogs[0].workout_day, exercises);
}