import { useState } from "react";

import { supabase } from "../lib/supabase";

import { Link } from "react-router-dom";

import {
  Search,
  UserRound,
  ArrowRight,
  Loader2,
} from "lucide-react";

import { motion } from "framer-motion";

function SearchUsers() {
  const [search, setSearch] = useState("");

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(false);

  async function handleSearch(value) {
    setSearch(value);

    if (!value.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .ilike("username", `%${value}%`)
      .limit(8);

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    setUsers(data || []);

    setLoading(false);
  }

  return (
    <div
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

        dark:bg-zinc-950
        dark:text-white
        dark:border-white/10
        dark:backdrop-blur-xl
      "
    >
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
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
          <Search size={26} />
        </div>

        <div>
          <h2 className="text-3xl font-black">
            Search Users
          </h2>

          <p
            className="
              text-zinc-600
              mt-1

              dark:text-zinc-400
            "
          >
            Find athletes and visit their profiles.
          </p>
        </div>
      </div>

      {/* INPUT */}
      <div
        className="
          flex
          items-center
          gap-3
          bg-zinc-50
          border
          border-zinc-200
          rounded-2xl
          px-5
          py-4
          transition-colors

          dark:bg-black/30
          dark:border-white/10
        "
      >
        <Search
          size={20}
          className="text-zinc-500 shrink-0"
        />

        <input
          type="text"
          placeholder="Search username..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="
            w-full
            bg-transparent
            outline-none
            text-zinc-950
            placeholder:text-zinc-500

            dark:text-white
          "
        />

        {loading && (
          <Loader2
            size={20}
            className="
              text-purple-500
              animate-spin
              shrink-0
            "
          />
        )}
      </div>

      {/* RESULTS */}
      <div className="mt-6 space-y-4">
        {users.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{
              opacity: 0,
              y: 16,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: index * 0.05,
            }}
          >
            <Link to={`/profile/${item.username}`}>
              <div
                className="
                  bg-zinc-50
                  border
                  border-zinc-200
                  rounded-2xl
                  p-4
                  flex
                  items-center
                  justify-between
                  gap-4
                  hover:border-purple-500
                  hover:shadow-[0_0_30px_rgba(168,85,247,0.12)]
                  transition-all

                  dark:bg-black/30
                  dark:border-white/10
                  dark:hover:border-purple-500
                "
              >
                <div className="flex items-center gap-4 min-w-0">
                  {item.avatar_url ? (
                    <img
                      src={item.avatar_url}
                      alt=""
                      className="
                        w-14
                        h-14
                        rounded-full
                        object-cover
                        border
                        border-purple-500/40
                        shrink-0
                      "
                    />
                  ) : (
                    <div
                      className="
                        w-14
                        h-14
                        rounded-full
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
                      <UserRound size={24} />
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3
                      className="
                        font-bold
                        text-lg
                        truncate
                      "
                    >
                      {item.username}
                    </h3>

                    <p className="text-zinc-500 text-sm truncate">
                      {item.bio || "GymFocus Athlete"}
                    </p>
                  </div>
                </div>

                <div
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-white
                    border
                    border-zinc-200
                    text-zinc-600
                    flex
                    items-center
                    justify-center
                    shrink-0
                    transition

                    dark:bg-white/5
                    dark:border-white/10
                    dark:text-zinc-400
                  "
                >
                  <ArrowRight size={18} />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}

        {!loading && search.trim() && users.length === 0 && (
          <div
            className="
              bg-zinc-50
              border
              border-zinc-200
              rounded-2xl
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
              <UserRound size={28} />
            </div>

            <h3 className="text-xl font-black">
              No users found
            </h3>

            <p className="text-zinc-500 mt-2">
              Try searching for another username.
            </p>
          </div>
        )}

        {!search.trim() && (
          <div
            className="
              bg-zinc-50
              border
              border-zinc-200
              rounded-2xl
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
              <Search size={28} />
            </div>

            <h3 className="text-xl font-black">
              Search for athletes
            </h3>

            <p className="text-zinc-500 mt-2">
              Type a username to find people on GymFocus.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchUsers;