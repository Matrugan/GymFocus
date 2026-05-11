import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { supabase } from "../lib/supabase";

import { useAuth } from "../context/AuthContext";

function Inbox() {

  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);

  useEffect(() => {

    if (user) {

      getConversations();

    }

  }, [user]);

  async function getConversations() {

    // pega participações
    const { data: participations, error } = await supabase
      .from("conversation_participants")
      .select("*")
      .eq("user_id", user.id);

    if (error) {

      console.log(error);

      return;

    }

    if (!participations?.length) {

      setConversations([]);

      return;

    }

    const conversationIds = participations.map(
      (item) => item.conversation_id
    );

    // pega outros participantes
    const { data: participants } = await supabase
      .from("conversation_participants")
      .select("*")
      .in("conversation_id", conversationIds)
      .neq("user_id", user.id);

    const userIds = participants.map(
      (item) => item.user_id
    );

    // pega profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("id", userIds);

    // pega mensagens
    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .in("conversation_id", conversationIds)
      .order("created_at", {
        ascending: false,
      });

    const formatted = participants.map((participant) => {

      const profile = profiles.find(
        (p) => p.id === participant.user_id
      );

      const lastMessage = messages.find(
        (msg) =>
          msg.conversation_id ===
          participant.conversation_id
      );

      const unreadCount = messages.filter(
        (msg) =>
          msg.conversation_id ===
            participant.conversation_id &&
          msg.user_id !== user.id &&
          !msg.is_read
      ).length;

      return {

        conversationId:
          participant.conversation_id,

        profile,

        lastMessage,

        unreadCount,

      };

    });

    setConversations(formatted);

  }

  return (

    <section
      className="
        min-h-screen
        bg-black
        text-white
        p-10
      "
    >

      <div className="max-w-3xl mx-auto">

        <h1 className="text-5xl font-black mb-10">

          Inbox

        </h1>

        <div className="space-y-4">

          {conversations.map((item) => (

            <Link
              key={item.conversationId}
              to={`/chat/${item.conversationId}`}
            >

              <div
                className="
                  bg-white/5
                  border
                  border-white/10
                  rounded-3xl
                  p-5
                  flex
                  items-center
                  gap-5
                  hover:border-purple-500
                  transition
                "
              >

                <div className="relative">

                  <img
                    src={
                      item.profile?.avatar_url ||
                      "https://i.pravatar.cc/150"
                    }
                    alt=""
                    className="
                      w-16
                      h-16
                      rounded-full
                      object-cover
                    "
                  />

                  {item.unreadCount > 0 && (

                    <div
                      className="
                        absolute
                        -top-2
                        -right-2
                        bg-purple-500
                        w-7
                        h-7
                        rounded-full
                        flex
                        items-center
                        justify-center
                        text-sm
                        font-bold
                      "
                    >

                      {item.unreadCount}

                    </div>

                  )}

                </div>

                <div className="flex-1">

                  <h2 className="text-xl font-bold">

                    {item.profile?.username}

                  </h2>

                  <p className="text-zinc-400 truncate">

                    {item.lastMessage?.content}

                  </p>

                </div>

                <div className="text-sm text-zinc-500">

                  {item.lastMessage?.created_at
                    ? new Date(
                        item.lastMessage.created_at
                      ).toLocaleDateString()
                    : ""}

                </div>

              </div>

            </Link>

          ))}

          {conversations.length === 0 && (

            <div
              className="
                bg-white/5
                border
                border-white/10
                rounded-3xl
                p-10
                text-center
                text-zinc-400
              "
            >

              No conversations yet.

            </div>

          )}

        </div>

      </div>

    </section>
  );
}

export default Inbox;