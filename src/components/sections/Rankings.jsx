import { motion } from "framer-motion"
import { Crown, Flame } from "lucide-react"

const athletes = [
  {
    name: "Mateus",
    xp: 8420,
    streak: 28,
    rank: 1,
  },

  {
    name: "Lucas",
    xp: 7910,
    streak: 22,
    rank: 2,
  },

  {
    name: "Amanda",
    xp: 7200,
    streak: 19,
    rank: 3,
  },

  {
    name: "Fernanda",
    xp: 6840,
    streak: 17,
    rank: 4,
  },
]

function Rankings() {
  return (
    <section className="relative py-40 px-6 overflow-hidden">

      {/* Background Glow */}
      <div className="
        absolute
        top-1/2
        left-1/2
        -translate-x-1/2
        -translate-y-1/2
        w-[700px]
        h-[700px]
        bg-fuchsia-500/10
        blur-[180px]
        rounded-full
      ">
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >

          <p className="text-purple-500 font-semibold mb-4">
            GLOBAL COMPETITION
          </p>

          <h2 className="text-5xl md:text-6xl font-black">
            Top Athletes
          </h2>

          <p className="text-zinc-400 mt-6 max-w-[700px] mx-auto text-lg">
            Acompanhe os usuários mais consistentes da plataforma
            e dispute posições no ranking global.
          </p>

        </motion.div>

        {/* Ranking Cards */}
        <div className="mt-20 grid md:grid-cols-2 gap-8">

          {athletes.map((athlete, index) => (

            <motion.div
              key={athlete.rank}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{
                scale: 1.03,
                y: -5,
              }}
              className="
                relative
                overflow-hidden
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

              {/* Glow */}
              <div className="
                absolute
                top-0
                right-0
                w-40
                h-40
                bg-purple-500/10
                blur-[100px]
                rounded-full
              ">
              </div>

              {/* Rank */}
              <div className="flex justify-between items-start">

                <div className="flex items-center gap-4">

                  <div className="
                    w-16
                    h-16
                    rounded-2xl
                    bg-gradient-to-r
                    from-purple-500
                    to-fuchsia-500
                    flex
                    items-center
                    justify-center
                    text-2xl
                    font-black
                  ">
                    #{athlete.rank}
                  </div>

                  <div>

                    <h3 className="text-2xl font-bold">
                      {athlete.name}
                    </h3>

                    <div className="flex items-center gap-2 text-zinc-400 mt-1">

                      <Flame
                        size={18}
                        className="text-orange-400"
                      />

                      <span>
                        {athlete.streak} day streak
                      </span>

                    </div>

                  </div>

                </div>

                {athlete.rank === 1 && (
                  <Crown className="text-yellow-400" />
                )}

              </div>

              {/* XP */}
              <div className="mt-8">

                <div className="flex justify-between mb-2 text-sm text-zinc-400">

                  <span>Total XP</span>

                  <span>{athlete.xp}</span>

                </div>

                <div className="
                  w-full
                  h-4
                  bg-zinc-800
                  rounded-full
                  overflow-hidden
                ">

                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{
                      width: `${(athlete.xp / 9000) * 100}%`
                    }}
                    transition={{
                      duration: 1.5,
                      delay: index * 0.2
                    }}
                    viewport={{ once: true }}
                    className="
                      h-full
                      rounded-full
                      bg-gradient-to-r
                      from-purple-500
                      to-fuchsia-500
                    "
                  />

                </div>

              </div>

            </motion.div>

          ))}

        </div>

      </div>

    </section>
  )
}

export default Rankings