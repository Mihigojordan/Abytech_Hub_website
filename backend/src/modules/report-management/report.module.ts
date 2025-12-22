import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { CloudinaryService } from 'src/global/cloudinary/cloudinary.service';
import { NotificationService } from 'src/global/notification/notification.service';
import { ReportGateway } from './report.gateway';
import { NotificationsService } from '../admin-management/notification/notifications.service';

@Module({
  controllers: [ReportController],
  providers: [ReportService,CloudinaryService,NotificationService,NotificationsService,ReportGateway],
})
export class ReportModule {}
