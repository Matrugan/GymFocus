import { describe, expect, it } from "vitest";

import {
  getCurrentWorkoutDay,
  getNextWorkoutDayAfter,
  getOrderedWorkoutDaysFromExercises,
  getWorkoutLabel,
  formatWorkoutDate,
  sortWorkoutLogs,
} from "../workoutSequence";

const exercisesABC = [
  {
    id: 1,
    workout_day: "Treino A",
    name: "Supino",
  },
  {
    id: 2,
    workout_day: "Treino B",
    name: "Remada",
  },
  {
    id: 3,
    workout_day: "Treino C",
    name: "Agachamento",
  },
];

describe("workoutLogic", () => {
  it("returns ordered workout days from exercises", () => {
    expect(getOrderedWorkoutDaysFromExercises(exercisesABC)).toEqual([
      "Treino A",
      "Treino B",
      "Treino C",
    ]);
  });

  it("returns first workout when there are no logs", () => {
    expect(getCurrentWorkoutDay(exercisesABC, [])).toBe("Treino A");
  });

  it("advances after completed workout", () => {
    const logs = [
      {
        workout_day: "Treino A",
        workout_date: "2026-05-14",
        status: "completed",
        created_at: "2026-05-14T10:00:00Z",
      },
    ];

    expect(getCurrentWorkoutDay(exercisesABC, logs)).toBe("Treino B");
  });

  it("advances after skipped workout", () => {
    const logs = [
      {
        workout_day: "Treino B",
        workout_date: "2026-05-14",
        status: "skipped",
        created_at: "2026-05-14T10:00:00Z",
      },
    ];

    expect(getCurrentWorkoutDay(exercisesABC, logs)).toBe("Treino C");
  });

  it("returns to first workout after the last workout", () => {
    const logs = [
      {
        workout_day: "Treino C",
        workout_date: "2026-05-14",
        status: "completed",
        created_at: "2026-05-14T10:00:00Z",
      },
    ];

    expect(getCurrentWorkoutDay(exercisesABC, logs)).toBe("Treino A");
  });

  it("ignores logs without valid workout_day", () => {
    const logs = [
      {
        workout_day: null,
        workout_date: "2026-05-14",
        status: "completed",
        created_at: "2026-05-14T10:00:00Z",
      },
    ];

    expect(getCurrentWorkoutDay(exercisesABC, logs)).toBe("Treino A");
  });

  it("sorts logs by workout_date and created_at", () => {
    const logs = [
      {
        id: 1,
        workout_day: "Treino A",
        workout_date: "2026-05-13",
        created_at: "2026-05-13T10:00:00Z",
      },
      {
        id: 2,
        workout_day: "Treino B",
        workout_date: "2026-05-14",
        created_at: "2026-05-14T08:00:00Z",
      },
      {
        id: 3,
        workout_day: "Treino C",
        workout_date: "2026-05-14",
        created_at: "2026-05-14T12:00:00Z",
      },
    ];

    expect(sortWorkoutLogs(logs).map((log) => log.id)).toEqual([3, 2, 1]);
  });

  it("gets next workout day after current day", () => {
    expect(getNextWorkoutDayAfter("Treino A", exercisesABC)).toBe("Treino B");
    expect(getNextWorkoutDayAfter("Treino B", exercisesABC)).toBe("Treino C");
    expect(getNextWorkoutDayAfter("Treino C", exercisesABC)).toBe("Treino A");
  });

  it("formats workout labels with plan focus", () => {
    expect(
      getWorkoutLabel(
        {
          day_focuses: {
            "Treino A": "Peito e triceps",
          },
        },
        "Treino A",
      ),
    ).toBe("Treino A - Peito e triceps");
  });

  it("formats workout dates from date keys or timestamps", () => {
    expect(formatWorkoutDate("2026-05-14")).toBe("14/05/2026");
    expect(formatWorkoutDate("2026-05-14T10:00:00Z")).toBe("14/05/2026");
  });
});
