import {
    Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards,
    UseInterceptors, UploadedFiles
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ChatService, CreateConversationDto, SendMessageDto, ReplyMessageDto, ForwardMessagesDto, PaginationDto } from './chat.service';
import { ChatFileFields, ChatUploadConfig } from 'src/common/utils/file-upload.utils';
import { CloudinaryService } from 'src/global/cloudinary/cloudinary.service';
import { ChatAuthGuard } from 'src/guards/chatAuth.guard';
import { RequestWithChatUser } from 'src/common/interfaces/chat.interface';

// Simple auth guard placeholder - replace with your actual guard
@Controller('chat')
@UseGuards(ChatAuthGuard)
export class ChatController {
    constructor(
        private chatService: ChatService,
        private cloudinaryService: CloudinaryService,
    ) { }

    // ====================
    // CONVERSATIONS
    // ====================

    @Get('conversations')
    async getConversations(@Req() req: RequestWithChatUser) {
        const userId = req.user.id;
        const userType = req.user.type;

        return this.chatService.getConversations(userId, userType);
    }

    // IMPORTANT: This route must come BEFORE 'conversations/:id' to avoid matching "unread" as an ID
    @Get('conversations/unread')
    async getUnreadCounts(@Req() req: RequestWithChatUser) {
        const userId = req.user.id;
        const userType = req.user.type;
        return this.chatService.getUnreadMessageCounts(userId, userType);
    }

    @Get('conversations/:id')
    async getConversation(@Param('id') id: string, @Req() req: any) {
        const userId = req.user?.id;
        const userType = req.user?.type || 'ADMIN';
        return this.chatService.getConversation(id, userId, userType);
    }

    @Post('conversations')
    async createConversation(@Body() dto: CreateConversationDto, @Req() req: any) {
        const creatorId = req.user?.id;
        const creatorType = req.user?.type || 'ADMIN';
        return this.chatService.createConversation(dto, creatorId, creatorType);
    }

    @Post('conversations/:id/members')
    async addMembersToConversation(
        @Param('id') conversationId: string,
        @Body() dto: { participantIds: string[]; participantTypes: ('ADMIN' | 'USER')[] },
        @Req() req: RequestWithChatUser
    ) {
        const userId = req.user.id;
        const userType = req.user.type;
        return this.chatService.addMembersToConversation(conversationId, dto.participantIds, dto.participantTypes, userId, userType);
    }

    // ====================
    // MESSAGES
    // ====================

    @Get('conversations/:id/messages')
    async getMessages(
        @Param('id') conversationId: string,
        @Query('cursor') cursor?: string,
        @Query('limit') limit?: string,
        @Req() req?: any,
    ) {
        const userId = req.user?.id;
        const userType = req.user?.type || 'ADMIN';

        const pagination: PaginationDto = {
            cursor,
            limit: limit ? parseInt(limit) : 15,
        };

        return this.chatService.getMessages(conversationId, pagination, userId, userType);
    }

    @Post('conversations/:id/messages')
    @UseInterceptors(FileFieldsInterceptor(ChatFileFields, ChatUploadConfig))
    async sendMessage(
        @Param('id') conversationId: string,
        @Body() dto: SendMessageDto,
        @UploadedFiles() files: { chatImages?: Express.Multer.File[], chatFiles?: Express.Multer.File[] },
        @Req() req: any,
    ) {
        const senderId = req.user?.id;
        const senderType = req.user?.type || 'ADMIN';

        // Upload images to Cloudinary
        if (files?.chatImages && files.chatImages.length > 0) {
            dto.images = [];
            for (let i = 0; i < files.chatImages.length; i++) {
                const file = files.chatImages[i];
                const result = await this.cloudinaryService.uploadChatImage(file.path);
                dto.images.push({
                    imageUrl: result.secure_url,
                    imageOrder: i,
                });
            }
        }

        // Upload files to Cloudinary
        if (files?.chatFiles && files.chatFiles.length > 0) {
            const uploadedFiles: NonNullable<SendMessageDto['files']> = [];
            for (let i = 0; i < files.chatFiles.length; i++) {
                const file = files.chatFiles[i];
                const result = await this.cloudinaryService.uploadChatFile(file.path);

                // Format file size as human-readable string
                const sizeInBytes = file.size;
                let formattedSize: string;
                if (sizeInBytes >= 1024 * 1024) {
                    formattedSize = (sizeInBytes / (1024 * 1024)).toFixed(2) + ' MB';
                } else if (sizeInBytes >= 1024) {
                    formattedSize = (sizeInBytes / 1024).toFixed(2) + ' KB';
                } else {
                    formattedSize = sizeInBytes + ' B';
                }

                uploadedFiles.push({
                    fileUrl: result.secure_url,
                    fileName: file.originalname,
                    fileSize: formattedSize,
                    fileType: file.mimetype,
                    fileOrder: i,
                });
            }
            dto.files = uploadedFiles;
        }

        // Determine message type
        if (!dto.type) {
            if (dto.images && dto.images.length > 0 && dto.files && dto.files.length > 0) {
                dto.type = 'combined';
            } else if (dto.images && dto.images.length > 0) {
                dto.type = 'image';
            } else if (dto.files && dto.files.length > 0) {
                dto.type = 'file';
            } else {
                dto.type = 'text';
            }
        }

        // Set the conversationId from the URL parameter
        dto.conversationId = conversationId;

        return this.chatService.sendMessage(dto, senderId, senderType as any);
    }

    @Patch('messages/:id')
    async editMessage(
        @Param('id') messageId: string,
        @Body('content') content: string,
        @Req() req: any,
    ) {
        const userId = req.user?.id;
        const userType = req.user?.type || 'ADMIN';
        return this.chatService.editMessage(messageId, content, userId, userType);
    }

    @Delete('messages/:id')
    async deleteMessage(@Param('id') messageId: string, @Req() req: any) {
        const userId = req.user?.id;
        const userType = req.user?.type || 'ADMIN';
        return this.chatService.deleteMessage(messageId, userId, userType);
    }

    @Post('messages/:id/read')
    async markAsRead(@Param('id') messageId: string, @Req() req: any) {
        const readerId = req.user?.id;
        const readerType = req.user?.type || 'ADMIN';
        return this.chatService.markMessageAsRead(messageId, readerId, readerType);
    }

    @Post('conversations/:id/mark-read')
    async markConversationAsRead(@Param('id') conversationId: string, @Req() req: any) {
        const readerId = req.user?.id;
        const readerType = req.user?.type || 'ADMIN';
        return this.chatService.markConversationAsRead(conversationId, readerId, readerType);
    }

    // ====================
    // CONTACTS
    // ====================

    @Get('contacts')
    async getContacts(@Req() req: any) {
        const userId = req.user?.id;
        const userType = req.user?.type || 'ADMIN';
        return this.chatService.getContacts(userId, userType);
    }

    @Post('contacts')
    async addContact(
        @Body() dto: { contactId: string; contactType: 'ADMIN' | 'USER'; nickname?: string },
        @Req() req: any,
    ) {
        const ownerId = req.user?.id;
        const ownerType = req.user?.type || 'ADMIN';
        return this.chatService.addContact(
            ownerId,
            ownerType,
            dto.contactId,
            dto.contactType,
            dto.nickname,
        );
    }

    // ====================
    // REPLY & FORWARD
    // ====================

    @Post('messages/:id/reply')
    async replyToMessage(
        @Param('id') messageId: string,
        @Body() dto: Omit<ReplyMessageDto, 'originalMessageId'>,
        @Req() req: any,
    ) {
        const senderId = req.user?.id;
        const senderType = req.user?.type || 'ADMIN';

        return this.chatService.replyToMessage(
            { ...dto, originalMessageId: messageId },
            senderId,
            senderType,
        );
    }

    @Post('messages/forward')
    async forwardMessages(
        @Body() dto: ForwardMessagesDto,
        @Req() req: any,
    ) {
        const forwarderId = req.user?.id;
        const forwarderType = req.user?.type || 'ADMIN';

        return this.chatService.forwardMessages(dto, forwarderId, forwarderType);
    }

}
