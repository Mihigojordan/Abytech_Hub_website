import { Injectable } from '@nestjs/common';
import * as webpush from 'web-push';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {
    webpush.setVapidDetails(
      'mailto:support@myapp.com',
      process.env.VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!,
    );
  }

  async saveSubscription(adminId: string, subscription: any) {
    await this.prisma.admin.update({
      where: { id: adminId },
      data: { subscription },
    });
    return { message: 'Subscription saved successfully' };
  }
async sendNotification(adminId: string, payload: any) {
  const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin?.subscription) return;

  const cleanPayload = JSON.parse(JSON.stringify(payload)); // removes undefined, functions

  try {
    console.log('Sending payload:', cleanPayload);
    await webpush.sendNotification(admin.subscription as any, JSON.stringify(cleanPayload));
    return { message: 'Notification sent!' };
  } catch (err: any) {
    console.error('Push failed:', err.statusCode, err.body);
    if (err.statusCode === 410 || err.statusCode === 404) {
        const sub = null as any
      await this.prisma.admin.update({
        where: { id: adminId },
        data: { subscription: sub },
      });
    }
    throw err;
  }
}
}
