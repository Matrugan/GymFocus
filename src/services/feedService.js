import { supabase } from "../lib/supabase";

export function fetchPostsByUserId(userId) {
  return supabase
    .from("posts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

export async function fetchFeedPosts({ activeFeed, userId }) {
  if (activeFeed === "following") {
    const { data: followingData, error: followingError } = await supabase
      .from("followers")
      .select("following_id")
      .eq("follower_id", userId);

    if (followingError) {
      return { data: [], error: followingError };
    }

    const followingIds = followingData?.map((item) => item.following_id) || [];

    if (followingIds.length === 0) {
      return { data: [], error: null };
    }

    return supabase
      .from("posts")
      .select("*")
      .in("user_id", followingIds)
      .order("created_at", { ascending: false });
  }

  return supabase
    .from("posts")
    .select("*")
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

export function createPost(post) {
  return supabase.from("posts").insert([post]);
}

export function updatePostContent(postId, content) {
  return supabase.from("posts").update({ content }).eq("id", postId);
}

export function deletePostById(postId) {
  return supabase.from("posts").delete().eq("id", postId);
}

export async function uploadPostImage(userId, image) {
  const fileExt = image.name.split(".").pop();
  const filePath = `${userId}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("post-images")
    .upload(filePath, image, { upsert: false });

  if (uploadError) {
    return { data: null, error: uploadError };
  }

  const { data } = supabase.storage.from("post-images").getPublicUrl(filePath);

  return { data: data?.publicUrl || null, error: null };
}

export function fetchCommentsByPostId(postId) {
  return supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
}

export function createComment(comment) {
  return supabase.from("comments").insert([comment]);
}

export function deleteCommentById(commentId) {
  return supabase.from("comments").delete().eq("id", commentId);
}

export function fetchPostOwner(postId) {
  return supabase.from("posts").select("user_id").eq("id", postId).single();
}

export function subscribeToFeedChanges({ onPostsChange, onLikesChange }) {
  const postsChannel = supabase
    .channel("posts-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "posts" },
      onPostsChange,
    )
    .subscribe();

  const likesChannel = supabase
    .channel("likes-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "likes" },
      onLikesChange,
    )
    .subscribe();

  return [postsChannel, likesChannel];
}

export function unsubscribeFromFeedChanges(channels) {
  channels.forEach((channel) => supabase.removeChannel(channel));
}
