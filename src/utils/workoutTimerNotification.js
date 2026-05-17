import { Capacitor, registerPlugin } from "@capacitor/core";

const WorkoutTimerNotificationPlugin = registerPlugin("WorkoutTimerNotification");

function isAvailable() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

export const workoutTimerNotification = {
  async start(payload) {
    if (!isAvailable()) return null;

    return WorkoutTimerNotificationPlugin.start(payload);
  },

  async pause() {
    if (!isAvailable()) return null;

    return WorkoutTimerNotificationPlugin.pause();
  },

  async resume(payload) {
    if (!isAvailable()) return null;

    return WorkoutTimerNotificationPlugin.resume(payload);
  },

  async cancel() {
    if (!isAvailable()) return null;

    return WorkoutTimerNotificationPlugin.cancel();
  },

  async getState() {
    if (!isAvailable()) return { active: false };

    return WorkoutTimerNotificationPlugin.getState();
  },

  async scheduleDailyReminders() {
    if (!isAvailable()) return null;

    return WorkoutTimerNotificationPlugin.scheduleDailyReminders();
  },

  async showWorkoutCompleted(payload) {
    if (!isAvailable()) return null;

    return WorkoutTimerNotificationPlugin.showWorkoutCompleted(payload);
  },
};
