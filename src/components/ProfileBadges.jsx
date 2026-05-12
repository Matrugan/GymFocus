import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

import { motion } from "framer-motion";

import { Award, Sparkles, Trophy } from "lucide-react";

function ProfileBadges({ profileId }) {
  const [badges, setBadges] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profileId) {
      getBadges();
    }
  }, [profileId]);

  async function getBadges() {
    setLoading(true);

    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", profileId)
      .order("created_at", {
        ascending: false,
      })
      .limit(6);

    if (error) {
      console.log(error);

      setLoading(false);

      return;
    }

    setBadges(data || []);

    setLoading(false);
  }

  function formatDate(date) {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
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
            w-48
            bg-zinc-200
            rounded-xl
            animate-pulse
            mb-6

            dark:bg-white/10
          "
        />

        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="
                h-20
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
        y: 30,
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
          mb-6
        "
      >
        <div className="flex items-center gap-3">
          <div
            className="
              w-12
              h-12
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
            <Award size={22} />
          </div>

          <div>
            <h2 className="text-2xl font-black">
              Badges
            </h2>

            <p className="text-zinc-500 text-sm">
              Recent achievements
            </p>
          </div>
        </div>

        <div
          className="
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
          {badges.length}
        </div>
      </div>

      {/* EMPTY */}
      {badges.length === 0 && (
        <div
          className="
            bg-zinc-50
            border
            border-zinc-200
            rounded-3xl
            p-8
            text-center

            dark:bg-black/30
            dark:border-white/10
          "
        >
          <div
            className="
              w-16
              h-16
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
            "
          >
            <Trophy size={28} />
          </div>

          <h3 className="text-xl font-black">
            No badges yet
          </h3>

          <p className="text-zinc-500 text-sm mt-2">
            Complete workouts and challenges to unlock badges.
          </p>
        </div>
      )}

      {/* BADGES */}
      {badges.length > 0 && (
        <div className="space-y-4">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{
                opacity: 0,
                x: -20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: index * 0.06,
              }}
              whileHover={{
                scale: 1.02,
              }}
              className="
                bg-zinc-50
                border
                border-zinc-200
                rounded-2xl
                p-4
                flex
                items-center
                gap-4
                shadow-sm
                hover:border-purple-500/40
                transition-all

                dark:bg-black/30
                dark:border-white/10
              "
            >
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
                  text-2xl
                  shrink-0
                "
              >
                {badge.badge?.split(" ")[0] || "🏆"}
              </div>

              <div className="min-w-0 flex-1">
                <h3
                  className="
                    font-black
                    truncate
                  "
                >
                  {badge.badge || "Achievement"}
                </h3>

                <p className="text-zinc-500 text-sm mt-1">
                  Unlocked {formatDate(badge.created_at)}
                </p>
              </div>

              <div
                className="
                  w-9
                  h-9
                  rounded-xl
                  bg-purple-500/10
                  border
                  border-purple-500/20
                  text-purple-500
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
              >
                <Sparkles size={16} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default ProfileBadges;