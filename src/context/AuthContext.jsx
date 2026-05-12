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

  async function setUserOnlineStatus(userId, status) {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          online: status,
          last_seen: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        console.log("Erro ao atualizar online:", error);
      }
    } catch (err) {
      // Não bloquear login/roteamento por falha de status online.
      console.log("Erro inesperado ao atualizar online:", err);
    }
  }


  useEffect(() => {
    async function loadSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        setUser(session?.user ?? null);

        // Best-effort: não travar o app se `profiles` estiver bloqueado por RLS.
        if (session?.user) {
          setUserOnlineStatus(session.user.id, true);
        }
      } catch (err) {
        console.log("Erro ao carregar sessão:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        setUserOnlineStatus(session.user.id, true);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);


  async function signUp(email, password, username) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.log("Erro no cadastro:", error.message);

      return {
        error: {
          message:
            error.message === "User already registered"
              ? "Este e-mail já está cadastrado. Faça login."
              : error.message,
        },
      };
    }

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
            online: true,
            last_seen: new Date().toISOString(),
          },
        ]);

      if (profileError) {
        console.log("Erro ao criar profile:", profileError);

        return {
          error: {
            message: "Conta criada, mas houve erro ao criar o perfil.",
          },
        };
      }

      setUser(data.user);

      // Não bloquear signup por erro de update em profiles.
      setUserOnlineStatus(data.user.id, true);
    }


    return {
      data,
    };
  }

  async function signIn(email, password) {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      console.log("Erro no login:", error.message);

      return {
        error: {
          message:
            error.message === "Invalid login credentials"
              ? "E-mail ou senha incorretos."
              : error.message,
        },
      };
    }

    if (data?.user) {
      setUser(data.user);

      // Não bloquear login por erro de update em profiles.
      setUserOnlineStatus(data.user.id, true);
    }


    return {
      data,
    };
  }

  async function signOut() {
    if (user) {
      await setUserOnlineStatus(user.id, false);
    }

    await supabase.auth.signOut();

    setUser(null);
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