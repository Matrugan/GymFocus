import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabase";
import { reportError } from "../utils/errorHandler";

const AuthContext = createContext();

function isInvalidRefreshTokenError(error) {
  const message = error?.message || "";

  return (
    message.includes("Invalid Refresh Token") ||
    message.includes("Refresh Token Not Found") ||
    message.includes("refresh_token_not_found")
  );
}

async function clearBrokenAuthSession() {
  try {
    await supabase.auth.signOut({
      scope: "local",
    });
  } catch (error) {
    reportError("Erro ao limpar sessão local:", error);
  }

  const keysToRemove = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);

    if (
      key?.includes("supabase") ||
      key?.includes("sb-") ||
      key?.includes("auth")
    ) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));

  sessionStorage.clear();
}

function buildOAuthUsername(user) {
  const rawName =
    user?.user_metadata?.user_name ||
    user?.user_metadata?.preferred_username ||
    user?.user_metadata?.name ||
    user?.email?.split("@")?.[0] ||
    "athlete";

  const normalizedName = rawName
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 20);

  return `${normalizedName || "athlete"}_${user.id.slice(0, 8)}`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [passwordRecoveryMode, setPasswordRecoveryMode] = useState(false);

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
        reportError("Erro ao atualizar online:", error);
      }
    } catch (err) {
      // Não bloquear login/roteamento por falha de status online.
      reportError("Erro inesperado ao atualizar online:", err);
    }
  }

  async function ensureOAuthProfile(userData) {
    if (!userData || userData.app_metadata?.provider === "email") return;

    try {
      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userData.id)
        .maybeSingle();

      if (fetchError) {
        reportError("Erro ao buscar profile OAuth:", fetchError);
        return;
      }

      if (existingProfile) return;

      const { error: insertError } = await supabase.from("profiles").insert([
        {
          id: userData.id,
          username: buildOAuthUsername(userData),
          xp: 0,
          streak: 0,
          current_workout: "Push Day",
          avatar_url: userData.user_metadata?.avatar_url || "",
          bio: "",
          online: true,
          last_seen: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        reportError("Erro ao criar profile OAuth:", insertError);
      }
    } catch (error) {
      reportError("Erro inesperado ao criar profile OAuth:", error);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          if (isInvalidRefreshTokenError(error)) {
            await clearBrokenAuthSession();

            if (isMounted) {
              setUser(null);
            }

            return;
          }

          reportError("Erro ao carregar sessão:", error);
        }

        const session = data?.session ?? null;

        if (isMounted) {
          setUser(session?.user ?? null);
        }

        // Best-effort: não travar o app se `profiles` estiver bloqueado por RLS.
        if (session?.user) {
          setUserOnlineStatus(session.user.id, true);
        }
      } catch (err) {
        reportError("Erro ao carregar sessão:", err);

        if (isInvalidRefreshTokenError(err)) {
          await clearBrokenAuthSession();

          if (isMounted) {
            setUser(null);
          }

          return;
        }

        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (
        event === "TOKEN_REFRESHED" ||
        event === "SIGNED_IN" ||
        event === "INITIAL_SESSION" ||
        event === "PASSWORD_RECOVERY"
      ) {
        if (event === "PASSWORD_RECOVERY") {
          setPasswordRecoveryMode(true);
        }

        if (session?.user) {
          await ensureOAuthProfile(session.user);
        }

        setUser(session?.user ?? null);

        if (session?.user) {
          setUserOnlineStatus(session.user.id, true);
        }

        setLoading(false);
        return;
      }

      if (event === "SIGNED_OUT") {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signUp(email, password, username, onboarding = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      reportError("Erro no cadastro:", error.message);

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
            fitness_goal: onboarding.goal || null,
            training_level: onboarding.level || null,
            initial_template: onboarding.templateTitle || null,
            onboarding_completed: Boolean(onboarding.goal && onboarding.level),
            online: true,
            last_seen: new Date().toISOString(),
          },
        ]);

      if (profileError) {
        reportError("Erro ao criar profile:", profileError);

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
      reportError("Erro no login:", error.message);

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

  async function signInWithGoogle() {
    const redirectTo = window.location.origin;

    sessionStorage.setItem("gymfocus_oauth_redirect", "/dashboard");

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      reportError("Erro no login com Google:", error.message);

      return {
        error: {
          message: "Nao foi possivel entrar com Google.",
        },
      };
    }

    return {
      data,
    };
  }

  async function requestPasswordReset(email) {
    const redirectTo = `${window.location.origin}/auth?mode=reset-password`;

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      reportError("Erro ao enviar recuperacao de senha:", error.message);

      return {
        error: {
          message: "Nao foi possivel enviar o email de recuperacao.",
        },
      };
    }

    return {
      data,
    };
  }

  async function updatePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      reportError("Erro ao redefinir senha:", error.message);

      return {
        error: {
          message: "Nao foi possivel redefinir a senha.",
        },
      };
    }

    setPasswordRecoveryMode(false);

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
        signInWithGoogle,
        requestPasswordReset,
        updatePassword,
        passwordRecoveryMode,
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
