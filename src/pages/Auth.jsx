import { useState } from "react";

import { motion } from "framer-motion";

import { Dumbbell, ArrowLeft } from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import toast from "react-hot-toast";

import ThemeToggle from "../components/layout/ThemeToggle";
import { reportError } from "../utils/errorHandler";

function Auth() {
  const navigate = useNavigate();

  const { signIn, signUp } = useAuth();

  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [username, setUsername] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Preencha e-mail e senha.");
      return;
    }

    if (!isLogin && !username.trim()) {
      toast.error("Escolha um username.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const result = await signIn(email, password);

        if (result?.error) {
          toast.error(result.error.message);
          setLoading(false);
          return;
        }

        toast.success("Login realizado com sucesso!");
        navigate("/dashboard");
        setLoading(false);
        return;
      }

      const result = await signUp(email, password, username);

      if (result?.error) {
        toast.error(result.error.message);
        setLoading(false);
        return;
      }

      toast.success("Conta criada com sucesso!");
      navigate("/dashboard");
      setLoading(false);
    } catch (error) {
      reportError(error, "Erro inesperado. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <section
      className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-zinc-50
        text-zinc-950
        overflow-hidden
        relative
        px-6
        transition-colors

        dark:bg-black
        dark:text-white
      "
    >
      {/* TOP ACTIONS */}
      <div
        className="
          absolute
          top-8
          left-8
          right-8
          z-20
          flex
          items-center
          justify-between
          gap-4
        "
      >
        {/* BACK TO HOME */}
        <Link
          to="/"
          className="
            flex
            items-center
            gap-2
            text-zinc-600
            hover:text-zinc-950
            transition
            text-sm
            bg-white
            border
            border-zinc-200
            px-4
            py-3
            rounded-2xl
            shadow-sm

            dark:text-zinc-400
            dark:hover:text-white
            dark:bg-white/5
            dark:border-white/10
            dark:backdrop-blur-xl
          "
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        {/* THEME TOGGLE */}
        <ThemeToggle />
      </div>

      {/* GLOW */}
      <div
        className="
          absolute
          w-[500px]
          h-[500px]
          bg-purple-500/20
          blur-[140px]
          rounded-full
        "
      />

      {/* CARD */}
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
          duration: 0.8,
        }}
        className="
          relative
          z-10
          w-full
          max-w-md
          bg-white
          border
          border-zinc-200
          rounded-3xl
          p-10
          shadow-2xl
          shadow-purple-500/10
          transition-colors

          dark:bg-white/5
          dark:border-white/10
          dark:backdrop-blur-2xl
        "
      >
        {/* LOGO */}
        <div className="flex flex-col items-center">
          <div
            className="
              w-16
              h-16
              rounded-3xl
              bg-gradient-to-r
              from-purple-500
              to-fuchsia-500
              flex
              items-center
              justify-center
              shadow-lg
              shadow-purple-500/30
              text-white
            "
          >
            <Dumbbell size={30} />
          </div>

          <h1 className="text-4xl font-black mt-6">
            Gym
            <span className="text-purple-500">
              Focus
            </span>
          </h1>

          <p className="text-zinc-600 dark:text-zinc-400 mt-3">
            {isLogin ? "Entre na sua conta" : "Crie sua conta"}
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-5"
        >
          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="
                w-full
                bg-zinc-50
                border
                border-zinc-200
                rounded-2xl
                px-5
                py-4
                outline-none
                focus:border-purple-500
                transition

                dark:bg-white/5
                dark:border-white/10
              "
            />
          )}

          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
              w-full
              bg-zinc-50
              border
              border-zinc-200
              rounded-2xl
              px-5
              py-4
              outline-none
              focus:border-purple-500
              transition

              dark:bg-white/5
              dark:border-white/10
            "
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="
              w-full
              bg-zinc-50
              border
              border-zinc-200
              rounded-2xl
              px-5
              py-4
              outline-none
              focus:border-purple-500
              transition

              dark:bg-white/5
              dark:border-white/10
            "
          />

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-gradient-to-r
              from-purple-500
              to-fuchsia-500
              text-white
              py-4
              rounded-2xl
              font-bold
              hover:scale-[1.02]
              transition
              disabled:opacity-50
              disabled:hover:scale-100
            "
          >
            {loading
              ? "Loading..."
              : isLogin
              ? "Login"
              : "Create Account"}
          </button>
        </form>

        {/* TOGGLE LOGIN/REGISTER */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="
              text-purple-500
              hover:text-purple-400
              transition
            "
          >
            {isLogin ? "Criar conta" : "Já possui conta?"}
          </button>
        </div>
      </motion.div>
    </section>
  );
}

export default Auth;