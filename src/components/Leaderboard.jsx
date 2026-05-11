import { useEffect, useState } from "react";

import { Crown } from "lucide-react";

import { supabase } from "../lib/supabase";

import { motion } from "framer-motion";

import { Link } from "react-router-dom";

function Leaderboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getRanking();
  }, []);

  async function getRanking() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("xp", {
        ascending: false,
      })
      .limit(5);

    if (error) {
      console.log(error);

      return;
    }

    setUsers(data);
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
      transition={{
        delay: 0.8,
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
        items-center
        gap-3
        mb-8
      "
      >
        <Crown className="text-yellow-400" />

        <h2
          className="
          text-3xl
          font-black
        "
        >
          Global Ranking
        </h2>
      </div>

      <div className="space-y-4">
        {users.map((user, index) => (
          <div
            key={user.id}
            className="
              flex
              items-center
              justify-between
              bg-white/5
              border
              border-white/10
              rounded-2xl
              px-6
              py-5
            "
          >
            <div
              className="
              flex
              items-center
              gap-5
            "
            >
              <div
                className="
                w-12
                h-12
                rounded-xl
                bg-gradient-to-r
                from-purple-500
                to-fuchsia-500
                flex
                items-center
                justify-center
                font-bold
              "
              >
                #{index + 1}
              </div>

              <div>
                <h3 className="font-bold text-lg">
                  <Link
                    to={`/profile/${user.username}`}
                    className="
    hover:text-purple-400
    transition
  "
                  >
                    {user.username}
                  </Link>
                </h3>

                <p className="text-zinc-400 text-sm">{user.current_workout}</p>
              </div>
            </div>

            <div className="text-right">
              <h2
                className="
                text-2xl
                font-black
                text-purple-400
              "
              >
                {user.xp} XP
              </h2>

              <p className="text-zinc-500 text-sm">🔥 {user.streak} streak</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default Leaderboard;
