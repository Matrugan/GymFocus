import { supabase } from "../lib/supabase";

export async function unlockAchievement(
  userId,
  badge
) {

  // verifica se já possui
  const { data: existing } = await supabase
    .from("achievements")
    .select("*")
    .eq("user_id", userId)
    .eq("badge", badge)
    .maybeSingle();

  // se já existir, para
  if (existing) return;

  // cria achievement
  await supabase
    .from("achievements")
    .insert([
      {
        user_id: userId,
        badge,
      },
    ]);
}