export const DEFAULT_WORKOUT_DAY = "Treino A";

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

export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatWorkoutDate(dateString) {
  const dateKey = getWorkoutDateKey(dateString);

  if (!dateKey) {
    return "";
  }

  const [year, month, day] = dateKey.split("-");

  if (!year || !month || !day) {
    return dateKey;
  }

  return `${day}/${month}/${year}`;
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
    (exercise) => exercise.workout_day || DEFAULT_WORKOUT_DAY,
  );

  const uniqueDays = [...new Set(daysFromExercises)];

  return workoutDayOptions.filter((day) => uniqueDays.includes(day));
}

export function getNextWorkoutDayAfter(
  day,
  exercises = [],
  fallbackDay = DEFAULT_WORKOUT_DAY,
) {
  const orderedDays = getOrderedWorkoutDaysFromExercises(exercises);

  if (orderedDays.length === 0) {
    return fallbackDay;
  }

  const currentIndex = orderedDays.indexOf(day);

  if (currentIndex === -1) {
    return orderedDays[0];
  }

  const nextIndex = (currentIndex + 1) % orderedDays.length;

  return orderedDays[nextIndex];
}

export function calculateNextWorkoutDay(day, exercises = [], fallbackDay) {
  return getNextWorkoutDayAfter(day, exercises, fallbackDay);
}

export function getCurrentWorkoutDay(
  exercises = [],
  logs = [],
  fallbackDay = DEFAULT_WORKOUT_DAY,
) {
  const orderedDays = getOrderedWorkoutDaysFromExercises(exercises);

  if (orderedDays.length === 0) {
    return fallbackDay;
  }

  const validLogs = sortWorkoutLogs(logs).filter((log) => {
    const status = log.status || "completed";

    return (
      orderedDays.includes(log.workout_day) &&
      ["completed", "skipped"].includes(status)
    );
  });

  if (validLogs.length === 0) {
    return orderedDays[0];
  }

  return getNextWorkoutDayAfter(validLogs[0].workout_day, exercises, fallbackDay);
}

export function calculateCurrentWorkoutDay(exercises = [], logs = [], fallbackDay) {
  return getCurrentWorkoutDay(exercises, logs, fallbackDay);
}

export function getWorkoutLabel(plan, day, emptyLabel = "No workout") {
  if (!day) {
    return emptyLabel;
  }

  const focus = plan?.day_focuses?.[day];

  if (!focus) {
    return day;
  }

  return `${day} - ${focus}`;
}
