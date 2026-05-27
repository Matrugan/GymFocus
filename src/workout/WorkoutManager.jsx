import { useEffect, useMemo, useRef, useState } from "react";

import {
  Activity,
  Plus,
  Trash2,
  CheckCircle,
  Circle,
  Loader2,
  Save,
  Trophy,
  Pencil,
  X,
  Settings2,
  Archive,
  RotateCcw,
  Home,
  ArrowDown,
  ArrowUp,
} from "lucide-react";

import toast from "react-hot-toast";

import { motion } from "framer-motion";

import { fetchBodyMeasurements } from "../services/bodyMeasurementService";
import { updateProfileStats } from "../services/profileService";
import {
  archiveWorkoutPlanRecord,
  createCompletedWorkoutLogWithDuration,
  createWorkoutExercise,
  createWorkoutExercises,
  createWorkoutLog,
  createWorkoutPlanRecord,
  createWorkoutProgress,
  deleteWorkoutExercise,
  deleteWorkoutSetLogsOutsideSetNumbers,
  fetchActiveWorkoutPlans,
  fetchArchivedWorkoutPlans,
  fetchDailyWorkoutProgress,
  fetchWorkoutExercises,
  fetchWorkoutLogs,
  fetchWorkoutSetLogs,
  restoreWorkoutPlanRecord,
  updateWorkoutExercise,
  updateWorkoutPlanRecord,
  updateWorkoutProgress,
  upsertWorkoutSetLogs,
} from "../services/workoutService";
import { unlockAchievement } from "../utils/achievementSystem";
import { logXP } from "../utils/xpSystem";
import CurrentWorkoutCard from "./components/CurrentWorkoutCard";
import CreateWorkoutPlanForm from "./components/CreateWorkoutPlanForm";
import WorkoutHeader from "./components/WorkoutHeader";
import WorkoutQuickTools from "./components/WorkoutQuickTools";
import WorkoutTemplatesPanel from "./components/WorkoutTemplatesPanel";
import { reportError } from "../utils/errorHandler";
import { workoutTimerNotification } from "../utils/workoutTimerNotification";
import { useLanguage } from "../context/LanguageContext";
import {
  formatWorkoutDate,
  getCurrentWorkoutDay,
  getLocalDateString,
  getNextWorkoutDayAfter,
  getWorkoutDayBase,
  sortWorkoutLogs,
  getWorkoutDateKey,
  workoutDayOptions,
} from "./workoutSequence";

import { workoutTemplates } from "./workoutTemplates";

const CARDIO_XP_REWARD = 50;

const alternativeWorkoutOptions = [
  {
    id: "cardio",
    icon: Activity,
    titlePt: "Cardio rápido",
    titleEn: "Quick cardio",
    descriptionPt: "Para manter o dia ativo quando não der para ir à academia.",
    descriptionEn: "Keep the day active when you cannot make it to the gym.",
    durationSeconds: 20 * 60,
    stepsPt: [
      "Caminhada acelerada ou corrida leve - 20 min",
      "Alongamento leve - 5 min",
    ],
    stepsEn: ["Fast walk or light run - 20 min", "Light stretching - 5 min"],
  },
  {
    id: "home",
    icon: Home,
    titlePt: "Treino em casa",
    titleEn: "Home workout",
    descriptionPt: "Um treino simples com peso corporal para salvar a sequência.",
    descriptionEn: "A simple bodyweight session to keep the streak alive.",
    durationSeconds: 25 * 60,
    stepsPt: [
      "Agachamento livre - 3 x 15",
      "Flexão adaptada - 3 x 10",
      "Abdominal - 3 x 20",
      "Prancha - 3 x 30s",
    ],
    stepsEn: [
      "Bodyweight squat - 3 x 15",
      "Adapted push-up - 3 x 10",
      "Crunch - 3 x 20",
      "Plank - 3 x 30s",
    ],
  },
];

function getEstimatedWeightKg(profile, latestBodyMeasurement) {
  const possibleWeight =
    latestBodyMeasurement?.weight_kg ??
    profile?.weight_kg ??
    profile?.weightKg ??
    profile?.weight ??
    profile?.peso;
  const weight = Number(possibleWeight);

  return Number.isFinite(weight) && weight > 0 ? weight : 70;
}

function getDistanceCalorieFactor(cardioType = "") {
  const normalizedType = cardioType.toLowerCase();

  if (/corr|run|trote/.test(normalizedType)) return 1.0;
  if (/caminh|walk/.test(normalizedType)) return 0.55;
  if (/bike|bicic|cicl|spinning/.test(normalizedType)) return 0.32;

  return 0.75;
}

function getCardioMet(cardioType = "") {
  const normalizedType = cardioType.toLowerCase();

  if (/corr|run|trote/.test(normalizedType)) return 9.8;
  if (/bike|bicic|cicl|spinning/.test(normalizedType)) return 7.5;
  if (/caminh|walk/.test(normalizedType)) return 4.3;
  if (/escada|stair/.test(normalizedType)) return 8.0;
  if (/elipt/.test(normalizedType)) return 5.0;
  if (/corda|jump/.test(normalizedType)) return 10.0;

  return 7.0;
}

function calculateCaloriesBurned({
  cardioType = "",
  distanceKm = null,
  durationSeconds,
  latestBodyMeasurement = null,
  profile,
  workoutType,
}) {
  const minutes = Math.max(1, Number(durationSeconds || 0) / 60);
  const weightKg = getEstimatedWeightKg(profile, latestBodyMeasurement);
  const met =
    workoutType === "cardio"
      ? getCardioMet(cardioType)
      : workoutType === "home"
        ? 4.5
        : 5.0;

  const metCalories = (met * 3.5 * weightKg * minutes) / 200;
  const parsedDistanceKm = Number(distanceKm);

  if (
    workoutType === "cardio" &&
    Number.isFinite(parsedDistanceKm) &&
    parsedDistanceKm > 0
  ) {
    const distanceCalories =
      weightKg * parsedDistanceKm * getDistanceCalorieFactor(cardioType);

    return Math.max(1, Math.round((metCalories + distanceCalories) / 2));
  }

  return Math.max(1, Math.round(metCalories));
}

function parseSetLogNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const normalizedValue = String(value).trim().replace(",", ".");

  if (!normalizedValue) {
    return null;
  }

  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : Number.NaN;
}

function parseDecimalInput(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsedValue = Number(String(value).trim().replace(",", "."));

  return Number.isFinite(parsedValue) ? parsedValue : Number.NaN;
}

function WorkoutManager({ user, profile, onProfileUpdated }) {
  const { language, t, translate } = useLanguage();
  const profileRef = useRef(profile);

  const [plans, setPlans] = useState([]);
  const [archivedPlans, setArchivedPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [progress, setProgress] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [latestBodyMeasurement, setLatestBodyMeasurement] = useState(null);
  const [setLogs, setSetLogs] = useState([]);
  const [expandedSetLoggerId, setExpandedSetLoggerId] = useState(null);
  const [setLogForms, setSetLogForms] = useState({});
  const [savingSetLogs, setSavingSetLogs] = useState(false);
  const [workoutSessionStartedAt, setWorkoutSessionStartedAt] = useState(null);
  const [workoutStartedAt, setWorkoutStartedAt] = useState(null);
  const [workoutElapsedBeforePause, setWorkoutElapsedBeforePause] = useState(0);
  const [elapsedWorkoutSeconds, setElapsedWorkoutSeconds] = useState(0);
  const [workoutTimerPaused, setWorkoutTimerPaused] = useState(false);

  const [loading, setLoading] = useState(true);
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [addingExercise, setAddingExercise] = useState(false);
  const [finishingWorkout, setFinishingWorkout] = useState(false);
  const [updatingPlan, setUpdatingPlan] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState(false);
  const [updatingExercise, setUpdatingExercise] = useState(false);
  const [updatingFocuses, setUpdatingFocuses] = useState(false);
  const [reorderingExercise, setReorderingExercise] = useState(false);

  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showPlanTools, setShowPlanTools] = useState(false);
  const [showFocusEditor, setShowFocusEditor] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showAlternativeWorkouts, setShowAlternativeWorkouts] = useState(false);
  const [cardioLogForm, setCardioLogForm] = useState({
    type: "",
    durationMinutes: "",
    distanceKm: "",
  });

  const [planListView, setPlanListView] = useState("active");
  const [selectedWorkoutDay, setSelectedWorkoutDay] = useState("Todos");
  const [chosenWorkoutDayForToday, setChosenWorkoutDayForToday] =
    useState(null);

  const [newPlan, setNewPlan] = useState({
    title: "",
    description: "",
  });

  const [editingPlan, setEditingPlan] = useState(null);

  const [editPlanData, setEditPlanData] = useState({
    title: "",
    description: "",
  });

  const [dayFocuses, setDayFocuses] = useState({});

  const [newExercise, setNewExercise] = useState({
    workout_day: "Treino A",
    name: "",
    sets: "",
    reps: "",
    load: "",
  });

  const [editingExercise, setEditingExercise] = useState(null);

  const [editExerciseData, setEditExerciseData] = useState({
    workout_day: "Treino A",
    name: "",
    sets: "",
    reps: "",
    load: "",
  });

  const today = getLocalDateString();

  const workoutFilterOptions = ["Todos", ...workoutDayOptions];

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  function updateLocalProfile(updates) {
    const updatedProfile = {
      ...(profileRef.current || profile || {}),
      ...updates,
    };

    profileRef.current = updatedProfile;
    onProfileUpdated?.(updatedProfile);
  }

  useEffect(() => {
    if (user?.id) {
      getWorkoutData();
      getLatestBodyMeasurement();
    }
  }, [user?.id]);

  async function getLatestBodyMeasurement() {
    const { data, error } = await fetchBodyMeasurements(user.id, 1);

    if (error) {
      reportError(error, "Error loading body measurement for calorie calculation.");
      return;
    }

    setLatestBodyMeasurement(data?.[0] || null);
  }

  function getPlanFocuses(plan) {
    return plan?.day_focuses || {};
  }

  function getDayFocus(day) {
    return dayFocuses?.[day] || "";
  }

  function getDayLabel(day) {
    const focus = getDayFocus(day);

    if (!focus.trim()) {
      return translate(day);
    }

    return translate(`${day} - ${focus}`);
  }

  function formatWorkoutDuration(totalSeconds) {
    const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${String(minutes).padStart(2, "0")}m`;
    }

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0",
    )}`;
  }

  function getTodayCompletedLog(logs) {
  return (
    sortWorkoutLogs(logs).find((log) => {
      const logStatus = log.status || "completed";

      return (
        getWorkoutDateKey(log.workout_date) === today &&
        logStatus === "completed" &&
        !isCardioWorkoutLog(log)
      );
    }) || null
  );
}

  function isCardioWorkoutLog(log) {
    const workoutType = String(log?.workout_type || "").toLowerCase();
    const workoutDay = String(log?.workout_day || "");
    const notes = String(log?.notes || "").toLowerCase();

    return (
      workoutType === "cardio" ||
      /^Cardio$/i.test(workoutDay) ||
      /\s-\sCardio$/i.test(workoutDay) ||
      notes.startsWith("cardio:")
    );
  }

  function isHomeWorkoutLog(log) {
    const workoutType = String(log?.workout_type || "").toLowerCase();
    const workoutDay = String(log?.workout_day || "");

    return workoutType === "home" || /\s-\s(Casa|Home)$/i.test(workoutDay);
  }

  function isAlternativeWorkoutLog(log) {
    return isCardioWorkoutLog(log) || isHomeWorkoutLog(log);
  }

  function getTodayGymCompletedLog(logs) {
    return (
      sortWorkoutLogs(logs).find((log) => {
        const logStatus = log.status || "completed";

        return (
          getWorkoutDateKey(log.workout_date) === today &&
          logStatus === "completed" &&
          !isAlternativeWorkoutLog(log)
        );
      }) || null
    );
  }

  function getTodayCardioCompletedLog(logs) {
    return (
      sortWorkoutLogs(logs).find((log) => {
        const logStatus = log.status || "completed";

        return (
          getWorkoutDateKey(log.workout_date) === today &&
          logStatus === "completed" &&
          isCardioWorkoutLog(log)
        );
      }) || null
    );
  }

  function getTodayAlternativeCompletedLog(logs) {
    return (
      sortWorkoutLogs(logs).find((log) => {
        const logStatus = log.status || "completed";

        return (
          getWorkoutDateKey(log.workout_date) === today &&
          logStatus === "completed" &&
          isHomeWorkoutLog(log)
        );
      }) || null
    );
  }

  async function getWorkoutData() {
    setLoading(true);

    const { data: plansData, error: plansError } =
      await fetchActiveWorkoutPlans(user.id);
    const { data: archivedPlansData, error: archivedPlansError } =
      await fetchArchivedWorkoutPlans(user.id);

    if (plansError) {
      reportError(plansError, "Error loading workout plans.");
      setLoading(false);
      return;
    }

    if (archivedPlansError) {
      reportError(archivedPlansError, "Error loading archived workout plans.");
    }

    setPlans(plansData || []);
    setArchivedPlans(archivedPlansData || []);

    const selectedPlan = plansData?.[0] || null;

    setExpandedSetLoggerId(null);
    setSetLogForms({});
    setChosenWorkoutDayForToday(null);
    setActivePlan(selectedPlan);
    setDayFocuses(getPlanFocuses(selectedPlan));

    if (!selectedPlan) {
      setExercises([]);
      setProgress([]);
      setWorkoutLogs([]);
      setSetLogs([]);
      setShowCreatePlan(false);
      setLoading(false);
      return;
    }

    await loadPlanDetails(selectedPlan.id);

    setLoading(false);
  }

  async function loadPlanDetails(planId) {
    const { data: exercisesData, error: exercisesError } =
      await fetchWorkoutExercises(user.id, planId);

    if (exercisesError) {
      reportError(exercisesError, "Error loading exercises.");
      return;
    }

    const loadedExercises = exercisesData || [];

    setExercises(loadedExercises);

    const { data: logsData, error: logsError } = await fetchWorkoutLogs(
      user.id,
      planId,
    );

    if (logsError) {
      reportError(logsError, "Error loading workout history.");
      return;
    }

    const loadedLogs = logsData || [];

    setWorkoutLogs(loadedLogs);

    const currentDay = getCurrentWorkoutDay(
      loadedExercises,
      loadedLogs.filter((log) => !isCardioWorkoutLog(log)),
    );
    const loadedTodayGymCompletedLog = getTodayGymCompletedLog(loadedLogs);
    const loadedTodayAlternativeCompletedLog =
      getTodayAlternativeCompletedLog(loadedLogs);

    setSelectedWorkoutDay(
      loadedTodayGymCompletedLog?.workout_day ||
        (loadedTodayAlternativeCompletedLog?.workout_day
          ? getWorkoutDayBase(loadedTodayAlternativeCompletedLog.workout_day)
          : currentDay),
    );

    const { data: progressData, error: progressError } =
      await fetchDailyWorkoutProgress(user.id, planId, today);

    if (progressError) {
      reportError(progressError, "Error loading workout progress.");
      return;
    }
    const { data: setLogsData, error: setLogsError } =
      await fetchWorkoutSetLogs(user.id, planId);

    if (setLogsError) {
      reportError(setLogsError, "Error loading set logs.");
      return;
    }

    setSetLogs(setLogsData || []);

    setProgress(progressData || []);
  }

  async function createWorkoutFromTemplate(template) {
    if (!user?.id) return;

    const confirmCreate = confirm(
      language === "pt"
        ? `Criar "${translate(template.title)}" com ${template.exercises.length} exercícios?`
        : `Create "${template.title}" with ${template.exercises.length} exercises?`,
    );

    if (!confirmCreate) return;

    setCreatingTemplate(true);

    const { data: planData, error: planError } =
      await createWorkoutPlanRecord({
        user_id: user.id,
        title: template.title,
        description: template.description,
        is_active: true,
        day_focuses: template.focuses,
      });

    if (planError) {
      reportError(planError, translate("Error creating workout template."));
      setCreatingTemplate(false);
      return;
    }

    const exercisesToInsert = template.exercises.map((exercise, index) => ({
      workout_plan_id: planData.id,
      user_id: user.id,
      workout_day: exercise.workout_day,
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      load: exercise.load,
      sort_order: index + 1,
    }));

    const { data: exercisesData, error: exercisesError } =
      await createWorkoutExercises(exercisesToInsert);

    if (exercisesError) {
      reportError(
        exercisesError,
        language === "pt"
          ? "Treino criado, mas os exercícios não puderam ser adicionados."
          : "Workout created, but exercises could not be added.",
      );
      setCreatingTemplate(false);
      return;
    }

    const createdExercises = exercisesData || [];

    setPlans((prev) => [planData, ...prev]);
    setActivePlan(planData);
    setDayFocuses(template.focuses);
    setExercises(createdExercises);
    setProgress([]);
    setWorkoutLogs([]);
    setSetLogs([]);
    setExpandedSetLoggerId(null);
    setSetLogForms({});
    setSelectedWorkoutDay(getCurrentWorkoutDay(createdExercises, []));
    setChosenWorkoutDayForToday(null);

    setShowTemplates(false);
    setShowCreatePlan(false);
    setShowPlanTools(false);
    setShowFocusEditor(false);
    setShowAddExercise(false);

    toast.success(
      language === "pt"
        ? `${translate(template.title)} criado!`
        : `${template.title} created!`,
    );

    setCreatingTemplate(false);
  }

  async function createWorkoutPlan() {
    if (!newPlan.title.trim()) {
      toast.error(translate("Enter a workout name."));
      return;
    }

    setCreatingPlan(true);

    const { data, error } = await createWorkoutPlanRecord({
      user_id: user.id,
      title: newPlan.title.trim(),
      description: newPlan.description.trim(),
      is_active: true,
      day_focuses: {},
    });

    if (error) {
      reportError(error, translate("Error creating workout."));
      setCreatingPlan(false);
      return;
    }

    setNewPlan({
      title: "",
      description: "",
    });

    setPlans((prev) => [data, ...prev]);
    setActivePlan(data);
    setDayFocuses({});
    setExercises([]);
    setProgress([]);
    setWorkoutLogs([]);
    setSetLogs([]);
    setExpandedSetLoggerId(null);
    setSetLogForms({});
    setSelectedWorkoutDay("Treino A");
    setChosenWorkoutDayForToday(null);
    setShowCreatePlan(false);
    setShowPlanTools(true);

    toast.success(translate("Workout created!"));

    setCreatingPlan(false);
  }

  async function selectPlan(plan) {
    setActivePlan(plan);
    setDayFocuses(getPlanFocuses(plan));
    setEditingPlan(null);
    setEditingExercise(null);
    setExpandedSetLoggerId(null);
    setSetLogForms({});
    setChosenWorkoutDayForToday(null);
    setShowCreatePlan(false);

    await loadPlanDetails(plan.id);
  }

  function startEditPlan(plan) {
    setEditingPlan(plan);
    setShowPlanTools(true);

    setEditPlanData({
      title: plan.title || "",
      description: plan.description || "",
    });
  }

  function cancelEditPlan() {
    setEditingPlan(null);

    setEditPlanData({
      title: "",
      description: "",
    });
  }

  async function updateWorkoutPlan() {
    if (!editingPlan) return;

    if (!editPlanData.title.trim()) {
      toast.error(translate("Enter a workout name."));
      return;
    }

    setUpdatingPlan(true);

    const { data, error } = await updateWorkoutPlanRecord(
      editingPlan.id,
      user.id,
      {
        title: editPlanData.title.trim(),
        description: editPlanData.description.trim(),
      },
    );

    if (error) {
      reportError(error, translate("Error updating workout plan."));
      setUpdatingPlan(false);
      return;
    }

    setPlans((prev) =>
      prev.map((plan) => (plan.id === editingPlan.id ? data : plan)),
    );

    if (activePlan?.id === editingPlan.id) {
      setActivePlan(data);
      setDayFocuses(getPlanFocuses(data));
    }

    cancelEditPlan();

    toast.success(translate("Workout plan updated!"));

    setUpdatingPlan(false);
  }

  async function updateDayFocuses() {
    if (!activePlan) return;

    setUpdatingFocuses(true);

    const cleanedFocuses = Object.fromEntries(
      Object.entries(dayFocuses).map(([day, focus]) => [day, focus.trim()]),
    );

    const { data, error } = await updateWorkoutPlanRecord(
      activePlan.id,
      user.id,
      {
        day_focuses: cleanedFocuses,
      },
    );

    if (error) {
      reportError(error, translate("Error saving workout focuses."));
      setUpdatingFocuses(false);
      return;
    }

    setActivePlan(data);
    setDayFocuses(getPlanFocuses(data));

    setPlans((prev) => prev.map((plan) => (plan.id === data.id ? data : plan)));

    toast.success(translate("Workout focuses saved!"));

    setUpdatingFocuses(false);
  }

  async function archiveWorkoutPlan(planId) {
    const confirmArchive = confirm(
      language === "pt"
        ? "Arquivar este plano de treino? Ele sairá dos planos ativos, mas seu histórico e recordes ficarão salvos."
        : "Archive this workout plan? It will leave your active plans, but your workout history and records will stay saved.",
    );

    if (!confirmArchive) return;

    setDeletingPlan(true);

    const { error } = await archiveWorkoutPlanRecord(planId, user.id);

    if (error) {
      reportError(error, translate("Error archiving workout plan."));
      setDeletingPlan(false);
      return;
    }

    const updatedPlans = plans.filter((plan) => plan.id !== planId);
    const archivedPlan = plans.find((plan) => plan.id === planId);

    setPlans(updatedPlans);
    if (archivedPlan) {
      setArchivedPlans((prev) => [
        { ...archivedPlan, is_active: false },
        ...prev,
      ]);
    }

    if (editingPlan?.id === planId) {
      cancelEditPlan();
    }

    if (activePlan?.id === planId) {
      const nextPlan = updatedPlans[0] || null;

      setActivePlan(nextPlan);
      setDayFocuses(getPlanFocuses(nextPlan));

      if (nextPlan) {
        await loadPlanDetails(nextPlan.id);
      } else {
        setExercises([]);
        setProgress([]);
        setWorkoutLogs([]);
        setSetLogs([]);
        setExpandedSetLoggerId(null);
        setSetLogForms({});
        setShowCreatePlan(false);
      }
    }

    setSelectedWorkoutDay("Treino A");

    toast.success(translate("Workout plan archived."));

    setDeletingPlan(false);
  }

  async function restoreWorkoutPlan(planId) {
    setDeletingPlan(true);

    const { data, error } = await restoreWorkoutPlanRecord(planId, user.id);

    if (error) {
      reportError(error, translate("Error restoring workout plan."));
      setDeletingPlan(false);
      return;
    }

    setArchivedPlans((prev) => prev.filter((plan) => plan.id !== planId));
    setPlans((prev) => [data, ...prev]);

    if (!activePlan) {
      setActivePlan(data);
      setDayFocuses(getPlanFocuses(data));
      await loadPlanDetails(data.id);
      setShowCreatePlan(false);
    }

    setPlanListView("active");
    toast.success(translate("Workout plan restored."));
    setDeletingPlan(false);
  }

  async function addExercise() {
    if (!activePlan) {
      toast.error(translate("Create or select a workout first."));
      return;
    }

    if (!newExercise.name.trim()) {
      toast.error(translate("Enter an exercise name."));
      return;
    }

    setAddingExercise(true);

    const { data, error } = await createWorkoutExercise({
      workout_plan_id: activePlan.id,
      user_id: user.id,
      workout_day: newExercise.workout_day,
      name: newExercise.name.trim(),
      sets: newExercise.sets.trim(),
      reps: newExercise.reps.trim(),
      load: newExercise.load.trim(),
      sort_order: exercises.length + 1,
    });

    if (error) {
      reportError(error, translate("Error adding exercise."));
      setAddingExercise(false);
      return;
    }

    const updatedExercises = [...exercises, data];

    setExercises(updatedExercises);

    setNewExercise({
      workout_day: newExercise.workout_day,
      name: "",
      sets: "",
      reps: "",
      load: "",
    });

    const currentDay = getCurrentWorkoutDay(updatedExercises, workoutLogs);
    setSelectedWorkoutDay(currentDay);

    toast.success(translate("Exercise added!"));

    setAddingExercise(false);
  }

  function startEditExercise(exercise) {
    setEditingExercise(exercise);
    setShowPlanTools(true);

    setEditExerciseData({
      workout_day: exercise.workout_day || "Treino A",
      name: exercise.name || "",
      sets: exercise.sets || "",
      reps: exercise.reps || "",
      load: exercise.load || "",
    });
  }

  function cancelEditExercise() {
    setEditingExercise(null);

    setEditExerciseData({
      workout_day: "Treino A",
      name: "",
      sets: "",
      reps: "",
      load: "",
    });
  }

  function sortExercisesForDay(dayExercises) {
    return [...dayExercises].sort((a, b) => {
      const sortA = Number(a.sort_order) || 0;
      const sortB = Number(b.sort_order) || 0;

      if (sortA !== sortB) {
        return sortA - sortB;
      }

      return String(a.created_at || "").localeCompare(String(b.created_at || ""));
    });
  }

  async function moveExerciseInDay(exercise, direction) {
    if (reorderingExercise) return;

    const exerciseDay = exercise.workout_day || "Treino A";
    const dayExercises = sortExercisesForDay(
      exercises.filter((item) => {
        return (item.workout_day || "Treino A") === exerciseDay;
      }),
    );
    const currentIndex = dayExercises.findIndex((item) => item.id === exercise.id);
    const targetIndex = currentIndex + direction;

    if (currentIndex === -1 || targetIndex < 0 || targetIndex >= dayExercises.length) {
      return;
    }

    const targetExercise = dayExercises[targetIndex];
    const currentSortOrder = Number(exercise.sort_order) || currentIndex + 1;
    const targetSortOrder = Number(targetExercise.sort_order) || targetIndex + 1;

    setReorderingExercise(true);

    const [currentResult, targetResult] = await Promise.all([
      updateWorkoutExercise(exercise.id, user.id, {
        sort_order: targetSortOrder,
      }),
      updateWorkoutExercise(targetExercise.id, user.id, {
        sort_order: currentSortOrder,
      }),
    ]);

    if (currentResult.error || targetResult.error) {
      reportError(
        currentResult.error || targetResult.error,
        language === "pt"
          ? "Erro ao reorganizar exercícios."
          : "Error reordering exercises.",
      );
      setReorderingExercise(false);
      return;
    }

    setExercises((prev) =>
      prev.map((item) => {
        if (item.id === exercise.id) {
          return { ...item, sort_order: targetSortOrder };
        }

        if (item.id === targetExercise.id) {
          return { ...item, sort_order: currentSortOrder };
        }

        return item;
      }),
    );

    toast.success(
      language === "pt"
        ? "Ordem dos exercícios atualizada."
        : "Exercise order updated.",
    );
    setReorderingExercise(false);
  }

  async function updateExercise() {
    if (!editingExercise) return;

    if (!editExerciseData.name.trim()) {
      toast.error(translate("Enter an exercise name."));
      return;
    }

    setUpdatingExercise(true);

    const { data, error } = await updateWorkoutExercise(
      editingExercise.id,
      user.id,
      {
        workout_day: editExerciseData.workout_day,
        name: editExerciseData.name.trim(),
        sets: editExerciseData.sets.trim(),
        reps: editExerciseData.reps.trim(),
        load: editExerciseData.load.trim(),
      },
    );

    if (error) {
      reportError(error, translate("Error updating exercise."));
      setUpdatingExercise(false);
      return;
    }

    const updatedExercises = exercises.map((exercise) =>
      exercise.id === editingExercise.id ? data : exercise,
    );

    setExercises(updatedExercises);

    const currentDay = getCurrentWorkoutDay(updatedExercises, workoutLogs);
    setSelectedWorkoutDay(currentDay);

    cancelEditExercise();

    toast.success(translate("Exercise updated!"));

    setUpdatingExercise(false);
  }

  async function deleteExercise(exerciseId) {
    const confirmDelete = confirm(
      language === "pt" ? "Excluir este exercício?" : "Delete this exercise?",
    );

    if (!confirmDelete) return;

    const { error } = await deleteWorkoutExercise(exerciseId, user.id);

    if (error) {
      reportError(error, translate("Error deleting exercise."));
      return;
    }

    const updatedExercises = exercises.filter((item) => item.id !== exerciseId);

    setExercises(updatedExercises);
    setProgress((prev) =>
      prev.filter((item) => item.exercise_id !== exerciseId),
    );
    setSetLogs((prev) => prev.filter((item) => item.exercise_id !== exerciseId));
    setSetLogForms((prev) => {
      const nextForms = { ...prev };
      delete nextForms[exerciseId];
      return nextForms;
    });

    if (expandedSetLoggerId === exerciseId) {
      setExpandedSetLoggerId(null);
    }

    if (editingExercise?.id === exerciseId) {
      cancelEditExercise();
    }

    const currentDay = getCurrentWorkoutDay(updatedExercises, workoutLogs);
    setSelectedWorkoutDay(currentDay);

    toast.success(translate("Exercise deleted."));
  }

  function isExerciseCompleted(exerciseId) {
    return progress.some(
      (item) => item.exercise_id === exerciseId && item.completed,
    );
  }

  const todayCompletedLog = useMemo(() => {
    return getTodayCompletedLog(workoutLogs);
  }, [workoutLogs]);

  const todayGymCompletedLog = useMemo(() => {
    return getTodayGymCompletedLog(workoutLogs);
  }, [workoutLogs]);

  const todayAlternativeCompletedLog = useMemo(() => {
    return getTodayAlternativeCompletedLog(workoutLogs);
  }, [workoutLogs]);

  const todayCardioCompletedLog = useMemo(() => {
    return getTodayCardioCompletedLog(workoutLogs);
  }, [workoutLogs]);

  const workoutAlreadyCompletedToday = Boolean(todayGymCompletedLog);
  const alternativeWorkoutAlreadyCompletedToday = Boolean(
    todayAlternativeCompletedLog,
  );
  const cardioWorkoutAlreadyCompletedToday = Boolean(todayCardioCompletedLog);

  const currentWorkoutDay = useMemo(() => {
    return getCurrentWorkoutDay(
      exercises,
      workoutLogs.filter((log) => !isCardioWorkoutLog(log)),
    );
  }, [exercises, workoutLogs]);

  const availableTrainingWorkoutDays = useMemo(() => {
    const daysFromExercises = exercises.map(
      (exercise) => exercise.workout_day || "Treino A",
    );

    return workoutDayOptions.filter((day) => daysFromExercises.includes(day));
  }, [exercises]);

  const chosenWorkoutDayIsAvailable =
    chosenWorkoutDayForToday &&
    availableTrainingWorkoutDays.includes(chosenWorkoutDayForToday);
  const completedWorkoutDayToday = todayGymCompletedLog?.workout_day || null;
  const alternativeWorkoutDayToday = todayAlternativeCompletedLog?.workout_day
    ? getWorkoutDayBase(todayAlternativeCompletedLog.workout_day)
    : null;
  const activeWorkoutDayForToday =
    workoutAlreadyCompletedToday && completedWorkoutDayToday
      ? getWorkoutDayBase(completedWorkoutDayToday)
      : alternativeWorkoutDayToday
      ? alternativeWorkoutDayToday
      : chosenWorkoutDayIsAvailable
      ? chosenWorkoutDayForToday
      : currentWorkoutDay;

  const displayWorkoutDay =
    workoutAlreadyCompletedToday && completedWorkoutDayToday
      ? completedWorkoutDayToday
      : activeWorkoutDayForToday;

  useEffect(() => {
    if (completedWorkoutDayToday) {
      setSelectedWorkoutDay(completedWorkoutDayToday);
    }
  }, [todayGymCompletedLog?.id, completedWorkoutDayToday]);

  const nextWorkoutDay = useMemo(() => {
  return getNextWorkoutDayAfter(activeWorkoutDayForToday, exercises);
}, [activeWorkoutDayForToday, exercises]);

  const displayedPlans =
    planListView === "archived" ? archivedPlans : plans;

const lastCompletedWorkoutLog = useMemo(() => {
  return (
    workoutLogs.find((log) => {
      const logStatus = log.status || "completed";

      return (
        log.workout_date !== today &&
        logStatus === "completed" &&
        !isCardioWorkoutLog(log)
      );
    }) || null
  );
}, [workoutLogs, today]);

const lastCompletedWorkoutDay = lastCompletedWorkoutLog?.workout_day || null;

const displayNextWorkoutDay = useMemo(() => {
  return getNextWorkoutDayAfter(activeWorkoutDayForToday, exercises);
}, [activeWorkoutDayForToday, exercises]);

  const todayWorkoutLog = useMemo(() => {
    return (
      sortWorkoutLogs(workoutLogs).find((log) => {
        return (
          getWorkoutDateKey(log.workout_date) === today &&
          !isCardioWorkoutLog(log)
        );
      }) || null
    );
  }, [workoutLogs, today]);

  const workoutAlreadyRecordedToday = Boolean(todayWorkoutLog);
  const nonTrainingDayAlreadyRecordedToday =
    todayWorkoutLog?.status === "skipped" || todayWorkoutLog?.status === "rest";
  const canLogGymWorkoutToday =
    !workoutAlreadyCompletedToday && !nonTrainingDayAlreadyRecordedToday;

  function getLocalDateFromKey(dateKey) {
    const [year, month, day] = String(dateKey).split("-").map(Number);

    return new Date(year, month - 1, day);
  }

  function addDays(date, days) {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);

    return nextDate;
  }

  function getWeekStartDate(dateKey) {
    const date = getLocalDateFromKey(dateKey);
    const dayOfWeek = date.getDay();
    const daysFromMonday = (dayOfWeek + 6) % 7;

    return addDays(date, -daysFromMonday);
  }

  function getWeekDatesUntil(dateKey, includeDate = true) {
    const weekStartDate = getWeekStartDate(dateKey);
    const endDate = includeDate
      ? getLocalDateFromKey(dateKey)
      : addDays(getLocalDateFromKey(dateKey), -1);
    const dates = [];

    for (
      let currentDate = weekStartDate;
      currentDate <= endDate;
      currentDate = addDays(currentDate, 1)
    ) {
      dates.push(getLocalDateString(currentDate));
    }

    return dates;
  }

  function getWeeklyRestDays(logs = workoutLogs, dateKey = today) {
    const weekDates = new Set(getWeekDatesUntil(dateKey, true));

    return logs.filter((log) => {
      return (
        weekDates.has(getWorkoutDateKey(log.workout_date)) &&
        log.status === "rest"
      );
    }).length;
  }

  function getWeeklyNonTrainingDays(logs = workoutLogs, dateKey = today, includeDate = true) {
    const weekDates = getWeekDatesUntil(dateKey, includeDate);

    return weekDates.filter((date) => {
      const logsForDate = logs.filter((log) => {
        return getWorkoutDateKey(log.workout_date) === date;
      });

      return !logsForDate.some((log) => {
        const status = log.status || "completed";

        return status === "completed" && !isCardioWorkoutLog(log);
      });
    }).length;
  }

  const weeklyRestDaysUsed = getWeeklyRestDays(workoutLogs, today);

  async function resetDashboardStreak() {
    const { error: profileError } = await updateProfileStats(user.id, {
      streak: 0,
    });

    if (profileError) {
      reportError(profileError, translate("Error updating profile."));
      return;
    }

    onProfileUpdated?.({
      ...profile,
      streak: 0,
    });
  }

  const workoutTimerStorageKey = useMemo(() => {
    if (!user?.id || !activePlan?.id || !activeWorkoutDayForToday) {
      return "";
    }

    return `gymfocus-workout-timer:${user.id}:${activePlan.id}:${today}:${activeWorkoutDayForToday}`;
  }, [user?.id, activePlan?.id, today, activeWorkoutDayForToday]);

  const workoutTimerRunning =
    Boolean(workoutStartedAt) && !workoutAlreadyCompletedToday;
  const workoutTimerActive =
    (workoutTimerRunning || workoutTimerPaused || elapsedWorkoutSeconds > 0) &&
    !workoutAlreadyCompletedToday;

  function saveWorkoutTimerState({
    sessionStartedAt,
    startedAt,
    elapsedBeforePause,
    paused,
  }) {
    if (!workoutTimerStorageKey) return;

    localStorage.setItem(
      workoutTimerStorageKey,
      JSON.stringify({
        sessionStartedAt,
        startedAt,
        elapsedBeforePause,
        paused,
      }),
    );
  }

  function buildWorkoutTimerNotificationPayload({
    sessionStartedAt,
    startedAt,
    elapsedBeforePause,
  }) {
    return {
      storageKey: workoutTimerStorageKey,
      title: language === "pt" ? "Timer do treino" : "Workout timer",
      subtitle:
        language === "pt"
          ? `${getDayLabel(activeWorkoutDayForToday)} em andamento`
          : `${getDayLabel(activeWorkoutDayForToday)} in progress`,
      sessionStartedAt,
      startedAt,
      elapsedBeforePause,
    };
  }

  function syncTimerStateFromNotificationState(state) {
    if (!state?.active || state.storageKey !== workoutTimerStorageKey) {
      return;
    }

    const sessionStartedAt = Number(state.sessionStartedAt) || null;
    const startedAt = state.paused ? null : Number(state.startedAt) || null;
    const elapsedBeforePause = Math.max(
      0,
      Number(state.elapsedBeforePause) || 0,
    );
    const elapsedSeconds = Math.max(0, Number(state.elapsedSeconds) || 0);

    saveWorkoutTimerState({
      sessionStartedAt,
      startedAt,
      elapsedBeforePause,
      paused: Boolean(state.paused),
    });
    setWorkoutSessionStartedAt(sessionStartedAt);
    setWorkoutStartedAt(startedAt);
    setWorkoutElapsedBeforePause(elapsedBeforePause);
    setElapsedWorkoutSeconds(elapsedSeconds);
    setWorkoutTimerPaused(Boolean(state.paused));
  }

  async function syncWorkoutTimerNotification() {
    if (!workoutTimerStorageKey) return;

    try {
      const state = await workoutTimerNotification.getState();
      syncTimerStateFromNotificationState(state);
    } catch (error) {
      reportError(error, "Error syncing workout timer notification.");
    }
  }

  useEffect(() => {
    if (!workoutTimerStorageKey || workoutAlreadyCompletedToday) {
      setWorkoutSessionStartedAt(null);
      setWorkoutStartedAt(null);
      setWorkoutElapsedBeforePause(0);
      setElapsedWorkoutSeconds(0);
      setWorkoutTimerPaused(false);

      if (workoutTimerStorageKey) {
        localStorage.removeItem(workoutTimerStorageKey);
      }

      return;
    }

    const storedTimer = localStorage.getItem(workoutTimerStorageKey);
    const storedStartedAt = Number(storedTimer);

    if (Number.isFinite(storedStartedAt) && storedStartedAt > 0) {
      setWorkoutSessionStartedAt(storedStartedAt);
      setWorkoutStartedAt(storedStartedAt);
      setWorkoutElapsedBeforePause(0);
      setElapsedWorkoutSeconds(
        Math.max(0, Math.floor((Date.now() - storedStartedAt) / 1000)),
      );
      setWorkoutTimerPaused(false);
      return;
    }

    if (storedTimer) {
      try {
        const parsedTimer = JSON.parse(storedTimer);
        const parsedSessionStartedAt = Number(parsedTimer.sessionStartedAt);
        const parsedStartedAt = Number(parsedTimer.startedAt);
        const parsedElapsedBeforePause = Math.max(
          0,
          Number(parsedTimer.elapsedBeforePause) || 0,
        );
        const parsedPaused = Boolean(parsedTimer.paused);

        if (Number.isFinite(parsedSessionStartedAt) && parsedSessionStartedAt > 0) {
          setWorkoutSessionStartedAt(parsedSessionStartedAt);
          setWorkoutElapsedBeforePause(parsedElapsedBeforePause);
          setWorkoutTimerPaused(parsedPaused);

          if (
            !parsedPaused &&
            Number.isFinite(parsedStartedAt) &&
            parsedStartedAt > 0
          ) {
            setWorkoutStartedAt(parsedStartedAt);
            setElapsedWorkoutSeconds(
              parsedElapsedBeforePause +
                Math.max(0, Math.floor((Date.now() - parsedStartedAt) / 1000)),
            );
          } else {
            setWorkoutStartedAt(null);
            setElapsedWorkoutSeconds(parsedElapsedBeforePause);
          }

          return;
        }
      } catch (error) {
        reportError(error, "Error loading workout timer.");
      }
    }

    setWorkoutSessionStartedAt(null);
    setWorkoutStartedAt(null);
    setWorkoutElapsedBeforePause(0);
    setElapsedWorkoutSeconds(0);
    setWorkoutTimerPaused(false);
  }, [workoutTimerStorageKey, workoutAlreadyCompletedToday]);

  useEffect(() => {
    if (!workoutTimerRunning) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setElapsedWorkoutSeconds(
        workoutElapsedBeforePause +
          Math.max(0, Math.floor((Date.now() - workoutStartedAt) / 1000)),
      );
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [workoutTimerRunning, workoutStartedAt, workoutElapsedBeforePause]);

  useEffect(() => {
    syncWorkoutTimerNotification();

    function handleTimerVisibility() {
      if (!document.hidden) {
        syncWorkoutTimerNotification();
      }
    }

    window.addEventListener("focus", syncWorkoutTimerNotification);
    document.addEventListener("visibilitychange", handleTimerVisibility);

    return () => {
      window.removeEventListener("focus", syncWorkoutTimerNotification);
      document.removeEventListener("visibilitychange", handleTimerVisibility);
    };
  }, [workoutTimerStorageKey]);

  useEffect(() => {
    if (!workoutTimerActive) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      syncWorkoutTimerNotification();
    }, 2000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [workoutTimerActive, workoutTimerStorageKey]);

  function startWorkoutTimer() {
    if (!workoutTimerStorageKey || workoutAlreadyCompletedToday) {
      return;
    }

    if (workoutStartedAt) {
      return;
    }

    const startedAt = Date.now();
    const sessionStartedAt = workoutSessionStartedAt || startedAt;
    const elapsedBeforePause = workoutTimerPaused ? elapsedWorkoutSeconds : 0;

    saveWorkoutTimerState({
      sessionStartedAt,
      startedAt,
      elapsedBeforePause,
      paused: false,
    });
    setWorkoutSessionStartedAt(sessionStartedAt);
    setWorkoutStartedAt(startedAt);
    setWorkoutElapsedBeforePause(elapsedBeforePause);
    setElapsedWorkoutSeconds(elapsedBeforePause);
    setWorkoutTimerPaused(false);

    void workoutTimerNotification
      .start(
        buildWorkoutTimerNotificationPayload({
          sessionStartedAt,
          startedAt,
          elapsedBeforePause,
        }),
      )
      .catch((error) => {
        reportError(error, "Error starting workout timer notification.");
      });
  }

  function pauseWorkoutTimer() {
    if (!workoutTimerRunning) {
      return;
    }

    const pausedElapsedSeconds =
      workoutElapsedBeforePause +
      Math.max(0, Math.floor((Date.now() - workoutStartedAt) / 1000));
    const sessionStartedAt = workoutSessionStartedAt || workoutStartedAt;

    saveWorkoutTimerState({
      sessionStartedAt,
      startedAt: null,
      elapsedBeforePause: pausedElapsedSeconds,
      paused: true,
    });
    setWorkoutSessionStartedAt(sessionStartedAt);
    setWorkoutStartedAt(null);
    setWorkoutElapsedBeforePause(pausedElapsedSeconds);
    setElapsedWorkoutSeconds(pausedElapsedSeconds);
    setWorkoutTimerPaused(true);

    void workoutTimerNotification.pause().catch((error) => {
      reportError(error, "Error pausing workout timer notification.");
    });
  }

  function clearWorkoutTimer() {
    if (workoutTimerStorageKey) {
      localStorage.removeItem(workoutTimerStorageKey);
    }

    setWorkoutSessionStartedAt(null);
    setWorkoutStartedAt(null);
    setWorkoutElapsedBeforePause(0);
    setElapsedWorkoutSeconds(0);
    setWorkoutTimerPaused(false);

    void workoutTimerNotification.cancel().catch((error) => {
      reportError(error, "Error canceling workout timer notification.");
    });
  }

  function chooseWorkoutDayForToday(day) {
    if (workoutAlreadyRecordedToday) {
      toast.error(translate("Today's workout already has a record."));
      return;
    }

    if (!availableTrainingWorkoutDays.includes(day)) {
      return;
    }

    if (day !== activeWorkoutDayForToday && workoutTimerActive) {
      clearWorkoutTimer();
    }

    setChosenWorkoutDayForToday(day);
    setSelectedWorkoutDay(day);
    setExpandedSetLoggerId(null);
  }

  async function toggleExercise(exercise) {
    if (!activePlan) return;

    if (workoutAlreadyCompletedToday || nonTrainingDayAlreadyRecordedToday) {
      toast.error(
        workoutAlreadyCompletedToday
          ? translate("Today's workout is already completed.")
          : translate("Today's workout already has a record."),
      );
      return;
    }

    const exerciseDay = exercise.workout_day || "Treino A";

    if (exerciseDay !== activeWorkoutDayForToday) {
      toast.error(
        language === "pt"
          ? `Hoje é dia de ${getDayLabel(activeWorkoutDayForToday)}.`
          : `Today is ${getDayLabel(activeWorkoutDayForToday)} day.`,
      );
      return;
    }

    startWorkoutTimer();

    const existingProgress = progress.find(
      (item) => item.exercise_id === exercise.id,
    );

    if (existingProgress) {
      const newCompletedStatus = !existingProgress.completed;

      const { data, error } = await updateWorkoutProgress(
        existingProgress.id,
        {
          completed: newCompletedStatus,
          completed_at: newCompletedStatus ? new Date().toISOString() : null,
        },
      );

      if (error) {
        reportError(error, "Error updating progress.");
        return;
      }

      setProgress((prev) =>
        prev.map((item) => (item.id === existingProgress.id ? data : item)),
      );

      return;
    }

    const { data, error } = await createWorkoutProgress({
      user_id: user.id,
      workout_plan_id: activePlan.id,
      exercise_id: exercise.id,
      workout_date: today,
      completed: true,
      completed_at: new Date().toISOString(),
    });

    if (error) {
      reportError(error, "Error marking exercise.");
      return;
    }

    setProgress((prev) => [...prev, data]);
  }

  const currentWorkoutExercises = useMemo(() => {
    return exercises.filter(
      (exercise) =>
        (exercise.workout_day || "Treino A") === activeWorkoutDayForToday,
    );
  }, [exercises, activeWorkoutDayForToday]);

  const displayWorkoutExercises = useMemo(() => {
    return exercises.filter(
      (exercise) => (exercise.workout_day || "Treino A") === displayWorkoutDay,
    );
  }, [exercises, displayWorkoutDay]);

  const filteredExercises = useMemo(() => {
    if (selectedWorkoutDay === "Todos") {
      return exercises;
    }

    return exercises.filter(
      (exercise) => (exercise.workout_day || "Treino A") === selectedWorkoutDay,
    );
  }, [exercises, selectedWorkoutDay]);

  const groupedExercises = useMemo(() => {
    return filteredExercises.reduce((groups, exercise) => {
      const day = exercise.workout_day || "Treino A";

      if (!groups[day]) {
        groups[day] = [];
      }

      groups[day].push(exercise);

      return groups;
    }, {});
  }, [filteredExercises]);

  const orderedGroupedExercises = useMemo(() => {
    return Object.entries(groupedExercises).map(([day, dayExercises]) => {
      return [day, sortExercisesForDay(dayExercises)];
    });
  }, [groupedExercises]);

  const availableWorkoutDays = useMemo(() => {
    return workoutFilterOptions.filter((day) => {
      if (day === "Todos") return true;

      return availableTrainingWorkoutDays.includes(day);
    });
  }, [availableTrainingWorkoutDays]);

  const visibleCompletedCount = useMemo(() => {
    return filteredExercises.filter((exercise) =>
      isExerciseCompleted(exercise.id),
    ).length;
  }, [filteredExercises, progress]);

  const todayCompletedCount = useMemo(() => {
    return currentWorkoutExercises.filter((exercise) =>
      isExerciseCompleted(exercise.id),
    ).length;
  }, [currentWorkoutExercises, progress]);

  const displayWorkoutCompletedCount = useMemo(() => {
    return displayWorkoutExercises.filter((exercise) =>
      isExerciseCompleted(exercise.id),
    ).length;
  }, [displayWorkoutExercises, progress]);

  const visibleTotalExercises = filteredExercises.length;
  const todayTotalExercises = currentWorkoutExercises.length;
  const displayWorkoutTotalExercises = displayWorkoutExercises.length;

  const todayWorkoutCompleted =
    todayTotalExercises > 0 && todayCompletedCount === todayTotalExercises;

  const visibleProgressPercent =
    visibleTotalExercises > 0
      ? Math.round((visibleCompletedCount / visibleTotalExercises) * 100)
      : 0;

  const displayWorkoutProgressPercent =
    displayWorkoutTotalExercises > 0
      ? Math.round(
          (displayWorkoutCompletedCount / displayWorkoutTotalExercises) * 100,
        )
      : 0;

  async function recordCompletedWorkout({
    cardioType = "",
    distanceKm = null,
    durationSecondsOverride = null,
    extraLogFields = {},
    isAlternative = false,
    workoutType = "gym",
    workoutDayOverride = activeWorkoutDayForToday,
    successLabel = getDayLabel(currentWorkoutDay),
  } = {}) {
    if (!activePlan) return;

    if (nonTrainingDayAlreadyRecordedToday) {
      toast.error(translate("Today's workout already has a record."));
      return;
    }

    if (!isAlternative && workoutAlreadyCompletedToday) {
      toast.error(translate("Today's workout is already completed."));
      return;
    }

    if (isAlternative && alternativeWorkoutAlreadyCompletedToday) {
      toast.error(
        language === "pt"
          ? "Você já registrou cardio ou treino em casa hoje."
          : "You already logged cardio or a home workout today.",
      );
      return;
    }

    setFinishingWorkout(true);

    const finishedAt = new Date();
    const durationSeconds =
      durationSecondsOverride ??
      (workoutStartedAt
        ? workoutElapsedBeforePause +
          Math.max(
            1,
            Math.floor((finishedAt.getTime() - workoutStartedAt) / 1000),
          )
        : elapsedWorkoutSeconds);
    const startedAtDate = workoutSessionStartedAt
      ? new Date(workoutSessionStartedAt)
      : new Date(finishedAt.getTime() - durationSeconds * 1000);
    const caloriesBurned = calculateCaloriesBurned({
      cardioType,
      distanceKm,
      durationSeconds,
      latestBodyMeasurement,
      profile,
      workoutType,
    });
    const workoutLogPayload = {
      user_id: user.id,
      workout_plan_id: activePlan.id,
      workout_day: workoutDayOverride,
      workout_date: today,
      calories_burned: caloriesBurned,
      status: "completed",
      started_at: startedAtDate.toISOString(),
      completed_at: finishedAt.toISOString(),
      duration_seconds: durationSeconds,
      ...extraLogFields,
    };

    const { data: insertedLog, error: workoutError } =
      await createCompletedWorkoutLogWithDuration(workoutLogPayload);

    if (workoutError) {
      reportError(workoutError, translate("Error completing workout."));
      setFinishingWorkout(false);
      return;
    }

    setSelectedWorkoutDay(getWorkoutDayBase(workoutDayOverride));
    setWorkoutLogs((prev) => [insertedLog, ...prev]);

    const missedDaysBeforeToday = getWeeklyNonTrainingDays(
      workoutLogs,
      today,
      false,
    );
    const dayAlreadyHadCompletedWorkout = Boolean(todayCompletedLog);
    const xpToAdd = dayAlreadyHadCompletedWorkout ? 50 : 100;
    const currentProfile = profileRef.current || profile || {};
    const newXP = (currentProfile?.xp || 0) + xpToAdd;
    const newStreak =
      dayAlreadyHadCompletedWorkout
        ? currentProfile?.streak || 0
        : missedDaysBeforeToday > 2
          ? 1
          : (currentProfile?.streak || 0) + 1;

    const { error: profileError } = await updateProfileStats(user.id, {
      xp: newXP,
      streak: newStreak,
    });

    if (profileError) {
      reportError(profileError, translate("Error updating profile."));
      setFinishingWorkout(false);
      return;
    }

    await logXP(user.id, xpToAdd, isAlternative ? "alternative_workout" : "workout");

    await unlockAchievement(user.id, "💪 First Workout");

    if (newStreak >= 7) {
      await unlockAchievement(user.id, "🔥 7 Day Streak");
    }

    if (newXP >= 1000) {
      await unlockAchievement(user.id, "🏆 1000 XP");
    }

    if (newXP >= 10000) {
      await unlockAchievement(user.id, "👑 10K XP");
    }

    updateLocalProfile({
      xp: newXP,
      streak: newStreak,
    });

    toast.success(
      language === "pt"
        ? `${successLabel} concluído! ${caloriesBurned} kcal estimadas. +${xpToAdd} XP`
        : `${successLabel} completed! ${caloriesBurned} estimated kcal. +${xpToAdd} XP`,
    );

    void workoutTimerNotification
      .showWorkoutCompleted({
        title:
          language === "pt"
            ? `${successLabel} concluído`
            : `${successLabel} completed`,
        body:
          language === "pt"
            ? `Você queimou cerca de ${caloriesBurned} kcal neste treino. +${xpToAdd} XP`
            : `You burned about ${caloriesBurned} kcal in this workout. +${xpToAdd} XP`,
      })
      .catch((error) => {
        reportError(error, "Error showing workout completion notification.");
      });

    clearWorkoutTimer();
    setFinishingWorkout(false);
  }

  async function recordCardioWorkout({
    cardioType,
    distanceKm = null,
    durationSeconds,
  }) {
    if (!activePlan) return;

    if (cardioWorkoutAlreadyCompletedToday) {
      toast.error(
        language === "pt"
          ? "O cardio de hoje já foi registrado."
          : "Today's cardio is already logged.",
      );
      return;
    }

    setFinishingWorkout(true);

    const finishedAt = new Date();
    const startedAtDate = new Date(
      finishedAt.getTime() - durationSeconds * 1000,
    );
    const caloriesBurned = calculateCaloriesBurned({
      cardioType,
      distanceKm,
      durationSeconds,
      latestBodyMeasurement,
      profile,
      workoutType: "cardio",
    });
    const cardioLogPayload = {
      user_id: user.id,
      workout_plan_id: activePlan.id,
      workout_day: "Cardio",
      workout_date: today,
      calories_burned: caloriesBurned,
      status: "completed",
      started_at: startedAtDate.toISOString(),
      completed_at: finishedAt.toISOString(),
      duration_seconds: durationSeconds,
      workout_type: "cardio",
      distance_km: distanceKm,
      notes:
        language === "pt"
          ? `Cardio: ${cardioType}.`
          : `Cardio: ${cardioType}.`,
    };

    const { data: insertedLog, error } =
      await createCompletedWorkoutLogWithDuration(cardioLogPayload);

    if (error) {
      reportError(error, translate("Error completing workout."));
      setFinishingWorkout(false);
      return;
    }

    setWorkoutLogs((prev) => [insertedLog, ...prev]);

    const currentProfile = profileRef.current || profile || {};
    const newXP = (currentProfile?.xp || 0) + CARDIO_XP_REWARD;
    const { error: profileError } = await updateProfileStats(user.id, {
      xp: newXP,
    });

    if (profileError) {
      reportError(profileError, translate("Error updating profile."));
      setFinishingWorkout(false);
      return;
    }

    await logXP(user.id, CARDIO_XP_REWARD, "cardio");

    if (newXP >= 1000) {
      await unlockAchievement(user.id, "🏆 1000 XP");
    }

    if (newXP >= 10000) {
      await unlockAchievement(user.id, "👑 10K XP");
    }

    updateLocalProfile({
      xp: newXP,
    });

    toast.success(
      language === "pt"
        ? `Cardio registrado! ${caloriesBurned} kcal estimadas. +${CARDIO_XP_REWARD} XP`
        : `Cardio logged! ${caloriesBurned} estimated kcal. +${CARDIO_XP_REWARD} XP`,
    );
    setFinishingWorkout(false);
  }

  async function finishWorkout() {
    if (nonTrainingDayAlreadyRecordedToday) {
      toast.error(translate("Today's workout already has a record."));
      return;
    }

    if (todayTotalExercises === 0) {
      toast.error(
        language === "pt"
          ? `Nenhum exercício encontrado para ${getDayLabel(activeWorkoutDayForToday)}.`
          : `No exercises found for ${getDayLabel(activeWorkoutDayForToday)}.`,
      );
      return;
    }

    if (!todayWorkoutCompleted) {
      toast.error(
        language === "pt"
          ? `Complete todos os exercícios de ${getDayLabel(activeWorkoutDayForToday)} primeiro.`
          : `Complete all exercises from ${getDayLabel(activeWorkoutDayForToday)} first.`,
      );
      return;
    }

    await recordCompletedWorkout({
      successLabel: getDayLabel(activeWorkoutDayForToday),
      workoutDayOverride: activeWorkoutDayForToday,
    });
  }

  async function completeAlternativeWorkout(option) {
    const title = language === "pt" ? option.titlePt : option.titleEn;
    let durationSeconds = option.durationSeconds;
    let extraLogFields = {
      workout_type: option.id,
      notes: title,
    };

    if (option.id === "cardio") {
      const cardioType = cardioLogForm.type.trim();
      const durationMinutes = parseDecimalInput(cardioLogForm.durationMinutes);
      const distanceKm = cardioLogForm.distanceKm
        ? parseDecimalInput(cardioLogForm.distanceKm)
        : null;

      if (!cardioType) {
        toast.error(
          language === "pt"
            ? "Informe o tipo de cardio."
            : "Enter the cardio type.",
        );
        return;
      }

      if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
        toast.error(
          language === "pt"
            ? "Informe a duração do cardio em minutos."
            : "Enter cardio duration in minutes.",
        );
        return;
      }

      if (cardioLogForm.distanceKm && (!Number.isFinite(distanceKm) || distanceKm < 0)) {
        toast.error(
          language === "pt"
            ? "Informe uma distância válida."
            : "Enter a valid distance.",
        );
        return;
      }

      durationSeconds = Math.round(durationMinutes * 60);

      const confirmCardio = confirm(
        language === "pt"
          ? `Registrar cardio de ${durationMinutes} min? Ele ficará separado da musculação.`
          : `Log ${durationMinutes} min of cardio? It will stay separate from strength training.`,
      );

      if (!confirmCardio) return;

      await recordCardioWorkout({
        cardioType,
        distanceKm,
        durationSeconds,
      });

      setCardioLogForm({
        type: "",
        durationMinutes: "",
        distanceKm: "",
      });
      setShowAlternativeWorkouts(false);
      return;
    }

    const confirmAlternative = confirm(
      language === "pt"
        ? `Registrar "${title}" como treino de hoje? Isso conta para XP, calendário e sequência.`
        : `Log "${title}" as today's workout? This counts for XP, calendar and streak.`,
    );

    if (!confirmAlternative) return;

    await recordCompletedWorkout({
      durationSecondsOverride: durationSeconds,
      extraLogFields,
      isAlternative: true,
      successLabel: title,
      workoutType: option.id,
      workoutDayOverride:
        option.id === "cardio"
          ? `${activeWorkoutDayForToday} - Cardio`
          : `${activeWorkoutDayForToday} - Casa`,
    });
    setCardioLogForm({
      type: "",
      durationMinutes: "",
      distanceKm: "",
    });
    setShowAlternativeWorkouts(false);
  }

  async function skipWorkout() {
    if (!activePlan) return;

    if (workoutAlreadyRecordedToday) {
      toast.error(translate("Today's workout already has a record."));
      return;
    }

    const skippedWorkoutDay = activeWorkoutDayForToday;
    const confirmSkip = confirm(
      language === "pt"
        ? `Pular ${getDayLabel(skippedWorkoutDay)}? Isso avançará para o próximo treino.`
        : `Skip ${getDayLabel(skippedWorkoutDay)}? This will advance to the next workout.`,
    );

    if (!confirmSkip) return;

    setFinishingWorkout(true);

    const { data: insertedLog, error } = await createWorkoutLog({
      user_id: user.id,
      workout_plan_id: activePlan.id,
      workout_day: skippedWorkoutDay,
      workout_date: today,
      status: "skipped",
    });

    if (error) {
      reportError(error, translate("Error skipping workout."));
      setFinishingWorkout(false);
      return;
    }

    const updatedWorkoutLogs = [insertedLog, ...workoutLogs];
    const weeklyNonTrainingDays = getWeeklyNonTrainingDays(
      updatedWorkoutLogs,
      today,
      true,
    );
    const shouldResetStreak = weeklyNonTrainingDays > 2;

    if (shouldResetStreak && (profile?.streak || 0) > 0) {
      await resetDashboardStreak();
    }

    const nextDayAfterSkip = getNextWorkoutDayAfter(
      skippedWorkoutDay,
      exercises,
    );

    setWorkoutLogs(updatedWorkoutLogs);
    setSelectedWorkoutDay(nextDayAfterSkip);

    toast.success(
      shouldResetStreak
        ? language === "pt"
          ? "Você passou de 2 dias sem treino nesta semana. Sua sequência foi zerada."
          : "You passed 2 non-training days this week. Your streak was reset."
        : language === "pt"
          ? `${getDayLabel(skippedWorkoutDay)} pulado. Próximo: ${getDayLabel(
              nextDayAfterSkip,
            )}.`
          : `${getDayLabel(skippedWorkoutDay)} skipped. Next: ${getDayLabel(
              nextDayAfterSkip,
            )}.`,
    );

    clearWorkoutTimer();
    setFinishingWorkout(false);
  }

  async function markRestDay() {
    if (!activePlan) return;

    if (workoutAlreadyRecordedToday) {
      toast.error(translate("Today's workout already has a record."));
      return;
    }

    const restWorkoutDay = activeWorkoutDayForToday;
    const restDayNumber = weeklyRestDaysUsed + 1;
    const confirmRest = confirm(
      language === "pt"
        ? restDayNumber <= 2
          ? `Marcar hoje como descanso? Você já usou ${weeklyRestDaysUsed}/2 descansos nesta semana.`
          : "Você já usou 2 descansos nesta semana. Marcar outro dia sem treino vai zerar sua sequência. Continuar?"
        : restDayNumber <= 2
          ? `Mark today as rest? You already used ${weeklyRestDaysUsed}/2 rest days this week.`
          : "You already used 2 rest days this week. Marking another non-training day will reset your streak. Continue?",
    );

    if (!confirmRest) return;

    setFinishingWorkout(true);

    const { data: insertedLog, error } = await createWorkoutLog({
      user_id: user.id,
      workout_plan_id: activePlan.id,
      workout_day: restWorkoutDay,
      workout_date: today,
      status: "rest",
    });

    if (error) {
      reportError(error, translate("Error skipping workout."));
      setFinishingWorkout(false);
      return;
    }

    const updatedWorkoutLogs = [insertedLog, ...workoutLogs];
    const weeklyNonTrainingDays = getWeeklyNonTrainingDays(
      updatedWorkoutLogs,
      today,
      true,
    );
    const shouldResetStreak = weeklyNonTrainingDays > 2;

    if (shouldResetStreak && (profile?.streak || 0) > 0) {
      await resetDashboardStreak();
    }

    const nextDayAfterRest = getNextWorkoutDayAfter(
      restWorkoutDay,
      exercises,
    );

    setWorkoutLogs(updatedWorkoutLogs);
    setSelectedWorkoutDay(nextDayAfterRest);

    toast.success(
      shouldResetStreak
        ? language === "pt"
          ? "Você passou de 2 dias sem treino nesta semana. Sua sequência foi zerada."
          : "You passed 2 non-training days this week. Your streak was reset."
        : language === "pt"
          ? `Descanso registrado. Próximo: ${getDayLabel(nextDayAfterRest)}.`
          : `Rest day logged. Next: ${getDayLabel(nextDayAfterRest)}.`,
    );

    clearWorkoutTimer();
    setFinishingWorkout(false);
  }

  function getExerciseSetLogs(exerciseId) {
    return setLogs
      .filter((log) => log.exercise_id === exerciseId)
      .sort((a, b) => {
        const dateComparison = getWorkoutDateKey(b.workout_date).localeCompare(
          getWorkoutDateKey(a.workout_date),
        );

        if (dateComparison !== 0) {
          return dateComparison;
        }

        return a.set_number - b.set_number;
      });
  }

  function getTodayExerciseSetLogs(exerciseId) {
    return getExerciseSetLogs(exerciseId).filter(
      (log) => getWorkoutDateKey(log.workout_date) === today,
    );
  }

  function getPlannedSetsCount(exercise) {
    const parsedSets = Number.parseInt(exercise.sets, 10);

    if (Number.isNaN(parsedSets) || parsedSets <= 0) {
      return 3;
    }

    return parsedSets;
  }

  function createInitialSetRows(exercise) {
    const existingLogs = getTodayExerciseSetLogs(exercise.id);

    if (existingLogs.length > 0) {
      return existingLogs.map((log) => ({
        set_number: log.set_number,
        load: log.load ?? "",
        reps: log.reps ?? "",
      }));
    }

    const setsCount = getPlannedSetsCount(exercise);

    return Array.from({ length: setsCount }, (_, index) => ({
      set_number: index + 1,
      load: "",
      reps: "",
    }));
  }

  function openSetLogger(exercise) {
    setExpandedSetLoggerId((currentId) =>
      currentId === exercise.id ? null : exercise.id,
    );

    setSetLogForms((prev) => {
      if (prev[exercise.id]) {
        return prev;
      }

      return {
        ...prev,
        [exercise.id]: {
          difficulty: "moderate",
          notes: "",
          sets: createInitialSetRows(exercise),
        },
      };
    });
  }

  function updateSetRow(exerciseId, index, field, value) {
    setSetLogForms((prev) => {
      const currentForm = prev[exerciseId];

      if (!currentForm) {
        return prev;
      }

      const updatedSets = currentForm.sets.map((setRow, rowIndex) => {
        if (rowIndex !== index) {
          return setRow;
        }

        return {
          ...setRow,
          [field]: value,
        };
      });

      return {
        ...prev,
        [exerciseId]: {
          ...currentForm,
          sets: updatedSets,
        },
      };
    });
  }

  function updateSetFormField(exerciseId, field, value) {
    setSetLogForms((prev) => {
      const currentForm = prev[exerciseId];

      if (!currentForm) {
        return prev;
      }

      return {
        ...prev,
        [exerciseId]: {
          ...currentForm,
          [field]: value,
        },
      };
    });
  }

  function addSetRow(exerciseId) {
    setSetLogForms((prev) => {
      const currentForm = prev[exerciseId];

      if (!currentForm) {
        return prev;
      }

      const nextSetNumber = currentForm.sets.length + 1;

      return {
        ...prev,
        [exerciseId]: {
          ...currentForm,
          sets: [
            ...currentForm.sets,
            {
              set_number: nextSetNumber,
              load: "",
              reps: "",
            },
          ],
        },
      };
    });
  }

  function removeSetRow(exerciseId, index) {
    setSetLogForms((prev) => {
      const currentForm = prev[exerciseId];

      if (!currentForm || currentForm.sets.length <= 1) {
        return prev;
      }

      const updatedSets = currentForm.sets
        .filter((_, rowIndex) => rowIndex !== index)
        .map((setRow, rowIndex) => ({
          ...setRow,
          set_number: rowIndex + 1,
        }));

      return {
        ...prev,
        [exerciseId]: {
          ...currentForm,
          sets: updatedSets,
        },
      };
    });
  }

  async function markExerciseCompletedAfterSetLog(exercise) {
    const existingProgress = progress.find(
      (item) => item.exercise_id === exercise.id,
    );

    if (existingProgress) {
      if (existingProgress.completed) {
        return;
      }

      const { data, error } = await updateWorkoutProgress(
        existingProgress.id,
        {
          completed: true,
          completed_at: new Date().toISOString(),
        },
      );

      if (error) {
        reportError(error);
        return;
      }

      setProgress((prev) =>
        prev.map((item) => (item.id === existingProgress.id ? data : item)),
      );

      return;
    }

    const { data, error } = await createWorkoutProgress({
      user_id: user.id,
      workout_plan_id: activePlan.id,
      exercise_id: exercise.id,
      workout_date: today,
      completed: true,
      completed_at: new Date().toISOString(),
    });

    if (error) {
      reportError(error);
      return;
    }

    setProgress((prev) => [...prev, data]);
  }

  async function saveExerciseSetLogs(exercise) {
    if (!activePlan) return;

    if (workoutAlreadyCompletedToday || nonTrainingDayAlreadyRecordedToday) {
      toast.error(
        workoutAlreadyCompletedToday
          ? translate("Today's workout is already completed.")
          : translate("Today's workout already has a record."),
      );
      return;
    }

    const exerciseDay = exercise.workout_day || "Treino A";

    if (exerciseDay !== activeWorkoutDayForToday) {
      toast.error(
        language === "pt"
          ? `Hoje é dia de ${getDayLabel(activeWorkoutDayForToday)}.`
          : `Today is ${getDayLabel(activeWorkoutDayForToday)} day.`,
      );
      return;
    }

    startWorkoutTimer();

    const form = setLogForms[exercise.id];

    if (!form) {
      toast.error(translate("Open the set logger first."));
      return;
    }

    const validSets = form.sets
      .map((setRow, index) => ({
        user_id: user.id,
        workout_plan_id: activePlan.id,
        exercise_id: exercise.id,
        workout_date: today,
        set_number: index + 1,
        reps: parseSetLogNumber(setRow.reps),
        load: parseSetLogNumber(setRow.load),
        difficulty: form.difficulty,
        notes: form.notes?.trim() || null,
      }))
      .filter((setRow) => setRow.reps !== null || setRow.load !== null);

    if (validSets.length === 0) {
      toast.error(translate("Enter at least one load or reps value."));
      return;
    }

    const hasInvalidNumbers = validSets.some((setRow) => {
      const hasInvalidReps =
        setRow.reps !== null &&
        (!Number.isFinite(setRow.reps) ||
          !Number.isInteger(setRow.reps) ||
          setRow.reps < 0);
      const hasInvalidLoad =
        setRow.load !== null &&
        (!Number.isFinite(setRow.load) || setRow.load < 0);

      return hasInvalidReps || hasInvalidLoad;
    });

    if (hasInvalidNumbers) {
      toast.error(translate("Use valid positive numbers for load and reps."));
      return;
    }

    setSavingSetLogs(true);

    const { data, error } = await upsertWorkoutSetLogs(validSets);

    if (error) {
      reportError(error, translate("Error saving set logs."));
      setSavingSetLogs(false);
      return;
    }

    const savedSetNumbers = validSets.map((setRow) => setRow.set_number);
    const { error: deleteError } = await deleteWorkoutSetLogsOutsideSetNumbers({
      exerciseId: exercise.id,
      setNumbers: savedSetNumbers,
      userId: user.id,
      workoutDate: today,
      workoutPlanId: activePlan.id,
    });

    if (deleteError) {
      reportError(deleteError, translate("Error updating set logs."));
      setSavingSetLogs(false);
      return;
    }

    const savedLogs = (data || []).sort(
      (a, b) => a.set_number - b.set_number,
    );

    setSetLogs((prev) => {
      const withoutCurrentExercise = prev.filter(
        (log) =>
          !(
            log.exercise_id === exercise.id &&
            getWorkoutDateKey(log.workout_date) === today &&
            log.workout_plan_id === activePlan.id
          ),
      );

      return [...withoutCurrentExercise, ...savedLogs];
    });

    setSetLogForms((prev) => ({
      ...prev,
      [exercise.id]: {
        ...form,
        sets: savedLogs.map((log) => ({
          set_number: log.set_number,
          load: log.load ?? "",
          reps: log.reps ?? "",
        })),
      },
    }));

    await markExerciseCompletedAfterSetLog(exercise);

    toast.success(translate("Exercise performance saved!"));

    setSavingSetLogs(false);
  }

  if (loading) {
    return (
      <div
        className="
          bg-white
          border
          border-zinc-200
          rounded-2xl
          sm:rounded-3xl
          p-5
          sm:p-8
          shadow-sm

          dark:bg-white/5
          dark:border-white/10
        "
      >
        <div className="h-8 w-52 bg-zinc-200 dark:bg-white/10 rounded-xl animate-pulse mb-6" />
        <div className="h-48 bg-zinc-100 dark:bg-white/5 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 40,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="
        w-full
        bg-white
        text-zinc-950
        border
        border-zinc-200
        rounded-2xl
        sm:rounded-3xl
        p-4
        sm:p-6
        md:p-8
        shadow-sm
        transition-colors
        min-w-0

        dark:bg-white/5
        dark:text-white
        dark:border-white/10
        dark:backdrop-blur-xl
      "
    >
      <WorkoutHeader
        activePlan={activePlan}
        displayWorkoutDay={displayWorkoutDay}
        getDayLabel={getDayLabel}
        setShowCreatePlan={setShowCreatePlan}
        setShowTemplates={setShowTemplates}
        showCreatePlan={showCreatePlan}
        showTemplates={showTemplates}
        workoutAlreadyCompletedToday={workoutAlreadyCompletedToday}
      />

      {showTemplates && (
        <WorkoutTemplatesPanel
          creatingTemplate={creatingTemplate}
          onCreateTemplate={createWorkoutFromTemplate}
          templates={workoutTemplates}
        />
      )}

      <CreateWorkoutPlanForm
        createWorkoutPlan={createWorkoutPlan}
        creatingPlan={creatingPlan}
        newPlan={newPlan}
        setNewPlan={setNewPlan}
        showCreatePlan={showCreatePlan}
      />
      {/* PLANS */}
      {(plans.length > 0 || archivedPlans.length > 0) && (
        <div
          className="
            bg-zinc-50
            border
            border-zinc-200
            rounded-2xl
            p-4
            sm:p-5
            mb-6

            dark:bg-black/30
            dark:border-white/10
          "
        >
          <div
            className="
              flex
              flex-col
              sm:flex-row
              sm:items-center
              sm:justify-between
              gap-3
              mb-4
            "
          >
            <div>
              <h3 className="font-black text-lg sm:text-xl">
                {t("workout.plansTitle")}
              </h3>

              <p className="text-zinc-500 text-sm mt-1">
                {t("workout.plansDescription")}
              </p>
            </div>

            <button
              onClick={() => setShowPlanTools((prev) => !prev)}
              className="
                w-full
                sm:w-auto
                px-4
                py-2
                rounded-xl
                bg-white
                border
                border-zinc-200
                text-zinc-700
                font-bold
                flex
                items-center
                justify-center
                gap-2
                hover:border-purple-500
                transition

                dark:bg-black/30
                dark:border-white/10
                dark:text-zinc-300
              "
            >
              <Settings2 size={17} />
              {t("common.manage")}
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setPlanListView("active")}
              className={`
                px-4
                py-2
                rounded-xl
                text-sm
                font-bold
                transition

                ${
                  planListView === "active"
                    ? "bg-purple-500 text-white"
                    : "bg-white border border-zinc-200 text-zinc-600 hover:border-purple-500 dark:bg-black/30 dark:border-white/10 dark:text-zinc-300"
                }
              `}
            >
              {t("common.active")} ({plans.length})
            </button>

            <button
              type="button"
              onClick={() => setPlanListView("archived")}
              className={`
                px-4
                py-2
                rounded-xl
                text-sm
                font-bold
                transition

                ${
                  planListView === "archived"
                    ? "bg-purple-500 text-white"
                    : "bg-white border border-zinc-200 text-zinc-600 hover:border-purple-500 dark:bg-black/30 dark:border-white/10 dark:text-zinc-300"
                }
              `}
            >
              {t("common.archived")} ({archivedPlans.length})
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {displayedPlans.length === 0 ? (
              <div
                className="
                  w-full
                  rounded-2xl
                  border
                  border-dashed
                  border-zinc-300
                  p-5
                  text-center
                  text-zinc-500
                  text-sm

                  dark:border-white/10
                "
              >
                {planListView === "archived"
                  ? t("workout.noArchivedPlans")
                  : t("workout.noActivePlans")}
              </div>
            ) : (
              displayedPlans.map((plan) => (
              <div
                key={plan.id}
                className={`
                  shrink-0
                  flex
                  items-center
                  gap-2
                  rounded-2xl
                  border
                  px-3
                  py-2
                  transition

                  ${
                    activePlan?.id === plan.id
                      ? "bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white border-transparent"
                      : "bg-white border-zinc-200 text-zinc-700 hover:border-purple-500 dark:bg-black/30 dark:border-white/10 dark:text-zinc-300"
                  }
                `}
              >
                <button
                  onClick={() => {
                    if (planListView === "active") {
                      selectPlan(plan);
                    }
                  }}
                  disabled={planListView === "archived"}
                  className="font-bold text-sm px-2 py-1 max-w-[190px] truncate"
                  title={translate(plan.title)}
                >
                  {translate(plan.title)}
                </button>

                {showPlanTools && planListView === "active" && (
                  <>
                    <button
                      onClick={() => startEditPlan(plan)}
                      className="
                        w-8
                        h-8
                        rounded-xl
                        flex
                        items-center
                        justify-center
                        hover:bg-white/20
                        transition
                      "
                    title={t("workout.editPlan")}
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => archiveWorkoutPlan(plan.id)}
                      disabled={deletingPlan}
                      className="
                        w-8
                        h-8
                        rounded-xl
                        flex
                        items-center
                        justify-center
                        hover:bg-red-500/20
                        hover:text-red-300
                        transition
                        disabled:opacity-50
                      "
                    title={t("workout.archivePlan")}
                    >
                      <Archive size={16} />
                    </button>
                  </>
                )}

                {showPlanTools && planListView === "archived" && (
                  <button
                    onClick={() => restoreWorkoutPlan(plan.id)}
                    disabled={deletingPlan}
                    className="
                      w-8
                      h-8
                      rounded-xl
                      flex
                      items-center
                      justify-center
                      hover:bg-green-500/20
                      hover:text-green-300
                      transition
                      disabled:opacity-50
                    "
                    title={t("workout.restorePlan")}
                  >
                    <RotateCcw size={16} />
                  </button>
                )}
              </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* EDIT PLAN */}
      {editingPlan && (
        <div
          className="
            bg-zinc-50
            border
            border-zinc-200
            rounded-2xl
            p-4
            sm:p-5
            mb-6

            dark:bg-black/30
            dark:border-white/10
          "
        >
          <h3 className="font-black text-lg sm:text-xl mb-4">
            {t("workout.editPlan")}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-3">
            <input
              type="text"
              placeholder={t("workout.planName")}
              value={editPlanData.title}
              onChange={(e) =>
                setEditPlanData((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              className="WorkoutInput"
            />

            <input
              type="text"
              placeholder={t("workout.planDescription")}
              value={editPlanData.description}
              onChange={(e) =>
                setEditPlanData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="WorkoutInput"
            />

            <button
              onClick={updateWorkoutPlan}
              disabled={updatingPlan}
              className="
                w-full
                md:w-auto
                px-5
                py-3
                rounded-2xl
                bg-green-600
                text-white
                font-bold
                flex
                items-center
                justify-center
                gap-2
                disabled:opacity-50
              "
            >
              {updatingPlan ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Save size={18} />
              )}
              {t("common.save")}
            </button>

            <button
              onClick={cancelEditPlan}
              className="
                w-full
                md:w-auto
                px-5
                py-3
                rounded-2xl
                bg-zinc-200
                text-zinc-700
                font-bold
                flex
                items-center
                justify-center
                gap-2
                hover:bg-zinc-300
                transition

                dark:bg-white/10
                dark:text-white
                dark:hover:bg-white/20
              "
            >
              <X size={18} />
              {t("common.cancel")}
            </button>
          </div>
        </div>
      )}

      {!activePlan && (
        <div
          className="
            bg-zinc-50
            border
            border-zinc-200
            rounded-2xl
            p-8
            text-center
            text-zinc-500

            dark:bg-black/30
            dark:border-white/10
          "
        >
          Nenhum treino criado ainda. Clique em <strong>New workout</strong>{" "}
          para começar ou use um <strong>Template</strong>.
        </div>
      )}

      {activePlan && (
        <>
          <CurrentWorkoutCard
            activePlan={activePlan}
            activeWorkoutDayForToday={activeWorkoutDayForToday}
            availableTrainingWorkoutDays={availableTrainingWorkoutDays}
            chooseWorkoutDayForToday={chooseWorkoutDayForToday}
            currentWorkoutDay={currentWorkoutDay}
            displayNextWorkoutDay={displayNextWorkoutDay}
            displayWorkoutCompletedCount={displayWorkoutCompletedCount}
            displayWorkoutDay={displayWorkoutDay}
            displayWorkoutProgressPercent={displayWorkoutProgressPercent}
            displayWorkoutTotalExercises={displayWorkoutTotalExercises}
            elapsedWorkoutSeconds={elapsedWorkoutSeconds}
            formatWorkoutDate={formatWorkoutDate}
            formatWorkoutDuration={formatWorkoutDuration}
            getDayLabel={getDayLabel}
            lastCompletedWorkoutDay={lastCompletedWorkoutDay}
            lastCompletedWorkoutLog={lastCompletedWorkoutLog}
            clearWorkoutTimer={clearWorkoutTimer}
            pauseWorkoutTimer={pauseWorkoutTimer}
            startWorkoutTimer={startWorkoutTimer}
            todayCompletedLog={todayCompletedLog}
            todayTotalExercises={todayTotalExercises}
            workoutAlreadyCompletedToday={workoutAlreadyCompletedToday}
            workoutAlreadyRecordedToday={workoutAlreadyRecordedToday}
            workoutTimerActive={workoutTimerActive}
            workoutTimerPaused={workoutTimerPaused}
            workoutTimerRunning={workoutTimerRunning}
          />

          <WorkoutQuickTools
            displayWorkoutDay={displayWorkoutDay}
            finishingWorkout={finishingWorkout}
            markRestDay={markRestDay}
            restDaysAllowed={2}
            restDaysUsed={weeklyRestDaysUsed}
            setSelectedWorkoutDay={setSelectedWorkoutDay}
            setShowAddExercise={setShowAddExercise}
            setShowAlternativeWorkouts={setShowAlternativeWorkouts}
            setShowFocusEditor={setShowFocusEditor}
            showAddExercise={showAddExercise}
            showAlternativeWorkouts={showAlternativeWorkouts}
            showFocusEditor={showFocusEditor}
            skipWorkout={skipWorkout}
            workoutAlreadyCompletedToday={workoutAlreadyCompletedToday}
            workoutAlreadyRecordedToday={workoutAlreadyRecordedToday}
          />

          {showAlternativeWorkouts && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="
                bg-white
                dark:bg-zinc-900
                border
                border-zinc-200
                dark:border-white/10
                rounded-2xl
                p-5
                mb-6
              "
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-black">
                    {language === "pt"
                      ? "Alternativas para hoje"
                      : "Alternatives for today"}
                  </h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    {language === "pt"
                      ? "Use quando não conseguir ir à academia, sem perder o dia."
                      : "Use these when you cannot go to the gym without losing the day."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAlternativeWorkouts(false)}
                  className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alternativeWorkoutOptions.map((option) => {
                  const Icon = option.icon;
                  const title = language === "pt" ? option.titlePt : option.titleEn;
                  const description =
                    language === "pt" ? option.descriptionPt : option.descriptionEn;
                  const steps = language === "pt" ? option.stepsPt : option.stepsEn;

                  return (
                    <div
                      key={option.id}
                      className="
                        border
                        border-zinc-200
                        dark:border-white/10
                        rounded-2xl
                        p-4
                        bg-zinc-50
                        dark:bg-black/20
                      "
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="
                            w-11
                            h-11
                            rounded-2xl
                            bg-rose-500/10
                            text-rose-500
                            flex
                            items-center
                            justify-center
                            shrink-0
                          "
                        >
                          <Icon size={20} />
                        </div>

                        <div>
                          <h4 className="font-black">{title}</h4>
                          <p className="text-sm text-zinc-500 mt-1">
                            {description}
                          </p>
                        </div>
                      </div>

                      <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                        {steps.map((step) => (
                          <li key={step} className="flex gap-2">
                            <CheckCircle
                              size={16}
                              className="text-green-500 shrink-0 mt-0.5"
                            />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>

                      {option.id === "cardio" && (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <label className="block">
                            <span className="text-xs font-bold text-zinc-500">
                              {language === "pt" ? "Tipo" : "Type"}
                            </span>
                            <input
                              type="text"
                              value={cardioLogForm.type}
                              onChange={(event) =>
                                setCardioLogForm((prev) => ({
                                  ...prev,
                                  type: event.target.value,
                                }))
                              }
                              placeholder={
                                language === "pt"
                                  ? "Corrida, bike..."
                                  : "Run, bike..."
                              }
                              className="WorkoutInput mt-1"
                            />
                          </label>

                          <label className="block">
                            <span className="text-xs font-bold text-zinc-500">
                              {language === "pt" ? "Minutos" : "Minutes"}
                            </span>
                            <input
                              type="number"
                              min="1"
                              inputMode="decimal"
                              value={cardioLogForm.durationMinutes}
                              onChange={(event) =>
                                setCardioLogForm((prev) => ({
                                  ...prev,
                                  durationMinutes: event.target.value,
                                }))
                              }
                              placeholder="20"
                              className="WorkoutInput mt-1"
                            />
                          </label>

                          <label className="block">
                            <span className="text-xs font-bold text-zinc-500">
                              {language === "pt" ? "Km" : "Km"}
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              inputMode="decimal"
                              value={cardioLogForm.distanceKm}
                              onChange={(event) =>
                                setCardioLogForm((prev) => ({
                                  ...prev,
                                  distanceKm: event.target.value,
                                }))
                              }
                              placeholder="3.5"
                              className="WorkoutInput mt-1"
                            />
                          </label>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => completeAlternativeWorkout(option)}
                        disabled={
                          (option.id === "cardio"
                            ? cardioWorkoutAlreadyCompletedToday
                            : alternativeWorkoutAlreadyCompletedToday ||
                              nonTrainingDayAlreadyRecordedToday) ||
                          finishingWorkout
                        }
                        className="
                          w-full
                          mt-4
                          px-4
                          py-3
                          rounded-2xl
                          bg-rose-500
                          text-white
                          font-black
                          disabled:opacity-50
                          transition
                        "
                      >
                        {option.id === "cardio"
                          ? language === "pt"
                            ? "Registrar cardio"
                            : "Log cardio"
                          : language === "pt"
                            ? "Registrar como treino"
                            : "Log as workout"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* DAY FOCUSES */}
          {showFocusEditor && (
            <div
              className="
                bg-zinc-50
                border
                border-zinc-200
                rounded-2xl
                p-4
                sm:p-5
                mb-6

                dark:bg-black/30
                dark:border-white/10
              "
            >
              <div
                className="
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  gap-4
                  mb-4
                "
              >
                <div>
                  <h3 className="font-black text-lg sm:text-xl">
                    {translate("Workout focuses")}
                  </h3>

                  <p className="text-zinc-500 text-sm mt-1">
                    {language === "pt"
                      ? "Defina o foco principal de cada treino."
                      : "Define the main focus for each workout."}
                  </p>
                </div>

                <button
                  onClick={updateDayFocuses}
                  disabled={updatingFocuses}
                  className="
                    w-full
                    sm:w-auto
                    px-5
                    py-3
                    rounded-2xl
                    bg-gradient-to-r
                    from-purple-500
                    to-fuchsia-500
                    text-white
                    font-bold
                    flex
                    items-center
                    justify-center
                    gap-2
                    disabled:opacity-50
                  "
                >
                  {updatingFocuses ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  {language === "pt" ? "Salvar focos" : "Save focuses"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {workoutDayOptions.map((day) => (
                  <div key={day}>
                    <label className="block text-sm font-bold text-zinc-600 dark:text-zinc-300 mb-2">
                      {translate(day)}
                    </label>

                    <input
                      type="text"
                      placeholder={
                        day === "Treino A"
                          ? language === "pt"
                            ? "Ex: Peito e Tríceps"
                            : "Ex: Chest and Triceps"
                          : day === "Treino B"
                            ? language === "pt"
                              ? "Ex: Costas e Bíceps"
                              : "Ex: Back and Biceps"
                            : day === "Treino C"
                              ? language === "pt"
                                ? "Ex: Pernas e Abdômen"
                                : "Ex: Legs and Abs"
                              : language === "pt"
                                ? "Ex: Ombros, Cardio..."
                                : "Ex: Shoulders, Cardio..."
                      }
                      value={dayFocuses?.[day] || ""}
                      onChange={(e) =>
                        setDayFocuses((prev) => ({
                          ...prev,
                          [day]: e.target.value,
                        }))
                      }
                      className="WorkoutInput"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ADD EXERCISE */}
          {showAddExercise && (
            <div
              className="
                bg-zinc-50
                border
                border-zinc-200
                rounded-2xl
                p-4
                sm:p-5
                mb-6

                dark:bg-black/30
                dark:border-white/10
              "
            >
              <h3 className="font-black text-lg sm:text-xl mb-4">
                {translate("Add exercise")}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[.9fr_1.4fr_.7fr_.7fr_.7fr_auto] gap-3">
                <select
                  value={newExercise.workout_day}
                  onChange={(e) =>
                    setNewExercise((prev) => ({
                      ...prev,
                      workout_day: e.target.value,
                    }))
                  }
                  className="WorkoutInput"
                >
                  {workoutDayOptions.map((day) => (
                    <option key={day} value={day}>
                      {getDayLabel(day)}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder={translate("Exercise")}
                  value={newExercise.name}
                  onChange={(e) =>
                    setNewExercise((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="WorkoutInput"
                />

                <input
                  type="text"
                  placeholder="Sets"
                  value={newExercise.sets}
                  onChange={(e) =>
                    setNewExercise((prev) => ({
                      ...prev,
                      sets: e.target.value,
                    }))
                  }
                  className="WorkoutInput"
                />

                <input
                  type="text"
                  placeholder="Reps"
                  value={newExercise.reps}
                  onChange={(e) =>
                    setNewExercise((prev) => ({
                      ...prev,
                      reps: e.target.value,
                    }))
                  }
                  className="WorkoutInput"
                />

                <input
                  type="text"
                  placeholder="Load"
                  value={newExercise.load}
                  onChange={(e) =>
                    setNewExercise((prev) => ({
                      ...prev,
                      load: e.target.value,
                    }))
                  }
                  className="WorkoutInput"
                />

                <button
                  onClick={addExercise}
                  disabled={addingExercise}
                  className="
                    w-full
                    lg:w-auto
                    px-5
                    py-3
                    rounded-2xl
                    bg-zinc-950
                    text-white
                    font-bold
                    flex
                    items-center
                    justify-center
                    gap-2
                    disabled:opacity-50

                    dark:bg-white
                    dark:text-black
                  "
                >
                  {addingExercise ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Plus size={18} />
                  )}
                  Add
                </button>
              </div>
            </div>
          )}

          {/* FILTER */}
          {exercises.length > 0 && (
            <div
              className="
                bg-zinc-50
                border
                border-zinc-200
                rounded-2xl
                p-4
                sm:p-5
                mb-6

                dark:bg-black/30
                dark:border-white/10
              "
            >
              <div
                className="
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  gap-4
                  mb-4
                "
              >
                <div>
                  <h3 className="font-black text-lg sm:text-xl">Checklist</h3>

                  <p className="text-zinc-500 text-sm mt-1">
                    {language === "pt"
                      ? `Mostrando ${visibleCompletedCount}/${visibleTotalExercises} concluídos`
                      : `Showing ${visibleCompletedCount}/${visibleTotalExercises} completed`}
                    {selectedWorkoutDay !== "Todos"
                      ? language === "pt"
                        ? ` em ${getDayLabel(selectedWorkoutDay)}`
                        : ` in ${getDayLabel(selectedWorkoutDay)}`
                      : language === "pt"
                        ? " em todos os treinos"
                        : " in all workouts"}
                  </p>
                </div>

                <div
                  className="
                    px-3
                    py-1
                    rounded-full
                    bg-purple-500/10
                    border
                    border-purple-500/20
                    text-purple-500
                    text-xs
                    font-bold
                    w-fit
                  "
                >
                  {visibleProgressPercent}%{" "}
                  {language === "pt" ? "progresso visível" : "visible progress"}
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {availableWorkoutDays.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedWorkoutDay(day)}
                    className={`
                      shrink-0
                      px-4
                      py-2
                      rounded-xl
                      border
                      text-sm
                      font-bold
                      transition

                      ${
                        selectedWorkoutDay === day
                          ? "bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white border-transparent"
                          : "bg-white border-zinc-200 text-zinc-600 hover:border-purple-500 dark:bg-black/30 dark:border-white/10 dark:text-zinc-300"
                      }
                    `}
                  >
                    {day === "Todos" ? translate("Todos") : getDayLabel(day)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* EDIT EXERCISE */}
          {editingExercise && (
            <div
              className="
                bg-zinc-50
                border
                border-zinc-200
                rounded-2xl
                p-4
                sm:p-5
                mb-6

                dark:bg-black/30
                dark:border-white/10
              "
            >
              <h3 className="font-black text-lg sm:text-xl mb-4">
                {translate("Edit exercise")}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[.9fr_1.4fr_.7fr_.7fr_.7fr_auto_auto] gap-3">
                <select
                  value={editExerciseData.workout_day}
                  onChange={(e) =>
                    setEditExerciseData((prev) => ({
                      ...prev,
                      workout_day: e.target.value,
                    }))
                  }
                  className="WorkoutInput"
                >
                  {workoutDayOptions.map((day) => (
                    <option key={day} value={day}>
                      {getDayLabel(day)}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Exercise name"
                  value={editExerciseData.name}
                  onChange={(e) =>
                    setEditExerciseData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="WorkoutInput"
                />

                <input
                  type="text"
                  placeholder="Sets"
                  value={editExerciseData.sets}
                  onChange={(e) =>
                    setEditExerciseData((prev) => ({
                      ...prev,
                      sets: e.target.value,
                    }))
                  }
                  className="WorkoutInput"
                />

                <input
                  type="text"
                  placeholder="Reps"
                  value={editExerciseData.reps}
                  onChange={(e) =>
                    setEditExerciseData((prev) => ({
                      ...prev,
                      reps: e.target.value,
                    }))
                  }
                  className="WorkoutInput"
                />

                <input
                  type="text"
                  placeholder="Load"
                  value={editExerciseData.load}
                  onChange={(e) =>
                    setEditExerciseData((prev) => ({
                      ...prev,
                      load: e.target.value,
                    }))
                  }
                  className="WorkoutInput"
                />

                <button
                  onClick={updateExercise}
                  disabled={updatingExercise}
                  className="
                    w-full
                    lg:w-auto
                    px-5
                    py-3
                    rounded-2xl
                    bg-green-600
                    text-white
                    font-bold
                    flex
                    items-center
                    justify-center
                    gap-2
                    disabled:opacity-50
                  "
                >
                  {updatingExercise ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  Save
                </button>

                <button
                  onClick={cancelEditExercise}
                  className="
                    w-full
                    lg:w-auto
                    px-5
                    py-3
                    rounded-2xl
                    bg-zinc-200
                    text-zinc-700
                    font-bold
                    flex
                    items-center
                    justify-center
                    gap-2
                    hover:bg-zinc-300
                    transition

                    dark:bg-white/10
                    dark:text-white
                    dark:hover:bg-white/20
                  "
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* EXERCISES */}
          <div className="space-y-5 sm:space-y-6">
            {exercises.length === 0 && (
              <div
                className="
                  bg-zinc-50
                  border
                  border-zinc-200
                  rounded-2xl
                  p-8
                  text-center
                  text-zinc-500

                  dark:bg-black/30
                  dark:border-white/10
                "
              >
                No exercises yet. Use <strong>Add exercise</strong> to create
                your first checkpoint.
              </div>
            )}

            {exercises.length > 0 && visibleTotalExercises === 0 && (
              <div
                className="
                  bg-zinc-50
                  border
                  border-zinc-200
                  rounded-2xl
                  p-8
                  text-center
                  text-zinc-500

                  dark:bg-black/30
                  dark:border-white/10
                "
              >
                No exercises found for this filter.
              </div>
            )}

            {orderedGroupedExercises.map(([day, dayExercises]) => (
              <div
                key={day}
                className={`
                  bg-zinc-50
                  border
                  rounded-2xl
                  p-4
                  sm:p-5

                  ${
                    day === activeWorkoutDayForToday && canLogGymWorkoutToday
                      ? "border-purple-500/40 ring-2 ring-purple-500/20"
                      : "border-zinc-200 dark:border-white/10"
                  }

                  dark:bg-black/20
                `}
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-lg sm:text-xl">
                        {getDayLabel(day)}
                      </h3>

                      {day === activeWorkoutDayForToday &&
                        canLogGymWorkoutToday && (
                          <span
                            className="
                            px-3
                            py-1
                            rounded-full
                            bg-purple-500
                            text-white
                            text-[11px]
                            font-bold
                          "
                          >
                            Current
                          </span>
                        )}

                      {todayGymCompletedLog?.workout_day === day && (
                        <span
                          className="
                            px-3
                            py-1
                            rounded-full
                            bg-green-500
                            text-white
                            text-[11px]
                            font-bold
                          "
                        >
                          Completed today
                        </span>
                      )}
                    </div>

                    <p className="text-zinc-500 text-sm mt-1">
                      {dayExercises.length} exercise
                      {dayExercises.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <div
                    className="
                      px-3
                      py-1
                      rounded-full
                      bg-purple-500/10
                      border
                      border-purple-500/20
                      text-purple-500
                      text-xs
                      font-bold
                    "
                  >
                    {
                      dayExercises.filter((exercise) =>
                        isExerciseCompleted(exercise.id),
                      ).length
                    }
                    /{dayExercises.length}
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {dayExercises.map((exercise, exerciseIndex) => {
                    const completed = isExerciseCompleted(exercise.id);
                    const isEditingCurrentExercise =
                      editingExercise?.id === exercise.id;
                    const exerciseWorkoutDay =
                      exercise.workout_day || "Treino A";
                    const isCurrentExercise =
                      exerciseWorkoutDay === activeWorkoutDayForToday;
                    const isDisplayWorkoutExercise =
                      exerciseWorkoutDay === displayWorkoutDay;

                    return (
                      <div key={exercise.id} className="space-y-3">
                        <motion.div
                        initial={{
                          opacity: 0,
                          y: 12,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        className={`
                          flex
                          items-center
                          justify-between
                          gap-4
                          rounded-2xl
                          border
                          p-4
                          sm:p-5
                          transition

                          ${
                            completed
                              ? "bg-green-500/10 border-green-500/30"
                              : "bg-white border-zinc-200 dark:bg-black/30 dark:border-white/10"
                          }

                          ${
                            isEditingCurrentExercise
                              ? "ring-2 ring-purple-500/60"
                              : ""
                          }

                          ${
                            (!isCurrentExercise && canLogGymWorkoutToday) ||
                            (!canLogGymWorkoutToday &&
                              !isDisplayWorkoutExercise)
                              ? "opacity-70"
                              : ""
                          }
                        `}
                      >
                        <div
                          className="
    flex
    items-center
    gap-4
    flex-1
    min-w-0
    text-left
  "
                        >
                          <button
                            type="button"
                            onClick={() => toggleExercise(exercise)}
                            disabled={!canLogGymWorkoutToday}
                            className={`
    w-11
    h-11
    rounded-2xl
    flex
    items-center
    justify-center
    shrink-0

                              ${
                                completed
                                  ? "bg-green-500 text-white"
                                  : isCurrentExercise &&
                                      canLogGymWorkoutToday
                                    ? "bg-zinc-200 text-zinc-500 dark:bg-zinc-800"
                                    : "bg-zinc-100 text-zinc-400 dark:bg-white/5"
                              }
                            `}
                          >
                            {completed ? (
                              <CheckCircle size={22} />
                            ) : (
                              <Circle size={22} />
                            )}
                          </button>

                          <div className="min-w-0">
                            <h4
                              className={`
                                font-black
                                text-base
                                sm:text-lg
                                break-words

                                ${completed ? "line-through opacity-70" : ""}
                              `}
                            >
                              {translate(exercise.name)}
                            </h4>

                            <p className="text-zinc-500 text-sm mt-1">
                              {language === "pt"
                                ? `${exercise.sets || "-"} séries - ${
                                    exercise.reps || "-"
                                  } repetições`
                                : `${exercise.sets || "-"} sets - ${
                                    exercise.reps || "-"
                                  } reps`}
                              {exercise.load ? ` - ${exercise.load}` : ""}
                            </p>
                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openSetLogger(exercise);
                                }}
                                disabled={
                                  !isCurrentExercise ||
                                  !canLogGymWorkoutToday
                                }
                                className="
      px-3
      py-2
      rounded-xl
      bg-purple-500/10
      text-purple-500
      border
      border-purple-500/20
      text-xs
      font-bold
      hover:bg-purple-500/20
      disabled:opacity-40
      disabled:hover:bg-purple-500/10
      transition
    "
                              >
                                {expandedSetLoggerId === exercise.id
                                  ? language === "pt"
                                    ? "Fechar registro"
                                    : "Close log"
                                  : language === "pt"
                                    ? "Registrar séries"
                                    : "Log sets"}
                              </button>

                              {getTodayExerciseSetLogs(exercise.id).length >
                                0 && (
                                <span className="text-xs text-green-500 font-bold">
                                  {getTodayExerciseSetLogs(exercise.id).length}{" "}
                                  {language === "pt"
                                    ? "séries registradas"
                                    : "sets logged"}
                                </span>
                              )}
                            </div>

                            {!isCurrentExercise &&
                              canLogGymWorkoutToday && (
                              <p className="text-xs text-zinc-400 mt-1">
                                {language === "pt"
                                  ? "Não é o treino atual da sequência"
                                  : "Not current in sequence"}
                              </p>
                            )}

                            {workoutAlreadyCompletedToday &&
                              isDisplayWorkoutExercise && (
                                <p className="text-xs text-green-500 mt-1">
                                  {translate("This workout was completed today.")}
                                </p>
                              )}
                          </div>
                        </div>

                        {showPlanTools && (
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex flex-col gap-1">
                              <button
                                type="button"
                                onClick={() => moveExerciseInDay(exercise, -1)}
                                disabled={reorderingExercise || exerciseIndex === 0}
                                className="
                                  w-10
                                  h-8
                                  rounded-xl
                                  flex
                                  items-center
                                  justify-center
                                  text-zinc-500
                                  hover:text-purple-500
                                  hover:bg-purple-500/10
                                  disabled:opacity-30
                                  disabled:hover:bg-transparent
                                  disabled:hover:text-zinc-500
                                  transition
                                  shrink-0
                                "
                                title={
                                  language === "pt"
                                    ? "Mover para cima"
                                    : "Move up"
                                }
                              >
                                <ArrowUp size={17} />
                              </button>

                              <button
                                type="button"
                                onClick={() => moveExerciseInDay(exercise, 1)}
                                disabled={
                                  reorderingExercise ||
                                  exerciseIndex === dayExercises.length - 1
                                }
                                className="
                                  w-10
                                  h-8
                                  rounded-xl
                                  flex
                                  items-center
                                  justify-center
                                  text-zinc-500
                                  hover:text-purple-500
                                  hover:bg-purple-500/10
                                  disabled:opacity-30
                                  disabled:hover:bg-transparent
                                  disabled:hover:text-zinc-500
                                  transition
                                  shrink-0
                                "
                                title={
                                  language === "pt"
                                    ? "Mover para baixo"
                                    : "Move down"
                                }
                              >
                                <ArrowDown size={17} />
                              </button>
                            </div>

                            <button
                              onClick={() => startEditExercise(exercise)}
                              className="
                                w-10
                                h-10
                                rounded-xl
                                flex
                                items-center
                                justify-center
                                text-zinc-500
                                hover:text-purple-500
                                hover:bg-purple-500/10
                                transition
                                shrink-0
                              "
                              title="Edit exercise"
                            >
                              <Pencil size={18} />
                            </button>

                            <button
                              onClick={() => deleteExercise(exercise.id)}
                              className="
                                w-10
                                h-10
                                rounded-xl
                                flex
                                items-center
                                justify-center
                                text-zinc-500
                                hover:text-red-500
                                hover:bg-red-500/10
                                transition
                                shrink-0
                              "
                              title="Delete exercise"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}
                        </motion.div>

                        {expandedSetLoggerId === exercise.id && (
                          <div
                            className="
                          mt-3
                          rounded-2xl
                          border
                          border-purple-500/20
                          bg-purple-500/5
                          p-4
                          sm:p-5

                          dark:bg-purple-500/10
                        "
                          >
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        <h4 className="font-black text-base sm:text-lg">
          Log performance
        </h4>

        <p className="text-zinc-500 text-sm mt-1">
          Register load and reps for this exercise today.
        </p>
      </div>

      <button
        type="button"
        onClick={() => addSetRow(exercise.id)}
        className="
          px-3
          py-2
          rounded-xl
          bg-white
          border
          border-zinc-200
          text-zinc-700
          font-bold
          text-xs
          hover:border-purple-500
          transition

          dark:bg-black/30
          dark:border-white/10
          dark:text-white
        "
      >
        + Set
      </button>
    </div>

    <div className="space-y-3">
      {(setLogForms[exercise.id]?.sets || []).map((setRow, index) => (
        <div
          key={`${exercise.id}-set-${index}`}
          className="
            grid
            grid-cols-[auto_1fr_1fr_auto]
            gap-2
            items-center
          "
        >
          <div
            className="
              w-10
              h-10
              rounded-xl
              bg-purple-500
              text-white
              font-black
              flex
              items-center
              justify-center
              text-sm
            "
          >
            {index + 1}
          </div>

          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            placeholder="Load"
            value={setRow.load}
            onChange={(event) =>
              updateSetRow(exercise.id, index, "load", event.target.value)
            }
            className="WorkoutInput"
          />

          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            placeholder="Reps"
            value={setRow.reps}
            onChange={(event) =>
              updateSetRow(exercise.id, index, "reps", event.target.value)
            }
            className="WorkoutInput"
          />

          <button
            type="button"
            onClick={() => removeSetRow(exercise.id, index)}
            className="
              w-10
              h-10
              rounded-xl
              bg-red-500/10
              text-red-500
              flex
              items-center
              justify-center
              hover:bg-red-500/20
              transition
            "
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
      <select
        value={setLogForms[exercise.id]?.difficulty || "moderate"}
        onChange={(event) =>
          updateSetFormField(exercise.id, "difficulty", event.target.value)
        }
        className="WorkoutInput"
      >
        <option value="light">Light</option>
        <option value="moderate">Moderate</option>
        <option value="heavy">Heavy</option>
        <option value="failure">Failure</option>
      </select>

      <input
        type="text"
        placeholder="Notes"
        value={setLogForms[exercise.id]?.notes || ""}
        onChange={(event) =>
          updateSetFormField(exercise.id, "notes", event.target.value)
        }
        className="WorkoutInput"
      />
    </div>

    {getTodayExerciseSetLogs(exercise.id).length > 0 && (
      <div
        className="
          mt-4
          rounded-2xl
          bg-white
          border
          border-zinc-200
          p-4

          dark:bg-black/30
          dark:border-white/10
        "
      >
        <p className="text-xs font-black text-zinc-500 uppercase tracking-wide mb-2">
          Saved today
        </p>

        <div className="flex flex-wrap gap-2">
          {getTodayExerciseSetLogs(exercise.id).map((log) => (
            <span
              key={log.id}
              className="
                px-3
                py-2
                rounded-xl
                bg-green-500/10
                text-green-500
                text-xs
                font-bold
              "
            >
              Set {log.set_number}: {log.load ?? "-"}kg x {log.reps ?? "-"}
            </span>
          ))}
        </div>
      </div>
    )}

    <button
      type="button"
      onClick={() => saveExerciseSetLogs(exercise)}
      disabled={savingSetLogs}
      className="
        w-full
        mt-4
        px-5
        py-3
        rounded-2xl
        bg-gradient-to-r
        from-purple-500
        to-fuchsia-500
        text-white
        font-bold
        flex
        items-center
        justify-center
        gap-2
        disabled:opacity-50
        hover:scale-[1.01]
        transition
      "
    >
      {savingSetLogs ? (
        <Loader2 className="animate-spin" size={18} />
      ) : (
        <Save size={18} />
      )}
      {translate("Save performance")}
    </button>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* FINISH BUTTON */}
          <div
            className="
              mt-6
              bg-zinc-50
              border
              border-zinc-200
              rounded-2xl
              p-4
              sm:p-5
              flex
              flex-col
              sm:flex-row
              sm:items-center
              sm:justify-between
              gap-4

              dark:bg-black/30
              dark:border-white/10
            "
          >
            <div>
              <h3 className="font-black text-lg">
                {!canLogGymWorkoutToday
                  ? language === "pt"
                    ? workoutAlreadyCompletedToday
                      ? "Musculação já registrada"
                      : "Dia já registrado"
                    : workoutAlreadyCompletedToday
                      ? "Gym workout already logged"
                      : "Day already recorded"
                  : language === "pt"
                    ? `Finalizar ${getDayLabel(activeWorkoutDayForToday)}`
                    : `Finish ${getDayLabel(activeWorkoutDayForToday)}`}
              </h3>

              <p className="text-zinc-500 text-sm mt-1">
                {!canLogGymWorkoutToday
                  ? language === "pt"
                    ? `Próximo treino na sequência: ${getDayLabel(nextWorkoutDay)}.`
                    : `Next workout in sequence: ${getDayLabel(nextWorkoutDay)}.`
                  : language === "pt"
                    ? "Complete o treino da sequência de hoje para finalizar o dia."
                    : "Complete today's sequence workout to finish the day."}
              </p>
            </div>

            <button
              onClick={finishWorkout}
              disabled={
                !todayWorkoutCompleted ||
                finishingWorkout ||
                !canLogGymWorkoutToday
              }
              className="
                w-full
                sm:w-auto
                px-6
                py-4
                rounded-2xl
                bg-gradient-to-r
                from-purple-500
                to-fuchsia-500
                text-white
                font-bold
                flex
                items-center
                justify-center
                gap-3
                disabled:opacity-40
                disabled:hover:scale-100
                hover:scale-105
                transition
              "
            >
              {finishingWorkout ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Trophy size={20} />
              )}
              {!canLogGymWorkoutToday
                ? translate("Done Today")
                : translate("Complete Today")}
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}

export default WorkoutManager;

