import { motion } from "framer-motion";

import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

import { Flame, Trophy, Dumbbell, LogOut, CheckCircle } from "lucide-react";

import Leaderboard from "../components/Leaderboard";

import { useAuth } from "../context/AuthContext";

import CreatePost from "../components/CreatePost";

import Feed from "../components/Feed";

import ProfileSettings from "../components/ProfileSettings";

import WorkoutCalendar from "../components/WorkoutCalendar";

import NotificationBell from "../components/NotificationBell";

import SearchUsers from "../components/SearchUsers";

import {
  getLevel,
  getXPForNextLevel,
  getLevelProgress,
} from "../utils/levelSystem";

import { Link } from "react-router-dom";

import { MessageCircle } from "lucide-react";

function Dashboard() {
  const { user, signOut } = useAuth();

  const [loadingWorkout, setLoadingWorkout] = useState(false);

  const [profile, setProfile] = useState(null);

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

  useEffect(() => {
    if (user) {
      getProfile();
    }
  }, [user]);

  async function completeWorkout() {
    if (!profile) return;

    setLoadingWorkout(true);

    const today = new Date().toISOString().split("T")[0];

    // verifica se já treinou hoje
    const { data: existingWorkout } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("workout_date", today)
      .single();

    if (existingWorkout) {
      alert("Workout already completed today.");

      setLoadingWorkout(false);

      return;
    }

    // salva treino
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

    // atualiza profile
    const newXP = profile.xp + 100;

    const newStreak = profile.streak + 1;

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

    setProfile({
      ...profile,
      xp: newXP,
      streak: newStreak,
    });

    setLoadingWorkout(false);

    alert("Workout completed successfully!");
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
      bg-black
      text-white
      px-6
      py-10
      relative
      overflow-hidden
    "
    >
      {/* Glow */}
      <div
        className="
        absolute
        top-0
        left-1/2
        -translate-x-1/2
        w-[600px]
        h-[600px]
        bg-purple-500/10
        blur-[160px]
        rounded-full
      "
      ></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div
          className="
          flex
          justify-between
          items-center
          flex-wrap
          gap-5
        "
        >
          <div>
            <p className="text-zinc-400">Welcome back</p>

            <h1 className="text-5xl font-black mt-2">
              {user?.email?.split("@")[0]}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell user={user} />

            <button
              onClick={signOut}
              className="
      flex
      items-center
      gap-3
      bg-white/5
      border
      border-white/10
      px-6
      py-3
      rounded-2xl
      hover:border-purple-500
      transition
    "
            >
              <LogOut size={18} />
              Logout
            </button>

            <Link to="/inbox">

  <button
    className="
      flex
      items-center
      gap-3
      bg-white/5
      border
      border-white/10
      px-6
      py-3
      rounded-2xl
      hover:border-purple-500
      transition
    "
  >

    <MessageCircle size={18} />

    Inbox

  </button>

</Link>
          </div>
        </div>

        {/* Stats */}
        <div
          className="
          mt-14
          grid
          md:grid-cols-3
          gap-8
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
                  delay: index * 0.2,
                }}
                whileHover={{
                  scale: 1.03,
                }}
                className="
                  bg-white/5
                  border
                  border-white/10
                  backdrop-blur-xl
                  rounded-3xl
                  p-8
                  shadow-xl
                  shadow-purple-500/10
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
                  flex
                  items-center
                  justify-center
                "
                >
                  <Icon size={26} />
                </div>

                <p
                  className="
                  text-zinc-400
                  mt-6
                "
                >
                  {item.title}
                </p>

                <h2
                  className="
                  text-4xl
                  font-black
                  mt-2
                "
                >
                  {item.value}
                </h2>

                <button
                  onClick={completeWorkout}
                  className="
    mt-10
    w-full
    py-5
    rounded-2xl
    font-bold
    text-lg
    flex
    items-center
    justify-center
    gap-3
    bg-gradient-to-r
    from-purple-500
    to-fuchsia-500
    hover:scale-[1.02]
    transition
  "
                >
                  <CheckCircle />
                  Complete Workout
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Progress */}
        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.6,
          }}
          className="
            mt-14
            bg-white/5
            border
            border-white/10
            backdrop-blur-xl
            rounded-3xl
            p-8
          "
        >
          <div
            className="
            flex
            justify-between
            mb-4
          "
          >
            <div>
              <p className="text-zinc-400">Progress to Level {level + 1}</p>

              <h3
                className="
    text-3xl
    font-black
    mt-2
  "
              >
                {Math.floor(progress)}%
              </h3>
            </div>

            <div
              className="
              text-purple-400
              font-bold
            "
            >
              {profile?.xp || 0} / {nextLevelXP} XP
            </div>
          </div>

          <div
            className="
            w-full
            h-5
            bg-zinc-800
            rounded-full
            overflow-hidden
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
        </motion.div>
      </div>
      <Leaderboard />
      <CreatePost
        user={user}
        profile={profile}
        onPostCreated={() => window.location.reload()}
      />

      <div
        className="
    mt-10
    bg-gradient-to-r
    from-purple-600
    to-fuchsia-600
    p-8
    rounded-3xl
    flex
    justify-between
    items-center
    flex-wrap
    gap-5
  "
      >
        <div>
          <p className="text-sm opacity-70">Today's Workout</p>

          <h2 className="text-3xl font-bold">{profile?.current_workout}</h2>
        </div>

        <button
          onClick={completeWorkout}
          disabled={loadingWorkout}
          className="
      px-8
      py-4
      rounded-2xl
      bg-white
      text-black
      font-bold
      hover:scale-105
      transition
    "
        >
          {loadingWorkout ? "Loading..." : "Complete Workout"}
        </button>
      </div>

      <WorkoutCalendar user={user} />

      <SearchUsers />

      <Feed user={user} profile={profile} />

      <ProfileSettings profile={profile} user={user} />

      <Link
  to="/chat"
  className="
    fixed
    bottom-8
    right-8
    bg-gradient-to-r
    from-purple-500
    to-fuchsia-500
    px-6
    py-4
    rounded-2xl
    font-bold
    shadow-xl
    hover:scale-105
    transition
  "
>
  Open Chat
</Link>
    </section>
  );
}

export default Dashboard;
