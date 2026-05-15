import { supabase } from "../lib/supabase";

export async function fetchConversationPeer(conversationId, currentUserId) {
  const { data: participants, error } = await supabase
    .from("conversation_participants")
    .select("*")
    .eq("conversation_id", conversationId)
    .neq("user_id", currentUserId);

  if (error) {
    return { data: null, error };
  }

  const peer = participants?.[0];

  if (!peer) {
    return { data: null, error: null };
  }

  return supabase.from("profiles").select("*").eq("id", peer.user_id).single();
}

export function fetchConversationMessages(conversationId) {
  return supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
}

export function markConversationMessagesAsRead(conversationId, currentUserId) {
  return supabase
    .from("messages")
    .update({ is_read: true })
    .eq("conversation_id", conversationId)
    .neq("user_id", currentUserId);
}

export function createMessage(message) {
  return supabase.from("messages").insert([message]);
}

export async function uploadChatImage(userId, image) {
  const fileExt = image.name.split(".").pop();
  const filePath = `${userId}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("chat-images")
    .upload(filePath, image, { upsert: false });

  if (uploadError) {
    return { data: null, error: uploadError };
  }

  const { data } = supabase.storage.from("chat-images").getPublicUrl(filePath);

  return {
    data: data?.publicUrl || null,
    error: null,
  };
}

export async function fetchConversationsForUser(userId) {
  const { data: participations, error } = await supabase
    .from("conversation_participants")
    .select("*")
    .eq("user_id", userId);

  if (error || !participations?.length) {
    return { data: [], error };
  }

  const conversationIds = participations.map((item) => item.conversation_id);

  const { data: participants, error: participantsError } = await supabase
    .from("conversation_participants")
    .select("*")
    .in("conversation_id", conversationIds)
    .neq("user_id", userId);

  if (participantsError || !participants?.length) {
    return { data: [], error: participantsError };
  }

  const userIds = participants.map((item) => item.user_id);

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .in("id", userIds);

  if (profilesError) {
    return { data: [], error: profilesError };
  }

  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("*")
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: false });

  if (messagesError) {
    return { data: [], error: messagesError };
  }

  const conversations = participants
    .map((participant) => {
      const profile = profiles?.find((item) => item.id === participant.user_id);
      const conversationMessages =
        messages?.filter(
          (message) => message.conversation_id === participant.conversation_id,
        ) || [];

      const lastMessage = conversationMessages[0];
      const unreadCount = conversationMessages.filter(
        (message) => message.user_id !== userId && !message.is_read,
      ).length;

      return {
        conversationId: participant.conversation_id,
        profile,
        lastMessage,
        unreadCount,
      };
    })
    .sort((a, b) => {
      const dateA = a.lastMessage?.created_at
        ? new Date(a.lastMessage.created_at)
        : new Date(0);
      const dateB = b.lastMessage?.created_at
        ? new Date(b.lastMessage.created_at)
        : new Date(0);

      return dateB - dateA;
    });

  return { data: conversations, error: null };
}

export function subscribeToConversationMessages(conversationId, onInsert) {
  return supabase
    .channel(`chat-messages-${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      onInsert,
    )
    .subscribe();
}

export function subscribeToInboxMessages(userId, onChange) {
  return supabase
    .channel(`inbox-messages-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "messages",
      },
      onChange,
    )
    .subscribe();
}

export function unsubscribeFromRealtime(channel) {
  return supabase.removeChannel(channel);
}
