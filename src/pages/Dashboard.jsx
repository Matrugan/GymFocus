import { motion, AnimatePresence } from "framer-motion";
import { lazy, Suspense, useMemo, useState } from "react";

import {
  Flame,
  Trophy,
  Dumbbell,
  CheckCircle,
  Loader2,
  LogOut,
  Search,
  Home,
  Users,
  Settings,
  MessageCircle,
  X,
  Target,
  Activity,
  Medal,
  MoreHorizontal,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import useProfile from "../hooks/useProfile";
import useWorkoutData from "../hooks/useWorkoutData";

import NotificationBell from "../components/notifications/NotificationBell";

import ThemeToggle from "../components/layout/ThemeToggle";
import BrandLogo from "../components/layout/BrandLogo";
import LanguageToggle from "../components/layout/LanguageToggle";
import { useLanguage } from "../context/LanguageContext";
import {
  getCurrentWorkoutDay,
  getWorkoutLabel,
} from "../workout/workoutSequence";

const Achievements = lazy(() => import("../components/achievements/Achievements"));
const Challenges = lazy(() => import("../components/challenges/Challenges"));
const CreatePost = lazy(() => import("../components/feed/CreatePost"));
const Feed = lazy(() => import("../components/feed/Feed"));
const LevelProgressCard = lazy(
  () => import("../components/level/LevelProgressCard"),
);
const Leaderboard = lazy(() => import("../components/ranking/Leaderboard"));
const ProfileSettings = lazy(
  () => import("../components/profile/ProfileSettings"),
);
const ProgressAnalytics = lazy(
  () => import("../components/analytics/ProgressAnalytics"),
);
const SearchUsers = lazy(() => import("../components/profile/SearchUsers"));
const WeeklyRanking = lazy(() => import("../components/ranking/WeeklyRanking"));
const WorkoutCalendar = lazy(() => import("../components/WorkoutCalendar"));
const WorkoutManager = lazy(() => import("../workout/WorkoutManager"));

function DashboardFallback() {
  return (
    <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6 text-sm font-semibold text-zinc-500 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
      Loading...
    </div>
  );
}

function Dashboard() {
  const { user, signOut } = useAuth();
  const { t, translate } = useLanguage();

  const [activeTab, setActiveTab] = useState("home");
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);
  const { profile, setProfile } = useProfile({
    enabled: Boolean(user?.id),
    userId: user?.id,
  });
  const {
    activePlan: dashboardActivePlan,
    exercises: dashboardExercises,
    refetch: refetchDashboardWorkout,
    workoutLogs: dashboardWorkoutLogs,
  } = useWorkoutData({
    enabled: Boolean(user?.id),
    userId: user?.id,
  });

  function handleMobileMenuTab(tab) {
    setActiveTab(tab);
    setShowMobileMenu(false);
  }

  const dashboardWorkout = useMemo(() => {
    if (!dashboardActivePlan) {
      return {
        value: t("dashboard.workout.start"),
        desktopValue: t("dashboard.stats.workout"),
      };
    }

    if (dashboardExercises.length === 0) {
      return {
        value: t("dashboard.workout.empty"),
        desktopValue: t("dashboard.workout.addExercises"),
      };
    }

    const currentWorkoutDay = getCurrentWorkoutDay(
      dashboardExercises,
      dashboardWorkoutLogs,
    );
    const currentWorkoutLabel = translate(
      getWorkoutLabel(dashboardActivePlan, currentWorkoutDay),
    );

    return {
      value: currentWorkoutLabel,
      desktopValue: currentWorkoutLabel,
    };
  }, [dashboardActivePlan, dashboardExercises, dashboardWorkoutLogs, t, translate]);

  const displayName =
    profile?.username ||
    profile?.name ||
    profile?.full_name ||
    profile?.display_name ||
    user?.email?.split("@")[0] ||
    "User";

  const isMoreActive =
    activeTab === "rankings" ||
    activeTab === "challenges" ||
    activeTab === "settings";

  const stats = [
    {
      title: t("dashboard.stats.streak"),
      desktopTitle: t("dashboard.stats.currentStreak"),
      value: `${profile?.streak || 0}d`,
      desktopValue: `${profile?.streak || 0}d`,
      icon: Flame,
    },
    {
      title: t("dashboard.stats.xp"),
      desktopTitle: t("dashboard.stats.totalXp"),
      value: profile?.xp || 0,
      desktopValue: profile?.xp || 0,
      icon: Trophy,
    },
    {
      title: t("dashboard.stats.workout"),
      desktopTitle: t("dashboard.stats.currentWorkout"),
      value: dashboardWorkout.value,
      desktopValue: dashboardWorkout.desktopValue,
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
          z-30

          dark:border-white/10
          dark:bg-zinc-950
        "
      >
        <div>
          <div className="flex w-full justify-center">
            <BrandLogo layout="stacked" size="md" showTagline />
          </div>

          <div className="mt-14 space-y-3">
            <SidebarButton
              active={activeTab === "home"}
              onClick={() => setActiveTab("home")}
              icon={<Home size={20} />}
              text={t("dashboard.nav.dashboard")}
            />

            <SidebarButton
              active={activeTab === "workouts"}
              onClick={() => setActiveTab("workouts")}
              icon={<Dumbbell size={20} />}
              text={t("dashboard.nav.workouts")}
            />

            <SidebarButton
              active={activeTab === "progress"}
              onClick={() => setActiveTab("progress")}
              icon={<Activity size={20} />}
              text={t("dashboard.nav.progress")}
            />

            <SidebarButton
              active={activeTab === "rankings"}
              onClick={() => setActiveTab("rankings")}
              icon={<Medal size={20} />}
              text={t("dashboard.nav.rankings")}
            />

            <SidebarButton
              active={activeTab === "feed"}
              onClick={() => setActiveTab("feed")}
              icon={<Users size={20} />}
              text={t("dashboard.nav.feed")}
            />

            <SidebarButton
              active={activeTab === "challenges"}
              onClick={() => setActiveTab("challenges")}
              icon={<Target size={20} />}
              text={t("dashboard.nav.challenges")}
            />

            <div className="pt-2">
              <SidebarButton
                active={activeTab === "settings"}
                onClick={() => setActiveTab("settings")}
                icon={<Settings size={20} />}
                text={t("dashboard.nav.settings")}
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
          {t("dashboard.logout")}
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
          py-5
          sm:py-10
          pb-28
          sm:pb-32
          lg:pb-10
          relative
        "
      >
        <div
          className="
            w-full
            max-w-7xl
            mx-auto
            relative
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
              gap-4
              sm:gap-5
              relative
              z-50
              overflow-visible
            "
          >
            <div className="min-w-0 w-full">
              <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base">
                {t("dashboard.welcomeBack")}
              </p>

              <h1
                className="
                  text-2xl
                  sm:text-4xl
                  lg:text-5xl
                  font-black
                  mt-1
                  sm:mt-2
                  break-words
                  leading-tight
                "
              >
                {displayName}
              </h1>
            </div>

            {/* HEADER ACTIONS */}
            <div
              className="
                flex
                items-center
                gap-3
                w-full
                sm:w-auto
                justify-end
                relative
                z-50
                overflow-visible
              "
            >
              <div className="relative z-50">
                <LanguageToggle />
              </div>

              <div className="relative z-50">
                <ThemeToggle />
              </div>

              <div className="relative z-50">
                <NotificationBell user={user} />
              </div>

              <button
                onClick={() => setShowSearch(true)}
                className="
                  flex
                  items-center
                  justify-center
                  w-11
                  h-11
                  sm:w-12
                  sm:h-12
                  rounded-2xl
                  bg-white
                  text-zinc-950
                  border
                  border-zinc-200
                  hover:border-purple-500
                  hover:text-purple-500
                  transition
                  shadow-sm
                  shrink-0

                  dark:bg-white/5
                  dark:text-white
                  dark:border-white/10
                  dark:hover:text-purple-300
                "
                aria-label="Search users"
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
                  z-[9999]
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

                  <Suspense fallback={<DashboardFallback />}>
                    <SearchUsers />
                  </Suspense>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* MOBILE MORE MENU */}
          <AnimatePresence>
            {showMobileMenu && (
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
                  z-[9998]
                  bg-black/40
                  backdrop-blur-sm
                  lg:hidden
                "
                onClick={() => setShowMobileMenu(false)}
              >
                <motion.div
                  initial={{
                    y: 120,
                    opacity: 0,
                  }}
                  animate={{
                    y: 0,
                    opacity: 1,
                  }}
                  exit={{
                    y: 120,
                    opacity: 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 240,
                    damping: 24,
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="
                    absolute
                    left-3
                    right-3
                    bottom-24
                    rounded-3xl
                    bg-white
                    border
                    border-zinc-200
                    shadow-2xl
                    p-4
                    text-zinc-950

                    dark:bg-zinc-950
                    dark:border-white/10
                    dark:text-white
                  "
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-lg">
                      {translate("More options")}
                    </h3>

                    <button
                      onClick={() => setShowMobileMenu(false)}
                      className="
                        w-10
                        h-10
                        rounded-xl
                        flex
                        items-center
                        justify-center
                        bg-zinc-100
                        hover:bg-zinc-200
                        transition

                        dark:bg-white/10
                        dark:hover:bg-white/20
                      "
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <MobileMenuButton
                      active={activeTab === "rankings"}
                      onClick={() => handleMobileMenuTab("rankings")}
                      icon={<Medal size={20} />}
                      text={t("dashboard.nav.rankings")}
                    />

                    <MobileMenuButton
                      active={activeTab === "challenges"}
                      onClick={() => handleMobileMenuTab("challenges")}
                      icon={<Target size={20} />}
                      text={t("dashboard.nav.challenges")}
                    />

                    <MobileMenuButton
                      active={activeTab === "settings"}
                      onClick={() => handleMobileMenuTab("settings")}
                      icon={<Settings size={20} />}
                      text={t("dashboard.nav.settings")}
                    />

                    <button
                      onClick={signOut}
                      className="
                        flex
                        items-center
                        gap-3
                        rounded-2xl
                        border
                        border-red-500/20
                        bg-red-500/10
                        px-4
                        py-4
                        font-bold
                        text-sm
                        text-red-500
                        hover:bg-red-500/20
                        transition
                      "
                    >
                      <LogOut size={20} />
                      {t("dashboard.logout")}
                    </button>
                  </div>
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
                  mt-6
                  sm:mt-14
                  grid
                  grid-cols-3
                  gap-3
                  sm:gap-8
                  relative
                  z-10
                "
              >
                {stats.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={item.desktopTitle}
                      initial={{
                        opacity: 0,
                        y: 24,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: index * 0.12,
                      }}
                      whileHover={{
                        scale: 1.02,
                        y: -4,
                      }}
                      className="
                        bg-white
                        border
                        border-zinc-200
                        rounded-2xl
                        sm:rounded-3xl
                        p-3
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
                          w-9
                          h-9
                          sm:w-14
                          sm:h-14
                          rounded-xl
                          sm:rounded-2xl
                          bg-gradient-to-r
                          from-purple-500
                          to-fuchsia-500
                          text-white
                          flex
                          items-center
                          justify-center
                        "
                      >
                        <Icon size={18} className="sm:hidden" />
                        <Icon size={24} className="hidden sm:block" />
                      </div>

                      <p className="text-zinc-600 dark:text-zinc-400 mt-3 sm:mt-6 text-[11px] sm:text-base">
                        <span className="sm:hidden">{item.title}</span>

                        <span className="hidden sm:inline">
                          {item.desktopTitle}
                        </span>
                      </p>

                      <h2
                        className="
                          text-lg
                          sm:text-4xl
                          font-black
                          mt-1
                          sm:mt-2
                          break-words
                          leading-tight
                        "
                      >
                        <span className="sm:hidden">{item.value}</span>

                        <span className="hidden sm:inline">
                          {item.desktopValue}
                        </span>
                      </h2>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-5 sm:mt-10 relative z-10">
                <Suspense fallback={<DashboardFallback />}>
                  <LevelProgressCard xp={profile?.xp || 0} />
                </Suspense>
              </div>

              <DashboardBlock>
                <WorkoutSummaryCard user={user} />
              </DashboardBlock>

              <DashboardBlock>
                <Suspense fallback={<DashboardFallback />}>
                  <Achievements user={user} />
                </Suspense>
              </DashboardBlock>
            </>
          )}

          {/* WORKOUTS TAB */}
          {activeTab === "workouts" && (
            <Suspense fallback={<DashboardFallback />}>
              <PageContainer>
                <WorkoutManager
                  user={user}
                  profile={profile}
                  onProfileUpdated={(updatedProfile) => {
                    setProfile(updatedProfile);
                    refetchDashboardWorkout();
                  }}
                />

                <WorkoutCalendar user={user} />
              </PageContainer>
            </Suspense>
          )}

          {/* PROGRESS TAB */}
          {activeTab === "progress" && (
            <Suspense fallback={<DashboardFallback />}>
              <PageContainer>
                <ProgressAnalytics user={user} />
              </PageContainer>
            </Suspense>
          )}

          {/* RANKINGS TAB */}
          {activeTab === "rankings" && (
            <Suspense fallback={<DashboardFallback />}>
              <PageContainer>
                <WeeklyRanking />

                <Leaderboard />
              </PageContainer>
            </Suspense>
          )}

          {/* FEED TAB */}
          {activeTab === "feed" && (
            <Suspense fallback={<DashboardFallback />}>
              <PageContainer>
                <CreatePost
                  user={user}
                  profile={profile}
                  onPostCreated={() => setFeedRefreshKey((prev) => prev + 1)}
                />

                <Feed user={user} profile={profile} refreshKey={feedRefreshKey} />
              </PageContainer>
            </Suspense>
          )}

          {/* CHALLENGES TAB */}
          {activeTab === "challenges" && (
            <Suspense fallback={<DashboardFallback />}>
              <div className="mt-6 sm:mt-10 relative z-10">
                <Challenges
                  user={user}
                  profile={profile}
                  onProfileUpdated={setProfile}
                />
              </div>
            </Suspense>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <Suspense fallback={<DashboardFallback />}>
              <div className="mt-6 sm:mt-10 relative z-10">
                <ProfileSettings
                  profile={profile}
                  user={user}
                  onProfileUpdated={setProfile}
                />
              </div>
            </Suspense>
          )}
        </div>
      </main>

      {/* FLOATING INBOX BUTTON */}
      <Link
        to="/inbox"
        className="
          fixed
          right-4
          bottom-24
          z-50
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
          shadow-2xl
          shadow-purple-500/30
          border
          border-white/20
          hover:scale-105
          active:scale-95
          transition

          lg:right-8
          lg:bottom-8
          lg:w-16
          lg:h-16
          lg:rounded-3xl
        "
        aria-label="Open inbox"
      >
        <MessageCircle size={24} className="lg:hidden" />
        <MessageCircle size={28} className="hidden lg:block" />
      </Link>

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
          py-2
          flex
          items-center
          justify-around
          lg:hidden
          z-40
          mobile-bottom-nav

          dark:bg-zinc-950/95
          dark:text-white
          dark:border-white/10
        "
      >
        <MobileNavButton
          active={activeTab === "home"}
          onClick={() => setActiveTab("home")}
          icon={<Home size={21} />}
          text={t("dashboard.nav.dashboard")}
        />

        <MobileNavButton
          active={activeTab === "workouts"}
          onClick={() => setActiveTab("workouts")}
          icon={<Dumbbell size={21} />}
          text={t("dashboard.nav.workouts")}
        />

        <MobileNavButton
          active={activeTab === "progress"}
          onClick={() => setActiveTab("progress")}
          icon={<Activity size={21} />}
          text={t("dashboard.nav.progress")}
        />

        <MobileNavButton
          active={activeTab === "feed"}
          onClick={() => setActiveTab("feed")}
          icon={<Users size={21} />}
          text={t("dashboard.nav.feed")}
        />

        <MobileNavButton
          active={isMoreActive}
          onClick={() => setShowMobileMenu(true)}
          icon={<MoreHorizontal size={21} />}
          text={translate("More")}
        />
      </div>
    </section>
  );
}

function PageContainer({ children }) {
  return (
    <div
      className="
        mt-6
        sm:mt-10
        space-y-6
        sm:space-y-10
        w-full
        min-w-0
        relative
        z-10
      "
    >
      {children}
    </div>
  );
}

function DashboardBlock({ children }) {
  return (
    <div
      className="
        mt-6
        sm:mt-10
        w-full
        min-w-0
        overflow-visible
        relative
        z-10
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
        justify-center
        gap-1
        text-[10px]
        transition
        w-[64px]
        py-1

        ${active ? "text-purple-500" : "text-zinc-500 hover:text-purple-500"}
      `}
    >
      <div
        className={`
          w-10
          h-8
          rounded-2xl
          flex
          items-center
          justify-center
          transition

          ${active ? "bg-purple-500/10" : "bg-transparent"}
        `}
      >
        {icon}
      </div>

      <span className="truncate max-w-full">{text}</span>
    </button>
  );
}

function MobileMenuButton({ active, onClick, icon, text }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex
        items-center
        gap-3
        rounded-2xl
        border
        px-4
        py-4
        font-bold
        text-sm
        transition

        ${
          active
            ? "bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white border-transparent"
            : `
              bg-zinc-50
              border-zinc-200
              text-zinc-700
              hover:border-purple-500

              dark:bg-white/5
              dark:border-white/10
              dark:text-zinc-300
            `
        }
      `}
    >
      {icon}
      {text}
    </button>
  );
}

function WorkoutSummaryCard({ user }) {
  const { translate } = useLanguage();
  const today = new Date().toISOString().split("T")[0];
  const {
    activePlan,
    exercises,
    loading,
    progress,
    workoutLogs: logs,
  } = useWorkoutData({
    enabled: Boolean(user?.id),
    includeProgress: true,
    today,
    userId: user?.id,
  });

  function getTodayCompletedLog(logList) {
    return (
      logList.find((log) => {
        const status = log.status || "completed";

        return log.workout_date === today && status === "completed";
      }) || null
    );
  }

  function getDayLabel(day) {
    return translate(getWorkoutLabel(activePlan, day));
  }

  const currentWorkoutDay = useMemo(() => {
    return getCurrentWorkoutDay(exercises, logs);
  }, [exercises, logs]);

  const currentExercises = useMemo(() => {
    return exercises.filter(
      (exercise) => (exercise.workout_day || "Treino A") === currentWorkoutDay,
    );
  }, [exercises, currentWorkoutDay]);

  const completedToday = useMemo(() => {
    return currentExercises.filter((exercise) =>
      progress.some(
        (item) => item.exercise_id === exercise.id && item.completed,
      ),
    ).length;
  }, [currentExercises, progress]);

  const totalToday = currentExercises.length;

  const todayCompletedLog = useMemo(() => {
    return getTodayCompletedLog(logs);
  }, [logs]);

  const workoutCompletedToday = Boolean(todayCompletedLog);

  const progressPercent =
    totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  if (loading) {
    return (
      <div className="bg-white border border-zinc-200 rounded-2xl sm:rounded-3xl p-5 shadow-sm dark:bg-white/5 dark:border-white/10">
        <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
          <Loader2 className="animate-spin" size={20} />
          {translate("Loading workout...")}
        </div>
      </div>
    );
  }

  if (!activePlan) {
    return (
      <div className="bg-white border border-zinc-200 rounded-2xl sm:rounded-3xl p-5 shadow-sm dark:bg-white/5 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
            <Dumbbell size={22} />
          </div>

          <div>
            <h3 className="font-black text-lg">{translate("Today's workout")}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {translate("Create a workout plan to start tracking.")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm dark:bg-white/5 dark:border-white/10">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white flex items-center justify-center shrink-0">
            <Dumbbell size={22} />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold text-purple-500 uppercase tracking-wide">
              {translate("Today's workout")}
            </p>

            <h3 className="font-black text-xl truncate">
              {getDayLabel(currentWorkoutDay)}
            </h3>

            <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
              {translate(activePlan.title)}
            </p>
          </div>
        </div>

        {workoutCompletedToday && (
          <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
            <CheckCircle size={21} />
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">
          <span>
            {workoutCompletedToday
              ? translate("Completed today")
              : `${completedToday}/${totalToday} ${translate("exercises")}`}
          </span>

          <span>{workoutCompletedToday ? "100%" : `${progressPercent}%`}</span>
        </div>

        <div className="h-3 rounded-full bg-zinc-100 overflow-hidden dark:bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all"
            style={{
              width: workoutCompletedToday ? "100%" : `${progressPercent}%`,
            }}
          />
        </div>
      </div>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {workoutCompletedToday
          ? translate("You already completed today's workout.")
          : translate("Continue your current workout sequence.")}
      </p>
    </div>
  );
}

export default Dashboard;
