import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

import {
  Bell,
  X,
  UserPlus,
  Heart,
  MessageCircle,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    getNotifications();

    const channel = supabase
      .channel(`notifications-channel-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          getNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  async function getNotifications() {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      })
      .limit(10);

    if (error) {
      console.log(error);
      return;
    }

    setNotifications(data || []);
  }

  async function markAsRead(notificationId) {
    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("id", notificationId);

    if (error) {
      console.log(error);
      return;
    }

    getNotifications();
  }

  async function markAllAsRead() {
    if (!user?.id) return;

    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) {
      console.log(error);
      return;
    }

    getNotifications();
  }

  function getIcon(type) {
    if (type === "follow") {
      return <UserPlus size={18} />;
    }

    if (type === "like") {
      return <Heart size={18} />;
    }

    if (type === "comment") {
      return <MessageCircle size={18} />;
    }

    return <Bell size={18} />;
  }

  function formatTime(date) {
    if (!date) return "";

    const now = new Date();

    const notificationDate = new Date(date);

    const diffInMinutes = Math.floor(
      (now - notificationDate) / 1000 / 60
    );

    if (diffInMinutes < 1) return "now";

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);

    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);

    return `${diffInDays}d ago`;
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  return (
    <div className="relative">
      {/* BELL BUTTON */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="
          relative
          flex
          items-center
          justify-center
          w-12
          h-12
          rounded-2xl
          bg-white
          text-zinc-950
          border
          border-zinc-200
          hover:border-purple-500
          transition
          shadow-sm

          dark:bg-white/5
          dark:text-white
          dark:border-white/10
        "
      >
        <Bell size={20} />

        {unreadCount > 0 && (
          <span
            className="
              absolute
              -top-2
              -right-2
              min-w-[22px]
              h-[22px]
              px-1.5
              rounded-full
              bg-gradient-to-r
              from-purple-500
              to-fuchsia-500
              text-white
              text-xs
              font-black
              flex
              items-center
              justify-center
              border-2
              border-white

              dark:border-black
            "
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN */}
      <AnimatePresence>
        {open && (
          <>
            <div
              onClick={() => setOpen(false)}
              className="
                fixed
                inset-0
                z-40
              "
            />

            <motion.div
              initial={{
                opacity: 0,
                y: 12,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 12,
                scale: 0.96,
              }}
              transition={{
                duration: 0.18,
              }}
              className="
                absolute
                right-0
                mt-4
                w-[360px]
                max-w-[calc(100vw-2rem)]
                bg-white
                text-zinc-950
                border
                border-zinc-200
                rounded-3xl
                shadow-2xl
                z-50
                overflow-hidden

                dark:bg-zinc-950
                dark:text-white
                dark:border-white/10
              "
            >
              {/* HEADER */}
              <div
                className="
                  p-5
                  border-b
                  border-zinc-200
                  flex
                  items-center
                  justify-between
                  gap-4

                  dark:border-white/10
                "
              >
                <div>
                  <h3 className="text-xl font-black">
                    Notifications
                  </h3>

                  <p className="text-zinc-500 text-sm mt-1">
                    {unreadCount > 0
                      ? `${unreadCount} unread`
                      : "You're all caught up"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="
                        text-xs
                        font-bold
                        text-purple-500
                        hover:text-purple-400
                        transition
                      "
                    >
                      Mark all
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="
                      w-9
                      h-9
                      rounded-xl
                      bg-zinc-100
                      text-zinc-600
                      flex
                      items-center
                      justify-center
                      hover:bg-red-500/10
                      hover:text-red-500
                      transition

                      dark:bg-white/5
                      dark:text-zinc-400
                    "
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* LIST */}
              <div
                className="
                  max-h-[420px]
                  overflow-y-auto
                  p-3
                  space-y-2
                "
              >
                {notifications.length === 0 && (
                  <div className="p-8 text-center">
                    <div
                      className="
                        w-16
                        h-16
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
                      "
                    >
                      <Bell size={28} />
                    </div>

                    <h4 className="font-black text-lg">
                      No notifications yet
                    </h4>

                    <p className="text-zinc-500 text-sm mt-2">
                      Activity from your profile will appear here.
                    </p>
                  </div>
                )}

                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => markAsRead(notification.id)}
                    className={`
                      w-full
                      text-left
                      rounded-2xl
                      p-4
                      flex
                      items-start
                      gap-3
                      border
                      transition

                      ${
                        notification.is_read
                          ? `
                            bg-zinc-50
                            border-zinc-200
                            hover:border-purple-500/40

                            dark:bg-black/30
                            dark:border-white/10
                          `
                          : `
                            bg-purple-500/10
                            border-purple-500/20
                            hover:border-purple-500/40
                          `
                      }
                    `}
                  >
                    <div
                      className="
                        w-10
                        h-10
                        rounded-2xl
                        bg-gradient-to-r
                        from-purple-500
                        to-fuchsia-500
                        text-white
                        flex
                        items-center
                        justify-center
                        shrink-0
                      "
                    >
                      {getIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className="
                          text-sm
                          font-semibold
                          leading-relaxed
                          text-zinc-800

                          dark:text-zinc-200
                        "
                      >
                        {notification.message || "New notification"}
                      </p>

                      <p className="text-xs text-zinc-500 mt-1">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>

                    {!notification.is_read && (
                      <span
                        className="
                          w-2.5
                          h-2.5
                          rounded-full
                          bg-purple-500
                          mt-2
                          shrink-0
                        "
                      />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationBell;