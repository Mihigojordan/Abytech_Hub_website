import { Module } from '@nestjs/common';
import { HostedWebsiteController } from './hosted-website.controller';
import { HostedWebsiteService } from './hosted-website.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [HostedWebsiteController],
  providers: [HostedWebsiteService, PrismaService],
  exports: [HostedWebsiteService],
})
export class HostedWebsiteModule { }
