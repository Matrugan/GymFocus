import { supabase } from "../lib/supabase";

export function fetchActiveWorkoutPlans(userId) {
  return supabase
    .from("workout_plans")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
}

export function fetchArchivedWorkoutPlans(userId) {
  return supabase
    .from("workout_plans")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", false)
    .order("created_at", { ascending: false });
}

export function fetchWorkoutExercises(userId, workoutPlanId) {
  return supabase
    .from("workout_exercises")
    .select("*")
    .eq("user_id", userId)
    .eq("workout_plan_id", workoutPlanId)
    .order("workout_day", { ascending: true })
    .order("sort_order", { ascending: true });
}

export function fetchWorkoutLogs(userId, workoutPlanId) {
  return supabase
    .from("workout_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("workout_plan_id", workoutPlanId)
    .order("workout_date", { ascending: false })
    .order("created_at", { ascending: false });
}

export function fetchUserWorkoutLogs(userId) {
  return supabase
    .from("workout_logs")
    .select("*")
    .eq("user_id", userId)
    .order("workout_date", { ascending: false })
    .order("created_at", { ascending: false });
}

export function fetchDailyWorkoutProgress(userId, workoutPlanId, workoutDate) {
  return supabase
    .from("daily_workout_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("workout_plan_id", workoutPlanId)
    .eq("workout_date", workoutDate);
}

export function fetchWorkoutSetLogs(userId, workoutPlanId, limit = 600) {
  return supabase
    .from("workout_set_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("workout_plan_id", workoutPlanId)
    .order("workout_date", { ascending: false })
    .order("exercise_id", { ascending: true })
    .order("set_number", { ascending: true })
    .limit(limit);
}

export function createWorkoutPlanRecord(plan) {
  return supabase.from("workout_plans").insert([plan]).select().single();
}

export function updateWorkoutPlanRecord(planId, userId, updates) {
  return supabase
    .from("workout_plans")
    .update(updates)
    .eq("id", planId)
    .eq("user_id", userId)
    .select()
    .single();
}

export function archiveWorkoutPlanRecord(planId, userId) {
  return supabase
    .from("workout_plans")
    .update({ is_active: false })
    .eq("id", planId)
    .eq("user_id", userId);
}

export function restoreWorkoutPlanRecord(planId, userId) {
  return supabase
    .from("workout_plans")
    .update({ is_active: true })
    .eq("id", planId)
    .eq("user_id", userId)
    .select()
    .single();
}

export function createWorkoutExercises(records) {
  return supabase.from("workout_exercises").insert(records).select();
}

export function createWorkoutExercise(record) {
  return supabase.from("workout_exercises").insert([record]).select().single();
}

export function updateWorkoutExercise(exerciseId, userId, updates) {
  return supabase
    .from("workout_exercises")
    .update(updates)
    .eq("id", exerciseId)
    .eq("user_id", userId)
    .select()
    .single();
}

export function deleteWorkoutExercise(exerciseId, userId) {
  return supabase
    .from("workout_exercises")
    .delete()
    .eq("id", exerciseId)
    .eq("user_id", userId);
}

export function findCompletedWorkoutLog(userId, workoutPlanId, workoutDate) {
  return supabase
    .from("workout_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("workout_plan_id", workoutPlanId)
    .eq("workout_date", workoutDate)
    .eq("status", "completed")
    .maybeSingle();
}

export function findWorkoutLogByDay(
  userId,
  workoutPlanId,
  workoutDate,
  workoutDay,
) {
  return supabase
    .from("workout_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("workout_plan_id", workoutPlanId)
    .eq("workout_date", workoutDate)
    .eq("workout_day", workoutDay)
    .maybeSingle();
}

export function createWorkoutLog(log) {
  return supabase.from("workout_logs").insert([log]).select().single();
}

export async function createCompletedWorkoutLogWithDuration(log) {
  let result = await createWorkoutLog(log);

  if (
    result.error &&
    [
      "status",
      "started_at",
      "completed_at",
      "duration_seconds",
      "calories_burned",
      "workout_type",
      "distance_km",
      "notes",
    ].some((column) =>
      result.error.message?.includes(column),
    )
  ) {
    const legacyLog = { ...log };

    delete legacyLog.status;
    delete legacyLog.completed_at;
    delete legacyLog.calories_burned;
    delete legacyLog.duration_seconds;
    delete legacyLog.started_at;
    delete legacyLog.distance_km;
    delete legacyLog.notes;
    delete legacyLog.workout_type;

    result = await createWorkoutLog(legacyLog);
  }

  return result;
}

export function createWorkoutProgress(record) {
  return supabase
    .from("daily_workout_progress")
    .insert([record])
    .select()
    .single();
}

export function updateWorkoutProgress(progressId, updates) {
  return supabase
    .from("daily_workout_progress")
    .update(updates)
    .eq("id", progressId)
    .select()
    .single();
}

export function deleteWorkoutSetLogsForExerciseDate({
  exerciseId,
  userId,
  workoutDate,
  workoutPlanId,
}) {
  return supabase
    .from("workout_set_logs")
    .delete()
    .eq("user_id", userId)
    .eq("workout_plan_id", workoutPlanId)
    .eq("exercise_id", exerciseId)
    .eq("workout_date", workoutDate);
}

export function deleteWorkoutSetLogsOutsideSetNumbers({
  exerciseId,
  setNumbers,
  userId,
  workoutDate,
  workoutPlanId,
}) {
  return supabase
    .from("workout_set_logs")
    .delete()
    .eq("user_id", userId)
    .eq("workout_plan_id", workoutPlanId)
    .eq("exercise_id", exerciseId)
    .eq("workout_date", workoutDate)
    .not("set_number", "in", `(${setNumbers.join(",")})`);
}

export function createWorkoutSetLogs(records) {
  return supabase.from("workout_set_logs").insert(records).select();
}

export function upsertWorkoutSetLogs(records) {
  return supabase
    .from("workout_set_logs")
    .upsert(records, {
      onConflict:
        "user_id,workout_plan_id,exercise_id,workout_date,set_number",
    })
    .select();
}

export function subscribeToUserWorkoutLogs(userId, onChange) {
  return supabase
    .channel(`workout-calendar-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "workout_logs",
        filter: `user_id=eq.${userId}`,
      },
      onChange,
    )
    .subscribe();
}

export function unsubscribeFromWorkoutRealtime(channel) {
  return supabase.removeChannel(channel);
}
