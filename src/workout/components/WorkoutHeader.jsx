import { useState } from "react";
import { Dumbbell, Plus, Sparkles, X } from "lucide-react";

import { useLanguage } from "../../context/LanguageContext";

function WorkoutHeader({
  activePlan,
  displayWorkoutDay,
  getDayLabel,
  setShowCreatePlan,
  setShowTemplates,
  showCreatePlan,
  showTemplates,
  workoutAlreadyCompletedToday,
}) {
  const { t } = useLanguage();
  const [showCreateActions, setShowCreateActions] = useState(false);

  function toggleTemplates() {
    setShowTemplates((prev) => !prev);
    setShowCreatePlan(false);
    setShowCreateActions(false);
  }

  function toggleCreatePlan() {
    setShowCreatePlan((prev) => !prev);
    setShowTemplates(false);
    setShowCreateActions(false);
  }

  function toggleCreateMenu() {
    if (showCreateActions || showTemplates || showCreatePlan) {
      setShowCreateActions(false);
      setShowTemplates(false);
      setShowCreatePlan(false);
      return;
    }

    setShowCreateActions(true);
  }

  return (
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
            {t("workout.title")}
          </h2>

          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base mt-1">
            {activePlan
              ? workoutAlreadyCompletedToday
                ? t("workout.doneToday", {
                    workout: getDayLabel(displayWorkoutDay),
                  })
                : t("workout.continueWith", {
                    workout: getDayLabel(displayWorkoutDay),
                  })
              : t("workout.createFirst")}
          </p>
        </div>
      </div>

      <div className="relative w-full sm:w-auto">
        <button
          onClick={toggleCreateMenu}
          className="
            w-full
            sm:w-auto
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
            hover:scale-[1.02]
            transition

            dark:bg-white
            dark:text-black
          "
        >
          {showCreateActions || showTemplates || showCreatePlan ? (
            <X size={18} />
          ) : (
            <Plus size={18} />
          )}
          {showCreateActions || showTemplates || showCreatePlan
            ? t("common.close")
            : t("workout.newWorkout")}
        </button>

        {(showCreateActions || showTemplates || showCreatePlan) && (
          <div
            className="
              mt-3
              sm:absolute
              sm:right-0
              sm:top-full
              sm:z-40
              grid
              w-full
              sm:w-[260px]
              gap-2
              rounded-2xl
              border
              border-zinc-200
              bg-white
              p-3
              shadow-xl

              dark:border-white/10
              dark:bg-zinc-950
            "
          >
            <button
              type="button"
              onClick={toggleCreatePlan}
              className={`
                flex
                items-center
                justify-center
                gap-2
                rounded-xl
                px-4
                py-3
                text-sm
                font-black
                transition
                ${
                  showCreatePlan
                    ? "bg-purple-500 text-white"
                    : "bg-zinc-50 text-zinc-700 hover:text-purple-500 dark:bg-white/5 dark:text-zinc-300"
                }
              `}
            >
              <Plus size={17} />
              {t("workout.newWorkout")}
            </button>

            <button
              type="button"
              onClick={toggleTemplates}
              className={`
                flex
                items-center
                justify-center
                gap-2
                rounded-xl
                px-4
                py-3
                text-sm
                font-black
                transition
                ${
                  showTemplates
                    ? "bg-purple-500 text-white"
                    : "bg-zinc-50 text-zinc-700 hover:text-purple-500 dark:bg-white/5 dark:text-zinc-300"
                }
              `}
            >
              <Sparkles size={17} />
              {t("workout.templates")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkoutHeader;
