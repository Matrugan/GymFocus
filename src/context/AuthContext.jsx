import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"

import { supabase } from "../lib/supabase"

const AuthContext = createContext()

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    supabase.auth.getSession()
      .then(({ data }) => {
        setUser(data.session?.user ?? null)
        setLoading(false)
      })

    const {
      data: listener
    } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }

  }, [])

  async function signUp(email, password) {

  const {
    data,
    error,
  } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {

    console.log(error)

    return

  }

  const user = data.user

  if (user) {

    await supabase
      .from("profiles")
      .insert([
        {
          id: user.id,
          username: email.split("@")[0],
          xp: 1480,
          streak: 12,
          current_workout: "Push Day",
        }
      ])

  }

}

  async function signIn(email, password) {

  const {
    data,
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {

    console.log(error.message)

    return

  }

  console.log("LOGIN SUCCESS", data)

}

  async function signOut() {

    await supabase.auth.signOut()

  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}