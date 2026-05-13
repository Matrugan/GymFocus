import { supabase } from "../lib/supabase";

export async function createNotification({
  userId,
  actorId,
  type,
  message,
  postId = null,
  conversationId = null,
}) {
  if (!userId || !actorId || !type || !message) return;

  if (userId === actorId) return;

  const { error } = await supabase.from("notifications").insert([
    {
      user_id: userId,
      actor_id: actorId,
      type,
      message,
      post_id: postId,
      conversation_id: conversationId,
      is_read: false,
    },
  ]);

  if (error) {
    console.log("Notification error:", error);
  }
}