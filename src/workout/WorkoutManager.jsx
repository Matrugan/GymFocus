import { useEffect, useMemo, useState } from "react";

import { supabase } from "../lib/supabase";

import {
  Dumbbell,
  Plus,
  Trash2,
  CheckCircle,
  Circle,
  Loader2,
  Save,
  Trophy,
  Pencil,
  X,
} from "lucide-react";

import toast from "react-hot-toast";

import { motion } from "framer-motion";

import { unlockAchievement } from "../utils/achievementSystem";
import { logXP } from "../utils/xpSystem";

function WorkoutManager({ user, profile, onProfileUpdated }) {
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [progress, setProgress] = useState([]);

  const [loading, setLoading] = useState(true);
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [addingExercise, setAddingExercise] = useState(false);
  const [finishingWorkout, setFinishingWorkout] = useState(false);

  const [updatingPlan, setUpdatingPlan] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState(false);

  const [newPlan, setNewPlan] = useState({
    title: "",
    description: "",
  });

  const [editingPlan, setEditingPlan] = useState(null);

  const [editPlanData, setEditPlanData] = useState({
    title: "",
    description: "",
  });

  const [newExercise, setNewExercise] = useState({
    name: "",
    sets: "",
    reps: "",
    load: "",
  });

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (user?.id) {
      getWorkoutData();
    }
  }, [user?.id]);

  async function getWorkoutData() {
    setLoading(true);

    const { data: plansData, error: plansError } = await supabase
      .from("workout_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", {
        ascending: false,
      });

    if (plansError) {
      console.log(plansError);
      toast.error("Error loading workout plans.");
      setLoading(false);
      return;
    }

    setPlans(plansData || []);

    const selectedPlan = plansData?.[0] || null;

    setActivePlan(selectedPlan);

    if (!selectedPlan) {
      setExercises([]);
      setProgress([]);
      setLoading(false);
      return;
    }

    await loadPlanDetails(selectedPlan.id);

    setLoading(false);
  }

  async function loadPlanDetails(planId) {
    const { data: exercisesData, error: exercisesError } = await supabase
      .from("workout_exercises")
      .select("*")
      .eq("user_id", user.id)
      .eq("workout_plan_id", planId)
      .order("sort_order", {
        ascending: true,
      });

    if (exercisesError) {
      console.log(exercisesError);
      toast.error("Error loading exercises.");
      return;
    }

    setExercises(exercisesData || []);

    const { data: progressData, error: progressError } = await supabase
      .from("daily_workout_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("workout_plan_id", planId)
      .eq("workout_date", today);

    if (progressError) {
      console.log(progressError);
      toast.error("Error loading workout progress.");
      return;
    }

    setProgress(progressData || []);
  }

  async function createWorkoutPlan() {
    if (!newPlan.title.trim()) {
      toast.error("Enter a workout name.");
      return;
    }

    setCreatingPlan(true);

    const { data, error } = await supabase
      .from("workout_plans")
      .insert([
        {
          user_id: user.id,
          title: newPlan.title.trim(),
          description: newPlan.description.trim(),
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) {
      console.log(error);
      toast.error("Error creating workout.");
      setCreatingPlan(false);
      return;
    }

    setNewPlan({
      title: "",
      description: "",
    });

    setPlans((prev) => [data, ...prev]);
    setActivePlan(data);
    setExercises([]);
    setProgress([]);

    toast.success("Workout created!");

    setCreatingPlan(false);
  }

  async function selectPlan(plan) {
    setActivePlan(plan);
    await loadPlanDetails(plan.id);
  }

  function startEditPlan(plan) {
    setEditingPlan(plan);

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
      toast.error("Enter a workout name.");
      return;
    }

    setUpdatingPlan(true);

    const { data, error } = await supabase
      .from("workout_plans")
      .update({
        title: editPlanData.title.trim(),
        description: editPlanData.description.trim(),
      })
      .eq("id", editingPlan.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.log(error);
      toast.error("Error updating workout plan.");
      setUpdatingPlan(false);
      return;
    }

    setPlans((prev) =>
      prev.map((plan) => (plan.id === editingPlan.id ? data : plan))
    );

    if (activePlan?.id === editingPlan.id) {
      setActivePlan(data);
    }

    cancelEditPlan();

    toast.success("Workout plan updated!");

    setUpdatingPlan(false);
  }

  async function deleteWorkoutPlan(planId) {
    const confirmDelete = confirm(
      "Delete this workout plan? This will also remove it from your active workouts."
    );

    if (!confirmDelete) return;

    setDeletingPlan(true);

    const { error } = await supabase
      .from("workout_plans")
      .update({
        is_active: false,
      })
      .eq("id", planId)
      .eq("user_id", user.id);

    if (error) {
      console.log(error);
      toast.error("Error deleting workout plan.");
      setDeletingPlan(false);
      return;
    }

    const updatedPlans = plans.filter((plan) => plan.id !== planId);

    setPlans(updatedPlans);

    if (editingPlan?.id === planId) {
      cancelEditPlan();
    }

    if (activePlan?.id === planId) {
      const nextPlan = updatedPlans[0] || null;

      setActivePlan(nextPlan);

      if (nextPlan) {
        await loadPlanDetails(nextPlan.id);
      } else {
        setExercises([]);
        setProgress([]);
      }
    }

    toast.success("Workout plan deleted.");

    setDeletingPlan(false);
  }

  async function addExercise() {
    if (!activePlan) {
      toast.error("Create or select a workout first.");
      return;
    }

    if (!newExercise.name.trim()) {
      toast.error("Enter an exercise name.");
      return;
    }

    setAddingExercise(true);

    const { data, error } = await supabase
      .from("workout_exercises")
      .insert([
        {
          workout_plan_id: activePlan.id,
          user_id: user.id,
          name: newExercise.name.trim(),
          sets: newExercise.sets.trim(),
          reps: newExercise.reps.trim(),
          load: newExercise.load.trim(),
          sort_order: exercises.length + 1,
        },
      ])
      .select()
      .single();

    if (error) {
      console.log(error);
      toast.error("Error adding exercise.");
      setAddingExercise(false);
      return;
    }

    setExercises((prev) => [...prev, data]);

    setNewExercise({
      name: "",
      sets: "",
      reps: "",
      load: "",
    });

    toast.success("Exercise added!");

    setAddingExercise(false);
  }

  async function deleteExercise(exerciseId) {
    const confirmDelete = confirm("Delete this exercise?");

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("workout_exercises")
      .delete()
      .eq("id", exerciseId)
      .eq("user_id", user.id);

    if (error) {
      console.log(error);
      toast.error("Error deleting exercise.");
      return;
    }

    setExercises((prev) => prev.filter((item) => item.id !== exerciseId));
    setProgress((prev) => prev.filter((item) => item.exercise_id !== exerciseId));

    toast.success("Exercise deleted.");
  }

  function isExerciseCompleted(exerciseId) {
    return progress.some(
      (item) => item.exercise_id === exerciseId && item.completed
    );
  }

  async function toggleExercise(exercise) {
    if (!activePlan) return;

    const existingProgress = progress.find(
      (item) => item.exercise_id === exercise.id
    );

    if (existingProgress) {
      const newCompletedStatus = !existingProgress.completed;

      const { data, error } = await supabase
        .from("daily_workout_progress")
        .update({
          completed: newCompletedStatus,
          completed_at: newCompletedStatus ? new Date().toISOString() : null,
        })
        .eq("id", existingProgress.id)
        .select()
        .single();

      if (error) {
        console.log(error);
        toast.error("Error updating progress.");
        return;
      }

      setProgress((prev) =>
        prev.map((item) => (item.id === existingProgress.id ? data : item))
      );

      return;
    }

    const { data, error } = await supabase
      .from("daily_workout_progress")
      .insert([
        {
          user_id: user.id,
          workout_plan_id: activePlan.id,
          exercise_id: exercise.id,
          workout_date: today,
          completed: true,
          completed_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.log(error);
      toast.error("Error marking exercise.");
      return;
    }

    setProgress((prev) => [...prev, data]);
  }

  const completedCount = useMemo(() => {
    return exercises.filter((exercise) => isExerciseCompleted(exercise.id))
      .length;
  }, [exercises, progress]);

  const totalExercises = exercises.length;

  const allCompleted = totalExercises > 0 && completedCount === totalExercises;

  const progressPercent =
    totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;

  async function finishWorkout() {
    if (!activePlan) return;

    if (!allCompleted) {
      toast.error("Complete all exercises first.");
      return;
    }

    setFinishingWorkout(true);

    const { data: existingWorkout } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("workout_date", today)
      .maybeSingle();

    if (existingWorkout) {
      toast.error("Workout already completed today.");
      setFinishingWorkout(false);
      return;
    }

    const { error: workoutError } = await supabase.from("workout_logs").insert([
      {
        user_id: user.id,
        workout_date: today,
      },
    ]);

    if (workoutError) {
      console.log(workoutError);
      toast.error("Error completing workout.");
      setFinishingWorkout(false);
      return;
    }

    const newXP = (profile?.xp || 0) + 100;
    const newStreak = (profile?.streak || 0) + 1;

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        xp: newXP,
        streak: newStreak,
      })
      .eq("id", user.id);

    if (profileError) {
      console.log(profileError);
      toast.error("Error updating profile.");
      setFinishingWorkout(false);
      return;
    }

    await logXP(user.id, 100, "workout");

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

    onProfileUpdated?.({
      ...profile,
      xp: newXP,
      streak: newStreak,
    });

    toast.success("Workout completed! +100 XP");

    setFinishingWorkout(false);
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
      {/* HEADER */}
      <div
        className="
          flex
          items-start
          sm:items-center
          justify-between
          flex-col
          sm:flex-row
          gap-4
          mb-6
          sm:mb-8
        "
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div
            className="
              w-12
              h-12
              sm:w-14
              sm:h-14
              rounded-2xl
              bg-gradient-to-r
              from-purple-500
              to-fuchsia-500
              text-white
              flex
              items-center
              justify-center
              shrink-0
            "
          >
            <Dumbbell size={24} />
          </div>

          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl font-black break-words">
              Today's Workout
            </h2>

            <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base mt-1">
              Create your workout and complete each checkpoint.
            </p>
          </div>
        </div>

        <div
          className="
            px-4
            py-2
            rounded-full
            bg-purple-500/10
            border
            border-purple-500/20
            text-purple-500
            font-bold
            text-xs
            sm:text-sm
          "
        >
          {completedCount}/{totalExercises} completed
        </div>
      </div>

      {/* CREATE PLAN */}
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
          Create workout plan
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
          <input
            type="text"
            placeholder="Ex: Treino A - Peito e Tríceps"
            value={newPlan.title}
            onChange={(e) =>
              setNewPlan((prev) => ({
                ...prev,
                title: e.target.value,
              }))
            }
            className="
              w-full
              rounded-2xl
              bg-white
              border
              border-zinc-200
              px-4
              py-3
              outline-none
              focus:border-purple-500
              text-sm

              dark:bg-black/30
              dark:border-white/10
            "
          />

          <input
            type="text"
            placeholder="Descrição opcional"
            value={newPlan.description}
            onChange={(e) =>
              setNewPlan((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            className="
              w-full
              rounded-2xl
              bg-white
              border
              border-zinc-200
              px-4
              py-3
              outline-none
              focus:border-purple-500
              text-sm

              dark:bg-black/30
              dark:border-white/10
            "
          />

          <button
            onClick={createWorkoutPlan}
            disabled={creatingPlan}
            className="
              w-full
              md:w-auto
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
            {creatingPlan ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Plus size={18} />
            )}
            Create
          </button>
        </div>
      </div>

      {/* PLANS */}
      {plans.length > 0 && (
        <div className="mb-6">
          <h3 className="font-black text-lg sm:text-xl mb-3">
            Your workouts
          </h3>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {plans.map((plan) => (
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
                      : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-purple-500 dark:bg-black/30 dark:border-white/10 dark:text-zinc-300"
                  }
                `}
              >
                <button
                  onClick={() => selectPlan(plan)}
                  className="font-bold text-sm px-2 py-1 max-w-[180px] truncate"
                  title={plan.title}
                >
                  {plan.title}
                </button>

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
                  title="Edit workout plan"
                >
                  <Pencil size={16} />
                </button>

                <button
                  onClick={() => deleteWorkoutPlan(plan.id)}
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
                  title="Delete workout plan"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
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
            Edit workout plan
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-3">
            <input
              type="text"
              placeholder="Workout name"
              value={editPlanData.title}
              onChange={(e) =>
                setEditPlanData((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              className="
                w-full
                rounded-2xl
                bg-white
                border
                border-zinc-200
                px-4
                py-3
                outline-none
                focus:border-purple-500
                text-sm

                dark:bg-black/30
                dark:border-white/10
              "
            />

            <input
              type="text"
              placeholder="Description"
              value={editPlanData.description}
              onChange={(e) =>
                setEditPlanData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="
                w-full
                rounded-2xl
                bg-white
                border
                border-zinc-200
                px-4
                py-3
                outline-none
                focus:border-purple-500
                text-sm

                dark:bg-black/30
                dark:border-white/10
              "
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
              Save
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
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE PLAN */}
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
          Create your first workout plan to start tracking exercises.
        </div>
      )}

      {activePlan && (
        <>
          <div
            className="
              bg-gradient-to-r
              from-purple-600
              to-fuchsia-600
              rounded-2xl
              sm:rounded-3xl
              p-5
              sm:p-6
              text-white
              mb-6
            "
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-white/70 text-sm">
                  Active workout
                </p>

                <h3 className="text-2xl sm:text-3xl font-black mt-1 break-words">
                  {activePlan.title}
                </h3>

                {activePlan.description && (
                  <p className="text-white/80 mt-2 break-words">
                    {activePlan.description}
                  </p>
                )}
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => startEditPlan(activePlan)}
                  className="
                    w-10
                    h-10
                    rounded-xl
                    flex
                    items-center
                    justify-center
                    bg-white/10
                    hover:bg-white/20
                    transition
                  "
                  title="Edit active workout"
                >
                  <Pencil size={18} />
                </button>

                <button
                  onClick={() => deleteWorkoutPlan(activePlan.id)}
                  disabled={deletingPlan}
                  className="
                    w-10
                    h-10
                    rounded-xl
                    flex
                    items-center
                    justify-center
                    bg-white/10
                    hover:bg-red-500/30
                    transition
                    disabled:opacity-50
                  "
                  title="Delete active workout"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{progressPercent}%</span>
              </div>

              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{
                    width: `${progressPercent}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* ADD EXERCISE */}
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
              Add exercise
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_.7fr_.7fr_.7fr_auto] gap-3">
              <input
                type="text"
                placeholder="Exercise name"
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

          {/* EXERCISES */}
          <div className="space-y-3 sm:space-y-4">
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
                No exercises yet. Add your first checkpoint.
              </div>
            )}

            {exercises.map((exercise) => {
              const completed = isExerciseCompleted(exercise.id);

              return (
                <motion.div
                  key={exercise.id}
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
                        : "bg-zinc-50 border-zinc-200 dark:bg-black/30 dark:border-white/10"
                    }
                  `}
                >
                  <button
                    onClick={() => toggleExercise(exercise)}
                    className="
                      flex
                      items-center
                      gap-4
                      flex-1
                      min-w-0
                      text-left
                    "
                  >
                    <div
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
                            : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800"
                        }
                      `}
                    >
                      {completed ? (
                        <CheckCircle size={22} />
                      ) : (
                        <Circle size={22} />
                      )}
                    </div>

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
                        {exercise.name}
                      </h4>

                      <p className="text-zinc-500 text-sm mt-1">
                        {exercise.sets || "-"} sets • {exercise.reps || "-"} reps
                        {exercise.load ? ` • ${exercise.load}` : ""}
                      </p>
                    </div>
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
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              );
            })}
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
                Finish today's workout
              </h3>

              <p className="text-zinc-500 text-sm mt-1">
                Complete every checkpoint to unlock the finish button.
              </p>
            </div>

            <button
              onClick={finishWorkout}
              disabled={!allCompleted || finishingWorkout}
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
              Complete Workout
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}

export default WorkoutManager;