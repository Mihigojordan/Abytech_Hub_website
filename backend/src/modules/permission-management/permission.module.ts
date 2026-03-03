import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { GlobalSocketGateway } from 'src/global/socket/socket.gateway';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [PermissionController],
  providers: [PermissionService, GlobalSocketGateway],
  exports: [PermissionService],
})
export class PermissionModule { }
