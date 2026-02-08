import { Module } from '@nestjs/common';
import { DemoRequestController } from './demo-request.controller';
import { DemoRequestService } from './demo-request.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [DemoRequestController],
  providers: [DemoRequestService, PrismaService],
  exports: [DemoRequestService],
})
export class DemoRequestModule {}
