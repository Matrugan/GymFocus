import { useEffect, useState } from "react";

import { Bell } from "lucide-react";

import { supabase } from "../lib/supabase";

function NotificationBell({ user }) {

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {

    getNotifications();

  }, []);

  async function getNotifications() {

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {

      console.log(error);

      return;

    }

    setNotifications(data);

  }

  const unread = notifications.filter(
    (notification) => !notification.is_read
  );

  return (

    <div className="relative">

      <button
        className="
          p-3
          rounded-2xl
          bg-white/5
          border
          border-white/10
          hover:border-purple-500
          transition
        "
      >

        <Bell size={22} />

      </button>

      {unread.length > 0 && (

        <div
          className="
            absolute
            -top-1
            -right-1
            w-5
            h-5
            rounded-full
            bg-red-500
            text-xs
            flex
            items-center
            justify-center
            font-bold
          "
        >

          {unread.length}

        </div>

      )}

    </div>

  );

}

export default NotificationBell;