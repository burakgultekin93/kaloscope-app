import { Platform } from 'react-native';

// Only import expo-notifications on native platforms
let Notifications: any = null;

if (Platform.OS !== 'web') {
    try {
        Notifications = require('expo-notifications');
        // Configure notification behavior (native only)
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: false,
            }),
        });
    } catch (e) {
        console.warn('expo-notifications not available:', e);
    }
}

export async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'web' || !Notifications) return;

    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            return;
        }

        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#4CAF50',
            });
        }
    } catch (e) {
        console.warn('Push notification registration failed:', e);
    }
}

export async function scheduleReminders(prefs: {
    remind_water: boolean;
    remind_fruit: boolean;
    remind_snacks: boolean;
}) {
    if (Platform.OS === 'web' || !Notifications) return;

    try {
        // Clear existing notifications first
        await Notifications.cancelAllScheduledNotificationsAsync();

        if (prefs.remind_water) {
            for (let hour = 9; hour <= 21; hour += 2) {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: "💧 Su Vakti!",
                        body: "Vücudunun suya ihtiyacı var. Bir bardak su içmeye ne dersin?",
                    },
                    trigger: { hour, minute: 0, repeats: true },
                });
            }
        }

        if (prefs.remind_fruit) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "🍎 Vitamin Deposu!",
                    body: "Günün meyvesini yeme vakti geldi. Taze bir meyve ile enerjini tazele!",
                },
                trigger: { hour: 16, minute: 0, repeats: true },
            });
        }

        if (prefs.remind_snacks) {
            const times = [11, 17];
            for (const hour of times) {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: "🍿 Sağlıklı Atıştırmalık!",
                        body: "Küçük bir ara öğün kan şekerini dengeler. Sağlıklı bir şeyler seç!",
                    },
                    trigger: { hour, minute: 30, repeats: true },
                });
            }
        }
    } catch (e) {
        console.warn('Schedule reminders failed:', e);
    }
}
