import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as webpush from 'web-push';
import { UserType } from 'generated/prisma';

type WebPushSubscription = {
  endpoint: string;
  p256dh?: string;   // optional for Firefox
  auth?: string;     // optional for Firefox
  contentEncoding?: 'aes128gcm' | 'aesgcm'; // Chrome vs Firefox
};

@Injectable()
export class PushNotificationsService {
  constructor(private readonly prisma: PrismaService) {
    webpush.setVapidDetails(
      'mailto:your-email@example.com',
      process.env.VAPID_PUBLIC_KEY ?? '',
      process.env.VAPID_PRIVATE_KEY ?? '',
    );
  }

  // ───────────────────────────────
  // SUBSCRIBE USER
  // ───────────────────────────────
  async subscribe(
    userId: string,
    type: UserType,
    subscription: WebPushSubscription,
    label?: string,
  ) {
    // manually enforce endpoint uniqueness
    const existing = await this.prisma.pushSubscription.findFirst({
      where: { endpoint: subscription.endpoint },
    });

    if (existing) {
      return await this.prisma.pushSubscription.update({
        where: { id: existing.id },
        data: {
          p256dh: subscription.p256dh ?? null,
          auth: subscription.auth ?? null,
          contentEncoding: subscription.contentEncoding ?? 'aes128gcm',
          userId,
          type,
          label,
        },
      });
    }

    return await this.prisma.pushSubscription.create({
      data: {
        userId,
        type,
        endpoint: subscription.endpoint,
        p256dh: subscription.p256dh ?? null,
        auth: subscription.auth ?? null,
        contentEncoding: subscription.contentEncoding ?? 'aes128gcm',
        label,
      },
    });
  }

  // ───────────────────────────────
  // UNSUBSCRIBE SINGLE DEVICE
  // ───────────────────────────────
  async unsubscribeDevice(userId: string, type: UserType, endpoint: string) {
    // manually find by endpoint (no unique index on LongText)
    const sub = await this.prisma.pushSubscription.findFirst({
      where: { endpoint },
    });

    if (!sub || sub.userId !== userId || sub.type !== type) {
      throw new NotFoundException('Subscription not found for this device');
    }

    await this.prisma.pushSubscription.delete({
      where: { id: sub.id },
    });

    return { success: true, message: 'Device unsubscribed successfully' };
  }

  // ───────────────────────────────
  // UNSUBSCRIBE ALL DEVICES FOR USER
  // ───────────────────────────────
  async unsubscribeAllDevices(userId: string, type: UserType) {
    const deleted = await this.prisma.pushSubscription.deleteMany({
      where: { userId, type },
    });

    return {
      success: true,
      message: `Unsubscribed ${deleted.count} devices for the user`,
    };
  }

  // ───────────────────────────────
  // SEND TO A SINGLE USER (all devices)
  // ───────────────────────────────
  async sendToUser(userId: string, type: UserType, payload: any) {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId, type },
    });

    if (!subscriptions.length) {
      return { success: false, message: 'No subscriptions found for user' };
    }

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh ?? '',
                auth: sub.auth ?? '',
              },
            },
            JSON.stringify(payload),
            {
              // Firefox uses aesgcm, Chrome uses aes128gcm
              contentEncoding: (sub.contentEncoding as 'aes128gcm' | 'aesgcm') ?? 'aes128gcm',
            },
          );
          return { success: true, endpoint: sub.endpoint };
        } catch (error: any) {
          console.error(`Failed to send to ${sub.endpoint}:`, error);
          if (error?.statusCode === 410) {
            await this.prisma.pushSubscription
              .delete({ where: { id: sub.id } })
              .catch((e) => console.error(`Failed to delete expired sub (id=${sub.id}):`, e));
          }
          throw error;
        }
      }),
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    return { success: true, sent: successful, total: subscriptions.length };
  }

  // ───────────────────────────────
  // SEND TO ALL USERS OF A TYPE
  // ───────────────────────────────
  async sendToAll(type: UserType, payload: any) {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { type },
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh ?? '',
                auth: sub.auth ?? '',
              },
            },
            JSON.stringify(payload),
            {
              contentEncoding: (sub.contentEncoding as 'aes128gcm' | 'aesgcm') ?? 'aes128gcm',
            },
          );
          return { success: true, endpoint: sub.endpoint };
        } catch (error: any) {
          console.error(`Failed to send to ${sub.endpoint}:`, error?.message);
          if (error?.statusCode === 410) {
            await this.prisma.pushSubscription
              .delete({ where: { id: sub.id } })
              .catch((e) => console.error(`Failed to delete expired sub (id=${sub.id}):`, e));
          }
          throw error;
        }
      }),
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    return { success: true, sent: successful, total: subscriptions.length };
  }

  // ───────────────────────────────
  // GET SUBSCRIPTIONS OF A USER
  // ───────────────────────────────
  async getSubscriptions(userId: string, type: UserType) {
    return this.prisma.pushSubscription.findMany({
      where: { userId, type },
    });
  }

  // ───────────────────────────────
  // GET TOTAL SUBSCRIBED COUNT
  // ───────────────────────────────
  async getTotalSubscriptions(type?: UserType) {
    return this.prisma.pushSubscription.count({
      where: type ? { type } : {},
    });
  }
}