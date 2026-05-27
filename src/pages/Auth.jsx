import { useEffect, useMemo, useState } from "react";

import { motion } from "framer-motion";

import {
  Activity,
  Check,
  Dumbbell,
  ArrowLeft,
  Flame,
  Loader2,
  Medal,
  ShieldCheck,
  Target,
  Trophy,
  UserPlus,
} from "lucide-react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/layout/ThemeToggle";
import BrandLogo from "../components/layout/BrandLogo";
import LanguageToggle from "../components/layout/LanguageToggle";
import { useLanguage } from "../context/LanguageContext";
import { reportError } from "../utils/errorHandler";
import {
  createWorkoutExercises,
  createWorkoutPlanRecord,
} from "../services/workoutService";
import { checkUsernameAvailability } from "../services/profileService";
import { workoutTemplates } from "../workout/workoutTemplates";

const goalOptions = [
  { id: "hypertrophy", pt: "Hipertrofia", en: "Hypertrophy" },
  { id: "fat_loss", pt: "Emagrecimento", en: "Fat loss" },
  { id: "strength", pt: "Forca", en: "Strength" },
  { id: "health", pt: "Saude", en: "Health" },
  { id: "conditioning", pt: "Condicionamento", en: "Conditioning" },
];

const levelOptions = [
  { id: "beginner", pt: "Iniciante", en: "Beginner" },
  { id: "intermediate", pt: "Intermediário", en: "Intermediate" },
  { id: "advanced", pt: "Avançado", en: "Advanced" },
];

const starterTemplateTitles = [
  "ABC Iniciante",
  "ABC Hipertrofia",
  "PPL - Push Pull Legs",
  "Full Body Iniciante",
];

function getUsernameError(username, language) {
  const trimmedUsername = username.trim();

  if (!trimmedUsername) {
    return language === "pt" ? "Username obrigatório." : "Username is required.";
  }

  if (trimmedUsername.length < 3) {
    return language === "pt"
      ? "Username deve ter pelo menos 3 caracteres."
      : "Username must be at least 3 characters.";
  }

  if (/\s/.test(trimmedUsername)) {
    return language === "pt"
      ? "Username não pode ter espaços."
      : "Username cannot contain spaces.";
  }

  if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
    return language === "pt"
      ? "Use apenas letras, números e underline."
      : "Use only letters, numbers and underscores.";
  }

  return "";
}

function getPasswordStrength(password, language) {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (!password) {
    return {
      label: language === "pt" ? "Digite uma senha" : "Enter a password",
      score: 0,
      tone: "bg-zinc-300 dark:bg-white/10",
    };
  }

  if (password.length < 8) {
    return {
      label: language === "pt" ? "Senha muito curta" : "Password too short",
      score: 1,
      tone: "bg-red-500",
    };
  }

  if (score <= 2) {
    return {
      label: language === "pt" ? "Senha média" : "Medium password",
      score: 2,
      tone: "bg-amber-500",
    };
  }

  if (score === 3) {
    return {
      label: language === "pt" ? "Senha forte" : "Strong password",
      score: 3,
      tone: "bg-purple-500",
    };
  }

  return {
    label: language === "pt" ? "Senha excelente" : "Excellent password",
    score: 4,
    tone: "bg-green-500",
  };
}

function Auth({ initialView = "login", siteMode = false }) {
  const { language, t, translate } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    passwordRecoveryMode,
    requestPasswordReset,
    signIn,
    signInWithGoogle,
    signUp,
    updatePassword,
  } = useAuth();

  const [authView, setAuthView] = useState(() =>
    siteMode ? "signup" : initialView,
  );
  const [signupStep, setSignupStep] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState("idle");
  const [usernameFeedback, setUsernameFeedback] = useState("");
  const [checkedUsername, setCheckedUsername] = useState("");
  const [goal, setGoal] = useState("hypertrophy");
  const [level, setLevel] = useState("beginner");
  const [templateTitle, setTemplateTitle] = useState("ABC Iniciante");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const heroCopy =
    language === "pt"
      ? ["Treine mais forte.", "Acompanhe sua evolução.", "Compita socialmente."]
      : ["Train harder.", "Track progress.", "Compete socially."];

  const starterTemplates = useMemo(() => {
    return starterTemplateTitles
      .map((title) => workoutTemplates.find((template) => template.title === title))
      .filter(Boolean);
  }, []);

  const selectedTemplate =
    starterTemplates.find((template) => template.title === templateTitle) ||
    starterTemplates[0];

  const previewStats = [
    {
      icon: <Trophy size={18} />,
      label: "XP",
      value: "2,450",
      tone: "from-purple-500 to-fuchsia-500",
    },
    {
      icon: <Flame size={18} />,
      label: language === "pt" ? "Sequência" : "Streak",
      value: language === "pt" ? "12 dias" : "12 days",
      tone: "from-orange-400 to-rose-500",
    },
    {
      icon: <Medal size={18} />,
      label: "Ranking",
      value: "#4",
      tone: "from-amber-300 to-yellow-500",
    },
    {
      icon: <Activity size={18} />,
      label: language === "pt" ? "Treino atual" : "Current workout",
      value: "Push",
      tone: "from-cyan-400 to-blue-500",
    },
  ];

  const signupSteps = [
    language === "pt" ? "Conta" : "Account",
    language === "pt" ? "Objetivo" : "Goal",
    language === "pt" ? "Nível" : "Level",
    language === "pt" ? "Treino" : "Workout",
  ];

  const passwordStrength = getPasswordStrength(password, language);
  const normalizedUsername = username.trim().toLowerCase();
  const redirectLocation = location.state?.from;
  const redirectAfterLogin = redirectLocation
    ? `${redirectLocation.pathname}${redirectLocation.search || ""}${
        redirectLocation.hash || ""
      }`
    : "/dashboard";
  const isLogin = authView === "login";
  const isSignup = authView === "signup";
  const isRecoverPassword = authView === "recover";
  const isResetPassword = authView === "reset";
  const showSocialLogin = isLogin || isSignup;

  function showError(message) {
    setFormError(message);
    toast.error(message);
  }

  function switchMode(nextIsLogin) {
    if (siteMode) return;

    setAuthView(nextIsLogin ? "login" : "signup");
    setSignupStep(0);
    setFormError("");
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get("mode") === "reset-password" || passwordRecoveryMode) {
      setAuthView("reset");
      setFormError("");
    }
  }, [location.search, passwordRecoveryMode]);

  useEffect(() => {
    if (!isSignup || signupStep !== 0) return;

    const usernameError = getUsernameError(username, language);

    if (usernameError) {
      setUsernameStatus(username ? "invalid" : "idle");
      setUsernameFeedback(username ? usernameError : "");
      setCheckedUsername("");
      return;
    }

    setUsernameStatus("checking");
    setCheckedUsername("");
    setUsernameFeedback(
      language === "pt"
        ? "Verificando username..."
        : "Checking username...",
    );

    const timer = window.setTimeout(async () => {
      try {
        const { data, error } = await checkUsernameAvailability(normalizedUsername);

        if (error) {
          setUsernameStatus("invalid");
          setUsernameFeedback(
            language === "pt"
              ? "Não foi possível verificar o username."
              : "Could not check this username.",
          );
          return;
        }

        if (data) {
          setUsernameStatus("taken");
          setCheckedUsername(normalizedUsername);
          setUsernameFeedback(
            language === "pt"
              ? "Esse username já está em uso."
              : "This username is already taken.",
          );
          return;
        }

        setUsernameStatus("available");
        setCheckedUsername(normalizedUsername);
        setUsernameFeedback(
          language === "pt"
            ? "Username disponível."
            : "Username available.",
        );
      } catch (error) {
        setUsernameStatus("invalid");
        setUsernameFeedback(
          language === "pt"
            ? "Não foi possível verificar o username."
            : "Could not check this username.",
        );
        reportError(error, "Erro ao verificar username.");
      }
    }, 450);

    return () => window.clearTimeout(timer);
  }, [isSignup, language, normalizedUsername, signupStep, username]);

  async function validateSignupStep() {
    if (signupStep === 0) {
      const usernameError = getUsernameError(username, language);

      if (usernameError) {
        showError(usernameError);
        return false;
      }

      if (usernameStatus === "checking") {
        showError(
          language === "pt"
            ? "Aguarde a verificação do username."
            : "Wait for the username check.",
        );
        return false;
      }

      if (usernameStatus !== "available") {
        showError(
          usernameFeedback ||
            (language === "pt"
              ? "Escolha um username disponível."
              : "Choose an available username."),
        );
        return false;
      }

      if (checkedUsername !== normalizedUsername) {
        showError(
          language === "pt"
            ? "Aguarde a verificação do username."
            : "Wait for the username check.",
        );
        return false;
      }

      if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
        showError(
          language === "pt"
            ? "Preencha e-mail, senha e confirmação."
            : "Enter email, password and confirmation.",
        );
        return false;
      }

      if (password.length < 8) {
        showError(
          language === "pt"
            ? "A senha deve ter pelo menos 8 caracteres."
            : "Password must be at least 8 characters.",
        );
        return false;
      }

      if (password !== confirmPassword) {
        showError(
          language === "pt"
            ? "As senhas não conferem."
            : "Passwords do not match.",
        );
        return false;
      }
    }

    return true;
  }

  async function goToNextSignupStep() {
    setFormError("");

    if (!(await validateSignupStep())) return;

    setSignupStep((current) => Math.min(current + 1, signupSteps.length - 1));
  }

  async function handleGoogleLogin() {
    setFormError("");
    setLoading(true);

    try {
      const result = await signInWithGoogle();

      if (result?.error) {
        showError(result.error.message);
        setLoading(false);
      }
    } catch (error) {
      const message =
        language === "pt"
          ? "Não foi possível entrar com Google."
          : "Could not sign in with Google.";

      setFormError(message);
      reportError(error, message);
      setLoading(false);
    }
  }

  async function createStarterWorkout(userId) {
    if (!selectedTemplate) return;

    const { data: planData, error: planError } = await createWorkoutPlanRecord({
      user_id: userId,
      title: selectedTemplate.title,
      description: selectedTemplate.description,
      is_active: true,
      day_focuses: selectedTemplate.focuses,
    });

    if (planError) {
      throw planError;
    }

    const exercisesToInsert = selectedTemplate.exercises.map((exercise, index) => ({
      workout_plan_id: planData.id,
      user_id: userId,
      workout_day: exercise.workout_day,
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      load: exercise.load,
      sort_order: index + 1,
    }));

    const { error: exercisesError } =
      await createWorkoutExercises(exercisesToInsert);

    if (exercisesError) {
      throw exercisesError;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (isRecoverPassword) {
      if (!email.trim()) {
        showError(
          language === "pt"
            ? "Informe seu e-mail."
            : "Enter your email.",
        );
        return;
      }

      setLoading(true);

      try {
        const result = await requestPasswordReset(email);

        if (result?.error) {
          showError(result.error.message);
          setLoading(false);
          return;
        }

        toast.success(
          language === "pt"
            ? "Enviamos um link de recuperação para seu e-mail."
            : "We sent a recovery link to your email.",
        );
        setAuthView("login");
      } catch (error) {
        const message =
          language === "pt"
            ? "Não foi possível enviar o email de recuperação."
            : "Could not send the recovery email.";

        setFormError(message);
        reportError(error, message);
      } finally {
        setLoading(false);
      }

      return;
    }

    if (isResetPassword) {
      if (!password.trim() || !confirmPassword.trim()) {
        showError(
          language === "pt"
            ? "Preencha a nova senha e a confirmação."
            : "Enter the new password and confirmation.",
        );
        return;
      }

      if (password.length < 8) {
        showError(
          language === "pt"
            ? "A senha deve ter pelo menos 8 caracteres."
            : "Password must be at least 8 characters.",
        );
        return;
      }

      if (password !== confirmPassword) {
        showError(
          language === "pt"
            ? "As senhas não conferem."
            : "Passwords do not match.",
        );
        return;
      }

      setLoading(true);

      try {
        const result = await updatePassword(password);

        if (result?.error) {
          showError(result.error.message);
          setLoading(false);
          return;
        }

        toast.success(
          language === "pt"
            ? "Senha redefinida com sucesso!"
            : "Password updated successfully!",
        );
        navigate("/dashboard", { replace: true });
      } catch (error) {
        const message =
          language === "pt"
            ? "Não foi possível redefinir a senha."
            : "Could not update your password.";

        setFormError(message);
        reportError(error, message);
      } finally {
        setLoading(false);
      }

      return;
    }

    if (isLogin) {
      if (!email.trim() || !password.trim()) {
        showError(
          language === "pt"
            ? "Preencha e-mail e senha."
            : "Enter email and password.",
        );
        return;
      }

      setLoading(true);

      try {
        const result = await signIn(email, password);

        if (result?.error) {
          showError(result.error.message);
          setLoading(false);
          return;
        }

        toast.success(
          language === "pt"
            ? "Login realizado com sucesso!"
            : "Logged in successfully!",
        );
        navigate(redirectAfterLogin, { replace: true });
      } catch (error) {
        const message =
          language === "pt"
            ? "Erro inesperado. Tente novamente."
            : "Unexpected error. Try again.";

        setFormError(message);
        reportError(error, message);
      } finally {
        setLoading(false);
      }

      return;
    }

    if (isSignup && signupStep < signupSteps.length - 1) {
      await goToNextSignupStep();
      return;
    }

    if (!(await validateSignupStep())) return;

    setLoading(true);

    try {
      const result = await signUp(email, password, normalizedUsername, {
        goal,
        level,
        templateTitle,
      });

      if (result?.error) {
        showError(result.error.message);
        setLoading(false);
        return;
      }

      const userId = result?.data?.user?.id;

      if (userId) {
        await createStarterWorkout(userId);
      }

      toast.success(
        language === "pt"
          ? "Conta criada com treino inicial!"
          : "Account created with a starter workout!",
      );
      navigate(siteMode ? "/download" : "/dashboard");
    } catch (error) {
      const message =
        language === "pt"
          ? "Conta criada, mas houve erro ao criar o treino inicial."
          : "Account created, but the starter workout could not be created.";

      setFormError(message);
      reportError(error, message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className="
        min-h-screen
        bg-zinc-50
        text-zinc-950
        overflow-x-hidden
        relative
        px-4
        sm:px-6
        py-5
        lg:py-6
        transition-colors

        dark:bg-black
        dark:text-white
      "
    >
      <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 z-20 flex items-center justify-end gap-4">
        {siteMode && (
          <Link
            to="/"
            className="mr-auto flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-bold text-zinc-600 shadow-sm transition hover:border-purple-500 hover:text-purple-500 sm:rounded-2xl sm:px-4 sm:py-3 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400 dark:hover:text-white"
          >
            <ArrowLeft size={18} />
            {language === "pt" ? "Voltar" : "Back"}
          </Link>
        )}

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <LanguageToggle />
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-fuchsia-500/15 blur-[140px]" />
      <div className="absolute bottom-0 right-0 hidden h-[520px] w-[520px] rounded-full bg-purple-500/15 blur-[160px] lg:block" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="
          relative
          z-10
          w-full
          max-w-6xl
          mx-auto
          min-h-[calc(100vh-40px)]
          lg:min-h-[calc(100vh-48px)]
          pt-20
          sm:pt-24
          grid
          lg:grid-cols-[1.08fr_.92fr]
          lg:items-stretch
          gap-5
          lg:gap-0
        "
      >
        <div className="hidden lg:flex flex-col justify-between overflow-hidden rounded-l-[34px] border border-zinc-200 bg-zinc-950 p-8 xl:p-10 text-white shadow-2xl shadow-purple-500/10 relative dark:border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(217,70,239,0.32),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(168,85,247,0.26),transparent_28%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_35%,rgba(255,255,255,0.04))]" />

          <div className="relative">
            <BrandLogo layout="horizontal" size="md" showTagline />

            <div className="mt-14 max-w-xl">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-fuchsia-300">
                {language === "pt"
                  ? "Sua jornada fitness, gamificada."
                  : "Your fitness journey, gamified."}
              </p>

              <h1 className="mt-5 text-5xl xl:text-6xl font-black leading-[0.98] tracking-normal">
                {heroCopy.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h1>

              <p className="mt-6 max-w-lg text-base leading-relaxed text-zinc-300">
                {language === "pt"
                  ? "Registre treinos, ganhe XP, acompanhe sequências e dispute rankings com sua comunidade."
                  : "Log workouts, earn XP, track streaks and climb rankings with your community."}
              </p>
            </div>
          </div>

          <div className="relative mt-10 grid grid-cols-2 gap-4">
            {previewStats.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl shadow-xl shadow-black/20"
              >
                <div
                  className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r ${item.tone} text-white`}
                >
                  {item.icon}
                </div>

                <p className="text-2xl font-black">{item.value}</p>
                <p className="mt-1 text-sm text-zinc-300">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center rounded-[28px] lg:rounded-l-none lg:rounded-r-[34px] border border-zinc-200 bg-white/90 p-4 sm:p-6 lg:p-8 shadow-2xl shadow-purple-500/10 backdrop-blur-2xl dark:bg-white/5 dark:border-white/10">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-8 flex flex-col items-center text-center">
              <BrandLogo layout="stacked" size="lg" showTagline />

              <p className="mt-4 max-w-xs text-sm font-bold text-zinc-600 dark:text-zinc-400">
                {language === "pt"
                  ? "Sua jornada fitness, gamificada."
                  : "Your fitness journey, gamified."}
              </p>

              <div className="mt-4">
                <LanguageToggle />
              </div>
            </div>

            <div className="hidden lg:block mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-2 text-xs font-black text-purple-500">
                <ShieldCheck size={15} />
                {language === "pt" ? "Acesso seguro" : "Secure access"}
              </div>

              <h2 className="mt-5 text-3xl font-black">
                {isRecoverPassword
                  ? language === "pt"
                    ? "Recuperar senha"
                    : "Recover password"
                  : isResetPassword
                    ? language === "pt"
                      ? "Definir nova senha"
                      : "Set a new password"
                    : isLogin
                      ? t("auth.loginSubtitle")
                      : t("auth.signupSubtitle")}
              </h2>
            </div>

            {!siteMode && !isResetPassword && (
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-zinc-100 p-1 dark:bg-black/30">
                <ModeButton active={isLogin} onClick={() => switchMode(true)}>
                  {t("auth.login")}
                </ModeButton>
                <ModeButton active={isSignup} onClick={() => switchMode(false)}>
                  {t("auth.createAccount")}
                </ModeButton>
              </div>
            )}

            {isSignup && (
              <div className="mt-5 grid grid-cols-4 gap-2">
                {signupSteps.map((step, index) => (
                  <div key={step} className="min-w-0">
                    <div
                      className={`
                        h-2
                        rounded-full
                        transition
                        ${
                          index <= signupStep
                            ? "bg-gradient-to-r from-purple-500 to-fuchsia-500"
                            : "bg-zinc-200 dark:bg-white/10"
                        }
                      `}
                    />
                    <p className="mt-2 truncate text-[10px] font-bold text-zinc-500">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {formError && (
              <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-500">
                {formError}
              </div>
            )}

            {showSocialLogin && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="
                    mt-6
                    flex
                    min-h-14
                    w-full
                    items-center
                    justify-center
                    gap-3
                    rounded-2xl
                    border
                    border-zinc-200
                    bg-white
                    px-6
                    py-4
                    font-black
                    text-zinc-800
                    shadow-sm
                    transition
                    hover:border-purple-500
                    hover:text-purple-500
                    disabled:opacity-50

                    dark:border-white/10
                    dark:bg-black/30
                    dark:text-white
                  "
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-sm font-black text-purple-500">
                    G
                  </span>
                  {language === "pt"
                    ? "Entrar com Google"
                    : "Continue with Google"}
                </button>

                <div className="mt-5 flex items-center gap-3 text-xs font-bold uppercase text-zinc-400">
                  <span className="h-px flex-1 bg-zinc-200 dark:bg-white/10" />
                  {language === "pt" ? "ou" : "or"}
                  <span className="h-px flex-1 bg-zinc-200 dark:bg-white/10" />
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {isRecoverPassword ? (
                <RecoverPasswordFields
                  email={email}
                  language={language}
                  setEmail={setEmail}
                />
              ) : isResetPassword ? (
                <ResetPasswordFields
                  confirmPassword={confirmPassword}
                  language={language}
                  password={password}
                  passwordStrength={passwordStrength}
                  setConfirmPassword={setConfirmPassword}
                  setPassword={setPassword}
                />
              ) : isLogin ? (
                <>
                  <LoginFields
                    email={email}
                    password={password}
                    setEmail={setEmail}
                    setPassword={setPassword}
                    language={language}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setAuthView("recover");
                      setFormError("");
                    }}
                    className="-mt-1 text-sm font-black text-purple-500 transition hover:text-fuchsia-500"
                  >
                    {language === "pt"
                      ? "Esqueci minha senha"
                      : "Forgot my password"}
                  </button>
                </>
              ) : (
                <SignupStep
                  email={email}
                  goal={goal}
                  goalOptions={goalOptions}
                  language={language}
                  level={level}
                  levelOptions={levelOptions}
                  password={password}
                  confirmPassword={confirmPassword}
                  passwordStrength={passwordStrength}
                  selectedTemplate={selectedTemplate}
                  setEmail={setEmail}
                  setGoal={setGoal}
                  setLevel={setLevel}
                  setPassword={setPassword}
                  setConfirmPassword={setConfirmPassword}
                  setTemplateTitle={setTemplateTitle}
                  setUsername={setUsername}
                  signupStep={signupStep}
                  starterTemplates={starterTemplates}
                  templateTitle={templateTitle}
                  translate={translate}
                  username={username}
                  usernameFeedback={usernameFeedback}
                  usernameStatus={usernameStatus}
                />
              )}

              <div className="flex gap-3">
                {(isRecoverPassword || isResetPassword || (isSignup && signupStep > 0)) && (
                  <button
                    type="button"
                    onClick={() => {
                      if (isRecoverPassword || isResetPassword) {
                        setAuthView("login");
                        setFormError("");
                        return;
                      }

                      setSignupStep((current) => current - 1);
                    }}
                    className="w-24 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 font-black text-zinc-600 transition hover:border-purple-500 dark:bg-black/30 dark:border-white/10 dark:text-zinc-300"
                  >
                    {language === "pt" ? "Voltar" : "Back"}
                  </button>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex min-h-14 flex-1 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-6 py-4 font-black text-white transition hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      {t("common.loading")}
                    </>
                  ) : isRecoverPassword ? (
                    <>
                      <ShieldCheck size={20} />
                      {language === "pt" ? "Enviar link" : "Send link"}
                    </>
                  ) : isResetPassword ? (
                    <>
                      <ShieldCheck size={20} />
                      {language === "pt" ? "Salvar senha" : "Save password"}
                    </>
                  ) : isLogin ? (
                    <>
                      <Trophy size={20} />
                      {t("auth.login")}
                    </>
                  ) : isSignup && signupStep < signupSteps.length - 1 ? (
                    <>
                      <Target size={20} />
                      {language === "pt" ? "Continuar" : "Continue"}
                    </>
                  ) : (
                    <>
                      <UserPlus size={20} />
                      {language === "pt"
                        ? "Criar conta e treino"
                        : "Create account and workout"}
                    </>
                  )}
                </button>
              </div>
            </form>

            {!siteMode && !isResetPassword && (
              <p className="mt-6 text-center text-sm text-zinc-500">
                {isLogin || isRecoverPassword
                  ? language === "pt"
                    ? "Novo no GymFocus?"
                    : "New to GymFocus?"
                  : t("auth.alreadyHaveAccount")}{" "}
                <button
                  type="button"
                  onClick={() => switchMode(!(isLogin || isRecoverPassword))}
                  className="font-black text-purple-500 transition hover:text-fuchsia-500"
                >
                  {isLogin || isRecoverPassword
                    ? t("auth.createAccountShort")
                    : t("auth.login")}
                </button>
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function ModeButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-xl
        px-4
        py-3
        text-sm
        font-black
        transition
        ${
          active
            ? "bg-white text-zinc-950 shadow-sm dark:bg-white dark:text-black"
            : "text-zinc-500 hover:text-zinc-950 dark:hover:text-white"
        }
      `}
    >
      {children}
    </button>
  );
}

function LoginFields({ email, language, password, setEmail, setPassword }) {
  return (
    <>
      <FieldLabel label="Email">
        <input
          type="email"
          placeholder="you@gymfocus.app"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="WorkoutInput"
        />
      </FieldLabel>

      <FieldLabel label={language === "pt" ? "Senha" : "Password"}>
        <input
          type="password"
          placeholder="••••••••"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="WorkoutInput"
        />
      </FieldLabel>
    </>
  );
}

function RecoverPasswordFields({ email, language, setEmail }) {
  return (
    <div className="space-y-4">
      <p className="rounded-2xl border border-purple-500/20 bg-purple-500/10 px-4 py-3 text-sm font-bold text-zinc-600 dark:text-zinc-300">
        {language === "pt"
          ? "Informe seu e-mail e enviaremos um link seguro para redefinir sua senha."
          : "Enter your email and we will send a secure link to reset your password."}
      </p>

      <FieldLabel label="Email">
        <input
          type="email"
          placeholder="you@gymfocus.app"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="WorkoutInput"
        />
      </FieldLabel>
    </div>
  );
}

function ResetPasswordFields({
  confirmPassword,
  language,
  password,
  passwordStrength,
  setConfirmPassword,
  setPassword,
}) {
  return (
    <>
      <p className="rounded-2xl border border-purple-500/20 bg-purple-500/10 px-4 py-3 text-sm font-bold text-zinc-600 dark:text-zinc-300">
        {language === "pt"
          ? "Crie uma nova senha para acessar sua conta."
          : "Create a new password to access your account."}
      </p>

      <FieldLabel label={language === "pt" ? "Nova senha" : "New password"}>
        <input
          type="password"
          placeholder="********"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="WorkoutInput"
        />
      </FieldLabel>

      <div className="-mt-2">
        <div className="grid grid-cols-4 gap-1">
          {[1, 2, 3, 4].map((step) => (
            <span
              key={step}
              className={`
                h-1.5
                rounded-full
                ${
                  passwordStrength.score >= step
                    ? passwordStrength.tone
                    : "bg-zinc-200 dark:bg-white/10"
                }
              `}
            />
          ))}
        </div>
        <p className="mt-2 text-xs font-bold text-zinc-500">
          {passwordStrength.label}
        </p>
      </div>

      <FieldLabel
        label={language === "pt" ? "Confirmar nova senha" : "Confirm new password"}
      >
        <input
          type="password"
          placeholder="********"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="WorkoutInput"
        />
      </FieldLabel>

      {confirmPassword && password !== confirmPassword && (
        <p className="-mt-2 text-xs font-bold text-red-500">
          {language === "pt"
            ? "As senhas não conferem."
            : "Passwords do not match."}
        </p>
      )}
    </>
  );
}

function SignupStep({
  confirmPassword,
  email,
  goal,
  goalOptions,
  language,
  level,
  levelOptions,
  password,
  passwordStrength,
  selectedTemplate,
  setConfirmPassword,
  setEmail,
  setGoal,
  setLevel,
  setPassword,
  setTemplateTitle,
  setUsername,
  signupStep,
  starterTemplates,
  templateTitle,
  translate,
  username,
  usernameFeedback,
  usernameStatus,
}) {
  if (signupStep === 0) {
    return (
      <>
        <FieldLabel label="Username">
          <input
            type="text"
            placeholder="gymfocus_athlete"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            className="WorkoutInput"
          />
        </FieldLabel>

        {usernameFeedback && (
          <p
            className={`
              -mt-2
              text-xs
              font-bold
              ${
                usernameStatus === "available"
                  ? "text-green-500"
                  : usernameStatus === "checking"
                    ? "text-zinc-500"
                    : "text-red-500"
              }
            `}
          >
            {usernameFeedback}
          </p>
        )}

        <FieldLabel label="Email">
          <input
            type="email"
            placeholder="you@gymfocus.app"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="WorkoutInput"
          />
        </FieldLabel>

        <FieldLabel label={language === "pt" ? "Senha" : "Password"}>
          <input
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="WorkoutInput"
          />
        </FieldLabel>

        <div className="-mt-2">
          <div className="grid grid-cols-4 gap-1">
            {[1, 2, 3, 4].map((step) => (
              <span
                key={step}
                className={`
                  h-1.5
                  rounded-full
                  ${
                    passwordStrength.score >= step
                      ? passwordStrength.tone
                      : "bg-zinc-200 dark:bg-white/10"
                  }
                `}
              />
            ))}
          </div>
          <p className="mt-2 text-xs font-bold text-zinc-500">
            {passwordStrength.label}
          </p>
        </div>

        <FieldLabel
          label={language === "pt" ? "Confirmar senha" : "Confirm password"}
        >
          <input
            type="password"
            placeholder="********"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="WorkoutInput"
          />
        </FieldLabel>

        {confirmPassword && password !== confirmPassword && (
          <p className="-mt-2 text-xs font-bold text-red-500">
            {language === "pt"
              ? "As senhas não conferem."
              : "Passwords do not match."}
          </p>
        )}
      </>
    );
  }

  if (signupStep === 1) {
    return (
      <ChoiceGrid
        description={
          language === "pt"
            ? "Isso ajuda o GymFocus a sugerir o melhor ponto de partida."
            : "This helps GymFocus suggest the best starting point."
        }
        icon={<Target size={19} />}
        options={goalOptions}
        selected={goal}
        setSelected={setGoal}
        title={language === "pt" ? "Escolha seu objetivo" : "Choose your goal"}
        language={language}
      />
    );
  }

  if (signupStep === 2) {
    return (
      <ChoiceGrid
        description={
          language === "pt"
            ? "Seu nível define a complexidade do treino inicial."
            : "Your level defines the complexity of the starter workout."
        }
        icon={<Medal size={19} />}
        options={levelOptions}
        selected={level}
        setSelected={setLevel}
        title={language === "pt" ? "Escolha seu nível" : "Choose your level"}
        language={language}
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
          <Dumbbell size={20} />
        </div>
        <div>
          <h3 className="font-black">
            {language === "pt"
              ? "Escolha um template inicial"
              : "Choose a starter template"}
          </h3>
          <p className="text-sm text-zinc-500">
            {language === "pt"
              ? "Você já entra com um treino pronto para usar."
              : "You start with a ready-to-use workout plan."}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {starterTemplates.map((template) => {
          const selected = templateTitle === template.title;

          return (
            <button
              key={template.title}
              type="button"
              onClick={() => setTemplateTitle(template.title)}
              className={`
                w-full
                rounded-2xl
                border
                p-4
                text-left
                transition
                ${
                  selected
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-zinc-200 bg-zinc-50 hover:border-purple-500 dark:border-white/10 dark:bg-black/30"
                }
              `}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-black">{translate(template.title)}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {translate(template.description)}
                  </p>
                </div>
                {selected && <Check size={19} className="text-purple-500" />}
              </div>
            </button>
          );
        })}
      </div>

      {selectedTemplate && (
        <p className="mt-4 text-xs font-bold text-zinc-500">
          {selectedTemplate.exercises.length}{" "}
          {language === "pt" ? "exercícios incluídos" : "exercises included"}
        </p>
      )}
    </div>
  );
}

function FieldLabel({ children, label }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-zinc-600 dark:text-zinc-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function ChoiceGrid({
  description,
  icon,
  language,
  options,
  selected,
  setSelected,
  title,
}) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
          {icon}
        </div>
        <div>
          <h3 className="font-black">{title}</h3>
          <p className="text-sm text-zinc-500">{description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const active = selected === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelected(option.id)}
              className={`
                rounded-2xl
                border
                px-4
                py-4
                text-left
                font-black
                transition
                ${
                  active
                    ? "border-purple-500 bg-purple-500/10 text-purple-500"
                    : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-purple-500 dark:border-white/10 dark:bg-black/30 dark:text-zinc-300"
                }
              `}
            >
              {language === "pt" ? option.pt : option.en}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Auth;
