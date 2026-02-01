import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserAuthController } from './user-auth.controller';
import { UserAuthService } from './user-auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserJwtAuthGuard } from 'src/guards/userGuard.guard';

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.Jwt_SECRET_KEY || 'secretkey',
            signOptions: { expiresIn: '7d' },
        }),
    ],
    controllers: [UserAuthController],
    providers: [UserAuthService, PrismaService, UserJwtAuthGuard],
    exports: [UserAuthService, UserJwtAuthGuard],
})
export class UserAuthModule { }
