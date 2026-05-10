import { motion } from "framer-motion";

import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

import { Flame, Trophy, Dumbbell, LogOut, CheckCircle } from "lucide-react";

import Leaderboard from "../components/Leaderboard";

import { useAuth } from "../context/AuthContext";

import CreatePost from "../components/CreatePost";

import Feed from "../components/Feed";

import ProfileSettings from "../components/ProfileSettings"

function Dashboard() {
  const { user, signOut } = useAuth();

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function getProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);
    }

    if (user) {
      getProfile();
    }
  }, [user]);

  async function completeWorkout() {
    if (!profile) return;

    const newXP = profile.xp + 120;

    const newStreak = profile.streak + 1;

    const { error } = await supabase
      .from("profiles")
      .update({
        xp: newXP,
        streak: newStreak,
      })
      .eq("id", user.id);

    if (error) {
      console.log(error);

      return;
    }

    setProfile({
      ...profile,
      xp: newXP,
      streak: newStreak,
    });
  }

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
              <p className="text-zinc-400">Progress to Level 09</p>

              <h3
                className="
                text-3xl
                font-black
                mt-2
              "
              >
                74%
              </h3>
            </div>

            <div
              className="
              text-purple-400
              font-bold
            "
            >
              +240 XP
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
                width: "74%",
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

      <Feed user={user} profile={profile} />

      <ProfileSettings
        profile={profile}
        user={user}
    />
    </section>
  );
}

export default Dashboard;
