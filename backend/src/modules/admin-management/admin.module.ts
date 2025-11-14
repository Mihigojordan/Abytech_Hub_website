import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JwtModule } from '@nestjs/jwt';

import { EmailModule } from 'src/global/email/email.module';

import { GoogleAdminStrategy } from './google.strategy';
import { CloudinaryService } from 'src/global/cloudinary/cloudinary.service';
import { NotificationsModule } from './notification/notifications.module';

@Module({
  controllers: [AdminController,],
  providers: [AdminService,GoogleAdminStrategy,CloudinaryService],
  imports: [
    JwtModule.register({
      secret: process.env.Jwt_SECRET_KEY,
      global: true,
      signOptions: {
        expiresIn: "7d"
      }
    }),
    EmailModule,
    NotificationsModule,
  ]
})
export class AdminModule {}
