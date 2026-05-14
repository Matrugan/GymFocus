import { useEffect, useState } from "react";

import { supabase } from "../../lib/supabase";

import { motion } from "framer-motion";

import { Crown, Medal, Trophy, Dumbbell } from "lucide-react";

import { Link } from "react-router-dom";
import { reportError } from "../../utils/errorHandler";

const workoutDayOptions = [
  "Treino A",
  "Treino B",
  "Treino C",
  "Treino D",
  "Treino E",
  "Full Body",
];

function sortWorkoutLogs(logs) {
  return [...logs].sort((a, b) => {
    const dateA = String(a.workout_date || "").split("T")[0];
    const dateB = String(b.workout_date || "").split("T")[0];

    if (dateA !== dateB) {
      return dateB.localeCompare(dateA);
    }

    return String(b.created_at || "").localeCompare(String(a.created_at || ""));
  });
}

function getOrderedWorkoutDaysFromExercises(exerciseList) {
  const daysFromExercises = exerciseList.map(
    (exercise) => exercise.workout_day || "Treino A",
  );

  const uniqueDays = [...new Set(daysFromExercises)];

  return workoutDayOptions.filter((day) => uniqueDays.includes(day));
}

function getNextWorkoutDayAfter(day, exerciseList) {
  const orderedDays = getOrderedWorkoutDaysFromExercises(exerciseList);

  if (orderedDays.length === 0) {
    return "Treino A";
  }

  const currentIndex = orderedDays.indexOf(day);

  if (currentIndex === -1) {
    return orderedDays[0];
  }

  const nextIndex = (currentIndex + 1) % orderedDays.length;

  return orderedDays[nextIndex];
}

function getCurrentWorkoutDay(exerciseList, logs) {
  const orderedDays = getOrderedWorkoutDaysFromExercises(exerciseList);

  if (orderedDays.length === 0) {
    return null;
  }

  const sortedLogs = sortWorkoutLogs(logs);

  const validLogs = sortedLogs.filter((log) => {
    const status = log.status || "completed";

    return (
      orderedDays.includes(log.workout_day) &&
      ["completed", "skipped"].includes(status)
    );
  });

  if (validLogs.length === 0) {
    return orderedDays[0];
  }

  return getNextWorkoutDayAfter(validLogs[0].workout_day, exerciseList);
}

function getWorkoutLabel(plan, day) {
  if (!day) {
    return "No workout";
  }

  const focus = plan?.day_focuses?.[day];

  if (!focus) {
    return day;
  }

  return `${day} - ${focus}`;
}

function WeeklyRanking() {
  const [ranking, setRanking] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWeeklyRanking();
  }, []);

  async function getCurrentWorkoutLabelsByUser(userIds) {
    if (!userIds.length) {
      return {};
    }

    const { data: plans, error: plansError } = await supabase
      .from("workout_plans")
      .select("*")
      .in("user_id", userIds)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (plansError) {
      reportError(plansError);
      return {};
    }

    const activePlanByUser = {};

    (plans || []).forEach((plan) => {
      if (!activePlanByUser[plan.user_id]) {
        activePlanByUser[plan.user_id] = plan;
      }
    });

    const activePlans = Object.values(activePlanByUser);
    const activePlanIds = activePlans.map((plan) => plan.id);

    if (!activePlanIds.length) {
      return {};
    }

    const { data: exercises, error: exercisesError } = await supabase
      .from("workout_exercises")
      .select("*")
      .in("workout_plan_id", activePlanIds)
      .order("workout_day", { ascending: true })
      .order("sort_order", { ascending: true });

    if (exercisesError) {
      reportError(exercisesError);
      return {};
    }

    const { data: logs, error: logsError } = await supabase
      .from("workout_logs")
      .select("*")
      .in("workout_plan_id", activePlanIds)
      .in("user_id", userIds)
      .order("workout_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (logsError) {
      reportError(logsError);
      return {};
    }

    const labelsByUser = {};

    userIds.forEach((userId) => {
      const plan = activePlanByUser[userId];

      if (!plan) {
        labelsByUser[userId] = "No workout";
        return;
      }

      const userExercises = (exercises || []).filter(
        (exercise) =>
          exercise.user_id === userId &&
          exercise.workout_plan_id === plan.id,
      );

      if (!userExercises.length) {
        labelsByUser[userId] = "Add exercises";
        return;
      }

      const userLogs = (logs || []).filter(
        (log) =>
          log.user_id === userId &&
          log.workout_plan_id === plan.id,
      );

      const currentWorkoutDay = getCurrentWorkoutDay(userExercises, userLogs);

      labelsByUser[userId] = getWorkoutLabel(plan, currentWorkoutDay);
    });

    return labelsByUser;
  }

  async function getWeeklyRanking() {
    setLoading(true);

    const sevenDaysAgo = new Date();

    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: logs, error: logsError } = await supabase
      .from("xp_logs")
      .select("*")
      .gte("created_at", sevenDaysAgo.toISOString());

    if (logsError) {
      reportError(logsError);

      setLoading(false);

      return;
    }

    if (!logs?.length) {
      setRanking([]);

      setLoading(false);

      return;
    }

    const grouped = logs.reduce((acc, log) => {
      if (!acc[log.user_id]) {
        acc[log.user_id] = 0;
      }

      acc[log.user_id] += log.amount;

      return acc;
    }, {});

    const userIds = Object.keys(grouped);

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .in("id", userIds);

    if (profilesError) {
      reportError(profilesError);

      setLoading(false);

      return;
    }

    const currentWorkoutLabelsByUser =
      await getCurrentWorkoutLabelsByUser(userIds);

    const formatted = userIds
      .map((userId) => {
        const profile = profiles?.find((profile) => profile.id === userId);

        return {
          userId,
          weeklyXP: grouped[userId],
          profile,
          currentWorkout:
            currentWorkoutLabelsByUser[userId] || "No workout",
        };
      })
      .filter((item) => item.profile)
      .sort((a, b) => b.weeklyXP - a.weeklyXP)
      .slice(0, 10);

    setRanking(formatted);

    setLoading(false);
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

        <div className="space-y-3 sm:space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="
                h-20
                sm:h-24
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
            <Trophy size={24} />
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
              Weekly Ranking
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
              XP earned in the last 7 days
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
          Last 7 days
        </div>
      </div>

      {/* EMPTY */}
      {ranking.length === 0 && (
        <div
          className="
            bg-zinc-50
            border
            border-zinc-200
            rounded-2xl
            p-6
            sm:p-8
            text-center
            text-zinc-500
            text-sm
            sm:text-base

            dark:bg-black/30
            dark:border-white/10
          "
        >
          No weekly XP yet. Complete workouts or challenges to appear here.
        </div>
      )}

      {/* LIST */}
      {ranking.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          {ranking.map((item, index) => {
            const position = index + 1;

            return (
              <motion.div
                key={item.userId}
                initial={{
                  opacity: 0,
                  x: -20,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: index * 0.08,
                }}
                whileHover={{
                  scale: 1.01,
                }}
                className={`
                  flex
                  items-center
                  justify-between
                  gap-3
                  sm:gap-4
                  rounded-2xl
                  px-3
                  sm:px-5
                  py-4
                  sm:py-5
                  border
                  transition-all
                  shadow-sm
                  min-w-0

                  ${
                    position === 1
                      ? "bg-yellow-500/10 border-yellow-500/30"
                      : position === 2
                      ? "bg-zinc-100 border-zinc-300 dark:bg-zinc-300/10 dark:border-zinc-300/20"
                      : position === 3
                      ? "bg-orange-500/10 border-orange-500/20"
                      : "bg-zinc-50 border-zinc-200 dark:bg-white/5 dark:border-white/10"
                  }
                `}
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    sm:gap-4
                    min-w-0
                    flex-1
                  "
                >
                  {/* POSITION */}
                  <div
                    className={`
                      w-10
                      h-10
                      sm:w-12
                      sm:h-12
                      rounded-2xl
                      flex
                      items-center
                      justify-center
                      font-black
                      shrink-0
                      text-sm
                      sm:text-base

                      ${
                        position === 1
                          ? "bg-yellow-500 text-black"
                          : position === 2
                          ? "bg-zinc-300 text-black"
                          : position === 3
                          ? "bg-orange-500 text-black"
                          : "bg-zinc-200 text-zinc-700 dark:bg-white/10 dark:text-white"
                      }
                    `}
                  >
                    {position === 1 ? (
                      <Crown size={20} />
                    ) : position <= 3 ? (
                      <Medal size={20} />
                    ) : (
                      `#${position}`
                    )}
                  </div>

                  {/* AVATAR */}
                  <img
                    src={item.profile?.avatar_url || "https://i.pravatar.cc/150"}
                    alt=""
                    className="
                      w-11
                      h-11
                      sm:w-14
                      sm:h-14
                      rounded-full
                      object-cover
                      border
                      border-purple-500/40
                      shrink-0
                    "
                  />

                  {/* USER INFO */}
                  <div className="min-w-0 flex-1">
                    <Link to={`/profile/${item.profile.username}`}>
                      <h3
                        className="
                          font-bold
                          text-base
                          sm:text-lg
                          truncate
                          hover:text-purple-500
                          transition
                        "
                      >
                        {item.profile.username}
                      </h3>
                    </Link>

                    <p
                      className="
                        text-zinc-500
                        text-xs
                        sm:text-sm
                        truncate
                        flex
                        items-center
                        gap-1
                      "
                    >
                      <Dumbbell size={14} className="shrink-0" />
                      <span className="truncate">
                        {item.currentWorkout}
                      </span>
                    </p>
                  </div>
                </div>

                {/* WEEKLY XP */}
                <div
                  className="
                    text-right
                    shrink-0
                    min-w-[76px]
                    sm:min-w-[110px]
                  "
                >
                  <h3
                    className="
                      text-base
                      sm:text-2xl
                      font-black
                      text-purple-500
                      leading-tight
                    "
                  >
                    {item.weeklyXP} XP
                  </h3>

                  <p
                    className="
                      text-zinc-500
                      text-[11px]
                      sm:text-sm
                      whitespace-nowrap
                    "
                  >
                    this week
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

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
        <Trophy size={20} className="text-purple-500 shrink-0 mt-0.5 sm:mt-0" />

        <p className="text-sm">
          Weekly XP is calculated from workouts and completed challenges in the
          last 7 days.
        </p>
      </div>
    </motion.div>
  );
}

export default WeeklyRanking;