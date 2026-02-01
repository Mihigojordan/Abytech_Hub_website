import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Inject, forwardRef } from '@nestjs/common';
import { ChatService, SendMessageDto, ReplyMessageDto, ForwardMessagesDto } from './chat.service';
import { CacheService } from './cache.service';

interface AuthenticatedSocket extends Socket {
    userId?: string;
    userType?: 'ADMIN' | 'USER';
}

@WebSocketGateway({
    cors: {
        origin: '*', // Update with your frontend URL
        credentials: true,
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        @Inject(forwardRef(() => ChatService))
        private chatService: ChatService,
        private cache: CacheService,
        private jwtService: JwtService,
    ) { }

    // ====================
    // CONNECTION/DISCONNECTION
    // ====================

    async handleConnection(@ConnectedSocket() client: AuthenticatedSocket) {
        console.log(`Client connected: ${client.id}`);
        // Client will send user details via 'user:online' event
    }

    async handleDisconnect(@ConnectedSocket() client: AuthenticatedSocket) {
        console.log(`Client disconnected: ${client.id}`);

        if (client.userId && client.userType) {
            // Remove socket mapping
            this.cache.removeUserSocket(client.userId, client.userType);
            this.cache.removeOnlineUser(client.userId);

            // Broadcast offline status
            this.server.emit('user:status', {
                userId: client.userId,
                userType: client.userType,
                status: 'offline',
                lastSeen: new Date(),
            });
        }
    }

    // ====================
    // USER ONLINE STATUS
    // ====================

    @SubscribeMessage('user:online')
    async handleUserOnline(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { userId: string; userType: 'ADMIN' | 'USER' },
    ) {
        try {
            // Validate input
            if (!data.userId || !data.userType) {
                return { success: false, error: 'userId and userType are required' };
            }

            // Set user details on the socket
            client.userId = data.userId;
            client.userType = data.userType;

            // Add socket mapping and online user
            this.cache.addUserSocket(client.userId, client.userType, client.id);
            this.cache.addOnlineUser(client.userId);

            // Broadcast online status to all clients
            this.server.emit('user:status', {
                userId: client.userId,
                userType: client.userType,
                status: 'online',
            });

            console.log(`User ${client.userId} (${client.userType}) is now online with socket ${client.id}`);

            return { success: true, userId: client.userId, status: 'online' };
        } catch (error) {
            console.error('Failed to set user online:', error.message);
            return { success: false, error: error.message };
        }
    }

    // ====================
    // BROADCAST METHODS (Called by Service)
    // ====================

    /**
     * Broadcasts a new message to specific participants
     */
    public broadcastNewMessage(
        message: any,
        recipients: { participantId: string; participantType: 'ADMIN' | 'USER' }[]
    ) {
        console.log('Broadcasting new message to:', recipients);
        this.emitToUsers( recipients.map(r=> ({userId: r.participantId as any,userType: r.participantType as any})) , 'message:new', {
            conversationId: message.conversationId,
            message,
        });
    }

    /**
     * Broadcasts a message edit
     */
    public broadcastMessageEdited(
        messageId: string,
        conversationId: string,
        content: string,
        recipients: { userId: string; userType: 'ADMIN' | 'USER' }[]
    ) {
        this.emitToUsers(recipients, 'message:edited', {
            messageId,
            conversationId,
            content,
            edited: true,
        });
    }

    /**
     * Broadcasts a message deletion
     */
    public broadcastMessageDeleted(
        messageId: string,
        conversationId: string,
        recipients: { userId: string; userType: 'ADMIN' | 'USER' }[]
    ) {
        this.emitToUsers(recipients, 'message:deleted', {
            messageId,
            conversationId
        });
    }

    /**
     * Broadcasts a read receipt
     */
    public broadcastMessageRead(
        messageId: string,
        conversationId: string,
        readerId: string,
        readerType: 'ADMIN' | 'USER',
        sender: { userId: string; userType: 'ADMIN' | 'USER' }
    ) {
        // Emit to sender
        this.emitToUser(sender.userId, sender.userType, 'message:read', {
            messageId,
            conversationId,
            readerId,
            readerType,
            readAt: new Date(),
        });
    }

    private emitToUser(userId: string, userType: 'ADMIN' | 'USER', event: string, data: any) {
        const socketId = this.cache.getUserSocketId(userId, userType);
        if (socketId) {
            this.server.to(socketId).emit(event, data);
        }
    }

    private emitToUsers(users: { userId: string; userType: 'ADMIN' | 'USER' }[], event: string, data: any) {
        users.forEach(u => this.emitToUser(u.userId, u.userType, event, data));
    }

    // ====================
    // TYPING INDICATORS
    // ====================

    @SubscribeMessage('typing:start')
    async handleTypingStart(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { conversationId: string },
    ) {
        try {
            this.cache.setTyping(data.conversationId, client.userId as string);

            // We use chatService strictly for reading participants to know who to broadcast to.
            // This is "Sharing Data" (fetching recipients), not "Creating/Deleting/Updating" data.
            const conversation = await this.chatService.getConversation(
                data.conversationId,
                client.userId as string,
                client.userType as 'ADMIN' | 'USER',
            );

            if (conversation && conversation.participants) {
                const recipients = conversation.participants.filter(p =>
                    !(p.participantId === client.userId && p.participantType === client.userType)
                );

                this.emitToUsers(recipients as any, 'typing:active', {
                    conversationId: data.conversationId,
                    userId: client.userId,
                    userType: client.userType,
                });
            }
            return { success: true };
        } catch (error) {
            console.error('Error in typing:start:', error);
            return { success: false, error: error.message };
        }
    }

    @SubscribeMessage('typing:stop')
    async handleTypingStop(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { conversationId: string },
    ) {
        try {
            // Same as above
            const conversation = await this.chatService.getConversation(
                data.conversationId,
                client.userId as string,
                client.userType as 'ADMIN' | 'USER',
            );

            if (conversation && conversation.participants) {
                const recipients = conversation.participants.filter(p =>
                    !(p.participantId === client.userId && p.participantType === client.userType)
                );

                this.emitToUsers(recipients as any, 'typing:inactive', {
                    conversationId: data.conversationId,
                    userId: client.userId,
                });
            }
            return { success: true };
        } catch (error) {
            console.error('Error in typing:stop:', error);
            return { success: false, error: error.message };
        }
    }

    // ====================
    // HELPER METHODS
    // ====================

    private extractTokenFromCookies(client: Socket): string | undefined {
        // Socket.IO handshake contains cookies
        const cookies = client.handshake.headers.cookie;

        if (!cookies) return undefined;

        // Parse cookies manually
        const cookieArray = cookies.split(';').map(c => c.trim());
        for (const cookie of cookieArray) {
            const [name, value] = cookie.split('=');
            if (name === 'AccessAdminToken') {
                return value;
            }
        }

        return undefined;
    }

    private async verifyToken(token: string): Promise<{ userId: string; userType: 'ADMIN' | 'USER' }> {
        try {
            const decoded = await this.jwtService.verifyAsync(token, {
                secret: process.env.Jwt_SECRET_KEY || 'secretkey',
            });

            // Extract user info from decoded token
            // Adjust based on your JWT payload structure
            return {
                userId: decoded.id || decoded.sub || decoded.userId,
                userType: decoded.role === 'ADMIN' ? 'ADMIN' : 'USER', // Adjust based on your payload
            };
        } catch (error) {
            console.log('JWT verification error:', error);
            throw new Error('Invalid or expired token');
        }
    }
}
