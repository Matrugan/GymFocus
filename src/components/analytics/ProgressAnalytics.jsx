import { useEffect, useMemo, useRef, useState } from "react";

import { supabase } from "../../lib/supabase";

import {
  AreaChart,
  Area,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import {
  Activity,
  TrendingUp,
  Trophy,
  CalendarDays,
  Medal,
  Clock,
} from "lucide-react";

import { motion } from "framer-motion";

import { useTheme } from "../../context/ThemeContext";
import { reportError } from "../../utils/errorHandler";
import {
  formatWorkoutDate,
  getWorkoutDateKey,
} from "../../workout/workoutSequence";
import { useLanguage } from "../../context/LanguageContext";

function ProgressAnalytics({ user }) {
  const { language, t, translate } = useLanguage();
  const { theme } = useTheme();

  const isDark = theme === "dark";

  const [chartData, setChartData] = useState([]);

  const [totalXP, setTotalXP] = useState(0);

  const [bestDay, setBestDay] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [setLogs, setSetLogs] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getAnalytics();
    }
  }, [user, language]);

  async function getAnalytics() {
    setLoading(true);

    const sevenDaysAgo = new Date();

    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    sevenDaysAgo.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("xp_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      reportError(error);
      setLoading(false);
      return;
    }

    const { data: plansData, error: plansError } = await supabase
      .from("workout_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", {
        ascending: false,
      })
      .limit(1);

    if (plansError) {
      reportError(plansError);
    }

    const activePlan = plansData?.[0] || null;

    if (activePlan) {
      const { data: exercisesData, error: exercisesError } = await supabase
        .from("workout_exercises")
        .select("*")
        .eq("user_id", user.id)
        .eq("workout_plan_id", activePlan.id)
        .order("workout_day", {
          ascending: true,
        })
        .order("sort_order", {
          ascending: true,
        });

      if (exercisesError) {
        reportError(exercisesError);
      }

      const loadedExercises = exercisesData || [];

      setExercises(loadedExercises);

      const { data: workoutLogsData, error: workoutLogsError } = await supabase
        .from("workout_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("workout_plan_id", activePlan.id)
        .eq("status", "completed")
        .order("workout_date", {
          ascending: false,
        })
        .limit(120);

      if (workoutLogsError) {
        reportError(workoutLogsError);
      }

      setWorkoutLogs(workoutLogsData || []);

      const { data: setLogsData, error: setLogsError } = await supabase
        .from("workout_set_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("workout_plan_id", activePlan.id)
        .order("workout_date", {
          ascending: false,
        })
        .order("exercise_id", {
          ascending: true,
        })
        .order("set_number", {
          ascending: true,
        })
        .limit(800);

      if (setLogsError) {
        reportError(setLogsError);
      }

      setSetLogs(setLogsData || []);
      setSelectedExerciseId((currentId) => {
        if (currentId && loadedExercises.some((item) => item.id === currentId)) {
          return currentId;
        }

        return loadedExercises[0]?.id || "";
      });
    } else {
      setExercises([]);
      setSetLogs([]);
      setWorkoutLogs([]);
      setSelectedExerciseId("");
    }

    const last7Days = [...Array(7)].map((_, index) => {
      const date = new Date();

      date.setDate(date.getDate() - (6 - index));

      date.setHours(0, 0, 0, 0);

      const dateKey = date.toISOString().split("T")[0];

      return {
        date: dateKey,
        day: date.toLocaleDateString(language === "pt" ? "pt-BR" : "en-US", {
          weekday: "short",
        }),
        xp: 0,
      };
    });

    data?.forEach((log) => {
      const logDate = new Date(log.created_at).toISOString().split("T")[0];

      const dayItem = last7Days.find((item) => item.date === logDate);

      if (dayItem) {
        dayItem.xp += log.amount;
      }
    });

    const weeklyTotal = last7Days.reduce((sum, item) => sum + item.xp, 0);

    const topDay = [...last7Days].sort((a, b) => b.xp - a.xp)[0];

    setChartData(last7Days);

    setTotalXP(weeklyTotal);

    setBestDay(topDay);

    setLoading(false);
  }

  function formatWorkoutDuration(totalSeconds) {
    const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${String(minutes).padStart(2, "0")}m`;
    }

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0",
    )}`;
  }

  function getWorkoutDuration(log) {
    if (Number(log?.duration_seconds) > 0) {
      return Number(log.duration_seconds);
    }

    if (log?.started_at && log?.completed_at) {
      const startedAt = new Date(log.started_at).getTime();
      const completedAt = new Date(log.completed_at).getTime();

      if (Number.isFinite(startedAt) && Number.isFinite(completedAt)) {
        return Math.max(0, Math.floor((completedAt - startedAt) / 1000));
      }
    }

    return 0;
  }

  function getExerciseSetLogs(exerciseId) {
    return setLogs
      .filter((log) => log.exercise_id === exerciseId)
      .sort((a, b) => {
        const dateComparison = getWorkoutDateKey(b.workout_date).localeCompare(
          getWorkoutDateKey(a.workout_date),
        );

        if (dateComparison !== 0) {
          return dateComparison;
        }

        return a.set_number - b.set_number;
      });
  }

  function getExerciseHistorySessions(exerciseId) {
    const logsByDate = getExerciseSetLogs(exerciseId).reduce((groups, log) => {
      const dateKey = getWorkoutDateKey(log.workout_date);

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(log);

      return groups;
    }, {});

    return Object.entries(logsByDate)
      .map(([date, logs]) => {
        const sortedLogs = [...logs].sort(
          (a, b) => a.set_number - b.set_number,
        );
        const maxLoad = Math.max(
          0,
          ...sortedLogs.map((log) => Number(log.load) || 0),
        );
        const totalReps = sortedLogs.reduce(
          (sum, log) => sum + (Number(log.reps) || 0),
          0,
        );
        const volume = sortedLogs.reduce((sum, log) => {
          const load = Number(log.load) || 0;
          const reps = Number(log.reps) || 0;

          return sum + load * reps;
        }, 0);

        return {
          date,
          logs: sortedLogs,
          maxLoad,
          totalReps,
          volume,
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  function getExerciseRecords(exercise) {
    const sessions = getExerciseHistorySessions(exercise.id);

    if (sessions.length === 0) {
      return null;
    }

    const allLogs = sessions.flatMap((session) =>
      session.logs.map((log) => ({
        ...log,
        sessionDate: session.date,
      })),
    );
    const bestLoadLog = allLogs.reduce((best, log) => {
      const bestLoad = Number(best?.load) || 0;
      const currentLoad = Number(log.load) || 0;

      return currentLoad > bestLoad ? log : best;
    }, null);
    const bestRepsLog = allLogs.reduce((best, log) => {
      const bestReps = Number(best?.reps) || 0;
      const currentReps = Number(log.reps) || 0;

      return currentReps > bestReps ? log : best;
    }, null);
    const bestVolumeSession = sessions.reduce((best, session) => {
      return session.volume > best.volume ? session : best;
    }, sessions[0]);

    return {
      exercise,
      bestLoad: Number(bestLoadLog?.load) || 0,
      bestLoadDate: bestLoadLog?.sessionDate || "",
      bestLoadReps: Number(bestLoadLog?.reps) || 0,
      bestReps: Number(bestRepsLog?.reps) || 0,
      bestRepsDate: bestRepsLog?.sessionDate || "",
      bestRepsLoad: Number(bestRepsLog?.load) || 0,
      bestVolume: bestVolumeSession.volume,
      bestVolumeDate: bestVolumeSession.date,
    };
  }

  function getRepsTarget(repsText) {
    const numbers = String(repsText || "")
      .match(/\d+/g)
      ?.map(Number);

    if (!numbers?.length) {
      return null;
    }

    return {
      min: numbers[0],
      max: numbers[numbers.length - 1],
    };
  }

  function getProgressionSuggestion(exercise, historySessions) {
    if (!exercise || historySessions.length === 0) {
      return {
        title: translate("Start with control"),
        description: translate(
          "Log your first session. After that, GymFocus will suggest the next progression.",
        ),
        tone: "neutral",
      };
    }

    const latestSession = historySessions[0];
    const previousSession = historySessions[1] || null;
    const repsTarget = getRepsTarget(exercise.reps);
    const latestLoads = latestSession.logs
      .map((log) => Number(log.load))
      .filter((load) => Number.isFinite(load) && load > 0);
    const averageLoad =
      latestLoads.length > 0
        ? latestLoads.reduce((sum, load) => sum + load, 0) / latestLoads.length
        : 0;
    const suggestedIncrease =
      averageLoad > 0 ? Math.max(1, Math.round(averageLoad * 0.05)) : 1;
    const allSetsAtTarget =
      repsTarget &&
      latestSession.logs.length > 0 &&
      latestSession.logs.every((log) => {
        const reps = Number(log.reps) || 0;

        return reps >= repsTarget.max;
      });
    const hasFailureSet = latestSession.logs.some(
      (log) => log.difficulty === "failure",
    );

    if (allSetsAtTarget && !hasFailureSet && averageLoad > 0) {
      return {
        title:
          language === "pt"
            ? `Aumente cerca de ${suggestedIncrease}kg na proxima vez`
            : `Increase about ${suggestedIncrease}kg next time`,
        description:
          language === "pt"
            ? `Voce chegou ao topo da meta de repeticoes (${repsTarget.max}) sem falha. Tente um pequeno aumento de carga.`
            : `You reached the top of your rep target (${repsTarget.max}) without failure. Try a small load jump.`,
        tone: "up",
      };
    }

    if (hasFailureSet) {
      return {
        title: translate("Hold the load"),
        description: translate(
          "You logged a failure set. Repeat this load and aim for cleaner reps before increasing.",
        ),
        tone: "hold",
      };
    }

    if (previousSession) {
      const volumeDelta = latestSession.volume - previousSession.volume;

      if (volumeDelta > 0) {
        return {
          title: translate("Keep this load and add reps"),
          description: translate(
            "Your total volume improved. Keep the load and try to add 1 rep in one or two sets.",
          ),
          tone: "up",
        };
      }

      if (volumeDelta < 0) {
        return {
          title: translate("Repeat or reduce slightly"),
          description: translate(
            "Volume dropped from the previous session. Repeat the same load, or reduce a little if form felt heavy.",
          ),
          tone: "down",
        };
      }
    }

    return {
      title: translate("Build one more solid session"),
      description: translate(
        "Keep the same load and try to reach the planned reps with consistent form.",
      ),
      tone: "neutral",
    };
  }

  const selectedExercise = useMemo(() => {
    return exercises.find((exercise) => exercise.id === selectedExerciseId);
  }, [exercises, selectedExerciseId]);

  const selectedExerciseHistory = useMemo(() => {
    if (!selectedExerciseId) {
      return [];
    }

    return getExerciseHistorySessions(selectedExerciseId);
  }, [selectedExerciseId, setLogs]);

  const selectedExerciseChartData = useMemo(() => {
    return selectedExerciseHistory
      .slice(0, 12)
      .reverse()
      .map((session) => ({
        date: formatWorkoutDate(session.date).slice(0, 5),
        load: session.maxLoad,
        volume: Number(session.volume.toFixed(1)),
      }));
  }, [selectedExerciseHistory]);

  const progressionSuggestion = useMemo(() => {
    return getProgressionSuggestion(selectedExercise, selectedExerciseHistory);
  }, [selectedExercise, selectedExerciseHistory]);

  const workoutRecords = useMemo(() => {
    return exercises
      .map((exercise) => getExerciseRecords(exercise))
      .filter(Boolean)
      .sort((a, b) => b.bestVolume - a.bestVolume);
  }, [exercises, setLogs]);

  const workoutDurationStats = useMemo(() => {
    const completedWithDuration = workoutLogs
      .map((log) => ({
        ...log,
        durationSeconds: getWorkoutDuration(log),
      }))
      .filter((log) => log.durationSeconds > 0);

    if (completedWithDuration.length === 0) {
      return {
        averageSeconds: 0,
        fastest: null,
        longest: null,
        totalSeconds: 0,
        sessions: 0,
        chartData: [],
      };
    }

    const totalSeconds = completedWithDuration.reduce(
      (sum, log) => sum + log.durationSeconds,
      0,
    );
    const fastest = [...completedWithDuration].sort(
      (a, b) => a.durationSeconds - b.durationSeconds,
    )[0];
    const longest = [...completedWithDuration].sort(
      (a, b) => b.durationSeconds - a.durationSeconds,
    )[0];
    const chartData = completedWithDuration
      .slice(0, 12)
      .reverse()
      .map((log) => ({
        date: formatWorkoutDate(getWorkoutDateKey(log.workout_date)).slice(
          0,
          5,
        ),
        minutes: Number((log.durationSeconds / 60).toFixed(1)),
      }));

    return {
      averageSeconds: Math.round(totalSeconds / completedWithDuration.length),
      fastest,
      longest,
      totalSeconds,
      sessions: completedWithDuration.length,
      chartData,
    };
  }, [workoutLogs]);

  const axisColor = isDark ? "#a1a1aa" : "#71717a";

  const tooltipBackground = isDark ? "#09090b" : "#ffffff";

  const tooltipBorder = isDark
    ? "rgba(255,255,255,0.1)"
    : "rgba(9,9,11,0.12)";

  const tooltipText = isDark ? "#ffffff" : "#09090b";

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
            h-[250px]
            sm:h-[320px]
            bg-zinc-100
            rounded-2xl
            sm:rounded-3xl
            animate-pulse

            dark:bg-white/5
          "
        />
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
          flex-col
          sm:flex-row
          gap-4
          sm:gap-5
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
            <Activity size={24} />
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
              {t("analytics.title")}
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
              {t("analytics.subtitle")}
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
          {translate("Last 7 days")}
        </div>
      </div>

      {/* STATS */}
      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          gap-3
          sm:gap-5
          mb-6
          sm:mb-8
        "
      >
        <AnalyticsCard
          title={translate("Weekly XP")}
          value={totalXP}
          icon={<TrendingUp size={21} />}
        />

        <AnalyticsCard
          title={translate("Best Day")}
          value={
            bestDay?.xp > 0
              ? `${bestDay.day} • ${bestDay.xp} XP`
              : translate("No XP yet")
          }
          icon={<Trophy size={21} />}
        />

        <AnalyticsCard
          title={translate("Tracked Days")}
          value={translate("7 Days")}
          icon={<CalendarDays size={21} />}
        />

        <AnalyticsCard
          title={translate("Avg Workout Time")}
          value={
            workoutDurationStats.sessions > 0
              ? formatWorkoutDuration(workoutDurationStats.averageSeconds)
              : translate("No timer yet")
          }
          icon={<Clock size={21} />}
        />
      </div>

      {/* CHART */}
      <MeasuredChartFrame
        className="
          w-full
          h-[250px]
          sm:h-[320px]
          min-w-0
          bg-zinc-50
          border
          border-zinc-200
          rounded-2xl
          sm:rounded-3xl
          p-2
          sm:p-5
          transition-colors
          overflow-hidden
          min-h-[250px]

          dark:bg-black/30
          dark:border-white/10
        "
      >
        {({ width, height }) => (
          <AreaChart
            data={chartData}
            width={width}
            height={height}
            margin={{
              top: 10,
              right: 8,
              left: -20,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />

                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: axisColor,
                fontSize: 11,
              }}
              interval={0}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: axisColor,
                fontSize: 11,
              }}
              width={36}
            />

            <Tooltip
              contentStyle={{
                background: tooltipBackground,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: "16px",
                color: tooltipText,
                boxShadow: isDark
                  ? "0 20px 60px rgba(0,0,0,0.45)"
                  : "0 20px 60px rgba(15,23,42,0.12)",
                fontSize: "13px",
              }}
              labelStyle={{
                color: tooltipText,
                fontWeight: 700,
              }}
              itemStyle={{
                color: "#a855f7",
                fontWeight: 700,
              }}
              formatter={(value) => [`${value} XP`, "XP"]}
            />

            <Area
              type="monotone"
              dataKey="xp"
              stroke="#a855f7"
              strokeWidth={3}
              fill="url(#xpGradient)"
            />
          </AreaChart>
        )}
      </MeasuredChartFrame>

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
        <Activity size={20} className="text-purple-500 shrink-0 mt-0.5 sm:mt-0" />

        <p className="text-sm">
          {translate("XP is logged from completed workouts and claimed challenge rewards.")}
        </p>
      </div>

      {/* WORKOUT TIME */}
      <div
        className="
          mt-6
          bg-zinc-50
          border
          border-zinc-200
          rounded-2xl
          sm:rounded-3xl
          p-4
          sm:p-5

          dark:bg-black/30
          dark:border-white/10
        "
      >
        <div
          className="
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-4
            mb-5
          "
        >
          <div>
            <h3 className="font-black text-lg sm:text-xl">
              {translate("Workout time")}
            </h3>

            <p className="text-zinc-500 text-sm mt-1">
              {translate("Duration tracked from start workout to completion.")}
            </p>
          </div>

          <div className="text-purple-500">
            <Clock size={22} />
          </div>
        </div>

        {workoutDurationStats.sessions === 0 ? (
          <div
            className="
              rounded-2xl
              border
              border-dashed
              border-zinc-300
              p-6
              text-center
              text-zinc-500
              text-sm

              dark:border-white/10
            "
          >
            {translate("Start and complete a timed workout to unlock duration analytics.")}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <AnalyticsCard
                title={translate("Average")}
                value={formatWorkoutDuration(
                  workoutDurationStats.averageSeconds,
                )}
                icon={<Clock size={21} />}
              />

              <AnalyticsCard
                title={translate("Fastest")}
                value={formatWorkoutDuration(
                  workoutDurationStats.fastest?.durationSeconds,
                )}
                icon={<TrendingUp size={21} />}
              />

              <AnalyticsCard
                title={translate("Longest")}
                value={formatWorkoutDuration(
                  workoutDurationStats.longest?.durationSeconds,
                )}
                icon={<CalendarDays size={21} />}
              />
            </div>

            <MeasuredChartFrame
              className="
                h-[240px]
                rounded-2xl
                bg-white
                border
                border-zinc-200
                p-3
                min-w-0
                min-h-[240px]

                dark:bg-black/30
                dark:border-white/10
              "
            >
              {({ width, height }) => (
                <LineChart
                  data={workoutDurationStats.chartData}
                  width={width}
                  height={height}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(161, 161, 170, 0.25)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{
                      fill: axisColor,
                      fontSize: 12,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fill: axisColor,
                      fontSize: 12,
                    }}
                    axisLine={false}
                    tickLine={false}
                    width={36}
                  />
                  <Tooltip
                    contentStyle={{
                      background: tooltipBackground,
                      border: `1px solid ${tooltipBorder}`,
                      borderRadius: "14px",
                      color: tooltipText,
                      fontSize: "12px",
                    }}
                    formatter={(value) => [`${value} min`, translate("Duration")]}
                  />
                  <Line
                    type="monotone"
                    dataKey="minutes"
                    name={translate("Duration")}
                    stroke="#a855f7"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                    }}
                  />
                </LineChart>
              )}
            </MeasuredChartFrame>
          </>
        )}
      </div>

      {/* WORKOUT EVOLUTION */}
      <div
        className="
          mt-6
          bg-zinc-50
          border
          border-zinc-200
          rounded-2xl
          sm:rounded-3xl
          p-4
          sm:p-5

          dark:bg-black/30
          dark:border-white/10
        "
      >
        <div
          className="
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-4
            mb-5
          "
        >
          <div>
            <h3 className="font-black text-lg sm:text-xl">
              {translate("Exercise evolution")}
            </h3>

            <p className="text-zinc-500 text-sm mt-1">
              {translate("Load and volume history from your logged sets.")}
            </p>
          </div>

          <select
            value={selectedExerciseId}
            onChange={(event) => setSelectedExerciseId(event.target.value)}
            className="WorkoutInput sm:max-w-xs"
          >
            {exercises.length === 0 && (
              <option value="">{translate("No exercises logged yet")}</option>
            )}

            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {translate(exercise.name)}
              </option>
            ))}
          </select>
        </div>

        {!selectedExercise || selectedExerciseHistory.length === 0 ? (
          <div
            className="
              rounded-2xl
              border
              border-dashed
              border-zinc-300
              p-6
              text-center
              text-zinc-500
              text-sm

              dark:border-white/10
            "
          >
            {translate("Log load and reps in Workouts to unlock exercise evolution charts.")}
          </div>
        ) : (
          <>
            <div
              className={`
                rounded-2xl
                border
                p-4
                mb-4

                ${
                  progressionSuggestion.tone === "up"
                    ? "bg-green-500/10 border-green-500/20 text-green-600"
                    : progressionSuggestion.tone === "down"
                      ? "bg-orange-500/10 border-orange-500/20 text-orange-600"
                      : "bg-purple-500/10 border-purple-500/20 text-purple-600"
                }
              `}
            >
              <p className="text-xs font-black uppercase tracking-wide">
                {translate("Next progression")}
              </p>
              <h4 className="font-black text-base sm:text-lg mt-1">
                {progressionSuggestion.title}
              </h4>
              <p className="text-sm mt-1 opacity-80">
                {progressionSuggestion.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <AnalyticsCard
                title={translate("Best Load")}
                value={`${Math.max(
                  ...selectedExerciseHistory.map((session) => session.maxLoad),
                )}kg`}
                icon={<Trophy size={21} />}
              />

              <AnalyticsCard
                title={translate("Best Volume")}
                value={`${Math.max(
                  ...selectedExerciseHistory.map((session) => session.volume),
                ).toFixed(0)}kg`}
                icon={<TrendingUp size={21} />}
              />

              <AnalyticsCard
                title={translate("Sessions")}
                value={selectedExerciseHistory.length}
                icon={<CalendarDays size={21} />}
              />
            </div>

            <MeasuredChartFrame
              className="
                h-[260px]
                rounded-2xl
                bg-white
                border
                border-zinc-200
                p-3
                mb-4
                min-w-0
                min-h-[260px]

                dark:bg-black/30
                dark:border-white/10
              "
            >
              {({ width, height }) => (
                <LineChart
                  data={selectedExerciseChartData}
                  width={width}
                  height={height}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(161, 161, 170, 0.25)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{
                      fill: axisColor,
                      fontSize: 12,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{
                      fill: axisColor,
                      fontSize: 12,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis yAxisId="right" orientation="right" hide />
                  <Tooltip
                    contentStyle={{
                      background: tooltipBackground,
                      border: `1px solid ${tooltipBorder}`,
                      borderRadius: "14px",
                      color: tooltipText,
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="load"
                    name={translate("Max load")}
                    stroke="#a855f7"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                    }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="volume"
                    name={translate("Volume")}
                    stroke="#22c55e"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                    }}
                  />
                </LineChart>
              )}
            </MeasuredChartFrame>

            <div className="space-y-3">
              {selectedExerciseHistory.slice(0, 5).map((session) => (
                <div
                  key={session.date}
                  className="
                    rounded-2xl
                    bg-white
                    border
                    border-zinc-200
                    p-4

                    dark:bg-black/30
                    dark:border-white/10
                  "
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <h4 className="font-black">
                      {formatWorkoutDate(session.date)}
                    </h4>
                    <p className="text-zinc-500 text-xs">
                      {translate("Max")} {session.maxLoad}kg |{" "}
                      {session.totalReps} {translate("Reps")} |{" "}
                      {translate("Volume")} {session.volume.toFixed(0)}kg
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {session.logs.map((log) => (
                      <span
                        key={log.id}
                        className="
                          px-3
                          py-2
                          rounded-xl
                          bg-purple-500/10
                          text-purple-500
                          text-xs
                          font-bold
                        "
                      >
                        {translate("Set")} {log.set_number}:{" "}
                        {log.load ?? "-"}kg x{" "}
                        {log.reps ?? "-"}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* RECORDS */}
      <div
        className="
          mt-6
          bg-zinc-50
          border
          border-zinc-200
          rounded-2xl
          sm:rounded-3xl
          p-4
          sm:p-5

          dark:bg-black/30
          dark:border-white/10
        "
      >
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="font-black text-lg sm:text-xl">
              {translate("Meus recordes")}
            </h3>
            <p className="text-zinc-500 text-sm mt-1">
              {translate("Best load, reps and volume by exercise.")}
            </p>
          </div>

          <div className="text-yellow-600">
            <Medal size={22} />
          </div>
        </div>

        {workoutRecords.length === 0 ? (
          <div
            className="
              rounded-2xl
              border
              border-dashed
              border-zinc-300
              p-6
              text-center
              text-zinc-500
              text-sm

              dark:border-white/10
            "
          >
            {translate("No records yet. Log set performance in Workouts first.")}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {workoutRecords.map((record) => (
              <div
                key={record.exercise.id}
                className="
                  rounded-2xl
                  bg-white
                  border
                  border-zinc-200
                  p-4

                  dark:bg-black/30
                  dark:border-white/10
                "
              >
                <h4 className="font-black text-base sm:text-lg break-words">
                  {record.exercise.name}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  <RecordMetric
                    label={translate("Carga max")}
                    value={`${record.bestLoad}kg`}
                    detail={`${record.bestLoadReps} ${translate("Reps")} | ${formatWorkoutDate(
                      record.bestLoadDate,
                    )}`}
                  />
                  <RecordMetric
                    label={translate("Reps max")}
                    value={record.bestReps}
                    detail={`${record.bestRepsLoad}kg | ${formatWorkoutDate(
                      record.bestRepsDate,
                    )}`}
                  />
                  <RecordMetric
                    label={translate("Volume max")}
                    value={`${record.bestVolume.toFixed(0)}kg`}
                    detail={formatWorkoutDate(record.bestVolumeDate)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function AnalyticsCard({ title, value, icon }) {
  return (
    <div
      className="
        bg-zinc-50
        border
        border-zinc-200
        rounded-2xl
        p-4
        sm:p-5
        shadow-sm
        min-w-0

        dark:bg-black/30
        dark:border-white/10
      "
    >
      <div className="text-purple-500 mb-2 sm:mb-3">
        {icon}
      </div>

      <h3
        className="
          text-xl
          sm:text-2xl
          font-black
          break-words
          leading-tight
        "
      >
        {value}
      </h3>

      <p className="text-zinc-500 text-xs sm:text-sm mt-1">
        {title}
      </p>
    </div>
  );
}

function RecordMetric({ label, value, detail }) {
  return (
    <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3 dark:bg-white/5 dark:border-white/10">
      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-xl font-black mt-1">{value}</p>
      <p className="text-[11px] text-zinc-500 mt-1">{detail}</p>
    </div>
  );
}

function MeasuredChartFrame({ className, children }) {
  const frameRef = useRef(null);
  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const element = frameRef.current;

    if (!element) {
      return undefined;
    }

    function updateSize() {
      const rect = element.getBoundingClientRect();
      const styles = window.getComputedStyle(element);
      const horizontalPadding =
        Number.parseFloat(styles.paddingLeft) +
        Number.parseFloat(styles.paddingRight);
      const verticalPadding =
        Number.parseFloat(styles.paddingTop) +
        Number.parseFloat(styles.paddingBottom);

      setSize({
        width: Math.max(1, Math.floor(rect.width - horizontalPadding)),
        height: Math.max(1, Math.floor(rect.height - verticalPadding)),
      });
    }

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const canRenderChart = size.width > 1 && size.height > 1;

  return (
    <div ref={frameRef} className={className}>
      {canRenderChart ? (
        children(size)
      ) : (
        <div className="h-full w-full animate-pulse rounded-2xl bg-zinc-100 dark:bg-white/5" />
      )}
    </div>
  );
}

export default ProgressAnalytics;
