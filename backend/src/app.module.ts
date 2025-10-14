import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AdminModule } from './modules/admin-management/admin.module';
import { PrismaModule } from './prisma/prisma.module';
import { EmailModule } from './global/email/email.module';
import { ExpenseModule } from './modules/expense-managment/expense.module';

@Module({
  imports: [
    AdminModule,
    PrismaModule,
    ExpenseModule,
  ],
  controllers: [AppController],
})
export class AppModule { }
