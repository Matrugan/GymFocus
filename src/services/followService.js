import { supabase } from "../lib/supabase";

export function fetchFollowers(profileId) {
  return supabase.from("followers").select("*").eq("following_id", profileId);
}

export function fetchFollowing(profileId) {
  return supabase.from("followers").select("*").eq("follower_id", profileId);
}

export function fetchFollow(userId, profileId) {
  return supabase
    .from("followers")
    .select("*")
    .eq("follower_id", userId)
    .eq("following_id", profileId)
    .maybeSingle();
}

export function followProfile(userId, profileId) {
  return supabase
    .from("followers")
    .upsert(
      [
        {
          follower_id: userId,
          following_id: profileId,
        },
      ],
      {
        ignoreDuplicates: true,
        onConflict: "follower_id,following_id",
      },
    );
}

export function unfollowProfile(userId, profileId) {
  return supabase
    .from("followers")
    .delete()
    .eq("follower_id", userId)
    .eq("following_id", profileId);
}
