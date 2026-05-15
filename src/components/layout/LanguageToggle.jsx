import { Languages } from "lucide-react";

import { useLanguage } from "../../context/LanguageContext";

function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      className="
        inline-flex
        items-center
        gap-1
        rounded-2xl
        border
        border-zinc-200
        bg-zinc-100
        p-1
        text-zinc-900
        transition

        dark:border-white/10
        dark:bg-white/5
        dark:text-white
      "
      title={t("language.switchTo")}
    >
      <Languages size={18} className="ml-2 text-purple-500" />

      {["en", "pt"].map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLanguage(option)}
          className={`
            min-w-10
            rounded-xl
            px-2.5
            py-2
            text-xs
            font-black
            transition

            ${
              language === option
                ? "bg-purple-500 text-white shadow-sm"
                : "text-zinc-600 hover:text-purple-500 dark:text-zinc-300"
            }
          `}
          aria-pressed={language === option}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default LanguageToggle;
