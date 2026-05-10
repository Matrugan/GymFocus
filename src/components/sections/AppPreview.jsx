import { motion } from "framer-motion"
import {
  Flame,
  Trophy,
  Dumbbell,
  Heart,
  MessageCircle
} from "lucide-react"

function AppPreview() {
  return (
    <section className="relative py-40 px-6 overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/20 blur-[160px] rounded-full"></div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">

        {/* Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >

          <p className="text-purple-500 font-semibold mb-4">
            INSIDE GYMFOCUS
          </p>

          <h2 className="text-5xl md:text-6xl font-black leading-tight">
            Transform consistency into
            <span className="text-purple-500"> addiction.</span>
          </h2>

          <p className="text-zinc-400 mt-8 text-lg leading-relaxed">
            GymFocus combina treino, gamificação e interação social
            para transformar disciplina em estilo de vida.
          </p>

          {/* Features */}
          <div className="mt-10 space-y-5">

            <div className="flex items-center gap-4">
              <div className="bg-purple-500/20 p-3 rounded-2xl">
                <Flame className="text-purple-400" />
              </div>

              <div>
                <h3 className="font-bold text-lg">
                  Daily Streaks
                </h3>

                <p className="text-zinc-400">
                  Mantenha consistência e desbloqueie recompensas.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-purple-500/20 p-3 rounded-2xl">
                <Trophy className="text-purple-400" />
              </div>

              <div>
                <h3 className="font-bold text-lg">
                  Global Rankings
                </h3>

                <p className="text-zinc-400">
                  Compita com amigos e suba no ranking.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-purple-500/20 p-3 rounded-2xl">
                <Dumbbell className="text-purple-400" />
              </div>

              <div>
                <h3 className="font-bold text-lg">
                  Smart Workouts
                </h3>

                <p className="text-zinc-400">
                  Treinos personalizados para evolução constante.
                </p>
              </div>
            </div>

          </div>

        </motion.div>

        {/* Right Side / Phone Mockup */}
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >

          <div className="
            relative
            w-[340px]
            h-[700px]
            rounded-[50px]
            border
            border-white/10
            bg-black/40
            backdrop-blur-2xl
            shadow-2xl
            shadow-purple-500/20
            overflow-hidden
            p-6
          ">

            {/* Top */}
            <div className="flex justify-between items-center">

              <div>
                <p className="text-zinc-400 text-sm">
                  Welcome Back
                </p>

                <h2 className="text-2xl font-bold">
                  Mateus 👋
                </h2>
              </div>

              <div className="
                w-12
                h-12
                rounded-full
                bg-gradient-to-r
                from-purple-500
                to-fuchsia-500
              ">
              </div>

            </div>

            {/* Streak Card */}
            <div className="
              mt-8
              bg-gradient-to-r
              from-purple-500
              to-fuchsia-500
              rounded-3xl
              p-6
            ">

              <div className="flex items-center gap-3">

                <Flame size={32} />

                <div>
                  <p className="text-sm opacity-80">
                    Current Streak
                  </p>

                  <h2 className="text-4xl font-black">
                    12 Days
                  </h2>
                </div>

              </div>

            </div>

            {/* Workout */}
            <div className="
              mt-6
              bg-white/5
              border
              border-white/10
              rounded-3xl
              p-5
            ">

              <p className="text-zinc-400 text-sm">
                Today Workout
              </p>

              <h3 className="text-2xl font-bold mt-2">
                Push Day
              </h3>

              <div className="mt-4 flex justify-between text-zinc-400 text-sm">
                <span>Chest</span>
                <span>Shoulders</span>
                <span>Triceps</span>
              </div>

            </div>

            {/* Feed */}
            <div className="mt-6">

              <p className="text-zinc-400 mb-4">
                Community Feed
              </p>

              <div className="
                bg-white/5
                border
                border-white/10
                rounded-3xl
                p-4
              ">

                <div className="flex items-center gap-3">

                  <div className="
                    w-10
                    h-10
                    rounded-full
                    bg-purple-500
                  ">
                  </div>

                  <div>
                    <h4 className="font-bold">
                      Lucas Silva
                    </h4>

                    <p className="text-zinc-400 text-sm">
                      Finished Leg Day 🔥
                    </p>
                  </div>

                </div>

                <div className="mt-4 flex gap-5 text-zinc-400">

                  <div className="flex items-center gap-2">
                    <Heart size={18} />
                    <span>128</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MessageCircle size={18} />
                    <span>24</span>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </motion.div>

      </div>

    </section>
  )
}

export default AppPreview;