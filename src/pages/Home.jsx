import { Link } from "react-router-dom";

import { motion } from "framer-motion";

import {
  Dumbbell,
  Trophy,
  Flame,
  Users,
  MessageCircle,
  Target,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Star,
} from "lucide-react";

import ThemeToggle from "../components/layout/ThemeToggle";
import BrandLogo from "../components/layout/BrandLogo";
import LanguageToggle from "../components/layout/LanguageToggle";
import { useLanguage } from "../context/LanguageContext";

function Home() {
  const { t } = useLanguage();

  const features = [
    {
      title: "Track Workouts",
      description:
        "Complete daily workouts, earn XP and keep your streak alive.",
      icon: Dumbbell,
    },
    {
      title: "Social Feed",
      description:
        "Share your progress, photos, achievements and motivate other athletes.",
      icon: Users,
    },
    {
      title: "Fitness Challenges",
      description:
        "Join challenges, claim rewards and unlock exclusive badges.",
      icon: Target,
    },
    {
      title: "Weekly Ranking",
      description:
        "Compete with other users based on weekly XP and workout consistency.",
      icon: Trophy,
    },
    {
      title: "Progress Analytics",
      description:
        "Visualize your XP evolution and understand your performance over time.",
      icon: BarChart3,
    },
    {
      title: "Private Messages",
      description:
        "Connect with other athletes through a modern direct message system.",
      icon: MessageCircle,
    },
  ];

  const rankingPreview = [
    {
      position: 1,
      name: "Mateus",
      xp: "2,450 XP",
      streak: "12 days",
      avatar: "https://i.pravatar.cc/150?img=12",
    },
    {
      position: 2,
      name: "Clara",
      xp: "1,980 XP",
      streak: "9 days",
      avatar: "https://i.pravatar.cc/150?img=32",
    },
    {
      position: 3,
      name: "Lucas",
      xp: "1,540 XP",
      streak: "7 days",
      avatar: "https://i.pravatar.cc/150?img=15",
    },
  ];

  return (
    <main
      className="
        min-h-screen
        overflow-hidden
        bg-zinc-50
        text-zinc-950
        transition-colors

        dark:bg-black
        dark:text-white
      "
    >
      {/* BACKGROUND */}
      <div
        className="
          fixed
          inset-0
          pointer-events-none
          bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(217,70,239,0.12),transparent_35%)]

          dark:bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(217,70,239,0.16),transparent_35%)]
        "
      />

      {/* NAVBAR */}
      <nav
        className="
          relative
          z-10
          max-w-7xl
          mx-auto
          px-6
          py-6
          flex
          items-center
          justify-between
        "
      >
        <Link to="/" className="flex items-center">
          <BrandLogo size="sm" />
        </Link>

        <div className="flex items-center gap-3">
          <LanguageToggle />
          <ThemeToggle />

          <Link
            to="/auth"
            className="
              hidden
              sm:inline-flex
              px-5
              py-3
              rounded-2xl
              bg-white
              text-zinc-950
              border
              border-zinc-200
              hover:border-purple-500
              transition
              font-bold
              shadow-sm

              dark:bg-white/5
              dark:text-white
              dark:border-white/10
            "
          >
            {t("home.login")}
          </Link>

          <Link
            to="/auth"
            className="
              px-5
              py-3
              rounded-2xl
              bg-gradient-to-r
              from-purple-500
              to-fuchsia-500
              text-white
              font-bold
              hover:scale-105
              transition
              flex
              items-center
              gap-2
            "
          >
            {t("home.start")}
            <ArrowRight size={18} />
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section
        className="
          relative
          z-10
          max-w-7xl
          mx-auto
          px-6
          pt-16
          pb-24
          grid
          lg:grid-cols-2
          gap-16
          items-center
        "
      >
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
            duration: 0.7,
          }}
        >
          <div
            className="
              inline-flex
              items-center
              gap-2
              px-4
              py-2
              rounded-full
              bg-purple-500/10
              border
              border-purple-500/20
              text-purple-600
              text-sm
              font-bold
              mb-6

              dark:text-purple-300
            "
          >
            <Flame size={16} />
            {t("home.badge")}
          </div>

          <h1
            className="
              text-5xl
              md:text-7xl
              font-black
              leading-tight
            "
          >
            {t("home.heroTitle")}
            <br />
            <span
              className="
                bg-gradient-to-r
                from-purple-500
                to-fuchsia-500
                bg-clip-text
                text-transparent
              "
            >
              GymFocus
            </span>
          </h1>

          <p
            className="
              text-zinc-600
              text-lg
              md:text-xl
              mt-8
              max-w-xl
              leading-relaxed

              dark:text-zinc-400
            "
          >
            {t("home.heroCopy")}
          </p>

          <div className="flex flex-wrap gap-4 mt-10">
            <Link
              to="/auth"
              className="
                px-8
                py-4
                rounded-2xl
                bg-gradient-to-r
                from-purple-500
                to-fuchsia-500
                text-white
                font-bold
                text-lg
                hover:scale-105
                transition
                flex
                items-center
                gap-3
              "
            >
              {t("home.start")}
              <ArrowRight size={20} />
            </Link>

            <a
              href="#features"
              className="
                px-8
                py-4
                rounded-2xl
                bg-white
                border
                border-zinc-200
                font-bold
                text-lg
                hover:border-purple-500
                transition
                shadow-sm

                dark:bg-white/5
                dark:border-white/10
              "
            >
              See features
            </a>
          </div>

          <div className="flex flex-wrap gap-8 mt-12">
            <HeroStat value="XP" label="Gamified progress" />
            <HeroStat value="Badges" label="Unlock achievements" />
            <HeroStat value="DMs" label="Connect with athletes" />
          </div>
        </motion.div>

        {/* APP PREVIEW */}
        <motion.div
          initial={{
            opacity: 0,
            y: 40,
            scale: 0.96,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.8,
            delay: 0.2,
          }}
          className="relative"
        >
          <div
            className="
              absolute
              -inset-6
              bg-purple-500/20
              blur-[80px]
              rounded-full
            "
          />

          <div
            className="
              relative
              bg-white
              border
              border-zinc-200
              rounded-[36px]
              p-5
              shadow-2xl
              shadow-purple-500/10

              dark:bg-zinc-950
              dark:border-white/10
              dark:shadow-purple-500/20
            "
          >
            <div
              className="
                bg-zinc-50
                rounded-[28px]
                border
                border-zinc-200
                overflow-hidden

                dark:bg-black
                dark:border-white/10
              "
            >
              <div
                className="
                  p-5
                  border-b
                  border-zinc-200
                  flex
                  items-center
                  justify-between

                  dark:border-white/10
                "
              >
                <div>
                  <p className="text-zinc-500 text-sm">Welcome back</p>

                  <h3 className="text-2xl font-black">Athlete Dashboard</h3>
                </div>

                <div
                  className="
                    w-12
                    h-12
                    rounded-2xl
                    bg-gradient-to-r
                    from-purple-500
                    to-fuchsia-500
                    text-white
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Trophy size={22} />
                </div>
              </div>

              <div className="p-5 grid grid-cols-3 gap-4">
                <PreviewCard title="Streak" value="12 Days" icon="🔥" />
                <PreviewCard title="XP" value="2,450" icon="🏆" />
                <PreviewCard title="Level" value="8" icon="⚡" />
              </div>

              <div className="px-5 pb-5">
                <div
                  className="
                    bg-white
                    border
                    border-zinc-200
                    rounded-3xl
                    p-5

                    dark:bg-white/5
                    dark:border-white/10
                  "
                >
                  <div className="flex justify-between mb-4">
                    <div>
                      <p className="text-zinc-500 text-sm">
                        Progress to Level 9
                      </p>

                      <h3 className="text-3xl font-black">72%</h3>
                    </div>

                    <p className="text-purple-500 font-bold">2450 / 3000 XP</p>
                  </div>

                  <div
                    className="
                      w-full
                      h-4
                      bg-zinc-200
                      rounded-full
                      overflow-hidden

                      dark:bg-zinc-800
                    "
                  >
                    <div
                      className="
                        h-full
                        w-[72%]
                        bg-gradient-to-r
                        from-purple-500
                        to-fuchsia-500
                      "
                    />
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 space-y-3">
                {rankingPreview.map((item) => (
                  <div
                    key={item.position}
                    className="
                      bg-white
                      border
                      border-zinc-200
                      rounded-2xl
                      p-4
                      flex
                      items-center
                      justify-between

                      dark:bg-white/5
                      dark:border-white/10
                    "
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="
                          w-10
                          h-10
                          rounded-xl
                          bg-gradient-to-r
                          from-purple-500
                          to-fuchsia-500
                          text-white
                          flex
                          items-center
                          justify-center
                          font-black
                        "
                      >
                        #{item.position}
                      </div>

                      <img
                        src={item.avatar}
                        alt=""
                        className="
                          w-10
                          h-10
                          rounded-full
                          object-cover
                        "
                      />

                      <div>
                        <h4 className="font-bold">{item.name}</h4>

                        <p className="text-zinc-500 text-xs">
                          🔥 {item.streak}
                        </p>
                      </div>
                    </div>

                    <p className="text-purple-500 font-bold">{item.xp}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="
          relative
          z-10
          max-w-7xl
          mx-auto
          px-6
          py-24
        "
      >
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-purple-500 font-bold mb-4">FEATURES</p>

          <h2 className="text-4xl md:text-6xl font-black">
            Everything you need to stay consistent
          </h2>

          <p
            className="
              text-zinc-600
              text-lg
              mt-6

              dark:text-zinc-400
            "
          >
            GymFocus combines social motivation, gamification and progress
            analytics in one modern fitness platform.
          </p>
        </div>

        <div
          className="
            grid
            md:grid-cols-2
            lg:grid-cols-3
            gap-6
          "
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: index * 0.08,
                }}
                whileHover={{
                  y: -6,
                }}
                className="
                  bg-white
                  border
                  border-zinc-200
                  rounded-3xl
                  p-8
                  shadow-sm
                  hover:border-purple-500/50
                  hover:shadow-[0_0_40px_rgba(168,85,247,0.12)]
                  transition-all
                  duration-300

                  dark:bg-white/5
                  dark:border-white/10
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
                    text-white
                    flex
                    items-center
                    justify-center
                    mb-6
                  "
                >
                  <Icon size={26} />
                </div>

                <h3 className="text-2xl font-black">{feature.title}</h3>

                <p
                  className="
                    text-zinc-600
                    mt-4
                    leading-relaxed

                    dark:text-zinc-400
                  "
                >
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* RANKING PREVIEW */}
      <section
        className="
          relative
          z-10
          max-w-7xl
          mx-auto
          px-6
          py-24
          grid
          lg:grid-cols-2
          gap-12
          items-center
        "
      >
        <div>
          <p className="text-purple-500 font-bold mb-4">WEEKLY COMPETITION</p>

          <h2 className="text-4xl md:text-6xl font-black">
            Climb the ranking every week
          </h2>

          <p
            className="
              text-zinc-600
              text-lg
              mt-6
              leading-relaxed

              dark:text-zinc-400
            "
          >
            Every workout and challenge gives you XP. The more consistent you
            are, the higher you climb in the weekly ranking.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mt-8">
            <SmallBenefit icon={<Trophy />} text="Weekly XP leaderboard" />
            <SmallBenefit icon={<Flame />} text="Streak-based motivation" />
            <SmallBenefit icon={<Target />} text="Challenge rewards" />
            <SmallBenefit
              icon={<ShieldCheck />}
              text="Real progress tracking"
            />
          </div>
        </div>

        <div
          className="
            bg-white
            border
            border-zinc-200
            rounded-[36px]
            p-6
            shadow-sm

            dark:bg-white/5
            dark:border-white/10
            dark:backdrop-blur-xl
          "
        >
          <div className="flex items-center gap-3 mb-6">
            <CrownIcon />

            <div>
              <h3 className="text-2xl font-black">Top Athletes</h3>

              <p className="text-zinc-500">Weekly ranking preview</p>
            </div>
          </div>

          <div className="space-y-4">
            {rankingPreview.map((item, index) => (
              <motion.div
                key={item.position}
                initial={{
                  opacity: 0,
                  x: -20,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: index * 0.1,
                }}
                className={`
                  rounded-3xl
                  border
                  p-5
                  flex
                  items-center
                  justify-between

                  ${
                    item.position === 1
                      ? "bg-yellow-500/10 border-yellow-500/30"
                      : "bg-zinc-50 border-zinc-200 dark:bg-black/30 dark:border-white/10"
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`
                      w-12
                      h-12
                      rounded-2xl
                      flex
                      items-center
                      justify-center
                      font-black

                      ${
                        item.position === 1
                          ? "bg-yellow-500 text-black"
                          : "bg-zinc-200 dark:bg-white/10"
                      }
                    `}
                  >
                    #{item.position}
                  </div>

                  <img
                    src={item.avatar}
                    alt=""
                    className="
                      w-14
                      h-14
                      rounded-full
                      object-cover
                    "
                  />

                  <div>
                    <h4 className="font-bold text-lg">{item.name}</h4>

                    <p className="text-zinc-500 text-sm">🔥 {item.streak}</p>
                  </div>
                </div>

                <p className="text-purple-500 font-black">{item.xp}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="
    relative
    z-10
    max-w-5xl
    mx-auto
    px-6
    py-24
  "
      >
        <div
          className="
      bg-gradient-to-r
      from-purple-600
      to-fuchsia-600
      rounded-[40px]
      p-10
      md:p-16
      text-center
      text-white
      shadow-2xl
      shadow-purple-500/20
    "
        >
          <div
            className="
        w-16
        h-16
        mx-auto
        rounded-3xl
        bg-white/20
        flex
        items-center
        justify-center
        mb-6
      "
          >
            <Star size={30} />
          </div>

          <h2
            className="
        text-4xl
        md:text-6xl
        font-black
        max-w-3xl
        mx-auto
        leading-tight
      "
          >
            Ready to start your fitness game?
          </h2>

          <p
            className="
        text-white/80
        text-lg
        mt-6
        max-w-2xl
        mx-auto
        leading-relaxed
      "
          >
            Create your account, complete your first workout and start earning
            XP today.
          </p>

          <div
            className="
        flex
        justify-center
        gap-4
        flex-wrap
        mt-10
      "
          >
            <Link
              to="/auth"
              className="
    min-w-[200px]
    px-8
    py-4
    rounded-2xl
    bg-white
    !text-black
    font-bold
    text-lg
    hover:scale-105
    transition
    shadow-lg
    inline-flex
    items-center
    justify-center
  "
            >
              Create Account
            </Link>

            <Link
              to="/auth"
              className="
          min-w-[160px]
          px-8
          py-4
          rounded-2xl
          bg-black/20
          border
          border-white/20
          text-white
          font-bold
          text-lg
          hover:bg-black/30
          hover:scale-105
          transition
        "
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="
          relative
          z-10
          border-t
          border-zinc-200
          py-8
          text-center
          text-zinc-500

          dark:border-white/10
        "
      >
        <p>{t("home.footer")}</p>
      </footer>
    </main>
  );
}

function HeroStat({ value, label }) {
  return (
    <div>
      <h3 className="text-2xl font-black">{value}</h3>

      <p className="text-zinc-500 text-sm">{label}</p>
    </div>
  );
}

function PreviewCard({ title, value, icon }) {
  return (
    <div
      className="
        bg-white
        border
        border-zinc-200
        rounded-2xl
        p-4

        dark:bg-white/5
        dark:border-white/10
      "
    >
      <p className="text-2xl">{icon}</p>

      <p className="text-zinc-500 text-xs mt-3">{title}</p>

      <h3 className="font-black mt-1">{value}</h3>
    </div>
  );
}

function SmallBenefit({ icon, text }) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
        bg-white
        border
        border-zinc-200
        rounded-2xl
        p-4
        shadow-sm

        dark:bg-white/5
        dark:border-white/10
      "
    >
      <div className="text-purple-500">{icon}</div>

      <span className="font-bold">{text}</span>
    </div>
  );
}

function CrownIcon() {
  return (
    <div
      className="
        w-14
        h-14
        rounded-2xl
        bg-yellow-500
        text-black
        flex
        items-center
        justify-center
      "
    >
      <Trophy size={26} />
    </div>
  );
}

export default Home;
