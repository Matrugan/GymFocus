import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

import { CalendarDays, CheckCircle, XCircle } from "lucide-react";

import { motion } from "framer-motion";

function WorkoutCalendar({ user }) {
  const [workouts, setWorkouts] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getWorkouts();
    }
  }, [user]);

  async function getWorkouts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.log(error);

      setLoading(false);

      return;
    }

    setWorkouts(data || []);

    setLoading(false);
  }

  const last7Days = [...Array(7)]
    .map((_, index) => {
      const date = new Date();

      date.setDate(date.getDate() - index);

      return date.toISOString().split("T")[0];
    })
    .reverse();

  function didWorkout(date) {
    return workouts.some((workout) => workout.workout_date === date);
  }

  function getDayLabel(date) {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
    });
  }

  function getDayNumber(date) {
    return new Date(date).toLocaleDateString("en-US", {
      day: "2-digit",
    });
  }

  const completedDays = last7Days.filter((day) => didWorkout(day)).length;

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
            h-7
            sm:h-8
            w-44
            sm:w-60
            bg-zinc-200
            rounded-xl
            animate-pulse
            mb-6
            sm:mb-8

            dark:bg-white/10
          "
        />

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
      {/* HEADER */}
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
          {completedDays}/7 days
        </div>
      </div>

      {/* DAYS */}
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
          const completed = didWorkout(day);

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

                ${
                  completed
                    ? `
                      bg-purple-500/10
                      border-purple-500/30
                    `
                    : `
                      bg-zinc-50
                      border-zinc-200

                      dark:bg-black/30
                      dark:border-white/10
                    `
                }
              `}
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  mb-4
                  sm:mb-5
                  gap-2
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

              <p
                className={`
                  text-xs
                  sm:text-sm
                  font-bold
                  leading-tight

                  ${
                    completed
                      ? "text-purple-500"
                      : "text-zinc-500"
                  }
                `}
              >
                {completed ? "Completed" : "Rest / Missed"}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* MOBILE SUMMARY */}
      <div
        className="
          mt-5
          sm:hidden
          grid
          grid-cols-2
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
          <p className="text-zinc-500 text-xs">
            Completed
          </p>

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
          <p className="text-zinc-500 text-xs">
            Missed / Rest
          </p>

          <h3 className="text-2xl font-black text-zinc-500 mt-1">
            {7 - completedDays}
          </h3>
        </div>
      </div>

      {/* FOOTER */}
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
          Complete your daily workout to keep your streak alive and increase
          your weekly consistency.
        </p>
      </div>
    </motion.div>
  );
}

export default WorkoutCalendar;