import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    supabase.auth.getSession()
      .then(({ data }) => {

        setUser(data.session?.user ?? null);

        setLoading(false);

      });

    const {
      data: listener
    } = supabase.auth.onAuthStateChange(
      (_, session) => {

        setUser(session?.user ?? null);

      }
    );

    return () => {

      listener.subscription.unsubscribe();

    };

  }, []);

  async function signUp(email, password, username) {

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {

      console.log(error);

      return {
        error,
      };

    }

    // cria perfil inicial
    if (data?.user) {

      const { error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: data.user.id,

            username,

            xp: 0,

            streak: 0,

            current_workout: "Push Day",

            avatar_url: "",

            bio: "",
          },
        ]);

      if (profileError) {

        console.log(profileError);

      }

    }

    return {
      data,
    };

  }

  async function signIn(email, password) {

    const {
      data,
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {

      console.log(error.message);

      return;

    }

    return {
  data,
};

  }

  async function signOut() {

    await supabase.auth.signOut();

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
  );

}

export function useAuth() {

  return useContext(AuthContext);

}