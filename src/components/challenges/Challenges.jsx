import { useEffect, useState } from "react";

import { motion } from "framer-motion";

import {
  Trophy,
  CheckCircle,
  Lock,
  Gift,
} from "lucide-react";

import toast from "react-hot-toast";

import { unlockAchievement } from "../../utils/achievementSystem";

import { logXP } from "../../utils/xpSystem";
import { reportError } from "../../utils/errorHandler";
import {
  createUserChallenge,
  fetchChallenges,
  fetchUserChallenges,
  fetchUserWorkoutLogCount,
  markUserChallengeClaimed,
} from "../../services/challengeService";
import { updateProfileStats } from "../../services/profileService";
import { useLanguage } from "../../context/LanguageContext";

function Challenges({ user, profile, onProfileUpdated }) {
  const { language, t, translate } = useLanguage();

  const [challenges, setChallenges] = useState([]);

  const [userChallenges, setUserChallenges] = useState([]);

  const [workoutCount, setWorkoutCount] = useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && profile) {
      getData();
    }
  }, [user, profile]);

  async function getData() {
    setLoading(true);

    const { data: challengesData, error: challengesError } =
      await fetchChallenges();

    if (challengesError) {
      reportError(challengesError);
      setLoading(false);
      return;
    }

    const { data: userChallengesData, error: userChallengesError } =
      await fetchUserChallenges(user.id);

    if (userChallengesError) {
      reportError(userChallengesError);
      setLoading(false);
      return;
    }

    const { data: workoutLogs, error: workoutError } =
      await fetchUserWorkoutLogCount(user.id);

    if (workoutError) {
      reportError(workoutError);
      setLoading(false);
      return;
    }

    setChallenges(challengesData || []);
    setUserChallenges(userChallengesData || []);
    setWorkoutCount(workoutLogs?.length || 0);
    setLoading(false);
  }

  function getProgress(challenge) {
    if (challenge.type === "workouts") {
      return workoutCount;
    }

    if (challenge.type === "streak") {
      return profile?.streak || 0;
    }

    if (challenge.type === "xp") {
      return profile?.xp || 0;
    }

    return 0;
  }

  function getProgressPercent(challenge) {
    const progress = getProgress(challenge);

    const percent = (progress / challenge.target) * 100;

    return Math.min(percent, 100);
  }

  function getChallengeTitle(challenge) {
    if (language !== "pt") {
      return challenge.title;
    }

    if (challenge.type === "workouts") {
      return `Desafio de ${challenge.target} treinos`;
    }

    if (challenge.type === "streak") {
      return `Sequencia de ${challenge.target} dias`;
    }

    if (challenge.type === "xp") {
      return `Meta de ${challenge.target} XP`;
    }

    return translate(challenge.title);
  }

  function getChallengeDescription(challenge) {
    if (language !== "pt") {
      return challenge.description;
    }

    if (challenge.type === "workouts") {
      return `Complete ${challenge.target} treinos para ganhar XP e desbloquear recompensas.`;
    }

    if (challenge.type === "streak") {
      return `Mantenha uma sequencia de ${challenge.target} dias para concluir este desafio.`;
    }

    if (challenge.type === "xp") {
      return `Acumule ${challenge.target} XP para concluir este desafio.`;
    }

    return translate(challenge.description);
  }

  function getUserChallenge(challengeId) {
    return userChallenges.find((item) => item.challenge_id === challengeId);
  }

  async function joinChallenge(challengeId) {
    const { error } = await createUserChallenge(user.id, challengeId);

    if (error) {
      reportError(error, translate("Error joining challenge."));
      return;
    }

    toast.success(translate("Challenge joined!"));

    getData();
  }

  async function claimChallenge(challenge) {
    const userChallenge = getUserChallenge(challenge.id);

    if (!userChallenge) {
      toast.error(translate("Join this challenge first."));
      return;
    }

    if (userChallenge.claimed) {
      toast.error(translate("Reward already claimed."));
      return;
    }

    const progress = getProgress(challenge);

    if (progress < challenge.target) {
      toast.error(translate("Challenge not completed yet."));
      return;
    }

    const newXP = (profile?.xp || 0) + challenge.xp_reward;

    const { error: profileError } = await updateProfileStats(user.id, {
      xp: newXP,
    });

    if (profileError) {
      reportError(profileError, translate("Error updating XP."));
      return;
    }

    const { error: challengeError } = await markUserChallengeClaimed(
      userChallenge.id,
    );

    if (challengeError) {
      reportError(challengeError, translate("Error claiming challenge."));
      return;
    }

    if (challenge.badge) {
      await unlockAchievement(user.id, challenge.badge);
    }

    await logXP(
      user.id,
      challenge.xp_reward,
      `challenge: ${getChallengeTitle(challenge)}`,
    );

    toast.success(
      language === "pt"
        ? `Desafio concluido! +${challenge.xp_reward} XP`
        : `Challenge completed! +${challenge.xp_reward} XP`,
    );

    onProfileUpdated?.({
      ...profile,
      xp: newXP,
    });

    getData();
  }

  if (loading) {
    return (
      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-4
          sm:gap-6
        "
      >
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="
              h-56
              sm:h-64
              rounded-2xl
              sm:rounded-3xl
              bg-white
              border
              border-zinc-200
              animate-pulse
              shadow-sm

              dark:bg-white/5
              dark:border-white/10
            "
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="
        w-full
        bg-white
        text-zinc-950
        border
        border-zinc-200
        rounded-2xl
        sm:rounded-3xl
        p-4
        sm:p-6
        md:p-8
        shadow-sm
        transition-colors
        min-w-0

        dark:bg-white/5
        dark:text-white
        dark:border-white/10
        dark:backdrop-blur-xl
      "
    >
      {/* HEADER */}
      <div
        className="
          flex
          items-center
          gap-3
          sm:gap-4
          mb-6
          sm:mb-8
          min-w-0
        "
      >
        <div
          className="
            w-12
            h-12
            sm:w-14
            sm:h-14
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
          <Trophy size={24} />
        </div>

        <div className="min-w-0">
          <h2
            className="
              text-2xl
              sm:text-3xl
              font-black
              break-words
            "
          >
            {t("challenges.title")}
          </h2>

          <p
            className="
              text-zinc-600
              mt-1
              text-sm
              sm:text-base

              dark:text-zinc-500
            "
          >
            {language === "pt"
              ? "Complete desafios e ganhe recompensas."
              : "Complete challenges and earn rewards."}
          </p>
        </div>
      </div>

      {/* CHALLENGE CARDS */}
      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-4
          sm:gap-6
        "
      >
        {challenges.map((challenge, index) => {
          const userChallenge = getUserChallenge(challenge.id);

          const joined = !!userChallenge;

          const claimed = userChallenge?.claimed;

          const progress = getProgress(challenge);

          const percent = getProgressPercent(challenge);

          const completed = progress >= challenge.target;

          return (
            <motion.div
              key={challenge.id}
              initial={{
                opacity: 0,
                y: 30,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.08,
              }}
              whileHover={{
                y: -4,
              }}
              className="
                bg-zinc-50
                border
                border-zinc-200
                rounded-2xl
                sm:rounded-3xl
                p-4
                sm:p-6
                shadow-sm
                hover:border-purple-500/40
                hover:shadow-[0_0_35px_rgba(168,85,247,0.12)]
                transition-all
                min-w-0

                dark:bg-zinc-950
                dark:border-white/10
                dark:hover:shadow-[0_0_35px_rgba(168,85,247,0.14)]
              "
            >
              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-3
                  sm:gap-4
                  min-w-0
                "
              >
                <div
                  className="
                    flex
                    items-start
                    gap-3
                    sm:gap-4
                    min-w-0
                  "
                >
                  <div
                    className="
                      w-14
                      h-14
                      sm:w-16
                      sm:h-16
                      rounded-2xl
                      bg-white
                      border
                      border-zinc-200
                      flex
                      items-center
                      justify-center
                      text-2xl
                      sm:text-3xl
                      shadow-sm
                      shrink-0

                      dark:bg-white/5
                      dark:border-white/10
                    "
                  >
                    {challenge.icon || "🏆"}
                  </div>

                  <div className="min-w-0">
                    <h3
                      className="
                        text-lg
                        sm:text-xl
                        font-black
                        break-words
                      "
                    >
                      {getChallengeTitle(challenge)}
                    </h3>

                    <p
                      className="
                        text-zinc-600
                        text-sm
                        mt-1
                        leading-relaxed
                        break-words

                        dark:text-zinc-500
                      "
                    >
                      {getChallengeDescription(challenge)}
                    </p>
                  </div>
                </div>

                {claimed && (
                  <div
                    className="
                      w-9
                      h-9
                      sm:w-10
                      sm:h-10
                      rounded-2xl
                      bg-green-500/10
                      text-green-500
                      flex
                      items-center
                      justify-center
                      border
                      border-green-500/20
                      shrink-0
                    "
                  >
                    <CheckCircle size={21} />
                  </div>
                )}
              </div>

              {/* PROGRESS */}
              <div className="mt-5 sm:mt-6">
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    mb-3
                    text-sm
                    gap-4
                  "
                >
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {language === "pt" ? "Progresso" : "Progress"}
                  </span>

                  <span className="font-bold text-purple-500 shrink-0">
                    {Math.min(progress, challenge.target)} / {challenge.target}
                  </span>
                </div>

                <div
                  className="
                    w-full
                    h-3.5
                    sm:h-4
                    rounded-full
                    bg-zinc-200
                    overflow-hidden

                    dark:bg-zinc-800
                  "
                >
                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${percent}%`,
                    }}
                    transition={{
                      duration: 1,
                    }}
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

              {/* FOOTER */}
              <div
                className="
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  mt-5
                  sm:mt-6
                  gap-4
                "
              >
                <div>
                  <p className="text-zinc-500 text-sm">
                    {language === "pt" ? "Recompensa" : "Reward"}
                  </p>

                  <p className="font-bold">
                    +{challenge.xp_reward} XP
                  </p>
                </div>

                {!joined && (
                  <button
                    onClick={() => joinChallenge(challenge.id)}
                    className="
                      w-full
                      sm:w-auto
                      px-5
                      py-3
                      rounded-2xl
                      bg-white
                      text-zinc-800
                      border
                      border-zinc-200
                      font-bold
                      hover:border-purple-500
                      hover:text-purple-500
                      transition
                      flex
                      items-center
                      justify-center
                      gap-2
                      shadow-sm

                      dark:bg-white/5
                      dark:text-zinc-300
                      dark:border-white/10
                      dark:hover:text-purple-400
                    "
                  >
                    <Lock size={18} />
                    {language === "pt" ? "Entrar" : "Join"}
                  </button>
                )}

                {joined && !claimed && (
                  <button
                    onClick={() => claimChallenge(challenge)}
                    disabled={!completed}
                    className="
                      w-full
                      sm:w-auto
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
                      disabled:opacity-40
                      disabled:hover:scale-100
                      flex
                      items-center
                      justify-center
                      gap-2
                    "
                  >
                    <Gift size={18} />

                    {completed
                      ? language === "pt"
                        ? "Resgatar"
                        : "Claim"
                      : language === "pt"
                        ? "Em progresso"
                        : "In Progress"}
                  </button>
                )}

                {claimed && (
                  <span
                    className="
                      w-full
                      sm:w-auto
                      text-center
                      px-5
                      py-3
                      rounded-2xl
                      bg-green-500/10
                      border
                      border-green-500/20
                      text-green-500
                      font-bold
                    "
                  >
                    {language === "pt" ? "Concluido" : "Completed"}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {challenges.length === 0 && (
        <div
          className="
            mt-6
            bg-zinc-50
            border
            border-zinc-200
            rounded-2xl
            sm:rounded-3xl
            p-8
            sm:p-10
            text-center
            text-zinc-500
            text-sm
            sm:text-base

            dark:bg-zinc-950
            dark:border-white/10
          "
        >
          {language === "pt"
            ? "Nenhum desafio disponivel ainda."
            : "No challenges available yet."}
        </div>
      )}
    </div>
  );
}

export default Challenges;
