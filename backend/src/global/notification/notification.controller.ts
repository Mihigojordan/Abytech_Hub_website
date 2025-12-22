import { Controller, Post, Body, Get } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationsService: NotificationService,
  ) {}

  @Post('subscribe')
  subscribe(@Body() subscription: any) {
    this.notificationsService.addSubscription(subscription);
    return { success: true, message: 'Subscribed successfully' };
  }

  @Post('unsubscribe')
  unsubscribe(@Body() body: { endpoint: string }) {
    this.notificationsService.removeSubscription(body.endpoint);
    return { success: true, message: 'Unsubscribed successfully' };
  }

  @Post('send')
  async sendNotification(
    @Body() body: { title: string; body: string; endpoint?: string },
  ) {
    const payload = {
      title: body.title,
      body: body.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: { url: '/' },
    };

    if (body.endpoint) {
      // Send to specific subscriber
      const subscription = this.notificationsService.getSubscription(
        body.endpoint,
      );
      if (subscription) {
        await this.notificationsService.sendNotification(
          subscription,
          payload,
        );
        return { success: true, message: 'Notification sent' };
      }
      return { success: false, message: 'Subscription not found' };
    } else {
      // Send to all subscribers
      await this.notificationsService.sendToAll(payload);
      return { success: true, message: 'Notifications sent to all' };
    }
  }

  @Get('subscribers')
  getSubscribers() {
    const subscriptions = this.notificationsService.getAllSubscriptions();
    return {
      count: subscriptions.length,
      subscriptions: subscriptions.map((sub) => ({
        endpoint: sub.endpoint,
      })),
    };
  }
}