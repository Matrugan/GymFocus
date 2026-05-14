import { useEffect, useRef, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, Sparkles, Trophy } from "lucide-react";

import {
  getLevel,
  getLevelProgress,
  getRankInfo,
  getXPForNextLevel,
} from "../../utils/levelSystem";

function LevelProgressCard({ xp = 0, compact = false }) {
  const level = getLevel(xp);
  const nextLevelXP = getXPForNextLevel(level);
  const progress = getLevelProgress(xp);
  const rank = getRankInfo(level);
  const previousLevelRef = useRef(level);
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    if (level > previousLevelRef.current) {
      setShowLevelUp(true);
      const timeoutId = setTimeout(() => setShowLevelUp(false), 2200);

      previousLevelRef.current = level;

      return () => clearTimeout(timeoutId);
    }

    previousLevelRef.current = level;
  }, [level]);

  const xpToNextLevel = Math.max(nextLevelXP - xp, 0);

  return (
    <motion.div
      layout
      className={`
        relative
        overflow-hidden
        rounded-2xl
        sm:rounded-3xl
        border
        ${rank.border}
        bg-white
        p-4
        sm:p-6
        shadow-lg
        ${rank.glow}

        dark:bg-white/5
      `}
    >
      <div
        className={`
          absolute
          inset-x-0
          top-0
          h-1.5
          bg-gradient-to-r
          ${rank.gradient}
        `}
      />

      <div
        className={`
          absolute
          -right-12
          -top-12
          h-36
          w-36
          rounded-full
          blur-3xl
          opacity-25
          bg-gradient-to-r
          ${rank.gradient}
        `}
      />

      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
              y: -8,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.96,
              y: -8,
            }}
            className="
              absolute
              right-4
              top-4
              z-10
              rounded-2xl
              bg-zinc-950
              px-4
              py-2
              text-xs
              font-black
              text-white
              shadow-xl

              dark:bg-white
              dark:text-black
            "
          >
            LEVEL UP
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="
          relative
          flex
          flex-col
          gap-5
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div className="flex items-center gap-4 min-w-0">
          <motion.div
            animate={{
              rotate: showLevelUp ? [0, -8, 8, 0] : 0,
              scale: showLevelUp ? [1, 1.08, 1] : 1,
            }}
            transition={{
              duration: 0.8,
            }}
            className={`
              relative
              flex
              h-16
              w-16
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-br
              ${rank.gradient}
              text-white
              shadow-lg
              ${rank.glow}
            `}
          >
            <span className="text-3xl leading-none">{rank.icon}</span>
            <div
              className="
                absolute
                -bottom-2
                -right-2
                flex
                h-8
                min-w-8
                items-center
                justify-center
                rounded-xl
                border
                border-white/60
                bg-zinc-950
                px-2
                text-xs
                font-black
                text-white
              "
            >
              {level}
            </div>
          </motion.div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`
                  rounded-full
                  border
                  ${rank.border}
                  ${rank.softBg}
                  px-3
                  py-1
                  text-xs
                  font-black
                  ${rank.text}
                `}
              >
                {rank.name}
              </span>

              <span className="flex items-center gap-1 text-xs font-bold text-zinc-500">
                <Trophy size={14} />
                Level {level}
              </span>
            </div>

            <h3
              className={`
                mt-2
                font-black
                leading-tight
                ${compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"}
              `}
            >
              Progress to Level {level + 1}
            </h3>

            <p className="mt-1 text-sm text-zinc-500">
              {xpToNextLevel} XP left to unlock the next badge.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:min-w-[210px]">
          <div className="rounded-2xl bg-zinc-50 p-3 dark:bg-black/30">
            <p className="text-[10px] font-black uppercase tracking-wide text-zinc-500">
              Total XP
            </p>
            <p className="mt-1 text-lg font-black">{xp}</p>
          </div>

          <div className="rounded-2xl bg-zinc-50 p-3 dark:bg-black/30">
            <p className="text-[10px] font-black uppercase tracking-wide text-zinc-500">
              Next
            </p>
            <p className="mt-1 text-lg font-black">{nextLevelXP}</p>
          </div>
        </div>
      </div>

      <div className="relative mt-5">
        <div className="mb-2 flex items-center justify-between text-xs font-bold text-zinc-500">
          <span className="flex items-center gap-1">
            <Sparkles size={14} />
            Rank progress
          </span>
          <span>{Math.floor(progress)}%</span>
        </div>

        <div className="h-4 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <motion.div
            initial={{
              width: 0,
            }}
            animate={{
              width: `${progress}%`,
            }}
            transition={{
              duration: 1.1,
              ease: "easeOut",
            }}
            className={`
              relative
              h-full
              rounded-full
              bg-gradient-to-r
              ${rank.gradient}
            `}
          >
            <motion.div
              animate={{
                x: ["-40%", "120%"],
              }}
              transition={{
                repeat: Infinity,
                duration: 2.2,
                ease: "linear",
              }}
              className="absolute inset-y-0 w-1/3 bg-white/30 blur-sm"
            />
          </motion.div>
        </div>
      </div>

      <div className="relative mt-4 grid grid-cols-4 gap-2">
        {["Bronze", "Silver", "Gold", "Diamond"].map((rankName) => {
          const isCurrentRank = rankName === rank.name;

          return (
            <div
              key={rankName}
              className={`
                rounded-xl
                border
                px-2
                py-2
                text-center
                text-[10px]
                font-black
                transition
                ${
                  isCurrentRank
                    ? `${rank.border} ${rank.softBg} ${rank.text}`
                    : "border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-white/10 dark:bg-black/20"
                }
              `}
            >
              {rankName}
            </div>
          );
        })}
      </div>

      <div className="relative mt-4 flex items-center gap-2 text-xs font-bold text-zinc-500">
        <ChevronUp size={14} className={rank.text} />
        Complete workouts and challenges to climb faster.
      </div>
    </motion.div>
  );
}

export default LevelProgressCard;
