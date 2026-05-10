import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

import { motion } from "framer-motion";

import { Pencil, Trash2, Save, X } from "lucide-react";

import CommentSection from "./CommentSection";

function Feed({ user, profile }) {

  const [posts, setPosts] = useState([]);

  const [editingPostId, setEditingPostId] = useState(null);

  const [editedContent, setEditedContent] = useState("");

  useEffect(() => {

    getPosts();

  }, []);

  async function getPosts() {

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {

      console.log(error);

      return;

    }

    setPosts(data);

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

    getPosts();

  }

  async function updatePost(postId) {

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

    setEditingPostId(null);

    getPosts();

  }

  return (

    <div className="mt-14 space-y-6">

      {posts.map((post, index) => (

        <motion.div
          key={post.id}
          initial={{
            opacity: 0,
            y: 40,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: index * 0.05,
          }}
          className="
            bg-white/5
            border
            border-white/10
            backdrop-blur-xl
            rounded-3xl
            p-8
          "
        >

          {/* HEADER */}
          <div
            className="
              flex
              justify-between
              items-center
              mb-5
            "
          >

            <div className="flex items-center gap-4">

              <div>

                <h3
                  className="
                    text-xl
                    font-bold
                  "
                >
                  {post.username}
                </h3>

                <p className="text-zinc-500 text-sm">
                  GymFocus Athlete
                </p>

              </div>

            </div>

            {user?.id === post.user_id && (

              <div className="flex gap-3">

                <button
                  onClick={() => {

                    setEditingPostId(post.id);

                    setEditedContent(post.content);

                  }}
                  className="
                    p-3
                    rounded-xl
                    bg-white/5
                    hover:bg-purple-500/20
                    transition
                  "
                >

                  <Pencil size={18} />

                </button>

                <button
                  onClick={() => deletePost(post.id)}
                  className="
                    p-3
                    rounded-xl
                    bg-white/5
                    hover:bg-red-500/20
                    transition
                  "
                >

                  <Trash2 size={18} />

                </button>

              </div>

            )}

          </div>

          {/* CONTENT */}
          {editingPostId === post.id ? (

            <div>

              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="
                  w-full
                  h-32
                  rounded-2xl
                  bg-black/30
                  border
                  border-white/10
                  p-5
                  outline-none
                "
              />

              <div className="flex gap-3 mt-4">

                <button
                  onClick={() => updatePost(post.id)}
                  className="
                    px-5
                    py-3
                    rounded-xl
                    bg-green-500
                    flex
                    items-center
                    gap-2
                  "
                >

                  <Save size={18} />

                  Save

                </button>

                <button
                  onClick={() => setEditingPostId(null)}
                  className="
                    px-5
                    py-3
                    rounded-xl
                    bg-zinc-700
                    flex
                    items-center
                    gap-2
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
                text-lg
                text-zinc-200
                leading-relaxed
              "
            >
              {post.content}
            </p>

          )}

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

          {/* COMMENTS */}
          <CommentSection
            postId={post.id}
            user={user}
            profile={profile}
          />

        </motion.div>

      ))}

    </div>

  );

}

export default Feed;