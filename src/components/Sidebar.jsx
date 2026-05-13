import {
  Home,
  Newspaper,
  Trophy,
  MessageCircle,
  User,
  Dumbbell,
  Settings,
  LogOut,
} from "lucide-react";

import { NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Sidebar() {

  const { signOut, user } = useAuth();

  const menu = [
    {
      name: "Dashboard",
      icon: Home,
      path: "/dashboard",
    },

    {
      name: "Feed",
      icon: Newspaper,
      path: "/feed",
    },

    {
      name: "Inbox",
      icon: MessageCircle,
      path: "/inbox",
    },

    {
      name: "Leaderboard",
      icon: Trophy,
      path: "/leaderboard",
    },

    {
      name: "Workout",
      icon: Dumbbell,
      path: "/workout",
    },

    {
      name: "Profile",
      icon: User,
      path: `/profile/${user?.email?.split("@")[0]}`,
    },

    {
      name: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  return (
    <aside
      className="
        hidden
        lg:flex
        w-[280px]
        h-screen
        bg-white/70
        dark:bg-[var(--app-surface)]
        border-r
        border-black/10
        dark:border-white/10
        backdrop-blur-xl
        p-6
        fixed
        left-0
        top-0
        flex
        flex-col
        justify-between
      "
    >

      {/* TOP */}
      <div>

        <h1
          className="
            text-3xl
            font-black
            text-black
            dark:text-white
            mb-12
          "
        >
          GymFocus
        </h1>

        <nav className="space-y-3">

          {menu.map((item) => {

            const Icon = item.icon;

            return (

              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `
                    flex
                    items-center
                    gap-4
                    px-5
                    py-4
                    rounded-2xl
                    transition
                    font-semibold

                    ${
                      isActive
                        ? `
                          bg-gradient-to-r
                          from-purple-500
                          to-fuchsia-500
                          text-white
                        `
                        : `
                          text-zinc-500
                          dark:text-zinc-400
                          hover:bg-black/5
                          dark:hover:bg-white/5
                          hover:text-black
                          dark:hover:text-white
                        `
                    }
                  `
                }
              >

                <Icon size={22} />

                {item.name}

              </NavLink>

            );

          })}

        </nav>

      </div>

      {/* BOTTOM */}
      <button
        onClick={signOut}
        className="
          flex
          items-center
          gap-4
          px-5
          py-4
          rounded-2xl
          text-red-400
          hover:bg-red-500/10
          transition
          font-semibold
        "
      >

        <LogOut size={22} />

        Logout

      </button>

    </aside>
  );
}

export default Sidebar;