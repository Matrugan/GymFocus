import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  ArrowLeft,
  Search,
  MessageCircle,
  UserRound,
} from "lucide-react";

import { motion } from "framer-motion";

import ThemeToggle from "../components/layout/ThemeToggle";
import { reportError } from "../utils/errorHandler";
import {
  fetchConversationsForUser,
  subscribeToInboxMessages,
  unsubscribeFromRealtime,
} from "../services/chatService";

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

    const channel = subscribeToInboxMessages(user.id, () => {
      getConversations();
    });

    return () => {
      unsubscribeFromRealtime(channel);
    };
  }, [user?.id]);

  async function getConversations() {
    if (!user?.id) return;

    setLoading(true);

    const { data, error } = await fetchConversationsForUser(user.id);

    if (error) {
      reportError(error);
      setLoading(false);
      return;
    }

    setConversations(data || []);

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

    const isToday = messageDate.toDateString() === today.toDateString();

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
    if (!item.lastMessage?.content && !item.lastMessage?.image_url) {
      return "Start a conversation";
    }

    const isMine = item.lastMessage?.user_id === user.id;

    if (item.lastMessage?.image_url && !item.lastMessage?.content) {
      return `${isMine ? "You: " : ""}Sent an image`;
    }

    return `${isMine ? "You: " : ""}${item.lastMessage.content}`;
  }

  return (
    <section
      className="
        min-h-screen
        bg-zinc-50
        text-zinc-950
        px-4
        sm:px-6
        py-6
        sm:py-10
        relative
        overflow-x-hidden
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
          w-[420px]
          h-[420px]
          sm:w-[500px]
          sm:h-[500px]
          bg-purple-500/10
          blur-[120px]
          sm:blur-[140px]
          rounded-full
          pointer-events-none
        "
      />

      <div
        className="
          relative
          z-10
          w-full
          max-w-4xl
          mx-auto
          min-w-0
        "
      >
        {/* TOP BAR */}
        <div
          className="
            flex
            items-center
            justify-between
            gap-4
            mb-8
            sm:mb-10
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
              text-sm
              sm:text-base

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
            items-start
            sm:items-center
            justify-between
            flex-col
            sm:flex-row
            gap-5
            mb-8
            sm:mb-10
          "
        >
          <div className="min-w-0">
            <h1
              className="
                text-4xl
                sm:text-5xl
                font-black
                break-words
              "
            >
              Inbox
            </h1>

            <p className="text-zinc-600 dark:text-zinc-500 mt-2 text-sm sm:text-base">
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
              px-4
              sm:px-5
              py-3
              sm:py-4
              w-full
              sm:w-[350px]
              shadow-sm
              transition-colors

              dark:bg-white/5
              dark:border-white/10
              dark:backdrop-blur-xl
            "
          >
            <Search size={20} className="text-zinc-500 shrink-0" />

            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                bg-transparent
                outline-none
                w-full
                min-w-0
                text-zinc-950
                placeholder:text-zinc-500
                text-sm
                sm:text-base

                dark:text-white
              "
            />
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="space-y-3 sm:space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="
                  h-24
                  sm:h-28
                  rounded-2xl
                  sm:rounded-3xl
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
          <div className="space-y-3 sm:space-y-4">
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
                      rounded-2xl
                      sm:rounded-3xl
                      p-4
                      sm:p-5
                      flex
                      items-center
                      gap-3
                      sm:gap-5
                      hover:border-purple-500
                      hover:scale-[1.01]
                      transition
                      shadow-sm
                      min-w-0

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
                            w-13
                            h-13
                            sm:w-16
                            sm:h-16
                            rounded-full
                            object-cover
                            border
                            border-purple-500/30
                          "
                        />
                      ) : (
                        <div
                          className="
                            w-13
                            h-13
                            sm:w-16
                            sm:h-16
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
                          <UserRound size={25} />
                        </div>
                      )}

                      <div
                        className={`
                          absolute
                          bottom-1
                          right-1
                          w-3.5
                          h-3.5
                          sm:w-4
                          sm:h-4
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
                            min-w-[24px]
                            sm:min-w-[28px]
                            h-6
                            sm:h-7
                            rounded-full
                            flex
                            items-center
                            justify-center
                            text-[10px]
                            sm:text-xs
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
                          items-start
                          justify-between
                          gap-3
                        "
                      >
                        <div className="min-w-0">
                          <h2
                            className="
                              text-base
                              sm:text-xl
                              font-bold
                              truncate
                            "
                          >
                            {item.profile?.username || "Unknown User"}
                          </h2>

                          <p
                            className={`
                              text-[11px]
                              sm:text-xs
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
                            text-[11px]
                            sm:text-xs
                            text-zinc-500
                            whitespace-nowrap
                            shrink-0
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
                          mt-2
                          sm:mt-3
                          text-zinc-600

                          dark:text-zinc-400
                        "
                      >
                        <MessageCircle size={15} className="shrink-0" />

                        <p
                          className="
                            truncate
                            text-sm
                            sm:text-base
                          "
                        >
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
                  p-8
                  sm:p-14
                  text-center
                  shadow-sm

                  dark:bg-zinc-900/70
                  dark:border-white/10
                  dark:backdrop-blur-xl
                "
              >
                <div
                  className="
                    w-16
                    h-16
                    sm:w-20
                    sm:h-20
                    mx-auto
                    rounded-full
                    bg-purple-500/10
                    border
                    border-purple-500/20
                    text-purple-500
                    flex
                    items-center
                    justify-center
                    mb-5
                    sm:mb-6
                  "
                >
                  <MessageCircle size={30} />
                </div>

                <h2 className="text-xl sm:text-2xl font-bold">
                  No conversations found
                </h2>

                <p className="text-zinc-500 mt-3 text-sm sm:text-base">
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
