import { useState } from "react";

import { supabase } from "../../lib/supabase";

import { Send, Loader2 } from "lucide-react";

import toast from "react-hot-toast";

import { unlockAchievement } from "../../utils/achievementSystem";

import ImageUploader from "../upload/ImageUploader";

function CreatePost({ user, profile, onPostCreated }) {
  const [content, setContent] = useState("");

  const [image, setImage] = useState(null);

  const [loading, setLoading] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);

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
    setUploadProgress(0);

    let image_url = null;

    if (image) {
      if (!image.type.startsWith("image/")) {
        toast.error("Please select a valid image.");
        setLoading(false);
        setUploadProgress(0);
        return;
      }

      if (image.size > 5 * 1024 * 1024) {
        toast.error("Image is too large. Maximum size is 5MB.");
        setLoading(false);
        setUploadProgress(0);
        return;
      }

      setUploadProgress(20);

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
        setUploadProgress(0);

        return;
      }

      setUploadProgress(70);

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
      setUploadProgress(0);

      return;
    }

    setUploadProgress(100);

    await unlockAchievement(user.id, "📸 First Post");

    setContent("");
    setImage(null);

    onPostCreated?.();

    toast.success("Post published!");

    setTimeout(() => {
      setUploadProgress(0);
    }, 500);

    setLoading(false);
  }

  return (
    <div
      className="
        w-full
        text-zinc-950
        border-0
        rounded-[var(--radius-soft)]
        p-4
        sm:p-6
        md:p-8
        min-w-0

        glass-card
        smooth-motion

        dark:text-white
      "
    >
      {/* HEADER */}
      <div
        className="
          flex
          items-center
          gap-3
          sm:gap-4
          mb-5
          sm:mb-6
          min-w-0
        "
      >
        <img
          src={profile?.avatar_url || "https://i.pravatar.cc/150"}
          alt=""
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
          <h2
            className="
              text-xl
              sm:text-2xl
              font-black
              truncate
            "
          >
            Share your progress
          </h2>

          <p
            className="
              text-zinc-600
              text-xs
              sm:text-sm
              mt-1
              truncate

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
          h-28
          sm:h-32
          resize-none
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
          placeholder:text-zinc-500
          text-sm
          sm:text-base

          dark:bg-black/30
          dark:text-white
          dark:border-white/10
          dark:placeholder:text-zinc-500
        "
      />

      {/* IMAGE UPLOADER */}
      <div className="mt-4 sm:mt-5">
        <ImageUploader
          image={image}
          setImage={setImage}
          label="Add image to your post"
          maxSizeMB={5}
          previewHeight="max-h-[260px] sm:max-h-[350px]"
        />
      </div>

      {/* UPLOAD PROGRESS */}
      {uploadProgress > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-zinc-500 mb-2">
            <span>
              {uploadProgress < 100 ? "Uploading..." : "Upload complete"}
            </span>

            <span>{uploadProgress}%</span>
          </div>

          <div
            className="
              w-full
              h-2
              bg-zinc-200
              dark:bg-zinc-800
              rounded-full
              overflow-hidden
            "
          >
            <div
              className="
                h-full
                bg-gradient-to-r
                from-purple-500
                to-fuchsia-500
                transition-[width,opacity]
                duration-300
                ease-[cubic-bezier(0.22,1,0.36,1)]
              "
              style={{
                width: `${uploadProgress}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* ACTIONS */}
      <div
        className="
          flex
          flex-col
          sm:flex-row
          sm:items-center
          sm:justify-end
          gap-3
          sm:gap-4
          mt-4
          sm:mt-5
        "
      >
        <button
          type="button"
          onClick={handlePost}
          disabled={loading}
          className="
            w-full
            sm:w-auto
            px-8
            py-4
            rounded-[var(--radius-soft-sm)]
            bg-gradient-to-r
            from-purple-500
            to-fuchsia-500
            text-white
            font-bold
            flex
            items-center
            justify-center
            gap-3
            shadow-color
            hover:-translate-y-[1px]
            hover:shadow-[0_18px_60px_rgba(168,85,247,0.25)]
            transition
            duration-300
            ease-[cubic-bezier(0.22,1,0.36,1)]
            disabled:opacity-50
            disabled:hover:translate-y-0
            text-sm
            sm:text-base
          "
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Publishing...
            </>
          ) : (
            <>
              <Send size={20} />
              Publish Post
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default CreatePost;