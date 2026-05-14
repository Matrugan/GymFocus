import { useEffect, useMemo, useState } from "react";

import { supabase } from "../lib/supabase";

import {
  CalendarDays,
  CheckCircle,
  XCircle,
  SkipForward,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { motion } from "framer-motion";

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
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const today = getLocalDateString();

  useEffect(() => {
    if (user?.id) {
      getWorkouts();
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`workout-calendar-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workout_logs",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          getWorkouts(false);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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

    const { data, error } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("workout_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setWorkouts(data || []);
    setLoading(false);
    setRefreshing(false);
  }

  const last7Days = useMemo(() => {
    return [...Array(7)]
      .map((_, index) => {
        const date = new Date();

        // Meio-dia local evita bugs perto de virada de horário/fuso.
        date.setHours(12, 0, 0, 0);
        date.setDate(date.getDate() - index);

        return getLocalDateString(date);
      })
      .reverse();
  }, [today]);

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

    return "none";
  }

  function getWorkoutLabel(date) {
    const logs = getLogsByDate(date);

    const completedLog = logs.find((workout) => {
      const status = workout.status || "completed";

      return status === "completed";
    });

    if (completedLog?.workout_day) {
      return completedLog.workout_day;
    }

    const skippedLog = logs.find((workout) => {
      return workout.status === "skipped";
    });

    if (skippedLog?.workout_day) {
      return skippedLog.workout_day;
    }

    return "";
  }

  function getDayLabel(date) {
    return parseDateStringAsLocalDate(date).toLocaleDateString(undefined, {
      weekday: "short",
    });
  }

  function getDayNumber(date) {
    return parseDateStringAsLocalDate(date).toLocaleDateString(undefined, {
      day: "2-digit",
    });
  }

  function getMonthLabel(date) {
    return parseDateStringAsLocalDate(date).toLocaleDateString(undefined, {
      month: "short",
    });
  }

  const completedDays = last7Days.filter((day) => {
    return getWorkoutStatus(day) === "completed";
  }).length;

  const skippedDays = last7Days.filter((day) => {
    return getWorkoutStatus(day) === "skipped";
  }).length;

  const emptyDays = 7 - completedDays - skippedDays;

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
          Loading calendar...
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
        p-4
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
          mb-6
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
                Weekly Consistency
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

                dark:text-zinc-400
              "
            >
              Your workout activity over the last 7 days
            </p>
          </div>
        </div>

        <div
          className="
            flex
            items-center
            gap-2
            flex-wrap
          "
        >
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
            "
          >
            {completedDays}/7 completed
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
            "
          >
            {skippedDays} skipped
          </div>
        </div>
      </div>

      <div
        className="
          grid
          grid-cols-2
          sm:grid-cols-4
          lg:grid-cols-7
          gap-3
          sm:gap-4
        "
      >
        {last7Days.map((day, index) => {
          const status = getWorkoutStatus(day);
          const completed = status === "completed";
          const skipped = status === "skipped";
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
                delay: index * 0.06,
              }}
              whileHover={{
                y: -4,
              }}
              className={`
                rounded-2xl
                sm:rounded-3xl
                p-4
                sm:p-5
                border
                transition-all
                shadow-sm
                min-w-0
                relative

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
                    top-3
                    right-3
                    px-2
                    py-1
                    rounded-full
                    bg-purple-500
                    text-white
                    text-[10px]
                    font-black
                  "
                >
                  Today
                </div>
              )}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  mb-4
                  sm:mb-5
                  gap-2
                  pr-12
                "
              >
                <span
                  className="
                    text-xs
                    sm:text-sm
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
                    size={18}
                    className="text-purple-500 shrink-0"
                  />
                ) : skipped ? (
                  <SkipForward
                    size={18}
                    className="text-orange-500 shrink-0"
                  />
                ) : (
                  <XCircle
                    size={18}
                    className="text-zinc-400 shrink-0"
                  />
                )}
              </div>

              <div
                className={`
                  w-12
                  h-12
                  sm:w-16
                  sm:h-16
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  font-black
                  text-xl
                  sm:text-2xl
                  mb-3
                  sm:mb-4

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

              <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wide mb-1">
                {getMonthLabel(day)}
              </p>

              <p
                className={`
                  text-xs
                  sm:text-sm
                  font-bold
                  leading-tight

                  ${
                    completed
                      ? "text-purple-500"
                      : skipped
                        ? "text-orange-500"
                        : "text-zinc-500"
                  }
                `}
              >
                {completed ? "Completed" : skipped ? "Skipped" : "Rest / Missed"}
              </p>

              {workoutLabel && (
                <p className="text-[11px] text-zinc-500 mt-1 truncate">
                  {workoutLabel}
                </p>
              )}
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
          gap-3
        "
      >
        <div
          className="
            bg-zinc-50
            border
            border-zinc-200
            rounded-2xl
            p-4

            dark:bg-black/30
            dark:border-white/10
          "
        >
          <p className="text-zinc-500 text-xs">Completed</p>

          <h3 className="text-2xl font-black text-purple-500 mt-1">
            {completedDays}
          </h3>
        </div>

        <div
          className="
            bg-zinc-50
            border
            border-zinc-200
            rounded-2xl
            p-4

            dark:bg-black/30
            dark:border-white/10
          "
        >
          <p className="text-zinc-500 text-xs">Skipped</p>

          <h3 className="text-2xl font-black text-orange-500 mt-1">
            {skippedDays}
          </h3>
        </div>

        <div
          className="
            bg-zinc-50
            border
            border-zinc-200
            rounded-2xl
            p-4

            dark:bg-black/30
            dark:border-white/10
          "
        >
          <p className="text-zinc-500 text-xs">Rest</p>

          <h3 className="text-2xl font-black text-zinc-500 mt-1">
            {emptyDays}
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
          Complete your daily workout to mark the day as completed. Skipped
          workouts appear separately and do not count as completed days. Dates
          follow the local timezone of the device using the app.
        </p>
      </div>
    </motion.div>
  );
}

export default WorkoutCalendar;