import { LocalNotifications } from "@capacitor/local-notifications";

export async function requestPermission(): Promise<boolean> {
  try {
    const { display } = await LocalNotifications.requestPermissions();
    return display === "granted";
  } catch {
    return false;
  }
}

export async function scheduleStreakReminder(): Promise<void> {
  await LocalNotifications.schedule({
    notifications: [
      {
        id: 1001,
        title: "🦨 Tunemyfart",
        body: "Tu n'as pas encore enregistré aujourd'hui !",
        schedule: { on: { hour: 20, minute: 0 }, repeats: true },
      },
    ],
  });
}

export async function scheduleMissionUnlocked(
  missionTitle: string
): Promise<void> {
  await LocalNotifications.schedule({
    notifications: [
      {
        id: Date.now(),
        title: "🏆 Mission débloquée !",
        body: missionTitle,
        schedule: { at: new Date(Date.now() + 200) },
      },
    ],
  });
}

export async function cancelStreakReminder(): Promise<void> {
  await LocalNotifications.cancel({ notifications: [{ id: 1001 }] });
}
