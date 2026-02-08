import { Module } from '@nestjs/common';
import { MeetingController } from './meeting.controller';
import { MeetingService } from './meeting.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [MeetingController],
  providers: [MeetingService, PrismaService],
  exports: [MeetingService],
})
export class MeetingModule {}
