import { useEffect, useState } from "react";

import {
  Camera,
  Save,
  Loader2,
  ImagePlus,
  User,
  Languages,
  Moon,
  Sun,
  Settings,
  Bell,
  ShieldCheck,
} from "lucide-react";

import toast from "react-hot-toast";
import { reportError } from "../../utils/errorHandler";
import {
  updateProfile,
  uploadProfileImage,
} from "../../services/profileService";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";

function ProfileSettings({ profile, user, onProfileUpdated }) {
  const { language, setLanguage, t, translate } = useLanguage();
  const { theme, setTheme } = useTheme();

  const [bio, setBio] = useState("");
  const [localPreferences, setLocalPreferences] = useState({
    progressTips: localStorage.getItem("gymfocus-progress-tips") !== "false",
    simpleMode: localStorage.getItem("gymfocus-simple-mode") === "true",
  });

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

  function updateLocalPreference(key, value) {
    setLocalPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
    localStorage.setItem(`gymfocus-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`, String(value));
    window.dispatchEvent(new Event("gymfocus-preferences-updated"));
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
          <Settings size={24} />
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
            {translate("Settings")}
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
            {language === "pt"
              ? "Organize seu perfil, idioma, aparência e preferências do app."
              : "Manage profile, language, appearance and app preferences."}
          </p>
        </div>
      </div>

      <SettingsSection
        icon={<Languages size={20} />}
        title={language === "pt" ? "Idioma e aparência" : "Language and appearance"}
        description={
          language === "pt"
            ? "Escolha como o app aparece para você."
            : "Choose how the app looks and reads for you."
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white border border-zinc-200 p-4 dark:bg-black/30 dark:border-white/10">
            <p className="text-sm font-black mb-3">
              {language === "pt" ? "Idioma" : "Language"}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <SegmentButton
                active={language === "pt"}
                onClick={() => setLanguage("pt")}
                text="Português"
              />
              <SegmentButton
                active={language === "en"}
                onClick={() => setLanguage("en")}
                text="English"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-zinc-200 p-4 dark:bg-black/30 dark:border-white/10">
            <p className="text-sm font-black mb-3">
              {language === "pt" ? "Tema" : "Theme"}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <SegmentButton
                active={theme === "light"}
                icon={<Sun size={17} />}
                onClick={() => setTheme("light")}
                text={language === "pt" ? "Claro" : "Light"}
              />
              <SegmentButton
                active={theme === "dark"}
                icon={<Moon size={17} />}
                onClick={() => setTheme("dark")}
                text={language === "pt" ? "Escuro" : "Dark"}
              />
            </div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        icon={<Bell size={20} />}
        title={language === "pt" ? "Preferências do app" : "App preferences"}
        description={
          language === "pt"
            ? "Preferências salvas neste aparelho."
            : "Preferences saved on this device."
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <PreferenceToggle
            checked={localPreferences.progressTips}
            description={
              language === "pt"
                ? "Salva sua preferência para dicas e resumos de evolução."
                : "Saves your preference for progress tips and summaries."
            }
            label={language === "pt" ? "Dicas de progresso" : "Progress tips"}
            onChange={(value) => updateLocalPreference("progressTips", value)}
          />
          <PreferenceToggle
            checked={localPreferences.simpleMode}
            description={
              language === "pt"
                ? "Deixa a navegação focada em Hoje, Treinos, Progresso e Medidas."
                : "Keeps navigation focused on Today, Workouts, Progress and Measurements."
            }
            label={language === "pt" ? "Modo simples" : "Simple mode"}
            onChange={(value) => updateLocalPreference("simpleMode", value)}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        icon={<ShieldCheck size={20} />}
        title={language === "pt" ? "Conta" : "Account"}
        description={
          language === "pt"
            ? "Informações básicas da sua sessão."
            : "Basic information about your session."
        }
      >
        <div className="rounded-2xl bg-white border border-zinc-200 p-4 dark:bg-black/30 dark:border-white/10">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide">
            Email
          </p>
          <p className="font-black mt-1 break-words">
            {user?.email || "-"}
          </p>
        </div>
      </SettingsSection>

      <SettingsSection
        icon={<User size={20} />}
        title={t("profile.settings")}
        description={translate("Customize your public fitness profile.")}
      >
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
      </SettingsSection>
    </div>
  );
}

function SettingsSection({ children, description, icon, title }) {
  return (
    <section
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
      <div className="flex items-start gap-3 mb-5">
        <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="text-lg sm:text-xl font-black">{title}</h3>
          <p className="text-zinc-500 text-sm mt-1">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function SegmentButton({ active, icon = null, onClick, text }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        px-4
        py-3
        rounded-2xl
        border
        font-black
        text-sm
        flex
        items-center
        justify-center
        gap-2
        transition
        ${
          active
            ? "bg-purple-500 text-white border-purple-500"
            : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-purple-500 dark:bg-white/5 dark:text-zinc-300 dark:border-white/10"
        }
      `}
    >
      {icon}
      {text}
    </button>
  );
}

function PreferenceToggle({ checked, description, label, onChange }) {
  return (
    <div className="rounded-2xl bg-white border border-zinc-200 p-4 flex items-center justify-between gap-4 dark:bg-black/30 dark:border-white/10">
      <div className="min-w-0">
        <p className="font-black">{label}</p>
        <p className="text-sm text-zinc-500 mt-1">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`
          w-14
          h-8
          rounded-full
          p-1
          shrink-0
          transition
          ${checked ? "bg-purple-500" : "bg-zinc-300 dark:bg-zinc-700"}
        `}
        aria-pressed={checked}
      >
        <span
          className={`
            block
            w-6
            h-6
            rounded-full
            bg-white
            transition
            ${checked ? "translate-x-6" : "translate-x-0"}
          `}
        />
      </button>
    </div>
  );
}

export default ProfileSettings;
