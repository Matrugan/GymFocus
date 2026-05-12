import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

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

function Feed({ user, profile, refreshKey }) {
  const [posts, setPosts] = useState([]);

  const [likes, setLikes] = useState([]);

  const [editingPostId, setEditingPostId] = useState(null);

  const [editedContent, setEditedContent] = useState("");

  const [loading, setLoading] = useState(true);

  const [activeFeed, setActiveFeed] = useState("forYou");

  useEffect(() => {
    if (user) {
      getPosts();
      getLikes();
    }
  }, [user, activeFeed, refreshKey]);

  useEffect(() => {
    if (!user) return;

    const postsChannel = supabase
      .channel("posts-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        () => {
          getPosts();
        }
      )
      .subscribe();

    const likesChannel = supabase
      .channel("likes-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "likes",
        },
        () => {
          getLikes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(likesChannel);
    };
  }, [user, activeFeed]);

  async function getPosts() {
    setLoading(true);

    if (activeFeed === "following") {
      const { data: followingData, error: followingError } =
        await supabase
          .from("followers")
          .select("following_id")
          .eq("follower_id", user.id);

      if (followingError) {
        console.log(followingError);

        setLoading(false);

        return;
      }

      const followingIds =
        followingData?.map((item) => item.following_id) || [];

      if (followingIds.length === 0) {
        setPosts([]);

        setLoading(false);

        return;
      }

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .in("user_id", followingIds)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.log(error);

        setLoading(false);

        return;
      }

      setPosts(data || []);

      setLoading(false);

      return;
    }

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.log(error);

      setLoading(false);

      return;
    }

    setPosts(data || []);

    setLoading(false);
  }

  async function getLikes() {
    const { data, error } = await supabase
      .from("likes")
      .select("*");

    if (error) {
      console.log(error);

      return;
    }

    setLikes(data || []);
  }

  async function toggleLike(postId) {
    if (!user) return;

    const existingLike = likes.find(
      (like) =>
        like.post_id === postId &&
        like.user_id === user.id
    );

    if (existingLike) {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("id", existingLike.id);

      if (error) {
        console.log(error);

        return;
      }
    } else {
      const { error } = await supabase
        .from("likes")
        .insert([
          {
            post_id: postId,
            user_id: user.id,
          },
        ]);

      if (error) {
        console.log(error);

        return;
      }
    }

    getLikes();
  }

  async function deletePost(postId) {
    const confirmDelete = confirm("Delete this post?");

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (error) {
      console.log(error);

      return;
    }

    toast.success("Post deleted!");

    getPosts();
  }

  async function updatePost(postId) {
    if (!editedContent.trim()) {
      toast.error("Post cannot be empty.");
      return;
    }

    const { error } = await supabase
      .from("posts")
      .update({
        content: editedContent,
      })
      .eq("id", postId);

    if (error) {
      console.log(error);

      return;
    }

    toast.success("Post updated!");

    setEditingPostId(null);

    setEditedContent("");

    getPosts();
  }

  async function sharePost(post) {
    await navigator.clipboard.writeText(
      `${window.location.origin}/profile/${post.username}`
    );

    toast.success("Profile link copied!");
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="
              h-[430px]
              rounded-[30px]
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
    <div className="max-w-2xl mx-auto">
      {/* FEED TABS */}
      <div
        className="
          mb-8
          bg-white
          border
          border-zinc-200
          rounded-3xl
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
            py-4
            rounded-2xl
            font-bold
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
          For You
        </button>

        <button
          onClick={() => setActiveFeed("following")}
          className={`
            flex-1
            py-4
            rounded-2xl
            font-bold
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
          Following
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
      <div className="space-y-10">
        {posts.map((post, index) => {
          const liked = likes.find(
            (like) =>
              like.post_id === post.id &&
              like.user_id === user.id
          );

          const likesCount = likes.filter(
            (like) => like.post_id === post.id
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
                rounded-[30px]
                overflow-hidden
                shadow-sm
                hover:border-purple-500/40
                hover:shadow-[0_0_40px_rgba(168,85,247,0.12)]
                transition-all
                duration-300

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
                  p-5
                "
              >
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={
                      post.avatar_url ||
                      "https://i.pravatar.cc/150"
                    }
                    alt=""
                    className="
                      w-14
                      h-14
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
                          text-lg
                          truncate
                          hover:text-purple-500
                          transition
                        "
                      >
                        {post.username}
                      </h3>
                    </Link>

                    <p className="text-zinc-500 text-sm">
                      {formatDistanceToNow(
                        new Date(post.created_at),
                        {
                          addSuffix: true,
                        }
                      )}
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
                        p-3
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
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => deletePost(post.id)}
                      className="
                        p-3
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
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>

              {/* CONTENT */}
              <div className="px-5 pb-5">
                {editingPostId === post.id ? (
                  <div>
                    <textarea
                      value={editedContent}
                      onChange={(e) =>
                        setEditedContent(e.target.value)
                      }
                      className="
                        w-full
                        h-32
                        rounded-2xl
                        bg-zinc-50
                        text-zinc-950
                        border
                        border-zinc-200
                        p-5
                        outline-none
                        focus:border-purple-500
                        transition

                        dark:bg-black/30
                        dark:text-white
                        dark:border-white/10
                      "
                    />

                    <div className="flex gap-3 mt-4 flex-wrap">
                      <button
                        onClick={() => updatePost(post.id)}
                        className="
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
                      text-lg
                      leading-relaxed
                      whitespace-pre-wrap

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
                    className="
                      w-full
                      max-h-[700px]
                      object-cover
                      hover:scale-[1.01]
                      transition
                      duration-500
                    "
                  />
                </div>
              )}

              {/* ACTIONS */}
              <div className="p-5">
                <div className="flex items-center gap-6 flex-wrap">
                  <motion.button
                    whileTap={{
                      scale: 1.3,
                    }}
                    onClick={() => toggleLike(post.id)}
                    className={`
                      flex
                      items-center
                      gap-2
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
                    <Heart
                      size={26}
                      fill={liked ? "currentColor" : "none"}
                    />

                    <span className="font-bold">
                      {likesCount}
                    </span>
                  </motion.button>

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      text-zinc-500

                      dark:text-zinc-400
                    "
                  >
                    <MessageCircle size={24} />

                    <span className="font-bold">
                      Comments
                    </span>
                  </div>

                  <button
                    onClick={() => sharePost(post)}
                    className="
                      flex
                      items-center
                      gap-2
                      text-zinc-500
                      hover:text-purple-500
                      transition

                      dark:text-zinc-400
                      dark:hover:text-purple-400
                    "
                  >
                    <Share2 size={24} />

                    <span className="font-bold">
                      Share
                    </span>
                  </button>
                </div>

                <div
                  className="
                    mt-6
                    border-t
                    border-zinc-200
                    pt-6

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
        rounded-3xl
        p-10
        text-center
        mb-8
        shadow-sm

        dark:bg-white/5
        dark:border-white/10
      "
    >
      <h2 className="text-2xl font-bold text-zinc-950 dark:text-white">
        {title}
      </h2>

      <p className="mt-3 text-zinc-500">
        {description}
      </p>
    </div>
  );
}

export default Feed;