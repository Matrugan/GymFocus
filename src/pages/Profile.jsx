import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { supabase } from "../lib/supabase";

import { useAuth } from "../context/AuthContext";

import { Heart } from "lucide-react";

import CommentSection from "../components/CommentSection";

import { useNavigate } from "react-router-dom";

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

  // LOAD PROFILE
  useEffect(() => {
    getProfile();
  }, []);

  // LOAD FOLLOW DATA
  useEffect(() => {
    if (profile && user) {
      getFollowers();
    }
  }, [profile, user]);

  // LOAD POSTS
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
    // FOLLOWERS
    const { data: followers } = await supabase
      .from("followers")
      .select("*")
      .eq("following_id", profile.id);

    setFollowersCount(followers?.length || 0);

    // FOLLOWING
    const { data: following } = await supabase
      .from("followers")
      .select("*")
      .eq("follower_id", profile.id);

    setFollowingCount(following?.length || 0);

    // CHECK IF CURRENT USER FOLLOWS
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

    setPosts(data);
  }

  async function getLikes() {
    const { data, error } = await supabase.from("likes").select("*");

    if (error) {
      console.log(error);

      return;
    }

    setLikes(data);
  }

  async function toggleLike(postId) {
    const existingLike = likes.find(
      (like) => like.post_id === postId && like.user_id === user.id,
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
    // verifica se já existe conversa
    const { data: existingParticipants } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);

    if (existingParticipants?.length > 0) {
      const conversationIds = existingParticipants.map(
        (item) => item.conversation_id,
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

    // cria conversa
    const { data: conversation, error } = await supabase
      .from("conversations")
      .insert([{}])
      .select()
      .single();

    if (error) {
      console.log(error);

      return;
    }

    // adiciona participantes
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
    return <div className="text-white p-10">Loading...</div>;
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
          max-w-4xl
          mx-auto
        "
      >
        {/* PROFILE CARD */}
        <div
          className="
            bg-white/5
            border
            border-white/10
            rounded-3xl
            p-10
            backdrop-blur-xl
          "
        >
          <img
            src={profile.avatar_url}
            alt=""
            className="
              w-40
              h-40
              rounded-full
              object-cover
              border-4
              border-purple-500
            "
          />

          <h1
            className="
              text-5xl
              font-black
              mt-8
            "
          >
            {profile.username}
          </h1>

          <p
            className="
              text-zinc-400
              mt-4
              text-xl
            "
          >
            {profile.bio}
          </p>

          {/* FOLLOW STATS */}
          <div className="flex items-center gap-10 mt-8">
            <div>
              <p className="text-2xl font-bold">{followersCount}</p>

              <span className="text-zinc-400">Followers</span>
            </div>

            <div>
              <p className="text-2xl font-bold">{followingCount}</p>

              <span className="text-zinc-400">Following</span>
            </div>
          </div>

          {/* FOLLOW BUTTON */}
          {user?.id !== profile.id && (
            <button
              onClick={toggleFollow}
              className="
                mt-8
                px-8
                py-4
                rounded-2xl
                bg-gradient-to-r
                from-purple-500
                to-fuchsia-500
                font-bold
                hover:scale-105
                transition
              "
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          )}
          <button
            onClick={startConversation}
            className="
    mt-4
    ml-4
    px-8
    py-4
    rounded-2xl
    bg-white/10
    border
    border-white/10
    font-bold
    hover:border-purple-500
    transition
  "
          >
            Message
          </button>
        </div>

        {/* POSTS */}
        <div className="mt-10 space-y-6">
          <h2 className="text-3xl font-black">Posts</h2>

          {posts.length === 0 && (
            <div
              className="
        bg-white/5
        border
        border-white/10
        rounded-3xl
        p-8
      "
            >
              No posts yet.
            </div>
          )}

          {posts.map((post) => (
            <div
              key={post.id}
              className="
        bg-white/5
        border
        border-white/10
        rounded-3xl
        p-8
        backdrop-blur-xl
      "
            >
              {/* POST CONTENT */}
              <p
                className="
          text-lg
          text-zinc-200
          leading-relaxed
        "
              >
                {post.content}
              </p>

              {/* IMAGE */}
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
          "
                />
              )}

              {/* DATE */}
              <p className="text-zinc-500 text-sm mt-4">
                {new Date(post.created_at).toLocaleDateString()}
              </p>

              {/* LIKE BUTTON */}
              <div className="flex items-center gap-4 mt-6">
                <button
                  onClick={() => toggleLike(post.id)}
                  className="
            flex
            items-center
            gap-2
            text-zinc-400
            hover:text-pink-500
            transition
          "
                >
                  <Heart
                    size={20}
                    fill={
                      likes.find(
                        (like) =>
                          like.post_id === post.id && like.user_id === user.id,
                      )
                        ? "currentColor"
                        : "none"
                    }
                  />

                  {likes.filter((like) => like.post_id === post.id).length}
                </button>
              </div>

              {/* COMMENTS */}
              <CommentSection postId={post.id} user={user} profile={profile} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Profile;
