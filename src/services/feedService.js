import { supabase } from "../lib/supabase";

export function fetchPostsByUserId(userId) {
  return supabase
    .from("posts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

export function fetchLikes() {
  return supabase.from("likes").select("*");
}

export function createLike(postId, userId) {
  return supabase.from("likes").insert([
    {
      post_id: postId,
      user_id: userId,
    },
  ]);
}

export function deleteLike(likeId) {
  return supabase.from("likes").delete().eq("id", likeId);
}
