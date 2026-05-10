import { Navigate } from "react-router-dom"

import { useAuth } from "../context/AuthContext"

function ProtectedRoute({ children }) {

  const {
    user,
    loading,
  } = useAuth()

  // Loading
  if (loading) {

    return (

      <section className="
        min-h-screen
        bg-black
        flex
        items-center
        justify-center
      ">

        <div className="text-center">

          <div className="
            w-16
            h-16
            border-4
            border-purple-500
            border-t-transparent
            rounded-full
            animate-spin
            mx-auto
          ">
          </div>

          <p className="mt-6 text-zinc-400">
            Loading GymFocus...
          </p>

        </div>

      </section>

    )

  }

  // User not logged
  if (!user) {

    return <Navigate to="/auth" />

  }

  // User logged
  return children
}

export default ProtectedRoute