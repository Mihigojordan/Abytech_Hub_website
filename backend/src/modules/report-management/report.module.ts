import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { CloudinaryService } from 'src/global/cloudinary/cloudinary.service';
import { ReportGateway } from './report.gateway';
import { NotificationModule } from '../notification/notification.module';
import { PermissionModule } from '../permission-management/permission.module';

@Module({
  imports: [PermissionModule, NotificationModule],
  controllers: [ReportController],
  providers: [ReportService, CloudinaryService, ReportGateway],
})
export class ReportModule {}
