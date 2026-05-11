import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

import { useAuth } from "../context/AuthContext";

import { Link } from "react-router-dom";

function Chat() {
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);

  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    getMessages();
  }, []);

  async function getMessages() {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.log(error);

      return;
    }

    setMessages(data);
  }

  async function sendMessage() {
    if (!newMessage.trim()) return;

    const { error } = await supabase.from("messages").insert([
      {
        user_id: user.id,
        username: user.email,
        content: newMessage,
      },
    ]);

    if (error) {
      console.log(error);

      return;
    }

    setNewMessage("");
  }

  useEffect(() => {
    const channel = supabase
      .channel("messages-realtime")

      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },

        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        },
      )

      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section className="min-h-screen bg-black text-white p-10">
      <h1 className="text-5xl font-black mb-10">Messages</h1>

      <div
        className="
    mb-10
    flex
    gap-4
  "
      >
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="
      flex-1
      bg-white/5
      border
      border-white/10
      rounded-2xl
      px-5
      py-4
      outline-none
    "
        />

        <button
          onClick={sendMessage}
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
      </div>
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className="
              bg-white/5
              border
              border-white/10
              rounded-2xl
              p-5
            "
          >
            <h3 className="font-bold text-purple-400">
              <Link
                to={`/profile/${message.username}`}
                className="
    font-bold
    hover:text-purple-400
  "
              >
                {message.username}
              </Link>
            </h3>

            <p className="mt-2 text-zinc-300">{message.content}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Chat;
