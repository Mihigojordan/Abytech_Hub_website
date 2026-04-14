import { Module } from '@nestjs/common';
import { InternshipController } from './internship.controller';
import { InternshipService } from './internship.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationModule } from '../notification/notification.module';
import { AdminModule } from '../admin-management/admin.module';

@Module({
  imports: [NotificationModule, AdminModule],
  controllers: [InternshipController],
  providers: [InternshipService, PrismaService],
  exports: [InternshipService],
})
export class InternshipModule {}
