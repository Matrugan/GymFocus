import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabase";

import { useAuth } from "../context/AuthContext";

import {
  ArrowLeft,
  Search,
  MessageCircle,
  UserRound,
} from "lucide-react";

import { motion } from "framer-motion";

import ThemeToggle from "../components/ThemeToggle";

function Inbox() {
  const { user } = useAuth();

  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getConversations();
    }
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`inbox-messages-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          getConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  async function getConversations() {
    if (!user?.id) return;

    setLoading(true);

    const { data: participations, error } = await supabase
      .from("conversation_participants")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    if (!participations?.length) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const conversationIds = participations.map(
      (item) => item.conversation_id
    );

    const { data: participants, error: participantsError } = await supabase
      .from("conversation_participants")
      .select("*")
      .in("conversation_id", conversationIds)
      .neq("user_id", user.id);

    if (participantsError) {
      console.log(participantsError);
      setLoading(false);
      return;
    }

    if (!participants?.length) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const userIds = participants.map((item) => item.user_id);

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .in("id", userIds);

    if (profilesError) {
      console.log(profilesError);
      setLoading(false);
      return;
    }

    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .in("conversation_id", conversationIds)
      .order("created_at", {
        ascending: false,
      });

    if (messagesError) {
      console.log(messagesError);
      setLoading(false);
      return;
    }

    const formatted = participants.map((participant) => {
      const profile = profiles?.find(
        (item) => item.id === participant.user_id
      );

      const conversationMessages =
        messages?.filter(
          (message) => message.conversation_id === participant.conversation_id
        ) || [];

      const lastMessage = conversationMessages[0];

      const unreadCount = conversationMessages.filter(
        (message) =>
          message.user_id !== user.id &&
          !message.is_read
      ).length;

      return {
        conversationId: participant.conversation_id,
        profile,
        lastMessage,
        unreadCount,
      };
    });

    const sorted = formatted.sort((a, b) => {
      const dateA = a.lastMessage?.created_at
        ? new Date(a.lastMessage.created_at)
        : new Date(0);

      const dateB = b.lastMessage?.created_at
        ? new Date(b.lastMessage.created_at)
        : new Date(0);

      return dateB - dateA;
    });

    setConversations(sorted);

    setLoading(false);
  }

  const filteredConversations = conversations.filter((item) =>
    item.profile?.username
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  function formatTime(date) {
    if (!date) return "";

    const messageDate = new Date(date);

    const today = new Date();

    const isToday =
      messageDate.toDateString() === today.toDateString();

    if (isToday) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return messageDate.toLocaleDateString([], {
      day: "2-digit",
      month: "short",
    });
  }

  function getLastMessagePreview(item) {
    if (!item.lastMessage?.content) {
      return "Start a conversation";
    }

    const isMine = item.lastMessage.user_id === user.id;

    return `${isMine ? "You: " : ""}${item.lastMessage.content}`;
  }

  return (
    <section
      className="
        min-h-screen
        bg-zinc-50
        text-zinc-950
        px-6
        py-10
        relative
        overflow-hidden
        transition-colors

        dark:bg-black
        dark:text-white
      "
    >
      {/* BACKGROUND GLOW */}
      <div
        className="
          absolute
          top-0
          left-1/2
          -translate-x-1/2
          w-[500px]
          h-[500px]
          bg-purple-500/10
          blur-[140px]
          rounded-full
          pointer-events-none
        "
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* TOP BAR */}
        <div
          className="
            flex
            items-center
            justify-between
            gap-4
            mb-10
          "
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="
              flex
              items-center
              gap-2
              text-zinc-600
              hover:text-zinc-950
              transition
              bg-white
              border
              border-zinc-200
              px-4
              py-3
              rounded-2xl
              shadow-sm

              dark:text-zinc-400
              dark:hover:text-white
              dark:bg-white/5
              dark:border-white/10
            "
          >
            <ArrowLeft size={18} />
            Dashboard
          </button>

          <ThemeToggle />
        </div>

        {/* HEADER */}
        <div
          className="
            flex
            items-center
            justify-between
            flex-wrap
            gap-5
            mb-10
          "
        >
          <div>
            <h1 className="text-5xl font-black">
              Inbox
            </h1>

            <p className="text-zinc-600 dark:text-zinc-500 mt-2">
              Your conversations
            </p>
          </div>

          {/* SEARCH */}
          <div
            className="
              flex
              items-center
              gap-3
              bg-white
              border
              border-zinc-200
              rounded-2xl
              px-5
              py-4
              w-full
              md:w-[350px]
              shadow-sm
              transition-colors

              dark:bg-white/5
              dark:border-white/10
              dark:backdrop-blur-xl
            "
          >
            <Search size={20} className="text-zinc-500" />

            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                bg-transparent
                outline-none
                w-full
                text-zinc-950
                placeholder:text-zinc-500

                dark:text-white
              "
            />
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="
                  h-28
                  rounded-3xl
                  bg-white
                  border
                  border-zinc-200
                  animate-pulse
                  shadow-sm

                  dark:bg-white/5
                  dark:border-white/10
                "
              />
            ))}
          </div>
        )}

        {/* CONVERSATIONS */}
        {!loading && (
          <div className="space-y-4">
            {filteredConversations.map((item, index) => (
              <motion.div
                key={item.conversationId}
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.05,
                }}
              >
                <Link to={`/chat/${item.conversationId}`}>
                  <div
                    className="
                      bg-white
                      border
                      border-zinc-200
                      rounded-3xl
                      p-5
                      flex
                      items-center
                      gap-5
                      hover:border-purple-500
                      hover:scale-[1.01]
                      transition
                      shadow-sm

                      dark:bg-zinc-900/70
                      dark:border-white/10
                      dark:hover:bg-zinc-900
                      dark:backdrop-blur-xl
                    "
                  >
                    {/* AVATAR */}
                    <div className="relative shrink-0">
                      {item.profile?.avatar_url ? (
                        <img
                          src={item.profile.avatar_url}
                          alt=""
                          className="
                            w-16
                            h-16
                            rounded-full
                            object-cover
                            border
                            border-purple-500/30
                          "
                        />
                      ) : (
                        <div
                          className="
                            w-16
                            h-16
                            rounded-full
                            bg-purple-500/10
                            border
                            border-purple-500/20
                            text-purple-500
                            flex
                            items-center
                            justify-center
                          "
                        >
                          <UserRound size={28} />
                        </div>
                      )}

                      <div
                        className={`
                          absolute
                          bottom-1
                          right-1
                          w-4
                          h-4
                          rounded-full
                          border-2
                          border-white

                          dark:border-zinc-900

                          ${
                            item.profile?.online
                              ? "bg-green-500"
                              : "bg-zinc-500"
                          }
                        `}
                      />

                      {item.unreadCount > 0 && (
                        <div
                          className="
                            absolute
                            -top-2
                            -right-2
                            bg-gradient-to-r
                            from-purple-500
                            to-fuchsia-500
                            min-w-[28px]
                            h-7
                            rounded-full
                            flex
                            items-center
                            justify-center
                            text-xs
                            font-bold
                            px-2
                            text-white
                            border-2
                            border-white

                            dark:border-zinc-900
                          "
                        >
                          {item.unreadCount > 9 ? "9+" : item.unreadCount}
                        </div>
                      )}
                    </div>

                    {/* INFO */}
                    <div className="flex-1 min-w-0">
                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-4
                        "
                      >
                        <div className="min-w-0">
                          <h2
                            className="
                              text-xl
                              font-bold
                              truncate
                            "
                          >
                            {item.profile?.username || "Unknown User"}
                          </h2>

                          <p
                            className={`
                              text-xs
                              mt-1

                              ${
                                item.profile?.online
                                  ? "text-green-500"
                                  : "text-zinc-500"
                              }
                            `}
                          >
                            {item.profile?.online ? "Online" : "Offline"}
                          </p>
                        </div>

                        <span
                          className="
                            text-xs
                            text-zinc-500
                            whitespace-nowrap
                          "
                        >
                          {formatTime(item.lastMessage?.created_at)}
                        </span>
                      </div>

                      <div
                        className="
                          flex
                          items-center
                          gap-2
                          mt-3
                          text-zinc-600

                          dark:text-zinc-400
                        "
                      >
                        <MessageCircle size={15} className="shrink-0" />

                        <p className="truncate">
                          {getLastMessagePreview(item)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}

            {/* EMPTY */}
            {filteredConversations.length === 0 && (
              <div
                className="
                  bg-white
                  border
                  border-zinc-200
                  rounded-3xl
                  p-14
                  text-center
                  shadow-sm

                  dark:bg-zinc-900/70
                  dark:border-white/10
                  dark:backdrop-blur-xl
                "
              >
                <div
                  className="
                    w-20
                    h-20
                    mx-auto
                    rounded-full
                    bg-purple-500/10
                    border
                    border-purple-500/20
                    text-purple-500
                    flex
                    items-center
                    justify-center
                    mb-6
                  "
                >
                  <MessageCircle size={34} />
                </div>

                <h2 className="text-2xl font-bold">
                  No conversations found
                </h2>

                <p className="text-zinc-500 mt-3">
                  Start chatting with other athletes.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default Inbox;