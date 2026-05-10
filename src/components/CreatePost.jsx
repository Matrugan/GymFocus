import { useState } from "react"

import { supabase } from "../lib/supabase"

import { Send } from "lucide-react"

function CreatePost({ user, profile, onPostCreated }) {

  const [content, setContent] = useState("")

  const [image, setImage] = useState(null)

 async function handlePost() {

  if (!content.trim()) return

  let image_url = null

  if (image) {

    const fileExt = image.name.split(".").pop()

    const fileName = `${Date.now()}.${fileExt}`

    const filePath = fileName

    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(filePath, image)

    if (uploadError) {

      console.log(uploadError)

      return

    }

    const { data } = supabase.storage
      .from("post-images")
      .getPublicUrl(filePath)

    image_url = data.publicUrl

  }

  const { error } = await supabase
    .from("posts")
    .insert([
      {
        user_id: user.id,
        username: profile.username,
        content,
        image_url,
      }
    ])

  if (error) {

    console.log(error)

    return

  }

  setContent("")

  setImage(null)

  onPostCreated()

}

  return (

    <div className="
      mt-14
      bg-white/5
      border
      border-white/10
      backdrop-blur-xl
      rounded-3xl
      p-8
    ">

      <h2 className="
        text-3xl
        font-black
        mb-6
      ">
        Share your progress
      </h2>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Completed Push Day today 🔥"
        className="
          w-full
          h-32
          resize-none
          rounded-2xl
          bg-black/30
          border
          border-white/10
          p-5
          outline-none
          focus:border-purple-500
        "
      />

      <input
        type="file"
        onChange={(e) => setImage(e.target.files[0])}
        className="mt-5"
        />

      <button
        onClick={handlePost}
        className="
          mt-5
          px-8
          py-4
          rounded-2xl
          bg-gradient-to-r
          from-purple-500
          to-fuchsia-500
          font-bold
          flex
          items-center
          gap-3
          hover:scale-105
          transition
        "
      >

        <Send />

        Publish Post

      </button>

    </div>

  )
}

export default CreatePost