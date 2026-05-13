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
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-4
            sm:gap-5
          "
        >
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="
                h-32
                sm:h-36
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
            <Award size={24} />
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
              Achievements
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
            text-xs
            sm:text-sm
            shrink-0
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
            rounded-2xl
            sm:rounded-3xl
            p-6
            sm:p-10
            text-center

            dark:bg-black/30
            dark:border-white/10
          "
        >
          <div
            className="
              w-16
              h-16
              sm:w-20
              sm:h-20
              mx-auto
              rounded-full
              bg-purple-500/10
              border
              border-purple-500/20
              text-purple-500
              flex
              items-center
              justify-center
              mb-5
              sm:mb-6
            "
          >
            <Trophy size={30} />
          </div>

          <h3
            className="
              text-xl
              sm:text-2xl
              font-black
            "
          >
            No achievements yet
          </h3>

          <p
            className="
              text-zinc-600
              mt-3
              max-w-md
              mx-auto
              text-sm
              sm:text-base

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
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-4
            sm:gap-5
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
                rounded-2xl
                sm:rounded-3xl
                p-5
                sm:p-6
                shadow-sm
                hover:border-purple-500/40
                hover:shadow-[0_0_35px_rgba(168,85,247,0.12)]
                transition-all
                min-w-0

                dark:bg-zinc-950
                dark:border-white/10
                dark:hover:shadow-[0_0_35px_rgba(168,85,247,0.14)]
              "
            >
              <div
                className="
                  w-14
                  h-14
                  sm:w-16
                  sm:h-16
                  rounded-2xl
                  bg-gradient-to-r
                  from-purple-500
                  to-fuchsia-500
                  text-white
                  flex
                  items-center
                  justify-center
                  text-2xl
                  sm:text-3xl
                  mb-4
                  sm:mb-5
                  shadow-lg
                  shadow-purple-500/20
                "
              >
                {achievement.badge?.split(" ")[0] || "🏆"}
              </div>

              <h3
                className="
                  text-lg
                  sm:text-xl
                  font-black
                  break-words
                "
              >
                {achievement.badge}
              </h3>

              <div
                className="
                  flex
                  items-center
                  gap-2
                  mt-3
                  sm:mt-4
                  text-zinc-500
                  text-xs
                  sm:text-sm
                "
              >
                <CalendarDays size={15} className="shrink-0" />

                <span className="truncate">
                  Unlocked {formatDate(achievement.created_at)}
                </span>
              </div>

              <div
                className="
                  mt-4
                  sm:mt-5
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
        <Award size={20} className="text-purple-500 shrink-0 mt-0.5 sm:mt-0" />

        <p className="text-sm">
          Achievements are unlocked automatically when you reach important
          milestones.
        </p>
      </div>
    </motion.div>
  );
}

export default Achievements;