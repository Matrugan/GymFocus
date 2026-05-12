import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

import { motion } from "framer-motion";

import {
  Award,
  Trophy,
  Sparkles,
  CalendarDays,
} from "lucide-react";

function Achievements({ user }) {
  const [achievements, setAchievements] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getAchievements();
    }
  }, [user]);

  async function getAchievements() {
    setLoading(true);

    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.log(error);

      setLoading(false);

      return;
    }

    setAchievements(data || []);

    setLoading(false);
  }

  function formatDate(date) {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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

        <div
          className="
            grid
            sm:grid-cols-2
            lg:grid-cols-3
            gap-5
          "
        >
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="
                h-36
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
            <Award size={26} />
          </div>

          <div>
            <h2 className="text-3xl font-black">
              Achievements
            </h2>

            <p
              className="
                text-zinc-600
                mt-1

                dark:text-zinc-400
              "
            >
              Badges unlocked through your fitness journey
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
          {achievements.length} unlocked
        </div>
      </div>

      {/* EMPTY */}
      {achievements.length === 0 && (
        <div
          className="
            bg-zinc-50
            border
            border-zinc-200
            rounded-3xl
            p-10
            text-center

            dark:bg-black/30
            dark:border-white/10
          "
        >
          <div
            className="
              w-20
              h-20
              mx-auto
              rounded-full
              bg-purple-500/10
              border
              border-purple-500/20
              text-purple-500
              flex
              items-center
              justify-center
              mb-6
            "
          >
            <Trophy size={34} />
          </div>

          <h3 className="text-2xl font-black">
            No achievements yet
          </h3>

          <p
            className="
              text-zinc-600
              mt-3
              max-w-md
              mx-auto

              dark:text-zinc-400
            "
          >
            Complete workouts, join challenges and earn XP to unlock your first
            badge.
          </p>
        </div>
      )}

      {/* LIST */}
      {achievements.length > 0 && (
        <div
          className="
            grid
            sm:grid-cols-2
            lg:grid-cols-3
            gap-5
          "
        >
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{
                opacity: 0,
                y: 24,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.08,
              }}
              whileHover={{
                y: -5,
                scale: 1.02,
              }}
              className="
                bg-zinc-50
                border
                border-zinc-200
                rounded-3xl
                p-6
                shadow-sm
                hover:border-purple-500/40
                hover:shadow-[0_0_35px_rgba(168,85,247,0.12)]
                transition-all

                dark:bg-zinc-950
                dark:border-white/10
                dark:hover:shadow-[0_0_35px_rgba(168,85,247,0.14)]
              "
            >
              <div
                className="
                  w-16
                  h-16
                  rounded-2xl
                  bg-gradient-to-r
                  from-purple-500
                  to-fuchsia-500
                  text-white
                  flex
                  items-center
                  justify-center
                  text-3xl
                  mb-5
                  shadow-lg
                  shadow-purple-500/20
                "
              >
                {achievement.badge?.split(" ")[0] || "🏆"}
              </div>

              <h3 className="text-xl font-black">
                {achievement.badge}
              </h3>

              <div
                className="
                  flex
                  items-center
                  gap-2
                  mt-4
                  text-zinc-500
                  text-sm
                "
              >
                <CalendarDays size={16} />

                <span>
                  Unlocked {formatDate(achievement.created_at)}
                </span>
              </div>

              <div
                className="
                  mt-5
                  inline-flex
                  items-center
                  gap-2
                  px-3
                  py-2
                  rounded-full
                  bg-purple-500/10
                  border
                  border-purple-500/20
                  text-purple-500
                  font-bold
                  text-xs
                "
              >
                <Sparkles size={14} />
                Achievement
              </div>
            </motion.div>
          ))}
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
        <Award size={20} className="text-purple-500 shrink-0" />

        <p className="text-sm">
          Achievements are unlocked automatically when you reach important
          milestones.
        </p>
      </div>
    </motion.div>
  );
}

export default Achievements;