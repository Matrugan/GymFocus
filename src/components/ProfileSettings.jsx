import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

function ProfileSettings({ profile, user }) {
  const [bio, setBio] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.bio) {
      setBio(profile.bio);
    }
  }, [profile]);

  async function uploadAvatar(e) {
    const file = e.target.files[0];

    if (!file) return;

    setLoading(true);

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

      setLoading(false);

      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

    const avatar_url = data.publicUrl;

    const { error } = await supabase
      .from("profiles")
      .update({
        avatar_url,
      })
      .eq("id", user.id);

    if (error) {
      console.log(error);
    }

    window.location.reload();
  }

  async function updateBio() {
    const { error } = await supabase
      .from("profiles")
      .update({
        bio,
      })
      .eq("id", user.id);

    if (error) {
      console.log(error);

      return;
    }

    alert("Bio updated!");
  }

  return (
    <div
      className="
      mt-14
      bg-white/5
      border
      border-white/10
      rounded-3xl
      p-8
      backdrop-blur-xl
    "
    >
      <h2
        className="
        text-3xl
        font-black
        mb-8
      "
      >
        Profile Settings
      </h2>

      {/* AVATAR */}

      <div className="mb-8">
        {profile?.avatar_url ? (
          <img
            src={profile?.avatar_url}
            alt=""
            className="
              w-32
              h-32
              rounded-full
              object-cover
              border-4
              border-purple-500
            "
          />
        ) : (
          <div
            className="
            w-32
            h-32
            rounded-full
            bg-zinc-800
            border-4
            border-purple-500
          "
          />
        )}

        <input type="file" onChange={uploadAvatar} className="mt-5" />
      </div>

      {/* BIO */}

      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Write your bio..."
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

      <button
        onClick={updateBio}
        className="
          mt-5
          px-8
          py-4
          rounded-2xl
          bg-gradient-to-r
          from-purple-500
          to-fuchsia-500
          font-bold
        "
      >
        Save Profile
      </button>
    </div>
  );
}

export default ProfileSettings;
