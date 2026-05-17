import { Clock, Pause, Play, XCircle } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

function CurrentWorkoutCard({
  activePlan,
  displayNextWorkoutDay,
  displayWorkoutCompletedCount,
  displayWorkoutDay,
  displayWorkoutProgressPercent,
  displayWorkoutTotalExercises,
  elapsedWorkoutSeconds,
  formatWorkoutDate,
  formatWorkoutDuration,
  getDayLabel,
  lastCompletedWorkoutDay,
  lastCompletedWorkoutLog,
  clearWorkoutTimer,
  pauseWorkoutTimer,
  startWorkoutTimer,
  todayCompletedLog,
  todayTotalExercises,
  workoutAlreadyCompletedToday,
  workoutAlreadyRecordedToday,
  workoutTimerActive,
  workoutTimerPaused,
  workoutTimerRunning,
}) {
  const { language, translate } = useLanguage();

  return (
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
            {workoutAlreadyCompletedToday
              ? getDayLabel(todayCompletedLog.workout_day)
              : getDayLabel(displayWorkoutDay)}
          </p>

          <h3 className="text-2xl sm:text-3xl font-black mt-1 break-words">
            {getDayLabel(displayWorkoutDay)}
          </h3>

          <p className="text-white/80 mt-2 break-words">
            {workoutAlreadyCompletedToday
              ? language === "pt"
                ? "Você já concluiu o treino de hoje."
                : "You already finished today's workout."
              : `${language === "pt" ? "Plano" : "From plan"}: ${translate(activePlan.title)}`}
          </p>
        </div>

        <div
          className="
            px-4
            py-2
            rounded-full
            bg-white/15
            border
            border-white/20
            text-white
            font-bold
            text-xs
            sm:text-sm
            shrink-0
          "
        >
          {workoutAlreadyCompletedToday
            ? language === "pt"
              ? "Concluído"
              : "Done"
            : `${displayWorkoutCompletedCount}/${displayWorkoutTotalExercises}`}
        </div>
      </div>

      <div className="mt-5">
        <div className="flex justify-between text-sm mb-2">
          <span>{language === "pt" ? "Progresso de hoje" : "Today's progress"}</span>
          <span>{displayWorkoutProgressPercent}%</span>
        </div>

        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all"
            style={{
              width: `${displayWorkoutProgressPercent}%`,
            }}
          />
        </div>
      </div>

      <div
        className="
          mt-5
          rounded-2xl
          bg-white/10
          border
          border-white/15
          p-4
          flex
          flex-col
          sm:flex-row
          sm:items-center
          sm:justify-between
          gap-4
        "
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="
              w-11
              h-11
              rounded-2xl
              bg-white
              text-purple-600
              flex
              items-center
              justify-center
              shrink-0
            "
          >
            <Clock size={21} />
          </div>

          <div className="min-w-0">
            <p className="text-white/60 text-xs font-bold uppercase tracking-wide">
              {language === "pt" ? "Timer do treino" : "Workout timer"}
            </p>

            <h4 className="text-2xl font-black mt-1 tabular-nums">
              {workoutAlreadyCompletedToday
                ? formatWorkoutDuration(todayCompletedLog?.duration_seconds || 0)
                : formatWorkoutDuration(elapsedWorkoutSeconds)}
            </h4>
          </div>
        </div>

        {!workoutAlreadyRecordedToday && (
          <div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-[auto_auto]">
            <button
              type="button"
              onClick={workoutTimerRunning ? pauseWorkoutTimer : startWorkoutTimer}
              disabled={todayTotalExercises === 0}
              className="
                w-full
                sm:w-auto
                px-4
                py-3
                rounded-2xl
                bg-white
                text-purple-700
                font-black
                text-sm
                flex
                items-center
                justify-center
                gap-2
                disabled:opacity-60
                transition
              "
            >
              {workoutTimerRunning ? <Pause size={17} /> : <Play size={17} />}
              {workoutTimerRunning
                ? language === "pt"
                  ? "Pausar timer"
                  : "Pause timer"
                : workoutTimerPaused
                  ? language === "pt"
                    ? "Retomar treino"
                    : "Resume workout"
                  : language === "pt"
                    ? "Iniciar treino"
                    : "Start workout"}
            </button>

            {workoutTimerActive && (
              <button
                type="button"
                onClick={clearWorkoutTimer}
                className="
                  w-full
                  sm:w-auto
                  px-4
                  py-3
                  rounded-2xl
                  bg-white/10
                  text-white
                  border
                  border-white/20
                  font-black
                  text-sm
                  flex
                  items-center
                  justify-center
                  gap-2
                  hover:bg-white/15
                  transition
                "
              >
                <XCircle size={17} />
                {language === "pt" ? "Cancelar timer" : "Cancel timer"}
              </button>
            )}
          </div>
        )}
      </div>

      <div
        className="
          mt-5
          hidden
          sm:grid
          sm:grid-cols-3
          gap-3
        "
      >
        <div
          className="
            rounded-2xl
            bg-white/10
            border
            border-white/15
            p-4
          "
        >
          <p className="text-white/60 text-xs font-bold uppercase tracking-wide">
            {language === "pt" ? "Último" : "Last"}
          </p>

          <h4 className="font-black mt-2 break-words">
            {lastCompletedWorkoutDay
              ? getDayLabel(lastCompletedWorkoutDay)
              : language === "pt"
                ? "Nenhum treino ainda"
                : "No workout yet"}
          </h4>

          <p className="text-white/60 text-xs mt-2">
            {lastCompletedWorkoutLog
              ? formatWorkoutDate(lastCompletedWorkoutLog.workout_date)
              : language === "pt"
                ? "Comece sua sequência"
                : "Start your sequence"}
          </p>
        </div>

        <div
          className="
            rounded-2xl
            bg-white
            text-purple-700
            border
            border-white
            p-4
            shadow-lg
          "
        >
          <p className="text-purple-500 text-xs font-black uppercase tracking-wide">
            {language === "pt" ? "Atual" : "Current"}
          </p>

          <h4 className="font-black mt-2 break-words">
            {getDayLabel(displayWorkoutDay)}
          </h4>

          <p className="text-purple-500 text-xs mt-2">
            {workoutAlreadyCompletedToday
              ? language === "pt"
                ? "Concluído hoje"
                : "Completed today"
              : language === "pt"
                ? "Faça este treino agora"
                : "Do this workout now"}
          </p>
        </div>

        <div
          className="
            rounded-2xl
            bg-white/10
            border
            border-white/15
            p-4
          "
        >
          <p className="text-white/60 text-xs font-bold uppercase tracking-wide">
            {language === "pt" ? "Próximo" : "Next"}
          </p>

          <h4 className="font-black mt-2 break-words">
            {getDayLabel(displayNextWorkoutDay)}
          </h4>

          <p className="text-white/60 text-xs mt-2">
            {language === "pt" ? "Depois do treino atual" : "After current workout"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default CurrentWorkoutCard;
