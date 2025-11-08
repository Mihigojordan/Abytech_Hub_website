import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { CloudinaryService } from 'src/global/cloudinary/cloudinary.service';
import { NotificationService } from 'src/global/notification/notification.service';
import { ReportGateway } from './report.gateway';

@Module({
  controllers: [ReportController],
  providers: [ReportService,CloudinaryService,NotificationService,ReportGateway],
})
export class ReportModule {}
