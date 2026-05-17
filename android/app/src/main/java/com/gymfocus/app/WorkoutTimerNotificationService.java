package com.gymfocus.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.IBinder;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

public class WorkoutTimerNotificationService extends Service {
    public static final String ACTION_START = "com.gymfocus.app.workout_timer.START";
    public static final String ACTION_PAUSE = "com.gymfocus.app.workout_timer.PAUSE";
    public static final String ACTION_RESUME = "com.gymfocus.app.workout_timer.RESUME";
    public static final String ACTION_CANCEL = "com.gymfocus.app.workout_timer.CANCEL";

    public static final String EXTRA_STORAGE_KEY = "storageKey";
    public static final String EXTRA_TITLE = "title";
    public static final String EXTRA_SUBTITLE = "subtitle";
    public static final String EXTRA_SESSION_STARTED_AT = "sessionStartedAt";
    public static final String EXTRA_STARTED_AT = "startedAt";
    public static final String EXTRA_ELAPSED_BEFORE_PAUSE = "elapsedBeforePause";

    public static final String PREFS_NAME = "gymfocus_workout_timer_notification";
    public static final String KEY_ACTIVE = "active";
    public static final String KEY_STORAGE_KEY = "storageKey";
    public static final String KEY_TITLE = "title";
    public static final String KEY_SUBTITLE = "subtitle";
    public static final String KEY_SESSION_STARTED_AT = "sessionStartedAt";
    public static final String KEY_STARTED_AT = "startedAt";
    public static final String KEY_ELAPSED_BEFORE_PAUSE = "elapsedBeforePause";
    public static final String KEY_PAUSED = "paused";

    private static final String CHANNEL_ID = "gymfocus_workout_timer";
    private static final int NOTIFICATION_ID = 2407;

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String action = intent != null ? intent.getAction() : ACTION_START;

        if (ACTION_CANCEL.equals(action)) {
            clearTimerState();
            stopForeground(true);
            stopSelf();
            return START_NOT_STICKY;
        }

        if (ACTION_PAUSE.equals(action)) {
            pauseTimer();
            updateNotification();
            return START_STICKY;
        }

        if (ACTION_RESUME.equals(action)) {
            resumeTimer(intent);
            updateNotification();
            return START_STICKY;
        }

        startTimer(intent);
        startForeground(NOTIFICATION_ID, buildNotification());
        return START_STICKY;
    }

    private void startTimer(Intent intent) {
        long now = System.currentTimeMillis();
        SharedPreferences.Editor editor = getPrefs().edit()
            .putBoolean(KEY_ACTIVE, true)
            .putBoolean(KEY_PAUSED, false)
            .putString(KEY_STORAGE_KEY, getStringExtra(intent, EXTRA_STORAGE_KEY, ""))
            .putString(KEY_TITLE, getStringExtra(intent, EXTRA_TITLE, "Timer do treino"))
            .putString(KEY_SUBTITLE, getStringExtra(intent, EXTRA_SUBTITLE, "Treino em andamento"))
            .putLong(KEY_SESSION_STARTED_AT, getLongExtra(intent, EXTRA_SESSION_STARTED_AT, now))
            .putLong(KEY_STARTED_AT, getLongExtra(intent, EXTRA_STARTED_AT, now))
            .putLong(KEY_ELAPSED_BEFORE_PAUSE, getLongExtra(intent, EXTRA_ELAPSED_BEFORE_PAUSE, 0));

        editor.apply();
    }

    private void pauseTimer() {
        SharedPreferences prefs = getPrefs();
        if (!prefs.getBoolean(KEY_ACTIVE, false) || prefs.getBoolean(KEY_PAUSED, false)) {
            return;
        }

        long startedAt = prefs.getLong(KEY_STARTED_AT, 0);
        long elapsedBeforePause = prefs.getLong(KEY_ELAPSED_BEFORE_PAUSE, 0);
        long elapsed = elapsedBeforePause;

        if (startedAt > 0) {
            elapsed += Math.max(0, (System.currentTimeMillis() - startedAt) / 1000);
        }

        prefs.edit()
            .putBoolean(KEY_PAUSED, true)
            .putLong(KEY_STARTED_AT, 0)
            .putLong(KEY_ELAPSED_BEFORE_PAUSE, elapsed)
            .apply();
    }

    private void resumeTimer(Intent intent) {
        SharedPreferences prefs = getPrefs();
        if (!prefs.getBoolean(KEY_ACTIVE, false)) {
            startTimer(intent);
            return;
        }

        prefs.edit()
            .putBoolean(KEY_PAUSED, false)
            .putLong(KEY_STARTED_AT, System.currentTimeMillis())
            .apply();
    }

    private void updateNotification() {
        NotificationManagerCompat.from(this).notify(NOTIFICATION_ID, buildNotification());
    }

    private Notification buildNotification() {
        createNotificationChannel();

        SharedPreferences prefs = getPrefs();
        boolean paused = prefs.getBoolean(KEY_PAUSED, false);
        long elapsedSeconds = getElapsedSeconds(this);
        String title = prefs.getString(KEY_TITLE, "Timer do treino");
        String subtitle = prefs.getString(KEY_SUBTITLE, "Treino em andamento");

        Intent launchIntent = new Intent(this, MainActivity.class);
        launchIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent contentIntent = PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | getImmutableFlag()
        );

        Intent toggleIntent = new Intent(this, WorkoutTimerNotificationService.class)
            .setAction(paused ? ACTION_RESUME : ACTION_PAUSE);
        PendingIntent togglePendingIntent = PendingIntent.getService(
            this,
            1,
            toggleIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | getImmutableFlag()
        );

        Intent cancelIntent = new Intent(this, WorkoutTimerNotificationService.class)
            .setAction(ACTION_CANCEL);
        PendingIntent cancelPendingIntent = PendingIntent.getService(
            this,
            2,
            cancelIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | getImmutableFlag()
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentTitle(title)
            .setContentText(paused ? "Pausado - " + formatDuration(elapsedSeconds) : subtitle)
            .setContentIntent(contentIntent)
            .setOngoing(!paused)
            .setOnlyAlertOnce(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_STOPWATCH)
            .addAction(
                paused ? android.R.drawable.ic_media_play : android.R.drawable.ic_media_pause,
                paused ? "Retomar" : "Pausar",
                togglePendingIntent
            )
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Cancelar", cancelPendingIntent);

        if (!paused) {
            builder.setUsesChronometer(true)
                .setWhen(System.currentTimeMillis() - (elapsedSeconds * 1000));
        }

        return builder.build();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }

        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            "Timer do treino",
            NotificationManager.IMPORTANCE_LOW
        );
        channel.setDescription("Mostra o timer do treino em andamento.");

        NotificationManager manager = getSystemService(NotificationManager.class);
        if (manager != null) {
            manager.createNotificationChannel(channel);
        }
    }

    public static long getElapsedSeconds(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        long elapsedBeforePause = prefs.getLong(KEY_ELAPSED_BEFORE_PAUSE, 0);

        if (prefs.getBoolean(KEY_PAUSED, false)) {
            return elapsedBeforePause;
        }

        long startedAt = prefs.getLong(KEY_STARTED_AT, 0);
        if (startedAt <= 0) {
            return elapsedBeforePause;
        }

        return elapsedBeforePause + Math.max(0, (System.currentTimeMillis() - startedAt) / 1000);
    }

    private SharedPreferences getPrefs() {
        return getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
    }

    private void clearTimerState() {
        getPrefs().edit().clear().apply();
    }

    private static int getImmutableFlag() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            return PendingIntent.FLAG_IMMUTABLE;
        }

        return 0;
    }

    private static String getStringExtra(Intent intent, String key, String fallback) {
        if (intent == null) {
            return fallback;
        }

        String value = intent.getStringExtra(key);
        return value != null ? value : fallback;
    }

    private static long getLongExtra(Intent intent, String key, long fallback) {
        if (intent == null) {
            return fallback;
        }

        return intent.getLongExtra(key, fallback);
    }

    private static String formatDuration(long seconds) {
        long hours = seconds / 3600;
        long minutes = (seconds % 3600) / 60;
        long remainingSeconds = seconds % 60;

        if (hours > 0) {
            return String.format("%d:%02d:%02d", hours, minutes, remainingSeconds);
        }

        return String.format("%02d:%02d", minutes, remainingSeconds);
    }
}
