import { Dumbbell, Pencil, Plus, X } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

function WorkoutQuickTools({
  displayWorkoutDay,
  finishingWorkout,
  setSelectedWorkoutDay,
  setShowAddExercise,
  setShowFocusEditor,
  showAddExercise,
  showFocusEditor,
  skipWorkout,
  workoutAlreadyCompletedToday,
}) {
  const { translate } = useLanguage();

  return (
    <div
      className="
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-4
        gap-3
        mb-6
      "
    >
      <button
        onClick={skipWorkout}
        disabled={workoutAlreadyCompletedToday || finishingWorkout}
        className="
          px-4
          py-3
          rounded-2xl
          bg-orange-500/10
          border
          border-orange-500/20
          text-orange-500
          font-bold
          flex
          items-center
          justify-center
          gap-2
          hover:bg-orange-500/20
          disabled:opacity-40
          disabled:hover:bg-orange-500/10
          transition
        "
      >
        <X size={18} />
        {translate("Skip workout")}
      </button>

      <button
        onClick={() => setShowFocusEditor((prev) => !prev)}
        className="
          px-4
          py-3
          rounded-2xl
          bg-zinc-50
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
        {showFocusEditor ? <X size={18} /> : <Pencil size={18} />}
        {translate("Workout focuses")}
      </button>

      <button
        onClick={() => setShowAddExercise((prev) => !prev)}
        className="
          px-4
          py-3
          rounded-2xl
          bg-zinc-50
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
        {showAddExercise ? <X size={18} /> : <Plus size={18} />}
        {translate("Add exercise")}
      </button>

      <button
        onClick={() => setSelectedWorkoutDay(displayWorkoutDay)}
        className="
          px-4
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
        <Dumbbell size={18} />
        {translate("Today's checklist")}
      </button>
    </div>
  );
}

export default WorkoutQuickTools;
