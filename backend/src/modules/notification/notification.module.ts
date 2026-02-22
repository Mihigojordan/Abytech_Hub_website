import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { AdminUserDualAuthGuard } from 'src/guards/admin-user-dual-auth.guard';
import { PushNotificationsService } from '../push-notification/push-notification.service';
import { GlobalSocketGateway } from 'src/global/socket/socket.gateway';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.Jwt_SECRET || 'secretkey',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  
  controllers: [NotificationController],
  providers: [NotificationService, PrismaService, AdminUserDualAuthGuard,PushNotificationsService,GlobalSocketGateway],
  exports: [NotificationService,PushNotificationsService],
})
export class NotificationModule {}
