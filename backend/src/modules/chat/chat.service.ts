import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from './cache.service';
import { ChatGateway } from './chat.gateway';

// Inline DTOs
export interface CreateConversationDto {
    participantIds: string[];
    participantTypes: ('ADMIN' | 'USER')[];
    name?: string;
    isGroup?: boolean;
    avatar?: string;
}

export interface SendMessageDto {
    conversationId: string;
    content?: string;
    type?: 'text' | 'image' | 'file' | 'combined';
    replyToMessageId?: string;
    images?: { imageUrl: string; imageOrder: number }[];
    files?: { fileName: string; fileUrl: string; fileSize?: string; fileType?: string; fileOrder: number }[];
}

export interface ReplyMessageDto {
    originalMessageId: string;
    conversationId: string;
    content?: string;
    type?: 'text' | 'image' | 'file' | 'combined';
    images?: { imageUrl: string; imageOrder: number }[];
    files?: { fileName: string; fileUrl: string; fileSize?: string; fileType?: string; fileOrder: number }[];
}

export interface ForwardMessagesDto {
    messageIds: string[];
    targetConversationId: string;
}

export interface PaginationDto {
    cursor?: string;
    limit?: number;
}

@Injectable()
export class ChatService {
    constructor(
        private prisma: PrismaService,
        private cache: CacheService,
        @Inject(forwardRef(() => ChatGateway))
        private chatGateway: ChatGateway,
    ) { }

    // ====================
    // CONVERSATIONS
    // ====================

    async getConversations(userId: string, userType: 'ADMIN' | 'USER') {
        return this.prisma.conversationParticipant.findMany({
            where: {
                participantId: userId,
                participantType: userType,
                leftAt: null,
            },
            include: {
                conversation: {
                    include: {
                        messages: {
                            take: 1,
                            orderBy: { timestamp: 'desc' },
                        },
                        participants: {
                            where: {
                                NOT: {
                                    AND: [
                                        { participantId: userId },
                                        { participantType: userType },
                                    ],
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                conversation: {
                    updatedAt: 'desc',
                },
            },
        });
    }

    async getConversation(conversationId: string, userId: string, userType: 'ADMIN' | 'USER') {
        // Check cache first
        const cacheKey = `conversation:${conversationId}`;
        const cached = this.cache.getConversation(cacheKey);
        if (cached) return cached;

        const conversation = await this.prisma.conversation.findFirst({
            where: {
                id: Number(conversationId),
                participants: {
                    some: {
                        participantId: userId,
                        participantType: userType,
                    },
                },
            },
            include: {
                participants: true,
            },
        });

        if (conversation) {
            this.cache.setConversation(cacheKey, conversation, 1800); // 30 min TTL
        }

        return conversation;
    }

    async createConversation(dto: CreateConversationDto, creatorId: string, creatorType: 'ADMIN' | 'USER') {
        // Filter out the creator from participantIds to avoid duplicate constraint violation
        const otherParticipants = dto.participantIds
            .map((id, index) => ({
                participantId: id,
                participantType: dto.participantTypes[index],
            }))
            .filter(p => !(p.participantId === creatorId && p.participantType === creatorType));

        // Build complete list of all participants (creator + others)
        const allParticipants = [
            { participantId: creatorId, participantType: creatorType },
            ...otherParticipants
        ];

        // Total number of participants
        const totalParticipants = allParticipants.length;

        // VALIDATION: If not a group and has more than 2 participants, reject
        if (!dto.isGroup && totalParticipants > 2) {
            throw new Error('Non-group conversations can only have 2 participants. Please set isGroup to true for multiple participants.');
        }

        // VALIDATION: If is a group and has only 2 or fewer participants, reject
        if (dto.isGroup && totalParticipants <= 2) {
            throw new Error('Group conversations must have more than 2 participants. For 2 participants, set isGroup to false.');
        }

        // For non-group conversations (1-on-1), check if conversation already exists with these exact participants
        if (!dto.isGroup && totalParticipants === 2) {
            // Find existing non-group conversation with exactly these 2 participants
            const existingConversations = await this.prisma.conversation.findMany({
                where: {
                    isGroup: false,
                },
                include: {
                    participants: {
                        where: {
                            leftAt: null
                        }
                    }
                }
            });

            // Check if any existing conversation has exactly the same 2 participants
            for (const conv of existingConversations) {
                if (conv.participants.length === 2) {
                    // Create sorted keys for comparison
                    const convParticipantKeys = conv.participants
                        .map(p => `${p.participantId}-${p.participantType}`)
                        .sort();
                    const newParticipantKeys = allParticipants
                        .map(p => `${p.participantId}-${p.participantType}`)
                        .sort();

                    // If they match exactly, return existing conversation
                    if (JSON.stringify(convParticipantKeys) === JSON.stringify(newParticipantKeys)) {
                        return conv;
                    }
                }
            }
        }

        // For group conversations, always create new one (groups can have same participants in different groups)
        // This allows multiple group chats with the same people but different purposes

        // No existing conversation found or it's a group, create new one
        const conversation = await this.prisma.conversation.create({
            data: {
                name: dto.name,
                avatar: dto.avatar,
                isGroup: dto.isGroup || false,
                createdBy: creatorId,
                createdByType: creatorType,
                participants: {
                    create: [
                        {
                            participantId: creatorId,
                            participantType: creatorType,
                            role: 'admin',
                        },
                        ...otherParticipants.map(p => ({
                            participantId: p.participantId,
                            participantType: p.participantType,
                            role: 'member' as const,
                        })),
                    ],
                },
            },
            include: {
                participants: true,
            },
        });

        return conversation;
    }

    // ====================
    // MESSAGES
    // ====================

    async getMessages(conversationId: string, pagination: PaginationDto, userId: string, userType: 'ADMIN' | 'USER') {
        const limit = pagination.limit || 15;
        // Fetch one extra to check if there are more
        const fetchLimit = limit + 1;

        const messages = await this.prisma.message.findMany({
            where: {
                conversationId: Number(conversationId),
            },
            take: fetchLimit,
            skip: pagination.cursor ? 1 : 0,
            cursor: pagination.cursor ? { id: Number(pagination.cursor) } : undefined,
            orderBy: { id: 'desc' }, // Use ID for cursor pagination stability, usually timestamp is also OK but ID is unique
            include: {
                images: {
                    orderBy: { imageOrder: 'asc' },
                },
                files: {
                    orderBy: { fileOrder: 'asc' },
                },
                replyToMessage: {
                    select: {
                        id: true,
                        content: true,
                        senderId: true,
                        senderType: true,
                    },
                },
                readers: {
                    where: {
                        readerId: userId,
                        readerType: userType,
                    },
                },
            },
        });

        let hasMore = false;
        let nextCursor: any = null;

        if (messages.length > limit) {
            hasMore = true;
            const nextItem = messages.pop(); // Remove the extra item
            nextCursor = nextItem?.id.toString();
        }

        console.log('messages =>', messages);
        
        // Return messages in chronological order (Oldest -> Newest) for the UI
        const enrichedMessages = await this.enrichMessages(messages.reverse() as any[]);

        return {
            messages: enrichedMessages,
            nextCursor,
            hasMore
        };
    }

    async enrichMessages(messages: any[]) {
        if (!messages.length) return [];

        // Collect unique sender IDs
        const adminIds = new Set<string>();
        const userIds = new Set<string>();

        messages.forEach(msg => {
            if (msg.senderType === 'ADMIN') adminIds.add(msg.senderId);
            else if (msg.senderType === 'USER') userIds.add(msg.senderId);

            // Also check replyToMessage if it exists
            if (msg.replyToMessage) {
                if (msg.replyToMessage.senderType === 'ADMIN') adminIds.add(msg.replyToMessage.senderId);
                else if (msg.replyToMessage.senderType === 'USER') userIds.add(msg.replyToMessage.senderId);
            }
        });

        // Fetch details
        const [admins, users] = await Promise.all([
            this.prisma.admin.findMany({
                where: { id: { in: Array.from(adminIds) } },
                select: { id: true, adminName: true, profileImage: true }
            }),
            this.prisma.user.findMany({
                where: { id: { in: Array.from(userIds) } },
                select: { id: true, name: true, avatar: true, initial: true }
            })
        ]);

        const adminMap = new Map(admins.map(a => [a.id, a]));
        const userMap = new Map(users.map(u => [u.id, u]));

        // Enrich messages
        return messages.map(msg => {
            let senderName = 'Unknown';
            let senderAvatar = null as any;
            let senderInitial = null as any;

            if (msg.senderType === 'ADMIN') {
                const admin = adminMap.get(msg.senderId);
                if (admin) {
                    senderName = admin.adminName || 'Admin';
                    senderAvatar = admin.profileImage;
                    senderInitial = admin.adminName ? admin.adminName[0].toUpperCase() : 'A';
                }
            } else {
                const user = userMap.get(msg.senderId);
                if (user) {
                    senderName = user.name || 'User';
                    senderAvatar = user.avatar;
                    senderInitial = user.initial || (user.name ? user.name[0].toUpperCase() : 'U');
                }
            }

            // Enrich reply to message if exists
            let replyToMessage = msg.replyToMessage;
            if (replyToMessage) {
                let replySenderName = 'Unknown';
                if (replyToMessage.senderType === 'ADMIN') {
                    const admin = adminMap.get(replyToMessage.senderId);
                    if (admin) replySenderName = admin.adminName || 'Admin';
                } else {
                    const user = userMap.get(replyToMessage.senderId);
                    if (user) replySenderName = user.name || 'User';
                }
                replyToMessage = {
                    ...replyToMessage,
                    senderName: replySenderName
                };
            }

            return {
                ...msg,
                senderName,
                senderAvatar,
                senderInitial,
                replyToMessage
            };
        });
    }

    async sendMessage(dto: SendMessageDto, senderId: string, senderType: 'ADMIN' | 'USER') {
        const message = await this.prisma.message.create({
            data: {
                conversationId: Number(dto.conversationId),
                senderId,
                senderType,
                type: dto.type || 'text',
                content: dto.content,
                replyToMessageId: dto.replyToMessageId ? Number(dto.replyToMessageId) : null,
                images: dto.images
                    ? {
                        create: dto.images,
                    }
                    : undefined,
                files: dto.files
                    ? {
                        create: dto.files,
                    }
                    : undefined,
                readers: {
                    create: {
                        readerId: senderId,
                        readerType: senderType,
                    },
                },

            },
            include: {
                images: true,
                files: true,
                replyToMessage: {
                    select: {
                        id: true,
                        content: true,
                        senderId: true,
                        senderType: true,
                    },
                },
            },
        });

        // Update conversation timestamp
        await this.prisma.conversation.update({
            where: { id: Number(dto.conversationId) },
            data: { updatedAt: new Date() },
        });

        // Invalidate cache
        this.cache.deleteConversation(`conversation:${dto.conversationId}`);

        const enrichedMessage = (await this.enrichMessages([message]))[0];

        // Broadcast to other participants
        const conversation = await this.getConversation(dto.conversationId, senderId, senderType);
        if (conversation && conversation.participants) {
            const recipients = conversation.participants.filter(p =>
                !(p.participantId === senderId && p.participantType === senderType)
            );
            this.chatGateway.broadcastNewMessage(enrichedMessage, recipients as any[]);
        }

        return enrichedMessage;
    }

    async markMessageAsRead(messageId: string, readerId: string, readerType: 'ADMIN' | 'USER') {
        // First get the message to retrieve sender info
        const message = await this.prisma.message.findUnique({
            where: { id: Number(messageId) },
        });

        if (!message) {
            throw new Error('Message not found');
        }

        // Check if already read by this user
        const existing = await this.prisma.messageReader.findFirst({
            where: {
                messageId: Number(messageId),
                readerId,
                readerType,
            },
        });

        if (!existing) {
            // Create read receipt
            await this.prisma.messageReader.create({
                data: {
                    messageId: Number(messageId),
                    readerId,
                    readerType,
                },
            });

            // Broadcast read receipt
            this.chatGateway.broadcastMessageRead(
                messageId,
                message.conversationId.toString(),
                readerId,
                readerType,
                { userId: message.senderId, userType: message.senderType }
            );
        }

        // Return the message with sender info for read receipt emission (legacy return, kept for compatibility)
        return {
            message: {
                id: message.id.toString(),
                senderId: message.senderId,
                senderType: message.senderType,
            },
        };
    }

    async editMessage(messageId: string, content: string, userId: string, userType: 'ADMIN' | 'USER') {
        // Verify ownership
        const message = await this.prisma.message.findFirst({
            where: {
                id: Number(messageId),
                senderId: userId,
                senderType: userType,
            },
            include: {    // Need conversation ID to broadcast
                conversation: { select: { id: true, participants: true } }
            }
        });

        if (!message) {
            throw new Error('Message not found or unauthorized');
        }

        const updated = await this.prisma.message.update({
            where: { id: Number(messageId) },
            data: {
                content,
                edited: true,
            },
        });

        const enrichedUpdated = (await this.enrichMessages([updated]))[0];

        // Broadcast edit
        // We need participants from the message relation (poly relation is mostly in conversationParticipants)
        // Actually message -> conversation -> participants
        // Fetch conversation participants:
        const conversation = await this.getConversation(message.conversationId.toString(), userId, userType);

        if (conversation && conversation.participants) {
            const recipients = conversation.participants; // Edit is seen by everyone including sender (for confirmation)? Or just others?
            // Usually just others + sender (for consistency across devices).
            // Let's send to all so sender's other tabs update? Or just everyone.
            this.chatGateway.broadcastMessageEdited(
                messageId,
                message.conversationId.toString(),
                content,
                recipients as any[]
            );
        }

        return enrichedUpdated;
    }

    async deleteMessage(messageId: string, userId: string, userType: 'ADMIN' | 'USER') {
        // Verify ownership
        const message = await this.prisma.message.findFirst({
            where: {
                id: Number(messageId),
                senderId: userId,
                senderType: userType,
            },
        });

        if (!message) {
            throw new Error('Message not found or unauthorized');
        }

        await this.prisma.message.delete({
            where: { id: Number(messageId) },
        });

        // Broadcast delete
        const conversation = await this.getConversation(message.conversationId.toString(), userId, userType);
        if (conversation && conversation.participants) {
            this.chatGateway.broadcastMessageDeleted(
                messageId,
                message.conversationId.toString(),
                conversation.participants as any[]
            );
        }

        return { success: true };
    }

    // ====================
    // CONTACTS
    // ====================

    async getContacts(userId: string, userType: 'ADMIN' | 'USER') {
        const contacts = await this.prisma.contact.findMany({
            where: {
                ownerId: userId,
                ownerType: userType,
            },
        });

        // Manually fetch related Admin/User data for each contact
        const contactsWithDetails = await Promise.all(
            contacts.map(async (contact) => {
                let contactDetails: any = null;

                if (contact.contactType === 'ADMIN') {
                    contactDetails = await this.prisma.admin.findUnique({
                        where: { id: contact.contactId },
                        select: { id: true, adminName: true, profileImage: true },
                    });
                } else if (contact.contactType === 'USER') {
                    contactDetails = await this.prisma.user.findUnique({
                        where: { id: contact.contactId },
                        select: { id: true, name: true, avatar: true },
                    });
                }

                return {
                    ...contact,
                    contactDetails,
                };
            })
        );

        return contactsWithDetails;
    }

    async addContact(ownerId: string, ownerType: 'ADMIN' | 'USER', contactId: string, contactType: 'ADMIN' | 'USER', nickname?: string) {
        return this.prisma.contact.create({
            data: {
                ownerId,
                ownerType,
                contactId,
                contactType,
                nickname,
            },
        });
    }

    // ====================
    // REPLY & FORWARD
    // ====================

    async replyToMessage(dto: ReplyMessageDto, senderId: string, senderType: 'ADMIN' | 'USER') {
        // Validate original message exists
        const originalMessage = await this.prisma.message.findUnique({
            where: { id: Number(dto.originalMessageId) },
        });

        if (!originalMessage) {
            throw new Error('Original message not found');
        }

        // Create reply message using sendMessage with replyToMessageId
        // Wrapper calls sendMessage, which ALREADY broadcasts!
        // So we don't need to duplicate broadcast logic here.
        return this.sendMessage(
            {
                conversationId: dto.conversationId,
                content: dto.content,
                type: dto.type,
                replyToMessageId: dto.originalMessageId,
                images: dto.images,
                files: dto.files,
            },
            senderId,
            senderType,
        );
    }


    async forwardMessages(dto: ForwardMessagesDto, forwarderId: string, forwarderType: 'ADMIN' | 'USER') {
        // Validate original messages exist
        const originalMessages = await this.prisma.message.findMany({
            where: {
                id: { in: dto.messageIds.map(id => Number(id)) },
            },
            include: {
                images: true,
                files: true,
            },
            orderBy: {
                timestamp: 'asc',
            },
        });

        if (originalMessages.length !== dto.messageIds.length) {
            throw new Error('Some messages not found');
        }

        // Validate user has access to target conversation
        const targetConversation = await this.prisma.conversationParticipant.findFirst({
            where: {
                conversationId: Number(dto.targetConversationId),
                participantId: forwarderId,
                participantType: forwarderType,
            },
        });

        if (!targetConversation) {
            throw new Error('Access denied to target conversation');
        }

        // Forward all messages
        const forwardedMessages: any[] = [];

        for (const originalMsg of originalMessages) {
            const forwarded = await this.prisma.message.create({
                data: {
                    conversationId: Number(dto.targetConversationId),
                    senderId: forwarderId,
                    senderType: forwarderType,
                    type: originalMsg.type,
                    content: originalMsg.content,
                    images: originalMsg.images.length > 0
                        ? {
                            create: originalMsg.images.map(img => ({
                                imageUrl: img.imageUrl,
                                imageOrder: img.imageOrder,
                            })),
                        }
                        : undefined,
                    files: originalMsg.files.length > 0
                        ? {
                            create: originalMsg.files.map(file => ({
                                fileName: file.fileName,
                                fileUrl: file.fileUrl,
                                fileSize: file.fileSize,
                                fileType: file.fileType,
                                fileOrder: file.fileOrder,
                            })),
                        }
                        : undefined,
                    readers: {
                        create: {
                            readerId: forwarderId,
                            readerType: forwarderType,
                        },
                    },
                },
                include: {
                    images: true,
                    files: true,
                },
            });

            forwardedMessages.push(forwarded);
        }

        // Update target conversation timestamp
        await this.prisma.conversation.update({
            where: { id: Number(dto.targetConversationId) },
            data: { updatedAt: new Date() },
        });

        // Invalidate cache
        this.cache.deleteConversation(`conversation:${dto.targetConversationId}`);

        // Broadcast to target conversation
        const targetConv = await this.getConversation(dto.targetConversationId, forwarderId, forwarderType);
        if (targetConv && targetConv.participants) {
            const recipients = targetConv.participants.filter(p =>
                !(p.participantId === forwarderId && p.participantType === forwarderType)
            );

            // Broadcast each forwarded message
            for (const msg of forwardedMessages) {
                this.chatGateway.broadcastNewMessage(msg, recipients as any[]);
            }
        }

        return forwardedMessages;
    }

    // ====================
    // UNREAD COUNTS
    // ====================

    async getUnreadMessageCounts(userId: string, userType: 'ADMIN' | 'USER') {
        // Get all conversations user participates in
        const conversations = await this.prisma.conversationParticipant.findMany({
            where: {
                participantId: userId,
                participantType: userType,
                leftAt: null,
            },
            select: {
                conversationId: true,
            },
        });

        const conversationIds = conversations.map(c => c.conversationId);

        // Count unread messages for each conversation
        const unreadCounts = await Promise.all(
            conversationIds.map(async (conversationId) => {
                const unreadCount = await this.prisma.message.count({
                    where: {
                        conversationId,
                        NOT: {
                            readers: {
                                some: {
                                    readerId: userId,
                                    readerType: userType,
                                },
                            },
                        },
                    },
                });

                return {
                    conversationId: conversationId.toString(),
                    unreadCount,
                };
            }),
        );

        return unreadCounts;
    }
}