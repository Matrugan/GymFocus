import { useState } from "react";
import {
  Dumbbell,
  HeartPulse,
  Moon,
  MoreHorizontal,
  Pencil,
  Plus,
  X,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

function WorkoutQuickTools({
  displayWorkoutDay,
  alternativeWorkoutAlreadyCompletedToday = false,
  finishingWorkout,
  markRestDay,
  nonTrainingDayAlreadyRecordedToday = false,
  restDaysAllowed = 2,
  restDaysUsed = 0,
  setSelectedWorkoutDay,
  setShowAddExercise,
  setShowAlternativeWorkouts,
  setShowFocusEditor,
  showAddExercise,
  showAlternativeWorkouts,
  showFocusEditor,
  skipWorkout,
  workoutAlreadyRecordedToday,
}) {
  const { language, translate } = useLanguage();
  const [showMoreTools, setShowMoreTools] = useState(false);

  return (
    <div className="mb-6 space-y-3">
      <button
        onClick={() => setSelectedWorkoutDay(displayWorkoutDay)}
        className="
          w-full
          px-4
          py-4
          rounded-2xl
          bg-zinc-950
          text-white
          font-black
          flex
          items-center
          justify-center
          gap-2
          hover:scale-[1.01]
          transition

          dark:bg-white
          dark:text-black
        "
      >
        <Dumbbell size={18} />
        {translate("Today's checklist")}
      </button>

      <button
        type="button"
        onClick={() => setShowMoreTools((prev) => !prev)}
        className="
          w-full
          px-4
          py-3
          rounded-2xl
          border
          border-zinc-200
          bg-zinc-50
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
        {showMoreTools ? <X size={18} /> : <MoreHorizontal size={18} />}
        {language === "pt" ? "Mais opções" : "More options"}
      </button>

      {showMoreTools && (
        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            xl:grid-cols-5
            gap-3
          "
        >
          <button
            onClick={skipWorkout}
            disabled={workoutAlreadyRecordedToday || finishingWorkout}
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
              hover:border-orange-500
              hover:text-orange-500
              disabled:opacity-40
              transition

              dark:bg-black/30
              dark:border-white/10
              dark:text-zinc-300
            "
          >
            <X size={18} />
            {translate("Skip workout")}
          </button>

          <button
            onClick={markRestDay}
            disabled={workoutAlreadyRecordedToday || finishingWorkout}
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
              hover:border-sky-500
              hover:text-sky-500
              disabled:opacity-40
              transition

              dark:bg-black/30
              dark:border-white/10
              dark:text-zinc-300
            "
          >
            <Moon size={18} />
            <span>
              {translate("Rest day")} {Math.min(restDaysUsed, restDaysAllowed)}/
              {restDaysAllowed}
            </span>
          </button>

          <button
            onClick={() => setShowAlternativeWorkouts((prev) => !prev)}
            disabled={
              alternativeWorkoutAlreadyCompletedToday ||
              nonTrainingDayAlreadyRecordedToday ||
              finishingWorkout
            }
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
              hover:border-rose-500
              hover:text-rose-500
              disabled:opacity-40
              transition

              dark:bg-black/30
              dark:border-white/10
              dark:text-zinc-300
            "
          >
            {showAlternativeWorkouts ? <X size={18} /> : <HeartPulse size={18} />}
            {language === "pt" ? "Cardio / casa" : "Cardio / home"}
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
        </div>
      )}
    </div>
  );
}

export default WorkoutQuickTools;
