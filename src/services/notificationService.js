import { supabase } from "../lib/supabase";

export function fetchNotifications(userId) {
  return supabase
    .from("notifications")
    .select(
      `
        *,
        actor:profiles!notifications_actor_id_fkey (
          id,
          username,
          avatar_url
        )
      `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
}

export function markNotificationAsRead(notificationId) {
  return supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);
}

export function markUserNotificationsAsRead(userId) {
  return supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);
}

export function deleteNotificationById(notificationId) {
  return supabase.from("notifications").delete().eq("id", notificationId);
}

export function subscribeToNotifications(userId, onChange) {
  return supabase
    .channel(`notifications-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      onChange,
    )
    .subscribe();
}

export function unsubscribeFromNotifications(channel) {
  return supabase.removeChannel(channel);
}
