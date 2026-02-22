import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AdminModule } from './modules/admin-management/admin.module';
import { PrismaModule } from './prisma/prisma.module';
import { EmailModule } from './global/email/email.module';
import { ExpenseModule } from './modules/expense-managment/expense.module';
import { ReportModule } from './modules/report-management/report.module';
import { DriveModule } from './global/googleDriveService/driver.module';

import { ChatModule } from './modules/chat/chat.module';
import { UserAuthModule } from './modules/user-auth/user-auth.module';
import { MeetingModule } from './modules/meeting-management/meeting.module';
import { InternshipModule } from './modules/internship-management/internship.module';
import { HostedWebsiteModule } from './modules/hosted-website-management/hosted-website.module';
import { DemoRequestModule } from './modules/demo-request-management/demo-request.module';
import { WeeklyGoalModule } from './modules/weekly-goal-management/weekly-goal.module';
import { NotificationModule } from './modules/notification/notification.module';
import { PushNotificationsModule } from './modules/push-notification/push-notification.module';

@Module({
  imports: [
    AdminModule,
    PrismaModule,
    ExpenseModule,
    ReportModule,
    DriveModule,
    ChatModule,
    UserAuthModule,
    MeetingModule,
    InternshipModule,
    HostedWebsiteModule,
    DemoRequestModule,
    WeeklyGoalModule,
    NotificationModule,
    PushNotificationsModule,
  ],
  controllers: [AppController],
})
export class AppModule { }
