import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as webpush from 'web-push';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {
    // Set VAPID details
    webpush.setVapidDetails(
      'mailto:your-email@example.com',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY,
    );
  }

  // Subscribe admin to push notifications
  async subscribeAdmin(adminId: string, subscription: any) {
    try {
      // Check if admin exists
      const admin = await this.prisma.admin.findUnique({
        where: { id: adminId },
      });

      console.log(subscription);
      
      if (!admin) {
        throw new NotFoundException('Admin not found');
      }

      // Update admin with subscription
      const updatedAdmin = await this.prisma.admin.update({
        where: { id: adminId },
        data: {
          subscription: subscription,
        },
      });

      return {
        success: true,
        message: 'Successfully subscribed to push notifications',
        admin: updatedAdmin,
      };
    } catch (error) {
      throw error;
    }
  }

  // Unsubscribe admin from push notifications
  async unsubscribeAdmin(adminId: string) {
    try {
      const admin = await this.prisma.admin.findUnique({
        where: { id: adminId },
      });

      if (!admin) {
        throw new NotFoundException('Admin not found');
      }

const subscription : any = null;
      await this.prisma.admin.update({
        where: { id: adminId },
        data: {
          subscription
        },
      });

      return {
        success: true,
        message: 'Successfully unsubscribed from push notifications',
      };
    } catch (error) {
      throw error;
    }
  }

  // Send notification to specific admin
// In notifications.service.ts

async sendToAdmin(adminId: string, payload: any) {
  try {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    if (!admin.subscription) {
      throw new NotFoundException('Admin not subscribed to notifications');
    }

    console.log('📤 Sending notification to:', admin.adminEmail);
    console.log('📦 Payload:', payload);
    console.log('🔗 Subscription endpoint:', (admin.subscription as any).endpoint);

    // Send push notification
    const result = await webpush.sendNotification(
      admin.subscription as any,
      JSON.stringify(payload),
    );

    console.log('✅ Notification sent successfully:', result);

    return {
      success: true,
      message: 'Notification sent successfully',
      statusCode: result.statusCode, // Should be 201
    };
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    
    // If subscription is invalid (410 Gone), remove it
    if (error.statusCode === 410) {
      console.log('🗑️ Removing expired subscription');
      await this.unsubscribeAdmin(adminId);
      throw new NotFoundException('Subscription expired or invalid');
    }
    
    throw error;
  }
}

  // Send notification to all subscribed admins
  async sendToAllAdmins(payload: any) {
    try {

        const not : any = null;
      const admins = await this.prisma.admin.findMany({
        where: {
          subscription: {
            not,
          },
        },
      });

      if (admins.length === 0) {
        return {
          success: true,
          message: 'No subscribed admins found',
          sent: 0,
        };
      }

      const promises = admins.map(async (admin) => {
        try {
          await webpush.sendNotification(
            admin.subscription as any,
            JSON.stringify(payload),
          );
          return { success: true, adminId: admin.id };
        } catch (error) {
          console.error(`Failed to send to admin ${admin.id}:`, error);
          
          // Remove invalid subscriptions
          if (error.statusCode === 410) {
            await this.unsubscribeAdmin(admin.id);
          }
          
          return { success: false, adminId: admin.id, error: error.message };
        }
      });

      const results = await Promise.all(promises);
      const successCount = results.filter((r) => r.success).length;

      return {
        success: true,
        message: `Notifications sent to ${successCount}/${admins.length} admins`,
        sent: successCount,
        total: admins.length,
        results,
      };
    } catch (error) {
      throw error;
    }
  }

  // Get admin subscription status
  async getSubscriptionStatus(adminId: string) {
    try {
      const admin = await this.prisma.admin.findUnique({
        where: { id: adminId },
        select: {
          id: true,
          adminName: true,
          adminEmail: true,
          subscription: true,
        },
      });

      if (!admin) {
        throw new NotFoundException('Admin not found');
      }

      return {
        success: true,
        isSubscribed: !!admin.subscription,
        admin: {
          id: admin.id,
          name: admin.adminName,
          email: admin.adminEmail,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Get all subscribed admins count
  async getSubscribedAdminsCount() {
    try {
        const not : any = null;
      const count = await this.prisma.admin.count({
        where: {
          subscription: {
            not,
          },
        },
      });

      return {
        success: true,
        count,
      };
    } catch (error) {
      throw error;
    }
  }
}