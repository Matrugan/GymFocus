import { Dumbbell } from "lucide-react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8 }}
      className="
        fixed
        top-0
        left-0
        w-full
        z-50
        backdrop-blur-xl
        bg-black/20
        border-b
        border-white/10
      "
    >

      <div className="
        max-w-7xl
        mx-auto
        px-6
        py-5
        flex
        items-center
        justify-between
      ">

        {/* Logo */}
        <div className="flex items-center gap-3">

          <div className="
            w-10
            h-10
            rounded-2xl
            bg-gradient-to-r
            from-purple-500
            to-fuchsia-500
            flex
            items-center
            justify-center
            shadow-lg
            shadow-purple-500/30
          ">
            <Dumbbell size={20} />
          </div>

          <h1 className="
            text-2xl
            font-black
            tracking-tight
          ">
            Gym
            <span className="text-purple-500">
              Focus
            </span>
          </h1>

        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-10">

          <a
            href="#"
            className="text-zinc-300 hover:text-white transition"
          >
            Features
          </a>

          <a
            href="#"
            className="text-zinc-300 hover:text-white transition"
          >
            Community
          </a>

          <a
            href="#"
            className="text-zinc-300 hover:text-white transition"
          >
            Rankings
          </a>

        </nav>

        {/* Button */}
        <button className="
          bg-gradient-to-r
          from-purple-500
          to-fuchsia-500
          px-6
          py-3
          rounded-2xl
          font-semibold
          hover:scale-105
          transition
        ">
          Join Now
        </button>

      </div>

    </motion.header>
  )
}

export default Navbar