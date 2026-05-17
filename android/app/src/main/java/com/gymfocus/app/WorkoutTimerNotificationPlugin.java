package com.gymfocus.app;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(
    name = "WorkoutTimerNotification",
    permissions = {
        @Permission(
            alias = WorkoutTimerNotificationPlugin.NOTIFICATION_PERMISSION_ALIAS,
            strings = { Manifest.permission.POST_NOTIFICATIONS }
        )
    }
)
public class WorkoutTimerNotificationPlugin extends Plugin {
    public static final String NOTIFICATION_PERMISSION_ALIAS = "notifications";
    private static final String WORKOUT_COMPLETED_CHANNEL_ID = "gymfocus_workout_completed";
    private static final int WORKOUT_COMPLETED_NOTIFICATION_ID = 2605;

    @PluginMethod
    public void start(PluginCall call) {
        if (needsNotificationPermission()) {
            requestPermissionForAlias(
                NOTIFICATION_PERMISSION_ALIAS,
                call,
                "notificationPermissionCallback"
            );
            return;
        }

        startTimerService(call, WorkoutTimerNotificationService.ACTION_START);
    }

    @PluginMethod
    public void pause(PluginCall call) {
        sendServiceAction(WorkoutTimerNotificationService.ACTION_PAUSE);
        call.resolve(getStateObject());
    }

    @PluginMethod
    public void resume(PluginCall call) {
        startTimerService(call, WorkoutTimerNotificationService.ACTION_RESUME);
    }

    @PluginMethod
    public void cancel(PluginCall call) {
        sendServiceAction(WorkoutTimerNotificationService.ACTION_CANCEL);
        call.resolve(getStateObject());
    }

    @PluginMethod
    public void getState(PluginCall call) {
        call.resolve(getStateObject());
    }

    @PluginMethod
    public void scheduleDailyReminders(PluginCall call) {
        if (needsNotificationPermission()) {
            requestPermissionForAlias(
                NOTIFICATION_PERMISSION_ALIAS,
                call,
                "dailyReminderPermissionCallback"
            );
            return;
        }

        WorkoutReminderReceiver.scheduleDefaultDailyReminders(getContext());
        call.resolve();
    }

    @PluginMethod
    public void showWorkoutCompleted(PluginCall call) {
        if (needsNotificationPermission()) {
            requestPermissionForAlias(
                NOTIFICATION_PERMISSION_ALIAS,
                call,
                "workoutCompletedPermissionCallback"
            );
            return;
        }

        showWorkoutCompletedNotification(call);
        call.resolve();
    }

    @PermissionCallback
    private void notificationPermissionCallback(PluginCall call) {
        if (getPermissionState(NOTIFICATION_PERMISSION_ALIAS) == PermissionState.GRANTED) {
            startTimerService(call, WorkoutTimerNotificationService.ACTION_START);
            return;
        }

        call.reject("Notification permission was not granted.");
    }

    @PermissionCallback
    private void dailyReminderPermissionCallback(PluginCall call) {
        if (getPermissionState(NOTIFICATION_PERMISSION_ALIAS) == PermissionState.GRANTED) {
            WorkoutReminderReceiver.scheduleDefaultDailyReminders(getContext());
            call.resolve();
            return;
        }

        call.reject("Notification permission was not granted.");
    }

    @PermissionCallback
    private void workoutCompletedPermissionCallback(PluginCall call) {
        if (getPermissionState(NOTIFICATION_PERMISSION_ALIAS) == PermissionState.GRANTED) {
            showWorkoutCompletedNotification(call);
            call.resolve();
            return;
        }

        call.reject("Notification permission was not granted.");
    }

    private boolean needsNotificationPermission() {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(
                getContext(),
                Manifest.permission.POST_NOTIFICATIONS
            ) != PackageManager.PERMISSION_GRANTED;
    }

    private void startTimerService(PluginCall call, String action) {
        Intent intent = new Intent(getContext(), WorkoutTimerNotificationService.class)
            .setAction(action)
            .putExtra(
                WorkoutTimerNotificationService.EXTRA_STORAGE_KEY,
                call.getString(WorkoutTimerNotificationService.EXTRA_STORAGE_KEY, "")
            )
            .putExtra(
                WorkoutTimerNotificationService.EXTRA_TITLE,
                call.getString(WorkoutTimerNotificationService.EXTRA_TITLE, "Timer do treino")
            )
            .putExtra(
                WorkoutTimerNotificationService.EXTRA_SUBTITLE,
                call.getString(
                    WorkoutTimerNotificationService.EXTRA_SUBTITLE,
                    "Treino em andamento"
                )
            )
            .putExtra(
                WorkoutTimerNotificationService.EXTRA_SESSION_STARTED_AT,
                call.getLong(WorkoutTimerNotificationService.EXTRA_SESSION_STARTED_AT, 0L)
            )
            .putExtra(
                WorkoutTimerNotificationService.EXTRA_STARTED_AT,
                call.getLong(WorkoutTimerNotificationService.EXTRA_STARTED_AT, 0L)
            )
            .putExtra(
                WorkoutTimerNotificationService.EXTRA_ELAPSED_BEFORE_PAUSE,
                call.getLong(WorkoutTimerNotificationService.EXTRA_ELAPSED_BEFORE_PAUSE, 0L)
            );

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            ContextCompat.startForegroundService(getContext(), intent);
        } else {
            getContext().startService(intent);
        }

        call.resolve(getStateObject());
    }

    private void sendServiceAction(String action) {
        Intent intent = new Intent(getContext(), WorkoutTimerNotificationService.class)
            .setAction(action);
        getContext().startService(intent);
    }

    private JSObject getStateObject() {
        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences(
            WorkoutTimerNotificationService.PREFS_NAME,
            Context.MODE_PRIVATE
        );
        boolean active = prefs.getBoolean(WorkoutTimerNotificationService.KEY_ACTIVE, false);
        boolean paused = prefs.getBoolean(WorkoutTimerNotificationService.KEY_PAUSED, false);
        long startedAt = prefs.getLong(WorkoutTimerNotificationService.KEY_STARTED_AT, 0);
        long sessionStartedAt = prefs.getLong(
            WorkoutTimerNotificationService.KEY_SESSION_STARTED_AT,
            0
        );
        long elapsedBeforePause = prefs.getLong(
            WorkoutTimerNotificationService.KEY_ELAPSED_BEFORE_PAUSE,
            0
        );

        JSObject state = new JSObject();
        state.put("active", active);
        state.put("paused", paused);
        state.put("storageKey", prefs.getString(WorkoutTimerNotificationService.KEY_STORAGE_KEY, ""));
        state.put("sessionStartedAt", sessionStartedAt > 0 ? sessionStartedAt : null);
        state.put("startedAt", startedAt > 0 ? startedAt : null);
        state.put("elapsedBeforePause", elapsedBeforePause);
        state.put("elapsedSeconds", WorkoutTimerNotificationService.getElapsedSeconds(context));

        return state;
    }

    private void showWorkoutCompletedNotification(PluginCall call) {
        Context context = getContext();
        createWorkoutCompletedChannel(context);

        Intent launchIntent = new Intent(context, MainActivity.class);
        launchIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent contentIntent = PendingIntent.getActivity(
            context,
            3,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | getImmutableFlag()
        );

        String title = call.getString("title", "Treino concluído");
        String body = call.getString("body", "Você concluiu seu treino de hoje.");

        NotificationCompat.Builder builder = new NotificationCompat.Builder(
                context,
                WORKOUT_COMPLETED_CHANNEL_ID
            )
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
            .setContentIntent(contentIntent)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setCategory(NotificationCompat.CATEGORY_STATUS);

        NotificationManagerCompat.from(context).notify(
            WORKOUT_COMPLETED_NOTIFICATION_ID,
            builder.build()
        );
    }

    private void createWorkoutCompletedChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }

        NotificationChannel channel = new NotificationChannel(
            WORKOUT_COMPLETED_CHANNEL_ID,
            "Treinos concluídos",
            NotificationManager.IMPORTANCE_DEFAULT
        );
        channel.setDescription("Resumo do treino concluído e calorias estimadas.");

        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager != null) {
            manager.createNotificationChannel(channel);
        }
    }

    private static int getImmutableFlag() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            return PendingIntent.FLAG_IMMUTABLE;
        }

        return 0;
    }
}
