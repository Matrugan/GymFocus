import { useEffect, useState } from "react";

import { Send, Trash2, MessageCircle } from "lucide-react";

import toast from "react-hot-toast";

import { createNotification } from "../../utils/notificationSystem";
import { reportError } from "../../utils/errorHandler";
import {
  createComment,
  deleteCommentById,
  fetchCommentsByPostId,
  fetchPostOwner,
} from "../../services/feedService";
import { useLanguage } from "../../context/LanguageContext";

function CommentSection({ postId, user, profile }) {
  const { language, translate } = useLanguage();
  const [comments, setComments] = useState([]);

  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (postId) {
      getComments();
    }
  }, [postId]);

  async function getComments() {
    const { data, error } = await fetchCommentsByPostId(postId);

    if (error) {
      reportError(error);
      return;
    }

    setComments(data || []);
  }

  async function addComment() {
    if (!comment.trim()) {
      toast.error(translate("Write a comment first."));
      return;
    }

    if (!user || !profile) {
      toast.error(translate("User profile not loaded."));
      return;
    }

    setLoading(true);

    const { error } = await createComment({
      post_id: postId,
      user_id: user.id,
      username: profile.username,
      avatar_url: profile.avatar_url,
      content: comment.trim(),
    });

    if (error) {
      reportError(error, translate("Error adding comment."));
      setLoading(false);
      return;
    }

    const { data: postData } = await fetchPostOwner(postId);

    if (postData) {
      await createNotification({
        userId: postData.user_id,
        actorId: user.id,
        type: "comment",
        message: "commented on your post.",
        postId,
      });
    }

    setComment("");
    setLoading(false);
    getComments();
  }

  async function deleteComment(commentId) {
    const confirmDelete = confirm(
      language === "pt" ? "Excluir este comentário?" : "Delete this comment?",
    );

    if (!confirmDelete) return;

    const { error } = await deleteCommentById(commentId);

    if (error) {
      reportError(error, translate("Error deleting comment."));
      return;
    }

    toast.success(translate("Comment deleted."));
    getComments();
  }

  function formatTime(date) {
    if (!date) return "";

    return new Date(date).toLocaleDateString(language === "pt" ? "pt-BR" : "en-US", {
      day: "2-digit",
      month: "short",
    });
  }

  return (
    <div
      className="
        mt-5
        sm:mt-6
        w-full
        min-w-0
      "
    >
      {/* TITLE */}
      <div
        className="
          flex
          items-center
          gap-2
          mb-4
          text-zinc-600
          text-sm
          sm:text-base

          dark:text-zinc-400
        "
      >
        <MessageCircle size={18} />

        <span className="font-bold">
          {comments.length}{" "}
          {comments.length === 1 ? translate("Comment") : translate("Comments")}
        </span>
      </div>

      {/* COMMENTS LIST */}
      <div className="space-y-3 sm:space-y-4">
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
              p-3
              sm:p-4
              transition-colors
              min-w-0

              dark:bg-black/30
              dark:border-white/10
            "
          >
            <img
              src={item.avatar_url || "https://i.pravatar.cc/150"}
              alt=""
              className="
                w-9
                h-9
                sm:w-10
                sm:h-10
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
                  items-start
                  justify-between
                  gap-2
                  sm:gap-3
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

                  <p className="text-[11px] sm:text-xs text-zinc-500">
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
                      shrink-0
                    "
                  >
                    <Trash2 size={15} />
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
              p-4
              sm:p-5
              text-center
              text-zinc-500
              text-sm
              sm:text-base

              dark:bg-black/30
              dark:border-white/10
            "
          >
            {translate("No comments yet. Be the first to comment.")}
          </div>
        )}
      </div>

      {/* INPUT */}
      <div
        className="
          mt-4
          sm:mt-5
          flex
          items-center
          gap-2
          sm:gap-3
          bg-zinc-50
          border
          border-zinc-200
          rounded-2xl
          p-2
          sm:p-3
          min-w-0

          dark:bg-black/30
          dark:border-white/10
        "
      >
        <img
          src={profile?.avatar_url || "https://i.pravatar.cc/150"}
          alt=""
          className="
            w-9
            h-9
            sm:w-10
            sm:h-10
            rounded-full
            object-cover
            border
            border-purple-500/40
            shrink-0
          "
        />

        <input
          type="text"
          placeholder={translate("Write a comment...")}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addComment();
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
          onClick={addComment}
          disabled={loading || !comment.trim()}
          className="
            w-10
            h-10
            sm:w-11
            sm:h-11
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
          <Send size={17} />
        </button>
      </div>
    </div>
  );
}

export default CommentSection;
