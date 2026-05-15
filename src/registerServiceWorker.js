import { Capacitor } from "@capacitor/core";

export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (Capacitor.isNativePlatform()) return;
  if (!import.meta.env.PROD) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Service worker registration is best-effort; the app must keep working.
    });
  });
}
