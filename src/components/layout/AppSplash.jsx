import BrandLogo from "./BrandLogo";
import { useLanguage } from "../../context/LanguageContext";

function AppSplash({ compact = false }) {
  const { t } = useLanguage();

  return (
    <div
      className="
        min-h-screen
        bg-zinc-50
        text-zinc-950
        flex
        items-center
        justify-center
        px-6
        transition-colors

        dark:bg-black
        dark:text-white
      "
    >
      <div className="relative flex flex-col items-center text-center">
        <div className="absolute h-44 w-44 rounded-full bg-fuchsia-500/20 blur-3xl" />

        <div
          className="
            relative
            rounded-[28px]
            border
            border-zinc-200
            bg-white/80
            px-8
            py-7
            shadow-2xl
            shadow-purple-500/10
            backdrop-blur-xl

            dark:border-white/10
            dark:bg-white/5
          "
        >
          <BrandLogo layout="stacked" size={compact ? "sm" : "md"} showTagline />

          <div className="mx-auto mt-6 h-2 w-44 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
            <div className="h-full w-1/2 animate-[loading-slide_1.1s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500" />
          </div>

          <p className="mt-4 text-sm font-bold text-zinc-500">
            {t("app.loading")}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AppSplash;
