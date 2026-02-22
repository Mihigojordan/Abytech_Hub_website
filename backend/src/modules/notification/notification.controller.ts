import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { NotificationService, Recipient } from './notification.service';
import {
  AdminUserDualAuthGuard,
  RequestWithAdminOrUser,
} from 'src/guards/admin-user-dual-auth.guard';

@Controller('notifications')
@UseGuards(AdminUserDualAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // ────────────────────────────────
  // CREATE NOTIFICATION
  // ────────────────────────────────
  @Post()
  async createNotification(
    @Req() req: RequestWithAdminOrUser,
    @Body()
    body: {
      recipients: Recipient[];
      title: string;
      message: string;
    },
  ) {
    return this.notificationService.createNotification(
      {
        ...body,
        senderId: req.admin?.id || req.user?.id,
        senderType: req.admin ? 'ADMIN' : 'USER',
      },
      req,
    );
  }

  // ────────────────────────────────
  // GET NOTIFICATIONS FOR LOGGED IN USER
  // ────────────────────────────────
  @Get()
  async getNotifications(
    @Req() req: RequestWithAdminOrUser,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string,
  ) {
    const id = req.admin?.id || req.user?.id;
    const type = req.admin ? 'ADMIN' : 'USER';

    return this.notificationService.getNotificationsForRecipient(
      id,
      type,
      Number(page) || 1,
      Number(limit) || 10,
      search || '',
    );
  }

  // ────────────────────────────────
  // GET UNREAD COUNT
  // ────────────────────────────────
  @Get('unread-count')
  async getUnreadCount(@Req() req: RequestWithAdminOrUser) {
    const id = req.admin?.id || req.user?.id;
    const type = req.admin ? 'ADMIN' : 'USER';

    return this.notificationService.getUnreadCount(id, type);
  }

  // ────────────────────────────────
  // MARK ALL AS READ
  // ────────────────────────────────
  @Put('mark-all-read')
  async markAllAsRead(@Req() req: RequestWithAdminOrUser) {
    const id = req.admin?.id || req.user?.id;
    const type = req.admin ? 'ADMIN' : 'USER';

    return this.notificationService.markAllAsRead(id, type);
  }

  // ────────────────────────────────
  // MARK SINGLE AS READ
  // ────────────────────────────────
  @Put(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @Req() req: RequestWithAdminOrUser,
  ) {
    const recipientId = req.admin?.id || req.user?.id;
    return this.notificationService.markAsRead(id, recipientId);
  }
}