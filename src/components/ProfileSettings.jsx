import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

import {
  Camera,
  Save,
  Loader2,
  ImagePlus,
  User,
} from "lucide-react";

import toast from "react-hot-toast";

function ProfileSettings({ profile, user }) {
  const [bio, setBio] = useState("");

  const [loadingAvatar, setLoadingAvatar] = useState(false);

  const [loadingBanner, setLoadingBanner] = useState(false);

  const [loadingBio, setLoadingBio] = useState(false);

  useEffect(() => {
    if (profile?.bio) {
      setBio(profile.bio);
    }
  }, [profile]);

  async function uploadAvatar(e) {
    const file = e.target.files[0];

    if (!file) return;

    setLoadingAvatar(true);

    const fileExt = file.name.split(".").pop();

    const fileName = `${user.id}.${fileExt}`;

    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        upsert: true,
      });

    if (uploadError) {
      console.log(uploadError);

      toast.error("Error uploading avatar.");

      setLoadingAvatar(false);

      return;
    }

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const avatar_url = data.publicUrl;

    const { error } = await supabase
      .from("profiles")
      .update({
        avatar_url,
      })
      .eq("id", user.id);

    if (error) {
      console.log(error);

      toast.error("Error updating avatar.");

      setLoadingAvatar(false);

      return;
    }

    toast.success("Avatar updated!");

    setLoadingAvatar(false);

    window.location.reload();
  }

  async function uploadBanner(e) {
    const file = e.target.files[0];

    if (!file) return;

    setLoadingBanner(true);

    const fileExt = file.name.split(".").pop();

    const fileName = `${user.id}-banner.${fileExt}`;

    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-banners")
      .upload(filePath, file, {
        upsert: true,
      });

    if (uploadError) {
      console.log(uploadError);

      toast.error("Error uploading banner.");

      setLoadingBanner(false);

      return;
    }

    const { data } = supabase.storage
      .from("profile-banners")
      .getPublicUrl(filePath);

    const banner_url = data.publicUrl;

    const { error } = await supabase
      .from("profiles")
      .update({
        banner_url,
      })
      .eq("id", user.id);

    if (error) {
      console.log(error);

      toast.error("Error updating banner.");

      setLoadingBanner(false);

      return;
    }

    toast.success("Banner updated!");

    setLoadingBanner(false);

    window.location.reload();
  }

  async function updateBio() {
    setLoadingBio(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        bio,
      })
      .eq("id", user.id);

    if (error) {
      console.log(error);

      toast.error("Error updating bio.");

      setLoadingBio(false);

      return;
    }

    toast.success("Profile updated!");

    setLoadingBio(false);
  }

  return (
    <div
      className="
        bg-white
        text-zinc-950
        border
        border-zinc-200
        rounded-3xl
        p-6
        md:p-8
        shadow-sm
        transition-colors

        dark:bg-white/5
        dark:text-white
        dark:border-white/10
        dark:backdrop-blur-xl
      "
    >
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className="
            w-14
            h-14
            rounded-2xl
            bg-gradient-to-r
            from-purple-500
            to-fuchsia-500
            text-white
            flex
            items-center
            justify-center
            shrink-0
          "
        >
          <User size={26} />
        </div>

        <div>
          <h2 className="text-3xl font-black">
            Profile Settings
          </h2>

          <p
            className="
              text-zinc-600
              mt-1

              dark:text-zinc-400
            "
          >
            Customize your public fitness profile.
          </p>
        </div>
      </div>

      {/* BANNER */}
      <div
        className="
          bg-zinc-50
          border
          border-zinc-200
          rounded-3xl
          p-5
          mb-8

          dark:bg-black/30
          dark:border-white/10
        "
      >
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <div>
            <h3 className="text-xl font-black">
              Profile Banner
            </h3>

            <p className="text-zinc-500 text-sm mt-1">
              This image appears at the top of your profile.
            </p>
          </div>

          <label
            className="
              flex
              items-center
              gap-3
              px-5
              py-3
              rounded-2xl
              bg-white
              text-zinc-800
              border
              border-zinc-200
              cursor-pointer
              hover:border-purple-500
              hover:text-purple-500
              transition
              shadow-sm

              dark:bg-white/5
              dark:text-zinc-300
              dark:border-white/10
              dark:hover:text-purple-400
            "
          >
            {loadingBanner ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <ImagePlus size={20} />
            )}

            <span className="font-bold">
              {loadingBanner ? "Uploading..." : "Change Banner"}
            </span>

            <input
              type="file"
              accept="image/*"
              onChange={uploadBanner}
              className="hidden"
            />
          </label>
        </div>

        <div
          className="
            w-full
            h-48
            rounded-3xl
            overflow-hidden
            border
            border-zinc-200
            bg-gradient-to-r
            from-purple-600
            to-fuchsia-600

            dark:border-white/10
          "
        >
          {profile?.banner_url ? (
            <img
              src={profile.banner_url}
              alt=""
              className="
                w-full
                h-full
                object-cover
              "
            />
          ) : (
            <div
              className="
                w-full
                h-full
                flex
                items-center
                justify-center
                text-white/80
                font-bold
              "
            >
              No banner selected
            </div>
          )}
        </div>
      </div>

      {/* AVATAR */}
      <div
        className="
          bg-zinc-50
          border
          border-zinc-200
          rounded-3xl
          p-5
          mb-8

          dark:bg-black/30
          dark:border-white/10
        "
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-5">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="
                  w-28
                  h-28
                  rounded-full
                  object-cover
                  border-4
                  border-purple-500
                  bg-zinc-100

                  dark:bg-zinc-900
                "
              />
            ) : (
              <div
                className="
                  w-28
                  h-28
                  rounded-full
                  bg-zinc-200
                  border-4
                  border-purple-500
                  flex
                  items-center
                  justify-center

                  dark:bg-zinc-800
                "
              >
                <User size={38} className="text-zinc-500" />
              </div>
            )}

            <div>
              <h3 className="text-xl font-black">
                Profile Picture
              </h3>

              <p className="text-zinc-500 text-sm mt-1">
                Recommended: square image, at least 300x300px.
              </p>
            </div>
          </div>

          <label
            className="
              flex
              items-center
              gap-3
              px-5
              py-3
              rounded-2xl
              bg-white
              text-zinc-800
              border
              border-zinc-200
              cursor-pointer
              hover:border-purple-500
              hover:text-purple-500
              transition
              shadow-sm

              dark:bg-white/5
              dark:text-zinc-300
              dark:border-white/10
              dark:hover:text-purple-400
            "
          >
            {loadingAvatar ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Camera size={20} />
            )}

            <span className="font-bold">
              {loadingAvatar ? "Uploading..." : "Change Avatar"}
            </span>

            <input
              type="file"
              accept="image/*"
              onChange={uploadAvatar}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* BIO */}
      <div
        className="
          bg-zinc-50
          border
          border-zinc-200
          rounded-3xl
          p-5

          dark:bg-black/30
          dark:border-white/10
        "
      >
        <div className="mb-4">
          <h3 className="text-xl font-black">
            Bio
          </h3>

          <p className="text-zinc-500 text-sm mt-1">
            Tell other athletes about your goals and training style.
          </p>
        </div>

        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Write your bio..."
          className="
            w-full
            h-36
            resize-none
            rounded-2xl
            bg-white
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
          "
        />

        <button
          type="button"
          onClick={updateBio}
          disabled={loadingBio}
          className="
            mt-5
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
          {loadingBio ? (
            <>
              <Loader2 className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={20} />
              Save Profile
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ProfileSettings;