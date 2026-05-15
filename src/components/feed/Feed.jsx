import { useEffect, useState } from "react";

import { motion } from "framer-motion";

import {
  Pencil,
  Trash2,
  Save,
  X,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react";

import CommentSection from "./CommentSection";

import { Link } from "react-router-dom";

import toast from "react-hot-toast";

import { formatDistanceToNow } from "date-fns";

import { createNotification } from "../../utils/notificationSystem";
import { reportError } from "../../utils/errorHandler";
import {
  createLike,
  deleteLike,
  deletePostById,
  fetchFeedPosts,
  fetchLikes,
  subscribeToFeedChanges,
  unsubscribeFromFeedChanges,
  updatePostContent,
} from "../../services/feedService";
import { useLanguage } from "../../context/LanguageContext";

function Feed({ user, profile, refreshKey }) {
  const { language, t, translate } = useLanguage();

  const [posts, setPosts] = useState([]);

  const [likes, setLikes] = useState([]);

  const [editingPostId, setEditingPostId] = useState(null);

  const [editedContent, setEditedContent] = useState("");

  const [loading, setLoading] = useState(true);

  const [activeFeed, setActiveFeed] = useState("forYou");

  useEffect(() => {
    if (user) {
      getPosts();
    }
  }, [user, activeFeed, refreshKey]);

  useEffect(() => {
    if (!user) return;

    const channels = subscribeToFeedChanges({
      onPostsChange: getPosts,
      onLikesChange: getLikes,
    });

    return () => {
      unsubscribeFromFeedChanges(channels);
    };
  }, [user, activeFeed]);

  async function getPosts() {
    setLoading(true);

    const { data, error } = await fetchFeedPosts({
      activeFeed,
      userId: user.id,
    });

    if (error) {
      reportError(error);
      setLoading(false);
      return;
    }

    const loadedPosts = data || [];

    setPosts(loadedPosts);
    await getLikes(loadedPosts);
    setLoading(false);
  }

  async function getLikes(postList = posts) {
    const postIds = postList.map((post) => post.id);
    const { data, error } = await fetchLikes(postIds);

    if (error) {
      reportError(error);
      return;
    }

    setLikes(data || []);
  }

  async function toggleLike(postId) {
    if (!user) return;

    const existingLike = likes.find(
      (like) => like.post_id === postId && like.user_id === user.id,
    );

    if (existingLike) {
      const { error } = await deleteLike(existingLike.id);

      if (error) {
        reportError(error);
        return;
      }
    } else {
      const { error } = await createLike(postId, user.id);

      if (error) {
        reportError(error);
        return;
      }

      const likedPost = posts.find((post) => post.id === postId);

      if (likedPost) {
        await createNotification({
          userId: likedPost.user_id,
          actorId: user.id,
          type: "like",
          message: "liked your post.",
          postId,
        });
      }

      if (error) {
        reportError(error);
        return;
      }
    }

    getLikes();
  }

  async function deletePost(postId) {
    const confirmDelete = confirm(
      language === "pt" ? "Excluir este post?" : "Delete this post?",
    );

    if (!confirmDelete) return;

    const { error } = await deletePostById(postId);

    if (error) {
      reportError(error);
      return;
    }

    toast.success(translate("Post deleted!"));

    getPosts();
  }

  async function updatePost(postId) {
    if (!editedContent.trim()) {
      toast.error(translate("Post cannot be empty."));
      return;
    }

    const { error } = await updatePostContent(postId, editedContent);

    if (error) {
      reportError(error);
      return;
    }

    toast.success(translate("Post updated!"));

    setEditingPostId(null);

    setEditedContent("");

    getPosts();
  }

  async function sharePost(post) {
    await navigator.clipboard.writeText(
      `${window.location.origin}/profile/${post.username}`,
    );

    toast.success(translate("Profile link copied!"));
  }

  if (loading) {
    return (
      <div
        className="
          w-full
          max-w-2xl
          mx-auto
          space-y-5
          sm:space-y-8
        "
      >
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="
              h-[320px]
              sm:h-[430px]
              rounded-2xl
              sm:rounded-[30px]
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
    );
  }

  return (
    <div
      className="
        w-full
        max-w-2xl
        mx-auto
        min-w-0
      "
    >
      {/* FEED TABS */}
      <div
        className="
          mb-5
          sm:mb-8
          bg-white
          border
          border-zinc-200
          rounded-2xl
          sm:rounded-3xl
          p-2
          flex
          items-center
          gap-2
          shadow-sm
          transition-colors

          dark:bg-white/5
          dark:border-white/10
          dark:backdrop-blur-xl
        "
      >
        <button
          onClick={() => setActiveFeed("forYou")}
          className={`
            flex-1
            py-3
            sm:py-4
            rounded-xl
            sm:rounded-2xl
            font-bold
            text-sm
            sm:text-base
            transition

            ${
              activeFeed === "forYou"
                ? "bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white"
                : `
                  text-zinc-600
                  hover:bg-zinc-100
                  hover:text-zinc-950

                  dark:text-zinc-400
                  dark:hover:bg-white/5
                  dark:hover:text-white
                `
            }
          `}
        >
          {t("feed.forYou")}
        </button>

        <button
          onClick={() => setActiveFeed("following")}
          className={`
            flex-1
            py-3
            sm:py-4
            rounded-xl
            sm:rounded-2xl
            font-bold
            text-sm
            sm:text-base
            transition

            ${
              activeFeed === "following"
                ? "bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white"
                : `
                  text-zinc-600
                  hover:bg-zinc-100
                  hover:text-zinc-950

                  dark:text-zinc-400
                  dark:hover:bg-white/5
                  dark:hover:text-white
                `
            }
          `}
        >
          {t("feed.following")}
        </button>
      </div>

      {/* EMPTY FOLLOWING */}
      {activeFeed === "following" && posts.length === 0 && (
        <EmptyFeed
          title="No posts from people you follow yet."
          description="Follow athletes to build your personalized feed."
        />
      )}

      {/* EMPTY FOR YOU */}
      {activeFeed === "forYou" && posts.length === 0 && (
        <EmptyFeed
          title="No posts yet."
          description="Be the first athlete to share progress."
        />
      )}

      {/* POSTS */}
      <div className="space-y-6 sm:space-y-10">
        {posts.map((post, index) => {
          const liked = likes.find(
            (like) => like.post_id === post.id && like.user_id === user.id,
          );

          const likesCount = likes.filter(
            (like) => like.post_id === post.id,
          ).length;

          return (
            <motion.div
              key={post.id}
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
              whileHover={{
                y: -3,
              }}
              className="
                bg-white
                text-zinc-950
                border
                border-zinc-200
                rounded-2xl
                sm:rounded-[30px]
                overflow-hidden
                shadow-sm
                hover:border-purple-500/40
                hover:shadow-[0_0_40px_rgba(168,85,247,0.12)]
                transition-all
                duration-300
                min-w-0

                dark:bg-zinc-950
                dark:text-white
                dark:border-white/10
                dark:hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]
              "
            >
              {/* HEADER */}
              <div
                className="
                  flex
                  items-center
                  justify-between
                  p-4
                  sm:p-5
                  gap-3
                "
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <img
                    src={post.avatar_url || "https://i.pravatar.cc/150"}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="
                      w-11
                      h-11
                      sm:w-14
                      sm:h-14
                      rounded-full
                      object-cover
                      border-2
                      border-purple-500
                      shrink-0
                    "
                  />

                  <div className="min-w-0">
                    <Link to={`/profile/${post.username}`}>
                      <h3
                        className="
                          font-bold
                          text-base
                          sm:text-lg
                          truncate
                          hover:text-purple-500
                          transition
                        "
                      >
                        {post.username}
                      </h3>
                    </Link>

                    <p className="text-zinc-500 text-xs sm:text-sm truncate">
                      {formatDistanceToNow(new Date(post.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>

                {user?.id === post.user_id && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditingPostId(post.id);
                        setEditedContent(post.content);
                      }}
                      className="
                        p-2.5
                        sm:p-3
                        rounded-xl
                        bg-zinc-100
                        text-zinc-700
                        hover:bg-purple-500/10
                        hover:text-purple-500
                        transition

                        dark:bg-white/5
                        dark:text-zinc-300
                        dark:hover:bg-purple-500/20
                      "
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      onClick={() => deletePost(post.id)}
                      className="
                        p-2.5
                        sm:p-3
                        rounded-xl
                        bg-zinc-100
                        text-zinc-700
                        hover:bg-red-500/10
                        hover:text-red-500
                        transition

                        dark:bg-white/5
                        dark:text-zinc-300
                        dark:hover:bg-red-500/20
                      "
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                )}
              </div>

              {/* CONTENT */}
              <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                {editingPostId === post.id ? (
                  <div>
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="
                        w-full
                        h-28
                        sm:h-32
                        rounded-2xl
                        bg-zinc-50
                        text-zinc-950
                        border
                        border-zinc-200
                        p-4
                        sm:p-5
                        outline-none
                        focus:border-purple-500
                        transition

                        dark:bg-black/30
                        dark:text-white
                        dark:border-white/10
                      "
                    />

                    <div
                      className="
                        flex
                        flex-col
                        sm:flex-row
                        gap-3
                        mt-4
                      "
                    >
                      <button
                        onClick={() => updatePost(post.id)}
                        className="
                          w-full
                          sm:w-auto
                          justify-center
                          px-5
                          py-3
                          rounded-xl
                          bg-green-500
                          text-white
                          flex
                          items-center
                          gap-2
                          hover:scale-105
                          transition
                        "
                      >
                        <Save size={18} />
                        Save
                      </button>

                      <button
                        onClick={() => {
                          setEditingPostId(null);
                          setEditedContent("");
                        }}
                        className="
                          w-full
                          sm:w-auto
                          justify-center
                          px-5
                          py-3
                          rounded-xl
                          bg-zinc-200
                          text-zinc-800
                          flex
                          items-center
                          gap-2
                          hover:bg-zinc-300
                          transition

                          dark:bg-zinc-700
                          dark:text-white
                          dark:hover:bg-zinc-600
                        "
                      >
                        <X size={18} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p
                    className="
                      text-zinc-800
                      text-base
                      sm:text-lg
                      leading-relaxed
                      whitespace-pre-wrap
                      break-words

                      dark:text-zinc-200
                    "
                  >
                    {post.content}
                  </p>
                )}
              </div>

              {/* IMAGE */}
              {post.image_url && (
                <div
                  className="
                    overflow-hidden
                    border-y
                    border-zinc-200

                    dark:border-white/10
                  "
                >
                  <img
                    src={post.image_url}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="
                      w-full
                      max-h-[420px]
                      sm:max-h-[700px]
                      object-cover
                      hover:scale-[1.01]
                      transition
                      duration-500
                    "
                  />
                </div>
              )}

              {/* ACTIONS */}
              <div className="p-4 sm:p-5">
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    sm:justify-start
                    gap-3
                    sm:gap-6
                    flex-wrap
                  "
                >
                  <motion.button
                    whileTap={{
                      scale: 1.25,
                    }}
                    onClick={() => toggleLike(post.id)}
                    className={`
                      flex
                      items-center
                      gap-2
                      text-sm
                      sm:text-base
                      transition

                      ${
                        liked
                          ? "text-pink-500"
                          : `
                            text-zinc-500
                            hover:text-pink-500

                            dark:text-zinc-400
                            dark:hover:text-pink-500
                          `
                      }
                    `}
                  >
                    <Heart size={23} fill={liked ? "currentColor" : "none"} />

                    <span className="font-bold">{likesCount}</span>
                  </motion.button>

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      text-zinc-500
                      text-sm
                      sm:text-base

                      dark:text-zinc-400
                    "
                  >
                    <MessageCircle size={22} />

                    <span className="font-bold">Comments</span>
                  </div>

                  <button
                    onClick={() => sharePost(post)}
                    className="
                      flex
                      items-center
                      gap-2
                      text-zinc-500
                      hover:text-purple-500
                      text-sm
                      sm:text-base
                      transition

                      dark:text-zinc-400
                      dark:hover:text-purple-400
                    "
                  >
                    <Share2 size={22} />

                    <span className="font-bold">Share</span>
                  </button>
                </div>

                <div
                  className="
                    mt-5
                    sm:mt-6
                    border-t
                    border-zinc-200
                    pt-5
                    sm:pt-6

                    dark:border-white/10
                  "
                >
                  <CommentSection
                    postId={post.id}
                    user={user}
                    profile={profile}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyFeed({ title, description }) {
  return (
    <div
      className="
        bg-white
        border
        border-zinc-200
        rounded-2xl
        sm:rounded-3xl
        p-6
        sm:p-10
        text-center
        mb-6
        sm:mb-8
        shadow-sm

        dark:bg-white/5
        dark:border-white/10
      "
    >
      <h2
        className="
          text-xl
          sm:text-2xl
          font-bold
          text-zinc-950

          dark:text-white
        "
      >
        {title}
      </h2>

      <p className="mt-3 text-sm sm:text-base text-zinc-500">{description}</p>
    </div>
  );
}

export default Feed;
