import { useRef, useState } from "react";

import { supabase } from "../lib/supabase";

import {
  Send,
  ImagePlus,
  Loader2,
  X,
} from "lucide-react";

import toast from "react-hot-toast";

import { unlockAchievement } from "../utils/achievementSystem";

function CreatePost({ user, profile, onPostCreated }) {
  const [content, setContent] = useState("");

  const [image, setImage] = useState(null);

  const [loading, setLoading] = useState(false);

  const imageInputRef = useRef(null);

  async function handlePost() {
    if (!content.trim()) {
      toast.error("Write something before publishing.");
      return;
    }

    if (!user || !profile) {
      toast.error("Profile not loaded yet.");
      return;
    }

    setLoading(true);

    let image_url = null;

    if (image) {
      const fileExt = image.name.split(".").pop();

      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(filePath, image, {
          upsert: false,
        });

      if (uploadError) {
        console.log(uploadError);

        toast.error("Error uploading image.");

        setLoading(false);

        return;
      }

      const { data } = supabase.storage
        .from("post-images")
        .getPublicUrl(filePath);

      image_url = data.publicUrl;
    }

    const { error } = await supabase.from("posts").insert([
      {
        user_id: user.id,
        username: profile.username,
        avatar_url: profile.avatar_url,
        content: content.trim(),
        image_url,
      },
    ]);

    if (error) {
      console.log(error);

      toast.error("Error publishing post.");

      setLoading(false);

      return;
    }

    await unlockAchievement(user.id, "📸 First Post");

    setContent("");

    setImage(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    onPostCreated?.();

    toast.success("Post published!");

    setLoading(false);
  }

  function removeImage() {
    setImage(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }

  return (
    <div
      className="
        bg-white
        text-zinc-950
        border
        border-zinc-200
        rounded-[30px]
        p-6
        md:p-8
        shadow-sm
        transition-colors

        dark:bg-zinc-950
        dark:text-white
        dark:border-white/10
        dark:backdrop-blur-xl
      "
    >
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={
            profile?.avatar_url ||
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

        <div>
          <h2 className="text-2xl font-black">
            Share your progress
          </h2>

          <p
            className="
              text-zinc-600
              text-sm
              mt-1

              dark:text-zinc-400
            "
          >
            Inspire other athletes today
          </p>
        </div>
      </div>

      {/* TEXTAREA */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Completed Push Day today 🔥"
        className="
          w-full
          h-32
          resize-none
          rounded-2xl
          bg-zinc-50
          text-zinc-950
          border
          border-zinc-200
          p-5
          outline-none
          focus:border-purple-500
          transition
          placeholder:text-zinc-500

          dark:bg-black/30
          dark:text-white
          dark:border-white/10
          dark:placeholder:text-zinc-500
        "
      />

      {/* IMAGE PREVIEW */}
      {image && (
        <div
          className="
            mt-5
            rounded-2xl
            overflow-hidden
            border
            border-zinc-200
            relative
            bg-zinc-100

            dark:border-white/10
            dark:bg-black/30
          "
        >
          <img
            src={URL.createObjectURL(image)}
            alt=""
            className="
              w-full
              max-h-[350px]
              object-cover
            "
          />

          <button
            type="button"
            onClick={removeImage}
            className="
              absolute
              top-4
              right-4
              w-10
              h-10
              rounded-full
              bg-white
              text-zinc-950
              border
              border-zinc-200
              flex
              items-center
              justify-center
              hover:bg-red-500
              hover:text-white
              transition
              shadow-lg

              dark:bg-zinc-900
              dark:text-white
              dark:border-white/10
              dark:hover:bg-red-500
            "
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* ACTIONS */}
      <div
        className="
          flex
          items-center
          justify-between
          gap-4
          mt-5
          flex-wrap
        "
      >
        <label
          className="
            flex
            items-center
            gap-3
            px-5
            py-3
            rounded-2xl
            bg-zinc-100
            text-zinc-700
            border
            border-zinc-200
            cursor-pointer
            hover:border-purple-500
            hover:text-purple-500
            transition

            dark:bg-white/5
            dark:text-zinc-300
            dark:border-white/10
            dark:hover:text-purple-400
          "
        >
          <ImagePlus size={20} />

          <span className="font-bold">
            Add Image
          </span>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImage(e.target.files[0])
            }
            className="hidden"
          />
        </label>

        <button
          type="button"
          onClick={handlePost}
          disabled={loading}
          className="
            px-8
            py-4
            rounded-2xl
            bg-gradient-to-r
            from-purple-500
            to-fuchsia-500
            text-white
            font-bold
            flex
            items-center
            gap-3
            hover:scale-105
            transition
            disabled:opacity-50
            disabled:hover:scale-100
          "
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Send />
              Publish Post
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default CreatePost;