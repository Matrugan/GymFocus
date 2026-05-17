import { useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  CheckCircle,
  XCircle,
  SkipForward,
  Moon,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { motion } from "framer-motion";
import { reportError } from "../utils/errorHandler";
import { useLanguage } from "../context/LanguageContext";
import {
  fetchUserWorkoutLogs,
  subscribeToUserWorkoutLogs,
  unsubscribeFromWorkoutRealtime,
} from "../services/workoutService";

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateStringAsLocalDate(dateString) {
  if (!dateString) {
    return new Date();
  }

  const cleanDate = String(dateString).split("T")[0];
  const [year, month, day] = cleanDate.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function getMonthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0, 0);
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1, 12, 0, 0, 0);
}

function getWorkoutDateKey(workoutDate) {
  if (!workoutDate) {
    return "";
  }

  const value = String(workoutDate);

  // Quando vem do Supabase como DATE, normalmente vem como "YYYY-MM-DD".
  // Nesse caso, NÃO converta com new Date(), porque isso pode aplicar UTC
  // e deslocar o dia dependendo do fuso horário.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  // Fallback caso algum dia venha como timestamp.
  // Aqui sim convertemos para a data local do dispositivo.
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value.split("T")[0];
  }

  return getLocalDateString(parsedDate);
}

function WorkoutCalendar({ user }) {
  const { language, translate } = useLanguage();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    getMonthStart(new Date()),
  );

  const today = getLocalDateString();

  useEffect(() => {
    if (user?.id) {
      getWorkouts();
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = subscribeToUserWorkoutLogs(user.id, () => {
      getWorkouts(false);
    });

    return () => {
      unsubscribeFromWorkoutRealtime(channel);
    };
  }, [user?.id]);

  useEffect(() => {
    function handleFocus() {
      if (user?.id) {
        getWorkouts(false);
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible" && user?.id) {
        getWorkouts(false);
      }
    }

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user?.id]);

  async function getWorkouts(showMainLoading = true) {
    if (!user?.id) return;

    if (showMainLoading) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    const { data, error } = await fetchUserWorkoutLogs(user.id);

    if (error) {
      reportError(error);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setWorkouts(data || []);
    setLoading(false);
    setRefreshing(false);
  }

  const visibleMonthDays = useMemo(() => {
    const monthStart = getMonthStart(visibleMonth);
    const firstGridDate = new Date(monthStart);
    const leadingDays = firstGridDate.getDay();

    firstGridDate.setDate(firstGridDate.getDate() - leadingDays);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(firstGridDate);
      date.setDate(firstGridDate.getDate() + index);

      return {
        date: getLocalDateString(date),
        inCurrentMonth: date.getMonth() === visibleMonth.getMonth(),
      };
    });
  }, [visibleMonth]);

  const visibleMonthDates = useMemo(() => {
    return visibleMonthDays
      .filter((day) => day.inCurrentMonth)
      .map((day) => day.date);
  }, [visibleMonthDays]);

  /*
      .map((_, index) => {
        const date = new Date();

        // Meio-dia local evita bugs perto de virada de horário/fuso.
        date.setHours(12, 0, 0, 0);
        date.setDate(date.getDate() - index);

        return getLocalDateString(date);
      })
      .reverse();
  }, [today]);
  */

  function getLogsByDate(date) {
    return workouts.filter((workout) => {
      return getWorkoutDateKey(workout.workout_date) === date;
    });
  }

  function getWorkoutStatus(date) {
    const logs = getLogsByDate(date);

    const hasCompleted = logs.some((workout) => {
      const status = workout.status || "completed";

      return status === "completed";
    });

    if (hasCompleted) {
      return "completed";
    }

    const hasSkipped = logs.some((workout) => {
      return workout.status === "skipped";
    });

    if (hasSkipped) {
      return "skipped";
    }

    const hasRest = logs.some((workout) => {
      return workout.status === "rest";
    });

    if (hasRest) {
      return "rest";
    }

    return "none";
  }

  function getWorkoutLabel(date) {
    const logs = getLogsByDate(date);

    const completedLog = logs.find((workout) => {
      const status = workout.status || "completed";

      return status === "completed";
    });

    if (completedLog?.workout_day) {
      return translate(completedLog.workout_day);
    }

    const skippedLog = logs.find((workout) => {
      return workout.status === "skipped";
    });

    if (skippedLog?.workout_day) {
      return translate(skippedLog.workout_day);
    }

    const restLog = logs.find((workout) => {
      return workout.status === "rest";
    });

    if (restLog?.workout_day) {
      return translate(restLog.workout_day);
    }

    return "";
  }

  function getDayLabel(date) {
    return parseDateStringAsLocalDate(date).toLocaleDateString(locale, {
      weekday: "short",
    });
  }

  function getDayNumber(date) {
    return parseDateStringAsLocalDate(date).toLocaleDateString(locale, {
      day: "2-digit",
    });
  }

  function getMonthLabel(date) {
    return parseDateStringAsLocalDate(date).toLocaleDateString(locale, {
      month: "short",
    });
  }

  const completedDays = visibleMonthDates.filter((day) => {
    return getWorkoutStatus(day) === "completed";
  }).length;

  const skippedDays = visibleMonthDates.filter((day) => {
    return getWorkoutStatus(day) === "skipped";
  }).length;
  const restDays = visibleMonthDates.filter((day) => {
    return getWorkoutStatus(day) === "rest";
  }).length;

  const emptyDays = visibleMonthDates.length - completedDays - skippedDays - restDays;

  const locale = language === "pt" ? "pt-BR" : "en-US";

  const visibleMonthLabel = visibleMonth.toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });

  const weekDays =
    language === "pt"
      ? ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (loading) {
    return (
      <div
        className="
          bg-white
          border
          border-zinc-200
          rounded-2xl
          sm:rounded-3xl
          p-4
          sm:p-8
          shadow-sm

          dark:bg-white/5
          dark:border-white/10
          dark:backdrop-blur-xl
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
            text-zinc-500
            font-bold
          "
        >
          <Loader2 className="animate-spin" size={20} />
          {language === "pt" ? "Carregando calendário..." : "Loading calendar..."}
        </div>

        <div
          className="
            grid
            grid-cols-2
            sm:grid-cols-4
            lg:grid-cols-7
            gap-3
            sm:gap-4
            mt-6
          "
        >
          {[1, 2, 3, 4, 5, 6, 7].map((item) => (
            <div
              key={item}
              className="
                h-24
                sm:h-32
                rounded-2xl
                bg-zinc-100
                animate-pulse

                dark:bg-white/5
              "
            />
          ))}
        </div>
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
        p-3
        sm:p-6
        md:p-8
        shadow-sm
        transition-colors
        min-w-0
        overflow-hidden

        dark:bg-white/5
        dark:text-white
        dark:border-white/10
        dark:backdrop-blur-xl
      "
    >
      <div
        className="
          flex
          items-start
          sm:items-center
          justify-between
          gap-4
          flex-col
          sm:flex-row
          mb-5
          sm:mb-8
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
            sm:gap-4
            min-w-0
          "
        >
          <div
            className="
              w-11
              h-11
              sm:w-12
              sm:h-12
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
            <CalendarDays size={24} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2
                className="
                  text-2xl
                  sm:text-3xl
                  font-black
                  break-words
                "
              >
                {language === "pt" ? "Treinos mensais" : "Monthly Workouts"}
              </h2>

              {refreshing && (
                <RefreshCw
                  size={18}
                  className="
                    animate-spin
                    text-zinc-400
                    shrink-0
                  "
                />
              )}
            </div>

            <p
              className="
                text-zinc-600
                mt-1
                text-sm
                sm:text-base
                leading-snug

                dark:text-zinc-400
              "
            >
              {language === "pt"
                ? `Seu calendário completo de treinos de ${visibleMonthLabel}`
                : `Your complete workout calendar for ${visibleMonthLabel}`}
            </p>
          </div>
        </div>

        <div
          className="
            flex
            items-center
            gap-2
            flex-wrap
            w-full
            sm:w-auto
            justify-between
            sm:justify-start
          "
        >
          <button
            type="button"
            onClick={() =>
              setVisibleMonth((currentMonth) => addMonths(currentMonth, -1))
            }
            className="
              w-10
              h-10
              rounded-xl
              bg-zinc-50
              border
              border-zinc-200
              text-zinc-700
              flex
              items-center
              justify-center
              hover:border-purple-500
              transition

              dark:bg-black/30
              dark:border-white/10
              dark:text-zinc-300
            "
            title={language === "pt" ? "Mês anterior" : "Previous month"}
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={() => setVisibleMonth(getMonthStart(new Date()))}
            className="
              px-4
              py-2.5
              rounded-xl
              bg-zinc-950
              text-white
              font-bold
              text-xs
              sm:text-sm
              transition

              dark:bg-white
              dark:text-black
            "
          >
            {language === "pt" ? "Hoje" : "Today"}
          </button>

          <button
            type="button"
            onClick={() =>
              setVisibleMonth((currentMonth) => addMonths(currentMonth, 1))
            }
            className="
              w-10
              h-10
              rounded-xl
              bg-zinc-50
              border
              border-zinc-200
              text-zinc-700
              flex
              items-center
              justify-center
              hover:border-purple-500
              transition

              dark:bg-black/30
              dark:border-white/10
              dark:text-zinc-300
            "
            title={language === "pt" ? "Próximo mês" : "Next month"}
          >
            <ChevronRight size={18} />
          </button>

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
              shrink-0
              hidden
              sm:block
            "
          >
            {completedDays}/{visibleMonthDates.length}{" "}
            {language === "pt" ? "concluídos" : "completed"}
          </div>

          <div
            className="
              px-4
              py-2
              rounded-full
              bg-orange-500/10
              border
              border-orange-500/20
              text-orange-500
              font-bold
              text-xs
              sm:text-sm
              shrink-0
              hidden
              sm:block
            "
          >
            {skippedDays} {language === "pt" ? "pulados" : "skipped"}
          </div>
        </div>
      </div>

      <div
        className="
          grid
          grid-cols-7
          gap-1
          sm:gap-3
        "
      >
        {weekDays.map((weekDay) => (
          <div
            key={weekDay}
            className="
              text-center
              text-[9px]
              sm:text-xs
              font-black
              uppercase
              tracking-normal
              sm:tracking-wide
              text-zinc-400
              py-1.5
            "
          >
            {weekDay}
          </div>
        ))}

        {visibleMonthDays.map((monthDay, index) => {
          const day = monthDay.date;
          const status = getWorkoutStatus(day);
          const completed = status === "completed";
          const skipped = status === "skipped";
          const rest = status === "rest";
          const workoutLabel = getWorkoutLabel(day);
          const isToday = day === today;

          return (
            <motion.div
              key={day}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.01,
              }}
              whileHover={{
                y: -4,
              }}
              className={`
                rounded-xl
                sm:rounded-2xl
                p-1.5
                sm:p-3
                border
                transition-all
                shadow-sm
                min-w-0
                relative
                min-h-[58px]
                aspect-square
                sm:aspect-auto
                sm:min-h-[120px]
                ${monthDay.inCurrentMonth ? "" : "opacity-40"}

                ${
                  completed
                    ? `
                      bg-purple-500/10
                      border-purple-500/30
                    `
                    : skipped
                      ? `
                        bg-orange-500/10
                        border-orange-500/30
                      `
                      : rest
                        ? `
                          bg-sky-500/10
                          border-sky-500/30
                        `
                      : `
                        bg-zinc-50
                        border-zinc-200

                        dark:bg-black/30
                        dark:border-white/10
                      `
                }

                ${
                  isToday
                    ? `
                      ring-2
                      ring-purple-500/30
                    `
                    : ""
                }
              `}
            >
              {isToday && (
                <div
                  className="
                    absolute
                    top-2
                    right-2
                    px-1.5
                    py-0.5
                    rounded-full
                    bg-purple-500
                    text-white
                    text-[10px]
                    font-black
                    hidden
                    sm:block
                  "
                >
                  {language === "pt" ? "Hoje" : "Today"}
                </div>
              )}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  mb-2
                  sm:mb-3
                  gap-2
                  pr-8
                  hidden
                  sm:flex
                "
              >
                <span
                  className="
                    text-[10px]
                    sm:text-xs
                    font-bold
                    text-zinc-600
                    truncate

                    dark:text-zinc-400
                  "
                >
                  {getDayLabel(day)}
                </span>

                {completed ? (
                  <CheckCircle
                    size={15}
                    className="text-purple-500 shrink-0"
                  />
                ) : skipped ? (
                  <SkipForward
                    size={15}
                    className="text-orange-500 shrink-0"
                  />
                ) : rest ? (
                  <Moon
                    size={15}
                    className="text-sky-500 shrink-0"
                  />
                ) : (
                  <XCircle
                    size={15}
                    className="text-zinc-400 shrink-0"
                  />
                )}
              </div>

              <div
                className={`
                  w-full
                  h-full
                  max-w-10
                  max-h-10
                  mx-auto
                  sm:w-12
                  sm:h-12
                  sm:max-w-none
                  sm:max-h-none
                  sm:mx-0
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  font-black
                  text-base
                  sm:text-xl
                  mb-0
                  sm:mb-2

                  ${
                    completed
                      ? `
                        bg-gradient-to-r
                        from-purple-500
                        to-fuchsia-500
                        text-white
                      `
                      : skipped
                        ? `
                          bg-orange-500
                          text-white
                        `
                        : rest
                          ? `
                            bg-sky-500
                            text-white
                          `
                        : `
                          bg-zinc-200
                          text-zinc-500

                          dark:bg-zinc-800
                          dark:text-zinc-500
                        `
                  }
                `}
              >
                {getDayNumber(day)}
              </div>

              <p className="hidden sm:block text-[11px] text-zinc-400 font-bold uppercase tracking-wide mb-1">
                {getMonthLabel(day)}
              </p>

              <p
                className={`
                  text-xs
                  sm:text-sm
                  font-bold
                  leading-tight
                  hidden
                  sm:block

                  ${
                    completed
                      ? "text-purple-500"
                      : skipped
                        ? "text-orange-500"
                        : rest
                          ? "text-sky-500"
                        : "text-zinc-500"
                  }
                `}
              >
                {completed
                  ? language === "pt"
                    ? "Concluído"
                    : "Completed"
                    : skipped
                      ? language === "pt"
                        ? "Pulado"
                        : "Skipped"
                      : rest
                        ? language === "pt"
                          ? "Descanso"
                          : "Rest"
                      : language === "pt"
                      ? "Descanso / perdido"
                      : "Rest / Missed"}
              </p>

              {workoutLabel && (
                <p className="hidden sm:block text-[11px] text-zinc-500 mt-1 truncate">
                  {workoutLabel}
                </p>
              )}

              <div
                className={`
                  absolute
                  bottom-1.5
                  right-1.5
                  w-2
                  h-2
                  rounded-full
                  sm:hidden

                  ${
                    completed
                      ? "bg-purple-500"
                      : skipped
                        ? "bg-orange-500"
                        : rest
                          ? "bg-sky-500"
                        : "bg-zinc-300 dark:bg-zinc-700"
                  }
                `}
              />
            </motion.div>
          );
        })}
      </div>

      <div
        className="
          mt-5
          sm:hidden
          grid
          grid-cols-3
          gap-2
        "
      >
        <div
          className="
            bg-zinc-50
            border
            border-zinc-200
            rounded-xl
            p-3

            dark:bg-black/30
            dark:border-white/10
          "
        >
          <p className="text-zinc-500 text-xs">
            {language === "pt" ? "Concluídos" : "Completed"}
          </p>

          <h3 className="text-xl font-black text-purple-500 mt-1">
            {completedDays}
          </h3>
        </div>

        <div
          className="
            bg-zinc-50
            border
            border-zinc-200
            rounded-xl
            p-3

            dark:bg-black/30
            dark:border-white/10
          "
        >
          <p className="text-zinc-500 text-xs">
            {language === "pt" ? "Pulados" : "Skipped"}
          </p>

          <h3 className="text-xl font-black text-orange-500 mt-1">
            {skippedDays}
          </h3>
        </div>

        <div
          className="
            bg-zinc-50
            border
            border-zinc-200
            rounded-xl
            p-3

            dark:bg-black/30
            dark:border-white/10
          "
        >
          <p className="text-zinc-500 text-xs">
            {language === "pt" ? "Descanso" : "Rest"}
          </p>

          <h3 className="text-xl font-black text-zinc-500 mt-1">
            {restDays}
          </h3>
        </div>
      </div>

      <div
        className="
          mt-5
          sm:mt-6
          bg-zinc-50
          border
          border-zinc-200
          rounded-2xl
          p-4
          sm:p-5
          flex
          items-start
          sm:items-center
          gap-3
          text-zinc-600

          dark:bg-black/30
          dark:border-white/10
          dark:text-zinc-400
        "
      >
        <CheckCircle
          size={20}
          className="text-purple-500 shrink-0 mt-0.5 sm:mt-0"
        />

        <p className="text-sm">
          {language === "pt"
            ? "Complete seu treino diário para marcar o dia como concluído. Treinos pulados aparecem separados e não contam como dias concluídos. As datas seguem o fuso horário local do dispositivo."
            : "Complete your daily workout to mark the day as completed. Skipped workouts appear separately and do not count as completed days. Dates follow the local timezone of the device using the app."}
        </p>
      </div>
    </motion.div>
  );
}

export default WorkoutCalendar;
