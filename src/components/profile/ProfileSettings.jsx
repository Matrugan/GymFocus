import { useEffect, useState } from "react";

import {
  Camera,
  Save,
  Loader2,
  ImagePlus,
  User,
} from "lucide-react";

import toast from "react-hot-toast";
import { reportError } from "../../utils/errorHandler";
import {
  updateProfile,
  uploadProfileImage,
} from "../../services/profileService";
import { useLanguage } from "../../context/LanguageContext";

function ProfileSettings({ profile, user, onProfileUpdated }) {
  const { t, translate } = useLanguage();

  const [bio, setBio] = useState("");

  const [loadingAvatar, setLoadingAvatar] = useState(false);

  const [loadingBanner, setLoadingBanner] = useState(false);

  const [loadingBio, setLoadingBio] = useState(false);

  useEffect(() => {
    if (profile?.bio) {
      setBio(profile.bio);
    }
  }, [profile]);

  function validateImage(file) {
    if (!file) return false;

    if (!file.type.startsWith("image/")) {
      toast.error(translate("Please select a valid image."));
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(translate("Image is too large. Maximum size is 5MB."));
      return false;
    }

    return true;
  }

  async function uploadAvatar(e) {
    const file = e.target.files[0];

    if (!validateImage(file)) return;

    setLoadingAvatar(true);

    const fileExt = file.name.split(".").pop();

    const fileName = `avatar.${fileExt}`;

    const filePath = `${user.id}/${fileName}`;

    const { data: avatar_url, error: uploadError } = await uploadProfileImage({
      bucket: "avatars",
      file,
      path: filePath,
    });

    if (uploadError) {
      reportError(uploadError, translate("Error uploading avatar."));

      setLoadingAvatar(false);
      e.target.value = "";

      return;
    }

    const { error } = await updateProfile(user.id, { avatar_url });

    if (error) {
      reportError(error, translate("Error updating avatar."));

      setLoadingAvatar(false);
      e.target.value = "";

      return;
    }

    toast.success(translate("Avatar updated!"));

    onProfileUpdated?.({
      ...profile,
      avatar_url,
    });

    setLoadingAvatar(false);

    e.target.value = "";
  }

  async function uploadBanner(e) {
    const file = e.target.files[0];

    if (!validateImage(file)) return;

    setLoadingBanner(true);

    const fileExt = file.name.split(".").pop();

    const fileName = `banner.${fileExt}`;

    const filePath = `${user.id}/${fileName}`;

    const { data: banner_url, error: uploadError } = await uploadProfileImage({
      bucket: "profile-banners",
      file,
      path: filePath,
    });

    if (uploadError) {
      reportError(uploadError, translate("Error uploading banner."));

      setLoadingBanner(false);
      e.target.value = "";

      return;
    }

    const { error } = await updateProfile(user.id, { banner_url });

    if (error) {
      reportError(error, translate("Error updating banner."));

      setLoadingBanner(false);
      e.target.value = "";

      return;
    }

    toast.success(translate("Banner updated!"));

    onProfileUpdated?.({
      ...profile,
      banner_url,
    });

    setLoadingBanner(false);

    e.target.value = "";
  }

  async function updateBio() {
    if (!user?.id) return;

    if (bio.length > 240) {
      toast.error(translate("Bio must have at most 240 characters."));
      return;
    }

    setLoadingBio(true);

    const { error } = await updateProfile(user.id, { bio });

    if (error) {
      reportError(error, translate("Error updating bio."));

      setLoadingBio(false);

      return;
    }

    toast.success(translate("Profile updated!"));

    onProfileUpdated?.({
      ...profile,
      bio,
    });

    setLoadingBio(false);
  }

  return (
    <div
      className="
        w-full
        bg-white
        text-zinc-950
        border
        border-zinc-200
        rounded-2xl
        sm:rounded-3xl
        p-4
        sm:p-6
        md:p-8
        shadow-sm
        transition-colors
        min-w-0

        dark:bg-white/5
        dark:text-white
        dark:border-white/10
        dark:backdrop-blur-xl
      "
    >
      {/* HEADER */}
      <div
        className="
          flex
          items-center
          gap-3
          sm:gap-4
          mb-6
          sm:mb-8
          min-w-0
        "
      >
        <div
          className="
            w-12
            h-12
            sm:w-14
            sm:h-14
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
          <User size={24} />
        </div>

        <div className="min-w-0">
          <h2
            className="
              text-2xl
              sm:text-3xl
              font-black
              break-words
            "
          >
            {t("profile.settings")}
          </h2>

          <p
            className="
              text-zinc-600
              mt-1
              text-sm
              sm:text-base

              dark:text-zinc-400
            "
          >
            {translate("Customize your public fitness profile.")}
          </p>
        </div>
      </div>

      {/* BANNER */}
      <div
        className="
          bg-zinc-50
          border
          border-zinc-200
          rounded-2xl
          sm:rounded-3xl
          p-4
          sm:p-5
          mb-6
          sm:mb-8
          min-w-0

          dark:bg-black/30
          dark:border-white/10
        "
      >
        <div
          className="
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-4
            mb-4
          "
        >
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-black">
              {translate("Profile Banner")}
            </h3>

            <p className="text-zinc-500 text-sm mt-1">
              {translate("This image appears at the top of your profile.")}
            </p>
          </div>

          <label
            className="
              w-full
              sm:w-auto
              flex
              items-center
              justify-center
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
              text-sm
              sm:text-base

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
              {loadingBanner ? translate("Uploading...") : translate("Change Banner")}
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
            h-36
            sm:h-48
            rounded-2xl
            sm:rounded-3xl
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
                text-sm
                sm:text-base
                text-center
                px-4
              "
            >
              {translate("No banner selected")}
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
          rounded-2xl
          sm:rounded-3xl
          p-4
          sm:p-5
          mb-6
          sm:mb-8
          min-w-0

          dark:bg-black/30
          dark:border-white/10
        "
      >
        <div
          className="
            flex
            flex-col
            lg:flex-row
            lg:items-center
            lg:justify-between
            gap-5
          "
        >
          <div
            className="
              flex
              flex-col
              sm:flex-row
              sm:items-center
              gap-4
              sm:gap-5
              min-w-0
            "
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="
                  w-24
                  h-24
                  sm:w-28
                  sm:h-28
                  rounded-full
                  object-cover
                  border-4
                  border-purple-500
                  bg-zinc-100
                  shrink-0

                  dark:bg-zinc-900
                "
              />
            ) : (
              <div
                className="
                  w-24
                  h-24
                  sm:w-28
                  sm:h-28
                  rounded-full
                  bg-zinc-200
                  border-4
                  border-purple-500
                  flex
                  items-center
                  justify-center
                  shrink-0

                  dark:bg-zinc-800
                "
              >
                <User size={36} className="text-zinc-500" />
              </div>
            )}

            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-black">
                {translate("Profile Picture")}
              </h3>

              <p className="text-zinc-500 text-sm mt-1">
                {translate("Recommended: square image, at least 300x300px.")}
              </p>
            </div>
          </div>

          <label
            className="
              w-full
              lg:w-auto
              flex
              items-center
              justify-center
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
              text-sm
              sm:text-base

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
              {loadingAvatar ? translate("Uploading...") : translate("Change Avatar")}
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
          rounded-2xl
          sm:rounded-3xl
          p-4
          sm:p-5
          min-w-0

          dark:bg-black/30
          dark:border-white/10
        "
      >
        <div className="mb-4">
          <h3 className="text-lg sm:text-xl font-black">
            {translate("Bio")}
          </h3>

          <p className="text-zinc-500 text-sm mt-1">
            {translate("Tell other athletes about your goals and training style.")}
          </p>
        </div>

        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder={translate("Write your bio...")}
          maxLength={240}
          className="
            w-full
            h-32
            sm:h-36
            resize-none
            rounded-2xl
            bg-white
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
          "
        />

        <div
          className="
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-4
            mt-4
            sm:mt-5
          "
        >
          <p className="text-xs sm:text-sm text-zinc-500">
            {bio.length}/240 {translate("characters")}
          </p>

          <button
            type="button"
            onClick={updateBio}
            disabled={loadingBio}
            className="
              w-full
              sm:w-auto
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
              justify-center
              gap-3
              hover:scale-105
              transition
              disabled:opacity-50
              disabled:hover:scale-100
              text-sm
              sm:text-base
            "
          >
            {loadingBio ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                {translate("Saving...")}
              </>
            ) : (
              <>
                <Save size={20} />
                {translate("Save Profile")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileSettings;
