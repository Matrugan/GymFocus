import { useEffect, useState } from "react"

import { supabase } from "../lib/supabase"

import { Send } from "lucide-react"

function CommentSection({ postId, user, profile }) {

  const [comments, setComments] = useState([])

  const [content, setContent] = useState("")

  useEffect(() => {

  getComments();

  const commentsChannel = supabase
    .channel(`comments-${postId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "comments",
      },
      () => {
        getComments();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(commentsChannel);
  };

}, []);

  async function getComments() {

    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", {
        ascending: true,
      })

    if (error) {

      console.log(error)

      return

    }

    setComments(data)

  }

  async function handleComment() {

    if (!content.trim()) return

    const { error } = await supabase
      .from("comments")
      .insert([
        {
          post_id: postId,
          user_id: user.id,
          username: profile.username,
          content,
        }
      ])

    if (error) {

      console.log(error)

      return

    }

    setContent("")

    getComments()

  }

  return (

    <div className="mt-6">

      {/* LIST COMMENTS */}

      <div className="space-y-4">

        {comments.map((comment) => (

          <div
            key={comment.id}
            className="
              bg-black/20
              border
              border-white/5
              rounded-2xl
              p-4
            "
          >

            <h4 className="font-bold text-sm text-purple-400">
              {comment.username}
            </h4>

            <p className="text-zinc-300 mt-1">
              {comment.content}
            </p>

          </div>

        ))}

      </div>

      {/* INPUT */}

      <div className="flex gap-3 mt-5">

        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          className="
            flex-1
            bg-black/30
            border
            border-white/10
            rounded-2xl
            px-5
            py-4
            outline-none
            focus:border-purple-500
          "
        />

        <button
          onClick={handleComment}
          className="
            px-5
            rounded-2xl
            bg-gradient-to-r
            from-purple-500
            to-fuchsia-500
            hover:scale-105
            transition
          "
        >

          <Send />

        </button>

      </div>

    </div>

  )
}

export default CommentSection