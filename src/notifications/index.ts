import { Expo } from "expo-server-sdk"
import { checkNotificationTokenExists, createNotificationToken, getNotificationToken, updateNotificationToken } from "../supabase";

const expo = new Expo()

// Send Expo Push Notification
async function sendExpoNotification(token: string, title: string, body: string, data: any) {
    const messages = [{
      to: token,
      sound: 'default',
      title,
      body,
      data
    }];
  
    try {
      await expo.sendPushNotificationsAsync(messages);
    } catch (error) {
      console.error('Expo notification error:', error);
    }
}

async function sendFcmNotification(token: string, title: string, body:string, data: any) {
  return;

}

async function sendApnNotification(token: string, title: string, body:string, data: any) {
  return;
}

export async function sendNotification(userId: string, title: string, body: string, data: any) {
  const token = await getNotificationToken(userId);


  //Will be removed once Firebase Cloud Messaging and APN are setup for mobile
  if (token.expo) {
    await sendExpoNotification(token.expo, title, body, data);
  }

  if (token.fcm) {
    await sendFcmNotification(token.fcm, title, body, data);
  }

  if (token.apn) {
    await sendApnNotification(token.apn, title, body, data);
  }
}

export async function registerDevice(token: string, userId: string, platform: "ios" | "android" | "web") {
  const { exists, changed } = await checkNotificationTokenExists(userId, token);

  if (exists) return;

  if (changed) {
    return await updateNotificationToken(userId, token, platform);
  }
  return await createNotificationToken(userId, token, platform);
}