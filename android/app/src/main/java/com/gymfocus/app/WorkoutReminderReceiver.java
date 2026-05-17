package com.gymfocus.app;

import android.Manifest;
import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;
import java.util.Calendar;

public class WorkoutReminderReceiver extends BroadcastReceiver {
    public static final String ACTION_SHOW_REMINDER = "com.gymfocus.app.workout_reminder.SHOW";
    private static final String ACTION_BOOT_COMPLETED = "android.intent.action.BOOT_COMPLETED";
    private static final String CHANNEL_ID = "gymfocus_workout_reminders";
    private static final String EXTRA_NOTIFICATION_ID = "notificationId";
    private static final String EXTRA_HOUR = "hour";
    private static final String EXTRA_MINUTE = "minute";
    private static final String EXTRA_TITLE = "title";
    private static final String EXTRA_BODY = "body";
    private static final int AFTERNOON_REQUEST_CODE = 1415;
    private static final int NIGHT_REQUEST_CODE = 2020;

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent != null ? intent.getAction() : "";

        if (ACTION_BOOT_COMPLETED.equals(action)) {
            scheduleDefaultDailyReminders(context);
            return;
        }

        if (!ACTION_SHOW_REMINDER.equals(action)) {
            return;
        }

        showReminder(context, intent);
    }

    public static void scheduleDefaultDailyReminders(Context context) {
        scheduleDailyReminder(
            context,
            AFTERNOON_REQUEST_CODE,
            15,
            0,
            "Hora de treinar",
            "Seu treino de hoje está te esperando. Bora manter o ritmo?"
        );
        scheduleDailyReminder(
            context,
            NIGHT_REQUEST_CODE,
            20,
            0,
            "Ainda dá tempo",
            "Feche o dia com um treino e mantenha sua evolução andando."
        );
    }

    private static void scheduleDailyReminder(
        Context context,
        int requestCode,
        int hour,
        int minute,
        String title,
        String body
    ) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) {
            return;
        }

        Intent intent = new Intent(context, WorkoutReminderReceiver.class)
            .setAction(ACTION_SHOW_REMINDER)
            .putExtra(EXTRA_NOTIFICATION_ID, requestCode)
            .putExtra(EXTRA_HOUR, hour)
            .putExtra(EXTRA_MINUTE, minute)
            .putExtra(EXTRA_TITLE, title)
            .putExtra(EXTRA_BODY, body);

        PendingIntent pendingIntent = PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | getImmutableFlag()
        );

        alarmManager.setInexactRepeating(
            AlarmManager.RTC_WAKEUP,
            getNextTriggerAt(hour, minute),
            AlarmManager.INTERVAL_DAY,
            pendingIntent
        );
    }

    private static void showReminder(Context context, Intent intent) {
        if (
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) !=
                PackageManager.PERMISSION_GRANTED
        ) {
            return;
        }

        createNotificationChannel(context);

        Intent launchIntent = new Intent(context, MainActivity.class);
        launchIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);

        PendingIntent contentIntent = PendingIntent.getActivity(
            context,
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | getImmutableFlag()
        );

        String title = intent.getStringExtra(EXTRA_TITLE);
        String body = intent.getStringExtra(EXTRA_BODY);
        int notificationId = intent.getIntExtra(EXTRA_NOTIFICATION_ID, AFTERNOON_REQUEST_CODE);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title != null ? title : "Hora de treinar")
            .setContentText(body != null ? body : "Seu treino de hoje está te esperando.")
            .setContentIntent(contentIntent)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setCategory(NotificationCompat.CATEGORY_REMINDER);

        NotificationManagerCompat.from(context).notify(notificationId, builder.build());
    }

    private static long getNextTriggerAt(int hour, int minute) {
        Calendar calendar = Calendar.getInstance();
        calendar.set(Calendar.HOUR_OF_DAY, hour);
        calendar.set(Calendar.MINUTE, minute);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);

        if (calendar.getTimeInMillis() <= System.currentTimeMillis()) {
            calendar.add(Calendar.DAY_OF_YEAR, 1);
        }

        return calendar.getTimeInMillis();
    }

    private static void createNotificationChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }

        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            "Lembretes de treino",
            NotificationManager.IMPORTANCE_DEFAULT
        );
        channel.setDescription("Notificações diárias para incentivar o treino.");

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
