import { useEffect, useState } from "react";

import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Mail,
  CheckCheck,
  Trash2,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import { Link } from "react-router-dom";
import { reportError } from "../../utils/errorHandler";
import {
  deleteNotificationById,
  fetchNotifications,
  markNotificationAsRead,
  markUserNotificationsAsRead,
  subscribeToNotifications,
  unsubscribeFromNotifications,
} from "../../services/notificationService";

function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    getNotifications();

    const channel = subscribeToNotifications(user.id, () => {
      getNotifications();
    });

    return () => {
      unsubscribeFromNotifications(channel);
    };
  }, [user?.id]);

  async function getNotifications() {
    const { data, error } = await fetchNotifications(user.id);

    if (error) {
      reportError(error);
      return;
    }

    setNotifications(data || []);
  }

  async function markAsRead(notificationId) {
    const { error } = await markNotificationAsRead(notificationId);

    if (error) {
      reportError(error);
      return;
    }

    getNotifications();
  }

  async function markAllAsRead() {
    const { error } = await markUserNotificationsAsRead(user.id);

    if (error) {
      reportError(error);
      return;
    }

    getNotifications();
  }

  async function deleteNotification(notificationId) {
    const { error } = await deleteNotificationById(notificationId);

    if (error) {
      reportError(error);
      return;
    }

    getNotifications();
  }

  function getIcon(type) {
    if (type === "like") {
      return <Heart size={17} />;
    }

    if (type === "comment") {
      return <MessageCircle size={17} />;
    }

    if (type === "follow") {
      return <UserPlus size={17} />;
    }

    if (type === "message") {
      return <Mail size={17} />;
    }

    return <Bell size={17} />;
  }

  function getNotificationLink(notification) {
    if (notification.type === "message" && notification.conversation_id) {
      return `/chat/${notification.conversation_id}`;
    }

    if (notification.actor?.username) {
      return `/profile/${notification.actor.username}`;
    }

    return "/dashboard";
  }

  function formatTime(date) {
    if (!date) return "";

    return new Date(date).toLocaleDateString([], {
      day: "2-digit",
      month: "short",
    });
  }

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  return (
    <div className="relative">
      <button
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
              -top-1
              -right-1
              min-w-[20px]
              h-5
              px-1.5
              rounded-full
              bg-gradient-to-r
              from-purple-500
              to-fuchsia-500
              text-white
              text-[10px]
              font-bold
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

      <AnimatePresence>
        {open && (
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
            className="
              absolute
              right-0
              mt-4
              w-[330px]
              sm:w-[390px]
              max-w-[calc(100vw-2rem)]
              bg-white
              text-zinc-950
              border
              border-zinc-200
              rounded-3xl
              shadow-2xl
              overflow-hidden
              z-[80]

              dark:bg-zinc-950
              dark:text-white
              dark:border-white/10
            "
          >
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
                <h2 className="text-xl font-black">
                  Notifications
                </h2>

                <p className="text-zinc-500 text-sm">
                  {unreadCount} unread
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="
                    flex
                    items-center
                    gap-2
                    text-xs
                    font-bold
                    text-purple-500
                    hover:text-fuchsia-500
                    transition
                  "
                >
                  <CheckCheck size={16} />
                  Read all
                </button>
              )}
            </div>

            <div
              className="
                max-h-[440px]
                overflow-y-auto
              "
            >
              {notifications.length === 0 && (
                <div
                  className="
                    p-8
                    text-center
                    text-zinc-500
                  "
                >
                  <div
                    className="
                      w-16
                      h-16
                      mx-auto
                      rounded-full
                      bg-purple-500/10
                      text-purple-500
                      flex
                      items-center
                      justify-center
                      mb-4
                    "
                  >
                    <Bell size={28} />
                  </div>

                  <h3 className="font-bold text-zinc-950 dark:text-white">
                    No notifications yet
                  </h3>

                  <p className="text-sm mt-2">
                    Likes, comments, follows and messages will appear here.
                  </p>
                </div>
              )}

              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    group
                    relative
                    border-b
                    border-zinc-100
                    transition

                    dark:border-white/10

                    ${
                      notification.is_read
                        ? "bg-transparent"
                        : "bg-purple-500/5"
                    }
                  `}
                >
                  <Link
                    to={getNotificationLink(notification)}
                    onClick={() => {
                      markAsRead(notification.id);
                      setOpen(false);
                    }}
                    className="
                      flex
                      gap-3
                      p-4
                      hover:bg-zinc-50
                      transition

                      dark:hover:bg-white/5
                    "
                  >
                    <img
                      src={
                        notification.actor?.avatar_url ||
                        "https://i.pravatar.cc/150"
                      }
                      alt=""
                      className="
                        w-11
                        h-11
                        rounded-full
                        object-cover
                        border
                        border-purple-500/30
                        shrink-0
                      "
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p
                            className="
                              text-sm
                              leading-relaxed
                              text-zinc-700
                              break-words

                              dark:text-zinc-300
                            "
                          >
                            <span className="font-bold text-zinc-950 dark:text-white">
                              {notification.actor?.username || "Someone"}
                            </span>{" "}
                            {notification.message}
                          </p>

                          <p className="text-xs text-zinc-500 mt-1">
                            {formatTime(notification.created_at)}
                          </p>
                        </div>

                        <div
                          className={`
                            w-8
                            h-8
                            rounded-xl
                            flex
                            items-center
                            justify-center
                            shrink-0

                            ${
                              notification.type === "like"
                                ? "bg-pink-500/10 text-pink-500"
                                : notification.type === "comment"
                                ? "bg-blue-500/10 text-blue-500"
                                : notification.type === "follow"
                                ? "bg-green-500/10 text-green-500"
                                : notification.type === "message"
                                ? "bg-purple-500/10 text-purple-500"
                                : "bg-zinc-500/10 text-zinc-500"
                            }
                          `}
                        >
                          {getIcon(notification.type)}
                        </div>
                      </div>
                    </div>
                  </Link>

                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="
                      absolute
                      right-3
                      bottom-3
                      opacity-0
                      group-hover:opacity-100
                      p-2
                      rounded-xl
                      text-zinc-400
                      hover:text-red-500
                      hover:bg-red-500/10
                      transition
                    "
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationBell;
