import { useCallback, useEffect, useState } from "react";

import { reportError } from "../utils/errorHandler";
import {
  fetchActiveWorkoutPlans,
  fetchDailyWorkoutProgress,
  fetchWorkoutExercises,
  fetchWorkoutLogs,
  fetchWorkoutSetLogs,
} from "../services/workoutService";

function useWorkoutData({ enabled = true, includeProgress = false, today, userId } = {}) {
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [progress, setProgress] = useState([]);
  const [setLogs, setSetLogs] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled && userId));
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!enabled || !userId) {
      setPlans([]);
      setActivePlan(null);
      setExercises([]);
      setWorkoutLogs([]);
      setProgress([]);
      setSetLogs([]);
      setLoading(false);
      setError(null);
      return null;
    }

    setLoading(true);
    setError(null);

    const { data: plansData, error: plansError } =
      await fetchActiveWorkoutPlans(userId);

    if (plansError) {
      reportError(plansError);
      setError(plansError);
      setLoading(false);
      return null;
    }

    const loadedPlans = plansData || [];
    const selectedPlan = loadedPlans[0] || null;

    setPlans(loadedPlans);
    setActivePlan(selectedPlan);

    if (!selectedPlan) {
      setExercises([]);
      setWorkoutLogs([]);
      setProgress([]);
      setSetLogs([]);
      setLoading(false);
      return null;
    }

    const [
      { data: exercisesData, error: exercisesError },
      { data: logsData, error: logsError },
      setLogsResult,
      progressResult,
    ] = await Promise.all([
      fetchWorkoutExercises(userId, selectedPlan.id),
      fetchWorkoutLogs(userId, selectedPlan.id),
      fetchWorkoutSetLogs(userId, selectedPlan.id),
      includeProgress && today
        ? fetchDailyWorkoutProgress(userId, selectedPlan.id, today)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const firstError =
      exercisesError || logsError || setLogsResult.error || progressResult.error;

    if (firstError) {
      reportError(firstError);
      setError(firstError);
      setLoading(false);
      return null;
    }

    setExercises(exercisesData || []);
    setWorkoutLogs(logsData || []);
    setSetLogs(setLogsResult.data || []);
    setProgress(progressResult.data || []);
    setLoading(false);

    return {
      activePlan: selectedPlan,
      exercises: exercisesData || [],
      plans: loadedPlans,
      progress: progressResult.data || [],
      setLogs: setLogsResult.data || [],
      workoutLogs: logsData || [],
    };
  }, [enabled, includeProgress, today, userId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    activePlan,
    error,
    exercises,
    loading,
    plans,
    progress,
    refetch,
    setActivePlan,
    setExercises,
    setLogs,
    setPlans,
    setProgress,
    setSetLogs,
    setWorkoutLogs,
    workoutLogs,
  };
}

export default useWorkoutData;
