import { useLanguage } from "../../context/LanguageContext";

const logoSrc = "/gymfocus-favicon-pack/favicon-512x512.png";

const iconSizes = {
  sm: "w-11 h-11",
  md: "w-14 h-14",
  lg: "w-20 h-20",
};

const textSizes = {
  sm: {
    gym: "text-xl",
    focus: "text-xl",
  },
  md: {
    gym: "text-2xl",
    focus: "text-2xl",
  },
  lg: {
    gym: "text-4xl",
    focus: "text-4xl",
  },
};

function BrandLogo({
  layout = "horizontal",
  size = "md",
  className = "",
  showTagline = false,
}) {
  const { t } = useLanguage();
  const isStacked = layout === "stacked";
  const iconClass = iconSizes[size] || iconSizes.md;
  const textClass = textSizes[size] || textSizes.md;

  return (
    <div
      className={[
        "inline-flex min-w-0 items-center justify-center",
        isStacked ? "flex-col text-center" : "gap-3",
        className,
      ].join(" ")}
      aria-label="GymFocus"
    >
      <div
        className={[
          iconClass,
          "relative shrink-0 rounded-[1.15rem]",
          "bg-[#1a0d2f] ring-1 ring-fuchsia-400/40",
          "shadow-[0_0_28px_rgba(255,0,255,0.24)]",
          "overflow-hidden",
        ].join(" ")}
      >
        <img
          src={logoSrc}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-contain p-1.5"
        />
      </div>

      <div className={isStacked ? "mt-3 w-full" : "min-w-0"}>
        <p
          className={[
            textClass.gym,
            "font-black leading-none tracking-normal text-zinc-950 dark:text-white",
          ].join(" ")}
        >
          GYM
        </p>

        <p
          className={[
            textClass.focus,
            "font-black leading-none tracking-normal text-[#ff00ff]",
          ].join(" ")}
        >
          FOCUS
        </p>

        {showTagline ? (
          <p className="mx-auto mt-2 max-w-52 text-xs font-semibold leading-snug text-zinc-500 dark:text-zinc-400">
            {t("brand.tagline")}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default BrandLogo;
