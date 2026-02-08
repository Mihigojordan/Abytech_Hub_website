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
    // ONLINE STATUS MANAGEMENT
    // ====================

    async updateAdminOnlineStatus(adminId: string, isOnline: boolean, lastSeen: Date | null) {
        return this.prisma.admin.update({
            where: { id: adminId },
            data: {
                isOnline,
                lastSeen: lastSeen || undefined,
            },
        });
    }

    async updateUserOnlineStatus(userId: string, isOnline: boolean, lastSeen: Date | null) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                isOnline,
                lastSeen: lastSeen || undefined,
            },
        });
    }

    async getUserConversations(userId: string, userType: 'ADMIN' | 'USER') {
        const conversations = await this.prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        participantId: userId,
                        participantType: userType,
                        leftAt: null,
                    },
                },
            },
            include: {
                participants: {
                    where: { leftAt: null },
                },
            },
        });
        return conversations;
    }

    // ====================
    // CONVERSATIONS
    // ====================

    async getConversations(userId: string, userType: 'ADMIN' | 'USER') {
        const conversationParticipants = await this.prisma.conversationParticipant.findMany({
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
                            include: {
                                images: true,
                                files: true,
                                readers: {
                                    select: {
                                        readerId: true,
                                        readerType: true,
                                    },
                                },
                            },
                        },
                        participants: {
                            where: {
                                leftAt: null,
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

        // Enrich participants with online status from cache and user details
        const enrichedConversations = await Promise.all(
            conversationParticipants.map(async (cp) => {
                const conv = cp.conversation;

                // Fetch participant details with online status
                const enrichedParticipants = await Promise.all(
                    conv.participants.map(async (p) => {
                        // Get online status from cache (real-time)
                        const isOnline = this.cache.isUserOnline(p.participantId);

                        // Fetch user details based on type
                        let userDetails: any = null;
                        if (p.participantType === 'ADMIN') {
                            userDetails = await this.prisma.admin.findUnique({
                                where: { id: p.participantId },
                                select: {
                                    id: true,
                                    adminName: true,
                                    profileImage: true,
                                    lastSeen: true,
                                },
                            });
                        } else {
                            userDetails = await this.prisma.user.findUnique({
                                where: { id: p.participantId },
                                select: {
                                    id: true,
                                    name: true,
                                    avatar: true,
                                    initial: true,
                                    lastSeen: true,
                                },
                            });
                        }

                        return {
                            ...p,
                            isOnline, // From cache (real-time)
                            lastSeen: userDetails?.lastSeen,
                            name: p.participantType === 'ADMIN' ? userDetails?.adminName : userDetails?.name,
                            avatar: p.participantType === 'ADMIN' ? userDetails?.profileImage : userDetails?.avatar,
                            initial: userDetails?.initial,
                        };
                    })
                );

                // Enrich the last message with isRead status
                const isGroup = conv.isGroup || false;
                const participantCount = enrichedParticipants.length;

                const enrichedMessages = conv.messages.map((msg: any) => {
                    // For read receipts (ticks), we check if the current user is the sender
                    // If they are the sender, isRead = true means "recipient(s) have read it" (double tick)
                    const isSenderCurrentUser = msg.senderId === userId && msg.senderType === userType;

                    // Filter readers to exclude the sender
                    const readByOthers = (msg.readers || []).filter(
                        (r: any) => !(r.readerId === msg.senderId && r.readerType === msg.senderType)
                    );

                    let isRead = false;
                    if (isSenderCurrentUser) {
                        if (isGroup) {
                            // For groups: all other participants must have read
                            const requiredReaders = participantCount - 1;
                            isRead = readByOthers.length >= requiredReaders;
                        } else {
                            // For 1-on-1: at least one other person has read
                            isRead = readByOthers.length > 0;
                        }
                    }
                    // For non-senders, isRead doesn't affect display (ticks only shown for sent messages)

                    return {
                        ...msg,
                        isRead,
                        readBy: readByOthers,
                    };
                });

                return {
                    ...cp,
                    conversation: {
                        ...conv,
                        messages: enrichedMessages,
                        participants: enrichedParticipants,
                    },
                };
            })
        );

        return enrichedConversations;
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

        // Enrich conversation with participant details for real-time broadcast
        const enrichedParticipants = await Promise.all(
            conversation.participants.map(async (p) => {
                const isOnline = this.cache.isUserOnline(p.participantId);
                let userDetails: any = null;

                if (p.participantType === 'ADMIN') {
                    userDetails = await this.prisma.admin.findUnique({
                        where: { id: p.participantId },
                        select: { id: true, adminName: true, profileImage: true, lastSeen: true },
                    });
                } else {
                    userDetails = await this.prisma.user.findUnique({
                        where: { id: p.participantId },
                        select: { id: true, name: true, avatar: true, initial: true, lastSeen: true },
                    });
                }

                return {
                    ...p,
                    isOnline,
                    lastSeen: userDetails?.lastSeen,
                    name: p.participantType === 'ADMIN' ? userDetails?.adminName : userDetails?.name,
                    avatar: p.participantType === 'ADMIN' ? userDetails?.profileImage : userDetails?.avatar,
                    initial: userDetails?.initial,
                };
            })
        );

        const enrichedConversation = {
            ...conversation,
            participants: enrichedParticipants,
            messages: [], // No messages yet for new conversation
        };

        // Broadcast new conversation to OTHER participants (not the creator, they already have it)
        const otherRecipients = otherParticipants.map(p => ({
            participantId: p.participantId,
            participantType: p.participantType as 'ADMIN' | 'USER',
        }));

        if (otherRecipients.length > 0) {
            this.chatGateway.broadcastNewConversation(enrichedConversation, otherRecipients);
        }

        return enrichedConversation;
    }

    async addMembersToConversation(
        conversationId: string,
        participantIds: string[],
        participantTypes: ('ADMIN' | 'USER')[],
        requesterId: string,
        requesterType: 'ADMIN' | 'USER'
    ) {
        // Verify conversation exists and is a group
        const conversation = await this.prisma.conversation.findUnique({
            where: { id: Number(conversationId) },
            include: {
                participants: {
                    where: { leftAt: null }
                }
            }
        });

        if (!conversation) {
            throw new Error('Conversation not found');
        }

        if (!conversation.isGroup) {
            throw new Error('Cannot add members to a non-group conversation');
        }

        // Verify requester is a member of the conversation
        const isRequesterMember = conversation.participants.some(
            p => p.participantId === requesterId && p.participantType === requesterType
        );

        if (!isRequesterMember) {
            throw new Error('You are not a member of this conversation');
        }

        // Get existing participant keys
        const existingKeys = new Set(
            conversation.participants.map(p => `${p.participantType}-${p.participantId}`)
        );

        // Filter out already existing participants
        const newParticipants: { participantId: string; participantType: 'ADMIN' | 'USER' }[] = [];
        for (let i = 0; i < participantIds.length; i++) {
            const key = `${participantTypes[i]}-${participantIds[i]}`;
            if (!existingKeys.has(key)) {
                newParticipants.push({
                    participantId: participantIds[i],
                    participantType: participantTypes[i]
                });
            }
        }

        if (newParticipants.length === 0) {
            return { addedCount: 0, message: 'All selected participants are already in the group' };
        }

        // Add new participants
        await this.prisma.conversationParticipant.createMany({
            data: newParticipants.map(p => ({
                conversationId: Number(conversationId),
                participantId: p.participantId,
                participantType: p.participantType,
                role: 'member'
            }))
        });

        // Invalidate cache
        this.cache.deleteConversation(`conversation:${conversationId}`);

        // Return updated conversation
        const updatedConversation = await this.getConversation(conversationId, requesterId, requesterType);

        return {
            addedCount: newParticipants.length,
            conversation: updatedConversation
        };
    }

    // ====================
    // MESSAGES
    // ====================

    async getMessages(conversationId: string, pagination: PaginationDto, userId: string, userType: 'ADMIN' | 'USER') {
        const limit = pagination.limit || 15;
        // Fetch one extra to check if there are more
        const fetchLimit = limit + 1;

        // Get conversation details to know participant count for group read status
        const conversation = await this.prisma.conversation.findUnique({
            where: { id: Number(conversationId) },
            include: {
                participants: {
                    where: { leftAt: null },
                    select: { participantId: true, participantType: true }
                }
            }
        });

        const isGroup = conversation?.isGroup || false;
        const participantCount = conversation?.participants?.length || 0;

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
                // Get ALL readers for the message (for group "read by" feature)
                readers: true,
            },
        });

        let hasMore = false;
        let nextCursor: any = null;

        if (messages.length > limit) {
            hasMore = true;
            const nextItem = messages.pop(); // Remove the extra item
            nextCursor = nextItem?.id.toString();
        }

        // Return messages in chronological order (Oldest -> Newest) for the UI
        const enrichedMessages = await this.enrichMessages(
            messages.reverse() as any[],
            userId,
            userType,
            isGroup,
            participantCount
        );

        return {
            messages: enrichedMessages,
            nextCursor,
            hasMore
        };
    }

    async enrichMessages(
        messages: any[],
        currentUserId?: string,
        currentUserType?: 'ADMIN' | 'USER',
        isGroup: boolean = false,
        participantCount: number = 2
    ) {
        if (!messages.length) return [];

        // Collect unique sender IDs and reader IDs
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

            // Collect reader IDs for enrichment
            if (msg.readers && Array.isArray(msg.readers)) {
                msg.readers.forEach((reader: any) => {
                    if (reader.readerType === 'ADMIN') adminIds.add(reader.readerId);
                    else if (reader.readerType === 'USER') userIds.add(reader.readerId);
                });
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

            // Enrich readers with user details
            const enrichedReaders = (msg.readers || []).map((reader: any) => {
                let readerName = 'Unknown';
                let readerAvatar = null as any;
                let readerInitial = null as any; 

                if (reader.readerType === 'ADMIN') {
                    const admin = adminMap.get(reader.readerId);
                    if (admin) {
                        readerName = admin.adminName || 'Admin';
                        readerAvatar = admin.profileImage;
                        readerInitial = admin.adminName ? admin.adminName[0].toUpperCase() : 'A';
                    }
                } else {
                    const user = userMap.get(reader.readerId);
                    if (user) {
                        readerName = user.name || 'User';
                        readerAvatar = user.avatar;
                        readerInitial = user.initial || (user.name ? user.name[0].toUpperCase() : 'U');
                    }
                }

                return {
                    ...reader,
                    name: readerName,
                    avatar: readerAvatar,
                    initial: readerInitial,
                };
            });

            // Filter out the sender from readers for "read by" display
            const readByOthers = enrichedReaders.filter(
                (r: any) => !(r.readerId === msg.senderId && r.readerType === msg.senderType)
            );

            // Calculate isRead status
            // For 1-on-1: isRead = at least one other person has read
            // For groups: isRead = ALL other participants have read
            let isRead = false;
            const isSenderCurrentUser = currentUserId &&
                msg.senderId === currentUserId &&
                msg.senderType === currentUserType;

            if (isSenderCurrentUser) {
                if (isGroup) {
                    // For groups: all other participants must have read
                    // participantCount includes sender, so we need (participantCount - 1) readers
                    const requiredReaders = participantCount - 1;
                    isRead = readByOthers.length >= requiredReaders;
                } else {
                    // For 1-on-1: at least one other person has read
                    isRead = readByOthers.length > 0;
                }
            }

            return {
                ...msg,
                senderName,
                senderAvatar,
                senderInitial,
                replyToMessage,
                readBy: readByOthers, // Array of users who read (excluding sender)
                readByCount: readByOthers.length,
                isRead,
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

        // Use upsert to avoid race condition - atomically create if not exists
        const existingReader = await this.prisma.messageReader.findUnique({
            where: {
                unique_message_reader: {
                    messageId: Number(messageId),
                    readerId,
                    readerType,
                },
            },
        });

        if (!existingReader) {
            // Create read receipt
            await this.prisma.messageReader.create({
                data: {
                    messageId: Number(messageId),
                    readerId,
                    readerType,
                },
            }).catch(() => {
                // Ignore duplicate key error due to race condition
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

    async markConversationAsRead(conversationId: string, readerId: string, readerType: 'ADMIN' | 'USER') {
        // Find all unread messages in this conversation where the reader is NOT the sender
        const unreadMessages = await this.prisma.message.findMany({
            where: {
                conversationId: Number(conversationId),
                NOT: {
                    senderId: readerId,
                    senderType: readerType,
                },
                readers: {
                    none: {
                        readerId,
                        readerType,
                    },
                },
            },
            select: {
                id: true,
                senderId: true,
                senderType: true,
            },
        });

        if (unreadMessages.length === 0) {
            return { markedCount: 0 };
        }

        // Bulk create read receipts
        await this.prisma.messageReader.createMany({
            data: unreadMessages.map(msg => ({
                messageId: msg.id,
                readerId,
                readerType,
            })),
            skipDuplicates: true,
        });

        // Broadcast read receipts for each message
        unreadMessages.forEach(msg => {
            this.chatGateway.broadcastMessageRead(
                msg.id.toString(),
                conversationId,
                readerId,
                readerType,
                { userId: msg.senderId, userType: msg.senderType }
            );
        });

        return { markedCount: unreadMessages.length };
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

        // Invalidate cache for conversation
        this.cache.deleteConversation(`conversation:${message.conversationId}`);

        // Broadcast delete to ALL participants (including sender for multi-device sync)
        const conversation = await this.getConversation(message.conversationId.toString(), userId, userType);
        if (conversation && conversation.participants) {
            this.chatGateway.broadcastMessageDeleted(
                messageId,
                message.conversationId.toString(),
                conversation.participants as any[]
            );
        }

        return { success: true, conversationId: message.conversationId.toString() };
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

        if (!contacts.length) return [];

        // Collect unique contact IDs by type
        const adminIds = contacts.filter(c => c.contactType === 'ADMIN').map(c => c.contactId);
        const userIds = contacts.filter(c => c.contactType === 'USER').map(c => c.contactId);

        // Batch fetch all admins and users
        const [admins, users] = await Promise.all([
            adminIds.length > 0
                ? this.prisma.admin.findMany({
                    where: { id: { in: adminIds } },
                    select: { id: true, adminName: true, profileImage: true },
                })
                : [],
            userIds.length > 0
                ? this.prisma.user.findMany({
                    where: { id: { in: userIds } },
                    select: { id: true, name: true, avatar: true },
                })
                : [],
        ]);

        // Create lookup maps
        const adminMap = new Map(admins.map(a => [a.id, a] as const));
        const userMap = new Map(users.map(u => [u.id, u] as const));

        // Enrich contacts with details
        return contacts.map(contact => ({
            ...contact,
            contactDetails: contact.contactType === 'ADMIN'
                ? adminMap.get(contact.contactId) || null
                : userMap.get(contact.contactId) || null,
        }));
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
                    isForwarded: true,
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

        // Enrich forwarded messages with sender details before broadcasting
        const enrichedForwardedMessages = await this.enrichMessages(forwardedMessages);

        // Broadcast to target conversation (all participants including forwarder for real-time sync)
        const targetConv = await this.getConversation(dto.targetConversationId, forwarderId, forwarderType);
        if (targetConv && targetConv.participants) {
            // Broadcast each enriched forwarded message to ALL participants
            for (const msg of enrichedForwardedMessages) {
                this.chatGateway.broadcastNewMessage(msg, targetConv.participants as any[]);
            }
        }

        return enrichedForwardedMessages;
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
        // Only count messages NOT sent by the current user AND not yet read by them
        const unreadCounts = await Promise.all(
            conversationIds.map(async (conversationId) => {
                const unreadCount = await this.prisma.message.count({
                    where: {
                        conversationId,
                        // Exclude messages sent by the current user (you don't count your own messages as "unread")
                        NOT: {
                            senderId: userId,
                            senderType: userType,
                        },
                        // Message not read by current user
                        readers: {
                            none: {
                                readerId: userId,
                                readerType: userType,
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