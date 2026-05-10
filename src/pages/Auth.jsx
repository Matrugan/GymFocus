import { useState } from "react"
import { motion } from "framer-motion"
import { Dumbbell } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { useAuth } from "../context/AuthContext"

function Auth() {

    

  const {
    signIn,
    signUp,
  } = useAuth()

  const [isLogin, setIsLogin] = useState(true)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  async function handleSubmit(e) {

  e.preventDefault()

  if (isLogin) {

    await signIn(email, password)

    navigate("/dashboard")

  } else {

    await signUp(email, password)

  }

}

  return (
    <section className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-black
      overflow-hidden
      relative
      px-6
    ">

      {/* Glow */}
      <div className="
        absolute
        w-[500px]
        h-[500px]
        bg-purple-500/20
        blur-[140px]
        rounded-full
      ">
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="
          relative
          z-10
          w-full
          max-w-md
          bg-white/5
          border
          border-white/10
          backdrop-blur-2xl
          rounded-3xl
          p-10
          shadow-2xl
          shadow-purple-500/10
        "
      >

        {/* Logo */}
        <div className="flex flex-col items-center">

          <div className="
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
          ">

            <Dumbbell size={30} />

          </div>

          <h1 className="text-4xl font-black mt-6">
            Gym
            <span className="text-purple-500">
              Focus
            </span>
          </h1>

          <p className="text-zinc-400 mt-3">
            {isLogin
              ? "Entre na sua conta"
              : "Crie sua conta"}
          </p>

        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-5"
        >

          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="
              w-full
              bg-white/5
              border
              border-white/10
              rounded-2xl
              px-5
              py-4
              outline-none
              focus:border-purple-500
              transition
            "
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="
              w-full
              bg-white/5
              border
              border-white/10
              rounded-2xl
              px-5
              py-4
              outline-none
              focus:border-purple-500
              transition
            "
          />

          <button
            type="submit"
            className="
              w-full
              bg-gradient-to-r
              from-purple-500
              to-fuchsia-500
              py-4
              rounded-2xl
              font-bold
              hover:scale-[1.02]
              transition
            "
          >

            {isLogin
              ? "Login"
              : "Create Account"}

          </button>

        </form>

        {/* Toggle */}
        <div className="mt-8 text-center">

          <button
            onClick={() =>
              setIsLogin(!isLogin)
            }
            className="
              text-purple-400
              hover:text-purple-300
              transition
            "
          >

            {isLogin
              ? "Criar conta"
              : "Já possui conta?"}

          </button>

        </div>

      </motion.div>

    </section>
  )
}

export default Auth