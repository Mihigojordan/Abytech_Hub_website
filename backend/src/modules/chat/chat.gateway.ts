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
import { Inject, forwardRef, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ChatService, SendMessageDto, ReplyMessageDto, ForwardMessagesDto } from './chat.service';
import { CacheService } from './cache.service';
import { CallService } from '../call/call.service';
import { PushNotificationsService } from '../push-notification/push-notification.service';

interface AuthenticatedSocket extends Socket {
    userId?: string;
    userType?: 'ADMIN' | 'USER';
}

interface ActiveCall {
    callId: string;
    conversationId: string;
    callType: 'audio' | 'video';
    hostId: string;
    hostType: 'ADMIN' | 'USER';
    hostSocketId: string;
    callerName: string;
    callMessageId: number | null;
    createdAt: Date;
    /** socketId → { userId, userType, name } */
    participants: Map<string, { userId: string; userType: 'ADMIN' | 'USER'; name: string }>;
    /** "userId:userType" of everyone who should receive call:incoming (re-sent on reconnect) */
    invitedParticipants: Set<string>;
    /** "userId:userType" of users whose socket disconnected mid-call (offered rejoin on reconnect) */
    recentlyLeft: Set<string>;
}

@WebSocketGateway({
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit, OnModuleDestroy {
    @WebSocketServer()
    server: Server;

    /** In-memory call state — callId → ActiveCall */
    private calls = new Map<string, ActiveCall>();

    private staleCallSweeperRef: ReturnType<typeof setInterval> | null = null;

    constructor(
        @Inject(forwardRef(() => ChatService))
        private chatService: ChatService,
        private cache: CacheService,
        private jwtService: JwtService,
        private callService: CallService,
        private pushService: PushNotificationsService,
    ) { }

    onModuleInit() {
        // Sweep abandoned calls every 5 minutes — cleans up calls where a
        // participant's browser crashed without sending call:end.
        const STALE_MS = 30 * 60 * 1000;
        this.staleCallSweeperRef = setInterval(() => {
            const now = Date.now();
            this.calls.forEach((call, callId) => {
                if (now - call.createdAt.getTime() > STALE_MS) {
                    this.calls.delete(callId);
                }
            });
        }, 5 * 60 * 1000);
    }

    onModuleDestroy() {
        if (this.staleCallSweeperRef) clearInterval(this.staleCallSweeperRef);
    }

    // ====================
    // CONNECTION/DISCONNECTION
    // ====================

    async handleConnection(@ConnectedSocket() client: AuthenticatedSocket) {
        // Client will send user details via 'user:online' event
    }

    async handleDisconnect(@ConnectedSocket() client: AuthenticatedSocket) {

        if (client.userId) {
            // Remove user from online users cache
            this.cache.removeOnlineUser(client.userId);

            const lastSeenTime = new Date();

            // Clean up any active calls this socket was part of (mark as disconnect for rejoin tracking)
            this.calls.forEach((call, callId) => {
                if (call.participants.has(client.id) || call.hostSocketId === client.id) {
                    this.handleCallLeave(client.id, callId, true);
                }
            });

            // Update database status
            try {
                if (client.userType === 'ADMIN') {
                    await this.chatService.updateAdminOnlineStatus(client.userId, false, lastSeenTime);
                } else {
                    await this.chatService.updateUserOnlineStatus(client.userId, false, lastSeenTime);
                }

                // Get all conversations this user participates in
                const conversations = await this.chatService.getUserConversations(client.userId, client.userType as any);

                // Extract unique participant IDs (excluding the disconnected user)
                const participantSocketIds = new Set<string>();
                conversations.forEach(conv => {
                    conv.participants?.forEach(p => {
                        if (!(p.participantId === client.userId && p.participantType === client.userType)) {
                            const socketId = this.cache.getUserSocketId(p.participantId);
                            if (socketId) {
                                participantSocketIds.add(socketId);
                            }
                        }
                    });
                });

                // Broadcast offline status only to conversation participants
                participantSocketIds.forEach(socketId => {
                    this.server.to(socketId).emit('user:status', {
                        userId: client.userId,
                        userType: client.userType,
                        status: 'offline',
                        lastSeen: lastSeenTime,
                    });
                });

            } catch (error) {
                console.error('Error in handleDisconnect:', error);
            }
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

            // Add online user with full details
            this.cache.addOnlineUser(client.userId, client.userType, client.id);

            // Update database status
            if (client.userType === 'ADMIN') {
                await this.chatService.updateAdminOnlineStatus(client.userId, true, null);
            } else {
                await this.chatService.updateUserOnlineStatus(client.userId, true, null);
            }

            // Get all conversations this user participates in
            const conversations = await this.chatService.getUserConversations(client.userId, client.userType);

            // Extract all unique participants from all conversations
            const allParticipants = new Set<string>();
            const participantsList: Array<{ participantId: string; participantType: 'ADMIN' | 'USER' }> = [];

            conversations.forEach(conv => {
                conv.participants?.forEach(p => {
                    const key = `${p.participantId}-${p.participantType}`;
                    if (!allParticipants.has(key)) {
                        allParticipants.add(key);
                        participantsList.push({
                            participantId: p.participantId,
                            participantType: p.participantType
                        });
                    }
                });
            });

            // Get online users from conversation participants
            const onlineUsers = this.cache.getOnlineConversationParticipants(
                client.userId,
                client.userType,
                participantsList
            );

            // Send online users list to the newly connected user
            client.emit('online:users', {
                users: onlineUsers.map(u => ({
                    userId: u.userId,
                    userType: u.userType
                }))
            });

            // Extract unique participant socket IDs (excluding current user)
            const participantSocketIds = new Set<string>();
            conversations.forEach(conv => {
                conv.participants?.forEach(p => {
                    if (!(p.participantId === client.userId && p.participantType === client.userType)) {
                        const socketId = this.cache.getUserSocketId(p.participantId);
                        if (socketId) {
                            participantSocketIds.add(socketId);
                        }
                    }
                });
            });

            // Broadcast online status only to conversation participants
            participantSocketIds.forEach(socketId => {
                this.server.to(socketId).emit('user:status', {
                    userId: client.userId,
                    userType: client.userType,
                    status: 'online',
                });
            });

            // Re-notify user about any active calls they should know about
            const userKey = `${client.userId}:${client.userType}`;
            for (const [, call] of this.calls.entries()) {
                // Case 1: User was in the call and their socket disconnected — offer seamless rejoin
                if (call.recentlyLeft.has(userKey) && call.participants.size > 0) {
                    call.recentlyLeft.delete(userKey);
                    const currentParticipants = Array.from(call.participants.entries())
                        .map(([socketId, p]) => ({ socketId, userId: p.userId, userType: p.userType, name: p.name }));
                    client.emit('call:rejoin-needed', {
                        callId: call.callId,
                        conversationId: call.conversationId,
                        callType: call.callType,
                        callerName: call.callerName,
                        currentParticipants,
                    });
                    break;
                }

                // Case 2: User was invited but hasn't joined yet — re-send incoming notification
                if (call.invitedParticipants.has(userKey)) {
                    const alreadyIn = Array.from(call.participants.values())
                        .some(p => p.userId === client.userId && p.userType === client.userType);
                    if (!alreadyIn) {
                        client.emit('call:incoming', {
                            callId: call.callId,
                            conversationId: call.conversationId,
                            callerId: call.hostId,
                            callerType: call.hostType,
                            callerName: call.callerName,
                            callType: call.callType,
                        });
                    }
                    break;
                }
            }

            return { success: true, userId: client.userId, status: 'online' };
        } catch (error) {
            console.error('Failed to set user online:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Check if a specific call is still active. Used by the frontend watchdog
     * after a socket reconnect to detect when the backend no longer has the call.
     */
    @SubscribeMessage('call:check-active')
    handleCheckActiveCall(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { callId: string },
    ) {
        const call = this.calls.get(data.callId);
        return { exists: !!call };
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
        this.emitToUsers(recipients.map(r => ({ userId: r.participantId as any, userType: r.participantType as any })), 'message:new', {
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
        recipients: { participantId: string; participantType: 'ADMIN' | 'USER' }[]
    ) {
        this.emitToUsers(recipients.map(r => ({ userId: r.participantId as any, userType: r.participantType as any })), 'message:edited', {
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
        recipients: { participantId: string; participantType: 'ADMIN' | 'USER' }[]
    ) {
        this.emitToUsers(recipients.map(r => ({ userId: r.participantId as any, userType: r.participantType as any })), 'message:deleted', {
            messageId,
            conversationId
        });
    }

    /**
     * Broadcasts member removal to remaining participants
     */
    public broadcastMemberRemoved(
        conversationId: string,
        removedParticipantId: string,
        removedParticipantType: 'ADMIN' | 'USER',
        recipients: { participantId: string; participantType: 'ADMIN' | 'USER' }[]
    ) {
        this.emitToUsers(
            recipients.map(r => ({ userId: r.participantId as any, userType: r.participantType as any })),
            'member:removed',
            { conversationId, removedParticipantId, removedParticipantType }
        );
    }

    /**
     * Broadcasts group name/avatar update to all participants
     */
    public broadcastGroupUpdated(
        conversationId: string,
        updates: { name?: string | null; avatar?: string | null },
        recipients: { participantId: string; participantType: 'ADMIN' | 'USER' }[]
    ) {
        this.emitToUsers(
            recipients.map(r => ({ userId: r.participantId as any, userType: r.participantType as any })),
            'group:updated',
            { conversationId, ...updates }
        );
    }

    /**
     * Broadcasts a member role change (admin ↔ member) to all participants
     */
    public broadcastMemberRoleUpdated(
        conversationId: string,
        participantId: string,
        participantType: 'ADMIN' | 'USER',
        newRole: 'admin' | 'member',
        recipients: { participantId: string; participantType: 'ADMIN' | 'USER' }[]
    ) {
        this.emitToUsers(
            recipients.map(r => ({ userId: r.participantId as any, userType: r.participantType as any })),
            'member:role',
            { conversationId, participantId, participantType, role: newRole }
        );
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

    /**
     * Broadcasts a new conversation to all participants
     * This allows conversations to appear in real-time for all participants
     */
    public broadcastNewConversation(
        conversation: any,
        recipients: { participantId: string; participantType: 'ADMIN' | 'USER' }[]
    ) {
        this.emitToUsers(
            recipients.map(r => ({ userId: r.participantId, userType: r.participantType })),
            'conversation:new',
            { conversation }
        );
    }

    private emitToUser(userId: string, userType: 'ADMIN' | 'USER', event: string, data: any) {
        const socketId = this.cache.getUserSocketId(userId);
        if (socketId) {
            this.server.to(socketId).emit(event, data);
        }
    }

    private emitToUsers(users: { userId: string; userType: 'ADMIN' | 'USER' }[], event: string, data: any) {
        users.forEach(u => this.emitToUser(u.userId, u.userType, event, data));
    }

    // ====================
    // CALL SIGNALING
    // ====================

    /**
     * Caller initiates a call in a conversation.
     * Creates DB record, stores in memory, notifies all other participants.
     * Fires push notification for offline participants.
     */
    @SubscribeMessage('call:initiate')
    async handleCallInitiate(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { conversationId: string; callType: 'audio' | 'video'; callerName: string },
    ) {
        try {
            const { conversationId, callType, callerName } = data;
            const callerId = client.userId!;
            const callerType = client.userType!;

            // Create DB record
            const callId = await this.callService.createCallRecord(
                Number(conversationId),
                callerId,
                callerType,
                callType,
            );

            // Store in memory
            const call: ActiveCall = {
                callId,
                conversationId,
                callType,
                hostId: callerId,
                hostType: callerType,
                hostSocketId: client.id,
                callerName,
                callMessageId: null,
                createdAt: new Date(),
                participants: new Map(),
                invitedParticipants: new Set([`${callerId}:${callerType}`]), // host can also rejoin
                recentlyLeft: new Set(),
            };
            this.calls.set(callId, call);

            // Create the initial "Calling..." message immediately
            try {
                const msgId = await this.callService.createInitialCallMessage(
                    Number(conversationId),
                    callerId,
                    callerType,
                    callId,
                    callType,
                );
                call.callMessageId = msgId;
                // Broadcast the initial message to all conversation participants
                const initialMsg = {
                    id: msgId,
                    conversationId: Number(conversationId),
                    senderId: callerId,
                    senderType: callerType,
                    type: 'call',
                    content: '📞 Calling...',
                    callData: { callId, callType, status: 'ringing', duration: null, startedAt: null, endedAt: null },
                    timestamp: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                };
                this.broadcastCallMessageToConversation(conversationId, initialMsg);
            } catch (e) {
                console.error('Failed to create initial call message:', e);
            }

            // Get conversation participants to notify
            const conversation = await this.chatService.getConversation(
                conversationId,
                callerId,
                callerType,
            );

            if (conversation?.participants) {
                const others = conversation.participants.filter(
                    p => !(p.participantId === callerId && p.participantType === callerType)
                );

                for (const p of others) {
                    // Track everyone who should be able to join (for reconnect re-notification)
                    call.invitedParticipants.add(`${p.participantId}:${p.participantType}`);

                    const isOnline = this.cache.isUserOnline(p.participantId);
                    const payload = {
                        callId,
                        conversationId,
                        callerId,
                        callerType,
                        callerName,
                        callType,
                    };

                    if (isOnline) {
                        // Socket notification for online users
                        this.emitToUser(p.participantId, p.participantType as 'ADMIN' | 'USER', 'call:incoming', payload);
                    } else {
                        // Push notification for offline users
                        try {
                            await this.pushService.sendToUser(
                                p.participantId,
                                p.participantType as any,
                                {
                                    title: `📞 ${callerName} is calling...`,
                                    body: callType === 'video' ? 'Incoming video call' : 'Incoming voice call',
                                    data: {
                                        type: 'incoming_call',
                                        callId,
                                        conversationId,
                                        callerName,
                                        callType,
                                        url: `/admin/dashboard/chat/${conversationId}?call=${callId}`,
                                    },
                                    requireInteraction: true,
                                    tag: `call-${callId}`,
                                    actions: [
                                        { action: 'decline', title: '❌ Decline' },
                                        { action: 'accept', title: '✅ Accept' },
                                    ],
                                },
                            );
                        } catch (pushErr) {
                            console.error('Push notification failed:', pushErr);
                        }
                    }
                }
            }

            // Confirm to caller
            client.emit('call:initiated', { callId, conversationId, callType });
            return { success: true, callId };
        } catch (error) {
            console.error('call:initiate error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * A participant answers the call.
     * Adds them to the participants map, sends them the existing participant list,
     * and notifies everyone else.
     */
    @SubscribeMessage('call:answer')
    async handleCallAnswer(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { callId: string },
    ) {
        try {
            const { callId } = data;
            const call = this.calls.get(callId);
            if (!call) return { success: false, error: 'Call not found' };

            const userId = client.userId!;
            const userType = client.userType!;

            // Resolve the answerer's display name from DB
            let answererName = 'Unknown';
            try {
                if (userType === 'ADMIN') {
                    const admin = await this.chatService['prisma'].admin.findUnique({ where: { id: userId }, select: { adminName: true } });
                    answererName = admin?.adminName || 'Admin';
                } else {
                    const user = await this.chatService['prisma'].user.findUnique({ where: { id: userId }, select: { name: true } });
                    answererName = user?.name || 'User';
                }
            } catch { /* keep default */ }

            // Build list of existing participants with names (before adding this one)
            const existingParticipants = Array.from(call.participants.entries())
                .filter(([socketId]) => socketId !== client.id)
                .map(([socketId, p]) => ({
                    socketId,
                    userId: p.userId,
                    userType: p.userType,
                    name: p.name,
                }));

            // Add this participant with their name
            call.participants.set(client.id, { userId, userType, name: answererName });

            // Update DB to active on first answer
            if (call.participants.size === 1) {
                await this.callService.updateCallStatus(callId, 'active', new Date());
            }

            // Tell the answerer who is already in the call
            client.emit('call:joined', {
                callId,
                conversationId: call.conversationId,
                callType: call.callType,
                callerName: call.callerName,
                existingParticipants,
            });

            // Tell everyone else a new participant joined (include name)
            call.participants.forEach((p, socketId) => {
                if (socketId !== client.id) {
                    this.server.to(socketId).emit('call:participant-joined', {
                        callId,
                        participantSocketId: client.id,
                        userId,
                        userType,
                        name: answererName,
                    });
                }
            });

            // Also notify the host socket if they haven't joined yet
            if (!call.participants.has(call.hostSocketId)) {
                this.server.to(call.hostSocketId).emit('call:participant-joined', {
                    callId,
                    participantSocketId: client.id,
                    userId,
                    userType,
                    name: answererName,
                });
            }

            return { success: true };
        } catch (error) {
            console.error('call:answer error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * A participant declines the call.
     * Posts a "declined" call message into the conversation.
     */
    @SubscribeMessage('call:decline')
    async handleCallDecline(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { callId: string },
    ) {
        try {
            const { callId } = data;
            const call = this.calls.get(callId);
            if (!call) return { success: false };

            await this.callService.updateCallStatus(callId, 'declined');

            // Update the call message in-place
            try {
                if (call.callMessageId) {
                    const updatedMsg = await this.callService.updateCallMessage(
                        call.callMessageId,
                        { callId, callType: call.callType, status: 'declined' },
                    );
                    // Broadcast as message:edited so the bubble updates in-place
                    this.broadcastCallMessageUpdate(call.conversationId, updatedMsg);
                }
            } catch (e) {
                console.error('Failed to update declined call message:', e);
            }

            // Notify the host
            this.server.to(call.hostSocketId).emit('call:declined', {
                callId,
                userId: client.userId,
                userType: client.userType,
            });

            // Clean up
            this.calls.delete(callId);

            return { success: true };
        } catch (error) {
            console.error('call:decline error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * A participant ends / leaves the call.
     */
    @SubscribeMessage('call:end')
    async handleCallEnd(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { callId: string },
    ) {
        this.handleCallLeave(client.id, data.callId);
        return { success: true };
    }

    /**
     * Relay WebRTC offer SDP to target peer.
     */
    @SubscribeMessage('call:offer')
    handleCallOffer(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { targetSocketId: string; offer: RTCSessionDescriptionInit; callId: string },
    ) {
        if (!client.userId || !client.userType) return { success: false };
        this.server.to(data.targetSocketId).emit('call:offer', {
            callId: data.callId,
            offer: data.offer,
            callerSocketId: client.id,
            callerId: client.userId,
            callerType: client.userType,
        });
    }

    /**
     * Relay WebRTC answer SDP to target peer.
     */
    @SubscribeMessage('call:answer-sdp')
    handleCallAnswerSdp(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { targetSocketId: string; answer: RTCSessionDescriptionInit; callId: string },
    ) {
        if (!client.userId || !client.userType) return { success: false };
        this.server.to(data.targetSocketId).emit('call:answer-sdp', {
            callId: data.callId,
            answer: data.answer,
            answererSocketId: client.id,
        });
    }

    /**
     * Relay ICE candidate to target peer.
     */
    @SubscribeMessage('call:ice-candidate')
    handleIceCandidate(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { targetSocketId: string; candidate: RTCIceCandidateInit; callId: string },
    ) {
        if (!client.userId || !client.userType) return { success: false };
        // Only relay to peers that are in the same call
        const call = this.calls.get(data.callId);
        if (!call) return { success: false };
        if (!call.participants.has(data.targetSocketId) && call.hostSocketId !== data.targetSocketId) {
            return { success: false };
        }
        this.server.to(data.targetSocketId).emit('call:ice-candidate', {
            callId: data.callId,
            candidate: data.candidate,
            senderSocketId: client.id,
        });
    }

    /**
     * Invite a new person into an existing call (mid-call add participant).
     */
    @SubscribeMessage('call:invite')
    async handleCallInvite(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { callId: string; targetUserId: string; targetUserType: 'ADMIN' | 'USER' },
    ) {
        const call = this.calls.get(data.callId);
        if (!call) return { success: false };

        // Track this invite so the user gets re-notified if they reconnect
        call.invitedParticipants.add(`${data.targetUserId}:${data.targetUserType}`);

        const payload = {
            callId: data.callId,
            conversationId: call.conversationId,
            callerId: client.userId,
            callerType: client.userType,
            callerName: call.callerName,
            callType: call.callType,
        };

        const isOnline = this.cache.isUserOnline(data.targetUserId);
        if (isOnline) {
            this.emitToUser(data.targetUserId, data.targetUserType, 'call:incoming', payload);
        } else {
            try {
                await this.pushService.sendToUser(data.targetUserId, data.targetUserType as any, {
                    title: `📞 ${call.callerName} is calling...`,
                    body: 'Incoming voice call',
                    data: { type: 'incoming_call', ...payload, url: `/admin/dashboard/chat/${call.conversationId}?call=${data.callId}` },
                    requireInteraction: true,
                    tag: `call-${data.callId}`,
                    actions: [
                        { action: 'decline', title: '❌ Decline' },
                        { action: 'accept', title: '✅ Accept' },
                    ],
                });
            } catch (e) {
                console.error('Push invite failed:', e);
            }
        }

        return { success: true };
    }

    // ── Internal helper: remove a socket from a call ──────────────────────────
    private async handleCallLeave(socketId: string, callId: string, isDisconnect = false) {
        const call = this.calls.get(callId);
        if (!call) return;

        // Track disconnected users so we can offer rejoin when they reconnect
        if (isDisconnect) {
            const participant = call.participants.get(socketId);
            if (participant) {
                call.recentlyLeft.add(`${participant.userId}:${participant.userType}`);
            } else if (socketId === call.hostSocketId) {
                call.recentlyLeft.add(`${call.hostId}:${call.hostType}`);
            }
        }

        call.participants.delete(socketId);

        // Notify remaining participants
        call.participants.forEach((_, sid) => {
            this.server.to(sid).emit('call:participant-left', { callId, participantSocketId: socketId });
        });

        // Also notify host if they're not in participants map
        if (socketId !== call.hostSocketId) {
            this.server.to(call.hostSocketId).emit('call:participant-left', { callId, participantSocketId: socketId });
        }

        // If no one left, end the call and post a call message
        if (call.participants.size === 0) {
            // Capture all socket IDs that should receive the call message
            // BEFORE deleting the call from the map
            const allSocketIds = new Set<string>([call.hostSocketId]);
            call.participants.forEach((_, sid) => allSocketIds.add(sid));

            this.calls.delete(callId);
            try {
                const endedAt = new Date();
                const callRecord = await this.callService.updateCallStatus(callId, 'ended', undefined, endedAt);

                // Determine status: if call was never active (no startedAt), it was missed
                const status = (callRecord as any).startedAt ? 'ended' : 'missed';

                if (call.callMessageId) {
                    // Update the existing "Calling..." message in-place
                    const updatedMsg = await this.callService.updateCallMessage(
                        call.callMessageId,
                        {
                            callId,
                            callType: call.callType,
                            status,
                            startedAt: (callRecord as any).startedAt ?? null,
                            endedAt,
                        },
                    );
                    this.broadcastCallMessageUpdate(call.conversationId, updatedMsg);
                }
            } catch (e) {
                console.error('Failed to finalize call:', e);
            }
        }
    }

    // ── Broadcast a call message to all online conversation participants ───────
    private broadcastCallMessageToConversation(conversationId: string, message: any) {
        const payload = {
            conversationId,
            message: { ...message, type: 'call' },
        };
        // Look up all active participants in the conversation and emit to each
        this.chatService.getConversation(conversationId, message.senderId, message.senderType as 'ADMIN' | 'USER')
            .then(conv => {
                if (!conv?.participants) return;
                conv.participants.forEach((p: any) => {
                    this.emitToUser(p.participantId, p.participantType as 'ADMIN' | 'USER', 'message:new', payload);
                });
            })
            .catch(err => console.error('broadcastCallMessage lookup failed:', err));
    }

    // ── Broadcast an in-place update to an existing call message ─────────────
    private broadcastCallMessageUpdate(conversationId: string, message: any) {
        const payload = {
            conversationId,
            messageId: message.id,
            // Pass the full updated message so the frontend can replace callData
            callData: message.callData,
            content: message.content,
        };
        this.chatService.getConversation(conversationId, message.senderId, message.senderType as 'ADMIN' | 'USER')
            .then(conv => {
                if (!conv?.participants) return;
                conv.participants.forEach((p: any) => {
                    this.emitToUser(p.participantId, p.participantType as 'ADMIN' | 'USER', 'call:message-updated', payload);
                });
            })
            .catch(err => console.error('broadcastCallMessageUpdate failed:', err));
    }

    // ====================
    // TYPING INDICATORS
    // ====================

    @SubscribeMessage('typing:start')
    async handleTypingStart(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { conversationId: string, userId: string; userType: 'ADMIN' | 'USER' },
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

                this.emitToUsers(recipients.map(r => ({ userId: r.participantId as any, userType: r.participantType as any })), 'typing:active', {
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
        @MessageBody() data: { conversationId: string, userId: string; userType: 'ADMIN' | 'USER' },
    ) {
        try {
            const conversation = await this.chatService.getConversation(
                data.conversationId,
                client.userId as string,
                client.userType as 'ADMIN' | 'USER',
            );

            if (conversation && conversation.participants) {
                const recipients = conversation.participants.filter(p =>
                    !(p.participantId === client.userId && p.participantType === client.userType)
                );

                this.emitToUsers(recipients.map(r => ({ userId: r.participantId as any, userType: r.participantType as any })), 'typing:inactive', {
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
            throw new Error('Invalid or expired token');
        }
    }
}
