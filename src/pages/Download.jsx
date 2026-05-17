import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  Download as DownloadIcon,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import BrandLogo from "../components/layout/BrandLogo";
import LanguageToggle from "../components/layout/LanguageToggle";
import ThemeToggle from "../components/layout/ThemeToggle";
import { useLanguage } from "../context/LanguageContext";

function Download() {
  const { language } = useLanguage();

  const benefits =
    language === "pt"
      ? [
          "Acesso direto ao app GymFocus",
          "Treinos, feed, chat e rankings em tela cheia",
          "Experiencia otimizada para Android",
        ]
      : [
          "Direct access to the GymFocus app",
          "Workouts, feed, chat and rankings in full screen",
          "Experience optimized for Android",
        ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-zinc-50 text-zinc-950 transition-colors dark:bg-black dark:text-white">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.2),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(217,70,239,0.14),transparent_35%)]" />

      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center">
          <BrandLogo size="sm" />
        </Link>

        <div className="flex items-center gap-3">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid max-w-6xl gap-8 px-6 py-16 lg:grid-cols-[1fr_.85fr] lg:items-center lg:py-24">
        <div>
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-black text-zinc-600 shadow-sm transition hover:border-purple-500 hover:text-purple-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
          >
            <ArrowLeft size={18} />
            {language === "pt" ? "Voltar para Home" : "Back to Home"}
          </Link>

          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm font-black text-purple-500">
            <Smartphone size={17} />
            {language === "pt" ? "App Android" : "Android App"}
          </p>

          <h1 className="max-w-3xl text-5xl font-black leading-tight md:text-7xl">
            {language === "pt"
              ? "Leve o GymFocus no bolso."
              : "Take GymFocus with you."}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            {language === "pt"
              ? "O app Android está preparado para entregar a experiência completa: treino do dia, progresso, feed, chat, desafios e rankings."
              : "The Android app is built for the full experience: daily workout, progress, feed, chat, challenges and rankings."}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#android-beta"
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-8 py-4 text-lg font-black text-white shadow-xl shadow-purple-500/20 transition hover:scale-[1.02]"
            >
              <DownloadIcon size={21} />
              {language === "pt" ? "Baixar app" : "Download app"}
            </a>

            <Link
              to="/signup"
              className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-8 py-4 text-lg font-black text-zinc-900 shadow-sm transition hover:border-purple-500 hover:text-purple-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              {language === "pt" ? "Criar conta" : "Create account"}
            </Link>
          </div>
        </div>

        <div
          id="android-beta"
          className="rounded-[34px] border border-zinc-200 bg-white p-6 shadow-2xl shadow-purple-500/10 dark:border-white/10 dark:bg-white/5"
        >
          <div className="rounded-[28px] bg-zinc-950 p-6 text-white">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-r from-purple-500 to-fuchsia-500">
              <Smartphone size={30} />
            </div>

            <h2 className="mt-8 text-3xl font-black">
              {language === "pt" ? "Android beta" : "Android beta"}
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-zinc-300">
              {language === "pt"
                ? "Baixe a versão beta para testes. Depois, este espaço pode apontar para a Play Store."
                : "Download the beta version for testing. Later, this area can point to the Play Store."}
            </p>

            <a
              href="/downloads/gymfocus-android-debug.apk"
              download
              className="mt-8 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-6 py-4 font-black text-white transition hover:scale-[1.01]"
            >
              <ShieldCheck size={20} />
              {language === "pt" ? "Baixar APK beta" : "Download beta APK"}
            </a>

            <p className="mt-3 text-xs leading-relaxed text-zinc-400">
              {language === "pt"
                ? "Arquivo beta para teste. Para publicação final, substitua este link pela Play Store."
                : "Beta file for testing. For the final release, replace this link with the Play Store."}
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-700 dark:border-white/10 dark:bg-black/30 dark:text-zinc-300"
              >
                <CheckCircle size={18} className="text-purple-500" />
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Download;
