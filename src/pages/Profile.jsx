import { useEffect, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabase";

import { useAuth } from "../context/AuthContext";

import {
  Heart,
  ArrowLeft,
  MessageCircle,
  Trophy,
  Flame,
  Dumbbell,
  Star,
  UserRound,
} from "lucide-react";

import { motion } from "framer-motion";

import CommentSection from "../components/CommentSection";

import ProfileBadges from "../components/ProfileBadges";

import {
  getLevel,
  getXPForNextLevel,
  getLevelProgress,
} from "../utils/levelSystem";

import ThemeToggle from "../components/ThemeToggle";

function Profile() {
  const { username } = useParams();

  const { user } = useAuth();

  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);

  const [followersCount, setFollowersCount] = useState(0);

  const [followingCount, setFollowingCount] = useState(0);

  const [isFollowing, setIsFollowing] = useState(false);

  const [posts, setPosts] = useState([]);

  const [likes, setLikes] = useState([]);

  useEffect(() => {
    getProfile();
  }, [username]);

  useEffect(() => {
    if (profile && user) {
      getFollowers();
    }
  }, [profile, user]);

  useEffect(() => {
    if (profile) {
      getPosts();
    }
  }, [profile]);

  useEffect(() => {
    getLikes();
  }, []);

  async function getProfile() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single();

    if (error) {
      console.log(error);

      return;
    }

    setProfile(data);
  }

  async function getFollowers() {
    const { data: followers } = await supabase
      .from("followers")
      .select("*")
      .eq("following_id", profile.id);

    setFollowersCount(followers?.length || 0);

    const { data: following } = await supabase
      .from("followers")
      .select("*")
      .eq("follower_id", profile.id);

    setFollowingCount(following?.length || 0);

    const { data: existingFollow } = await supabase
      .from("followers")
      .select("*")
      .eq("follower_id", user.id)
      .eq("following_id", profile.id)
      .maybeSingle();

    setIsFollowing(!!existingFollow);
  }

  async function getPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.log(error);

      return;
    }

    setPosts(data || []);
  }

  async function getLikes() {
    const { data, error } = await supabase.from("likes").select("*");

    if (error) {
      console.log(error);

      return;
    }

    setLikes(data || []);
  }

  async function toggleLike(postId) {
    if (!user) return;

    const existingLike = likes.find(
      (like) => like.post_id === postId && like.user_id === user.id
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
      const { error } = await supabase.from("likes").insert([
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

  async function toggleFollow() {
    if (!user || !profile) return;

    if (isFollowing) {
      await supabase
        .from("followers")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", profile.id);
    } else {
      await supabase.from("followers").insert([
        {
          follower_id: user.id,
          following_id: profile.id,
        },
      ]);
    }

    getFollowers();
  }

  async function startConversation() {
    if (!user || !profile) return;

    const { data: existingParticipants } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);

    if (existingParticipants?.length > 0) {
      const conversationIds = existingParticipants.map(
        (item) => item.conversation_id
      );

      const { data: otherParticipants } = await supabase
        .from("conversation_participants")
        .select("*")
        .in("conversation_id", conversationIds)
        .eq("user_id", profile.id);

      if (otherParticipants?.length > 0) {
        navigate(`/chat/${otherParticipants[0].conversation_id}`);

        return;
      }
    }

    const { data: conversation, error } = await supabase
      .from("conversations")
      .insert([{}])
      .select()
      .single();

    if (error) {
      console.log(error);

      return;
    }

    await supabase.from("conversation_participants").insert([
      {
        conversation_id: conversation.id,
        user_id: user.id,
      },
      {
        conversation_id: conversation.id,
        user_id: profile.id,
      },
    ]);

    navigate(`/chat/${conversation.id}`);
  }

  if (!profile) {
    return (
      <div
        className="
          min-h-screen
          bg-zinc-50
          text-zinc-950
          flex
          items-center
          justify-center

          dark:bg-black
          dark:text-white
        "
      >
        Loading...
      </div>
    );
  }

  const level = getLevel(profile?.xp || 0);

  const nextLevelXP = getXPForNextLevel(level);

  const progress = getLevelProgress(profile?.xp || 0);

  const totalLikes = posts.reduce((total, post) => {
    const postLikes = likes.filter((like) => like.post_id === post.id).length;

    return total + postLikes;
  }, 0);

  return (
    <section
      className="
        min-h-screen
        bg-zinc-50
        text-zinc-950
        px-6
        py-10
        relative
        overflow-hidden
        transition-colors

        dark:bg-black
        dark:text-white
      "
    >
      {/* BACKGROUND GLOW */}
      <div
        className="
          absolute
          top-0
          left-1/2
          -translate-x-1/2
          w-[600px]
          h-[600px]
          bg-purple-500/10
          blur-[160px]
          rounded-full
          pointer-events-none
        "
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* TOP BAR */}
        <div
          className="
            flex
            items-center
            justify-between
            gap-4
            mb-8
          "
        >
          <button
            onClick={() => navigate(-1)}
            className="
              flex
              items-center
              gap-2
              text-zinc-600
              hover:text-zinc-950
              bg-white
              border
              border-zinc-200
              rounded-2xl
              px-4
              py-3
              shadow-sm
              transition

              dark:text-zinc-400
              dark:hover:text-white
              dark:bg-white/5
              dark:border-white/10
            "
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <ThemeToggle />
        </div>

        {/* PROFILE HERO */}
        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="
            bg-white
            border
            border-zinc-200
            rounded-[36px]
            overflow-hidden
            shadow-sm
            transition-colors

            dark:bg-white/5
            dark:border-white/10
            dark:backdrop-blur-xl
          "
        >
          {/* BANNER */}
          <div
            className="
              h-48
              md:h-64
              relative
              bg-gradient-to-r
              from-purple-700
              via-fuchsia-600
              to-purple-900
              overflow-hidden
            "
          >
            {profile.banner_url && (
              <img
                src={profile.banner_url}
                alt=""
                className="
                  absolute
                  inset-0
                  w-full
                  h-full
                  object-cover
                "
              />
            )}

            <div
              className="
                absolute
                inset-0
                bg-black/25
              "
            />

            <div
              className="
                absolute
                inset-0
                bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_30%)]
              "
            />

            <div
              className="
                absolute
                bottom-6
                left-8
                flex
                items-center
                gap-3
                bg-black/30
                border
                border-white/10
                rounded-2xl
                px-5
                py-3
                backdrop-blur-xl
                text-white
              "
            >
              <Star size={18} />

              <span className="font-bold">
                Level {level} Athlete
              </span>
            </div>
          </div>

          {/* PROFILE CONTENT */}
          <div
            className="
              p-6
              md:p-10
              -mt-20
              relative
              z-10
            "
          >
            <div
              className="
                flex
                flex-col
                lg:flex-row
                gap-8
                lg:items-end
                justify-between
              "
            >
              <div
                className="
                  flex
                  flex-col
                  md:flex-row
                  gap-8
                  md:items-end
                "
              >
                {/* AVATAR */}
                <div className="relative shrink-0">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="
                        w-40
                        h-40
                        rounded-full
                        object-cover
                        border-4
                        border-white
                        ring-4
                        ring-purple-500
                        bg-zinc-100

                        dark:border-black
                        dark:bg-zinc-900
                      "
                    />
                  ) : (
                    <div
                      className="
                        w-40
                        h-40
                        rounded-full
                        border-4
                        border-white
                        ring-4
                        ring-purple-500
                        bg-zinc-100
                        flex
                        items-center
                        justify-center

                        dark:border-black
                        dark:bg-zinc-900
                      "
                    >
                      <UserRound size={56} className="text-zinc-500" />
                    </div>
                  )}

                  <div
                    className={`
                      absolute
                      bottom-3
                      right-3
                      w-5
                      h-5
                      rounded-full
                      border-4
                      border-white

                      dark:border-black

                      ${profile.online ? "bg-green-500" : "bg-zinc-500"}
                    `}
                  />
                </div>

                {/* INFO */}
                <div>
                  <h1
                    className="
                      text-4xl
                      md:text-6xl
                      font-black
                    "
                  >
                    {profile.username}
                  </h1>

                  <p
                    className="
                      text-zinc-600
                      mt-4
                      text-lg
                      leading-relaxed
                      max-w-2xl

                      dark:text-zinc-400
                    "
                  >
                    {profile.bio || "No bio yet."}
                  </p>

                  <div
                    className="
                      flex
                      flex-wrap
                      gap-3
                      mt-5
                    "
                  >
                    <span
                      className="
                        px-4
                        py-2
                        rounded-full
                        bg-purple-500/10
                        border
                        border-purple-500/20
                        text-purple-500
                        text-sm
                        font-bold
                      "
                    >
                      {profile.current_workout || "Workout"}
                    </span>

                    <span
                      className="
                        px-4
                        py-2
                        rounded-full
                        bg-zinc-100
                        border
                        border-zinc-200
                        text-zinc-700
                        text-sm
                        font-bold

                        dark:bg-white/5
                        dark:border-white/10
                        dark:text-zinc-300
                      "
                    >
                      {profile.online ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              {user?.id !== profile.id && (
                <div
                  className="
                    flex
                    flex-wrap
                    gap-4
                  "
                >
                  <button
                    onClick={toggleFollow}
                    className={`
                      h-14
                      px-8
                      rounded-2xl
                      font-bold
                      text-lg
                      transition
                      hover:scale-105

                      ${
                        isFollowing
                          ? `
                            bg-zinc-100
                            text-zinc-800
                            border
                            border-zinc-200
                            hover:border-purple-500
                            hover:text-purple-500

                            dark:bg-white/10
                            dark:text-white
                            dark:border-white/10
                          `
                          : `
                            bg-gradient-to-r
                            from-purple-500
                            to-fuchsia-500
                            text-white
                          `
                      }
                    `}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>

                  <button
                    onClick={startConversation}
                    className="
                      h-14
                      px-8
                      rounded-2xl
                      bg-white
                      border
                      border-zinc-200
                      text-zinc-800
                      font-bold
                      text-lg
                      flex
                      items-center
                      gap-3
                      hover:border-purple-500
                      hover:text-purple-500
                      transition
                      hover:scale-105
                      shadow-sm

                      dark:bg-white/5
                      dark:border-white/10
                      dark:text-white
                    "
                  >
                    <MessageCircle size={20} />
                    Message
                  </button>
                </div>
              )}
            </div>

            {/* STATS */}
            <div
              className="
                grid
                grid-cols-2
                md:grid-cols-4
                gap-4
                mt-10
              "
            >
              <StatCard
                label="Followers"
                value={followersCount}
                icon={<Star size={20} />}
              />

              <StatCard
                label="Following"
                value={followingCount}
                icon={<Star size={20} />}
              />

              <StatCard
                label="XP"
                value={profile.xp || 0}
                icon={<Trophy size={20} />}
              />

              <StatCard
                label="Streak"
                value={`${profile.streak || 0}`}
                icon={<Flame size={20} />}
              />
            </div>

            {/* LEVEL PROGRESS */}
            <div
              className="
                mt-8
                bg-zinc-50
                border
                border-zinc-200
                rounded-3xl
                p-6

                dark:bg-black/30
                dark:border-white/10
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                  mb-4
                  flex-wrap
                "
              >
                <div>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Progress to Level {level + 1}
                  </p>

                  <h3 className="text-3xl font-black mt-1">
                    {Math.floor(progress)}%
                  </h3>
                </div>

                <div className="text-purple-500 font-bold">
                  {profile.xp || 0} / {nextLevelXP} XP
                </div>
              </div>

              <div
                className="
                  w-full
                  h-4
                  bg-zinc-200
                  rounded-full
                  overflow-hidden

                  dark:bg-zinc-800
                "
              >
                <motion.div
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: `${progress}%`,
                  }}
                  transition={{
                    duration: 1.2,
                  }}
                  className="
                    h-full
                    rounded-full
                    bg-gradient-to-r
                    from-purple-500
                    to-fuchsia-500
                  "
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* PROFILE EXTRA INFO */}
        <div
          className="
            grid
            lg:grid-cols-[1fr_340px]
            gap-8
            mt-10
          "
        >
          {/* POSTS */}
          <div className="space-y-6">
            <div
              className="
                flex
                items-center
                justify-between
              "
            >
              <div>
                <h2 className="text-3xl font-black">
                  Posts
                </h2>

                <p className="text-zinc-600 dark:text-zinc-500 mt-1">
                  {posts.length} posts • {totalLikes} likes
                </p>
              </div>
            </div>

            {posts.length === 0 && (
              <div
                className="
                  bg-white
                  border
                  border-zinc-200
                  rounded-3xl
                  p-10
                  text-zinc-500
                  text-center
                  shadow-sm

                  dark:bg-white/5
                  dark:border-white/10
                "
              >
                No posts yet.
              </div>
            )}

            {posts.map((post, index) => {
              const liked = likes.find(
                (like) => like.post_id === post.id && like.user_id === user?.id
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
                  className="
                    bg-white
                    border
                    border-zinc-200
                    rounded-3xl
                    p-6
                    md:p-8
                    shadow-sm
                    hover:border-purple-500/40
                    transition

                    dark:bg-white/5
                    dark:border-white/10
                    dark:backdrop-blur-xl
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-4
                      mb-5
                    "
                  >
                    <img
                      src={profile.avatar_url || "https://i.pravatar.cc/150"}
                      alt=""
                      className="
                        w-12
                        h-12
                        rounded-full
                        object-cover
                        border
                        border-purple-500/40
                        shrink-0
                      "
                    />

                    <div>
                      <h3 className="font-bold">
                        {profile.username}
                      </h3>

                      <p className="text-zinc-500 text-sm">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <p
                    className="
                      text-lg
                      text-zinc-800
                      leading-relaxed
                      whitespace-pre-wrap

                      dark:text-zinc-200
                    "
                  >
                    {post.content}
                  </p>

                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt=""
                      className="
                        mt-6
                        rounded-2xl
                        w-full
                        max-h-[500px]
                        object-cover
                        border
                        border-zinc-200

                        dark:border-white/10
                      "
                    />
                  )}

                  <div
                    className="
                      flex
                      items-center
                      gap-5
                      mt-6
                    "
                  >
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`
                        flex
                        items-center
                        gap-2
                        transition

                        ${
                          liked
                            ? "text-pink-500"
                            : "text-zinc-500 hover:text-pink-500 dark:text-zinc-400"
                        }
                      `}
                    >
                      <Heart
                        size={22}
                        fill={liked ? "currentColor" : "none"}
                      />

                      <span className="font-bold">
                        {likesCount}
                      </span>
                    </button>
                  </div>

                  <CommentSection postId={post.id} user={user} profile={profile} />
                </motion.div>
              );
            })}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-8">
            <ProfileBadges profileId={profile.id} />

            <div
              className="
                bg-white
                border
                border-zinc-200
                rounded-3xl
                p-8
                shadow-sm

                dark:bg-white/5
                dark:border-white/10
                dark:backdrop-blur-xl
              "
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="
                    w-12
                    h-12
                    rounded-2xl
                    bg-gradient-to-r
                    from-purple-500
                    to-fuchsia-500
                    text-white
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Dumbbell size={22} />
                </div>

                <div>
                  <h2 className="text-2xl font-black">
                    Athlete Info
                  </h2>

                  <p className="text-zinc-500 text-sm">
                    Fitness profile
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <InfoRow
                  label="Current workout"
                  value={profile.current_workout || "Not set"}
                />

                <InfoRow
                  label="Total XP"
                  value={`${profile.xp || 0} XP`}
                />

                <InfoRow label="Level" value={`Level ${level}`} />

                <InfoRow
                  label="Streak"
                  value={`${profile.streak || 0} days`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div
      className="
        bg-zinc-50
        border
        border-zinc-200
        rounded-2xl
        p-5
        shadow-sm

        dark:bg-black/30
        dark:border-white/10
      "
    >
      <div className="text-purple-500 mb-3">
        {icon}
      </div>

      <h3 className="text-2xl font-black">
        {value}
      </h3>

      <p className="text-zinc-500 text-sm mt-1">
        {label}
      </p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-4
        border-b
        border-zinc-200
        pb-4

        dark:border-white/10
      "
    >
      <span className="text-zinc-500">
        {label}
      </span>

      <span className="font-bold text-right">
        {value}
      </span>
    </div>
  );
}

export default Profile;