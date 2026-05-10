import { motion } from "framer-motion"
import Navbar from "../components/Navbar"
import AppPreview from "../components/sections/AppPreview"
import Rankings from "../components/sections/Rankings"
import Stats from "../components/sections/Stats"

function Home() {
  return (
    <>
    <Navbar />
    <section className="relative h-screen flex items-center justify-center overflow-hidden">

          {/* Animated Glow Background */}
          <motion.div
              animate={{
                  x: [0, 30, 0],
                  y: [0, 20, 0],
              }}
              transition={{
                  duration: 8,
                  repeat: Infinity,
              }}
              className="absolute w-[500px] h-[500px] bg-purple-600 opacity-20 blur-[120px] rounded-full top-[-100px]"
          >
          </motion.div>

          <motion.div
              animate={{
                  x: [0, -20, 0],
                  y: [0, -30, 0],
              }}
              transition={{
                  duration: 10,
                  repeat: Infinity,
              }}
              className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-fuchsia-500 opacity-20 blur-[120px] rounded-full"
          >
          </motion.div>

          {/* Content */}
          <div className="relative z-10 text-center px-5">

              {/* Title */}
              <motion.h1
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1 }}
                  className="text-6xl md:text-8xl font-black tracking-tight leading-tight"
              >
                  Discipline
                  <span className="text-purple-500"> builds </span>
                  champions.
              </motion.h1>

              {/* Description */}
              <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-zinc-400 mt-6 text-lg md:text-xl max-w-[700px] mx-auto"
              >
                  GymFocus transforma consistência em evolução real através de gamificação, streaks e progresso inteligente.
              </motion.p>

              {/* Buttons */}
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-10 flex gap-5 justify-center flex-wrap"
              >
                  <button className="bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:scale-105 transition px-8 py-4 rounded-2xl font-semibold cursor-pointer">
                      Começar Agora
                  </button>

                  <button className="border border-zinc-700 hover:border-purple-500 hover:bg-white/5 transition px-8 py-4 rounded-2xl font-semibold cursor-pointer">
                      Ver Demo
                  </button>
              </motion.div>

              {/* Dashboard Preview */}
              <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className="mt-20 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 max-w-[900px] mx-auto shadow-2xl shadow-purple-500/10"
              >

                  {/* Stats */}
                  <div className="flex justify-between items-center flex-wrap gap-5">

                      <div>
                          <p className="text-zinc-400">
                              Current Streak
                          </p>

                          <h2 className="text-5xl font-bold text-purple-500">
                              🔥 12 Days
                          </h2>
                      </div>

                      <div>
                          <p className="text-zinc-400">
                              Level
                          </p>

                          <h2 className="text-5xl font-bold">
                              08
                          </h2>
                      </div>

                      <div>
                          <p className="text-zinc-400">
                              XP
                          </p>

                          <h2 className="text-5xl font-bold">
                              1480
                          </h2>
                      </div>

                  </div>

                  {/* XP Progress */}
                  <div className="mt-10">

                      <div className="flex justify-between text-sm text-zinc-400 mb-2">
                          <span>Progress to Level 09</span>
                          <span>74%</span>
                      </div>

                      <div className="w-full h-4 bg-zinc-800 rounded-full overflow-hidden">

                          <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: "74%" }}
                              transition={{ delay: 1.5, duration: 1.5 }}
                              className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full" />

                      </div>

                  </div>

                  {/* Weekly Consistency */}
                  <div className="mt-10">

                      <p className="text-zinc-400 mb-4">
                          Weekly Consistency
                      </p>

                      <div className="flex gap-3 justify-center flex-wrap">

                          <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center font-bold">
                              M
                          </div>

                          <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center font-bold">
                              T
                          </div>

                          <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center font-bold">
                              W
                          </div>

                          <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-zinc-500">
                              T
                          </div>

                          <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-zinc-500">
                              F
                          </div>

                      </div>

                  </div>

              </motion.div>

          </div>

      </section>
      <AppPreview />
      <Rankings />
      <Stats />
      </>
  )
}

export default Home
