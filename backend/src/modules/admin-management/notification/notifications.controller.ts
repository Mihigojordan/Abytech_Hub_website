import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';


@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Subscribe admin to push notifications
  @Post('subscribe/:adminId')
  async subscribe(
    @Param('adminId') adminId: string,
    @Body() body: { subscription: any },
  ) {
    return this.notificationsService.subscribeAdmin(
      adminId,
      body.subscription,
    );
  }

  // Unsubscribe admin from push notifications
  @Delete('unsubscribe/:adminId')
  async unsubscribe(@Param('adminId') adminId: string) {
    return this.notificationsService.unsubscribeAdmin(adminId);
  }

  // Get subscription status
  @Get('status/:adminId')
  async getStatus(@Param('adminId') adminId: string) {
    return this.notificationsService.getSubscriptionStatus(adminId);
  }

  // Send notification to specific admin
  @Post('send/:adminId')
//   @UseGuards(JwtAuthGuard) // Protect this endpoint
  async sendToAdmin(
    @Param('adminId') adminId: string,
    @Body() payload: { title: string; body: string; data?: any },
  ) {
    const notificationPayload = {
      title: payload.title,
      body: payload.body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      data: payload.data || {},
    };

    return this.notificationsService.sendToAdmin(adminId, notificationPayload);
  }

  // Send notification to all admins
  @Post('send-all')
//   @UseGuards(JwtAuthGuard) // Protect this endpoint
  async sendToAll(
    @Body() payload: { title: string; body: string; data?: any },
  ) {
    const notificationPayload = {
      title: payload.title,
      body: payload.body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      data: payload.data || {},
    };

    return this.notificationsService.sendToAllAdmins(notificationPayload);
  }

  // Get subscribed admins count
  @Get('subscribers/count')
//   @UseGuards(JwtAuthGuard)
  async getSubscribersCount() {
    return this.notificationsService.getSubscribedAdminsCount();
  }

  // Test notification endpoint (for development)
  @Post('test/:adminId')
  async sendTestNotification(@Param('adminId') adminId: string) {
    const payload = {
      title: '🎉 Test Notification',
      body: 'This is a test notification from your admin panel!',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      data: {
        url: '/dashboard',
        timestamp: new Date().toISOString(),
      },
    };

    return this.notificationsService.sendToAdmin(adminId, payload);
  }
}