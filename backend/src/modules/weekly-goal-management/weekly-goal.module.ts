import { Module } from '@nestjs/common';
import { WeeklyGoalController } from './weekly-goal.controller';
import { WeeklyGoalService } from './weekly-goal.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [WeeklyGoalController],
  providers: [WeeklyGoalService, PrismaService],
  exports: [WeeklyGoalService],
})
export class WeeklyGoalModule {}
