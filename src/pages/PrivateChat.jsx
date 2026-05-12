import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { supabase } from "../lib/supabase";

import { useAuth } from "../context/AuthContext";

import { ArrowLeft } from "lucide-react";

import { useNavigate } from "react-router-dom";

function PrivateChat() {
  const { id } = useParams();

  const { user } = useAuth();

  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);

  const [message, setMessage] = useState("");

  useEffect(() => {
    getMessages();
    markMessagesAsRead();

    const channel = supabase

      .channel(`chat-${id}`)

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
            const exists = prev.find((msg) => msg.id === payload.new.id);

            if (exists) return prev;

            return [...prev, payload.new];
          });
        },
      )

      .subscribe((status) => {
        console.log("Realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  async function getMessages() {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.log(error);

      return;
    }

    setMessages(data);
  }

  async function sendMessage(e) {
    e.preventDefault();

    if (!message.trim()) return;

    const { error } = await supabase.from("messages").insert([
      {
        conversation_id: id,

        user_id: user.id,

        username: user.email.split("@")[0],

        content: message,
      },
    ]);

    if (error) {
      console.log(error);

      return;
    }

    setMessage("");
  }

  async function markMessagesAsRead() {
    await supabase
      .from("messages")
      .update({
        is_read: true,
      })
      .eq("conversation_id", id)
      .neq("user_id", user.id)
      .eq("is_read", false);
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
      <div
        className="
    flex
    items-center
    gap-4
    mb-8
  "
      >
        <button
          onClick={() => navigate("/inbox")}
          className="
      w-12
      h-12
      rounded-2xl
      bg-white/5
      border
      border-white/10
      flex
      items-center
      justify-center
      hover:border-purple-500
      transition
    "
        >
          <ArrowLeft size={22} />
        </button>

        <div>
          <h1 className="text-3xl font-black">Chat</h1>

          <p className="text-zinc-400">Private conversation</p>
        </div>
      </div>

      <div
        className="
          max-w-4xl
          mx-auto
          flex
          flex-col
          h-[85vh]
        "
      >
        <h1 className="text-5xl font-black mb-10">Private Chat</h1>

        {/* MESSAGES */}
        <div
          className="
            flex-1
            overflow-y-auto
            space-y-4
            bg-white/5
            border
            border-white/10
            rounded-3xl
            p-6
          "
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`
                max-w-[75%]
                p-4
                rounded-2xl
                ${
                  msg.user_id === user.id
                    ? "ml-auto bg-purple-600"
                    : "bg-white/10"
                }
              `}
            >
              <p className="text-sm text-zinc-300 mb-1">{msg.username}</p>

              <p className="text-lg">{msg.content}</p>
            </div>
          ))}
        </div>

        {/* INPUT */}
        <form
          onSubmit={sendMessage}
          className="
            flex
            gap-4
            mt-6
          "
        >
          <input
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="
              flex-1
              bg-white/5
              border
              border-white/10
              rounded-2xl
              px-6
              py-4
              outline-none
            "
          />

          <button
            type="submit"
            className="
              px-8
              rounded-2xl
              bg-gradient-to-r
              from-purple-500
              to-fuchsia-500
              font-bold
            "
          >
            Send
          </button>
        </form>
      </div>
    </section>
  );
}

export default PrivateChat;
