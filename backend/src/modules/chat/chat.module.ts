import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { CacheService } from './cache.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { CloudinaryService } from 'src/global/cloudinary/cloudinary.service';
import { JwtModule } from '@nestjs/jwt';
import { ChatAuthGuard } from 'src/guards/chatAuth.guard';

@Module({
    imports: [
        PrismaModule,
        JwtModule.register({
            secret: process.env.Jwt_SECRET_KEY || 'secretkey',
            signOptions: { expiresIn: '7d' },
        }),
    ],
    controllers: [ChatController],
    providers: [ChatService, ChatGateway, CacheService, CloudinaryService, ChatAuthGuard],
    exports: [ChatService],
})
export class ChatModule { }
