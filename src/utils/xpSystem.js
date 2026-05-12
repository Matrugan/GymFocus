import { supabase } from "../lib/supabase";

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
    console.log("Error logging XP:", error);
  }
}