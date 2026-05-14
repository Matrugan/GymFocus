import { Dumbbell, Plus, Sparkles, X } from "lucide-react";

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
            Workouts
          </h2>

          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base mt-1">
            {activePlan
              ? workoutAlreadyCompletedToday
                ? `Done today: ${getDayLabel(displayWorkoutDay)}.`
                : `Continue with ${getDayLabel(displayWorkoutDay)}.`
              : "Create your first workout plan."}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button
          onClick={() => setShowTemplates((prev) => !prev)}
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
          {showTemplates ? <X size={18} /> : <Sparkles size={18} />}
          {showTemplates ? "Close templates" : "Templates"}
        </button>

        <button
          onClick={() => setShowCreatePlan((prev) => !prev)}
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
            hover:scale-[1.02]
            transition
          "
        >
          {showCreatePlan ? <X size={18} /> : <Plus size={18} />}
          {showCreatePlan ? "Close" : "New workout"}
        </button>
      </div>
    </div>
  );
}

export default WorkoutHeader;
