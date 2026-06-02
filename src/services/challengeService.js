import { supabase } from "../lib/supabase";

export function fetchChallenges() {
  return supabase
    .from("challenges")
    .select("*")
    .order("created_at", { ascending: true });
}

export function fetchUserChallenges(userId) {
  return supabase.from("user_challenges").select("*").eq("user_id", userId);
}

export function fetchUserWorkoutLogCount(userId) {
  return supabase
    .from("workout_logs")
    .select("id")
    .eq("user_id", userId)
    .or("status.eq.completed,status.is.null");
}

export function createUserChallenge(userId, challengeId) {
  return supabase
    .from("user_challenges")
    .upsert(
      [
        {
          user_id: userId,
          challenge_id: challengeId,
        },
      ],
      {
        ignoreDuplicates: true,
        onConflict: "user_id,challenge_id",
      },
    );
}

export function markUserChallengeClaimed(userChallengeId) {
  return supabase
    .from("user_challenges")
    .update({
      completed: true,
      claimed: true,
    })
    .eq("id", userChallengeId);
}
