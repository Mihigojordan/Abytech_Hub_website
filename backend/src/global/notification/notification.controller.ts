import { Controller, Post, Body, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Post('subscribe/:adminId')
  async subscribe(@Param('adminId') adminId: string, @Body() body: any) {
    return this.notificationService.saveSubscription(adminId, body.subscription);
  }

  @Post('send/:adminId')
  async send(@Param('adminId') adminId: string, @Body() body: any) {
    return this.notificationService.sendNotification(adminId, body);
  }
}
