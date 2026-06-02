import { supabase } from "../lib/supabase";
import { reportError } from "./errorHandler";

export async function unlockAchievement(
  userId,
  badge
) {
  if (!userId || !badge) return;

  const { error } = await supabase
    .from("achievements")
    .upsert(
      [
        {
          user_id: userId,
          badge,
        },
      ],
      {
        ignoreDuplicates: true,
        onConflict: "user_id,badge",
      },
    );

  if (error) {
    reportError("Error unlocking achievement:", error);
  }
}
