import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

import {
  Flame,
  Trophy,
  Dumbbell,
  LogOut,
  Search,
  Home,
  Users,
  Settings,
  MessageCircle,
  X,
  Target,
} from "lucide-react";

import { Link } from "react-router-dom";

import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";

import Leaderboard from "../components/ranking/Leaderboard";
import WeeklyRanking from "../components/ranking/WeeklyRanking";

import CreatePost from "../components/feed/CreatePost";
import Feed from "../components/feed/Feed";

import ProfileSettings from "../components/profile/ProfileSettings";
import SearchUsers from "../components/profile/SearchUsers";

import WorkoutCalendar from "../components/WorkoutCalendar";
import ProgressAnalytics from "../components/analytics/ProgressAnalytics";

import NotificationBell from "../components/notifications/NotificationBell";

import Achievements from "../components/achievements/Achievements";
import Challenges from "../components/challenges/Challenges";

import ThemeToggle from "../components/layout/ThemeToggle";

import {
  getLevel,
  getXPForNextLevel,
  getLevelProgress,
} from "../utils/levelSystem";

import { unlockAchievement } from "../utils/achievementSystem";

import { logXP } from "../utils/xpSystem";

function Dashboard() {
  const { user, signOut } = useAuth();

  const [loadingWorkout, setLoadingWorkout] = useState(false);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [showSearch, setShowSearch] = useState(false);
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);

  useEffect(() => {
    if (user) {
      getProfile();
    }
  }, [user]);

  async function getProfile() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    setProfile(data);
  }

  async function completeWorkout() {
    if (!profile) return;

    setLoadingWorkout(true);

    const today = new Date().toISOString().split("T")[0];

    const { data: existingWorkout } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("workout_date", today)
      .maybeSingle();

    if (existingWorkout) {
      toast.error("Workout already completed today.");
      setLoadingWorkout(false);
      return;
    }

    const { error: workoutError } = await supabase.from("workout_logs").insert([
      {
        user_id: user.id,
        workout_date: today,
      },
    ]);

    if (workoutError) {
      console.log(workoutError);
      setLoadingWorkout(false);
      return;
    }

    const newXP = (profile.xp || 0) + 100;
    const newStreak = (profile.streak || 0) + 1;

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        xp: newXP,
        streak: newStreak,
      })
      .eq("id", user.id);

    if (profileError) {
      console.log(profileError);
      setLoadingWorkout(false);
      return;
    }

    const updatedProfile = {
      ...profile,
      xp: newXP,
      streak: newStreak,
    };

    setProfile(updatedProfile);

    await logXP(user.id, 100, "workout");

    await unlockAchievement(user.id, "💪 First Workout");

    if (newStreak >= 7) {
      await unlockAchievement(user.id, "🔥 7 Day Streak");
    }

    if (newXP >= 1000) {
      await unlockAchievement(user.id, "🏆 1000 XP");
    }

    if (newXP >= 10000) {
      await unlockAchievement(user.id, "👑 10K XP");
    }

    setLoadingWorkout(false);

    toast.success("Workout completed successfully!");
  }

  const level = getLevel(profile?.xp || 0);
  const nextLevelXP = getXPForNextLevel(level);
  const progress = getLevelProgress(profile?.xp || 0);

  const stats = [
    {
      title: "Current Streak",
      value: `${profile?.streak || 0} Days`,
      icon: Flame,
    },
    {
      title: "Total XP",
      value: profile?.xp || 0,
      icon: Trophy,
    },
    {
      title: "Workout",
      value: profile?.current_workout || "Workout",
      icon: Dumbbell,
    },
  ];

  return (
    <section
      className="
        min-h-screen
        bg-zinc-50
        text-zinc-950
        flex
        transition-colors
        overflow-x-hidden

        dark:bg-black
        dark:text-white
      "
    >
      {/* SIDEBAR DESKTOP */}
      <aside
        className="
          w-[280px]
          min-h-screen
          border-r
          border-zinc-200
          bg-white
          p-8
          hidden
          lg:flex
          flex-col
          justify-between
          sticky
          top-0
          transition-colors

          dark:border-white/10
          dark:bg-zinc-950
        "
      >
        <div>
          <h1
            className="
              text-4xl
              font-black
              bg-gradient-to-r
              from-purple-500
              to-fuchsia-500
              bg-clip-text
              text-transparent
            "
          >
            GymFocus
          </h1>

          <div className="mt-14 space-y-3">
            <SidebarButton
              active={activeTab === "home"}
              onClick={() => setActiveTab("home")}
              icon={<Home size={20} />}
              text="Dashboard"
            />

            <SidebarButton
              active={activeTab === "feed"}
              onClick={() => setActiveTab("feed")}
              icon={<Users size={20} />}
              text="Feed"
            />

            <SidebarButton
              active={activeTab === "challenges"}
              onClick={() => setActiveTab("challenges")}
              icon={<Target size={20} />}
              text="Challenges"
            />

            <Link to="/inbox">
              <button
                className="
                  w-full
                  flex
                  items-center
                  gap-4
                  px-5
                  py-4
                  rounded-2xl
                  bg-zinc-100
                  text-zinc-700
                  hover:bg-zinc-200
                  transition

                  dark:bg-white/5
                  dark:text-zinc-300
                  dark:hover:bg-white/10
                "
              >
                <MessageCircle size={20} />
                Inbox
              </button>
            </Link>

            <div className="pt-2">
              <SidebarButton
                active={activeTab === "settings"}
                onClick={() => setActiveTab("settings")}
                icon={<Settings size={20} />}
                text="Settings"
              />
            </div>
          </div>
        </div>

        <button
          onClick={signOut}
          className="
            flex
            items-center
            justify-center
            gap-3
            bg-red-500/10
            border
            border-red-500/20
            text-red-500
            py-4
            rounded-2xl
            hover:bg-red-500/20
            transition

            dark:text-red-300
          "
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* CONTENT */}
      <main
        className="
          flex-1
          w-full
          min-w-0
          px-4
          sm:px-6
          lg:px-8
          py-6
          sm:py-10
          pb-32
        "
      >
        <div
          className="
            w-full
            max-w-7xl
            mx-auto
          "
        >
          {/* HEADER */}
          <div
            className="
              flex
              justify-between
              items-start
              sm:items-center
              flex-col
              sm:flex-row
              gap-5
            "
          >
            <div className="min-w-0 w-full">
              <p className="text-zinc-600 dark:text-zinc-400">
                Welcome back
              </p>

              <h1
                className="
                  text-3xl
                  sm:text-4xl
                  lg:text-5xl
                  font-black
                  mt-2
                  break-words
                  leading-tight
                "
              >
                {user?.email?.split("@")[0]}
              </h1>
            </div>

            <div
              className="
                flex
                items-center
                gap-3
                sm:gap-4
                w-full
                sm:w-auto
                justify-end
              "
            >
              <ThemeToggle />

              <NotificationBell user={user} />

              <button
                onClick={() => setShowSearch(true)}
                className="
                  flex
                  items-center
                  justify-center
                  w-12
                  h-12
                  rounded-2xl
                  bg-white
                  text-zinc-950
                  border
                  border-zinc-200
                  hover:border-purple-500
                  transition
                  shadow-sm
                  shrink-0

                  dark:bg-white/5
                  dark:text-white
                  dark:border-white/10
                "
              >
                <Search size={20} />
              </button>
            </div>
          </div>

          {/* SEARCH MODAL */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                className="
                  fixed
                  inset-0
                  bg-black/40
                  backdrop-blur-md
                  z-50
                  flex
                  items-center
                  justify-center
                  p-4
                  sm:p-5

                  dark:bg-black/70
                "
              >
                <motion.div
                  initial={{
                    scale: 0.9,
                    opacity: 0,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                  }}
                  exit={{
                    scale: 0.9,
                    opacity: 0,
                  }}
                  className="
                    w-full
                    max-w-2xl
                    max-h-[90vh]
                    overflow-y-auto
                    bg-white
                    text-zinc-950
                    border
                    border-zinc-200
                    rounded-[28px]
                    sm:rounded-[35px]
                    p-4
                    sm:p-8
                    relative
                    shadow-2xl

                    dark:bg-zinc-950
                    dark:text-white
                    dark:border-white/10
                  "
                >
                  <button
                    onClick={() => setShowSearch(false)}
                    className="
                      absolute
                      top-4
                      right-4
                      sm:top-5
                      sm:right-5
                      p-3
                      rounded-xl
                      bg-zinc-100
                      hover:bg-red-500/10
                      hover:text-red-500
                      transition
                      z-10

                      dark:bg-white/5
                      dark:hover:bg-red-500/20
                    "
                  >
                    <X size={20} />
                  </button>

                  <SearchUsers />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* HOME TAB */}
          {activeTab === "home" && (
            <>
              {/* STATS */}
              <div
                className="
                  mt-8
                  sm:mt-14
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  xl:grid-cols-3
                  gap-4
                  sm:gap-8
                "
              >
                {stats.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={item.title}
                      initial={{
                        opacity: 0,
                        y: 40,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: index * 0.15,
                      }}
                      whileHover={{
                        scale: 1.02,
                        y: -4,
                      }}
                      className="
                        bg-white
                        border
                        border-zinc-200
                        rounded-3xl
                        p-5
                        sm:p-8
                        shadow-sm
                        transition-colors
                        min-w-0

                        dark:bg-white/5
                        dark:border-white/10
                        dark:backdrop-blur-xl
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
                        "
                      >
                        <Icon size={24} />
                      </div>

                      <p className="text-zinc-600 dark:text-zinc-400 mt-5 sm:mt-6">
                        {item.title}
                      </p>

                      <h2
                        className="
                          text-3xl
                          sm:text-4xl
                          font-black
                          mt-2
                          break-words
                        "
                      >
                        {item.value}
                      </h2>
                    </motion.div>
                  );
                })}
              </div>

              {/* PROGRESS */}
              <div
                className="
                  mt-8
                  sm:mt-10
                  bg-white
                  border
                  border-zinc-200
                  rounded-3xl
                  p-5
                  sm:p-8
                  shadow-sm
                  min-w-0

                  dark:bg-white/5
                  dark:border-white/10
                "
              >
                <div
                  className="
                    flex
                    flex-col
                    sm:flex-row
                    sm:justify-between
                    mb-4
                    gap-3
                  "
                >
                  <div>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      Progress to Level {level + 1}
                    </p>

                    <h3 className="text-3xl font-black mt-2">
                      {Math.floor(progress)}%
                    </h3>
                  </div>

                  <div className="text-purple-500 font-bold">
                    {profile?.xp || 0} / {nextLevelXP} XP
                  </div>
                </div>

                <div
                  className="
                    w-full
                    h-4
                    sm:h-5
                    bg-zinc-200
                    rounded-full
                    overflow-hidden

                    dark:bg-zinc-800
                  "
                >
                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${progress}%`,
                    }}
                    transition={{
                      duration: 1.5,
                    }}
                    className="
                      h-full
                      rounded-full
                      bg-gradient-to-r
                      from-purple-500
                      to-fuchsia-500
                    "
                  />
                </div>
              </div>

              {/* WORKOUT */}
              <div
                className="
                  mt-8
                  sm:mt-10
                  bg-gradient-to-r
                  from-purple-600
                  to-fuchsia-600
                  text-white
                  p-5
                  sm:p-8
                  rounded-3xl
                  flex
                  flex-col
                  sm:flex-row
                  sm:justify-between
                  sm:items-center
                  gap-5
                  shadow-lg
                  shadow-purple-500/20
                "
              >
                <div className="min-w-0">
                  <p className="text-sm opacity-80">
                    Today's Workout
                  </p>

                  <h2
                    className="
                      text-2xl
                      sm:text-3xl
                      font-bold
                      break-words
                    "
                  >
                    {profile?.current_workout || "Workout"}
                  </h2>
                </div>

                <button
                  onClick={completeWorkout}
                  disabled={loadingWorkout}
                  className="
                    w-full
                    sm:w-auto
                    px-8
                    py-4
                    rounded-2xl
                    bg-white
                    !text-black
                    font-bold
                    hover:scale-105
                    transition
                    disabled:opacity-60
                    disabled:hover:scale-100
                  "
                >
                  {loadingWorkout ? "Loading..." : "Complete Workout"}
                </button>
              </div>

              <DashboardBlock>
                <ProgressAnalytics user={user} />
              </DashboardBlock>

              <DashboardBlock>
                <WorkoutCalendar user={user} />
              </DashboardBlock>

              <DashboardBlock>
                <Achievements user={user} />
              </DashboardBlock>

              <DashboardBlock>
                <WeeklyRanking />
              </DashboardBlock>

              <DashboardBlock>
                <Leaderboard />
              </DashboardBlock>
            </>
          )}

          {/* FEED TAB */}
          {activeTab === "feed" && (
            <div
              className="
                mt-8
                sm:mt-10
                space-y-8
                sm:space-y-10
                w-full
                min-w-0
              "
            >
              <CreatePost
                user={user}
                profile={profile}
                onPostCreated={() => setFeedRefreshKey((prev) => prev + 1)}
              />

              <Feed
                user={user}
                profile={profile}
                refreshKey={feedRefreshKey}
              />
            </div>
          )}

          {/* CHALLENGES TAB */}
          {activeTab === "challenges" && (
            <div className="mt-8 sm:mt-10">
              <Challenges
                user={user}
                profile={profile}
                onProfileUpdated={setProfile}
              />
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="mt-8 sm:mt-10">
              <ProfileSettings profile={profile} user={user} />
            </div>
          )}
        </div>
      </main>

      {/* MOBILE NAVBAR */}
      <div
        className="
          fixed
          bottom-0
          left-0
          w-full
          bg-white/95
          text-zinc-950
          backdrop-blur-xl
          border-t
          border-zinc-200
          px-2
          sm:px-4
          py-2
          sm:py-3
          flex
          items-center
          justify-around
          lg:hidden
          z-50

          dark:bg-zinc-950/95
          dark:text-white
          dark:border-white/10
        "
      >
        <MobileNavButton
          active={activeTab === "home"}
          onClick={() => setActiveTab("home")}
          icon={<Home size={21} />}
          text="Home"
        />

        <MobileNavButton
          active={activeTab === "feed"}
          onClick={() => setActiveTab("feed")}
          icon={<Users size={21} />}
          text="Feed"
        />

        <MobileNavButton
          active={activeTab === "challenges"}
          onClick={() => setActiveTab("challenges")}
          icon={<Target size={21} />}
          text="Challenges"
        />

        <Link
          to="/inbox"
          className="
            flex
            flex-col
            items-center
            gap-1
            text-[10px]
            sm:text-sm
            text-zinc-500
            hover:text-purple-500
            transition
          "
        >
          <MessageCircle size={21} />
          <span>Inbox</span>
        </Link>

        <MobileNavButton
          active={activeTab === "settings"}
          onClick={() => setActiveTab("settings")}
          icon={<Settings size={21} />}
          text="Settings"
        />
      </div>
    </section>
  );
}

function DashboardBlock({ children }) {
  return (
    <div
      className="
        mt-8
        sm:mt-10
        w-full
        min-w-0
        overflow-hidden
      "
    >
      {children}
    </div>
  );
}

function SidebarButton({ active, onClick, icon, text }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full
        flex
        items-center
        gap-4
        px-5
        py-4
        rounded-2xl
        transition

        ${
          active
            ? "bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white"
            : `
              bg-zinc-100
              text-zinc-700
              hover:bg-zinc-200

              dark:bg-white/5
              dark:text-zinc-300
              dark:hover:bg-white/10
            `
        }
      `}
    >
      {icon}
      {text}
    </button>
  );
}

function MobileNavButton({ active, onClick, icon, text }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex
        flex-col
        items-center
        gap-1
        text-[10px]
        sm:text-sm
        transition
        max-w-[72px]

        ${
          active
            ? "text-purple-500"
            : "text-zinc-500 hover:text-purple-500"
        }
      `}
    >
      {icon}

      <span className="truncate">
        {text}
      </span>
    </button>
  );
}

export default Dashboard;