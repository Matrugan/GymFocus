import { useEffect, useRef, useState } from "react";

import { supabase } from "../lib/supabase";

import { useAuth } from "../context/AuthContext";

import { useNavigate, useParams, Link } from "react-router-dom";

import {
  ArrowLeft,
  Send,
  Smile,
  Phone,
  Video,
  Info,
  UserRound,
  ImagePlus,
  X,
  MessageCircle,
} from "lucide-react";

import EmojiPicker from "emoji-picker-react";

import { motion, AnimatePresence } from "framer-motion";

import ThemeToggle from "../components/layout/ThemeToggle";

import toast from "react-hot-toast";

import { createNotification } from "../utils/notificationSystem";
import { reportError } from "../utils/errorHandler";

function Chat() {
  const { user } = useAuth();

  const navigate = useNavigate();

  const { id } = useParams();

  const messagesEndRef = useRef(null);

  const imageInputRef = useRef(null);

  const [messages, setMessages] = useState([]);

  const [newMessage, setNewMessage] = useState("");

  const [showEmoji, setShowEmoji] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  const [image, setImage] = useState(null);

  const [sending, setSending] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && id) {
      getSelectedUser();
      getMessages();
      markMessagesAsRead();
    }
  }, [user, id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`chat-messages-${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${id}`,
        },
        (payload) => {
          setMessages((prev) => {
            const exists = prev.some(
              (message) => message.id === payload.new.id,
            );

            if (exists) return prev;

            return [...prev, payload.new];
          });

          if (payload.new.user_id !== user?.id) {
            markMessagesAsRead();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, user?.id]);

  async function getSelectedUser() {
    const { data: participants, error } = await supabase
      .from("conversation_participants")
      .select("*")
      .eq("conversation_id", id)
      .neq("user_id", user.id);

    if (error) {
      reportError(error);
      return;
    }

    const otherParticipant = participants?.[0];

    if (!otherParticipant) return;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", otherParticipant.user_id)
      .single();

    if (profileError) {
      reportError(profileError);
      return;
    }

    setSelectedUser(profile);
  }

  async function getMessages() {
    setLoading(true);

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      reportError(error);
      setLoading(false);
      return;
    }

    setMessages(data || []);

    setLoading(false);
  }

  async function markMessagesAsRead() {
    if (!user?.id || !id) return;

    await supabase
      .from("messages")
      .update({
        is_read: true,
      })
      .eq("conversation_id", id)
      .neq("user_id", user.id);
  }

  function handleImageChange(e) {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("Image is too large. Maximum size is 5MB.");
      return;
    }

    setImage(selectedFile);
  }

  async function uploadChatImage() {
    if (!image) return null;

    const fileExt = image.name.split(".").pop();

    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from("chat-images")
      .upload(filePath, image, {
        upsert: false,
      });

    if (uploadError) {
      reportError(uploadError, "Erro ao enviar imagem.");
      return null;
    }

    const { data } = supabase.storage
      .from("chat-images")
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      toast.error("Não foi possível gerar o link da imagem.");
      return null;
    }

    return data.publicUrl;
  }

  async function sendMessage() {
    if (!newMessage.trim() && !image) return;

    if (!user?.id || !id) return;

    setSending(true);

    let image_url = null;

    if (image) {
      image_url = await uploadChatImage();

      if (!image_url) {
        setSending(false);
        return;
      }
    }

    const { error } = await supabase.from("messages").insert([
      {
        conversation_id: id,
        user_id: user.id,
        username: user.email,
        content: newMessage.trim(),
        image_url,
        is_read: false,
      },
    ]);

    if (error) {
      reportError(error, "Erro ao enviar mensagem.");
      setSending(false);
      return;
    }

    if (selectedUser?.id) {
      await createNotification({
        userId: selectedUser.id,
        actorId: user.id,
        type: "message",
        message: "sent you a message.",
        conversationId: Number(id),
      });
    }

    setNewMessage("");
    setImage(null);
    setShowEmoji(false);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    setSending(false);
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }

  function formatTime(date) {
    if (!date) return "";

    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function removeSelectedImage() {
    setImage(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }

  return (
    <section
      className="
        h-screen
        bg-zinc-50
        text-zinc-950
        flex
        flex-col
        overflow-hidden
        transition-colors

        dark:bg-black
        dark:text-white
      "
    >
      {/* HEADER */}
      <header
        className="
          min-h-[76px]
          sm:min-h-[84px]
          border-b
          border-zinc-200
          px-3
          sm:px-5
          flex
          items-center
          justify-between
          gap-3
          bg-white/90
          backdrop-blur-xl
          sticky
          top-0
          z-50
          transition-colors

          dark:bg-black/80
          dark:border-white/10
        "
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button
            onClick={() => navigate("/inbox")}
            className="
              hover:bg-zinc-100
              transition
              p-2.5
              sm:p-3
              rounded-2xl
              border
              border-zinc-200
              shrink-0

              dark:hover:bg-white/10
              dark:border-white/10
            "
          >
            <ArrowLeft size={21} />
          </button>

          <div className="relative shrink-0">
            {selectedUser?.avatar_url ? (
              <img
                src={selectedUser.avatar_url}
                alt=""
                className="
                  w-10
                  h-10
                  sm:w-12
                  sm:h-12
                  rounded-full
                  object-cover
                  border
                  border-purple-500/40
                "
              />
            ) : (
              <div
                className="
                  w-10
                  h-10
                  sm:w-12
                  sm:h-12
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
                <UserRound size={21} />
              </div>
            )}

            <div
              className={`
                absolute
                bottom-0
                right-0
                w-3
                h-3
                sm:w-3.5
                sm:h-3.5
                rounded-full
                border-2
                border-white

                dark:border-black

                ${selectedUser?.online ? "bg-green-500" : "bg-zinc-500"}
              `}
            />
          </div>

          <div className="min-w-0">
            <Link
              to={
                selectedUser?.username
                  ? `/profile/${selectedUser.username}`
                  : "#"
              }
            >
              <h2
                className="
                  font-bold
                  truncate
                  hover:text-purple-500
                  transition
                  text-sm
                  sm:text-base
                  max-w-[130px]
                  xs:max-w-[170px]
                  sm:max-w-[260px]
                "
              >
                {selectedUser?.username || "Chat"}
              </h2>
            </Link>

            <p
              className={`
                text-[11px]
                sm:text-xs
                truncate

                ${selectedUser?.online ? "text-green-500" : "text-zinc-500"}
              `}
            >
              {selectedUser?.online ? "Active now" : "Offline"}
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeToggle />

          <HeaderIcon>
            <Phone size={21} />
          </HeaderIcon>

          <HeaderIcon>
            <Video size={23} />
          </HeaderIcon>

          <HeaderIcon>
            <Info size={23} />
          </HeaderIcon>
        </div>
      </header>

      {/* MESSAGES */}
      <main
        className="
          flex-1
          overflow-y-auto
          px-3
          sm:px-4
          md:px-8
          py-4
          sm:py-6
        "
      >
        <div
          className="
            w-full
            max-w-4xl
            mx-auto
            space-y-3
            sm:space-y-4
            min-w-0
          "
        >
          {loading && (
            <div className="space-y-3 sm:space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="
                    h-14
                    sm:h-16
                    w-3/4
                    sm:w-2/3
                    rounded-3xl
                    bg-white
                    border
                    border-zinc-200
                    animate-pulse

                    dark:bg-white/5
                    dark:border-white/10
                  "
                />
              ))}
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div
              className="
                mt-16
                sm:mt-20
                text-center
                text-zinc-500
                px-4
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
                <MessageCircle size={32} />
              </div>

              <h2
                className="
                  text-xl
                  sm:text-2xl
                  font-black
                  text-zinc-950

                  dark:text-white
                "
              >
                Start the conversation
              </h2>

              <p className="mt-2 text-sm sm:text-base">
                Send your first message to this athlete.
              </p>
            </div>
          )}

          <AnimatePresence>
            {messages.map((message) => {
              const isMine = message.user_id === user.id;

              return (
                <motion.div
                  key={message.id}
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                  className={`
                    flex

                    ${isMine ? "justify-end" : "justify-start"}
                  `}
                >
                  <div
                    className={`
                      max-w-[88%]
                      sm:max-w-[78%]
                      rounded-[22px]
                      sm:rounded-[28px]
                      px-4
                      sm:px-5
                      py-3
                      relative
                      shadow-sm
                      border
                      min-w-0

                      ${
                        isMine
                          ? `
                            bg-gradient-to-r
                            from-purple-500
                            to-fuchsia-500
                            text-white
                            border-transparent
                          `
                          : `
                            bg-white
                            text-zinc-950
                            border-zinc-200

                            dark:bg-zinc-900
                            dark:text-white
                            dark:border-white/10
                          `
                      }
                    `}
                  >
                    {!isMine && (
                      <p
                        className="
                          text-xs
                          text-purple-500
                          font-bold
                          mb-2
                          truncate
                        "
                      >
                        {selectedUser?.username || message.username}
                      </p>
                    )}

                    {message.content && (
                      <p
                        className="
                          text-sm
                          sm:text-[15px]
                          leading-relaxed
                          break-words
                          whitespace-pre-wrap
                        "
                      >
                        {message.content}
                      </p>
                    )}

                    {message.image_url && (
                      <img
                        src={message.image_url}
                        alt="Imagem enviada"
                        className="
                          mt-3
                          rounded-2xl
                          max-h-[260px]
                          sm:max-h-[350px]
                          max-w-full
                          object-cover
                          border
                          border-white/20
                        "
                      />
                    )}

                    <div
                      className="
                        flex
                        justify-end
                        items-center
                        gap-2
                        mt-2
                      "
                    >
                      <span
                        className={`
                          text-[10px]

                          ${isMine ? "text-white/70" : "text-zinc-500"}
                        `}
                      >
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* INPUT */}
      <footer
        className="
          border-t
          border-zinc-200
          bg-white/90
          backdrop-blur-xl
          p-3
          sm:p-4
          transition-colors

          dark:bg-black/90
          dark:border-white/10
        "
      >
        <div
          className="
            w-full
            max-w-4xl
            mx-auto
            relative
            min-w-0
          "
        >
          {/* IMAGE PREVIEW */}
          {image && (
            <div
              className="
                mb-3
                relative
                w-fit
                max-w-[220px]
                sm:max-w-xs
                rounded-2xl
                overflow-hidden
                border
                border-zinc-200
                bg-zinc-100

                dark:border-white/10
                dark:bg-zinc-900
              "
            >
              <img
                src={URL.createObjectURL(image)}
                alt=""
                className="
                  max-h-32
                  sm:max-h-40
                  object-cover
                "
              />

              <button
                type="button"
                onClick={removeSelectedImage}
                className="
                  absolute
                  top-2
                  right-2
                  w-8
                  h-8
                  rounded-full
                  bg-black/60
                  text-white
                  flex
                  items-center
                  justify-center
                  hover:bg-red-500
                  transition
                "
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* EMOJI PICKER */}
          {showEmoji && (
            <div
              className="
                absolute
                bottom-20
                left-0
                z-50
                max-w-[calc(100vw-1.5rem)]
                overflow-hidden
                rounded-2xl
              "
            >
              <EmojiPicker
                width={320}
                height={400}
                theme={
                  document.documentElement.classList.contains("dark")
                    ? "dark"
                    : "light"
                }
                onEmojiClick={(emojiData) =>
                  setNewMessage((prev) => prev + emojiData.emoji)
                }
              />
            </div>
          )}

          <div
            className="
              flex
              items-center
              gap-2
              sm:gap-3
              bg-zinc-100
              border
              border-zinc-200
              rounded-3xl
              sm:rounded-full
              px-3
              sm:px-4
              py-2.5
              sm:py-3
              transition-colors
              min-w-0

              dark:bg-zinc-900
              dark:border-white/10
            "
          >
            <button
              type="button"
              onClick={() => setShowEmoji(!showEmoji)}
              className="
                text-zinc-500
                hover:text-yellow-500
                transition
                shrink-0
              "
            >
              <Smile size={22} />
            </button>

            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="
                text-zinc-500
                hover:text-purple-500
                transition
                shrink-0
              "
            >
              <ImagePlus size={22} />
            </button>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            <input
              type="text"
              placeholder="Message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              className="
                flex-1
                min-w-0
                bg-transparent
                outline-none
                text-zinc-950
                placeholder:text-zinc-500
                text-sm
                sm:text-base

                dark:text-white
              "
            />

            <button
              type="button"
              onClick={sendMessage}
              disabled={sending || (!newMessage.trim() && !image)}
              className="
                w-10
                h-10
                sm:w-11
                sm:h-11
                rounded-full
                bg-gradient-to-r
                from-purple-500
                to-fuchsia-500
                text-white
                flex
                items-center
                justify-center
                hover:scale-110
                transition
                disabled:opacity-40
                disabled:hover:scale-100
                shrink-0
              "
            >
              <Send size={17} />
            </button>
          </div>
        </div>
      </footer>
    </section>
  );
}

function HeaderIcon({ children }) {
  return (
    <button
      type="button"
      className="
        hidden
        sm:flex
        w-11
        h-11
        rounded-2xl
        bg-zinc-100
        border
        border-zinc-200
        items-center
        justify-center
        text-zinc-700
        hover:text-purple-500
        hover:border-purple-500
        transition

        dark:bg-white/5
        dark:border-white/10
        dark:text-zinc-300
      "
    >
      {children}
    </button>
  );
}

export default Chat;
