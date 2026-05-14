import { supabase } from "../lib/supabase";
import { reportError } from "./errorHandler";

export async function logXP(userId, amount, reason) {
  if (!userId || !amount) return;

  const { error } = await supabase
    .from("xp_logs")
    .insert([
      {
        user_id: userId,
        amount,
        reason,
      },
    ]);

  if (error) {
    reportError("Error logging XP:", error);
  }
}