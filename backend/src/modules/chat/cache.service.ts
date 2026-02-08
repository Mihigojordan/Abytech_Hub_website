import { Injectable, OnModuleInit } from '@nestjs/common';

interface CacheEntry<T> {
    data: T;
    expires: number;
}

@Injectable()
export class CacheService implements OnModuleInit {
    private conversationCache = new Map<string, CacheEntry<any>>();
    private onlineUsers = new Map<string, { userType: 'ADMIN' | 'USER'; socketId: string }>();
    private typingIndicators = new Map<string, number>();
    private cleanupInterval: NodeJS.Timeout;

    onModuleInit() {
        // Auto-cleanup expired cache every 10 seconds
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 10000);
    }

    onModuleDestroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
    }

    // Conversation caching
    setConversation(key: string, data: any, ttlSeconds: number = 1800) {
        this.conversationCache.set(key, {
            data,
            expires: Date.now() + ttlSeconds * 1000,
        });
    }

    getConversation(key: string): any | null {
        const entry = this.conversationCache.get(key);
        if (!entry) return null;

        if (entry.expires < Date.now()) {
            this.conversationCache.delete(key);
            return null;
        }

        return entry.data;
    }

    deleteConversation(key: string) {
        this.conversationCache.delete(key);
    }

    // Online users
    addOnlineUser(userId: string, userType: 'ADMIN' | 'USER', socketId: string) {
        this.onlineUsers.set(userId, { userType, socketId });
        console.log(`User online: ${userId} (${userType}) -> ${socketId}`);
    }

    removeOnlineUser(userId: string) {
        this.onlineUsers.delete(userId);
        console.log(`User offline: ${userId}`);
    }

    isUserOnline(userId: string): boolean {
        return this.onlineUsers.has(userId);
    }

    getOnlineUsers(): string[] {
        return Array.from(this.onlineUsers.keys());
    }

    getUserSocketId(userId: string): string | undefined {
        return this.onlineUsers.get(userId)?.socketId;
    }

    getSocketUser(socketId: string): { userId: string; userType: 'ADMIN' | 'USER' } | undefined {
        for (const [userId, data] of this.onlineUsers.entries()) {
            if (data.socketId === socketId) {
                return { userId, userType: data.userType };
            }
        }
        return undefined;
    }

    getAllUserSockets(): Map<string, string> {
        const map = new Map<string, string>();
        for (const [userId, data] of this.onlineUsers.entries()) {
            map.set(userId, data.socketId);
        }
        return map;
    }

    /**
     * Get all online users who share conversations with the specified user
     * @param userId - The user ID to check against
     * @param userType - The user type (ADMIN or USER)
     * @param conversationParticipants - Array of participants from user's conversations
     * @returns Array of online participants with their details
     */
    getOnlineConversationParticipants(
        userId: string,
        userType: 'ADMIN' | 'USER',
        conversationParticipants: Array<{ participantId: string; participantType: 'ADMIN' | 'USER' }>
    ): Array<{ userId: string; userType: 'ADMIN' | 'USER'; socketId: string }> {
        const onlineParticipants: Array<{ userId: string; userType: 'ADMIN' | 'USER'; socketId: string }> = [];

        for (const participant of conversationParticipants) {
            // Skip self
            if (participant.participantId === userId && participant.participantType === userType) {
                continue;
            }

            // Check if participant is online
            const userInfo = this.onlineUsers.get(participant.participantId);
            if (userInfo && userInfo.userType === participant.participantType) {
                onlineParticipants.push({
                    userId: participant.participantId,
                    userType: participant.participantType,
                    socketId: userInfo.socketId
                });
            }
        }

        return onlineParticipants;
    }

    // Typing indicators
    setTyping(conversationId: string, userId: string) {
        const key = `${conversationId}:${userId}`;
        this.typingIndicators.set(key, Date.now());
    }

    isTyping(conversationId: string, userId: string): boolean {
        const key = `${conversationId}:${userId}`;
        const timestamp = this.typingIndicators.get(key);

        if (!timestamp) return false;

        // Consider typing if within last 5 seconds
        if (Date.now() - timestamp > 5000) {
            this.typingIndicators.delete(key);
            return false;
        }

        return true;
    }

    getTypingUsers(conversationId: string): string[] {
        const users: string[] = [];
        const now = Date.now();

        for (const [key, timestamp] of this.typingIndicators.entries()) {
            if (key.startsWith(`${conversationId}:`)) {
                if (now - timestamp <= 5000) {
                    const userId = key.split(':')[1];
                    users.push(userId);
                } else {
                    this.typingIndicators.delete(key);
                }
            }
        }

        return users;
    }

    // Cleanup expired entries
    private cleanup() {
        const now = Date.now();

        // Clean conversations
        for (const [key, entry] of this.conversationCache.entries()) {
            if (entry.expires < now) {
                this.conversationCache.delete(key);
            }
        }

        // Clean typing indicators
        for (const [key, timestamp] of this.typingIndicators.entries()) {
            if (now - timestamp > 5000) {
                this.typingIndicators.delete(key);
            }
        }
    }
}
