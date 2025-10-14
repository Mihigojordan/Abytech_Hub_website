import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AdminModule } from './modules/admin-management/admin.module';
import { PrismaModule } from './prisma/prisma.module';
import { EmailModule } from './global/email/email.module';

@Module({
  imports: [
    AdminModule,
    PrismaModule,
  ],
  controllers: [AppController],
})
export class AppModule { }
