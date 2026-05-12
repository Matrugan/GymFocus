import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

import { motion } from "framer-motion";

import { Crown, Medal, Trophy } from "lucide-react";

import { Link } from "react-router-dom";

function WeeklyRanking() {
  const [ranking, setRanking] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWeeklyRanking();
  }, []);

  async function getWeeklyRanking() {
    setLoading(true);

    const sevenDaysAgo = new Date();

    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: logs, error: logsError } = await supabase
      .from("xp_logs")
      .select("*")
      .gte("created_at", sevenDaysAgo.toISOString());

    if (logsError) {
      console.log(logsError);

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
      console.log(profilesError);

      setLoading(false);

      return;
    }

    const formatted = userIds
      .map((userId) => {
        const profile = profiles.find((profile) => profile.id === userId);

        return {
          userId,
          weeklyXP: grouped[userId],
          profile,
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

        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="
                h-24
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
          gap-4
          flex-wrap
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
            <Trophy size={26} />
          </div>

          <div>
            <h2 className="text-3xl font-black">
              Weekly Ranking
            </h2>

            <p
              className="
                text-zinc-600
                mt-1

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
            text-sm
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
            p-8
            text-center
            text-zinc-500

            dark:bg-black/30
            dark:border-white/10
          "
        >
          No weekly XP yet. Complete workouts or challenges to appear here.
        </div>
      )}

      {/* LIST */}
      {ranking.length > 0 && (
        <div className="space-y-4">
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
                  gap-4
                  rounded-2xl
                  px-5
                  py-5
                  border
                  transition-all
                  shadow-sm

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
                    gap-4
                    min-w-0
                  "
                >
                  {/* POSITION */}
                  <div
                    className={`
                      w-12
                      h-12
                      rounded-2xl
                      flex
                      items-center
                      justify-center
                      font-black
                      shrink-0

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
                      <Crown size={22} />
                    ) : position <= 3 ? (
                      <Medal size={22} />
                    ) : (
                      `#${position}`
                    )}
                  </div>

                  {/* AVATAR */}
                  <img
                    src={item.profile?.avatar_url || "https://i.pravatar.cc/150"}
                    alt=""
                    className="
                      w-14
                      h-14
                      rounded-full
                      object-cover
                      border
                      border-purple-500/40
                      shrink-0
                    "
                  />

                  {/* USER INFO */}
                  <div className="min-w-0">
                    <Link to={`/profile/${item.profile.username}`}>
                      <h3
                        className="
                          font-bold
                          text-lg
                          truncate
                          hover:text-purple-500
                          transition
                        "
                      >
                        {item.profile.username}
                      </h3>
                    </Link>

                    <p className="text-zinc-500 text-sm">
                      🔥 {item.profile.streak || 0} streak
                    </p>
                  </div>
                </div>

                {/* WEEKLY XP */}
                <div className="text-right shrink-0">
                  <h3
                    className="
                      text-2xl
                      font-black
                      text-purple-500
                    "
                  >
                    {item.weeklyXP} XP
                  </h3>

                  <p className="text-zinc-500 text-sm">
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
        <Trophy size={20} className="text-purple-500 shrink-0" />

        <p className="text-sm">
          Weekly XP is calculated from workouts and completed challenges in the
          last 7 days.
        </p>
      </div>
    </motion.div>
  );
}

export default WeeklyRanking;