import { useEffect, useMemo, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabase";

import { useAuth } from "../context/AuthContext";
import useFeed from "../hooks/useFeed";
import useFollow from "../hooks/useFollow";
import useProfileData from "../hooks/useProfile";

import {
  Heart,
  ArrowLeft,
  MessageCircle,
  Trophy,
  Flame,
  Dumbbell,
  CheckCircle,
  Loader2,
  Star,
  UserRound,
} from "lucide-react";

import { motion } from "framer-motion";

import CommentSection from "../components/feed/CommentSection";

import ProfileBadges from "../components/achievements/ProfileBadges";
import LevelProgressCard from "../components/level/LevelProgressCard";

import { getLevel, getRankInfo } from "../utils/levelSystem";

import ThemeToggle from "../components/layout/ThemeToggle";
import { useLanguage } from "../context/LanguageContext";
import { reportError } from "../utils/errorHandler";
import {
  getCurrentWorkoutDay,
  getWorkoutLabel,
  sortWorkoutLogs,
} from "../workout/workoutSequence";

function Profile() {
  const { translate } = useLanguage();
  const { username } = useParams();

  const { user } = useAuth();

  const navigate = useNavigate();

  const { profile } = useProfileData({
    enabled: Boolean(username),
    username,
  });
  const { likes, posts, toggleLike } = useFeed({
    enabled: Boolean(profile?.id),
    profileId: profile?.id,
    userId: user?.id,
  });
  const { followersCount, followingCount, isFollowing, toggleFollow } =
    useFollow({
      enabled: Boolean(profile?.id),
      profileId: profile?.id,
      userId: user?.id,
    });

  async function startConversation() {
    if (!user || !profile) return;

    const { data: existingParticipants } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);

    if (existingParticipants?.length > 0) {
      const conversationIds = existingParticipants.map(
        (item) => item.conversation_id
      );

      const { data: otherParticipants } = await supabase
        .from("conversation_participants")
        .select("*")
        .in("conversation_id", conversationIds)
        .eq("user_id", profile.id);

      if (otherParticipants?.length > 0) {
        navigate(`/chat/${otherParticipants[0].conversation_id}`);
        return;
      }
    }

    const { data: conversation, error } = await supabase
      .from("conversations")
      .insert([
        {
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      reportError(error);
      return;
    }

    const { error: selfParticipantError } = await supabase
      .from("conversation_participants")
      .insert([
        {
          conversation_id: conversation.id,
          user_id: user.id,
        },
      ]);

    if (selfParticipantError) {
      reportError(selfParticipantError);
      return;
    }

    const { error: otherParticipantError } = await supabase
      .from("conversation_participants")
      .insert([
        {
          conversation_id: conversation.id,
          user_id: profile.id,
        },
      ]);

    if (otherParticipantError) {
      reportError(otherParticipantError);
      return;
    }

    navigate(`/chat/${conversation.id}`);
  }

  if (!profile) {
    return (
      <div
        className="
          min-h-screen
          bg-zinc-50
          text-zinc-950
          flex
          items-center
          justify-center

          dark:bg-black
          dark:text-white
        "
      >
        Loading...
      </div>
    );
  }

  const level = getLevel(profile?.xp || 0);

  const rank = getRankInfo(level);

  const totalLikes = posts.reduce((total, post) => {
    const postLikes = likes.filter((like) => like.post_id === post.id).length;

    return total + postLikes;
  }, 0);

  return (
    <section
      className="
        min-h-screen
        bg-zinc-50
        text-zinc-950
        px-4
        sm:px-6
        py-6
        sm:py-10
        relative
        overflow-hidden
        transition-colors

        dark:bg-black
        dark:text-white
      "
    >
      {/* BACKGROUND GLOW */}
      <div
        className="
          absolute
          top-0
          left-1/2
          -translate-x-1/2
          w-[420px]
          h-[420px]
          sm:w-[600px]
          sm:h-[600px]
          bg-purple-500/10
          blur-[120px]
          sm:blur-[160px]
          rounded-full
          pointer-events-none
        "
      />

      <div
        className="
          relative
          z-10
          w-full
          max-w-6xl
          mx-auto
          min-w-0
        "
      >
        {/* TOP BAR */}
        <div
          className="
            flex
            items-center
            justify-between
            gap-4
            mb-6
            sm:mb-8
          "
        >
          <button
            onClick={() => navigate(-1)}
            className="
              flex
              items-center
              gap-2
              text-zinc-600
              hover:text-zinc-950
              bg-white
              border
              border-zinc-200
              rounded-2xl
              px-4
              py-3
              shadow-sm
              transition
              text-sm
              sm:text-base

              dark:text-zinc-400
              dark:hover:text-white
              dark:bg-white/5
              dark:border-white/10
            "
          >
            <ArrowLeft size={19} />
            {translate("Back")}
          </button>

          <ThemeToggle />
        </div>

        {/* PROFILE HERO */}
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
            border
            border-zinc-200
            rounded-[26px]
            sm:rounded-[36px]
            overflow-hidden
            shadow-sm
            transition-colors
            min-w-0

            dark:bg-white/5
            dark:border-white/10
            dark:backdrop-blur-xl
          "
        >
          {/* BANNER */}
          <div
            className="
              h-40
              sm:h-48
              md:h-64
              relative
              bg-gradient-to-r
              from-purple-700
              via-fuchsia-600
              to-purple-900
              overflow-hidden
            "
          >
            {profile.banner_url && (
              <img
                src={profile.banner_url}
                alt=""
                className="
                  absolute
                  inset-0
                  w-full
                  h-full
                  object-cover
                "
              />
            )}

            <div className="absolute inset-0 bg-black/25" />

            <div
              className="
                absolute
                inset-0
                bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_30%)]
              "
            />

            <div
              className={`
                absolute
                bottom-4
                left-4
                sm:bottom-6
                sm:left-8
                flex
                items-center
                gap-2
                sm:gap-3
                bg-black/35
                border
                border-white/15
                rounded-2xl
                px-4
                sm:px-5
                py-2.5
                sm:py-3
                backdrop-blur-xl
                text-white
                text-sm
                sm:text-base
                shadow-lg
              `}
            >
              <span
                className={`
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-xl
                  bg-gradient-to-br
                  ${rank.gradient}
                  text-base
                  font-black
                `}
              >
                {rank.icon}
              </span>

              <span className="font-bold">
                {translate(rank.name)} - {translate("Level")} {level}
              </span>
            </div>
          </div>

          {/* PROFILE CONTENT */}
          <div
            className="
              p-4
              sm:p-6
              md:p-10
              -mt-14
              sm:-mt-20
              relative
              z-10
            "
          >
            <div
              className="
                flex
                flex-col
                lg:flex-row
                gap-6
                sm:gap-8
                lg:items-end
                justify-between
              "
            >
              <div
                className="
                  flex
                  flex-col
                  sm:flex-row
                  gap-5
                  sm:gap-8
                  sm:items-end
                  min-w-0
                "
              >
                {/* AVATAR */}
                <div className="relative shrink-0">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="
                        w-28
                        h-28
                        sm:w-36
                        sm:h-36
                        md:w-40
                        md:h-40
                        rounded-full
                        object-cover
                        border-4
                        border-white
                        ring-4
                        ring-purple-500
                        bg-zinc-100

                        dark:border-black
                        dark:bg-zinc-900
                      "
                    />
                  ) : (
                    <div
                      className="
                        w-28
                        h-28
                        sm:w-36
                        sm:h-36
                        md:w-40
                        md:h-40
                        rounded-full
                        border-4
                        border-white
                        ring-4
                        ring-purple-500
                        bg-zinc-100
                        flex
                        items-center
                        justify-center

                        dark:border-black
                        dark:bg-zinc-900
                      "
                    >
                      <UserRound size={46} className="text-zinc-500" />
                    </div>
                  )}

                  <div
                    className={`
                      absolute
                      bottom-2
                      right-2
                      sm:bottom-3
                      sm:right-3
                      w-5
                      h-5
                      rounded-full
                      border-4
                      border-white

                      dark:border-black

                      ${profile.online ? "bg-green-500" : "bg-zinc-500"}
                    `}
                  />
                </div>

                {/* INFO */}
                <div className="min-w-0">
                  <h1
                    className="
                      text-3xl
                      sm:text-4xl
                      md:text-6xl
                      font-black
                      break-words
                      leading-tight
                    "
                  >
                    {profile.username}
                  </h1>

                  <p
                    className="
                      text-zinc-600
                      mt-3
                      sm:mt-4
                      text-base
                      sm:text-lg
                      leading-relaxed
                      max-w-2xl
                      break-words

                      dark:text-zinc-400
                    "
                  >
                    {profile.bio || "No bio yet."}
                  </p>

                  <div
                    className="
                      flex
                      flex-wrap
                      gap-2
                      sm:gap-3
                      mt-4
                      sm:mt-5
                    "
                  >
                    <span
                      className="
                        px-4
                        py-2
                        rounded-full
                        bg-purple-500/10
                        border
                        border-purple-500/20
                        text-purple-500
                        text-xs
                        sm:text-sm
                        font-bold
                      "
                    >
                      Workout profile
                    </span>

                    <span
                      className="
                        px-4
                        py-2
                        rounded-full
                        bg-zinc-100
                        border
                        border-zinc-200
                        text-zinc-700
                        text-xs
                        sm:text-sm
                        font-bold

                        dark:bg-white/5
                        dark:border-white/10
                        dark:text-zinc-300
                      "
                    >
                      {profile.online ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              {user?.id !== profile.id && (
                <div
                  className="
                    flex
                    flex-col
                    sm:flex-row
                    gap-3
                    sm:gap-4
                    w-full
                    lg:w-auto
                  "
                >
                  <button
                    onClick={toggleFollow}
                    className={`
                      w-full
                      sm:w-auto
                      h-13
                      sm:h-14
                      px-8
                      py-4
                      rounded-2xl
                      font-bold
                      text-base
                      sm:text-lg
                      transition
                      hover:scale-105

                      ${
                        isFollowing
                          ? `
                            bg-zinc-100
                            text-zinc-800
                            border
                            border-zinc-200
                            hover:border-purple-500
                            hover:text-purple-500

                            dark:bg-white/10
                            dark:text-white
                            dark:border-white/10
                          `
                          : `
                            bg-gradient-to-r
                            from-purple-500
                            to-fuchsia-500
                            text-white
                          `
                      }
                    `}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>

                  <button
                    onClick={startConversation}
                    className="
                      w-full
                      sm:w-auto
                      h-13
                      sm:h-14
                      px-8
                      py-4
                      rounded-2xl
                      bg-white
                      border
                      border-zinc-200
                      text-zinc-800
                      font-bold
                      text-base
                      sm:text-lg
                      flex
                      items-center
                      justify-center
                      gap-3
                      hover:border-purple-500
                      hover:text-purple-500
                      transition
                      hover:scale-105
                      shadow-sm

                      dark:bg-white/5
                      dark:border-white/10
                      dark:text-white
                    "
                  >
                    <MessageCircle size={20} />
                    Message
                  </button>
                </div>
              )}
            </div>

            {/* STATS */}
            <div
              className="
                grid
                grid-cols-2
                md:grid-cols-4
                gap-3
                sm:gap-4
                mt-8
                sm:mt-10
              "
            >
              <StatCard
                label="Followers"
                value={followersCount}
                icon={<Star size={20} />}
              />

              <StatCard
                label="Following"
                value={followingCount}
                icon={<Star size={20} />}
              />

              <StatCard
                label="XP"
                value={profile.xp || 0}
                icon={<Trophy size={20} />}
              />

              <StatCard
                label="Streak"
                value={`${profile.streak || 0}`}
                icon={<Flame size={20} />}
              />
            </div>

            <div className="mt-6 sm:mt-8">
              <LevelProgressCard xp={profile.xp || 0} compact />
            </div>
          </div>
        </motion.div>

        {/* PROFILE EXTRA INFO */}
        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-[1fr_340px]
            gap-6
            sm:gap-8
            mt-8
            sm:mt-10
            min-w-0
          "
        >
          {/* POSTS */}
          <div className="space-y-5 sm:space-y-6 min-w-0">
            <div
              className="
                flex
                items-start
                sm:items-center
                justify-between
                gap-4
                flex-col
                sm:flex-row
              "
            >
              <div>
                <h2 className="text-2xl sm:text-3xl font-black">
                  Posts
                </h2>

                <p className="text-zinc-600 dark:text-zinc-500 mt-1 text-sm sm:text-base">
                  {posts.length} posts • {totalLikes} likes
                </p>
              </div>
            </div>

            {posts.length === 0 && (
              <div
                className="
                  bg-white
                  border
                  border-zinc-200
                  rounded-3xl
                  p-8
                  sm:p-10
                  text-zinc-500
                  text-center
                  shadow-sm

                  dark:bg-white/5
                  dark:border-white/10
                "
              >
                No posts yet.
              </div>
            )}

            {posts.map((post, index) => {
              const liked = likes.find(
                (like) => like.post_id === post.id && like.user_id === user?.id
              );

              const likesCount = likes.filter(
                (like) => like.post_id === post.id
              ).length;

              return (
                <motion.div
                  key={post.id}
                  initial={{
                    opacity: 0,
                    y: 30,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.05,
                  }}
                  className="
                    bg-white
                    border
                    border-zinc-200
                    rounded-2xl
                    sm:rounded-3xl
                    p-4
                    sm:p-6
                    md:p-8
                    shadow-sm
                    hover:border-purple-500/40
                    transition
                    min-w-0

                    dark:bg-white/5
                    dark:border-white/10
                    dark:backdrop-blur-xl
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-3
                      sm:gap-4
                      mb-4
                      sm:mb-5
                    "
                  >
                    <img
                      src={profile.avatar_url || "https://i.pravatar.cc/150"}
                      alt=""
                      className="
                        w-11
                        h-11
                        sm:w-12
                        sm:h-12
                        rounded-full
                        object-cover
                        border
                        border-purple-500/40
                        shrink-0
                      "
                    />

                    <div className="min-w-0">
                      <h3 className="font-bold truncate">
                        {profile.username}
                      </h3>

                      <p className="text-zinc-500 text-xs sm:text-sm">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <p
                    className="
                      text-base
                      sm:text-lg
                      text-zinc-800
                      leading-relaxed
                      whitespace-pre-wrap
                      break-words

                      dark:text-zinc-200
                    "
                  >
                    {post.content}
                  </p>

                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt=""
                      className="
                        mt-5
                        sm:mt-6
                        rounded-2xl
                        w-full
                        max-h-[360px]
                        sm:max-h-[500px]
                        object-cover
                        border
                        border-zinc-200

                        dark:border-white/10
                      "
                    />
                  )}

                  <div
                    className="
                      flex
                      items-center
                      gap-5
                      mt-5
                      sm:mt-6
                    "
                  >
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`
                        flex
                        items-center
                        gap-2
                        transition

                        ${
                          liked
                            ? "text-pink-500"
                            : "text-zinc-500 hover:text-pink-500 dark:text-zinc-400"
                        }
                      `}
                    >
                      <Heart
                        size={22}
                        fill={liked ? "currentColor" : "none"}
                      />

                      <span className="font-bold">
                        {likesCount}
                      </span>
                    </button>
                  </div>

                  <CommentSection
                    postId={post.id}
                    user={user}
                    profile={profile}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* SIDEBAR */}
          <div
            className="
              space-y-6
              sm:space-y-8
              min-w-0
            "
          >
            <ProfileBadges profileId={profile.id} />

            <WorkoutSummaryCard profileUserId={profile.id} />

            <div
              className="
                bg-white
                border
                border-zinc-200
                rounded-3xl
                p-6
                sm:p-8
                shadow-sm

                dark:bg-white/5
                dark:border-white/10
                dark:backdrop-blur-xl
              "
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="
                    w-11
                    h-11
                    sm:w-12
                    sm:h-12
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
                  <Dumbbell size={22} />
                </div>

                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-black">
                    {translate("Athlete Info")}
                  </h2>

                  <p className="text-zinc-500 text-sm">
                    {translate("Fitness profile")}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <InfoRow
                  label={translate("Total XP")}
                  value={`${profile.xp || 0} XP`}
                />

                <InfoRow
                  label={translate("Level")}
                  value={`${translate("Level")} ${level}`}
                />

                <InfoRow
                  label={translate("Streak")}
                  value={`${profile.streak || 0} ${translate("days")}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


function WorkoutSummaryCard({ profileUserId }) {
  const { translate } = useLanguage();
  const [activePlan, setActivePlan] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (profileUserId) {
      loadWorkoutSummary();
    }
  }, [profileUserId]);

  function getTodayCompletedLog(logList) {
    return (
      sortWorkoutLogs(logList).find((log) => {
        const status = log.status || "completed";

        return log.workout_date === today && status === "completed";
      }) || null
    );
  }

  function getDayLabel(day) {
    return translate(getWorkoutLabel(activePlan, day));
  }

  async function loadWorkoutSummary() {
    setLoading(true);

    const { data: plansData, error: plansError } = await supabase
      .from("workout_plans")
      .select("*")
      .eq("user_id", profileUserId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1);

    if (plansError) {
      reportError(plansError);
      setLoading(false);
      return;
    }

    const plan = plansData?.[0] || null;

    setActivePlan(plan);

    if (!plan) {
      setExercises([]);
      setLogs([]);
      setProgress([]);
      setLoading(false);
      return;
    }

    const { data: exercisesData, error: exercisesError } = await supabase
      .from("workout_exercises")
      .select("*")
      .eq("user_id", profileUserId)
      .eq("workout_plan_id", plan.id)
      .order("workout_day", { ascending: true })
      .order("sort_order", { ascending: true });

    if (exercisesError) {
      reportError(exercisesError);
      setLoading(false);
      return;
    }

    const { data: logsData, error: logsError } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", profileUserId)
      .eq("workout_plan_id", plan.id)
      .order("workout_date", { ascending: false });

    if (logsError) {
      reportError(logsError);
      setLoading(false);
      return;
    }

    const { data: progressData, error: progressError } = await supabase
      .from("daily_workout_progress")
      .select("*")
      .eq("user_id", profileUserId)
      .eq("workout_plan_id", plan.id)
      .eq("workout_date", today);

    if (progressError) {
      reportError(progressError);
      setLoading(false);
      return;
    }

    setExercises(exercisesData || []);
    setLogs(logsData || []);
    setProgress(progressData || []);
    setLoading(false);
  }

  const todayCompletedLog = useMemo(() => {
    return getTodayCompletedLog(logs);
  }, [logs]);

  const currentWorkoutDay = useMemo(() => {
    return todayCompletedLog?.workout_day || getCurrentWorkoutDay(exercises, logs);
  }, [exercises, logs, todayCompletedLog]);

  const currentExercises = useMemo(() => {
    return exercises.filter(
      (exercise) => (exercise.workout_day || "Treino A") === currentWorkoutDay
    );
  }, [exercises, currentWorkoutDay]);

  const completedToday = useMemo(() => {
    return currentExercises.filter((exercise) =>
      progress.some(
        (item) => item.exercise_id === exercise.id && item.completed
      )
    ).length;
  }, [currentExercises, progress]);

  const totalToday = currentExercises.length;

  const workoutCompletedToday = Boolean(todayCompletedLog);

  const progressPercent =
    totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  if (loading) {
    return (
      <div
        className="
          bg-white
          border
          border-zinc-200
          rounded-3xl
          p-6
          sm:p-8
          shadow-sm

          dark:bg-white/5
          dark:border-white/10
        "
      >
        <div className="flex items-center gap-3 text-zinc-500">
          <Loader2 className="animate-spin" size={20} />
          Loading workout...
        </div>
      </div>
    );
  }

  if (!activePlan) {
    return (
      <div
        className="
          bg-white
          border
          border-zinc-200
          rounded-3xl
          p-6
          sm:p-8
          shadow-sm

          dark:bg-white/5
          dark:border-white/10
        "
      >
        <div className="flex items-center gap-3">
          <div
            className="
              w-11
              h-11
              rounded-2xl
              bg-purple-500/10
              text-purple-500
              flex
              items-center
              justify-center
              shrink-0
            "
          >
            <Dumbbell size={22} />
          </div>

          <div>
            <h3 className="font-black text-lg">{translate("Today's workout")}</h3>
            <p className="text-sm text-zinc-500">
              {translate("No active workout plan yet.")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        bg-white
        border
        border-zinc-200
        rounded-3xl
        p-6
        sm:p-8
        shadow-sm

        dark:bg-white/5
        dark:border-white/10
      "
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3 min-w-0">
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
            <Dumbbell size={22} />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold text-purple-500 uppercase tracking-wide">
              {translate("Today's workout")}
            </p>

            <h3 className="font-black text-lg sm:text-xl truncate">
              {getDayLabel(currentWorkoutDay)}
            </h3>

            <p className="text-sm text-zinc-500 truncate">
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
        <div className="flex justify-between text-xs font-bold text-zinc-500 mb-2">
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

      <p className="text-sm text-zinc-500">
        {workoutCompletedToday
          ? translate("This workout was completed today.")
          : translate("Current workout based on the real sequence.")}
      </p>
    </div>
  );
}

function StatCard({ label, value, icon }) {
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
        "
      >
        {value}
      </h3>

      <p className="text-zinc-500 text-xs sm:text-sm mt-1">
        {label}
      </p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-4
        border-b
        border-zinc-200
        pb-4
        min-w-0

        dark:border-white/10
      "
    >
      <span className="text-zinc-500 text-sm">
        {label}
      </span>

      <span
        className="
          font-bold
          text-right
          text-sm
          break-words
        "
      >
        {value}
      </span>
    </div>
  );
}

export default Profile;
