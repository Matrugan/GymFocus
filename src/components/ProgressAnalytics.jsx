import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import {
  Activity,
  TrendingUp,
  Trophy,
  CalendarDays,
} from "lucide-react";

import { motion } from "framer-motion";

import { useTheme } from "../context/ThemeContext";

function ProgressAnalytics({ user }) {
  const { theme } = useTheme();

  const isDark = theme === "dark";

  const [chartData, setChartData] = useState([]);

  const [totalXP, setTotalXP] = useState(0);

  const [bestDay, setBestDay] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getXPAnalytics();
    }
  }, [user]);

  async function getXPAnalytics() {
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
      console.log(error);

      setLoading(false);

      return;
    }

    const last7Days = [...Array(7)].map((_, index) => {
      const date = new Date();

      date.setDate(date.getDate() - (6 - index));

      date.setHours(0, 0, 0, 0);

      const dateKey = date.toISOString().split("T")[0];

      return {
        date: dateKey,
        day: date.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        xp: 0,
      };
    });

    data?.forEach((log) => {
      const logDate = new Date(log.created_at)
        .toISOString()
        .split("T")[0];

      const dayItem = last7Days.find((item) => item.date === logDate);

      if (dayItem) {
        dayItem.xp += log.amount;
      }
    });

    const weeklyTotal = last7Days.reduce(
      (sum, item) => sum + item.xp,
      0
    );

    const topDay = [...last7Days].sort((a, b) => b.xp - a.xp)[0];

    setChartData(last7Days);

    setTotalXP(weeklyTotal);

    setBestDay(topDay);

    setLoading(false);
  }

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
          rounded-3xl
          p-8
          shadow-sm

          dark:bg-white/5
          dark:border-white/10
          dark:backdrop-blur-xl
        "
      >
        <div
          className="
            h-8
            w-60
            bg-zinc-200
            rounded-xl
            animate-pulse
            mb-8

            dark:bg-white/10
          "
        />

        <div
          className="
            h-[320px]
            bg-zinc-100
            rounded-3xl
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
        bg-white
        text-zinc-950
        border
        border-zinc-200
        rounded-3xl
        p-6
        md:p-8
        shadow-sm
        transition-colors

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
          items-center
          justify-between
          flex-wrap
          gap-5
          mb-8
        "
      >
        <div className="flex items-center gap-4">
          <div
            className="
              w-14
              h-14
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
            <Activity size={26} />
          </div>

          <div>
            <h2 className="text-3xl font-black">
              Progress Analytics
            </h2>

            <p
              className="
                text-zinc-600
                mt-1

                dark:text-zinc-400
              "
            >
              Your XP evolution over the last 7 days
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
            text-sm
          "
        >
          Last 7 days
        </div>
      </div>

      {/* STATS */}
      <div
        className="
          grid
          md:grid-cols-3
          gap-5
          mb-8
        "
      >
        <AnalyticsCard
          title="Weekly XP"
          value={totalXP}
          icon={<TrendingUp size={22} />}
        />

        <AnalyticsCard
          title="Best Day"
          value={
            bestDay?.xp > 0
              ? `${bestDay.day} • ${bestDay.xp} XP`
              : "No XP yet"
          }
          icon={<Trophy size={22} />}
        />

        <AnalyticsCard
          title="Tracked Days"
          value="7 Days"
          icon={<CalendarDays size={22} />}
        />
      </div>

      {/* CHART */}
      <div
        className="
          w-full
          h-[320px]
          min-w-0
          bg-zinc-50
          border
          border-zinc-200
          rounded-3xl
          p-5
          transition-colors

          dark:bg-black/30
          dark:border-white/10
        "
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient
                id="xpGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#a855f7"
                  stopOpacity={0.8}
                />

                <stop
                  offset="95%"
                  stopColor="#a855f7"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: axisColor,
                fontSize: 12,
              }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: axisColor,
                fontSize: 12,
              }}
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
        </ResponsiveContainer>
      </div>

      {/* FOOTER */}
      <div
        className="
          mt-6
          bg-zinc-50
          border
          border-zinc-200
          rounded-2xl
          p-5
          flex
          items-center
          gap-3
          text-zinc-600

          dark:bg-black/30
          dark:border-white/10
          dark:text-zinc-400
        "
      >
        <Activity size={20} className="text-purple-500 shrink-0" />

        <p className="text-sm">
          XP is logged from completed workouts and claimed challenge rewards.
        </p>
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
        p-5
        shadow-sm

        dark:bg-black/30
        dark:border-white/10
      "
    >
      <div className="text-purple-500 mb-3">
        {icon}
      </div>

      <h3 className="text-2xl font-black">
        {value}
      </h3>

      <p className="text-zinc-500 text-sm mt-1">
        {title}
      </p>
    </div>
  );
}

export default ProgressAnalytics;