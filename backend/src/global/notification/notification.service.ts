import { Injectable } from '@nestjs/common';
import * as webpush from 'web-push';

@Injectable()
export class NotificationService {
  private subscriptions: Map<string, any> = new Map();

  constructor() {
    // Set VAPID details
    webpush.setVapidDetails(
      'mailto:your-email@example.com',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY,
    );
  }

  // Store subscription
  addSubscription(subscription: any): void {
    this.subscriptions.set(subscription.endpoint, subscription);
  }

  // Remove subscription
  removeSubscription(endpoint: string): void {
    this.subscriptions.delete(endpoint);
  }

  // Send notification to specific subscription
  async sendNotification(
    subscription: any,
    payload: any,
  ): Promise<void> {
    try {
      await webpush.sendNotification(
        subscription,
        JSON.stringify(payload),
      );
    } catch (error) {
      console.error('Error sending notification:', error);
      // If subscription is invalid, remove it
      if (error.statusCode === 410) {
        this.removeSubscription(subscription.endpoint);
      }
      throw error;
    }
  }

  // Send notification to all subscribers
async sendToAll(payload: any): Promise<void> {
  const promises: Promise<void>[] = [];

  for (const subscription of this.subscriptions.values()) {
    const p = this.sendNotification(subscription, payload).catch((error) =>
      console.error('Failed to send to:', subscription.endpoint, error),
    );

    promises.push(p);
  }

  await Promise.all(promises);
}

  // Get subscription by endpoint
  getSubscription(endpoint: string): any {
    return this.subscriptions.get(endpoint);
  }

  // Get all subscriptions
  getAllSubscriptions(): any[] {
    return Array.from(this.subscriptions.values());
  }
}