import { Capacitor } from "@capacitor/core";

export function cleanupServiceWorkers() {
  if (!("serviceWorker" in navigator)) return;
  if (Capacitor.isNativePlatform()) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        void registration.unregister();
      });
    }).catch(() => {
      // Cleanup is best-effort; the site must keep opening normally.
    });

    if (!("caches" in window)) return;

    caches.keys().then((keys) => {
      keys
        .filter((key) => key.startsWith("gymfocus-pwa"))
        .forEach((key) => {
          void caches.delete(key);
        });
    }).catch(() => {
      // Cache cleanup is best-effort.
    });
  });
}
