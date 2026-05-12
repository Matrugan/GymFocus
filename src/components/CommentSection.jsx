import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

import { Send, Trash2, MessageCircle } from "lucide-react";

import toast from "react-hot-toast";

function CommentSection({ postId, user, profile }) {
  const [comments, setComments] = useState([]);

  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (postId) {
      getComments();
    }
  }, [postId]);

  async function getComments() {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.log(error);
      return;
    }

    setComments(data || []);
  }

  async function addComment() {
    if (!comment.trim()) {
      toast.error("Write a comment first.");
      return;
    }

    if (!user || !profile) {
      toast.error("User profile not loaded.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("comments").insert([
      {
        post_id: postId,
        user_id: user.id,
        username: profile.username,
        avatar_url: profile.avatar_url,
        content: comment.trim(),
      },
    ]);

    if (error) {
      console.log(error);
      toast.error("Error adding comment.");
      setLoading(false);
      return;
    }

    setComment("");
    setLoading(false);
    getComments();
  }

  async function deleteComment(commentId) {
    const confirmDelete = confirm("Delete this comment?");

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      console.log(error);
      toast.error("Error deleting comment.");
      return;
    }

    toast.success("Comment deleted.");
    getComments();
  }

  function formatTime(date) {
    if (!date) return "";

    return new Date(date).toLocaleDateString([], {
      day: "2-digit",
      month: "short",
    });
  }

  return (
    <div className="mt-6">
      {/* TITLE */}
      <div className="flex items-center gap-2 mb-4 text-zinc-600 dark:text-zinc-400">
        <MessageCircle size={18} />

        <span className="font-bold">
          {comments.length}{" "}
          {comments.length === 1 ? "Comment" : "Comments"}
        </span>
      </div>

      {/* COMMENTS LIST */}
      <div className="space-y-4">
        {comments.map((item) => (
          <div
            key={item.id}
            className="
              flex
              items-start
              gap-3
              bg-zinc-50
              border
              border-zinc-200
              rounded-2xl
              p-4
              transition-colors

              dark:bg-black/30
              dark:border-white/10
            "
          >
            <img
              src={item.avatar_url || "https://i.pravatar.cc/150"}
              alt=""
              className="
                w-10
                h-10
                rounded-full
                object-cover
                border
                border-purple-500/40
                shrink-0
              "
            />

            <div className="flex-1 min-w-0">
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <div className="min-w-0">
                  <h4
                    className="
                      font-bold
                      text-sm
                      truncate
                      text-zinc-950

                      dark:text-white
                    "
                  >
                    {item.username || "User"}
                  </h4>

                  <p className="text-xs text-zinc-500">
                    {formatTime(item.created_at)}
                  </p>
                </div>

                {user?.id === item.user_id && (
                  <button
                    type="button"
                    onClick={() => deleteComment(item.id)}
                    className="
                      p-2
                      rounded-xl
                      text-zinc-500
                      hover:bg-red-500/10
                      hover:text-red-500
                      transition
                    "
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <p
                className="
                  mt-2
                  text-sm
                  leading-relaxed
                  text-zinc-700
                  break-words

                  dark:text-zinc-300
                "
              >
                {item.content}
              </p>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <div
            className="
              bg-zinc-50
              border
              border-zinc-200
              rounded-2xl
              p-5
              text-center
              text-zinc-500

              dark:bg-black/30
              dark:border-white/10
            "
          >
            No comments yet. Be the first to comment.
          </div>
        )}
      </div>

      {/* INPUT */}
      <div
        className="
          mt-5
          flex
          items-center
          gap-3
          bg-zinc-50
          border
          border-zinc-200
          rounded-2xl
          p-3

          dark:bg-black/30
          dark:border-white/10
        "
      >
        <img
          src={profile?.avatar_url || "https://i.pravatar.cc/150"}
          alt=""
          className="
            w-10
            h-10
            rounded-full
            object-cover
            border
            border-purple-500/40
            shrink-0
          "
        />

        <input
          type="text"
          placeholder="Write a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addComment();
            }
          }}
          className="
            flex-1
            bg-transparent
            outline-none
            text-zinc-950
            placeholder:text-zinc-500

            dark:text-white
          "
        />

        <button
          type="button"
          onClick={addComment}
          disabled={loading || !comment.trim()}
          className="
            w-11
            h-11
            rounded-xl
            bg-gradient-to-r
            from-purple-500
            to-fuchsia-500
            text-white
            flex
            items-center
            justify-center
            hover:scale-105
            transition
            disabled:opacity-40
            disabled:hover:scale-100
            shrink-0
          "
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

export default CommentSection;