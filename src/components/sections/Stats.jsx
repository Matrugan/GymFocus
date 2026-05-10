import { motion } from "framer-motion"

import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  CartesianGrid,
} from "recharts"

const data = [
  { day: "Mon", xp: 120 },
  { day: "Tue", xp: 210 },
  { day: "Wed", xp: 340 },
  { day: "Thu", xp: 420 },
  { day: "Fri", xp: 580 },
  { day: "Sat", xp: 740 },
  { day: "Sun", xp: 920 },
]

function Stats() {
  return (
    <section className="relative py-40 px-6 overflow-hidden">

      {/* Glow */}
      <div className="
        absolute
        top-1/2
        left-1/2
        -translate-x-1/2
        -translate-y-1/2
        w-[700px]
        h-[700px]
        bg-purple-500/10
        blur-[180px]
        rounded-full
      ">
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >

          <p className="text-purple-500 font-semibold mb-4">
            PERFORMANCE ANALYTICS
          </p>

          <h2 className="text-5xl md:text-6xl font-black">
            Your evolution
            <span className="text-purple-500">
              {" "}in real time.
            </span>
          </h2>

          <p className="text-zinc-400 mt-6 max-w-[700px] mx-auto text-lg">
            Acompanhe métricas de desempenho, frequência
            e evolução semanal através de análises inteligentes.
          </p>

        </motion.div>

        {/* Grid */}
        <div className="mt-20 grid lg:grid-cols-3 gap-8">

          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="
              lg:col-span-2
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

            <div className="flex justify-between items-center mb-8">

              <div>
                <p className="text-zinc-400">
                  Weekly XP Growth
                </p>

                <h3 className="text-3xl font-bold mt-2">
                  +248%
                </h3>
              </div>

              <div className="
                bg-purple-500/20
                text-purple-400
                px-4
                py-2
                rounded-2xl
                text-sm
              ">
                Last 7 days
              </div>

            </div>

            <div className="h-[300px]">

              <ResponsiveContainer width="100%" height="100%">

                <LineChart data={data}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#27272a"
                  />

                  <XAxis
                    dataKey="day"
                    stroke="#71717a"
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="xp"
                    stroke="#a855f7"
                    strokeWidth={4}
                    dot={{
                      fill: "#c026d3",
                      r: 6,
                    }}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </motion.div>

          {/* Stats Cards */}
          <div className="space-y-8">

            {/* Calories */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="
                bg-white/5
                border
                border-white/10
                backdrop-blur-xl
                rounded-3xl
                p-8
              "
            >

              <p className="text-zinc-400">
                Calories Burned
              </p>

              <h3 className="text-5xl font-black mt-4">
                12.4k
              </h3>

              <div className="
                mt-6
                h-3
                bg-zinc-800
                rounded-full
                overflow-hidden
              ">

                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "82%" }}
                  transition={{ duration: 1.5 }}
                  viewport={{ once: true }}
                  className="
                    h-full
                    bg-gradient-to-r
                    from-orange-500
                    to-red-500
                  "
                />

              </div>

            </motion.div>

            {/* Consistency */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
              className="
                bg-white/5
                border
                border-white/10
                backdrop-blur-xl
                rounded-3xl
                p-8
              "
            >

              <p className="text-zinc-400">
                Weekly Consistency
              </p>

              <h3 className="text-5xl font-black mt-4">
                92%
              </h3>

              <div className="mt-6 flex gap-3">

                <div className="w-10 h-10 rounded-xl bg-purple-500"></div>
                <div className="w-10 h-10 rounded-xl bg-purple-500"></div>
                <div className="w-10 h-10 rounded-xl bg-purple-500"></div>
                <div className="w-10 h-10 rounded-xl bg-purple-500"></div>
                <div className="w-10 h-10 rounded-xl bg-zinc-800"></div>

              </div>

            </motion.div>

          </div>

        </div>

      </div>

    </section>
  )
}

export default Stats