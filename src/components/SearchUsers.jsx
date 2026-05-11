import { useState } from "react";

import { supabase } from "../lib/supabase";

import { Link } from "react-router-dom";

function SearchUsers() {

  const [search, setSearch] = useState("");

  const [users, setUsers] = useState([]);

  async function handleSearch(value) {

    setSearch(value);

    if (!value) {

      setUsers([]);

      return;

    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .ilike("username", `%${value}%`);

    if (error) {

      console.log(error);

      return;

    }

    setUsers(data);

  }

  return (

    <div
      className="
        bg-white/5
        border
        border-white/10
        rounded-3xl
        p-8
        backdrop-blur-xl
        mt-10
      "
    >

      <h2 className="text-3xl font-black mb-6">
        Search Users
      </h2>

      <input
        type="text"
        placeholder="Search username..."
        value={search}
        onChange={(e) =>
          handleSearch(e.target.value)
        }
        className="
          w-full
          bg-black/30
          border
          border-white/10
          rounded-2xl
          p-4
          outline-none
        "
      />

      <div className="mt-6 space-y-4">

        {users.map((user) => (

          <Link
            key={user.id}
            to={`/profile/${user.username}`}
          >

            <div
              className="
                bg-black/30
                border
                border-white/10
                rounded-2xl
                p-4
                flex
                items-center
                gap-4
                hover:border-purple-500
                transition
              "
            >

              <img
                src={user.avatar_url}
                alt=""
                className="
                  w-14
                  h-14
                  rounded-full
                  object-cover
                "
              />

              <div>

                <h3 className="font-bold text-lg">
                  {user.username}
                </h3>

                <p className="text-zinc-400 text-sm">
                  GymFocus Athlete
                </p>

              </div>

            </div>

          </Link>

        ))}

      </div>

    </div>

  )

}

export default SearchUsers;